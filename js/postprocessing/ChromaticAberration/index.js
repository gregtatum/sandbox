var glslify = require('glslify');

var chromaticAberrationShader = new THREE.ShaderMaterial({
	vertexShader: glslify('./chromatic.vert'),
	fragmentShader: glslify('./chromatic.frag'),
	uniforms: {
		opacity: { type: 'f', value: 1 },
	}
})

module.exports = chromaticAberrationShader;
