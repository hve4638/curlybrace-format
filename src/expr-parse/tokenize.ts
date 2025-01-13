import { CBFFail } from '../errors';
import { CBFErrorType } from '../types';
import {
    TOKEN_PATTERNS,
    INVALID_TOKEN_PATTERNS,
    RawTokenType,
    RawToken,
} from './types/tokenize';

// 토크나이저
// 표현식을 최소 단위로 쪼개어 토큰화
function tokenize(expressionText:string):RawToken[] {
    const tokens:{type:RawTokenType,value:string}[] = [];
    let position = 0;
    
    while (position < expressionText.length) {
        let match:RegExpMatchArray|null = null;
        
        const part = expressionText.slice(position);
        for (const [tokenType, pattern] of Object.entries(INVALID_TOKEN_PATTERNS)) {
            const regex = new RegExp(`^${pattern.source}`);
            match = part.match(regex);

            if (match) {
                const text = match[0];

                throw new CBFFail(
                    'Invalid token',
                    CBFErrorType.INVALID_TOKEN,
                    {
                        text,
                        positionBegin : position,
                        positionEnd: position + text.length,
                    }
                );
            }
        }

        for (const [tokenType, pattern] of Object.entries(TOKEN_PATTERNS)) {
            const regex = new RegExp(`^${pattern.source}`);
            match = part.match(regex);
            
            if (match) {
                // 해석에 불필요한 SPACE 패턴도 포함됨
                // 이후 에러 발생 시 위치를 찾기 위함
                tokens.push({ type: tokenType as RawTokenType, value: match[0] });

                position += match[0].length;
                break;
            }
        }
        
        if (!match) {
            const text = expressionText[position];

            throw new CBFFail(
                'Invalid token',
                CBFErrorType.INVALID_TOKEN,
                {
                    text,
                    positionBegin : position,
                    positionEnd: position + text.length,
                }
            );
        }
    }

    return tokens;
}

export default tokenize;