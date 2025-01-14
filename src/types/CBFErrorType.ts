export const CBFErrorType = {
    // Tokenize errors
    INVALID_TOKEN : 'INVALID_TOKEN',

    // Transform errors
    MULTIPLE_EXPRESSION : 'MULTIPLE_EXPRESSION',
    MISSING_OPEN_PAREN : 'MISSING_OPEN_PAREN',
    MISSING_CLOSE_PAREN : 'MISSING_CLOSE_PAREN',
    MISSING_OPEN_INDEXOR : 'MISSING_OPEN_INDEXOR',
    MISSING_CLOSE_INDEXOR : 'MISSING_CLOSE_INDEXOR',
    UNHANDLE_OPERATOR : 'UNHANDLE_OPERATOR',

    // AST errors
    NO_EXPRESSION : 'NO_EXPRESSION',
    UNPROCESSED_EXPRESSION_REMAIN : 'UNPROCESSED_EXPRESSION_REMAIN',
    INVALID_FORMULA : 'INVALID_FORMULA',
    INVALID_ACCESSOR : 'INVALID_ACCESSOR',
    INVALID_OPERAND : 'INVALID_OPERAND',
    MISSING_PARAM_TOKEN : 'MISSING_PARAM_TOKEN',

    // Build errors
    INVALID_DIRECTIVE : 'INVALID_DIRECTIVE',
    UNKNOWN_DIRECTIVE : 'UNKNOWN_DIRECTIVE',
    INVALID_FRAGMENT : 'INVALID_FRAGMENT',
    MISSING_ENDIF : 'MISSING_ENDIF',
    MISSING_ENDFOREACH : 'MISSING_ENDFOREACH',
    DUPLICATE_ELSE_DIRECTIVE : 'DUPLICATE_ELSE_DIRECTIVE',

    // Evaluate errors
    IDENTIFIER_RESOLVE_FAIL : 'IDENTIFIER_RESOLVE_FAIL',
    NO_HOOK : 'NO_HOOK',
    OPERATOR_NOT_SUPPORTED : 'OPERATOR_NOT_SUPPORTED',
    EXCEPTION_IN_HOOK : 'EXCEPTION_IN_HOOK',
    INVALID_AST_FORMAT : 'INVALID_AST_FORMAT',
    
    // Logic errors
    LOGIC_ERROR : 'LOGIC_ERROR',
} as const;
export type CBFErrorType = typeof CBFErrorType[keyof typeof CBFErrorType];

