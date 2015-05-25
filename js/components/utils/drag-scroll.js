var Lerp = require('lerp')

function _getWheelEventName() {
	
	if( "onwheel" in document.createElement("div") ) {
		return "wheel" 
	} else if( document.onmousewheel !== undefined ) {
		return "mousewheel"
	} else {
		return "DOMMouseScroll"
	}
}

module.exports = function dragScroll( poem, properties ) {
	
	var config = _.extend({
		distance : 0.1,
		resetSpeed : 0.05,
		center : poem.camera.object.position.clone()
	}, properties)

	var current = {
		center : config.center.clone()
	}
	
	poem.canvas.addEventListener( _getWheelEventName(), function handleMouseWheel(e) {
		current.center.y += config.distance * -e.deltaY
		current.center.x += config.distance * e.deltaX * 5
		
	}, false );
	
	poem.emitter.on('update', function updateDragScroll() {
		current.center.y = Lerp(
			current.center.y,
			config.center.y,
			config.resetSpeed
		)
		current.center.x = Lerp(
			current.center.x,
			config.center.x,
			config.resetSpeed
		)
		current.center.z = Lerp(
			current.center.z,
			config.center.z,
			config.resetSpeed
		)
		
		poem.camera.object.position.copy( current.center )
	})
}