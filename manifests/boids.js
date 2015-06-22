module.exports = {
	name : "Gpu Processor Example",
	description : "",
	order : 0,
	config : {
		camera : {
			x : -300,
			near : 0.1,
			far : 1000,
			fov : 40
		}
	},
	components : {
		renderer : { function : require('../js/renderers/basic-renderer') },
		controls : { construct: require("../js/components/cameras/Controls") },
		grid : { construct: require("../js/demos/Grid") },
		boids : { function: require('../js/components/boids/boids') },
	}
};