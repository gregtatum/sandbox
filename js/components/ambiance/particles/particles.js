var Glslify = require('glslify')
var LoadTexture	= require('../../../utils/loadTexture')
var Random = require('../../../utils/random')

var internals = {
	
	createMaterial : function( color, range ) {
		
		var material = new THREE.ShaderMaterial({
		
			vertexShader    : Glslify('./particles.vert'),
			fragmentShader  : Glslify('./particles.frag'),
			
			blending:       THREE.AdditiveBlending,
			depthTest:      false,
			transparent:    true,
		
			uniforms: {
				elapsed : { type: 'f' },
				texture : { type: 't' },
				color   : { type: "c", value: color },
				uRange  : { type: "f", value: range },
			},
			attributes      : {
				position: { type: 'v3' },
				size: { type: 'f' },
				aOffset: { type: 'f' },
			}
		})
		
		return material
	},
	
	createGeometry : function( material, count, range, sizeRange ) {
		
		var geometry = new THREE.BufferGeometry()

		var positions = new Float32Array( count * 3 )
		var sizes = new Float32Array( count )
		var offsets = new Float32Array( count )

		for( var i = 0; i < count; i++ ) {
			
			positions[ i * 3 + 0 ] = Random.range( -range, range )
			positions[ i * 3 + 1 ] = Random.range( -range, range ) * 0.3
			positions[ i * 3 + 2 ] = Random.range( -range, range )

			sizes[ i ] = Random.range( sizeRange[0], sizeRange[1] )
			offsets[ i ] = Random.range( 0, 1 )

		}
		
		geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) )
		geometry.addAttribute( 'size',     new THREE.BufferAttribute( sizes, 1 ) )
		geometry.addAttribute( 'aOffset',  new THREE.BufferAttribute( offsets, 1 ) )
		
		return geometry
	},
	
	createMeshAndStart : function( poem, geometry, material ) {
		
		var mesh = new THREE.PointCloud( geometry, material )
		mesh.frustumCulled = false

		var p = LoadTexture( "assets/images/bokeh.png", material.uniforms.texture, "value" ).then(function() {

			poem.scene.add( mesh )
			poem.emitter.on('update', internals.updateFn( poem, mesh ))
		})
		
		return mesh
	},
	
	updateFn : function( poem, mesh ) {
		
		return function(e) {
			
			// mesh.position.copy( poem.camera.object.position )
			mesh.material.uniforms.elapsed.value = e.elapsed;
		}
	}
}


module.exports = function particles( poem, properties ) {

	var config = _.extend({
		count:		3000
	  , color:		new THREE.Color(0x77ffff)
	  , range:		300
	  , sizeRange:	[3,8]
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