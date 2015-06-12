var glslify = require('glslify');

function setupTexture( mesh, scene, material ) {
	
	var img = new Image();
	var texture = new THREE.Texture( img );
	img.src = 'assets/images/cloud1024.png';
	
	$('body').append(img);
	
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;

	$(img).on('load', function() {
		material.needsUpdate = true;
		texture.needsUpdate = true;
	});
	
	scene.add( mesh );
	
	return texture;
	
}

var Clouds = function( poem, properties ) {

	var config = _.extend({
		width		: 500,
		offset		: new THREE.Vector2(1,1),
		color		: new THREE.Vector4( 0.5, 1.0, 0.7, 1 ),
		height		: -200,
		rotation	: Math.PI / 2
	}, properties);
	
	var geometry = new THREE.PlaneGeometry(	config.width, config.width );
	
	var material = new THREE.ShaderMaterial({
	
		vertexShader:    glslify('./clouds.vert'),
		fragmentShader:  glslify('./clouds.frag'),
		
		transparent: true,
		blending:    THREE.AdditiveBlending,
		side:        THREE.DoubleSide,
		depthTest:   false,
	
		uniforms: {
			time:	 	{ type: "f", value:0 },
			texture:	{ type: "t", value: null },
			offset:		{ type: "v2", value: config.offset },
			color: 		{ type: "v4", value: config.color }
		},
		attributes: {}
	})
	
	var mesh = new THREE.Mesh( geometry, material );
	
	mesh.rotation.x = config.rotation;
	mesh.position.y = config.height;
	mesh.scale.multiplyScalar( 10 );
	
	material.uniforms.texture.value = setupTexture( mesh, poem.scene, material );
	
	poem.emitter.on('update', function( e ) {
		var cameraPosition = poem.camera.object.position;
		material.uniforms.time.value = e.elapsed;
		mesh.position.set(
			cameraPosition.x,
			mesh.position.y,
			cameraPosition.z			
		);
	});
};

module.exports = Clouds;
