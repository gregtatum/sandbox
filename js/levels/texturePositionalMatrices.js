module.exports = {
	name : "MeshGroup() Pre-Cursor 2",
	description : "Position matrices packed into a texture",
	order : 52,
	config : {
		camera : {
			x : -400
		}
	},
	objects : {
		controls : {
			object: require("../components/cameras/Controls"),
		},
		texturePositionalMatrices : {
			object: require("../demos/texturePositionalMatrices"),
		},
		grid : {
			object: require("../demos/Grid"),
		},
		stats : {
			object: require("../components/utils/Stats")
		}
	}
};