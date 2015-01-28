module.exports = {
	name : "Sine Gravity Cloud",
	description : "An evolving cloud of movement",
	order : 0,
	config : {
		camera : {
			x : -400
		},
		renderer : {
			useEffects : false
		}
	},
	components : {
		controls : {
			construct: require("../js/components/cameras/Controls"),
		},
		pointcloud : {
			construct: require("../js/demos/SineGravityCloud"),
		},
		grid : {
			construct: require("../js/demos/Grid"),
		},
		// stats : {
		// 	construct: require("../js/components/utils/Stats")
		// }
	}
};