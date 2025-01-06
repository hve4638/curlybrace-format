import { CBFFail, CBFFailHint } from '../../errors';
import { CBF_ERROR_TYPE } from '../../types';

export function expectCBFFail(
    actualError:Error,
    failType:CBF_ERROR_TYPE,
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
