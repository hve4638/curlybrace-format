export const TokenType = {
    LITERAL : 'LITERAL',
    IDENTIFIER : 'IDENTIFIER',
    OPERATOR : 'OPERATOR',
    PARAM : 'PARAM',
    CUSTOM : 'CUSTOM',
    OBJECT : 'OBJECT',
    DELIMITER : 'DELIMITER'
} as const;
export type TokenType = typeof TokenType[keyof typeof TokenType];

export type Token = (
    OperatorToken  
  | {
    type : typeof TokenType.LITERAL,
    value : string|number|boolean,
    size : number,
    position : number,
} | {
    type : typeof TokenType.IDENTIFIER,
    value : string,
    size : number,
    position : number,
} | {
    type : typeof TokenType.PARAM,
    value : '',
} | {
    type : typeof TokenType.OBJECT,
    value : object,
    size : number,
    position : number,
} | {
    type : typeof TokenType.DELIMITER,
    value : string,
    size : number,
    position : number,
} | {
    type : typeof TokenType.CUSTOM,
    value : string,
    size : number,
    position : number,
})

export type OperatorToken = {
    type : typeof TokenType.OPERATOR,
    value : string,
    size : number,
    position : number,
}