var	EventDispatcher	= require('../utils/EventDispatcher');
var	routing			= require('../routing');

var poem;
var isOpen = false;
var $body;

routing.on( 'newLevel', function( e ) {

	poem = e.poem;
	
});


var menu = {
	
	setHandlers : function() {
		
		$body = $('body');
		
		$('#menu a, #container-blocker').click( menu.close );
		
		$('#menu-button').off().click( this.toggle );
		
		routing.on( 'newLevel', menu.close );
		
		$(window).on('keydown', function toggleMenuHandler( e ) {
	
			if( e.keyCode !== 27 ) return;
			menu.toggle(e);
	
		});
		
		
	},
		
	toggle : function( e ) {

		e.preventDefault();
		
		if( isOpen ) {
			menu.close();
		} else {
			menu.open();
		}
		
		isOpen = !isOpen;
		
	},
	
	close : function() {
		$body.removeClass('menu-open');
		if( poem ) poem.start();
	},
	
	open : function() {
		$body.addClass('menu-open');
		if( poem ) poem.pause();
	}
	
};

EventDispatcher.prototype.apply( menu );
module.exports = menu;