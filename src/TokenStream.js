import { TOKEN_EOF } from './token'

function TokenStream (tokens) {
  this.tokens = tokens
  this.current = 0
}

TokenStream.prototype.next = function () {
  return this.tokens[++this.current]
}

TokenStream.prototype.isEOF = function () {
  return this.tokens[this.current].type === TOKEN_EOF
}

TokenStream.prototype.end = function () {
  this.current = this.tokens.length - 1
}

TokenStream.prototype.currentToken = function () {
  return this.tokens[this.current]
}

export default TokenStream
