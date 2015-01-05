var Stats = require('./vendor/Stats');
var EventDispatcher = require('./utils/EventDispatcher');
var Clock = require('./utils/Clock');
var Camera = require('./components/cameras/Camera');
var StereoEffect = require('./vendor/StereoEffect');
var DeviceOrientationControls = require('./vendor/DeviceOrientationControls');
var _renderer;
var _webGLRenderer;

var Poem = function( level ) {

	this.ratio = window.devicePixelRatio >= 1 ? window.devicePixelRatio : 1;
	
	this.div = document.getElementById( 'container' );
	this.$div = $(this.div);
	this.canvas = null;
	this.scene = new THREE.Scene();
	this.requestedFrame = undefined;

	this.clock = new Clock();
	this.camera = new Camera( this, _.isObject( level.config.camera ) ? level.config.camera : {} );
	this.scene.fog = new THREE.Fog( 0x222222, this.camera.object.position.z / 2, this.camera.object.position.z * 2 );
	
	this.addRenderer( level.config.vr );
	
	this.parseLevel( level );
	
	this.addEventListeners();
	
	this.loop();
	
};

module.exports = Poem;

Poem.prototype = {
	
	parseLevel : function( level ) {
		_.each( level.objects, function( value, key ) {
			if(_.isObject( value )) {
				this[ key ] = new value.object( this, value.properties );
			} else {
				this[ key ] = value;
			}
			
		}, this);
	},
	
	addRenderer : function( useVR ) {
				
		if(!_renderer) {
			_webGLRenderer = new THREE.WebGLRenderer({
				alpha : true
			});
		}

		if( useVR ) {
			_renderer = new StereoEffect( _webGLRenderer );
			_renderer.separation = 10;
			this.hideUI();
		} else {
			_renderer = _webGLRenderer;
			this.showUI();
		}
		
		_renderer.setSize( window.innerWidth, window.innerHeight );
		this.div.appendChild( _webGLRenderer.domElement );
		this.canvas = _webGLRenderer.domElement;
	},
	
	hideUI : function() {
		$('.info, .credits, .level-select').hide();
	},
	
	showUI : function() {

		$('.info, .credits, .level-select').show();
	},
	
	addStats : function() {

	},
	
	addEventListeners : function() {
		$(window).on('resize', this.resizeHandler.bind(this));
		$(window).on('deviceorientation', this.resizeHandler.bind(this));
	},
	
	resizeHandler : function() {
		
		_renderer.setSize( window.innerWidth, window.innerHeight );
		this.dispatch( { type : "resize" } );
		
	},
			
	loop : function() {

		this.requestedFrame = requestAnimationFrame( this.loop.bind(this) );
		this.update();

	},
			
	update : function() {
		
		this.dispatch({
			type: "update",
			dt: this.clock.getDelta(),
			time: this.clock.time
		});
		
		_renderer.render( this.scene, this.camera.object );

	},
	
	destroy : function() {
		
		window.cancelAnimationFrame( this.requestedFrame );
		
		this.dispatch({
			type: "destroy"
		});
	}
};

EventDispatcher.prototype.apply( Poem.prototype );