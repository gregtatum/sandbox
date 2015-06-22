var GpuProcessor = require('../../utils/gpu-processor/gpu-processor')
var Glslify = require('glslify')
var DuplicateBufferGeometry = require('../../utils/duplicate-buffer-geometry')

function _generatePositionFn( config ) {
	
	return function generatePosition( data, i ) {

		data[i+0] = Math.random()
		data[i+1] = Math.random()
		data[i+2] = Math.random()
	}
}

function _addPasses( gpuProcessor, config ) {
	
	gpuProcessor.addPass( "position", {
		
		size              : 100,           // Number of vectors in data
		stride            : 3,             // Dimensions of vectors, either 3 or 4
		uniformName       : "positionTexture",
		shaderMaterial    : shaderMaterial,
		
		generateDatum     : _generatePosition( config ),
			
		preRender         : function( pass, passes ) {
			shaderMaterial.uniforms.velocityTexture = passes.velocity.inputRenderTarget
		}
	})
}

function _createRenderMaterial( config ) {
	
	return new THREE.ShaderMaterial({
		
		vertexShader    : Glslify('./boids-render.vert'),
		fragmentShader  : Glslify('./boids-render.frag'),
		
		uniforms: {
			elapsed : { type: 'f' },
		},
		attributes       : {
			attributeIndex : { type: 'f', value: new Array(120) }
		}
	})
}

function _createGeometry() {
	
	var bufferGeometry = new THREE.BufferGeometry()
	bufferGeometry.fromGeometry( new THREE.OctahedronGeometry( 3 ) )
	DuplicateBufferGeometry( bufferGeometry, 5 )

	return bufferGeometry
}

function _createMesh( config, scene ) {
	
	var mesh = new THREE.Mesh(
		_createGeometry( config ),
		_createRenderMaterial( config )
	)
	
	scene.add( mesh )
	return mesh
}

module.exports = function boids( poem, props ) {
	
	var config = _.extend({
		
		count : 100
		
	}, props)
	
	// var gpuProcessor = GpuProcessor( poem.renderer )
	// _addPasses( gpuProcessor, config )
	// gpuProcessor.render()
	
	_createMesh( config, poem.scene )
	
}