uniform sampler2D terrain;
uniform float heightScale;
uniform float width;

varying float height;
varying vec2 vUv;
varying float vCameraDistance;

void main() {

	vec4 modelPosition = modelMatrix * vec4(position, 1.0);
	
	vUv = mod( vec2( modelPosition.x, modelPosition.z ), width ) / width;

	height = texture2D( terrain, vUv ).w;
	
	
	vCameraDistance = distance( modelPosition.xyz, cameraPosition );
	
	vec4 modifiedPosition = vec4(
		position.x,
		position.y + height * heightScale,
		position.z,
		1.0
	);
	
	gl_Position = projectionMatrix * modelViewMatrix * modifiedPosition;
	
}