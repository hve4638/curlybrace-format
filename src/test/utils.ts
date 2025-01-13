import CBFParser from '../CBFParser';
import { CBFParserExecuteArgs } from '../types';

export type PromptResult = {
    role: string;
    children: string[];
};

const parser = new CBFParser();

export function buildPrompt(template:string, args:CBFParserExecuteArgs={ vars: {}, builtInVars: {}, hook: {} }):PromptResult[] {
    const result = parser.build(template);
    const gen = parser.execute(result.nodes, args);

    const results:PromptResult[] = [];
    for (const ele of gen) {
        if (ele.type === 'ROLE') {
            results.push({ role: ele.role, children: [] });
        }
        else {
            let result = results.at(-1);
            if (!result) {
                result = { role: 'user', children: [] }
                results.push(result);
            }

            const children = result.children;
            if (ele.type === 'TEXT') {
                if (result.children.length === 0) {
                    children.push('');
                }
                children[children.length-1] += ele.text;
            }
            else if (ele.type === 'SPLIT') {
                result.children.push('');
            }
        }
        // elements.push(element);
    }

    return results;
}

export function promptFragment(role:string, text:string[]):PromptResult {
    return {
        role: role,
        children: text,
    }
}