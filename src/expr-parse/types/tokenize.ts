export const TOKEN_PATTERNS = {
    NUMBER: /\d+(\.\d+)?/,
    STRING: /(["'])(?:(?=(\\?))\2.)*?\1/,
    OPERATOR: /(\+|-|\*|\/|%|==|<=|>=|<|>|&&|\|\||\.)/,
    IDENTIFIER: /\:?[a-zA-Z_]\w*/,
    PAREN : /(\(|\))/,
    SPACE: /\s+/,
    INDEXOR : /(\[|\])/,
    DELIMITER : /\,/,
};
export type RawTokenType = keyof typeof TOKEN_PATTERNS;

export const INVALID_TOKEN_PATTERNS = {
    IDENTIFIER : /\:?\d+(?:\.\d+)?[a-zA-Z_]\w*/
}

export type RawToken = {
    type: RawTokenType,
    value: string,
}