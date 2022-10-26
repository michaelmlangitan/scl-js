import {Chord, chordMap, ChordSymbolsValue, SONG_PARAGRAPH, SongData} from "./functionality";

export default class Transposing {
    private song: SongData[];
    private readonly baseChords: string[];
    private readonly step: number;

    constructor (song: SongData[], symbol: ChordSymbolsValue, step?: number) {
        this.song = song
        this.baseChords = chordMap.base[Transposing.nameOfSymbol(symbol)]
        this.step = step || 1
    }

    private static nameOfSymbol(symbol: string): string {
        return chordMap.symbols.flat === symbol ? symbol : chordMap.symbols.sharp
    }

    transposeUp(): void {
        this.transpose(this.step)
    }

    transposeDown(): void {
        this.transpose(-this.step)
    }

    private circularBaseChord(currentIndex: number, expectedIndex: number) {
        let index = (currentIndex + expectedIndex) % this.baseChords.length
        if (index < 0) { index = this.baseChords.length + index }

        return this.baseChords[index]
    }

    transpose(number: number): void {
        this.each((chord: Chord) => {
            const baseChord = chord.root + (chord.symbol || '')
            const baseChordModifier = this.circularBaseChord(this.indexOfBaseChord(baseChord), number)
            chord.root = baseChordModifier.charAt(0)
            chord.symbol = baseChordModifier.charAt(1) || undefined

            if (chord.slashRoot) {
                const slashChord = chord.slashRoot + (chord.slashSymbol || '')
                const slashChordModifier = this.circularBaseChord(this.indexOfBaseChord(slashChord), number)
                chord.slashRoot = slashChordModifier.charAt(0)
                chord.slashSymbol = slashChordModifier.charAt(1) || undefined
            }
        })
    }

    private indexOfBaseChord(chord: string): number {
        return this.baseChords.indexOf(chord)
    }

    private each(callback: any): void {
        if (typeof callback === 'function') {
            for (const item of this.song) {
                if (item.type === SONG_PARAGRAPH && Array.isArray(item.contents)) {
                    for (const content of item.contents) {
                        for (const chord of content.chords) {
                            callback(chord)
                        }
                    }
                }
            }
        }
    }
}