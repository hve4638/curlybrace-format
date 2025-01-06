import { tokenize, transformToken } from '../';
import { CBF_ERROR_TYPE } from '../../types';
import { expectCBFFail } from './utils';

function transform(expressionText:string) {
    return transformToken(tokenize(expressionText));
}

describe('SyntaxTransform Test', () => {
    test('Duplicate Expression', ()=>{ 
        const expressionText = 'a , b';
        try {
            transform(expressionText);
        }
        catch (e: any) {
            expectCBFFail(
                e,
                CBF_ERROR_TYPE.MULTIPLE_EXPRESSION,
                {
                    text: ',',
                    positionBegin: 2,
                    positionEnd: 3,
                }
            )
        }
    });
});