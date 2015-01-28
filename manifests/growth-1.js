module.exports = {
	name : "Growth #1",
	description : "Growing a tree",
	order : 0,
	config : {
		camera : {
			z : -150,
			y : 100
		}
	},
	components : {
		controls : {
			construct: require("../js/components/cameras/Controls"),
		},
		treeGrowth : {
			function: require("../js/demos/treeGrowth"),
		},
		grid : {
			construct: require("../js/demos/Grid"),
		},
		stats : {
			construct: require("../js/components/utils/Stats")
		}
	}
};