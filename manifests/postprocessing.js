module.exports = {
	name : "Post Processing",
	description : "",
	order : 0,
	config : {
		camera : {
			x : -400
		},
	},
	components : {
		renderer : { function : require('../js/renderers/postprocess-renderer') },
		controls : {
			construct: require("../js/components/cameras/Controls"),
		},
		grid : {
			construct: require("../js/demos/Grid"),
		},
		tree : {
			function: require('../js/components/models/tree'),
			properties: {
				position: [0,-50, 0],
				scale: [20,20,20],
			}
		},
		lights : {
			construct: require("../js/components/lights/TrackCameraLights")
		},		
		// stats : {
		// 	construct: require("../js/components/utils/Stats")
		// }
	}
};