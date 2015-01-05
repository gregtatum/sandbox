uniform float time;
uniform vec4 color;
uniform vec2 offset;
uniform sampler2D texture;

varying vec2 vUv;

void main() {
	
	vec4 texel = 
		texture2D( texture, vUv * 0.1 + ( offset + time * 0.00001) * offset ) +
		texture2D( texture, vUv * 0.22 + ( offset + time * 0.0000055) * offset );
	
	float edges = 0.5 - length(vUv - 0.5);
	
	gl_FragColor = color * edges * vec4( 1.0, 1.0, 1.0, texel.w * texel.w * 2.5 );
	
}