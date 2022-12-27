type ChordBase = { sharp: string[]; flat: string[]; }
type ChordSymbols = { sharp: string; flat: string; }
type ChordTypes = { name: string, alias: string }
export type ChordSymbolsValue = '#' | 'b'
export type Chord = { root: string, symbol?: string, type?: string, slashRoot?: string, slashSymbol?: string }
export type Token = { type: number, value?: string | Chord[], lineno?: number, cursor?: number }
export type SongDataParagraph = { chords: Chord[], lyric: string, chordsRepeater?: string }
export type SongData = {
    type: number,
    contents: SongDataParagraph[] | string
}

export type ChordMap = { base: ChordBase; symbols: ChordSymbols, types: ChordTypes[] }
export const chordMap: ChordMap = {
    base: {
        sharp: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
        flat: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
    },
    symbols: { sharp: '#', flat: 'b' },
    types: [
        { name: 'major', alias: '' },
        { name: 'minor', alias: 'm' },
        { name: '5', alias: '5' },
        { name: '7', alias: '7' },
        { name: 'maj7', alias: 'maj7' },
        { name: 'm7', alias: 'm7' },
        { name: 'sus4', alias: 'sus4' },
        { name: 'add9', alias: 'add9' },
        { name: 'sus2', alias: 'sus2' },
        { name: '7sus4', alias: '7sus4' },
        { name: '7#9', alias: '7#9' },
        { name: '9', alias: '9' }
    ]
};

export const TOKEN_EOF = -1
export const TOKEN_TEXT = 0
export const TOKEN_NEW_LINE = 1
export const TOKEN_ELEMENT_NAME = 2
export const TOKEN_CHORD = 3
export const TOKEN_CHORDS_REPEATER = 4;
export const SONG_ELEMENT_NAME = 1
export const SONG_PARAGRAPH = 2
export const SONG_NEW_LINE = 3

export type Options = { chordSymbol?: ChordSymbolsValue, transposeStep?: number }
export function extendOptions(...args: Options[]) {
    const options:Options = {}
    for (let x=0; x<args.length; x++) {
        for (let key in args[x]) {
            options[key] = args[x][key]
        }
    }

    return options
}
