#define PI 3.141592653589793
#define TWOPI 6.283185307179586

varying vec4 vColor;
varying vec2 vUv;
uniform float time;

#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

float remap( in float value, in float start, in float stop ) {
	return start + value * ( stop - start );
}

float inRange( in float value, in float start, in float stop ) {
	
	return min( 1.0, max( 0.0,
		(value - start) / (stop - start)
	));
	
}

float generateClouds( in vec2 vUv, in float time ) {
	
	return snoise3( 10.0 * vec3(
		sin( vUv.x * PI ) * 0.5,
		vUv.y,
		time
	));
	
}


void main() {
	
	float timeScaled = time * 0.00001;
	
	float brightness =
		inRange( vUv.y, 0.4, 0.6 ) *
		mix( sin( vUv.x * 10.0 * TWOPI ), 1.0, 0.2 );
		
	brightness += generateClouds( vUv, timeScaled );
	
	vec4 cloudColor = vec4(
		0.0,
		0.3 * brightness,
		0.3 * brightness,
		0.1
	);
	
	vec4 noise = vec4(
		snoise3( vec3( 10.0, 10.0, timeScaled ) ),
		snoise3( vec3( 10.0, 10.0, timeScaled ) ),
		snoise3( vec3( 10.0, 10.0, timeScaled ) ),
		1.0
	);
	
	gl_FragColor = vColor + cloudColor * noise;
	
}