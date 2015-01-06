var soundcloud = require('soundcloud-badge');
var muter = require('./muter');

var soundOff = false;

var audio = null;
var fetchAndPlaySong = null;
var timesCalledSoundcloud = 0;

var Music = function( poem, properties ) {

	fetchAndPlaySong = function() {
		
		var currentTime = ++timesCalledSoundcloud;
		
		soundcloud({
			
			client_id: '6057c9af862bf245d4c402179e317f52',
			song: properties.url,
			dark: false,
			getFonts: false
			
		}, function( err, src, data, div ) {
			
			//Nullify callbacks that are out of order
			if( currentTime !== timesCalledSoundcloud ) return;
			if( muter.muted ) return;

			if( err ) throw err;

			audio = new Audio();
			audio.src = src;
			audio.play();
			audio.loop = true;
			audio.volume = properties.volume || 0.6;
		
			$(audio).on('loadedmetadata', function() {
				if( audio )	audio.currentTime = properties.startTime || 0;
			});
		

		});
	
		poem.on('destroy', function() {
			
			if( audio ) {
				audio.pause();
				audio = null;
			}
			
			$('.npm-scb-white').remove();
			
		});
		
	};
	
	if( !muter.muted ) {
		
		fetchAndPlaySong();
		fetchAndPlaySong = null;
		
	}
	
};

Music.prototype.muted = false;

muter.on('mute', function muteMusic( e ) {

	if( audio ) audio.pause();
	
	$('.npm-scb-white').hide();

});

muter.on('unmute', function unmuteMusic( e ) {

	if( audio ) audio.play();

	if( fetchAndPlaySong ) {
		fetchAndPlaySong();
		fetchAndPlaySong = null;
	}
	
	$('.npm-scb-white').show();
	

});

module.exports = Music;