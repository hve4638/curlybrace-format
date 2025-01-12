import { ActionType, CBFNode, NodeType, SequenceNode } from './types/node';
import { ExpressionEventHooks, Vars } from './expr-eval/types/expr-hooks';
import { CBFResult, DirectiveKeywords, FragmentType } from './types';
import Evaluator from './expr-eval';

type CBFParserExecuteArgs = {
    vars:Vars;
    builtInVars:Vars;
    hook:Partial<ExpressionEventHooks>;
}

export function* execute(nodes:CBFNode[], executeArgs:CBFParserExecuteArgs):Generator<CBFResult> {   
    const offsetStack:number[] = [ 0 ];
    const nodeStack:CBFNode[][] = [ nodes ];
    const scopeStack:Vars[] = [ {} ];
    const scopeIterStack:Vars[] = [ {} ];

    const jumpOffset = (jumpTo:number) => {
        offsetStack[offsetStack.length-1] = jumpTo;
    }

    const pushNodeStack = (seqNode:SequenceNode) => {
        offsetStack.push(0);
        nodeStack.push(seqNode.nodes as CBFNode[]);
    }

    const popNodeStack = () => {
        offsetStack.pop();
        nodeStack.pop();
    }

    const pushScopeStack = () => {
        scopeStack.push({
            ...scopeStack.at(-1),
        });
        scopeIterStack.push({
            ...scopeIterStack.at(-1),
        });
    }

    const popScopeStack = () => {
        scopeStack.pop();
        scopeIterStack.pop();
    }

    const initIter = (key:string, iter:Iterator<any>) => {
        const iterKey = `--iter-${key}`;
        const iterKeyDone = `--iter-${key}-done`;
        
        setScopeVar(iterKey, iter);
        setScopeVar(iterKeyDone, false);
    }
    const nextIter = (key:string, element:string) => {
        const iterKey = `--iter-${key}`;
        const iterKeyDone = `--iter-${key}-done`;
        
        const iter = getScopeVar(iterKey);
        const result = iter.next();

        setScopeVar(element, result.value);
        setScopeVar(iterKeyDone, result.done);
    }
    const isIterDone = (key:string) => {
        const iterKey = `--iter-${key}`;
        const iterKeyDone = `--iter-${key}-done`;
        
        return getScopeVar(iterKeyDone);
    }
    const setScopeVar = (key:string, value:any) => {
        scopeStack[scopeStack.length-1][key] = value;
    }
    const getScopeVar = (key:string) => {
        return scopeStack[scopeStack.length-1][key];
    }

    const nextOffset = () => {
        if (offsetStack.length > 0) {
            offsetStack[offsetStack.length-1] += 1;
        }
    }

    const getEvaluator = () => {
        return new Evaluator({
            vars : executeArgs.vars,
            builtInVars : executeArgs.builtInVars,
            expressionEventHooks : executeArgs.hook,
            scope: scopeStack.at(-1) ?? {},
        });
    }

    // offset을 이동시키며 순차적으로 처리
    // * SequenceNode를 만나면 처리 스택에 추가. 새 스택에서 offset 0으로 시작
    // * continue 는 offset을 증가시키지 않기 위한 용도
    // * TEXT, ROLE, SPLIT 타입에 대해 yield
    while (nodeStack.length > 0) {
        const offset = offsetStack[offsetStack.length-1];
        const currentNodes = nodeStack[nodeStack.length-1];

        if (offset >= currentNodes.length) {
            popNodeStack();
            nextOffset();
            continue;
        }
        const node = currentNodes[offset];
        if (node.node_type === NodeType.ACTION) {
            if (node.type === ActionType.JUMP) {
                jumpOffset(node.jump_to);
                continue;
            }
            else if (node.type === ActionType.CONDITIONAL_JUMP) {
                const evaluator = getEvaluator();
                const result = evaluator.evaluate(node.expression);

                if (result) {
                    jumpOffset(node.jump_to);
                    continue;
                }
                // no continue
            }
            else if (node.type === ActionType.BREAK) {
                popNodeStack();
                // no continue
            }
            else if (node.type === ActionType.ENTER_SCOPE) {
                pushScopeStack();
                // no continue
            }
            else if (node.type === ActionType.EXIT_SCOPE) {
                popScopeStack();
                // no continue
            }
            else if (node.type === ActionType.ITERATE_INIT) {
                const evaluator = getEvaluator();
                const iter = evaluator.evaluateAndIterate(node.expression);
                initIter(node.iterator_variable, iter);
                // no continue
            }
            else if (node.type === ActionType.ITERATE_NEXT) {
                nextIter(node.iterator_variable, node.result_variable);
                // no continue
            }
            else if (node.type === ActionType.JUMP_IF_ITERATE_DONE) {
                const done = isIterDone(node.iterator_variable);

                if (done) {
                    jumpOffset(node.jump_to);
                    continue;
                }
                // no continue
            }
        }
        else if (node.node_type === NodeType.SEQUENCE) {
            pushNodeStack(node);
            continue;
        }
        else if (node.node_type === NodeType.SINGLE) {
            if (node.type === FragmentType.DIRECTIVE) {
                if (node.keyword === DirectiveKeywords.ROLE) {
                    yield {
                        type : 'ROLE',
                        role : node.field,
                    };
                }
                else if (node.keyword === DirectiveKeywords.SPLIT) {
                    yield {
                        type : 'SPLIT',
                    };
                }
                else {
                    throw new Error(`Unknown directive: ${node.field}`);
                }
            }
            else if (node.type === FragmentType.EXPRESSION) {
                const evaluator = getEvaluator();
                const text = evaluator.evaluateAndStringify(node.expression);
                yield {
                    type : 'TEXT',
                    text : text,
                }
            }
            else if (node.type === FragmentType.TEXT) {
                yield {
                    type : 'TEXT',
                    text : node.text,
                };
            }
        }

        nextOffset();
    }
}