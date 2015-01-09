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
			object: require("../js/demos/MeshGroupBoxDemo"),
			properties: {}
		},
		controls : {
			object: require("../js/components/cameras/Controls"),
		},
		grid : {
			object: require("../js/demos/Grid"),
		},
		stats : {
			object: require("../js/components/utils/Stats")
		}
	}
};