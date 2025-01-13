import {
    CBFEvalFail,
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
import { CBFErrorType } from '../../types';

const EMPTY_ARGS = {
    vars : {},
    expressionEventHooks : {},
    builtInVars:{},
    scope : {}
} as ExpressionArgs;

describe('evaluate error', () => {
    const identifier = (value:string, hint:{ position:number, size:number }) => {
        return {
            type : ExpressionType.IDENTIFIER,
            value : value,
            ...hint
        } as IdentifierExpression;
    }

    test('IDENTIFIER_RESOLVE_FAIL : var', () => {
        const e = getThrownError(()=>evaluate('num', EMPTY_ARGS))
        expectCBFFail(
            e,
            CBFErrorType.IDENTIFIER_RESOLVE_FAIL,
            {
                text : 'num',
                positionBegin : 0,
                positionEnd : 3,
            }
        );
    });
    
    test('IDENTIFIER_RESOLVE_FAIL : built-in var', () => {
        const e = getThrownError(()=>evaluate(':chat', EMPTY_ARGS))
        expectCBFFail(
            e,
            CBFErrorType.IDENTIFIER_RESOLVE_FAIL,
            {
                text : ':chat',
                positionBegin : 0,
                positionEnd : 5,
            }
        );
    });

    test('NO_HOOK : call', () => {
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
            CBFErrorType.NO_HOOK,
            {
                text : '()',
                positionBegin : 0,
                positionEnd : 5,
            }
        );
    });

    test('NO_HOOK : stringify', () => {
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
            CBFErrorType.NO_HOOK,
            {
                text : args.vars.num.toString(),
                positionBegin : 0,
                positionEnd : 3,
            }
        );
    });

    // literal의 경우 미리 정의된 내부 hook를 사용하며
    // 지원하지 않는 연산자는 NO_HOOK대신 OPERATOR_NOT_SUPPORTED 예외를 발생시킴
    test('OPERATOR_NOT_SUPPORTED : literal iterate', () => {
        const e = getThrownError(()=>evaluateAndIterate('5', EMPTY_ARGS))
        expectCBFFail(
            e,
            CBFErrorType.OPERATOR_NOT_SUPPORTED,
            {
                text : '5',
                positionBegin : 0,
                positionEnd : 1,
            }
        );
    });
});

