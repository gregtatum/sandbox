varying float vLighting;
varying float vAttributeIndex;

#pragma glslify: hsl2rgb = require(glsl-hsl2rgb) 

void main() {
	
	gl_FragColor = vec4(
		hsl2rgb( mod(0.5 + vAttributeIndex * 0.000002, 1.0), 0.8, 0.5 ),
		1.0
	) * vLighting;
}