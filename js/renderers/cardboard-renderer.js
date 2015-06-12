var ResizeRendererFn = require('./utils/resize-renderer-fn')
var ResizeHandler = require('./utils/resize-handler')
var CreateRenderer = require('./utils/create-renderer')
var StereoEffect = require('../vendor/StereoEffect')
var ResizeHandler = require('./utils/resize-handler')
var FadeOutUi = require('./utils/fade-out-ui')


module.exports = function setupVrRenderer( poem, properties ) {
	
	//No config at this level, see createRenderer for more props
	var config = _.extend({}, properties)
	
	var renderer = CreateRenderer( poem, config )
	
	var stereoEffect = new StereoEffect( renderer )
	stereoEffect.separation = 10

	ResizeHandler( poem, ResizeRendererFn( renderer, poem.camera.object ) )
	ResizeHandler( poem, function() {
		stereoEffect.setSize(
			window.innerWidth,
			window.innerHeight
		)
	})
	
	poem.emitter.on( 'draw', function() {
		stereoEffect.render( poem.scene, poem.camera.object )
	})
	
	FadeOutUi( poem )
			
	return renderer
}