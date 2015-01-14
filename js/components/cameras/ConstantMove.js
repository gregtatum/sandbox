function updateCamera( position, movement ) {

	var changeMovement = new THREE.Vector3();

	return function(e) {
		
		changeMovement
			.copy( movement )
			.multiplyScalar(e.unitDt);
		
		position.add( changeMovement );
		
	};
}

var ConstantMove = function( poem, properties ) {
	
	var config = _.extend({
		x : 0,
		y : 0,
		z : 0
	}, properties);
	
	var movement = new THREE.Vector3( config.x, config.y, config.z );
	
	poem.emitter.on('update', updateCamera( poem.camera.object.position, movement));
};

module.exports = ConstantMove;