import { ExpressionEventHooks } from '../expr-eval/types/expr-hooks';

export type CBFResult = {
    type : 'TEXT';
    text : string;
} | {
    type : 'ROLE';
    role : string;
} | {
    type : 'IMAGE';
    src : string;
} | {
    type : 'SPLIT';
}

export type CBFParserExecuteArgs = {
    vars:{[key:string]:any};
    builtInVars:{[key:string]:any};
    hook:Partial<ExpressionEventHooks>;
}