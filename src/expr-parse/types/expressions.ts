import { TokenType } from "./token";

export const ExpressionTokenType = {
    LITERAL: TokenType.LITERAL,
    IDENTIFIER: TokenType.IDENTIFIER,
    OBJECT : TokenType.OBJECT,
    PARAM: TokenType.PARAM,
    CALL: 'CALL',
    CUSTOM: 'CUSTOM',
} as const;
export const ExpressionType = ExpressionTokenType;

type AnyExpression = EvaluatableExpression | UnevaluatableExpression;
type EvaluatableExpression = CallExpression | LiteralExpression |  ObjectExpression | IdentifierExpression;
type UnevaluatableExpression = ParamExpression;

interface CallExpression {
    readonly type : 'CALL';
    readonly value : string;
    readonly operands : AnyExpression[];
    readonly position : number;
    readonly size : number;
}
interface LiteralExpression {
    readonly type : 'LITERAL';
    readonly value : string|number|boolean;
    readonly position : number;
    readonly size : number;
}
interface ObjectExpression {
    readonly type : 'OBJECT';
    readonly value : any;
    readonly position : number;
    readonly size : number;
}
interface IdentifierExpression {
    readonly type : 'IDENTIFIER';
    readonly value : string;
    readonly position : number;
    readonly size : number;
}
interface ParamExpression {
    readonly type : 'PARAM';
    readonly args : EvaluatableExpression[];
    readonly position : number;
    readonly size : number;
}

export type {
    AnyExpression,
    EvaluatableExpression,
    UnevaluatableExpression,
    CallExpression,
    ParamExpression,
    LiteralExpression,
    IdentifierExpression,
    ObjectExpression
}