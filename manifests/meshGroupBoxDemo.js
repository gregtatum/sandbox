module.exports = {
	name : "MeshGroup() Proof of Concept",
	description : "Batching multiple Three.js meshes into one draw call",
	order : 50,
	config : {
		camera : {
			x : -400
		}
	},
	components : {
		renderer : { function : require('../js/renderers/basic-renderer') },
		demo : {
			construct: require("../js/demos/MeshGroupBoxDemo"),
			properties: {}
		},
		controls : {
			construct: require("../js/components/cameras/Controls"),
		},
		grid : {
			construct: require("../js/demos/Grid"),
		},
		stats : {
			construct: require("../js/components/utils/Stats")
		}
	}
};