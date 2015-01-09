module.exports = {
	name : "Endless Terrain",
	description : "An ever-repeating environment",
	order : 0,
	config : {
		camera : {
			x : -400,
			near : 0.1,
			fov : 40
		},
		renderer : {
			useEffects : true
		}
	},
	objects : {
		endlessTerrain : {
			object: require("../js/demos/EndlessTerrain"),
			properties: {
				positionY: -250
			}
		},
		swivelCamera : {
			object: require("../js/components/cameras/Swivel"),
		},
		constantMove : {
			object: require("../js/components/cameras/ConstantMove"),
			properties: {
				z: -2
			}
		},
		cloudsTop : {
			object: require("../js/components/ambiance/Clouds"),
			properties: {
				height: 200,
				rotation: Math.PI / 2
			}
		},
		music : {
			object: require("../js/sound/Music"),
			properties: {
				url: "https://soundcloud.com/synaptyx/mech-attack"
			}
		}
		// stats : {
		// 	object: require("../js/components/utils/Stats")
		// }
	}
};