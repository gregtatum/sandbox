var soundcloud = require('soundcloud-badge');

var Music = function( poem, properties ) {

	if(window.location.hash === "#musicoff") return;

	var audio;
	var alive = true;

	soundcloud({
		client_id: '6057c9af862bf245d4c402179e317f52',
		song: properties.url,
		dark: false,
		getFonts: false
	}, function(err, src, data, div) {

		if( !alive ) return;
		if( err ) throw err;

		audio = new Audio();
		audio.src = src;
		audio.play();
		audio.loop = true;
		audio.volume = properties.volume || 0.6;
		
		$(audio).on('loadedmetadata', function() {
			audio.currentTime = properties.startTime || 0;
		});
		
		var playing = true;
		
		$(window).on('keydown.Music', function(e) {
			if( e.keyCode !== 83 ) return;
			if( playing ) {
				audio.pause();
				playing = false;
			} else {
				audio.play();
				playing = true;
			}
		});
	});
	
	poem.emitter.on('destroy', function() {
		if(audio) {
			audio.pause();
			audio = null;
		}
		$(window).off('keydown.Music');
		$('.npm-scb-white').remove();
	});
	
};

module.exports = Music;
