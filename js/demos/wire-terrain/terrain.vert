uniform sampler2D terrain;
uniform float heightFactor;
uniform float width;
uniform float elapsed;

varying float height;
varying vec2 vUv;
varying float vCameraDistance;

#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

void main() {

	vec4 modelPosition = modelMatrix * vec4(position, 1.0);
	
	vUv = vec2( modelPosition.x, modelPosition.z + elapsed * 0.05 ) / width;
		
	float mainHeightShape = texture2D( terrain, vUv * 0.3 ).w;
	float smallNoiseySurface = texture2D( terrain, vUv * 5.0 ).w;
	float amountOfSmallNoise = snoise3(vec3(
		modelPosition.x * 0.001 * sin( elapsed * 0.001 ),
		modelPosition.z * 0.001 * sin( elapsed * 0.001 ),
		elapsed * 0.0001
	));
	
	height = mainHeightShape + (
		smallNoiseySurface * smallNoiseySurface * amountOfSmallNoise
	);
	
	vCameraDistance = distance( modelPosition.xyz, cameraPosition );
	
	vec4 modifiedPosition = vec4(
		position.x,
		position.y + height * width / 20.0 * heightFactor,
		position.z,
		1.0
	);
	
	gl_Position = projectionMatrix * modelViewMatrix * modifiedPosition;
	
}