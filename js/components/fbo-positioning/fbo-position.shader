uniform float textureSideLength;

uniform sampler2D textureCurrPosition;
uniform sampler2D texturePrevPosition;


void main() {
	
	vec2 uv = gl_FragCoord.xy / textureSideLength;
	vec4 currPosition = texture2D( textureCurrPosition, uv );
	vec4 prevPosition = texture2D( texturePrevPosition, uv );

	vec3 velocity = currPosition.xyz - prevPosition.xyz;
	vec3 toOrigin = normalize(-1.0 * currPosition.xyz);
	vec3 orientation = normalize( velocity );
	vec3 newOrientation = normalize( mix( toOrigin, orientation, 0.93 ) );
	newOrientation += vec3(0.0001, 0.0001, 0.0001);
	float velocityLength = length( velocity );
	float toOriginLength = length( currPosition.xyz );
	
	gl_FragColor = vec4(
		currPosition.xyz + newOrientation * 0.02,
		1.0
	);
}