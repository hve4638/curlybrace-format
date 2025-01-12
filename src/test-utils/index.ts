import { CBFFail, CBFFailHint } from "../errors";
import { CBFErrorType } from "../types";

export function getThrownError(callback:()=>any) {
    try {
        callback();
    } catch (error) {
        return error;
    }
    throw new Error('Expected error but no error was thrown');
}

export function expectCBFFail(
    actualError:unknown,
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
