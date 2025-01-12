import { CBFFail } from "../errors";
import parseAST from "./parseAST";
import tokenize from "./tokenize";
import transformToken from "./transformToken";
import { EvaluatableExpression } from "./types/expressions";

function makeExpression(text:string, position:number):EvaluatableExpression {
    try {
        const tokens = tokenize(text);
        const transformed = transformToken(tokens);
        const ast = parseAST(transformed);
        return ast;
    }
    catch(e) {
        if (e instanceof CBFFail) {
            throw new CBFFail(
                e.message,
                e.type,
                {
                    positionBegin : position + e.positionBegin,
                    positionEnd : position + e.positionEnd,
                    text : e.text,
                }
            );
        }
        else {
            throw e;
        }
    }
}

export default makeExpression;