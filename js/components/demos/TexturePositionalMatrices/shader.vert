attribute float size;
attribute vec3 customColor;
attribute float transformIndex;

uniform float time;
uniform sampler2D texture;
uniform sampler2D matricesTexture;
uniform float matricesTextureSize;

varying vec3 vColor;

vec3 wave;

mat4 getMatrixFromTexture( const in float i ) {

	float j = i * 4.0;
	float x = mod( j, float( matricesTextureSize ) );
	float y = floor( j / float( matricesTextureSize ) );

	float dx = 1.0 / float( matricesTextureSize );
	float dy = 1.0 / float( matricesTextureSize );

	y = dy * ( y + 0.5 );

	vec4 v1 = texture2D( matricesTexture, vec2( dx * ( x + 0.5 ), y ) );
	vec4 v2 = texture2D( matricesTexture, vec2( dx * ( x + 1.5 ), y ) );
	vec4 v3 = texture2D( matricesTexture, vec2( dx * ( x + 2.5 ), y ) );
	vec4 v4 = texture2D( matricesTexture, vec2( dx * ( x + 3.5 ), y ) );

	return mat4( v1, v2, v3, v4 );

}

void main() {

	vColor = customColor;
	
	mat4 transformMatrix = getMatrixFromTexture( transformIndex );
	
	vec4 mvPosition = modelViewMatrix * transformMatrix * vec4( position, 1.0 );

	gl_PointSize = size * ( 300.0 / length( mvPosition.xyz ) );

	gl_Position = projectionMatrix * mvPosition;

}