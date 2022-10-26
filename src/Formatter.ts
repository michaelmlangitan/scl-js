import {Chord, SONG_ELEMENT_NAME, SONG_NEW_LINE, SONG_PARAGRAPH, SongData} from "./functionality";

export default class Formatter {
    format(songData: SongData[]) {
        let scl = ''

        for (let x = 0; x < songData.length; x++) {
            switch (songData[x].type) {
                case SONG_ELEMENT_NAME:
                    scl += `{${songData[x].contents}}\n`
                    break
                case SONG_PARAGRAPH:
                        scl += Formatter.formatParagraph(songData[x].contents, x < songData.length - 1)
                    break
                case SONG_NEW_LINE:
                    scl += '\n'
                    break
            }
        }

        return scl
    }

    private static formatParagraph(contents, isNotLastItem: boolean): string {
        let paragraph = ''
        for (const content of contents) {
            if (content.chords.length > 1) {
                paragraph += '[' + Formatter.multiChordsFormat(content.chords) + ']'
            } else if (content.chords.length > 0) {
                paragraph += '[' + Formatter.chordFormat(content.chords[0]) + ']'
            }

            if (content.lyric) {
                paragraph += content.lyric
            }
        }

        if (isNotLastItem) {
            paragraph += '\n'
        }

        return paragraph
    }

    private static multiChordsFormat(chords: Chord[]): string {
        let strChords = ''

        for (let x = 0; x < chords.length; x++) {
            if (x > 0) { strChords += '-' }

            strChords += Formatter.chordFormat(chords[x])
        }

        return strChords
    }

    private static chordFormat(chord: Chord): string {
        let strChord = chord.root + (chord.symbol || '') + (chord.type || '')

        if (chord.slashRoot) {
            strChord += '/' + chord.slashRoot + (chord.slashSymbol || '')
        }

        return strChord
    }
}