import {CBFErrorType} from '../types';

export type CBFFailHint = {
    positionBegin:number;
    positionEnd:number;
    text:string;
}

class CBFFail extends Error {
    #hint:CBFFailHint;
    #type:CBFErrorType;

    constructor(message:string, errorType:CBFErrorType, hint:CBFFailHint) {
        super(message);
        this.name = 'CBFFailError';
        this.#type = errorType;
        this.#hint = hint;
    }

    get type() {
        return this.#type;
    }
    get positionBegin() {
        return this.#hint.positionBegin;
    }
    get positionEnd() {
        return this.#hint.positionEnd;
    }
    get text() {
        return this.#hint.text;
    }
}

export default CBFFail;