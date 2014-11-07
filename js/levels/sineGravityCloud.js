module.exports = {
	config : {
		camera : {
			x : -400
		}
	},
	objects : {
		controls : {
			object: require("../components/cameras/Controls"),
		},
		pointcloud : {
			object: require("../components/demos/SineGravityCloud"),
		},
		grid : {
			object: require("../components/demos/Grid"),
		},
		// stats : {
		// 	object: require("../components/utils/Stats")
		// }
	}
};