uniform float elapsed;

attribute float size;
attribute float opacity;

varying float vAlpha;

#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

void main() {

	vAlpha = opacity;

	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
	
	gl_PointSize = 100.0 * size / length( mvPosition.xyz );
	
	gl_Position = projectionMatrix * mvPosition;
}