var Camera = function( poem, properties ) {
	
	this.poem = poem;
			
	this.object = new THREE.PerspectiveCamera(
		properties.fov || 50,					// fov
		window.innerWidth / window.innerHeight,	// aspect ratio
		properties.near || 3,					// near frustum
		properties.far || 1000					// far frustum
	);
	
	this.object.position.x = _.isNumber( properties.x ) ? properties.x : 0;
	this.object.position.y = _.isNumber( properties.y ) ? properties.y : 0;
	this.object.position.z = _.isNumber( properties.z ) ? properties.z : 500;
	
	this.poem.scene.add( this.object );
	
	this.poem.on( 'resize', this.resize.bind(this) );
	
};

module.exports = Camera;

Camera.prototype = {
	
	resize : function() {
		this.object.aspect = window.innerWidth / window.innerHeight;
		this.object.updateProjectionMatrix();
	}
};