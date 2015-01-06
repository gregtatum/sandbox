module.exports = {
	name : "VR Demo",
	description : "The Sine Gravity wave as a VR demo",
	order : 0,
	config : {
		camera : {
			x : -300,
			fov : 70
		},
		renderer : {
			useVR : true
		}
	},
	objects : {
		pointcloud : {
			object: require("../demos/SineGravityCloud"),
			properties: {
				count: 50 * 1000,
				pointSize : 4
			}
		},
		controls : {
			object: require("../components/cameras/Orientation"),
		},
		cameraRotation : {
			object: require("../components/cameras/RotateAroundOrigin"),
		},
		grid : {
			object: require("../demos/Grid"),
		}
	}
};