var CubicBezier = require('cubic-bezier')
var QuickIn = CubicBezier(.12,.51,.8,.85,   32)
var Pi = Math.PI
var HalfPi = Math.PI / 2

module.exports = {
	loop : true,
	speed : 1,
	keyframes : [
		{
			duration: 15,
			easing:   QuickIn,
			actions:  [
				[ "camera.object.position.x",     [    0,     0 ] ],
				[ "camera.object.position.y",     [ -250,     0 ] ],
				[ "camera.object.position.z",     [    0, -5000 ] ],
				[ "camera.setAndUpdateFov",       [   5,    30 ] ],
				[ "endlessTerrain.height",        [    0,     1 ] ],
				[ "restrictedCamera.rotation.x",  [ -0.3,     0 ] ],
				[ "restrictedCamera.rotation.y",  [ -0.3,   0.1 ] ],

				[ "restrictedCamera.rotateAll",   { x:-0.3, y:-0.3, z:0 }],

			]
		},
		{
			duration: 10,
			easing:   "linear",
			isolate: false,
			startHere: false,
			actions:  [
				[ "camera.object.position.x", [     0,     0 ] ],
				[ "camera.object.position.y", [     0,     0 ] ],
				[ "camera.object.position.z", [ -5000, -5700 ] ],
				[ "camera.setAndUpdateFov",       [   70,    40 ] ],
			
				[ "restrictedCamera.rotateAll",   { x:-0.1, y:HalfPi, z: 0 }]
			]
		},
		{
			duration: 13,
			easing:   "linear",
			isolate: false,
			actions:  [
				[ "camera.object.position.x", 600 ],
				[ "camera.object.position.y", [     0,     0 ] ],
				[ "camera.object.position.z", [ -5700, -6000 ] ],
				[ "camera.setAndUpdateFov",   [   100,    50 ] ],
			
				[ "restrictedCamera.rotateAll",   { x:-Pi*0.5, y:0, z: 0 }],

				[ "restrictedCamera.rotation.x",    [  -Pi*0.5, 0 ] ]
			
			]
		},
		{
			duration: 10,
			easing:   "linear",
			isolate: false,
			actions:  [
				[ "camera.object.position.x", 600 ],
				[ "camera.object.position.y", [     0,     0 ] ],
				[ "camera.object.position.z", [ -5700, -6400 ] ],
			
				[ "restrictedCamera.rotateAll",   { x:0, y:Pi, z: 0 }],

				// [ "restrictedCamera.rotation.x",    [  -0.2, 0.2 ] ]
			
			]
		}
	]
}