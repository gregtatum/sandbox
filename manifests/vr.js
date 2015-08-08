module.exports = {
	name : "VR Demo",
	description : "The Sine Gravity wave as a VR demo",
	order : 0,
	config : {
		camera : {
			x : -300,
			fov : 70
		},
	},
	components : {
		
		renderer :       { function : require('../js/renderers/cardboard-renderer') },
		controls :       { construct: require("../js/components/cameras/Orientation") },
		cameraRotation : { construct: require("../js/components/cameras/RotateAroundOrigin") },
		grid :           { construct: require("../js/demos/Grid") },
		
		pointcloud : {
			construct: require("../js/demos/sine-gravity-cloud/sine"),
			properties: {
				count: 50 * 1000,
				pointSize : 4
			}
		},
	}
};