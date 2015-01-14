var Trackball = require('../../vendor/TrackballControls');

var Controls = function( poem, properties ) {
	
	this.poem = poem;
	this.properties = properties;

	this.controls = new Trackball( this.poem.camera.object, this.poem.canvas );
	
	_.extend( this.controls, properties );
	
	this.poem.emitter.on( 'update', this.controls.update.bind( this.controls ) );
	
};

module.exports = Controls;
