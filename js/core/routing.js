var crossroads = require('crossroads');
var hasher = require('hasher');
var manifestLoader = require('./manifestLoader');

var _baseUrl = '/sandbox';
var _defaultLevel = "sineGravityCloud";

var routing = {
	
	start : function( Poem, manifests ) {
		manifestLoader.init( Poem, manifests );
		
		function parseHash( newHash, oldHash ){
			crossroads.parse( newHash );
		}
		
		crossroads.addRoute( '/',				routing.showMainTitles );
		crossroads.addRoute( 'level/{name}',	routing.loadUpALevel );
	
		crossroads.addRoute( /.*/, function reRouteToMainTitlesIfNoMatch() {
			hasher.replaceHash('');
		});
	
		hasher.initialized.add(parseHash); // parse initial hash
		hasher.changed.add(parseHash); //parse hash changes
		hasher.init(); //start listening for history change
		
	},
	
	showMainTitles : function() {

		_gaq.push( [ '_trackPageview', _baseUrl ] );
	
		manifestLoader.load( _defaultLevel );		

	},

	loadUpALevel : function( levelName ) {

		_gaq.push( [ '_trackPageview', _baseUrl+'/#level/'+levelName ] );
	
		var levelFound = manifestLoader.load( levelName );
	
		if( !levelFound ) {
			manifestLoader.load( _defaultLevel );
		}
		
	}
	
};

module.exports = routing;