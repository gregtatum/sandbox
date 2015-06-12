module.exports = {
	name : "MeshGroup() Pre-Cursor 2",
	description : "Position matrices packed into a texture",
	order : 52,
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
		texturePositionalMatrices : {
			construct: require("../js/demos/texturePositionalMatrices"),
		},
		grid : {
			construct: require("../js/demos/Grid"),
		},
		stats : {
			construct: require("../js/components/utils/Stats")
		}
	}
};