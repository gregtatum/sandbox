var LevelLoader = require('./LevelLoader');

function camelCaseToSpaced( string ) {
	
	return string
	    .replace(/([A-Z])/g, ' $1')
	    .replace(/^./, function(str){ return str.toUpperCase(); })
		
}

$(function() {
	
	var hash = window.location.hash.substring(1);
	
	var levels = _.keys( require('./levels') );
	
	var levelToLoad = _.contains( levels, hash ) ? hash : _.first( levels );
	
	window.location.hash = levelToLoad;
	
	$('#LevelSelect')
		.append(
		
			_.reduce( levels, function( memo, level ) {
				
				var levelPretty = camelCaseToSpaced( level );
				var selected = level === levelToLoad ? " selected" : "";

				return memo + "<option value='"+level+"'"+selected+">"+levelPretty+"</option>";
				
			}, "")
	
		)
		.on( "change", function() {
			var level = $(this).val();
			LevelLoader( level );
			window.location.hash = level;
		})
	;

	LevelLoader( levelToLoad  );
});