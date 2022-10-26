import {SONG_PARAGRAPH, SONG_NEW_LINE, SongData, SongDataParagraph} from './functionality'

const PATTERN_CHORD_ROOT = '([cdefgab])'
const PATTERN_CHORD_SYMBOL = '(#|b)?'
const PATTERN_CHORD_TYPE = '(m|5|7|maj7|m7|sus4|add9|sus2|7sus4|7#9|9)?'
const PATTERN_CHORD_SLASH = '(?:\\/([cdefgab])(#|b)?)?'
const PATTERN_CHORD = '\\s*' + PATTERN_CHORD_ROOT + PATTERN_CHORD_SYMBOL + PATTERN_CHORD_TYPE + PATTERN_CHORD_SLASH + '\\s*'

export default class Stripper {
    stripScl(str: string, ignoreNewLine?: boolean): string {
        const pattern = `\\[${PATTERN_CHORD}\\]|\\{\\s*[\\w\\d]+\\s*\\}`
        const lyrics = str.replace(new RegExp(pattern, 'gi'), '')

        return ignoreNewLine ? lyrics.replace(/  +/g, ' ') : lyrics.replace(/\s\s+/g, ' ').trim()
    }

    stripSong(songData: SongData[], ignoreNewLine?: boolean): string {
        let lyrics = ''

        for (let song of songData) {
            if (song.type === SONG_PARAGRAPH && Array.isArray(song.contents)) {
                for (let content of song.contents) {
                    if (content.lyric)
                        lyrics += content.lyric
                }
            } else if (song.type === SONG_NEW_LINE) {
                lyrics += '\n'
            }
        }

        return ignoreNewLine ? lyrics.replace(/  +/g, ' ') : lyrics.replace(/\s\s+/g, ' ').trim()
    }

    private songParagraph(contents: SongDataParagraph) {
    }
}