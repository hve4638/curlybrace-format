import Evaluator from '../Evaluator';
import {
    ExpressionType, 
    LiteralExpression, 
    ObjectExpression,
    ParamExpression,
} from '../../expr-parse/types/expressions';
import type { ExpressionArgs } from '../types/expr-hooks';
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
    currentScope : {}
} as ExpressionArgs;

describe('Evaluate Test', () => {
    test('number literal', ()=>{
        const actual = evaluate('10', EMPTY_ARGS);
        
        expect(actual).toEqual(10);
    });
    test('string literal', ()=>{
        const actual = evaluate('"hello world"', EMPTY_ARGS);

        expect(actual).toEqual('hello world');
    });
    test('operation', ()=>{
        const actual = evaluate('1 + 2', EMPTY_ARGS);
        
        expect(actual).toEqual(3);
    });
    test('variable', ()=>{
        const actual = evaluate('num', {
            ...EMPTY_ARGS,
            vars : {
                'num' : 5
            }
        });
        
        expect(actual).toEqual(5);
    });
    test('variable + literal sum', ()=>{
        const actual = evaluate('num + 5', {
            ...EMPTY_ARGS,
            vars : {
                'num' : 5
            }
        })

        expect(actual).toEqual(10);
    });
    test('indexor', ()=>{
        const actual = evaluate('array[1]', {
            ...EMPTY_ARGS,
            vars : {
                'array' : {
                    raw : [0, 1, 2, 3]
                }
            },
            expressionEventHooks : {
                indexor(array, index) {
                    return array.value.raw.at(index.value);
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
                'print' : {
                    rawvalue : 'hello world',
                    call : function() {
                        return this.rawvalue;
                    }
                }
            },
            expressionEventHooks : {
                call(obj, args) {
                    return obj.value.call([...args]);
                },
                objectify(value) {
                    return value;
                }
            }
        });

        expect(actual).toEqual('hello world');
    });
    test('function with args', ()=>{
        const actual = evaluate('sum(1, 2+3, 4*5)', {
            ...EMPTY_ARGS,
            vars : {
                'sum' : {
                    call : function(a, b, c) {
                        return a.value + b.value + c.value;
                    }
                }
            },
            expressionEventHooks : {
                call(obj, args) {
                    return obj.value.call.apply(obj.value, args);
                },
                objectify(value) {
                    return value;
                }
            }
        });

        expect(actual).toEqual(1 + 2 + 3 + 4*5);
    });
    test('access', ()=>{
        const actual = evaluate('data.size', {
            ...EMPTY_ARGS,
            vars : {
                'data' : {
                    field : {
                        'size' : 10
                    },
                    access : function(key) {
                        return this.field[key];
                    }
                }
            },
            expressionEventHooks : {
                access(obj, index) {
                    return obj.value.access.apply(obj.value, [index.value]);
                },
                objectify(value) {
                    return value;
                }
            }
        });
        expect(actual).toEqual(10);
    })
    test('identifier in indexor', ()=>{
        const actual = evaluate('data[value]', {
            ...EMPTY_ARGS,
            vars : {
                'data' : {
                    array : [0, 1, 2, 3, 4],
                },
                'value' : {
                    value : 3
                }
            },
            expressionEventHooks : {
                'indexor' : function(array, index:LiteralExpression|ObjectExpression) {
                    const arr = array.value.array;
                    if (index.type === ExpressionType.LITERAL) {
                        return arr.at(index.value as number);
                    }
                    else {
                        return arr.at((index.value as any).value as number);
                    }
                },
                objectify(value) {
                    return value;
                }
            }
        });
        expect(actual).toEqual(3);
    })
    test('chain 1', ()=>{
        const actual = evaluate('data.get()', {
            ...EMPTY_ARGS,
            vars : {
                'data' : {
                    field : {
                        'get' : {
                            call : function() {
                                return 2;
                            }
                        }
                    }
                }
            },
            expressionEventHooks : {
                'access' : function(obj, key) {
                    return obj.value.field[key.value];
                },
                'call' : function(callerExpr:ObjectExpression, argsExpr:ParamExpression) {
                    const caller = callerExpr.value.call;
                    const args = argsExpr.args;
                    return caller.apply(callerExpr.value, args);
                } as any,
                objectify(value) {
                    return value;
                }
            }
        });
        expect(actual).toEqual(2);
    })
    
    test('chain 2', ()=>{
        const array = (rawarray)=>{
            return { array : rawarray }
        }

        const actual = evaluate('data.get()[1][2]', {
            ...EMPTY_ARGS,
            vars : {
                'data' : {
                    field : {
                        'get' : {
                            array : array([
                                array([0, 1, 2]),
                                array([3, 4, 5]),
                                array([6, 7, 8]),
                            ]),
                            call : function() {
                                return this.array;
                            }
                        }
                    }
                }
            },
            expressionEventHooks : {
                'access' : function(objExpr, keyExpr) {
                    return objExpr.value.field[keyExpr.value];
                },
                'indexor' : function(arrayExpr, indexExpr) {
                    return arrayExpr.value.array[indexExpr.value as number|string];
                },
                'call' : function(callerExpr:ObjectExpression, argsExpr:ParamExpression) {
                    const caller = callerExpr.value.call;
                    const args = argsExpr.args;
                    return caller.apply(callerExpr.value, args);
                } as any,
                objectify(value) {
                    return value;
                }
            }
        });
        expect(actual).toEqual(5);
    })
});

describe('Iterate Test', () => {
    test('array', ()=>{
        const actual = evaluateAndIterate('array', {
            ...EMPTY_ARGS,
            vars : {
                'array' : {
                    raw : [0, 1, 2, 3]
                }
            },
            expressionEventHooks : {
                'iterate' : function(array) {
                    return array.value.raw;
                },
                objectify(value) {
                    return value;
                }
            }
        });
        expect(actual).toEqual([0, 1, 2, 3]);
    });
});