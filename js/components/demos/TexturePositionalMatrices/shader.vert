attribute float size;
attribute vec3 customColor;
attribute float transformIndex;

uniform float time;
uniform sampler2D texture;
uniform sampler2D matricesTexture;
uniform float matricesTextureSize;

varying vec3 vColor;

vec3 wave;

mat4 getBoneMatrix( const in float i ) {

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

	mat4 bone = mat4( v1, v2, v3, v4 );

	return bone;

}

mat4 getMatrixFromTexture( const in float i ) {

	float j = i * 4.0;
	
	float x = (mod( j, matricesTextureSize ) + 0.5);
	float y = (floor( j / matricesTextureSize ) + 0.5);
	
	float dx = 1.0;

	// return mat4(
	// 	1,0,0,0,
	// 	0,1,0,0,
	// 	0,0,1,0,
	// 	0,0,0,1
	// );

	return mat4(
		texture2D( matricesTexture, vec2( x				, y ) ),
		texture2D( matricesTexture, vec2( x + dx		, y ) ),
		texture2D( matricesTexture, vec2( x + dx * 2.0	, y ) ),
		texture2D( matricesTexture, vec2( x + dx * 3.0	, y ) )
	);
}

void main() {

	vColor = customColor;
	
	wave = position;
	
	// wave.y += sin( (position.x / (10.0 + transformIndex) ) + ( time / 150.0 ) ) * 2.0;
	// wave.y += sin( (position.z / (12.0 + transformIndex) ) + ( time / 160.0 ) ) * 2.0;
	// wave.y += sin( (position.x / (30.0 + transformIndex) ) + ( time / 120.0 ) ) * 5.0;
	// wave.y += sin( (position.z / (31.0 + transformIndex) ) + ( time / 130.0 ) ) * 5.0;

	mat4 transformMatrix = getBoneMatrix( transformIndex );
	
	vec4 mvPosition = modelViewMatrix * transformMatrix * vec4( position, 1.0 );

	gl_PointSize = size * ( 300.0 / length( mvPosition.xyz ) );

	gl_Position = projectionMatrix * mvPosition;

}