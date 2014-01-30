midi-stream
===

Duplex stream wrapper around [midi](https://github.com/justinlatimer/node-midi) module.

Check out [web-midi](https://github.com/mmckegg/web-midi) for a browser version of the same API.

## Install

```bash
$ npm install web-midi
```

## Example

```js
var MidiStream = require('midi-stream')

var duplex = MidiStream('Launchpad', 0)

// clear lights
duplex.write([176, 0, 0])

// echo back the message to launchpad
duplex.pipe(duplex) 

// write buttons pressed to console
duplex.on('data', function(data){
  console.log(data)
})

// paint a face after 10 seconds :)
var faceCoords = [
  [1,1], [2,1], [5,1], [6,1],
  [1,2], [2,2], [5,2], [6,2],
  [2,4], [5,4],
  [2,5], [3,5], [4,5], [5,5]
]

setTimeout(function(){
  faceCoords.forEach(function(xy){
    var id = xy[1] * 16 + xy[0] // convert coords to midi note
    duplex.write([144, id, 60])
  })
}, 10000)

// wait 20 seconds then close the port
setTimeout(function(){
  duplex.end()
}, 20000)


///// bonus round, second launchpad! ////
var bonus = MidiStream('Launchpad', 1)
faceCoords.forEach(function(xy){
  var id = xy[1] * 16 + xy[0] // convert coords to midi note
  bonus.write([144, id, 60])
})
```