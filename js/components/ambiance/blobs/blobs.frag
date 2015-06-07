precision highp float;

uniform float elapsed;
varying float vOffset;

vec2 doModel(vec3 p);

#pragma glslify: raytrace = require('glsl-raytrace', map = doModel, steps = 30)
#pragma glslify: normal = require('glsl-sdf-normal', map = doModel)
#pragma glslify: camera = require('glsl-turntable-camera')
#pragma glslify: noise = require('glsl-noise/simplex/4d')
#pragma glslify: cameraRay = require('glsl-camera-ray')

vec2 doModel(vec3 p) {
	float r  = 1.0 + noise(vec4(p, elapsed / 1000.0)) * 0.25;
	float d  = length(p) - r;
	float id = 0.0;

	return vec2(d, id);
}

vec2 squareFrame(vec2 screenSize, vec2 screenPosition) {
	vec2 position = 2.0 * (screenPosition.xy / screenSize.xy) - 1.0;
	position.x *= screenSize.x / screenSize.y;
	return position;
}


void orbitCamera(
	in float camAngle,
	in float camHeight,
	in float camDistance,
	in vec2 screenResolution,
	in vec2 screenPosition,
	out vec3 rayOrigin,
	out vec3 rayDirection
) {
	vec2 screenPos = squareFrame(screenResolution, screenPosition);
	vec3 rayTarget = vec3(0.0);
 
	rayOrigin = vec3(
		camDistance * sin(camAngle),
		camHeight,
		camDistance * cos(camAngle)
	);
 
	rayDirection = cameraRay(rayOrigin, rayTarget, screenPos, 2.0);
}


void main() {
	vec3 color = vec3(0.0);
	vec3 rayOrigin, rayDirection;

	float rotation = elapsed / 1000.0;
	float height   = 0.0;
	float dist     = 3.0;
	vec2 iResolution = vec2( 1.0, 1.0 );
	
	orbitCamera(rotation + vOffset * 100.0, height, dist, iResolution, gl_PointCoord, rayOrigin, rayDirection);

	vec2 t = raytrace(rayOrigin, rayDirection);
	if (t.x > -0.5) {
		vec3 pos = rayOrigin + rayDirection * t.x;
		vec3 nor = normal(pos);

		color = nor * 0.5 + 0.5;
	}

	gl_FragColor.rgb = color;
	gl_FragColor.a	 = length(color) * 10.0;
}

// Old shader:
//
// uniform vec3 color;
// uniform sampler2D texture;
// uniform float elapsed;
//
// varying float vAlpha;
//
// void main() {
//
// 	gl_FragColor = vec4(color, 1.0);
//
// }
// 