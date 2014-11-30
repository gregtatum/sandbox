attribute float size;
attribute float transformMatrixIndex;

uniform float time;
uniform sampler2D texture;
uniform sampler2D matricesTexture;
uniform float matricesTextureWidth;

vec3 wave;

mat4 getMatrixFromTexture( const in float i ) {

	float j = i * 4.0;
	float x = mod( j, float( matricesTextureWidth ) );
	float y = floor( j / float( matricesTextureWidth ) );

	float dx = 1.0 / float( matricesTextureWidth );
	float dy = 1.0 / float( matricesTextureWidth );

	y = dy * ( y + 0.5 );

	vec4 v1 = texture2D( matricesTexture, vec2( dx * ( x + 0.5 ), y ) );
	vec4 v2 = texture2D( matricesTexture, vec2( dx * ( x + 1.5 ), y ) );
	vec4 v3 = texture2D( matricesTexture, vec2( dx * ( x + 2.5 ), y ) );
	vec4 v4 = texture2D( matricesTexture, vec2( dx * ( x + 3.5 ), y ) );

	return mat4( v1, v2, v3, v4 );

	// Debug:
	// return mat4(
	// 	1.0, 0.0, 0.0, 0.0,
	// 	0.0, 1.0, 0.0, 0.0,
	// 	0.0, 0.0, 1.0, 0.0,
	// 	0.0, 0.0, 0.0, 1.0
	// );
}

void main() {

	mat4 transformMatrix = getMatrixFromTexture( transformMatrixIndex );
	
	vec4 mvPosition = modelViewMatrix * transformMatrix * vec4( position, 1.0 );

	gl_PointSize =  300.0 / length( mvPosition.xyz );

	gl_Position = projectionMatrix * mvPosition;

}