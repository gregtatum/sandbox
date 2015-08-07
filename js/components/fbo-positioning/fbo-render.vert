uniform float elapsed;

uniform float textureSideLength;
uniform sampler2D textureCurrPosition;
uniform sampler2D texturePrevPosition;

attribute float attributeIndex;

varying float vLighting;
varying float vAttributeIndex;

void main() {
	
	vec2 positionLookup = vec2(
		mod(attributeIndex, textureSideLength),
		floor(attributeIndex / textureSideLength)
	) / textureSideLength;
	
	vec3 currPosition = texture2D( textureCurrPosition, positionLookup ).xyz;
	vec3 prevPosition = texture2D( texturePrevPosition, positionLookup ).xyz;
	
	float theta = log(attributeIndex) * 8.0;
	float r = attributeIndex * 2.0;
	
	vec4 offset = vec4( r * sin(theta), r * cos(theta), 0.0, 0.0 );
	
	vLighting = dot( normal, normalize(cameraPosition - position) );
	vLighting = vLighting * 0.5 + 0.5;
	
	vAttributeIndex = attributeIndex;
	
	gl_Position =
		projectionMatrix *
		modelViewMatrix * (
			vec4( position, 1.0 ) + offset * 0.0 + vec4( currPosition * 100.0, 0 )
		);
}