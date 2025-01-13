import { EvaluatableExpression } from "../expr-parse";
import { CBFNode, NodeType, ActionType } from "../types/node";

export const ActionTemplate = {
    enterScope():CBFNode {
        return {
            node_type: NodeType.ACTION,
            type: ActionType.ENTER_SCOPE,
        };
    },
    exitScope() {
        return {
            node_type: NodeType.ACTION,
            type: ActionType.EXIT_SCOPE,
        };
    },
    jump(jumpTo:number) {
        return {
            node_type: NodeType.ACTION,
            type: ActionType.JUMP,
            jump_to: jumpTo,
        };
    },
    break() {
        return {
            node_type: NodeType.ACTION,
            type: ActionType.BREAK,
        };
    },
    jumpConditional(expression, jumpTo) {
        return {
            node_type: NodeType.ACTION,
            type: ActionType.CONDITIONAL_JUMP,
            fragment: expect.anything(),
            expression: expression,
            not: false,
            jump_to: jumpTo,
        };
    },
    iterateInit(expr:EvaluatableExpression, iterator_variable:string) {
        return {
            node_type: NodeType.ACTION,
            type: ActionType.ITERATE_INIT,
            fragment: expect.anything(),
            expression: expr,
            iterator_variable: iterator_variable,
        };
    },
    iterateNext(iterate_variable:string, result_variable:string) {
        return {
            node_type: NodeType.ACTION,
            type: ActionType.ITERATE_NEXT,
            iterator_variable : iterate_variable,
            result_variable : result_variable,
        };
    },
    jumpIfIterateDone(iterator_variable:string, jumpTo:number) {
        return {
            node_type: NodeType.ACTION,
            type: ActionType.JUMP_IF_ITERATE_DONE,
            iterator_variable: iterator_variable,
            jump_to: jumpTo,
        };
    }
} as const;
