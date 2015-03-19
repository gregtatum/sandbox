var Random = require('../utils/random');

var internals = {
	
	createMeshes : function( scene, geometry, material, config ) {
		
		var meshes = []
		
		for( var i=0; i < config.count; i++ ) {
		
			var mesh = new THREE.Mesh( geometry, material )
		
			mesh.position.x = Random.range( -config.dispersion, config.dispersion )
			mesh.position.y = Random.range( -config.dispersion, config.dispersion )
			mesh.position.z = Random.range( -config.dispersion, config.dispersion )
		
			scene.add( mesh )
			meshes.push( mesh )
		}
		
		return meshes
	},
	
	brownianMotionFn : function( meshes, dispersion ) {
		
		return function(e) {
			
			for( var i=0; i < meshes.length; i++ ) {
				
				meshes[i].position.x += Random.range( -0.0005, 0.0005 ) * dispersion * e.dt
				meshes[i].position.y += Random.range( -0.0005, 0.0005 ) * dispersion * e.dt
				meshes[i].position.z += Random.range( -0.0005, 0.0005 ) * dispersion * e.dt
			}
		}
	},
	
	raycastFn : function( meshes, mouse, camera ) {
		
		var raycaster = new THREE.Raycaster();
		var range = 30
		
		return function(e) {
			
			raycaster.setFromCamera( mouse, camera )
			
			for( var i = 0; i < meshes.length; i++ ) {
				
				var mesh = meshes[i]
				var distance = raycaster.ray.distanceToPoint( mesh.position )
				
				if( distance < range ) {
					mesh.position.y += 5 * (range - distance) / range
				}
			}
		}
	}
}

module.exports = function createSpheres( poem, properties ) {
	
	var config = _.extend({
		count : 10
	  , dispersion : 10
	  , radius : 1
	  , mouseRef : "mouse"
	}, properties)
	
	var geometry = new THREE.SphereGeometry( config.radius, 32, 32 )
	var material = new THREE.MeshBasicMaterial( { color : 0xff0000 } )
	var meshes = internals.createMeshes( poem.scene, geometry, material, config )
	
	var mouse = poem[config.mouseRef]

	poem.emitter.on( 'update', internals.brownianMotionFn(
		meshes,
		config.dispersion
	))
	
	poem.emitter.on( 'update', internals.raycastFn(
		meshes,
		mouse.normalizedPosition,
		poem.camera.object
	))
	
}