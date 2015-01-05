function updateCamera( camera ) {

	return function(e) {
		camera.object.position.z -= 1;
	};
}

function mouseDown( canvas, cameraObj, poem ) {
	
	var px, py;

	var $canvas = $(canvas);
	
	var dragMouseHandler = function( e ) {

		e.preventDefault();
				
		var x = e.pageX;
		var y = e.pageY;
	
		var offsetX = px - x;
		var offsetY = py - y;
	
		cameraObj.rotation.y += offsetX * 0.005;
		cameraObj.rotation.x += offsetY * 0.005;
				
		px = x;
		py = y;
	};
	
	var mouseUpHandler = function() {
		$canvas.off('mouseup', mouseUpHandler);
		$canvas.off('mousemove', dragMouseHandler);
	};
		
	var mouseDownHandler = function( e ) {
		
		e.preventDefault();
		
		px = e.pageX;
		py = e.pageY;
		
		$canvas.on('mouseup', mouseUpHandler);
		$canvas.on('mousemove', dragMouseHandler);
	};
	
	$canvas.on('mousedown', mouseDownHandler);
	
	poem.on('destroy', function() {
		$canvas.off('mouseup', mouseUpHandler);
		$canvas.off('mousemove', dragMouseHandler);
		$canvas.off('mousedown', mouseDownHandler);
	});
}

var EndlessCamera = function( poem ) {
	
	poem.on('update', updateCamera( poem.camera ));
	
	mouseDown( poem.canvas, poem.camera.object, poem );
};

module.exports = EndlessCamera;