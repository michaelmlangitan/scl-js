import {CHORD_TAG, MULTI_CHORDS_TAG, ELEMENT_NAME_TAG} from "./Pattern";
const REGEX = `${CHORD_TAG}|${ELEMENT_NAME_TAG}|${MULTI_CHORDS_TAG}`

export default class Stripper {
    stripScl(str: string, ignoreNewLine?: boolean): string {
        const lyrics = (typeof str === "string" ? str : '').replace(new RegExp(REGEX, 'gi'), '')

        return ignoreNewLine ?
            lyrics.replace(/  +/g, ' ') :
            lyrics.replace(/\r?\n/g, ' ').replace(/\s\s+/g, ' ').trim()
    }
}