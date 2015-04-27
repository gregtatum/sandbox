var internals = {

	getXRotation : (function() {
	
		var v = new THREE.Vector3()
	
		return function( quat, baseQuatInverse ) {
			v.set(0,0,1)
			v.applyQuaternion( quat )
			if( baseQuatInverse ) v.applyQuaternion( baseQuatInverse )
			return -Math.atan2( v.y, v.z )
		}
	})(),

	getYRotation : (function() {
	
		var v = new THREE.Vector3()
	
		return function( quat, baseQuatInverse ) {
			v.set(1,0,0)
			v.applyQuaternion( quat )
			if( baseQuatInverse ) v.applyQuaternion( baseQuatInverse )
			return -Math.atan2( v.z, v.x )
		}
	})(),

	getZRotation : (function() {
	
		var v = new THREE.Vector3()
	
		return function( quat, baseQuatInverse ) {
			v.set(0,1,0)
			v.applyQuaternion( quat )
			if( baseQuatInverse ) v.applyQuaternion( baseQuatInverse )
			return -Math.atan2( v.x, v.y )
		}
	})(),

	mouseMove : function( poem, prevXY, state, speedX, speedY ) {
			
		return function( e ) {
			e.preventDefault()
			
			var x = e.pageX
			var y = e.pageY
		
			var offsetX = prevXY.x - x
			var offsetY = prevXY.y - y
			
			state.mouseRotation.y += offsetX * speedX / (poem.canvas.width / poem.ratio)
			state.mouseRotation.x += offsetY * speedY / (poem.canvas.height / poem.ratio)
			
			if( offsetX * speedX / (poem.canvas.width / poem.ratio) > 1 ) debugger
			if( offsetX * speedX / (poem.canvas.width / poem.ratio) < -1 ) debugger
			
			prevXY.x = x
			prevXY.y = y
		}
	},
	
	updateMouseQuaternion : (function() {
		
		var axisX = new THREE.Vector3(1,0,0)
		var axisY = new THREE.Vector3(0,1,0)
	
		var q1 = new THREE.Quaternion()
		var q2 = new THREE.Quaternion()
		
		return function( state, e ) {
			
			q1.setFromAxisAngle( axisY, state.mouseRotation.y )
			q2.setFromAxisAngle( axisX, state.mouseRotation.x )
			
			state.mouseQuaternion.copy( state.pathQuaternion )
			state.mouseQuaternion.multiply( q1 )
			state.mouseQuaternion.multiply( q2 )
			
			state.mouseRotation.multiplyScalar( 0.95 * Math.min(1, e.unitDt) )
			
		}
	})(),

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

	startMouseHandlers : function( poem, cameraObj, state, speedX, speedY ) {
	
		var prevXY = {x:0,y:0}
		var $canvas = $(poem.canvas)
		var handlers = {}	
		var mouseQuaternion = state.mouseQuaternion.copy( cameraObj.quaternion )
	
		handlers.mouseMove = internals.mouseMove( poem, prevXY, state, speedX, speedY )
		handlers.mouseUp = internals.mouseUp( $canvas, handlers )
		handlers.mouseDown = internals.mouseDown( $canvas, handlers, prevXY )
	
		$canvas.on('mousedown', handlers.mouseDown)
		poem.emitter.on('destroy', internals.stopHandlers( $canvas, handlers ) )
	},

	updateCameraFn : function( state, easing, revert ) {
	
		var easedQuat   = new THREE.Quaternion()
		var cameraQuat  = state.cameraQuaternion
		var pathQuat    = state.pathQuaternion
		var mouseQuat   = state.mouseQuaternion
		var rotation    = state.rotation
			
		return function( e ) {
		
			//Feed the euler angle rotation into the path quat
			pathQuat.setFromEuler( rotation )
			
			internals.updateMouseQuaternion( state, e )
			
			//Figure out the distance between the path and mouse quat
			var dot = Math.max(0, THREE.Vector4.prototype.dot.call(pathQuat, mouseQuat))
			
			//Ease the mouse quat down to the path quat the further apart they are
			easedQuat.copy( pathQuat ).slerp( mouseQuat, dot )

			mouseQuat.copy( easedQuat )
			
			cameraQuat.slerp( easedQuat, easing * e.unitDt )
		
		}
	},
	
	rotateAll : function( state, xyz ) {
		console.log('hello')
		state.mouseRotation.set(0,0,0)
		state.rotation.setFromVector3( xyz )
		state.cameraQuaternion.setFromEuler( state.rotation )
		state.pathQuaternion.copy( state.cameraQuaternion )
		state.mouseQuaternion.copy( state.cameraQuaternion )
	}
}
//

module.exports = function RestrictedCamera( poem, properties ) {
	
	var config = _.extend({
		easing      : 0.05,
		revertSpeed : 2,
		speedX      : 1,
		speedY      : 0.5
	}, properties)
	
	var state = {
		rotation : new THREE.Euler(0,0,0,'ZYX')
	  , mouseRotation : new THREE.Vector3()
	  , pathQuaternion : new THREE.Quaternion()
	  , mouseQuaternion : new THREE.Quaternion()
	  , cameraQuaternion : poem.camera.object.quaternion
	}
	
	internals.startMouseHandlers(
		poem
	  , poem.camera.object
	  , state
	  , config.speedX, config.speedY
	)
	
	poem.emitter.on('update', internals.updateCameraFn(
		state
	  , config.easing
	  , config.revertSpeed
	))
	
	return {
		pathQuaternion    : state.pathQuaternion
	  , mouseQuaternion   : state.mouseQuaternion
	  , rotation          : state.rotation
	  , rotateAll       : _.partial( internals.rotateAll, state )
	}
}