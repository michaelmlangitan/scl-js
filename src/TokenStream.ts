import {Token, TOKEN_EOF} from "./functionality";

export default class TokenStream {
    private readonly tokens: Token[];
    private current: number;

    constructor(tokens: Token[]) {
        this.tokens = tokens
        this.current = 0
    }

    next(): Token {
        return this.tokens[++this.current]
    }

    isEOF(): boolean {
        return this.tokens[this.current].type === TOKEN_EOF
    }

    currentToken(): Token {
        return this.tokens[this.current]
    }
}