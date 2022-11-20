import Manager from "../src/Manager";
import { Options, ChordMap } from "../src/functionality";

declare type FlatSymbolValue = 'b'
declare type SharpSymbolValue = '#'

declare const endpoint: {
    newManager(options?: Options): Manager;
    version: string;
    chordMap: ChordMap;
    FLAT_SYMBOL: FlatSymbolValue;
    SHARP_SYMBOL: SharpSymbolValue;
    SONG_ELEMENT_NAME: number;
    SONG_PARAGRAPH: number;
    SONG_NEW_LINE: number;
};
export default endpoint;
