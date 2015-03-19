module.exports = {
	name : "Green Blocks",
	description : "A Live Coding Demo",
	order : 0,
	config : {
		camera : {
			x : -100,
			near : 0.1,
			far : 10000,
			fov : 40
		},
		renderer : {
			useEffects : true
		}
	},
	components : {
		controls : {
			construct: require("../js/components/cameras/Controls"),
		},
		cloudsTop : {
			construct: require("../js/components/ambiance/Clouds"),
			properties: {
				width: 2000,
				height: 1000,
				rotation: -Math.PI / 2
			}
		},
		grid : {
			construct: require("../js/demos/Grid"),
		},
		spheres : {
			construct: require('../js/demos/Spheres'),
			properties: {
				dispersion: 50,
				radius: 5,
				count: 10
			}
		}
		
		// music : {
		// 	construct: require("../js/sound/Music"),
		// 	properties: {
		// 		url: "https://soundcloud.com/synaptyx/mech-attack"
		// 	}
		// }
		// stats : {
		// 	construct: require("../js/components/utils/Stats")
		// }
	}
};