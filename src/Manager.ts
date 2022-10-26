import {ChordSymbolsValue, extendOptions, Options, SongData} from "./functionality";
import Lexer from "./Lexer";
import TokenStream from "./TokenStream";
import Parser from "./Parser";
import Transposing from "./Transposing";
import Formatter from "./Formatter";
import Stripper from "./Stripper";

const defaultOptions: Options = {
    chordSymbol: '#',
    transposeStep: 1
};

export default class Manager {
    private options: Options;

    constructor(options?: Options) {
        this.options = extendOptions(defaultOptions, options || {})
        this.setTransposeStep(this.options.transposeStep)
    }

    parse(scl: string): SongData[] {
        const tokens = new Lexer().tokenize(scl)

        return new Parser(this.options.chordSymbol).parse(new TokenStream(tokens));
    }

    transposeUp(songData: SongData[]): void {
        new Transposing(songData, this.options.chordSymbol, this.options.transposeStep).transposeUp()
    }

    transposeDown(songData: SongData[]): void {
        new Transposing(songData, this.options.chordSymbol, this.options.transposeStep).transposeDown()
    }

    transpose(songData: SongData[], number: number): void {
        new Transposing(songData, this.options.chordSymbol).transpose(number)
    }

    textFormat(songData: SongData[]): string {
        return new Formatter().format(songData)
    }

    stripScl(scl: string, ignoreNewLine?: boolean): string {
        return new Stripper().stripScl(scl, ignoreNewLine)
    }

    setChordSymbol(symbol: ChordSymbolsValue): Manager {
        this.options.chordSymbol = symbol

        return this
    }

    setTransposeStep(step: number): Manager {
        this.options.transposeStep = Math.max(Math.abs(step), 1)

        return this
    }
}