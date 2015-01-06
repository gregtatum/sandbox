var glslify = require('glslify');
var createShader = require('three-glslify')(THREE);

var shader = createShader( glslify({
	vertex: './chromatic.vert',
	fragment: './chromatic.frag',
	sourceOnly: true
}));

shader.uniforms.opacity.value = 1;

module.exports = shader;
