# three.js GPU Processor

### Usage

	var gpuProcessor = GpuProcessor( renderer )
	
	gpuProcessor.addPass( "velocity", { ... })
	
	gpuProcessor.addPass( "position", {
		
		size              : 100,           // Number of vectors in data
		stride            : 4,             // Dimensions of vectors, either 3 or 4
		uniformName       : "positionTexture",
		shaderMaterial    : shaderMaterial,
		
		generateDatum     : function( data, i ) {
			//Generate one vector datum point
			data[i+0] = Math.random()
			data[i+1] = Math.random()
			data[i+2] = Math.random()
			data[i+3] = Math.random()
		},
			
		preRender         : function( pass, passes ) {
			shaderMaterial.uniforms.velocityTexture = passes.velocity.inputRenderTarget
		}
	})
		
	gpuProcessor.render()

# GpuProcessor basics

The GpuProcessor factory function requires a THREE.WebGLRenderer and will return a gpuProcessor object.

	var gpuProcessor = GpuProcessor( renderer )

#### gpuProcessor.render()

Render all of the passes

#### gpuProcessor.renderPass( nameOrPass ) - string | pass object

Render a single pass. Accepts the name of the pass, or a pass object.

#### gpuProcessor.addPass( name, config )

Adds a pass to be rendered. The name is a string, and the config is an object defined below. The pass object is returned.

## gpuProcessor.addPass `config` parameter

	var config = {
		size              : 100,
		stride            : 4,
		generateDatum     : function() {}
		preRender         : function() {},
		postRender        : function() {},
		uniformName       : "texture",
		autoUpdateUniform : true,
		shaderMaterial    : THREE.ShaderMaterial,
	}

#### size - integer

Number of vectors in the data

#### stride - integer (default: 4)

Dimensions of vectors in the data, either 3 or 4

#### generateDatum( data, i ) - function

Loops through the data and provides the i at the current position and stride of the data. The data is the Float32Array and the i is the increment including the stride, e.g. 0, 4, 8, 12 for stride 4.

	var generateDatum = function( data, i ) {
		//Generate one vector datum point
		data[i+0] = Math.random()
		data[i+1] = Math.random()
		data[i+2] = Math.random()
		data[i+3] = Math.random()
	}

#### preRender( currentPass, allPasses ) - function

Perform some action before rendering, typically setting up uniforms with current pass information.

	var preRender = function( pass, passes ) {
		shaderMaterial.uniforms.velocityTexture = passes.velocity.inputRenderTarget
	}

#### postRender( currentPass, allPasses ) - function

Perform some action after rendering.

#### autoUpdateUniform - boolean (default: true)

Automatically update the ShaderMaterial's uniform with the input texture according to the `uniformName`

#### uniformName - string (default: "texture")

If `autoUpdateUniform` is true, then update the ShaderMaterial's uniform with the input texture.

#### shaderMaterial - THREE.ShaderMaterial

The current ShaderMaterial for rendering the pass.
 

# Pass Object

#### inputRenderTarget - THREE.RenderTarget

The current input texture (render target) that will be set to the shaderMaterial uniform.

#### outputRenderTarget - THREE.RenderTarget

The current output texture (render target) that will receive the results of this pass.

### flip()

Flips between the input and output texture. Called automatically by `gpuProcessor.render()`.

#### renderTargets - array

The two render targets that get flip flopped between inputRenderTarget and outputRenderTarget.

#### size - integer

The total count of vectors as set from `gpuProcessor.addPass()`.

#### stride - integer

The dimensions of vector as set from `gpuProcessor.addPass()`.

#### preRender - function

The preRender function as set from `gpuProcessor.addPass()`.

#### shaderMaterial - THREE.ShaderMaterial

The shader material as set from `gpuProcessor.addPass()`.

#### uniformName - string

The name of the uniform as set from `gpuProcessor.addPass()`.












