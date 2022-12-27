import {
    TOKEN_TEXT,
    TOKEN_NEW_LINE,
    TOKEN_ELEMENT_NAME,
    TOKEN_CHORD,
    SONG_ELEMENT_NAME,
    SONG_PARAGRAPH,
    SONG_NEW_LINE,
    chordMap,
    ChordSymbolsValue,
    Chord, SongData, SongDataParagraph, TOKEN_CHORDS_REPEATER
} from './functionality';
import {SclSyntaxException, LogicException} from "./Exception";
import TokenStream from "./TokenStream";

const STATE_INITIAL = 0
const STATE_HEADING = 1
const STATE_PARAGRAPH = 2

type AlignChord = { root: string, symbol: string }

export default class Parser {
    private readonly chordSymbol: ChordSymbolsValue;
    private readonly availableChords: string[];
    private tokenStream: TokenStream;
    private state: number;
    private states: number[];

    private song: SongData[];
    private paragraph: SongDataParagraph[]

    constructor(chordSymbol: ChordSymbolsValue) {
        this.chordSymbol = chordSymbol
        this.availableChords = chordMap.base.sharp.concat(chordMap.base.flat)
    }

    parse(tokenStream: TokenStream) {
        this.tokenStream = tokenStream
        this.state = STATE_INITIAL
        this.states = []
        this.song = []
        this.paragraph = []

        while (!this.tokenStream.isEOF()) {
            switch (this.state) {
                case STATE_INITIAL:
                    this.initialState()
                    break
                case STATE_HEADING:
                    this.headingState()
                    break
                case STATE_PARAGRAPH:
                    this.paragraphState()
                    break
            }
        }

        if (this.paragraph.length) {
            this.pushToSong(SONG_PARAGRAPH, this.paragraph)
        }

        return this.song
    }

    private initialState(): void {
        const type = this.tokenStream.currentToken().type

        if (type === TOKEN_TEXT || type === TOKEN_CHORD || type === TOKEN_CHORDS_REPEATER) {
            this.pushState(STATE_PARAGRAPH)
        } else if (type === TOKEN_ELEMENT_NAME) {
            this.pushState(STATE_HEADING)
        } else if (type === TOKEN_NEW_LINE && !this.paragraph.length) {
            this.pushToSong(SONG_NEW_LINE, null)
            this.tokenStream.next()
        } else {
            throw new LogicException(`Unhandled token type "${type}" on initial state.`)
        }
    }

    private headingState(): void {
        const current = this.tokenStream.currentToken()
        if (typeof current.value === "string") {
            this.pushToSong(SONG_ELEMENT_NAME, current.value)
        } else {
            throw new LogicException('Expected string of song element heading.')
        }

        const next = this.tokenStream.next()
        if (next.type === TOKEN_NEW_LINE) {
            this.tokenStream.next()
        }

        this.popState()
    }

    private paragraphState(): void {
        const token = this.tokenStream.currentToken()

        if (token.type === TOKEN_CHORD) {
            const chords = Array.isArray(token.value) ? token.value : []
            this.chordsCorrector(chords, token.lineno, token.cursor)

            const next = this.tokenStream.next()
            if (next.type === TOKEN_TEXT) {
                this.pushParagraph(chords, typeof next.value === "string"?next.value:null, null)
                this.tokenStream.next()
            } else {
                this.pushParagraph(chords, null, null)
            }
        } else if (token.type === TOKEN_TEXT) {
            this.pushParagraph([], typeof token.value === "string"?token.value:null, null)
            this.tokenStream.next()
        } else if (token.type === TOKEN_CHORDS_REPEATER) {
            const paragraphItem = this.paragraph[this.paragraph.length - 1]
            if (paragraphItem && paragraphItem.chords.length) {
                paragraphItem.chordsRepeater = typeof token.value === "string" ? token.value : null
            }

            this.tokenStream.next()
        }
        else if (token.type === TOKEN_NEW_LINE) {
            this.pushToSong(SONG_PARAGRAPH, this.paragraph)
            this.paragraph = []
            this.tokenStream.next()
            this.popState()
        } else if (token.type === TOKEN_ELEMENT_NAME) {
            this.pushToSong(SONG_PARAGRAPH, this.paragraph)
            this.paragraph = []
            this.popState()
        }
    }

    private pushParagraph(chords: Chord[], lyric: string, chordsRepeater?: string): void {
        this.paragraph.push({chords, lyric, chordsRepeater})
    }

    private static indexOfBaseChord(chord: string, symbolName: string): number {
        return chordMap.base[symbolName].indexOf(chord)
    }

    private static nameOfSymbol(symbol: string | ChordSymbolsValue): string {
        for (const name in chordMap.symbols) {
            if (symbol === chordMap.symbols[name]) {
                return name
            }
        }

        return null
    }

    private alignChord(root: string, symbol: string | ChordSymbolsValue): AlignChord {
        const nativeChord = root + symbol
        const nativeSymbolName = Parser.nameOfSymbol(symbol)
        const indexNativeChord = Parser.indexOfBaseChord(nativeChord, nativeSymbolName)
        const modifierSymbolName = Parser.nameOfSymbol(this.chordSymbol)
        const modifierChord = chordMap.base[modifierSymbolName][indexNativeChord]

        return {root: modifierChord.charAt(0), symbol: modifierChord.charAt(1)}
    }

    private isBaseChord(baseChord: string): boolean {
        return this.availableChords.indexOf(baseChord) >= 0
    }

    private assertChords(chords: Chord[], lineno: number, cursor: number): void {
        for (const chord of chords) {
            const baseChord = chord.root + (chord.symbol || '')
            if (!this.isBaseChord(baseChord)) {
                throw new SclSyntaxException(`Invalid chord "${baseChord}".`, lineno, cursor)
            }

            if (chord.slashRoot) {
                const slashChord = chord.slashRoot + (chord.slashSymbol || '')
                if (!this.isBaseChord(slashChord)) {
                    throw new SclSyntaxException(`Invalid chord "${slashChord}".`, lineno, cursor)
                }
            }
        }
    }

    private chordsModifier(chords: Chord[]): void {
        for (const chord of chords) {
            // uppercase root chord
            chord.root = chord.root.toUpperCase()

            // align main chord (root & symbol)
            if (chord.symbol && chord.symbol !== this.chordSymbol) {
                const mainModifier = this.alignChord(chord.root, chord.symbol)
                chord.root = mainModifier.root
                chord.symbol = mainModifier.symbol
            }

            // uppercase slash root
            if (chord.slashRoot) {
                chord.slashRoot = chord.slashRoot.toUpperCase()

                // align slash chord (slash root & slash symbol)
                if (chord.slashSymbol && chord.slashSymbol !== this.chordSymbol) {
                    const bassModifier = this.alignChord(chord.slashRoot, chord.slashSymbol)
                    chord.slashRoot = bassModifier.root
                    chord.slashSymbol = bassModifier.symbol
                }
            }
        }
    }

    private chordsCorrector(chords: Chord[], lineno: number, cursor: number): void {
        this.assertChords(chords, lineno, cursor)
        this.chordsModifier(chords)
    }

    private pushToSong(type: number, contents: SongDataParagraph[] | string) {
        this.song.push({ type, contents })
    }

    private pushState(state: number): void {
        this.states.push(this.state)
        this.state = state
    }

    private popState(): void {
        if (this.states.length) {
            this.state = this.states.pop()
        } else {
            throw new LogicException('Cannot pop state without previous state.')
        }
    }
}