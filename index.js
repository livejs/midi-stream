var midi = require("midi");
var Through = require('through')

module.exports = function(name, index){
  var stream = Through(write, end)

  stream.close = stream.end

  var input = stream.inputPort = getInput(name, index)
  var output = stream.outputPort = getOutput(name, index)

  input.on('message', function(deltaTime, data){
    stream.queue(data)
  })

  function write(data){
    output.sendMessage(data)
    this.emit('send', data)
  }

  function end(){
    this.queue(null)
    input.closePort()
    output.closePort()
  }

  return stream
}

module.exports.openInput = function(name, index){
  var stream = Through(write, end)
  var input = stream.inputPort = getInput(name, index)

  input.on('message', function(deltaTime, data){
    stream.queue(data)
  })

  function end(){
    this.queue(null)
    input.closePort()
  }

  return stream
}

module.exports.openOutput = function(name, index){
  var stream = Through(write, end)
  var output = stream.outputPort = getOutput(name, index)

  function write(data){
    output.sendMessage(data)
    this.emit('send', data)
  }

  function end(){
    this.queue(null)
    output.closePort()
  }

  return stream
}

function getInput(name, index){
  index = index || 0
  var port = new midi.input()
  if (index === 'virtual'){
    port.openVirtualPort(name)
    return port
  } else {
    var count = port.getPortCount()
    for (var i=0;i < count;i++){
      if (port.getPortName(i) === name){
        if (index){
          index -= 1
        } else {
          port.openPort(i);
          return port;
        }
      }
    }
  }
  return null;
}

function getOutput(name, index){
  index = index || 0
  var port = new midi.output();
  if (index === 'virtual'){
    port.openVirtualPort(name)
    return port
  } else {
    var count = port.getPortCount()
    for (var i=0;i < count;i++){
      if (port.getPortName(i) === name){
        if (index){
          index -= 1
        } else {
          port.openPort(i);
          return port;
        }
      }
    }
  }

  return null;
}