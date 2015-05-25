#pragma glslify: hsv2rgb = require(glsl-hsv2rgb)
uniform float width;
uniform float heightFactor;
uniform float elapsed;

varying float height;
varying vec2 vUv;
varying float vCameraDistance;

void main() {
	
	float hueX = abs(0.5 - fract(vUv.x * 2.0)) * 2.0;
	float hueY = abs(0.5 - fract(vUv.y * 2.0)) * 2.0;
	
	float waveSpeed = 0.0005;
	float waveLength = 0.0001;
	float wave = mod((vCameraDistance * waveLength + elapsed * waveSpeed), 1.0);
	
    gl_FragColor = vec4(
		hsv2rgb(
			vec3(
				// mod(xHue, 1.0),
				(hueX + hueY) * 0.1 + 0.25,
				mix(heightFactor, mix(height, 0.5, 0.8), 0.8),
				mix(heightFactor, mix(height, 1.2, 0.35), 0.35)
			)
		),
		1.0 - wave + 0.2
	);
	
	float fogFactor = smoothstep( 0.0, 1.0, vCameraDistance / width );
	vec3 fogColor = vec3( 0.14, 0.14, 0.14 );

	gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );
	
}