module.exports = {
	name : "Blobs",
	description : "Raycasting",
	order : 3,
	config : {
		camera : {},
	},
	components : {
		renderer : { function : require('../js/renderers/basic-renderer') },
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