import util from './util'
import Lexer from './Lexer'
import Parser from './Parser'
import TokenStream from './TokenStream'
import Transposing from './Transposing'
import Formatter from './Formatter'
import Stripper from './Stripper'
import chordMap from './chordMap'

const defaultOptions = {
  symbol: chordMap.symbols.sharp,
  transposeStep: 1
}

/**
 * @param {{symbol?: String, transposeStep?: number}} [options] - Option symbol is like a # (sharp) or b (flat). transposeStep is default step to transpose up and/or transpose down.
 * @constructor
 */
function Manager (options) {
  this.options = util.extend(defaultOptions, options || {})
  this.options.transposeStep = Math.max(Math.abs(this.options.transposeStep), 1)
}

/**
 * @param {String} scl - SCL Code
 * @returns {[]} - Song Data
 */
Manager.prototype.parse = function (scl) {
  const tokens = new Lexer().tokenize(scl)
  return new Parser(this.options.symbol).parse(new TokenStream(tokens))
}

/**
 * Transpose up the all chords in song data.
 * @param {[]} songData - Song data from parse.
 */
Manager.prototype.transposeUp = function (songData) {
  new Transposing(songData, this.options.symbol, this.options.transposeStep).transposeUp()
}

/**
 * Transpose down the all chords in song data.
 * @param {[]} songData - Song data from parse.
 */
Manager.prototype.transposeDown = function (songData) {
  new Transposing(songData, this.options.symbol, this.options.transposeStep).transposeDown()
}

/**
 * Transpose all chords with specific number. You can pass positive or negative number.
 * @param {[]} songData - Song data from parse.
 * @param {number} number - Positive or negative number in integer.
 */
Manager.prototype.transpose = function (songData, number) {
  new Transposing(songData, this.options.symbol).transpose(number)
}

/**
 * Format song data to text (SCL Code).
 * @param {[]} songData - Song data from parse.
 * @returns {string} - Scl Code.
 */
Manager.prototype.textFormat = function (songData) {
  return new Formatter().format(songData)
}

/**
 * Strip all tags SCL Code to normally text.
 * @param {String} scl - Scl Code.
 * @param {boolean} [ignoreNewLine] - Option to removing new line. Default is false.
 * @returns {String}
 */
Manager.prototype.stripScl = function (scl, ignoreNewLine) {
  return new Stripper().stripScl(scl, ignoreNewLine)
}

/**
 * Alternative to reset symbol.
 * @param {String} symbol - Symbol is like a # (sharp) or b (flat).
 * @returns {Manager} - Return the current object manager.
 */
Manager.prototype.setSymbol = function (symbol) {
  this.options.symbol = symbol
  return this
}

/**
 * Alternative to reset transpose step.
 * @param {number} step - Positive number (integer).
 * @returns {Manager} - Return the current object manager.
 */
Manager.prototype.setTransposeStep = function (step) {
  this.options.transposeStep = Math.max(Math.abs(step), 1)
  return this
}

export default Manager
