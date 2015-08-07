module.exports = function copyTextureFn( renderer ) {
	
	var camera = new THREE.Camera()
	camera.position.z = 1
	
	var scene = new THREE.Scene()
	
	var mesh = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( 2, 2 ),
		new THREE.ShaderMaterial( {

			uniforms: {
				resolution: { type: "v2", value: new THREE.Vector2() },
				texture: { type: "t", value: null }
			},

			vertexShader: `
				void main()	{
					gl_Position = vec4( position, 1.0 );
				}
			`,

			fragmentShader: `
				uniform vec2 resolution;
				uniform sampler2D texture;

				void main()	{

					vec2 uv = gl_FragCoord.xy / resolution.xy;

					vec4 color = texture2D( texture, uv );

					gl_FragColor = vec4( color.xyz, 1.0 );

				}
			`
		})
	)
	
	scene.add( mesh )
	
	var uniforms = mesh.material.uniforms
	
	return function copyTexture( input, output, textureSideLength ) {
		
		uniforms.resolution.value.set( textureSideLength, textureSideLength )
		uniforms.texture.value = input
		renderer.render( scene, camera, output )
	}
}