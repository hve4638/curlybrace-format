import { tokenize } from '../';
import { CBFErrorType } from '../../types';
import { expectCBFFail } from './utils';

describe('Tokenizer Error Test', () => {
    test('Invalid Identifier', ()=>{
        const expressionText = '1a';
        try {
            tokenize(expressionText); // expected error
        }
        catch (e: any) {
            expectCBFFail(
                e,
                CBFErrorType.INVALID_TOKEN,
                {
                    text: '1a',
                    positionBegin: 0,
                    positionEnd: 2,
                }
            );
            return;
        }
        throw new Error('Expected error but not thrown');
    });

    test('Invalid operator', ()=>{
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