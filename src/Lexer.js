import { TOKEN_EOF, TOKEN_TEXT, TOKEN_NEW_LINE, TOKEN_ELEMENT_NAME, TOKEN_CHORD } from './token'
import { throwSyntaxError, throwLogicException } from './thrower'

const STATE_DATA = 0
const STATE_ELEMENT_NAME = 1
const STATE_CHORD = 2

const PATTERN_CHORD_ROOT = '([cdefgab])'
const PATTERN_CHORD_SYMBOL = '(#|b)?'
const PATTERN_CHORD_TYPE = '(m|5|7|maj7|m7|sus4|add9|sus2|7sus4|7#9|9)?'
const PATTERN_CHORD_SLASH = '(?:\\/([cdefgab])(#|b)?)?'
const PATTERN_CHORD = '\\s*' + PATTERN_CHORD_ROOT + PATTERN_CHORD_SYMBOL + PATTERN_CHORD_TYPE + PATTERN_CHORD_SLASH + '\\s*'
const PATTERN_BRACKET_START = '\\[|\\{'
const PATTERN_LEX_CHORD = '^\\s*\\]'

function Lexer () {
}

Lexer.prototype.tokenize = function (contents) {
  this.contents = (typeof contents === 'string' ? contents : '')
    .replace(/\r?\n|\r/g, '\n')

  this.cursor = 0
  this.lineno = 1
  this.end = this.contents.length
  this.state = STATE_DATA
  this.states = []
  this.tokens = []
  this.brackets = []
  this.chords = []
  this.chordLineno = this.lineno
  this.chordCursor = this.cursor
  this.positions = []
  this.position = -1

  const regex = new RegExp(PATTERN_BRACKET_START, 'g')
  let match

  do {
    match = regex.exec(this.contents)
    if (match) { this.positions.push({ tag: match[0], index: match.index }) }
  } while (match !== null)

  // change to do while. Thanks for eslint
  // while (match = regex.exec(this.contents)) {
  //   this.positions.push({ tag: match[0], index: match.index })
  // }

  while (this.cursor < this.end) {
    switch (this.state) {
      case STATE_DATA:
        this.lexData()
        break
      case STATE_ELEMENT_NAME:
        this.lexElementName()
        break
      case STATE_CHORD:
        this.lexChord()
        break
    }
  }

  this.pushToken(TOKEN_EOF)
  return this.tokens
}

Lexer.prototype.lexData = function () {
  if (this.position === this.positions.length - 1) {
    this.pushToken(TOKEN_TEXT, this.contents.substring(this.cursor))
    this.cursor = this.end
    return
  }

  const position = this.positions[++this.position]
  const text = this.contents.substring(this.cursor, position.index)
  this.pushToken(TOKEN_TEXT, text)
  this.moveCursor(text + position.tag)
  this.brackets.push(position.tag)

  switch (this.positions[this.position].tag) {
    case '{':
      this.goState(STATE_ELEMENT_NAME)
      break
    case '[':
      this.chordLineno = this.lineno
      this.chordCursor = this.cursor
      this.goState(STATE_CHORD)
      break
  }
}

Lexer.prototype.lexElementName = function () {
  if (!this.brackets.length && this.contents[this.cursor] === '}') {
    this.moveCursor('}')
    this.backState()
  } else {
    this.elementNameExpression()
  }
}

Lexer.prototype.elementNameExpression = function () {
  const matches = /^\s*([\w\d]+)\s*/.exec(this.contents.substring(this.cursor))
  if (matches) {
    this.pushToken(TOKEN_ELEMENT_NAME, matches[1])
    this.moveCursor(matches[0])
  }

  if (this.contents[this.cursor] === '}' && this.brackets.length) {
    this.brackets.pop()
    return
  }

  throwSyntaxError(`Unexpected "${this.contents[this.cursor]}".`, this.lineno, this.cursor, this.contents)
}

Lexer.prototype.lexChord = function () {
  const matches = new RegExp(PATTERN_LEX_CHORD).exec(this.contents.substring(this.cursor))

  if (!this.brackets.length && matches) {
    this.pushToken(TOKEN_CHORD, this.chords, this.chordLineno, this.chordCursor)
    this.chords = []
    this.moveCursor(matches[0])
    this.backState()
  } else {
    this.chordExpression()
  }
}

Lexer.prototype.chordExpression = function () {
  const currentText = this.contents.substring(this.cursor)
  let matches

  matches = new RegExp(`^${PATTERN_CHORD}`, 'i').exec(currentText)
  if (matches) {
    this.chords.push([
      matches[1], // root
      matches[2], // symbol
      matches[3], // type
      matches[4], // slash root
      matches[5] // slash symbol
    ])
    this.moveCursor(matches[0])
    return
  }

  matches = new RegExp(`^-${PATTERN_CHORD}`, 'i').exec(currentText)
  if (this.chords.length && matches) {
    this.chords.push([
      matches[1], // root
      matches[2], // symbol
      matches[3], // type
      matches[4], // slash root
      matches[5] // slash symbol
    ])
    this.moveCursor(matches[0])
    return
  }

  if (this.chords.length && this.contents[this.cursor] === ']' && this.brackets.length) {
    this.brackets.pop()
    return
  }

  throwSyntaxError(`Unexpected "${this.contents[this.cursor]}".`, this.lineno, this.cursor, this.contents)
}

Lexer.prototype.goState = function (state) {
  this.states.push(this.state)
  this.state = state
}

Lexer.prototype.backState = function () {
  if (!this.states.length) {
    throwLogicException('Cannot back state without previous state.')
  }

  this.state = this.states.pop()
}

Lexer.prototype.moveCursor = function (text) {
  this.cursor += text.length
  this.lineno += text.split(/\n/).length - 1
}

Lexer.prototype.pushToken = function (type, value, lineno, cursor) {
  if (type === TOKEN_TEXT) {
    this.pushTokenText(value)
  } else {
    this.tokens.push({ type, value, lineno, cursor })
  }
}

Lexer.prototype.pushTokenText = function (value) {
  if (value === '') {
    return
  }

  if (value.indexOf('\n') > -1) {
    const lines = value.split(/\n/)
    for (let x = 0; x < lines.length; x++) {
      if (x > 0) {
        this.pushToken(TOKEN_NEW_LINE)
      }

      const lastToken = this.getLastToken()
      if (lastToken && lastToken.type === TOKEN_TEXT) {
        if (lines[x]) {
          lastToken.value += lines[x]
        }
      } else {
        if (lines[x]) {
          this.tokens.push({ type: TOKEN_TEXT, value: lines[x], lineno: undefined, cursor: undefined })
        }
      }
    }
  } else {
    const lastToken = this.getLastToken()
    if (lastToken && lastToken.type === TOKEN_TEXT) {
      lastToken.value += value
    } else {
      this.tokens.push({ type: TOKEN_TEXT, value, lineno: undefined, cursor: undefined })
    }
  }
}

Lexer.prototype.getLastToken = function () {
  return this.tokens[this.tokens.length - 1]
}

module.exports = Lexer
