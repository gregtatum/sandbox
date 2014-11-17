var RSVP = require('rsvp');

var loadText = function( url, object, key ) {
	
	var promise = new RSVP.Promise(function(resolve, reject){
		
		$.ajax(url, {
			dataType: "text"
		}).then(
			function( data ) {
				
				if( _.isObject( object ) ) {
					object[key] = data;
				}
				
				resolve( data );
			},
			function( error ) {
				reject( error );
			}
		);
		
	});

	return promise;
};

module.exports = loadText;