#pragma glslify: random = require(glsl-random)

uniform float opacity;

uniform sampler2D tDiffuse;

varying vec2 vUv;

void main() {

	vec2 unitI_ToSide = (vUv * 2.0 - 1.0);
	
	unitI_ToSide = pow(unitI_ToSide, vec2(3.0, 5.0)) * random(vUv) * -0.01;

	vec4 texel = texture2D( tDiffuse, vUv );
	vec4 smallshift = texture2D( tDiffuse, vUv + unitI_ToSide * 0.5 );
	vec4 bigshift = texture2D( tDiffuse, vUv + unitI_ToSide );
	
	gl_FragColor = opacity * vec4( bigshift.x,  texel.y,  smallshift.z,  texel.w );

}