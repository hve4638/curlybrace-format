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
    type : typeof FragmentType.TEXT,
    full_text : string
} | {
    type : typeof FragmentType.DIRECTIVE,
    full_text : string,
    keyword : DirectiveKeywords,
    field : string
} | {
    type : typeof FragmentType.EXPRESSION,
    full_text : string,
    expression : string
}