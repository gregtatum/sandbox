var glslify = require('glslify');
var createShader = require('three-glslify')(THREE);

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
		scene.add( mesh );
	});
	
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
	
	var shader = createShader( glslify({
		vertex: './clouds.vert',
		fragment: './clouds.frag',
		sourceOnly: true
	}));
		
	shader.side = THREE.BackSide;
	shader.uniforms = {
		time:	 	{ type: "f", value:0 },
		texture:	{ type: "t", value: null },
		offset:		{ type: "v2", value: config.offset },
		color: 		{ type: "v4", value: config.color }
	};
	
	var material = new THREE.ShaderMaterial( shader );
	material.transparent = true;
	material.blending = THREE.AdditiveBlending;
	material.side = THREE.DoubleSide;
	material.depthTest = false;
	
	var mesh = new THREE.Mesh( geometry, material );
	
	mesh.rotation.x = config.rotation;
	mesh.position.y = config.height;
	mesh.scale.multiplyScalar( 10 );
	
	shader.uniforms.texture.value = setupTexture( mesh, poem.scene, material );
	
	poem.emitter.on('update', function( e ) {
		var cameraPosition = poem.camera.object.position;
		shader.uniforms.time.value = e.now;
		mesh.position.set(
			cameraPosition.x,
			mesh.position.y,
			cameraPosition.z			
		);
	});
};

module.exports = Clouds;
