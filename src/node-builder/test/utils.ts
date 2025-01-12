import NodeBuilder from '..';
import { EvaluatableExpression, IdentifierExpression, LiteralExpression } from '../../expr-parse';
import { AnyExpression } from '../../expr-parse/types/expressions';
import TemplateSplitter from '../../template-splitter';
import { DirectiveKeywords, FragmentType } from '../../types/fragment';
import { ActionType, CBFNode, NodeType } from '../../types/node';

export const Nodes = {
    iterateInit(expr:EvaluatableExpression, iterator_variable:string):CBFNode {
        return {
            node_type : NodeType.ACTION,
            type : ActionType.ITERATE_INIT,
            fragment : expect.anything(),
            expression : expr,
            iterator_variable : iterator_variable,
        }
    },
    iterateNext(iterator_variable:string, result_variable:string):CBFNode {
        return {
            node_type : NodeType.ACTION,
            type : ActionType.ITERATE_NEXT,
            iterator_variable : iterator_variable,
            result_variable : result_variable,
        }
    },
    enterScope():CBFNode {
        return {
            node_type : NodeType.ACTION,
            type : ActionType.ENTER_SCOPE,
        }
    },
    exitScope():CBFNode {
        return {
            node_type : NodeType.ACTION,
            type : ActionType.EXIT_SCOPE,
        }
    },
    break():CBFNode {
        return {
            node_type : NodeType.ACTION,
            type : ActionType.BREAK,
        }
    },
    jump(jumpTo:number):CBFNode {
        return {
            node_type : NodeType.ACTION,
            type : ActionType.JUMP,
            jump_to : jumpTo,
        }
    },
    jumpConditional(expression:EvaluatableExpression, jumpTo:number):CBFNode {
        return {
            node_type : NodeType.ACTION,
            type : ActionType.CONDITIONAL_JUMP,
            fragment : expect.anything(),
            expression : expression,
            not : false,
            jump_to : jumpTo,
        }
    },
    jumpIfIterateDone(iterator_variable:string, jumpTo:number):CBFNode {
        return {
            node_type : NodeType.ACTION,
            type : ActionType.JUMP_IF_ITERATE_DONE,
            iterator_variable : iterator_variable,
            jump_to : jumpTo,
        }
    },
    text(text:string):CBFNode {
        return {
            node_type : NodeType.SINGLE,
            type : FragmentType.TEXT,
            fragment : expect.anything(),
            text : text,
        }
    },
    exprIdentifier(text:string):CBFNode {
        return {
            node_type : NodeType.SINGLE,
            type : FragmentType.EXPRESSION,
            fragment : expect.anything(),
            expression : {
                type : 'IDENTIFIER',
                position : expect.anything(),
                size : expect.anything(),
                value : text,
            }
        }
    },
    role(field:string):CBFNode {
        return {
            node_type : NodeType.SINGLE,
            type : FragmentType.DIRECTIVE,
            fragment : expect.anything(),
            keyword : DirectiveKeywords.ROLE,
            field : field,
        }
    },
    sequence(nodes:CBFNode[]):CBFNode {
        return {
            node_type : NodeType.SEQUENCE,
            nodes : nodes,
        }
    },
}

export const Exprs = {
    literal(value:any):LiteralExpression {
        return {
            type : 'LITERAL',
            position : expect.anything(),
            size : expect.anything(),
            value : value,
        }
    },
    identifier(value:string):IdentifierExpression {
        return {
            type : 'IDENTIFIER',
            position : expect.anything(),
            size : expect.anything(),
            value : value,
        }
    }
}