var Poem = null;
var levels = null;
var EventDispatcher = require('./utils/EventDispatcher');

var currentLevel = null;
var currentPoem = null;
var titleHideTimeout = null;

function showTitles() {
	
	clearTimeout( titleHideTimeout );
	
	$('#title')
		.removeClass('transform-transition')
		.addClass('hide')
		.addClass('transform-transition')
		.show();
	
	setTimeout(function() {
		$('#title').removeClass('hide');
	}, 1);
	
	$('.score').css('opacity', 0);
	
}

function hideTitles() {

	$('.score').css('opacity', 1);
	
	if( $('#title:visible').length > 0 ) {		
	
		$('#title')
			.addClass('transform-transition')
			.addClass('hide');

		titleHideTimeout = setTimeout(function() {
	
			$('#title').hide();
	
		}, 1000);
	}
			
	
}

var levelLoader = {
	
	init : function( PoemClass, levelsObject ) {
		Poem = PoemClass;
		levels = levelsObject;
	},
	
	load : function( slug ) {
		
		if( !_.isObject(levels[slug]) ) {
			return false;
		}
		
		if(currentPoem) currentPoem.destroy();
		
		currentLevel = levels[slug];
		currentPoem = new Poem( currentLevel, slug );
		
		if( slug === "titles" ) {
			showTitles();
		} else {
			hideTitles();
		}
		
		this.dispatch({
			type: "newLevel",
			level: currentLevel,
			poem: currentPoem
		});
		
		window.poem = currentPoem;
	
		return true;
	}
	
};

EventDispatcher.prototype.apply( levelLoader );

module.exports = levelLoader;
