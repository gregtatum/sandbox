module.exports = {
	config : {
		vr : true,
		camera : {
			x : -300,
			fov : 70
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