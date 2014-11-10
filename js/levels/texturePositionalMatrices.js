module.exports = {
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
			object: require("../components/demos/texturePositionalMatrices"),
		},
		grid : {
			object: require("../components/demos/Grid"),
		},
		stats : {
			object: require("../components/utils/Stats")
		}
	}
};