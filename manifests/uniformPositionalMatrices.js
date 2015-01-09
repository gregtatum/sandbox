module.exports = {
	name : "MeshGroup() Pre-Cursor 1",
	description : "Position matrices set in uniforms",
	order : 51,
	config : {
		camera : {
			x : -400
		}
	},
	objects : {
		controls : {
			object: require("../js/components/cameras/Controls"),
		},
		uniformPositionalMatrices : {
			object: require("../js/demos/uniformPositionalMatrices"),
		},
		grid : {
			object: require("../js/demos/Grid"),
		},
		stats : {
			object: require("../js/components/utils/Stats")
		}
	}
};