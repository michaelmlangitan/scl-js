export default {
  extend () {
    for (let x = 0; x < arguments.length; x++) {
      for (const key in arguments[x]) {
        if (Object.prototype.hasOwnProperty.call(arguments[x], key)) {
          arguments[0][key] = arguments[x][key]
        }
      }
    }

    return arguments[0]
  }
}
