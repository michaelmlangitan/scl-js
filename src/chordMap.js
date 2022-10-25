module.exports = {
  base: {
    sharp: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    flat: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
  },
  symbols: { sharp: '#', flat: 'b' },
  types: [
    { name: 'major', alias: '' },
    { name: 'minor', alias: 'm' },
    { name: '5', alias: '5' },
    { name: '7', alias: '7' },
    { name: 'maj7', alias: 'maj7' },
    { name: 'm7', alias: 'm7' },
    { name: 'sus4', alias: 'sus4' },
    { name: 'add9', alias: 'add9' },
    { name: 'sus2', alias: 'sus2' },
    { name: '7sus4', alias: '7sus4' },
    { name: '7#9', alias: '7#9' },
    { name: '9', alias: '9' }
  ]
}
