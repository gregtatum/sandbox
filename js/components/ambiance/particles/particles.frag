uniform vec3 color;
uniform sampler2D texture;
uniform float elapsed;

varying float vAlpha;

void main() {

	gl_FragColor = vec4(color, vAlpha) * texture2D( texture, gl_PointCoord );
	
}