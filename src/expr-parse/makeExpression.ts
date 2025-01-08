import parseAST from "./parseAST";
import tokenize from "./tokenize";
import transformToken from "./transformToken";
import { EvaluatableExpression } from "./types/expressions";

function makeExpression(text:string):EvaluatableExpression {
    const tokens = tokenize(text);
    const transformed = transformToken(tokens);
    const ast = parseAST(transformed);
    return ast;
}

export default makeExpression;