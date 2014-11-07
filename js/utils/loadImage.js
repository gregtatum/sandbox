var RSVP = require('rsvp');

var loadImage = function( url, object, key ) {
	
	return new RSVP.Promise(function(resolve, reject) {
		
		var deferred = $.Deferred();
		var $img = $("<img />");
		var img = $img[0];
	
		$img.load(function() {
			
			if( _.isObject( object ) ) {
				object[key] = img;
			}
			
			resolve( img );
			
		});
	
		$img.error(function() {
			reject( "Could not load image: " + url );
		});
	
		img.src = url;
		
	});

};

module.exports = loadImage;