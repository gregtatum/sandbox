require('../postprocessing');
require('../shaders/CopyShader');
require('../shaders/FilmShader');
require('../shaders/ConvolutionShader');
require('../shaders/FXAAShader');
var chromaticAberrationShader = require('../postprocessing/chromaticAberration');
var StereoEffect = require('../vendor/StereoEffect');

//Singletons
var _ratio = _.isNumber( window.devicePixelRatio ) ? window.devicePixelRatio : 1;
var _webGLRenderer = addRenderer();
var _renderer = _webGLRenderer;
var _rendererPass = new THREE.RenderPass();
var _composer = addEffectsComposer( _rendererPass );

function addEffectsComposer( renderPass ) {
	
	var bloom = new THREE.BloomPass( 1.5, 15, 16, 512 );
	var copy = new THREE.ShaderPass( THREE.CopyShader );
	var antialias = new THREE.ShaderPass( THREE.FXAAShader );
	var chromaticAberration = new THREE.ShaderPass( chromaticAberrationShader );
	
	antialias.uniforms.resolution.value.set(
		1 / (window.innerWidth * _ratio),
		1 / (window.innerHeight * _ratio)
	);
	copy.renderToScreen = true;

	var composer = new THREE.EffectComposer( _renderer );
	composer.renderTarget1.setSize( window.innerWidth * _ratio, window.innerHeight * _ratio );
	composer.renderTarget2.setSize( window.innerWidth * _ratio, window.innerHeight * _ratio );

	composer.addPass( renderPass );
	composer.addPass( antialias );
	// composer.addPass( chromaticAberration );
	composer.addPass( bloom );
	composer.addPass( copy );
	
	return composer;
	
}

function addSceneAndCameraToEffects( scene, camera ) {
	
	_rendererPass.scene = scene;
	_rendererPass.camera = camera;
	
}

var newResizeHandler = (function() {
	
	var handler;
	var $window = $(window);
	
	return function( camera ) {
		
		var newHandler = function() {
			
			_renderer.setSize(
				window.innerWidth,
				window.innerHeight
			);
			
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			
		};
		
		if( handler ) {
			$(window).off('resize', handler);
		}
		
		$window.on('resize', newHandler);
		newHandler();
		handler = newHandler;
		
	};
		
})();

function addRenderer() {
	
	var renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( _ratio );
	renderer.setSize(
		window.innerWidth,
		window.innerHeight
	);
	document.getElementById( 'container' ).appendChild( renderer.domElement );
		
	return renderer;
	
}

function handleNewPoem( properties, scene, cameraObj, poemEmitter ) {
	
	var config = _.extend({
		clearColor : 0x222222,
		useEffects : false,
		useVR : false
	}, properties);
	
	_webGLRenderer.setClearColor( config.clearColor );
	
	if( config.useVR ) {
		_renderer = new StereoEffect( _webGLRenderer );
		_renderer.separation = 10;
		// this.hideUI();
	} else {
		_renderer = _webGLRenderer;
		// this.showUI();
	}
	
	addSceneAndCameraToEffects( scene, cameraObj );
	newResizeHandler( cameraObj );
	
	if( config.useEffects ) {
		_webGLRenderer.autoClear = false;
		poemEmitter.on( 'draw', function() {
			_composer.render( scene, cameraObj );
		});
	} else {
		_webGLRenderer.autoClear = true;
		poemEmitter.on( 'draw', function() {
			_renderer.render( scene, cameraObj );
		});
	}
	
	return _renderer;
}

module.exports = handleNewPoem;