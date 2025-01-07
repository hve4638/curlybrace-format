export const FragmentType = {
    TEXT : 'TEXT',
    DIRECTIVE : 'DIRECTIVE',
    EXPRESSION : 'EXPRESSION'
} as const;
export type FragmentType = typeof FragmentType[keyof typeof FragmentType];

export const DirectiveKeywords = {
    ROLE : 'ROLE',
    IF : 'IF',
    ELSEIF : 'ELSEIF',
    ELIF : 'ELIF',
    ELSE : 'ELSE',
    ENDIF : 'ENDIF',
    FOREACH : 'FOREACH',
    ENDFOREACH : 'ENDFOREACH',
    SPLIT : 'SPLIT',
} as const;
export type DirectiveKeywords = typeof DirectiveKeywords[keyof typeof DirectiveKeywords];

export type Fragment = {
    position : number;
    size : number;
    full_text : string;
} & ({
    type : typeof FragmentType.TEXT;
} | {
    type : typeof FragmentType.DIRECTIVE;
    keyword : DirectiveKeywords;
    field : string;
} | {
    type : typeof FragmentType.EXPRESSION;
    expression_text : string;
});