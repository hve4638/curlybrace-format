import { CBFNode, Action, ActionType, SequenceNode, NodeType, SingleNode, } from '../types/node';
import { DirectiveFragment, DirectiveKeywords, ExpressionFragment, Fragment, FragmentType, TextFragment } from '../types/fragment';
import { makeExpression } from '../expr-parse';
import { BuildError } from './errors';
import { CBFErrorType } from '../types';
import { ActionTemplate } from './action-template';
import { CBFFail } from '../errors';

type DirectiveHandler = {
    [key: string]: (fragment: DirectiveFragment) => CBFNode | null;
}

class NodeBuilder {
    #nodes: CBFNode[] = [];
    #errors: CBFFail[] = [];
    #fragmentIter: FragmentIterator;
    #directiveHandler: DirectiveHandler;

    constructor() {
        this.#fragmentIter = new FragmentIterator([]);

        this.#directiveHandler = {
            [DirectiveKeywords.IF]: (fragment: DirectiveFragment) => (
                this.#parseIfSequence(fragment)
            ),
            [DirectiveKeywords.ROLE]: (fragment: DirectiveFragment) => (
                this.#makeDirectiveNode(fragment)
            ),
            [DirectiveKeywords.SPLIT]: (fragment: DirectiveFragment) => (
                this.#makeDirectiveNode(fragment)
            ),
            [DirectiveKeywords.FOREACH]: (fragment: DirectiveFragment) => (
                this.#parseForeachSequence(fragment)
            ),
        };
    }

    build(fragments: Fragment[]): {nodes: CBFNode[], errors: CBFFail[]} {
        this.#nodes = [];
        this.#errors = [];
        this.#fragmentIter = new FragmentIterator(fragments);
        while (true) {
            const fragment = this.#fragmentIter.next();
            if (!fragment) break;

            try {
                const node = this.#parseFragment(fragment);
                if (node) {
                    this.#nodes.push(node);
                }
            }
            catch (error) {
                if (error instanceof CBFFail) {
                    this.#errors.push(error);
                }
                else {
                    throw error;
                }
            }
        }

        return {
            nodes: this.#nodes,
            errors: this.#errors,
        };
    }

    #parseFragment(fragment: Fragment, highPriorityHandler?: DirectiveHandler | undefined): CBFNode | null {
        if (fragment.type === FragmentType.TEXT) {
            return this.#makeTextNode(fragment);
        }
        else if (fragment.type === FragmentType.EXPRESSION) {
            return this.#makeExprNode(fragment);
        }
        else if (fragment.type === FragmentType.DIRECTIVE) {
            const keyword = fragment.keyword.toUpperCase();
            if (!(keyword in DirectiveKeywords)) {
                throw new BuildError(
                    `Unknown directive '${fragment.keyword}'`,
                    CBFErrorType.UNKNOWN_DIRECTIVE,
                    fragment
                );
            }
            else if (highPriorityHandler && keyword in highPriorityHandler) {
                const parser = highPriorityHandler[keyword];
                return parser(fragment);
            }
            else if (keyword in this.#directiveHandler) {
                const parser = this.#directiveHandler[keyword];
                return parser(fragment);
            }
            else {
                throw new BuildError(
                    `Invalid directive '${fragment.keyword}'`,
                    CBFErrorType.INVALID_DIRECTIVE,
                    fragment
                );
            }
        }
        else {
            throw new BuildError(
                'Invalid fragment type',
                CBFErrorType.INVALID_FRAGMENT,
                fragment
            );
        }
    }

    #parseIfSequence(fragment: DirectiveFragment): SequenceNode {
        type Condition = {
            fragment: DirectiveFragment,
            node: SequenceNode,
        };
        let lastCondition: Condition = {
            fragment: fragment,
            node: {
                node_type: NodeType.SEQUENCE,
                nodes: [],
            }
        };
        const conditions: Condition[] = [lastCondition];
        let elseCondition: Condition | undefined;

        let elseSignal = false;
        let exitSignal = false;
        const handleElseIf = (fragment: DirectiveFragment) => {
            if (elseSignal) {
                throw new BuildError(
                    `Unexpected '${fragment.keyword}' directive after 'else' directive`,
                    CBFErrorType.INVALID_DIRECTIVE,
                    fragment
                )
            }
            lastCondition = {
                fragment: fragment,
                node: {
                    node_type: NodeType.SEQUENCE,
                    nodes: [],
                }
            }
            conditions.push(lastCondition);
            return null;
        }
        const handleElse = (fragment: DirectiveFragment) => {
            if (elseSignal) {
                throw new BuildError(
                    'Duplicate else directive',
                    CBFErrorType.DUPLICATE_ELSE_DIRECTIVE,
                    fragment
                );
            }
            elseSignal = true;
            lastCondition = {
                fragment: fragment,
                node: {
                    node_type: NodeType.SEQUENCE,
                    nodes: [],
                }
            }
            elseCondition = lastCondition;
            return null;
        }
        const ifSequenceHandler: DirectiveHandler = {
            [DirectiveKeywords.ELSEIF]: handleElseIf,
            [DirectiveKeywords.ELIF]: handleElseIf,
            [DirectiveKeywords.ELSE]: handleElse,
            [DirectiveKeywords.ENDIF]: (fragment: DirectiveFragment) => {
                exitSignal = true;
                return null;
            },
        }
        while (!exitSignal) {
            const item = this.#fragmentIter.next();
            if (!item) {
                throw new BuildError(
                    `missing 'endif' directive`,
                    CBFErrorType.MISSING_ENDIF,
                    fragment
                );
            }

            const node = this.#parseFragment(item, ifSequenceHandler);
            if (node) {
                lastCondition.node.nodes.push(node);
            }
        }

        /**
         * IfSequnce의 구조 예시
         * 
         * 1. [JUMP_CONDITION] (if) : 5로 이동
         * 2. [JUMP_CONDITION] (elif) : 7로 이동
         * 3. [SEQUNCE_NODE] (else)
         * 4. [BREAK]
         * 5. [SEQUNCE_NODE] (if)
         * 6. [BREAK]
         * 7. [SEQUNCE_NODE] (elif 블럭)
         * 8. [BREAK]
         */
        const seq: SequenceNode = {
            node_type: NodeType.SEQUENCE,
            nodes: [],
        }

        const jumpSectionSize = conditions.length;
        const elseSectionSize = elseCondition ? 2 : 1;
        const totalSize = jumpSectionSize + elseSectionSize + conditions.length * 2;
        const conditionSectionPosition = jumpSectionSize + elseSectionSize;

        seq.nodes.length = totalSize;

        for (const index in conditions) {
            const condition = conditions[index];
            const jumpPosition = conditionSectionPosition + 2 * Number(index);
            const jumpAction = {
                node_type: NodeType.ACTION,
                type: ActionType.CONDITIONAL_JUMP,
                expression: makeExpression(
                    condition.fragment.field,
                    condition.fragment.position
                    + condition.fragment.field_left.length,
                ),
                fragment: condition.fragment,
                not: false,
                jump_to: jumpPosition,
            };

            seq.nodes[index] = jumpAction;
            seq.nodes[jumpPosition] = condition.node;
            seq.nodes[jumpPosition + 1] = this.#makeBreakAction();
        }
        
        const elseSectionPosition = jumpSectionSize;
        if (elseCondition) {
            seq.nodes[elseSectionPosition] = elseCondition.node;
            seq.nodes[elseSectionPosition + 1] = this.#makeBreakAction();
        }
        else {
            seq.nodes[elseSectionPosition] = this.#makeBreakAction();
        }

        return seq;
    }

    #parseForeachSequence(fragment: DirectiveFragment): SequenceNode {
        // Foreach Sequence 는 고정된 크기 및 구조를 가진다
        // 0. [ENTER_SCOPE]
        // 1. [ITERATE_INIT]
        // 2. [ITERATE_NEXT]
        // 3. [JUMP_IF_ITERATE_DONE] -> 6로 이동
        // 4. [SEQUNCE_NODE] (foreach 내부 블럭)
        // 5. [JUMP] -> 2로 이동
        // 6. [EXIT_SCOPE]

        const splitted = fragment.field.split('in');
        if (splitted.length !== 2) {
            throw new BuildError(
                `Invalid foreach directive field. Expected '<variable> in <iterator>'`,
                CBFErrorType.INVALID_DIRECTIVE,
                fragment
            );
        }
        const elementIdentifier = splitted[0].trim();
        const iteratorIdentifier = splitted[1].trim();

        const innerNode:SequenceNode = {
            node_type: NodeType.SEQUENCE,
            nodes: [],
        }

        let exitSignal = false;
        const foreachSequenceHandler: DirectiveHandler = {
            [DirectiveKeywords.ENDFOREACH]: (fragment: DirectiveFragment) => {
                exitSignal = true;
                return null;
            },
        }
        while(!exitSignal) {
            const item = this.#fragmentIter.next();
            if (!item) {
                throw new BuildError(
                    `missing 'endforeach' directive`,
                    CBFErrorType.MISSING_ENDFOREACH,
                    fragment
                );
            }

            const node = this.#parseFragment(item, foreachSequenceHandler);
            if (node) {
                innerNode.nodes.push(node);
            }
        }

        const iteratorExpr = makeExpression(iteratorIdentifier, fragment.position);
        const elementExpr = makeExpression(elementIdentifier, fragment.position);
        if (elementExpr.type !== 'IDENTIFIER') {
            throw new BuildError(
                `'${elementIdentifier}' is not a valid identifier`,
                CBFErrorType.INVALID_DIRECTIVE,
                fragment
            )
        }

        const seq:SequenceNode = {
            node_type: NodeType.SEQUENCE,
            nodes: [],
        }
        seq.nodes = [
            ActionTemplate.enterScope(),
            ActionTemplate.iterateInit(iteratorExpr, iteratorIdentifier),
            ActionTemplate.iterateNext(iteratorIdentifier, elementIdentifier),
            ActionTemplate.jumpIfIterateDone(iteratorIdentifier, 6),
            innerNode,
            ActionTemplate.jump(2),
            ActionTemplate.exitScope(),
        ]
        return seq;
    }

    #makeBreakAction(): Action {
        return {
            node_type: NodeType.ACTION,
            type: ActionType.BREAK,
        };
    }

    #makeTextNode(fragment: TextFragment): SingleNode {
        return {
            node_type: NodeType.SINGLE,
            fragment: fragment,
            type: FragmentType.TEXT,
            text: fragment.full_text,
        };
    }

    #makeExprNode(fragment: ExpressionFragment): SingleNode {
        const expr = makeExpression(
            fragment.expression_text,
            fragment.position
            + fragment.expression_text_left.length
        );

        return {
            node_type: NodeType.SINGLE,
            fragment: fragment,
            type: FragmentType.EXPRESSION,
            expression: expr,
        };
    }

    #makeDirectiveNode(fragment: DirectiveFragment): SingleNode {
        return {
            node_type: NodeType.SINGLE,
            fragment: fragment,
            type: FragmentType.DIRECTIVE,
            keyword: fragment.keyword,
            field: fragment.field,
        };
    }
}

/// @TODO : 바닐라 Iterator 형태로 변경하는 게 나을 듯
class FragmentIterator {
    #fragments: Fragment[] = [];
    #offset: number = -1;

    constructor(fragments: Fragment[]) {
        this.#fragments = fragments;
    }

    next(): Fragment | undefined {
        if (this.#offset + 1 < this.#fragments.length) {
            this.#offset += 1;
            return this.#fragments[this.#offset];
        }
        else {
            return undefined;
        }
    }
}

export default NodeBuilder;