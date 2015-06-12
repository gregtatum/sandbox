var ResizeRendererFn = require('./utils/resize-renderer-fn')
var ResizeHandler = require('./utils/resize-handler')
var CreateRenderer = require('./utils/create-renderer')

var ChromaticAberrationShader = require('../postprocessing/chromaticAberration')

//These get loaded onto the THREE object
require('../postprocessing')
require('../shaders/CopyShader')
require('../shaders/FilmShader')
require('../shaders/ConvolutionShader')
require('../shaders/FXAAShader')

function _createEffectComposer( ratio, renderer, scene, camera ) {
	
	var renderPass          = new THREE.RenderPass( scene, camera )
	var antialias           = new THREE.ShaderPass( THREE.FXAAShader )
	// var chromaticAberration = new THREE.ShaderPass( chromaticAberrationShader )
	var bloom               = new THREE.BloomPass( 1.5, 15, 16, 512 )
	var copy                = new THREE.ShaderPass( THREE.CopyShader )
	
	copy.renderToScreen = true

	var composer = new THREE.EffectComposer( renderer )

	composer.addPass( renderPass )
	composer.addPass( antialias )
	// composer.addPass( chromaticAberration )
	composer.addPass( bloom )
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