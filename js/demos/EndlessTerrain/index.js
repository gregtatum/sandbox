var glslify = require('glslify');
var createShader = require('three-glslify')(THREE);

function createGeometry( width, segments ) {
	
	var geometry = new THREE.PlaneGeometry( width, width, segments, segments );
	
	geometry.applyMatrix(
		new THREE.Matrix4().makeRotationX( Math.PI * 0.5 )
	);
	
	return geometry;
	
}

function createTexture( mesh, scene ) {
	
	var img = new Image();
	var texture = new THREE.Texture( img );
	img.src = 'assets/images/cloud1024.png';
	
	texture.wrapT = THREE.RepeatWrapping;
	texture.wrapS = THREE.RepeatWrapping;
	
	$(img).on('load', function() {
		texture.needsUpdate = true;
		scene.add( mesh );
	});
	
	return texture;
	
}

function updateShader() {
	
}

function createMeshGrid( material, width, gridLength, totalPolygonDensity ) {
	
	var geometry = createGeometry(
		width / gridLength,
		Math.floor( totalPolygonDensity / gridLength )
	);
	
	var meshGrid = new THREE.Object3D();
	
	var mesh;
	var step = width / gridLength;
	
	for( var i=0; i < gridLength; i++ ) {
		for( var j=0; j < gridLength; j++ ) {
			
			mesh = new THREE.Mesh( geometry, material );
			meshGrid.add( mesh );
			mesh.position.set(
				i * step,
				0,
				j * step
			);
		}
	}
	
	return meshGrid;
}

function updateModuloMeshGrid( cameraPosition, meshes, width ) {
	
	var il = meshes.length;
	var halfWidth = width / 2;
	
	return function() {
		
		var position;
		
		for( var i=0; i < il; i++ ) {
			
			position = meshes[i].position;
	
			position.set(
				( ( position.x - cameraPosition.x + halfWidth ) % width ) + cameraPosition.x - halfWidth,
				position.y,
				( ( position.z - cameraPosition.z + halfWidth ) % width ) + cameraPosition.z - halfWidth
			);
			
		}
		
	};
}

var EndlessTerrain = function( poem, properties ) {
	
	var config = _.extend({
		width				: 4000,
		gridLength			: 16,
		totalPolygonDensity	: 1024,
		positionY			: 0
	}, properties);
	
	var shader = createShader( glslify({
		vertex		: './endless.vert',
		fragment	: './endless.frag',
		sourceOnly	: true
	}));
	
	var material = new THREE.ShaderMaterial( shader );
	material.side = THREE.DoubleSide;
	
	var meshGrid = createMeshGrid(
		material,
		config.width,
		config.gridLength,
		config.totalPolygonDensity
	);
	
	meshGrid.position.y = config.positionY;
	
	shader.uniforms.terrain.value = createTexture( meshGrid, poem.scene );
	shader.uniforms.heightScale.value = config.width / 20;
	shader.uniforms.width.value = config.width / 2;
	
	poem.on( 'update', updateModuloMeshGrid(
		poem.camera.object.position,
		meshGrid.children,
		config.width
	));
	
};

module.exports = EndlessTerrain;