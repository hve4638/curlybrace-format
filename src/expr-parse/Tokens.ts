import {
    Token, TokenType
} from './types/token';

type TokenHint = {
    size : number,
    position : number,
}

export class Tokens {
    static #STRING_PATTERN = /^('|")(.*)\1$/
    static param():Token {
        return {
            type : TokenType.PARAM,
            value : '',
        }
    }
    static literal(value:string|number|boolean, hint:TokenHint):Token {
        return {
            type : TokenType.LITERAL,
            value : value,
            ...hint
        }
    }
    static string(value:string, hint:TokenHint):Token {
        const group = value.match(Tokens.#STRING_PATTERN);
        if (group) {
            return Tokens.literal(group[2], hint);
        }
        else {
            throw new Error('Invalid expression')
        }
    }
    static number(value:string, hint:TokenHint):Token {
        return Tokens.literal(Number(value), hint);
    }
    static identifier(value:string, hint:TokenHint):Token { // 변수?
        return {
            type : TokenType.IDENTIFIER,
            value : value,
            ...hint
        }
    }
    static operator(value:string, hint:TokenHint):Token {
        return {
            type : TokenType.OPERATOR,
            value : value,
            ...hint
        }
    }
    static delimiter(value:string, hint:TokenHint):Token {
        return {
            type : TokenType.DELIMITER,
            value : value,
            ...hint
        }
    }
    static custom(value:string, hint:TokenHint):Token {
        return {
            type : TokenType.CUSTOM,
            value : value,
            ...hint
        }
    }
    static object(value:object, hint:TokenHint):Token {
        return {
            type : TokenType.OBJECT,
            value : value,
            ...hint
        }
    }
}