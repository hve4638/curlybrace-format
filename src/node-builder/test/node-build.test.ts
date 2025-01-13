import NodeBuilder from '..';
import { EvaluatableExpression, LiteralExpression } from '../../expr-parse';
import TemplateSplitter from '../../template-splitter';
import { DirectiveKeywords, FragmentType } from '../../types/fragment';
import { ActionType, CBFNode, NodeType } from '../../types/node';
import { Nodes, Exprs } from './utils';

describe('NodeBuilder', () => {
    const splitter = new TemplateSplitter();
    const builder = new NodeBuilder();
    function build(text:string) {
        const fragments = splitter.spliteTemplate(text);
        return builder.build(fragments).nodes;
    }

    test('role', () => {
        const actual = build('text1 {{::ROLE user}} text2 {{::role bot}} text3');
        const expected:CBFNode[] = [
            Nodes.text('text1'),
            Nodes.role('user'),
            Nodes.text('text2'),
            Nodes.role('bot'),
            Nodes.text('text3'),
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
        const expected:CBFNode[] = [
            Nodes.text('enter'),
            Nodes.sequence([
                Nodes.jumpConditional(Exprs.literal(1), 2),
                Nodes.break(),
                Nodes.sequence([
                    Nodes.text('if'),
                ]),
                Nodes.break(),
            ]),
            Nodes.text('exit'),
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
        const expected:CBFNode[] = [
            Nodes.text('enter'),
            Nodes.sequence([
                Nodes.jumpConditional(Exprs.literal(1), 5),
                Nodes.jumpConditional(Exprs.literal(2), 7),
                Nodes.jumpConditional(Exprs.literal(3), 9),
                Nodes.sequence([ Nodes.text('else'), ]),
                Nodes.break(),
                Nodes.sequence([ Nodes.text('if'), ]),
                Nodes.break(),
                Nodes.sequence([ Nodes.text('elif-1'), ]),
                Nodes.break(),
                Nodes.sequence([ Nodes.text('elif-2'), ]),
                Nodes.break(),
            ]),
            Nodes.text('exit'),
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
        const expected:CBFNode[] = [
            Nodes.text('enter'),
            Nodes.sequence([
                Nodes.jumpConditional(Exprs.literal(1), 3),
                Nodes.sequence([
                    Nodes.sequence([
                        Nodes.jumpConditional(Exprs.literal(3), 3),
                        Nodes.sequence([ Nodes.text('text-3'), ]),
                        Nodes.break(),
                        Nodes.sequence([ Nodes.text('text-2'), ]),
                        Nodes.break(),
                    ]),
                ]),
                Nodes.break(),
                Nodes.sequence([
                    Nodes.sequence([
                        Nodes.jumpConditional(Exprs.literal(2), 2),
                        Nodes.break(),
                        Nodes.sequence([ Nodes.text('text-1'), ]),
                        Nodes.break(),
                    ]),
                ]),
                Nodes.break(),
            ]),
            Nodes.text('exit'),
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
            Nodes.text('enter'),
            Nodes.sequence([
                Nodes.enterScope(),
                Nodes.iterateInit(Exprs.identifier('list'), 'list'),
                Nodes.iterateNext('list', 'i'),
                Nodes.jumpIfIterateDone('list', 6),
                Nodes.sequence([
                    Nodes.text('item '),
                    Nodes.exprIdentifier('i'),
                ]),
                Nodes.jump(2),
                Nodes.exitScope(),
            ]),
            Nodes.text('exit'),
        ];

        expect(actual).toEqual(expected);
    });
});