var Glslify = require('glslify')
var LoadTexture	= require('../../../utils/loadTexture')
var Random = require('../../../utils/random')
var Lerp = require('lerp')
	
function _createMaterial( color ) {
	
	var material = new THREE.ShaderMaterial({
		
		vertexShader    : Glslify('./light-beam.vert'),
		fragmentShader  : Glslify('./light-beam.frag'),
		
		depthTest       : false,
		blending       : THREE.AdditiveBlending,
		transparent     : true,
		
		uniforms: {
			elapsed : { type: 'f' },
			texture : { type: 't' },
			color : { type: 'c', value: new THREE.Color(color) },
		},
		
		attributes: {
			size : { type: 'f', value: [] },
			opacity : { type: 'f', value: [] }
		}

	})
	
	
	return material
}

function _createGeometry( config, ratio ) {

	var geometry  = new THREE.BufferGeometry()
	
	var positions = new Float32Array( config.segmentsCount * 3 )
	var sizes     = new Float32Array( config.segmentsCount )
	var opacity   = new Float32Array( config.segmentsCount )

	for( var i = 0; i < config.segmentsCount; i++ ) {
		
		let unitI = i / config.segmentsCount

		positions[ i * 3 + 0 ] = 0
		positions[ i * 3 + 1 ] = unitI * config.lightLength
		positions[ i * 3 + 2 ] = 0

		sizes[i]   = 10 * ratio
		
		opacity[i] = config.brightness * Math.pow( (1 - unitI), config.falloff )

	}
	
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) )
	geometry.addAttribute( 'size',     new THREE.BufferAttribute( sizes, 1 ) )
	geometry.addAttribute( 'opacity',  new THREE.BufferAttribute( opacity, 1 ) )
	
	return geometry
}

function _createMeshPromise( poem, config, geometry, material ) {
	
	var url = "assets/images/bokeh.png"
	
	return(
		LoadTexture( url, material.uniforms.texture, "value" )
	
		.then(function() {
		
			var mesh = new THREE.PointCloud( geometry, material )
			mesh.position.fromArray( config.position )
			mesh.frustumCulled = false
			mesh.name = "lightBeam"
		
			poem.scene.add( mesh )
		
			return mesh
		})
		.then( null, function() {
			console.log("Could not load the texture for the lightbeam", url)
		})
	)
}

function _sizeLightbeamFn( size, current ) {
	
	var prevSizeRange
	
	return function() {
		
		if( current.sizeRange !== prevSizeRange ) {
			
			for( var i=0; i < size.array.length; i++ ) {
				
				var unitI = i / size.array.length
				
				size.array[i] = Lerp(
					current.sizeRange[0],
					current.sizeRange[1],
					unitI
				)
			}
			
			prevSizeRange = current.sizeRange
			size.needsUpdate = true
		}
	}
}

function _updateFn( poem, mesh, config, current ) {
	
	var sizeLightBeam = _sizeLightbeamFn(
		mesh.geometry.attributes.size,
		current
	)
	var undulate = _undulateFn( mesh, config )
	
	return function(e) {
		sizeLightBeam(e)
		undulate(e)
		// mesh.position.copy( poem.camera.object.position )
		mesh.material.uniforms.elapsed.value = e.elapsed;
	}
}

function _undulateFn( mesh, config ) {
	
	var undulation = config.undulation
	var xOffset = Random.range( 0, Math.PI*2 )
	var zOffset = Random.range( 0, Math.PI*2 )
	
	if( !undulation ) return function() {}
	
	return function undulate(e) {
		
		var x = undulation.xAmount * Math.sin( xOffset + e.elapsed * undulation.xSpeed )
		var z = undulation.zAmount * Math.sin( zOffset + e.elapsed * undulation.zSpeed )
		mesh.rotation.set( x, 0, z )
	}
}

module.exports = function lightBeam( poem, properties ) {

	var config = _.extend({
		position:        [ 0, -100, 0 ]
	  , segmentsCount:   150
	  , lightLength:     200
	  , brightness:      2
	  , color:		     0xcc4411
	  , sizeRange:	     [50,500]
	  , falloff:         3
		
	  , undulation: {
		  xAmount: Math.PI * 0.1
	    , zAmount: Math.PI * 0.1
	    , xSpeed: 0.0008
		, zSpeed: 0.0006
	  }
	}, properties)
	
	var current = {
		sizeRange : _.clone( config.sizeRange )
	}
	
	var material = _createMaterial(
		config.color
	)
	
	var geometry = _createGeometry(
		config
	  , poem.ratio
	)
	
	return (
		_createMeshPromise(
			poem,
			config,
			geometry,
			material
		)
		.then(function( mesh ) {
			
			poem.emitter.on('update', _updateFn( poem, mesh, config, current ))
		
			return {
				mesh : mesh
			}
		})
	)
}