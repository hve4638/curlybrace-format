import { EvaluatableExpression, LiteralExpression, ObjectExpression } from '../../expr-parse/types/expressions';

type AnyResult = ObjectExpression | LiteralExpression | string | number | boolean;
type LiteralResult = LiteralExpression | string | number | boolean;
type ComparisonResult = LiteralExpression | boolean;

export type ExpressionEventHooks = {
    'add' : (a:EvaluatableExpression, b:EvaluatableExpression)=>AnyResult;
    'subtract' : (a:EvaluatableExpression, b:EvaluatableExpression)=>AnyResult;
    'multiply' : (a:EvaluatableExpression, b:EvaluatableExpression)=>AnyResult;
    'divide' : (a:EvaluatableExpression, b:EvaluatableExpression)=>AnyResult;
    'modulo' : (a:EvaluatableExpression, b:EvaluatableExpression)=>AnyResult;

    'greaterOrEqual' : (a:EvaluatableExpression, b:EvaluatableExpression)=>ComparisonResult;
    'lessOrEqual' : (a:EvaluatableExpression, b:EvaluatableExpression)=>ComparisonResult;
    'greater' : (a:EvaluatableExpression, b:EvaluatableExpression)=>ComparisonResult;
    'less' : (a:EvaluatableExpression, b:EvaluatableExpression)=>ComparisonResult;
    'notEqual' : (a:EvaluatableExpression, b:EvaluatableExpression)=>ComparisonResult;
    'equal' : (a:EvaluatableExpression, b:EvaluatableExpression)=>ComparisonResult;
    'logicalAnd' : (a:EvaluatableExpression, b:EvaluatableExpression)=>ComparisonResult;
    'logicalOr' : (a:EvaluatableExpression, b:EvaluatableExpression)=>ComparisonResult;

    'access' : (expr:EvaluatableExpression, field:EvaluatableExpression)=>AnyResult;
    'indexor' : (expr:EvaluatableExpression, index:LiteralExpression)=>AnyResult;
    'call' : (expr:EvaluatableExpression, args:EvaluatableExpression[])=>AnyResult;
    
    'objectify' : (obj:any)=>any;
    'stringify' : (expr:EvaluatableExpression)=>string;
    'iterate' : (expr:EvaluatableExpression)=>Iterable<any>;
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
    // 스코프
    currentScope? : Vars;
    expressionEventHooks : Partial<ExpressionEventHooks>;
}
