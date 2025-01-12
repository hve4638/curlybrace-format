import { EvaluatableExpression, LiteralExpression, ObjectExpression } from '../../expr-parse/types/expressions';

type AnyResult = ObjectExpression | LiteralExpression | string | number | boolean;
type LiteralResult = LiteralExpression | string | number | boolean;
type ComparisonResult = LiteralExpression | boolean;

export type ExpressionEventHooks = {
    'add' : (a:unknown, b:unknown)=>AnyResult;
    'subtract' : (a:unknown, b:unknown)=>AnyResult;
    'multiply' : (a:unknown, b:unknown)=>AnyResult;
    'divide' : (a:unknown, b:unknown)=>AnyResult;
    'modulo' : (a:unknown, b:unknown)=>AnyResult;

    'greaterOrEqual' : (a:unknown, b:unknown)=>ComparisonResult;
    'lessOrEqual' : (a:unknown, b:unknown)=>ComparisonResult;
    'greater' : (a:unknown, b:unknown)=>ComparisonResult;
    'less' : (a:unknown, b:unknown)=>ComparisonResult;
    'notEqual' : (a:unknown, b:unknown)=>ComparisonResult;
    'equal' : (a:unknown, b:unknown)=>ComparisonResult;
    'logicalAnd' : (a:unknown, b:unknown)=>ComparisonResult;
    'logicalOr' : (a:unknown, b:unknown)=>ComparisonResult;

    'access' : (expr:unknown, field:any)=>AnyResult;
    'indexor' : (expr:unknown, index:string|number)=>AnyResult;
    'call' : (expr:unknown, args:unknown[])=>AnyResult;
    
    'objectify' : (obj:unknown)=>unknown;
    'stringify' : (expr:unknown)=>string;
    'iterate' : (expr:unknown)=>Iterator<unknown>;
}

export const OPERATOR_HOOKS = {
    '+' : 'add',
    '-' : 'subtract',
    '*' : 'multiply',
    '/' : 'divide',
    '%' : 'modulo',
    '>=' : 'greaterOrEqual',
    '<=' : 'lessOrEqual',
    '>' : 'greater',
    '<' : 'less',
    '!=' : 'notEqual',
    '==' : 'equal',
    '&&' : 'logicalAnd',
    '||' : 'logicalOr',
    '.' : 'access',
    '[]' : 'indexor',
    '()' : 'call',
    'TOSTRING' : 'stringify',
    'STRINGIFY' : 'stringify',
    'OBJECTIFY' : 'objectify',
    'ITERATE' : 'iterate'
} as const;

export type Vars = {
    [key:string]: any;
}

export type ExpressionArgs = {
    // 사용자 지정
    vars: Vars;
    builtInVars : Vars;
    expressionEventHooks : Partial<ExpressionEventHooks>;
    
    scope? : Vars;
}
