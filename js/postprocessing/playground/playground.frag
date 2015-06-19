#pragma glslify: random = require(glsl-random)

uniform float opacity;

uniform sampler2D tDiffuse;

varying vec2 vUv;

void main() {


	vec4 texel = texture2D( tDiffuse, vUv );
	
	gl_FragColor = opacity * vec4( texel.x, texel.y, texel.z, texel.w );

}