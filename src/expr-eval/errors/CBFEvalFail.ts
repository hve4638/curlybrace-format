import { CBFFail, CBFFailHint } from '../../errors';
import { CBFErrorType } from '../../types';
import { FailExpression } from './types';

class CBFEvalFail extends CBFFail {
    constructor(message: string, type:CBFErrorType, expr: FailExpression) {
        let text:string;
        try {
            text = expr.value.toString();
        }
        catch (e) {
            text = 'UNKNOWN';
        }

        super(message, type, {
            text : text,
            positionBegin : expr.position,
            positionEnd : expr.position + expr.size,
        });
        this.name = 'CBFEvalFail';
    }
}

export default CBFEvalFail;