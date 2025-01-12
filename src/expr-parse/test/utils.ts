import { CBFFail, CBFFailHint } from '../../errors';
import { CBFErrorType } from '../../types';

export function expectCBFFail(
    actualError:Error,
    failType:CBFErrorType,
    hint:CBFFailHint
) {
    expect(actualError).toBeInstanceOf(CBFFail);
    if (actualError instanceof CBFFail) {
        const actual = {
            text : actualError.text,
            type: actualError.type,
            positionBegin : actualError.positionBegin,
            positionEnd : actualError.positionEnd,
        }
        const expected = {
            type: failType,
            text : hint.text,
            positionBegin : hint.positionBegin,
            positionEnd : hint.positionEnd,
        }
        expect(actual).toEqual(expected);
    }
}
