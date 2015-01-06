var EventDispatcher = require('../utils/EventDispatcher');
var localforage = require('localforage');
var muter;

var Muter = function() {
	
	this.muted = true;
	
	localforage.getItem('muted', function( err, value ) {

		if( err || value === null ) {
			this.muted = false;
		} else {
			this.muted = value;
		}
		
		this.dispatchChanged();
		
	}.bind(this));
	
};

Muter.prototype = {
	
	mute : function() {
		this.muted = true;
		this.dispatchChanged();
		this.save();
	},
	
	unmute : function() {
		this.muted = false;
		this.dispatchChanged();
		this.save();
	},
	
	save : function() {
		localforage.setItem( 'muted', this.muted );
	},
	
	dispatchChanged : function() {
		
		if( this.muted ) {
			muter.dispatch({
				type: 'mute'
			});
			
		} else {
			muter.dispatch({
				type: 'unmute'
			});
		}
	}
	
};

EventDispatcher.prototype.apply( Muter.prototype );

muter = new Muter();

$(window).on('keydown', function muteAudioOnHittingS( e ) {
	
	if( e.keyCode !== 83 ) return;
	
	if( muter.muted ) {
		muter.unmute();
	} else {
		muter.mute();
	}
	
});

module.exports = muter;
