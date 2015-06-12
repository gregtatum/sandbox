var LightBeam = require('../js/components/ambiance/light-beam/light-beam')

module.exports = {
	name : "Light Beams",
	description : "Atmospheric Lighting",
	order : 0,
	config : {
		camera : {
			x : 0,
			z: 500,
			near : 0.1,
			fov : 40
		}
	},
	components : {
		renderer : { function : require('../js/renderers/basic-renderer') },
		// renderer : { function : require('../js/renderers/effects-renderer') },
		// controls : { construct: require("../js/components/cameras/Controls") },
		restrictedCamera : {
			construct: require("../js/components/cameras/RestrictedCamera"),
		},
		lightBeam1 : {
			function : LightBeam,
			properties: {
				position:    [100,-150,0],
				color:       0xaa6611,
				lightLength: 200,
			}
		},
		lightBeam2 : {
			function : LightBeam,
			properties: {
				position:    [100,-150,0],
				color:       0xcc4411,
				lightLength: 300,
			}
		},
		lightBeam4 : {
			function : LightBeam,
			properties: {
				position:    [100,-150,0],
				color:       0xff1111,
				lightLength: 250,
			}
		},
		lightBeam3 : {
			function : LightBeam,
			properties: {
				position:    [100,-150,0],
				color:       0xee2211,
				lightLength: 200,
			}
		},
		

		lightLeftBeam1 : {
			function : LightBeam,
			properties: {
				position:    [-100,-150,0],
				color:       0x11aa66,
				lightLength: 200,
			}
		},
		lightLeftBeam2 : {
			function : LightBeam,
			properties: {
				position:    [-100,-150,0],
				color:       0x11cc44,
				lightLength: 300,
			}
		},
		lightLeftBeam4 : {
			function : LightBeam,
			properties: {
				position:    [-100,-150,0],
				color:       0x11ff11,
				lightLength: 250,
			}
		},
		lightLeftBeam3 : {
			function : LightBeam,
			properties: {
				position:    [-100,-150,0],
				color:       0x11ee22,
				lightLength: 200,
			}
		},
		
		sky: {
			function: require('../js/components/ambiance/Sky'),
			properties : {
				width : 50
			}
		}
	},
};