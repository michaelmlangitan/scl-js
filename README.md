# scl-js
Song Chord Language for Javascript

![npm (scoped)](https://img.shields.io/npm/v/@michaelmlangitan/scl-js)

## Installation
```shell
npm i @michaelmlangitan/scl-js
```
## Quick Start
### Parse
Parse string data scl to song data array.
```js
import sclJs from "@michaelmlangitan/scl-js"

const stringScl = '[C]song lyric.'
const manager = sclJs.newManager()
const songData = manager.parse(stringScl)
```
#### Result of Parse (SongData)
```json
[
  {
    "type": 2,
    "contents": [
      {
        "chords": [
          {"root": "C"}
        ],
        "lyric": "song lyric."
      }
    ]
  }
]
```

### Text Format
Format SongData to Text SCL.
```js
//...
const textFormat = manager.textFormat(songData)
console.log(textFormat)
```
```text
[C]song lyric.
```

### Strip Scl
Remove Tag chord and element name of SCL.
```js
//...
const strippedScl = manager.stripScl(stringScl)
console.log(strippedScl)
```
```text
song lyric.
```

### Transpose Up
Transpose up from chord C
```js
//...
manager.transposeUp(songData)
console.log(songData)
```
```json
[
  {
    "type": 2,
    "contents": [
      {
        "chords": [
          {"root": "C", "symbol": "#"}
        ],
        "lyric": "song lyric."
      }
    ]
  }
]
```

### Transpose Down
Transpose down from chord C
```js
//...
manager.transposeDown(songData)
console.log(songData)
```
```json
[
  {
    "type": 2,
    "contents": [
      {
        "chords": [
          {"root": "B"}
        ],
        "lyric": "song lyric."
      }
    ]
  }
]
```

### Transpose 2 Step
Transpose 2 from chord C
```js
manager.transpose(songData, 2)
console.log(songData)
```
```json
[
  {
    "type": 2,
    "contents": [
      {
        "chords": [
          {"root": "D"}
        ],
        "lyric": "song lyric."
      }
    ]
  }
]
```

### Transpose -2 Step
Transpose -2 from chord C
```js
//...
manager.transpose(songData, -2)
console.log(songData)
```
```json
[
  {
    "type": 2,
    "contents": [
      {
        "chords": [
          {"root": "A", "symbol": "#"}
        ],
        "lyric": "song lyric."
      }
    ]
  }
]
```

## Chord Data
From the chord tag [C#m/G#], we'll get chord data like this.
```json
{
    "root": "C",
    "symbol": "#",
    "type": "m",
    "slashRoot": "G",
    "slashSymbol": "#"
}
```

## Type in SongData
Type is always number value:
- 1 as SONG_ELEMENT_NAME
- 2 as SONG_PARAGRAPH
- 3 as SONG_NEW_LINE

## Full Example
```text
{Intro}
[A][Bm][C#]

[A]This is a [B-C-D]lyric of [C/G]song.
```
```json
[
  {
    "type": 1,
    "contents": "Intro"
  },
  {
    "type": 2,
    "contents": [
      {
        "chords": [
          {"root": "A"}
        ],
        "lyric": null
      },
      {
        "chords": [
          {"root": "B", "type": "m"}
        ],
        "lyric": null
      },
      {
        "chords": [
          {"root": "C", "symbol": "#"}
        ],
        "lyric": null
      }
    ]
  },
  {
    "type": 3,
    "contents": null
  },
  {
    "type": 2,
    "contents": [
      {
        "chords": [
          {"root": "A"}
        ],
        "lyric": "This is a "
      },
      {
        "chords": [
          {"root": "B"},
          {"root": "C"},
          {"root": "D"}
        ],
        "lyric": "lyric of "
      },
      {
        "chords": [
          {"root": "C", "slashRoot": "G"}
        ],
        "lyric": "song."
      }
    ]
  }
]
```

## License
[MIT](https://opensource.org/licenses/MIT)