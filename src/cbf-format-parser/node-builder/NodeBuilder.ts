// import { Fragment, FragmentType } from "../template-splitter";
import { Node, Action, ActionType, SequenceNode, NodeType, SingleNode, } from "../types/node";
import { DirectiveFragment, DirectiveKeywords, ExpressionFragment, Fragment, FragmentType, TextFragment } from "../types/fragment";
import { tokenize, transformToken, parseAST, makeExpression } from "../../expr-parse";
import { BuildError } from "./errors";
import { CBF_ERROR_TYPE } from "../../types";

type DirectiveHandler = {
    [key: string]: (fragment: DirectiveFragment) => Node | null;
}

class NodeBuilder {
    #nodes: Node[] = [];
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

    build(fragments: Fragment[]): Node[] {
        this.#nodes = [];
        this.#fragmentIter = new FragmentIterator(fragments);
        while (true) {
            const fragment = this.#fragmentIter.next();
            if (!fragment) break;

            const node = this.#parseFragment(fragment);
            if (node) {
                this.#nodes.push(node);
            }
        }

        return this.#nodes;
    }

    #parseFragment(fragment: Fragment, highPriorityHandler?: DirectiveHandler | undefined): Node | null {
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
                    CBF_ERROR_TYPE.UNKNOWN_DIRECTIVE,
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
                    CBF_ERROR_TYPE.INVALID_DIRECTIVE,
                    fragment
                );
            }
        }
        else {
            throw new BuildError(
                'Invalid fragment type',
                CBF_ERROR_TYPE.INVALID_FRAGMENT,
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
                    CBF_ERROR_TYPE.INVALID_DIRECTIVE,
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
                    CBF_ERROR_TYPE.DUPLICATE_ELSE_DIRECTIVE,
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
            const fragment = this.#fragmentIter.next();
            if (!fragment) {
                throw new BuildError(
                    'Unexpected end of file',
                    CBF_ERROR_TYPE.UNEXPECTED_EOF,
                    {/* no hint */ } as Fragment
                );
            }

            const node = this.#parseFragment(fragment, ifSequenceHandler);
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
                expression: makeExpression(condition.fragment.field),
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
        // @TODO : Implement
        throw new Error('Not implemented');
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
        const expr = makeExpression(fragment.expression_text);

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