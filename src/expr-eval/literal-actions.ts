// 리터럴 간 연산에 사용됨
export const LITERAL_ACTIONS = {
    add(a, b) { return a + b },
    substract(a, b) { return a - b },
    multiply(a, b) { return a * b },
    divide(a, b) { return a / b },
    modulo(a, b) { return a % b },
    greaterOrEqual(a, b) { return a >= b },
    lessOrEqual(a, b) { return a <= b },
    greater(a, b) { return a > b },
    less(a, b) { return a < b },
    notEqual(a, b) { return a != b },
    equal(a, b) { return a == b },
    logicalAnd(a, b) { return a && b },
    logicalOr(a, b) { return a || b },
    indexor(a, b) { return a[b] },
    stringify(literal:number|string) { return literal.toString() }
} as const;

