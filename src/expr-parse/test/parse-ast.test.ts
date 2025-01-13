import {
    tokenize,
    transformToken,
    parseAST,
} from '../';
import { generateAST } from './utils';
import { Tokens } from '../Tokens';

describe('ExpressionParser Test', () => {
    test('add expr', ()=>{
        const actual = generateAST('1 + 2');
        const expected = callExpr(
            '+',
            [
                Tokens.literal(1, { position: 0, size: 1 }),
                Tokens.literal(2, { position: 4, size: 1 }),
            ],
            { position: 0, size: 5 }
        )
        expect(actual).toEqual(expected);
    });
    test('combine expr', ()=>{
        const actual = generateAST('1 + 2 * 3 - 4');
        const expected = callExpr('-',
            [
                callExpr('+',
                    [
                        Tokens.literal(1, { position: 0, size: 1 }),
                        callExpr('*',
                            [
                                Tokens.literal(2, { position: 4, size: 1 }),
                                Tokens.literal(3, { position: 8, size: 1 }),
                            ],
                            { position: 4, size: 5 }
                        ),
                    ],
                    { position: 0, size: 9 }
                ),
                Tokens.literal(4, { position: 12, size: 1 })
            ],
            { position: 0, size: 13 }
        )
        expect(actual).toEqual(expected);
    });
    test('function', ()=>{
        const actual = generateAST('function()');
        const expected = callExpr('()',
            [
                Tokens.identifier('function', { position: 0, size: 8 }),
                argsExpr([])
            ],
            { position: 0, size: 10 }
        )
        expect(actual).toEqual(expected);
    });
    test('function with param', ()=>{
        const actual = generateAST('function(1, 2 + 3)');
        const expected = callExpr('()',
            [
                Tokens.identifier('function', { position: 0, size: 8 }),
                argsExpr(
                    [
                        Tokens.literal(1, { position: 9, size: 1 }),
                        callExpr('+',
                        [
                            Tokens.literal(2, { position: 12, size: 1 }),
                            Tokens.literal(3, { position: 16, size: 1 }),
                        ],
                        { position: 12, size: 5 })
                    ]
                )
            ],
            { position: 0, size: 18 }
        );
        expect(actual).toEqual(expected);
    });
    test('indexor', ()=>{
        const actual = generateAST('array[1+2]');
        const expected = callExpr('[]',
            [
                Tokens.identifier('array', { position: 0, size: 5 }),
                callExpr('+',
                    [
                        Tokens.literal(1, { position: 6, size: 1 }),
                        Tokens.literal(2, { position: 8, size: 1 }),
                    ],
                    { position: 6, size: 3 }
                )
            ],
            { position: 0, size: 10 }
        )
        expect(actual).toEqual(expected);
    });
    test('access', ()=>{
        const actual = generateAST('object.key');
        const expected = callExpr('.',
            [
                Tokens.identifier('object', { position: 0, size: 6 }),
                Tokens.literal('key', { position: 7, size: 3 }),
            ],
            { position: 0, size: 10 }
        )
        expect(actual).toEqual(expected);
    });
    test('chain : access, call', ()=>{
        const actual = generateAST('data.get()');
        const expected = callExpr('()',
            [
                callExpr('.',
                    [
                        Tokens.identifier('data', { position: 0, size: 4 }),
                        Tokens.literal('get', { position: 5, size: 3 }),
                    ],
                    { position: 0, size: 8 }
                ),
                argsExpr([])
            ],
            { position: 0, size: 10 }
        )
        expect(actual).toEqual(expected);
    })
    test('chain : access, call, indexor', ()=>{
        const actual = generateAST('data.get()[1][2]');
        const expected = callExpr('[]',
            [
                callExpr('[]',
                    [
                        callExpr('()',
                            [
                                callExpr('.',
                                    [
                                        Tokens.identifier('data', { position: 0, size: 4 }),
                                        Tokens.literal('get', { position: 5, size: 3 }),
                                    ],
                                    { position: 0, size: 8 }
                                ),
                                argsExpr([])
                            ],
                            { position: 0, size: 10 }
                        ),
                        Tokens.literal(1, { position: 11, size: 1 }),
                    ],
                    { position: 0, size: 13 }
                ),
                Tokens.literal(2, { position: 14, size: 1 }),
            ],
            { position: 0, size: 16 }
        )
        expect(actual).toEqual(expected);
    });
    
});

const callExpr = (operator:string, operands:any, hint:{position:number, size:number}) => {
    return {
        type : 'CALL',
        value : operator,
        operands : operands,
        ...hint,
    }
}

const argsExpr = (args:any) => {
    return {
        type : 'PARAM',
        args : args,
    }
}