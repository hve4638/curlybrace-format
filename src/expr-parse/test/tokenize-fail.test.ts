import { tokenize } from '../';
import { CBFErrorType } from '../../types';
import { expectCBFFail, getThrownError } from '../../test-utils';

describe('tokenize fail', () => {
    test('INVALID_TOKEN : invalid identifier', ()=>{
        const expressionText = '1a';
        const e = getThrownError(()=>tokenize(expressionText));
        expectCBFFail(
            e,
            CBFErrorType.INVALID_TOKEN,
            {
                text: '1a',
                positionBegin: 0,
                positionEnd: 2,
            }
        );
    });

    test('INVALID_TOKEN : invalid operator', ()=>{
        const expressionText = 'a @ b';
        try {
            tokenize(expressionText); // expected error
        }
        catch (e: any) {
            expectCBFFail(
                e,
                CBFErrorType.INVALID_TOKEN,
                {
                    text: '@',
                    positionBegin: 2,
                    positionEnd: 3,
                }
            );
            return;
        }
        throw new Error('Expected error but not thrown');
    });
})