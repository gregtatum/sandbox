module.exports = {
	name : "MeshGroup() Proof of Concept",
	description : "Batching multiple Three.js meshes into one draw call",
	order : 50,
	config : {
		camera : {
			x : -400
		}
	},
	objects : {
		demo : {
			object: require("../demos/MeshGroupBoxDemo"),
			properties: {}
		},
		controls : {
			object: require("../components/cameras/Controls"),
		},
		grid : {
			object: require("../demos/Grid"),
		},
		stats : {
			object: require("../components/utils/Stats")
		}
	}
};