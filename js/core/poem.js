var Camera = require('../components/cameras/Camera');
var renderer = require('./renderer');
var createLoop = require('poem-loop');

var _ratio = _.isNumber( window.devicePixelRatio ) ? window.devicePixelRatio : 1;

var createFog = function( scene, properties, cameraPositionZ ) {
	
	var config = _.extend({
		color : 0x222222,
		nearFactor : 0.5,
		farFactor : 2
	}, properties );
	
	scene.fog = new THREE.Fog(
		config.color,
		cameraPositionZ * config.nearFactor,
		cameraPositionZ * config.farFactor
	);
	
};

module.exports = function poem( manifest, loaderEmitter ) {
	
	var config = _.extend({
		camera : null,
		fog : null,
		renderer : null		
	}, manifest.config);
	
	var loop = createLoop();
	var emitter = loop.emitter; // Steal the emitter for the poem
	
	var scene = new THREE.Scene();
	var camera = new Camera( config.camera, scene, emitter );
	createFog( scene, config.fog, camera.object.position.z );
	
	renderer( config.renderer, scene, camera.object, emitter );
	
	loaderEmitter.on( 'load', loop.start );
	loaderEmitter.on( 'unload', function() {
		loop.stop();
		emitter.emit('destroy');
	});
	
	return {
		emitter : emitter,
		canvas : $("canvas")[0],
		scene : scene,
		ratio : _ratio,
		camera : camera,
		$div : $("#container"),
		loop : loop,
		start : loop.start,
		stop : loop.stop
	};
	
};