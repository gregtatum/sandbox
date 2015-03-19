var Touches = require('touches')
var EventEmitter = require('events').EventEmitter

module.exports = function createMouseTracker( poem, config ) {
	
	var position = {
		x : null
	  , y : null
	}
	
	var emitter = Touches( poem.canvas, { filtered: true })
	
		.on('start', function(e, position) {
			e.preventDefault()
			position.x = position[0]
			position.y = position[1]
		})
		
		.on('move', function(e, position) {
			e.preventDefault()
			position.x = position[0]
			position.y = position[1]			
		})
		
		.on('end', function(e) {
			position.x = null
			position.y = null
		})
	
	poem.on('destroy', function() {
		emitter.disable()
	})
	
	return {
		emitter : emitter
	  , position : position
	}
}