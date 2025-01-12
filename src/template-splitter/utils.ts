const RE_DIRECTIVE_MARKER = /(\{\{::.*?\}\})/ms
const RE_DIRECTIVE = /(\{\{\s*::\s*)(\S+)(\s*)(?:(.*?))?\s*\}\}/ms
const RE_EXPRESSION_MARKER = /(\{\{[^{}]*?\}\})/ms
const RE_EXPRESSION = /(\{\{\s*)(.*?)\s*\}\}/ms

export type DirectiveStruct = {
    full_text : string;
    keyword : string;
    keyword_left : string;
    field : string;
    field_left : string;
}

export type ExpressionStruct = {
    full_text : string;
    expression_text : string;
    expression_text_left : string;
}

export function splitByDirective(template:string) {
    return template.split(RE_DIRECTIVE_MARKER)
}
export function splitByExpression(template:string) {
    return template.split(RE_EXPRESSION_MARKER);
}
export function parseDirective(text:string):DirectiveStruct|null {
    const group = text.match(RE_DIRECTIVE);
    if (!group) return null;
    
    return {
        full_text : group[0],
        keyword : group[2],
        keyword_left : group[1],
        field : group[4] ?? '',
        field_left : group[1]+group[2]+group[3],
    }
}
export function parseExpression(text:string):ExpressionStruct|null {
    const group = text.match(RE_EXPRESSION);
    if (!group) return null;
    
    return {
        full_text : group[0],
        expression_text : group[2],
        expression_text_left : group[1],
    }
}