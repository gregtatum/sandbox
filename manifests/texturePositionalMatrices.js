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
			object: require("../js/components/cameras/Controls"),
		},
		texturePositionalMatrices : {
			object: require("../js/demos/texturePositionalMatrices"),
		},
		grid : {
			object: require("../js/demos/Grid"),
		},
		stats : {
			object: require("../js/components/utils/Stats")
		}
	}
};