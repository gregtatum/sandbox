var CopyTexture = require('./copy-texture')

function _createRenderTarget( sideLength, format ) {
	
	return new THREE.WebGLRenderTarget(
		sideLength,
		sideLength,
		{
			wrapS: THREE.RepeatWrapping, // TODO - not needed?
			wrapT: THREE.RepeatWrapping, // TODO - not needed?
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: format,
			type: THREE.FloatType,
			stencilBuffer: false
		}
	)
}

function _renderFn( renderer ) {
	
	var scene = new THREE.Scene()
	var camera = new THREE.Camera()
	var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ) )
	
	return function( shaderMaterial, renderTargetOut ) {
	
		mesh.material = shaderMaterial
		renderer.render( scene, camera, renderTargetOut )
	}
}

function _flipFn( pass ) {
	
	var input = 0
	var output = 1
	
	return function() {
		input = (input + 1) % 2
		output = (output + 1) % 2
	
		pass.inputRenderTarget = pass.renderTargets[input]
		pass.outputRenderTarget = pass.renderTargets[output]
	}
}

function _addPassFn( current ) {

	var copyTexture = CopyTexture( renderer )
		
	return function addPass( name, props ) {
		
		var config = _.extend({
			size              : 100,
			stride            : 4,
			generateDatum     : function() {},
			preRender         : function() {},
			postRender        : function() {},
			uniformName       : "texture",
			autoUpdateUniform : true,
			shaderMaterial    : null,
		}, props)
		
		var textureSideLength = THREE.Math.nextPowerOfTwo( Math.sqrt( config.size ) )
		
		
		var data = new Float32Array( size * stride )
	
		if( stride !== 3 && stride !== 4 ) {
			throw new Error('Stride must be 3 or 4 to work with the RGB and RGBA formats.')
		}

		for( var i=0; i < data.length; i += stride ) {
			generateDatum( data, i )
		}

		var renderTargetA = _createRenderTarget( textureSideLength, format )
		var renderTargetB = _createRenderTarget( textureSideLength, format )
	
		var texture = new THREE.DataTexture( data, textureSideLength, textureSideLength )
		_.extend( texture, {
			format       : format,
			type         : THREE.FloatType,
			minFilter    : THREE.NearestFilter,
			magFilter    : THREE.NearestFilter,
			needsUpdate  : true,
			flipY        : false,
		})
		
		copyTexture( texture, renderTargetA, textureSideLength )
		copyTexture( texture, renderTargetB, textureSideLength )
		
		texture.dispose()
	
		var pass = {
			size           : size,
			stride         : stride,
			preRender      : preRender,
			shaderMaterial : shaderMaterial,
			uniformName    : uniformName,
			inputRenderTarget   : null,
			outputRenderTarget  : null,
			renderTargets  : [ renderTargetA, renderTargetB ]
		}
		
		pass.flip = _flipFn( pass )
	
		current.passes[name] = pass
	
		return pass
	}
}

function _renderAllFn( current, render ) {
	
	
	return function renderAll() {
		

		_.each( current.passes, function flipFlopPasses( pass ) {

			if( pass.active ) {
				
				pass.flip()
			
				if( pass.autoUpdateUniform ) {
					pass.shaderMaterial.uniforms[pass.uniformName].value = pass.inputRenderTarget
				}
			}
		})
				
		_.each( current.passes, function( pass ) {
			if( pass.active ) {
				pass.preRender( pass, current.passes )
			}
		})
		
		_.each( current.passes, function( pass ) {
			if( pass.active ) {
				render( pass.shaderMaterial, pass.outputRenderTarget )
			}
		})
				
		_.each( current.passes, function( pass ) {
			if( pass.active ) {
				post.postRender( pass, current.passes )
			}
		})
	}
}

function _renderPass( current, render ) {
	
	return function renderPass( nameOrPass ) {
		
		var pass = _.isString( nameOrPass ) ? current.passes[nameOrPass] : nameOrPass
		
		pass.flip()
	
		if( pass.autoUpdateUniform ) {
			pass.shaderMaterial.uniforms[pass.uniformName].value = pass.inputRenderTarget
		}
		pass.preRender( pass, current.passes )
		render( pass.shaderMaterial, pass.outputRenderTarget )
		post.postRender( pass, current.passes )
	}
}


module.exports = function( renderer, props ) {
	
	var current = {
		passes : []
	}
	
	var camera = new THREE.Camera(); camera.position.z = 1
	var scene = new THREE.Scene();
	var render = _renderFn( renderer )
	var addPass = _addPassFn( config, current )
	var renderAll = _.renderAllFn( current, render )
	var renderPass = _.renderPassFn( current, render )
	
	return {
		passes : current.passes,
		addPass : addPass,
		render : renderAll,
		renderPass : renderPass
	}
}