class ExtendableError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = (new Error(message)).stack
    }
  }
}

class SyntaxError extends ExtendableError {
  constructor (message, lineno, cursor, contents) {
    super(message)
    this.lineno = lineno
    this.cursor = cursor
    this.contents = contents
  }
}

export function throwSyntaxError (message, lineno, cursor, contents) {
  throw new SyntaxError(message, lineno, cursor, contents)
}
export function throwLogicException (message) {
  throw new Error(message)
}
