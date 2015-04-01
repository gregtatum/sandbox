module.exports = {
	name : "Endless Terrain",
	description : "An ever-repeating environment",
	order : 0,
	config : {
		camera : {
			x : 0,
			z: 500,
			near : 0.1,
			fov : 40
		},
		renderer : {
			useEffects : false
		}
	},
	components : {
		pathCamera : {
			construct: require("../js/components/cameras/Path"),
		},
		animator : {
			function: require('../js/components/animator'),
			properties: {
				loop : true,
				speed : 0.5,
				keyframes : [
					{
						start:    0,
						duration: 5000,
						easing:   "cubicInOut",
						actions:  [
							[ "camera.object.position.x", [ 0,    0  ] ],
							[ "camera.object.position.y", [ 100, -100] ],
							[ "camera.object.position.z", [ 0,   -500] ],
							[ "pathCamera.rotation.y", [ 0, 0] ]
						]
					},
					{
						start:    5000,
						duration: 5000,
						easing:   "cubicInOut",
						actions:  [
							[ "camera.object.position.x", [  0  , -300 ] ],
							[ "camera.object.position.y", [ -100, 150 ] ],
							[ "camera.object.position.z", [ -500, -900 ] ],
							[ "pathCamera.rotation.y", [ 0, 0] ]
						]
					},
					{
						start:    10000,
						duration: 5000,
						easing:   "cubicInOut",
						actions:  [
							[ "camera.object.position.x", [ -300 ,     0] ],
							[ "camera.object.position.y", [  150  , -100] ],
							[ "camera.object.position.z", [ -900 , -1800] ]
						]
					}
				]
			}
		},
		endlessTerrain : {
			construct: require("../js/demos/EndlessTerrain/endless"),
			properties: {
				positionY: -250
			}
		},
		particles : {
			function: require('../js/components/ambiance/particles/particles'),
		},
		// constantMove : {
		// 	construct: require("../js/components/cameras/ConstantMove"),
		// 	properties: {
		// 		// z: -2
		// 		z: -1
		// 	}
		// },
		cloudsTop : {
			construct: require("../js/components/ambiance/Clouds"),
			properties: {
				height: 200,
				rotation: Math.PI / 2
			}
		},
		// stars : {
		// 	construct: require("../js/components/Stars"),
		// },
		// music : {
		// 	construct: require("../js/sound/Music"),
		// 	properties: {
		// 		url: "https://soundcloud.com/synaptyx/mech-attack"
		// 	}
		// },
		// stats : {
		// 	construct: require("../js/components/utils/Stats")
		// }
	}
};