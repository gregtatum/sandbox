var glslify = require('glslify');

var Sky = function( poem, properties ) {
	
	var config = _.extend({
		
		width : 5000
		
	}, properties );
	
	var geometry = new THREE.SphereGeometry( config.width, 64, 30 );
	
	var material = new THREE.ShaderMaterial({
	
		vertexShader    : glslify('./sky.vert'),
		fragmentShader  : glslify('./sky.frag'),
		
		side : THREE.BackSide,
		transparent : true,
		depthTest : false,
		
		uniforms: {
			time:	 { type: "f", value:0 },
		},
		attributes: {}
	})
	
	var mesh = new THREE.Mesh( geometry, material );
	poem.scene.add( mesh );
	
	poem.emitter.on('update', function( e ) {
		material.uniforms.time.value = e.elapsed;
		mesh.position.copy( poem.camera.object.position );
	});
};

module.exports = Sky;
