module.exports = {
	name : "MeshGroup() Pre-Cursor 1",
	description : "Position matrices set in uniforms",
	order : 51,
	config : {
		camera : {
			x : -400
		}
	},
	components : {
		renderer : { function : require('../js/renderers/basic-renderer') },
		controls : {
			construct: require("../js/components/cameras/Controls"),
		},
		uniformPositionalMatrices : {
			construct: require("../js/demos/uniformPositionalMatrices"),
		},
		grid : {
			construct: require("../js/demos/Grid"),
		},
		stats : {
			construct: require("../js/components/utils/Stats")
		}
	}
};