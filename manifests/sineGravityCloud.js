module.exports = {
	name : "Sine Gravity Cloud",
	description : "An evolving cloud of movement",
	order : 0,
	config : {
		camera : {
			x : -400
		}
	},
	objects : {
		controls : {
			object: require("../js/components/cameras/Controls"),
		},
		pointcloud : {
			object: require("../js/demos/SineGravityCloud"),
		},
		grid : {
			object: require("../js/demos/Grid"),
		},
		// stats : {
		// 	object: require("../js/components/utils/Stats")
		// }
	}
};