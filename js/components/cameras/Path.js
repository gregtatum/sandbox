var internals = {

	//TODO compute from exposed rotation euler angle

	getXRotation : (function() {
	
		var v = new THREE.Vector3()
	
		return function( quat ) {
			v.set(0,0,1)
			v.applyQuaternion( quat )
			return -Math.atan2( v.y, v.z )
		}
	})(),

	getYRotation : (function() {
	
		var v = new THREE.Vector3()
	
		return function( quat ) {
			v.set(1,0,0)
			v.applyQuaternion( quat )
			return -Math.atan2( v.z, v.x )
		}
	})(),

	getZRotation : (function() {
	
		var v = new THREE.Vector3()
	
		return function( quat ) {
			v.set(0,1,0)
			v.applyQuaternion( quat )
			return -Math.atan2( v.x, v.y )
		}
	})(),

	mouseMove : function( prevXY, quaternion, speedX, speedY ) {
	
		var axisX = new THREE.Vector3(1,0,0)
		var axisY = new THREE.Vector3(0,1,0)
	
		var q1 = new THREE.Quaternion()
		var q2 = new THREE.Quaternion()
	
		var rotationX = 0
		var rotationY = 0
	
		return function( e ) {
		
			e.preventDefault()
			
			var x = e.pageX
			var y = e.pageY
		
			var offsetX = prevXY.x - x
			var offsetY = prevXY.y - y
			
			rotationX = internals.getXRotation( quaternion )
			rotationY = internals.getYRotation( quaternion )
			
			rotationY += offsetX * speedX
			rotationX += offsetY * speedY
		
			rotationX = Math.min( rotationX, Math.PI * 0.45 )
			rotationX = Math.max( rotationX, -Math.PI * 0.45 )
		
			q1.setFromAxisAngle( axisY, rotationY )
			q2.setFromAxisAngle( axisX, rotationX )
			quaternion.multiplyQuaternions( q1, q2 )
		
			prevXY.x = x
			prevXY.y = y
		}
	},

	mouseUp : function( $canvas, handlers ) {

		return function() {
			$canvas.off('mouseleave', handlers.mouseUp)
			$canvas.off('mouseup', handlers.mouseUp)
			$canvas.off('mousemove', handlers.mouseMove)
		}
	},

	mouseDown : function( $canvas, handlers, prevXY ) {

		return function( e ) {
			e.preventDefault()
		
			prevXY.x = e.pageX
			prevXY.y = e.pageY
		
			$canvas.on('mouseleave', handlers.mouseUp )
			$canvas.on('mouseup', handlers.mouseUp )
			$canvas.on('mousemove', handlers.mouseMove )
		}
	},

	stopHandlers : function( $canvas, handlers ) {

		return function() {
			$canvas.off('mouseleave', handlers.mouseUp)
			$canvas.off('mouseup', handlers.mouseUp)
			$canvas.off('mousemove', handlers.mouseMove)
			$canvas.off('mousedown', handlers.mouseDown)
		}
	},

	startMouseHandlers : function( canvas, cameraObj, poem, speedX, speedY ) {
	
		var prevXY = {x:0,y:0}
		var $canvas = $(canvas)
		var handlers = {}	
		var quaternion = new THREE.Quaternion().copy( cameraObj.quaternion )
	
		handlers.mouseMove = internals.mouseMove( prevXY, quaternion, speedX, speedY )
		handlers.mouseUp = internals.mouseUp( $canvas, handlers )
		handlers.mouseDown = internals.mouseDown( $canvas, handlers, prevXY )
	
		$canvas.on('mousedown', handlers.mouseDown)
		poem.emitter.on('destroy', internals.stopHandlers( $canvas, handlers ) )
	
		return quaternion
	},

	updateCamera : function( cameraQuat, pathQuat, targetQuat, rotation, easing, revert ) {
	
		var easedQuat = new THREE.Quaternion()
	
		return function( e ) {
		
			pathQuat.setFromEuler( rotation )
			
			var dot = Math.max(0, THREE.Vector4.prototype.dot.call(pathQuat, targetQuat))
			
			easedQuat.copy( pathQuat ).slerp( targetQuat, dot )

			targetQuat.copy( easedQuat )
			cameraQuat.slerp( targetQuat, easing * e.unitDt )
		
		}
	}
}
//

module.exports = function PathCamera( poem, properties ) {
	
	var config = _.extend({
		easing      : 0.05,
		revertSpeed : 2,
		speedX      : 0.002,
		speedY      : 0.002
	}, properties)
	
	var rotation = new THREE.Euler()
	var pathQuaternion = new THREE.Quaternion()
	
	var targetQuaternion = internals.startMouseHandlers(
		poem.canvas,
		poem.camera.object,
		poem,
		config.speedX, config.speedY
	)
	
	poem.emitter.on('update', internals.updateCamera(
		poem.camera.object.quaternion,
		pathQuaternion,
		targetQuaternion,
		rotation,
		config.easing,
		config.revertSpeed
	))
	
	return {
		quaternion : pathQuaternion
	  , rotation : rotation
	}
}