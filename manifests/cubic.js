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
		}
	},
	components : {
		renderer : { function : require('../js/renderers/effects-renderer') },
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
		music : {
			construct: require("../js/sound/Music"),
			properties: {
				url: "https://soundcloud.com/cabbibo/that-was-just-stupidly"
			}
		},
		dragScroll : {
			function: require('../js/components/utils/drag-scroll')			
		},
		sky: {
			function: require('../js/components/ambiance/Sky'),
			properties : {
				width : 50
			}
		},
	}
};