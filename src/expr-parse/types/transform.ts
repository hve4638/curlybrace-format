export const HIGHEST_PRECEDENCE = 10;
export const EXCEPT_PRECEDENCE = 'NOPRECEDENCE';
export const OPERATOR_PRECEDENCE = {
    '.' : HIGHEST_PRECEDENCE,
    '()' : HIGHEST_PRECEDENCE,
    '[]' : HIGHEST_PRECEDENCE,
    '*' : 6, '/' : 6, '%' : 6,
    '+' : 5, '-' : 5,
    '<=' : 4, '>=' : 4, '<' : 4, '>' : 4,
    '==' : 3, '!=' : 3,
    '&&' : 2,
    '||' : 1,
    ',' : 0,
    
    '[' : EXCEPT_PRECEDENCE,
    '(' : EXCEPT_PRECEDENCE,
} as const;

export const ParenType = {
    FUNCTION : 'FUNCTION',
    EXPRESSION : 'EXPRESSION',
}
export type ParenType = typeof ParenType[keyof typeof ParenType];