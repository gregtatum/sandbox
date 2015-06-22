uniform float elapsed;

attribute float attributeIndex;

void main() {
	
	gl_Position =
		projectionMatrix *
		modelViewMatrix * (
			vec4( position, 1.0) + vec4( attributeIndex * 100.0, 0.0, 0.0, 0.0 )
		);
}