const PATTERN_CHORD_ROOT = '([cdefgab])'
const PATTERN_CHORD_SYMBOL = '(#|b)?'
const PATTERN_CHORD_TYPE = '(m|5|7|maj7|m7|sus4|add9|sus2|7sus4|7#9|9)?'
const PATTERN_CHORD_SLASH = '(?:\\/([cdefgab])(#|b)?)?'
const PATTERN_CHORD = '\\s*' + PATTERN_CHORD_ROOT + PATTERN_CHORD_SYMBOL + PATTERN_CHORD_TYPE + PATTERN_CHORD_SLASH + '\\s*'
const CHORD_TAG = `\\[${PATTERN_CHORD}\\]`
const MULTI_CHORDS_TAG = `\\[${PATTERN_CHORD}(?:\\-${PATTERN_CHORD})*\\]`
const ELEMENT_NAME_TAG = '\\{\\s*[\\w\\d]+\\s*\\}'
const REGEX = `${CHORD_TAG}|${ELEMENT_NAME_TAG}|${MULTI_CHORDS_TAG}`
const regex = new RegExp(REGEX, 'gi')

export default class Stripper {
    stripScl(str: string, ignoreNewLine?: boolean): string {
        const lyrics = (typeof str === "string" ? str : '').replace(regex, '')

        return ignoreNewLine ? lyrics.replace(/  +/g, ' ') : lyrics.replace(/\s\s+/g, ' ').trim()
    }
}