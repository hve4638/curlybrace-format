# CBF

## 에러 목록

| 에러 목록 | 발생 시점 | 설명 |
|---------|----------|------|
| INVALID_TOKEN | 빌드 | 표현식의 토큰화에 실패한 경우 |
| MULTIPLE_EXPRESSION | 빌드 | 한 표현식에 여러 반환값이 존재할 경우 |
| MISSING_OPEN_PAREN | 빌드 | `)`와 대응하는 `(`가 없음 |
| MISSING_OPEN_INDEXOR | 빌드 | `]`와 대응하는 `[`가 없음 |
| NO_EXPRESSION | 빌드 | 빈 표현식 |
| UNPROCESSED_EXPRESSION_REMAIN | 빌드 | 수식 POSTFIX 변환을 제대로 수행하지 못함 |
| INVALID_FORMULA | 빌드 | 잘못된 수식 |
| INVALID_ACCESSOR | 빌드 | 잘못된 접근자 |
| INVALID_OPERAND | 빌드 | 잘못된 피연산자 (LITERAL + PARAM 과 같은 형식에서 발생) |
| MISSING_PARAM_TOKEN | 빌드 | CALL 연산에서 PARAM 토큰을 찾을 수 없음 |
| INVALID_DIRECTIVE | 빌드 | 해석 할 수 없는 지시자 위치 (ex. IF없이 ENDIF가 나타는 것이 해당) |
| UNKNOWN_DIRECTIVE | 빌드 | 알 수 없는 지시자 |
| INVALID_FRAGMENT | 빌드 | 잘못된 빌드 노드 타입 (TEXT, DIRECTIVE 또는 EXPRESSION이 아님) |
| MISSING_ENDIF | 빌드 | ENDIF를 찾을 수 없음 |
| MISSING_ENDFOREACH | 빌드 | ENDFOREACH를 찾을 수 없음 |
| DUPLICATE_ELSE_DIRECTIVE | 빌드 | ELSE문이 중복됨 |
| IDENTIFIER_RESOLVE_FAIL | 실행 | 식별자에 대응되는 변수가 존재하지 않음 |
| NO_HOOK | 실행 | 적절한 외부 HOOK가 존재하지 않음 |
| OPERATOR_NOT_SUPPORTED | 실행 | 해당 연산을 수행할 수 없음 |
| EXCEPTION_IN_HOOK | 실행 | 외부 HOOK 실행 중 예외 발생 |
| INVALID_AST_FORMAT | 실행 |  |
| LOGIC_ERROR | - | 라이브러리 에러 |