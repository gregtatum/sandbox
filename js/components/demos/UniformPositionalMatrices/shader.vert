
attribute float size;
attribute vec3 customColor;
attribute float transformIndex;

uniform float time;
uniform mat4 transformMatrix[ TRANSFORM_MATRIX_COUNT ];

varying vec3 vColor;

vec3 wave;

void main() {

	vColor = customColor;
	
	wave = position;
	
	wave.y += sin( (position.x / (10.0 + transformIndex) ) + ( time / 150.0 ) ) * 2.0;
	wave.y += sin( (position.z / (12.0 + transformIndex) ) + ( time / 160.0 ) ) * 2.0;
	wave.y += sin( (position.x / (30.0 + transformIndex) ) + ( time / 120.0 ) ) * 5.0;
	wave.y += sin( (position.z / (31.0 + transformIndex) ) + ( time / 130.0 ) ) * 5.0;

	vec4 mvPosition = modelViewMatrix * transformMatrix[ int(transformIndex) ] * vec4( wave, 1.0 );

	gl_PointSize = size * ( 300.0 / length( mvPosition.xyz ) );

	gl_Position = projectionMatrix * mvPosition;

}