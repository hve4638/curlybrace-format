import { CBFFail, CBFFailHint } from "../../../errors";
import { CBF_ERROR_TYPE } from "../../../types";
import { Fragment } from "../../types/fragment";

export class BuildError extends CBFFail {
    constructor(message:string, errorType:CBF_ERROR_TYPE, fragment:Fragment) {
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