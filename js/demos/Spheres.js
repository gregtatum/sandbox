var random = require('../utils/random');

var Spheres = function(poem, properties) {
	
	this.poem = poem;

	this.count = properties.count > 0 ? properties.count : 10;
	this.dispersion = properties.dispersion || 10;
	this.radius = properties.radius > 0 ? properties.radius : 1;
	
	this.geometry = new THREE.SphereGeometry( this.radius, 32, 32 );
	this.material = new THREE.MeshBasicMaterial( { color : 0xff0000 } );
	

	this.meshes = [];
	
	var i= -1; while( ++i < properties.count ) {
		
		var mesh = new THREE.Mesh( this.geometry, this.material );
		
		mesh.position.x = random.range( -this.dispersion, this.dispersion );
		mesh.position.y = random.range( -this.dispersion, this.dispersion );
		mesh.position.z = random.range( -this.dispersion, this.dispersion );
		
		this.poem.scene.add( mesh );
		this.meshes.push( mesh );
	}
	
	this.poem.on( 'update', this.update.bind(this) );
	
};

module.exports = Spheres;

Spheres.prototype = {
	
	update : function(e) {
		
		var i= -1; while( ++i < this.count ) {
		
			this.meshes[i].position.x += random.range( -0.0005, 0.0005 ) * this.dispersion * e.dt;
			this.meshes[i].position.y += random.range( -0.0005, 0.0005 ) * this.dispersion * e.dt;
			this.meshes[i].position.z += random.range( -0.0005, 0.0005 ) * this.dispersion * e.dt;
		
		}
		
	}
	
};