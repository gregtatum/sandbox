var perlinSimplex = require('perlin-simplex');
var generator = new perlinSimplex();
// generator.noise(x, y)
// generator.noise3d(x, y, z)

function unitSimplex( x, y ) {
	return (generator.noise(x,y) + 1) / 2;
}

var simplex2 = {
	
	flip : function( x, y ) {
		return generator.noise(x,y) > 0 ? true: false;
	},
	
	range : function( x, y, min, max ) {
		return unitSimplex(x,y) * (max - min) + min;
	},
	
	rangeInt : function( x, y, min, max ) {
		return Math.floor( this.range(min, max + 1) );
	},
	
	rangeLow : function( x, y, min, max) {
		//More likely to return a low value
		var r = unitSimplex(x,y);
		return r * r * (max - min) + min;
	},
	
	rangeHigh : function( x, y, min, max) {
		//More likely to return a high value
		var r = unitSimplex(x,y);
		return (1 - r * r) * (max - min) + min;
	}
	 
};

module.exports = simplex2;
