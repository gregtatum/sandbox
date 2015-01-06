function updateCamera( camera ) {

	return function(e) {
		camera.object.position.z -= 1;
	};
}

function mouseDown( canvas, cameraObj, poem ) {
	
	window.cameraObj = cameraObj;
	
	var px, py;

	var $canvas = $(canvas);
	
	var dragMouseHandler = (function() {
		
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
			
			var offsetX = px - x;
			var offsetY = py - y;
				
			rotationY += offsetX * 0.005;
			rotationX += offsetY * 0.005;
			
			if( window.foo ) debugger;
			
			rotationX = Math.min( rotationX, Math.PI * 0.45 );
			rotationX = Math.max( rotationX, -Math.PI * 0.45 );
			
			
			q1.setFromAxisAngle( axisY, rotationY );
			q2.setFromAxisAngle( axisX, rotationX );
			cameraObj.quaternion.multiplyQuaternions( q1, q2 );
			
			
			px = x;
			py = y;
		
		};
		
	})();
	
	var mouseUpHandler = function() {
		$canvas.off('mouseleave', mouseUpHandler);
		$canvas.off('mouseup', mouseUpHandler);
		$canvas.off('mousemove', dragMouseHandler);
	};
		
	var mouseDownHandler = function( e ) {
		
		e.preventDefault();
		
		px = e.pageX;
		py = e.pageY;
		
		$canvas.on('mouseleave', mouseUpHandler);
		$canvas.on('mouseup', mouseUpHandler);
		$canvas.on('mousemove', dragMouseHandler);
	};
	
	$canvas.on('mousedown', mouseDownHandler);
	
	poem.on('destroy', function() {
		$canvas.off('mouseleave', mouseUpHandler);
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