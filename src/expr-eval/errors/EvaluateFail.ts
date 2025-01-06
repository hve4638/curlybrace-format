import { CBFFail, CBFFailHint } from '../../errors';
import { CBF_ERROR_TYPE } from '../../types';
import { FailExpression } from './types';

class EvaluateFail extends CBFFail {
    constructor(message: string, type:CBF_ERROR_TYPE, expr: FailExpression) {
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
        this.name = 'EvaluateFail';
    }
}

export default EvaluateFail;