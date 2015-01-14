var glslify = require('glslify');
var createShader = require('three-glslify')(THREE);

var Sky = function( poem, properties ) {
	
	var config = _.extend({
		
		width : 5000
		
	}, properties );
	
	var geometry = new THREE.SphereGeometry( config.width, 64, 30 );
	
	var shader = createShader( glslify({
		vertex: './sky.vert',
		fragment: './sky.frag',
		sourceOnly: true
	}));
	
	shader.side = THREE.BackSide;
	shader.uniforms = {
		time:	 { type: "f", value:0 },
	};
	
	var material = new THREE.ShaderMaterial( shader );
	material.transparent = true;
	material.depthTest = false;
	
	var mesh = new THREE.Mesh( geometry, material );
	poem.scene.add( mesh );
	
	poem.emitter.on('update', function( e ) {
		shader.uniforms.time.value = e.now;
		mesh.position.copy( poem.camera.object.position );
	});
};

module.exports = Sky;
