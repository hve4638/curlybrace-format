import { CBFErrorType } from '../../types';
import { expectCBFFail, getThrownError } from '../../test-utils';
import { generateAST } from './utils';

/*
 * parseAST에서 발생할 수 있는 예외 목록
 * - NO_EXPRESSION
 * - UNHANDLE_EXPRESSION_REMAIN
 * - INVALID_FORMULA
 * - INVALID_ACCESSOR
 * - INVALID_OPERAND
 * - MISSING_PARAM_TOKEN
*/
describe('ParseAST Fail', () => {
    test('NO_EXPRESSION', ()=>{
        const expressionText = '';
        const e = getThrownError(()=>generateAST(expressionText));
        expectCBFFail(
            e,
            CBFErrorType.NO_EXPRESSION,
            {
                text: '',
                positionBegin: 0,
                positionEnd: 0,
            }
        );
    });
    test('INVALID_FORMULA', ()=>{
        const expressionText = '1 - ';
        const e = getThrownError(()=>generateAST(expressionText));
        expectCBFFail(
            e,
            CBFErrorType.INVALID_FORMULA,
            {
                text: '-',
                positionBegin: 2,
                positionEnd: 3,
            }
        );
    });
    test('INVALID_ACCESSOR', ()=>{
        const expressionText = 'data.1';
        const e = getThrownError(()=>generateAST(expressionText));
        expectCBFFail(
            e,
            CBFErrorType.INVALID_ACCESSOR,
            {
                text: '.',
                positionBegin: 4,
                positionEnd: 5,
            }
        );
    });
    test('INVALID_OPERAND', ()=>{
        // '()'이 아닌 연산에서 피연산자가 PARAM일 경우 throw 되는 에러
        // 정상 흐름(tokenize->transfromToken)을 통해 전달된 입력을 통해서는 발생하지 않음
    });
    test('UNPROCESSED_EXPRESSION_REMAIN', ()=>{
        /// @TODO : 정상 흐름에서 발생할 수 있는지 확인 필요
    });
    test('MISSING_PARAM_TOKEN', ()=>{
        // '()' 토큰 앞에 'PARAM' 토큰 누락시 throw 되는 에러
        // 정상 흐름(tokenize->transfromToken)을 통해 전달된 입력을 통해서는 발생하지 않음
    });
});
