var calculateSquaredTextureWidth = function( count ) {
	var width = 1;
	var i = 0;
	
	while( width * width < (count / 4) ) {
		
		i++;
		width = Math.pow( 2, i );
		
	}
	
	return width;
};

module.exports = calculateSquaredTextureWidth;
