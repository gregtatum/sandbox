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
			object: require("../js/demos/SineGravityCloud"),
			properties: {
				count: 50 * 1000,
				pointSize : 4
			}
		},
		controls : {
			object: require("../js/components/cameras/Orientation"),
		},
		cameraRotation : {
			object: require("../js/components/cameras/RotateAroundOrigin"),
		},
		grid : {
			object: require("../js/demos/Grid"),
		}
	}
};