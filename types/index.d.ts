import Manager from "../src/Manager";
import { Options, ChordMap } from "../src/functionality";

declare const endpoint: {
    newManager(options?: Options): Manager;
    version: string;
    chordMap: ChordMap;
    FLAT_SYMBOL: string;
    SHARP_SYMBOL: string;
    SONG_ELEMENT_NAME: number;
    SONG_PARAGRAPH: number;
    SONG_NEW_LINE: number;
};
export default endpoint;
