var calculateSquaredTextureWidth = require('../../utils/calculateSquaredTextureWidth')
  , loadTexture	= require('../../utils/loadTexture')
  , loadText	= require('../../utils/loadText')
  , RSVP = require('rsvp');

var MeshGroup = function( poem ) {
	
	THREE.Object3D.call( this );
	
	this.poem = poem;
	this.type = 'MeshGroup';
	this.bufferGeometry = new THREE.BufferGeometry();
	
	this.matricesTextureWidth = null;
	this.matricesData = null;
	this.matrixIndices = null;
	
	this.texture = null;
	this.vertexShader = null;
	this.fragmentShader = null;
	
	this.loaded = RSVP.all([
		loadTexture( "assets/images/sinegravitycloud.png", this, "texture" ),
		loadText( "js/demos/MeshGroupBoxDemo/shader.vert", this, "vertexShader" ),
		loadText( "js/demos/MeshGroupBoxDemo/shader.frag", this, "fragmentShader" )
	])
	.catch( function( error ) {
		throw new Error("Could not load assets for the MeshGroup", error);
	});
		
};

MeshGroup.prototype = _.extend( Object.create( THREE.Object3D.prototype ), {

	build : function( scene ) {
		
		this.loaded.then( function() {
			
			this.buildGeometry();
			this.buildMatrices();
			this.buildMaterial()
			
			this.object = new THREE.PointCloud( this.bufferGeometry, this.material );
			
			scene.add( this.object );
			
			this.poem.on( 'update', this.update.bind(this) );
			
			
		}.bind(this) );
		
	},
	
	buildGeometry : function() {
		
		var mergedGeometry = new THREE.Geometry();
		
		var childGeometry;
		var matrixIndices = [];
		var i, il, j, jl;
		
		for( i = 0, il = this.children.length; i < il; i++ ) {
			
			childGeometry = this.children[i].geometry;
			
			if( childGeometry ) {
				
				mergedGeometry.merge( childGeometry );
				
				j = mergedGeometry.vertices.length - childGeometry.vertices.length;
				jl = mergedGeometry.vertices.length;
				
				for( ; j < jl; j++ ) {
					matrixIndices[j] = i;
				}
				
			}
			
		}
		
		this.bufferGeometry.fromGeometry( mergedGeometry );
		
	},
	
	generateTransformMatrixIndices : function( object3Ds ) {
		
		var matrixIndices = [];
		var totalLength = 0;
		var positionsInFaces;
		var childGeometry;
		
		for( i = 0, il = object3Ds.length; i < il; i++ ) {
			
			childGeometry = object3Ds[i].geometry;
			
			if( childGeometry ) {
				
				positionsInFaces = childGeometry.faces.length * 3; //3 vertices per face
				totalLength += positionsInFaces;
				
				j = totalLength - positionsInFaces;
				jl = totalLength;
				
				for( ; j < jl; j++ ) {
					matrixIndices[j] = i;
				}
				
			}
			
		}
		
		return new Float32Array( matrixIndices );
	},
	
	buildMatrices : function() {
		
		//Calculates the n^2 width of the texture
		this.matricesTextureWidth = calculateSquaredTextureWidth( this.children.length * 16 ); //16 floats per matrix
		
		//The texture has 4 floats per pixel
		this.matricesData = new Float32Array( this.matricesTextureWidth * this.matricesTextureWidth * 4 );
		
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
			
			transformMatrixIndex:	{ type: 'f', value: null }
			
		};
		
		this.matrixIndices = this.generateTransformMatrixIndices( this.children );
		
		this.bufferGeometry.addAttribute( 'transformMatrixIndex', new THREE.BufferAttribute( this.matrixIndices, 1 ) );

		this.uniforms = {
			
			color:     				{ type: "c", value: new THREE.Color( 0xff0000 ) },
			matricesTexture:		{ type: "t", value: this.matricesTexture },
			time:      				{ type: 'f', value: Date.now() },
			texture:   				{ type: "t", value: this.texture },
			matricesTextureWidth:	{ type: 'f', value: this.matricesTextureWidth }
			
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
				
	},
	
	update : function() {
		
		for( var i = 0, il = this.children.length; i < il ; i++ ) {

			this.children[i].matrix.flattenToArrayOffset( this.matricesData, i * 16 );
			this.matricesTexture.needsUpdate = true;
			
		}
		
	}

});

module.exports = MeshGroup;