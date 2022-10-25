import { SONG_PARAGRAPH } from './song'
import chordMap from './chordMap'

function Transposing (song, symbol, step) {
  const symbolName = this.nameOfSymbol(symbol === chordMap.symbols.flat ? chordMap.symbols.flat : chordMap.symbols.sharp)
  this.song = song
  this.baseChords = chordMap.base[symbolName]
  this.step = step
}

Transposing.prototype.nameOfSymbol = function (symbol) {
  for (const name in chordMap.symbols) {
    if (symbol === chordMap.symbols[name]) {
      return name
    }
  }

  return null
}

Transposing.prototype.transposeUp = function () {
  this.transpose(this.step)
}

Transposing.prototype.transposeDown = function () {
  this.transpose(-this.step)
}

Transposing.prototype.circularBaseChord = function (currentIndex, expectedIndex) {
  let index = (currentIndex + expectedIndex) % this.baseChords.length
  if (index < 0) { index = this.baseChords.length + index }

  return this.baseChords[index]
}

Transposing.prototype.transpose = function (number) {
  this.each(chord => {
    const baseChord = chord[0] + (chord[1] || '')
    const baseChordModifier = this.circularBaseChord(this.indexOfBaseChord(baseChord), number)
    chord[0] = baseChordModifier.charAt(0)
    chord[1] = baseChordModifier.charAt(1) || undefined

    if (chord[3]) {
      const slashChord = chord[3] + (chord[4] || '')
      const slashChordModifier = this.circularBaseChord(this.indexOfBaseChord(slashChord), number)
      chord[3] = slashChordModifier.charAt(0)
      chord[4] = slashChordModifier.charAt(1) || undefined
    }
  })
}

Transposing.prototype.indexOfBaseChord = function (chord) {
  return this.baseChords.indexOf(chord)
}

Transposing.prototype.each = function (callback) {
  if (typeof callback !== 'function') {
    return
  }

  for (const item of this.song) {
    if (item.type === SONG_PARAGRAPH) {
      for (const content of item.contents) {
        for (const chord of content.chords) {
          callback(chord)
        }
      }
    }
  }
}

module.exports = Transposing
