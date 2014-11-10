(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./js/Main.js":[function(require,module,exports){
var LevelLoader = require('./LevelLoader');

function camelCaseToSpaced( string ) {
	
	return string
	    .replace(/([A-Z])/g, ' $1')
	    .replace(/^./, function(str){ return str.toUpperCase(); })
		
}

$(function() {
	
	var hash = window.location.hash.substring(1);
	
	var levels = _.keys( require('./levels') );
	
	var levelToLoad = _.contains( levels, hash ) ? hash : _.first( levels );
	
	$('#LevelSelect')
		.append(
		
			_.reduce( levels, function( memo, level ) {
				
				var levelPretty = camelCaseToSpaced( level );
				var selected = level === levelToLoad ? " selected" : "";

				return memo + "<option value='"+level+"'"+selected+">"+levelPretty+"</option>";
				
			}, "")
	
		)
		.on( "change", function() {
			var level = $(this).val();
			LevelLoader( level );
			window.location.hash = level;
		})
	;

	LevelLoader( levelToLoad  );
});
},{"./LevelLoader":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/LevelLoader.js","./levels":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/levels/index.js"}],"/Users/gregtatum/Dropbox/greg-sites/shaders/js/LevelLoader.js":[function(require,module,exports){
// Declaratively set up the scene using a level manifest. Each object
// in the level manifest gets initiated as a property on the poem object
// and gets passed the poem as the first variable, and the properties as
// the second

var Poem = require('./Poem');
var levels = require('./levels');

var currentLevel = null;
var currentPoem = null;

window.LevelLoader = function( name ) {
	
	if(currentPoem) currentPoem.destroy();
	
	currentLevel = levels[name];
	currentPoem = new Poem( currentLevel );
	window.poem = currentPoem;

};
	
module.exports = LevelLoader;
},{"./Poem":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/Poem.js","./levels":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/levels/index.js"}],"/Users/gregtatum/Dropbox/greg-sites/shaders/js/Poem.js":[function(require,module,exports){
var Stats = require('./vendor/Stats');
var EventDispatcher = require('./utils/EventDispatcher');
var Clock = require('./utils/Clock');
var Camera = require('./components/cameras/Camera');

var _renderer;

var Poem = function( level ) {

	this.ratio = window.devicePixelRatio >= 1 ? window.devicePixelRatio : 1;
	
	this.div = document.getElementById( 'container' );
	this.canvas = null;
	this.scene = new THREE.Scene();
	this.requestedFrame = undefined;

	this.clock = new Clock();
	this.camera = new Camera( this, level.config.camera );
	this.scene.fog = new THREE.Fog( 0x222222, this.camera.object.position.z / 2, this.camera.object.position.z * 2 );
	
	this.addRenderer();
	
	this.parseLevel( level );
	
	this.addEventListeners();
	
	this.loop();
	
};

module.exports = Poem;

Poem.prototype = {
	
	parseLevel : function( level ) {
		_.each( level.objects, function( value, key ) {
			if(_.isObject( value )) {
				this[ key ] = new value.object( this, value.properties );
			} else {
				this[ key ] = value;
			}
			
		}, this);
	},
	
	addRenderer : function() {
		if(!_renderer) {
		
			_renderer = new THREE.WebGLRenderer({
				alpha : true
			});
			
		}
		_renderer.setSize( window.innerWidth, window.innerHeight );
		this.div.appendChild( _renderer.domElement );
		this.canvas = _renderer.domElement;
	},
	
	addStats : function() {

	},
	
	addEventListeners : function() {
		$(window).on('resize', this.resizeHandler.bind(this));
	},
	
	resizeHandler : function() {
		
		_renderer.setSize( window.innerWidth, window.innerHeight );
		this.dispatch( { type : "resize" } );
		
	},
			
	loop : function() {

		this.requestedFrame = requestAnimationFrame( this.loop.bind(this) );
		this.update();

	},
			
	update : function() {
		
		this.dispatch({
			type: "update",
			dt: this.clock.getDelta(),
			time: this.clock.time
		});
		
		_renderer.render( this.scene, this.camera.object );

	},
	
	destroy : function() {
		
		window.cancelAnimationFrame( this.requestedFrame );
		
		this.dispatch({
			type: "destroy"
		});
	}
};

EventDispatcher.prototype.apply( Poem.prototype );
},{"./components/cameras/Camera":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/components/cameras/Camera.js","./utils/Clock":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/utils/Clock.js","./utils/EventDispatcher":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/utils/EventDispatcher.js","./vendor/Stats":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/vendor/Stats.js"}],"/Users/gregtatum/Dropbox/greg-sites/shaders/js/components/cameras/Camera.js":[function(require,module,exports){
var Camera = function( poem, properties ) {
	
	this.poem = poem;
			
	this.object = new THREE.PerspectiveCamera(
		50,										// fov
		window.innerWidth / window.innerHeight,	// aspect ratio
		3,										// near frustum
		1000									// far frustum
	);
	this.object.position.x = _.isNumber( properties.x ) ? properties.x : 0;
	this.object.position.y = _.isNumber( properties.y ) ? properties.y : 0;
	this.object.position.z = _.isNumber( properties.z ) ? properties.z : 500;
	
	this.poem.scene.add( this.object );
	
	this.poem.on( 'resize', this.resize.bind(this) );
	
};

module.exports = Camera;

Camera.prototype = {
	
	resize : function() {
		this.object.aspect = window.innerWidth / window.innerHeight;
		this.object.updateProjectionMatrix();
	}
};
},{}],"/Users/gregtatum/Dropbox/greg-sites/shaders/js/components/cameras/Controls.js":[function(require,module,exports){
var OrbitControls = require('../../vendor/OrbitControls');

var Controls = function( poem, properties ) {
	
	this.poem = poem;
	this.properties = properties;

	this.controls = new OrbitControls( this.poem.camera.object, this.poem.canvas );
	
	this.poem.on( 'update', this.controls.update.bind( this.controls ) );
	
};

module.exports = Controls;

},{"../../vendor/OrbitControls":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/vendor/OrbitControls.js"}],"/Users/gregtatum/Dropbox/greg-sites/shaders/js/components/demos/Grid.js":[function(require,module,exports){
var random = require('../../utils/random');

var Grid = function( poem, properties ) {
	
	this.poem = poem;

	var lineMaterial = new THREE.LineBasicMaterial( { color: 0x303030 } ),
		geometry = new THREE.Geometry(),
		floor = -75, step = 25;

	for ( var i = 0; i <= 40; i ++ ) {

		geometry.vertices.push( new THREE.Vector3( - 500, floor, i * step - 500 ) );
		geometry.vertices.push( new THREE.Vector3(   500, floor, i * step - 500 ) );

		geometry.vertices.push( new THREE.Vector3( i * step - 500, floor, -500 ) );
		geometry.vertices.push( new THREE.Vector3( i * step - 500, floor,  500 ) );

	}

	this.grid = new THREE.Line( geometry, lineMaterial, THREE.LinePieces );
	this.poem.scene.add( this.grid );
	
};

module.exports = Grid;
},{"../../utils/random":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/utils/random.js"}],"/Users/gregtatum/Dropbox/greg-sites/shaders/js/components/demos/SineGravityCloud.js":[function(require,module,exports){
var random		= require('../../utils/random')
  , loadTexture	= require('../../utils/loadTexture')
  , loadText	= require('../../utils/loadText')
  , RSVP		= require('rsvp')
;

var SineGravityCloud = function(poem, properties) {
	
	this.poem = poem;
	
	this.object = null;
	this.material = null;
	this.attributes = null;
	this.uniforms = null;

	this.texture = null;
	this.vertexShader = null;
	this.fragmentShader = null;
	
	this.count = 200000;
	this.radius = 200;
	this.pointSize = 7;
	
	
	RSVP.all([
		loadTexture( "assets/images/sinegravitycloud.png", this, "texture" ),
		loadText( "assets/shaders/sinegravitycloud.vert", this, "vertexShader" ),
		loadText( "assets/shaders/sinegravitycloud.frag", this, "fragmentShader" )
	])
	.then(
		this.start.bind(this),
		this.error.bind(this)
	);
};

module.exports = SineGravityCloud;

SineGravityCloud.prototype = {
	
	start : function() {
		
		this.attributes = {

			size:        { type: 'f', value: null },
			customColor: { type: 'c', value: null }

		};

		this.uniforms = {

			color:     { type: "c", value: new THREE.Color( 0xffffff ) },
			texture:   { type: "t", value: this.texture }

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

		this.geometry = new THREE.BufferGeometry();

		this.positions = new Float32Array( this.count * 3 );
		this.velocity = new Float32Array( this.count * 3 );
		this.colors = new Float32Array( this.count * 3 );
		this.sizes = new Float32Array( this.count );

		var color = new THREE.Color(0x000000);
		
		var hue;
		
		var theta, phi;
		
		var x;

		for( var v = 0; v < this.count; v++ ) {

			this.sizes[ v ] = this.pointSize;
			
			// theta = random.rangeLow( 0.1, Math.PI );
			// phi = random.rangeLow( Math.PI * 0.3, Math.PI );
			//
			// this.positions[ v * 3 + 0 ] = Math.sin( theta ) * Math.cos( phi ) * this.radius * theta * 5;
			// this.positions[ v * 3 + 1 ] = Math.sin( theta ) * Math.sin( phi ) * this.radius;
			// this.positions[ v * 3 + 2 ] = Math.cos( theta ) * this.radius * 0.1;
			
			x = random.range( -1, 1 );
			
			this.positions[ v * 3 + 0 ] = x * this.radius;
			this.positions[ v * 3 + 1 ] = Math.sin( x * Math.PI * 10 ) * this.radius
			this.positions[ v * 3 + 2 ] = this.radius * -0.5;

			this.velocity[ v * 3 + 0 ] = random.range( -0.01, 0.01 ) * 0;
			this.velocity[ v * 3 + 1 ] = random.range( -0.01, 0.01 ) * 10;
			this.velocity[ v * 3 + 2 ] = random.range( -0.01, 0.01 ) * 0;

			// hue = (v / this.count ) * 0.2 + 0.45;
			
			hue = x * 0.3 + 0.65;

			color.setHSL( hue, 1.0, 0.55 );

			this.colors[ v * 3 + 0 ] = color.r;
			this.colors[ v * 3 + 1 ] = color.g;
			this.colors[ v * 3 + 2 ] = color.b;

		}

		this.geometry.addAttribute( 'position', new THREE.BufferAttribute( this.positions, 3 ) );
		this.geometry.addAttribute( 'customColor', new THREE.BufferAttribute( this.colors, 3 ) );
		this.geometry.addAttribute( 'size', new THREE.BufferAttribute( this.sizes, 1 ) );

		this.object = new THREE.PointCloud( this.geometry, this.material );
		this.object.position.y -= this.radius * 0.2;
		
		this.poem.scene.add( this.object );
	
	
		this.poem.on( 'update', this.update.bind(this) );
		
	},
	
	error : function( error ) {
		throw new Error("Could not load assets for the SineGravityCloud", error);
	},
	
	update : function(e) {
		
		var d2;
	
		for( var i = 0; i < this.count; i++ ) {
			
			d2 =this.positions[ i * 3 + 0 ] * this.positions[ i * 3 + 0 ] +
			    this.positions[ i * 3 + 1 ] * this.positions[ i * 3 + 1 ] +
			    this.positions[ i * 3 + 2 ] * this.positions[ i * 3 + 2 ];

			this.velocity[ i * 3 + 0 ] -= this.positions[ i * 3 + 0 ] / d2;
			this.velocity[ i * 3 + 1 ] -= this.positions[ i * 3 + 1 ] / d2;
			this.velocity[ i * 3 + 2 ] -= this.positions[ i * 3 + 2 ] / d2;

			this.positions[ i * 3 + 0 ] += this.velocity[ i * 3 + 0 ];
			this.positions[ i * 3 + 1 ] += this.velocity[ i * 3 + 1 ];
			this.positions[ i * 3 + 2 ] += this.velocity[ i * 3 + 2 ];
			
		}
		
		this.geometry.attributes.position.needsUpdate = true;
		
	}
	
};
},{"../../utils/loadText":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/utils/loadText.js","../../utils/loadTexture":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/utils/loadTexture.js","../../utils/random":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/utils/random.js","rsvp":"/Users/gregtatum/Dropbox/greg-sites/shaders/node_modules/rsvp/dist/rsvp.js"}],"/Users/gregtatum/Dropbox/greg-sites/shaders/js/components/demos/Spheres.js":[function(require,module,exports){
var random = require('../../utils/random');

var Spheres = function(poem, properties) {
	
	this.poem = poem;

	this.count = properties.count > 0 ? properties.count : 10;
	this.dispersion = properties.dispersion || 10;
	this.radius = properties.radius > 0 ? properties.radius : 1;
	
	this.geometry = new THREE.SphereGeometry( this.radius, 32, 32 );
	this.material = new THREE.MeshBasicMaterial( { color : 0xff0000 } );
	

	this.meshes = [];
	
	var i= -1; while( ++i < properties.count ) {
		
		var mesh = new THREE.Mesh( this.geometry, this.material );
		
		mesh.position.x = random.range( -this.dispersion, this.dispersion );
		mesh.position.y = random.range( -this.dispersion, this.dispersion );
		mesh.position.z = random.range( -this.dispersion, this.dispersion );
		
		this.poem.scene.add( mesh );
		this.meshes.push( mesh );
	}
	
	this.poem.on( 'update', this.update.bind(this) );
	
};

module.exports = Spheres;

Spheres.prototype = {
	
	update : function(e) {
		
		var i= -1; while( ++i < this.count ) {
		
			this.meshes[i].position.x += random.range( -0.0005, 0.0005 ) * this.dispersion * e.dt;
			this.meshes[i].position.y += random.range( -0.0005, 0.0005 ) * this.dispersion * e.dt;
			this.meshes[i].position.z += random.range( -0.0005, 0.0005 ) * this.dispersion * e.dt;
		
		}
		
	}
	
};
},{"../../utils/random":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/utils/random.js"}],"/Users/gregtatum/Dropbox/greg-sites/shaders/js/components/demos/texturePositionalMatrices/index.js":[function(require,module,exports){
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
},{"../../../utils/loadText":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/utils/loadText.js","../../../utils/loadTexture":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/utils/loadTexture.js","../../../utils/random":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/utils/random.js","rsvp":"/Users/gregtatum/Dropbox/greg-sites/shaders/node_modules/rsvp/dist/rsvp.js"}],"/Users/gregtatum/Dropbox/greg-sites/shaders/js/components/demos/uniformPositionalMatrices/index.js":[function(require,module,exports){
var random		= require('../../../utils/random')
  , loadTexture	= require('../../../utils/loadTexture')
  , loadText	= require('../../../utils/loadText')
  , RSVP		= require('rsvp')
;

var UniformPositionalMatrices = function(poem, properties) {

	this.poem = poem;
	
	this.object = null;
	this.material = null;
	this.attributes = null;
	this.uniforms = null;

	this.texture = null;
	this.vertexShader = null;
	this.fragmentShader = null;
	
	this.count = 200000;
	this.radius = 200;
	this.pointSize = 7;
	
	RSVP.all([
		loadTexture( "assets/images/sinegravitycloud.png", this, "texture" ),
		loadText( "js/components/demos/UniformPositionalMatrices/shader.vert", this, "vertexShader" ),
		loadText( "js/components/demos/UniformPositionalMatrices/shader.frag", this, "fragmentShader" )
	])
	.then(
		this.start.bind(this),
		this.error.bind(this)
	);
};

module.exports = UniformPositionalMatrices;

UniformPositionalMatrices.prototype = {
	
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

		this.geometry = new THREE.BufferGeometry();

		this.positions = new Float32Array( this.count * 3 );
		this.velocity = new Float32Array( this.count * 3 );
		this.colors = new Float32Array( this.count * 3 );
		this.sizes = new Float32Array( this.count );
		this.transformIndices = new Float32Array( this.count )

		var color = new THREE.Color(0x000000);
		var hue;
		
		var theta, phi;
		
		var x;

		for( var v = 0; v < this.count; v++ ) {

			this.sizes[ v ] = this.pointSize;
			this.transformIndices[ v ] = random.rangeInt( 0, transformCount );
						
			theta = random.rangeLow( 0.1, Math.PI );
			phi = random.rangeLow( Math.PI * 0.3, Math.PI );
			
			this.positions[ v * 3 + 0 ] = Math.sin( theta ) * Math.cos( phi ) * this.radius * theta;
			this.positions[ v * 3 + 1 ] = Math.sin( theta ) * Math.sin( phi ) * this.radius;
			this.positions[ v * 3 + 2 ] = Math.cos( theta ) * this.radius ;
			
			
			hue = (this.positions[ v * 3 + 0 ] / this.radius * 0.3 + 0.65) % 1;

			color.setHSL( hue, 1.0, 0.55 );

			this.colors[ v * 3 + 0 ] = color.r;
			this.colors[ v * 3 + 1 ] = color.g;
			this.colors[ v * 3 + 2 ] = color.b;

		}
		
		for( var i = 0; i < transformCount ; i++ ) {
			
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
		throw new Error("Could not load assets for the UniformPositionalMatrices", error);
	},
	
	update : function(e) {

		this.uniforms.time.value = e.time;
		
	}
	
};
},{"../../../utils/loadText":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/utils/loadText.js","../../../utils/loadTexture":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/utils/loadTexture.js","../../../utils/random":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/utils/random.js","rsvp":"/Users/gregtatum/Dropbox/greg-sites/shaders/node_modules/rsvp/dist/rsvp.js"}],"/Users/gregtatum/Dropbox/greg-sites/shaders/js/components/utils/Stats.js":[function(require,module,exports){
var MrDoobStats = require('../../vendor/Stats');

var Stats = function( poem ) {
	
	this.poem = poem;
	
	this.stats = new MrDoobStats();
	this.stats.domElement.style.position = 'absolute';
	this.stats.domElement.style.top = '0px';
	$( this.poem.div ).append( this.stats.domElement );
	
	this.poem.on( 'update', this.stats.update.bind( this.stats ) );
	
};

module.exports = Stats;
},{"../../vendor/Stats":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/vendor/Stats.js"}],"/Users/gregtatum/Dropbox/greg-sites/shaders/js/levels/index.js":[function(require,module,exports){
module.exports = {
	spheresDemo : require("./spheresDemo"),
	sineGravityCloud : require("./sineGravityCloud"),
	uniformPositionalMatrices : require("./uniformPositionalMatrices"),
	texturePositionalMatrices : require("./texturePositionalMatrices")
};
},{"./sineGravityCloud":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/levels/sineGravityCloud.js","./spheresDemo":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/levels/spheresDemo.js","./texturePositionalMatrices":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/levels/texturePositionalMatrices.js","./uniformPositionalMatrices":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/levels/uniformPositionalMatrices.js"}],"/Users/gregtatum/Dropbox/greg-sites/shaders/js/levels/sineGravityCloud.js":[function(require,module,exports){
module.exports = {
	config : {
		camera : {
			x : -400
		}
	},
	objects : {
		controls : {
			object: require("../components/cameras/Controls"),
		},
		pointcloud : {
			object: require("../components/demos/SineGravityCloud"),
		},
		grid : {
			object: require("../components/demos/Grid"),
		},
		// stats : {
		// 	object: require("../components/utils/Stats")
		// }
	}
};
},{"../components/cameras/Controls":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/components/cameras/Controls.js","../components/demos/Grid":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/components/demos/Grid.js","../components/demos/SineGravityCloud":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/components/demos/SineGravityCloud.js"}],"/Users/gregtatum/Dropbox/greg-sites/shaders/js/levels/spheresDemo.js":[function(require,module,exports){
module.exports = {
	config : {
		camera : {
			x : -400
		}
	},
	objects : {
		sphere : {
			object: require("../components/demos/Spheres"),
			properties: {
				count : 50,
				dispersion : 120,
				radius : 10
			}
		},
		controls : {
			object: require("../components/cameras/Controls"),
		},
		grid : {
			object: require("../components/demos/Grid"),
		},
		stats : {
			object: require("../components/utils/Stats")
		}
	}
};
},{"../components/cameras/Controls":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/components/cameras/Controls.js","../components/demos/Grid":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/components/demos/Grid.js","../components/demos/Spheres":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/components/demos/Spheres.js","../components/utils/Stats":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/components/utils/Stats.js"}],"/Users/gregtatum/Dropbox/greg-sites/shaders/js/levels/texturePositionalMatrices.js":[function(require,module,exports){
module.exports = {
	config : {
		camera : {
			x : -400
		}
	},
	objects : {
		controls : {
			object: require("../components/cameras/Controls"),
		},
		texturePositionalMatrices : {
			object: require("../components/demos/texturePositionalMatrices"),
		},
		grid : {
			object: require("../components/demos/Grid"),
		},
		stats : {
			object: require("../components/utils/Stats")
		}
	}
};
},{"../components/cameras/Controls":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/components/cameras/Controls.js","../components/demos/Grid":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/components/demos/Grid.js","../components/demos/texturePositionalMatrices":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/components/demos/texturePositionalMatrices/index.js","../components/utils/Stats":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/components/utils/Stats.js"}],"/Users/gregtatum/Dropbox/greg-sites/shaders/js/levels/uniformPositionalMatrices.js":[function(require,module,exports){
module.exports = {
	config : {
		camera : {
			x : -400
		}
	},
	objects : {
		controls : {
			object: require("../components/cameras/Controls"),
		},
		uniformPositionalMatrices : {
			object: require("../components/demos/uniformPositionalMatrices"),
		},
		grid : {
			object: require("../components/demos/Grid"),
		},
		stats : {
			object: require("../components/utils/Stats")
		}
	}
};
},{"../components/cameras/Controls":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/components/cameras/Controls.js","../components/demos/Grid":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/components/demos/Grid.js","../components/demos/uniformPositionalMatrices":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/components/demos/uniformPositionalMatrices/index.js","../components/utils/Stats":"/Users/gregtatum/Dropbox/greg-sites/shaders/js/components/utils/Stats.js"}],"/Users/gregtatum/Dropbox/greg-sites/shaders/js/utils/Clock.js":[function(require,module,exports){
var Clock = function( autostart ) {

	this.maxDt = 60;
	this.minDt = 16;
	this.pTime = 0;
	this.time = 0;
	
	if(autostart !== false) {
		this.start();
	}
	
};

module.exports = Clock;

Clock.prototype = {

	start : function() {
		this.pTime = Date.now();
	},
	
	getDelta : function() {
		var now, dt;
		
		now = Date.now();
		dt = now - this.pTime;
		
		dt = Math.min( dt, this.maxDt );
		dt = Math.max( dt, this.minDt );
		
		this.time += dt;
		this.pTime = now;
		
		return dt;
	}
	
};
},{}],"/Users/gregtatum/Dropbox/greg-sites/shaders/js/utils/EventDispatcher.js":[function(require,module,exports){
/**
 * @author mrdoob / http://mrdoob.com/
 *
 * Modifications: Greg Tatum
 *
 * usage:
 * 
 * 		EventDispatcher.prototype.apply( MyObject.prototype );
 * 
 * 		MyObject.dispatch({
 * 			type: "click",
 * 			datum1: "foo",
 * 			datum2: "bar"
 * 		});
 * 
 * 		MyObject.on( "click", function( event ) {
 * 			event.datum1; //Foo
 * 			event.target; //MyObject
 * 		});
 * 
 *
 */

var EventDispatcher = function () {};

EventDispatcher.prototype = {

	constructor: EventDispatcher,

	apply: function ( object ) {

		object.on					= EventDispatcher.prototype.on;
		object.hasEventListener		= EventDispatcher.prototype.hasEventListener;
		object.off					= EventDispatcher.prototype.off;
		object.dispatch				= EventDispatcher.prototype.dispatch;

	},

	on: function ( type, listener ) {

		if ( this._listeners === undefined ) this._listeners = {};

		var listeners = this._listeners;

		if ( listeners[ type ] === undefined ) {

			listeners[ type ] = [];

		}

		if ( listeners[ type ].indexOf( listener ) === - 1 ) {

			listeners[ type ].push( listener );

		}

	},

	hasEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) return false;

		var listeners = this._listeners;

		if ( listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1 ) {

			return true;

		}

		return false;

	},

	off: function ( type, listener ) {

		if ( this._listeners === undefined ) return;

		var listeners = this._listeners;
		var listenerArray = listeners[ type ];

		if ( listenerArray !== undefined ) {

			var index = listenerArray.indexOf( listener );

			if ( index !== - 1 ) {

				listenerArray.splice( index, 1 );

			}

		}

	},

	dispatch: function ( event ) {
			
		if ( this._listeners === undefined ) return;

		var listeners = this._listeners;
		var listenerArray = listeners[ event.type ];

		if ( listenerArray !== undefined ) {

			event.target = this;

			var array = [];
			var length = listenerArray.length;
			var i;

			for ( i = 0; i < length; i ++ ) {

				array[ i ] = listenerArray[ i ];

			}

			for ( i = 0; i < length; i ++ ) {

				array[ i ].call( this, event );

			}

		}

	}

};

if ( typeof module === 'object' ) {

	module.exports = EventDispatcher;

}
},{}],"/Users/gregtatum/Dropbox/greg-sites/shaders/js/utils/loadText.js":[function(require,module,exports){
var RSVP = require('rsvp');

var loadText = function( url, object, key ) {
	
	var promise = new RSVP.Promise(function(resolve, reject){
		
		console.log('loading text', url);
		
		$.ajax(url, {
			dataType: "text"
		}).then(
			function( data ) {
				
				if( _.isObject( object ) ) {
					object[key] = data;
				}
				
				resolve( data );
			},
			function( error ) {
				reject( error );
			}
		);
		
	});

	return promise;
};

module.exports = loadText;
},{"rsvp":"/Users/gregtatum/Dropbox/greg-sites/shaders/node_modules/rsvp/dist/rsvp.js"}],"/Users/gregtatum/Dropbox/greg-sites/shaders/js/utils/loadTexture.js":[function(require,module,exports){
var RSVP = require('rsvp');

var loadTexture = function( url, object, key ) {
	
	return new RSVP.Promise(function(resolve, reject) {
		
		THREE.ImageUtils.loadTexture( url, undefined, function( texture ) {
			
			if( _.isObject( object ) ) {
				object[key] = texture;
			}
			
			resolve( texture );
			
		}, reject );
		
	});

};

module.exports = loadTexture;
},{"rsvp":"/Users/gregtatum/Dropbox/greg-sites/shaders/node_modules/rsvp/dist/rsvp.js"}],"/Users/gregtatum/Dropbox/greg-sites/shaders/js/utils/random.js":[function(require,module,exports){
var random = {
	
	flip : function() {
		return Math.random() > 0.5 ? true: false;
	},
	
	range : function(min, max) {
		return Math.random() * (max - min) + min;
	},
	
	rangeInt : function(min, max) {
		return Math.floor( this.range(min, max + 1) );
	},
	
	rangeLow : function(min, max) {
		//More likely to return a low value
	  return Math.random() * Math.random() * (max - min) + min;
	},
	
	rangeHigh : function(min, max) {
		//More likely to return a high value
		return (1 - Math.random() * Math.random()) * (max - min) + min;
	}
	 
};

module.exports = random;

},{}],"/Users/gregtatum/Dropbox/greg-sites/shaders/js/vendor/OrbitControls.js":[function(require,module,exports){
/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */
/*global THREE, console */

// This set of controls performs orbiting, dollying (zooming), and panning. It maintains
// the "up" direction as +Y, unlike the TrackballControls. Touch on tablet and phones is
// supported.
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finter swipe
//
// This is a drop-in replacement for (most) TrackballControls used in examples.
// That is, include this js file and wherever you see:
//    	controls = new THREE.TrackballControls( camera );
//      controls.target.z = 150;
// Simple substitute "OrbitControls" and the control should work as-is.

var OrbitControls = function ( object, domElement ) {

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// API

	// Set to false to disable this control
	this.enabled = true;

	// "target" sets the location of focus, where the control orbits around
	// and where it pans with respect to.
	this.target = new THREE.Vector3();
	// center is old, deprecated; use "target" instead
	this.center = this.target;

	// This option actually enables dollying in and out; left as "zoom" for
	// backwards compatibility
	this.noZoom = false;
	this.zoomSpeed = 1.0;
	// Limits to how far you can dolly in and out
	this.minDistance = 0;
	this.maxDistance = Infinity;

	// Set to true to disable this control
	this.noRotate = false;
	this.rotateSpeed = 1.0;

	// Set to true to disable this control
	this.noPan = false;
	this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

	// Set to true to automatically rotate around the target
	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	// How far you can orbit vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	// Set to true to disable use of the keys
	this.noKeys = false;
	// The four arrow keys
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	////////////
	// internals

	var scope = this;

	var EPS = 0.000001;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();
	var panDelta = new THREE.Vector2();

	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();

	var phiDelta = 0;
	var thetaDelta = 0;
	var scale = 1;
	var pan = new THREE.Vector3();

	var lastPosition = new THREE.Vector3();

	var STATE = { NONE : -1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };
	var state = STATE.NONE;

	// events

	var changeEvent = { type: 'change' };


	this.rotateLeft = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		thetaDelta -= angle;

	};

	this.rotateUp = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		phiDelta -= angle;

	};

	// pass in distance in world space to move left
	this.panLeft = function ( distance ) {

		var panOffset = new THREE.Vector3();
		var te = this.object.matrix.elements;
		// get X column of matrix
		panOffset.set( te[0], te[1], te[2] );
		panOffset.multiplyScalar(-distance);
		
		pan.add( panOffset );

	};

	// pass in distance in world space to move up
	this.panUp = function ( distance ) {

		var panOffset = new THREE.Vector3();
		var te = this.object.matrix.elements;
		// get Y column of matrix
		panOffset.set( te[4], te[5], te[6] );
		panOffset.multiplyScalar(distance);
		
		pan.add( panOffset );
	};
	
	// main entry point; pass in Vector2 of change desired in pixel space,
	// right and down are positive
	this.pan = function ( delta ) {

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		if ( scope.object.fov !== undefined ) {

			// perspective
			var position = scope.object.position;
			var offset = position.clone().sub( scope.target );
			var targetDistance = offset.length();

			// half of the fov is center to top of screen
			targetDistance *= Math.tan( (scope.object.fov/2) * Math.PI / 180.0 );
			// we actually don't use screenWidth, since perspective camera is fixed to screen height
			scope.panLeft( 2 * delta.x * targetDistance / element.clientHeight );
			scope.panUp( 2 * delta.y * targetDistance / element.clientHeight );

		} else if ( scope.object.top !== undefined ) {

			// orthographic
			scope.panLeft( delta.x * (scope.object.right - scope.object.left) / element.clientWidth );
			scope.panUp( delta.y * (scope.object.top - scope.object.bottom) / element.clientHeight );

		} else {

			// camera neither orthographic or perspective - warn user
			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );

		}

	};

	this.dollyIn = function ( dollyScale ) {

		if ( dollyScale === undefined ) {

			dollyScale = getZoomScale();

		}

		scale /= dollyScale;

	};

	this.dollyOut = function ( dollyScale ) {

		if ( dollyScale === undefined ) {

			dollyScale = getZoomScale();

		}

		scale *= dollyScale;

	};

	this.update = function () {

		var position = this.object.position;
		var offset = position.clone().sub( this.target );

		// angle from z-axis around y-axis

		var theta = Math.atan2( offset.x, offset.z );

		// angle from y-axis

		var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

		if ( this.autoRotate ) {

			this.rotateLeft( getAutoRotationAngle() );

		}

		theta += thetaDelta;
		phi += phiDelta;

		// restrict phi to be between desired limits
		phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

		// restrict phi to be betwee EPS and PI-EPS
		phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

		var radius = offset.length() * scale;

		// restrict radius to be between desired limits
		radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );
		
		// move target to panned location
		this.target.add( pan );

		offset.x = radius * Math.sin( phi ) * Math.sin( theta );
		offset.y = radius * Math.cos( phi );
		offset.z = radius * Math.sin( phi ) * Math.cos( theta );

		position.copy( this.target ).add( offset );

		this.object.lookAt( this.target );

		thetaDelta = 0;
		phiDelta = 0;
		scale = 1;
		pan.set(0,0,0);

		if ( lastPosition.distanceTo( this.object.position ) > 0 ) {

			this.dispatchEvent( changeEvent );

			lastPosition.copy( this.object.position );

		}

	};


	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {

		return Math.pow( 0.95, scope.zoomSpeed );

	}

	function onMouseDown( event ) {

		if ( scope.enabled === false ) { return; }
		event.preventDefault();

		if ( event.button === 0 ) {
			if ( scope.noRotate === true ) { return; }

			state = STATE.ROTATE;

			rotateStart.set( event.clientX, event.clientY );

		} else if ( event.button === 1 ) {
			if ( scope.noZoom === true ) { return; }

			state = STATE.DOLLY;

			dollyStart.set( event.clientX, event.clientY );

		} else if ( event.button === 2 ) {
			if ( scope.noPan === true ) { return; }

			state = STATE.PAN;

			panStart.set( event.clientX, event.clientY );

		}

		// Greggman fix: https://github.com/greggman/three.js/commit/fde9f9917d6d8381f06bf22cdff766029d1761be
		scope.domElement.addEventListener( 'mousemove', onMouseMove, false );
		scope.domElement.addEventListener( 'mouseup', onMouseUp, false );

	}

	function onMouseMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		if ( state === STATE.ROTATE ) {

			if ( scope.noRotate === true ) return;

			rotateEnd.set( event.clientX, event.clientY );
			rotateDelta.subVectors( rotateEnd, rotateStart );

			// rotating across whole screen goes 360 degrees around
			scope.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );
			// rotating up and down along whole screen attempts to go 360, but limited to 180
			scope.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

			rotateStart.copy( rotateEnd );

		} else if ( state === STATE.DOLLY ) {

			if ( scope.noZoom === true ) return;

			dollyEnd.set( event.clientX, event.clientY );
			dollyDelta.subVectors( dollyEnd, dollyStart );

			if ( dollyDelta.y > 0 ) {

				scope.dollyIn();

			} else {

				scope.dollyOut();

			}

			dollyStart.copy( dollyEnd );

		} else if ( state === STATE.PAN ) {

			if ( scope.noPan === true ) return;

			panEnd.set( event.clientX, event.clientY );
			panDelta.subVectors( panEnd, panStart );
			
			scope.pan( panDelta );

			panStart.copy( panEnd );

		}

		// Greggman fix: https://github.com/greggman/three.js/commit/fde9f9917d6d8381f06bf22cdff766029d1761be
		scope.update();

	}

	function onMouseUp( /* event */ ) {

		if ( scope.enabled === false ) return;

		// Greggman fix: https://github.com/greggman/three.js/commit/fde9f9917d6d8381f06bf22cdff766029d1761be
		scope.domElement.removeEventListener( 'mousemove', onMouseMove, false );
		scope.domElement.removeEventListener( 'mouseup', onMouseUp, false );

		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		if ( scope.enabled === false || scope.noZoom === true ) return;

		var delta = 0;

		if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

			delta = event.wheelDelta;

		} else if ( event.detail ) { // Firefox

			delta = - event.detail;

		}

		if ( delta > 0 ) {

			scope.dollyOut();

		} else {

			scope.dollyIn();

		}

	}

	function onKeyDown( event ) {

		if ( scope.enabled === false ) { return; }
		if ( scope.noKeys === true ) { return; }
		if ( scope.noPan === true ) { return; }

		// pan a pixel - I guess for precise positioning?
		// Greggman fix: https://github.com/greggman/three.js/commit/fde9f9917d6d8381f06bf22cdff766029d1761be
		var needUpdate = false;
		
		switch ( event.keyCode ) {

			case scope.keys.UP:
				scope.pan( new THREE.Vector2( 0, scope.keyPanSpeed ) );
				needUpdate = true;
				break;
			case scope.keys.BOTTOM:
				scope.pan( new THREE.Vector2( 0, -scope.keyPanSpeed ) );
				needUpdate = true;
				break;
			case scope.keys.LEFT:
				scope.pan( new THREE.Vector2( scope.keyPanSpeed, 0 ) );
				needUpdate = true;
				break;
			case scope.keys.RIGHT:
				scope.pan( new THREE.Vector2( -scope.keyPanSpeed, 0 ) );
				needUpdate = true;
				break;
		}

		// Greggman fix: https://github.com/greggman/three.js/commit/fde9f9917d6d8381f06bf22cdff766029d1761be
		if ( needUpdate ) {

			scope.update();

		}

	}
	
	function touchstart( event ) {

		if ( scope.enabled === false ) { return; }

		switch ( event.touches.length ) {

			case 1:	// one-fingered touch: rotate
				if ( scope.noRotate === true ) { return; }

				state = STATE.TOUCH_ROTATE;

				rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

			case 2:	// two-fingered touch: dolly
				if ( scope.noZoom === true ) { return; }

				state = STATE.TOUCH_DOLLY;

				var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
				var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
				var distance = Math.sqrt( dx * dx + dy * dy );
				dollyStart.set( 0, distance );
				break;

			case 3: // three-fingered touch: pan
				if ( scope.noPan === true ) { return; }

				state = STATE.TOUCH_PAN;

				panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

			default:
				state = STATE.NONE;

		}
	}

	function touchmove( event ) {

		if ( scope.enabled === false ) { return; }

		event.preventDefault();
		event.stopPropagation();

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		switch ( event.touches.length ) {

			case 1: // one-fingered touch: rotate
				if ( scope.noRotate === true ) { return; }
				if ( state !== STATE.TOUCH_ROTATE ) { return; }

				rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				rotateDelta.subVectors( rotateEnd, rotateStart );

				// rotating across whole screen goes 360 degrees around
				scope.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );
				// rotating up and down along whole screen attempts to go 360, but limited to 180
				scope.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

				rotateStart.copy( rotateEnd );
				break;

			case 2: // two-fingered touch: dolly
				if ( scope.noZoom === true ) { return; }
				if ( state !== STATE.TOUCH_DOLLY ) { return; }

				var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
				var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
				var distance = Math.sqrt( dx * dx + dy * dy );

				dollyEnd.set( 0, distance );
				dollyDelta.subVectors( dollyEnd, dollyStart );

				if ( dollyDelta.y > 0 ) {

					scope.dollyOut();

				} else {

					scope.dollyIn();

				}

				dollyStart.copy( dollyEnd );
				break;

			case 3: // three-fingered touch: pan
				if ( scope.noPan === true ) { return; }
				if ( state !== STATE.TOUCH_PAN ) { return; }

				panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				panDelta.subVectors( panEnd, panStart );
				
				scope.pan( panDelta );

				panStart.copy( panEnd );
				break;

			default:
				state = STATE.NONE;

		}

	}

	function touchend( /* event */ ) {

		if ( scope.enabled === false ) { return; }

		state = STATE.NONE;
	}

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
	this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox

	this.domElement.addEventListener( 'keydown', onKeyDown, false );

	this.domElement.addEventListener( 'touchstart', touchstart, false );
	this.domElement.addEventListener( 'touchend', touchend, false );
	this.domElement.addEventListener( 'touchmove', touchmove, false );

};

OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );

module.exports = OrbitControls;

},{}],"/Users/gregtatum/Dropbox/greg-sites/shaders/js/vendor/Stats.js":[function(require,module,exports){
/**
 * @author mrdoob / http://mrdoob.com/
 */

var Stats = function () {

	var startTime = Date.now(), prevTime = startTime;
	var ms = 0, msMin = Infinity, msMax = 0;
	var fps = 0, fpsMin = Infinity, fpsMax = 0;
	var frames = 0, mode = 0;

	var container = document.createElement( 'div' );
	container.id = 'stats';
	container.addEventListener( 'mousedown', function ( event ) { event.preventDefault(); setMode( ++ mode % 2 ); }, false );
	container.style.cssText = 'width:80px;opacity:0.9;cursor:pointer';

	var fpsDiv = document.createElement( 'div' );
	fpsDiv.id = 'fps';
	fpsDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#002';
	container.appendChild( fpsDiv );

	var fpsText = document.createElement( 'div' );
	fpsText.id = 'fpsText';
	fpsText.style.cssText = 'color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
	fpsText.innerHTML = 'FPS';
	fpsDiv.appendChild( fpsText );

	var fpsGraph = document.createElement( 'div' );
	fpsGraph.id = 'fpsGraph';
	fpsGraph.style.cssText = 'position:relative;width:74px;height:30px;background-color:#0ff';
	fpsDiv.appendChild( fpsGraph );

	while ( fpsGraph.children.length < 74 ) {

		var bar = document.createElement( 'span' );
		bar.style.cssText = 'width:1px;height:30px;float:left;background-color:#113';
		fpsGraph.appendChild( bar );

	}

	var msDiv = document.createElement( 'div' );
	msDiv.id = 'ms';
	msDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#020;display:none';
	container.appendChild( msDiv );

	var msText = document.createElement( 'div' );
	msText.id = 'msText';
	msText.style.cssText = 'color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
	msText.innerHTML = 'MS';
	msDiv.appendChild( msText );

	var msGraph = document.createElement( 'div' );
	msGraph.id = 'msGraph';
	msGraph.style.cssText = 'position:relative;width:74px;height:30px;background-color:#0f0';
	msDiv.appendChild( msGraph );

	while ( msGraph.children.length < 74 ) {

		var bar2 = document.createElement( 'span' );
		bar2.style.cssText = 'width:1px;height:30px;float:left;background-color:#131';
		msGraph.appendChild( bar2 );

	}

	var setMode = function ( value ) {

		mode = value;

		switch ( mode ) {

			case 0:
				fpsDiv.style.display = 'block';
				msDiv.style.display = 'none';
				break;
			case 1:
				fpsDiv.style.display = 'none';
				msDiv.style.display = 'block';
				break;
		}

	};

	var updateGraph = function ( dom, value ) {

		var child = dom.appendChild( dom.firstChild );
		child.style.height = value + 'px';

	};

	return {

		REVISION: 12,

		domElement: container,

		setMode: setMode,

		begin: function () {

			startTime = Date.now();

		},

		end: function () {

			var time = Date.now();

			ms = time - startTime;
			msMin = Math.min( msMin, ms );
			msMax = Math.max( msMax, ms );

			msText.textContent = ms + ' MS (' + msMin + '-' + msMax + ')';
			updateGraph( msGraph, Math.min( 30, 30 - ( ms / 200 ) * 30 ) );

			frames ++;

			if ( time > prevTime + 1000 ) {

				fps = Math.round( ( frames * 1000 ) / ( time - prevTime ) );
				fpsMin = Math.min( fpsMin, fps );
				fpsMax = Math.max( fpsMax, fps );

				fpsText.textContent = fps + ' FPS (' + fpsMin + '-' + fpsMax + ')';
				updateGraph( fpsGraph, Math.min( 30, 30 - ( fps / 100 ) * 30 ) );

				prevTime = time;
				frames = 0;

			}

			return time;

		},

		update: function () {

			startTime = this.end();

		}

	};

};

if ( typeof module === 'object' ) {

	module.exports = Stats;

}
},{}],"/Users/gregtatum/Dropbox/greg-sites/shaders/node_modules/browserify/node_modules/process/browser.js":[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],"/Users/gregtatum/Dropbox/greg-sites/shaders/node_modules/rsvp/dist/rsvp.js":[function(require,module,exports){
(function (process){
/*!
 * @overview RSVP - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/tildeio/rsvp.js/master/LICENSE
 * @version   3.0.14
 */

(function() {
    "use strict";

    function $$rsvp$events$$indexOf(callbacks, callback) {
      for (var i=0, l=callbacks.length; i<l; i++) {
        if (callbacks[i] === callback) { return i; }
      }

      return -1;
    }

    function $$rsvp$events$$callbacksFor(object) {
      var callbacks = object._promiseCallbacks;

      if (!callbacks) {
        callbacks = object._promiseCallbacks = {};
      }

      return callbacks;
    }

    var $$rsvp$events$$default = {

      /**
        `RSVP.EventTarget.mixin` extends an object with EventTarget methods. For
        Example:

        ```javascript
        var object = {};

        RSVP.EventTarget.mixin(object);

        object.on('finished', function(event) {
          // handle event
        });

        object.trigger('finished', { detail: value });
        ```

        `EventTarget.mixin` also works with prototypes:

        ```javascript
        var Person = function() {};
        RSVP.EventTarget.mixin(Person.prototype);

        var yehuda = new Person();
        var tom = new Person();

        yehuda.on('poke', function(event) {
          console.log('Yehuda says OW');
        });

        tom.on('poke', function(event) {
          console.log('Tom says OW');
        });

        yehuda.trigger('poke');
        tom.trigger('poke');
        ```

        @method mixin
        @for RSVP.EventTarget
        @private
        @param {Object} object object to extend with EventTarget methods
      */
      mixin: function(object) {
        object.on = this.on;
        object.off = this.off;
        object.trigger = this.trigger;
        object._promiseCallbacks = undefined;
        return object;
      },

      /**
        Registers a callback to be executed when `eventName` is triggered

        ```javascript
        object.on('event', function(eventInfo){
          // handle the event
        });

        object.trigger('event');
        ```

        @method on
        @for RSVP.EventTarget
        @private
        @param {String} eventName name of the event to listen for
        @param {Function} callback function to be called when the event is triggered.
      */
      on: function(eventName, callback) {
        var allCallbacks = $$rsvp$events$$callbacksFor(this), callbacks;

        callbacks = allCallbacks[eventName];

        if (!callbacks) {
          callbacks = allCallbacks[eventName] = [];
        }

        if ($$rsvp$events$$indexOf(callbacks, callback) === -1) {
          callbacks.push(callback);
        }
      },

      /**
        You can use `off` to stop firing a particular callback for an event:

        ```javascript
        function doStuff() { // do stuff! }
        object.on('stuff', doStuff);

        object.trigger('stuff'); // doStuff will be called

        // Unregister ONLY the doStuff callback
        object.off('stuff', doStuff);
        object.trigger('stuff'); // doStuff will NOT be called
        ```

        If you don't pass a `callback` argument to `off`, ALL callbacks for the
        event will not be executed when the event fires. For example:

        ```javascript
        var callback1 = function(){};
        var callback2 = function(){};

        object.on('stuff', callback1);
        object.on('stuff', callback2);

        object.trigger('stuff'); // callback1 and callback2 will be executed.

        object.off('stuff');
        object.trigger('stuff'); // callback1 and callback2 will not be executed!
        ```

        @method off
        @for RSVP.EventTarget
        @private
        @param {String} eventName event to stop listening to
        @param {Function} callback optional argument. If given, only the function
        given will be removed from the event's callback queue. If no `callback`
        argument is given, all callbacks will be removed from the event's callback
        queue.
      */
      off: function(eventName, callback) {
        var allCallbacks = $$rsvp$events$$callbacksFor(this), callbacks, index;

        if (!callback) {
          allCallbacks[eventName] = [];
          return;
        }

        callbacks = allCallbacks[eventName];

        index = $$rsvp$events$$indexOf(callbacks, callback);

        if (index !== -1) { callbacks.splice(index, 1); }
      },

      /**
        Use `trigger` to fire custom events. For example:

        ```javascript
        object.on('foo', function(){
          console.log('foo event happened!');
        });
        object.trigger('foo');
        // 'foo event happened!' logged to the console
        ```

        You can also pass a value as a second argument to `trigger` that will be
        passed as an argument to all event listeners for the event:

        ```javascript
        object.on('foo', function(value){
          console.log(value.name);
        });

        object.trigger('foo', { name: 'bar' });
        // 'bar' logged to the console
        ```

        @method trigger
        @for RSVP.EventTarget
        @private
        @param {String} eventName name of the event to be triggered
        @param {Any} options optional value to be passed to any event handlers for
        the given `eventName`
      */
      trigger: function(eventName, options) {
        var allCallbacks = $$rsvp$events$$callbacksFor(this), callbacks, callback;

        if (callbacks = allCallbacks[eventName]) {
          // Don't cache the callbacks.length since it may grow
          for (var i=0; i<callbacks.length; i++) {
            callback = callbacks[i];

            callback(options);
          }
        }
      }
    };

    var $$rsvp$config$$config = {
      instrument: false
    };

    $$rsvp$events$$default.mixin($$rsvp$config$$config);

    function $$rsvp$config$$configure(name, value) {
      if (name === 'onerror') {
        // handle for legacy users that expect the actual
        // error to be passed to their function added via
        // `RSVP.configure('onerror', someFunctionHere);`
        $$rsvp$config$$config.on('error', value);
        return;
      }

      if (arguments.length === 2) {
        $$rsvp$config$$config[name] = value;
      } else {
        return $$rsvp$config$$config[name];
      }
    }

    function $$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function $$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function $$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var $$utils$$_isArray;

    if (!Array.isArray) {
      $$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      $$utils$$_isArray = Array.isArray;
    }

    var $$utils$$isArray = $$utils$$_isArray;
    var $$utils$$now = Date.now || function() { return new Date().getTime(); };
    function $$utils$$F() { }

    var $$utils$$o_create = (Object.create || function (o) {
      if (arguments.length > 1) {
        throw new Error('Second argument not supported');
      }
      if (typeof o !== 'object') {
        throw new TypeError('Argument must be an object');
      }
      $$utils$$F.prototype = o;
      return new $$utils$$F();
    });

    var $$instrument$$queue = [];

    var $$instrument$$default = function instrument(eventName, promise, child) {
      if (1 === $$instrument$$queue.push({
          name: eventName,
          payload: {
            guid: promise._guidKey + promise._id,
            eventName: eventName,
            detail: promise._result,
            childGuid: child && promise._guidKey + child._id,
            label: promise._label,
            timeStamp: $$utils$$now(),
            stack: new Error(promise._label).stack
          }})) {

            setTimeout(function() {
              var entry;
              for (var i = 0; i < $$instrument$$queue.length; i++) {
                entry = $$instrument$$queue[i];
                $$rsvp$config$$config.trigger(entry.name, entry.payload);
              }
              $$instrument$$queue.length = 0;
            }, 50);
          }
      };

    function $$$internal$$noop() {}
    var $$$internal$$PENDING   = void 0;
    var $$$internal$$FULFILLED = 1;
    var $$$internal$$REJECTED  = 2;
    var $$$internal$$GET_THEN_ERROR = new $$$internal$$ErrorObject();

    function $$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        $$$internal$$GET_THEN_ERROR.error = error;
        return $$$internal$$GET_THEN_ERROR;
      }
    }

    function $$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function $$$internal$$handleForeignThenable(promise, thenable, then) {
      $$rsvp$config$$config.async(function(promise) {
        var sealed = false;
        var error = $$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            $$$internal$$resolve(promise, value);
          } else {
            $$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          $$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          $$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function $$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === $$$internal$$FULFILLED) {
        $$$internal$$fulfill(promise, thenable._result);
      } else if (promise._state === $$$internal$$REJECTED) {
        $$$internal$$reject(promise, thenable._result);
      } else {
        $$$internal$$subscribe(thenable, undefined, function(value) {
          if (thenable !== value) {
            $$$internal$$resolve(promise, value);
          } else {
            $$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          $$$internal$$reject(promise, reason);
        });
      }
    }

    function $$$internal$$handleMaybeThenable(promise, maybeThenable) {
      if (maybeThenable.constructor === promise.constructor) {
        $$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        var then = $$$internal$$getThen(maybeThenable);

        if (then === $$$internal$$GET_THEN_ERROR) {
          $$$internal$$reject(promise, $$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          $$$internal$$fulfill(promise, maybeThenable);
        } else if ($$utils$$isFunction(then)) {
          $$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          $$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function $$$internal$$resolve(promise, value) {
      if (promise === value) {
        $$$internal$$fulfill(promise, value);
      } else if ($$utils$$objectOrFunction(value)) {
        $$$internal$$handleMaybeThenable(promise, value);
      } else {
        $$$internal$$fulfill(promise, value);
      }
    }

    function $$$internal$$publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      $$$internal$$publish(promise);
    }

    function $$$internal$$fulfill(promise, value) {
      if (promise._state !== $$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = $$$internal$$FULFILLED;

      if (promise._subscribers.length === 0) {
        if ($$rsvp$config$$config.instrument) {
          $$instrument$$default('fulfilled', promise);
        }
      } else {
        $$rsvp$config$$config.async($$$internal$$publish, promise);
      }
    }

    function $$$internal$$reject(promise, reason) {
      if (promise._state !== $$$internal$$PENDING) { return; }
      promise._state = $$$internal$$REJECTED;
      promise._result = reason;

      $$rsvp$config$$config.async($$$internal$$publishRejection, promise);
    }

    function $$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onerror = null;

      subscribers[length] = child;
      subscribers[length + $$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + $$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        $$rsvp$config$$config.async($$$internal$$publish, parent);
      }
    }

    function $$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if ($$rsvp$config$$config.instrument) {
        $$instrument$$default(settled === $$$internal$$FULFILLED ? 'fulfilled' : 'rejected', promise);
      }

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          $$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function $$$internal$$ErrorObject() {
      this.error = null;
    }

    var $$$internal$$TRY_CATCH_ERROR = new $$$internal$$ErrorObject();

    function $$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        $$$internal$$TRY_CATCH_ERROR.error = e;
        return $$$internal$$TRY_CATCH_ERROR;
      }
    }

    function $$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = $$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = $$$internal$$tryCatch(callback, detail);

        if (value === $$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          $$$internal$$reject(promise, new TypeError('A promises callback cannot return that same promise.'));
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== $$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        $$$internal$$resolve(promise, value);
      } else if (failed) {
        $$$internal$$reject(promise, error);
      } else if (settled === $$$internal$$FULFILLED) {
        $$$internal$$fulfill(promise, value);
      } else if (settled === $$$internal$$REJECTED) {
        $$$internal$$reject(promise, value);
      }
    }

    function $$$internal$$initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value){
          $$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          $$$internal$$reject(promise, reason);
        });
      } catch(e) {
        $$$internal$$reject(promise, e);
      }
    }

    function $$enumerator$$makeSettledResult(state, position, value) {
      if (state === $$$internal$$FULFILLED) {
        return {
          state: 'fulfilled',
          value: value
        };
      } else {
        return {
          state: 'rejected',
          reason: value
        };
      }
    }

    function $$enumerator$$Enumerator(Constructor, input, abortOnReject, label) {
      this._instanceConstructor = Constructor;
      this.promise = new Constructor($$$internal$$noop, label);
      this._abortOnReject = abortOnReject;

      if (this._validateInput(input)) {
        this._input     = input;
        this.length     = input.length;
        this._remaining = input.length;

        this._init();

        if (this.length === 0) {
          $$$internal$$fulfill(this.promise, this._result);
        } else {
          this.length = this.length || 0;
          this._enumerate();
          if (this._remaining === 0) {
            $$$internal$$fulfill(this.promise, this._result);
          }
        }
      } else {
        $$$internal$$reject(this.promise, this._validationError());
      }
    }

    $$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return $$utils$$isArray(input);
    };

    $$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    $$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    var $$enumerator$$default = $$enumerator$$Enumerator;

    $$enumerator$$Enumerator.prototype._enumerate = function() {
      var length  = this.length;
      var promise = this.promise;
      var input   = this._input;

      for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
        this._eachEntry(input[i], i);
      }
    };

    $$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var c = this._instanceConstructor;
      if ($$utils$$isMaybeThenable(entry)) {
        if (entry.constructor === c && entry._state !== $$$internal$$PENDING) {
          entry._onerror = null;
          this._settledAt(entry._state, i, entry._result);
        } else {
          this._willSettleAt(c.resolve(entry), i);
        }
      } else {
        this._remaining--;
        this._result[i] = this._makeResult($$$internal$$FULFILLED, i, entry);
      }
    };

    $$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var promise = this.promise;

      if (promise._state === $$$internal$$PENDING) {
        this._remaining--;

        if (this._abortOnReject && state === $$$internal$$REJECTED) {
          $$$internal$$reject(promise, value);
        } else {
          this._result[i] = this._makeResult(state, i, value);
        }
      }

      if (this._remaining === 0) {
        $$$internal$$fulfill(promise, this._result);
      }
    };

    $$enumerator$$Enumerator.prototype._makeResult = function(state, i, value) {
      return value;
    };

    $$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      $$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt($$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt($$$internal$$REJECTED, i, reason);
      });
    };

    var $$promise$all$$default = function all(entries, label) {
      return new $$enumerator$$default(this, entries, true /* abort on reject */, label).promise;
    };

    var $$promise$race$$default = function race(entries, label) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor($$$internal$$noop, label);

      if (!$$utils$$isArray(entries)) {
        $$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        $$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        $$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
        $$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    };

    var $$promise$resolve$$default = function resolve(object, label) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor($$$internal$$noop, label);
      $$$internal$$resolve(promise, object);
      return promise;
    };

    var $$promise$reject$$default = function reject(reason, label) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor($$$internal$$noop, label);
      $$$internal$$reject(promise, reason);
      return promise;
    };

    var $$rsvp$promise$$guidKey = 'rsvp_' + $$utils$$now() + '-';
    var $$rsvp$promise$$counter = 0;

    function $$rsvp$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function $$rsvp$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var $$rsvp$promise$$default = $$rsvp$promise$$Promise;

    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise’s eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class RSVP.Promise
      @param {function} resolver
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @constructor
    */
    function $$rsvp$promise$$Promise(resolver, label) {
      this._id = $$rsvp$promise$$counter++;
      this._label = label;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      if ($$rsvp$config$$config.instrument) {
        $$instrument$$default('created', this);
      }

      if ($$$internal$$noop !== resolver) {
        if (!$$utils$$isFunction(resolver)) {
          $$rsvp$promise$$needsResolver();
        }

        if (!(this instanceof $$rsvp$promise$$Promise)) {
          $$rsvp$promise$$needsNew();
        }

        $$$internal$$initializePromise(this, resolver);
      }
    }

    // deprecated
    $$rsvp$promise$$Promise.cast = $$promise$resolve$$default;

    $$rsvp$promise$$Promise.all = $$promise$all$$default;
    $$rsvp$promise$$Promise.race = $$promise$race$$default;
    $$rsvp$promise$$Promise.resolve = $$promise$resolve$$default;
    $$rsvp$promise$$Promise.reject = $$promise$reject$$default;

    $$rsvp$promise$$Promise.prototype = {
      constructor: $$rsvp$promise$$Promise,

      _guidKey: $$rsvp$promise$$guidKey,

      _onerror: function (reason) {
        $$rsvp$config$$config.trigger('error', reason);
      },

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
      then: function(onFulfillment, onRejection, label) {
        var parent = this;
        var state = parent._state;

        if (state === $$$internal$$FULFILLED && !onFulfillment || state === $$$internal$$REJECTED && !onRejection) {
          if ($$rsvp$config$$config.instrument) {
            $$instrument$$default('chained', this, this);
          }
          return this;
        }

        parent._onerror = null;

        var child = new this.constructor($$$internal$$noop, label);
        var result = parent._result;

        if ($$rsvp$config$$config.instrument) {
          $$instrument$$default('chained', parent, child);
        }

        if (state) {
          var callback = arguments[state - 1];
          $$rsvp$config$$config.async(function(){
            $$$internal$$invokeCallback(state, child, callback, result);
          });
        } else {
          $$$internal$$subscribe(parent, child, onFulfillment, onRejection);
        }

        return child;
      },

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection, label) {
        return this.then(null, onRejection, label);
      },

    /**
      `finally` will be invoked regardless of the promise's fate just as native
      try/catch/finally behaves

      Synchronous example:

      ```js
      findAuthor() {
        if (Math.random() > 0.5) {
          throw new Error();
        }
        return new Author();
      }

      try {
        return findAuthor(); // succeed or fail
      } catch(error) {
        return findOtherAuther();
      } finally {
        // always runs
        // doesn't affect the return value
      }
      ```

      Asynchronous example:

      ```js
      findAuthor().catch(function(reason){
        return findOtherAuther();
      }).finally(function(){
        // author was either found, or not
      });
      ```

      @method finally
      @param {Function} callback
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
      'finally': function(callback, label) {
        var constructor = this.constructor;

        return this.then(function(value) {
          return constructor.resolve(callback()).then(function(){
            return value;
          });
        }, function(reason) {
          return constructor.resolve(callback()).then(function(){
            throw reason;
          });
        }, label);
      }
    };

    function $$rsvp$node$$Result() {
      this.value = undefined;
    }

    var $$rsvp$node$$ERROR = new $$rsvp$node$$Result();
    var $$rsvp$node$$GET_THEN_ERROR = new $$rsvp$node$$Result();

    function $$rsvp$node$$getThen(obj) {
      try {
       return obj.then;
      } catch(error) {
        $$rsvp$node$$ERROR.value= error;
        return $$rsvp$node$$ERROR;
      }
    }

    function $$rsvp$node$$tryApply(f, s, a) {
      try {
        f.apply(s, a);
      } catch(error) {
        $$rsvp$node$$ERROR.value = error;
        return $$rsvp$node$$ERROR;
      }
    }

    function $$rsvp$node$$makeObject(_, argumentNames) {
      var obj = {};
      var name;
      var i;
      var length = _.length;
      var args = new Array(length);

      for (var x = 0; x < length; x++) {
        args[x] = _[x];
      }

      for (i = 0; i < argumentNames.length; i++) {
        name = argumentNames[i];
        obj[name] = args[i + 1];
      }

      return obj;
    }

    function $$rsvp$node$$arrayResult(_) {
      var length = _.length;
      var args = new Array(length - 1);

      for (var i = 1; i < length; i++) {
        args[i - 1] = _[i];
      }

      return args;
    }

    function $$rsvp$node$$wrapThenable(then, promise) {
      return {
        then: function(onFulFillment, onRejection) {
          return then.call(promise, onFulFillment, onRejection);
        }
      };
    }

    var $$rsvp$node$$default = function denodeify(nodeFunc, options) {
      var fn = function() {
        var self = this;
        var l = arguments.length;
        var args = new Array(l + 1);
        var arg;
        var promiseInput = false;

        for (var i = 0; i < l; ++i) {
          arg = arguments[i];

          if (!promiseInput) {
            // TODO: clean this up
            promiseInput = $$rsvp$node$$needsPromiseInput(arg);
            if (promiseInput === $$rsvp$node$$GET_THEN_ERROR) {
              var p = new $$rsvp$promise$$default($$$internal$$noop);
              $$$internal$$reject(p, $$rsvp$node$$GET_THEN_ERROR.value);
              return p;
            } else if (promiseInput && promiseInput !== true) {
              arg = $$rsvp$node$$wrapThenable(promiseInput, arg);
            }
          }
          args[i] = arg;
        }

        var promise = new $$rsvp$promise$$default($$$internal$$noop);

        args[l] = function(err, val) {
          if (err)
            $$$internal$$reject(promise, err);
          else if (options === undefined)
            $$$internal$$resolve(promise, val);
          else if (options === true)
            $$$internal$$resolve(promise, $$rsvp$node$$arrayResult(arguments));
          else if ($$utils$$isArray(options))
            $$$internal$$resolve(promise, $$rsvp$node$$makeObject(arguments, options));
          else
            $$$internal$$resolve(promise, val);
        };

        if (promiseInput) {
          return $$rsvp$node$$handlePromiseInput(promise, args, nodeFunc, self);
        } else {
          return $$rsvp$node$$handleValueInput(promise, args, nodeFunc, self);
        }
      };

      fn.__proto__ = nodeFunc;

      return fn;
    };

    function $$rsvp$node$$handleValueInput(promise, args, nodeFunc, self) {
      var result = $$rsvp$node$$tryApply(nodeFunc, self, args);
      if (result === $$rsvp$node$$ERROR) {
        $$$internal$$reject(promise, result.value);
      }
      return promise;
    }

    function $$rsvp$node$$handlePromiseInput(promise, args, nodeFunc, self){
      return $$rsvp$promise$$default.all(args).then(function(args){
        var result = $$rsvp$node$$tryApply(nodeFunc, self, args);
        if (result === $$rsvp$node$$ERROR) {
          $$$internal$$reject(promise, result.value);
        }
        return promise;
      });
    }

    function $$rsvp$node$$needsPromiseInput(arg) {
      if (arg && typeof arg === 'object') {
        if (arg.constructor === $$rsvp$promise$$default) {
          return true;
        } else {
          return $$rsvp$node$$getThen(arg);
        }
      } else {
        return false;
      }
    }

    var $$rsvp$all$$default = function all(array, label) {
      return $$rsvp$promise$$default.all(array, label);
    };

    function $$rsvp$all$settled$$AllSettled(Constructor, entries, label) {
      this._superConstructor(Constructor, entries, false /* don't abort on reject */, label);
    }

    $$rsvp$all$settled$$AllSettled.prototype = $$utils$$o_create($$enumerator$$default.prototype);
    $$rsvp$all$settled$$AllSettled.prototype._superConstructor = $$enumerator$$default;
    $$rsvp$all$settled$$AllSettled.prototype._makeResult = $$enumerator$$makeSettledResult;

    $$rsvp$all$settled$$AllSettled.prototype._validationError = function() {
      return new Error('allSettled must be called with an array');
    };

    var $$rsvp$all$settled$$default = function allSettled(entries, label) {
      return new $$rsvp$all$settled$$AllSettled($$rsvp$promise$$default, entries, label).promise;
    };

    var $$rsvp$race$$default = function race(array, label) {
      return $$rsvp$promise$$default.race(array, label);
    };

    function $$promise$hash$$PromiseHash(Constructor, object, label) {
      this._superConstructor(Constructor, object, true, label);
    }

    var $$promise$hash$$default = $$promise$hash$$PromiseHash;
    $$promise$hash$$PromiseHash.prototype = $$utils$$o_create($$enumerator$$default.prototype);
    $$promise$hash$$PromiseHash.prototype._superConstructor = $$enumerator$$default;

    $$promise$hash$$PromiseHash.prototype._init = function() {
      this._result = {};
    };

    $$promise$hash$$PromiseHash.prototype._validateInput = function(input) {
      return input && typeof input === 'object';
    };

    $$promise$hash$$PromiseHash.prototype._validationError = function() {
      return new Error('Promise.hash must be called with an object');
    };

    $$promise$hash$$PromiseHash.prototype._enumerate = function() {
      var promise = this.promise;
      var input   = this._input;
      var results = [];

      for (var key in input) {
        if (promise._state === $$$internal$$PENDING && input.hasOwnProperty(key)) {
          results.push({
            position: key,
            entry: input[key]
          });
        }
      }

      var length = results.length;
      this._remaining = length;
      var result;

      for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
        result = results[i];
        this._eachEntry(result.entry, result.position);
      }
    };

    var $$rsvp$hash$$default = function hash(object, label) {
      return new $$promise$hash$$default($$rsvp$promise$$default, object, label).promise;
    };

    function $$rsvp$hash$settled$$HashSettled(Constructor, object, label) {
      this._superConstructor(Constructor, object, false, label);
    }

    $$rsvp$hash$settled$$HashSettled.prototype = $$utils$$o_create($$promise$hash$$default.prototype);
    $$rsvp$hash$settled$$HashSettled.prototype._superConstructor = $$enumerator$$default;
    $$rsvp$hash$settled$$HashSettled.prototype._makeResult = $$enumerator$$makeSettledResult;

    $$rsvp$hash$settled$$HashSettled.prototype._validationError = function() {
      return new Error('hashSettled must be called with an object');
    };

    var $$rsvp$hash$settled$$default = function hashSettled(object, label) {
      return new $$rsvp$hash$settled$$HashSettled($$rsvp$promise$$default, object, label).promise;
    };

    var $$rsvp$rethrow$$default = function rethrow(reason) {
      setTimeout(function() {
        throw reason;
      });
      throw reason;
    };

    var $$rsvp$defer$$default = function defer(label) {
      var deferred = { };

      deferred.promise = new $$rsvp$promise$$default(function(resolve, reject) {
        deferred.resolve = resolve;
        deferred.reject = reject;
      }, label);

      return deferred;
    };

    var $$rsvp$map$$default = function map(promises, mapFn, label) {
      return $$rsvp$promise$$default.all(promises, label).then(function(values) {
        if (!$$utils$$isFunction(mapFn)) {
          throw new TypeError("You must pass a function as map's second argument.");
        }

        var length = values.length;
        var results = new Array(length);

        for (var i = 0; i < length; i++) {
          results[i] = mapFn(values[i]);
        }

        return $$rsvp$promise$$default.all(results, label);
      });
    };

    var $$rsvp$resolve$$default = function resolve(value, label) {
      return $$rsvp$promise$$default.resolve(value, label);
    };

    var $$rsvp$reject$$default = function reject(reason, label) {
      return $$rsvp$promise$$default.reject(reason, label);
    };

    var $$rsvp$filter$$default = function filter(promises, filterFn, label) {
      return $$rsvp$promise$$default.all(promises, label).then(function(values) {
        if (!$$utils$$isFunction(filterFn)) {
          throw new TypeError("You must pass a function as filter's second argument.");
        }

        var length = values.length;
        var filtered = new Array(length);

        for (var i = 0; i < length; i++) {
          filtered[i] = filterFn(values[i]);
        }

        return $$rsvp$promise$$default.all(filtered, label).then(function(filtered) {
          var results = new Array(length);
          var newLength = 0;

          for (var i = 0; i < length; i++) {
            if (filtered[i]) {
              results[newLength] = values[i];
              newLength++;
            }
          }

          results.length = newLength;

          return results;
        });
      });
    };

    var $$rsvp$asap$$len = 0;

    var $$rsvp$asap$$default = function asap(callback, arg) {
      $$rsvp$asap$$queue[$$rsvp$asap$$len] = callback;
      $$rsvp$asap$$queue[$$rsvp$asap$$len + 1] = arg;
      $$rsvp$asap$$len += 2;
      if ($$rsvp$asap$$len === 2) {
        // If len is 1, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        $$rsvp$asap$$scheduleFlush();
      }
    };

    var $$rsvp$asap$$browserGlobal = (typeof window !== 'undefined') ? window : {};
    var $$rsvp$asap$$BrowserMutationObserver = $$rsvp$asap$$browserGlobal.MutationObserver || $$rsvp$asap$$browserGlobal.WebKitMutationObserver;

    // test for web worker but not in IE10
    var $$rsvp$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function $$rsvp$asap$$useNextTick() {
      return function() {
        process.nextTick($$rsvp$asap$$flush);
      };
    }

    function $$rsvp$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new $$rsvp$asap$$BrowserMutationObserver($$rsvp$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function $$rsvp$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = $$rsvp$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function $$rsvp$asap$$useSetTimeout() {
      return function() {
        setTimeout($$rsvp$asap$$flush, 1);
      };
    }

    var $$rsvp$asap$$queue = new Array(1000);

    function $$rsvp$asap$$flush() {
      for (var i = 0; i < $$rsvp$asap$$len; i+=2) {
        var callback = $$rsvp$asap$$queue[i];
        var arg = $$rsvp$asap$$queue[i+1];

        callback(arg);

        $$rsvp$asap$$queue[i] = undefined;
        $$rsvp$asap$$queue[i+1] = undefined;
      }

      $$rsvp$asap$$len = 0;
    }

    var $$rsvp$asap$$scheduleFlush;

    // Decide what async method to use to triggering processing of queued callbacks:
    if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
      $$rsvp$asap$$scheduleFlush = $$rsvp$asap$$useNextTick();
    } else if ($$rsvp$asap$$BrowserMutationObserver) {
      $$rsvp$asap$$scheduleFlush = $$rsvp$asap$$useMutationObserver();
    } else if ($$rsvp$asap$$isWorker) {
      $$rsvp$asap$$scheduleFlush = $$rsvp$asap$$useMessageChannel();
    } else {
      $$rsvp$asap$$scheduleFlush = $$rsvp$asap$$useSetTimeout();
    }

    // default async is asap;
    $$rsvp$config$$config.async = $$rsvp$asap$$default;

    var $$rsvp$$cast = $$rsvp$resolve$$default;

    function $$rsvp$$async(callback, arg) {
      $$rsvp$config$$config.async(callback, arg);
    }

    function $$rsvp$$on() {
      $$rsvp$config$$config.on.apply($$rsvp$config$$config, arguments);
    }

    function $$rsvp$$off() {
      $$rsvp$config$$config.off.apply($$rsvp$config$$config, arguments);
    }

    // Set up instrumentation through `window.__PROMISE_INTRUMENTATION__`
    if (typeof window !== 'undefined' && typeof window['__PROMISE_INSTRUMENTATION__'] === 'object') {
      var $$rsvp$$callbacks = window['__PROMISE_INSTRUMENTATION__'];
      $$rsvp$config$$configure('instrument', true);
      for (var $$rsvp$$eventName in $$rsvp$$callbacks) {
        if ($$rsvp$$callbacks.hasOwnProperty($$rsvp$$eventName)) {
          $$rsvp$$on($$rsvp$$eventName, $$rsvp$$callbacks[$$rsvp$$eventName]);
        }
      }
    }

    var rsvp$umd$$RSVP = {
      'race': $$rsvp$race$$default,
      'Promise': $$rsvp$promise$$default,
      'allSettled': $$rsvp$all$settled$$default,
      'hash': $$rsvp$hash$$default,
      'hashSettled': $$rsvp$hash$settled$$default,
      'denodeify': $$rsvp$node$$default,
      'on': $$rsvp$$on,
      'off': $$rsvp$$off,
      'map': $$rsvp$map$$default,
      'filter': $$rsvp$filter$$default,
      'resolve': $$rsvp$resolve$$default,
      'reject': $$rsvp$reject$$default,
      'all': $$rsvp$all$$default,
      'rethrow': $$rsvp$rethrow$$default,
      'defer': $$rsvp$defer$$default,
      'EventTarget': $$rsvp$events$$default,
      'configure': $$rsvp$config$$configure,
      'async': $$rsvp$$async
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define.amd) {
      define(function() { return rsvp$umd$$RSVP; });
    } else if (typeof module !== 'undefined' && module.exports) {
      module.exports = rsvp$umd$$RSVP;
    } else if (typeof this !== 'undefined') {
      this['RSVP'] = rsvp$umd$$RSVP;
    }
}).call(this);
}).call(this,require('_process'))
},{"_process":"/Users/gregtatum/Dropbox/greg-sites/shaders/node_modules/browserify/node_modules/process/browser.js"}]},{},["./js/Main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL2pzL01haW4uanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9zaGFkZXJzL2pzL0xldmVsTG9hZGVyLmpzIiwiL1VzZXJzL2dyZWd0YXR1bS9Ecm9wYm94L2dyZWctc2l0ZXMvc2hhZGVycy9qcy9Qb2VtLmpzIiwiL1VzZXJzL2dyZWd0YXR1bS9Ecm9wYm94L2dyZWctc2l0ZXMvc2hhZGVycy9qcy9jb21wb25lbnRzL2NhbWVyYXMvQ2FtZXJhLmpzIiwiL1VzZXJzL2dyZWd0YXR1bS9Ecm9wYm94L2dyZWctc2l0ZXMvc2hhZGVycy9qcy9jb21wb25lbnRzL2NhbWVyYXMvQ29udHJvbHMuanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9zaGFkZXJzL2pzL2NvbXBvbmVudHMvZGVtb3MvR3JpZC5qcyIsIi9Vc2Vycy9ncmVndGF0dW0vRHJvcGJveC9ncmVnLXNpdGVzL3NoYWRlcnMvanMvY29tcG9uZW50cy9kZW1vcy9TaW5lR3Jhdml0eUNsb3VkLmpzIiwiL1VzZXJzL2dyZWd0YXR1bS9Ecm9wYm94L2dyZWctc2l0ZXMvc2hhZGVycy9qcy9jb21wb25lbnRzL2RlbW9zL1NwaGVyZXMuanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9zaGFkZXJzL2pzL2NvbXBvbmVudHMvZGVtb3MvdGV4dHVyZVBvc2l0aW9uYWxNYXRyaWNlcy9pbmRleC5qcyIsIi9Vc2Vycy9ncmVndGF0dW0vRHJvcGJveC9ncmVnLXNpdGVzL3NoYWRlcnMvanMvY29tcG9uZW50cy9kZW1vcy91bmlmb3JtUG9zaXRpb25hbE1hdHJpY2VzL2luZGV4LmpzIiwiL1VzZXJzL2dyZWd0YXR1bS9Ecm9wYm94L2dyZWctc2l0ZXMvc2hhZGVycy9qcy9jb21wb25lbnRzL3V0aWxzL1N0YXRzLmpzIiwiL1VzZXJzL2dyZWd0YXR1bS9Ecm9wYm94L2dyZWctc2l0ZXMvc2hhZGVycy9qcy9sZXZlbHMvaW5kZXguanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9zaGFkZXJzL2pzL2xldmVscy9zaW5lR3Jhdml0eUNsb3VkLmpzIiwiL1VzZXJzL2dyZWd0YXR1bS9Ecm9wYm94L2dyZWctc2l0ZXMvc2hhZGVycy9qcy9sZXZlbHMvc3BoZXJlc0RlbW8uanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9zaGFkZXJzL2pzL2xldmVscy90ZXh0dXJlUG9zaXRpb25hbE1hdHJpY2VzLmpzIiwiL1VzZXJzL2dyZWd0YXR1bS9Ecm9wYm94L2dyZWctc2l0ZXMvc2hhZGVycy9qcy9sZXZlbHMvdW5pZm9ybVBvc2l0aW9uYWxNYXRyaWNlcy5qcyIsIi9Vc2Vycy9ncmVndGF0dW0vRHJvcGJveC9ncmVnLXNpdGVzL3NoYWRlcnMvanMvdXRpbHMvQ2xvY2suanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9zaGFkZXJzL2pzL3V0aWxzL0V2ZW50RGlzcGF0Y2hlci5qcyIsIi9Vc2Vycy9ncmVndGF0dW0vRHJvcGJveC9ncmVnLXNpdGVzL3NoYWRlcnMvanMvdXRpbHMvbG9hZFRleHQuanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9zaGFkZXJzL2pzL3V0aWxzL2xvYWRUZXh0dXJlLmpzIiwiL1VzZXJzL2dyZWd0YXR1bS9Ecm9wYm94L2dyZWctc2l0ZXMvc2hhZGVycy9qcy91dGlscy9yYW5kb20uanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9zaGFkZXJzL2pzL3ZlbmRvci9PcmJpdENvbnRyb2xzLmpzIiwiL1VzZXJzL2dyZWd0YXR1bS9Ecm9wYm94L2dyZWctc2l0ZXMvc2hhZGVycy9qcy92ZW5kb3IvU3RhdHMuanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9zaGFkZXJzL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9zaGFkZXJzL25vZGVfbW9kdWxlcy9yc3ZwL2Rpc3QvcnN2cC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3prQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBMZXZlbExvYWRlciA9IHJlcXVpcmUoJy4vTGV2ZWxMb2FkZXInKTtcblxuZnVuY3Rpb24gY2FtZWxDYXNlVG9TcGFjZWQoIHN0cmluZyApIHtcblx0XG5cdHJldHVybiBzdHJpbmdcblx0ICAgIC5yZXBsYWNlKC8oW0EtWl0pL2csICcgJDEnKVxuXHQgICAgLnJlcGxhY2UoL14uLywgZnVuY3Rpb24oc3RyKXsgcmV0dXJuIHN0ci50b1VwcGVyQ2FzZSgpOyB9KVxuXHRcdFxufVxuXG4kKGZ1bmN0aW9uKCkge1xuXHRcblx0dmFyIGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSk7XG5cdFxuXHR2YXIgbGV2ZWxzID0gXy5rZXlzKCByZXF1aXJlKCcuL2xldmVscycpICk7XG5cdFxuXHR2YXIgbGV2ZWxUb0xvYWQgPSBfLmNvbnRhaW5zKCBsZXZlbHMsIGhhc2ggKSA/IGhhc2ggOiBfLmZpcnN0KCBsZXZlbHMgKTtcblx0XG5cdCQoJyNMZXZlbFNlbGVjdCcpXG5cdFx0LmFwcGVuZChcblx0XHRcblx0XHRcdF8ucmVkdWNlKCBsZXZlbHMsIGZ1bmN0aW9uKCBtZW1vLCBsZXZlbCApIHtcblx0XHRcdFx0XG5cdFx0XHRcdHZhciBsZXZlbFByZXR0eSA9IGNhbWVsQ2FzZVRvU3BhY2VkKCBsZXZlbCApO1xuXHRcdFx0XHR2YXIgc2VsZWN0ZWQgPSBsZXZlbCA9PT0gbGV2ZWxUb0xvYWQgPyBcIiBzZWxlY3RlZFwiIDogXCJcIjtcblxuXHRcdFx0XHRyZXR1cm4gbWVtbyArIFwiPG9wdGlvbiB2YWx1ZT0nXCIrbGV2ZWwrXCInXCIrc2VsZWN0ZWQrXCI+XCIrbGV2ZWxQcmV0dHkrXCI8L29wdGlvbj5cIjtcblx0XHRcdFx0XG5cdFx0XHR9LCBcIlwiKVxuXHRcblx0XHQpXG5cdFx0Lm9uKCBcImNoYW5nZVwiLCBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBsZXZlbCA9ICQodGhpcykudmFsKCk7XG5cdFx0XHRMZXZlbExvYWRlciggbGV2ZWwgKTtcblx0XHRcdHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gbGV2ZWw7XG5cdFx0fSlcblx0O1xuXG5cdExldmVsTG9hZGVyKCBsZXZlbFRvTG9hZCAgKTtcbn0pOyIsIi8vIERlY2xhcmF0aXZlbHkgc2V0IHVwIHRoZSBzY2VuZSB1c2luZyBhIGxldmVsIG1hbmlmZXN0LiBFYWNoIG9iamVjdFxuLy8gaW4gdGhlIGxldmVsIG1hbmlmZXN0IGdldHMgaW5pdGlhdGVkIGFzIGEgcHJvcGVydHkgb24gdGhlIHBvZW0gb2JqZWN0XG4vLyBhbmQgZ2V0cyBwYXNzZWQgdGhlIHBvZW0gYXMgdGhlIGZpcnN0IHZhcmlhYmxlLCBhbmQgdGhlIHByb3BlcnRpZXMgYXNcbi8vIHRoZSBzZWNvbmRcblxudmFyIFBvZW0gPSByZXF1aXJlKCcuL1BvZW0nKTtcbnZhciBsZXZlbHMgPSByZXF1aXJlKCcuL2xldmVscycpO1xuXG52YXIgY3VycmVudExldmVsID0gbnVsbDtcbnZhciBjdXJyZW50UG9lbSA9IG51bGw7XG5cbndpbmRvdy5MZXZlbExvYWRlciA9IGZ1bmN0aW9uKCBuYW1lICkge1xuXHRcblx0aWYoY3VycmVudFBvZW0pIGN1cnJlbnRQb2VtLmRlc3Ryb3koKTtcblx0XG5cdGN1cnJlbnRMZXZlbCA9IGxldmVsc1tuYW1lXTtcblx0Y3VycmVudFBvZW0gPSBuZXcgUG9lbSggY3VycmVudExldmVsICk7XG5cdHdpbmRvdy5wb2VtID0gY3VycmVudFBvZW07XG5cbn07XG5cdFxubW9kdWxlLmV4cG9ydHMgPSBMZXZlbExvYWRlcjsiLCJ2YXIgU3RhdHMgPSByZXF1aXJlKCcuL3ZlbmRvci9TdGF0cycpO1xudmFyIEV2ZW50RGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4vdXRpbHMvRXZlbnREaXNwYXRjaGVyJyk7XG52YXIgQ2xvY2sgPSByZXF1aXJlKCcuL3V0aWxzL0Nsb2NrJyk7XG52YXIgQ2FtZXJhID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL2NhbWVyYXMvQ2FtZXJhJyk7XG5cbnZhciBfcmVuZGVyZXI7XG5cbnZhciBQb2VtID0gZnVuY3Rpb24oIGxldmVsICkge1xuXG5cdHRoaXMucmF0aW8gPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA+PSAxID8gd2luZG93LmRldmljZVBpeGVsUmF0aW8gOiAxO1xuXHRcblx0dGhpcy5kaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJ2NvbnRhaW5lcicgKTtcblx0dGhpcy5jYW52YXMgPSBudWxsO1xuXHR0aGlzLnNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG5cdHRoaXMucmVxdWVzdGVkRnJhbWUgPSB1bmRlZmluZWQ7XG5cblx0dGhpcy5jbG9jayA9IG5ldyBDbG9jaygpO1xuXHR0aGlzLmNhbWVyYSA9IG5ldyBDYW1lcmEoIHRoaXMsIGxldmVsLmNvbmZpZy5jYW1lcmEgKTtcblx0dGhpcy5zY2VuZS5mb2cgPSBuZXcgVEhSRUUuRm9nKCAweDIyMjIyMiwgdGhpcy5jYW1lcmEub2JqZWN0LnBvc2l0aW9uLnogLyAyLCB0aGlzLmNhbWVyYS5vYmplY3QucG9zaXRpb24ueiAqIDIgKTtcblx0XG5cdHRoaXMuYWRkUmVuZGVyZXIoKTtcblx0XG5cdHRoaXMucGFyc2VMZXZlbCggbGV2ZWwgKTtcblx0XG5cdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcnMoKTtcblx0XG5cdHRoaXMubG9vcCgpO1xuXHRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUG9lbTtcblxuUG9lbS5wcm90b3R5cGUgPSB7XG5cdFxuXHRwYXJzZUxldmVsIDogZnVuY3Rpb24oIGxldmVsICkge1xuXHRcdF8uZWFjaCggbGV2ZWwub2JqZWN0cywgZnVuY3Rpb24oIHZhbHVlLCBrZXkgKSB7XG5cdFx0XHRpZihfLmlzT2JqZWN0KCB2YWx1ZSApKSB7XG5cdFx0XHRcdHRoaXNbIGtleSBdID0gbmV3IHZhbHVlLm9iamVjdCggdGhpcywgdmFsdWUucHJvcGVydGllcyApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpc1sga2V5IF0gPSB2YWx1ZTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdH0sIHRoaXMpO1xuXHR9LFxuXHRcblx0YWRkUmVuZGVyZXIgOiBmdW5jdGlvbigpIHtcblx0XHRpZighX3JlbmRlcmVyKSB7XG5cdFx0XG5cdFx0XHRfcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7XG5cdFx0XHRcdGFscGhhIDogdHJ1ZVxuXHRcdFx0fSk7XG5cdFx0XHRcblx0XHR9XG5cdFx0X3JlbmRlcmVyLnNldFNpemUoIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQgKTtcblx0XHR0aGlzLmRpdi5hcHBlbmRDaGlsZCggX3JlbmRlcmVyLmRvbUVsZW1lbnQgKTtcblx0XHR0aGlzLmNhbnZhcyA9IF9yZW5kZXJlci5kb21FbGVtZW50O1xuXHR9LFxuXHRcblx0YWRkU3RhdHMgOiBmdW5jdGlvbigpIHtcblxuXHR9LFxuXHRcblx0YWRkRXZlbnRMaXN0ZW5lcnMgOiBmdW5jdGlvbigpIHtcblx0XHQkKHdpbmRvdykub24oJ3Jlc2l6ZScsIHRoaXMucmVzaXplSGFuZGxlci5iaW5kKHRoaXMpKTtcblx0fSxcblx0XG5cdHJlc2l6ZUhhbmRsZXIgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHRfcmVuZGVyZXIuc2V0U2l6ZSggd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCApO1xuXHRcdHRoaXMuZGlzcGF0Y2goIHsgdHlwZSA6IFwicmVzaXplXCIgfSApO1xuXHRcdFxuXHR9LFxuXHRcdFx0XG5cdGxvb3AgOiBmdW5jdGlvbigpIHtcblxuXHRcdHRoaXMucmVxdWVzdGVkRnJhbWUgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIHRoaXMubG9vcC5iaW5kKHRoaXMpICk7XG5cdFx0dGhpcy51cGRhdGUoKTtcblxuXHR9LFxuXHRcdFx0XG5cdHVwZGF0ZSA6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdHRoaXMuZGlzcGF0Y2goe1xuXHRcdFx0dHlwZTogXCJ1cGRhdGVcIixcblx0XHRcdGR0OiB0aGlzLmNsb2NrLmdldERlbHRhKCksXG5cdFx0XHR0aW1lOiB0aGlzLmNsb2NrLnRpbWVcblx0XHR9KTtcblx0XHRcblx0XHRfcmVuZGVyZXIucmVuZGVyKCB0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYS5vYmplY3QgKTtcblxuXHR9LFxuXHRcblx0ZGVzdHJveSA6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSggdGhpcy5yZXF1ZXN0ZWRGcmFtZSApO1xuXHRcdFxuXHRcdHRoaXMuZGlzcGF0Y2goe1xuXHRcdFx0dHlwZTogXCJkZXN0cm95XCJcblx0XHR9KTtcblx0fVxufTtcblxuRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5hcHBseSggUG9lbS5wcm90b3R5cGUgKTsiLCJ2YXIgQ2FtZXJhID0gZnVuY3Rpb24oIHBvZW0sIHByb3BlcnRpZXMgKSB7XG5cdFxuXHR0aGlzLnBvZW0gPSBwb2VtO1xuXHRcdFx0XG5cdHRoaXMub2JqZWN0ID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKFxuXHRcdDUwLFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gZm92XG5cdFx0d2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQsXHQvLyBhc3BlY3QgcmF0aW9cblx0XHQzLFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gbmVhciBmcnVzdHVtXG5cdFx0MTAwMFx0XHRcdFx0XHRcdFx0XHRcdC8vIGZhciBmcnVzdHVtXG5cdCk7XG5cdHRoaXMub2JqZWN0LnBvc2l0aW9uLnggPSBfLmlzTnVtYmVyKCBwcm9wZXJ0aWVzLnggKSA/IHByb3BlcnRpZXMueCA6IDA7XG5cdHRoaXMub2JqZWN0LnBvc2l0aW9uLnkgPSBfLmlzTnVtYmVyKCBwcm9wZXJ0aWVzLnkgKSA/IHByb3BlcnRpZXMueSA6IDA7XG5cdHRoaXMub2JqZWN0LnBvc2l0aW9uLnogPSBfLmlzTnVtYmVyKCBwcm9wZXJ0aWVzLnogKSA/IHByb3BlcnRpZXMueiA6IDUwMDtcblx0XG5cdHRoaXMucG9lbS5zY2VuZS5hZGQoIHRoaXMub2JqZWN0ICk7XG5cdFxuXHR0aGlzLnBvZW0ub24oICdyZXNpemUnLCB0aGlzLnJlc2l6ZS5iaW5kKHRoaXMpICk7XG5cdFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW1lcmE7XG5cbkNhbWVyYS5wcm90b3R5cGUgPSB7XG5cdFxuXHRyZXNpemUgOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLm9iamVjdC5hc3BlY3QgPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodDtcblx0XHR0aGlzLm9iamVjdC51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG5cdH1cbn07IiwidmFyIE9yYml0Q29udHJvbHMgPSByZXF1aXJlKCcuLi8uLi92ZW5kb3IvT3JiaXRDb250cm9scycpO1xuXG52YXIgQ29udHJvbHMgPSBmdW5jdGlvbiggcG9lbSwgcHJvcGVydGllcyApIHtcblx0XG5cdHRoaXMucG9lbSA9IHBvZW07XG5cdHRoaXMucHJvcGVydGllcyA9IHByb3BlcnRpZXM7XG5cblx0dGhpcy5jb250cm9scyA9IG5ldyBPcmJpdENvbnRyb2xzKCB0aGlzLnBvZW0uY2FtZXJhLm9iamVjdCwgdGhpcy5wb2VtLmNhbnZhcyApO1xuXHRcblx0dGhpcy5wb2VtLm9uKCAndXBkYXRlJywgdGhpcy5jb250cm9scy51cGRhdGUuYmluZCggdGhpcy5jb250cm9scyApICk7XG5cdFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9scztcbiIsInZhciByYW5kb20gPSByZXF1aXJlKCcuLi8uLi91dGlscy9yYW5kb20nKTtcblxudmFyIEdyaWQgPSBmdW5jdGlvbiggcG9lbSwgcHJvcGVydGllcyApIHtcblx0XG5cdHRoaXMucG9lbSA9IHBvZW07XG5cblx0dmFyIGxpbmVNYXRlcmlhbCA9IG5ldyBUSFJFRS5MaW5lQmFzaWNNYXRlcmlhbCggeyBjb2xvcjogMHgzMDMwMzAgfSApLFxuXHRcdGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCksXG5cdFx0Zmxvb3IgPSAtNzUsIHN0ZXAgPSAyNTtcblxuXHRmb3IgKCB2YXIgaSA9IDA7IGkgPD0gNDA7IGkgKysgKSB7XG5cblx0XHRnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKCBuZXcgVEhSRUUuVmVjdG9yMyggLSA1MDAsIGZsb29yLCBpICogc3RlcCAtIDUwMCApICk7XG5cdFx0Z2VvbWV0cnkudmVydGljZXMucHVzaCggbmV3IFRIUkVFLlZlY3RvcjMoICAgNTAwLCBmbG9vciwgaSAqIHN0ZXAgLSA1MDAgKSApO1xuXG5cdFx0Z2VvbWV0cnkudmVydGljZXMucHVzaCggbmV3IFRIUkVFLlZlY3RvcjMoIGkgKiBzdGVwIC0gNTAwLCBmbG9vciwgLTUwMCApICk7XG5cdFx0Z2VvbWV0cnkudmVydGljZXMucHVzaCggbmV3IFRIUkVFLlZlY3RvcjMoIGkgKiBzdGVwIC0gNTAwLCBmbG9vciwgIDUwMCApICk7XG5cblx0fVxuXG5cdHRoaXMuZ3JpZCA9IG5ldyBUSFJFRS5MaW5lKCBnZW9tZXRyeSwgbGluZU1hdGVyaWFsLCBUSFJFRS5MaW5lUGllY2VzICk7XG5cdHRoaXMucG9lbS5zY2VuZS5hZGQoIHRoaXMuZ3JpZCApO1xuXHRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR3JpZDsiLCJ2YXIgcmFuZG9tXHRcdD0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvcmFuZG9tJylcbiAgLCBsb2FkVGV4dHVyZVx0PSByZXF1aXJlKCcuLi8uLi91dGlscy9sb2FkVGV4dHVyZScpXG4gICwgbG9hZFRleHRcdD0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvbG9hZFRleHQnKVxuICAsIFJTVlBcdFx0PSByZXF1aXJlKCdyc3ZwJylcbjtcblxudmFyIFNpbmVHcmF2aXR5Q2xvdWQgPSBmdW5jdGlvbihwb2VtLCBwcm9wZXJ0aWVzKSB7XG5cdFxuXHR0aGlzLnBvZW0gPSBwb2VtO1xuXHRcblx0dGhpcy5vYmplY3QgPSBudWxsO1xuXHR0aGlzLm1hdGVyaWFsID0gbnVsbDtcblx0dGhpcy5hdHRyaWJ1dGVzID0gbnVsbDtcblx0dGhpcy51bmlmb3JtcyA9IG51bGw7XG5cblx0dGhpcy50ZXh0dXJlID0gbnVsbDtcblx0dGhpcy52ZXJ0ZXhTaGFkZXIgPSBudWxsO1xuXHR0aGlzLmZyYWdtZW50U2hhZGVyID0gbnVsbDtcblx0XG5cdHRoaXMuY291bnQgPSAyMDAwMDA7XG5cdHRoaXMucmFkaXVzID0gMjAwO1xuXHR0aGlzLnBvaW50U2l6ZSA9IDc7XG5cdFxuXHRcblx0UlNWUC5hbGwoW1xuXHRcdGxvYWRUZXh0dXJlKCBcImFzc2V0cy9pbWFnZXMvc2luZWdyYXZpdHljbG91ZC5wbmdcIiwgdGhpcywgXCJ0ZXh0dXJlXCIgKSxcblx0XHRsb2FkVGV4dCggXCJhc3NldHMvc2hhZGVycy9zaW5lZ3Jhdml0eWNsb3VkLnZlcnRcIiwgdGhpcywgXCJ2ZXJ0ZXhTaGFkZXJcIiApLFxuXHRcdGxvYWRUZXh0KCBcImFzc2V0cy9zaGFkZXJzL3NpbmVncmF2aXR5Y2xvdWQuZnJhZ1wiLCB0aGlzLCBcImZyYWdtZW50U2hhZGVyXCIgKVxuXHRdKVxuXHQudGhlbihcblx0XHR0aGlzLnN0YXJ0LmJpbmQodGhpcyksXG5cdFx0dGhpcy5lcnJvci5iaW5kKHRoaXMpXG5cdCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbmVHcmF2aXR5Q2xvdWQ7XG5cblNpbmVHcmF2aXR5Q2xvdWQucHJvdG90eXBlID0ge1xuXHRcblx0c3RhcnQgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHR0aGlzLmF0dHJpYnV0ZXMgPSB7XG5cblx0XHRcdHNpemU6ICAgICAgICB7IHR5cGU6ICdmJywgdmFsdWU6IG51bGwgfSxcblx0XHRcdGN1c3RvbUNvbG9yOiB7IHR5cGU6ICdjJywgdmFsdWU6IG51bGwgfVxuXG5cdFx0fTtcblxuXHRcdHRoaXMudW5pZm9ybXMgPSB7XG5cblx0XHRcdGNvbG9yOiAgICAgeyB0eXBlOiBcImNcIiwgdmFsdWU6IG5ldyBUSFJFRS5Db2xvciggMHhmZmZmZmYgKSB9LFxuXHRcdFx0dGV4dHVyZTogICB7IHR5cGU6IFwidFwiLCB2YWx1ZTogdGhpcy50ZXh0dXJlIH1cblxuXHRcdH07XG5cblx0XHR0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKCB7XG5cblx0XHRcdHVuaWZvcm1zOiAgICAgICB0aGlzLnVuaWZvcm1zLFxuXHRcdFx0YXR0cmlidXRlczogICAgIHRoaXMuYXR0cmlidXRlcyxcblx0XHRcdHZlcnRleFNoYWRlcjogICB0aGlzLnZlcnRleFNoYWRlcixcblx0XHRcdGZyYWdtZW50U2hhZGVyOiB0aGlzLmZyYWdtZW50U2hhZGVyLFxuXG5cdFx0XHRibGVuZGluZzogICAgICAgVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcblx0XHRcdGRlcHRoVGVzdDogICAgICBmYWxzZSxcblx0XHRcdHRyYW5zcGFyZW50OiAgICB0cnVlXG5cblx0XHR9KTtcblxuXHRcdHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcblxuXHRcdHRoaXMucG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5jb3VudCAqIDMgKTtcblx0XHR0aGlzLnZlbG9jaXR5ID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5jb3VudCAqIDMgKTtcblx0XHR0aGlzLmNvbG9ycyA9IG5ldyBGbG9hdDMyQXJyYXkoIHRoaXMuY291bnQgKiAzICk7XG5cdFx0dGhpcy5zaXplcyA9IG5ldyBGbG9hdDMyQXJyYXkoIHRoaXMuY291bnQgKTtcblxuXHRcdHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigweDAwMDAwMCk7XG5cdFx0XG5cdFx0dmFyIGh1ZTtcblx0XHRcblx0XHR2YXIgdGhldGEsIHBoaTtcblx0XHRcblx0XHR2YXIgeDtcblxuXHRcdGZvciggdmFyIHYgPSAwOyB2IDwgdGhpcy5jb3VudDsgdisrICkge1xuXG5cdFx0XHR0aGlzLnNpemVzWyB2IF0gPSB0aGlzLnBvaW50U2l6ZTtcblx0XHRcdFxuXHRcdFx0Ly8gdGhldGEgPSByYW5kb20ucmFuZ2VMb3coIDAuMSwgTWF0aC5QSSApO1xuXHRcdFx0Ly8gcGhpID0gcmFuZG9tLnJhbmdlTG93KCBNYXRoLlBJICogMC4zLCBNYXRoLlBJICk7XG5cdFx0XHQvL1xuXHRcdFx0Ly8gdGhpcy5wb3NpdGlvbnNbIHYgKiAzICsgMCBdID0gTWF0aC5zaW4oIHRoZXRhICkgKiBNYXRoLmNvcyggcGhpICkgKiB0aGlzLnJhZGl1cyAqIHRoZXRhICogNTtcblx0XHRcdC8vIHRoaXMucG9zaXRpb25zWyB2ICogMyArIDEgXSA9IE1hdGguc2luKCB0aGV0YSApICogTWF0aC5zaW4oIHBoaSApICogdGhpcy5yYWRpdXM7XG5cdFx0XHQvLyB0aGlzLnBvc2l0aW9uc1sgdiAqIDMgKyAyIF0gPSBNYXRoLmNvcyggdGhldGEgKSAqIHRoaXMucmFkaXVzICogMC4xO1xuXHRcdFx0XG5cdFx0XHR4ID0gcmFuZG9tLnJhbmdlKCAtMSwgMSApO1xuXHRcdFx0XG5cdFx0XHR0aGlzLnBvc2l0aW9uc1sgdiAqIDMgKyAwIF0gPSB4ICogdGhpcy5yYWRpdXM7XG5cdFx0XHR0aGlzLnBvc2l0aW9uc1sgdiAqIDMgKyAxIF0gPSBNYXRoLnNpbiggeCAqIE1hdGguUEkgKiAxMCApICogdGhpcy5yYWRpdXNcblx0XHRcdHRoaXMucG9zaXRpb25zWyB2ICogMyArIDIgXSA9IHRoaXMucmFkaXVzICogLTAuNTtcblxuXHRcdFx0dGhpcy52ZWxvY2l0eVsgdiAqIDMgKyAwIF0gPSByYW5kb20ucmFuZ2UoIC0wLjAxLCAwLjAxICkgKiAwO1xuXHRcdFx0dGhpcy52ZWxvY2l0eVsgdiAqIDMgKyAxIF0gPSByYW5kb20ucmFuZ2UoIC0wLjAxLCAwLjAxICkgKiAxMDtcblx0XHRcdHRoaXMudmVsb2NpdHlbIHYgKiAzICsgMiBdID0gcmFuZG9tLnJhbmdlKCAtMC4wMSwgMC4wMSApICogMDtcblxuXHRcdFx0Ly8gaHVlID0gKHYgLyB0aGlzLmNvdW50ICkgKiAwLjIgKyAwLjQ1O1xuXHRcdFx0XG5cdFx0XHRodWUgPSB4ICogMC4zICsgMC42NTtcblxuXHRcdFx0Y29sb3Iuc2V0SFNMKCBodWUsIDEuMCwgMC41NSApO1xuXG5cdFx0XHR0aGlzLmNvbG9yc1sgdiAqIDMgKyAwIF0gPSBjb2xvci5yO1xuXHRcdFx0dGhpcy5jb2xvcnNbIHYgKiAzICsgMSBdID0gY29sb3IuZztcblx0XHRcdHRoaXMuY29sb3JzWyB2ICogMyArIDIgXSA9IGNvbG9yLmI7XG5cblx0XHR9XG5cblx0XHR0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSggJ3Bvc2l0aW9uJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSggdGhpcy5wb3NpdGlvbnMsIDMgKSApO1xuXHRcdHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCAnY3VzdG9tQ29sb3InLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKCB0aGlzLmNvbG9ycywgMyApICk7XG5cdFx0dGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoICdzaXplJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSggdGhpcy5zaXplcywgMSApICk7XG5cblx0XHR0aGlzLm9iamVjdCA9IG5ldyBUSFJFRS5Qb2ludENsb3VkKCB0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsICk7XG5cdFx0dGhpcy5vYmplY3QucG9zaXRpb24ueSAtPSB0aGlzLnJhZGl1cyAqIDAuMjtcblx0XHRcblx0XHR0aGlzLnBvZW0uc2NlbmUuYWRkKCB0aGlzLm9iamVjdCApO1xuXHRcblx0XG5cdFx0dGhpcy5wb2VtLm9uKCAndXBkYXRlJywgdGhpcy51cGRhdGUuYmluZCh0aGlzKSApO1xuXHRcdFxuXHR9LFxuXHRcblx0ZXJyb3IgOiBmdW5jdGlvbiggZXJyb3IgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQ291bGQgbm90IGxvYWQgYXNzZXRzIGZvciB0aGUgU2luZUdyYXZpdHlDbG91ZFwiLCBlcnJvcik7XG5cdH0sXG5cdFxuXHR1cGRhdGUgOiBmdW5jdGlvbihlKSB7XG5cdFx0XG5cdFx0dmFyIGQyO1xuXHRcblx0XHRmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuY291bnQ7IGkrKyApIHtcblx0XHRcdFxuXHRcdFx0ZDIgPXRoaXMucG9zaXRpb25zWyBpICogMyArIDAgXSAqIHRoaXMucG9zaXRpb25zWyBpICogMyArIDAgXSArXG5cdFx0XHQgICAgdGhpcy5wb3NpdGlvbnNbIGkgKiAzICsgMSBdICogdGhpcy5wb3NpdGlvbnNbIGkgKiAzICsgMSBdICtcblx0XHRcdCAgICB0aGlzLnBvc2l0aW9uc1sgaSAqIDMgKyAyIF0gKiB0aGlzLnBvc2l0aW9uc1sgaSAqIDMgKyAyIF07XG5cblx0XHRcdHRoaXMudmVsb2NpdHlbIGkgKiAzICsgMCBdIC09IHRoaXMucG9zaXRpb25zWyBpICogMyArIDAgXSAvIGQyO1xuXHRcdFx0dGhpcy52ZWxvY2l0eVsgaSAqIDMgKyAxIF0gLT0gdGhpcy5wb3NpdGlvbnNbIGkgKiAzICsgMSBdIC8gZDI7XG5cdFx0XHR0aGlzLnZlbG9jaXR5WyBpICogMyArIDIgXSAtPSB0aGlzLnBvc2l0aW9uc1sgaSAqIDMgKyAyIF0gLyBkMjtcblxuXHRcdFx0dGhpcy5wb3NpdGlvbnNbIGkgKiAzICsgMCBdICs9IHRoaXMudmVsb2NpdHlbIGkgKiAzICsgMCBdO1xuXHRcdFx0dGhpcy5wb3NpdGlvbnNbIGkgKiAzICsgMSBdICs9IHRoaXMudmVsb2NpdHlbIGkgKiAzICsgMSBdO1xuXHRcdFx0dGhpcy5wb3NpdGlvbnNbIGkgKiAzICsgMiBdICs9IHRoaXMudmVsb2NpdHlbIGkgKiAzICsgMiBdO1xuXHRcdFx0XG5cdFx0fVxuXHRcdFxuXHRcdHRoaXMuZ2VvbWV0cnkuYXR0cmlidXRlcy5wb3NpdGlvbi5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cdFx0XG5cdH1cblx0XG59OyIsInZhciByYW5kb20gPSByZXF1aXJlKCcuLi8uLi91dGlscy9yYW5kb20nKTtcblxudmFyIFNwaGVyZXMgPSBmdW5jdGlvbihwb2VtLCBwcm9wZXJ0aWVzKSB7XG5cdFxuXHR0aGlzLnBvZW0gPSBwb2VtO1xuXG5cdHRoaXMuY291bnQgPSBwcm9wZXJ0aWVzLmNvdW50ID4gMCA/IHByb3BlcnRpZXMuY291bnQgOiAxMDtcblx0dGhpcy5kaXNwZXJzaW9uID0gcHJvcGVydGllcy5kaXNwZXJzaW9uIHx8IDEwO1xuXHR0aGlzLnJhZGl1cyA9IHByb3BlcnRpZXMucmFkaXVzID4gMCA/IHByb3BlcnRpZXMucmFkaXVzIDogMTtcblx0XG5cdHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoIHRoaXMucmFkaXVzLCAzMiwgMzIgKTtcblx0dGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCggeyBjb2xvciA6IDB4ZmYwMDAwIH0gKTtcblx0XG5cblx0dGhpcy5tZXNoZXMgPSBbXTtcblx0XG5cdHZhciBpPSAtMTsgd2hpbGUoICsraSA8IHByb3BlcnRpZXMuY291bnQgKSB7XG5cdFx0XG5cdFx0dmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaCggdGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCApO1xuXHRcdFxuXHRcdG1lc2gucG9zaXRpb24ueCA9IHJhbmRvbS5yYW5nZSggLXRoaXMuZGlzcGVyc2lvbiwgdGhpcy5kaXNwZXJzaW9uICk7XG5cdFx0bWVzaC5wb3NpdGlvbi55ID0gcmFuZG9tLnJhbmdlKCAtdGhpcy5kaXNwZXJzaW9uLCB0aGlzLmRpc3BlcnNpb24gKTtcblx0XHRtZXNoLnBvc2l0aW9uLnogPSByYW5kb20ucmFuZ2UoIC10aGlzLmRpc3BlcnNpb24sIHRoaXMuZGlzcGVyc2lvbiApO1xuXHRcdFxuXHRcdHRoaXMucG9lbS5zY2VuZS5hZGQoIG1lc2ggKTtcblx0XHR0aGlzLm1lc2hlcy5wdXNoKCBtZXNoICk7XG5cdH1cblx0XG5cdHRoaXMucG9lbS5vbiggJ3VwZGF0ZScsIHRoaXMudXBkYXRlLmJpbmQodGhpcykgKTtcblx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNwaGVyZXM7XG5cblNwaGVyZXMucHJvdG90eXBlID0ge1xuXHRcblx0dXBkYXRlIDogZnVuY3Rpb24oZSkge1xuXHRcdFxuXHRcdHZhciBpPSAtMTsgd2hpbGUoICsraSA8IHRoaXMuY291bnQgKSB7XG5cdFx0XG5cdFx0XHR0aGlzLm1lc2hlc1tpXS5wb3NpdGlvbi54ICs9IHJhbmRvbS5yYW5nZSggLTAuMDAwNSwgMC4wMDA1ICkgKiB0aGlzLmRpc3BlcnNpb24gKiBlLmR0O1xuXHRcdFx0dGhpcy5tZXNoZXNbaV0ucG9zaXRpb24ueSArPSByYW5kb20ucmFuZ2UoIC0wLjAwMDUsIDAuMDAwNSApICogdGhpcy5kaXNwZXJzaW9uICogZS5kdDtcblx0XHRcdHRoaXMubWVzaGVzW2ldLnBvc2l0aW9uLnogKz0gcmFuZG9tLnJhbmdlKCAtMC4wMDA1LCAwLjAwMDUgKSAqIHRoaXMuZGlzcGVyc2lvbiAqIGUuZHQ7XG5cdFx0XG5cdFx0fVxuXHRcdFxuXHR9XG5cdFxufTsiLCJ2YXIgcmFuZG9tXHRcdD0gcmVxdWlyZSgnLi4vLi4vLi4vdXRpbHMvcmFuZG9tJylcbiAgLCBsb2FkVGV4dHVyZVx0PSByZXF1aXJlKCcuLi8uLi8uLi91dGlscy9sb2FkVGV4dHVyZScpXG4gICwgbG9hZFRleHRcdD0gcmVxdWlyZSgnLi4vLi4vLi4vdXRpbHMvbG9hZFRleHQnKVxuICAsIFJTVlBcdFx0PSByZXF1aXJlKCdyc3ZwJylcbjtcblxudmFyIFRleHR1cmVQb3NpdGlvbmFsTWF0cmljZXMgPSBmdW5jdGlvbihwb2VtLCBwcm9wZXJ0aWVzKSB7XG5cblx0dGhpcy5wb2VtID0gcG9lbTtcblx0XG5cdHRoaXMub2JqZWN0ID0gbnVsbDtcblx0dGhpcy5tYXRlcmlhbCA9IG51bGw7XG5cdHRoaXMuYXR0cmlidXRlcyA9IG51bGw7XG5cdHRoaXMudW5pZm9ybXMgPSBudWxsO1xuXG5cdHRoaXMudGV4dHVyZSA9IG51bGw7XG5cdHRoaXMudmVydGV4U2hhZGVyID0gbnVsbDtcblx0dGhpcy5mcmFnbWVudFNoYWRlciA9IG51bGw7XG5cdFxuXHR0aGlzLmNvdW50ID0gMTAwMDAwO1xuXHR0aGlzLnJhZGl1cyA9IDIwMDtcblx0dGhpcy5wb2ludFNpemUgPSA3O1xuXHRcblx0UlNWUC5hbGwoW1xuXHRcdGxvYWRUZXh0dXJlKCBcImFzc2V0cy9pbWFnZXMvc2luZWdyYXZpdHljbG91ZC5wbmdcIiwgdGhpcywgXCJ0ZXh0dXJlXCIgKSxcblx0XHRsb2FkVGV4dCggXCJqcy9jb21wb25lbnRzL2RlbW9zL1RleHR1cmVQb3NpdGlvbmFsTWF0cmljZXMvc2hhZGVyLnZlcnRcIiwgdGhpcywgXCJ2ZXJ0ZXhTaGFkZXJcIiApLFxuXHRcdGxvYWRUZXh0KCBcImpzL2NvbXBvbmVudHMvZGVtb3MvVGV4dHVyZVBvc2l0aW9uYWxNYXRyaWNlcy9zaGFkZXIuZnJhZ1wiLCB0aGlzLCBcImZyYWdtZW50U2hhZGVyXCIgKVxuXHRdKVxuXHQudGhlbihcblx0XHR0aGlzLnN0YXJ0LmJpbmQodGhpcyksXG5cdFx0dGhpcy5lcnJvci5iaW5kKHRoaXMpXG5cdCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRleHR1cmVQb3NpdGlvbmFsTWF0cmljZXM7XG5cblRleHR1cmVQb3NpdGlvbmFsTWF0cmljZXMucHJvdG90eXBlID0ge1xuXHRcblx0c3RhcnQgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHR2YXIgdHJhbnNmb3JtQ291bnQgPSA1MDtcblx0XHRcblx0XHRcblx0XHR0aGlzLmF0dHJpYnV0ZXMgPSB7XG5cblx0XHRcdHNpemU6ICAgICAgIFx0eyB0eXBlOiAnZicsIHZhbHVlOiBudWxsIH0sXG5cdFx0XHRjdXN0b21Db2xvcjpcdHsgdHlwZTogJ2MnLCB2YWx1ZTogbnVsbCB9LFxuXHRcdFx0dHJhbnNmb3JtSW5kZXg6XHR7IHR5cGU6ICdmJywgdmFsdWU6IG51bGwgfVxuXG5cdFx0fTtcblxuXHRcdHRoaXMudW5pZm9ybXMgPSB7XG5cblx0XHRcdGNvbG9yOiAgICAgXHRcdFx0eyB0eXBlOiBcImNcIiwgdmFsdWU6IG5ldyBUSFJFRS5Db2xvciggMHhmZmZmZmYgKSB9LFxuXHRcdFx0dGV4dHVyZTogICBcdFx0XHR7IHR5cGU6IFwidFwiLCB2YWx1ZTogdGhpcy50ZXh0dXJlIH0sXG5cdFx0XHR0aW1lOiAgICAgIFx0XHRcdHsgdHlwZTogJ2YnLCB2YWx1ZTogRGF0ZS5ub3coKSB9LFxuXHRcdFx0dHJhbnNmb3JtTWF0cml4Olx0eyB0eXBlOiAnbTR2JywgdmFsdWU6IFtdIH1cblxuXHRcdH07XG5cblx0XHR0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKCB7XG5cblx0XHRcdHVuaWZvcm1zOiAgICAgICB0aGlzLnVuaWZvcm1zLFxuXHRcdFx0YXR0cmlidXRlczogICAgIHRoaXMuYXR0cmlidXRlcyxcblx0XHRcdHZlcnRleFNoYWRlcjogICBcIiNkZWZpbmUgVFJBTlNGT1JNX01BVFJJWF9DT1VOVCBcIiArIHRyYW5zZm9ybUNvdW50ICsgXCJcXG5cIiArIHRoaXMudmVydGV4U2hhZGVyLFxuXHRcdFx0ZnJhZ21lbnRTaGFkZXI6IHRoaXMuZnJhZ21lbnRTaGFkZXIsXG5cblx0XHRcdGJsZW5kaW5nOiAgICAgICBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxuXHRcdFx0ZGVwdGhUZXN0OiAgICAgIGZhbHNlLFxuXHRcdFx0dHJhbnNwYXJlbnQ6ICAgIHRydWVcblxuXHRcdH0pO1xuXG5cdFx0dmFyIHZlYzNGbG9hdExlbmd0aCA9IDM7XG5cdFx0dmFyIHBvaW50c0xlbmd0aCA9IDg7XG5cdFx0dmFyIGJveEdlb21ldHJ5TGVuZ3RoID0gcG9pbnRzTGVuZ3RoICogdmVjM0Zsb2F0TGVuZ3RoO1xuXG5cdFx0dGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xuXG5cdFx0dGhpcy5wb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLmNvdW50ICogYm94R2VvbWV0cnlMZW5ndGggKTtcblx0XHR0aGlzLnZlbG9jaXR5ID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5jb3VudCAqIHZlYzNGbG9hdExlbmd0aCApO1xuXHRcdHRoaXMuY29sb3JzID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5jb3VudCAqIGJveEdlb21ldHJ5TGVuZ3RoICk7XG5cdFx0dGhpcy5zaXplcyA9IG5ldyBGbG9hdDMyQXJyYXkoIHRoaXMuY291bnQgKiBwb2ludHNMZW5ndGggKTtcblx0XHR0aGlzLnRyYW5zZm9ybUluZGljZXMgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLmNvdW50ICogcG9pbnRzTGVuZ3RoIClcblxuXHRcdHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigweDAwMDAwMCk7XG5cdFx0dmFyIGh1ZTtcblx0XHRcblx0XHR2YXIgdGhldGEsIHBoaTtcblx0XHRcblx0XHR2YXIgdmVydGljZXMgPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkoIDEsIDEsIDEgKS52ZXJ0aWNlcztcblxuXHRcdHZhciB4LCB5LCB6LCBpLCBqO1xuXG5cdFx0Zm9yKCBpID0gMDsgaSA8IHRoaXMuY291bnQ7IGkrKyApIHtcblxuXHRcdFx0dGhldGEgPSByYW5kb20ucmFuZ2VMb3coIDAuMSwgTWF0aC5QSSApO1xuXHRcdFx0cGhpID0gcmFuZG9tLnJhbmdlTG93KCBNYXRoLlBJICogMC4zLCBNYXRoLlBJICk7XG5cdFx0XHRcblx0XHRcdHggPSBNYXRoLnNpbiggdGhldGEgKSAqIE1hdGguY29zKCBwaGkgKSAqIHRoaXMucmFkaXVzICogdGhldGE7XG5cdFx0XHR5ID0gTWF0aC5zaW4oIHRoZXRhICkgKiBNYXRoLnNpbiggcGhpICkgKiB0aGlzLnJhZGl1cztcblx0XHRcdHogPSBNYXRoLmNvcyggdGhldGEgKSAqIHRoaXMucmFkaXVzIDtcblx0XHRcdFxuXHRcdFx0aHVlID0gKHRoaXMucG9zaXRpb25zWyBpICogMyArIDAgXSAvIHRoaXMucmFkaXVzICogMC4zICsgMC42NSkgJSAxO1xuXG5cdFx0XHRjb2xvci5zZXRIU0woIGh1ZSwgMS4wLCAwLjU1ICk7XG5cdFx0XHRcblx0XHRcdHZhciB0cmFuc2Zvcm1JbmRleCA9IHJhbmRvbS5yYW5nZUludCggMCwgdHJhbnNmb3JtQ291bnQgKTtcblx0XHRcdFxuXHRcdFx0Zm9yKCBqPTA7IGogPCB2ZXJ0aWNlcy5sZW5ndGggOyBqKysgKSB7XG5cdFx0XHRcdFxuXHRcdFx0XHR2YXIgb2Zmc2V0MyA9IChpICogYm94R2VvbWV0cnlMZW5ndGgpICsgKGogKiB2ZWMzRmxvYXRMZW5ndGgpO1xuXHRcdFx0XHR2YXIgb2Zmc2V0MSA9IChpICogYm94R2VvbWV0cnlMZW5ndGggKyBqKTtcblxuXHRcdFx0XHR0aGlzLnNpemVzWyBvZmZzZXQxIF0gPSB0aGlzLnBvaW50U2l6ZTtcblx0XHRcdFx0dGhpcy50cmFuc2Zvcm1JbmRpY2VzWyBvZmZzZXQxIF0gPSB0cmFuc2Zvcm1JbmRleDtcblx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdHRoaXMucG9zaXRpb25zWyBvZmZzZXQzICsgMCBdID0gdmVydGljZXNbal0ueCAqIDMgKyB4O1xuXHRcdFx0XHR0aGlzLnBvc2l0aW9uc1sgb2Zmc2V0MyArIDEgXSA9IHZlcnRpY2VzW2pdLnkgKiAzICsgeTtcblx0XHRcdFx0dGhpcy5wb3NpdGlvbnNbIG9mZnNldDMgKyAyIF0gPSB2ZXJ0aWNlc1tqXS56ICogMyArIHo7XG5cblx0XHRcdFx0dGhpcy5jb2xvcnNbIG9mZnNldDMgKyAwIF0gPSBjb2xvci5yO1xuXHRcdFx0XHR0aGlzLmNvbG9yc1sgb2Zmc2V0MyArIDEgXSA9IGNvbG9yLmc7XG5cdFx0XHRcdHRoaXMuY29sb3JzWyBvZmZzZXQzICsgMiBdID0gY29sb3IuYjtcblxuXHRcdFx0fVxuXHRcdFx0XHRcdFx0XG5cdFx0XHRcblx0XHR9XG5cdFx0XG5cdFx0Zm9yKCBpID0gMDsgaSA8IHRyYW5zZm9ybUNvdW50IDsgaSsrICkge1xuXHRcdFx0XG5cdFx0XHR0aGlzLnVuaWZvcm1zLnRyYW5zZm9ybU1hdHJpeC52YWx1ZVtpXSA9IG5ldyBUSFJFRS5NYXRyaXg0KCkubWFrZVRyYW5zbGF0aW9uKFxuXHRcdFx0XHRyYW5kb20ucmFuZ2UoIC10aGlzLnJhZGl1cywgdGhpcy5yYWRpdXMgKSAqIDAuNSxcblx0XHRcdFx0cmFuZG9tLnJhbmdlKCAtdGhpcy5yYWRpdXMsIHRoaXMucmFkaXVzICkgKiAwLjUsXG5cdFx0XHRcdHJhbmRvbS5yYW5nZSggLXRoaXMucmFkaXVzLCB0aGlzLnJhZGl1cyApICogMC41XG5cdFx0XHQpO1xuXHRcdFx0XG5cdFx0fVxuXG5cdFx0dGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoICdwb3NpdGlvbicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIHRoaXMucG9zaXRpb25zLCAzICkgKTtcblx0XHR0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSggJ2N1c3RvbUNvbG9yJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSggdGhpcy5jb2xvcnMsIDMgKSApO1xuXHRcdHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCAnc2l6ZScsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIHRoaXMuc2l6ZXMsIDEgKSApO1xuXHRcdHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCAndHJhbnNmb3JtSW5kZXgnLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKCB0aGlzLnRyYW5zZm9ybUluZGljZXMsIDEgKSApO1xuXG5cdFx0dGhpcy5vYmplY3QgPSBuZXcgVEhSRUUuUG9pbnRDbG91ZCggdGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCApO1xuXHRcdHRoaXMub2JqZWN0LnBvc2l0aW9uLnkgLT0gdGhpcy5yYWRpdXMgKiAwLjI7XG5cdFx0XG5cdFx0dGhpcy5wb2VtLnNjZW5lLmFkZCggdGhpcy5vYmplY3QgKTtcblx0XG5cdFxuXHRcdHRoaXMucG9lbS5vbiggJ3VwZGF0ZScsIHRoaXMudXBkYXRlLmJpbmQodGhpcykgKTtcblx0XHRcblx0fSxcblx0XG5cdGVycm9yIDogZnVuY3Rpb24oIGVycm9yICkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCBsb2FkIGFzc2V0cyBmb3IgdGhlIFRleHR1cmVQb3NpdGlvbmFsTWF0cmljZXNcIiwgZXJyb3IpO1xuXHR9LFxuXHRcblx0dXBkYXRlIDogZnVuY3Rpb24oZSkge1xuXG5cdFx0dGhpcy51bmlmb3Jtcy50aW1lLnZhbHVlID0gZS50aW1lO1xuXHRcdFxuXHR9XG5cdFxufTsiLCJ2YXIgcmFuZG9tXHRcdD0gcmVxdWlyZSgnLi4vLi4vLi4vdXRpbHMvcmFuZG9tJylcbiAgLCBsb2FkVGV4dHVyZVx0PSByZXF1aXJlKCcuLi8uLi8uLi91dGlscy9sb2FkVGV4dHVyZScpXG4gICwgbG9hZFRleHRcdD0gcmVxdWlyZSgnLi4vLi4vLi4vdXRpbHMvbG9hZFRleHQnKVxuICAsIFJTVlBcdFx0PSByZXF1aXJlKCdyc3ZwJylcbjtcblxudmFyIFVuaWZvcm1Qb3NpdGlvbmFsTWF0cmljZXMgPSBmdW5jdGlvbihwb2VtLCBwcm9wZXJ0aWVzKSB7XG5cblx0dGhpcy5wb2VtID0gcG9lbTtcblx0XG5cdHRoaXMub2JqZWN0ID0gbnVsbDtcblx0dGhpcy5tYXRlcmlhbCA9IG51bGw7XG5cdHRoaXMuYXR0cmlidXRlcyA9IG51bGw7XG5cdHRoaXMudW5pZm9ybXMgPSBudWxsO1xuXG5cdHRoaXMudGV4dHVyZSA9IG51bGw7XG5cdHRoaXMudmVydGV4U2hhZGVyID0gbnVsbDtcblx0dGhpcy5mcmFnbWVudFNoYWRlciA9IG51bGw7XG5cdFxuXHR0aGlzLmNvdW50ID0gMjAwMDAwO1xuXHR0aGlzLnJhZGl1cyA9IDIwMDtcblx0dGhpcy5wb2ludFNpemUgPSA3O1xuXHRcblx0UlNWUC5hbGwoW1xuXHRcdGxvYWRUZXh0dXJlKCBcImFzc2V0cy9pbWFnZXMvc2luZWdyYXZpdHljbG91ZC5wbmdcIiwgdGhpcywgXCJ0ZXh0dXJlXCIgKSxcblx0XHRsb2FkVGV4dCggXCJqcy9jb21wb25lbnRzL2RlbW9zL1VuaWZvcm1Qb3NpdGlvbmFsTWF0cmljZXMvc2hhZGVyLnZlcnRcIiwgdGhpcywgXCJ2ZXJ0ZXhTaGFkZXJcIiApLFxuXHRcdGxvYWRUZXh0KCBcImpzL2NvbXBvbmVudHMvZGVtb3MvVW5pZm9ybVBvc2l0aW9uYWxNYXRyaWNlcy9zaGFkZXIuZnJhZ1wiLCB0aGlzLCBcImZyYWdtZW50U2hhZGVyXCIgKVxuXHRdKVxuXHQudGhlbihcblx0XHR0aGlzLnN0YXJ0LmJpbmQodGhpcyksXG5cdFx0dGhpcy5lcnJvci5iaW5kKHRoaXMpXG5cdCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVuaWZvcm1Qb3NpdGlvbmFsTWF0cmljZXM7XG5cblVuaWZvcm1Qb3NpdGlvbmFsTWF0cmljZXMucHJvdG90eXBlID0ge1xuXHRcblx0c3RhcnQgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHR2YXIgdHJhbnNmb3JtQ291bnQgPSA1MDtcblx0XHRcblx0XHRcblx0XHR0aGlzLmF0dHJpYnV0ZXMgPSB7XG5cblx0XHRcdHNpemU6ICAgICAgIFx0eyB0eXBlOiAnZicsIHZhbHVlOiBudWxsIH0sXG5cdFx0XHRjdXN0b21Db2xvcjpcdHsgdHlwZTogJ2MnLCB2YWx1ZTogbnVsbCB9LFxuXHRcdFx0dHJhbnNmb3JtSW5kZXg6XHR7IHR5cGU6ICdmJywgdmFsdWU6IG51bGwgfVxuXG5cdFx0fTtcblxuXHRcdHRoaXMudW5pZm9ybXMgPSB7XG5cblx0XHRcdGNvbG9yOiAgICAgXHRcdFx0eyB0eXBlOiBcImNcIiwgdmFsdWU6IG5ldyBUSFJFRS5Db2xvciggMHhmZmZmZmYgKSB9LFxuXHRcdFx0dGV4dHVyZTogICBcdFx0XHR7IHR5cGU6IFwidFwiLCB2YWx1ZTogdGhpcy50ZXh0dXJlIH0sXG5cdFx0XHR0aW1lOiAgICAgIFx0XHRcdHsgdHlwZTogJ2YnLCB2YWx1ZTogRGF0ZS5ub3coKSB9LFxuXHRcdFx0dHJhbnNmb3JtTWF0cml4Olx0eyB0eXBlOiAnbTR2JywgdmFsdWU6IFtdIH1cblxuXHRcdH07XG5cblx0XHR0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKCB7XG5cblx0XHRcdHVuaWZvcm1zOiAgICAgICB0aGlzLnVuaWZvcm1zLFxuXHRcdFx0YXR0cmlidXRlczogICAgIHRoaXMuYXR0cmlidXRlcyxcblx0XHRcdHZlcnRleFNoYWRlcjogICBcIiNkZWZpbmUgVFJBTlNGT1JNX01BVFJJWF9DT1VOVCBcIiArIHRyYW5zZm9ybUNvdW50ICsgXCJcXG5cIiArIHRoaXMudmVydGV4U2hhZGVyLFxuXHRcdFx0ZnJhZ21lbnRTaGFkZXI6IHRoaXMuZnJhZ21lbnRTaGFkZXIsXG5cblx0XHRcdGJsZW5kaW5nOiAgICAgICBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxuXHRcdFx0ZGVwdGhUZXN0OiAgICAgIGZhbHNlLFxuXHRcdFx0dHJhbnNwYXJlbnQ6ICAgIHRydWVcblxuXHRcdH0pO1xuXG5cdFx0dGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xuXG5cdFx0dGhpcy5wb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLmNvdW50ICogMyApO1xuXHRcdHRoaXMudmVsb2NpdHkgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLmNvdW50ICogMyApO1xuXHRcdHRoaXMuY29sb3JzID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5jb3VudCAqIDMgKTtcblx0XHR0aGlzLnNpemVzID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5jb3VudCApO1xuXHRcdHRoaXMudHJhbnNmb3JtSW5kaWNlcyA9IG5ldyBGbG9hdDMyQXJyYXkoIHRoaXMuY291bnQgKVxuXG5cdFx0dmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKDB4MDAwMDAwKTtcblx0XHR2YXIgaHVlO1xuXHRcdFxuXHRcdHZhciB0aGV0YSwgcGhpO1xuXHRcdFxuXHRcdHZhciB4O1xuXG5cdFx0Zm9yKCB2YXIgdiA9IDA7IHYgPCB0aGlzLmNvdW50OyB2KysgKSB7XG5cblx0XHRcdHRoaXMuc2l6ZXNbIHYgXSA9IHRoaXMucG9pbnRTaXplO1xuXHRcdFx0dGhpcy50cmFuc2Zvcm1JbmRpY2VzWyB2IF0gPSByYW5kb20ucmFuZ2VJbnQoIDAsIHRyYW5zZm9ybUNvdW50ICk7XG5cdFx0XHRcdFx0XHRcblx0XHRcdHRoZXRhID0gcmFuZG9tLnJhbmdlTG93KCAwLjEsIE1hdGguUEkgKTtcblx0XHRcdHBoaSA9IHJhbmRvbS5yYW5nZUxvdyggTWF0aC5QSSAqIDAuMywgTWF0aC5QSSApO1xuXHRcdFx0XG5cdFx0XHR0aGlzLnBvc2l0aW9uc1sgdiAqIDMgKyAwIF0gPSBNYXRoLnNpbiggdGhldGEgKSAqIE1hdGguY29zKCBwaGkgKSAqIHRoaXMucmFkaXVzICogdGhldGE7XG5cdFx0XHR0aGlzLnBvc2l0aW9uc1sgdiAqIDMgKyAxIF0gPSBNYXRoLnNpbiggdGhldGEgKSAqIE1hdGguc2luKCBwaGkgKSAqIHRoaXMucmFkaXVzO1xuXHRcdFx0dGhpcy5wb3NpdGlvbnNbIHYgKiAzICsgMiBdID0gTWF0aC5jb3MoIHRoZXRhICkgKiB0aGlzLnJhZGl1cyA7XG5cdFx0XHRcblx0XHRcdFxuXHRcdFx0aHVlID0gKHRoaXMucG9zaXRpb25zWyB2ICogMyArIDAgXSAvIHRoaXMucmFkaXVzICogMC4zICsgMC42NSkgJSAxO1xuXG5cdFx0XHRjb2xvci5zZXRIU0woIGh1ZSwgMS4wLCAwLjU1ICk7XG5cblx0XHRcdHRoaXMuY29sb3JzWyB2ICogMyArIDAgXSA9IGNvbG9yLnI7XG5cdFx0XHR0aGlzLmNvbG9yc1sgdiAqIDMgKyAxIF0gPSBjb2xvci5nO1xuXHRcdFx0dGhpcy5jb2xvcnNbIHYgKiAzICsgMiBdID0gY29sb3IuYjtcblxuXHRcdH1cblx0XHRcblx0XHRmb3IoIHZhciBpID0gMDsgaSA8IHRyYW5zZm9ybUNvdW50IDsgaSsrICkge1xuXHRcdFx0XG5cdFx0XHR0aGlzLnVuaWZvcm1zLnRyYW5zZm9ybU1hdHJpeC52YWx1ZVtpXSA9IG5ldyBUSFJFRS5NYXRyaXg0KCkubWFrZVRyYW5zbGF0aW9uKFxuXHRcdFx0XHRyYW5kb20ucmFuZ2UoIC10aGlzLnJhZGl1cywgdGhpcy5yYWRpdXMgKSAqIDAuNSxcblx0XHRcdFx0cmFuZG9tLnJhbmdlKCAtdGhpcy5yYWRpdXMsIHRoaXMucmFkaXVzICkgKiAwLjUsXG5cdFx0XHRcdHJhbmRvbS5yYW5nZSggLXRoaXMucmFkaXVzLCB0aGlzLnJhZGl1cyApICogMC41XG5cdFx0XHQpO1xuXHRcdFx0XG5cdFx0fVxuXG5cdFx0dGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoICdwb3NpdGlvbicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIHRoaXMucG9zaXRpb25zLCAzICkgKTtcblx0XHR0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSggJ2N1c3RvbUNvbG9yJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSggdGhpcy5jb2xvcnMsIDMgKSApO1xuXHRcdHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCAnc2l6ZScsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIHRoaXMuc2l6ZXMsIDEgKSApO1xuXHRcdHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCAndHJhbnNmb3JtSW5kZXgnLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKCB0aGlzLnRyYW5zZm9ybUluZGljZXMsIDEgKSApO1xuXG5cdFx0dGhpcy5vYmplY3QgPSBuZXcgVEhSRUUuUG9pbnRDbG91ZCggdGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCApO1xuXHRcdHRoaXMub2JqZWN0LnBvc2l0aW9uLnkgLT0gdGhpcy5yYWRpdXMgKiAwLjI7XG5cdFx0XG5cdFx0dGhpcy5wb2VtLnNjZW5lLmFkZCggdGhpcy5vYmplY3QgKTtcblx0XG5cdFxuXHRcdHRoaXMucG9lbS5vbiggJ3VwZGF0ZScsIHRoaXMudXBkYXRlLmJpbmQodGhpcykgKTtcblx0XHRcblx0fSxcblx0XG5cdGVycm9yIDogZnVuY3Rpb24oIGVycm9yICkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCBsb2FkIGFzc2V0cyBmb3IgdGhlIFVuaWZvcm1Qb3NpdGlvbmFsTWF0cmljZXNcIiwgZXJyb3IpO1xuXHR9LFxuXHRcblx0dXBkYXRlIDogZnVuY3Rpb24oZSkge1xuXG5cdFx0dGhpcy51bmlmb3Jtcy50aW1lLnZhbHVlID0gZS50aW1lO1xuXHRcdFxuXHR9XG5cdFxufTsiLCJ2YXIgTXJEb29iU3RhdHMgPSByZXF1aXJlKCcuLi8uLi92ZW5kb3IvU3RhdHMnKTtcblxudmFyIFN0YXRzID0gZnVuY3Rpb24oIHBvZW0gKSB7XG5cdFxuXHR0aGlzLnBvZW0gPSBwb2VtO1xuXHRcblx0dGhpcy5zdGF0cyA9IG5ldyBNckRvb2JTdGF0cygpO1xuXHR0aGlzLnN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuXHR0aGlzLnN0YXRzLmRvbUVsZW1lbnQuc3R5bGUudG9wID0gJzBweCc7XG5cdCQoIHRoaXMucG9lbS5kaXYgKS5hcHBlbmQoIHRoaXMuc3RhdHMuZG9tRWxlbWVudCApO1xuXHRcblx0dGhpcy5wb2VtLm9uKCAndXBkYXRlJywgdGhpcy5zdGF0cy51cGRhdGUuYmluZCggdGhpcy5zdGF0cyApICk7XG5cdFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdGF0czsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcblx0c3BoZXJlc0RlbW8gOiByZXF1aXJlKFwiLi9zcGhlcmVzRGVtb1wiKSxcblx0c2luZUdyYXZpdHlDbG91ZCA6IHJlcXVpcmUoXCIuL3NpbmVHcmF2aXR5Q2xvdWRcIiksXG5cdHVuaWZvcm1Qb3NpdGlvbmFsTWF0cmljZXMgOiByZXF1aXJlKFwiLi91bmlmb3JtUG9zaXRpb25hbE1hdHJpY2VzXCIpLFxuXHR0ZXh0dXJlUG9zaXRpb25hbE1hdHJpY2VzIDogcmVxdWlyZShcIi4vdGV4dHVyZVBvc2l0aW9uYWxNYXRyaWNlc1wiKVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcblx0Y29uZmlnIDoge1xuXHRcdGNhbWVyYSA6IHtcblx0XHRcdHggOiAtNDAwXG5cdFx0fVxuXHR9LFxuXHRvYmplY3RzIDoge1xuXHRcdGNvbnRyb2xzIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vY29tcG9uZW50cy9jYW1lcmFzL0NvbnRyb2xzXCIpLFxuXHRcdH0sXG5cdFx0cG9pbnRjbG91ZCA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2NvbXBvbmVudHMvZGVtb3MvU2luZUdyYXZpdHlDbG91ZFwiKSxcblx0XHR9LFxuXHRcdGdyaWQgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL2RlbW9zL0dyaWRcIiksXG5cdFx0fSxcblx0XHQvLyBzdGF0cyA6IHtcblx0XHQvLyBcdG9iamVjdDogcmVxdWlyZShcIi4uL2NvbXBvbmVudHMvdXRpbHMvU3RhdHNcIilcblx0XHQvLyB9XG5cdH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cdGNvbmZpZyA6IHtcblx0XHRjYW1lcmEgOiB7XG5cdFx0XHR4IDogLTQwMFxuXHRcdH1cblx0fSxcblx0b2JqZWN0cyA6IHtcblx0XHRzcGhlcmUgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL2RlbW9zL1NwaGVyZXNcIiksXG5cdFx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRcdGNvdW50IDogNTAsXG5cdFx0XHRcdGRpc3BlcnNpb24gOiAxMjAsXG5cdFx0XHRcdHJhZGl1cyA6IDEwXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRjb250cm9scyA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2NvbXBvbmVudHMvY2FtZXJhcy9Db250cm9sc1wiKSxcblx0XHR9LFxuXHRcdGdyaWQgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL2RlbW9zL0dyaWRcIiksXG5cdFx0fSxcblx0XHRzdGF0cyA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2NvbXBvbmVudHMvdXRpbHMvU3RhdHNcIilcblx0XHR9XG5cdH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cdGNvbmZpZyA6IHtcblx0XHRjYW1lcmEgOiB7XG5cdFx0XHR4IDogLTQwMFxuXHRcdH1cblx0fSxcblx0b2JqZWN0cyA6IHtcblx0XHRjb250cm9scyA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2NvbXBvbmVudHMvY2FtZXJhcy9Db250cm9sc1wiKSxcblx0XHR9LFxuXHRcdHRleHR1cmVQb3NpdGlvbmFsTWF0cmljZXMgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL2RlbW9zL3RleHR1cmVQb3NpdGlvbmFsTWF0cmljZXNcIiksXG5cdFx0fSxcblx0XHRncmlkIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vY29tcG9uZW50cy9kZW1vcy9HcmlkXCIpLFxuXHRcdH0sXG5cdFx0c3RhdHMgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL3V0aWxzL1N0YXRzXCIpXG5cdFx0fVxuXHR9XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRjb25maWcgOiB7XG5cdFx0Y2FtZXJhIDoge1xuXHRcdFx0eCA6IC00MDBcblx0XHR9XG5cdH0sXG5cdG9iamVjdHMgOiB7XG5cdFx0Y29udHJvbHMgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL2NhbWVyYXMvQ29udHJvbHNcIiksXG5cdFx0fSxcblx0XHR1bmlmb3JtUG9zaXRpb25hbE1hdHJpY2VzIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vY29tcG9uZW50cy9kZW1vcy91bmlmb3JtUG9zaXRpb25hbE1hdHJpY2VzXCIpLFxuXHRcdH0sXG5cdFx0Z3JpZCA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2NvbXBvbmVudHMvZGVtb3MvR3JpZFwiKSxcblx0XHR9LFxuXHRcdHN0YXRzIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vY29tcG9uZW50cy91dGlscy9TdGF0c1wiKVxuXHRcdH1cblx0fVxufTsiLCJ2YXIgQ2xvY2sgPSBmdW5jdGlvbiggYXV0b3N0YXJ0ICkge1xuXG5cdHRoaXMubWF4RHQgPSA2MDtcblx0dGhpcy5taW5EdCA9IDE2O1xuXHR0aGlzLnBUaW1lID0gMDtcblx0dGhpcy50aW1lID0gMDtcblx0XG5cdGlmKGF1dG9zdGFydCAhPT0gZmFsc2UpIHtcblx0XHR0aGlzLnN0YXJ0KCk7XG5cdH1cblx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENsb2NrO1xuXG5DbG9jay5wcm90b3R5cGUgPSB7XG5cblx0c3RhcnQgOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnBUaW1lID0gRGF0ZS5ub3coKTtcblx0fSxcblx0XG5cdGdldERlbHRhIDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG5vdywgZHQ7XG5cdFx0XG5cdFx0bm93ID0gRGF0ZS5ub3coKTtcblx0XHRkdCA9IG5vdyAtIHRoaXMucFRpbWU7XG5cdFx0XG5cdFx0ZHQgPSBNYXRoLm1pbiggZHQsIHRoaXMubWF4RHQgKTtcblx0XHRkdCA9IE1hdGgubWF4KCBkdCwgdGhpcy5taW5EdCApO1xuXHRcdFxuXHRcdHRoaXMudGltZSArPSBkdDtcblx0XHR0aGlzLnBUaW1lID0gbm93O1xuXHRcdFxuXHRcdHJldHVybiBkdDtcblx0fVxuXHRcbn07IiwiLyoqXG4gKiBAYXV0aG9yIG1yZG9vYiAvIGh0dHA6Ly9tcmRvb2IuY29tL1xuICpcbiAqIE1vZGlmaWNhdGlvbnM6IEdyZWcgVGF0dW1cbiAqXG4gKiB1c2FnZTpcbiAqIFxuICogXHRcdEV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUuYXBwbHkoIE15T2JqZWN0LnByb3RvdHlwZSApO1xuICogXG4gKiBcdFx0TXlPYmplY3QuZGlzcGF0Y2goe1xuICogXHRcdFx0dHlwZTogXCJjbGlja1wiLFxuICogXHRcdFx0ZGF0dW0xOiBcImZvb1wiLFxuICogXHRcdFx0ZGF0dW0yOiBcImJhclwiXG4gKiBcdFx0fSk7XG4gKiBcbiAqIFx0XHRNeU9iamVjdC5vbiggXCJjbGlja1wiLCBmdW5jdGlvbiggZXZlbnQgKSB7XG4gKiBcdFx0XHRldmVudC5kYXR1bTE7IC8vRm9vXG4gKiBcdFx0XHRldmVudC50YXJnZXQ7IC8vTXlPYmplY3RcbiAqIFx0XHR9KTtcbiAqIFxuICpcbiAqL1xuXG52YXIgRXZlbnREaXNwYXRjaGVyID0gZnVuY3Rpb24gKCkge307XG5cbkV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUgPSB7XG5cblx0Y29uc3RydWN0b3I6IEV2ZW50RGlzcGF0Y2hlcixcblxuXHRhcHBseTogZnVuY3Rpb24gKCBvYmplY3QgKSB7XG5cblx0XHRvYmplY3Qub25cdFx0XHRcdFx0PSBFdmVudERpc3BhdGNoZXIucHJvdG90eXBlLm9uO1xuXHRcdG9iamVjdC5oYXNFdmVudExpc3RlbmVyXHRcdD0gRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5oYXNFdmVudExpc3RlbmVyO1xuXHRcdG9iamVjdC5vZmZcdFx0XHRcdFx0PSBFdmVudERpc3BhdGNoZXIucHJvdG90eXBlLm9mZjtcblx0XHRvYmplY3QuZGlzcGF0Y2hcdFx0XHRcdD0gRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5kaXNwYXRjaDtcblxuXHR9LFxuXG5cdG9uOiBmdW5jdGlvbiAoIHR5cGUsIGxpc3RlbmVyICkge1xuXG5cdFx0aWYgKCB0aGlzLl9saXN0ZW5lcnMgPT09IHVuZGVmaW5lZCApIHRoaXMuX2xpc3RlbmVycyA9IHt9O1xuXG5cdFx0dmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcblxuXHRcdGlmICggbGlzdGVuZXJzWyB0eXBlIF0gPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0bGlzdGVuZXJzWyB0eXBlIF0gPSBbXTtcblxuXHRcdH1cblxuXHRcdGlmICggbGlzdGVuZXJzWyB0eXBlIF0uaW5kZXhPZiggbGlzdGVuZXIgKSA9PT0gLSAxICkge1xuXG5cdFx0XHRsaXN0ZW5lcnNbIHR5cGUgXS5wdXNoKCBsaXN0ZW5lciApO1xuXG5cdFx0fVxuXG5cdH0sXG5cblx0aGFzRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24gKCB0eXBlLCBsaXN0ZW5lciApIHtcblxuXHRcdGlmICggdGhpcy5fbGlzdGVuZXJzID09PSB1bmRlZmluZWQgKSByZXR1cm4gZmFsc2U7XG5cblx0XHR2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuXG5cdFx0aWYgKCBsaXN0ZW5lcnNbIHR5cGUgXSAhPT0gdW5kZWZpbmVkICYmIGxpc3RlbmVyc1sgdHlwZSBdLmluZGV4T2YoIGxpc3RlbmVyICkgIT09IC0gMSApIHtcblxuXHRcdFx0cmV0dXJuIHRydWU7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cblx0fSxcblxuXHRvZmY6IGZ1bmN0aW9uICggdHlwZSwgbGlzdGVuZXIgKSB7XG5cblx0XHRpZiAoIHRoaXMuX2xpc3RlbmVycyA9PT0gdW5kZWZpbmVkICkgcmV0dXJuO1xuXG5cdFx0dmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcblx0XHR2YXIgbGlzdGVuZXJBcnJheSA9IGxpc3RlbmVyc1sgdHlwZSBdO1xuXG5cdFx0aWYgKCBsaXN0ZW5lckFycmF5ICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdHZhciBpbmRleCA9IGxpc3RlbmVyQXJyYXkuaW5kZXhPZiggbGlzdGVuZXIgKTtcblxuXHRcdFx0aWYgKCBpbmRleCAhPT0gLSAxICkge1xuXG5cdFx0XHRcdGxpc3RlbmVyQXJyYXkuc3BsaWNlKCBpbmRleCwgMSApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fSxcblxuXHRkaXNwYXRjaDogZnVuY3Rpb24gKCBldmVudCApIHtcblx0XHRcdFxuXHRcdGlmICggdGhpcy5fbGlzdGVuZXJzID09PSB1bmRlZmluZWQgKSByZXR1cm47XG5cblx0XHR2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuXHRcdHZhciBsaXN0ZW5lckFycmF5ID0gbGlzdGVuZXJzWyBldmVudC50eXBlIF07XG5cblx0XHRpZiAoIGxpc3RlbmVyQXJyYXkgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0ZXZlbnQudGFyZ2V0ID0gdGhpcztcblxuXHRcdFx0dmFyIGFycmF5ID0gW107XG5cdFx0XHR2YXIgbGVuZ3RoID0gbGlzdGVuZXJBcnJheS5sZW5ndGg7XG5cdFx0XHR2YXIgaTtcblxuXHRcdFx0Zm9yICggaSA9IDA7IGkgPCBsZW5ndGg7IGkgKysgKSB7XG5cblx0XHRcdFx0YXJyYXlbIGkgXSA9IGxpc3RlbmVyQXJyYXlbIGkgXTtcblxuXHRcdFx0fVxuXG5cdFx0XHRmb3IgKCBpID0gMDsgaSA8IGxlbmd0aDsgaSArKyApIHtcblxuXHRcdFx0XHRhcnJheVsgaSBdLmNhbGwoIHRoaXMsIGV2ZW50ICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHR9XG5cbn07XG5cbmlmICggdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgKSB7XG5cblx0bW9kdWxlLmV4cG9ydHMgPSBFdmVudERpc3BhdGNoZXI7XG5cbn0iLCJ2YXIgUlNWUCA9IHJlcXVpcmUoJ3JzdnAnKTtcblxudmFyIGxvYWRUZXh0ID0gZnVuY3Rpb24oIHVybCwgb2JqZWN0LCBrZXkgKSB7XG5cdFxuXHR2YXIgcHJvbWlzZSA9IG5ldyBSU1ZQLlByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcblx0XHRcblx0XHRjb25zb2xlLmxvZygnbG9hZGluZyB0ZXh0JywgdXJsKTtcblx0XHRcblx0XHQkLmFqYXgodXJsLCB7XG5cdFx0XHRkYXRhVHlwZTogXCJ0ZXh0XCJcblx0XHR9KS50aGVuKFxuXHRcdFx0ZnVuY3Rpb24oIGRhdGEgKSB7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiggXy5pc09iamVjdCggb2JqZWN0ICkgKSB7XG5cdFx0XHRcdFx0b2JqZWN0W2tleV0gPSBkYXRhO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRyZXNvbHZlKCBkYXRhICk7XG5cdFx0XHR9LFxuXHRcdFx0ZnVuY3Rpb24oIGVycm9yICkge1xuXHRcdFx0XHRyZWplY3QoIGVycm9yICk7XG5cdFx0XHR9XG5cdFx0KTtcblx0XHRcblx0fSk7XG5cblx0cmV0dXJuIHByb21pc2U7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxvYWRUZXh0OyIsInZhciBSU1ZQID0gcmVxdWlyZSgncnN2cCcpO1xuXG52YXIgbG9hZFRleHR1cmUgPSBmdW5jdGlvbiggdXJsLCBvYmplY3QsIGtleSApIHtcblx0XG5cdHJldHVybiBuZXcgUlNWUC5Qcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdFxuXHRcdFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoIHVybCwgdW5kZWZpbmVkLCBmdW5jdGlvbiggdGV4dHVyZSApIHtcblx0XHRcdFxuXHRcdFx0aWYoIF8uaXNPYmplY3QoIG9iamVjdCApICkge1xuXHRcdFx0XHRvYmplY3Rba2V5XSA9IHRleHR1cmU7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHJlc29sdmUoIHRleHR1cmUgKTtcblx0XHRcdFxuXHRcdH0sIHJlamVjdCApO1xuXHRcdFxuXHR9KTtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBsb2FkVGV4dHVyZTsiLCJ2YXIgcmFuZG9tID0ge1xuXHRcblx0ZmxpcCA6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBNYXRoLnJhbmRvbSgpID4gMC41ID8gdHJ1ZTogZmFsc2U7XG5cdH0sXG5cdFxuXHRyYW5nZSA6IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG5cdFx0cmV0dXJuIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbjtcblx0fSxcblx0XG5cdHJhbmdlSW50IDogZnVuY3Rpb24obWluLCBtYXgpIHtcblx0XHRyZXR1cm4gTWF0aC5mbG9vciggdGhpcy5yYW5nZShtaW4sIG1heCArIDEpICk7XG5cdH0sXG5cdFxuXHRyYW5nZUxvdyA6IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG5cdFx0Ly9Nb3JlIGxpa2VseSB0byByZXR1cm4gYSBsb3cgdmFsdWVcblx0ICByZXR1cm4gTWF0aC5yYW5kb20oKSAqIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbjtcblx0fSxcblx0XG5cdHJhbmdlSGlnaCA6IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG5cdFx0Ly9Nb3JlIGxpa2VseSB0byByZXR1cm4gYSBoaWdoIHZhbHVlXG5cdFx0cmV0dXJuICgxIC0gTWF0aC5yYW5kb20oKSAqIE1hdGgucmFuZG9tKCkpICogKG1heCAtIG1pbikgKyBtaW47XG5cdH1cblx0IFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSByYW5kb207XG4iLCIvKipcbiAqIEBhdXRob3IgcWlhbyAvIGh0dHBzOi8vZ2l0aHViLmNvbS9xaWFvXG4gKiBAYXV0aG9yIG1yZG9vYiAvIGh0dHA6Ly9tcmRvb2IuY29tXG4gKiBAYXV0aG9yIGFsdGVyZWRxIC8gaHR0cDovL2FsdGVyZWRxdWFsaWEuY29tL1xuICogQGF1dGhvciBXZXN0TGFuZ2xleSAvIGh0dHA6Ly9naXRodWIuY29tL1dlc3RMYW5nbGV5XG4gKiBAYXV0aG9yIGVyaWNoNjY2IC8gaHR0cDovL2VyaWNoYWluZXMuY29tXG4gKi9cbi8qZ2xvYmFsIFRIUkVFLCBjb25zb2xlICovXG5cbi8vIFRoaXMgc2V0IG9mIGNvbnRyb2xzIHBlcmZvcm1zIG9yYml0aW5nLCBkb2xseWluZyAoem9vbWluZyksIGFuZCBwYW5uaW5nLiBJdCBtYWludGFpbnNcbi8vIHRoZSBcInVwXCIgZGlyZWN0aW9uIGFzICtZLCB1bmxpa2UgdGhlIFRyYWNrYmFsbENvbnRyb2xzLiBUb3VjaCBvbiB0YWJsZXQgYW5kIHBob25lcyBpc1xuLy8gc3VwcG9ydGVkLlxuLy9cbi8vICAgIE9yYml0IC0gbGVmdCBtb3VzZSAvIHRvdWNoOiBvbmUgZmluZ2VyIG1vdmVcbi8vICAgIFpvb20gLSBtaWRkbGUgbW91c2UsIG9yIG1vdXNld2hlZWwgLyB0b3VjaDogdHdvIGZpbmdlciBzcHJlYWQgb3Igc3F1aXNoXG4vLyAgICBQYW4gLSByaWdodCBtb3VzZSwgb3IgYXJyb3cga2V5cyAvIHRvdWNoOiB0aHJlZSBmaW50ZXIgc3dpcGVcbi8vXG4vLyBUaGlzIGlzIGEgZHJvcC1pbiByZXBsYWNlbWVudCBmb3IgKG1vc3QpIFRyYWNrYmFsbENvbnRyb2xzIHVzZWQgaW4gZXhhbXBsZXMuXG4vLyBUaGF0IGlzLCBpbmNsdWRlIHRoaXMganMgZmlsZSBhbmQgd2hlcmV2ZXIgeW91IHNlZTpcbi8vICAgIFx0Y29udHJvbHMgPSBuZXcgVEhSRUUuVHJhY2tiYWxsQ29udHJvbHMoIGNhbWVyYSApO1xuLy8gICAgICBjb250cm9scy50YXJnZXQueiA9IDE1MDtcbi8vIFNpbXBsZSBzdWJzdGl0dXRlIFwiT3JiaXRDb250cm9sc1wiIGFuZCB0aGUgY29udHJvbCBzaG91bGQgd29yayBhcy1pcy5cblxudmFyIE9yYml0Q29udHJvbHMgPSBmdW5jdGlvbiAoIG9iamVjdCwgZG9tRWxlbWVudCApIHtcblxuXHR0aGlzLm9iamVjdCA9IG9iamVjdDtcblx0dGhpcy5kb21FbGVtZW50ID0gKCBkb21FbGVtZW50ICE9PSB1bmRlZmluZWQgKSA/IGRvbUVsZW1lbnQgOiBkb2N1bWVudDtcblxuXHQvLyBBUElcblxuXHQvLyBTZXQgdG8gZmFsc2UgdG8gZGlzYWJsZSB0aGlzIGNvbnRyb2xcblx0dGhpcy5lbmFibGVkID0gdHJ1ZTtcblxuXHQvLyBcInRhcmdldFwiIHNldHMgdGhlIGxvY2F0aW9uIG9mIGZvY3VzLCB3aGVyZSB0aGUgY29udHJvbCBvcmJpdHMgYXJvdW5kXG5cdC8vIGFuZCB3aGVyZSBpdCBwYW5zIHdpdGggcmVzcGVjdCB0by5cblx0dGhpcy50YXJnZXQgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXHQvLyBjZW50ZXIgaXMgb2xkLCBkZXByZWNhdGVkOyB1c2UgXCJ0YXJnZXRcIiBpbnN0ZWFkXG5cdHRoaXMuY2VudGVyID0gdGhpcy50YXJnZXQ7XG5cblx0Ly8gVGhpcyBvcHRpb24gYWN0dWFsbHkgZW5hYmxlcyBkb2xseWluZyBpbiBhbmQgb3V0OyBsZWZ0IGFzIFwiem9vbVwiIGZvclxuXHQvLyBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuXHR0aGlzLm5vWm9vbSA9IGZhbHNlO1xuXHR0aGlzLnpvb21TcGVlZCA9IDEuMDtcblx0Ly8gTGltaXRzIHRvIGhvdyBmYXIgeW91IGNhbiBkb2xseSBpbiBhbmQgb3V0XG5cdHRoaXMubWluRGlzdGFuY2UgPSAwO1xuXHR0aGlzLm1heERpc3RhbmNlID0gSW5maW5pdHk7XG5cblx0Ly8gU2V0IHRvIHRydWUgdG8gZGlzYWJsZSB0aGlzIGNvbnRyb2xcblx0dGhpcy5ub1JvdGF0ZSA9IGZhbHNlO1xuXHR0aGlzLnJvdGF0ZVNwZWVkID0gMS4wO1xuXG5cdC8vIFNldCB0byB0cnVlIHRvIGRpc2FibGUgdGhpcyBjb250cm9sXG5cdHRoaXMubm9QYW4gPSBmYWxzZTtcblx0dGhpcy5rZXlQYW5TcGVlZCA9IDcuMDtcdC8vIHBpeGVscyBtb3ZlZCBwZXIgYXJyb3cga2V5IHB1c2hcblxuXHQvLyBTZXQgdG8gdHJ1ZSB0byBhdXRvbWF0aWNhbGx5IHJvdGF0ZSBhcm91bmQgdGhlIHRhcmdldFxuXHR0aGlzLmF1dG9Sb3RhdGUgPSBmYWxzZTtcblx0dGhpcy5hdXRvUm90YXRlU3BlZWQgPSAyLjA7IC8vIDMwIHNlY29uZHMgcGVyIHJvdW5kIHdoZW4gZnBzIGlzIDYwXG5cblx0Ly8gSG93IGZhciB5b3UgY2FuIG9yYml0IHZlcnRpY2FsbHksIHVwcGVyIGFuZCBsb3dlciBsaW1pdHMuXG5cdC8vIFJhbmdlIGlzIDAgdG8gTWF0aC5QSSByYWRpYW5zLlxuXHR0aGlzLm1pblBvbGFyQW5nbGUgPSAwOyAvLyByYWRpYW5zXG5cdHRoaXMubWF4UG9sYXJBbmdsZSA9IE1hdGguUEk7IC8vIHJhZGlhbnNcblxuXHQvLyBTZXQgdG8gdHJ1ZSB0byBkaXNhYmxlIHVzZSBvZiB0aGUga2V5c1xuXHR0aGlzLm5vS2V5cyA9IGZhbHNlO1xuXHQvLyBUaGUgZm91ciBhcnJvdyBrZXlzXG5cdHRoaXMua2V5cyA9IHsgTEVGVDogMzcsIFVQOiAzOCwgUklHSFQ6IDM5LCBCT1RUT006IDQwIH07XG5cblx0Ly8vLy8vLy8vLy8vXG5cdC8vIGludGVybmFsc1xuXG5cdHZhciBzY29wZSA9IHRoaXM7XG5cblx0dmFyIEVQUyA9IDAuMDAwMDAxO1xuXG5cdHZhciByb3RhdGVTdGFydCA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cdHZhciByb3RhdGVFbmQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXHR2YXIgcm90YXRlRGVsdGEgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXG5cdHZhciBwYW5TdGFydCA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cdHZhciBwYW5FbmQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXHR2YXIgcGFuRGVsdGEgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXG5cdHZhciBkb2xseVN0YXJ0ID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblx0dmFyIGRvbGx5RW5kID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblx0dmFyIGRvbGx5RGVsdGEgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXG5cdHZhciBwaGlEZWx0YSA9IDA7XG5cdHZhciB0aGV0YURlbHRhID0gMDtcblx0dmFyIHNjYWxlID0gMTtcblx0dmFyIHBhbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cblx0dmFyIGxhc3RQb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cblx0dmFyIFNUQVRFID0geyBOT05FIDogLTEsIFJPVEFURSA6IDAsIERPTExZIDogMSwgUEFOIDogMiwgVE9VQ0hfUk9UQVRFIDogMywgVE9VQ0hfRE9MTFkgOiA0LCBUT1VDSF9QQU4gOiA1IH07XG5cdHZhciBzdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0Ly8gZXZlbnRzXG5cblx0dmFyIGNoYW5nZUV2ZW50ID0geyB0eXBlOiAnY2hhbmdlJyB9O1xuXG5cblx0dGhpcy5yb3RhdGVMZWZ0ID0gZnVuY3Rpb24gKCBhbmdsZSApIHtcblxuXHRcdGlmICggYW5nbGUgPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0YW5nbGUgPSBnZXRBdXRvUm90YXRpb25BbmdsZSgpO1xuXG5cdFx0fVxuXG5cdFx0dGhldGFEZWx0YSAtPSBhbmdsZTtcblxuXHR9O1xuXG5cdHRoaXMucm90YXRlVXAgPSBmdW5jdGlvbiAoIGFuZ2xlICkge1xuXG5cdFx0aWYgKCBhbmdsZSA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRhbmdsZSA9IGdldEF1dG9Sb3RhdGlvbkFuZ2xlKCk7XG5cblx0XHR9XG5cblx0XHRwaGlEZWx0YSAtPSBhbmdsZTtcblxuXHR9O1xuXG5cdC8vIHBhc3MgaW4gZGlzdGFuY2UgaW4gd29ybGQgc3BhY2UgdG8gbW92ZSBsZWZ0XG5cdHRoaXMucGFuTGVmdCA9IGZ1bmN0aW9uICggZGlzdGFuY2UgKSB7XG5cblx0XHR2YXIgcGFuT2Zmc2V0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblx0XHR2YXIgdGUgPSB0aGlzLm9iamVjdC5tYXRyaXguZWxlbWVudHM7XG5cdFx0Ly8gZ2V0IFggY29sdW1uIG9mIG1hdHJpeFxuXHRcdHBhbk9mZnNldC5zZXQoIHRlWzBdLCB0ZVsxXSwgdGVbMl0gKTtcblx0XHRwYW5PZmZzZXQubXVsdGlwbHlTY2FsYXIoLWRpc3RhbmNlKTtcblx0XHRcblx0XHRwYW4uYWRkKCBwYW5PZmZzZXQgKTtcblxuXHR9O1xuXG5cdC8vIHBhc3MgaW4gZGlzdGFuY2UgaW4gd29ybGQgc3BhY2UgdG8gbW92ZSB1cFxuXHR0aGlzLnBhblVwID0gZnVuY3Rpb24gKCBkaXN0YW5jZSApIHtcblxuXHRcdHZhciBwYW5PZmZzZXQgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXHRcdHZhciB0ZSA9IHRoaXMub2JqZWN0Lm1hdHJpeC5lbGVtZW50cztcblx0XHQvLyBnZXQgWSBjb2x1bW4gb2YgbWF0cml4XG5cdFx0cGFuT2Zmc2V0LnNldCggdGVbNF0sIHRlWzVdLCB0ZVs2XSApO1xuXHRcdHBhbk9mZnNldC5tdWx0aXBseVNjYWxhcihkaXN0YW5jZSk7XG5cdFx0XG5cdFx0cGFuLmFkZCggcGFuT2Zmc2V0ICk7XG5cdH07XG5cdFxuXHQvLyBtYWluIGVudHJ5IHBvaW50OyBwYXNzIGluIFZlY3RvcjIgb2YgY2hhbmdlIGRlc2lyZWQgaW4gcGl4ZWwgc3BhY2UsXG5cdC8vIHJpZ2h0IGFuZCBkb3duIGFyZSBwb3NpdGl2ZVxuXHR0aGlzLnBhbiA9IGZ1bmN0aW9uICggZGVsdGEgKSB7XG5cblx0XHR2YXIgZWxlbWVudCA9IHNjb3BlLmRvbUVsZW1lbnQgPT09IGRvY3VtZW50ID8gc2NvcGUuZG9tRWxlbWVudC5ib2R5IDogc2NvcGUuZG9tRWxlbWVudDtcblxuXHRcdGlmICggc2NvcGUub2JqZWN0LmZvdiAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHQvLyBwZXJzcGVjdGl2ZVxuXHRcdFx0dmFyIHBvc2l0aW9uID0gc2NvcGUub2JqZWN0LnBvc2l0aW9uO1xuXHRcdFx0dmFyIG9mZnNldCA9IHBvc2l0aW9uLmNsb25lKCkuc3ViKCBzY29wZS50YXJnZXQgKTtcblx0XHRcdHZhciB0YXJnZXREaXN0YW5jZSA9IG9mZnNldC5sZW5ndGgoKTtcblxuXHRcdFx0Ly8gaGFsZiBvZiB0aGUgZm92IGlzIGNlbnRlciB0byB0b3Agb2Ygc2NyZWVuXG5cdFx0XHR0YXJnZXREaXN0YW5jZSAqPSBNYXRoLnRhbiggKHNjb3BlLm9iamVjdC5mb3YvMikgKiBNYXRoLlBJIC8gMTgwLjAgKTtcblx0XHRcdC8vIHdlIGFjdHVhbGx5IGRvbid0IHVzZSBzY3JlZW5XaWR0aCwgc2luY2UgcGVyc3BlY3RpdmUgY2FtZXJhIGlzIGZpeGVkIHRvIHNjcmVlbiBoZWlnaHRcblx0XHRcdHNjb3BlLnBhbkxlZnQoIDIgKiBkZWx0YS54ICogdGFyZ2V0RGlzdGFuY2UgLyBlbGVtZW50LmNsaWVudEhlaWdodCApO1xuXHRcdFx0c2NvcGUucGFuVXAoIDIgKiBkZWx0YS55ICogdGFyZ2V0RGlzdGFuY2UgLyBlbGVtZW50LmNsaWVudEhlaWdodCApO1xuXG5cdFx0fSBlbHNlIGlmICggc2NvcGUub2JqZWN0LnRvcCAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHQvLyBvcnRob2dyYXBoaWNcblx0XHRcdHNjb3BlLnBhbkxlZnQoIGRlbHRhLnggKiAoc2NvcGUub2JqZWN0LnJpZ2h0IC0gc2NvcGUub2JqZWN0LmxlZnQpIC8gZWxlbWVudC5jbGllbnRXaWR0aCApO1xuXHRcdFx0c2NvcGUucGFuVXAoIGRlbHRhLnkgKiAoc2NvcGUub2JqZWN0LnRvcCAtIHNjb3BlLm9iamVjdC5ib3R0b20pIC8gZWxlbWVudC5jbGllbnRIZWlnaHQgKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdC8vIGNhbWVyYSBuZWl0aGVyIG9ydGhvZ3JhcGhpYyBvciBwZXJzcGVjdGl2ZSAtIHdhcm4gdXNlclxuXHRcdFx0Y29uc29sZS53YXJuKCAnV0FSTklORzogT3JiaXRDb250cm9scy5qcyBlbmNvdW50ZXJlZCBhbiB1bmtub3duIGNhbWVyYSB0eXBlIC0gcGFuIGRpc2FibGVkLicgKTtcblxuXHRcdH1cblxuXHR9O1xuXG5cdHRoaXMuZG9sbHlJbiA9IGZ1bmN0aW9uICggZG9sbHlTY2FsZSApIHtcblxuXHRcdGlmICggZG9sbHlTY2FsZSA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRkb2xseVNjYWxlID0gZ2V0Wm9vbVNjYWxlKCk7XG5cblx0XHR9XG5cblx0XHRzY2FsZSAvPSBkb2xseVNjYWxlO1xuXG5cdH07XG5cblx0dGhpcy5kb2xseU91dCA9IGZ1bmN0aW9uICggZG9sbHlTY2FsZSApIHtcblxuXHRcdGlmICggZG9sbHlTY2FsZSA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRkb2xseVNjYWxlID0gZ2V0Wm9vbVNjYWxlKCk7XG5cblx0XHR9XG5cblx0XHRzY2FsZSAqPSBkb2xseVNjYWxlO1xuXG5cdH07XG5cblx0dGhpcy51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHR2YXIgcG9zaXRpb24gPSB0aGlzLm9iamVjdC5wb3NpdGlvbjtcblx0XHR2YXIgb2Zmc2V0ID0gcG9zaXRpb24uY2xvbmUoKS5zdWIoIHRoaXMudGFyZ2V0ICk7XG5cblx0XHQvLyBhbmdsZSBmcm9tIHotYXhpcyBhcm91bmQgeS1heGlzXG5cblx0XHR2YXIgdGhldGEgPSBNYXRoLmF0YW4yKCBvZmZzZXQueCwgb2Zmc2V0LnogKTtcblxuXHRcdC8vIGFuZ2xlIGZyb20geS1heGlzXG5cblx0XHR2YXIgcGhpID0gTWF0aC5hdGFuMiggTWF0aC5zcXJ0KCBvZmZzZXQueCAqIG9mZnNldC54ICsgb2Zmc2V0LnogKiBvZmZzZXQueiApLCBvZmZzZXQueSApO1xuXG5cdFx0aWYgKCB0aGlzLmF1dG9Sb3RhdGUgKSB7XG5cblx0XHRcdHRoaXMucm90YXRlTGVmdCggZ2V0QXV0b1JvdGF0aW9uQW5nbGUoKSApO1xuXG5cdFx0fVxuXG5cdFx0dGhldGEgKz0gdGhldGFEZWx0YTtcblx0XHRwaGkgKz0gcGhpRGVsdGE7XG5cblx0XHQvLyByZXN0cmljdCBwaGkgdG8gYmUgYmV0d2VlbiBkZXNpcmVkIGxpbWl0c1xuXHRcdHBoaSA9IE1hdGgubWF4KCB0aGlzLm1pblBvbGFyQW5nbGUsIE1hdGgubWluKCB0aGlzLm1heFBvbGFyQW5nbGUsIHBoaSApICk7XG5cblx0XHQvLyByZXN0cmljdCBwaGkgdG8gYmUgYmV0d2VlIEVQUyBhbmQgUEktRVBTXG5cdFx0cGhpID0gTWF0aC5tYXgoIEVQUywgTWF0aC5taW4oIE1hdGguUEkgLSBFUFMsIHBoaSApICk7XG5cblx0XHR2YXIgcmFkaXVzID0gb2Zmc2V0Lmxlbmd0aCgpICogc2NhbGU7XG5cblx0XHQvLyByZXN0cmljdCByYWRpdXMgdG8gYmUgYmV0d2VlbiBkZXNpcmVkIGxpbWl0c1xuXHRcdHJhZGl1cyA9IE1hdGgubWF4KCB0aGlzLm1pbkRpc3RhbmNlLCBNYXRoLm1pbiggdGhpcy5tYXhEaXN0YW5jZSwgcmFkaXVzICkgKTtcblx0XHRcblx0XHQvLyBtb3ZlIHRhcmdldCB0byBwYW5uZWQgbG9jYXRpb25cblx0XHR0aGlzLnRhcmdldC5hZGQoIHBhbiApO1xuXG5cdFx0b2Zmc2V0LnggPSByYWRpdXMgKiBNYXRoLnNpbiggcGhpICkgKiBNYXRoLnNpbiggdGhldGEgKTtcblx0XHRvZmZzZXQueSA9IHJhZGl1cyAqIE1hdGguY29zKCBwaGkgKTtcblx0XHRvZmZzZXQueiA9IHJhZGl1cyAqIE1hdGguc2luKCBwaGkgKSAqIE1hdGguY29zKCB0aGV0YSApO1xuXG5cdFx0cG9zaXRpb24uY29weSggdGhpcy50YXJnZXQgKS5hZGQoIG9mZnNldCApO1xuXG5cdFx0dGhpcy5vYmplY3QubG9va0F0KCB0aGlzLnRhcmdldCApO1xuXG5cdFx0dGhldGFEZWx0YSA9IDA7XG5cdFx0cGhpRGVsdGEgPSAwO1xuXHRcdHNjYWxlID0gMTtcblx0XHRwYW4uc2V0KDAsMCwwKTtcblxuXHRcdGlmICggbGFzdFBvc2l0aW9uLmRpc3RhbmNlVG8oIHRoaXMub2JqZWN0LnBvc2l0aW9uICkgPiAwICkge1xuXG5cdFx0XHR0aGlzLmRpc3BhdGNoRXZlbnQoIGNoYW5nZUV2ZW50ICk7XG5cblx0XHRcdGxhc3RQb3NpdGlvbi5jb3B5KCB0aGlzLm9iamVjdC5wb3NpdGlvbiApO1xuXG5cdFx0fVxuXG5cdH07XG5cblxuXHRmdW5jdGlvbiBnZXRBdXRvUm90YXRpb25BbmdsZSgpIHtcblxuXHRcdHJldHVybiAyICogTWF0aC5QSSAvIDYwIC8gNjAgKiBzY29wZS5hdXRvUm90YXRlU3BlZWQ7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIGdldFpvb21TY2FsZSgpIHtcblxuXHRcdHJldHVybiBNYXRoLnBvdyggMC45NSwgc2NvcGUuem9vbVNwZWVkICk7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIG9uTW91c2VEb3duKCBldmVudCApIHtcblxuXHRcdGlmICggc2NvcGUuZW5hYmxlZCA9PT0gZmFsc2UgKSB7IHJldHVybjsgfVxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRpZiAoIGV2ZW50LmJ1dHRvbiA9PT0gMCApIHtcblx0XHRcdGlmICggc2NvcGUubm9Sb3RhdGUgPT09IHRydWUgKSB7IHJldHVybjsgfVxuXG5cdFx0XHRzdGF0ZSA9IFNUQVRFLlJPVEFURTtcblxuXHRcdFx0cm90YXRlU3RhcnQuc2V0KCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZICk7XG5cblx0XHR9IGVsc2UgaWYgKCBldmVudC5idXR0b24gPT09IDEgKSB7XG5cdFx0XHRpZiAoIHNjb3BlLm5vWm9vbSA9PT0gdHJ1ZSApIHsgcmV0dXJuOyB9XG5cblx0XHRcdHN0YXRlID0gU1RBVEUuRE9MTFk7XG5cblx0XHRcdGRvbGx5U3RhcnQuc2V0KCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZICk7XG5cblx0XHR9IGVsc2UgaWYgKCBldmVudC5idXR0b24gPT09IDIgKSB7XG5cdFx0XHRpZiAoIHNjb3BlLm5vUGFuID09PSB0cnVlICkgeyByZXR1cm47IH1cblxuXHRcdFx0c3RhdGUgPSBTVEFURS5QQU47XG5cblx0XHRcdHBhblN0YXJ0LnNldCggZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSApO1xuXG5cdFx0fVxuXG5cdFx0Ly8gR3JlZ2dtYW4gZml4OiBodHRwczovL2dpdGh1Yi5jb20vZ3JlZ2dtYW4vdGhyZWUuanMvY29tbWl0L2ZkZTlmOTkxN2Q2ZDgzODFmMDZiZjIyY2RmZjc2NjAyOWQxNzYxYmVcblx0XHRzY29wZS5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSwgZmFsc2UgKTtcblx0XHRzY29wZS5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgb25Nb3VzZVVwLCBmYWxzZSApO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBvbk1vdXNlTW92ZSggZXZlbnQgKSB7XG5cblx0XHRpZiAoIHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdHZhciBlbGVtZW50ID0gc2NvcGUuZG9tRWxlbWVudCA9PT0gZG9jdW1lbnQgPyBzY29wZS5kb21FbGVtZW50LmJvZHkgOiBzY29wZS5kb21FbGVtZW50O1xuXG5cdFx0aWYgKCBzdGF0ZSA9PT0gU1RBVEUuUk9UQVRFICkge1xuXG5cdFx0XHRpZiAoIHNjb3BlLm5vUm90YXRlID09PSB0cnVlICkgcmV0dXJuO1xuXG5cdFx0XHRyb3RhdGVFbmQuc2V0KCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZICk7XG5cdFx0XHRyb3RhdGVEZWx0YS5zdWJWZWN0b3JzKCByb3RhdGVFbmQsIHJvdGF0ZVN0YXJ0ICk7XG5cblx0XHRcdC8vIHJvdGF0aW5nIGFjcm9zcyB3aG9sZSBzY3JlZW4gZ29lcyAzNjAgZGVncmVlcyBhcm91bmRcblx0XHRcdHNjb3BlLnJvdGF0ZUxlZnQoIDIgKiBNYXRoLlBJICogcm90YXRlRGVsdGEueCAvIGVsZW1lbnQuY2xpZW50V2lkdGggKiBzY29wZS5yb3RhdGVTcGVlZCApO1xuXHRcdFx0Ly8gcm90YXRpbmcgdXAgYW5kIGRvd24gYWxvbmcgd2hvbGUgc2NyZWVuIGF0dGVtcHRzIHRvIGdvIDM2MCwgYnV0IGxpbWl0ZWQgdG8gMTgwXG5cdFx0XHRzY29wZS5yb3RhdGVVcCggMiAqIE1hdGguUEkgKiByb3RhdGVEZWx0YS55IC8gZWxlbWVudC5jbGllbnRIZWlnaHQgKiBzY29wZS5yb3RhdGVTcGVlZCApO1xuXG5cdFx0XHRyb3RhdGVTdGFydC5jb3B5KCByb3RhdGVFbmQgKTtcblxuXHRcdH0gZWxzZSBpZiAoIHN0YXRlID09PSBTVEFURS5ET0xMWSApIHtcblxuXHRcdFx0aWYgKCBzY29wZS5ub1pvb20gPT09IHRydWUgKSByZXR1cm47XG5cblx0XHRcdGRvbGx5RW5kLnNldCggZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSApO1xuXHRcdFx0ZG9sbHlEZWx0YS5zdWJWZWN0b3JzKCBkb2xseUVuZCwgZG9sbHlTdGFydCApO1xuXG5cdFx0XHRpZiAoIGRvbGx5RGVsdGEueSA+IDAgKSB7XG5cblx0XHRcdFx0c2NvcGUuZG9sbHlJbigpO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdHNjb3BlLmRvbGx5T3V0KCk7XG5cblx0XHRcdH1cblxuXHRcdFx0ZG9sbHlTdGFydC5jb3B5KCBkb2xseUVuZCApO1xuXG5cdFx0fSBlbHNlIGlmICggc3RhdGUgPT09IFNUQVRFLlBBTiApIHtcblxuXHRcdFx0aWYgKCBzY29wZS5ub1BhbiA9PT0gdHJ1ZSApIHJldHVybjtcblxuXHRcdFx0cGFuRW5kLnNldCggZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSApO1xuXHRcdFx0cGFuRGVsdGEuc3ViVmVjdG9ycyggcGFuRW5kLCBwYW5TdGFydCApO1xuXHRcdFx0XG5cdFx0XHRzY29wZS5wYW4oIHBhbkRlbHRhICk7XG5cblx0XHRcdHBhblN0YXJ0LmNvcHkoIHBhbkVuZCApO1xuXG5cdFx0fVxuXG5cdFx0Ly8gR3JlZ2dtYW4gZml4OiBodHRwczovL2dpdGh1Yi5jb20vZ3JlZ2dtYW4vdGhyZWUuanMvY29tbWl0L2ZkZTlmOTkxN2Q2ZDgzODFmMDZiZjIyY2RmZjc2NjAyOWQxNzYxYmVcblx0XHRzY29wZS51cGRhdGUoKTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gb25Nb3VzZVVwKCAvKiBldmVudCAqLyApIHtcblxuXHRcdGlmICggc2NvcGUuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHQvLyBHcmVnZ21hbiBmaXg6IGh0dHBzOi8vZ2l0aHViLmNvbS9ncmVnZ21hbi90aHJlZS5qcy9jb21taXQvZmRlOWY5OTE3ZDZkODM4MWYwNmJmMjJjZGZmNzY2MDI5ZDE3NjFiZVxuXHRcdHNjb3BlLmRvbUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlLCBmYWxzZSApO1xuXHRcdHNjb3BlLmRvbUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCBvbk1vdXNlVXAsIGZhbHNlICk7XG5cblx0XHRzdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIG9uTW91c2VXaGVlbCggZXZlbnQgKSB7XG5cblx0XHRpZiAoIHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlIHx8IHNjb3BlLm5vWm9vbSA9PT0gdHJ1ZSApIHJldHVybjtcblxuXHRcdHZhciBkZWx0YSA9IDA7XG5cblx0XHRpZiAoIGV2ZW50LndoZWVsRGVsdGEgKSB7IC8vIFdlYktpdCAvIE9wZXJhIC8gRXhwbG9yZXIgOVxuXG5cdFx0XHRkZWx0YSA9IGV2ZW50LndoZWVsRGVsdGE7XG5cblx0XHR9IGVsc2UgaWYgKCBldmVudC5kZXRhaWwgKSB7IC8vIEZpcmVmb3hcblxuXHRcdFx0ZGVsdGEgPSAtIGV2ZW50LmRldGFpbDtcblxuXHRcdH1cblxuXHRcdGlmICggZGVsdGEgPiAwICkge1xuXG5cdFx0XHRzY29wZS5kb2xseU91dCgpO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0c2NvcGUuZG9sbHlJbigpO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRmdW5jdGlvbiBvbktleURvd24oIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBzY29wZS5lbmFibGVkID09PSBmYWxzZSApIHsgcmV0dXJuOyB9XG5cdFx0aWYgKCBzY29wZS5ub0tleXMgPT09IHRydWUgKSB7IHJldHVybjsgfVxuXHRcdGlmICggc2NvcGUubm9QYW4gPT09IHRydWUgKSB7IHJldHVybjsgfVxuXG5cdFx0Ly8gcGFuIGEgcGl4ZWwgLSBJIGd1ZXNzIGZvciBwcmVjaXNlIHBvc2l0aW9uaW5nP1xuXHRcdC8vIEdyZWdnbWFuIGZpeDogaHR0cHM6Ly9naXRodWIuY29tL2dyZWdnbWFuL3RocmVlLmpzL2NvbW1pdC9mZGU5Zjk5MTdkNmQ4MzgxZjA2YmYyMmNkZmY3NjYwMjlkMTc2MWJlXG5cdFx0dmFyIG5lZWRVcGRhdGUgPSBmYWxzZTtcblx0XHRcblx0XHRzd2l0Y2ggKCBldmVudC5rZXlDb2RlICkge1xuXG5cdFx0XHRjYXNlIHNjb3BlLmtleXMuVVA6XG5cdFx0XHRcdHNjb3BlLnBhbiggbmV3IFRIUkVFLlZlY3RvcjIoIDAsIHNjb3BlLmtleVBhblNwZWVkICkgKTtcblx0XHRcdFx0bmVlZFVwZGF0ZSA9IHRydWU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBzY29wZS5rZXlzLkJPVFRPTTpcblx0XHRcdFx0c2NvcGUucGFuKCBuZXcgVEhSRUUuVmVjdG9yMiggMCwgLXNjb3BlLmtleVBhblNwZWVkICkgKTtcblx0XHRcdFx0bmVlZFVwZGF0ZSA9IHRydWU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBzY29wZS5rZXlzLkxFRlQ6XG5cdFx0XHRcdHNjb3BlLnBhbiggbmV3IFRIUkVFLlZlY3RvcjIoIHNjb3BlLmtleVBhblNwZWVkLCAwICkgKTtcblx0XHRcdFx0bmVlZFVwZGF0ZSA9IHRydWU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBzY29wZS5rZXlzLlJJR0hUOlxuXHRcdFx0XHRzY29wZS5wYW4oIG5ldyBUSFJFRS5WZWN0b3IyKCAtc2NvcGUua2V5UGFuU3BlZWQsIDAgKSApO1xuXHRcdFx0XHRuZWVkVXBkYXRlID0gdHJ1ZTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0Ly8gR3JlZ2dtYW4gZml4OiBodHRwczovL2dpdGh1Yi5jb20vZ3JlZ2dtYW4vdGhyZWUuanMvY29tbWl0L2ZkZTlmOTkxN2Q2ZDgzODFmMDZiZjIyY2RmZjc2NjAyOWQxNzYxYmVcblx0XHRpZiAoIG5lZWRVcGRhdGUgKSB7XG5cblx0XHRcdHNjb3BlLnVwZGF0ZSgpO1xuXG5cdFx0fVxuXG5cdH1cblx0XG5cdGZ1bmN0aW9uIHRvdWNoc3RhcnQoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBzY29wZS5lbmFibGVkID09PSBmYWxzZSApIHsgcmV0dXJuOyB9XG5cblx0XHRzd2l0Y2ggKCBldmVudC50b3VjaGVzLmxlbmd0aCApIHtcblxuXHRcdFx0Y2FzZSAxOlx0Ly8gb25lLWZpbmdlcmVkIHRvdWNoOiByb3RhdGVcblx0XHRcdFx0aWYgKCBzY29wZS5ub1JvdGF0ZSA9PT0gdHJ1ZSApIHsgcmV0dXJuOyB9XG5cblx0XHRcdFx0c3RhdGUgPSBTVEFURS5UT1VDSF9ST1RBVEU7XG5cblx0XHRcdFx0cm90YXRlU3RhcnQuc2V0KCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVgsIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSApO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAyOlx0Ly8gdHdvLWZpbmdlcmVkIHRvdWNoOiBkb2xseVxuXHRcdFx0XHRpZiAoIHNjb3BlLm5vWm9vbSA9PT0gdHJ1ZSApIHsgcmV0dXJuOyB9XG5cblx0XHRcdFx0c3RhdGUgPSBTVEFURS5UT1VDSF9ET0xMWTtcblxuXHRcdFx0XHR2YXIgZHggPSBldmVudC50b3VjaGVzWyAwIF0ucGFnZVggLSBldmVudC50b3VjaGVzWyAxIF0ucGFnZVg7XG5cdFx0XHRcdHZhciBkeSA9IGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSAtIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWTtcblx0XHRcdFx0dmFyIGRpc3RhbmNlID0gTWF0aC5zcXJ0KCBkeCAqIGR4ICsgZHkgKiBkeSApO1xuXHRcdFx0XHRkb2xseVN0YXJ0LnNldCggMCwgZGlzdGFuY2UgKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMzogLy8gdGhyZWUtZmluZ2VyZWQgdG91Y2g6IHBhblxuXHRcdFx0XHRpZiAoIHNjb3BlLm5vUGFuID09PSB0cnVlICkgeyByZXR1cm47IH1cblxuXHRcdFx0XHRzdGF0ZSA9IFNUQVRFLlRPVUNIX1BBTjtcblxuXHRcdFx0XHRwYW5TdGFydC5zZXQoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCwgZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRzdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiB0b3VjaG1vdmUoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBzY29wZS5lbmFibGVkID09PSBmYWxzZSApIHsgcmV0dXJuOyB9XG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0dmFyIGVsZW1lbnQgPSBzY29wZS5kb21FbGVtZW50ID09PSBkb2N1bWVudCA/IHNjb3BlLmRvbUVsZW1lbnQuYm9keSA6IHNjb3BlLmRvbUVsZW1lbnQ7XG5cblx0XHRzd2l0Y2ggKCBldmVudC50b3VjaGVzLmxlbmd0aCApIHtcblxuXHRcdFx0Y2FzZSAxOiAvLyBvbmUtZmluZ2VyZWQgdG91Y2g6IHJvdGF0ZVxuXHRcdFx0XHRpZiAoIHNjb3BlLm5vUm90YXRlID09PSB0cnVlICkgeyByZXR1cm47IH1cblx0XHRcdFx0aWYgKCBzdGF0ZSAhPT0gU1RBVEUuVE9VQ0hfUk9UQVRFICkgeyByZXR1cm47IH1cblxuXHRcdFx0XHRyb3RhdGVFbmQuc2V0KCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVgsIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSApO1xuXHRcdFx0XHRyb3RhdGVEZWx0YS5zdWJWZWN0b3JzKCByb3RhdGVFbmQsIHJvdGF0ZVN0YXJ0ICk7XG5cblx0XHRcdFx0Ly8gcm90YXRpbmcgYWNyb3NzIHdob2xlIHNjcmVlbiBnb2VzIDM2MCBkZWdyZWVzIGFyb3VuZFxuXHRcdFx0XHRzY29wZS5yb3RhdGVMZWZ0KCAyICogTWF0aC5QSSAqIHJvdGF0ZURlbHRhLnggLyBlbGVtZW50LmNsaWVudFdpZHRoICogc2NvcGUucm90YXRlU3BlZWQgKTtcblx0XHRcdFx0Ly8gcm90YXRpbmcgdXAgYW5kIGRvd24gYWxvbmcgd2hvbGUgc2NyZWVuIGF0dGVtcHRzIHRvIGdvIDM2MCwgYnV0IGxpbWl0ZWQgdG8gMTgwXG5cdFx0XHRcdHNjb3BlLnJvdGF0ZVVwKCAyICogTWF0aC5QSSAqIHJvdGF0ZURlbHRhLnkgLyBlbGVtZW50LmNsaWVudEhlaWdodCAqIHNjb3BlLnJvdGF0ZVNwZWVkICk7XG5cblx0XHRcdFx0cm90YXRlU3RhcnQuY29weSggcm90YXRlRW5kICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIDI6IC8vIHR3by1maW5nZXJlZCB0b3VjaDogZG9sbHlcblx0XHRcdFx0aWYgKCBzY29wZS5ub1pvb20gPT09IHRydWUgKSB7IHJldHVybjsgfVxuXHRcdFx0XHRpZiAoIHN0YXRlICE9PSBTVEFURS5UT1VDSF9ET0xMWSApIHsgcmV0dXJuOyB9XG5cblx0XHRcdFx0dmFyIGR4ID0gZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYIC0gZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VYO1xuXHRcdFx0XHR2YXIgZHkgPSBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgLSBldmVudC50b3VjaGVzWyAxIF0ucGFnZVk7XG5cdFx0XHRcdHZhciBkaXN0YW5jZSA9IE1hdGguc3FydCggZHggKiBkeCArIGR5ICogZHkgKTtcblxuXHRcdFx0XHRkb2xseUVuZC5zZXQoIDAsIGRpc3RhbmNlICk7XG5cdFx0XHRcdGRvbGx5RGVsdGEuc3ViVmVjdG9ycyggZG9sbHlFbmQsIGRvbGx5U3RhcnQgKTtcblxuXHRcdFx0XHRpZiAoIGRvbGx5RGVsdGEueSA+IDAgKSB7XG5cblx0XHRcdFx0XHRzY29wZS5kb2xseU91dCgpO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRzY29wZS5kb2xseUluKCk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGRvbGx5U3RhcnQuY29weSggZG9sbHlFbmQgKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMzogLy8gdGhyZWUtZmluZ2VyZWQgdG91Y2g6IHBhblxuXHRcdFx0XHRpZiAoIHNjb3BlLm5vUGFuID09PSB0cnVlICkgeyByZXR1cm47IH1cblx0XHRcdFx0aWYgKCBzdGF0ZSAhPT0gU1RBVEUuVE9VQ0hfUEFOICkgeyByZXR1cm47IH1cblxuXHRcdFx0XHRwYW5FbmQuc2V0KCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVgsIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSApO1xuXHRcdFx0XHRwYW5EZWx0YS5zdWJWZWN0b3JzKCBwYW5FbmQsIHBhblN0YXJ0ICk7XG5cdFx0XHRcdFxuXHRcdFx0XHRzY29wZS5wYW4oIHBhbkRlbHRhICk7XG5cblx0XHRcdFx0cGFuU3RhcnQuY29weSggcGFuRW5kICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRzdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0XHR9XG5cblx0fVxuXG5cdGZ1bmN0aW9uIHRvdWNoZW5kKCAvKiBldmVudCAqLyApIHtcblxuXHRcdGlmICggc2NvcGUuZW5hYmxlZCA9PT0gZmFsc2UgKSB7IHJldHVybjsgfVxuXG5cdFx0c3RhdGUgPSBTVEFURS5OT05FO1xuXHR9XG5cblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdjb250ZXh0bWVudScsIGZ1bmN0aW9uICggZXZlbnQgKSB7IGV2ZW50LnByZXZlbnREZWZhdWx0KCk7IH0sIGZhbHNlICk7XG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgb25Nb3VzZURvd24sIGZhbHNlICk7XG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2V3aGVlbCcsIG9uTW91c2VXaGVlbCwgZmFsc2UgKTtcblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdET01Nb3VzZVNjcm9sbCcsIG9uTW91c2VXaGVlbCwgZmFsc2UgKTsgLy8gZmlyZWZveFxuXG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIG9uS2V5RG93biwgZmFsc2UgKTtcblxuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCB0b3VjaHN0YXJ0LCBmYWxzZSApO1xuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoZW5kJywgdG91Y2hlbmQsIGZhbHNlICk7XG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAndG91Y2htb3ZlJywgdG91Y2htb3ZlLCBmYWxzZSApO1xuXG59O1xuXG5PcmJpdENvbnRyb2xzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRIUkVFLkV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUgKTtcblxubW9kdWxlLmV4cG9ydHMgPSBPcmJpdENvbnRyb2xzO1xuIiwiLyoqXG4gKiBAYXV0aG9yIG1yZG9vYiAvIGh0dHA6Ly9tcmRvb2IuY29tL1xuICovXG5cbnZhciBTdGF0cyA9IGZ1bmN0aW9uICgpIHtcblxuXHR2YXIgc3RhcnRUaW1lID0gRGF0ZS5ub3coKSwgcHJldlRpbWUgPSBzdGFydFRpbWU7XG5cdHZhciBtcyA9IDAsIG1zTWluID0gSW5maW5pdHksIG1zTWF4ID0gMDtcblx0dmFyIGZwcyA9IDAsIGZwc01pbiA9IEluZmluaXR5LCBmcHNNYXggPSAwO1xuXHR2YXIgZnJhbWVzID0gMCwgbW9kZSA9IDA7XG5cblx0dmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdGNvbnRhaW5lci5pZCA9ICdzdGF0cyc7XG5cdGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgZnVuY3Rpb24gKCBldmVudCApIHsgZXZlbnQucHJldmVudERlZmF1bHQoKTsgc2V0TW9kZSggKysgbW9kZSAlIDIgKTsgfSwgZmFsc2UgKTtcblx0Y29udGFpbmVyLnN0eWxlLmNzc1RleHQgPSAnd2lkdGg6ODBweDtvcGFjaXR5OjAuOTtjdXJzb3I6cG9pbnRlcic7XG5cblx0dmFyIGZwc0RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdGZwc0Rpdi5pZCA9ICdmcHMnO1xuXHRmcHNEaXYuc3R5bGUuY3NzVGV4dCA9ICdwYWRkaW5nOjAgMCAzcHggM3B4O3RleHQtYWxpZ246bGVmdDtiYWNrZ3JvdW5kLWNvbG9yOiMwMDInO1xuXHRjb250YWluZXIuYXBwZW5kQ2hpbGQoIGZwc0RpdiApO1xuXG5cdHZhciBmcHNUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblx0ZnBzVGV4dC5pZCA9ICdmcHNUZXh0Jztcblx0ZnBzVGV4dC5zdHlsZS5jc3NUZXh0ID0gJ2NvbG9yOiMwZmY7Zm9udC1mYW1pbHk6SGVsdmV0aWNhLEFyaWFsLHNhbnMtc2VyaWY7Zm9udC1zaXplOjlweDtmb250LXdlaWdodDpib2xkO2xpbmUtaGVpZ2h0OjE1cHgnO1xuXHRmcHNUZXh0LmlubmVySFRNTCA9ICdGUFMnO1xuXHRmcHNEaXYuYXBwZW5kQ2hpbGQoIGZwc1RleHQgKTtcblxuXHR2YXIgZnBzR3JhcGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuXHRmcHNHcmFwaC5pZCA9ICdmcHNHcmFwaCc7XG5cdGZwc0dyYXBoLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246cmVsYXRpdmU7d2lkdGg6NzRweDtoZWlnaHQ6MzBweDtiYWNrZ3JvdW5kLWNvbG9yOiMwZmYnO1xuXHRmcHNEaXYuYXBwZW5kQ2hpbGQoIGZwc0dyYXBoICk7XG5cblx0d2hpbGUgKCBmcHNHcmFwaC5jaGlsZHJlbi5sZW5ndGggPCA3NCApIHtcblxuXHRcdHZhciBiYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnc3BhbicgKTtcblx0XHRiYXIuc3R5bGUuY3NzVGV4dCA9ICd3aWR0aDoxcHg7aGVpZ2h0OjMwcHg7ZmxvYXQ6bGVmdDtiYWNrZ3JvdW5kLWNvbG9yOiMxMTMnO1xuXHRcdGZwc0dyYXBoLmFwcGVuZENoaWxkKCBiYXIgKTtcblxuXHR9XG5cblx0dmFyIG1zRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblx0bXNEaXYuaWQgPSAnbXMnO1xuXHRtc0Rpdi5zdHlsZS5jc3NUZXh0ID0gJ3BhZGRpbmc6MCAwIDNweCAzcHg7dGV4dC1hbGlnbjpsZWZ0O2JhY2tncm91bmQtY29sb3I6IzAyMDtkaXNwbGF5Om5vbmUnO1xuXHRjb250YWluZXIuYXBwZW5kQ2hpbGQoIG1zRGl2ICk7XG5cblx0dmFyIG1zVGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdG1zVGV4dC5pZCA9ICdtc1RleHQnO1xuXHRtc1RleHQuc3R5bGUuY3NzVGV4dCA9ICdjb2xvcjojMGYwO2ZvbnQtZmFtaWx5OkhlbHZldGljYSxBcmlhbCxzYW5zLXNlcmlmO2ZvbnQtc2l6ZTo5cHg7Zm9udC13ZWlnaHQ6Ym9sZDtsaW5lLWhlaWdodDoxNXB4Jztcblx0bXNUZXh0LmlubmVySFRNTCA9ICdNUyc7XG5cdG1zRGl2LmFwcGVuZENoaWxkKCBtc1RleHQgKTtcblxuXHR2YXIgbXNHcmFwaCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdG1zR3JhcGguaWQgPSAnbXNHcmFwaCc7XG5cdG1zR3JhcGguc3R5bGUuY3NzVGV4dCA9ICdwb3NpdGlvbjpyZWxhdGl2ZTt3aWR0aDo3NHB4O2hlaWdodDozMHB4O2JhY2tncm91bmQtY29sb3I6IzBmMCc7XG5cdG1zRGl2LmFwcGVuZENoaWxkKCBtc0dyYXBoICk7XG5cblx0d2hpbGUgKCBtc0dyYXBoLmNoaWxkcmVuLmxlbmd0aCA8IDc0ICkge1xuXG5cdFx0dmFyIGJhcjIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnc3BhbicgKTtcblx0XHRiYXIyLnN0eWxlLmNzc1RleHQgPSAnd2lkdGg6MXB4O2hlaWdodDozMHB4O2Zsb2F0OmxlZnQ7YmFja2dyb3VuZC1jb2xvcjojMTMxJztcblx0XHRtc0dyYXBoLmFwcGVuZENoaWxkKCBiYXIyICk7XG5cblx0fVxuXG5cdHZhciBzZXRNb2RlID0gZnVuY3Rpb24gKCB2YWx1ZSApIHtcblxuXHRcdG1vZGUgPSB2YWx1ZTtcblxuXHRcdHN3aXRjaCAoIG1vZGUgKSB7XG5cblx0XHRcdGNhc2UgMDpcblx0XHRcdFx0ZnBzRGl2LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0XHRtc0Rpdi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0ZnBzRGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cdFx0XHRcdG1zRGl2LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0fTtcblxuXHR2YXIgdXBkYXRlR3JhcGggPSBmdW5jdGlvbiAoIGRvbSwgdmFsdWUgKSB7XG5cblx0XHR2YXIgY2hpbGQgPSBkb20uYXBwZW5kQ2hpbGQoIGRvbS5maXJzdENoaWxkICk7XG5cdFx0Y2hpbGQuc3R5bGUuaGVpZ2h0ID0gdmFsdWUgKyAncHgnO1xuXG5cdH07XG5cblx0cmV0dXJuIHtcblxuXHRcdFJFVklTSU9OOiAxMixcblxuXHRcdGRvbUVsZW1lbnQ6IGNvbnRhaW5lcixcblxuXHRcdHNldE1vZGU6IHNldE1vZGUsXG5cblx0XHRiZWdpbjogZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuXG5cdFx0fSxcblxuXHRcdGVuZDogZnVuY3Rpb24gKCkge1xuXG5cdFx0XHR2YXIgdGltZSA9IERhdGUubm93KCk7XG5cblx0XHRcdG1zID0gdGltZSAtIHN0YXJ0VGltZTtcblx0XHRcdG1zTWluID0gTWF0aC5taW4oIG1zTWluLCBtcyApO1xuXHRcdFx0bXNNYXggPSBNYXRoLm1heCggbXNNYXgsIG1zICk7XG5cblx0XHRcdG1zVGV4dC50ZXh0Q29udGVudCA9IG1zICsgJyBNUyAoJyArIG1zTWluICsgJy0nICsgbXNNYXggKyAnKSc7XG5cdFx0XHR1cGRhdGVHcmFwaCggbXNHcmFwaCwgTWF0aC5taW4oIDMwLCAzMCAtICggbXMgLyAyMDAgKSAqIDMwICkgKTtcblxuXHRcdFx0ZnJhbWVzICsrO1xuXG5cdFx0XHRpZiAoIHRpbWUgPiBwcmV2VGltZSArIDEwMDAgKSB7XG5cblx0XHRcdFx0ZnBzID0gTWF0aC5yb3VuZCggKCBmcmFtZXMgKiAxMDAwICkgLyAoIHRpbWUgLSBwcmV2VGltZSApICk7XG5cdFx0XHRcdGZwc01pbiA9IE1hdGgubWluKCBmcHNNaW4sIGZwcyApO1xuXHRcdFx0XHRmcHNNYXggPSBNYXRoLm1heCggZnBzTWF4LCBmcHMgKTtcblxuXHRcdFx0XHRmcHNUZXh0LnRleHRDb250ZW50ID0gZnBzICsgJyBGUFMgKCcgKyBmcHNNaW4gKyAnLScgKyBmcHNNYXggKyAnKSc7XG5cdFx0XHRcdHVwZGF0ZUdyYXBoKCBmcHNHcmFwaCwgTWF0aC5taW4oIDMwLCAzMCAtICggZnBzIC8gMTAwICkgKiAzMCApICk7XG5cblx0XHRcdFx0cHJldlRpbWUgPSB0aW1lO1xuXHRcdFx0XHRmcmFtZXMgPSAwO1xuXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aW1lO1xuXG5cdFx0fSxcblxuXHRcdHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRzdGFydFRpbWUgPSB0aGlzLmVuZCgpO1xuXG5cdFx0fVxuXG5cdH07XG5cbn07XG5cbmlmICggdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgKSB7XG5cblx0bW9kdWxlLmV4cG9ydHMgPSBTdGF0cztcblxufSIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwiKGZ1bmN0aW9uIChwcm9jZXNzKXtcbi8qIVxuICogQG92ZXJ2aWV3IFJTVlAgLSBhIHRpbnkgaW1wbGVtZW50YXRpb24gb2YgUHJvbWlzZXMvQSsuXG4gKiBAY29weXJpZ2h0IENvcHlyaWdodCAoYykgMjAxNCBZZWh1ZGEgS2F0eiwgVG9tIERhbGUsIFN0ZWZhbiBQZW5uZXIgYW5kIGNvbnRyaWJ1dG9yc1xuICogQGxpY2Vuc2UgICBMaWNlbnNlZCB1bmRlciBNSVQgbGljZW5zZVxuICogICAgICAgICAgICBTZWUgaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3RpbGRlaW8vcnN2cC5qcy9tYXN0ZXIvTElDRU5TRVxuICogQHZlcnNpb24gICAzLjAuMTRcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkZXZlbnRzJCRpbmRleE9mKGNhbGxiYWNrcywgY2FsbGJhY2spIHtcbiAgICAgIGZvciAodmFyIGk9MCwgbD1jYWxsYmFja3MubGVuZ3RoOyBpPGw7IGkrKykge1xuICAgICAgICBpZiAoY2FsbGJhY2tzW2ldID09PSBjYWxsYmFjaykgeyByZXR1cm4gaTsgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJGV2ZW50cyQkY2FsbGJhY2tzRm9yKG9iamVjdCkge1xuICAgICAgdmFyIGNhbGxiYWNrcyA9IG9iamVjdC5fcHJvbWlzZUNhbGxiYWNrcztcblxuICAgICAgaWYgKCFjYWxsYmFja3MpIHtcbiAgICAgICAgY2FsbGJhY2tzID0gb2JqZWN0Ll9wcm9taXNlQ2FsbGJhY2tzID0ge307XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjYWxsYmFja3M7XG4gICAgfVxuXG4gICAgdmFyICQkcnN2cCRldmVudHMkJGRlZmF1bHQgPSB7XG5cbiAgICAgIC8qKlxuICAgICAgICBgUlNWUC5FdmVudFRhcmdldC5taXhpbmAgZXh0ZW5kcyBhbiBvYmplY3Qgd2l0aCBFdmVudFRhcmdldCBtZXRob2RzLiBGb3JcbiAgICAgICAgRXhhbXBsZTpcblxuICAgICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICAgIHZhciBvYmplY3QgPSB7fTtcblxuICAgICAgICBSU1ZQLkV2ZW50VGFyZ2V0Lm1peGluKG9iamVjdCk7XG5cbiAgICAgICAgb2JqZWN0Lm9uKCdmaW5pc2hlZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgLy8gaGFuZGxlIGV2ZW50XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG9iamVjdC50cmlnZ2VyKCdmaW5pc2hlZCcsIHsgZGV0YWlsOiB2YWx1ZSB9KTtcbiAgICAgICAgYGBgXG5cbiAgICAgICAgYEV2ZW50VGFyZ2V0Lm1peGluYCBhbHNvIHdvcmtzIHdpdGggcHJvdG90eXBlczpcblxuICAgICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICAgIHZhciBQZXJzb24gPSBmdW5jdGlvbigpIHt9O1xuICAgICAgICBSU1ZQLkV2ZW50VGFyZ2V0Lm1peGluKFBlcnNvbi5wcm90b3R5cGUpO1xuXG4gICAgICAgIHZhciB5ZWh1ZGEgPSBuZXcgUGVyc29uKCk7XG4gICAgICAgIHZhciB0b20gPSBuZXcgUGVyc29uKCk7XG5cbiAgICAgICAgeWVodWRhLm9uKCdwb2tlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnWWVodWRhIHNheXMgT1cnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdG9tLm9uKCdwb2tlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnVG9tIHNheXMgT1cnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgeWVodWRhLnRyaWdnZXIoJ3Bva2UnKTtcbiAgICAgICAgdG9tLnRyaWdnZXIoJ3Bva2UnKTtcbiAgICAgICAgYGBgXG5cbiAgICAgICAgQG1ldGhvZCBtaXhpblxuICAgICAgICBAZm9yIFJTVlAuRXZlbnRUYXJnZXRcbiAgICAgICAgQHByaXZhdGVcbiAgICAgICAgQHBhcmFtIHtPYmplY3R9IG9iamVjdCBvYmplY3QgdG8gZXh0ZW5kIHdpdGggRXZlbnRUYXJnZXQgbWV0aG9kc1xuICAgICAgKi9cbiAgICAgIG1peGluOiBmdW5jdGlvbihvYmplY3QpIHtcbiAgICAgICAgb2JqZWN0Lm9uID0gdGhpcy5vbjtcbiAgICAgICAgb2JqZWN0Lm9mZiA9IHRoaXMub2ZmO1xuICAgICAgICBvYmplY3QudHJpZ2dlciA9IHRoaXMudHJpZ2dlcjtcbiAgICAgICAgb2JqZWN0Ll9wcm9taXNlQ2FsbGJhY2tzID0gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgIFJlZ2lzdGVycyBhIGNhbGxiYWNrIHRvIGJlIGV4ZWN1dGVkIHdoZW4gYGV2ZW50TmFtZWAgaXMgdHJpZ2dlcmVkXG5cbiAgICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgICBvYmplY3Qub24oJ2V2ZW50JywgZnVuY3Rpb24oZXZlbnRJbmZvKXtcbiAgICAgICAgICAvLyBoYW5kbGUgdGhlIGV2ZW50XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG9iamVjdC50cmlnZ2VyKCdldmVudCcpO1xuICAgICAgICBgYGBcblxuICAgICAgICBAbWV0aG9kIG9uXG4gICAgICAgIEBmb3IgUlNWUC5FdmVudFRhcmdldFxuICAgICAgICBAcHJpdmF0ZVxuICAgICAgICBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lIG5hbWUgb2YgdGhlIGV2ZW50IHRvIGxpc3RlbiBmb3JcbiAgICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGV2ZW50IGlzIHRyaWdnZXJlZC5cbiAgICAgICovXG4gICAgICBvbjogZnVuY3Rpb24oZXZlbnROYW1lLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgYWxsQ2FsbGJhY2tzID0gJCRyc3ZwJGV2ZW50cyQkY2FsbGJhY2tzRm9yKHRoaXMpLCBjYWxsYmFja3M7XG5cbiAgICAgICAgY2FsbGJhY2tzID0gYWxsQ2FsbGJhY2tzW2V2ZW50TmFtZV07XG5cbiAgICAgICAgaWYgKCFjYWxsYmFja3MpIHtcbiAgICAgICAgICBjYWxsYmFja3MgPSBhbGxDYWxsYmFja3NbZXZlbnROYW1lXSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCQkcnN2cCRldmVudHMkJGluZGV4T2YoY2FsbGJhY2tzLCBjYWxsYmFjaykgPT09IC0xKSB7XG4gICAgICAgICAgY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAgWW91IGNhbiB1c2UgYG9mZmAgdG8gc3RvcCBmaXJpbmcgYSBwYXJ0aWN1bGFyIGNhbGxiYWNrIGZvciBhbiBldmVudDpcblxuICAgICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICAgIGZ1bmN0aW9uIGRvU3R1ZmYoKSB7IC8vIGRvIHN0dWZmISB9XG4gICAgICAgIG9iamVjdC5vbignc3R1ZmYnLCBkb1N0dWZmKTtcblxuICAgICAgICBvYmplY3QudHJpZ2dlcignc3R1ZmYnKTsgLy8gZG9TdHVmZiB3aWxsIGJlIGNhbGxlZFxuXG4gICAgICAgIC8vIFVucmVnaXN0ZXIgT05MWSB0aGUgZG9TdHVmZiBjYWxsYmFja1xuICAgICAgICBvYmplY3Qub2ZmKCdzdHVmZicsIGRvU3R1ZmYpO1xuICAgICAgICBvYmplY3QudHJpZ2dlcignc3R1ZmYnKTsgLy8gZG9TdHVmZiB3aWxsIE5PVCBiZSBjYWxsZWRcbiAgICAgICAgYGBgXG5cbiAgICAgICAgSWYgeW91IGRvbid0IHBhc3MgYSBgY2FsbGJhY2tgIGFyZ3VtZW50IHRvIGBvZmZgLCBBTEwgY2FsbGJhY2tzIGZvciB0aGVcbiAgICAgICAgZXZlbnQgd2lsbCBub3QgYmUgZXhlY3V0ZWQgd2hlbiB0aGUgZXZlbnQgZmlyZXMuIEZvciBleGFtcGxlOlxuXG4gICAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgICAgdmFyIGNhbGxiYWNrMSA9IGZ1bmN0aW9uKCl7fTtcbiAgICAgICAgdmFyIGNhbGxiYWNrMiA9IGZ1bmN0aW9uKCl7fTtcblxuICAgICAgICBvYmplY3Qub24oJ3N0dWZmJywgY2FsbGJhY2sxKTtcbiAgICAgICAgb2JqZWN0Lm9uKCdzdHVmZicsIGNhbGxiYWNrMik7XG5cbiAgICAgICAgb2JqZWN0LnRyaWdnZXIoJ3N0dWZmJyk7IC8vIGNhbGxiYWNrMSBhbmQgY2FsbGJhY2syIHdpbGwgYmUgZXhlY3V0ZWQuXG5cbiAgICAgICAgb2JqZWN0Lm9mZignc3R1ZmYnKTtcbiAgICAgICAgb2JqZWN0LnRyaWdnZXIoJ3N0dWZmJyk7IC8vIGNhbGxiYWNrMSBhbmQgY2FsbGJhY2syIHdpbGwgbm90IGJlIGV4ZWN1dGVkIVxuICAgICAgICBgYGBcblxuICAgICAgICBAbWV0aG9kIG9mZlxuICAgICAgICBAZm9yIFJTVlAuRXZlbnRUYXJnZXRcbiAgICAgICAgQHByaXZhdGVcbiAgICAgICAgQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZSBldmVudCB0byBzdG9wIGxpc3RlbmluZyB0b1xuICAgICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBvcHRpb25hbCBhcmd1bWVudC4gSWYgZ2l2ZW4sIG9ubHkgdGhlIGZ1bmN0aW9uXG4gICAgICAgIGdpdmVuIHdpbGwgYmUgcmVtb3ZlZCBmcm9tIHRoZSBldmVudCdzIGNhbGxiYWNrIHF1ZXVlLiBJZiBubyBgY2FsbGJhY2tgXG4gICAgICAgIGFyZ3VtZW50IGlzIGdpdmVuLCBhbGwgY2FsbGJhY2tzIHdpbGwgYmUgcmVtb3ZlZCBmcm9tIHRoZSBldmVudCdzIGNhbGxiYWNrXG4gICAgICAgIHF1ZXVlLlxuICAgICAgKi9cbiAgICAgIG9mZjogZnVuY3Rpb24oZXZlbnROYW1lLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgYWxsQ2FsbGJhY2tzID0gJCRyc3ZwJGV2ZW50cyQkY2FsbGJhY2tzRm9yKHRoaXMpLCBjYWxsYmFja3MsIGluZGV4O1xuXG4gICAgICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgICAgICBhbGxDYWxsYmFja3NbZXZlbnROYW1lXSA9IFtdO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrcyA9IGFsbENhbGxiYWNrc1tldmVudE5hbWVdO1xuXG4gICAgICAgIGluZGV4ID0gJCRyc3ZwJGV2ZW50cyQkaW5kZXhPZihjYWxsYmFja3MsIGNhbGxiYWNrKTtcblxuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7IGNhbGxiYWNrcy5zcGxpY2UoaW5kZXgsIDEpOyB9XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAgVXNlIGB0cmlnZ2VyYCB0byBmaXJlIGN1c3RvbSBldmVudHMuIEZvciBleGFtcGxlOlxuXG4gICAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgICAgb2JqZWN0Lm9uKCdmb28nLCBmdW5jdGlvbigpe1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdmb28gZXZlbnQgaGFwcGVuZWQhJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBvYmplY3QudHJpZ2dlcignZm9vJyk7XG4gICAgICAgIC8vICdmb28gZXZlbnQgaGFwcGVuZWQhJyBsb2dnZWQgdG8gdGhlIGNvbnNvbGVcbiAgICAgICAgYGBgXG5cbiAgICAgICAgWW91IGNhbiBhbHNvIHBhc3MgYSB2YWx1ZSBhcyBhIHNlY29uZCBhcmd1bWVudCB0byBgdHJpZ2dlcmAgdGhhdCB3aWxsIGJlXG4gICAgICAgIHBhc3NlZCBhcyBhbiBhcmd1bWVudCB0byBhbGwgZXZlbnQgbGlzdGVuZXJzIGZvciB0aGUgZXZlbnQ6XG5cbiAgICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgICBvYmplY3Qub24oJ2ZvbycsIGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgICAgICBjb25zb2xlLmxvZyh2YWx1ZS5uYW1lKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgb2JqZWN0LnRyaWdnZXIoJ2ZvbycsIHsgbmFtZTogJ2JhcicgfSk7XG4gICAgICAgIC8vICdiYXInIGxvZ2dlZCB0byB0aGUgY29uc29sZVxuICAgICAgICBgYGBcblxuICAgICAgICBAbWV0aG9kIHRyaWdnZXJcbiAgICAgICAgQGZvciBSU1ZQLkV2ZW50VGFyZ2V0XG4gICAgICAgIEBwcml2YXRlXG4gICAgICAgIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWUgbmFtZSBvZiB0aGUgZXZlbnQgdG8gYmUgdHJpZ2dlcmVkXG4gICAgICAgIEBwYXJhbSB7QW55fSBvcHRpb25zIG9wdGlvbmFsIHZhbHVlIHRvIGJlIHBhc3NlZCB0byBhbnkgZXZlbnQgaGFuZGxlcnMgZm9yXG4gICAgICAgIHRoZSBnaXZlbiBgZXZlbnROYW1lYFxuICAgICAgKi9cbiAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKGV2ZW50TmFtZSwgb3B0aW9ucykge1xuICAgICAgICB2YXIgYWxsQ2FsbGJhY2tzID0gJCRyc3ZwJGV2ZW50cyQkY2FsbGJhY2tzRm9yKHRoaXMpLCBjYWxsYmFja3MsIGNhbGxiYWNrO1xuXG4gICAgICAgIGlmIChjYWxsYmFja3MgPSBhbGxDYWxsYmFja3NbZXZlbnROYW1lXSkge1xuICAgICAgICAgIC8vIERvbid0IGNhY2hlIHRoZSBjYWxsYmFja3MubGVuZ3RoIHNpbmNlIGl0IG1heSBncm93XG4gICAgICAgICAgZm9yICh2YXIgaT0wOyBpPGNhbGxiYWNrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFja3NbaV07XG5cbiAgICAgICAgICAgIGNhbGxiYWNrKG9wdGlvbnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgJCRyc3ZwJGNvbmZpZyQkY29uZmlnID0ge1xuICAgICAgaW5zdHJ1bWVudDogZmFsc2VcbiAgICB9O1xuXG4gICAgJCRyc3ZwJGV2ZW50cyQkZGVmYXVsdC5taXhpbigkJHJzdnAkY29uZmlnJCRjb25maWcpO1xuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJGNvbmZpZyQkY29uZmlndXJlKG5hbWUsIHZhbHVlKSB7XG4gICAgICBpZiAobmFtZSA9PT0gJ29uZXJyb3InKSB7XG4gICAgICAgIC8vIGhhbmRsZSBmb3IgbGVnYWN5IHVzZXJzIHRoYXQgZXhwZWN0IHRoZSBhY3R1YWxcbiAgICAgICAgLy8gZXJyb3IgdG8gYmUgcGFzc2VkIHRvIHRoZWlyIGZ1bmN0aW9uIGFkZGVkIHZpYVxuICAgICAgICAvLyBgUlNWUC5jb25maWd1cmUoJ29uZXJyb3InLCBzb21lRnVuY3Rpb25IZXJlKTtgXG4gICAgICAgICQkcnN2cCRjb25maWckJGNvbmZpZy5vbignZXJyb3InLCB2YWx1ZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgJCRyc3ZwJGNvbmZpZyQkY29uZmlnW25hbWVdID0gdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gJCRyc3ZwJGNvbmZpZyQkY29uZmlnW25hbWVdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkdXRpbHMkJG9iamVjdE9yRnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nIHx8ICh0eXBlb2YgeCA9PT0gJ29iamVjdCcgJiYgeCAhPT0gbnVsbCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCR1dGlscyQkaXNGdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHggPT09ICdmdW5jdGlvbic7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCR1dGlscyQkaXNNYXliZVRoZW5hYmxlKHgpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ29iamVjdCcgJiYgeCAhPT0gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgJCR1dGlscyQkX2lzQXJyYXk7XG5cbiAgICBpZiAoIUFycmF5LmlzQXJyYXkpIHtcbiAgICAgICQkdXRpbHMkJF9pc0FycmF5ID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICQkdXRpbHMkJF9pc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcbiAgICB9XG5cbiAgICB2YXIgJCR1dGlscyQkaXNBcnJheSA9ICQkdXRpbHMkJF9pc0FycmF5O1xuICAgIHZhciAkJHV0aWxzJCRub3cgPSBEYXRlLm5vdyB8fCBmdW5jdGlvbigpIHsgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpOyB9O1xuICAgIGZ1bmN0aW9uICQkdXRpbHMkJEYoKSB7IH1cblxuICAgIHZhciAkJHV0aWxzJCRvX2NyZWF0ZSA9IChPYmplY3QuY3JlYXRlIHx8IGZ1bmN0aW9uIChvKSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZWNvbmQgYXJndW1lbnQgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBvICE9PSAnb2JqZWN0Jykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGFuIG9iamVjdCcpO1xuICAgICAgfVxuICAgICAgJCR1dGlscyQkRi5wcm90b3R5cGUgPSBvO1xuICAgICAgcmV0dXJuIG5ldyAkJHV0aWxzJCRGKCk7XG4gICAgfSk7XG5cbiAgICB2YXIgJCRpbnN0cnVtZW50JCRxdWV1ZSA9IFtdO1xuXG4gICAgdmFyICQkaW5zdHJ1bWVudCQkZGVmYXVsdCA9IGZ1bmN0aW9uIGluc3RydW1lbnQoZXZlbnROYW1lLCBwcm9taXNlLCBjaGlsZCkge1xuICAgICAgaWYgKDEgPT09ICQkaW5zdHJ1bWVudCQkcXVldWUucHVzaCh7XG4gICAgICAgICAgbmFtZTogZXZlbnROYW1lLFxuICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgIGd1aWQ6IHByb21pc2UuX2d1aWRLZXkgKyBwcm9taXNlLl9pZCxcbiAgICAgICAgICAgIGV2ZW50TmFtZTogZXZlbnROYW1lLFxuICAgICAgICAgICAgZGV0YWlsOiBwcm9taXNlLl9yZXN1bHQsXG4gICAgICAgICAgICBjaGlsZEd1aWQ6IGNoaWxkICYmIHByb21pc2UuX2d1aWRLZXkgKyBjaGlsZC5faWQsXG4gICAgICAgICAgICBsYWJlbDogcHJvbWlzZS5fbGFiZWwsXG4gICAgICAgICAgICB0aW1lU3RhbXA6ICQkdXRpbHMkJG5vdygpLFxuICAgICAgICAgICAgc3RhY2s6IG5ldyBFcnJvcihwcm9taXNlLl9sYWJlbCkuc3RhY2tcbiAgICAgICAgICB9fSkpIHtcblxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyIGVudHJ5O1xuICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8ICQkaW5zdHJ1bWVudCQkcXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBlbnRyeSA9ICQkaW5zdHJ1bWVudCQkcXVldWVbaV07XG4gICAgICAgICAgICAgICAgJCRyc3ZwJGNvbmZpZyQkY29uZmlnLnRyaWdnZXIoZW50cnkubmFtZSwgZW50cnkucGF5bG9hZCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgJCRpbnN0cnVtZW50JCRxdWV1ZS5sZW5ndGggPSAwO1xuICAgICAgICAgICAgfSwgNTApO1xuICAgICAgICAgIH1cbiAgICAgIH07XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkbm9vcCgpIHt9XG4gICAgdmFyICQkJGludGVybmFsJCRQRU5ESU5HICAgPSB2b2lkIDA7XG4gICAgdmFyICQkJGludGVybmFsJCRGVUxGSUxMRUQgPSAxO1xuICAgIHZhciAkJCRpbnRlcm5hbCQkUkVKRUNURUQgID0gMjtcbiAgICB2YXIgJCQkaW50ZXJuYWwkJEdFVF9USEVOX0VSUk9SID0gbmV3ICQkJGludGVybmFsJCRFcnJvck9iamVjdCgpO1xuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJGdldFRoZW4ocHJvbWlzZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbjtcbiAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJEdFVF9USEVOX0VSUk9SLmVycm9yID0gZXJyb3I7XG4gICAgICAgIHJldHVybiAkJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJHRyeVRoZW4odGhlbiwgdmFsdWUsIGZ1bGZpbGxtZW50SGFuZGxlciwgcmVqZWN0aW9uSGFuZGxlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhlbi5jYWxsKHZhbHVlLCBmdWxmaWxsbWVudEhhbmRsZXIsIHJlamVjdGlvbkhhbmRsZXIpO1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRoYW5kbGVGb3JlaWduVGhlbmFibGUocHJvbWlzZSwgdGhlbmFibGUsIHRoZW4pIHtcbiAgICAgICQkcnN2cCRjb25maWckJGNvbmZpZy5hc3luYyhmdW5jdGlvbihwcm9taXNlKSB7XG4gICAgICAgIHZhciBzZWFsZWQgPSBmYWxzZTtcbiAgICAgICAgdmFyIGVycm9yID0gJCQkaW50ZXJuYWwkJHRyeVRoZW4odGhlbiwgdGhlbmFibGUsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgaWYgKHNlYWxlZCkgeyByZXR1cm47IH1cbiAgICAgICAgICBzZWFsZWQgPSB0cnVlO1xuICAgICAgICAgIGlmICh0aGVuYWJsZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICQkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgICAgaWYgKHNlYWxlZCkgeyByZXR1cm47IH1cbiAgICAgICAgICBzZWFsZWQgPSB0cnVlO1xuXG4gICAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgICB9LCAnU2V0dGxlOiAnICsgKHByb21pc2UuX2xhYmVsIHx8ICcgdW5rbm93biBwcm9taXNlJykpO1xuXG4gICAgICAgIGlmICghc2VhbGVkICYmIGVycm9yKSB7XG4gICAgICAgICAgc2VhbGVkID0gdHJ1ZTtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfSwgcHJvbWlzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJGhhbmRsZU93blRoZW5hYmxlKHByb21pc2UsIHRoZW5hYmxlKSB7XG4gICAgICBpZiAodGhlbmFibGUuX3N0YXRlID09PSAkJCRpbnRlcm5hbCQkRlVMRklMTEVEKSB7XG4gICAgICAgICQkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHRoZW5hYmxlLl9yZXN1bHQpO1xuICAgICAgfSBlbHNlIGlmIChwcm9taXNlLl9zdGF0ZSA9PT0gJCQkaW50ZXJuYWwkJFJFSkVDVEVEKSB7XG4gICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgdGhlbmFibGUuX3Jlc3VsdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkJCRpbnRlcm5hbCQkc3Vic2NyaWJlKHRoZW5hYmxlLCB1bmRlZmluZWQsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgaWYgKHRoZW5hYmxlICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgJCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRoYW5kbGVNYXliZVRoZW5hYmxlKHByb21pc2UsIG1heWJlVGhlbmFibGUpIHtcbiAgICAgIGlmIChtYXliZVRoZW5hYmxlLmNvbnN0cnVjdG9yID09PSBwcm9taXNlLmNvbnN0cnVjdG9yKSB7XG4gICAgICAgICQkJGludGVybmFsJCRoYW5kbGVPd25UaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB0aGVuID0gJCQkaW50ZXJuYWwkJGdldFRoZW4obWF5YmVUaGVuYWJsZSk7XG5cbiAgICAgICAgaWYgKHRoZW4gPT09ICQkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUikge1xuICAgICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgJCQkaW50ZXJuYWwkJEdFVF9USEVOX0VSUk9SLmVycm9yKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGVuID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICAgICAgfSBlbHNlIGlmICgkJHV0aWxzJCRpc0Z1bmN0aW9uKHRoZW4pKSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJGhhbmRsZUZvcmVpZ25UaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlLCB0aGVuKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKSB7XG4gICAgICBpZiAocHJvbWlzZSA9PT0gdmFsdWUpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIGlmICgkJHV0aWxzJCRvYmplY3RPckZ1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkaGFuZGxlTWF5YmVUaGVuYWJsZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJHB1Ymxpc2hSZWplY3Rpb24ocHJvbWlzZSkge1xuICAgICAgaWYgKHByb21pc2UuX29uZXJyb3IpIHtcbiAgICAgICAgcHJvbWlzZS5fb25lcnJvcihwcm9taXNlLl9yZXN1bHQpO1xuICAgICAgfVxuXG4gICAgICAkJCRpbnRlcm5hbCQkcHVibGlzaChwcm9taXNlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB2YWx1ZSkge1xuICAgICAgaWYgKHByb21pc2UuX3N0YXRlICE9PSAkJCRpbnRlcm5hbCQkUEVORElORykgeyByZXR1cm47IH1cblxuICAgICAgcHJvbWlzZS5fcmVzdWx0ID0gdmFsdWU7XG4gICAgICBwcm9taXNlLl9zdGF0ZSA9ICQkJGludGVybmFsJCRGVUxGSUxMRUQ7XG5cbiAgICAgIGlmIChwcm9taXNlLl9zdWJzY3JpYmVycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgaWYgKCQkcnN2cCRjb25maWckJGNvbmZpZy5pbnN0cnVtZW50KSB7XG4gICAgICAgICAgJCRpbnN0cnVtZW50JCRkZWZhdWx0KCdmdWxmaWxsZWQnLCBwcm9taXNlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJCRyc3ZwJGNvbmZpZyQkY29uZmlnLmFzeW5jKCQkJGludGVybmFsJCRwdWJsaXNoLCBwcm9taXNlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbikge1xuICAgICAgaWYgKHByb21pc2UuX3N0YXRlICE9PSAkJCRpbnRlcm5hbCQkUEVORElORykgeyByZXR1cm47IH1cbiAgICAgIHByb21pc2UuX3N0YXRlID0gJCQkaW50ZXJuYWwkJFJFSkVDVEVEO1xuICAgICAgcHJvbWlzZS5fcmVzdWx0ID0gcmVhc29uO1xuXG4gICAgICAkJHJzdnAkY29uZmlnJCRjb25maWcuYXN5bmMoJCQkaW50ZXJuYWwkJHB1Ymxpc2hSZWplY3Rpb24sIHByb21pc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRzdWJzY3JpYmUocGFyZW50LCBjaGlsZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pIHtcbiAgICAgIHZhciBzdWJzY3JpYmVycyA9IHBhcmVudC5fc3Vic2NyaWJlcnM7XG4gICAgICB2YXIgbGVuZ3RoID0gc3Vic2NyaWJlcnMubGVuZ3RoO1xuXG4gICAgICBwYXJlbnQuX29uZXJyb3IgPSBudWxsO1xuXG4gICAgICBzdWJzY3JpYmVyc1tsZW5ndGhdID0gY2hpbGQ7XG4gICAgICBzdWJzY3JpYmVyc1tsZW5ndGggKyAkJCRpbnRlcm5hbCQkRlVMRklMTEVEXSA9IG9uRnVsZmlsbG1lbnQ7XG4gICAgICBzdWJzY3JpYmVyc1tsZW5ndGggKyAkJCRpbnRlcm5hbCQkUkVKRUNURURdICA9IG9uUmVqZWN0aW9uO1xuXG4gICAgICBpZiAobGVuZ3RoID09PSAwICYmIHBhcmVudC5fc3RhdGUpIHtcbiAgICAgICAgJCRyc3ZwJGNvbmZpZyQkY29uZmlnLmFzeW5jKCQkJGludGVybmFsJCRwdWJsaXNoLCBwYXJlbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRwdWJsaXNoKHByb21pc2UpIHtcbiAgICAgIHZhciBzdWJzY3JpYmVycyA9IHByb21pc2UuX3N1YnNjcmliZXJzO1xuICAgICAgdmFyIHNldHRsZWQgPSBwcm9taXNlLl9zdGF0ZTtcblxuICAgICAgaWYgKCQkcnN2cCRjb25maWckJGNvbmZpZy5pbnN0cnVtZW50KSB7XG4gICAgICAgICQkaW5zdHJ1bWVudCQkZGVmYXVsdChzZXR0bGVkID09PSAkJCRpbnRlcm5hbCQkRlVMRklMTEVEID8gJ2Z1bGZpbGxlZCcgOiAncmVqZWN0ZWQnLCBwcm9taXNlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN1YnNjcmliZXJzLmxlbmd0aCA9PT0gMCkgeyByZXR1cm47IH1cblxuICAgICAgdmFyIGNoaWxkLCBjYWxsYmFjaywgZGV0YWlsID0gcHJvbWlzZS5fcmVzdWx0O1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN1YnNjcmliZXJzLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgICAgIGNoaWxkID0gc3Vic2NyaWJlcnNbaV07XG4gICAgICAgIGNhbGxiYWNrID0gc3Vic2NyaWJlcnNbaSArIHNldHRsZWRdO1xuXG4gICAgICAgIGlmIChjaGlsZCkge1xuICAgICAgICAgICQkJGludGVybmFsJCRpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBjaGlsZCwgY2FsbGJhY2ssIGRldGFpbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FsbGJhY2soZGV0YWlsKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBwcm9taXNlLl9zdWJzY3JpYmVycy5sZW5ndGggPSAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRFcnJvck9iamVjdCgpIHtcbiAgICAgIHRoaXMuZXJyb3IgPSBudWxsO1xuICAgIH1cblxuICAgIHZhciAkJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SID0gbmV3ICQkJGludGVybmFsJCRFcnJvck9iamVjdCgpO1xuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJHRyeUNhdGNoKGNhbGxiYWNrLCBkZXRhaWwpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjayhkZXRhaWwpO1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICQkJGludGVybmFsJCRUUllfQ0FUQ0hfRVJST1IuZXJyb3IgPSBlO1xuICAgICAgICByZXR1cm4gJCQkaW50ZXJuYWwkJFRSWV9DQVRDSF9FUlJPUjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkaW52b2tlQ2FsbGJhY2soc2V0dGxlZCwgcHJvbWlzZSwgY2FsbGJhY2ssIGRldGFpbCkge1xuICAgICAgdmFyIGhhc0NhbGxiYWNrID0gJCR1dGlscyQkaXNGdW5jdGlvbihjYWxsYmFjayksXG4gICAgICAgICAgdmFsdWUsIGVycm9yLCBzdWNjZWVkZWQsIGZhaWxlZDtcblxuICAgICAgaWYgKGhhc0NhbGxiYWNrKSB7XG4gICAgICAgIHZhbHVlID0gJCQkaW50ZXJuYWwkJHRyeUNhdGNoKGNhbGxiYWNrLCBkZXRhaWwpO1xuXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gJCQkaW50ZXJuYWwkJFRSWV9DQVRDSF9FUlJPUikge1xuICAgICAgICAgIGZhaWxlZCA9IHRydWU7XG4gICAgICAgICAgZXJyb3IgPSB2YWx1ZS5lcnJvcjtcbiAgICAgICAgICB2YWx1ZSA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3VjY2VlZGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9taXNlID09PSB2YWx1ZSkge1xuICAgICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgbmV3IFR5cGVFcnJvcignQSBwcm9taXNlcyBjYWxsYmFjayBjYW5ub3QgcmV0dXJuIHRoYXQgc2FtZSBwcm9taXNlLicpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBkZXRhaWw7XG4gICAgICAgIHN1Y2NlZWRlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gJCQkaW50ZXJuYWwkJFBFTkRJTkcpIHtcbiAgICAgICAgLy8gbm9vcFxuICAgICAgfSBlbHNlIGlmIChoYXNDYWxsYmFjayAmJiBzdWNjZWVkZWQpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChmYWlsZWQpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBlcnJvcik7XG4gICAgICB9IGVsc2UgaWYgKHNldHRsZWQgPT09ICQkJGludGVybmFsJCRGVUxGSUxMRUQpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChzZXR0bGVkID09PSAkJCRpbnRlcm5hbCQkUkVKRUNURUQpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJGluaXRpYWxpemVQcm9taXNlKHByb21pc2UsIHJlc29sdmVyKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXNvbHZlcihmdW5jdGlvbiByZXNvbHZlUHJvbWlzZSh2YWx1ZSl7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICB9LCBmdW5jdGlvbiByZWplY3RQcm9taXNlKHJlYXNvbikge1xuICAgICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJGVudW1lcmF0b3IkJG1ha2VTZXR0bGVkUmVzdWx0KHN0YXRlLCBwb3NpdGlvbiwgdmFsdWUpIHtcbiAgICAgIGlmIChzdGF0ZSA9PT0gJCQkaW50ZXJuYWwkJEZVTEZJTExFRCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN0YXRlOiAnZnVsZmlsbGVkJyxcbiAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3RhdGU6ICdyZWplY3RlZCcsXG4gICAgICAgICAgcmVhc29uOiB2YWx1ZVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkZW51bWVyYXRvciQkRW51bWVyYXRvcihDb25zdHJ1Y3RvciwgaW5wdXQsIGFib3J0T25SZWplY3QsIGxhYmVsKSB7XG4gICAgICB0aGlzLl9pbnN0YW5jZUNvbnN0cnVjdG9yID0gQ29uc3RydWN0b3I7XG4gICAgICB0aGlzLnByb21pc2UgPSBuZXcgQ29uc3RydWN0b3IoJCQkaW50ZXJuYWwkJG5vb3AsIGxhYmVsKTtcbiAgICAgIHRoaXMuX2Fib3J0T25SZWplY3QgPSBhYm9ydE9uUmVqZWN0O1xuXG4gICAgICBpZiAodGhpcy5fdmFsaWRhdGVJbnB1dChpbnB1dCkpIHtcbiAgICAgICAgdGhpcy5faW5wdXQgICAgID0gaW5wdXQ7XG4gICAgICAgIHRoaXMubGVuZ3RoICAgICA9IGlucHV0Lmxlbmd0aDtcbiAgICAgICAgdGhpcy5fcmVtYWluaW5nID0gaW5wdXQubGVuZ3RoO1xuXG4gICAgICAgIHRoaXMuX2luaXQoKTtcblxuICAgICAgICBpZiAodGhpcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkZnVsZmlsbCh0aGlzLnByb21pc2UsIHRoaXMuX3Jlc3VsdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5sZW5ndGggPSB0aGlzLmxlbmd0aCB8fCAwO1xuICAgICAgICAgIHRoaXMuX2VudW1lcmF0ZSgpO1xuICAgICAgICAgIGlmICh0aGlzLl9yZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICAgICQkJGludGVybmFsJCRmdWxmaWxsKHRoaXMucHJvbWlzZSwgdGhpcy5fcmVzdWx0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQkJGludGVybmFsJCRyZWplY3QodGhpcy5wcm9taXNlLCB0aGlzLl92YWxpZGF0aW9uRXJyb3IoKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgJCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fdmFsaWRhdGVJbnB1dCA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICByZXR1cm4gJCR1dGlscyQkaXNBcnJheShpbnB1dCk7XG4gICAgfTtcblxuICAgICQkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX3ZhbGlkYXRpb25FcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyBFcnJvcignQXJyYXkgTWV0aG9kcyBtdXN0IGJlIHByb3ZpZGVkIGFuIEFycmF5Jyk7XG4gICAgfTtcblxuICAgICQkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX3Jlc3VsdCA9IG5ldyBBcnJheSh0aGlzLmxlbmd0aCk7XG4gICAgfTtcblxuICAgIHZhciAkJGVudW1lcmF0b3IkJGRlZmF1bHQgPSAkJGVudW1lcmF0b3IkJEVudW1lcmF0b3I7XG5cbiAgICAkJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl9lbnVtZXJhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBsZW5ndGggID0gdGhpcy5sZW5ndGg7XG4gICAgICB2YXIgcHJvbWlzZSA9IHRoaXMucHJvbWlzZTtcbiAgICAgIHZhciBpbnB1dCAgID0gdGhpcy5faW5wdXQ7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBwcm9taXNlLl9zdGF0ZSA9PT0gJCQkaW50ZXJuYWwkJFBFTkRJTkcgJiYgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMuX2VhY2hFbnRyeShpbnB1dFtpXSwgaSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgICQkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX2VhY2hFbnRyeSA9IGZ1bmN0aW9uKGVudHJ5LCBpKSB7XG4gICAgICB2YXIgYyA9IHRoaXMuX2luc3RhbmNlQ29uc3RydWN0b3I7XG4gICAgICBpZiAoJCR1dGlscyQkaXNNYXliZVRoZW5hYmxlKGVudHJ5KSkge1xuICAgICAgICBpZiAoZW50cnkuY29uc3RydWN0b3IgPT09IGMgJiYgZW50cnkuX3N0YXRlICE9PSAkJCRpbnRlcm5hbCQkUEVORElORykge1xuICAgICAgICAgIGVudHJ5Ll9vbmVycm9yID0gbnVsbDtcbiAgICAgICAgICB0aGlzLl9zZXR0bGVkQXQoZW50cnkuX3N0YXRlLCBpLCBlbnRyeS5fcmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl93aWxsU2V0dGxlQXQoYy5yZXNvbHZlKGVudHJ5KSwgaSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3JlbWFpbmluZy0tO1xuICAgICAgICB0aGlzLl9yZXN1bHRbaV0gPSB0aGlzLl9tYWtlUmVzdWx0KCQkJGludGVybmFsJCRGVUxGSUxMRUQsIGksIGVudHJ5KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgJCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fc2V0dGxlZEF0ID0gZnVuY3Rpb24oc3RhdGUsIGksIHZhbHVlKSB7XG4gICAgICB2YXIgcHJvbWlzZSA9IHRoaXMucHJvbWlzZTtcblxuICAgICAgaWYgKHByb21pc2UuX3N0YXRlID09PSAkJCRpbnRlcm5hbCQkUEVORElORykge1xuICAgICAgICB0aGlzLl9yZW1haW5pbmctLTtcblxuICAgICAgICBpZiAodGhpcy5fYWJvcnRPblJlamVjdCAmJiBzdGF0ZSA9PT0gJCQkaW50ZXJuYWwkJFJFSkVDVEVEKSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fcmVzdWx0W2ldID0gdGhpcy5fbWFrZVJlc3VsdChzdGF0ZSwgaSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9yZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdGhpcy5fcmVzdWx0KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgJCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fbWFrZVJlc3VsdCA9IGZ1bmN0aW9uKHN0YXRlLCBpLCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH07XG5cbiAgICAkJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl93aWxsU2V0dGxlQXQgPSBmdW5jdGlvbihwcm9taXNlLCBpKSB7XG4gICAgICB2YXIgZW51bWVyYXRvciA9IHRoaXM7XG5cbiAgICAgICQkJGludGVybmFsJCRzdWJzY3JpYmUocHJvbWlzZSwgdW5kZWZpbmVkLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBlbnVtZXJhdG9yLl9zZXR0bGVkQXQoJCQkaW50ZXJuYWwkJEZVTEZJTExFRCwgaSwgdmFsdWUpO1xuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgIGVudW1lcmF0b3IuX3NldHRsZWRBdCgkJCRpbnRlcm5hbCQkUkVKRUNURUQsIGksIHJlYXNvbik7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdmFyICQkcHJvbWlzZSRhbGwkJGRlZmF1bHQgPSBmdW5jdGlvbiBhbGwoZW50cmllcywgbGFiZWwpIHtcbiAgICAgIHJldHVybiBuZXcgJCRlbnVtZXJhdG9yJCRkZWZhdWx0KHRoaXMsIGVudHJpZXMsIHRydWUgLyogYWJvcnQgb24gcmVqZWN0ICovLCBsYWJlbCkucHJvbWlzZTtcbiAgICB9O1xuXG4gICAgdmFyICQkcHJvbWlzZSRyYWNlJCRkZWZhdWx0ID0gZnVuY3Rpb24gcmFjZShlbnRyaWVzLCBsYWJlbCkge1xuICAgICAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgICAgIHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG5cbiAgICAgIHZhciBwcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKCQkJGludGVybmFsJCRub29wLCBsYWJlbCk7XG5cbiAgICAgIGlmICghJCR1dGlscyQkaXNBcnJheShlbnRyaWVzKSkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIG5ldyBUeXBlRXJyb3IoJ1lvdSBtdXN0IHBhc3MgYW4gYXJyYXkgdG8gcmFjZS4nKSk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgfVxuXG4gICAgICB2YXIgbGVuZ3RoID0gZW50cmllcy5sZW5ndGg7XG5cbiAgICAgIGZ1bmN0aW9uIG9uRnVsZmlsbG1lbnQodmFsdWUpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBvblJlamVjdGlvbihyZWFzb24pIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgcHJvbWlzZS5fc3RhdGUgPT09ICQkJGludGVybmFsJCRQRU5ESU5HICYmIGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAkJCRpbnRlcm5hbCQkc3Vic2NyaWJlKENvbnN0cnVjdG9yLnJlc29sdmUoZW50cmllc1tpXSksIHVuZGVmaW5lZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9O1xuXG4gICAgdmFyICQkcHJvbWlzZSRyZXNvbHZlJCRkZWZhdWx0ID0gZnVuY3Rpb24gcmVzb2x2ZShvYmplY3QsIGxhYmVsKSB7XG4gICAgICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICAgICAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcblxuICAgICAgaWYgKG9iamVjdCAmJiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JyAmJiBvYmplY3QuY29uc3RydWN0b3IgPT09IENvbnN0cnVjdG9yKSB7XG4gICAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgICB9XG5cbiAgICAgIHZhciBwcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKCQkJGludGVybmFsJCRub29wLCBsYWJlbCk7XG4gICAgICAkJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCBvYmplY3QpO1xuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfTtcblxuICAgIHZhciAkJHByb21pc2UkcmVqZWN0JCRkZWZhdWx0ID0gZnVuY3Rpb24gcmVqZWN0KHJlYXNvbiwgbGFiZWwpIHtcbiAgICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gICAgICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuICAgICAgdmFyIHByb21pc2UgPSBuZXcgQ29uc3RydWN0b3IoJCQkaW50ZXJuYWwkJG5vb3AsIGxhYmVsKTtcbiAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH07XG5cbiAgICB2YXIgJCRyc3ZwJHByb21pc2UkJGd1aWRLZXkgPSAncnN2cF8nICsgJCR1dGlscyQkbm93KCkgKyAnLSc7XG4gICAgdmFyICQkcnN2cCRwcm9taXNlJCRjb3VudGVyID0gMDtcblxuICAgIGZ1bmN0aW9uICQkcnN2cCRwcm9taXNlJCRuZWVkc1Jlc29sdmVyKCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignWW91IG11c3QgcGFzcyBhIHJlc29sdmVyIGZ1bmN0aW9uIGFzIHRoZSBmaXJzdCBhcmd1bWVudCB0byB0aGUgcHJvbWlzZSBjb25zdHJ1Y3RvcicpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkcnN2cCRwcm9taXNlJCRuZWVkc05ldygpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJGYWlsZWQgdG8gY29uc3RydWN0ICdQcm9taXNlJzogUGxlYXNlIHVzZSB0aGUgJ25ldycgb3BlcmF0b3IsIHRoaXMgb2JqZWN0IGNvbnN0cnVjdG9yIGNhbm5vdCBiZSBjYWxsZWQgYXMgYSBmdW5jdGlvbi5cIik7XG4gICAgfVxuXG4gICAgdmFyICQkcnN2cCRwcm9taXNlJCRkZWZhdWx0ID0gJCRyc3ZwJHByb21pc2UkJFByb21pc2U7XG5cbiAgICAvKipcbiAgICAgIFByb21pc2Ugb2JqZWN0cyByZXByZXNlbnQgdGhlIGV2ZW50dWFsIHJlc3VsdCBvZiBhbiBhc3luY2hyb25vdXMgb3BlcmF0aW9uLiBUaGVcbiAgICAgIHByaW1hcnkgd2F5IG9mIGludGVyYWN0aW5nIHdpdGggYSBwcm9taXNlIGlzIHRocm91Z2ggaXRzIGB0aGVuYCBtZXRob2QsIHdoaWNoXG4gICAgICByZWdpc3RlcnMgY2FsbGJhY2tzIHRvIHJlY2VpdmUgZWl0aGVyIGEgcHJvbWlzZeKAmXMgZXZlbnR1YWwgdmFsdWUgb3IgdGhlIHJlYXNvblxuICAgICAgd2h5IHRoZSBwcm9taXNlIGNhbm5vdCBiZSBmdWxmaWxsZWQuXG5cbiAgICAgIFRlcm1pbm9sb2d5XG4gICAgICAtLS0tLS0tLS0tLVxuXG4gICAgICAtIGBwcm9taXNlYCBpcyBhbiBvYmplY3Qgb3IgZnVuY3Rpb24gd2l0aCBhIGB0aGVuYCBtZXRob2Qgd2hvc2UgYmVoYXZpb3IgY29uZm9ybXMgdG8gdGhpcyBzcGVjaWZpY2F0aW9uLlxuICAgICAgLSBgdGhlbmFibGVgIGlzIGFuIG9iamVjdCBvciBmdW5jdGlvbiB0aGF0IGRlZmluZXMgYSBgdGhlbmAgbWV0aG9kLlxuICAgICAgLSBgdmFsdWVgIGlzIGFueSBsZWdhbCBKYXZhU2NyaXB0IHZhbHVlIChpbmNsdWRpbmcgdW5kZWZpbmVkLCBhIHRoZW5hYmxlLCBvciBhIHByb21pc2UpLlxuICAgICAgLSBgZXhjZXB0aW9uYCBpcyBhIHZhbHVlIHRoYXQgaXMgdGhyb3duIHVzaW5nIHRoZSB0aHJvdyBzdGF0ZW1lbnQuXG4gICAgICAtIGByZWFzb25gIGlzIGEgdmFsdWUgdGhhdCBpbmRpY2F0ZXMgd2h5IGEgcHJvbWlzZSB3YXMgcmVqZWN0ZWQuXG4gICAgICAtIGBzZXR0bGVkYCB0aGUgZmluYWwgcmVzdGluZyBzdGF0ZSBvZiBhIHByb21pc2UsIGZ1bGZpbGxlZCBvciByZWplY3RlZC5cblxuICAgICAgQSBwcm9taXNlIGNhbiBiZSBpbiBvbmUgb2YgdGhyZWUgc3RhdGVzOiBwZW5kaW5nLCBmdWxmaWxsZWQsIG9yIHJlamVjdGVkLlxuXG4gICAgICBQcm9taXNlcyB0aGF0IGFyZSBmdWxmaWxsZWQgaGF2ZSBhIGZ1bGZpbGxtZW50IHZhbHVlIGFuZCBhcmUgaW4gdGhlIGZ1bGZpbGxlZFxuICAgICAgc3RhdGUuICBQcm9taXNlcyB0aGF0IGFyZSByZWplY3RlZCBoYXZlIGEgcmVqZWN0aW9uIHJlYXNvbiBhbmQgYXJlIGluIHRoZVxuICAgICAgcmVqZWN0ZWQgc3RhdGUuICBBIGZ1bGZpbGxtZW50IHZhbHVlIGlzIG5ldmVyIGEgdGhlbmFibGUuXG5cbiAgICAgIFByb21pc2VzIGNhbiBhbHNvIGJlIHNhaWQgdG8gKnJlc29sdmUqIGEgdmFsdWUuICBJZiB0aGlzIHZhbHVlIGlzIGFsc28gYVxuICAgICAgcHJvbWlzZSwgdGhlbiB0aGUgb3JpZ2luYWwgcHJvbWlzZSdzIHNldHRsZWQgc3RhdGUgd2lsbCBtYXRjaCB0aGUgdmFsdWUnc1xuICAgICAgc2V0dGxlZCBzdGF0ZS4gIFNvIGEgcHJvbWlzZSB0aGF0ICpyZXNvbHZlcyogYSBwcm9taXNlIHRoYXQgcmVqZWN0cyB3aWxsXG4gICAgICBpdHNlbGYgcmVqZWN0LCBhbmQgYSBwcm9taXNlIHRoYXQgKnJlc29sdmVzKiBhIHByb21pc2UgdGhhdCBmdWxmaWxscyB3aWxsXG4gICAgICBpdHNlbGYgZnVsZmlsbC5cblxuXG4gICAgICBCYXNpYyBVc2FnZTpcbiAgICAgIC0tLS0tLS0tLS0tLVxuXG4gICAgICBgYGBqc1xuICAgICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgLy8gb24gc3VjY2Vzc1xuICAgICAgICByZXNvbHZlKHZhbHVlKTtcblxuICAgICAgICAvLyBvbiBmYWlsdXJlXG4gICAgICAgIHJlamVjdChyZWFzb24pO1xuICAgICAgfSk7XG5cbiAgICAgIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAvLyBvbiBmdWxmaWxsbWVudFxuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgIC8vIG9uIHJlamVjdGlvblxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQWR2YW5jZWQgVXNhZ2U6XG4gICAgICAtLS0tLS0tLS0tLS0tLS1cblxuICAgICAgUHJvbWlzZXMgc2hpbmUgd2hlbiBhYnN0cmFjdGluZyBhd2F5IGFzeW5jaHJvbm91cyBpbnRlcmFjdGlvbnMgc3VjaCBhc1xuICAgICAgYFhNTEh0dHBSZXF1ZXN0YHMuXG5cbiAgICAgIGBgYGpzXG4gICAgICBmdW5jdGlvbiBnZXRKU09OKHVybCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICAgICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgICAgICB4aHIub3BlbignR0VUJywgdXJsKTtcbiAgICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gaGFuZGxlcjtcbiAgICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2pzb24nO1xuICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgIHhoci5zZW5kKCk7XG5cbiAgICAgICAgICBmdW5jdGlvbiBoYW5kbGVyKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PT0gdGhpcy5ET05FKSB7XG4gICAgICAgICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdnZXRKU09OOiBgJyArIHVybCArICdgIGZhaWxlZCB3aXRoIHN0YXR1czogWycgKyB0aGlzLnN0YXR1cyArICddJykpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGdldEpTT04oJy9wb3N0cy5qc29uJykudGhlbihmdW5jdGlvbihqc29uKSB7XG4gICAgICAgIC8vIG9uIGZ1bGZpbGxtZW50XG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgLy8gb24gcmVqZWN0aW9uXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBVbmxpa2UgY2FsbGJhY2tzLCBwcm9taXNlcyBhcmUgZ3JlYXQgY29tcG9zYWJsZSBwcmltaXRpdmVzLlxuXG4gICAgICBgYGBqc1xuICAgICAgUHJvbWlzZS5hbGwoW1xuICAgICAgICBnZXRKU09OKCcvcG9zdHMnKSxcbiAgICAgICAgZ2V0SlNPTignL2NvbW1lbnRzJylcbiAgICAgIF0pLnRoZW4oZnVuY3Rpb24odmFsdWVzKXtcbiAgICAgICAgdmFsdWVzWzBdIC8vID0+IHBvc3RzSlNPTlxuICAgICAgICB2YWx1ZXNbMV0gLy8gPT4gY29tbWVudHNKU09OXG5cbiAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEBjbGFzcyBSU1ZQLlByb21pc2VcbiAgICAgIEBwYXJhbSB7ZnVuY3Rpb259IHJlc29sdmVyXG4gICAgICBAcGFyYW0ge1N0cmluZ30gbGFiZWwgb3B0aW9uYWwgc3RyaW5nIGZvciBsYWJlbGluZyB0aGUgcHJvbWlzZS5cbiAgICAgIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgICAgIEBjb25zdHJ1Y3RvclxuICAgICovXG4gICAgZnVuY3Rpb24gJCRyc3ZwJHByb21pc2UkJFByb21pc2UocmVzb2x2ZXIsIGxhYmVsKSB7XG4gICAgICB0aGlzLl9pZCA9ICQkcnN2cCRwcm9taXNlJCRjb3VudGVyKys7XG4gICAgICB0aGlzLl9sYWJlbCA9IGxhYmVsO1xuICAgICAgdGhpcy5fc3RhdGUgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLl9yZXN1bHQgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVycyA9IFtdO1xuXG4gICAgICBpZiAoJCRyc3ZwJGNvbmZpZyQkY29uZmlnLmluc3RydW1lbnQpIHtcbiAgICAgICAgJCRpbnN0cnVtZW50JCRkZWZhdWx0KCdjcmVhdGVkJywgdGhpcyk7XG4gICAgICB9XG5cbiAgICAgIGlmICgkJCRpbnRlcm5hbCQkbm9vcCAhPT0gcmVzb2x2ZXIpIHtcbiAgICAgICAgaWYgKCEkJHV0aWxzJCRpc0Z1bmN0aW9uKHJlc29sdmVyKSkge1xuICAgICAgICAgICQkcnN2cCRwcm9taXNlJCRuZWVkc1Jlc29sdmVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgJCRyc3ZwJHByb21pc2UkJFByb21pc2UpKSB7XG4gICAgICAgICAgJCRyc3ZwJHByb21pc2UkJG5lZWRzTmV3KCk7XG4gICAgICAgIH1cblxuICAgICAgICAkJCRpbnRlcm5hbCQkaW5pdGlhbGl6ZVByb21pc2UodGhpcywgcmVzb2x2ZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGRlcHJlY2F0ZWRcbiAgICAkJHJzdnAkcHJvbWlzZSQkUHJvbWlzZS5jYXN0ID0gJCRwcm9taXNlJHJlc29sdmUkJGRlZmF1bHQ7XG5cbiAgICAkJHJzdnAkcHJvbWlzZSQkUHJvbWlzZS5hbGwgPSAkJHByb21pc2UkYWxsJCRkZWZhdWx0O1xuICAgICQkcnN2cCRwcm9taXNlJCRQcm9taXNlLnJhY2UgPSAkJHByb21pc2UkcmFjZSQkZGVmYXVsdDtcbiAgICAkJHJzdnAkcHJvbWlzZSQkUHJvbWlzZS5yZXNvbHZlID0gJCRwcm9taXNlJHJlc29sdmUkJGRlZmF1bHQ7XG4gICAgJCRyc3ZwJHByb21pc2UkJFByb21pc2UucmVqZWN0ID0gJCRwcm9taXNlJHJlamVjdCQkZGVmYXVsdDtcblxuICAgICQkcnN2cCRwcm9taXNlJCRQcm9taXNlLnByb3RvdHlwZSA9IHtcbiAgICAgIGNvbnN0cnVjdG9yOiAkJHJzdnAkcHJvbWlzZSQkUHJvbWlzZSxcblxuICAgICAgX2d1aWRLZXk6ICQkcnN2cCRwcm9taXNlJCRndWlkS2V5LFxuXG4gICAgICBfb25lcnJvcjogZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAkJHJzdnAkY29uZmlnJCRjb25maWcudHJpZ2dlcignZXJyb3InLCByZWFzb24pO1xuICAgICAgfSxcblxuICAgIC8qKlxuICAgICAgVGhlIHByaW1hcnkgd2F5IG9mIGludGVyYWN0aW5nIHdpdGggYSBwcm9taXNlIGlzIHRocm91Z2ggaXRzIGB0aGVuYCBtZXRob2QsXG4gICAgICB3aGljaCByZWdpc3RlcnMgY2FsbGJhY2tzIHRvIHJlY2VpdmUgZWl0aGVyIGEgcHJvbWlzZSdzIGV2ZW50dWFsIHZhbHVlIG9yIHRoZVxuICAgICAgcmVhc29uIHdoeSB0aGUgcHJvbWlzZSBjYW5ub3QgYmUgZnVsZmlsbGVkLlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAvLyB1c2VyIGlzIGF2YWlsYWJsZVxuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gdXNlciBpcyB1bmF2YWlsYWJsZSwgYW5kIHlvdSBhcmUgZ2l2ZW4gdGhlIHJlYXNvbiB3aHlcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIENoYWluaW5nXG4gICAgICAtLS0tLS0tLVxuXG4gICAgICBUaGUgcmV0dXJuIHZhbHVlIG9mIGB0aGVuYCBpcyBpdHNlbGYgYSBwcm9taXNlLiAgVGhpcyBzZWNvbmQsICdkb3duc3RyZWFtJ1xuICAgICAgcHJvbWlzZSBpcyByZXNvbHZlZCB3aXRoIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGZpcnN0IHByb21pc2UncyBmdWxmaWxsbWVudFxuICAgICAgb3IgcmVqZWN0aW9uIGhhbmRsZXIsIG9yIHJlamVjdGVkIGlmIHRoZSBoYW5kbGVyIHRocm93cyBhbiBleGNlcHRpb24uXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgcmV0dXJuIHVzZXIubmFtZTtcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgcmV0dXJuICdkZWZhdWx0IG5hbWUnO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAodXNlck5hbWUpIHtcbiAgICAgICAgLy8gSWYgYGZpbmRVc2VyYCBmdWxmaWxsZWQsIGB1c2VyTmFtZWAgd2lsbCBiZSB0aGUgdXNlcidzIG5hbWUsIG90aGVyd2lzZSBpdFxuICAgICAgICAvLyB3aWxsIGJlIGAnZGVmYXVsdCBuYW1lJ2BcbiAgICAgIH0pO1xuXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGb3VuZCB1c2VyLCBidXQgc3RpbGwgdW5oYXBweScpO1xuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2BmaW5kVXNlcmAgcmVqZWN0ZWQgYW5kIHdlJ3JlIHVuaGFwcHknKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgLy8gaWYgYGZpbmRVc2VyYCBmdWxmaWxsZWQsIGByZWFzb25gIHdpbGwgYmUgJ0ZvdW5kIHVzZXIsIGJ1dCBzdGlsbCB1bmhhcHB5Jy5cbiAgICAgICAgLy8gSWYgYGZpbmRVc2VyYCByZWplY3RlZCwgYHJlYXNvbmAgd2lsbCBiZSAnYGZpbmRVc2VyYCByZWplY3RlZCBhbmQgd2UncmUgdW5oYXBweScuXG4gICAgICB9KTtcbiAgICAgIGBgYFxuICAgICAgSWYgdGhlIGRvd25zdHJlYW0gcHJvbWlzZSBkb2VzIG5vdCBzcGVjaWZ5IGEgcmVqZWN0aW9uIGhhbmRsZXIsIHJlamVjdGlvbiByZWFzb25zIHdpbGwgYmUgcHJvcGFnYXRlZCBmdXJ0aGVyIGRvd25zdHJlYW0uXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFBlZGFnb2dpY2FsRXhjZXB0aW9uKCdVcHN0cmVhbSBlcnJvcicpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgLy8gbmV2ZXIgcmVhY2hlZFxuICAgICAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgLy8gbmV2ZXIgcmVhY2hlZFxuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAvLyBUaGUgYFBlZGdhZ29jaWFsRXhjZXB0aW9uYCBpcyBwcm9wYWdhdGVkIGFsbCB0aGUgd2F5IGRvd24gdG8gaGVyZVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQXNzaW1pbGF0aW9uXG4gICAgICAtLS0tLS0tLS0tLS1cblxuICAgICAgU29tZXRpbWVzIHRoZSB2YWx1ZSB5b3Ugd2FudCB0byBwcm9wYWdhdGUgdG8gYSBkb3duc3RyZWFtIHByb21pc2UgY2FuIG9ubHkgYmVcbiAgICAgIHJldHJpZXZlZCBhc3luY2hyb25vdXNseS4gVGhpcyBjYW4gYmUgYWNoaWV2ZWQgYnkgcmV0dXJuaW5nIGEgcHJvbWlzZSBpbiB0aGVcbiAgICAgIGZ1bGZpbGxtZW50IG9yIHJlamVjdGlvbiBoYW5kbGVyLiBUaGUgZG93bnN0cmVhbSBwcm9taXNlIHdpbGwgdGhlbiBiZSBwZW5kaW5nXG4gICAgICB1bnRpbCB0aGUgcmV0dXJuZWQgcHJvbWlzZSBpcyBzZXR0bGVkLiBUaGlzIGlzIGNhbGxlZCAqYXNzaW1pbGF0aW9uKi5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICByZXR1cm4gZmluZENvbW1lbnRzQnlBdXRob3IodXNlcik7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uIChjb21tZW50cykge1xuICAgICAgICAvLyBUaGUgdXNlcidzIGNvbW1lbnRzIGFyZSBub3cgYXZhaWxhYmxlXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBJZiB0aGUgYXNzaW1saWF0ZWQgcHJvbWlzZSByZWplY3RzLCB0aGVuIHRoZSBkb3duc3RyZWFtIHByb21pc2Ugd2lsbCBhbHNvIHJlamVjdC5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICByZXR1cm4gZmluZENvbW1lbnRzQnlBdXRob3IodXNlcik7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uIChjb21tZW50cykge1xuICAgICAgICAvLyBJZiBgZmluZENvbW1lbnRzQnlBdXRob3JgIGZ1bGZpbGxzLCB3ZSdsbCBoYXZlIHRoZSB2YWx1ZSBoZXJlXG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vIElmIGBmaW5kQ29tbWVudHNCeUF1dGhvcmAgcmVqZWN0cywgd2UnbGwgaGF2ZSB0aGUgcmVhc29uIGhlcmVcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIFNpbXBsZSBFeGFtcGxlXG4gICAgICAtLS0tLS0tLS0tLS0tLVxuXG4gICAgICBTeW5jaHJvbm91cyBFeGFtcGxlXG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIHZhciByZXN1bHQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHJlc3VsdCA9IGZpbmRSZXN1bHQoKTtcbiAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgfVxuICAgICAgYGBgXG5cbiAgICAgIEVycmJhY2sgRXhhbXBsZVxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFJlc3VsdChmdW5jdGlvbihyZXN1bHQsIGVycil7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAvLyBmYWlsdXJlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBQcm9taXNlIEV4YW1wbGU7XG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIGZpbmRSZXN1bHQoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XG4gICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAgIC8vIGZhaWx1cmVcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEFkdmFuY2VkIEV4YW1wbGVcbiAgICAgIC0tLS0tLS0tLS0tLS0tXG5cbiAgICAgIFN5bmNocm9ub3VzIEV4YW1wbGVcblxuICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgdmFyIGF1dGhvciwgYm9va3M7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGF1dGhvciA9IGZpbmRBdXRob3IoKTtcbiAgICAgICAgYm9va3MgID0gZmluZEJvb2tzQnlBdXRob3IoYXV0aG9yKTtcbiAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgfVxuICAgICAgYGBgXG5cbiAgICAgIEVycmJhY2sgRXhhbXBsZVxuXG4gICAgICBgYGBqc1xuXG4gICAgICBmdW5jdGlvbiBmb3VuZEJvb2tzKGJvb2tzKSB7XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZmFpbHVyZShyZWFzb24pIHtcblxuICAgICAgfVxuXG4gICAgICBmaW5kQXV0aG9yKGZ1bmN0aW9uKGF1dGhvciwgZXJyKXtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGZhaWx1cmUoZXJyKTtcbiAgICAgICAgICAvLyBmYWlsdXJlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZpbmRCb29va3NCeUF1dGhvcihhdXRob3IsIGZ1bmN0aW9uKGJvb2tzLCBlcnIpIHtcbiAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGZhaWx1cmUoZXJyKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgZm91bmRCb29rcyhib29rcyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICAgIGZhaWx1cmUocmVhc29uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgICAgIGZhaWx1cmUoZXJyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBQcm9taXNlIEV4YW1wbGU7XG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIGZpbmRBdXRob3IoKS5cbiAgICAgICAgdGhlbihmaW5kQm9va3NCeUF1dGhvcikuXG4gICAgICAgIHRoZW4oZnVuY3Rpb24oYm9va3Mpe1xuICAgICAgICAgIC8vIGZvdW5kIGJvb2tzXG4gICAgICB9KS5jYXRjaChmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQG1ldGhvZCB0aGVuXG4gICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBvbkZ1bGZpbGxlZFxuICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gb25SZWplY3RlZFxuICAgICAgQHBhcmFtIHtTdHJpbmd9IGxhYmVsIG9wdGlvbmFsIHN0cmluZyBmb3IgbGFiZWxpbmcgdGhlIHByb21pc2UuXG4gICAgICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gICAgICBAcmV0dXJuIHtQcm9taXNlfVxuICAgICovXG4gICAgICB0aGVuOiBmdW5jdGlvbihvbkZ1bGZpbGxtZW50LCBvblJlamVjdGlvbiwgbGFiZWwpIHtcbiAgICAgICAgdmFyIHBhcmVudCA9IHRoaXM7XG4gICAgICAgIHZhciBzdGF0ZSA9IHBhcmVudC5fc3RhdGU7XG5cbiAgICAgICAgaWYgKHN0YXRlID09PSAkJCRpbnRlcm5hbCQkRlVMRklMTEVEICYmICFvbkZ1bGZpbGxtZW50IHx8IHN0YXRlID09PSAkJCRpbnRlcm5hbCQkUkVKRUNURUQgJiYgIW9uUmVqZWN0aW9uKSB7XG4gICAgICAgICAgaWYgKCQkcnN2cCRjb25maWckJGNvbmZpZy5pbnN0cnVtZW50KSB7XG4gICAgICAgICAgICAkJGluc3RydW1lbnQkJGRlZmF1bHQoJ2NoYWluZWQnLCB0aGlzLCB0aGlzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBwYXJlbnQuX29uZXJyb3IgPSBudWxsO1xuXG4gICAgICAgIHZhciBjaGlsZCA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKCQkJGludGVybmFsJCRub29wLCBsYWJlbCk7XG4gICAgICAgIHZhciByZXN1bHQgPSBwYXJlbnQuX3Jlc3VsdDtcblxuICAgICAgICBpZiAoJCRyc3ZwJGNvbmZpZyQkY29uZmlnLmluc3RydW1lbnQpIHtcbiAgICAgICAgICAkJGluc3RydW1lbnQkJGRlZmF1bHQoJ2NoYWluZWQnLCBwYXJlbnQsIGNoaWxkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdGF0ZSkge1xuICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3VtZW50c1tzdGF0ZSAtIDFdO1xuICAgICAgICAgICQkcnN2cCRjb25maWckJGNvbmZpZy5hc3luYyhmdW5jdGlvbigpe1xuICAgICAgICAgICAgJCQkaW50ZXJuYWwkJGludm9rZUNhbGxiYWNrKHN0YXRlLCBjaGlsZCwgY2FsbGJhY2ssIHJlc3VsdCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJHN1YnNjcmliZShwYXJlbnQsIGNoaWxkLCBvbkZ1bGZpbGxtZW50LCBvblJlamVjdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICB9LFxuXG4gICAgLyoqXG4gICAgICBgY2F0Y2hgIGlzIHNpbXBseSBzdWdhciBmb3IgYHRoZW4odW5kZWZpbmVkLCBvblJlamVjdGlvbilgIHdoaWNoIG1ha2VzIGl0IHRoZSBzYW1lXG4gICAgICBhcyB0aGUgY2F0Y2ggYmxvY2sgb2YgYSB0cnkvY2F0Y2ggc3RhdGVtZW50LlxuXG4gICAgICBgYGBqc1xuICAgICAgZnVuY3Rpb24gZmluZEF1dGhvcigpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkbid0IGZpbmQgdGhhdCBhdXRob3InKTtcbiAgICAgIH1cblxuICAgICAgLy8gc3luY2hyb25vdXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGZpbmRBdXRob3IoKTtcbiAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nXG4gICAgICB9XG5cbiAgICAgIC8vIGFzeW5jIHdpdGggcHJvbWlzZXNcbiAgICAgIGZpbmRBdXRob3IoKS5jYXRjaChmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQG1ldGhvZCBjYXRjaFxuICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gb25SZWplY3Rpb25cbiAgICAgIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCBvcHRpb25hbCBzdHJpbmcgZm9yIGxhYmVsaW5nIHRoZSBwcm9taXNlLlxuICAgICAgVXNlZnVsIGZvciB0b29saW5nLlxuICAgICAgQHJldHVybiB7UHJvbWlzZX1cbiAgICAqL1xuICAgICAgJ2NhdGNoJzogZnVuY3Rpb24ob25SZWplY3Rpb24sIGxhYmVsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRoZW4obnVsbCwgb25SZWplY3Rpb24sIGxhYmVsKTtcbiAgICAgIH0sXG5cbiAgICAvKipcbiAgICAgIGBmaW5hbGx5YCB3aWxsIGJlIGludm9rZWQgcmVnYXJkbGVzcyBvZiB0aGUgcHJvbWlzZSdzIGZhdGUganVzdCBhcyBuYXRpdmVcbiAgICAgIHRyeS9jYXRjaC9maW5hbGx5IGJlaGF2ZXNcblxuICAgICAgU3luY2hyb25vdXMgZXhhbXBsZTpcblxuICAgICAgYGBganNcbiAgICAgIGZpbmRBdXRob3IoKSB7XG4gICAgICAgIGlmIChNYXRoLnJhbmRvbSgpID4gMC41KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBBdXRob3IoKTtcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGZpbmRBdXRob3IoKTsgLy8gc3VjY2VlZCBvciBmYWlsXG4gICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBmaW5kT3RoZXJBdXRoZXIoKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIC8vIGFsd2F5cyBydW5zXG4gICAgICAgIC8vIGRvZXNuJ3QgYWZmZWN0IHRoZSByZXR1cm4gdmFsdWVcbiAgICAgIH1cbiAgICAgIGBgYFxuXG4gICAgICBBc3luY2hyb25vdXMgZXhhbXBsZTpcblxuICAgICAgYGBganNcbiAgICAgIGZpbmRBdXRob3IoKS5jYXRjaChmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICByZXR1cm4gZmluZE90aGVyQXV0aGVyKCk7XG4gICAgICB9KS5maW5hbGx5KGZ1bmN0aW9uKCl7XG4gICAgICAgIC8vIGF1dGhvciB3YXMgZWl0aGVyIGZvdW5kLCBvciBub3RcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEBtZXRob2QgZmluYWxseVxuICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAgICAgIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCBvcHRpb25hbCBzdHJpbmcgZm9yIGxhYmVsaW5nIHRoZSBwcm9taXNlLlxuICAgICAgVXNlZnVsIGZvciB0b29saW5nLlxuICAgICAgQHJldHVybiB7UHJvbWlzZX1cbiAgICAqL1xuICAgICAgJ2ZpbmFsbHknOiBmdW5jdGlvbihjYWxsYmFjaywgbGFiZWwpIHtcbiAgICAgICAgdmFyIGNvbnN0cnVjdG9yID0gdGhpcy5jb25zdHJ1Y3RvcjtcblxuICAgICAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnN0cnVjdG9yLnJlc29sdmUoY2FsbGJhY2soKSkudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgICByZXR1cm4gY29uc3RydWN0b3IucmVzb2x2ZShjYWxsYmFjaygpKS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB0aHJvdyByZWFzb247XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIGxhYmVsKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJG5vZGUkJFJlc3VsdCgpIHtcbiAgICAgIHRoaXMudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgdmFyICQkcnN2cCRub2RlJCRFUlJPUiA9IG5ldyAkJHJzdnAkbm9kZSQkUmVzdWx0KCk7XG4gICAgdmFyICQkcnN2cCRub2RlJCRHRVRfVEhFTl9FUlJPUiA9IG5ldyAkJHJzdnAkbm9kZSQkUmVzdWx0KCk7XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkbm9kZSQkZ2V0VGhlbihvYmopIHtcbiAgICAgIHRyeSB7XG4gICAgICAgcmV0dXJuIG9iai50aGVuO1xuICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICAkJHJzdnAkbm9kZSQkRVJST1IudmFsdWU9IGVycm9yO1xuICAgICAgICByZXR1cm4gJCRyc3ZwJG5vZGUkJEVSUk9SO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkcnN2cCRub2RlJCR0cnlBcHBseShmLCBzLCBhKSB7XG4gICAgICB0cnkge1xuICAgICAgICBmLmFwcGx5KHMsIGEpO1xuICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICAkJHJzdnAkbm9kZSQkRVJST1IudmFsdWUgPSBlcnJvcjtcbiAgICAgICAgcmV0dXJuICQkcnN2cCRub2RlJCRFUlJPUjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkbm9kZSQkbWFrZU9iamVjdChfLCBhcmd1bWVudE5hbWVzKSB7XG4gICAgICB2YXIgb2JqID0ge307XG4gICAgICB2YXIgbmFtZTtcbiAgICAgIHZhciBpO1xuICAgICAgdmFyIGxlbmd0aCA9IF8ubGVuZ3RoO1xuICAgICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkobGVuZ3RoKTtcblxuICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCBsZW5ndGg7IHgrKykge1xuICAgICAgICBhcmdzW3hdID0gX1t4XTtcbiAgICAgIH1cblxuICAgICAgZm9yIChpID0gMDsgaSA8IGFyZ3VtZW50TmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbmFtZSA9IGFyZ3VtZW50TmFtZXNbaV07XG4gICAgICAgIG9ialtuYW1lXSA9IGFyZ3NbaSArIDFdO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkcnN2cCRub2RlJCRhcnJheVJlc3VsdChfKSB7XG4gICAgICB2YXIgbGVuZ3RoID0gXy5sZW5ndGg7XG4gICAgICB2YXIgYXJncyA9IG5ldyBBcnJheShsZW5ndGggLSAxKTtcblxuICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBhcmdzW2kgLSAxXSA9IF9baV07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBhcmdzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkcnN2cCRub2RlJCR3cmFwVGhlbmFibGUodGhlbiwgcHJvbWlzZSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGhlbjogZnVuY3Rpb24ob25GdWxGaWxsbWVudCwgb25SZWplY3Rpb24pIHtcbiAgICAgICAgICByZXR1cm4gdGhlbi5jYWxsKHByb21pc2UsIG9uRnVsRmlsbG1lbnQsIG9uUmVqZWN0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgJCRyc3ZwJG5vZGUkJGRlZmF1bHQgPSBmdW5jdGlvbiBkZW5vZGVpZnkobm9kZUZ1bmMsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBmbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBsID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkobCArIDEpO1xuICAgICAgICB2YXIgYXJnO1xuICAgICAgICB2YXIgcHJvbWlzZUlucHV0ID0gZmFsc2U7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyArK2kpIHtcbiAgICAgICAgICBhcmcgPSBhcmd1bWVudHNbaV07XG5cbiAgICAgICAgICBpZiAoIXByb21pc2VJbnB1dCkge1xuICAgICAgICAgICAgLy8gVE9ETzogY2xlYW4gdGhpcyB1cFxuICAgICAgICAgICAgcHJvbWlzZUlucHV0ID0gJCRyc3ZwJG5vZGUkJG5lZWRzUHJvbWlzZUlucHV0KGFyZyk7XG4gICAgICAgICAgICBpZiAocHJvbWlzZUlucHV0ID09PSAkJHJzdnAkbm9kZSQkR0VUX1RIRU5fRVJST1IpIHtcbiAgICAgICAgICAgICAgdmFyIHAgPSBuZXcgJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQoJCQkaW50ZXJuYWwkJG5vb3ApO1xuICAgICAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHAsICQkcnN2cCRub2RlJCRHRVRfVEhFTl9FUlJPUi52YWx1ZSk7XG4gICAgICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwcm9taXNlSW5wdXQgJiYgcHJvbWlzZUlucHV0ICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgIGFyZyA9ICQkcnN2cCRub2RlJCR3cmFwVGhlbmFibGUocHJvbWlzZUlucHV0LCBhcmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBhcmdzW2ldID0gYXJnO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHByb21pc2UgPSBuZXcgJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQoJCQkaW50ZXJuYWwkJG5vb3ApO1xuXG4gICAgICAgIGFyZ3NbbF0gPSBmdW5jdGlvbihlcnIsIHZhbCkge1xuICAgICAgICAgIGlmIChlcnIpXG4gICAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGVycik7XG4gICAgICAgICAgZWxzZSBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgJCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsKTtcbiAgICAgICAgICBlbHNlIGlmIChvcHRpb25zID09PSB0cnVlKVxuICAgICAgICAgICAgJCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgJCRyc3ZwJG5vZGUkJGFycmF5UmVzdWx0KGFyZ3VtZW50cykpO1xuICAgICAgICAgIGVsc2UgaWYgKCQkdXRpbHMkJGlzQXJyYXkob3B0aW9ucykpXG4gICAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCAkJHJzdnAkbm9kZSQkbWFrZU9iamVjdChhcmd1bWVudHMsIG9wdGlvbnMpKTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWwpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChwcm9taXNlSW5wdXQpIHtcbiAgICAgICAgICByZXR1cm4gJCRyc3ZwJG5vZGUkJGhhbmRsZVByb21pc2VJbnB1dChwcm9taXNlLCBhcmdzLCBub2RlRnVuYywgc2VsZik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuICQkcnN2cCRub2RlJCRoYW5kbGVWYWx1ZUlucHV0KHByb21pc2UsIGFyZ3MsIG5vZGVGdW5jLCBzZWxmKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgZm4uX19wcm90b19fID0gbm9kZUZ1bmM7XG5cbiAgICAgIHJldHVybiBmbjtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJG5vZGUkJGhhbmRsZVZhbHVlSW5wdXQocHJvbWlzZSwgYXJncywgbm9kZUZ1bmMsIHNlbGYpIHtcbiAgICAgIHZhciByZXN1bHQgPSAkJHJzdnAkbm9kZSQkdHJ5QXBwbHkobm9kZUZ1bmMsIHNlbGYsIGFyZ3MpO1xuICAgICAgaWYgKHJlc3VsdCA9PT0gJCRyc3ZwJG5vZGUkJEVSUk9SKSB7XG4gICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVzdWx0LnZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkcnN2cCRub2RlJCRoYW5kbGVQcm9taXNlSW5wdXQocHJvbWlzZSwgYXJncywgbm9kZUZ1bmMsIHNlbGYpe1xuICAgICAgcmV0dXJuICQkcnN2cCRwcm9taXNlJCRkZWZhdWx0LmFsbChhcmdzKS50aGVuKGZ1bmN0aW9uKGFyZ3Mpe1xuICAgICAgICB2YXIgcmVzdWx0ID0gJCRyc3ZwJG5vZGUkJHRyeUFwcGx5KG5vZGVGdW5jLCBzZWxmLCBhcmdzKTtcbiAgICAgICAgaWYgKHJlc3VsdCA9PT0gJCRyc3ZwJG5vZGUkJEVSUk9SKSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZXN1bHQudmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJG5vZGUkJG5lZWRzUHJvbWlzZUlucHV0KGFyZykge1xuICAgICAgaWYgKGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0Jykge1xuICAgICAgICBpZiAoYXJnLmNvbnN0cnVjdG9yID09PSAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdCkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiAkJHJzdnAkbm9kZSQkZ2V0VGhlbihhcmcpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyICQkcnN2cCRhbGwkJGRlZmF1bHQgPSBmdW5jdGlvbiBhbGwoYXJyYXksIGxhYmVsKSB7XG4gICAgICByZXR1cm4gJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQuYWxsKGFycmF5LCBsYWJlbCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uICQkcnN2cCRhbGwkc2V0dGxlZCQkQWxsU2V0dGxlZChDb25zdHJ1Y3RvciwgZW50cmllcywgbGFiZWwpIHtcbiAgICAgIHRoaXMuX3N1cGVyQ29uc3RydWN0b3IoQ29uc3RydWN0b3IsIGVudHJpZXMsIGZhbHNlIC8qIGRvbid0IGFib3J0IG9uIHJlamVjdCAqLywgbGFiZWwpO1xuICAgIH1cblxuICAgICQkcnN2cCRhbGwkc2V0dGxlZCQkQWxsU2V0dGxlZC5wcm90b3R5cGUgPSAkJHV0aWxzJCRvX2NyZWF0ZSgkJGVudW1lcmF0b3IkJGRlZmF1bHQucHJvdG90eXBlKTtcbiAgICAkJHJzdnAkYWxsJHNldHRsZWQkJEFsbFNldHRsZWQucHJvdG90eXBlLl9zdXBlckNvbnN0cnVjdG9yID0gJCRlbnVtZXJhdG9yJCRkZWZhdWx0O1xuICAgICQkcnN2cCRhbGwkc2V0dGxlZCQkQWxsU2V0dGxlZC5wcm90b3R5cGUuX21ha2VSZXN1bHQgPSAkJGVudW1lcmF0b3IkJG1ha2VTZXR0bGVkUmVzdWx0O1xuXG4gICAgJCRyc3ZwJGFsbCRzZXR0bGVkJCRBbGxTZXR0bGVkLnByb3RvdHlwZS5fdmFsaWRhdGlvbkVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IEVycm9yKCdhbGxTZXR0bGVkIG11c3QgYmUgY2FsbGVkIHdpdGggYW4gYXJyYXknKTtcbiAgICB9O1xuXG4gICAgdmFyICQkcnN2cCRhbGwkc2V0dGxlZCQkZGVmYXVsdCA9IGZ1bmN0aW9uIGFsbFNldHRsZWQoZW50cmllcywgbGFiZWwpIHtcbiAgICAgIHJldHVybiBuZXcgJCRyc3ZwJGFsbCRzZXR0bGVkJCRBbGxTZXR0bGVkKCQkcnN2cCRwcm9taXNlJCRkZWZhdWx0LCBlbnRyaWVzLCBsYWJlbCkucHJvbWlzZTtcbiAgICB9O1xuXG4gICAgdmFyICQkcnN2cCRyYWNlJCRkZWZhdWx0ID0gZnVuY3Rpb24gcmFjZShhcnJheSwgbGFiZWwpIHtcbiAgICAgIHJldHVybiAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdC5yYWNlKGFycmF5LCBsYWJlbCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uICQkcHJvbWlzZSRoYXNoJCRQcm9taXNlSGFzaChDb25zdHJ1Y3Rvciwgb2JqZWN0LCBsYWJlbCkge1xuICAgICAgdGhpcy5fc3VwZXJDb25zdHJ1Y3RvcihDb25zdHJ1Y3Rvciwgb2JqZWN0LCB0cnVlLCBsYWJlbCk7XG4gICAgfVxuXG4gICAgdmFyICQkcHJvbWlzZSRoYXNoJCRkZWZhdWx0ID0gJCRwcm9taXNlJGhhc2gkJFByb21pc2VIYXNoO1xuICAgICQkcHJvbWlzZSRoYXNoJCRQcm9taXNlSGFzaC5wcm90b3R5cGUgPSAkJHV0aWxzJCRvX2NyZWF0ZSgkJGVudW1lcmF0b3IkJGRlZmF1bHQucHJvdG90eXBlKTtcbiAgICAkJHByb21pc2UkaGFzaCQkUHJvbWlzZUhhc2gucHJvdG90eXBlLl9zdXBlckNvbnN0cnVjdG9yID0gJCRlbnVtZXJhdG9yJCRkZWZhdWx0O1xuXG4gICAgJCRwcm9taXNlJGhhc2gkJFByb21pc2VIYXNoLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fcmVzdWx0ID0ge307XG4gICAgfTtcblxuICAgICQkcHJvbWlzZSRoYXNoJCRQcm9taXNlSGFzaC5wcm90b3R5cGUuX3ZhbGlkYXRlSW5wdXQgPSBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgcmV0dXJuIGlucHV0ICYmIHR5cGVvZiBpbnB1dCA9PT0gJ29iamVjdCc7XG4gICAgfTtcblxuICAgICQkcHJvbWlzZSRoYXNoJCRQcm9taXNlSGFzaC5wcm90b3R5cGUuX3ZhbGlkYXRpb25FcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyBFcnJvcignUHJvbWlzZS5oYXNoIG11c3QgYmUgY2FsbGVkIHdpdGggYW4gb2JqZWN0Jyk7XG4gICAgfTtcblxuICAgICQkcHJvbWlzZSRoYXNoJCRQcm9taXNlSGFzaC5wcm90b3R5cGUuX2VudW1lcmF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHByb21pc2UgPSB0aGlzLnByb21pc2U7XG4gICAgICB2YXIgaW5wdXQgICA9IHRoaXMuX2lucHV0O1xuICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcblxuICAgICAgZm9yICh2YXIga2V5IGluIGlucHV0KSB7XG4gICAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSA9PT0gJCQkaW50ZXJuYWwkJFBFTkRJTkcgJiYgaW5wdXQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICAgICAgICBwb3NpdGlvbjoga2V5LFxuICAgICAgICAgICAgZW50cnk6IGlucHV0W2tleV1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgbGVuZ3RoID0gcmVzdWx0cy5sZW5ndGg7XG4gICAgICB0aGlzLl9yZW1haW5pbmcgPSBsZW5ndGg7XG4gICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgcHJvbWlzZS5fc3RhdGUgPT09ICQkJGludGVybmFsJCRQRU5ESU5HICYmIGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICByZXN1bHQgPSByZXN1bHRzW2ldO1xuICAgICAgICB0aGlzLl9lYWNoRW50cnkocmVzdWx0LmVudHJ5LCByZXN1bHQucG9zaXRpb24pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgJCRyc3ZwJGhhc2gkJGRlZmF1bHQgPSBmdW5jdGlvbiBoYXNoKG9iamVjdCwgbGFiZWwpIHtcbiAgICAgIHJldHVybiBuZXcgJCRwcm9taXNlJGhhc2gkJGRlZmF1bHQoJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQsIG9iamVjdCwgbGFiZWwpLnByb21pc2U7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uICQkcnN2cCRoYXNoJHNldHRsZWQkJEhhc2hTZXR0bGVkKENvbnN0cnVjdG9yLCBvYmplY3QsIGxhYmVsKSB7XG4gICAgICB0aGlzLl9zdXBlckNvbnN0cnVjdG9yKENvbnN0cnVjdG9yLCBvYmplY3QsIGZhbHNlLCBsYWJlbCk7XG4gICAgfVxuXG4gICAgJCRyc3ZwJGhhc2gkc2V0dGxlZCQkSGFzaFNldHRsZWQucHJvdG90eXBlID0gJCR1dGlscyQkb19jcmVhdGUoJCRwcm9taXNlJGhhc2gkJGRlZmF1bHQucHJvdG90eXBlKTtcbiAgICAkJHJzdnAkaGFzaCRzZXR0bGVkJCRIYXNoU2V0dGxlZC5wcm90b3R5cGUuX3N1cGVyQ29uc3RydWN0b3IgPSAkJGVudW1lcmF0b3IkJGRlZmF1bHQ7XG4gICAgJCRyc3ZwJGhhc2gkc2V0dGxlZCQkSGFzaFNldHRsZWQucHJvdG90eXBlLl9tYWtlUmVzdWx0ID0gJCRlbnVtZXJhdG9yJCRtYWtlU2V0dGxlZFJlc3VsdDtcblxuICAgICQkcnN2cCRoYXNoJHNldHRsZWQkJEhhc2hTZXR0bGVkLnByb3RvdHlwZS5fdmFsaWRhdGlvbkVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IEVycm9yKCdoYXNoU2V0dGxlZCBtdXN0IGJlIGNhbGxlZCB3aXRoIGFuIG9iamVjdCcpO1xuICAgIH07XG5cbiAgICB2YXIgJCRyc3ZwJGhhc2gkc2V0dGxlZCQkZGVmYXVsdCA9IGZ1bmN0aW9uIGhhc2hTZXR0bGVkKG9iamVjdCwgbGFiZWwpIHtcbiAgICAgIHJldHVybiBuZXcgJCRyc3ZwJGhhc2gkc2V0dGxlZCQkSGFzaFNldHRsZWQoJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQsIG9iamVjdCwgbGFiZWwpLnByb21pc2U7XG4gICAgfTtcblxuICAgIHZhciAkJHJzdnAkcmV0aHJvdyQkZGVmYXVsdCA9IGZ1bmN0aW9uIHJldGhyb3cocmVhc29uKSB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICB0aHJvdyByZWFzb247XG4gICAgICB9KTtcbiAgICAgIHRocm93IHJlYXNvbjtcbiAgICB9O1xuXG4gICAgdmFyICQkcnN2cCRkZWZlciQkZGVmYXVsdCA9IGZ1bmN0aW9uIGRlZmVyKGxhYmVsKSB7XG4gICAgICB2YXIgZGVmZXJyZWQgPSB7IH07XG5cbiAgICAgIGRlZmVycmVkLnByb21pc2UgPSBuZXcgJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QgPSByZWplY3Q7XG4gICAgICB9LCBsYWJlbCk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZDtcbiAgICB9O1xuXG4gICAgdmFyICQkcnN2cCRtYXAkJGRlZmF1bHQgPSBmdW5jdGlvbiBtYXAocHJvbWlzZXMsIG1hcEZuLCBsYWJlbCkge1xuICAgICAgcmV0dXJuICQkcnN2cCRwcm9taXNlJCRkZWZhdWx0LmFsbChwcm9taXNlcywgbGFiZWwpLnRoZW4oZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgIGlmICghJCR1dGlscyQkaXNGdW5jdGlvbihtYXBGbikpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiWW91IG11c3QgcGFzcyBhIGZ1bmN0aW9uIGFzIG1hcCdzIHNlY29uZCBhcmd1bWVudC5cIik7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGVuZ3RoID0gdmFsdWVzLmxlbmd0aDtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBuZXcgQXJyYXkobGVuZ3RoKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgcmVzdWx0c1tpXSA9IG1hcEZuKHZhbHVlc1tpXSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQuYWxsKHJlc3VsdHMsIGxhYmVsKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgJCRyc3ZwJHJlc29sdmUkJGRlZmF1bHQgPSBmdW5jdGlvbiByZXNvbHZlKHZhbHVlLCBsYWJlbCkge1xuICAgICAgcmV0dXJuICQkcnN2cCRwcm9taXNlJCRkZWZhdWx0LnJlc29sdmUodmFsdWUsIGxhYmVsKTtcbiAgICB9O1xuXG4gICAgdmFyICQkcnN2cCRyZWplY3QkJGRlZmF1bHQgPSBmdW5jdGlvbiByZWplY3QocmVhc29uLCBsYWJlbCkge1xuICAgICAgcmV0dXJuICQkcnN2cCRwcm9taXNlJCRkZWZhdWx0LnJlamVjdChyZWFzb24sIGxhYmVsKTtcbiAgICB9O1xuXG4gICAgdmFyICQkcnN2cCRmaWx0ZXIkJGRlZmF1bHQgPSBmdW5jdGlvbiBmaWx0ZXIocHJvbWlzZXMsIGZpbHRlckZuLCBsYWJlbCkge1xuICAgICAgcmV0dXJuICQkcnN2cCRwcm9taXNlJCRkZWZhdWx0LmFsbChwcm9taXNlcywgbGFiZWwpLnRoZW4oZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgIGlmICghJCR1dGlscyQkaXNGdW5jdGlvbihmaWx0ZXJGbikpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiWW91IG11c3QgcGFzcyBhIGZ1bmN0aW9uIGFzIGZpbHRlcidzIHNlY29uZCBhcmd1bWVudC5cIik7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGVuZ3RoID0gdmFsdWVzLmxlbmd0aDtcbiAgICAgICAgdmFyIGZpbHRlcmVkID0gbmV3IEFycmF5KGxlbmd0aCk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgIGZpbHRlcmVkW2ldID0gZmlsdGVyRm4odmFsdWVzW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdC5hbGwoZmlsdGVyZWQsIGxhYmVsKS50aGVuKGZ1bmN0aW9uKGZpbHRlcmVkKSB7XG4gICAgICAgICAgdmFyIHJlc3VsdHMgPSBuZXcgQXJyYXkobGVuZ3RoKTtcbiAgICAgICAgICB2YXIgbmV3TGVuZ3RoID0gMDtcblxuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChmaWx0ZXJlZFtpXSkge1xuICAgICAgICAgICAgICByZXN1bHRzW25ld0xlbmd0aF0gPSB2YWx1ZXNbaV07XG4gICAgICAgICAgICAgIG5ld0xlbmd0aCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlc3VsdHMubGVuZ3RoID0gbmV3TGVuZ3RoO1xuXG4gICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHZhciAkJHJzdnAkYXNhcCQkbGVuID0gMDtcblxuICAgIHZhciAkJHJzdnAkYXNhcCQkZGVmYXVsdCA9IGZ1bmN0aW9uIGFzYXAoY2FsbGJhY2ssIGFyZykge1xuICAgICAgJCRyc3ZwJGFzYXAkJHF1ZXVlWyQkcnN2cCRhc2FwJCRsZW5dID0gY2FsbGJhY2s7XG4gICAgICAkJHJzdnAkYXNhcCQkcXVldWVbJCRyc3ZwJGFzYXAkJGxlbiArIDFdID0gYXJnO1xuICAgICAgJCRyc3ZwJGFzYXAkJGxlbiArPSAyO1xuICAgICAgaWYgKCQkcnN2cCRhc2FwJCRsZW4gPT09IDIpIHtcbiAgICAgICAgLy8gSWYgbGVuIGlzIDEsIHRoYXQgbWVhbnMgdGhhdCB3ZSBuZWVkIHRvIHNjaGVkdWxlIGFuIGFzeW5jIGZsdXNoLlxuICAgICAgICAvLyBJZiBhZGRpdGlvbmFsIGNhbGxiYWNrcyBhcmUgcXVldWVkIGJlZm9yZSB0aGUgcXVldWUgaXMgZmx1c2hlZCwgdGhleVxuICAgICAgICAvLyB3aWxsIGJlIHByb2Nlc3NlZCBieSB0aGlzIGZsdXNoIHRoYXQgd2UgYXJlIHNjaGVkdWxpbmcuXG4gICAgICAgICQkcnN2cCRhc2FwJCRzY2hlZHVsZUZsdXNoKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciAkJHJzdnAkYXNhcCQkYnJvd3Nlckdsb2JhbCA9ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykgPyB3aW5kb3cgOiB7fTtcbiAgICB2YXIgJCRyc3ZwJGFzYXAkJEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyID0gJCRyc3ZwJGFzYXAkJGJyb3dzZXJHbG9iYWwuTXV0YXRpb25PYnNlcnZlciB8fCAkJHJzdnAkYXNhcCQkYnJvd3Nlckdsb2JhbC5XZWJLaXRNdXRhdGlvbk9ic2VydmVyO1xuXG4gICAgLy8gdGVzdCBmb3Igd2ViIHdvcmtlciBidXQgbm90IGluIElFMTBcbiAgICB2YXIgJCRyc3ZwJGFzYXAkJGlzV29ya2VyID0gdHlwZW9mIFVpbnQ4Q2xhbXBlZEFycmF5ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgdHlwZW9mIGltcG9ydFNjcmlwdHMgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICB0eXBlb2YgTWVzc2FnZUNoYW5uZWwgIT09ICd1bmRlZmluZWQnO1xuXG4gICAgLy8gbm9kZVxuICAgIGZ1bmN0aW9uICQkcnN2cCRhc2FwJCR1c2VOZXh0VGljaygpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljaygkJHJzdnAkYXNhcCQkZmx1c2gpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkYXNhcCQkdXNlTXV0YXRpb25PYnNlcnZlcigpIHtcbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIHZhciBvYnNlcnZlciA9IG5ldyAkJHJzdnAkYXNhcCQkQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIoJCRyc3ZwJGFzYXAkJGZsdXNoKTtcbiAgICAgIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpO1xuICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShub2RlLCB7IGNoYXJhY3RlckRhdGE6IHRydWUgfSk7XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgbm9kZS5kYXRhID0gKGl0ZXJhdGlvbnMgPSArK2l0ZXJhdGlvbnMgJSAyKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gd2ViIHdvcmtlclxuICAgIGZ1bmN0aW9uICQkcnN2cCRhc2FwJCR1c2VNZXNzYWdlQ2hhbm5lbCgpIHtcbiAgICAgIHZhciBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4gICAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9ICQkcnN2cCRhc2FwJCRmbHVzaDtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNoYW5uZWwucG9ydDIucG9zdE1lc3NhZ2UoMCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkcnN2cCRhc2FwJCR1c2VTZXRUaW1lb3V0KCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBzZXRUaW1lb3V0KCQkcnN2cCRhc2FwJCRmbHVzaCwgMSk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHZhciAkJHJzdnAkYXNhcCQkcXVldWUgPSBuZXcgQXJyYXkoMTAwMCk7XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkYXNhcCQkZmx1c2goKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8ICQkcnN2cCRhc2FwJCRsZW47IGkrPTIpIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gJCRyc3ZwJGFzYXAkJHF1ZXVlW2ldO1xuICAgICAgICB2YXIgYXJnID0gJCRyc3ZwJGFzYXAkJHF1ZXVlW2krMV07XG5cbiAgICAgICAgY2FsbGJhY2soYXJnKTtcblxuICAgICAgICAkJHJzdnAkYXNhcCQkcXVldWVbaV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICQkcnN2cCRhc2FwJCRxdWV1ZVtpKzFdID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICAkJHJzdnAkYXNhcCQkbGVuID0gMDtcbiAgICB9XG5cbiAgICB2YXIgJCRyc3ZwJGFzYXAkJHNjaGVkdWxlRmx1c2g7XG5cbiAgICAvLyBEZWNpZGUgd2hhdCBhc3luYyBtZXRob2QgdG8gdXNlIHRvIHRyaWdnZXJpbmcgcHJvY2Vzc2luZyBvZiBxdWV1ZWQgY2FsbGJhY2tzOlxuICAgIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYge30udG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nKSB7XG4gICAgICAkJHJzdnAkYXNhcCQkc2NoZWR1bGVGbHVzaCA9ICQkcnN2cCRhc2FwJCR1c2VOZXh0VGljaygpO1xuICAgIH0gZWxzZSBpZiAoJCRyc3ZwJGFzYXAkJEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICAkJHJzdnAkYXNhcCQkc2NoZWR1bGVGbHVzaCA9ICQkcnN2cCRhc2FwJCR1c2VNdXRhdGlvbk9ic2VydmVyKCk7XG4gICAgfSBlbHNlIGlmICgkJHJzdnAkYXNhcCQkaXNXb3JrZXIpIHtcbiAgICAgICQkcnN2cCRhc2FwJCRzY2hlZHVsZUZsdXNoID0gJCRyc3ZwJGFzYXAkJHVzZU1lc3NhZ2VDaGFubmVsKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICQkcnN2cCRhc2FwJCRzY2hlZHVsZUZsdXNoID0gJCRyc3ZwJGFzYXAkJHVzZVNldFRpbWVvdXQoKTtcbiAgICB9XG5cbiAgICAvLyBkZWZhdWx0IGFzeW5jIGlzIGFzYXA7XG4gICAgJCRyc3ZwJGNvbmZpZyQkY29uZmlnLmFzeW5jID0gJCRyc3ZwJGFzYXAkJGRlZmF1bHQ7XG5cbiAgICB2YXIgJCRyc3ZwJCRjYXN0ID0gJCRyc3ZwJHJlc29sdmUkJGRlZmF1bHQ7XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkJGFzeW5jKGNhbGxiYWNrLCBhcmcpIHtcbiAgICAgICQkcnN2cCRjb25maWckJGNvbmZpZy5hc3luYyhjYWxsYmFjaywgYXJnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkJG9uKCkge1xuICAgICAgJCRyc3ZwJGNvbmZpZyQkY29uZmlnLm9uLmFwcGx5KCQkcnN2cCRjb25maWckJGNvbmZpZywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkJG9mZigpIHtcbiAgICAgICQkcnN2cCRjb25maWckJGNvbmZpZy5vZmYuYXBwbHkoJCRyc3ZwJGNvbmZpZyQkY29uZmlnLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIC8vIFNldCB1cCBpbnN0cnVtZW50YXRpb24gdGhyb3VnaCBgd2luZG93Ll9fUFJPTUlTRV9JTlRSVU1FTlRBVElPTl9fYFxuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2Ygd2luZG93WydfX1BST01JU0VfSU5TVFJVTUVOVEFUSU9OX18nXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHZhciAkJHJzdnAkJGNhbGxiYWNrcyA9IHdpbmRvd1snX19QUk9NSVNFX0lOU1RSVU1FTlRBVElPTl9fJ107XG4gICAgICAkJHJzdnAkY29uZmlnJCRjb25maWd1cmUoJ2luc3RydW1lbnQnLCB0cnVlKTtcbiAgICAgIGZvciAodmFyICQkcnN2cCQkZXZlbnROYW1lIGluICQkcnN2cCQkY2FsbGJhY2tzKSB7XG4gICAgICAgIGlmICgkJHJzdnAkJGNhbGxiYWNrcy5oYXNPd25Qcm9wZXJ0eSgkJHJzdnAkJGV2ZW50TmFtZSkpIHtcbiAgICAgICAgICAkJHJzdnAkJG9uKCQkcnN2cCQkZXZlbnROYW1lLCAkJHJzdnAkJGNhbGxiYWNrc1skJHJzdnAkJGV2ZW50TmFtZV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHJzdnAkdW1kJCRSU1ZQID0ge1xuICAgICAgJ3JhY2UnOiAkJHJzdnAkcmFjZSQkZGVmYXVsdCxcbiAgICAgICdQcm9taXNlJzogJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQsXG4gICAgICAnYWxsU2V0dGxlZCc6ICQkcnN2cCRhbGwkc2V0dGxlZCQkZGVmYXVsdCxcbiAgICAgICdoYXNoJzogJCRyc3ZwJGhhc2gkJGRlZmF1bHQsXG4gICAgICAnaGFzaFNldHRsZWQnOiAkJHJzdnAkaGFzaCRzZXR0bGVkJCRkZWZhdWx0LFxuICAgICAgJ2Rlbm9kZWlmeSc6ICQkcnN2cCRub2RlJCRkZWZhdWx0LFxuICAgICAgJ29uJzogJCRyc3ZwJCRvbixcbiAgICAgICdvZmYnOiAkJHJzdnAkJG9mZixcbiAgICAgICdtYXAnOiAkJHJzdnAkbWFwJCRkZWZhdWx0LFxuICAgICAgJ2ZpbHRlcic6ICQkcnN2cCRmaWx0ZXIkJGRlZmF1bHQsXG4gICAgICAncmVzb2x2ZSc6ICQkcnN2cCRyZXNvbHZlJCRkZWZhdWx0LFxuICAgICAgJ3JlamVjdCc6ICQkcnN2cCRyZWplY3QkJGRlZmF1bHQsXG4gICAgICAnYWxsJzogJCRyc3ZwJGFsbCQkZGVmYXVsdCxcbiAgICAgICdyZXRocm93JzogJCRyc3ZwJHJldGhyb3ckJGRlZmF1bHQsXG4gICAgICAnZGVmZXInOiAkJHJzdnAkZGVmZXIkJGRlZmF1bHQsXG4gICAgICAnRXZlbnRUYXJnZXQnOiAkJHJzdnAkZXZlbnRzJCRkZWZhdWx0LFxuICAgICAgJ2NvbmZpZ3VyZSc6ICQkcnN2cCRjb25maWckJGNvbmZpZ3VyZSxcbiAgICAgICdhc3luYyc6ICQkcnN2cCQkYXN5bmNcbiAgICB9O1xuXG4gICAgLyogZ2xvYmFsIGRlZmluZTp0cnVlIG1vZHVsZTp0cnVlIHdpbmRvdzogdHJ1ZSAqL1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIHJzdnAkdW1kJCRSU1ZQOyB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICBtb2R1bGUuZXhwb3J0cyA9IHJzdnAkdW1kJCRSU1ZQO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzWydSU1ZQJ10gPSByc3ZwJHVtZCQkUlNWUDtcbiAgICB9XG59KS5jYWxsKHRoaXMpO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoJ19wcm9jZXNzJykpIl19
