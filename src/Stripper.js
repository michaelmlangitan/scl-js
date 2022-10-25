import { SONG_PARAGRAPH, SONG_NEW_LINE } from './song'

const PATTERN_CHORD_ROOT = '([cdefgab])'
const PATTERN_CHORD_SYMBOL = '(#|b)?'
const PATTERN_CHORD_TYPE = '(m|5|7|maj7|m7|sus4|add9|sus2|7sus4|7#9|9)?'
const PATTERN_CHORD_SLASH = '(?:\\/([cdefgab])(#|b)?)?'
const PATTERN_CHORD = '\\s*' + PATTERN_CHORD_ROOT + PATTERN_CHORD_SYMBOL + PATTERN_CHORD_TYPE + PATTERN_CHORD_SLASH + '\\s*'

function Stripper () {
}

Stripper.prototype.stripScl = function (str, ignoreNewLine) {
  const pattern = `\\[${PATTERN_CHORD}\\]|\\{\\s*[\\w\\d]+\\s*\\}`
  const lyrics = str.replace(new RegExp(pattern, 'gi'), '')

  return ignoreNewLine ? lyrics.replace(/  +/g, ' ') : lyrics.replace(/\s\s+/g, ' ')
}

Stripper.prototype.stripSong = function (song, ignoreNewLine) {
  let lyrics = ''

  for (let x = 0; x < song.length; x++) {
    if (song[x].type === SONG_PARAGRAPH) {
      for (const content of song[x].contents) {
        if (content.lyric) {
          lyrics += content.lyric
        }
      }

      if (x < song.length - 1) {
        lyrics += '\n'
      }
    } else if (song[x].type === SONG_NEW_LINE) {
      lyrics += '\n'
    }
  }

  return ignoreNewLine ? lyrics.replace(/  +/g, ' ') : lyrics.replace(/\s\s+/g, ' ')
}

export default Stripper
