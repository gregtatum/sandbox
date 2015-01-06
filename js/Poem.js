var Camera = require('./components/cameras/Camera');
var Stats = require('./utils/Stats');
var EventDispatcher = require('./utils/EventDispatcher');
var Clock = require('./utils/Clock');
var renderer = require('./renderer');

function createFog( config, cameraPositionZ ) {
	
	var fog = _.extend({
		color : 0x222222,
		nearFactor : 0.5,
		farFactor : 2
	}, config );
	
	return new THREE.Fog(
		fog.color,
		cameraPositionZ * fog.nearFactor,
		cameraPositionZ * fog.farFactor
	);
	
}

var Poem = function( level, slug ) {

	this.ratio = _.isNumber( window.devicePixelRatio ) ? window.devicePixelRatio : 1;
	this.slug = slug;
	
	this.controls = undefined;
	this.scene = new THREE.Scene();
	this.requestedFrame = undefined;
	this.started = false;
	this.$div = $("#container");

	this.clock = new Clock();
	this.camera = new Camera( this, level.config.camera || {} );
	this.scene.fog = createFog( level.config.fog, this.camera.object.position.z );

	renderer( this, level.config.renderer );
	this.canvas = $("canvas")[0];
	
	this.parseLevel( level );
	
	this.dispatch({
		type: 'levelParsed'
	});
	
	this.statsEnabled = false;
	this.addStats();
	
	this.start();
	
};

module.exports = Poem;

Poem.prototype = {
	
	parseLevel : function( level ) {
		_.each( level.objects, function loadComponent( value, key ) {
			if(_.isObject( value )) {
				this[ key ] = new value.object( this, value.properties );
			} else {
				this[ key ] = value;
			}
			
		}, this);
	},	
	
	addStats : function() {
		
		if( this.statsEnabled ) {
			this.stats = new Stats();
			this.stats.domElement.style.position = 'absolute';
			this.stats.domElement.style.top = '0px';
			$("#container").append( this.stats.domElement );
			
			this.on('update', function() {
				this.stats.update();
			}.bind(this));
		}
		
	},
		
	
	start : function() {
		if( !this.started ) {
			
			this.loop();
		}
		this.started = true;
	},
	
	loop : function() {

		this.requestedFrame = requestAnimationFrame( this.loop.bind(this) );
		this.update();

	},
	
	pause : function() {
		
		window.cancelAnimationFrame( this.requestedFrame );
		this.started = false;
		
	},
			
	update : function() {
		
		
		
		this.dispatch({
			type: "update",
			dt: this.clock.getDelta(),
			time: this.clock.time
		});

		this.dispatch({
			type: "draw"
		});
		
		
		

	},
	
	destroy : function() {
		
		window.cancelAnimationFrame( this.requestedFrame );
		
		this.dispatch({
			type: "destroy"
		});
	}
};

EventDispatcher.prototype.apply( Poem.prototype );
