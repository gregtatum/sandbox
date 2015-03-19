var Random = require('../utils/random')
  , lerp = require('lerp')

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
			
			// mesh.velocity = Random.range( config.velocity * 0.6, config.velocity * 1 )
			mesh.velocity = config.velocity
			
			mesh.flee = 1
			
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
	
	physicsMotionFn : function( meshes, config ) {
		
		var targetDiff = new THREE.Vector3()
		
		return function(e) {
			
			for( var i=0; i < meshes.length; i++ ) {
				
				var mesh = meshes[i]
				
				targetDiff.subVectors( mesh.target, mesh.position )
				targetDiff.normalize()
				
				mesh.direction.lerp( targetDiff, config.turnSpeed * e.unitDt )

				mesh.flee = lerp( mesh.flee, 1, config.fleeSlowdown )
				
				mesh.position.x += mesh.direction.x * mesh.velocity * mesh.flee * e.unitDt
				mesh.position.y += mesh.direction.y * mesh.velocity * mesh.flee * e.unitDt
				mesh.position.z += mesh.direction.z * mesh.velocity * mesh.flee * e.unitDt
				
				
				// if( Math.random() > 0.98 ) {
				// 	mesh.target = _.sample( meshes ).position
				// }
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
	
	raycastFn : function( meshes, mouse, camera, config ) {
		
		var raycaster = new THREE.Raycaster();
		var range = 30
		
		return function(e) {
			
			raycaster.setFromCamera( mouse, camera )
			
			for( var i = 0; i < meshes.length; i++ ) {
				
				var mesh = meshes[i]
				var distance = raycaster.ray.distanceToPoint( mesh.position )
				
				if( distance < config.mouseRange ) {
					mesh.flee += config.fleeSpeed * (config.mouseRange - distance) / config.mouseRange
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
	  , turnSpeed : 0.025
	  , fleeSlowdown : 0.1
	  , mouseRange : 50
	  , fleeSpeed : 1
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

	poem.emitter.on( 'update', internals.physicsMotionFn( meshes, config ))
	
	poem.emitter.on( 'update', internals.raycastFn(
		meshes,
		mouse.normalizedPosition,
		poem.camera.object,
		config
	))
	
}