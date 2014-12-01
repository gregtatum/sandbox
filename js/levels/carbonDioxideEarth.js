module.exports = {
	config : {
		camera : {
			x : -400,
			far : 3000
		}
	},
	objects : {
		sphere : {
			object: require("../demos/Earth"),
			properties: {}
		},
		controls : {
			object: require("../components/cameras/Controls"),
			properties: {
				minDistance : 500,
				maxDistance : 1000,
				zoomSpeed : 0.1,
				autoRotate : true,
				autoRotateSpeed : 0.2
			}
		},
		info : {
			object: require("../components/Info"),
			properties : {
				documentTitle : "Earth's CO2 – a Three.js Visualization adapted by Greg Tatum",
				title : "Earth's CO2",
				subtitle : "3d Visualisation of a map from NASA",
				appendCredits : "<br/> Map visualization by <a href='http://svs.gsfc.nasa.gov/cgi-bin/details.cgi?aid=11719'>NASA's Goddard Space Flight Center</a>",
				titleCss : { "font-size": "3.35em" },
				subtitleCss : {	"font-size": "0.7em" },
				showArrowNext : true
			}
		},
		stars : {
			object: require("../components/Stars"),
		},
		// stats : {
		// 	object: require("../components/utils/Stats")
		// },
		lights : {
			object: require("../components/lights/TrackCameraLights")
		}
	}
};