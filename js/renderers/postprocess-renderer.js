var ResizeRendererFn = require('./utils/resize-renderer-fn')
var ResizeHandler = require('./utils/resize-handler')
var CreateRenderer = require('./utils/create-renderer')
var SSAOShader = require('../postprocessing/SSAOShader')
var Playground = require('../postprocessing/playground/playground')

//These get loaded onto the THREE object
require('../postprocessing')
require('../shaders/CopyShader')
require('../shaders/FilmShader')
require('../shaders/ConvolutionShader')
require('../shaders/FXAAShader')

function _createSsao( ratio, renderer, scene, camera ) {
	
	var ssao = new THREE.ShaderPass( SSAOShader )
	
	ssao.uniforms.tDepth.value      = depthTarget
	ssao.uniforms.cameraNear.value  = camera.near
	ssao.uniforms.cameraFar.value   = camera.far
	ssao.uniforms.fogEnabled.value  = 1
	ssao.uniforms.aoClamp.value     = 0.5
	
	ssao.uniforms.size.value.set( window.innerWidth * ratio, window.innerHeight * ratio )
	
}

function _createDepthRender( ratio, renderer, scene, camera ) {
	
	var depthTarget = new THREE.WebGLRenderTarget(
		window.innerWidth,
		window.innerHeight,
		renderTargetParametersRGBA
	)
	
	var depthMaterial = new THREE.MeshDepthMaterial()
	
	return {
		render : function() {
			
			scene.overrideMaterial = depthMaterial
			renderer( scene, camera, depthTarget, true )
			scene.overrideMaterial = null
		}
	}
}

function _createEffectComposer( ratio, renderer, scene, camera ) {
	
	var renderPass  = new THREE.RenderPass( scene, camera )
	var antialias   = new THREE.ShaderPass( THREE.FXAAShader )
	var playground  = new THREE.ShaderPass( Playground )
	// var ssao        = _createSsao( ratio, renderer, scene, camera )
	var copy        = new THREE.ShaderPass( THREE.CopyShader )
	
	copy.renderToScreen = true

	var composer = new THREE.EffectComposer( renderer )
	
	var renderTargetParametersRGBA = {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBAFormat
	}


	composer.addPass( renderPass )
	// composer.addPass( ssao )
	composer.addPass( playground )
	composer.addPass( antialias )
	composer.addPass( copy )

	var resize = function() {
		antialias.uniforms.resolution.value.set(
			1 / (window.innerWidth * ratio),
			1 / (window.innerHeight * ratio)
		)
		
		composer.renderTarget1.setSize( window.innerWidth * ratio, window.innerHeight * ratio )
		composer.renderTarget2.setSize( window.innerWidth * ratio, window.innerHeight * ratio )
	}
	
	resize()
	
	return [ composer, resize ]
}

function handleNewPoem( poem, config ) {
	
	var renderer = CreateRenderer( poem, config )
	
	renderer.autoClear = false
	
	ResizeHandler( poem, ResizeRendererFn( renderer, poem.camera.object ) )
	
	var [ composer, resize ] = _createEffectComposer( poem.ratio, renderer, poem.scene, poem.camera.object )
	
	poem.emitter.on( 'draw', function() {
		
		composer.render( poem.scene, poem.camera.object )
	})
			
	return renderer
}

module.exports = handleNewPoem