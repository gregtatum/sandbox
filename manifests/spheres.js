module.exports = {
	name : "Spheres",
	description : "Hello World",
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
		mouse : {
			function: require('../js/components/hids/mouse-tracker')
		},
		grid : {
			construct: require("../js/demos/Grid"),
		},
		spheres : {
			function: require('../js/demos/Spheres'),
			properties: {
				dispersion: 50,
				radius: 5,
				count: 10,
				mouseRef: "mouse"
			}
		}

		// cloudsTop : {
		// 	construct: require("../js/components/ambiance/Clouds"),
		// 	properties: {
		// 		width: 2000,
		// 		height: 1000,
		// 		rotation: -Math.PI / 2
		// 	}
		// },
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