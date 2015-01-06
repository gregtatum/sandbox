function updateCamera( camera ) {

	return function(e) {
		camera.object.position.z -= 1;
	};
}

function mouseMove( prevXY, cameraObj ) {
	
	var axisX = new THREE.Vector3(1,0,0);
	var axisY = new THREE.Vector3(0,1,0);
	
	var q1 = new THREE.Quaternion();
	var q2 = new THREE.Quaternion();
	
	var rotationX = 0;
	var rotationY = 0;
	
	return function( e ) {
		
		e.preventDefault();
			
		var x = e.pageX;
		var y = e.pageY;
		
		var offsetX = prevXY.x - x;
		var offsetY = prevXY.y - y;
			
		rotationY += offsetX * 0.005;
		rotationX += offsetY * 0.005;
		
		if( window.foo ) debugger;
		
		rotationX = Math.min( rotationX, Math.PI * 0.45 );
		rotationX = Math.max( rotationX, -Math.PI * 0.45 );
		
		
		q1.setFromAxisAngle( axisY, rotationY );
		q2.setFromAxisAngle( axisX, rotationX );
		cameraObj.quaternion.multiplyQuaternions( q1, q2 );
		
		
		prevXY.x = x;
		prevXY.y = y;
		
	};
}

function mouseUp( $canvas, handlers ) {

	return function() {
		$canvas.off('mouseleave', handlers.mouseUp);
		$canvas.off('mouseup', handlers.mouseUp);
		$canvas.off('mousemove', handlers.mouseMove);
	};
}

function mouseDown( $canvas, handlers, prevXY ) {

	return function( e ) {
		e.preventDefault();
		
		prevXY.x = e.pageX;
		prevXY.y = e.pageY;
		
		$canvas.on('mouseleave', handlers.mouseUp );
		$canvas.on('mouseup', handlers.mouseUp );
		$canvas.on('mousemove', handlers.mouseMove );
	};
}

function stopHandlers( $canvas, handlers ) {

	return function() {
		$canvas.off('mouseleave', handlers.mouseUp);
		$canvas.off('mouseup', handlers.mouseUp);
		$canvas.off('mousemove', handlers.mouseMove);
		$canvas.off('mousedown', handlers.mouseDown);
	};
}

function startHandlers( canvas, cameraObj, poem ) {
	
	var prevXY = {x:0,y:0};
	var $canvas = $(canvas);
	var handlers = {};	
	
	handlers.mouseMove = mouseMove( prevXY, cameraObj );
	handlers.mouseUp = mouseUp( $canvas, handlers );
	handlers.mouseDown = mouseDown( $canvas, handlers, prevXY );
	
	$canvas.on('mousedown', handlers.mouseDown);
	poem.on('destroy', stopHandlers( $canvas, handlers ) );
}

var EndlessCamera = function( poem ) {
	
	poem.on('update', updateCamera( poem.camera ));
	startHandlers( poem.canvas, poem.camera.object, poem );
};

module.exports = EndlessCamera;