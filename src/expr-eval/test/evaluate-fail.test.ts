import {
    EvaluateFail,
    NoHookError,
} from '../errors';
import { 
    ExpressionType,
    IdentifierExpression,
    CallExpression,
} from '../../expr-parse/types/expressions';
import type { ExpressionArgs } from '../types/expr-hooks';
import {
    evaluate,
    evaluateAndIterate,
    evaluateAndStringify,
    expectCBFFail,
    getThrownError,
} from './utils';
import { CBF_ERROR_TYPE } from '../../types';

const EMPTY_ARGS = {
    vars : {},
    expressionEventHooks : {},
    builtInVars:{},
    currentScope : {}
} as ExpressionArgs;

describe('evaluate error', () => {
    const identifier = (value:string, hint:{ position:number, size:number }) => {
        return {
            type : ExpressionType.IDENTIFIER,
            value : value,
            ...hint
        } as IdentifierExpression;
    }

    test('no variable defined', () => {
        const e = getThrownError(()=>evaluate('num', EMPTY_ARGS))
        expectCBFFail(
            e,
            CBF_ERROR_TYPE.IDENTIFIER_RESOLVE_FAIL,
            {
                text : 'num',
                positionBegin : 0,
                positionEnd : 3,
            }
        );
    });
    
    test('invalid built-in variable', () => {
        const e = getThrownError(()=>evaluate(':chat', EMPTY_ARGS))
        expectCBFFail(
            e,
            CBF_ERROR_TYPE.IDENTIFIER_RESOLVE_FAIL,
            {
                text : ':chat',
                positionBegin : 0,
                positionEnd : 5,
            }
        );
    });

    test('no hook', () => {
        const args = {
            ...EMPTY_ARGS,
            vars : {
                num : {}
            },
            expressionEventHooks : {
                objectify(value) {
                    return value;
                }
            }
        };
        
        const e = getThrownError(()=>evaluate('num()', args));
        expectCBFFail(
            e,
            CBF_ERROR_TYPE.NO_HOOK,
            {
                // @TODO : 추후 () 가 아닌 call() 과 같이 전체 표현으로 변경 필요
                text : '()',
                positionBegin : 3,
                positionEnd : 5,
            }
        );
    });

    test('no hook : stringify', () => {
        const args = {
            ...EMPTY_ARGS,
            vars : {
                num : {}
            },
            expressionEventHooks : {
                objectify(value) {
                    return value;
                }
            }
        };

        const e = getThrownError(()=>evaluateAndStringify('num', args))
        expectCBFFail(
            e,
            CBF_ERROR_TYPE.NO_HOOK,
            {
                text : args.vars.num.toString(),
                positionBegin : 0,
                positionEnd : 3,
            }
        );
    });

    test('try iterate literal', () => {
        const e = getThrownError(()=>evaluateAndIterate('5', EMPTY_ARGS))
        expectCBFFail(
            e,
            CBF_ERROR_TYPE.OPERATOR_NOT_SUPPORTED,
            {
                text : '5',
                positionBegin : 0,
                positionEnd : 1,
            }
        );
    });
});

