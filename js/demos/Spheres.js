var Random = require('../utils/random');

var internals = {
	
	createMeshes : function( scene, geometry, material, config ) {
		
		var meshes = []
		
		for( var i=0; i < config.count; i++ ) {
		
			var mesh = new THREE.Mesh( geometry, material )
		
			mesh.position.x = Random.range( -config.dispersion, config.dispersion )
			mesh.position.y = Random.range( -config.dispersion, config.dispersion )
			mesh.position.z = Random.range( -config.dispersion, config.dispersion )

			mesh.rotation.x = Random.range( -Math.PI, Math.PI )
			mesh.rotation.y = Random.range( -Math.PI, Math.PI )
			mesh.rotation.z = Random.range( -Math.PI, Math.PI )
			
			
			mesh.direction = new THREE.Vector3(
				Random.range( -1, 1 ),
				Random.range( -1, 1 ),
				Random.range( -1, 1 )
			)
			
			mesh.direction.normalize()

			if( i > 0 ) {
				mesh.target = meshes[i-1].position
			}
		
			scene.add( mesh )
			meshes.push( mesh )
		}
		
		meshes[0].target = meshes[ meshes.length - 1 ].position
		
		return meshes
	},
	
	physicsMotionFn : function( meshes, velocity, turnSpeed ) {
		
		var scratch = new THREE.Vector3()
		
		return function(e) {
			
			for( var i=0; i < meshes.length; i++ ) {
				
				var mesh = meshes[i]
				
				scratch.subVectors( mesh.target, mesh.position )
				scratch.normalize()
				
				mesh.direction.lerp( scratch, turnSpeed * e.unitDt )
				
				mesh.position.x += mesh.direction.x * velocity * e.unitDt
				mesh.position.y += mesh.direction.y * velocity * e.unitDt
				mesh.position.z += mesh.direction.z * velocity * e.unitDt
				
			}
		}
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
	  , velocity : 5
	  , turnSpeed : 0.05
	}, properties)
	
	var geometry = new THREE.TetrahedronGeometry( config.radius, 0 )
	var material = new THREE.MeshLambertMaterial( {
		color : 0x00cc33,
		shading : THREE.FlatShading,
		fog: false
	} )
	var meshes = internals.createMeshes( poem.scene, geometry, material, config )
	
	var mouse = poem[config.mouseRef]

	// poem.emitter.on( 'update', internals.brownianMotionFn(
	// 	meshes,
	// 	config.dispersion
	// ))

	poem.emitter.on( 'update', internals.physicsMotionFn(
		meshes,
		config.velocity,
		config.turnSpeed
		
	))
	
	poem.emitter.on( 'update', internals.raycastFn(
		meshes,
		mouse.normalizedPosition,
		poem.camera.object
	))
	
}