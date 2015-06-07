module.exports = {
	name : "Blobs",
	description : "Raycasting",
	order : 3,
	config : {
		camera : {
		},
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
		blobs : {
			function: require('../js/components/ambiance/blobs/blobs')
		}
	}
};