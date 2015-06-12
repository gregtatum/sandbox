var glslify = require('glslify');

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
			mesh.frustumCulled = false
			
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

function updateModuloMeshGrid( cameraPosition, meshes, width, state ) {
	
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
		heightScale			: 200,
		gridLength			: 16,
		totalPolygonDensity	: 1024,
		positionY			: 0,
		height				: 1
	}, properties);
	
	var state = {
		height : config.height
	}
	
	var material = new THREE.ShaderMaterial({
		
		vertexShader    : glslify('./endless.vert'),
		fragmentShader  : glslify('./endless.frag'),
		side            : THREE.DoubleSide,
		
		uniforms        : {
			terrain         : { type: 't' },
			heightFactor    : { type: 'f' },
			width           : { type: 'f' },
		},
		attributes      : {}

	})
	
	material.side = THREE.DoubleSide;
	
	var meshGrid = createMeshGrid(
		material,
		config.width,
		config.gridLength,
		config.totalPolygonDensity
	);
	
	meshGrid.position.y = config.positionY;
	
	material.uniforms.terrain.value = createTexture( meshGrid, poem.scene );
	material.uniforms.width.value = config.width / 2;
	material.uniforms.height = state.height
	
	poem.emitter.on( 'update', function() {
		material.uniforms.heightFactor.value = state.height
	})
	
	poem.emitter.on( 'update', updateModuloMeshGrid(
		poem.camera.object.position,
		meshGrid.children,
		config.width,
		state
	));
	
	return state
};

module.exports = EndlessTerrain;