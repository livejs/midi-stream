var midi = require("midi");
var Through = require('through')

module.exports = function(name, opts){
  var stream = Through(write, end)

  stream.close = stream.end

  var input = stream.inputPort = getInput(name, opts)
  var output = stream.outputPort = getOutput(name, opts)

  if (!input || !output){
    stream.emit('error', new Error('No midi device found with name ' + name))
  }

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

module.exports.openInput = function(name, opts){
  var stream = Through(write, end)
  var input = stream.inputPort = getInput(name, opts)

  if (!input){
    stream.emit('error', new Error('No midi device found with name ' + name))
  }

  input.on('message', function(deltaTime, data){
    stream.queue(data)
  })

  function end(){
    this.queue(null)
    input.closePort()
  }

  return stream
}

module.exports.openOutput = function(name, opts){
  var stream = Through(write, end)
  var output = stream.outputPort = getOutput(name, opts)

  if (!output){
    stream.emit('error', new Error('No midi device found with name ' + name))
  }

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

module.exports.getPortNames = function(cb){
  var used = {}
  var names = {}

  try {
    var input = new midi.input()
    var count = input.getPortCount()
    for (var i=0;i < count;i++){
      var name = input.getPortName(i)
      if (used[name]){
        var i = used[name] += 1
        names[name + '/' + i] = true
      } else {
        used[name] = 1
        names[name] = true
      }
    }
    input.openPort(0)
    input.closePort()

    used = {}
    var output = new midi.output()
    var count = output.getPortCount()
    for (var i=0;i < count;i++){
      var name = output.getPortName(i)
      if (used[name]){
        var i = used[name] += 1
        names[name + '/' + i] = true
      } else {
        used[name] = 1
        names[name] = true
      }
    }
    output.openPort(0)
    output.closePort()
    cb&&cb(null, Object.keys(names))
  } catch (ex){
    cb&&cb(ex)
  }
}

function getInput(name, opts){
  if (typeof opts === 'number') opts = {index: opts}
  var index = opts && opts.index || 0
  var ignoreTiming = !opts || !opts.includeTiming
  var port = new midi.input()
  if (opts && opts.virtual){
    port.openVirtualPort(name)
    port.ignoreTypes(false, ignoreTiming, false)
    return port
  } else {
    var count = port.getPortCount()
    for (var i=0;i < count;i++){
      if (port.getPortName(i) === name){
        if (index){
          index -= 1
        } else {
          port.openPort(i);
          port.ignoreTypes(false, ignoreTiming, false)
          return port;
        }
      }
    }
  }
  return null;
}

function getOutput(name, opts){
  if (typeof opts === 'number') opts = {index: opts}
  var index = opts && opts.index || 0
  var port = new midi.output();
  if (opts && opts.virtual){
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