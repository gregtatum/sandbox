var LevelLoader = require('./LevelLoader');

$(function() {
	var hash = window.location.hash.substring(1);
	
	
	LevelLoader(hash || "sineGravityCloud");
});