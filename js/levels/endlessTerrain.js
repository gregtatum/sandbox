module.exports = {
	config : {
		camera : {
			x : -400
		}
	},
	objects : {
		endlessTerrain : {
			object: require("../demos/EndlessTerrain"),
		},
		endlessCamera : {
			object: require("../demos/EndlessTerrain/camera"),
		},
		sky : {
			object: require("../components/ambiance/Sky"),
			properties: {
				width: 10000
			}
		},
		cloudsBottom : {
			object: require("../components/ambiance/Clouds"),
			properties: {
				height: -200,
				rotation: Math.PI / 2
			}
		}
		// stats : {
		// 	object: require("../components/utils/Stats")
		// }
	}
};