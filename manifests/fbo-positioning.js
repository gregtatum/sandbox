module.exports = {
	name : "Gpu Processor Example",
	description : "Positioning stored in a frame buffer",
	order : 0,
	config : {
		camera : {
			x : -300,
			near : 0.1,
			far : 5000,
			fov : 40
		}
	},
	components : {
		renderer : { function : require('../js/renderers/basic-renderer') },
		controls : { construct: require("../js/components/cameras/Controls") },
		// grid : { construct: require("../js/demos/Grid") },
		fboPositioning : { function: require('../js/components/fbo-positioning/fbo') },
	}
};