import { CBFFail, CBFFailHint } from "../../errors";
import { CBFErrorType } from "../../types";
import { Fragment } from "../../types/fragment";

export class BuildError extends CBFFail {
    constructor(message:string, errorType:CBFErrorType, fragment:Fragment) {
        let hint:CBFFailHint;
        try {
            hint = {
                positionBegin : fragment.position,
                positionEnd : fragment.position + fragment.size,
                text : fragment.full_text
            }
        }
        catch (e) {
            hint = {
                positionBegin : 0,
                positionEnd : 0,
                text : 'UNKNOWN'
            }
        }
        
        super(message, errorType, hint);
        this.name = 'BuildError';
    }
}