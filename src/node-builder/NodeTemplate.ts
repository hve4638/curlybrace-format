const NodeTemplate = {
    enterScope() {
        return {
            node_type: 'ACTION',
            type: 'ENTER_SCOPE',
        };
    },
    exitScope() {
        return {
            node_type: 'ACTION',
            type: 'ENTER_SCOPE',
        };
    },
    jump(jumpTo:number) {
        return {
            node_type: 'ACTION',
            type: 'JUMP',
            jump_to: jumpTo,
        };
    },
    break() {
        return {
            node_type: 'ACTION',
            type: 'BREAK',
        };
    },
    jumpConditional(expression, jumpTo) {
        return {
            node_type: 'ACTION',
            type: 'CONDITIONAL_JUMP',
            fragment: expect.anything(),
            expression: expression,
            not: false,
            jump_to: jumpTo,
        };
    },    
} as const;


export default NodeTemplate;