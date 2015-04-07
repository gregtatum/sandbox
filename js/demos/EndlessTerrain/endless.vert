uniform sampler2D terrain;
uniform float heightFactor;
uniform float width;

varying float height;
varying vec2 vUv;
varying float vCameraDistance;

void main() {

	vec4 modelPosition = modelMatrix * vec4(position, 1.0);
	
	vUv = vec2( modelPosition.x, modelPosition.z ) / width;

	height = texture2D( terrain, vUv * 0.3 ).w;
	
	vCameraDistance = distance( modelPosition.xyz, cameraPosition );
	
	
	vec4 modifiedPosition = vec4(
		position.x,
		position.y + height * width / 20.0 * heightFactor,
		position.z,
		1.0
	);
	
	gl_Position = projectionMatrix * modelViewMatrix * modifiedPosition;
	
}