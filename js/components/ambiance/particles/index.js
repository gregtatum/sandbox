var Glslify = require('glslify')
  , CreateShader = require('three-glslify')(THREE)
  , LoadTexture	= require('../../../utils/loadTexture')
  , Random = require('../../../utils/random')

var internals = {
	
	createMaterial : function( color, range ) {
		
		var shader = CreateShader( Glslify({
			vertex: './particles.vert',
			fragment: './particles.frag',
			sourceOnly: true
		}))
		
		var material = new THREE.ShaderMaterial( _.extend({

			uniforms: {				
				time:	 	{ type: "f", value:0 },
				range:	 	{ type: "f", value:range },
				texture:	{ type: "t", value:null },
				color:		{ type: "c", value:color }
			},
			
			attributes: {
				size:	{ type: 'f', value: null },
				offset:	{ type: 'v3', value: null }
			},

			blending:       THREE.AdditiveBlending,
			depthTest:      false,
			transparent:    true

		}, shader))
		
		return material
	},
	
	createGeometry : function( material, count, range, sizeRange ) {
		
		var geometry = new THREE.BufferGeometry()

		var offsets = new Float32Array( count * 3 )
		var sizes = new Float32Array( count )

		for( var i = 0; i < count; i++ ) {

			sizes[ i ] = sizeRange
			
			offsets[ i * 3 + 0 ] = Random.range( -range, range )
			offsets[ i * 3 + 1 ] = Random.range( -range, range )
			offsets[ i * 3 + 2 ] = Random.range( -range, range )

			sizes[ i ] = Random.range( -sizeRange, sizeRange )

		}
		
		geometry.addAttribute( 'offset', new THREE.BufferAttribute( offsets, 3 ) )
		geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) )
		
	},
	
	createMeshAndStart : function( poem, geometry, material ) {
		
		var mesh = new THREE.PointCloud( geometry, material )

		var p = LoadTexture( "assets/images/sinegravitycloud.png", material.uniforms.texture, "value" ).then(function() {

			poem.scene.add( mesh )
			poem.emitter.on('update', internals.updateFn( poem, mesh ))
		})
		
		return mesh
	},
	
	updateFn : function( poem, mesh ) {
		
		return function(e) {
			
			mesh.position.copy( poem.camera.object.position )
			mesh.material.uniforms.time.value = e.elapsed;
		}
	}
}


module.exports = function particles( poem, properties ) {
	
	var config = _.extend({
		count:		300
	  , color:		new THREE.Color(0xffffff)
	  , range:		100
	  , sizeRange:	[3,6]
	}, properties)
	
	var material = internals.createMaterial(
		config.color
	  , config.range
	)
	
	var geometry = internals.createGeometry(
		material
	  , config.count
	  , config.range
	  , config.sizeRange
	)
	
	var mesh = internals.createMeshAndStart(
		poem,
		geometry,
		material
	)
	
	return {}
}