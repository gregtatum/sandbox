var Camera = require('../components/cameras/Camera')
var Renderer = require('./renderer')
var CreateLoop = require('poem-loop')

var internals = {
	
	ratio : _.isNumber( window.devicePixelRatio ) ? window.devicePixelRatio : 1,
	
	createFog : function( scene, properties, cameraPositionZ ) {
	
		var config = _.extend({
			color : 0x222222,
			nearFactor : 0.5,
			farFactor : 2
		}, properties )
	
		scene.fog = new THREE.Fog(
			config.color,
			cameraPositionZ * config.nearFactor,
			cameraPositionZ * config.farFactor
		)
	
	}
}

module.exports = function poem( manifest, loaderEmitter ) {

	var config = _.extend({
		camera : null,
		fog : null,
		renderer : null		
	}, manifest.config)
	
	var api
	var loop = CreateLoop()
	var emitter = loop.emitter // Steal the emitter for the poem
	
	var scene = new THREE.Scene()
	var camera = new Camera( config.camera, scene, emitter )
	
	internals.createFog( scene, config.fog, camera.object.position.z )
	
	Renderer( config.renderer, scene, camera.object, emitter )
	
	loaderEmitter.once( 'load', function() {
		
		var promisesUnfiltered = _.map( api, function( component ) {
			return component.promise
		})
		var promises = _.filter(promisesUnfiltered, function( component ) {
			return !_.isUndefined( component )
		})
		
		Promise.all( promises ).then( function() {
			emitter.emit('promises')
			loop.start()
		}, alert )
			
	})
		
	loaderEmitter.on( 'unload', function() {
		loop.stop()
		emitter.emit('destroy')
	})
	
	return api = {
		emitter : emitter,
		canvas : $("canvas")[0],
		scene : scene,
		ratio : internals.ratio,
		camera : camera,
		$div : $("#container"),
		loop : loop,
		start : loop.start,
		stop : loop.stop
	}
	
}