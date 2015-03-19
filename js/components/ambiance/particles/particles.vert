attribute float size;
attribute vec3 offset;

void main() {

	vec4 mvPosition = modelViewMatrix * vec4( offset, 1.0 );

	gl_PointSize = size * ( 300.0 / (length( mvPosition.xyz ) + 1.0) );

	gl_Position = projectionMatrix * mvPosition;

}