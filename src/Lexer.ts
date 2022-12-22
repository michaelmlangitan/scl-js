import {TOKEN_CHORD, TOKEN_EOF, TOKEN_TEXT, TOKEN_ELEMENT_NAME, TOKEN_NEW_LINE, Token, Chord} from "./functionality";
import {SclSyntaxException, LogicException} from "./Exception";
import {PATTERN_BRACKET_START, PATTERN_CHORD, PATTERN_ELEMENT_NAME} from "./Pattern";

const STATE_DATA = 0
const STATE_ELEMENT_NAME = 1
const STATE_CHORD = 2
const PATTERN_LEX_CHORD = '^\\s*\\]'
type Position = { tag: string, index: number }

export default class Lexer {
    private cursor: number;
    private lineno: number;
    private end: number;
    private state: number;
    private states: number[];
    private tokens: Token[];
    private brackets: string[];
    private chords: Chord[];
    private chordLineno: number;
    private chordCursor: number;
    private positions: Position[];
    private position: number;
    private contents: string;

    tokenize(contents: string): Token[] {
        this.contents = contents.replace(/\r?\n|\r/g, "\n")

        this.cursor = 0
        this.lineno = 1
        this.end = this.contents.length
        this.state = STATE_DATA
        this.states = []
        this.tokens = []
        this.brackets = []
        this.chords = []
        this.chordLineno = this.lineno
        this.chordCursor = this.cursor
        this.positions = []
        this.position = -1

        let match = null
        const regex = new RegExp(PATTERN_BRACKET_START, 'g')
        do {
            match = regex.exec(this.contents)
            if (match) { this.positions.push({ tag: match[0], index: match.index }) }
        } while (match !== null)

        while (this.cursor < this.end) {
            switch (this.state) {
                case STATE_DATA:
                    this.lexData()
                    break
                case STATE_ELEMENT_NAME:
                    this.lexElementName()
                    break
                case STATE_CHORD:
                    this.lexChord()
                    break
            }
        }

        this.pushToken(TOKEN_EOF)

        return this.tokens
    }

    private lexData(): void {
        if (this.position === this.positions.length - 1) {
            this.pushToken(TOKEN_TEXT, this.contents.substring(this.cursor))
            this.cursor = this.end
            return
        }

        const position = this.positions[++this.position]
        const text = this.contents.substring(this.cursor, position.index)
        this.pushToken(TOKEN_TEXT, text)
        this.moveCursor(text + position.tag)
        this.brackets.push(position.tag)

        switch (this.positions[this.position].tag) {
            case '{':
                this.pushState(STATE_ELEMENT_NAME)
                break
            case '[':
                this.chordLineno = this.lineno
                this.chordCursor = this.cursor
                this.pushState(STATE_CHORD)
                break
        }
    }

    private lexElementName(): void {
        if (!this.brackets.length && this.contents[this.cursor] === '}') {
            this.moveCursor('}')
            this.popState()
        } else {
            this.elementNameExpression()
        }
    }

    private elementNameExpression(): void {
        const matches = new RegExp(`^\\s*(${PATTERN_ELEMENT_NAME})`).exec(this.contents.substring(this.cursor))
        if (matches) {
            this.pushToken(TOKEN_ELEMENT_NAME, matches[1].trim())
            this.moveCursor(matches[0])
        }

        if (this.contents[this.cursor] === '}' && this.brackets.length) {
            this.brackets.pop()
            return
        }

        throw new SclSyntaxException(`Unexpected character "${this.contents[this.cursor]}".`, this.lineno, this.cursor, this.contents)
    }

    private lexChord(): void {
        const matches = new RegExp(PATTERN_LEX_CHORD).exec(this.contents.substring(this.cursor))

        if (!this.brackets.length && matches) {
            this.pushToken(TOKEN_CHORD, this.chords, this.chordLineno, this.chordCursor)
            this.chords = []
            this.moveCursor(matches[0])
            this.popState()
        } else {
            this.chordExpression()
        }
    }

    private chordExpression(): void {
        const currentText = this.contents.substring(this.cursor)
        let matches

        matches = new RegExp(`^${PATTERN_CHORD}`, 'i').exec(currentText)
        if (matches) {
            this.pushChord(matches[1], matches[2], matches[3], matches[4], matches[5])
            this.moveCursor(matches[0])
            return
        }

        matches = new RegExp(`^-${PATTERN_CHORD}`, 'i').exec(currentText)
        if (this.chords.length && matches) {
            this.pushChord(matches[1], matches[2], matches[3], matches[4], matches[5])
            this.moveCursor(matches[0])
            return
        }

        if (this.chords.length && this.contents[this.cursor] === ']' && this.brackets.length) {
            this.brackets.pop()
            return
        }

        throw new SclSyntaxException(`Unexpected character "${this.contents[this.cursor]}".`, this.lineno, this.cursor, this.contents)
    }

    private pushChord(root: string, symbol?: string, type?: string, slashRoot?: string, slashSymbol?: string): void {
        this.chords.push({root, symbol, type, slashRoot, slashSymbol})
    }

    private pushState(state: number): void {
        this.states.push(this.state)
        this.state = state
    }

    private popState(): void {
        if (!this.states.length) {
            throw new LogicException('Cannot pop state without previous state.')
        }

        this.state = this.states.pop()
    }

    private moveCursor(text: string): void {
        this.cursor += text.length
        this.lineno += text.split(/\n/).length - 1
    }

    private pushToken(type: number, value?: string|Chord[], lineno?: number, cursor?: number): void {
        if (type === TOKEN_TEXT && typeof value === "string") {
            this.pushTokenText(value)
        } else {
            this.tokens.push({ type, value, lineno, cursor })
        }
    }

    private pushTokenText(value: string): void {
        if (value === '') {
            return
        }

        if (value.indexOf('\n') > -1) {
            const lines = value.split(/\n/)
            for (let x = 0; x < lines.length; x++) {
                if (x > 0) {
                    this.pushToken(TOKEN_NEW_LINE)
                }

                const lastToken = this.getLastToken()
                if (lastToken && lastToken.type === TOKEN_TEXT) {
                    if (lines[x]) {
                        lastToken.value += lines[x]
                    }
                } else {
                    if (lines[x]) {
                        this.tokens.push({ type: TOKEN_TEXT, value: lines[x], lineno: undefined, cursor: undefined })
                    }
                }
            }
        } else {
            const lastToken = this.getLastToken()
            if (lastToken && lastToken.type === TOKEN_TEXT) {
                lastToken.value += value
            } else {
                this.tokens.push({ type: TOKEN_TEXT, value, lineno: undefined, cursor: undefined })
            }
        }
    }

    private getLastToken(): Token {
        return this.tokens[this.tokens.length - 1]
    }
}