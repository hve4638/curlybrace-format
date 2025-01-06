import {CBF_ERROR_TYPE} from '../types';

export type CBFFailHint = {
    positionBegin:number;
    positionEnd:number;
    text:string;
}

class CBFFail extends Error {
    #hint:CBFFailHint;
    #type:CBF_ERROR_TYPE;

    constructor(message:string, errorType:CBF_ERROR_TYPE, hint:CBFFailHint) {
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