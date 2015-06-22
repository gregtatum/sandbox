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

					vec3 color = texture2D( texture, uv ).xyz;

					gl_FragColor = vec4( color, 1.0 );

				}
			`
		})
	)
	
	scene.add( mesh )
	
	return function copyTexture( input, output, textureSideLength ) {
		
		uniforms.texture.resolution.value.set( textureSideLength, textureSideLength )
		uniforms.texture.value = input
		renderer.render( scene, camera, output )
	}
}