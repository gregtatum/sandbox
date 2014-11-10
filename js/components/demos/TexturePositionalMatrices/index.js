var random		= require('../../../utils/random')
  , loadTexture	= require('../../../utils/loadTexture')
  , loadText	= require('../../../utils/loadText')
  , RSVP		= require('rsvp')
;

var TexturePositionalMatrices = function(poem, properties) {

	this.poem = poem;
	
	this.object = null;
	this.material = null;
	this.attributes = null;
	this.uniforms = null;

	this.texture = null;
	this.vertexShader = null;
	this.fragmentShader = null;
	
	this.count = 100000;
	this.radius = 200;
	this.pointSize = 7;
	
	RSVP.all([
		loadTexture( "assets/images/sinegravitycloud.png", this, "texture" ),
		loadText( "js/components/demos/TexturePositionalMatrices/shader.vert", this, "vertexShader" ),
		loadText( "js/components/demos/TexturePositionalMatrices/shader.frag", this, "fragmentShader" )
	])
	.then(
		this.start.bind(this),
		this.error.bind(this)
	);
};

module.exports = TexturePositionalMatrices;

TexturePositionalMatrices.prototype = {
	
	start : function() {
		
		var transformCount = 50;
		
		
		this.attributes = {

			size:       	{ type: 'f', value: null },
			customColor:	{ type: 'c', value: null },
			transformIndex:	{ type: 'f', value: null }

		};

		this.uniforms = {

			color:     			{ type: "c", value: new THREE.Color( 0xffffff ) },
			texture:   			{ type: "t", value: this.texture },
			time:      			{ type: 'f', value: Date.now() },
			transformMatrix:	{ type: 'm4v', value: [] }

		};

		this.material = new THREE.ShaderMaterial( {

			uniforms:       this.uniforms,
			attributes:     this.attributes,
			vertexShader:   "#define TRANSFORM_MATRIX_COUNT " + transformCount + "\n" + this.vertexShader,
			fragmentShader: this.fragmentShader,

			blending:       THREE.AdditiveBlending,
			depthTest:      false,
			transparent:    true

		});

		var vec3FloatLength = 3;
		var pointsLength = 8;
		var boxGeometryLength = pointsLength * vec3FloatLength;

		this.geometry = new THREE.BufferGeometry();

		this.positions = new Float32Array( this.count * boxGeometryLength );
		this.velocity = new Float32Array( this.count * vec3FloatLength );
		this.colors = new Float32Array( this.count * boxGeometryLength );
		this.sizes = new Float32Array( this.count * pointsLength );
		this.transformIndices = new Float32Array( this.count * pointsLength )

		var color = new THREE.Color(0x000000);
		var hue;
		
		var theta, phi;
		
		var vertices = new THREE.BoxGeometry( 1, 1, 1 ).vertices;

		var x, y, z, i, j;

		for( i = 0; i < this.count; i++ ) {

			theta = random.rangeLow( 0.1, Math.PI );
			phi = random.rangeLow( Math.PI * 0.3, Math.PI );
			
			x = Math.sin( theta ) * Math.cos( phi ) * this.radius * theta;
			y = Math.sin( theta ) * Math.sin( phi ) * this.radius;
			z = Math.cos( theta ) * this.radius ;
			
			hue = (this.positions[ i * 3 + 0 ] / this.radius * 0.3 + 0.65) % 1;

			color.setHSL( hue, 1.0, 0.55 );
			
			var transformIndex = random.rangeInt( 0, transformCount );
			
			for( j=0; j < vertices.length ; j++ ) {
				
				var offset3 = (i * boxGeometryLength) + (j * vec3FloatLength);
				var offset1 = (i * boxGeometryLength + j);

				this.sizes[ offset1 ] = this.pointSize;
				this.transformIndices[ offset1 ] = transformIndex;
							
				this.positions[ offset3 + 0 ] = vertices[j].x * 3 + x;
				this.positions[ offset3 + 1 ] = vertices[j].y * 3 + y;
				this.positions[ offset3 + 2 ] = vertices[j].z * 3 + z;

				this.colors[ offset3 + 0 ] = color.r;
				this.colors[ offset3 + 1 ] = color.g;
				this.colors[ offset3 + 2 ] = color.b;

			}
						
			
		}
		
		for( i = 0; i < transformCount ; i++ ) {
			
			this.uniforms.transformMatrix.value[i] = new THREE.Matrix4().makeTranslation(
				random.range( -this.radius, this.radius ) * 0.5,
				random.range( -this.radius, this.radius ) * 0.5,
				random.range( -this.radius, this.radius ) * 0.5
			);
			
		}

		this.geometry.addAttribute( 'position', new THREE.BufferAttribute( this.positions, 3 ) );
		this.geometry.addAttribute( 'customColor', new THREE.BufferAttribute( this.colors, 3 ) );
		this.geometry.addAttribute( 'size', new THREE.BufferAttribute( this.sizes, 1 ) );
		this.geometry.addAttribute( 'transformIndex', new THREE.BufferAttribute( this.transformIndices, 1 ) );

		this.object = new THREE.PointCloud( this.geometry, this.material );
		this.object.position.y -= this.radius * 0.2;
		
		this.poem.scene.add( this.object );
	
	
		this.poem.on( 'update', this.update.bind(this) );
		
	},
	
	error : function( error ) {
		throw new Error("Could not load assets for the TexturePositionalMatrices", error);
	},
	
	update : function(e) {

		this.uniforms.time.value = e.time;
		
	}
	
};