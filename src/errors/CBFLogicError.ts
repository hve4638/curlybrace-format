import CBFFail, { CBFFailHint } from './CBFFail';
import { CBFErrorType } from '../types';

class CBFLogicError extends CBFFail {
    constructor(message:string, hint:CBFFailHint) {
        super(message, CBFErrorType.LOGIC_ERROR, hint);
        this.name = 'CBFLogicError';
    }
}

export default CBFLogicError;