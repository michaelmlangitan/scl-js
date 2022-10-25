import Manager from './Manager'
import chordMap from './chordMap'
import { SONG_ELEMENT_NAME, SONG_PARAGRAPH, SONG_NEW_LINE } from './song'

const sclJs = {
  newManager (options) {
    return new Manager(options)
  }
}

Object.defineProperties(sclJs, {
  version: { value: '1.0.0', enumerable: true },
  chordMap: { value: chordMap, enumerable: true },
  FLAT_SYMBOL: { value: chordMap.symbols.flat, enumerable: true },
  SHARP_SYMBOL: { value: chordMap.symbols.sharp, enumerable: true },
  SONG_ELEMENT_NAME: { value: SONG_ELEMENT_NAME, enumerable: true },
  SONG_PARAGRAPH: { value: SONG_PARAGRAPH, enumerable: true },
  SONG_NEW_LINE: { value: SONG_NEW_LINE, enumerable: true }
})

module.exports = sclJs
