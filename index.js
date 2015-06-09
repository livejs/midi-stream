if (global.navigator && global.navigator.requestMIDIAccess) {
  module.exports = require('web-midi')
} else {
  module.exports = require('./node')
}