var crossroads = require('crossroads');
var hasher = require('hasher');
var levelLoader = require('./levelLoader');

var baseUrl = '/sandbox';
var defaultLevel = "sineGravityCloud";
var currentLevel = "";

var routing = {
	
	start : function( Poem, levels ) {
		
		levelLoader.init( Poem, levels );
		
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
	
		levelLoader.load( defaultLevel );		

	},

	loadUpALevel : function( levelName ) {

		_gaq.push( [ '_trackPageview', baseUrl+'/#level/'+levelName ] );
	
		var levelFound = levelLoader.load( levelName );
	
		if( !levelFound ) {
			levelLoader.load( defaultLevel );
		}
		
	},
	
	on : levelLoader.on.bind( levelLoader ),
	off : levelLoader.off.bind( levelLoader )
	
};

module.exports = routing;