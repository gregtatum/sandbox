module.exports = {
	config : {
		
	},
	objects : {
		// sphere : {
		// 	object: require("../components/demos/Spheres"),
		// 	properties: {
		// 		count : 50,
		// 		dispersion : 120,
		// 		radius : 10
		// 	}
		// },
		controls : {
			object: require("../components/cameras/Controls"),
		},
		pointcloud : {
			object: require("../components/demos/PointCloud"),
		},
		grid : {
			object: require("../components/demos/Grid"),
		},
		stats : {
			object: require("../components/utils/Stats")
		}
	}
};