varying vec4 vColor;

// float remap( in float value, in float start, in float stop ) {
// 	return start + value * ( stop - start );
// }

void main() {
	
	gl_FragColor = vColor;
	
}