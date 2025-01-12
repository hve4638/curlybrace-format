import Evaluator from '../Evaluator';
import {
    ExpressionType, 
    LiteralExpression, 
    ObjectExpression,
    ParamExpression,
} from '../../expr-parse/types/expressions';
import type { ExpressionArgs, ExpressionEventHooks } from '../types/expr-hooks';
import { tokenize, transformToken, parseAST } from '../../expr-parse';
import {
    evaluate,
    evaluateAndIterate,
    evaluateAndStringify,
} from './utils'

const EMPTY_ARGS = {
    vars : {},
    expressionEventHooks : {},
    builtInVars:{},
    scope : {}
} as ExpressionArgs;

describe('Hook test', () => {
    const hooks:Partial<ExpressionEventHooks> =  {
        indexor(array, index) {
            if (Array.isArray(array)) {
                return array[index];
            }
            else {
                throw new Error(`${array} is not an array`);
            }
        },
        access(obj, index) {
            if (obj == null) {
                throw new Error('obj is null');
            }
            else if (typeof(obj) !== 'object') {
                throw new Error(`${obj} is not an object`);
            }
            else {
                return obj[index];
            }
        },
        call(caller, args:unknown[]) {
            if (typeof(caller) === 'function') {
                return caller.apply({}, args);
            }
            else {
                throw new Error('caller is not a function');
            }
        },
        objectify(value) {
            return value;
        },
    }

    test('indexor', ()=>{
        const actual = evaluate('array[1]', {
            ...EMPTY_ARGS,
            vars : {
                'array' : [0, 1, 2, 3]
            },
            expressionEventHooks : {
                indexor(array, index) {
                    if (Array.isArray(array)) {
                        return array[index];
                    }
                    else {
                        return undefined;
                    }
                },
                objectify(value) {
                    return value;
                }
            }
        });

        expect(actual).toEqual(1);
    });
    test('function', ()=>{
        const actual = evaluate('print()', {
            ...EMPTY_ARGS,
            vars : {
                'print' : ()=>{
                    return 'hello world';
                }
            },
            expressionEventHooks : hooks
        });

        expect(actual).toEqual('hello world');
    });
    test('function with args', ()=>{
        const actual = evaluate('sum(1, 2+3, 4*5)', {
            ...EMPTY_ARGS,
            vars : {
                sum(a:any, b:any, c:any) {
                    return a + b + c;
                }
            },
            expressionEventHooks : hooks
        });

        expect(actual).toEqual(1 + 2 + 3 + 4*5);
    });
    test('access', ()=>{
        const actual = evaluate('data.size', {
            ...EMPTY_ARGS,
            vars : {
                'data' : {
                    'size' : 10,
                }
            },
            expressionEventHooks : hooks
        });
        expect(actual).toEqual(10);
    })
    test('identifier in indexor', ()=>{
        const actual = evaluate('data[value]', {
            ...EMPTY_ARGS,
            vars : {
                'data' : [0, 1, 2, 3, 4],
                'value' : 3
            },
            expressionEventHooks : hooks
        });
        expect(actual).toEqual(3);
    })
    test('chain 1', ()=>{
        const actual = evaluate('data.get()', {
            ...EMPTY_ARGS,
            vars : {
                'data' : {
                    'get' : ()=>2
                }
            },
            expressionEventHooks : hooks
        });
        expect(actual).toEqual(2);
    })
    
    test('chain 2', ()=>{
        const actual = evaluate('data.get()[1][2]', {
            ...EMPTY_ARGS,
            vars : {
                'data' : {
                    'get' : ()=> {
                        return [
                            [0, 1, 2],
                            [3, 4, 5],
                            [6, 7, 8],
                        ]
                    }
                }
            },
            expressionEventHooks : hooks
        });
        expect(actual).toEqual(5);
    })
});
