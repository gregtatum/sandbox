var poemMute = require('poem-mute');
var mute = poemMute();
window.mutePrime = mute;
window.mutePrimeEmitter = mute.emitter;

//Turn on a poem muter
module.exports = mute;