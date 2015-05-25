module.exports = {
	name : "Cubic",
	description : "An Cubican Experiment",
	order : 0,
	config : {
		camera : {
			x : 0,
			z: 500,
			near : 0.1,
			fov : 40
		},
		renderer : {
			useEffects : true,
			clearColor : 0x222222
		}
	},
	components : {
		restrictedCamera : {
			construct: require("../js/components/cameras/RestrictedCamera"),
		},
		wireTerrain : {
			construct: require("../js/demos/wire-terrain/terrain"),
			properties: {
				positionY: -250
			}
		},
		particles : {
			function: require('../js/components/ambiance/particles/particles'),
		},
		sky: {
			function: require('../js/components/ambiance/Sky'),
			properties : {
				width : 50
			}
		},
		// cloudsTop : {
		// 	construct: require("../js/components/ambiance/Clouds"),
		// 	properties: {
		// 		height: 200,
		// 		rotation: Math.PI / 2
		// 	}
		// },
		// music : {
		// 	construct: require("../js/sound/Music"),
		// 	properties: {
		// 		url: "https://soundcloud.com/synaptyx/mech-attack"
		// 	}
		// },
		// animator : {
		// 	function: require('../js/components/animator'),
		// 	properties: require('../js/demos/EndlessTerrain/keyframes.js')
		// },
		// stats : {
		// 	construct: require("../js/components/utils/Stats")
		// }
	}
};