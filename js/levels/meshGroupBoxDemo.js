module.exports = {
	config : {
		camera : {
			x : -400
		}
	},
	objects : {
		demo : {
			object: require("../components/demos/MeshGroupBoxDemo"),
			properties: {}
		},
		controls : {
			object: require("../components/cameras/Controls"),
		},
		grid : {
			object: require("../components/demos/Grid"),
		},
		stats : {
			object: require("../components/utils/Stats")
		}
	}
};