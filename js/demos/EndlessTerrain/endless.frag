#pragma glslify: hsv2rgb = require(glsl-hsv2rgb)
uniform float width;

varying float height;
varying vec2 vUv;
varying float vCameraDistance;

void main() {
	
	float invDistort = 1.0 - height;
	
	float xHue = abs(0.5 - vUv.x) * 2.0;
	float yHue = abs(0.5 - vUv.y) * 2.0;
	
    gl_FragColor = vec4(
		hsv2rgb( vec3(
				(xHue + yHue) * 0.2 + 0.3,
				mix(height, 0.5, 0.8),
				mix(height, 1.0, 0.35)
			)
		),
		1.0
	);
	
	float fogFactor = smoothstep( 0.0, 1.0, vCameraDistance / width );
	vec3 fogColor = vec3( 0.125, 0.125, 0.125 );
	
	gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );
	
}