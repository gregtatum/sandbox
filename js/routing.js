var crossroads = require('crossroads');
var hasher = require('hasher');
var loader = require('./loader');

var baseUrl = '/sandbox';
var defaultLevel = "sineGravityCloud";
var currentLevel = "";

var routing = {
	
	start : function( Poem, manifests ) {
		loader.init( Poem, manifests );
		
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

		_gaq.push( [ '_trackPageview', baseUrl ] );
	
		loader.load( defaultLevel );		

	},

	loadUpALevel : function( levelName ) {

		_gaq.push( [ '_trackPageview', baseUrl+'/#level/'+levelName ] );
	
		var levelFound = loader.load( levelName );
	
		if( !levelFound ) {
			loader.load( defaultLevel );
		}
		
	},
	
	emitter : loader.emitter,
	
};

module.exports = routing;