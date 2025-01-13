export const FragmentType = {
    TEXT : 'TEXT',
    DIRECTIVE : 'DIRECTIVE',
    EXPRESSION : 'EXPRESSION',
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

type FragmentRequired = {
    position : number;
    size : number;
    full_text : string;
}
export type Fragment = ExpressionFragment | DirectiveFragment | TextFragment;

export type ExpressionFragment = FragmentRequired &{
    type : typeof FragmentType.EXPRESSION;
    expression_text : string;
    expression_text_left : string;
}
export type DirectiveFragment = FragmentRequired & {
    type : typeof FragmentType.DIRECTIVE;
    keyword : string; // DirectiveKeywords 만 올 수 있으나, 중간 과정(TemplateSplitter)까지는 유효성 검사를 하지 않음
    field : string;
    keyword_left : string;
    field_left : string;
}
export type TextFragment = FragmentRequired & {
    type : typeof FragmentType.TEXT;
}