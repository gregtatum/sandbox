var CubicBezier = require('cubic-bezier')
var QuickIn = CubicBezier(.12,.51,.8,.89,   32)
var Pi = Math.PI

module.exports = [
	// {
	// 	start:    0,
	// 	duration: 15,
	// 	easing:   QuickIn,
	// 	actions:  [
	// 		[ "camera.object.position.x", [    0,     0  ] ],
	// 		[ "camera.object.position.y", [ -250,     0  ] ],
	// 		[ "camera.object.position.z", [    0, -5000  ] ],
	// 		[ "endlessTerrain.height",    [    0,     1  ] ],
	//
	// 		[ "pathCamera.setRotation",   { x:0, y:Pi*0.4, z:-Pi*0.2 }],
	//
	// 		[ "pathCamera.rotation.z",    [ -Pi*0.2, 0 ] ],
	// 		[ "pathCamera.rotation.y",    [  Pi*0.4, -Pi*0.1 ] ]
	// 	]
	// },
	{
		start:    1,
		duration: 10,
		easing:   "cubicOut",
		actions:  [
			[ "camera.object.position.x", [     0,     0 ] ],
			[ "camera.object.position.y", [     0,     0 ] ],
			[ "camera.object.position.z", [ -5000, -5500 ] ],
			
			[ "pathCamera.setRotation",   { x:0, y:(Pi*0.6), z: 0 }],
			
			// [ "pathCamera.rotation.y",    [ Pi*0.6, Pi*0.4 ] ]
			
		]
	},
	// {
	// 	start:    15,
	// 	duration: 50,
	// 	easing:   "cubicInOut",
	// 	actions:  [
	// 		[ "camera.object.position.x", [ -300 ,     0] ],
	// 		[ "camera.object.position.y", [  150  , -100] ],
	// 		[ "camera.object.position.z", [ -900 , -1800] ]
	// 	]
	// }
]