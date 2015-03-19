module.exports = {
	name : "Tetrahedra",
	description : "Live coding demo",
	order : 0,
	config : {
		camera : {
			x : -300,
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
		// grid : {
		// 	construct: require("../js/demos/Grid"),
		// },
		tetrahedra : {
			function: require('../js/demos/tetrahedra'),
			properties: {
				dispersion: 150,
				radius: 10,
				count: 100,
				mouseRef: "mouse"
			}
		},
		lights : {
			construct: require("../js/components/lights/TrackCameraLights")
		},

		cloudsTop : {
			construct: require("../js/components/ambiance/Clouds"),
			properties: {
				width: 2000,
				height: 1000,
				rotation: -Math.PI / 2
			}
		},

		cloudsBottom : {
			construct: require("../js/components/ambiance/Clouds"),
			properties: {
				width: 2000,
				height: -1000,
				rotation: -Math.PI / 2,
				offset		: new THREE.Vector2(-0.3,0.8),
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