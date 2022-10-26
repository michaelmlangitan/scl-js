import Manager from "./Manager";
import {chordMap, Options, SONG_ELEMENT_NAME, SONG_NEW_LINE, SONG_PARAGRAPH} from "./functionality";

const VERSION = '1.1.4'
const endpoint = {
    // version: VERSION,
    // chordMap: chordMap,
    // FLAT_SYMBOL: chordMap.symbols.flat,
    // SHARP_SYMBOL: chordMap.symbols.sharp,
    // SONG_ELEMENT_NAME,
    // SONG_PARAGRAPH,
    // SONG_NEW_LINE,
    newManager(options?: Options) {
        return new Manager(options)
    }
}

Object.defineProperties(endpoint, {
    version: { value: VERSION, enumerable: true },
    chordMap: { value: chordMap, enumerable: true },
    FLAT_SYMBOL: { value: chordMap.symbols.flat, enumerable: true },
    SHARP_SYMBOL: { value: chordMap.symbols.sharp, enumerable: true },
    SONG_ELEMENT_NAME: { value: SONG_ELEMENT_NAME, enumerable: true },
    SONG_PARAGRAPH: { value: SONG_PARAGRAPH, enumerable: true },
    SONG_NEW_LINE: { value: SONG_NEW_LINE, enumerable: true }
})

export default endpoint