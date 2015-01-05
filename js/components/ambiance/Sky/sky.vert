uniform float time;
varying vec4 vColor;
varying vec2 vUv;

#pragma glslify: simplex4 = require(glsl-noise/simplex/4d)
#pragma glslify: hsv2rgb = require(glsl-hsv2rgb)

float inRange( in float value, in float start, in float stop ) {
	
	return min( 1.0, max( 0.0,
		(value - start) / (stop - start)
	));
	
}

vec4 calculateColor( in vec2 uv, in vec3 position ) {
	
	float gradient =
		inRange( uv.y, 0.55, 0.7 ) +
		inRange( uv.y, 0.45, 0.3 ) ;
	
	float noise = simplex4( vec4( position * 0.03, time * 0.0001 ) );
	
	vec3 color = hsv2rgb(vec3(
		max(0.0, noise) * 0.2 + 0.4,
		1.0,
		1.0
	));
	
	return vec4(
		color,
		noise * gradient
	);
	
}

void main() {
	
	vUv = uv;
	
	vColor = calculateColor( uv, position );
	
	gl_Position = projectionMatrix *
		modelViewMatrix *
		vec4( position, 1.0);
		
}