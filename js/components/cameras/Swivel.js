function mouseMove( prevXY, quaternion, speedX, speedY ) {
	
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
			
		rotationY += offsetX * speedX;
		rotationX += offsetY * speedY;
		
		rotationX = Math.min( rotationX, Math.PI * 0.45 );
		rotationX = Math.max( rotationX, -Math.PI * 0.45 );
		
		q1.setFromAxisAngle( axisY, rotationY );
		q2.setFromAxisAngle( axisX, rotationX );
		quaternion.multiplyQuaternions( q1, q2 );
		
		
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

function startMouseHandlers( canvas, cameraObj, poem, speedX, speedY ) {
	
	var prevXY = {x:0,y:0};
	var $canvas = $(canvas);
	var handlers = {};	
	var quaternion = new THREE.Quaternion().copy( cameraObj.quaternion );
	
	handlers.mouseMove = mouseMove( prevXY, quaternion, speedX, speedY );
	handlers.mouseUp = mouseUp( $canvas, handlers );
	handlers.mouseDown = mouseDown( $canvas, handlers, prevXY );
	
	$canvas.on('mousedown', handlers.mouseDown);
	poem.emitter.on('destroy', stopHandlers( $canvas, handlers ) );
	
	return quaternion;
}

function updateCamera( cameraQuaternion, targetQuaternion, unitI ) {
	
	return function( e ) {
		
		cameraQuaternion.slerp( targetQuaternion, unitI * e.unitDt );
		
	};
}

var Swivel = function( poem, properties ) {
	
	var config = _.extend({
		easing : 0.5,
		speedX : 0.002,
		speedY : 0.002
	}, properties);
	
	var targetQuaternion = startMouseHandlers(
		poem.canvas,
		poem.camera.object,
		poem,
		config.speedX, config.speedY
	);
	
	poem.emitter.on('update', updateCamera( poem.camera.object.quaternion, targetQuaternion, config.easing ) );
	
};

module.exports = Swivel;