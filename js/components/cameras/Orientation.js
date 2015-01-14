var OrbitControls = require('../../vendor/OrbitControls');
var DeviceOrientationControls = require('../../vendor/DeviceOrientationControls');
var _e;

$(window).one( 'deviceorientation', function( e ) {
	_e = e;
});


var Orientation = function( poem ) {
	
	this.poem = poem;
	this.camera = this.poem.camera.object;
	
	this.controls = new OrbitControls( this.camera, this.poem.canvas );
	this.controls.rotateUp(Math.PI / 4);
	this.controls.target.set(
		this.camera.position.x + 0.1,
		this.camera.position.y,
		this.camera.position.z
	);
	this.controls.noZoom = true;
	this.controls.noPan = true;

	this.deviceOrientationHandler = this.setOrientationControls.bind(this);

	$(window).on( 'deviceorientation', this.deviceOrientationHandler );
	
	this.poem.emitter.on( 'update', this.update.bind(this) );
	this.poem.emitter.on( 'destroy', this.destroy.bind(this) );
	
	if( _e ) this.setOrientationControls( _e );
	
};

module.exports = Orientation;

Orientation.prototype = {

	setOrientationControls : function( e ) {
		// if( !e.originalEvent.alpha ) {
		// 	return;
		// }

		this.controls = new DeviceOrientationControls( this.camera, true );
		this.controls.connect();
		this.controls.update();

		$(window).off( 'deviceorientation', this.deviceOrientationHandler );
	},
	
	update : function( e ) {
		this.controls.update();
	},
	
	destroy : function( e ) {
		$(window).off( 'deviceorientation', this.deviceOrientationHandler );
	}
	
};