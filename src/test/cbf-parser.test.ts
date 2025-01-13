import { buildPrompt, promptFragment } from './utils';

const builtInVars = {
    'input' : '<INPUT>',
    'blank' : '',
    'nl' : '\n',
}
const hook = {
    indexor: (array:any, index:any) => {
        return array[index]
    },
    objectify: (value:any) => {
        return value;
    },
    iterate: (value:any) => {
        return value[Symbol.iterator]();
    },
    call: (caller:any, args:any[]) => {
        return caller.apply({}, args);
    },
    access: (obj:any, index:any) => {
        return obj[index];
    }
}

describe('CbfParser', () => {
    test('text', () => {
        const text = 'text1';
        const actual = buildPrompt(text);
        const expected = [
            promptFragment('user', [
                'text1',
            ]),
        ];

        expect(actual).toEqual(expected);
    });

    test('role', () => {
        const text = '{{::role bot}} text1 {{::role user}} text2';
        const actual = buildPrompt(text);
        const expected = [
            promptFragment('bot', [
                'text1',
            ]),
            promptFragment('user', [
                'text2',
            ]),
        ];

        expect(actual).toEqual(expected);
    });

    test('expr', () => {
        const text = '1 + 2 * 3 = {{ 1+2*3 }}';
        const actual = buildPrompt(text);
        const expected = [
            promptFragment('user', [
                '1 + 2 * 3 = 7',
            ]),
        ];

        expect(actual).toEqual(expected);
    });

    test('var calc', () => {
        const text = 'data : {{ x / 2 + y * 5 }}';
        const actual = buildPrompt(text, {
            builtInVars, hook,
            vars: {
                'x' : 20,
                'y' : 1,
            },
        });
        const expected = [
            promptFragment('user', [
                'data : 15',
            ]),
        ];

        expect(actual).toEqual(expected);
    });

    test('var calc 2', () => {
        const text = '{{ div(x, 3) }} {{ x % 3 }}';
        const actual = buildPrompt(text, {
            builtInVars, hook,
            vars: {
                'x' : 20,
                div(value:number, by:number) {
                    return Math.trunc(value / by);
                }
            },
        });
        const expected = [
            promptFragment('user', [
                '6 2',
            ]),
        ];

        expect(actual).toEqual(expected);
    });

    test('var', () => {
        const text = `message : {{ messsage }}`;
        const actual = buildPrompt(text, {
            builtInVars, hook,
            vars: {
                messsage : 'hello world',
            },
        });
        const expected = [
            promptFragment('user', [
                'message : hello world',
            ]),
        ];

        expect(actual).toEqual(expected);
    });

    test('var concat', () => {
        const text = `message : {{ first + ' ' + second }}`;
        const actual = buildPrompt(text, {
            builtInVars, hook,
            vars: {
                first : 'hello',
                second : 'world',
            },
        });
        const expected = [
            promptFragment('user', [
                'message : hello world',
            ]),
        ];

        expect(actual).toEqual(expected);
    });

    test('built-in var', () => {
        const text = `hello{{:nl}}world {{:blank}}`;
        const actual = buildPrompt(text, {
            builtInVars, hook,
            vars: {},
        });
        const expected = [
            promptFragment('user', [
                'hello\nworld ',
            ]),
        ];

        expect(actual).toEqual(expected);
    });

    test('preserve whitespace', () => {
        const text = `
        {{::ROLE user }}
            {{:blank}} text {{:blank}}
        {{::ROLE bot }}
            {{:nl}} text {{:nl}}
        `;
        const actual = buildPrompt(text, {
            builtInVars, hook,
            vars: {
                list : [
                    { role : 'bot', text : 'text1' },
                    { role : 'user', text : 'text2' },
                ]
            },
        });
        const expected = [
            promptFragment('user', [
                ' text ',
            ]),
            promptFragment('bot', [
                '\n text \n',
            ]),
        ];

        expect(actual).toEqual(expected);
    });

    test('array indexor', () => {
        const text = `value : {{ arr[1] }}`;
        const actual = buildPrompt(text, {
            builtInVars, hook,
            vars: {
                arr : [10, 20, 30]
            },
        });
        const expected = [
            promptFragment('user', [
                'value : 20',
            ]),
        ];

        expect(actual).toEqual(expected);
    });

    test('foreach', () => {
        const text = `
        {{::FOREACH item in list }}
            {{ item }}
        {{::ENDFOREACH }}`;
        const actual = buildPrompt(text, {
            builtInVars, hook,
            vars: {
                list : ['hello', ' ', 'world']
            },
        });
        const expected = [
            promptFragment('user', [
                'hello world',
            ]),
        ];

        expect(actual).toEqual(expected);
    });

    test('foreach with role', () => {
        const text = `
        {{::FOREACH item in list }}
            {{::IF item.role == 'bot' }}
                {{::ROLE bot }}
            {{::ELSEIF item.role == 'user' }}
                {{::ROLE user }}
            {{::ENDIF}}
            {{ item.text }}
        {{::ENDFOREACH }}`;
        const actual = buildPrompt(text, {
            builtInVars, hook,
            vars: {
                list : [
                    { role : 'bot', text : 'text1' },
                    { role : 'user', text : 'text2' },
                ]
            },
        });
        const expected = [
            promptFragment('bot', [
                'text1',
            ]),
            promptFragment('user', [
                'text2',
            ]),
        ];

        expect(actual).toEqual(expected);
    });
});