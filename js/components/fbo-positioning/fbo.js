var GpuProcessor = require('../../utils/gpu-processor/gpu-processor')
var Glslify = require('glslify')
var DuplicateBufferGeometry = require('../../utils/duplicate-buffer-geometry')
var CopyTexture = require('../../utils/gpu-processor/copy-texture')

var PASS_THROUGH_VERT = "void main() { gl_Position = vec4( position, 1.0 ); }"

function _generatePositionFn( config ) {
	
	return function generatePosition( data, i ) {

		data[i+0] = Math.random() * 0.01 + ( Math.cos(i * 0.02) + Math.cos(i * 0.2 )* 0.01) * 3
		data[i+1] = Math.random() * 0.01 + ( Math.sin(i * 0.02) + Math.sin(i * 0.2 )* 0.01) * 3
		data[i+2] = Math.random() * 0.01 +  2 + -i * 0.00002
		
		data[i+0] += Math.sin( data[i+2] ) * 0.1
	}
}

function _initPositioningPass( gpuProcessor, config ) {
	
	var prevPositionTexture // created at the end
	
	var shaderMaterial = new THREE.ShaderMaterial({
		
		vertexShader : PASS_THROUGH_VERT,
		fragmentShader : Glslify('./fbo-position.shader'),
		uniforms: {
			elapsed : { type : 'f' },
			textureSideLength : { type : 'f' },
			textureCurrPosition : { type : 't' },
			texturePrevPosition : { type : 't' }
		},
		attributes : {}
	})
	
	shaderMaterial.name = "Boids Position Shader"

	var pass = gpuProcessor.addPass( "position", {
		
		size              : config.count,  // Number of vectors in data
		stride            : 3,             // Dimensions of vectors, either 3 or 4
		uniformName       : "textureCurrPosition",
		shaderMaterial    : shaderMaterial,
		generateDatum     : _generatePositionFn( config ),
		preRender         : function( pass, passes ) {
			
			//Copy the previous position
			gpuProcessor.copyTexture(
				pass.outputRenderTarget,
				prevPositionTexture,
				pass.textureSideLength
			)
			
		}
	})
	
	//Copy one of the render target settings
	prevPositionTexture = pass.renderTargets[0].clone()
	prevPositionTexture.name = "prevPositionTexture"
	
	// //TODO - Debug only
	// gpuProcessor.copyTexture(
	// 	pass.renderTargets[0],
	// 	prevPositionTexture,
	// 	pass.textureSideLength
	// )
	
	shaderMaterial.uniforms.textureSideLength.value = pass.textureSideLength
	shaderMaterial.uniforms.texturePrevPosition.value = prevPositionTexture
	
	return {
		pass : pass,
		prevPositionTexture : prevPositionTexture,
		shaderMaterial : shaderMaterial
	}
}

function _createRenderMaterial( config ) {
	
	var shaderMaterial = new THREE.ShaderMaterial({
		
		vertexShader    : Glslify('./fbo-render.vert'),
		fragmentShader  : Glslify('./fbo-render.frag'),
		
		uniforms: {
			elapsed : { type: 'f', value : 0 },
			textureCurrPosition : { type : 't' },
			texturePrevPosition : { type : 't' },
			textureSideLength : { type : 'f' }
		},
		
		attributes       : {
			attributeIndex : { type: 'f' }
		}
	})
	
	shaderMaterial.name = "Boids Render Shader"
	
	return shaderMaterial
}

function _createGeometry( config ) {
	
	var bufferGeometry = new THREE.BufferGeometry()
	bufferGeometry.fromGeometry( new THREE.OctahedronGeometry( 3 ) )
	DuplicateBufferGeometry( bufferGeometry, config.count )

	return bufferGeometry
}

function _initRenderingPass( config, scene, positioning ) {
	
	var mesh = new THREE.Mesh(
		_createGeometry( config ),
		_createRenderMaterial( config, positioning )
	)
	
	scene.add( mesh )
	return mesh
}

module.exports = function fbo( poem, props ) {
	
	var config = _.extend({
		count : 1e5 * 2
	}, props)
	
	var gpuProcessor = GpuProcessor( poem.renderer )
	var positioning = _initPositioningPass( gpuProcessor, config )
	
	
	var mesh = _initRenderingPass( config, poem.scene )
	
	poem.emitter.on('update' , function(e) {
		
		gpuProcessor.render()
		
		mesh.material.uniforms.textureCurrPosition.value = positioning.pass.outputRenderTarget
		// mesh.material.uniforms.textureCurrPosition.value = positioning.prevPositionTexture
		mesh.material.uniforms.texturePrevPosition.value = positioning.prevPositionTexture
		mesh.material.uniforms.textureSideLength.value = positioning.pass.textureSideLength
		mesh.material.uniforms.elapsed.value = e.elapsed
	})
}