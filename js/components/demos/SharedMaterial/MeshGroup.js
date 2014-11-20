var calculateSquaredTextureWidth = require('../../../utils/calculateSquaredTextureWidth');

var MeshGroup = function() {
	
	THREE.Object3D.call( this );
	
	this.type = 'MeshGroup';
	this.geometry = null;
	
	this.matricesTextureWidth = null;
	this.matricesData = null;
	this.matrixIndices = null;
	
};
module.exports = MeshGroup;

MeshGroup.prototype = {

	build : function() {
		
		this.buildGeometry();
		this.buildMatrices();
		
		this.geometry.addAttribute( 'position',			new THREE.BufferAttribute( this.positions, 3 ) );
		this.geometry.addAttribute( 'customColor',		new THREE.BufferAttribute( this.colors, 3 ) );
		this.geometry.addAttribute( 'size',				new THREE.BufferAttribute( this.sizes, 1 ) );
		this.geometry.addAttribute( 'transformIndex',	new THREE.BufferAttribute( this.transformIndices, 1 ) );

		this.object = new THREE.PointCloud( this.geometry, this.material );
		
	},
	
	buildGeometry : function() {
		
		this.bufferGeometry = new THREE.BufferGeometry();
		this.mergedGeometry = new THREE.Geometry();
		
		var childGeometry;
		var prevTransformIndexOffset = 0;
		var nextTransformIndexOffset = 1;
		var vertexOffset = 0;
		var i, il, j, jl;
		
		for( i = 0, il = this.children.length; i < il; i++ ) {
			
			childGeometry = this.children[i].geometry;
			
			if( childGeometry ) {
				this.mergedGeometry.merge( childGeometry );
				
				
				mergedGeometry.
				
				vertexOffset += mergedGeometry.attributes.position.array / 3;
				prevTransformIndexOffset++;
				nextTransformIndexOffset++;
				
			}
			
		}
		
		this.bufferGeometry.fromGeometry( this.mergedGeometry );
		
	},
	
	buildMatrices : function() {
		
		//Calculates the n^2 width of the texture
		this.matricesTextureWidth = calculateSquaredTextureWidth( this.children.length * 16 ); //16 floats per matrix
		
		//The texture has 4 floats per pixel
		this.matricesData = new Float32Array( this.matricesTextureWidth * this.matricesTextureWidth * 4 );
		
		//One index per vertex
		this.matrixIndices = new Float32Array( this.geometry.vertices.length );

		this.matricesTexture = new THREE.DataTexture(
			this.matricesData,
			this.matricesTextureWidth,
			this.matricesTextureWidth,
			THREE.RGBAFormat,
			THREE.FloatType
		);
		this.matricesTexture.minFilter = THREE.NearestFilter;
		this.matricesTexture.magFilter = THREE.NearestFilter;
		this.matricesTexture.generateMipmaps = false;
		this.matricesTexture.flipY = false;
		this.matricesTexture.needsUpdate = true;
		
	},
	
	buildMaterial : function() {
		
		this.attributes = {

			transformIndex:	{ type: 'f', value: null }

		};

		this.uniforms = {

			color:     				{ type: "c", value: new THREE.Color( 0xffffff ) },
			texture:   				{ type: "t", value: this.texture },
			matricesTexture:		{ type: "t", value: this.matricesTexture },
			time:      				{ type: 'f', value: Date.now() },
			matricesTextureSize:	{ type: 'f', value: this.matricesTextureSize }

		};

		this.material = new THREE.ShaderMaterial( {

			uniforms:       this.uniforms,
			attributes:     this.attributes,
			vertexShader:   this.vertexShader,
			fragmentShader: this.fragmentShader,

			blending:       THREE.AdditiveBlending,
			depthTest:      false,
			transparent:    true

		});
		
		this.geometry.addAttribute( 'transformIndex',	new THREE.BufferAttribute( this.transformIndices, 1 ) );
		
	},
	
	update : function() {
		
		for( var i = 0, il = this.children.length; i < il ; i++ ) {
			
			this.children[i].matrixWorld.flattenToArrayOffset( this.matricesData, i * 16 );
			this.matricesTexture.needsUpdate = true;
			
		}
		
	}

};