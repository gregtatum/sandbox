var glslify = require('glslify');

var playground = new THREE.ShaderMaterial({
	vertexShader: glslify('./playground.vert'),
	fragmentShader: glslify('./playground.frag'),
	uniforms: {
		opacity: { type: 'f', value: 1 },
		tDepth:  { type: "t", value: null },
	}
})

module.exports = playground;
