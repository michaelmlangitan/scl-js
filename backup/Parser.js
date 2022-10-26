import { TOKEN_TEXT, TOKEN_NEW_LINE, TOKEN_ELEMENT_NAME, TOKEN_CHORD } from './token'
import { SONG_ELEMENT_NAME, SONG_PARAGRAPH, SONG_NEW_LINE } from './song'
import { throwSyntaxError, throwLogicException } from './thrower'
import chordMap from './chordMap'

const STATE_INITIAL = 0
const STATE_HEADING = 1
const STATE_PARAGRAPH = 2

function Parser (modifier) {
  this.modifier = modifier === chordMap.symbols.flat ? chordMap.symbols.flat : chordMap.symbols.sharp
}

Parser.prototype.parse = function (tokenStream) {
  this.tokenStream = tokenStream

  this.state = STATE_INITIAL
  this.states = []
  this.song = []
  this.paragraph = []

  while (!this.tokenStream.isEOF()) {
    switch (this.state) {
      case STATE_INITIAL:
        this.initialState()
        break
      case STATE_HEADING:
        this.headingState()
        break
      case STATE_PARAGRAPH:
        this.paragraphState()
        break
    }
  }

  if (this.paragraph.length) {
    this.pushToSong(SONG_PARAGRAPH, this.paragraph)
  }

  return this.song
}

Parser.prototype.initialState = function () {
  const type = this.tokenStream.currentToken().type

  if (type === TOKEN_TEXT || type === TOKEN_CHORD) {
    this.pushState(STATE_PARAGRAPH)
  } else if (type === TOKEN_ELEMENT_NAME) {
    this.pushState(STATE_HEADING)
  } else if (type === TOKEN_NEW_LINE && !this.paragraph.length) {
    this.pushToSong(SONG_NEW_LINE, null)
    this.tokenStream.next()
  } else {
    throwLogicException(`Unhandled token type "${type}" on initial state.`)
  }
}

Parser.prototype.headingState = function () {
  this.pushToSong(SONG_ELEMENT_NAME, this.tokenStream.currentToken().value)
  const next = this.tokenStream.next()

  if (next.type === TOKEN_NEW_LINE) {
    this.tokenStream.next()
  }

  this.popState()
}

Parser.prototype.paragraphState = function () {
  const token = this.tokenStream.currentToken()

  if (token.type === TOKEN_CHORD) {
    this.chordsCorrector(token.value, token.lineno, token.cursor)

    const next = this.tokenStream.next()
    if (next.type === TOKEN_TEXT) {
      this.paragraph.push({ chords: token.value, lyric: next.value })
      this.tokenStream.next()
    } else {
      this.paragraph.push({ chords: token.value, lyric: null })
    }
  } else if (token.type === TOKEN_TEXT) {
    this.paragraph.push({ chords: [], lyric: token.value })
    this.tokenStream.next()
  } else if (token.type === TOKEN_NEW_LINE) {
    this.pushToSong(SONG_PARAGRAPH, this.paragraph)
    this.paragraph = []
    this.tokenStream.next()
    this.popState()
  } else if (token.type === TOKEN_ELEMENT_NAME) {
    this.pushToSong(SONG_PARAGRAPH, this.paragraph)
    this.paragraph = []
    this.popState()
  }
}

Parser.prototype.indexOfBaseChord = function (chord, symbolName) {
  return chordMap.base[symbolName].indexOf(chord)
}

Parser.prototype.nameOfSymbol = function (symbol) {
  for (const name in chordMap.symbols) {
    if (symbol === chordMap.symbols[name]) {
      return name
    }
  }

  return null
}

Parser.prototype.alignChord = function (root, symbol) {
  const nativeChord = root + symbol
  const nativeSymbolName = this.nameOfSymbol(symbol)
  const indexNativeChord = this.indexOfBaseChord(nativeChord, nativeSymbolName)
  const modifierSymbolName = this.nameOfSymbol(this.modifier)
  const modifierChord = chordMap.base[modifierSymbolName][indexNativeChord]

  return {
    root: modifierChord.charAt(0),
    symbol: modifierChord.charAt(1)
  }
}

Parser.prototype.assertChords = function (chords, lineno, cursor) {
  const availableChords = chordMap.base.sharp.concat(chordMap.base.flat)

  for (const chord of chords) {
    const baseChord = chord[0] + (chord[1] || '')
    if (!availableChords.includes(baseChord)) {
      throwSyntaxError(`Invalid chord "${baseChord}".`, lineno, cursor)
    }

    if (chord[3]) {
      const slashChord = chord[3] + (chord[4] || '')
      if (!availableChords.includes(slashChord)) {
        throwSyntaxError(`Invalid chord "${slashChord}".`, lineno, cursor)
      }
    }
  }
}

Parser.prototype.chordsModifier = function (chords) {
  for (const chord of chords) {
    // uppercase root chord
    chord[0] = chord[0].toUpperCase()

    // align main chord (root & symbol)
    if (chord[1] && chord[1] !== this.modifier) {
      const mainModifier = this.alignChord(chord[0], chord[1])
      chord[0] = mainModifier.root
      chord[1] = mainModifier.symbol
    }

    // uppercase slash root
    if (chord[3]) {
      chord[3] = chord[3].toUpperCase()
    }

    // align slash chord (slash root & slash symbol)
    if (chord[4] && chord[4] !== this.modifier) {
      const bassModifier = this.alignChord(chord[3], chord[4])
      chord[3] = bassModifier.root
      chord[4] = bassModifier.symbol
    }
  }
}

Parser.prototype.chordsCorrector = function (chords, lineno, cursor) {
  this.assertChords(chords, lineno, cursor)
  this.chordsModifier(chords)
}

Parser.prototype.pushToSong = function (type, contents) {
  this.song.push({ type, contents })
}

Parser.prototype.pushState = function (state) {
  this.states.push(this.state)
  this.state = state
}

Parser.prototype.popState = function () {
  if (!this.states.length) {
    throwLogicException('Cannot pop state without previous state.')
  }

  this.state = this.states.pop()
}

export default Parser
