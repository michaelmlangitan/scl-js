import { SONG_ELEMENT_NAME, SONG_PARAGRAPH, SONG_NEW_LINE } from './song'

function Formatter () {
}

Formatter.prototype.format = function (song) {
  let scl = ''

  for (let x = 0; x < song.length; x++) {
    switch (song[x].type) {
      case SONG_ELEMENT_NAME:
        scl += `{${song[x].contents}}\n`
        break
      case SONG_PARAGRAPH:
        scl += this.formatParagraph(song[x].contents, x < song.length - 1)
        break
      case SONG_NEW_LINE:
        scl += '\n'
        break
    }
  }

  return scl
}

Formatter.prototype.formatParagraph = function (contents, isNotLastItem) {
  let paragraph = ''
  for (const content of contents) {
    if (content.chords.length > 1) {
      paragraph += '[' + this.multiChordsFormat(content.chords) + ']'
    } else if (content.chords.length > 0) {
      paragraph += '[' + this.chordFormat(content.chords[0]) + ']'
    }

    if (content.lyric) { paragraph += content.lyric }
  }

  if (isNotLastItem) {
    paragraph += '\n'
  }

  return paragraph
}

Formatter.prototype.multiChordsFormat = function (chords) {
  let strChords = ''

  for (let x = 0; x < chords.length; x++) {
    if (x > 0) { strChords += '-' }

    strChords += this.chordFormat(chords[x])
  }

  return strChords
}

Formatter.prototype.chordFormat = function (chord) {
  let strChord = chord[0] + (chord[1] || '') + (chord[2] || '')

  if (chord[3]) { strChord += '/' + chord[3] + (chord[4] || '') }

  return strChord
}

module.exports = Formatter
