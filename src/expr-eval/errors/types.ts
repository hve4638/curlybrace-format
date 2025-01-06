import { AnyExpression, ParamExpression } from '../../expr-parse/types/expressions';

export type FailExpression = Exclude<AnyExpression, ParamExpression>;