import CBFFail, { CBFFailHint } from './CBFFail';
import { CBF_ERROR_TYPE } from '../types';

class CBFLogicError extends CBFFail {
    constructor(message:string, hint:CBFFailHint) {
        super(message, CBF_ERROR_TYPE.LOGIC_ERROR, hint);
        this.name = 'CBFLogicError';
    }
}

export default CBFLogicError;