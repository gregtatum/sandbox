var perlinSimplex = require('perlin-simplex');
var generator = new perlinSimplex();

function unitSimplex( x, y, z ) {
	return (generator.noise(x,y,z) + 1) / 2;
}

var simplex3 = {
	
	flip : function( x, y, z ) {
		return generator.noise3d(x,y,z) > 0 ? true: false;
	},
	
	range : function( x, y, z, min, max ) {
		return unitSimplex(x,y,z) * (max - min) + min;
	},
	
	rangeInt : function( x, y, z, min, max ) {
		return Math.floor( this.range(min, max + 1) );
	},
	
	rangeLow : function( x, y, z, min, max) {
		//More likely to return a low value
		var r = unitSimplex(x,y,z);
		return r * r * (max - min) + min;
	},
	
	rangeHigh : function( x, y, z, min, max) {
		//More likely to return a high value
		var r = unitSimplex(x,y,z);
		return (1 - r * r) * (max - min) + min;
	}
	 
};

module.exports = simplex3;
