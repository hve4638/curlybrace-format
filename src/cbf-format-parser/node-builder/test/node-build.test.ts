import NodeBuilder from '../';
import { EvaluatableExpression, LiteralExpression } from '../../../expr-parse';
import TemplateSplitter from '../../template-splitter';
import { DirectiveKeywords, FragmentType } from '../../types/fragment';
import { ActionType, Node, NodeType } from '../../types/node';

describe('NodeBuilder', () => {
    const splitter = new TemplateSplitter();
    const builder = new NodeBuilder();
    function build(text:string) {
        const fragments = splitter.spliteTemplate(text);
        return builder.build(fragments);
    }

    function iterateInitAction(expr:EvaluatableExpression, iterator_variable:string):Node {
        return {
            node_type : NodeType.ACTION,
            type : ActionType.ITERATE_INIT,
            fragment : expect.anything(),
            expression : expr,
            iterator_variable : iterator_variable,
        }
    }
    function iterateNextAction(iterator_variable:string, result_variable:string):Node {
        return {
            node_type : NodeType.ACTION,
            type : ActionType.ITERATE_NEXT,
            iterator_variable : iterator_variable,
            result_variable : result_variable,
        }
    }
    function enterScopeAction():Node {
        return {
            node_type : NodeType.ACTION,
            type : ActionType.ENTER_SCOPE,
        }
    }
    function exitScopeAction():Node {
        return {
            node_type : NodeType.ACTION,
            type : ActionType.ENTER_SCOPE,
        }
    }
    function breakAction():Node {
        return {
            node_type : NodeType.ACTION,
            type : ActionType.BREAK,
        }
    }
    function textNode(text:string):Node {
        return {
            node_type : NodeType.SINGLE,
            type : FragmentType.TEXT,
            fragment : expect.anything(),
            text : text,
        }
    }
    function jumpConditionalNode(expression:EvaluatableExpression, jumpTo:number):Node {
        return {
            node_type : NodeType.ACTION,
            type : ActionType.CONDITIONAL_JUMP,
            fragment : expect.anything(),
            expression : expression,
            not : false,
            jump_to : jumpTo,
        }
    }
    function roleNode(field:string):Node {
        return {
            node_type : NodeType.SINGLE,
            type : FragmentType.DIRECTIVE,
            fragment : expect.anything(),
            keyword : DirectiveKeywords.ROLE,
            field : field,
        }
    }
    function sequenceNode(nodes:Node[]):Node {
        return {
            node_type : NodeType.SEQUENCE,
            nodes : nodes,
        }
    }
    function literalExpr(value:any):LiteralExpression {
        return {
            type : 'LITERAL',
            position : expect.anything(),
            size : expect.anything(),
            value : value,
        }
    }

    test('role', () => {
        const actual = build('text1 {{::ROLE user}} text2 {{::role bot}} text3');
        const expected:Node[] = [
            textNode('text1'),
            roleNode('user'),
            textNode('text2'),
            roleNode('bot'),
            textNode('text3'),
        ]

        expect(actual).toEqual(expected);
    });

    test('if sequence', () => {
        const actual = build(`
            enter
            {{::IF 1}}
            if
            {{::ENDIF}}
            exit
            `);
        const expected:Node[] = [
            textNode('enter'),
            sequenceNode([
                jumpConditionalNode(literalExpr(1), 2),
                breakAction(),
                sequenceNode([
                    textNode('if'),
                ]),
                breakAction(),
            ]),
            textNode('exit'),
        ]

        expect(actual).toEqual(expected);
    });

    

    test('if-elif-elif-else sequence', () => {
        const actual = build(`
            enter
            {{::IF 1}}
            if
            {{::ELIF 2}}
            elif-1
            {{::ELIF 3}}
            elif-2
            {{::ELSE}}
            else
            {{::ENDIF}}
            exit
            `);
        const expected:Node[] = [
            textNode('enter'),
            sequenceNode([
                jumpConditionalNode(literalExpr(1), 5),
                jumpConditionalNode(literalExpr(2), 7),
                jumpConditionalNode(literalExpr(3), 9),
                sequenceNode([ textNode('else'), ]),
                breakAction(),
                sequenceNode([ textNode('if'), ]),
                breakAction(),
                sequenceNode([ textNode('elif-1'), ]),
                breakAction(),
                sequenceNode([ textNode('elif-2'), ]),
                breakAction(),
            ]),
            textNode('exit'),
        ]

        expect(actual).toEqual(expected);
    });

    test('nested if sequence', () => {
        const actual = build(`
            enter
            {{::IF 1}}
                {{::IF 2}}
                    text-1
                {{::ENDIF}}
            {{::ELSE}}
                {{::IF 3}}
                    text-2
                {{::ELSE}}
                    text-3
                {{::ENDIF}}
            {{::ENDIF}}
            exit
        `);
        const expected:Node[] = [
            textNode('enter'),
            sequenceNode([
                jumpConditionalNode(literalExpr(1), 3),
                sequenceNode([
                    sequenceNode([
                        jumpConditionalNode(literalExpr(3), 3),
                        sequenceNode([ textNode('text-3'), ]),
                        breakAction(),
                        sequenceNode([ textNode('text-2'), ]),
                        breakAction(),
                    ]),
                ]),
                breakAction(),
                sequenceNode([
                    sequenceNode([
                        jumpConditionalNode(literalExpr(2), 2),
                        breakAction(),
                        sequenceNode([ textNode('text-1'), ]),
                        breakAction(),
                    ]),
                ]),
                breakAction(),
            ]),
            textNode('exit'),
        ]

        expect(actual).toEqual(expected);
    });

    
    test('foreach sequence', () => {
        const actual = build(`
            enter
            {{::FOREACH i in list}}
                item {{i}}
            {{::ENDFOREACH}}
            exit
        `);
        const expected = [
            textNode('enter'),
            sequenceNode([
                enterScopeAction(),
                
                jumpConditionalNode(literalExpr('--foreach-list-done'), 3),
                exitScopeAction(),
            ]),
            textNode('exit'),
        ]
    });
});