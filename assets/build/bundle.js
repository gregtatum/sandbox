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
	
	window.location.hash = levelToLoad;
	
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
},{"./LevelLoader":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/LevelLoader.js","./levels":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/levels/index.js"}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/LevelLoader.js":[function(require,module,exports){
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
},{"./Poem":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/Poem.js","./levels":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/levels/index.js"}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/Poem.js":[function(require,module,exports){
var Stats = require('./vendor/Stats');
var EventDispatcher = require('./utils/EventDispatcher');
var Clock = require('./utils/Clock');
var Camera = require('./components/cameras/Camera');

var _renderer;

var Poem = function( level ) {

	this.ratio = window.devicePixelRatio >= 1 ? window.devicePixelRatio : 1;
	
	this.div = document.getElementById( 'container' );
	this.$div = $(this.div);
	this.canvas = null;
	this.scene = new THREE.Scene();
	this.requestedFrame = undefined;

	this.clock = new Clock();
	this.camera = new Camera( this, _.isObject( level.config.camera ) ? level.config.camera : {} );
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
},{"./components/cameras/Camera":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/components/cameras/Camera.js","./utils/Clock":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/Clock.js","./utils/EventDispatcher":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/EventDispatcher.js","./vendor/Stats":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/vendor/Stats.js"}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/components/Info.js":[function(require,module,exports){
var Info = function( poem, properties ) {
	
	if( properties.appendCredits ) $('.credits').append( properties.appendCredits );
	if( properties.title ) $("#info-title").text( properties.title );
	if( properties.subtitle ) $("#info-subtitle").text( properties.subtitle);
	
	if( properties.titleCss ) $("#info-title").css( properties.titleCss );
	if( properties.subtitleCss ) $("#info-subtitle").css( properties.subtitleCss );
	
	
	if( properties.documentTitle ) document.title = properties.documentTitle;
	
	if( properties.showArrowNext ) $(".arrow-next").show();

	$("#info").show();
	
};

module.exports = Info;
},{}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/components/Stars.js":[function(require,module,exports){
var Stars = function( poem ) {
	this.poem = poem;
	this.object = null;
	
	this.count = 30000;
	this.depth = 5000;
	this.minDepth = 700;
	this.color = 0xaaaaaa;
	
	this.addObject();
};

module.exports = Stars;

Stars.prototype = {
	
	generateGeometry : function() {
		var r, theta, x, y, z, geometry;
		
		geometry = new THREE.Geometry();
		
		for(var i=0; i < this.count; i++) {
			
			r = Math.random() * this.depth + this.minDepth;

			theta = Math.random() * 2 * Math.PI;
			
			x = Math.cos( theta ) * r;
			z = Math.sin( theta ) * r;
			y = (0.5 - Math.random()) * this.depth;
			
			geometry.vertices.push( new THREE.Vector3(x,y,z) );
					
		}
		
		return geometry;
	},
	
	addObject : function() {
		
		var geometry, lineMaterial;
		
		geometry = this.generateGeometry();
		
		
		this.object = new THREE.PointCloud(
			geometry,
			new THREE.PointCloudMaterial({
				 size: 3 * this.poem.ratio,
				 color: this.color,
				 fog: false
			}
		) );
		
		this.poem.scene.add( this.object ) ;
		
	}
};
},{}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/components/cameras/Camera.js":[function(require,module,exports){
var Camera = function( poem, properties ) {
	
	this.poem = poem;
			
	this.object = new THREE.PerspectiveCamera(
		properties.fov || 50,					// fov
		window.innerWidth / window.innerHeight,	// aspect ratio
		properties.near || 3,					// near frustum
		properties.far || 1000					// far frustum
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
},{}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/components/cameras/Controls.js":[function(require,module,exports){
var OrbitControls = require('../../vendor/OrbitControls');

var Controls = function( poem, properties ) {
	
	this.poem = poem;
	this.properties = properties;

	this.controls = new OrbitControls( this.poem.camera.object, this.poem.canvas );
	
	_.extend( this.controls, properties );
	
	this.poem.on( 'update', this.controls.update.bind( this.controls ) );
	
};

module.exports = Controls;

},{"../../vendor/OrbitControls":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/vendor/OrbitControls.js"}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/components/lights/TrackCameraLights.js":[function(require,module,exports){
var TrackCameraLights = function( poem, properties ) {
	
	this.lights = [];
	
	var ambient = new THREE.AmbientLight( 0x111111, 1, 0 );
		ambient.position.set(0, 2000, 1000);
	
	var front = new THREE.PointLight( 0xffffff, 0.3, 0 );

	var rightFill = new THREE.PointLight( 0xffffff, 1, 0 );
		rightFill.position.set(3000, 2000, 5000);
	
	var rimBottom = new THREE.PointLight( 0xffffff, 1, 0 );
		rimBottom.position.set(-1000, -1000, -1000);
		
	var rimBackLeft = new THREE.PointLight( 0xffffff, 2, 0 );
		rimBackLeft.position.set(-700, 500, -1000);
	
	poem.scene.add( ambient );
	// poem.camera.object.add( front );
	poem.camera.object.add( rightFill );
	poem.camera.object.add( rimBottom );
	poem.camera.object.add( rimBackLeft );
	
};

module.exports = TrackCameraLights;

TrackCameraLights.prototype = {

};
},{}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/components/utils/Stats.js":[function(require,module,exports){
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
},{"../../vendor/Stats":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/vendor/Stats.js"}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/demos/Earth.js":[function(require,module,exports){
var random = require('../utils/random')
  , loadTexture	= require('../utils/loadTexture')
  , RSVP = require('rsvp');

var Earth = function(poem, properties) {
	
	this.poem = poem;
	
	this.geometry = null;
	this.material = null;
    this.mesh = null;
	this.texture = null;
	
	$('#LevelSelect').hide();
	
	this.radius = properties.radius > 0 ? properties.radius : 250;

	var $a = $("<a href='http://svs.gsfc.nasa.gov/cgi-bin/details.cgi?aid=11719'></a>");
	$a.append( $("<img class='nasa-logo wide' src='assets/images/nasa-goddard.png' />") );
	$a.attr("title", "Map visualization credit to NASA's Goddard Space Flight Center");
	
	this.poem.$div.append( $a );
	
	this.start();
};

module.exports = Earth;

Earth.prototype = {
	
	start : function() {
		
		this.createTexture();

		this.geometry = new THREE.SphereGeometry( this.radius, 64, 64 );
		this.material = new THREE.MeshPhongMaterial({
			map: this.texture,
			shininess: 25,
			specular: 0x111111,
			// color: 0xff0000
		});
	
		this.mesh = new THREE.Mesh( this.geometry, this.material );
	
		this.poem.scene.add( this.mesh );
	
		this.poem.on( 'update', this.update.bind(this) );
		
	},
	
	createTexture : function() {
		
		this.video = document.createElement( 'video' );
		this.$video = $(this.video);

		// this.video.muted = true;
		this.video.controls = true;
		this.video.loop = true;
		
		// this.poem.$div.append( this.video );
		
		// this.$video.css({
		// 	position: "absolute",
		// 	top: 0,
		// 	left: 0
		// });
		
		// window.v = this.video;
		
		
		// video.id = 'video';
		// video.type = ' video/ogg; codecs="theora, vorbis" ';
		// this.video.src = "assets/video/earthco2.m4v";
		
			
		if( this.video.canPlayType("video/mp4") ) {
			
			this.video.src = "assets/video/earthco2-large.mp4";
			
		} else {
			
			this.video.src = "assets/video/earthco2.webm";
			
		}
			
				
		
		this.video.load(); // must call after setting/changing source
		this.video.play();
	
		this.canvas = document.createElement( 'canvas' );
		// this.canvas.width = 960;
		// this.canvas.height = 480;
		this.canvas.width = 1920;
		this.canvas.height = 960;


		this.ctx2d = this.canvas.getContext( '2d' );
		// background color if no video present
		this.ctx2d.fillStyle = '#000000';
		this.ctx2d.fillRect( 0, 0, this.canvas.width, this.canvas.height );

		this.texture = new THREE.Texture( this.canvas );
		this.texture.minFilter = THREE.LinearFilter;
		this.texture.magFilter = THREE.LinearFilter;
		
	},
	
	error : function() {
		
	},
	
	update : function(e) {
		
		if ( this.video.readyState === this.video.HAVE_ENOUGH_DATA ) {
			
			this.ctx2d.drawImage( this.video, 0, 0 );
			
			if ( this.texture ) this.texture.needsUpdate = true;
			
		}
		
		this.mesh.rotation.y += e.dt * 0.00005;
		
	}
	
};
},{"../utils/loadTexture":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/loadTexture.js","../utils/random":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/random.js","rsvp":"/Users/gregtatum/Dropbox/greg-sites/sandbox/node_modules/rsvp/dist/rsvp.js"}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/demos/Grid.js":[function(require,module,exports){
var random = require('../utils/random');

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
},{"../utils/random":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/random.js"}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/demos/MeshGroupBoxDemo/MeshGroup.js":[function(require,module,exports){
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
			
			transformIndex:	{ type: 'f', value: null }
			
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
},{"../../utils/calculateSquaredTextureWidth":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/calculateSquaredTextureWidth.js","../../utils/loadText":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/loadText.js","../../utils/loadTexture":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/loadTexture.js","rsvp":"/Users/gregtatum/Dropbox/greg-sites/sandbox/node_modules/rsvp/dist/rsvp.js"}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/demos/MeshGroupBoxDemo/index.js":[function(require,module,exports){
var MeshGroup = require('./MeshGroup')
  , random = require('../../utils/random')
  , twoπ = Math.PI * 2;

var MeshGroupBoxDemo = function( poem, properties ) {
	
	this.poem = poem;
	
	this.count = 10000;
	
	this.poem.on('update', this.update.bind(this) );
	
	this.group = new MeshGroup( poem );
	
	this.boxes = this.generateBoxes( this.group );

	this.group.build( poem.scene );
	
};

module.exports = MeshGroupBoxDemo;

MeshGroupBoxDemo.prototype = {

	generateBoxes : function( group ) {
		
		var boxes = [];
		
		var geometry = new THREE.BoxGeometry( 1, 1, 1 );
		var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		var cube;
		
		var i = this.count; while (i--) {
			
			box = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ) );
			
			box.position.x = random.range( -100, 100 );
			box.position.y = random.range( -100, 100 );
			box.position.z = random.range( -100, 100 );
			
			box.rotation.x = random.range( -twoπ, twoπ );
			box.rotation.y = random.range( -twoπ, twoπ );
			box.rotation.z = random.range( -twoπ, twoπ );
			
			box.velocity = new THREE.Vector3(
				
				random.range( -1, 1 ),
				random.range( -1, 1 ),
				random.range( -1, 1 )
				
			).multiplyScalar(0.1);
			
			box.spin = new THREE.Vector3(
				
				random.range( -twoπ, twoπ ),
				random.range( -twoπ, twoπ ),
				random.range( -twoπ, twoπ )
				
			).multiplyScalar(0.01);
			
			box.scale.multiplyScalar( random.range( 1, 2) );
			
			box.updateMatrix()
			
			boxes.push( box );
			
			group.add( box );
			
		}
		
		return boxes;
		
	},
	
	update : function( e ) {
		
		var box;
		
		for( var i = 0; i < this.count; i++ ) {
			
			box = this.boxes[i];
			
			box.position.add( box.velocity );
			
			box.rotation.x += box.spin.x;
			box.rotation.y += box.spin.y;
			box.rotation.z += box.spin.z;
			
			box.updateMatrix();
			
		}
		
	}
	
};
},{"../../utils/random":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/random.js","./MeshGroup":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/demos/MeshGroupBoxDemo/MeshGroup.js"}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/demos/SineGravityCloud.js":[function(require,module,exports){
var random		= require('../utils/random')
  , loadTexture	= require('../utils/loadTexture')
  , loadText	= require('../utils/loadText')
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
},{"../utils/loadText":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/loadText.js","../utils/loadTexture":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/loadTexture.js","../utils/random":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/random.js","rsvp":"/Users/gregtatum/Dropbox/greg-sites/sandbox/node_modules/rsvp/dist/rsvp.js"}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/demos/Spheres.js":[function(require,module,exports){
var random = require('../utils/random');

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
},{"../utils/random":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/random.js"}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/demos/texturePositionalMatrices/index.js":[function(require,module,exports){
var random		= require('../../utils/random')
  , loadTexture	= require('../../utils/loadTexture')
  , loadText	= require('../../utils/loadText')
  , RSVP		= require('rsvp')
  , simplex2	= require('../../utils/simplex2')
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
	
	this.count = 50000;
	this.radius = 400;
	this.pointSize = 14;
	
	RSVP.all([
		loadTexture( "assets/images/sinegravitycloud.png", this, "texture" ),
		loadText( "js/demos/TexturePositionalMatrices/shader.vert", this, "vertexShader" ),
		loadText( "js/demos/TexturePositionalMatrices/shader.frag", this, "fragmentShader" )
	])
	.then(
		this.start.bind(this),
		this.error.bind(this)
	);
};

module.exports = TexturePositionalMatrices;

TexturePositionalMatrices.prototype = {
	
	start : function() {

		var vec3FloatLength = 3;
		var pointsLength = 8;
		var boxGeometryLength = pointsLength * vec3FloatLength;

		this.geometry = new THREE.BufferGeometry();

		this.positions = new Float32Array( this.count * boxGeometryLength );
		this.velocity = new Float32Array( this.count * vec3FloatLength );
		this.colors = new Float32Array( this.count * boxGeometryLength );
		this.sizes = new Float32Array( this.count * pointsLength );
		this.transformIndices = new Float32Array( this.count * pointsLength );

		var color = new THREE.Color(0x000000);
		var hue;
		
		var vertices = new THREE.BoxGeometry( 1, 1, 1 ).vertices;

		var x, y, z, i, j;

		for( i = 0; i < this.count; i++ ) {
			
			hue = (this.positions[ i * 3 + 0 ] / this.radius * 0.3 + 0.65) % 1;
			hue = random.range( 0, 1 );

			color.setHSL( hue, 1.0, 0.55 );
			
			for( j=0; j < vertices.length ; j++ ) {
				
				var offset3 = (i * boxGeometryLength) + (j * vec3FloatLength);
				var offset1 = (i * pointsLength + j);

				this.sizes[ offset1 ] = this.pointSize;
				this.transformIndices[ offset1 ] = i;
							
				this.positions[ offset3 + 0 ] = vertices[j].x * 4;
				this.positions[ offset3 + 1 ] = vertices[j].y * 4;
				this.positions[ offset3 + 2 ] = vertices[j].z * 4;

				this.colors[ offset3 + 0 ] = color.r;
				this.colors[ offset3 + 1 ] = color.g;
				this.colors[ offset3 + 2 ] = color.b;

			}
		}

		this.matricesTextureSize = this.calculateSquaredTextureSize( this.count * 16 ); //16 floats per matrix
		
		this.matrices = []
		this.matricesData = new Float32Array( this.matricesTextureSize * this.matricesTextureSize * 4 )
		
		var rotateM = new THREE.Matrix4();
		var translateM = new THREE.Matrix4();
		var scaleM = new THREE.Matrix4();
		var euler = new THREE.Euler()
		var s;
		
		for( i = 0; i < this.count ; i++ ) {
			
			s = random.range( 0.5, 2 );
			
			scaleM.makeScale( s, s, s );
			
			translateM.makeTranslation(
				random.range( -this.radius, this.radius ) * 0.5,
				random.range( -this.radius, this.radius ) * 0.5,
				random.range( -this.radius, this.radius ) * 0.5
			);
			
			euler.set(
				random.range( 0, 2 * Math.PI ),
				random.range( 0, 2 * Math.PI ),
				random.range( 0, 2 * Math.PI )
			);

			rotateM.makeRotationFromEuler( euler );
			
			this.matrices[i] = new THREE.Matrix4()
				.multiply( translateM )
				.multiply( rotateM )
				.multiply( scaleM );
			
			// this.matrices[i] = new THREE.Matrix4();
			
			this.matrices[i].flattenToArrayOffset( this.matricesData, i * 16 );
			
		}
		
		this.matricesTexture = new THREE.DataTexture(
			this.matricesData,
			this.matricesTextureSize,
			this.matricesTextureSize,
			THREE.RGBAFormat,
			THREE.FloatType
		);
		this.matricesTexture.minFilter = THREE.NearestFilter;
		this.matricesTexture.magFilter = THREE.NearestFilter;
		this.matricesTexture.generateMipmaps = false;
		this.matricesTexture.flipY = false;
		this.matricesTexture.needsUpdate = true;
		
		this.attributes = {

			size:       	{ type: 'f', value: null },
			customColor:	{ type: 'c', value: null },
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
		
		this.geometry.addAttribute( 'position',			new THREE.BufferAttribute( this.positions, 3 ) );
		this.geometry.addAttribute( 'customColor',		new THREE.BufferAttribute( this.colors, 3 ) );
		this.geometry.addAttribute( 'size',				new THREE.BufferAttribute( this.sizes, 1 ) );
		this.geometry.addAttribute( 'transformIndex',	new THREE.BufferAttribute( this.transformIndices, 1 ) );

		this.object = new THREE.PointCloud( this.geometry, this.material );
		this.object.position.y -= this.radius * 0.2;
		
		this.poem.scene.add( this.object );
	
	
		this.poem.on( 'update', this.update.bind(this) );
		
	},
	
	calculateSquaredTextureSize : function( count ) {
		
		var size = 1;
		var i = 0;
		
		while( size * size < (count / 4) ) {
			
			i++;
			size = Math.pow( 2, i );
			
		}
		
		return size;
	},
	
	error : function( error ) {
		throw new Error("Could not load assets for the TexturePositionalMatrices", error);
	},
	
	update : function() {
		
		var translation = new THREE.Matrix4();
		var euler = new THREE.Euler();
		
		return function(e) {

			this.uniforms.time.value = e.time;
			
			var x,y;
		
			for( i = 0; i < this.count ; i++ ) {
				
				x = e.time / 1000;
				y = i * 1000;
				
				translation.makeTranslation(
					simplex2.range( x, y, -1, 1 ),
					simplex2.range( x, y + 333, -1, 1 ),
					simplex2.range( x, y + 666, -1, 1 )
				);
				
				this.matrices[i].multiplyMatrices( translation, this.matrices[i] );
				
				// euler.set(
				// 	random.range( 0, 2 * Math.PI ),
				// 	random.range( 0, 2 * Math.PI ),
				// 	random.range( 0, 2 * Math.PI )
				// );
				//
				// rotateM.makeRotationFromEuler( euler );
				
				
				this.matrices[i].flattenToArrayOffset( this.matricesData, i * 16 );
			}
			
			this.matricesTexture.needsUpdate = true;
		}
	}()
	
};

window.consoleMatrixElements = function( els, decimalPlaces ) {
 
	var i, j, el, results;
 
	results = [];
	j = 0;
 
	for( i=0; i < els.length; i++ ) {
		
		if( j === 0 ) {
			results.push([]);
		}
 
		el = els[i];
 
		if( typeof decimalPlaces === "number" ) {
 
			el = Math.round( Math.pow(10, decimalPlaces) * el ) / Math.pow(10, decimalPlaces);
 
		}
 
		results[Math.floor(i / 4) % 4].push( el );
 
		j++;
		j %= 4;
		
		if( i % 16 === 15 ) {
			console.table( results );
			results = [];
		}
 
	}
 
}
},{"../../utils/loadText":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/loadText.js","../../utils/loadTexture":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/loadTexture.js","../../utils/random":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/random.js","../../utils/simplex2":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/simplex2.js","rsvp":"/Users/gregtatum/Dropbox/greg-sites/sandbox/node_modules/rsvp/dist/rsvp.js"}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/demos/uniformPositionalMatrices/index.js":[function(require,module,exports){
var random		= require('../../utils/random')
  , loadTexture	= require('../../utils/loadTexture')
  , loadText	= require('../../utils/loadText')
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
		loadText( "js/demos/UniformPositionalMatrices/shader.vert", this, "vertexShader" ),
		loadText( "js/demos/UniformPositionalMatrices/shader.frag", this, "fragmentShader" )
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
},{"../../utils/loadText":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/loadText.js","../../utils/loadTexture":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/loadTexture.js","../../utils/random":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/random.js","rsvp":"/Users/gregtatum/Dropbox/greg-sites/sandbox/node_modules/rsvp/dist/rsvp.js"}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/levels/carbonDioxideEarth.js":[function(require,module,exports){
module.exports = {
	config : {
		camera : {
			x : -400,
			far : 3000
		}
	},
	objects : {
		sphere : {
			object: require("../demos/Earth"),
			properties: {}
		},
		controls : {
			object: require("../components/cameras/Controls"),
			properties: {
				minDistance : 500,
				maxDistance : 1000,
				zoomSpeed : 0.1,
				autoRotate : true,
				autoRotateSpeed : 0.2
			}
		},
		info : {
			object: require("../components/Info"),
			properties : {
				documentTitle : "Earth's CO2 – a Three.js Visualization adapted by Greg Tatum",
				title : "Earth's CO2",
				subtitle : "3d Visualisation of a map from NASA",
				appendCredits : "<br/> Map visualization by <a href='http://svs.gsfc.nasa.gov/cgi-bin/details.cgi?aid=11719'>NASA's Goddard Space Flight Center</a>",
				titleCss : { "font-size": "3.35em" },
				subtitleCss : {	"font-size": "0.7em" },
				showArrowNext : true
			}
		},
		stars : {
			object: require("../components/Stars"),
		},
		// stats : {
		// 	object: require("../components/utils/Stats")
		// },
		lights : {
			object: require("../components/lights/TrackCameraLights")
		}
	}
};
},{"../components/Info":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/components/Info.js","../components/Stars":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/components/Stars.js","../components/cameras/Controls":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/components/cameras/Controls.js","../components/lights/TrackCameraLights":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/components/lights/TrackCameraLights.js","../demos/Earth":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/demos/Earth.js"}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/levels/index.js":[function(require,module,exports){
module.exports = {
	meshGroupBoxDemo : require("./meshGroupBoxDemo"),
	carbonDioxideEarth : require("./carbonDioxideEarth"),
	spheresDemo : require("./spheresDemo"),
	sineGravityCloud : require("./sineGravityCloud"),
	uniformPositionalMatrices : require("./uniformPositionalMatrices"),
	texturePositionalMatrices : require("./texturePositionalMatrices")
};
},{"./carbonDioxideEarth":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/levels/carbonDioxideEarth.js","./meshGroupBoxDemo":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/levels/meshGroupBoxDemo.js","./sineGravityCloud":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/levels/sineGravityCloud.js","./spheresDemo":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/levels/spheresDemo.js","./texturePositionalMatrices":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/levels/texturePositionalMatrices.js","./uniformPositionalMatrices":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/levels/uniformPositionalMatrices.js"}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/levels/meshGroupBoxDemo.js":[function(require,module,exports){
module.exports = {
	config : {
		camera : {
			x : -400
		}
	},
	objects : {
		demo : {
			object: require("../demos/MeshGroupBoxDemo"),
			properties: {}
		},
		controls : {
			object: require("../components/cameras/Controls"),
		},
		grid : {
			object: require("../demos/Grid"),
		},
		stats : {
			object: require("../components/utils/Stats")
		}
	}
};
},{"../components/cameras/Controls":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/components/cameras/Controls.js","../components/utils/Stats":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/components/utils/Stats.js","../demos/Grid":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/demos/Grid.js","../demos/MeshGroupBoxDemo":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/demos/MeshGroupBoxDemo/index.js"}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/levels/sineGravityCloud.js":[function(require,module,exports){
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
			object: require("../demos/SineGravityCloud"),
		},
		grid : {
			object: require("../demos/Grid"),
		},
		// stats : {
		// 	object: require("../components/utils/Stats")
		// }
	}
};
},{"../components/cameras/Controls":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/components/cameras/Controls.js","../demos/Grid":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/demos/Grid.js","../demos/SineGravityCloud":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/demos/SineGravityCloud.js"}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/levels/spheresDemo.js":[function(require,module,exports){
module.exports = {
	config : {
		camera : {
			x : -400
		}
	},
	objects : {
		sphere : {
			object: require("../demos/Spheres"),
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
			object: require("../demos/Grid"),
		},
		stats : {
			object: require("../components/utils/Stats")
		}
	}
};
},{"../components/cameras/Controls":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/components/cameras/Controls.js","../components/utils/Stats":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/components/utils/Stats.js","../demos/Grid":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/demos/Grid.js","../demos/Spheres":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/demos/Spheres.js"}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/levels/texturePositionalMatrices.js":[function(require,module,exports){
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
			object: require("../demos/texturePositionalMatrices"),
		},
		grid : {
			object: require("../demos/Grid"),
		},
		stats : {
			object: require("../components/utils/Stats")
		}
	}
};
},{"../components/cameras/Controls":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/components/cameras/Controls.js","../components/utils/Stats":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/components/utils/Stats.js","../demos/Grid":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/demos/Grid.js","../demos/texturePositionalMatrices":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/demos/texturePositionalMatrices/index.js"}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/levels/uniformPositionalMatrices.js":[function(require,module,exports){
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
			object: require("../demos/uniformPositionalMatrices"),
		},
		grid : {
			object: require("../demos/Grid"),
		},
		stats : {
			object: require("../components/utils/Stats")
		}
	}
};
},{"../components/cameras/Controls":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/components/cameras/Controls.js","../components/utils/Stats":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/components/utils/Stats.js","../demos/Grid":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/demos/Grid.js","../demos/uniformPositionalMatrices":"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/demos/uniformPositionalMatrices/index.js"}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/Clock.js":[function(require,module,exports){
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
},{}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/EventDispatcher.js":[function(require,module,exports){
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
},{}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/calculateSquaredTextureWidth.js":[function(require,module,exports){
var calculateSquaredTextureWidth = function( count ) {
	var width = 1;
	var i = 0;
	
	while( width * width < (count / 4) ) {
		
		i++;
		width = Math.pow( 2, i );
		
	}
	
	return width;
};

module.exports = calculateSquaredTextureWidth;

},{}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/loadText.js":[function(require,module,exports){
var RSVP = require('rsvp');

var loadText = function( url, object, key ) {
	
	var promise = new RSVP.Promise(function(resolve, reject){
		
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
},{"rsvp":"/Users/gregtatum/Dropbox/greg-sites/sandbox/node_modules/rsvp/dist/rsvp.js"}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/loadTexture.js":[function(require,module,exports){
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
},{"rsvp":"/Users/gregtatum/Dropbox/greg-sites/sandbox/node_modules/rsvp/dist/rsvp.js"}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/random.js":[function(require,module,exports){
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

},{}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/utils/simplex2.js":[function(require,module,exports){
var perlinSimplex = require('perlin-simplex');
var generator = new perlinSimplex();
// generator.noise(x, y)
// generator.noise3d(x, y, z)

function unitSimplex( x, y ) {
	return (generator.noise(x,y) + 1) / 2;
}

var simplex2 = {
	
	flip : function( x, y ) {
		return generator.noise(x,y) > 0 ? true: false;
	},
	
	range : function( x, y, min, max ) {
		return unitSimplex(x,y) * (max - min) + min;
	},
	
	rangeInt : function( x, y, min, max ) {
		return Math.floor( this.range(min, max + 1) );
	},
	
	rangeLow : function( x, y, min, max) {
		//More likely to return a low value
		var r = unitSimplex(x,y);
		return r * r * (max - min) + min;
	},
	
	rangeHigh : function( x, y, min, max) {
		//More likely to return a high value
		var r = unitSimplex(x,y);
		return (1 - r * r) * (max - min) + min;
	}
	 
};

module.exports = simplex2;

},{"perlin-simplex":"/Users/gregtatum/Dropbox/greg-sites/sandbox/node_modules/perlin-simplex/index.js"}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/vendor/OrbitControls.js":[function(require,module,exports){
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

},{}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/js/vendor/Stats.js":[function(require,module,exports){
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
},{}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/node_modules/browserify/node_modules/process/browser.js":[function(require,module,exports){
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

},{}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/node_modules/perlin-simplex/index.js":[function(require,module,exports){
// https://gist.github.com/banksean/304522
//
// Ported from Stefan Gustavson's java implementation
// http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
// Read Stefan's excellent paper for details on how this code works.
//
// Sean McCullough banksean@gmail.com

/**
 * You can pass in a random number generator object if you like.
 * It is assumed to have a random() method.
 */
module.exports = SimplexNoise = function(r) {
  if (r == undefined) r = Math;
  this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0], 
                                 [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1], 
                                 [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]]; 
  this.p = [];
  for (var i=0; i<256; i++) {
    this.p[i] = Math.floor(r.random()*256);
  }
  // To remove the need for index wrapping, double the permutation table length 
  this.perm = []; 
  for(var i=0; i<512; i++) {
    this.perm[i]=this.p[i & 255];
  } 

  // A lookup table to traverse the simplex around a given point in 4D. 
  // Details can be found where this table is used, in the 4D noise method. 
  this.simplex = [ 
    [0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0], 
    [0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0], 
    [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0], 
    [1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0], 
    [1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0], 
    [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0], 
    [2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0], 
    [2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]; 
};

SimplexNoise.prototype.dot = function(g, x, y) { 
  return g[0]*x + g[1]*y;
};

SimplexNoise.prototype.noise = function(xin, yin) { 
  var n0, n1, n2; // Noise contributions from the three corners 
  // Skew the input space to determine which simplex cell we're in 
  var F2 = 0.5*(Math.sqrt(3.0)-1.0); 
  var s = (xin+yin)*F2; // Hairy factor for 2D 
  var i = Math.floor(xin+s); 
  var j = Math.floor(yin+s); 
  var G2 = (3.0-Math.sqrt(3.0))/6.0; 
  var t = (i+j)*G2; 
  var X0 = i-t; // Unskew the cell origin back to (x,y) space 
  var Y0 = j-t; 
  var x0 = xin-X0; // The x,y distances from the cell origin 
  var y0 = yin-Y0; 
  // For the 2D case, the simplex shape is an equilateral triangle. 
  // Determine which simplex we are in. 
  var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords 
  if(x0>y0) {i1=1; j1=0;} // lower triangle, XY order: (0,0)->(1,0)->(1,1) 
  else {i1=0; j1=1;}      // upper triangle, YX order: (0,0)->(0,1)->(1,1) 
  // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and 
  // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where 
  // c = (3-sqrt(3))/6 
  var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords 
  var y1 = y0 - j1 + G2; 
  var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords 
  var y2 = y0 - 1.0 + 2.0 * G2; 
  // Work out the hashed gradient indices of the three simplex corners 
  var ii = i & 255; 
  var jj = j & 255; 
  var gi0 = this.perm[ii+this.perm[jj]] % 12; 
  var gi1 = this.perm[ii+i1+this.perm[jj+j1]] % 12; 
  var gi2 = this.perm[ii+1+this.perm[jj+1]] % 12; 
  // Calculate the contribution from the three corners 
  var t0 = 0.5 - x0*x0-y0*y0; 
  if(t0<0) n0 = 0.0; 
  else { 
    t0 *= t0; 
    n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);  // (x,y) of grad3 used for 2D gradient 
  } 
  var t1 = 0.5 - x1*x1-y1*y1; 
  if(t1<0) n1 = 0.0; 
  else { 
    t1 *= t1; 
    n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1); 
  }
  var t2 = 0.5 - x2*x2-y2*y2; 
  if(t2<0) n2 = 0.0; 
  else { 
    t2 *= t2; 
    n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2); 
  } 
  // Add contributions from each corner to get the final noise value. 
  // The result is scaled to return values in the interval [-1,1]. 
  return 70.0 * (n0 + n1 + n2); 
};

// 3D simplex noise 
SimplexNoise.prototype.noise3d = function(xin, yin, zin) { 
  var n0, n1, n2, n3; // Noise contributions from the four corners 
  // Skew the input space to determine which simplex cell we're in 
  var F3 = 1.0/3.0; 
  var s = (xin+yin+zin)*F3; // Very nice and simple skew factor for 3D 
  var i = Math.floor(xin+s); 
  var j = Math.floor(yin+s); 
  var k = Math.floor(zin+s); 
  var G3 = 1.0/6.0; // Very nice and simple unskew factor, too 
  var t = (i+j+k)*G3; 
  var X0 = i-t; // Unskew the cell origin back to (x,y,z) space 
  var Y0 = j-t; 
  var Z0 = k-t; 
  var x0 = xin-X0; // The x,y,z distances from the cell origin 
  var y0 = yin-Y0; 
  var z0 = zin-Z0; 
  // For the 3D case, the simplex shape is a slightly irregular tetrahedron. 
  // Determine which simplex we are in. 
  var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords 
  var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords 
  if(x0>=y0) { 
    if(y0>=z0) 
      { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; } // X Y Z order 
      else if(x0>=z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; } // X Z Y order 
      else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; } // Z X Y order 
    } 
  else { // x0<y0 
    if(y0<z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; } // Z Y X order 
    else if(x0<z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; } // Y Z X order 
    else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; } // Y X Z order 
  } 
  // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z), 
  // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and 
  // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where 
  // c = 1/6.
  var x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords 
  var y1 = y0 - j1 + G3; 
  var z1 = z0 - k1 + G3; 
  var x2 = x0 - i2 + 2.0*G3; // Offsets for third corner in (x,y,z) coords 
  var y2 = y0 - j2 + 2.0*G3; 
  var z2 = z0 - k2 + 2.0*G3; 
  var x3 = x0 - 1.0 + 3.0*G3; // Offsets for last corner in (x,y,z) coords 
  var y3 = y0 - 1.0 + 3.0*G3; 
  var z3 = z0 - 1.0 + 3.0*G3; 
  // Work out the hashed gradient indices of the four simplex corners 
  var ii = i & 255; 
  var jj = j & 255; 
  var kk = k & 255; 
  var gi0 = this.perm[ii+this.perm[jj+this.perm[kk]]] % 12; 
  var gi1 = this.perm[ii+i1+this.perm[jj+j1+this.perm[kk+k1]]] % 12; 
  var gi2 = this.perm[ii+i2+this.perm[jj+j2+this.perm[kk+k2]]] % 12; 
  var gi3 = this.perm[ii+1+this.perm[jj+1+this.perm[kk+1]]] % 12; 
  // Calculate the contribution from the four corners 
  var t0 = 0.6 - x0*x0 - y0*y0 - z0*z0; 
  if(t0<0) n0 = 0.0; 
  else { 
    t0 *= t0; 
    n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0, z0); 
  }
  var t1 = 0.6 - x1*x1 - y1*y1 - z1*z1; 
  if(t1<0) n1 = 0.0; 
  else { 
    t1 *= t1; 
    n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1, z1); 
  } 
  var t2 = 0.6 - x2*x2 - y2*y2 - z2*z2; 
  if(t2<0) n2 = 0.0; 
  else { 
    t2 *= t2; 
    n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2, z2); 
  } 
  var t3 = 0.6 - x3*x3 - y3*y3 - z3*z3; 
  if(t3<0) n3 = 0.0; 
  else { 
    t3 *= t3; 
    n3 = t3 * t3 * this.dot(this.grad3[gi3], x3, y3, z3); 
  } 
  // Add contributions from each corner to get the final noise value. 
  // The result is scaled to stay just inside [-1,1] 
  return 32.0*(n0 + n1 + n2 + n3); 
};
},{}],"/Users/gregtatum/Dropbox/greg-sites/sandbox/node_modules/rsvp/dist/rsvp.js":[function(require,module,exports){
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
},{"_process":"/Users/gregtatum/Dropbox/greg-sites/sandbox/node_modules/browserify/node_modules/process/browser.js"}]},{},["./js/Main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL2pzL01haW4uanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9zYW5kYm94L2pzL0xldmVsTG9hZGVyLmpzIiwiL1VzZXJzL2dyZWd0YXR1bS9Ecm9wYm94L2dyZWctc2l0ZXMvc2FuZGJveC9qcy9Qb2VtLmpzIiwiL1VzZXJzL2dyZWd0YXR1bS9Ecm9wYm94L2dyZWctc2l0ZXMvc2FuZGJveC9qcy9jb21wb25lbnRzL0luZm8uanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9zYW5kYm94L2pzL2NvbXBvbmVudHMvU3RhcnMuanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9zYW5kYm94L2pzL2NvbXBvbmVudHMvY2FtZXJhcy9DYW1lcmEuanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9zYW5kYm94L2pzL2NvbXBvbmVudHMvY2FtZXJhcy9Db250cm9scy5qcyIsIi9Vc2Vycy9ncmVndGF0dW0vRHJvcGJveC9ncmVnLXNpdGVzL3NhbmRib3gvanMvY29tcG9uZW50cy9saWdodHMvVHJhY2tDYW1lcmFMaWdodHMuanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9zYW5kYm94L2pzL2NvbXBvbmVudHMvdXRpbHMvU3RhdHMuanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9zYW5kYm94L2pzL2RlbW9zL0VhcnRoLmpzIiwiL1VzZXJzL2dyZWd0YXR1bS9Ecm9wYm94L2dyZWctc2l0ZXMvc2FuZGJveC9qcy9kZW1vcy9HcmlkLmpzIiwiL1VzZXJzL2dyZWd0YXR1bS9Ecm9wYm94L2dyZWctc2l0ZXMvc2FuZGJveC9qcy9kZW1vcy9NZXNoR3JvdXBCb3hEZW1vL01lc2hHcm91cC5qcyIsIi9Vc2Vycy9ncmVndGF0dW0vRHJvcGJveC9ncmVnLXNpdGVzL3NhbmRib3gvanMvZGVtb3MvTWVzaEdyb3VwQm94RGVtby9pbmRleC5qcyIsIi9Vc2Vycy9ncmVndGF0dW0vRHJvcGJveC9ncmVnLXNpdGVzL3NhbmRib3gvanMvZGVtb3MvU2luZUdyYXZpdHlDbG91ZC5qcyIsIi9Vc2Vycy9ncmVndGF0dW0vRHJvcGJveC9ncmVnLXNpdGVzL3NhbmRib3gvanMvZGVtb3MvU3BoZXJlcy5qcyIsIi9Vc2Vycy9ncmVndGF0dW0vRHJvcGJveC9ncmVnLXNpdGVzL3NhbmRib3gvanMvZGVtb3MvdGV4dHVyZVBvc2l0aW9uYWxNYXRyaWNlcy9pbmRleC5qcyIsIi9Vc2Vycy9ncmVndGF0dW0vRHJvcGJveC9ncmVnLXNpdGVzL3NhbmRib3gvanMvZGVtb3MvdW5pZm9ybVBvc2l0aW9uYWxNYXRyaWNlcy9pbmRleC5qcyIsIi9Vc2Vycy9ncmVndGF0dW0vRHJvcGJveC9ncmVnLXNpdGVzL3NhbmRib3gvanMvbGV2ZWxzL2NhcmJvbkRpb3hpZGVFYXJ0aC5qcyIsIi9Vc2Vycy9ncmVndGF0dW0vRHJvcGJveC9ncmVnLXNpdGVzL3NhbmRib3gvanMvbGV2ZWxzL2luZGV4LmpzIiwiL1VzZXJzL2dyZWd0YXR1bS9Ecm9wYm94L2dyZWctc2l0ZXMvc2FuZGJveC9qcy9sZXZlbHMvbWVzaEdyb3VwQm94RGVtby5qcyIsIi9Vc2Vycy9ncmVndGF0dW0vRHJvcGJveC9ncmVnLXNpdGVzL3NhbmRib3gvanMvbGV2ZWxzL3NpbmVHcmF2aXR5Q2xvdWQuanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9zYW5kYm94L2pzL2xldmVscy9zcGhlcmVzRGVtby5qcyIsIi9Vc2Vycy9ncmVndGF0dW0vRHJvcGJveC9ncmVnLXNpdGVzL3NhbmRib3gvanMvbGV2ZWxzL3RleHR1cmVQb3NpdGlvbmFsTWF0cmljZXMuanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9zYW5kYm94L2pzL2xldmVscy91bmlmb3JtUG9zaXRpb25hbE1hdHJpY2VzLmpzIiwiL1VzZXJzL2dyZWd0YXR1bS9Ecm9wYm94L2dyZWctc2l0ZXMvc2FuZGJveC9qcy91dGlscy9DbG9jay5qcyIsIi9Vc2Vycy9ncmVndGF0dW0vRHJvcGJveC9ncmVnLXNpdGVzL3NhbmRib3gvanMvdXRpbHMvRXZlbnREaXNwYXRjaGVyLmpzIiwiL1VzZXJzL2dyZWd0YXR1bS9Ecm9wYm94L2dyZWctc2l0ZXMvc2FuZGJveC9qcy91dGlscy9jYWxjdWxhdGVTcXVhcmVkVGV4dHVyZVdpZHRoLmpzIiwiL1VzZXJzL2dyZWd0YXR1bS9Ecm9wYm94L2dyZWctc2l0ZXMvc2FuZGJveC9qcy91dGlscy9sb2FkVGV4dC5qcyIsIi9Vc2Vycy9ncmVndGF0dW0vRHJvcGJveC9ncmVnLXNpdGVzL3NhbmRib3gvanMvdXRpbHMvbG9hZFRleHR1cmUuanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9zYW5kYm94L2pzL3V0aWxzL3JhbmRvbS5qcyIsIi9Vc2Vycy9ncmVndGF0dW0vRHJvcGJveC9ncmVnLXNpdGVzL3NhbmRib3gvanMvdXRpbHMvc2ltcGxleDIuanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9zYW5kYm94L2pzL3ZlbmRvci9PcmJpdENvbnRyb2xzLmpzIiwiL1VzZXJzL2dyZWd0YXR1bS9Ecm9wYm94L2dyZWctc2l0ZXMvc2FuZGJveC9qcy92ZW5kb3IvU3RhdHMuanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9zYW5kYm94L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9zYW5kYm94L25vZGVfbW9kdWxlcy9wZXJsaW4tc2ltcGxleC9pbmRleC5qcyIsIi9Vc2Vycy9ncmVndGF0dW0vRHJvcGJveC9ncmVnLXNpdGVzL3NhbmRib3gvbm9kZV9tb2R1bGVzL3JzdnAvZGlzdC9yc3ZwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6a0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIExldmVsTG9hZGVyID0gcmVxdWlyZSgnLi9MZXZlbExvYWRlcicpO1xuXG5mdW5jdGlvbiBjYW1lbENhc2VUb1NwYWNlZCggc3RyaW5nICkge1xuXHRcblx0cmV0dXJuIHN0cmluZ1xuXHQgICAgLnJlcGxhY2UoLyhbQS1aXSkvZywgJyAkMScpXG5cdCAgICAucmVwbGFjZSgvXi4vLCBmdW5jdGlvbihzdHIpeyByZXR1cm4gc3RyLnRvVXBwZXJDYXNlKCk7IH0pXG5cdFx0XG59XG5cbiQoZnVuY3Rpb24oKSB7XG5cdFxuXHR2YXIgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKTtcblx0XG5cdHZhciBsZXZlbHMgPSBfLmtleXMoIHJlcXVpcmUoJy4vbGV2ZWxzJykgKTtcblx0XG5cdHZhciBsZXZlbFRvTG9hZCA9IF8uY29udGFpbnMoIGxldmVscywgaGFzaCApID8gaGFzaCA6IF8uZmlyc3QoIGxldmVscyApO1xuXHRcblx0d2luZG93LmxvY2F0aW9uLmhhc2ggPSBsZXZlbFRvTG9hZDtcblx0XG5cdCQoJyNMZXZlbFNlbGVjdCcpXG5cdFx0LmFwcGVuZChcblx0XHRcblx0XHRcdF8ucmVkdWNlKCBsZXZlbHMsIGZ1bmN0aW9uKCBtZW1vLCBsZXZlbCApIHtcblx0XHRcdFx0XG5cdFx0XHRcdHZhciBsZXZlbFByZXR0eSA9IGNhbWVsQ2FzZVRvU3BhY2VkKCBsZXZlbCApO1xuXHRcdFx0XHR2YXIgc2VsZWN0ZWQgPSBsZXZlbCA9PT0gbGV2ZWxUb0xvYWQgPyBcIiBzZWxlY3RlZFwiIDogXCJcIjtcblxuXHRcdFx0XHRyZXR1cm4gbWVtbyArIFwiPG9wdGlvbiB2YWx1ZT0nXCIrbGV2ZWwrXCInXCIrc2VsZWN0ZWQrXCI+XCIrbGV2ZWxQcmV0dHkrXCI8L29wdGlvbj5cIjtcblx0XHRcdFx0XG5cdFx0XHR9LCBcIlwiKVxuXHRcblx0XHQpXG5cdFx0Lm9uKCBcImNoYW5nZVwiLCBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBsZXZlbCA9ICQodGhpcykudmFsKCk7XG5cdFx0XHRMZXZlbExvYWRlciggbGV2ZWwgKTtcblx0XHRcdHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gbGV2ZWw7XG5cdFx0fSlcblx0O1xuXG5cdExldmVsTG9hZGVyKCBsZXZlbFRvTG9hZCAgKTtcbn0pOyIsIi8vIERlY2xhcmF0aXZlbHkgc2V0IHVwIHRoZSBzY2VuZSB1c2luZyBhIGxldmVsIG1hbmlmZXN0LiBFYWNoIG9iamVjdFxuLy8gaW4gdGhlIGxldmVsIG1hbmlmZXN0IGdldHMgaW5pdGlhdGVkIGFzIGEgcHJvcGVydHkgb24gdGhlIHBvZW0gb2JqZWN0XG4vLyBhbmQgZ2V0cyBwYXNzZWQgdGhlIHBvZW0gYXMgdGhlIGZpcnN0IHZhcmlhYmxlLCBhbmQgdGhlIHByb3BlcnRpZXMgYXNcbi8vIHRoZSBzZWNvbmRcblxudmFyIFBvZW0gPSByZXF1aXJlKCcuL1BvZW0nKTtcbnZhciBsZXZlbHMgPSByZXF1aXJlKCcuL2xldmVscycpO1xuXG52YXIgY3VycmVudExldmVsID0gbnVsbDtcbnZhciBjdXJyZW50UG9lbSA9IG51bGw7XG5cbndpbmRvdy5MZXZlbExvYWRlciA9IGZ1bmN0aW9uKCBuYW1lICkge1xuXHRcblx0aWYoY3VycmVudFBvZW0pIGN1cnJlbnRQb2VtLmRlc3Ryb3koKTtcblx0XG5cdGN1cnJlbnRMZXZlbCA9IGxldmVsc1tuYW1lXTtcblx0Y3VycmVudFBvZW0gPSBuZXcgUG9lbSggY3VycmVudExldmVsICk7XG5cdHdpbmRvdy5wb2VtID0gY3VycmVudFBvZW07XG5cbn07XG5cdFxubW9kdWxlLmV4cG9ydHMgPSBMZXZlbExvYWRlcjsiLCJ2YXIgU3RhdHMgPSByZXF1aXJlKCcuL3ZlbmRvci9TdGF0cycpO1xudmFyIEV2ZW50RGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4vdXRpbHMvRXZlbnREaXNwYXRjaGVyJyk7XG52YXIgQ2xvY2sgPSByZXF1aXJlKCcuL3V0aWxzL0Nsb2NrJyk7XG52YXIgQ2FtZXJhID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL2NhbWVyYXMvQ2FtZXJhJyk7XG5cbnZhciBfcmVuZGVyZXI7XG5cbnZhciBQb2VtID0gZnVuY3Rpb24oIGxldmVsICkge1xuXG5cdHRoaXMucmF0aW8gPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA+PSAxID8gd2luZG93LmRldmljZVBpeGVsUmF0aW8gOiAxO1xuXHRcblx0dGhpcy5kaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJ2NvbnRhaW5lcicgKTtcblx0dGhpcy4kZGl2ID0gJCh0aGlzLmRpdik7XG5cdHRoaXMuY2FudmFzID0gbnVsbDtcblx0dGhpcy5zY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuXHR0aGlzLnJlcXVlc3RlZEZyYW1lID0gdW5kZWZpbmVkO1xuXG5cdHRoaXMuY2xvY2sgPSBuZXcgQ2xvY2soKTtcblx0dGhpcy5jYW1lcmEgPSBuZXcgQ2FtZXJhKCB0aGlzLCBfLmlzT2JqZWN0KCBsZXZlbC5jb25maWcuY2FtZXJhICkgPyBsZXZlbC5jb25maWcuY2FtZXJhIDoge30gKTtcblx0dGhpcy5zY2VuZS5mb2cgPSBuZXcgVEhSRUUuRm9nKCAweDIyMjIyMiwgdGhpcy5jYW1lcmEub2JqZWN0LnBvc2l0aW9uLnogLyAyLCB0aGlzLmNhbWVyYS5vYmplY3QucG9zaXRpb24ueiAqIDIgKTtcblx0XG5cdHRoaXMuYWRkUmVuZGVyZXIoKTtcblx0XG5cdHRoaXMucGFyc2VMZXZlbCggbGV2ZWwgKTtcblx0XG5cdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcnMoKTtcblx0XG5cdHRoaXMubG9vcCgpO1xuXHRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUG9lbTtcblxuUG9lbS5wcm90b3R5cGUgPSB7XG5cdFxuXHRwYXJzZUxldmVsIDogZnVuY3Rpb24oIGxldmVsICkge1xuXHRcdF8uZWFjaCggbGV2ZWwub2JqZWN0cywgZnVuY3Rpb24oIHZhbHVlLCBrZXkgKSB7XG5cdFx0XHRpZihfLmlzT2JqZWN0KCB2YWx1ZSApKSB7XG5cdFx0XHRcdHRoaXNbIGtleSBdID0gbmV3IHZhbHVlLm9iamVjdCggdGhpcywgdmFsdWUucHJvcGVydGllcyApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpc1sga2V5IF0gPSB2YWx1ZTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdH0sIHRoaXMpO1xuXHR9LFxuXHRcblx0YWRkUmVuZGVyZXIgOiBmdW5jdGlvbigpIHtcblx0XHRpZighX3JlbmRlcmVyKSB7XG5cdFx0XG5cdFx0XHRfcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7XG5cdFx0XHRcdGFscGhhIDogdHJ1ZVxuXHRcdFx0fSk7XG5cdFx0XHRcblx0XHR9XG5cdFx0X3JlbmRlcmVyLnNldFNpemUoIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQgKTtcblx0XHR0aGlzLmRpdi5hcHBlbmRDaGlsZCggX3JlbmRlcmVyLmRvbUVsZW1lbnQgKTtcblx0XHR0aGlzLmNhbnZhcyA9IF9yZW5kZXJlci5kb21FbGVtZW50O1xuXHR9LFxuXHRcblx0YWRkU3RhdHMgOiBmdW5jdGlvbigpIHtcblxuXHR9LFxuXHRcblx0YWRkRXZlbnRMaXN0ZW5lcnMgOiBmdW5jdGlvbigpIHtcblx0XHQkKHdpbmRvdykub24oJ3Jlc2l6ZScsIHRoaXMucmVzaXplSGFuZGxlci5iaW5kKHRoaXMpKTtcblx0fSxcblx0XG5cdHJlc2l6ZUhhbmRsZXIgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHRfcmVuZGVyZXIuc2V0U2l6ZSggd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCApO1xuXHRcdHRoaXMuZGlzcGF0Y2goIHsgdHlwZSA6IFwicmVzaXplXCIgfSApO1xuXHRcdFxuXHR9LFxuXHRcdFx0XG5cdGxvb3AgOiBmdW5jdGlvbigpIHtcblxuXHRcdHRoaXMucmVxdWVzdGVkRnJhbWUgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIHRoaXMubG9vcC5iaW5kKHRoaXMpICk7XG5cdFx0dGhpcy51cGRhdGUoKTtcblxuXHR9LFxuXHRcdFx0XG5cdHVwZGF0ZSA6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdHRoaXMuZGlzcGF0Y2goe1xuXHRcdFx0dHlwZTogXCJ1cGRhdGVcIixcblx0XHRcdGR0OiB0aGlzLmNsb2NrLmdldERlbHRhKCksXG5cdFx0XHR0aW1lOiB0aGlzLmNsb2NrLnRpbWVcblx0XHR9KTtcblx0XHRcblx0XHRfcmVuZGVyZXIucmVuZGVyKCB0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYS5vYmplY3QgKTtcblxuXHR9LFxuXHRcblx0ZGVzdHJveSA6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSggdGhpcy5yZXF1ZXN0ZWRGcmFtZSApO1xuXHRcdFxuXHRcdHRoaXMuZGlzcGF0Y2goe1xuXHRcdFx0dHlwZTogXCJkZXN0cm95XCJcblx0XHR9KTtcblx0fVxufTtcblxuRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5hcHBseSggUG9lbS5wcm90b3R5cGUgKTsiLCJ2YXIgSW5mbyA9IGZ1bmN0aW9uKCBwb2VtLCBwcm9wZXJ0aWVzICkge1xuXHRcblx0aWYoIHByb3BlcnRpZXMuYXBwZW5kQ3JlZGl0cyApICQoJy5jcmVkaXRzJykuYXBwZW5kKCBwcm9wZXJ0aWVzLmFwcGVuZENyZWRpdHMgKTtcblx0aWYoIHByb3BlcnRpZXMudGl0bGUgKSAkKFwiI2luZm8tdGl0bGVcIikudGV4dCggcHJvcGVydGllcy50aXRsZSApO1xuXHRpZiggcHJvcGVydGllcy5zdWJ0aXRsZSApICQoXCIjaW5mby1zdWJ0aXRsZVwiKS50ZXh0KCBwcm9wZXJ0aWVzLnN1YnRpdGxlKTtcblx0XG5cdGlmKCBwcm9wZXJ0aWVzLnRpdGxlQ3NzICkgJChcIiNpbmZvLXRpdGxlXCIpLmNzcyggcHJvcGVydGllcy50aXRsZUNzcyApO1xuXHRpZiggcHJvcGVydGllcy5zdWJ0aXRsZUNzcyApICQoXCIjaW5mby1zdWJ0aXRsZVwiKS5jc3MoIHByb3BlcnRpZXMuc3VidGl0bGVDc3MgKTtcblx0XG5cdFxuXHRpZiggcHJvcGVydGllcy5kb2N1bWVudFRpdGxlICkgZG9jdW1lbnQudGl0bGUgPSBwcm9wZXJ0aWVzLmRvY3VtZW50VGl0bGU7XG5cdFxuXHRpZiggcHJvcGVydGllcy5zaG93QXJyb3dOZXh0ICkgJChcIi5hcnJvdy1uZXh0XCIpLnNob3coKTtcblxuXHQkKFwiI2luZm9cIikuc2hvdygpO1xuXHRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW5mbzsiLCJ2YXIgU3RhcnMgPSBmdW5jdGlvbiggcG9lbSApIHtcblx0dGhpcy5wb2VtID0gcG9lbTtcblx0dGhpcy5vYmplY3QgPSBudWxsO1xuXHRcblx0dGhpcy5jb3VudCA9IDMwMDAwO1xuXHR0aGlzLmRlcHRoID0gNTAwMDtcblx0dGhpcy5taW5EZXB0aCA9IDcwMDtcblx0dGhpcy5jb2xvciA9IDB4YWFhYWFhO1xuXHRcblx0dGhpcy5hZGRPYmplY3QoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhcnM7XG5cblN0YXJzLnByb3RvdHlwZSA9IHtcblx0XG5cdGdlbmVyYXRlR2VvbWV0cnkgOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgciwgdGhldGEsIHgsIHksIHosIGdlb21ldHJ5O1xuXHRcdFxuXHRcdGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XG5cdFx0XG5cdFx0Zm9yKHZhciBpPTA7IGkgPCB0aGlzLmNvdW50OyBpKyspIHtcblx0XHRcdFxuXHRcdFx0ciA9IE1hdGgucmFuZG9tKCkgKiB0aGlzLmRlcHRoICsgdGhpcy5taW5EZXB0aDtcblxuXHRcdFx0dGhldGEgPSBNYXRoLnJhbmRvbSgpICogMiAqIE1hdGguUEk7XG5cdFx0XHRcblx0XHRcdHggPSBNYXRoLmNvcyggdGhldGEgKSAqIHI7XG5cdFx0XHR6ID0gTWF0aC5zaW4oIHRoZXRhICkgKiByO1xuXHRcdFx0eSA9ICgwLjUgLSBNYXRoLnJhbmRvbSgpKSAqIHRoaXMuZGVwdGg7XG5cdFx0XHRcblx0XHRcdGdlb21ldHJ5LnZlcnRpY2VzLnB1c2goIG5ldyBUSFJFRS5WZWN0b3IzKHgseSx6KSApO1xuXHRcdFx0XHRcdFxuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gZ2VvbWV0cnk7XG5cdH0sXG5cdFxuXHRhZGRPYmplY3QgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHR2YXIgZ2VvbWV0cnksIGxpbmVNYXRlcmlhbDtcblx0XHRcblx0XHRnZW9tZXRyeSA9IHRoaXMuZ2VuZXJhdGVHZW9tZXRyeSgpO1xuXHRcdFxuXHRcdFxuXHRcdHRoaXMub2JqZWN0ID0gbmV3IFRIUkVFLlBvaW50Q2xvdWQoXG5cdFx0XHRnZW9tZXRyeSxcblx0XHRcdG5ldyBUSFJFRS5Qb2ludENsb3VkTWF0ZXJpYWwoe1xuXHRcdFx0XHQgc2l6ZTogMyAqIHRoaXMucG9lbS5yYXRpbyxcblx0XHRcdFx0IGNvbG9yOiB0aGlzLmNvbG9yLFxuXHRcdFx0XHQgZm9nOiBmYWxzZVxuXHRcdFx0fVxuXHRcdCkgKTtcblx0XHRcblx0XHR0aGlzLnBvZW0uc2NlbmUuYWRkKCB0aGlzLm9iamVjdCApIDtcblx0XHRcblx0fVxufTsiLCJ2YXIgQ2FtZXJhID0gZnVuY3Rpb24oIHBvZW0sIHByb3BlcnRpZXMgKSB7XG5cdFxuXHR0aGlzLnBvZW0gPSBwb2VtO1xuXHRcdFx0XG5cdHRoaXMub2JqZWN0ID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKFxuXHRcdHByb3BlcnRpZXMuZm92IHx8IDUwLFx0XHRcdFx0XHQvLyBmb3Zcblx0XHR3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCxcdC8vIGFzcGVjdCByYXRpb1xuXHRcdHByb3BlcnRpZXMubmVhciB8fCAzLFx0XHRcdFx0XHQvLyBuZWFyIGZydXN0dW1cblx0XHRwcm9wZXJ0aWVzLmZhciB8fCAxMDAwXHRcdFx0XHRcdC8vIGZhciBmcnVzdHVtXG5cdCk7XG5cdFxuXHR0aGlzLm9iamVjdC5wb3NpdGlvbi54ID0gXy5pc051bWJlciggcHJvcGVydGllcy54ICkgPyBwcm9wZXJ0aWVzLnggOiAwO1xuXHR0aGlzLm9iamVjdC5wb3NpdGlvbi55ID0gXy5pc051bWJlciggcHJvcGVydGllcy55ICkgPyBwcm9wZXJ0aWVzLnkgOiAwO1xuXHR0aGlzLm9iamVjdC5wb3NpdGlvbi56ID0gXy5pc051bWJlciggcHJvcGVydGllcy56ICkgPyBwcm9wZXJ0aWVzLnogOiA1MDA7XG5cdFxuXHR0aGlzLnBvZW0uc2NlbmUuYWRkKCB0aGlzLm9iamVjdCApO1xuXHRcblx0dGhpcy5wb2VtLm9uKCAncmVzaXplJywgdGhpcy5yZXNpemUuYmluZCh0aGlzKSApO1xuXHRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FtZXJhO1xuXG5DYW1lcmEucHJvdG90eXBlID0ge1xuXHRcblx0cmVzaXplIDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5vYmplY3QuYXNwZWN0ID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cdFx0dGhpcy5vYmplY3QudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuXHR9XG59OyIsInZhciBPcmJpdENvbnRyb2xzID0gcmVxdWlyZSgnLi4vLi4vdmVuZG9yL09yYml0Q29udHJvbHMnKTtcblxudmFyIENvbnRyb2xzID0gZnVuY3Rpb24oIHBvZW0sIHByb3BlcnRpZXMgKSB7XG5cdFxuXHR0aGlzLnBvZW0gPSBwb2VtO1xuXHR0aGlzLnByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzO1xuXG5cdHRoaXMuY29udHJvbHMgPSBuZXcgT3JiaXRDb250cm9scyggdGhpcy5wb2VtLmNhbWVyYS5vYmplY3QsIHRoaXMucG9lbS5jYW52YXMgKTtcblx0XG5cdF8uZXh0ZW5kKCB0aGlzLmNvbnRyb2xzLCBwcm9wZXJ0aWVzICk7XG5cdFxuXHR0aGlzLnBvZW0ub24oICd1cGRhdGUnLCB0aGlzLmNvbnRyb2xzLnVwZGF0ZS5iaW5kKCB0aGlzLmNvbnRyb2xzICkgKTtcblx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xzO1xuIiwidmFyIFRyYWNrQ2FtZXJhTGlnaHRzID0gZnVuY3Rpb24oIHBvZW0sIHByb3BlcnRpZXMgKSB7XG5cdFxuXHR0aGlzLmxpZ2h0cyA9IFtdO1xuXHRcblx0dmFyIGFtYmllbnQgPSBuZXcgVEhSRUUuQW1iaWVudExpZ2h0KCAweDExMTExMSwgMSwgMCApO1xuXHRcdGFtYmllbnQucG9zaXRpb24uc2V0KDAsIDIwMDAsIDEwMDApO1xuXHRcblx0dmFyIGZyb250ID0gbmV3IFRIUkVFLlBvaW50TGlnaHQoIDB4ZmZmZmZmLCAwLjMsIDAgKTtcblxuXHR2YXIgcmlnaHRGaWxsID0gbmV3IFRIUkVFLlBvaW50TGlnaHQoIDB4ZmZmZmZmLCAxLCAwICk7XG5cdFx0cmlnaHRGaWxsLnBvc2l0aW9uLnNldCgzMDAwLCAyMDAwLCA1MDAwKTtcblx0XG5cdHZhciByaW1Cb3R0b20gPSBuZXcgVEhSRUUuUG9pbnRMaWdodCggMHhmZmZmZmYsIDEsIDAgKTtcblx0XHRyaW1Cb3R0b20ucG9zaXRpb24uc2V0KC0xMDAwLCAtMTAwMCwgLTEwMDApO1xuXHRcdFxuXHR2YXIgcmltQmFja0xlZnQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCggMHhmZmZmZmYsIDIsIDAgKTtcblx0XHRyaW1CYWNrTGVmdC5wb3NpdGlvbi5zZXQoLTcwMCwgNTAwLCAtMTAwMCk7XG5cdFxuXHRwb2VtLnNjZW5lLmFkZCggYW1iaWVudCApO1xuXHQvLyBwb2VtLmNhbWVyYS5vYmplY3QuYWRkKCBmcm9udCApO1xuXHRwb2VtLmNhbWVyYS5vYmplY3QuYWRkKCByaWdodEZpbGwgKTtcblx0cG9lbS5jYW1lcmEub2JqZWN0LmFkZCggcmltQm90dG9tICk7XG5cdHBvZW0uY2FtZXJhLm9iamVjdC5hZGQoIHJpbUJhY2tMZWZ0ICk7XG5cdFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUcmFja0NhbWVyYUxpZ2h0cztcblxuVHJhY2tDYW1lcmFMaWdodHMucHJvdG90eXBlID0ge1xuXG59OyIsInZhciBNckRvb2JTdGF0cyA9IHJlcXVpcmUoJy4uLy4uL3ZlbmRvci9TdGF0cycpO1xuXG52YXIgU3RhdHMgPSBmdW5jdGlvbiggcG9lbSApIHtcblx0XG5cdHRoaXMucG9lbSA9IHBvZW07XG5cdFxuXHR0aGlzLnN0YXRzID0gbmV3IE1yRG9vYlN0YXRzKCk7XG5cdHRoaXMuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG5cdHRoaXMuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4Jztcblx0JCggdGhpcy5wb2VtLmRpdiApLmFwcGVuZCggdGhpcy5zdGF0cy5kb21FbGVtZW50ICk7XG5cdFxuXHR0aGlzLnBvZW0ub24oICd1cGRhdGUnLCB0aGlzLnN0YXRzLnVwZGF0ZS5iaW5kKCB0aGlzLnN0YXRzICkgKTtcblx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXRzOyIsInZhciByYW5kb20gPSByZXF1aXJlKCcuLi91dGlscy9yYW5kb20nKVxuICAsIGxvYWRUZXh0dXJlXHQ9IHJlcXVpcmUoJy4uL3V0aWxzL2xvYWRUZXh0dXJlJylcbiAgLCBSU1ZQID0gcmVxdWlyZSgncnN2cCcpO1xuXG52YXIgRWFydGggPSBmdW5jdGlvbihwb2VtLCBwcm9wZXJ0aWVzKSB7XG5cdFxuXHR0aGlzLnBvZW0gPSBwb2VtO1xuXHRcblx0dGhpcy5nZW9tZXRyeSA9IG51bGw7XG5cdHRoaXMubWF0ZXJpYWwgPSBudWxsO1xuICAgIHRoaXMubWVzaCA9IG51bGw7XG5cdHRoaXMudGV4dHVyZSA9IG51bGw7XG5cdFxuXHQkKCcjTGV2ZWxTZWxlY3QnKS5oaWRlKCk7XG5cdFxuXHR0aGlzLnJhZGl1cyA9IHByb3BlcnRpZXMucmFkaXVzID4gMCA/IHByb3BlcnRpZXMucmFkaXVzIDogMjUwO1xuXG5cdHZhciAkYSA9ICQoXCI8YSBocmVmPSdodHRwOi8vc3ZzLmdzZmMubmFzYS5nb3YvY2dpLWJpbi9kZXRhaWxzLmNnaT9haWQ9MTE3MTknPjwvYT5cIik7XG5cdCRhLmFwcGVuZCggJChcIjxpbWcgY2xhc3M9J25hc2EtbG9nbyB3aWRlJyBzcmM9J2Fzc2V0cy9pbWFnZXMvbmFzYS1nb2RkYXJkLnBuZycgLz5cIikgKTtcblx0JGEuYXR0cihcInRpdGxlXCIsIFwiTWFwIHZpc3VhbGl6YXRpb24gY3JlZGl0IHRvIE5BU0EncyBHb2RkYXJkIFNwYWNlIEZsaWdodCBDZW50ZXJcIik7XG5cdFxuXHR0aGlzLnBvZW0uJGRpdi5hcHBlbmQoICRhICk7XG5cdFxuXHR0aGlzLnN0YXJ0KCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVhcnRoO1xuXG5FYXJ0aC5wcm90b3R5cGUgPSB7XG5cdFxuXHRzdGFydCA6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdHRoaXMuY3JlYXRlVGV4dHVyZSgpO1xuXG5cdFx0dGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSggdGhpcy5yYWRpdXMsIDY0LCA2NCApO1xuXHRcdHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuXHRcdFx0bWFwOiB0aGlzLnRleHR1cmUsXG5cdFx0XHRzaGluaW5lc3M6IDI1LFxuXHRcdFx0c3BlY3VsYXI6IDB4MTExMTExLFxuXHRcdFx0Ly8gY29sb3I6IDB4ZmYwMDAwXG5cdFx0fSk7XG5cdFxuXHRcdHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKCB0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsICk7XG5cdFxuXHRcdHRoaXMucG9lbS5zY2VuZS5hZGQoIHRoaXMubWVzaCApO1xuXHRcblx0XHR0aGlzLnBvZW0ub24oICd1cGRhdGUnLCB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpICk7XG5cdFx0XG5cdH0sXG5cdFxuXHRjcmVhdGVUZXh0dXJlIDogZnVuY3Rpb24oKSB7XG5cdFx0XG5cdFx0dGhpcy52aWRlbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICd2aWRlbycgKTtcblx0XHR0aGlzLiR2aWRlbyA9ICQodGhpcy52aWRlbyk7XG5cblx0XHQvLyB0aGlzLnZpZGVvLm11dGVkID0gdHJ1ZTtcblx0XHR0aGlzLnZpZGVvLmNvbnRyb2xzID0gdHJ1ZTtcblx0XHR0aGlzLnZpZGVvLmxvb3AgPSB0cnVlO1xuXHRcdFxuXHRcdC8vIHRoaXMucG9lbS4kZGl2LmFwcGVuZCggdGhpcy52aWRlbyApO1xuXHRcdFxuXHRcdC8vIHRoaXMuJHZpZGVvLmNzcyh7XG5cdFx0Ly8gXHRwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxuXHRcdC8vIFx0dG9wOiAwLFxuXHRcdC8vIFx0bGVmdDogMFxuXHRcdC8vIH0pO1xuXHRcdFxuXHRcdC8vIHdpbmRvdy52ID0gdGhpcy52aWRlbztcblx0XHRcblx0XHRcblx0XHQvLyB2aWRlby5pZCA9ICd2aWRlbyc7XG5cdFx0Ly8gdmlkZW8udHlwZSA9ICcgdmlkZW8vb2dnOyBjb2RlY3M9XCJ0aGVvcmEsIHZvcmJpc1wiICc7XG5cdFx0Ly8gdGhpcy52aWRlby5zcmMgPSBcImFzc2V0cy92aWRlby9lYXJ0aGNvMi5tNHZcIjtcblx0XHRcblx0XHRcdFxuXHRcdGlmKCB0aGlzLnZpZGVvLmNhblBsYXlUeXBlKFwidmlkZW8vbXA0XCIpICkge1xuXHRcdFx0XG5cdFx0XHR0aGlzLnZpZGVvLnNyYyA9IFwiYXNzZXRzL3ZpZGVvL2VhcnRoY28yLWxhcmdlLm1wNFwiO1xuXHRcdFx0XG5cdFx0fSBlbHNlIHtcblx0XHRcdFxuXHRcdFx0dGhpcy52aWRlby5zcmMgPSBcImFzc2V0cy92aWRlby9lYXJ0aGNvMi53ZWJtXCI7XG5cdFx0XHRcblx0XHR9XG5cdFx0XHRcblx0XHRcdFx0XG5cdFx0XG5cdFx0dGhpcy52aWRlby5sb2FkKCk7IC8vIG11c3QgY2FsbCBhZnRlciBzZXR0aW5nL2NoYW5naW5nIHNvdXJjZVxuXHRcdHRoaXMudmlkZW8ucGxheSgpO1xuXHRcblx0XHR0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XG5cdFx0Ly8gdGhpcy5jYW52YXMud2lkdGggPSA5NjA7XG5cdFx0Ly8gdGhpcy5jYW52YXMuaGVpZ2h0ID0gNDgwO1xuXHRcdHRoaXMuY2FudmFzLndpZHRoID0gMTkyMDtcblx0XHR0aGlzLmNhbnZhcy5oZWlnaHQgPSA5NjA7XG5cblxuXHRcdHRoaXMuY3R4MmQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICk7XG5cdFx0Ly8gYmFja2dyb3VuZCBjb2xvciBpZiBubyB2aWRlbyBwcmVzZW50XG5cdFx0dGhpcy5jdHgyZC5maWxsU3R5bGUgPSAnIzAwMDAwMCc7XG5cdFx0dGhpcy5jdHgyZC5maWxsUmVjdCggMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCApO1xuXG5cdFx0dGhpcy50ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUoIHRoaXMuY2FudmFzICk7XG5cdFx0dGhpcy50ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhckZpbHRlcjtcblx0XHR0aGlzLnRleHR1cmUubWFnRmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuXHRcdFxuXHR9LFxuXHRcblx0ZXJyb3IgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0fSxcblx0XG5cdHVwZGF0ZSA6IGZ1bmN0aW9uKGUpIHtcblx0XHRcblx0XHRpZiAoIHRoaXMudmlkZW8ucmVhZHlTdGF0ZSA9PT0gdGhpcy52aWRlby5IQVZFX0VOT1VHSF9EQVRBICkge1xuXHRcdFx0XG5cdFx0XHR0aGlzLmN0eDJkLmRyYXdJbWFnZSggdGhpcy52aWRlbywgMCwgMCApO1xuXHRcdFx0XG5cdFx0XHRpZiAoIHRoaXMudGV4dHVyZSApIHRoaXMudGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cdFx0XHRcblx0XHR9XG5cdFx0XG5cdFx0dGhpcy5tZXNoLnJvdGF0aW9uLnkgKz0gZS5kdCAqIDAuMDAwMDU7XG5cdFx0XG5cdH1cblx0XG59OyIsInZhciByYW5kb20gPSByZXF1aXJlKCcuLi91dGlscy9yYW5kb20nKTtcblxudmFyIEdyaWQgPSBmdW5jdGlvbiggcG9lbSwgcHJvcGVydGllcyApIHtcblx0XG5cdHRoaXMucG9lbSA9IHBvZW07XG5cblx0dmFyIGxpbmVNYXRlcmlhbCA9IG5ldyBUSFJFRS5MaW5lQmFzaWNNYXRlcmlhbCggeyBjb2xvcjogMHgzMDMwMzAgfSApLFxuXHRcdGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCksXG5cdFx0Zmxvb3IgPSAtNzUsIHN0ZXAgPSAyNTtcblxuXHRmb3IgKCB2YXIgaSA9IDA7IGkgPD0gNDA7IGkgKysgKSB7XG5cblx0XHRnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKCBuZXcgVEhSRUUuVmVjdG9yMyggLSA1MDAsIGZsb29yLCBpICogc3RlcCAtIDUwMCApICk7XG5cdFx0Z2VvbWV0cnkudmVydGljZXMucHVzaCggbmV3IFRIUkVFLlZlY3RvcjMoICAgNTAwLCBmbG9vciwgaSAqIHN0ZXAgLSA1MDAgKSApO1xuXG5cdFx0Z2VvbWV0cnkudmVydGljZXMucHVzaCggbmV3IFRIUkVFLlZlY3RvcjMoIGkgKiBzdGVwIC0gNTAwLCBmbG9vciwgLTUwMCApICk7XG5cdFx0Z2VvbWV0cnkudmVydGljZXMucHVzaCggbmV3IFRIUkVFLlZlY3RvcjMoIGkgKiBzdGVwIC0gNTAwLCBmbG9vciwgIDUwMCApICk7XG5cblx0fVxuXG5cdHRoaXMuZ3JpZCA9IG5ldyBUSFJFRS5MaW5lKCBnZW9tZXRyeSwgbGluZU1hdGVyaWFsLCBUSFJFRS5MaW5lUGllY2VzICk7XG5cdHRoaXMucG9lbS5zY2VuZS5hZGQoIHRoaXMuZ3JpZCApO1xuXHRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR3JpZDsiLCJ2YXIgY2FsY3VsYXRlU3F1YXJlZFRleHR1cmVXaWR0aCA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL2NhbGN1bGF0ZVNxdWFyZWRUZXh0dXJlV2lkdGgnKVxuICAsIGxvYWRUZXh0dXJlXHQ9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL2xvYWRUZXh0dXJlJylcbiAgLCBsb2FkVGV4dFx0PSByZXF1aXJlKCcuLi8uLi91dGlscy9sb2FkVGV4dCcpXG4gICwgUlNWUCA9IHJlcXVpcmUoJ3JzdnAnKTtcblxudmFyIE1lc2hHcm91cCA9IGZ1bmN0aW9uKCBwb2VtICkge1xuXHRcblx0VEhSRUUuT2JqZWN0M0QuY2FsbCggdGhpcyApO1xuXHRcblx0dGhpcy5wb2VtID0gcG9lbTtcblx0dGhpcy50eXBlID0gJ01lc2hHcm91cCc7XG5cdHRoaXMuYnVmZmVyR2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcblx0XG5cdHRoaXMubWF0cmljZXNUZXh0dXJlV2lkdGggPSBudWxsO1xuXHR0aGlzLm1hdHJpY2VzRGF0YSA9IG51bGw7XG5cdHRoaXMubWF0cml4SW5kaWNlcyA9IG51bGw7XG5cdFxuXHR0aGlzLnRleHR1cmUgPSBudWxsO1xuXHR0aGlzLnZlcnRleFNoYWRlciA9IG51bGw7XG5cdHRoaXMuZnJhZ21lbnRTaGFkZXIgPSBudWxsO1xuXHRcblx0dGhpcy5sb2FkZWQgPSBSU1ZQLmFsbChbXG5cdFx0bG9hZFRleHR1cmUoIFwiYXNzZXRzL2ltYWdlcy9zaW5lZ3Jhdml0eWNsb3VkLnBuZ1wiLCB0aGlzLCBcInRleHR1cmVcIiApLFxuXHRcdGxvYWRUZXh0KCBcImpzL2RlbW9zL01lc2hHcm91cEJveERlbW8vc2hhZGVyLnZlcnRcIiwgdGhpcywgXCJ2ZXJ0ZXhTaGFkZXJcIiApLFxuXHRcdGxvYWRUZXh0KCBcImpzL2RlbW9zL01lc2hHcm91cEJveERlbW8vc2hhZGVyLmZyYWdcIiwgdGhpcywgXCJmcmFnbWVudFNoYWRlclwiIClcblx0XSlcblx0LmNhdGNoKCBmdW5jdGlvbiggZXJyb3IgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQ291bGQgbm90IGxvYWQgYXNzZXRzIGZvciB0aGUgTWVzaEdyb3VwXCIsIGVycm9yKTtcblx0fSk7XG5cdFx0XG59O1xuXG5NZXNoR3JvdXAucHJvdG90eXBlID0gXy5leHRlbmQoIE9iamVjdC5jcmVhdGUoIFRIUkVFLk9iamVjdDNELnByb3RvdHlwZSApLCB7XG5cblx0YnVpbGQgOiBmdW5jdGlvbiggc2NlbmUgKSB7XG5cdFx0XG5cdFx0dGhpcy5sb2FkZWQudGhlbiggZnVuY3Rpb24oKSB7XG5cdFx0XHRcblx0XHRcdHRoaXMuYnVpbGRHZW9tZXRyeSgpO1xuXHRcdFx0dGhpcy5idWlsZE1hdHJpY2VzKCk7XG5cdFx0XHR0aGlzLmJ1aWxkTWF0ZXJpYWwoKVxuXHRcdFx0XG5cdFx0XHR0aGlzLm9iamVjdCA9IG5ldyBUSFJFRS5Qb2ludENsb3VkKCB0aGlzLmJ1ZmZlckdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsICk7XG5cdFx0XHRcblx0XHRcdHNjZW5lLmFkZCggdGhpcy5vYmplY3QgKTtcblx0XHRcdFxuXHRcdFx0dGhpcy5wb2VtLm9uKCAndXBkYXRlJywgdGhpcy51cGRhdGUuYmluZCh0aGlzKSApO1xuXHRcdFx0XG5cdFx0XHRcblx0XHR9LmJpbmQodGhpcykgKTtcblx0XHRcblx0fSxcblx0XG5cdGJ1aWxkR2VvbWV0cnkgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHR2YXIgbWVyZ2VkR2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcblx0XHRcblx0XHR2YXIgY2hpbGRHZW9tZXRyeTtcblx0XHR2YXIgbWF0cml4SW5kaWNlcyA9IFtdO1xuXHRcdHZhciBpLCBpbCwgaiwgamw7XG5cdFx0XG5cdFx0Zm9yKCBpID0gMCwgaWwgPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGlsOyBpKysgKSB7XG5cdFx0XHRcblx0XHRcdGNoaWxkR2VvbWV0cnkgPSB0aGlzLmNoaWxkcmVuW2ldLmdlb21ldHJ5O1xuXHRcdFx0XG5cdFx0XHRpZiggY2hpbGRHZW9tZXRyeSApIHtcblx0XHRcdFx0XG5cdFx0XHRcdG1lcmdlZEdlb21ldHJ5Lm1lcmdlKCBjaGlsZEdlb21ldHJ5ICk7XG5cdFx0XHRcdFxuXHRcdFx0XHRqID0gbWVyZ2VkR2VvbWV0cnkudmVydGljZXMubGVuZ3RoIC0gY2hpbGRHZW9tZXRyeS52ZXJ0aWNlcy5sZW5ndGg7XG5cdFx0XHRcdGpsID0gbWVyZ2VkR2VvbWV0cnkudmVydGljZXMubGVuZ3RoO1xuXHRcdFx0XHRcblx0XHRcdFx0Zm9yKCA7IGogPCBqbDsgaisrICkge1xuXHRcdFx0XHRcdG1hdHJpeEluZGljZXNbal0gPSBpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0fVxuXHRcdFxuXHRcdHRoaXMuYnVmZmVyR2VvbWV0cnkuZnJvbUdlb21ldHJ5KCBtZXJnZWRHZW9tZXRyeSApO1xuXHRcdFx0XHRcblx0fSxcblx0XG5cdGdlbmVyYXRlVHJhbnNmb3JtTWF0cml4SW5kaWNlcyA6IGZ1bmN0aW9uKCBvYmplY3QzRHMgKSB7XG5cdFx0XG5cdFx0dmFyIG1hdHJpeEluZGljZXMgPSBbXTtcblx0XHR2YXIgdG90YWxMZW5ndGggPSAwO1xuXHRcdHZhciBwb3NpdGlvbnNJbkZhY2VzO1xuXHRcdHZhciBjaGlsZEdlb21ldHJ5O1xuXHRcdFxuXHRcdGZvciggaSA9IDAsIGlsID0gb2JqZWN0M0RzLmxlbmd0aDsgaSA8IGlsOyBpKysgKSB7XG5cdFx0XHRcblx0XHRcdGNoaWxkR2VvbWV0cnkgPSBvYmplY3QzRHNbaV0uZ2VvbWV0cnk7XG5cdFx0XHRcblx0XHRcdGlmKCBjaGlsZEdlb21ldHJ5ICkge1xuXHRcdFx0XHRcblx0XHRcdFx0cG9zaXRpb25zSW5GYWNlcyA9IGNoaWxkR2VvbWV0cnkuZmFjZXMubGVuZ3RoICogMzsgLy8zIHZlcnRpY2VzIHBlciBmYWNlXG5cdFx0XHRcdHRvdGFsTGVuZ3RoICs9IHBvc2l0aW9uc0luRmFjZXM7XG5cdFx0XHRcdFxuXHRcdFx0XHRqID0gdG90YWxMZW5ndGggLSBwb3NpdGlvbnNJbkZhY2VzO1xuXHRcdFx0XHRqbCA9IHRvdGFsTGVuZ3RoO1xuXHRcdFx0XHRcblx0XHRcdFx0Zm9yKCA7IGogPCBqbDsgaisrICkge1xuXHRcdFx0XHRcdG1hdHJpeEluZGljZXNbal0gPSBpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBuZXcgRmxvYXQzMkFycmF5KCBtYXRyaXhJbmRpY2VzICk7XG5cdH0sXG5cdFxuXHRidWlsZE1hdHJpY2VzIDogZnVuY3Rpb24oKSB7XG5cdFx0XG5cdFx0Ly9DYWxjdWxhdGVzIHRoZSBuXjIgd2lkdGggb2YgdGhlIHRleHR1cmVcblx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZVdpZHRoID0gY2FsY3VsYXRlU3F1YXJlZFRleHR1cmVXaWR0aCggdGhpcy5jaGlsZHJlbi5sZW5ndGggKiAxNiApOyAvLzE2IGZsb2F0cyBwZXIgbWF0cml4XG5cdFx0XG5cdFx0Ly9UaGUgdGV4dHVyZSBoYXMgNCBmbG9hdHMgcGVyIHBpeGVsXG5cdFx0dGhpcy5tYXRyaWNlc0RhdGEgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLm1hdHJpY2VzVGV4dHVyZVdpZHRoICogdGhpcy5tYXRyaWNlc1RleHR1cmVXaWR0aCAqIDQgKTtcblx0XHRcblx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZSA9IG5ldyBUSFJFRS5EYXRhVGV4dHVyZShcblx0XHRcdHRoaXMubWF0cmljZXNEYXRhLFxuXHRcdFx0dGhpcy5tYXRyaWNlc1RleHR1cmVXaWR0aCxcblx0XHRcdHRoaXMubWF0cmljZXNUZXh0dXJlV2lkdGgsXG5cdFx0XHRUSFJFRS5SR0JBRm9ybWF0LFxuXHRcdFx0VEhSRUUuRmxvYXRUeXBlXG5cdFx0KTtcblx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xuXHRcdHRoaXMubWF0cmljZXNUZXh0dXJlLm1hZ0ZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XG5cdFx0dGhpcy5tYXRyaWNlc1RleHR1cmUuZ2VuZXJhdGVNaXBtYXBzID0gZmFsc2U7XG5cdFx0dGhpcy5tYXRyaWNlc1RleHR1cmUuZmxpcFkgPSBmYWxzZTtcblx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cdFx0XG5cdH0sXG5cdFxuXHRidWlsZE1hdGVyaWFsIDogZnVuY3Rpb24oKSB7XG5cdFx0XG5cdFx0dGhpcy5hdHRyaWJ1dGVzID0ge1xuXHRcdFx0XG5cdFx0XHR0cmFuc2Zvcm1JbmRleDpcdHsgdHlwZTogJ2YnLCB2YWx1ZTogbnVsbCB9XG5cdFx0XHRcblx0XHR9O1xuXHRcdFxuXHRcdHRoaXMubWF0cml4SW5kaWNlcyA9IHRoaXMuZ2VuZXJhdGVUcmFuc2Zvcm1NYXRyaXhJbmRpY2VzKCB0aGlzLmNoaWxkcmVuICk7XG5cdFx0XG5cdFx0dGhpcy5idWZmZXJHZW9tZXRyeS5hZGRBdHRyaWJ1dGUoICd0cmFuc2Zvcm1NYXRyaXhJbmRleCcsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIHRoaXMubWF0cml4SW5kaWNlcywgMSApICk7XG5cblx0XHR0aGlzLnVuaWZvcm1zID0ge1xuXHRcdFx0XG5cdFx0XHRjb2xvcjogICAgIFx0XHRcdFx0eyB0eXBlOiBcImNcIiwgdmFsdWU6IG5ldyBUSFJFRS5Db2xvciggMHhmZjAwMDAgKSB9LFxuXHRcdFx0bWF0cmljZXNUZXh0dXJlOlx0XHR7IHR5cGU6IFwidFwiLCB2YWx1ZTogdGhpcy5tYXRyaWNlc1RleHR1cmUgfSxcblx0XHRcdHRpbWU6ICAgICAgXHRcdFx0XHR7IHR5cGU6ICdmJywgdmFsdWU6IERhdGUubm93KCkgfSxcblx0XHRcdHRleHR1cmU6ICAgXHRcdFx0XHR7IHR5cGU6IFwidFwiLCB2YWx1ZTogdGhpcy50ZXh0dXJlIH0sXG5cdFx0XHRtYXRyaWNlc1RleHR1cmVXaWR0aDpcdHsgdHlwZTogJ2YnLCB2YWx1ZTogdGhpcy5tYXRyaWNlc1RleHR1cmVXaWR0aCB9XG5cdFx0XHRcblx0XHR9O1xuXG5cdFx0dGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCgge1xuXHRcdFx0XG5cdFx0XHR1bmlmb3JtczogICAgICAgdGhpcy51bmlmb3Jtcyxcblx0XHRcdGF0dHJpYnV0ZXM6ICAgICB0aGlzLmF0dHJpYnV0ZXMsXG5cdFx0XHR2ZXJ0ZXhTaGFkZXI6ICAgdGhpcy52ZXJ0ZXhTaGFkZXIsXG5cdFx0XHRmcmFnbWVudFNoYWRlcjogdGhpcy5mcmFnbWVudFNoYWRlcixcblx0XHRcdFxuXHRcdFx0YmxlbmRpbmc6ICAgICAgIFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG5cdFx0XHRkZXB0aFRlc3Q6ICAgICAgZmFsc2UsXG5cdFx0XHR0cmFuc3BhcmVudDogICAgdHJ1ZVxuXHRcdFx0XG5cdFx0fSk7XG5cdFx0XHRcdFxuXHR9LFxuXHRcblx0dXBkYXRlIDogZnVuY3Rpb24oKSB7XG5cdFx0XG5cdFx0Zm9yKCB2YXIgaSA9IDAsIGlsID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkgPCBpbCA7IGkrKyApIHtcblxuXHRcdFx0dGhpcy5jaGlsZHJlbltpXS5tYXRyaXguZmxhdHRlblRvQXJyYXlPZmZzZXQoIHRoaXMubWF0cmljZXNEYXRhLCBpICogMTYgKTtcblx0XHRcdHRoaXMubWF0cmljZXNUZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblx0XHRcdFxuXHRcdH1cblx0XHRcblx0fVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNZXNoR3JvdXA7IiwidmFyIE1lc2hHcm91cCA9IHJlcXVpcmUoJy4vTWVzaEdyb3VwJylcbiAgLCByYW5kb20gPSByZXF1aXJlKCcuLi8uLi91dGlscy9yYW5kb20nKVxuICAsIHR3b8+AID0gTWF0aC5QSSAqIDI7XG5cbnZhciBNZXNoR3JvdXBCb3hEZW1vID0gZnVuY3Rpb24oIHBvZW0sIHByb3BlcnRpZXMgKSB7XG5cdFxuXHR0aGlzLnBvZW0gPSBwb2VtO1xuXHRcblx0dGhpcy5jb3VudCA9IDEwMDAwO1xuXHRcblx0dGhpcy5wb2VtLm9uKCd1cGRhdGUnLCB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpICk7XG5cdFxuXHR0aGlzLmdyb3VwID0gbmV3IE1lc2hHcm91cCggcG9lbSApO1xuXHRcblx0dGhpcy5ib3hlcyA9IHRoaXMuZ2VuZXJhdGVCb3hlcyggdGhpcy5ncm91cCApO1xuXG5cdHRoaXMuZ3JvdXAuYnVpbGQoIHBvZW0uc2NlbmUgKTtcblx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1lc2hHcm91cEJveERlbW87XG5cbk1lc2hHcm91cEJveERlbW8ucHJvdG90eXBlID0ge1xuXG5cdGdlbmVyYXRlQm94ZXMgOiBmdW5jdGlvbiggZ3JvdXAgKSB7XG5cdFx0XG5cdFx0dmFyIGJveGVzID0gW107XG5cdFx0XG5cdFx0dmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KCAxLCAxLCAxICk7XG5cdFx0dmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKCB7IGNvbG9yOiAweDAwZmYwMCB9ICk7XG5cdFx0dmFyIGN1YmU7XG5cdFx0XG5cdFx0dmFyIGkgPSB0aGlzLmNvdW50OyB3aGlsZSAoaS0tKSB7XG5cdFx0XHRcblx0XHRcdGJveCA9IG5ldyBUSFJFRS5NZXNoKCBuZXcgVEhSRUUuQm94R2VvbWV0cnkoIDEsIDEsIDEgKSApO1xuXHRcdFx0XG5cdFx0XHRib3gucG9zaXRpb24ueCA9IHJhbmRvbS5yYW5nZSggLTEwMCwgMTAwICk7XG5cdFx0XHRib3gucG9zaXRpb24ueSA9IHJhbmRvbS5yYW5nZSggLTEwMCwgMTAwICk7XG5cdFx0XHRib3gucG9zaXRpb24ueiA9IHJhbmRvbS5yYW5nZSggLTEwMCwgMTAwICk7XG5cdFx0XHRcblx0XHRcdGJveC5yb3RhdGlvbi54ID0gcmFuZG9tLnJhbmdlKCAtdHdvz4AsIHR3b8+AICk7XG5cdFx0XHRib3gucm90YXRpb24ueSA9IHJhbmRvbS5yYW5nZSggLXR3b8+ALCB0d2/PgCApO1xuXHRcdFx0Ym94LnJvdGF0aW9uLnogPSByYW5kb20ucmFuZ2UoIC10d2/PgCwgdHdvz4AgKTtcblx0XHRcdFxuXHRcdFx0Ym94LnZlbG9jaXR5ID0gbmV3IFRIUkVFLlZlY3RvcjMoXG5cdFx0XHRcdFxuXHRcdFx0XHRyYW5kb20ucmFuZ2UoIC0xLCAxICksXG5cdFx0XHRcdHJhbmRvbS5yYW5nZSggLTEsIDEgKSxcblx0XHRcdFx0cmFuZG9tLnJhbmdlKCAtMSwgMSApXG5cdFx0XHRcdFxuXHRcdFx0KS5tdWx0aXBseVNjYWxhcigwLjEpO1xuXHRcdFx0XG5cdFx0XHRib3guc3BpbiA9IG5ldyBUSFJFRS5WZWN0b3IzKFxuXHRcdFx0XHRcblx0XHRcdFx0cmFuZG9tLnJhbmdlKCAtdHdvz4AsIHR3b8+AICksXG5cdFx0XHRcdHJhbmRvbS5yYW5nZSggLXR3b8+ALCB0d2/PgCApLFxuXHRcdFx0XHRyYW5kb20ucmFuZ2UoIC10d2/PgCwgdHdvz4AgKVxuXHRcdFx0XHRcblx0XHRcdCkubXVsdGlwbHlTY2FsYXIoMC4wMSk7XG5cdFx0XHRcblx0XHRcdGJveC5zY2FsZS5tdWx0aXBseVNjYWxhciggcmFuZG9tLnJhbmdlKCAxLCAyKSApO1xuXHRcdFx0XG5cdFx0XHRib3gudXBkYXRlTWF0cml4KClcblx0XHRcdFxuXHRcdFx0Ym94ZXMucHVzaCggYm94ICk7XG5cdFx0XHRcblx0XHRcdGdyb3VwLmFkZCggYm94ICk7XG5cdFx0XHRcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIGJveGVzO1xuXHRcdFxuXHR9LFxuXHRcblx0dXBkYXRlIDogZnVuY3Rpb24oIGUgKSB7XG5cdFx0XG5cdFx0dmFyIGJveDtcblx0XHRcblx0XHRmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuY291bnQ7IGkrKyApIHtcblx0XHRcdFxuXHRcdFx0Ym94ID0gdGhpcy5ib3hlc1tpXTtcblx0XHRcdFxuXHRcdFx0Ym94LnBvc2l0aW9uLmFkZCggYm94LnZlbG9jaXR5ICk7XG5cdFx0XHRcblx0XHRcdGJveC5yb3RhdGlvbi54ICs9IGJveC5zcGluLng7XG5cdFx0XHRib3gucm90YXRpb24ueSArPSBib3guc3Bpbi55O1xuXHRcdFx0Ym94LnJvdGF0aW9uLnogKz0gYm94LnNwaW4uejtcblx0XHRcdFxuXHRcdFx0Ym94LnVwZGF0ZU1hdHJpeCgpO1xuXHRcdFx0XG5cdFx0fVxuXHRcdFxuXHR9XG5cdFxufTsiLCJ2YXIgcmFuZG9tXHRcdD0gcmVxdWlyZSgnLi4vdXRpbHMvcmFuZG9tJylcbiAgLCBsb2FkVGV4dHVyZVx0PSByZXF1aXJlKCcuLi91dGlscy9sb2FkVGV4dHVyZScpXG4gICwgbG9hZFRleHRcdD0gcmVxdWlyZSgnLi4vdXRpbHMvbG9hZFRleHQnKVxuICAsIFJTVlBcdFx0PSByZXF1aXJlKCdyc3ZwJylcbjtcblxudmFyIFNpbmVHcmF2aXR5Q2xvdWQgPSBmdW5jdGlvbihwb2VtLCBwcm9wZXJ0aWVzKSB7XG5cdFxuXHR0aGlzLnBvZW0gPSBwb2VtO1xuXHRcblx0dGhpcy5vYmplY3QgPSBudWxsO1xuXHR0aGlzLm1hdGVyaWFsID0gbnVsbDtcblx0dGhpcy5hdHRyaWJ1dGVzID0gbnVsbDtcblx0dGhpcy51bmlmb3JtcyA9IG51bGw7XG5cblx0dGhpcy50ZXh0dXJlID0gbnVsbDtcblx0dGhpcy52ZXJ0ZXhTaGFkZXIgPSBudWxsO1xuXHR0aGlzLmZyYWdtZW50U2hhZGVyID0gbnVsbDtcblx0XG5cdHRoaXMuY291bnQgPSAyMDAwMDA7XG5cdHRoaXMucmFkaXVzID0gMjAwO1xuXHR0aGlzLnBvaW50U2l6ZSA9IDc7XG5cdFxuXHRcblx0UlNWUC5hbGwoW1xuXHRcdGxvYWRUZXh0dXJlKCBcImFzc2V0cy9pbWFnZXMvc2luZWdyYXZpdHljbG91ZC5wbmdcIiwgdGhpcywgXCJ0ZXh0dXJlXCIgKSxcblx0XHRsb2FkVGV4dCggXCJhc3NldHMvc2hhZGVycy9zaW5lZ3Jhdml0eWNsb3VkLnZlcnRcIiwgdGhpcywgXCJ2ZXJ0ZXhTaGFkZXJcIiApLFxuXHRcdGxvYWRUZXh0KCBcImFzc2V0cy9zaGFkZXJzL3NpbmVncmF2aXR5Y2xvdWQuZnJhZ1wiLCB0aGlzLCBcImZyYWdtZW50U2hhZGVyXCIgKVxuXHRdKVxuXHQudGhlbihcblx0XHR0aGlzLnN0YXJ0LmJpbmQodGhpcyksXG5cdFx0dGhpcy5lcnJvci5iaW5kKHRoaXMpXG5cdCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbmVHcmF2aXR5Q2xvdWQ7XG5cblNpbmVHcmF2aXR5Q2xvdWQucHJvdG90eXBlID0ge1xuXHRcblx0c3RhcnQgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHR0aGlzLmF0dHJpYnV0ZXMgPSB7XG5cblx0XHRcdHNpemU6ICAgICAgICB7IHR5cGU6ICdmJywgdmFsdWU6IG51bGwgfSxcblx0XHRcdGN1c3RvbUNvbG9yOiB7IHR5cGU6ICdjJywgdmFsdWU6IG51bGwgfVxuXG5cdFx0fTtcblxuXHRcdHRoaXMudW5pZm9ybXMgPSB7XG5cblx0XHRcdGNvbG9yOiAgICAgeyB0eXBlOiBcImNcIiwgdmFsdWU6IG5ldyBUSFJFRS5Db2xvciggMHhmZmZmZmYgKSB9LFxuXHRcdFx0dGV4dHVyZTogICB7IHR5cGU6IFwidFwiLCB2YWx1ZTogdGhpcy50ZXh0dXJlIH1cblxuXHRcdH07XG5cblx0XHR0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKCB7XG5cblx0XHRcdHVuaWZvcm1zOiAgICAgICB0aGlzLnVuaWZvcm1zLFxuXHRcdFx0YXR0cmlidXRlczogICAgIHRoaXMuYXR0cmlidXRlcyxcblx0XHRcdHZlcnRleFNoYWRlcjogICB0aGlzLnZlcnRleFNoYWRlcixcblx0XHRcdGZyYWdtZW50U2hhZGVyOiB0aGlzLmZyYWdtZW50U2hhZGVyLFxuXG5cdFx0XHRibGVuZGluZzogICAgICAgVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcblx0XHRcdGRlcHRoVGVzdDogICAgICBmYWxzZSxcblx0XHRcdHRyYW5zcGFyZW50OiAgICB0cnVlXG5cblx0XHR9KTtcblxuXHRcdHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcblxuXHRcdHRoaXMucG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5jb3VudCAqIDMgKTtcblx0XHR0aGlzLnZlbG9jaXR5ID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5jb3VudCAqIDMgKTtcblx0XHR0aGlzLmNvbG9ycyA9IG5ldyBGbG9hdDMyQXJyYXkoIHRoaXMuY291bnQgKiAzICk7XG5cdFx0dGhpcy5zaXplcyA9IG5ldyBGbG9hdDMyQXJyYXkoIHRoaXMuY291bnQgKTtcblxuXHRcdHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigweDAwMDAwMCk7XG5cdFx0XG5cdFx0dmFyIGh1ZTtcblx0XHRcblx0XHR2YXIgdGhldGEsIHBoaTtcblx0XHRcblx0XHR2YXIgeDtcblxuXHRcdGZvciggdmFyIHYgPSAwOyB2IDwgdGhpcy5jb3VudDsgdisrICkge1xuXG5cdFx0XHR0aGlzLnNpemVzWyB2IF0gPSB0aGlzLnBvaW50U2l6ZTtcblx0XHRcdFxuXHRcdFx0Ly8gdGhldGEgPSByYW5kb20ucmFuZ2VMb3coIDAuMSwgTWF0aC5QSSApO1xuXHRcdFx0Ly8gcGhpID0gcmFuZG9tLnJhbmdlTG93KCBNYXRoLlBJICogMC4zLCBNYXRoLlBJICk7XG5cdFx0XHQvL1xuXHRcdFx0Ly8gdGhpcy5wb3NpdGlvbnNbIHYgKiAzICsgMCBdID0gTWF0aC5zaW4oIHRoZXRhICkgKiBNYXRoLmNvcyggcGhpICkgKiB0aGlzLnJhZGl1cyAqIHRoZXRhICogNTtcblx0XHRcdC8vIHRoaXMucG9zaXRpb25zWyB2ICogMyArIDEgXSA9IE1hdGguc2luKCB0aGV0YSApICogTWF0aC5zaW4oIHBoaSApICogdGhpcy5yYWRpdXM7XG5cdFx0XHQvLyB0aGlzLnBvc2l0aW9uc1sgdiAqIDMgKyAyIF0gPSBNYXRoLmNvcyggdGhldGEgKSAqIHRoaXMucmFkaXVzICogMC4xO1xuXHRcdFx0XG5cdFx0XHR4ID0gcmFuZG9tLnJhbmdlKCAtMSwgMSApO1xuXHRcdFx0XG5cdFx0XHR0aGlzLnBvc2l0aW9uc1sgdiAqIDMgKyAwIF0gPSB4ICogdGhpcy5yYWRpdXM7XG5cdFx0XHR0aGlzLnBvc2l0aW9uc1sgdiAqIDMgKyAxIF0gPSBNYXRoLnNpbiggeCAqIE1hdGguUEkgKiAxMCApICogdGhpcy5yYWRpdXNcblx0XHRcdHRoaXMucG9zaXRpb25zWyB2ICogMyArIDIgXSA9IHRoaXMucmFkaXVzICogLTAuNTtcblxuXHRcdFx0dGhpcy52ZWxvY2l0eVsgdiAqIDMgKyAwIF0gPSByYW5kb20ucmFuZ2UoIC0wLjAxLCAwLjAxICkgKiAwO1xuXHRcdFx0dGhpcy52ZWxvY2l0eVsgdiAqIDMgKyAxIF0gPSByYW5kb20ucmFuZ2UoIC0wLjAxLCAwLjAxICkgKiAxMDtcblx0XHRcdHRoaXMudmVsb2NpdHlbIHYgKiAzICsgMiBdID0gcmFuZG9tLnJhbmdlKCAtMC4wMSwgMC4wMSApICogMDtcblxuXHRcdFx0Ly8gaHVlID0gKHYgLyB0aGlzLmNvdW50ICkgKiAwLjIgKyAwLjQ1O1xuXHRcdFx0XG5cdFx0XHRodWUgPSB4ICogMC4zICsgMC42NTtcblxuXHRcdFx0Y29sb3Iuc2V0SFNMKCBodWUsIDEuMCwgMC41NSApO1xuXG5cdFx0XHR0aGlzLmNvbG9yc1sgdiAqIDMgKyAwIF0gPSBjb2xvci5yO1xuXHRcdFx0dGhpcy5jb2xvcnNbIHYgKiAzICsgMSBdID0gY29sb3IuZztcblx0XHRcdHRoaXMuY29sb3JzWyB2ICogMyArIDIgXSA9IGNvbG9yLmI7XG5cblx0XHR9XG5cblx0XHR0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSggJ3Bvc2l0aW9uJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSggdGhpcy5wb3NpdGlvbnMsIDMgKSApO1xuXHRcdHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCAnY3VzdG9tQ29sb3InLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKCB0aGlzLmNvbG9ycywgMyApICk7XG5cdFx0dGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoICdzaXplJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSggdGhpcy5zaXplcywgMSApICk7XG5cblx0XHR0aGlzLm9iamVjdCA9IG5ldyBUSFJFRS5Qb2ludENsb3VkKCB0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsICk7XG5cdFx0dGhpcy5vYmplY3QucG9zaXRpb24ueSAtPSB0aGlzLnJhZGl1cyAqIDAuMjtcblx0XHRcblx0XHR0aGlzLnBvZW0uc2NlbmUuYWRkKCB0aGlzLm9iamVjdCApO1xuXHRcblx0XG5cdFx0dGhpcy5wb2VtLm9uKCAndXBkYXRlJywgdGhpcy51cGRhdGUuYmluZCh0aGlzKSApO1xuXHRcdFxuXHR9LFxuXHRcblx0ZXJyb3IgOiBmdW5jdGlvbiggZXJyb3IgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQ291bGQgbm90IGxvYWQgYXNzZXRzIGZvciB0aGUgU2luZUdyYXZpdHlDbG91ZFwiLCBlcnJvcik7XG5cdH0sXG5cdFxuXHR1cGRhdGUgOiBmdW5jdGlvbihlKSB7XG5cdFx0XG5cdFx0dmFyIGQyO1xuXHRcblx0XHRmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuY291bnQ7IGkrKyApIHtcblx0XHRcdFxuXHRcdFx0ZDIgPXRoaXMucG9zaXRpb25zWyBpICogMyArIDAgXSAqIHRoaXMucG9zaXRpb25zWyBpICogMyArIDAgXSArXG5cdFx0XHQgICAgdGhpcy5wb3NpdGlvbnNbIGkgKiAzICsgMSBdICogdGhpcy5wb3NpdGlvbnNbIGkgKiAzICsgMSBdICtcblx0XHRcdCAgICB0aGlzLnBvc2l0aW9uc1sgaSAqIDMgKyAyIF0gKiB0aGlzLnBvc2l0aW9uc1sgaSAqIDMgKyAyIF07XG5cblx0XHRcdHRoaXMudmVsb2NpdHlbIGkgKiAzICsgMCBdIC09IHRoaXMucG9zaXRpb25zWyBpICogMyArIDAgXSAvIGQyO1xuXHRcdFx0dGhpcy52ZWxvY2l0eVsgaSAqIDMgKyAxIF0gLT0gdGhpcy5wb3NpdGlvbnNbIGkgKiAzICsgMSBdIC8gZDI7XG5cdFx0XHR0aGlzLnZlbG9jaXR5WyBpICogMyArIDIgXSAtPSB0aGlzLnBvc2l0aW9uc1sgaSAqIDMgKyAyIF0gLyBkMjtcblxuXHRcdFx0dGhpcy5wb3NpdGlvbnNbIGkgKiAzICsgMCBdICs9IHRoaXMudmVsb2NpdHlbIGkgKiAzICsgMCBdO1xuXHRcdFx0dGhpcy5wb3NpdGlvbnNbIGkgKiAzICsgMSBdICs9IHRoaXMudmVsb2NpdHlbIGkgKiAzICsgMSBdO1xuXHRcdFx0dGhpcy5wb3NpdGlvbnNbIGkgKiAzICsgMiBdICs9IHRoaXMudmVsb2NpdHlbIGkgKiAzICsgMiBdO1xuXHRcdFx0XG5cdFx0fVxuXHRcdFxuXHRcdHRoaXMuZ2VvbWV0cnkuYXR0cmlidXRlcy5wb3NpdGlvbi5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cdFx0XG5cdH1cblx0XG59OyIsInZhciByYW5kb20gPSByZXF1aXJlKCcuLi91dGlscy9yYW5kb20nKTtcblxudmFyIFNwaGVyZXMgPSBmdW5jdGlvbihwb2VtLCBwcm9wZXJ0aWVzKSB7XG5cdFxuXHR0aGlzLnBvZW0gPSBwb2VtO1xuXG5cdHRoaXMuY291bnQgPSBwcm9wZXJ0aWVzLmNvdW50ID4gMCA/IHByb3BlcnRpZXMuY291bnQgOiAxMDtcblx0dGhpcy5kaXNwZXJzaW9uID0gcHJvcGVydGllcy5kaXNwZXJzaW9uIHx8IDEwO1xuXHR0aGlzLnJhZGl1cyA9IHByb3BlcnRpZXMucmFkaXVzID4gMCA/IHByb3BlcnRpZXMucmFkaXVzIDogMTtcblx0XG5cdHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoIHRoaXMucmFkaXVzLCAzMiwgMzIgKTtcblx0dGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCggeyBjb2xvciA6IDB4ZmYwMDAwIH0gKTtcblx0XG5cblx0dGhpcy5tZXNoZXMgPSBbXTtcblx0XG5cdHZhciBpPSAtMTsgd2hpbGUoICsraSA8IHByb3BlcnRpZXMuY291bnQgKSB7XG5cdFx0XG5cdFx0dmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaCggdGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCApO1xuXHRcdFxuXHRcdG1lc2gucG9zaXRpb24ueCA9IHJhbmRvbS5yYW5nZSggLXRoaXMuZGlzcGVyc2lvbiwgdGhpcy5kaXNwZXJzaW9uICk7XG5cdFx0bWVzaC5wb3NpdGlvbi55ID0gcmFuZG9tLnJhbmdlKCAtdGhpcy5kaXNwZXJzaW9uLCB0aGlzLmRpc3BlcnNpb24gKTtcblx0XHRtZXNoLnBvc2l0aW9uLnogPSByYW5kb20ucmFuZ2UoIC10aGlzLmRpc3BlcnNpb24sIHRoaXMuZGlzcGVyc2lvbiApO1xuXHRcdFxuXHRcdHRoaXMucG9lbS5zY2VuZS5hZGQoIG1lc2ggKTtcblx0XHR0aGlzLm1lc2hlcy5wdXNoKCBtZXNoICk7XG5cdH1cblx0XG5cdHRoaXMucG9lbS5vbiggJ3VwZGF0ZScsIHRoaXMudXBkYXRlLmJpbmQodGhpcykgKTtcblx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNwaGVyZXM7XG5cblNwaGVyZXMucHJvdG90eXBlID0ge1xuXHRcblx0dXBkYXRlIDogZnVuY3Rpb24oZSkge1xuXHRcdFxuXHRcdHZhciBpPSAtMTsgd2hpbGUoICsraSA8IHRoaXMuY291bnQgKSB7XG5cdFx0XG5cdFx0XHR0aGlzLm1lc2hlc1tpXS5wb3NpdGlvbi54ICs9IHJhbmRvbS5yYW5nZSggLTAuMDAwNSwgMC4wMDA1ICkgKiB0aGlzLmRpc3BlcnNpb24gKiBlLmR0O1xuXHRcdFx0dGhpcy5tZXNoZXNbaV0ucG9zaXRpb24ueSArPSByYW5kb20ucmFuZ2UoIC0wLjAwMDUsIDAuMDAwNSApICogdGhpcy5kaXNwZXJzaW9uICogZS5kdDtcblx0XHRcdHRoaXMubWVzaGVzW2ldLnBvc2l0aW9uLnogKz0gcmFuZG9tLnJhbmdlKCAtMC4wMDA1LCAwLjAwMDUgKSAqIHRoaXMuZGlzcGVyc2lvbiAqIGUuZHQ7XG5cdFx0XG5cdFx0fVxuXHRcdFxuXHR9XG5cdFxufTsiLCJ2YXIgcmFuZG9tXHRcdD0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvcmFuZG9tJylcbiAgLCBsb2FkVGV4dHVyZVx0PSByZXF1aXJlKCcuLi8uLi91dGlscy9sb2FkVGV4dHVyZScpXG4gICwgbG9hZFRleHRcdD0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvbG9hZFRleHQnKVxuICAsIFJTVlBcdFx0PSByZXF1aXJlKCdyc3ZwJylcbiAgLCBzaW1wbGV4Mlx0PSByZXF1aXJlKCcuLi8uLi91dGlscy9zaW1wbGV4MicpXG47XG5cdFxudmFyIFRleHR1cmVQb3NpdGlvbmFsTWF0cmljZXMgPSBmdW5jdGlvbihwb2VtLCBwcm9wZXJ0aWVzKSB7XG5cblx0dGhpcy5wb2VtID0gcG9lbTtcblx0XG5cdHRoaXMub2JqZWN0ID0gbnVsbDtcblx0dGhpcy5tYXRlcmlhbCA9IG51bGw7XG5cdHRoaXMuYXR0cmlidXRlcyA9IG51bGw7XG5cdHRoaXMudW5pZm9ybXMgPSBudWxsO1xuXG5cdHRoaXMudGV4dHVyZSA9IG51bGw7XG5cdHRoaXMudmVydGV4U2hhZGVyID0gbnVsbDtcblx0dGhpcy5mcmFnbWVudFNoYWRlciA9IG51bGw7XG5cdFxuXHR0aGlzLmNvdW50ID0gNTAwMDA7XG5cdHRoaXMucmFkaXVzID0gNDAwO1xuXHR0aGlzLnBvaW50U2l6ZSA9IDE0O1xuXHRcblx0UlNWUC5hbGwoW1xuXHRcdGxvYWRUZXh0dXJlKCBcImFzc2V0cy9pbWFnZXMvc2luZWdyYXZpdHljbG91ZC5wbmdcIiwgdGhpcywgXCJ0ZXh0dXJlXCIgKSxcblx0XHRsb2FkVGV4dCggXCJqcy9kZW1vcy9UZXh0dXJlUG9zaXRpb25hbE1hdHJpY2VzL3NoYWRlci52ZXJ0XCIsIHRoaXMsIFwidmVydGV4U2hhZGVyXCIgKSxcblx0XHRsb2FkVGV4dCggXCJqcy9kZW1vcy9UZXh0dXJlUG9zaXRpb25hbE1hdHJpY2VzL3NoYWRlci5mcmFnXCIsIHRoaXMsIFwiZnJhZ21lbnRTaGFkZXJcIiApXG5cdF0pXG5cdC50aGVuKFxuXHRcdHRoaXMuc3RhcnQuYmluZCh0aGlzKSxcblx0XHR0aGlzLmVycm9yLmJpbmQodGhpcylcblx0KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVGV4dHVyZVBvc2l0aW9uYWxNYXRyaWNlcztcblxuVGV4dHVyZVBvc2l0aW9uYWxNYXRyaWNlcy5wcm90b3R5cGUgPSB7XG5cdFxuXHRzdGFydCA6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHZlYzNGbG9hdExlbmd0aCA9IDM7XG5cdFx0dmFyIHBvaW50c0xlbmd0aCA9IDg7XG5cdFx0dmFyIGJveEdlb21ldHJ5TGVuZ3RoID0gcG9pbnRzTGVuZ3RoICogdmVjM0Zsb2F0TGVuZ3RoO1xuXG5cdFx0dGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xuXG5cdFx0dGhpcy5wb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLmNvdW50ICogYm94R2VvbWV0cnlMZW5ndGggKTtcblx0XHR0aGlzLnZlbG9jaXR5ID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5jb3VudCAqIHZlYzNGbG9hdExlbmd0aCApO1xuXHRcdHRoaXMuY29sb3JzID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5jb3VudCAqIGJveEdlb21ldHJ5TGVuZ3RoICk7XG5cdFx0dGhpcy5zaXplcyA9IG5ldyBGbG9hdDMyQXJyYXkoIHRoaXMuY291bnQgKiBwb2ludHNMZW5ndGggKTtcblx0XHR0aGlzLnRyYW5zZm9ybUluZGljZXMgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLmNvdW50ICogcG9pbnRzTGVuZ3RoICk7XG5cblx0XHR2YXIgY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoMHgwMDAwMDApO1xuXHRcdHZhciBodWU7XG5cdFx0XG5cdFx0dmFyIHZlcnRpY2VzID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KCAxLCAxLCAxICkudmVydGljZXM7XG5cblx0XHR2YXIgeCwgeSwgeiwgaSwgajtcblxuXHRcdGZvciggaSA9IDA7IGkgPCB0aGlzLmNvdW50OyBpKysgKSB7XG5cdFx0XHRcblx0XHRcdGh1ZSA9ICh0aGlzLnBvc2l0aW9uc1sgaSAqIDMgKyAwIF0gLyB0aGlzLnJhZGl1cyAqIDAuMyArIDAuNjUpICUgMTtcblx0XHRcdGh1ZSA9IHJhbmRvbS5yYW5nZSggMCwgMSApO1xuXG5cdFx0XHRjb2xvci5zZXRIU0woIGh1ZSwgMS4wLCAwLjU1ICk7XG5cdFx0XHRcblx0XHRcdGZvciggaj0wOyBqIDwgdmVydGljZXMubGVuZ3RoIDsgaisrICkge1xuXHRcdFx0XHRcblx0XHRcdFx0dmFyIG9mZnNldDMgPSAoaSAqIGJveEdlb21ldHJ5TGVuZ3RoKSArIChqICogdmVjM0Zsb2F0TGVuZ3RoKTtcblx0XHRcdFx0dmFyIG9mZnNldDEgPSAoaSAqIHBvaW50c0xlbmd0aCArIGopO1xuXG5cdFx0XHRcdHRoaXMuc2l6ZXNbIG9mZnNldDEgXSA9IHRoaXMucG9pbnRTaXplO1xuXHRcdFx0XHR0aGlzLnRyYW5zZm9ybUluZGljZXNbIG9mZnNldDEgXSA9IGk7XG5cdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHR0aGlzLnBvc2l0aW9uc1sgb2Zmc2V0MyArIDAgXSA9IHZlcnRpY2VzW2pdLnggKiA0O1xuXHRcdFx0XHR0aGlzLnBvc2l0aW9uc1sgb2Zmc2V0MyArIDEgXSA9IHZlcnRpY2VzW2pdLnkgKiA0O1xuXHRcdFx0XHR0aGlzLnBvc2l0aW9uc1sgb2Zmc2V0MyArIDIgXSA9IHZlcnRpY2VzW2pdLnogKiA0O1xuXG5cdFx0XHRcdHRoaXMuY29sb3JzWyBvZmZzZXQzICsgMCBdID0gY29sb3Iucjtcblx0XHRcdFx0dGhpcy5jb2xvcnNbIG9mZnNldDMgKyAxIF0gPSBjb2xvci5nO1xuXHRcdFx0XHR0aGlzLmNvbG9yc1sgb2Zmc2V0MyArIDIgXSA9IGNvbG9yLmI7XG5cblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZVNpemUgPSB0aGlzLmNhbGN1bGF0ZVNxdWFyZWRUZXh0dXJlU2l6ZSggdGhpcy5jb3VudCAqIDE2ICk7IC8vMTYgZmxvYXRzIHBlciBtYXRyaXhcblx0XHRcblx0XHR0aGlzLm1hdHJpY2VzID0gW11cblx0XHR0aGlzLm1hdHJpY2VzRGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoIHRoaXMubWF0cmljZXNUZXh0dXJlU2l6ZSAqIHRoaXMubWF0cmljZXNUZXh0dXJlU2l6ZSAqIDQgKVxuXHRcdFxuXHRcdHZhciByb3RhdGVNID0gbmV3IFRIUkVFLk1hdHJpeDQoKTtcblx0XHR2YXIgdHJhbnNsYXRlTSA9IG5ldyBUSFJFRS5NYXRyaXg0KCk7XG5cdFx0dmFyIHNjYWxlTSA9IG5ldyBUSFJFRS5NYXRyaXg0KCk7XG5cdFx0dmFyIGV1bGVyID0gbmV3IFRIUkVFLkV1bGVyKClcblx0XHR2YXIgcztcblx0XHRcblx0XHRmb3IoIGkgPSAwOyBpIDwgdGhpcy5jb3VudCA7IGkrKyApIHtcblx0XHRcdFxuXHRcdFx0cyA9IHJhbmRvbS5yYW5nZSggMC41LCAyICk7XG5cdFx0XHRcblx0XHRcdHNjYWxlTS5tYWtlU2NhbGUoIHMsIHMsIHMgKTtcblx0XHRcdFxuXHRcdFx0dHJhbnNsYXRlTS5tYWtlVHJhbnNsYXRpb24oXG5cdFx0XHRcdHJhbmRvbS5yYW5nZSggLXRoaXMucmFkaXVzLCB0aGlzLnJhZGl1cyApICogMC41LFxuXHRcdFx0XHRyYW5kb20ucmFuZ2UoIC10aGlzLnJhZGl1cywgdGhpcy5yYWRpdXMgKSAqIDAuNSxcblx0XHRcdFx0cmFuZG9tLnJhbmdlKCAtdGhpcy5yYWRpdXMsIHRoaXMucmFkaXVzICkgKiAwLjVcblx0XHRcdCk7XG5cdFx0XHRcblx0XHRcdGV1bGVyLnNldChcblx0XHRcdFx0cmFuZG9tLnJhbmdlKCAwLCAyICogTWF0aC5QSSApLFxuXHRcdFx0XHRyYW5kb20ucmFuZ2UoIDAsIDIgKiBNYXRoLlBJICksXG5cdFx0XHRcdHJhbmRvbS5yYW5nZSggMCwgMiAqIE1hdGguUEkgKVxuXHRcdFx0KTtcblxuXHRcdFx0cm90YXRlTS5tYWtlUm90YXRpb25Gcm9tRXVsZXIoIGV1bGVyICk7XG5cdFx0XHRcblx0XHRcdHRoaXMubWF0cmljZXNbaV0gPSBuZXcgVEhSRUUuTWF0cml4NCgpXG5cdFx0XHRcdC5tdWx0aXBseSggdHJhbnNsYXRlTSApXG5cdFx0XHRcdC5tdWx0aXBseSggcm90YXRlTSApXG5cdFx0XHRcdC5tdWx0aXBseSggc2NhbGVNICk7XG5cdFx0XHRcblx0XHRcdC8vIHRoaXMubWF0cmljZXNbaV0gPSBuZXcgVEhSRUUuTWF0cml4NCgpO1xuXHRcdFx0XG5cdFx0XHR0aGlzLm1hdHJpY2VzW2ldLmZsYXR0ZW5Ub0FycmF5T2Zmc2V0KCB0aGlzLm1hdHJpY2VzRGF0YSwgaSAqIDE2ICk7XG5cdFx0XHRcblx0XHR9XG5cdFx0XG5cdFx0dGhpcy5tYXRyaWNlc1RleHR1cmUgPSBuZXcgVEhSRUUuRGF0YVRleHR1cmUoXG5cdFx0XHR0aGlzLm1hdHJpY2VzRGF0YSxcblx0XHRcdHRoaXMubWF0cmljZXNUZXh0dXJlU2l6ZSxcblx0XHRcdHRoaXMubWF0cmljZXNUZXh0dXJlU2l6ZSxcblx0XHRcdFRIUkVFLlJHQkFGb3JtYXQsXG5cdFx0XHRUSFJFRS5GbG9hdFR5cGVcblx0XHQpO1xuXHRcdHRoaXMubWF0cmljZXNUZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XG5cdFx0dGhpcy5tYXRyaWNlc1RleHR1cmUubWFnRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcblx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZS5nZW5lcmF0ZU1pcG1hcHMgPSBmYWxzZTtcblx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZS5mbGlwWSA9IGZhbHNlO1xuXHRcdHRoaXMubWF0cmljZXNUZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblx0XHRcblx0XHR0aGlzLmF0dHJpYnV0ZXMgPSB7XG5cblx0XHRcdHNpemU6ICAgICAgIFx0eyB0eXBlOiAnZicsIHZhbHVlOiBudWxsIH0sXG5cdFx0XHRjdXN0b21Db2xvcjpcdHsgdHlwZTogJ2MnLCB2YWx1ZTogbnVsbCB9LFxuXHRcdFx0dHJhbnNmb3JtSW5kZXg6XHR7IHR5cGU6ICdmJywgdmFsdWU6IG51bGwgfVxuXG5cdFx0fTtcblxuXHRcdHRoaXMudW5pZm9ybXMgPSB7XG5cblx0XHRcdGNvbG9yOiAgICAgXHRcdFx0XHR7IHR5cGU6IFwiY1wiLCB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCAweGZmZmZmZiApIH0sXG5cdFx0XHR0ZXh0dXJlOiAgIFx0XHRcdFx0eyB0eXBlOiBcInRcIiwgdmFsdWU6IHRoaXMudGV4dHVyZSB9LFxuXHRcdFx0bWF0cmljZXNUZXh0dXJlOlx0XHR7IHR5cGU6IFwidFwiLCB2YWx1ZTogdGhpcy5tYXRyaWNlc1RleHR1cmUgfSxcblx0XHRcdHRpbWU6ICAgICAgXHRcdFx0XHR7IHR5cGU6ICdmJywgdmFsdWU6IERhdGUubm93KCkgfSxcblx0XHRcdG1hdHJpY2VzVGV4dHVyZVNpemU6XHR7IHR5cGU6ICdmJywgdmFsdWU6IHRoaXMubWF0cmljZXNUZXh0dXJlU2l6ZSB9XG5cblx0XHR9O1xuXG5cdFx0dGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCgge1xuXG5cdFx0XHR1bmlmb3JtczogICAgICAgdGhpcy51bmlmb3Jtcyxcblx0XHRcdGF0dHJpYnV0ZXM6ICAgICB0aGlzLmF0dHJpYnV0ZXMsXG5cdFx0XHR2ZXJ0ZXhTaGFkZXI6ICAgdGhpcy52ZXJ0ZXhTaGFkZXIsXG5cdFx0XHRmcmFnbWVudFNoYWRlcjogdGhpcy5mcmFnbWVudFNoYWRlcixcblxuXHRcdFx0YmxlbmRpbmc6ICAgICAgIFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG5cdFx0XHRkZXB0aFRlc3Q6ICAgICAgZmFsc2UsXG5cdFx0XHR0cmFuc3BhcmVudDogICAgdHJ1ZVxuXG5cdFx0fSk7XG5cdFx0XG5cdFx0dGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoICdwb3NpdGlvbicsXHRcdFx0bmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSggdGhpcy5wb3NpdGlvbnMsIDMgKSApO1xuXHRcdHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCAnY3VzdG9tQ29sb3InLFx0XHRuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKCB0aGlzLmNvbG9ycywgMyApICk7XG5cdFx0dGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoICdzaXplJyxcdFx0XHRcdG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIHRoaXMuc2l6ZXMsIDEgKSApO1xuXHRcdHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCAndHJhbnNmb3JtSW5kZXgnLFx0bmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSggdGhpcy50cmFuc2Zvcm1JbmRpY2VzLCAxICkgKTtcblxuXHRcdHRoaXMub2JqZWN0ID0gbmV3IFRIUkVFLlBvaW50Q2xvdWQoIHRoaXMuZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwgKTtcblx0XHR0aGlzLm9iamVjdC5wb3NpdGlvbi55IC09IHRoaXMucmFkaXVzICogMC4yO1xuXHRcdFxuXHRcdHRoaXMucG9lbS5zY2VuZS5hZGQoIHRoaXMub2JqZWN0ICk7XG5cdFxuXHRcblx0XHR0aGlzLnBvZW0ub24oICd1cGRhdGUnLCB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpICk7XG5cdFx0XG5cdH0sXG5cdFxuXHRjYWxjdWxhdGVTcXVhcmVkVGV4dHVyZVNpemUgOiBmdW5jdGlvbiggY291bnQgKSB7XG5cdFx0XG5cdFx0dmFyIHNpemUgPSAxO1xuXHRcdHZhciBpID0gMDtcblx0XHRcblx0XHR3aGlsZSggc2l6ZSAqIHNpemUgPCAoY291bnQgLyA0KSApIHtcblx0XHRcdFxuXHRcdFx0aSsrO1xuXHRcdFx0c2l6ZSA9IE1hdGgucG93KCAyLCBpICk7XG5cdFx0XHRcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIHNpemU7XG5cdH0sXG5cdFxuXHRlcnJvciA6IGZ1bmN0aW9uKCBlcnJvciApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgbG9hZCBhc3NldHMgZm9yIHRoZSBUZXh0dXJlUG9zaXRpb25hbE1hdHJpY2VzXCIsIGVycm9yKTtcblx0fSxcblx0XG5cdHVwZGF0ZSA6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdHZhciB0cmFuc2xhdGlvbiA9IG5ldyBUSFJFRS5NYXRyaXg0KCk7XG5cdFx0dmFyIGV1bGVyID0gbmV3IFRIUkVFLkV1bGVyKCk7XG5cdFx0XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGUpIHtcblxuXHRcdFx0dGhpcy51bmlmb3Jtcy50aW1lLnZhbHVlID0gZS50aW1lO1xuXHRcdFx0XG5cdFx0XHR2YXIgeCx5O1xuXHRcdFxuXHRcdFx0Zm9yKCBpID0gMDsgaSA8IHRoaXMuY291bnQgOyBpKysgKSB7XG5cdFx0XHRcdFxuXHRcdFx0XHR4ID0gZS50aW1lIC8gMTAwMDtcblx0XHRcdFx0eSA9IGkgKiAxMDAwO1xuXHRcdFx0XHRcblx0XHRcdFx0dHJhbnNsYXRpb24ubWFrZVRyYW5zbGF0aW9uKFxuXHRcdFx0XHRcdHNpbXBsZXgyLnJhbmdlKCB4LCB5LCAtMSwgMSApLFxuXHRcdFx0XHRcdHNpbXBsZXgyLnJhbmdlKCB4LCB5ICsgMzMzLCAtMSwgMSApLFxuXHRcdFx0XHRcdHNpbXBsZXgyLnJhbmdlKCB4LCB5ICsgNjY2LCAtMSwgMSApXG5cdFx0XHRcdCk7XG5cdFx0XHRcdFxuXHRcdFx0XHR0aGlzLm1hdHJpY2VzW2ldLm11bHRpcGx5TWF0cmljZXMoIHRyYW5zbGF0aW9uLCB0aGlzLm1hdHJpY2VzW2ldICk7XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBldWxlci5zZXQoXG5cdFx0XHRcdC8vIFx0cmFuZG9tLnJhbmdlKCAwLCAyICogTWF0aC5QSSApLFxuXHRcdFx0XHQvLyBcdHJhbmRvbS5yYW5nZSggMCwgMiAqIE1hdGguUEkgKSxcblx0XHRcdFx0Ly8gXHRyYW5kb20ucmFuZ2UoIDAsIDIgKiBNYXRoLlBJIClcblx0XHRcdFx0Ly8gKTtcblx0XHRcdFx0Ly9cblx0XHRcdFx0Ly8gcm90YXRlTS5tYWtlUm90YXRpb25Gcm9tRXVsZXIoIGV1bGVyICk7XG5cdFx0XHRcdFxuXHRcdFx0XHRcblx0XHRcdFx0dGhpcy5tYXRyaWNlc1tpXS5mbGF0dGVuVG9BcnJheU9mZnNldCggdGhpcy5tYXRyaWNlc0RhdGEsIGkgKiAxNiApO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cdFx0fVxuXHR9KClcblx0XG59O1xuXG53aW5kb3cuY29uc29sZU1hdHJpeEVsZW1lbnRzID0gZnVuY3Rpb24oIGVscywgZGVjaW1hbFBsYWNlcyApIHtcbiBcblx0dmFyIGksIGosIGVsLCByZXN1bHRzO1xuIFxuXHRyZXN1bHRzID0gW107XG5cdGogPSAwO1xuIFxuXHRmb3IoIGk9MDsgaSA8IGVscy5sZW5ndGg7IGkrKyApIHtcblx0XHRcblx0XHRpZiggaiA9PT0gMCApIHtcblx0XHRcdHJlc3VsdHMucHVzaChbXSk7XG5cdFx0fVxuIFxuXHRcdGVsID0gZWxzW2ldO1xuIFxuXHRcdGlmKCB0eXBlb2YgZGVjaW1hbFBsYWNlcyA9PT0gXCJudW1iZXJcIiApIHtcbiBcblx0XHRcdGVsID0gTWF0aC5yb3VuZCggTWF0aC5wb3coMTAsIGRlY2ltYWxQbGFjZXMpICogZWwgKSAvIE1hdGgucG93KDEwLCBkZWNpbWFsUGxhY2VzKTtcbiBcblx0XHR9XG4gXG5cdFx0cmVzdWx0c1tNYXRoLmZsb29yKGkgLyA0KSAlIDRdLnB1c2goIGVsICk7XG4gXG5cdFx0aisrO1xuXHRcdGogJT0gNDtcblx0XHRcblx0XHRpZiggaSAlIDE2ID09PSAxNSApIHtcblx0XHRcdGNvbnNvbGUudGFibGUoIHJlc3VsdHMgKTtcblx0XHRcdHJlc3VsdHMgPSBbXTtcblx0XHR9XG4gXG5cdH1cbiBcbn0iLCJ2YXIgcmFuZG9tXHRcdD0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvcmFuZG9tJylcbiAgLCBsb2FkVGV4dHVyZVx0PSByZXF1aXJlKCcuLi8uLi91dGlscy9sb2FkVGV4dHVyZScpXG4gICwgbG9hZFRleHRcdD0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvbG9hZFRleHQnKVxuICAsIFJTVlBcdFx0PSByZXF1aXJlKCdyc3ZwJylcbjtcblxudmFyIFVuaWZvcm1Qb3NpdGlvbmFsTWF0cmljZXMgPSBmdW5jdGlvbihwb2VtLCBwcm9wZXJ0aWVzKSB7XG5cblx0dGhpcy5wb2VtID0gcG9lbTtcblx0XG5cdHRoaXMub2JqZWN0ID0gbnVsbDtcblx0dGhpcy5tYXRlcmlhbCA9IG51bGw7XG5cdHRoaXMuYXR0cmlidXRlcyA9IG51bGw7XG5cdHRoaXMudW5pZm9ybXMgPSBudWxsO1xuXG5cdHRoaXMudGV4dHVyZSA9IG51bGw7XG5cdHRoaXMudmVydGV4U2hhZGVyID0gbnVsbDtcblx0dGhpcy5mcmFnbWVudFNoYWRlciA9IG51bGw7XG5cdFxuXHR0aGlzLmNvdW50ID0gMjAwMDAwO1xuXHR0aGlzLnJhZGl1cyA9IDIwMDtcblx0dGhpcy5wb2ludFNpemUgPSA3O1xuXHRcblx0UlNWUC5hbGwoW1xuXHRcdGxvYWRUZXh0dXJlKCBcImFzc2V0cy9pbWFnZXMvc2luZWdyYXZpdHljbG91ZC5wbmdcIiwgdGhpcywgXCJ0ZXh0dXJlXCIgKSxcblx0XHRsb2FkVGV4dCggXCJqcy9kZW1vcy9Vbmlmb3JtUG9zaXRpb25hbE1hdHJpY2VzL3NoYWRlci52ZXJ0XCIsIHRoaXMsIFwidmVydGV4U2hhZGVyXCIgKSxcblx0XHRsb2FkVGV4dCggXCJqcy9kZW1vcy9Vbmlmb3JtUG9zaXRpb25hbE1hdHJpY2VzL3NoYWRlci5mcmFnXCIsIHRoaXMsIFwiZnJhZ21lbnRTaGFkZXJcIiApXG5cdF0pXG5cdC50aGVuKFxuXHRcdHRoaXMuc3RhcnQuYmluZCh0aGlzKSxcblx0XHR0aGlzLmVycm9yLmJpbmQodGhpcylcblx0KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVW5pZm9ybVBvc2l0aW9uYWxNYXRyaWNlcztcblxuVW5pZm9ybVBvc2l0aW9uYWxNYXRyaWNlcy5wcm90b3R5cGUgPSB7XG5cdFxuXHRzdGFydCA6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdHZhciB0cmFuc2Zvcm1Db3VudCA9IDUwO1xuXHRcdFxuXHRcdFxuXHRcdHRoaXMuYXR0cmlidXRlcyA9IHtcblxuXHRcdFx0c2l6ZTogICAgICAgXHR7IHR5cGU6ICdmJywgdmFsdWU6IG51bGwgfSxcblx0XHRcdGN1c3RvbUNvbG9yOlx0eyB0eXBlOiAnYycsIHZhbHVlOiBudWxsIH0sXG5cdFx0XHR0cmFuc2Zvcm1JbmRleDpcdHsgdHlwZTogJ2YnLCB2YWx1ZTogbnVsbCB9XG5cblx0XHR9O1xuXG5cdFx0dGhpcy51bmlmb3JtcyA9IHtcblxuXHRcdFx0Y29sb3I6ICAgICBcdFx0XHR7IHR5cGU6IFwiY1wiLCB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCAweGZmZmZmZiApIH0sXG5cdFx0XHR0ZXh0dXJlOiAgIFx0XHRcdHsgdHlwZTogXCJ0XCIsIHZhbHVlOiB0aGlzLnRleHR1cmUgfSxcblx0XHRcdHRpbWU6ICAgICAgXHRcdFx0eyB0eXBlOiAnZicsIHZhbHVlOiBEYXRlLm5vdygpIH0sXG5cdFx0XHR0cmFuc2Zvcm1NYXRyaXg6XHR7IHR5cGU6ICdtNHYnLCB2YWx1ZTogW10gfVxuXG5cdFx0fTtcblxuXHRcdHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoIHtcblxuXHRcdFx0dW5pZm9ybXM6ICAgICAgIHRoaXMudW5pZm9ybXMsXG5cdFx0XHRhdHRyaWJ1dGVzOiAgICAgdGhpcy5hdHRyaWJ1dGVzLFxuXHRcdFx0dmVydGV4U2hhZGVyOiAgIFwiI2RlZmluZSBUUkFOU0ZPUk1fTUFUUklYX0NPVU5UIFwiICsgdHJhbnNmb3JtQ291bnQgKyBcIlxcblwiICsgdGhpcy52ZXJ0ZXhTaGFkZXIsXG5cdFx0XHRmcmFnbWVudFNoYWRlcjogdGhpcy5mcmFnbWVudFNoYWRlcixcblxuXHRcdFx0YmxlbmRpbmc6ICAgICAgIFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG5cdFx0XHRkZXB0aFRlc3Q6ICAgICAgZmFsc2UsXG5cdFx0XHR0cmFuc3BhcmVudDogICAgdHJ1ZVxuXG5cdFx0fSk7XG5cblx0XHR0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XG5cblx0XHR0aGlzLnBvc2l0aW9ucyA9IG5ldyBGbG9hdDMyQXJyYXkoIHRoaXMuY291bnQgKiAzICk7XG5cdFx0dGhpcy52ZWxvY2l0eSA9IG5ldyBGbG9hdDMyQXJyYXkoIHRoaXMuY291bnQgKiAzICk7XG5cdFx0dGhpcy5jb2xvcnMgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLmNvdW50ICogMyApO1xuXHRcdHRoaXMuc2l6ZXMgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLmNvdW50ICk7XG5cdFx0dGhpcy50cmFuc2Zvcm1JbmRpY2VzID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5jb3VudCApXG5cblx0XHR2YXIgY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoMHgwMDAwMDApO1xuXHRcdHZhciBodWU7XG5cdFx0XG5cdFx0dmFyIHRoZXRhLCBwaGk7XG5cdFx0XG5cdFx0dmFyIHg7XG5cblx0XHRmb3IoIHZhciB2ID0gMDsgdiA8IHRoaXMuY291bnQ7IHYrKyApIHtcblxuXHRcdFx0dGhpcy5zaXplc1sgdiBdID0gdGhpcy5wb2ludFNpemU7XG5cdFx0XHR0aGlzLnRyYW5zZm9ybUluZGljZXNbIHYgXSA9IHJhbmRvbS5yYW5nZUludCggMCwgdHJhbnNmb3JtQ291bnQgKTtcblx0XHRcdFx0XHRcdFxuXHRcdFx0dGhldGEgPSByYW5kb20ucmFuZ2VMb3coIDAuMSwgTWF0aC5QSSApO1xuXHRcdFx0cGhpID0gcmFuZG9tLnJhbmdlTG93KCBNYXRoLlBJICogMC4zLCBNYXRoLlBJICk7XG5cdFx0XHRcblx0XHRcdHRoaXMucG9zaXRpb25zWyB2ICogMyArIDAgXSA9IE1hdGguc2luKCB0aGV0YSApICogTWF0aC5jb3MoIHBoaSApICogdGhpcy5yYWRpdXMgKiB0aGV0YTtcblx0XHRcdHRoaXMucG9zaXRpb25zWyB2ICogMyArIDEgXSA9IE1hdGguc2luKCB0aGV0YSApICogTWF0aC5zaW4oIHBoaSApICogdGhpcy5yYWRpdXM7XG5cdFx0XHR0aGlzLnBvc2l0aW9uc1sgdiAqIDMgKyAyIF0gPSBNYXRoLmNvcyggdGhldGEgKSAqIHRoaXMucmFkaXVzIDtcblx0XHRcdFxuXHRcdFx0XG5cdFx0XHRodWUgPSAodGhpcy5wb3NpdGlvbnNbIHYgKiAzICsgMCBdIC8gdGhpcy5yYWRpdXMgKiAwLjMgKyAwLjY1KSAlIDE7XG5cblx0XHRcdGNvbG9yLnNldEhTTCggaHVlLCAxLjAsIDAuNTUgKTtcblxuXHRcdFx0dGhpcy5jb2xvcnNbIHYgKiAzICsgMCBdID0gY29sb3Iucjtcblx0XHRcdHRoaXMuY29sb3JzWyB2ICogMyArIDEgXSA9IGNvbG9yLmc7XG5cdFx0XHR0aGlzLmNvbG9yc1sgdiAqIDMgKyAyIF0gPSBjb2xvci5iO1xuXG5cdFx0fVxuXHRcdFxuXHRcdGZvciggdmFyIGkgPSAwOyBpIDwgdHJhbnNmb3JtQ291bnQgOyBpKysgKSB7XG5cdFx0XHRcblx0XHRcdHRoaXMudW5pZm9ybXMudHJhbnNmb3JtTWF0cml4LnZhbHVlW2ldID0gbmV3IFRIUkVFLk1hdHJpeDQoKS5tYWtlVHJhbnNsYXRpb24oXG5cdFx0XHRcdHJhbmRvbS5yYW5nZSggLXRoaXMucmFkaXVzLCB0aGlzLnJhZGl1cyApICogMC41LFxuXHRcdFx0XHRyYW5kb20ucmFuZ2UoIC10aGlzLnJhZGl1cywgdGhpcy5yYWRpdXMgKSAqIDAuNSxcblx0XHRcdFx0cmFuZG9tLnJhbmdlKCAtdGhpcy5yYWRpdXMsIHRoaXMucmFkaXVzICkgKiAwLjVcblx0XHRcdCk7XG5cdFx0XHRcblx0XHR9XG5cblx0XHR0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSggJ3Bvc2l0aW9uJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSggdGhpcy5wb3NpdGlvbnMsIDMgKSApO1xuXHRcdHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCAnY3VzdG9tQ29sb3InLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKCB0aGlzLmNvbG9ycywgMyApICk7XG5cdFx0dGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoICdzaXplJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSggdGhpcy5zaXplcywgMSApICk7XG5cdFx0dGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoICd0cmFuc2Zvcm1JbmRleCcsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIHRoaXMudHJhbnNmb3JtSW5kaWNlcywgMSApICk7XG5cblx0XHR0aGlzLm9iamVjdCA9IG5ldyBUSFJFRS5Qb2ludENsb3VkKCB0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsICk7XG5cdFx0dGhpcy5vYmplY3QucG9zaXRpb24ueSAtPSB0aGlzLnJhZGl1cyAqIDAuMjtcblx0XHRcblx0XHR0aGlzLnBvZW0uc2NlbmUuYWRkKCB0aGlzLm9iamVjdCApO1xuXHRcblx0XG5cdFx0dGhpcy5wb2VtLm9uKCAndXBkYXRlJywgdGhpcy51cGRhdGUuYmluZCh0aGlzKSApO1xuXHRcdFxuXHR9LFxuXHRcblx0ZXJyb3IgOiBmdW5jdGlvbiggZXJyb3IgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQ291bGQgbm90IGxvYWQgYXNzZXRzIGZvciB0aGUgVW5pZm9ybVBvc2l0aW9uYWxNYXRyaWNlc1wiLCBlcnJvcik7XG5cdH0sXG5cdFxuXHR1cGRhdGUgOiBmdW5jdGlvbihlKSB7XG5cblx0XHR0aGlzLnVuaWZvcm1zLnRpbWUudmFsdWUgPSBlLnRpbWU7XG5cdFx0XG5cdH1cblx0XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRjb25maWcgOiB7XG5cdFx0Y2FtZXJhIDoge1xuXHRcdFx0eCA6IC00MDAsXG5cdFx0XHRmYXIgOiAzMDAwXG5cdFx0fVxuXHR9LFxuXHRvYmplY3RzIDoge1xuXHRcdHNwaGVyZSA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2RlbW9zL0VhcnRoXCIpLFxuXHRcdFx0cHJvcGVydGllczoge31cblx0XHR9LFxuXHRcdGNvbnRyb2xzIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vY29tcG9uZW50cy9jYW1lcmFzL0NvbnRyb2xzXCIpLFxuXHRcdFx0cHJvcGVydGllczoge1xuXHRcdFx0XHRtaW5EaXN0YW5jZSA6IDUwMCxcblx0XHRcdFx0bWF4RGlzdGFuY2UgOiAxMDAwLFxuXHRcdFx0XHR6b29tU3BlZWQgOiAwLjEsXG5cdFx0XHRcdGF1dG9Sb3RhdGUgOiB0cnVlLFxuXHRcdFx0XHRhdXRvUm90YXRlU3BlZWQgOiAwLjJcblx0XHRcdH1cblx0XHR9LFxuXHRcdGluZm8gOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL0luZm9cIiksXG5cdFx0XHRwcm9wZXJ0aWVzIDoge1xuXHRcdFx0XHRkb2N1bWVudFRpdGxlIDogXCJFYXJ0aCdzIENPMiDigJMgYSBUaHJlZS5qcyBWaXN1YWxpemF0aW9uIGFkYXB0ZWQgYnkgR3JlZyBUYXR1bVwiLFxuXHRcdFx0XHR0aXRsZSA6IFwiRWFydGgncyBDTzJcIixcblx0XHRcdFx0c3VidGl0bGUgOiBcIjNkIFZpc3VhbGlzYXRpb24gb2YgYSBtYXAgZnJvbSBOQVNBXCIsXG5cdFx0XHRcdGFwcGVuZENyZWRpdHMgOiBcIjxici8+IE1hcCB2aXN1YWxpemF0aW9uIGJ5IDxhIGhyZWY9J2h0dHA6Ly9zdnMuZ3NmYy5uYXNhLmdvdi9jZ2ktYmluL2RldGFpbHMuY2dpP2FpZD0xMTcxOSc+TkFTQSdzIEdvZGRhcmQgU3BhY2UgRmxpZ2h0IENlbnRlcjwvYT5cIixcblx0XHRcdFx0dGl0bGVDc3MgOiB7IFwiZm9udC1zaXplXCI6IFwiMy4zNWVtXCIgfSxcblx0XHRcdFx0c3VidGl0bGVDc3MgOiB7XHRcImZvbnQtc2l6ZVwiOiBcIjAuN2VtXCIgfSxcblx0XHRcdFx0c2hvd0Fycm93TmV4dCA6IHRydWVcblx0XHRcdH1cblx0XHR9LFxuXHRcdHN0YXJzIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vY29tcG9uZW50cy9TdGFyc1wiKSxcblx0XHR9LFxuXHRcdC8vIHN0YXRzIDoge1xuXHRcdC8vIFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vY29tcG9uZW50cy91dGlscy9TdGF0c1wiKVxuXHRcdC8vIH0sXG5cdFx0bGlnaHRzIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vY29tcG9uZW50cy9saWdodHMvVHJhY2tDYW1lcmFMaWdodHNcIilcblx0XHR9XG5cdH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cdG1lc2hHcm91cEJveERlbW8gOiByZXF1aXJlKFwiLi9tZXNoR3JvdXBCb3hEZW1vXCIpLFxuXHRjYXJib25EaW94aWRlRWFydGggOiByZXF1aXJlKFwiLi9jYXJib25EaW94aWRlRWFydGhcIiksXG5cdHNwaGVyZXNEZW1vIDogcmVxdWlyZShcIi4vc3BoZXJlc0RlbW9cIiksXG5cdHNpbmVHcmF2aXR5Q2xvdWQgOiByZXF1aXJlKFwiLi9zaW5lR3Jhdml0eUNsb3VkXCIpLFxuXHR1bmlmb3JtUG9zaXRpb25hbE1hdHJpY2VzIDogcmVxdWlyZShcIi4vdW5pZm9ybVBvc2l0aW9uYWxNYXRyaWNlc1wiKSxcblx0dGV4dHVyZVBvc2l0aW9uYWxNYXRyaWNlcyA6IHJlcXVpcmUoXCIuL3RleHR1cmVQb3NpdGlvbmFsTWF0cmljZXNcIilcbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cdGNvbmZpZyA6IHtcblx0XHRjYW1lcmEgOiB7XG5cdFx0XHR4IDogLTQwMFxuXHRcdH1cblx0fSxcblx0b2JqZWN0cyA6IHtcblx0XHRkZW1vIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vZGVtb3MvTWVzaEdyb3VwQm94RGVtb1wiKSxcblx0XHRcdHByb3BlcnRpZXM6IHt9XG5cdFx0fSxcblx0XHRjb250cm9scyA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2NvbXBvbmVudHMvY2FtZXJhcy9Db250cm9sc1wiKSxcblx0XHR9LFxuXHRcdGdyaWQgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9kZW1vcy9HcmlkXCIpLFxuXHRcdH0sXG5cdFx0c3RhdHMgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL3V0aWxzL1N0YXRzXCIpXG5cdFx0fVxuXHR9XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRjb25maWcgOiB7XG5cdFx0Y2FtZXJhIDoge1xuXHRcdFx0eCA6IC00MDBcblx0XHR9XG5cdH0sXG5cdG9iamVjdHMgOiB7XG5cdFx0Y29udHJvbHMgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL2NhbWVyYXMvQ29udHJvbHNcIiksXG5cdFx0fSxcblx0XHRwb2ludGNsb3VkIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vZGVtb3MvU2luZUdyYXZpdHlDbG91ZFwiKSxcblx0XHR9LFxuXHRcdGdyaWQgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9kZW1vcy9HcmlkXCIpLFxuXHRcdH0sXG5cdFx0Ly8gc3RhdHMgOiB7XG5cdFx0Ly8gXHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL3V0aWxzL1N0YXRzXCIpXG5cdFx0Ly8gfVxuXHR9XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRjb25maWcgOiB7XG5cdFx0Y2FtZXJhIDoge1xuXHRcdFx0eCA6IC00MDBcblx0XHR9XG5cdH0sXG5cdG9iamVjdHMgOiB7XG5cdFx0c3BoZXJlIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vZGVtb3MvU3BoZXJlc1wiKSxcblx0XHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdFx0Y291bnQgOiA1MCxcblx0XHRcdFx0ZGlzcGVyc2lvbiA6IDEyMCxcblx0XHRcdFx0cmFkaXVzIDogMTBcblx0XHRcdH1cblx0XHR9LFxuXHRcdGNvbnRyb2xzIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vY29tcG9uZW50cy9jYW1lcmFzL0NvbnRyb2xzXCIpLFxuXHRcdH0sXG5cdFx0Z3JpZCA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2RlbW9zL0dyaWRcIiksXG5cdFx0fSxcblx0XHRzdGF0cyA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2NvbXBvbmVudHMvdXRpbHMvU3RhdHNcIilcblx0XHR9XG5cdH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cdGNvbmZpZyA6IHtcblx0XHRjYW1lcmEgOiB7XG5cdFx0XHR4IDogLTQwMFxuXHRcdH1cblx0fSxcblx0b2JqZWN0cyA6IHtcblx0XHRjb250cm9scyA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2NvbXBvbmVudHMvY2FtZXJhcy9Db250cm9sc1wiKSxcblx0XHR9LFxuXHRcdHRleHR1cmVQb3NpdGlvbmFsTWF0cmljZXMgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9kZW1vcy90ZXh0dXJlUG9zaXRpb25hbE1hdHJpY2VzXCIpLFxuXHRcdH0sXG5cdFx0Z3JpZCA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2RlbW9zL0dyaWRcIiksXG5cdFx0fSxcblx0XHRzdGF0cyA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2NvbXBvbmVudHMvdXRpbHMvU3RhdHNcIilcblx0XHR9XG5cdH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cdGNvbmZpZyA6IHtcblx0XHRjYW1lcmEgOiB7XG5cdFx0XHR4IDogLTQwMFxuXHRcdH1cblx0fSxcblx0b2JqZWN0cyA6IHtcblx0XHRjb250cm9scyA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2NvbXBvbmVudHMvY2FtZXJhcy9Db250cm9sc1wiKSxcblx0XHR9LFxuXHRcdHVuaWZvcm1Qb3NpdGlvbmFsTWF0cmljZXMgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9kZW1vcy91bmlmb3JtUG9zaXRpb25hbE1hdHJpY2VzXCIpLFxuXHRcdH0sXG5cdFx0Z3JpZCA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2RlbW9zL0dyaWRcIiksXG5cdFx0fSxcblx0XHRzdGF0cyA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2NvbXBvbmVudHMvdXRpbHMvU3RhdHNcIilcblx0XHR9XG5cdH1cbn07IiwidmFyIENsb2NrID0gZnVuY3Rpb24oIGF1dG9zdGFydCApIHtcblxuXHR0aGlzLm1heER0ID0gNjA7XG5cdHRoaXMubWluRHQgPSAxNjtcblx0dGhpcy5wVGltZSA9IDA7XG5cdHRoaXMudGltZSA9IDA7XG5cdFxuXHRpZihhdXRvc3RhcnQgIT09IGZhbHNlKSB7XG5cdFx0dGhpcy5zdGFydCgpO1xuXHR9XG5cdFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDbG9jaztcblxuQ2xvY2sucHJvdG90eXBlID0ge1xuXG5cdHN0YXJ0IDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5wVGltZSA9IERhdGUubm93KCk7XG5cdH0sXG5cdFxuXHRnZXREZWx0YSA6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBub3csIGR0O1xuXHRcdFxuXHRcdG5vdyA9IERhdGUubm93KCk7XG5cdFx0ZHQgPSBub3cgLSB0aGlzLnBUaW1lO1xuXHRcdFxuXHRcdGR0ID0gTWF0aC5taW4oIGR0LCB0aGlzLm1heER0ICk7XG5cdFx0ZHQgPSBNYXRoLm1heCggZHQsIHRoaXMubWluRHQgKTtcblx0XHRcblx0XHR0aGlzLnRpbWUgKz0gZHQ7XG5cdFx0dGhpcy5wVGltZSA9IG5vdztcblx0XHRcblx0XHRyZXR1cm4gZHQ7XG5cdH1cblx0XG59OyIsIi8qKlxuICogQGF1dGhvciBtcmRvb2IgLyBodHRwOi8vbXJkb29iLmNvbS9cbiAqXG4gKiBNb2RpZmljYXRpb25zOiBHcmVnIFRhdHVtXG4gKlxuICogdXNhZ2U6XG4gKiBcbiAqIFx0XHRFdmVudERpc3BhdGNoZXIucHJvdG90eXBlLmFwcGx5KCBNeU9iamVjdC5wcm90b3R5cGUgKTtcbiAqIFxuICogXHRcdE15T2JqZWN0LmRpc3BhdGNoKHtcbiAqIFx0XHRcdHR5cGU6IFwiY2xpY2tcIixcbiAqIFx0XHRcdGRhdHVtMTogXCJmb29cIixcbiAqIFx0XHRcdGRhdHVtMjogXCJiYXJcIlxuICogXHRcdH0pO1xuICogXG4gKiBcdFx0TXlPYmplY3Qub24oIFwiY2xpY2tcIiwgZnVuY3Rpb24oIGV2ZW50ICkge1xuICogXHRcdFx0ZXZlbnQuZGF0dW0xOyAvL0Zvb1xuICogXHRcdFx0ZXZlbnQudGFyZ2V0OyAvL015T2JqZWN0XG4gKiBcdFx0fSk7XG4gKiBcbiAqXG4gKi9cblxudmFyIEV2ZW50RGlzcGF0Y2hlciA9IGZ1bmN0aW9uICgpIHt9O1xuXG5FdmVudERpc3BhdGNoZXIucHJvdG90eXBlID0ge1xuXG5cdGNvbnN0cnVjdG9yOiBFdmVudERpc3BhdGNoZXIsXG5cblx0YXBwbHk6IGZ1bmN0aW9uICggb2JqZWN0ICkge1xuXG5cdFx0b2JqZWN0Lm9uXHRcdFx0XHRcdD0gRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5vbjtcblx0XHRvYmplY3QuaGFzRXZlbnRMaXN0ZW5lclx0XHQ9IEV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUuaGFzRXZlbnRMaXN0ZW5lcjtcblx0XHRvYmplY3Qub2ZmXHRcdFx0XHRcdD0gRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5vZmY7XG5cdFx0b2JqZWN0LmRpc3BhdGNoXHRcdFx0XHQ9IEV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUuZGlzcGF0Y2g7XG5cblx0fSxcblxuXHRvbjogZnVuY3Rpb24gKCB0eXBlLCBsaXN0ZW5lciApIHtcblxuXHRcdGlmICggdGhpcy5fbGlzdGVuZXJzID09PSB1bmRlZmluZWQgKSB0aGlzLl9saXN0ZW5lcnMgPSB7fTtcblxuXHRcdHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cblx0XHRpZiAoIGxpc3RlbmVyc1sgdHlwZSBdID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGxpc3RlbmVyc1sgdHlwZSBdID0gW107XG5cblx0XHR9XG5cblx0XHRpZiAoIGxpc3RlbmVyc1sgdHlwZSBdLmluZGV4T2YoIGxpc3RlbmVyICkgPT09IC0gMSApIHtcblxuXHRcdFx0bGlzdGVuZXJzWyB0eXBlIF0ucHVzaCggbGlzdGVuZXIgKTtcblxuXHRcdH1cblxuXHR9LFxuXG5cdGhhc0V2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uICggdHlwZSwgbGlzdGVuZXIgKSB7XG5cblx0XHRpZiAoIHRoaXMuX2xpc3RlbmVycyA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIGZhbHNlO1xuXG5cdFx0dmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcblxuXHRcdGlmICggbGlzdGVuZXJzWyB0eXBlIF0gIT09IHVuZGVmaW5lZCAmJiBsaXN0ZW5lcnNbIHR5cGUgXS5pbmRleE9mKCBsaXN0ZW5lciApICE9PSAtIDEgKSB7XG5cblx0XHRcdHJldHVybiB0cnVlO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXG5cdH0sXG5cblx0b2ZmOiBmdW5jdGlvbiAoIHR5cGUsIGxpc3RlbmVyICkge1xuXG5cdFx0aWYgKCB0aGlzLl9saXN0ZW5lcnMgPT09IHVuZGVmaW5lZCApIHJldHVybjtcblxuXHRcdHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cdFx0dmFyIGxpc3RlbmVyQXJyYXkgPSBsaXN0ZW5lcnNbIHR5cGUgXTtcblxuXHRcdGlmICggbGlzdGVuZXJBcnJheSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHR2YXIgaW5kZXggPSBsaXN0ZW5lckFycmF5LmluZGV4T2YoIGxpc3RlbmVyICk7XG5cblx0XHRcdGlmICggaW5kZXggIT09IC0gMSApIHtcblxuXHRcdFx0XHRsaXN0ZW5lckFycmF5LnNwbGljZSggaW5kZXgsIDEgKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH0sXG5cblx0ZGlzcGF0Y2g6IGZ1bmN0aW9uICggZXZlbnQgKSB7XG5cdFx0XHRcblx0XHRpZiAoIHRoaXMuX2xpc3RlbmVycyA9PT0gdW5kZWZpbmVkICkgcmV0dXJuO1xuXG5cdFx0dmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcblx0XHR2YXIgbGlzdGVuZXJBcnJheSA9IGxpc3RlbmVyc1sgZXZlbnQudHlwZSBdO1xuXG5cdFx0aWYgKCBsaXN0ZW5lckFycmF5ICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGV2ZW50LnRhcmdldCA9IHRoaXM7XG5cblx0XHRcdHZhciBhcnJheSA9IFtdO1xuXHRcdFx0dmFyIGxlbmd0aCA9IGxpc3RlbmVyQXJyYXkubGVuZ3RoO1xuXHRcdFx0dmFyIGk7XG5cblx0XHRcdGZvciAoIGkgPSAwOyBpIDwgbGVuZ3RoOyBpICsrICkge1xuXG5cdFx0XHRcdGFycmF5WyBpIF0gPSBsaXN0ZW5lckFycmF5WyBpIF07XG5cblx0XHRcdH1cblxuXHRcdFx0Zm9yICggaSA9IDA7IGkgPCBsZW5ndGg7IGkgKysgKSB7XG5cblx0XHRcdFx0YXJyYXlbIGkgXS5jYWxsKCB0aGlzLCBldmVudCApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fVxuXG59O1xuXG5pZiAoIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICkge1xuXG5cdG1vZHVsZS5leHBvcnRzID0gRXZlbnREaXNwYXRjaGVyO1xuXG59IiwidmFyIGNhbGN1bGF0ZVNxdWFyZWRUZXh0dXJlV2lkdGggPSBmdW5jdGlvbiggY291bnQgKSB7XG5cdHZhciB3aWR0aCA9IDE7XG5cdHZhciBpID0gMDtcblx0XG5cdHdoaWxlKCB3aWR0aCAqIHdpZHRoIDwgKGNvdW50IC8gNCkgKSB7XG5cdFx0XG5cdFx0aSsrO1xuXHRcdHdpZHRoID0gTWF0aC5wb3coIDIsIGkgKTtcblx0XHRcblx0fVxuXHRcblx0cmV0dXJuIHdpZHRoO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjYWxjdWxhdGVTcXVhcmVkVGV4dHVyZVdpZHRoO1xuIiwidmFyIFJTVlAgPSByZXF1aXJlKCdyc3ZwJyk7XG5cbnZhciBsb2FkVGV4dCA9IGZ1bmN0aW9uKCB1cmwsIG9iamVjdCwga2V5ICkge1xuXHRcblx0dmFyIHByb21pc2UgPSBuZXcgUlNWUC5Qcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG5cdFx0XG5cdFx0JC5hamF4KHVybCwge1xuXHRcdFx0ZGF0YVR5cGU6IFwidGV4dFwiXG5cdFx0fSkudGhlbihcblx0XHRcdGZ1bmN0aW9uKCBkYXRhICkge1xuXHRcdFx0XHRcblx0XHRcdFx0aWYoIF8uaXNPYmplY3QoIG9iamVjdCApICkge1xuXHRcdFx0XHRcdG9iamVjdFtrZXldID0gZGF0YTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0cmVzb2x2ZSggZGF0YSApO1xuXHRcdFx0fSxcblx0XHRcdGZ1bmN0aW9uKCBlcnJvciApIHtcblx0XHRcdFx0cmVqZWN0KCBlcnJvciApO1xuXHRcdFx0fVxuXHRcdCk7XG5cdFx0XG5cdH0pO1xuXG5cdHJldHVybiBwcm9taXNlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBsb2FkVGV4dDsiLCJ2YXIgUlNWUCA9IHJlcXVpcmUoJ3JzdnAnKTtcblxudmFyIGxvYWRUZXh0dXJlID0gZnVuY3Rpb24oIHVybCwgb2JqZWN0LCBrZXkgKSB7XG5cdFxuXHRyZXR1cm4gbmV3IFJTVlAuUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcblx0XHRcblx0XHRUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCB1cmwsIHVuZGVmaW5lZCwgZnVuY3Rpb24oIHRleHR1cmUgKSB7XG5cdFx0XHRcblx0XHRcdGlmKCBfLmlzT2JqZWN0KCBvYmplY3QgKSApIHtcblx0XHRcdFx0b2JqZWN0W2tleV0gPSB0ZXh0dXJlO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRyZXNvbHZlKCB0ZXh0dXJlICk7XG5cdFx0XHRcblx0XHR9LCByZWplY3QgKTtcblx0XHRcblx0fSk7XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbG9hZFRleHR1cmU7IiwidmFyIHJhbmRvbSA9IHtcblx0XG5cdGZsaXAgOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gTWF0aC5yYW5kb20oKSA+IDAuNSA/IHRydWU6IGZhbHNlO1xuXHR9LFxuXHRcblx0cmFuZ2UgOiBmdW5jdGlvbihtaW4sIG1heCkge1xuXHRcdHJldHVybiBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW47XG5cdH0sXG5cdFxuXHRyYW5nZUludCA6IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG5cdFx0cmV0dXJuIE1hdGguZmxvb3IoIHRoaXMucmFuZ2UobWluLCBtYXggKyAxKSApO1xuXHR9LFxuXHRcblx0cmFuZ2VMb3cgOiBmdW5jdGlvbihtaW4sIG1heCkge1xuXHRcdC8vTW9yZSBsaWtlbHkgdG8gcmV0dXJuIGEgbG93IHZhbHVlXG5cdCAgcmV0dXJuIE1hdGgucmFuZG9tKCkgKiBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW47XG5cdH0sXG5cdFxuXHRyYW5nZUhpZ2ggOiBmdW5jdGlvbihtaW4sIG1heCkge1xuXHRcdC8vTW9yZSBsaWtlbHkgdG8gcmV0dXJuIGEgaGlnaCB2YWx1ZVxuXHRcdHJldHVybiAoMSAtIE1hdGgucmFuZG9tKCkgKiBNYXRoLnJhbmRvbSgpKSAqIChtYXggLSBtaW4pICsgbWluO1xuXHR9XG5cdCBcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gcmFuZG9tO1xuIiwidmFyIHBlcmxpblNpbXBsZXggPSByZXF1aXJlKCdwZXJsaW4tc2ltcGxleCcpO1xudmFyIGdlbmVyYXRvciA9IG5ldyBwZXJsaW5TaW1wbGV4KCk7XG4vLyBnZW5lcmF0b3Iubm9pc2UoeCwgeSlcbi8vIGdlbmVyYXRvci5ub2lzZTNkKHgsIHksIHopXG5cbmZ1bmN0aW9uIHVuaXRTaW1wbGV4KCB4LCB5ICkge1xuXHRyZXR1cm4gKGdlbmVyYXRvci5ub2lzZSh4LHkpICsgMSkgLyAyO1xufVxuXG52YXIgc2ltcGxleDIgPSB7XG5cdFxuXHRmbGlwIDogZnVuY3Rpb24oIHgsIHkgKSB7XG5cdFx0cmV0dXJuIGdlbmVyYXRvci5ub2lzZSh4LHkpID4gMCA/IHRydWU6IGZhbHNlO1xuXHR9LFxuXHRcblx0cmFuZ2UgOiBmdW5jdGlvbiggeCwgeSwgbWluLCBtYXggKSB7XG5cdFx0cmV0dXJuIHVuaXRTaW1wbGV4KHgseSkgKiAobWF4IC0gbWluKSArIG1pbjtcblx0fSxcblx0XG5cdHJhbmdlSW50IDogZnVuY3Rpb24oIHgsIHksIG1pbiwgbWF4ICkge1xuXHRcdHJldHVybiBNYXRoLmZsb29yKCB0aGlzLnJhbmdlKG1pbiwgbWF4ICsgMSkgKTtcblx0fSxcblx0XG5cdHJhbmdlTG93IDogZnVuY3Rpb24oIHgsIHksIG1pbiwgbWF4KSB7XG5cdFx0Ly9Nb3JlIGxpa2VseSB0byByZXR1cm4gYSBsb3cgdmFsdWVcblx0XHR2YXIgciA9IHVuaXRTaW1wbGV4KHgseSk7XG5cdFx0cmV0dXJuIHIgKiByICogKG1heCAtIG1pbikgKyBtaW47XG5cdH0sXG5cdFxuXHRyYW5nZUhpZ2ggOiBmdW5jdGlvbiggeCwgeSwgbWluLCBtYXgpIHtcblx0XHQvL01vcmUgbGlrZWx5IHRvIHJldHVybiBhIGhpZ2ggdmFsdWVcblx0XHR2YXIgciA9IHVuaXRTaW1wbGV4KHgseSk7XG5cdFx0cmV0dXJuICgxIC0gciAqIHIpICogKG1heCAtIG1pbikgKyBtaW47XG5cdH1cblx0IFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBzaW1wbGV4MjtcbiIsIi8qKlxuICogQGF1dGhvciBxaWFvIC8gaHR0cHM6Ly9naXRodWIuY29tL3FpYW9cbiAqIEBhdXRob3IgbXJkb29iIC8gaHR0cDovL21yZG9vYi5jb21cbiAqIEBhdXRob3IgYWx0ZXJlZHEgLyBodHRwOi8vYWx0ZXJlZHF1YWxpYS5jb20vXG4gKiBAYXV0aG9yIFdlc3RMYW5nbGV5IC8gaHR0cDovL2dpdGh1Yi5jb20vV2VzdExhbmdsZXlcbiAqIEBhdXRob3IgZXJpY2g2NjYgLyBodHRwOi8vZXJpY2hhaW5lcy5jb21cbiAqL1xuLypnbG9iYWwgVEhSRUUsIGNvbnNvbGUgKi9cblxuLy8gVGhpcyBzZXQgb2YgY29udHJvbHMgcGVyZm9ybXMgb3JiaXRpbmcsIGRvbGx5aW5nICh6b29taW5nKSwgYW5kIHBhbm5pbmcuIEl0IG1haW50YWluc1xuLy8gdGhlIFwidXBcIiBkaXJlY3Rpb24gYXMgK1ksIHVubGlrZSB0aGUgVHJhY2tiYWxsQ29udHJvbHMuIFRvdWNoIG9uIHRhYmxldCBhbmQgcGhvbmVzIGlzXG4vLyBzdXBwb3J0ZWQuXG4vL1xuLy8gICAgT3JiaXQgLSBsZWZ0IG1vdXNlIC8gdG91Y2g6IG9uZSBmaW5nZXIgbW92ZVxuLy8gICAgWm9vbSAtIG1pZGRsZSBtb3VzZSwgb3IgbW91c2V3aGVlbCAvIHRvdWNoOiB0d28gZmluZ2VyIHNwcmVhZCBvciBzcXVpc2hcbi8vICAgIFBhbiAtIHJpZ2h0IG1vdXNlLCBvciBhcnJvdyBrZXlzIC8gdG91Y2g6IHRocmVlIGZpbnRlciBzd2lwZVxuLy9cbi8vIFRoaXMgaXMgYSBkcm9wLWluIHJlcGxhY2VtZW50IGZvciAobW9zdCkgVHJhY2tiYWxsQ29udHJvbHMgdXNlZCBpbiBleGFtcGxlcy5cbi8vIFRoYXQgaXMsIGluY2x1ZGUgdGhpcyBqcyBmaWxlIGFuZCB3aGVyZXZlciB5b3Ugc2VlOlxuLy8gICAgXHRjb250cm9scyA9IG5ldyBUSFJFRS5UcmFja2JhbGxDb250cm9scyggY2FtZXJhICk7XG4vLyAgICAgIGNvbnRyb2xzLnRhcmdldC56ID0gMTUwO1xuLy8gU2ltcGxlIHN1YnN0aXR1dGUgXCJPcmJpdENvbnRyb2xzXCIgYW5kIHRoZSBjb250cm9sIHNob3VsZCB3b3JrIGFzLWlzLlxuXG52YXIgT3JiaXRDb250cm9scyA9IGZ1bmN0aW9uICggb2JqZWN0LCBkb21FbGVtZW50ICkge1xuXG5cdHRoaXMub2JqZWN0ID0gb2JqZWN0O1xuXHR0aGlzLmRvbUVsZW1lbnQgPSAoIGRvbUVsZW1lbnQgIT09IHVuZGVmaW5lZCApID8gZG9tRWxlbWVudCA6IGRvY3VtZW50O1xuXG5cdC8vIEFQSVxuXG5cdC8vIFNldCB0byBmYWxzZSB0byBkaXNhYmxlIHRoaXMgY29udHJvbFxuXHR0aGlzLmVuYWJsZWQgPSB0cnVlO1xuXG5cdC8vIFwidGFyZ2V0XCIgc2V0cyB0aGUgbG9jYXRpb24gb2YgZm9jdXMsIHdoZXJlIHRoZSBjb250cm9sIG9yYml0cyBhcm91bmRcblx0Ly8gYW5kIHdoZXJlIGl0IHBhbnMgd2l0aCByZXNwZWN0IHRvLlxuXHR0aGlzLnRhcmdldCA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cdC8vIGNlbnRlciBpcyBvbGQsIGRlcHJlY2F0ZWQ7IHVzZSBcInRhcmdldFwiIGluc3RlYWRcblx0dGhpcy5jZW50ZXIgPSB0aGlzLnRhcmdldDtcblxuXHQvLyBUaGlzIG9wdGlvbiBhY3R1YWxseSBlbmFibGVzIGRvbGx5aW5nIGluIGFuZCBvdXQ7IGxlZnQgYXMgXCJ6b29tXCIgZm9yXG5cdC8vIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG5cdHRoaXMubm9ab29tID0gZmFsc2U7XG5cdHRoaXMuem9vbVNwZWVkID0gMS4wO1xuXHQvLyBMaW1pdHMgdG8gaG93IGZhciB5b3UgY2FuIGRvbGx5IGluIGFuZCBvdXRcblx0dGhpcy5taW5EaXN0YW5jZSA9IDA7XG5cdHRoaXMubWF4RGlzdGFuY2UgPSBJbmZpbml0eTtcblxuXHQvLyBTZXQgdG8gdHJ1ZSB0byBkaXNhYmxlIHRoaXMgY29udHJvbFxuXHR0aGlzLm5vUm90YXRlID0gZmFsc2U7XG5cdHRoaXMucm90YXRlU3BlZWQgPSAxLjA7XG5cblx0Ly8gU2V0IHRvIHRydWUgdG8gZGlzYWJsZSB0aGlzIGNvbnRyb2xcblx0dGhpcy5ub1BhbiA9IGZhbHNlO1xuXHR0aGlzLmtleVBhblNwZWVkID0gNy4wO1x0Ly8gcGl4ZWxzIG1vdmVkIHBlciBhcnJvdyBrZXkgcHVzaFxuXG5cdC8vIFNldCB0byB0cnVlIHRvIGF1dG9tYXRpY2FsbHkgcm90YXRlIGFyb3VuZCB0aGUgdGFyZ2V0XG5cdHRoaXMuYXV0b1JvdGF0ZSA9IGZhbHNlO1xuXHR0aGlzLmF1dG9Sb3RhdGVTcGVlZCA9IDIuMDsgLy8gMzAgc2Vjb25kcyBwZXIgcm91bmQgd2hlbiBmcHMgaXMgNjBcblxuXHQvLyBIb3cgZmFyIHlvdSBjYW4gb3JiaXQgdmVydGljYWxseSwgdXBwZXIgYW5kIGxvd2VyIGxpbWl0cy5cblx0Ly8gUmFuZ2UgaXMgMCB0byBNYXRoLlBJIHJhZGlhbnMuXG5cdHRoaXMubWluUG9sYXJBbmdsZSA9IDA7IC8vIHJhZGlhbnNcblx0dGhpcy5tYXhQb2xhckFuZ2xlID0gTWF0aC5QSTsgLy8gcmFkaWFuc1xuXG5cdC8vIFNldCB0byB0cnVlIHRvIGRpc2FibGUgdXNlIG9mIHRoZSBrZXlzXG5cdHRoaXMubm9LZXlzID0gZmFsc2U7XG5cdC8vIFRoZSBmb3VyIGFycm93IGtleXNcblx0dGhpcy5rZXlzID0geyBMRUZUOiAzNywgVVA6IDM4LCBSSUdIVDogMzksIEJPVFRPTTogNDAgfTtcblxuXHQvLy8vLy8vLy8vLy9cblx0Ly8gaW50ZXJuYWxzXG5cblx0dmFyIHNjb3BlID0gdGhpcztcblxuXHR2YXIgRVBTID0gMC4wMDAwMDE7XG5cblx0dmFyIHJvdGF0ZVN0YXJ0ID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblx0dmFyIHJvdGF0ZUVuZCA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cdHZhciByb3RhdGVEZWx0YSA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cblx0dmFyIHBhblN0YXJ0ID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblx0dmFyIHBhbkVuZCA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cdHZhciBwYW5EZWx0YSA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cblx0dmFyIGRvbGx5U3RhcnQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXHR2YXIgZG9sbHlFbmQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXHR2YXIgZG9sbHlEZWx0YSA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cblx0dmFyIHBoaURlbHRhID0gMDtcblx0dmFyIHRoZXRhRGVsdGEgPSAwO1xuXHR2YXIgc2NhbGUgPSAxO1xuXHR2YXIgcGFuID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuXHR2YXIgbGFzdFBvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuXHR2YXIgU1RBVEUgPSB7IE5PTkUgOiAtMSwgUk9UQVRFIDogMCwgRE9MTFkgOiAxLCBQQU4gOiAyLCBUT1VDSF9ST1RBVEUgOiAzLCBUT1VDSF9ET0xMWSA6IDQsIFRPVUNIX1BBTiA6IDUgfTtcblx0dmFyIHN0YXRlID0gU1RBVEUuTk9ORTtcblxuXHQvLyBldmVudHNcblxuXHR2YXIgY2hhbmdlRXZlbnQgPSB7IHR5cGU6ICdjaGFuZ2UnIH07XG5cblxuXHR0aGlzLnJvdGF0ZUxlZnQgPSBmdW5jdGlvbiAoIGFuZ2xlICkge1xuXG5cdFx0aWYgKCBhbmdsZSA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRhbmdsZSA9IGdldEF1dG9Sb3RhdGlvbkFuZ2xlKCk7XG5cblx0XHR9XG5cblx0XHR0aGV0YURlbHRhIC09IGFuZ2xlO1xuXG5cdH07XG5cblx0dGhpcy5yb3RhdGVVcCA9IGZ1bmN0aW9uICggYW5nbGUgKSB7XG5cblx0XHRpZiAoIGFuZ2xlID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGFuZ2xlID0gZ2V0QXV0b1JvdGF0aW9uQW5nbGUoKTtcblxuXHRcdH1cblxuXHRcdHBoaURlbHRhIC09IGFuZ2xlO1xuXG5cdH07XG5cblx0Ly8gcGFzcyBpbiBkaXN0YW5jZSBpbiB3b3JsZCBzcGFjZSB0byBtb3ZlIGxlZnRcblx0dGhpcy5wYW5MZWZ0ID0gZnVuY3Rpb24gKCBkaXN0YW5jZSApIHtcblxuXHRcdHZhciBwYW5PZmZzZXQgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXHRcdHZhciB0ZSA9IHRoaXMub2JqZWN0Lm1hdHJpeC5lbGVtZW50cztcblx0XHQvLyBnZXQgWCBjb2x1bW4gb2YgbWF0cml4XG5cdFx0cGFuT2Zmc2V0LnNldCggdGVbMF0sIHRlWzFdLCB0ZVsyXSApO1xuXHRcdHBhbk9mZnNldC5tdWx0aXBseVNjYWxhcigtZGlzdGFuY2UpO1xuXHRcdFxuXHRcdHBhbi5hZGQoIHBhbk9mZnNldCApO1xuXG5cdH07XG5cblx0Ly8gcGFzcyBpbiBkaXN0YW5jZSBpbiB3b3JsZCBzcGFjZSB0byBtb3ZlIHVwXG5cdHRoaXMucGFuVXAgPSBmdW5jdGlvbiAoIGRpc3RhbmNlICkge1xuXG5cdFx0dmFyIHBhbk9mZnNldCA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cdFx0dmFyIHRlID0gdGhpcy5vYmplY3QubWF0cml4LmVsZW1lbnRzO1xuXHRcdC8vIGdldCBZIGNvbHVtbiBvZiBtYXRyaXhcblx0XHRwYW5PZmZzZXQuc2V0KCB0ZVs0XSwgdGVbNV0sIHRlWzZdICk7XG5cdFx0cGFuT2Zmc2V0Lm11bHRpcGx5U2NhbGFyKGRpc3RhbmNlKTtcblx0XHRcblx0XHRwYW4uYWRkKCBwYW5PZmZzZXQgKTtcblx0fTtcblx0XG5cdC8vIG1haW4gZW50cnkgcG9pbnQ7IHBhc3MgaW4gVmVjdG9yMiBvZiBjaGFuZ2UgZGVzaXJlZCBpbiBwaXhlbCBzcGFjZSxcblx0Ly8gcmlnaHQgYW5kIGRvd24gYXJlIHBvc2l0aXZlXG5cdHRoaXMucGFuID0gZnVuY3Rpb24gKCBkZWx0YSApIHtcblxuXHRcdHZhciBlbGVtZW50ID0gc2NvcGUuZG9tRWxlbWVudCA9PT0gZG9jdW1lbnQgPyBzY29wZS5kb21FbGVtZW50LmJvZHkgOiBzY29wZS5kb21FbGVtZW50O1xuXG5cdFx0aWYgKCBzY29wZS5vYmplY3QuZm92ICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdC8vIHBlcnNwZWN0aXZlXG5cdFx0XHR2YXIgcG9zaXRpb24gPSBzY29wZS5vYmplY3QucG9zaXRpb247XG5cdFx0XHR2YXIgb2Zmc2V0ID0gcG9zaXRpb24uY2xvbmUoKS5zdWIoIHNjb3BlLnRhcmdldCApO1xuXHRcdFx0dmFyIHRhcmdldERpc3RhbmNlID0gb2Zmc2V0Lmxlbmd0aCgpO1xuXG5cdFx0XHQvLyBoYWxmIG9mIHRoZSBmb3YgaXMgY2VudGVyIHRvIHRvcCBvZiBzY3JlZW5cblx0XHRcdHRhcmdldERpc3RhbmNlICo9IE1hdGgudGFuKCAoc2NvcGUub2JqZWN0LmZvdi8yKSAqIE1hdGguUEkgLyAxODAuMCApO1xuXHRcdFx0Ly8gd2UgYWN0dWFsbHkgZG9uJ3QgdXNlIHNjcmVlbldpZHRoLCBzaW5jZSBwZXJzcGVjdGl2ZSBjYW1lcmEgaXMgZml4ZWQgdG8gc2NyZWVuIGhlaWdodFxuXHRcdFx0c2NvcGUucGFuTGVmdCggMiAqIGRlbHRhLnggKiB0YXJnZXREaXN0YW5jZSAvIGVsZW1lbnQuY2xpZW50SGVpZ2h0ICk7XG5cdFx0XHRzY29wZS5wYW5VcCggMiAqIGRlbHRhLnkgKiB0YXJnZXREaXN0YW5jZSAvIGVsZW1lbnQuY2xpZW50SGVpZ2h0ICk7XG5cblx0XHR9IGVsc2UgaWYgKCBzY29wZS5vYmplY3QudG9wICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdC8vIG9ydGhvZ3JhcGhpY1xuXHRcdFx0c2NvcGUucGFuTGVmdCggZGVsdGEueCAqIChzY29wZS5vYmplY3QucmlnaHQgLSBzY29wZS5vYmplY3QubGVmdCkgLyBlbGVtZW50LmNsaWVudFdpZHRoICk7XG5cdFx0XHRzY29wZS5wYW5VcCggZGVsdGEueSAqIChzY29wZS5vYmplY3QudG9wIC0gc2NvcGUub2JqZWN0LmJvdHRvbSkgLyBlbGVtZW50LmNsaWVudEhlaWdodCApO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0Ly8gY2FtZXJhIG5laXRoZXIgb3J0aG9ncmFwaGljIG9yIHBlcnNwZWN0aXZlIC0gd2FybiB1c2VyXG5cdFx0XHRjb25zb2xlLndhcm4oICdXQVJOSU5HOiBPcmJpdENvbnRyb2xzLmpzIGVuY291bnRlcmVkIGFuIHVua25vd24gY2FtZXJhIHR5cGUgLSBwYW4gZGlzYWJsZWQuJyApO1xuXG5cdFx0fVxuXG5cdH07XG5cblx0dGhpcy5kb2xseUluID0gZnVuY3Rpb24gKCBkb2xseVNjYWxlICkge1xuXG5cdFx0aWYgKCBkb2xseVNjYWxlID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGRvbGx5U2NhbGUgPSBnZXRab29tU2NhbGUoKTtcblxuXHRcdH1cblxuXHRcdHNjYWxlIC89IGRvbGx5U2NhbGU7XG5cblx0fTtcblxuXHR0aGlzLmRvbGx5T3V0ID0gZnVuY3Rpb24gKCBkb2xseVNjYWxlICkge1xuXG5cdFx0aWYgKCBkb2xseVNjYWxlID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGRvbGx5U2NhbGUgPSBnZXRab29tU2NhbGUoKTtcblxuXHRcdH1cblxuXHRcdHNjYWxlICo9IGRvbGx5U2NhbGU7XG5cblx0fTtcblxuXHR0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdHZhciBwb3NpdGlvbiA9IHRoaXMub2JqZWN0LnBvc2l0aW9uO1xuXHRcdHZhciBvZmZzZXQgPSBwb3NpdGlvbi5jbG9uZSgpLnN1YiggdGhpcy50YXJnZXQgKTtcblxuXHRcdC8vIGFuZ2xlIGZyb20gei1heGlzIGFyb3VuZCB5LWF4aXNcblxuXHRcdHZhciB0aGV0YSA9IE1hdGguYXRhbjIoIG9mZnNldC54LCBvZmZzZXQueiApO1xuXG5cdFx0Ly8gYW5nbGUgZnJvbSB5LWF4aXNcblxuXHRcdHZhciBwaGkgPSBNYXRoLmF0YW4yKCBNYXRoLnNxcnQoIG9mZnNldC54ICogb2Zmc2V0LnggKyBvZmZzZXQueiAqIG9mZnNldC56ICksIG9mZnNldC55ICk7XG5cblx0XHRpZiAoIHRoaXMuYXV0b1JvdGF0ZSApIHtcblxuXHRcdFx0dGhpcy5yb3RhdGVMZWZ0KCBnZXRBdXRvUm90YXRpb25BbmdsZSgpICk7XG5cblx0XHR9XG5cblx0XHR0aGV0YSArPSB0aGV0YURlbHRhO1xuXHRcdHBoaSArPSBwaGlEZWx0YTtcblxuXHRcdC8vIHJlc3RyaWN0IHBoaSB0byBiZSBiZXR3ZWVuIGRlc2lyZWQgbGltaXRzXG5cdFx0cGhpID0gTWF0aC5tYXgoIHRoaXMubWluUG9sYXJBbmdsZSwgTWF0aC5taW4oIHRoaXMubWF4UG9sYXJBbmdsZSwgcGhpICkgKTtcblxuXHRcdC8vIHJlc3RyaWN0IHBoaSB0byBiZSBiZXR3ZWUgRVBTIGFuZCBQSS1FUFNcblx0XHRwaGkgPSBNYXRoLm1heCggRVBTLCBNYXRoLm1pbiggTWF0aC5QSSAtIEVQUywgcGhpICkgKTtcblxuXHRcdHZhciByYWRpdXMgPSBvZmZzZXQubGVuZ3RoKCkgKiBzY2FsZTtcblxuXHRcdC8vIHJlc3RyaWN0IHJhZGl1cyB0byBiZSBiZXR3ZWVuIGRlc2lyZWQgbGltaXRzXG5cdFx0cmFkaXVzID0gTWF0aC5tYXgoIHRoaXMubWluRGlzdGFuY2UsIE1hdGgubWluKCB0aGlzLm1heERpc3RhbmNlLCByYWRpdXMgKSApO1xuXHRcdFxuXHRcdC8vIG1vdmUgdGFyZ2V0IHRvIHBhbm5lZCBsb2NhdGlvblxuXHRcdHRoaXMudGFyZ2V0LmFkZCggcGFuICk7XG5cblx0XHRvZmZzZXQueCA9IHJhZGl1cyAqIE1hdGguc2luKCBwaGkgKSAqIE1hdGguc2luKCB0aGV0YSApO1xuXHRcdG9mZnNldC55ID0gcmFkaXVzICogTWF0aC5jb3MoIHBoaSApO1xuXHRcdG9mZnNldC56ID0gcmFkaXVzICogTWF0aC5zaW4oIHBoaSApICogTWF0aC5jb3MoIHRoZXRhICk7XG5cblx0XHRwb3NpdGlvbi5jb3B5KCB0aGlzLnRhcmdldCApLmFkZCggb2Zmc2V0ICk7XG5cblx0XHR0aGlzLm9iamVjdC5sb29rQXQoIHRoaXMudGFyZ2V0ICk7XG5cblx0XHR0aGV0YURlbHRhID0gMDtcblx0XHRwaGlEZWx0YSA9IDA7XG5cdFx0c2NhbGUgPSAxO1xuXHRcdHBhbi5zZXQoMCwwLDApO1xuXG5cdFx0aWYgKCBsYXN0UG9zaXRpb24uZGlzdGFuY2VUbyggdGhpcy5vYmplY3QucG9zaXRpb24gKSA+IDAgKSB7XG5cblx0XHRcdHRoaXMuZGlzcGF0Y2hFdmVudCggY2hhbmdlRXZlbnQgKTtcblxuXHRcdFx0bGFzdFBvc2l0aW9uLmNvcHkoIHRoaXMub2JqZWN0LnBvc2l0aW9uICk7XG5cblx0XHR9XG5cblx0fTtcblxuXG5cdGZ1bmN0aW9uIGdldEF1dG9Sb3RhdGlvbkFuZ2xlKCkge1xuXG5cdFx0cmV0dXJuIDIgKiBNYXRoLlBJIC8gNjAgLyA2MCAqIHNjb3BlLmF1dG9Sb3RhdGVTcGVlZDtcblxuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0Wm9vbVNjYWxlKCkge1xuXG5cdFx0cmV0dXJuIE1hdGgucG93KCAwLjk1LCBzY29wZS56b29tU3BlZWQgKTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gb25Nb3VzZURvd24oIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBzY29wZS5lbmFibGVkID09PSBmYWxzZSApIHsgcmV0dXJuOyB9XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdGlmICggZXZlbnQuYnV0dG9uID09PSAwICkge1xuXHRcdFx0aWYgKCBzY29wZS5ub1JvdGF0ZSA9PT0gdHJ1ZSApIHsgcmV0dXJuOyB9XG5cblx0XHRcdHN0YXRlID0gU1RBVEUuUk9UQVRFO1xuXG5cdFx0XHRyb3RhdGVTdGFydC5zZXQoIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkgKTtcblxuXHRcdH0gZWxzZSBpZiAoIGV2ZW50LmJ1dHRvbiA9PT0gMSApIHtcblx0XHRcdGlmICggc2NvcGUubm9ab29tID09PSB0cnVlICkgeyByZXR1cm47IH1cblxuXHRcdFx0c3RhdGUgPSBTVEFURS5ET0xMWTtcblxuXHRcdFx0ZG9sbHlTdGFydC5zZXQoIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkgKTtcblxuXHRcdH0gZWxzZSBpZiAoIGV2ZW50LmJ1dHRvbiA9PT0gMiApIHtcblx0XHRcdGlmICggc2NvcGUubm9QYW4gPT09IHRydWUgKSB7IHJldHVybjsgfVxuXG5cdFx0XHRzdGF0ZSA9IFNUQVRFLlBBTjtcblxuXHRcdFx0cGFuU3RhcnQuc2V0KCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZICk7XG5cblx0XHR9XG5cblx0XHQvLyBHcmVnZ21hbiBmaXg6IGh0dHBzOi8vZ2l0aHViLmNvbS9ncmVnZ21hbi90aHJlZS5qcy9jb21taXQvZmRlOWY5OTE3ZDZkODM4MWYwNmJmMjJjZGZmNzY2MDI5ZDE3NjFiZVxuXHRcdHNjb3BlLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlLCBmYWxzZSApO1xuXHRcdHNjb3BlLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCBvbk1vdXNlVXAsIGZhbHNlICk7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIG9uTW91c2VNb3ZlKCBldmVudCApIHtcblxuXHRcdGlmICggc2NvcGUuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0dmFyIGVsZW1lbnQgPSBzY29wZS5kb21FbGVtZW50ID09PSBkb2N1bWVudCA/IHNjb3BlLmRvbUVsZW1lbnQuYm9keSA6IHNjb3BlLmRvbUVsZW1lbnQ7XG5cblx0XHRpZiAoIHN0YXRlID09PSBTVEFURS5ST1RBVEUgKSB7XG5cblx0XHRcdGlmICggc2NvcGUubm9Sb3RhdGUgPT09IHRydWUgKSByZXR1cm47XG5cblx0XHRcdHJvdGF0ZUVuZC5zZXQoIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkgKTtcblx0XHRcdHJvdGF0ZURlbHRhLnN1YlZlY3RvcnMoIHJvdGF0ZUVuZCwgcm90YXRlU3RhcnQgKTtcblxuXHRcdFx0Ly8gcm90YXRpbmcgYWNyb3NzIHdob2xlIHNjcmVlbiBnb2VzIDM2MCBkZWdyZWVzIGFyb3VuZFxuXHRcdFx0c2NvcGUucm90YXRlTGVmdCggMiAqIE1hdGguUEkgKiByb3RhdGVEZWx0YS54IC8gZWxlbWVudC5jbGllbnRXaWR0aCAqIHNjb3BlLnJvdGF0ZVNwZWVkICk7XG5cdFx0XHQvLyByb3RhdGluZyB1cCBhbmQgZG93biBhbG9uZyB3aG9sZSBzY3JlZW4gYXR0ZW1wdHMgdG8gZ28gMzYwLCBidXQgbGltaXRlZCB0byAxODBcblx0XHRcdHNjb3BlLnJvdGF0ZVVwKCAyICogTWF0aC5QSSAqIHJvdGF0ZURlbHRhLnkgLyBlbGVtZW50LmNsaWVudEhlaWdodCAqIHNjb3BlLnJvdGF0ZVNwZWVkICk7XG5cblx0XHRcdHJvdGF0ZVN0YXJ0LmNvcHkoIHJvdGF0ZUVuZCApO1xuXG5cdFx0fSBlbHNlIGlmICggc3RhdGUgPT09IFNUQVRFLkRPTExZICkge1xuXG5cdFx0XHRpZiAoIHNjb3BlLm5vWm9vbSA9PT0gdHJ1ZSApIHJldHVybjtcblxuXHRcdFx0ZG9sbHlFbmQuc2V0KCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZICk7XG5cdFx0XHRkb2xseURlbHRhLnN1YlZlY3RvcnMoIGRvbGx5RW5kLCBkb2xseVN0YXJ0ICk7XG5cblx0XHRcdGlmICggZG9sbHlEZWx0YS55ID4gMCApIHtcblxuXHRcdFx0XHRzY29wZS5kb2xseUluKCk7XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0c2NvcGUuZG9sbHlPdXQoKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRkb2xseVN0YXJ0LmNvcHkoIGRvbGx5RW5kICk7XG5cblx0XHR9IGVsc2UgaWYgKCBzdGF0ZSA9PT0gU1RBVEUuUEFOICkge1xuXG5cdFx0XHRpZiAoIHNjb3BlLm5vUGFuID09PSB0cnVlICkgcmV0dXJuO1xuXG5cdFx0XHRwYW5FbmQuc2V0KCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZICk7XG5cdFx0XHRwYW5EZWx0YS5zdWJWZWN0b3JzKCBwYW5FbmQsIHBhblN0YXJ0ICk7XG5cdFx0XHRcblx0XHRcdHNjb3BlLnBhbiggcGFuRGVsdGEgKTtcblxuXHRcdFx0cGFuU3RhcnQuY29weSggcGFuRW5kICk7XG5cblx0XHR9XG5cblx0XHQvLyBHcmVnZ21hbiBmaXg6IGh0dHBzOi8vZ2l0aHViLmNvbS9ncmVnZ21hbi90aHJlZS5qcy9jb21taXQvZmRlOWY5OTE3ZDZkODM4MWYwNmJmMjJjZGZmNzY2MDI5ZDE3NjFiZVxuXHRcdHNjb3BlLnVwZGF0ZSgpO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBvbk1vdXNlVXAoIC8qIGV2ZW50ICovICkge1xuXG5cdFx0aWYgKCBzY29wZS5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdC8vIEdyZWdnbWFuIGZpeDogaHR0cHM6Ly9naXRodWIuY29tL2dyZWdnbWFuL3RocmVlLmpzL2NvbW1pdC9mZGU5Zjk5MTdkNmQ4MzgxZjA2YmYyMmNkZmY3NjYwMjlkMTc2MWJlXG5cdFx0c2NvcGUuZG9tRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUsIGZhbHNlICk7XG5cdFx0c2NvcGUuZG9tRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsIG9uTW91c2VVcCwgZmFsc2UgKTtcblxuXHRcdHN0YXRlID0gU1RBVEUuTk9ORTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gb25Nb3VzZVdoZWVsKCBldmVudCApIHtcblxuXHRcdGlmICggc2NvcGUuZW5hYmxlZCA9PT0gZmFsc2UgfHwgc2NvcGUubm9ab29tID09PSB0cnVlICkgcmV0dXJuO1xuXG5cdFx0dmFyIGRlbHRhID0gMDtcblxuXHRcdGlmICggZXZlbnQud2hlZWxEZWx0YSApIHsgLy8gV2ViS2l0IC8gT3BlcmEgLyBFeHBsb3JlciA5XG5cblx0XHRcdGRlbHRhID0gZXZlbnQud2hlZWxEZWx0YTtcblxuXHRcdH0gZWxzZSBpZiAoIGV2ZW50LmRldGFpbCApIHsgLy8gRmlyZWZveFxuXG5cdFx0XHRkZWx0YSA9IC0gZXZlbnQuZGV0YWlsO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCBkZWx0YSA+IDAgKSB7XG5cblx0XHRcdHNjb3BlLmRvbGx5T3V0KCk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRzY29wZS5kb2xseUluKCk7XG5cblx0XHR9XG5cblx0fVxuXG5cdGZ1bmN0aW9uIG9uS2V5RG93biggZXZlbnQgKSB7XG5cblx0XHRpZiAoIHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlICkgeyByZXR1cm47IH1cblx0XHRpZiAoIHNjb3BlLm5vS2V5cyA9PT0gdHJ1ZSApIHsgcmV0dXJuOyB9XG5cdFx0aWYgKCBzY29wZS5ub1BhbiA9PT0gdHJ1ZSApIHsgcmV0dXJuOyB9XG5cblx0XHQvLyBwYW4gYSBwaXhlbCAtIEkgZ3Vlc3MgZm9yIHByZWNpc2UgcG9zaXRpb25pbmc/XG5cdFx0Ly8gR3JlZ2dtYW4gZml4OiBodHRwczovL2dpdGh1Yi5jb20vZ3JlZ2dtYW4vdGhyZWUuanMvY29tbWl0L2ZkZTlmOTkxN2Q2ZDgzODFmMDZiZjIyY2RmZjc2NjAyOWQxNzYxYmVcblx0XHR2YXIgbmVlZFVwZGF0ZSA9IGZhbHNlO1xuXHRcdFxuXHRcdHN3aXRjaCAoIGV2ZW50LmtleUNvZGUgKSB7XG5cblx0XHRcdGNhc2Ugc2NvcGUua2V5cy5VUDpcblx0XHRcdFx0c2NvcGUucGFuKCBuZXcgVEhSRUUuVmVjdG9yMiggMCwgc2NvcGUua2V5UGFuU3BlZWQgKSApO1xuXHRcdFx0XHRuZWVkVXBkYXRlID0gdHJ1ZTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIHNjb3BlLmtleXMuQk9UVE9NOlxuXHRcdFx0XHRzY29wZS5wYW4oIG5ldyBUSFJFRS5WZWN0b3IyKCAwLCAtc2NvcGUua2V5UGFuU3BlZWQgKSApO1xuXHRcdFx0XHRuZWVkVXBkYXRlID0gdHJ1ZTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIHNjb3BlLmtleXMuTEVGVDpcblx0XHRcdFx0c2NvcGUucGFuKCBuZXcgVEhSRUUuVmVjdG9yMiggc2NvcGUua2V5UGFuU3BlZWQsIDAgKSApO1xuXHRcdFx0XHRuZWVkVXBkYXRlID0gdHJ1ZTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIHNjb3BlLmtleXMuUklHSFQ6XG5cdFx0XHRcdHNjb3BlLnBhbiggbmV3IFRIUkVFLlZlY3RvcjIoIC1zY29wZS5rZXlQYW5TcGVlZCwgMCApICk7XG5cdFx0XHRcdG5lZWRVcGRhdGUgPSB0cnVlO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHQvLyBHcmVnZ21hbiBmaXg6IGh0dHBzOi8vZ2l0aHViLmNvbS9ncmVnZ21hbi90aHJlZS5qcy9jb21taXQvZmRlOWY5OTE3ZDZkODM4MWYwNmJmMjJjZGZmNzY2MDI5ZDE3NjFiZVxuXHRcdGlmICggbmVlZFVwZGF0ZSApIHtcblxuXHRcdFx0c2NvcGUudXBkYXRlKCk7XG5cblx0XHR9XG5cblx0fVxuXHRcblx0ZnVuY3Rpb24gdG91Y2hzdGFydCggZXZlbnQgKSB7XG5cblx0XHRpZiAoIHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlICkgeyByZXR1cm47IH1cblxuXHRcdHN3aXRjaCAoIGV2ZW50LnRvdWNoZXMubGVuZ3RoICkge1xuXG5cdFx0XHRjYXNlIDE6XHQvLyBvbmUtZmluZ2VyZWQgdG91Y2g6IHJvdGF0ZVxuXHRcdFx0XHRpZiAoIHNjb3BlLm5vUm90YXRlID09PSB0cnVlICkgeyByZXR1cm47IH1cblxuXHRcdFx0XHRzdGF0ZSA9IFNUQVRFLlRPVUNIX1JPVEFURTtcblxuXHRcdFx0XHRyb3RhdGVTdGFydC5zZXQoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCwgZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIDI6XHQvLyB0d28tZmluZ2VyZWQgdG91Y2g6IGRvbGx5XG5cdFx0XHRcdGlmICggc2NvcGUubm9ab29tID09PSB0cnVlICkgeyByZXR1cm47IH1cblxuXHRcdFx0XHRzdGF0ZSA9IFNUQVRFLlRPVUNIX0RPTExZO1xuXG5cdFx0XHRcdHZhciBkeCA9IGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCAtIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWDtcblx0XHRcdFx0dmFyIGR5ID0gZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZIC0gZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VZO1xuXHRcdFx0XHR2YXIgZGlzdGFuY2UgPSBNYXRoLnNxcnQoIGR4ICogZHggKyBkeSAqIGR5ICk7XG5cdFx0XHRcdGRvbGx5U3RhcnQuc2V0KCAwLCBkaXN0YW5jZSApO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAzOiAvLyB0aHJlZS1maW5nZXJlZCB0b3VjaDogcGFuXG5cdFx0XHRcdGlmICggc2NvcGUubm9QYW4gPT09IHRydWUgKSB7IHJldHVybjsgfVxuXG5cdFx0XHRcdHN0YXRlID0gU1RBVEUuVE9VQ0hfUEFOO1xuXG5cdFx0XHRcdHBhblN0YXJ0LnNldCggZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYLCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHN0YXRlID0gU1RBVEUuTk9ORTtcblxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHRvdWNobW92ZSggZXZlbnQgKSB7XG5cblx0XHRpZiAoIHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlICkgeyByZXR1cm47IH1cblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHR2YXIgZWxlbWVudCA9IHNjb3BlLmRvbUVsZW1lbnQgPT09IGRvY3VtZW50ID8gc2NvcGUuZG9tRWxlbWVudC5ib2R5IDogc2NvcGUuZG9tRWxlbWVudDtcblxuXHRcdHN3aXRjaCAoIGV2ZW50LnRvdWNoZXMubGVuZ3RoICkge1xuXG5cdFx0XHRjYXNlIDE6IC8vIG9uZS1maW5nZXJlZCB0b3VjaDogcm90YXRlXG5cdFx0XHRcdGlmICggc2NvcGUubm9Sb3RhdGUgPT09IHRydWUgKSB7IHJldHVybjsgfVxuXHRcdFx0XHRpZiAoIHN0YXRlICE9PSBTVEFURS5UT1VDSF9ST1RBVEUgKSB7IHJldHVybjsgfVxuXG5cdFx0XHRcdHJvdGF0ZUVuZC5zZXQoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCwgZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZICk7XG5cdFx0XHRcdHJvdGF0ZURlbHRhLnN1YlZlY3RvcnMoIHJvdGF0ZUVuZCwgcm90YXRlU3RhcnQgKTtcblxuXHRcdFx0XHQvLyByb3RhdGluZyBhY3Jvc3Mgd2hvbGUgc2NyZWVuIGdvZXMgMzYwIGRlZ3JlZXMgYXJvdW5kXG5cdFx0XHRcdHNjb3BlLnJvdGF0ZUxlZnQoIDIgKiBNYXRoLlBJICogcm90YXRlRGVsdGEueCAvIGVsZW1lbnQuY2xpZW50V2lkdGggKiBzY29wZS5yb3RhdGVTcGVlZCApO1xuXHRcdFx0XHQvLyByb3RhdGluZyB1cCBhbmQgZG93biBhbG9uZyB3aG9sZSBzY3JlZW4gYXR0ZW1wdHMgdG8gZ28gMzYwLCBidXQgbGltaXRlZCB0byAxODBcblx0XHRcdFx0c2NvcGUucm90YXRlVXAoIDIgKiBNYXRoLlBJICogcm90YXRlRGVsdGEueSAvIGVsZW1lbnQuY2xpZW50SGVpZ2h0ICogc2NvcGUucm90YXRlU3BlZWQgKTtcblxuXHRcdFx0XHRyb3RhdGVTdGFydC5jb3B5KCByb3RhdGVFbmQgKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMjogLy8gdHdvLWZpbmdlcmVkIHRvdWNoOiBkb2xseVxuXHRcdFx0XHRpZiAoIHNjb3BlLm5vWm9vbSA9PT0gdHJ1ZSApIHsgcmV0dXJuOyB9XG5cdFx0XHRcdGlmICggc3RhdGUgIT09IFNUQVRFLlRPVUNIX0RPTExZICkgeyByZXR1cm47IH1cblxuXHRcdFx0XHR2YXIgZHggPSBldmVudC50b3VjaGVzWyAwIF0ucGFnZVggLSBldmVudC50b3VjaGVzWyAxIF0ucGFnZVg7XG5cdFx0XHRcdHZhciBkeSA9IGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSAtIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWTtcblx0XHRcdFx0dmFyIGRpc3RhbmNlID0gTWF0aC5zcXJ0KCBkeCAqIGR4ICsgZHkgKiBkeSApO1xuXG5cdFx0XHRcdGRvbGx5RW5kLnNldCggMCwgZGlzdGFuY2UgKTtcblx0XHRcdFx0ZG9sbHlEZWx0YS5zdWJWZWN0b3JzKCBkb2xseUVuZCwgZG9sbHlTdGFydCApO1xuXG5cdFx0XHRcdGlmICggZG9sbHlEZWx0YS55ID4gMCApIHtcblxuXHRcdFx0XHRcdHNjb3BlLmRvbGx5T3V0KCk7XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdHNjb3BlLmRvbGx5SW4oKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZG9sbHlTdGFydC5jb3B5KCBkb2xseUVuZCApO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAzOiAvLyB0aHJlZS1maW5nZXJlZCB0b3VjaDogcGFuXG5cdFx0XHRcdGlmICggc2NvcGUubm9QYW4gPT09IHRydWUgKSB7IHJldHVybjsgfVxuXHRcdFx0XHRpZiAoIHN0YXRlICE9PSBTVEFURS5UT1VDSF9QQU4gKSB7IHJldHVybjsgfVxuXG5cdFx0XHRcdHBhbkVuZC5zZXQoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCwgZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZICk7XG5cdFx0XHRcdHBhbkRlbHRhLnN1YlZlY3RvcnMoIHBhbkVuZCwgcGFuU3RhcnQgKTtcblx0XHRcdFx0XG5cdFx0XHRcdHNjb3BlLnBhbiggcGFuRGVsdGEgKTtcblxuXHRcdFx0XHRwYW5TdGFydC5jb3B5KCBwYW5FbmQgKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHN0YXRlID0gU1RBVEUuTk9ORTtcblxuXHRcdH1cblxuXHR9XG5cblx0ZnVuY3Rpb24gdG91Y2hlbmQoIC8qIGV2ZW50ICovICkge1xuXG5cdFx0aWYgKCBzY29wZS5lbmFibGVkID09PSBmYWxzZSApIHsgcmV0dXJuOyB9XG5cblx0XHRzdGF0ZSA9IFNUQVRFLk5PTkU7XG5cdH1cblxuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2NvbnRleHRtZW51JywgZnVuY3Rpb24gKCBldmVudCApIHsgZXZlbnQucHJldmVudERlZmF1bHQoKTsgfSwgZmFsc2UgKTtcblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCBvbk1vdXNlRG93biwgZmFsc2UgKTtcblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZXdoZWVsJywgb25Nb3VzZVdoZWVsLCBmYWxzZSApO1xuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ0RPTU1vdXNlU2Nyb2xsJywgb25Nb3VzZVdoZWVsLCBmYWxzZSApOyAvLyBmaXJlZm94XG5cblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgb25LZXlEb3duLCBmYWxzZSApO1xuXG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIHRvdWNoc3RhcnQsIGZhbHNlICk7XG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hlbmQnLCB0b3VjaGVuZCwgZmFsc2UgKTtcblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaG1vdmUnLCB0b3VjaG1vdmUsIGZhbHNlICk7XG5cbn07XG5cbk9yYml0Q29udHJvbHMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVEhSRUUuRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZSApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9yYml0Q29udHJvbHM7XG4iLCIvKipcbiAqIEBhdXRob3IgbXJkb29iIC8gaHR0cDovL21yZG9vYi5jb20vXG4gKi9cblxudmFyIFN0YXRzID0gZnVuY3Rpb24gKCkge1xuXG5cdHZhciBzdGFydFRpbWUgPSBEYXRlLm5vdygpLCBwcmV2VGltZSA9IHN0YXJ0VGltZTtcblx0dmFyIG1zID0gMCwgbXNNaW4gPSBJbmZpbml0eSwgbXNNYXggPSAwO1xuXHR2YXIgZnBzID0gMCwgZnBzTWluID0gSW5maW5pdHksIGZwc01heCA9IDA7XG5cdHZhciBmcmFtZXMgPSAwLCBtb2RlID0gMDtcblxuXHR2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblx0Y29udGFpbmVyLmlkID0gJ3N0YXRzJztcblx0Y29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCBmdW5jdGlvbiAoIGV2ZW50ICkgeyBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyBzZXRNb2RlKCArKyBtb2RlICUgMiApOyB9LCBmYWxzZSApO1xuXHRjb250YWluZXIuc3R5bGUuY3NzVGV4dCA9ICd3aWR0aDo4MHB4O29wYWNpdHk6MC45O2N1cnNvcjpwb2ludGVyJztcblxuXHR2YXIgZnBzRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblx0ZnBzRGl2LmlkID0gJ2Zwcyc7XG5cdGZwc0Rpdi5zdHlsZS5jc3NUZXh0ID0gJ3BhZGRpbmc6MCAwIDNweCAzcHg7dGV4dC1hbGlnbjpsZWZ0O2JhY2tncm91bmQtY29sb3I6IzAwMic7XG5cdGNvbnRhaW5lci5hcHBlbmRDaGlsZCggZnBzRGl2ICk7XG5cblx0dmFyIGZwc1RleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuXHRmcHNUZXh0LmlkID0gJ2Zwc1RleHQnO1xuXHRmcHNUZXh0LnN0eWxlLmNzc1RleHQgPSAnY29sb3I6IzBmZjtmb250LWZhbWlseTpIZWx2ZXRpY2EsQXJpYWwsc2Fucy1zZXJpZjtmb250LXNpemU6OXB4O2ZvbnQtd2VpZ2h0OmJvbGQ7bGluZS1oZWlnaHQ6MTVweCc7XG5cdGZwc1RleHQuaW5uZXJIVE1MID0gJ0ZQUyc7XG5cdGZwc0Rpdi5hcHBlbmRDaGlsZCggZnBzVGV4dCApO1xuXG5cdHZhciBmcHNHcmFwaCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdGZwc0dyYXBoLmlkID0gJ2Zwc0dyYXBoJztcblx0ZnBzR3JhcGguc3R5bGUuY3NzVGV4dCA9ICdwb3NpdGlvbjpyZWxhdGl2ZTt3aWR0aDo3NHB4O2hlaWdodDozMHB4O2JhY2tncm91bmQtY29sb3I6IzBmZic7XG5cdGZwc0Rpdi5hcHBlbmRDaGlsZCggZnBzR3JhcGggKTtcblxuXHR3aGlsZSAoIGZwc0dyYXBoLmNoaWxkcmVuLmxlbmd0aCA8IDc0ICkge1xuXG5cdFx0dmFyIGJhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdzcGFuJyApO1xuXHRcdGJhci5zdHlsZS5jc3NUZXh0ID0gJ3dpZHRoOjFweDtoZWlnaHQ6MzBweDtmbG9hdDpsZWZ0O2JhY2tncm91bmQtY29sb3I6IzExMyc7XG5cdFx0ZnBzR3JhcGguYXBwZW5kQ2hpbGQoIGJhciApO1xuXG5cdH1cblxuXHR2YXIgbXNEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuXHRtc0Rpdi5pZCA9ICdtcyc7XG5cdG1zRGl2LnN0eWxlLmNzc1RleHQgPSAncGFkZGluZzowIDAgM3B4IDNweDt0ZXh0LWFsaWduOmxlZnQ7YmFja2dyb3VuZC1jb2xvcjojMDIwO2Rpc3BsYXk6bm9uZSc7XG5cdGNvbnRhaW5lci5hcHBlbmRDaGlsZCggbXNEaXYgKTtcblxuXHR2YXIgbXNUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblx0bXNUZXh0LmlkID0gJ21zVGV4dCc7XG5cdG1zVGV4dC5zdHlsZS5jc3NUZXh0ID0gJ2NvbG9yOiMwZjA7Zm9udC1mYW1pbHk6SGVsdmV0aWNhLEFyaWFsLHNhbnMtc2VyaWY7Zm9udC1zaXplOjlweDtmb250LXdlaWdodDpib2xkO2xpbmUtaGVpZ2h0OjE1cHgnO1xuXHRtc1RleHQuaW5uZXJIVE1MID0gJ01TJztcblx0bXNEaXYuYXBwZW5kQ2hpbGQoIG1zVGV4dCApO1xuXG5cdHZhciBtc0dyYXBoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblx0bXNHcmFwaC5pZCA9ICdtc0dyYXBoJztcblx0bXNHcmFwaC5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOnJlbGF0aXZlO3dpZHRoOjc0cHg7aGVpZ2h0OjMwcHg7YmFja2dyb3VuZC1jb2xvcjojMGYwJztcblx0bXNEaXYuYXBwZW5kQ2hpbGQoIG1zR3JhcGggKTtcblxuXHR3aGlsZSAoIG1zR3JhcGguY2hpbGRyZW4ubGVuZ3RoIDwgNzQgKSB7XG5cblx0XHR2YXIgYmFyMiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdzcGFuJyApO1xuXHRcdGJhcjIuc3R5bGUuY3NzVGV4dCA9ICd3aWR0aDoxcHg7aGVpZ2h0OjMwcHg7ZmxvYXQ6bGVmdDtiYWNrZ3JvdW5kLWNvbG9yOiMxMzEnO1xuXHRcdG1zR3JhcGguYXBwZW5kQ2hpbGQoIGJhcjIgKTtcblxuXHR9XG5cblx0dmFyIHNldE1vZGUgPSBmdW5jdGlvbiAoIHZhbHVlICkge1xuXG5cdFx0bW9kZSA9IHZhbHVlO1xuXG5cdFx0c3dpdGNoICggbW9kZSApIHtcblxuXHRcdFx0Y2FzZSAwOlxuXHRcdFx0XHRmcHNEaXYuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdG1zRGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRmcHNEaXYuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblx0XHRcdFx0bXNEaXYuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHR9O1xuXG5cdHZhciB1cGRhdGVHcmFwaCA9IGZ1bmN0aW9uICggZG9tLCB2YWx1ZSApIHtcblxuXHRcdHZhciBjaGlsZCA9IGRvbS5hcHBlbmRDaGlsZCggZG9tLmZpcnN0Q2hpbGQgKTtcblx0XHRjaGlsZC5zdHlsZS5oZWlnaHQgPSB2YWx1ZSArICdweCc7XG5cblx0fTtcblxuXHRyZXR1cm4ge1xuXG5cdFx0UkVWSVNJT046IDEyLFxuXG5cdFx0ZG9tRWxlbWVudDogY29udGFpbmVyLFxuXG5cdFx0c2V0TW9kZTogc2V0TW9kZSxcblxuXHRcdGJlZ2luOiBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG5cblx0XHR9LFxuXG5cdFx0ZW5kOiBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdHZhciB0aW1lID0gRGF0ZS5ub3coKTtcblxuXHRcdFx0bXMgPSB0aW1lIC0gc3RhcnRUaW1lO1xuXHRcdFx0bXNNaW4gPSBNYXRoLm1pbiggbXNNaW4sIG1zICk7XG5cdFx0XHRtc01heCA9IE1hdGgubWF4KCBtc01heCwgbXMgKTtcblxuXHRcdFx0bXNUZXh0LnRleHRDb250ZW50ID0gbXMgKyAnIE1TICgnICsgbXNNaW4gKyAnLScgKyBtc01heCArICcpJztcblx0XHRcdHVwZGF0ZUdyYXBoKCBtc0dyYXBoLCBNYXRoLm1pbiggMzAsIDMwIC0gKCBtcyAvIDIwMCApICogMzAgKSApO1xuXG5cdFx0XHRmcmFtZXMgKys7XG5cblx0XHRcdGlmICggdGltZSA+IHByZXZUaW1lICsgMTAwMCApIHtcblxuXHRcdFx0XHRmcHMgPSBNYXRoLnJvdW5kKCAoIGZyYW1lcyAqIDEwMDAgKSAvICggdGltZSAtIHByZXZUaW1lICkgKTtcblx0XHRcdFx0ZnBzTWluID0gTWF0aC5taW4oIGZwc01pbiwgZnBzICk7XG5cdFx0XHRcdGZwc01heCA9IE1hdGgubWF4KCBmcHNNYXgsIGZwcyApO1xuXG5cdFx0XHRcdGZwc1RleHQudGV4dENvbnRlbnQgPSBmcHMgKyAnIEZQUyAoJyArIGZwc01pbiArICctJyArIGZwc01heCArICcpJztcblx0XHRcdFx0dXBkYXRlR3JhcGgoIGZwc0dyYXBoLCBNYXRoLm1pbiggMzAsIDMwIC0gKCBmcHMgLyAxMDAgKSAqIDMwICkgKTtcblxuXHRcdFx0XHRwcmV2VGltZSA9IHRpbWU7XG5cdFx0XHRcdGZyYW1lcyA9IDA7XG5cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRpbWU7XG5cblx0XHR9LFxuXG5cdFx0dXBkYXRlOiBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdHN0YXJ0VGltZSA9IHRoaXMuZW5kKCk7XG5cblx0XHR9XG5cblx0fTtcblxufTtcblxuaWYgKCB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyApIHtcblxuXHRtb2R1bGUuZXhwb3J0cyA9IFN0YXRzO1xuXG59IiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCIvLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9iYW5rc2Vhbi8zMDQ1MjJcbi8vXG4vLyBQb3J0ZWQgZnJvbSBTdGVmYW4gR3VzdGF2c29uJ3MgamF2YSBpbXBsZW1lbnRhdGlvblxuLy8gaHR0cDovL3N0YWZmd3d3Lml0bi5saXUuc2UvfnN0ZWd1L3NpbXBsZXhub2lzZS9zaW1wbGV4bm9pc2UucGRmXG4vLyBSZWFkIFN0ZWZhbidzIGV4Y2VsbGVudCBwYXBlciBmb3IgZGV0YWlscyBvbiBob3cgdGhpcyBjb2RlIHdvcmtzLlxuLy9cbi8vIFNlYW4gTWNDdWxsb3VnaCBiYW5rc2VhbkBnbWFpbC5jb21cblxuLyoqXG4gKiBZb3UgY2FuIHBhc3MgaW4gYSByYW5kb20gbnVtYmVyIGdlbmVyYXRvciBvYmplY3QgaWYgeW91IGxpa2UuXG4gKiBJdCBpcyBhc3N1bWVkIHRvIGhhdmUgYSByYW5kb20oKSBtZXRob2QuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gU2ltcGxleE5vaXNlID0gZnVuY3Rpb24ocikge1xuICBpZiAociA9PSB1bmRlZmluZWQpIHIgPSBNYXRoO1xuICB0aGlzLmdyYWQzID0gW1sxLDEsMF0sWy0xLDEsMF0sWzEsLTEsMF0sWy0xLC0xLDBdLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFsxLDAsMV0sWy0xLDAsMV0sWzEsMCwtMV0sWy0xLDAsLTFdLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFswLDEsMV0sWzAsLTEsMV0sWzAsMSwtMV0sWzAsLTEsLTFdXTsgXG4gIHRoaXMucCA9IFtdO1xuICBmb3IgKHZhciBpPTA7IGk8MjU2OyBpKyspIHtcbiAgICB0aGlzLnBbaV0gPSBNYXRoLmZsb29yKHIucmFuZG9tKCkqMjU2KTtcbiAgfVxuICAvLyBUbyByZW1vdmUgdGhlIG5lZWQgZm9yIGluZGV4IHdyYXBwaW5nLCBkb3VibGUgdGhlIHBlcm11dGF0aW9uIHRhYmxlIGxlbmd0aCBcbiAgdGhpcy5wZXJtID0gW107IFxuICBmb3IodmFyIGk9MDsgaTw1MTI7IGkrKykge1xuICAgIHRoaXMucGVybVtpXT10aGlzLnBbaSAmIDI1NV07XG4gIH0gXG5cbiAgLy8gQSBsb29rdXAgdGFibGUgdG8gdHJhdmVyc2UgdGhlIHNpbXBsZXggYXJvdW5kIGEgZ2l2ZW4gcG9pbnQgaW4gNEQuIFxuICAvLyBEZXRhaWxzIGNhbiBiZSBmb3VuZCB3aGVyZSB0aGlzIHRhYmxlIGlzIHVzZWQsIGluIHRoZSA0RCBub2lzZSBtZXRob2QuIFxuICB0aGlzLnNpbXBsZXggPSBbIFxuICAgIFswLDEsMiwzXSxbMCwxLDMsMl0sWzAsMCwwLDBdLFswLDIsMywxXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMSwyLDMsMF0sIFxuICAgIFswLDIsMSwzXSxbMCwwLDAsMF0sWzAsMywxLDJdLFswLDMsMiwxXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMSwzLDIsMF0sIFxuICAgIFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sIFxuICAgIFsxLDIsMCwzXSxbMCwwLDAsMF0sWzEsMywwLDJdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFsyLDMsMCwxXSxbMiwzLDEsMF0sIFxuICAgIFsxLDAsMiwzXSxbMSwwLDMsMl0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzIsMCwzLDFdLFswLDAsMCwwXSxbMiwxLDMsMF0sIFxuICAgIFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sIFxuICAgIFsyLDAsMSwzXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMywwLDEsMl0sWzMsMCwyLDFdLFswLDAsMCwwXSxbMywxLDIsMF0sIFxuICAgIFsyLDEsMCwzXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMywxLDAsMl0sWzAsMCwwLDBdLFszLDIsMCwxXSxbMywyLDEsMF1dOyBcbn07XG5cblNpbXBsZXhOb2lzZS5wcm90b3R5cGUuZG90ID0gZnVuY3Rpb24oZywgeCwgeSkgeyBcbiAgcmV0dXJuIGdbMF0qeCArIGdbMV0qeTtcbn07XG5cblNpbXBsZXhOb2lzZS5wcm90b3R5cGUubm9pc2UgPSBmdW5jdGlvbih4aW4sIHlpbikgeyBcbiAgdmFyIG4wLCBuMSwgbjI7IC8vIE5vaXNlIGNvbnRyaWJ1dGlvbnMgZnJvbSB0aGUgdGhyZWUgY29ybmVycyBcbiAgLy8gU2tldyB0aGUgaW5wdXQgc3BhY2UgdG8gZGV0ZXJtaW5lIHdoaWNoIHNpbXBsZXggY2VsbCB3ZSdyZSBpbiBcbiAgdmFyIEYyID0gMC41KihNYXRoLnNxcnQoMy4wKS0xLjApOyBcbiAgdmFyIHMgPSAoeGluK3lpbikqRjI7IC8vIEhhaXJ5IGZhY3RvciBmb3IgMkQgXG4gIHZhciBpID0gTWF0aC5mbG9vcih4aW4rcyk7IFxuICB2YXIgaiA9IE1hdGguZmxvb3IoeWluK3MpOyBcbiAgdmFyIEcyID0gKDMuMC1NYXRoLnNxcnQoMy4wKSkvNi4wOyBcbiAgdmFyIHQgPSAoaStqKSpHMjsgXG4gIHZhciBYMCA9IGktdDsgLy8gVW5za2V3IHRoZSBjZWxsIG9yaWdpbiBiYWNrIHRvICh4LHkpIHNwYWNlIFxuICB2YXIgWTAgPSBqLXQ7IFxuICB2YXIgeDAgPSB4aW4tWDA7IC8vIFRoZSB4LHkgZGlzdGFuY2VzIGZyb20gdGhlIGNlbGwgb3JpZ2luIFxuICB2YXIgeTAgPSB5aW4tWTA7IFxuICAvLyBGb3IgdGhlIDJEIGNhc2UsIHRoZSBzaW1wbGV4IHNoYXBlIGlzIGFuIGVxdWlsYXRlcmFsIHRyaWFuZ2xlLiBcbiAgLy8gRGV0ZXJtaW5lIHdoaWNoIHNpbXBsZXggd2UgYXJlIGluLiBcbiAgdmFyIGkxLCBqMTsgLy8gT2Zmc2V0cyBmb3Igc2Vjb25kIChtaWRkbGUpIGNvcm5lciBvZiBzaW1wbGV4IGluIChpLGopIGNvb3JkcyBcbiAgaWYoeDA+eTApIHtpMT0xOyBqMT0wO30gLy8gbG93ZXIgdHJpYW5nbGUsIFhZIG9yZGVyOiAoMCwwKS0+KDEsMCktPigxLDEpIFxuICBlbHNlIHtpMT0wOyBqMT0xO30gICAgICAvLyB1cHBlciB0cmlhbmdsZSwgWVggb3JkZXI6ICgwLDApLT4oMCwxKS0+KDEsMSkgXG4gIC8vIEEgc3RlcCBvZiAoMSwwKSBpbiAoaSxqKSBtZWFucyBhIHN0ZXAgb2YgKDEtYywtYykgaW4gKHgseSksIGFuZCBcbiAgLy8gYSBzdGVwIG9mICgwLDEpIGluIChpLGopIG1lYW5zIGEgc3RlcCBvZiAoLWMsMS1jKSBpbiAoeCx5KSwgd2hlcmUgXG4gIC8vIGMgPSAoMy1zcXJ0KDMpKS82IFxuICB2YXIgeDEgPSB4MCAtIGkxICsgRzI7IC8vIE9mZnNldHMgZm9yIG1pZGRsZSBjb3JuZXIgaW4gKHgseSkgdW5za2V3ZWQgY29vcmRzIFxuICB2YXIgeTEgPSB5MCAtIGoxICsgRzI7IFxuICB2YXIgeDIgPSB4MCAtIDEuMCArIDIuMCAqIEcyOyAvLyBPZmZzZXRzIGZvciBsYXN0IGNvcm5lciBpbiAoeCx5KSB1bnNrZXdlZCBjb29yZHMgXG4gIHZhciB5MiA9IHkwIC0gMS4wICsgMi4wICogRzI7IFxuICAvLyBXb3JrIG91dCB0aGUgaGFzaGVkIGdyYWRpZW50IGluZGljZXMgb2YgdGhlIHRocmVlIHNpbXBsZXggY29ybmVycyBcbiAgdmFyIGlpID0gaSAmIDI1NTsgXG4gIHZhciBqaiA9IGogJiAyNTU7IFxuICB2YXIgZ2kwID0gdGhpcy5wZXJtW2lpK3RoaXMucGVybVtqal1dICUgMTI7IFxuICB2YXIgZ2kxID0gdGhpcy5wZXJtW2lpK2kxK3RoaXMucGVybVtqaitqMV1dICUgMTI7IFxuICB2YXIgZ2kyID0gdGhpcy5wZXJtW2lpKzErdGhpcy5wZXJtW2pqKzFdXSAlIDEyOyBcbiAgLy8gQ2FsY3VsYXRlIHRoZSBjb250cmlidXRpb24gZnJvbSB0aGUgdGhyZWUgY29ybmVycyBcbiAgdmFyIHQwID0gMC41IC0geDAqeDAteTAqeTA7IFxuICBpZih0MDwwKSBuMCA9IDAuMDsgXG4gIGVsc2UgeyBcbiAgICB0MCAqPSB0MDsgXG4gICAgbjAgPSB0MCAqIHQwICogdGhpcy5kb3QodGhpcy5ncmFkM1tnaTBdLCB4MCwgeTApOyAgLy8gKHgseSkgb2YgZ3JhZDMgdXNlZCBmb3IgMkQgZ3JhZGllbnQgXG4gIH0gXG4gIHZhciB0MSA9IDAuNSAtIHgxKngxLXkxKnkxOyBcbiAgaWYodDE8MCkgbjEgPSAwLjA7IFxuICBlbHNlIHsgXG4gICAgdDEgKj0gdDE7IFxuICAgIG4xID0gdDEgKiB0MSAqIHRoaXMuZG90KHRoaXMuZ3JhZDNbZ2kxXSwgeDEsIHkxKTsgXG4gIH1cbiAgdmFyIHQyID0gMC41IC0geDIqeDIteTIqeTI7IFxuICBpZih0MjwwKSBuMiA9IDAuMDsgXG4gIGVsc2UgeyBcbiAgICB0MiAqPSB0MjsgXG4gICAgbjIgPSB0MiAqIHQyICogdGhpcy5kb3QodGhpcy5ncmFkM1tnaTJdLCB4MiwgeTIpOyBcbiAgfSBcbiAgLy8gQWRkIGNvbnRyaWJ1dGlvbnMgZnJvbSBlYWNoIGNvcm5lciB0byBnZXQgdGhlIGZpbmFsIG5vaXNlIHZhbHVlLiBcbiAgLy8gVGhlIHJlc3VsdCBpcyBzY2FsZWQgdG8gcmV0dXJuIHZhbHVlcyBpbiB0aGUgaW50ZXJ2YWwgWy0xLDFdLiBcbiAgcmV0dXJuIDcwLjAgKiAobjAgKyBuMSArIG4yKTsgXG59O1xuXG4vLyAzRCBzaW1wbGV4IG5vaXNlIFxuU2ltcGxleE5vaXNlLnByb3RvdHlwZS5ub2lzZTNkID0gZnVuY3Rpb24oeGluLCB5aW4sIHppbikgeyBcbiAgdmFyIG4wLCBuMSwgbjIsIG4zOyAvLyBOb2lzZSBjb250cmlidXRpb25zIGZyb20gdGhlIGZvdXIgY29ybmVycyBcbiAgLy8gU2tldyB0aGUgaW5wdXQgc3BhY2UgdG8gZGV0ZXJtaW5lIHdoaWNoIHNpbXBsZXggY2VsbCB3ZSdyZSBpbiBcbiAgdmFyIEYzID0gMS4wLzMuMDsgXG4gIHZhciBzID0gKHhpbit5aW4remluKSpGMzsgLy8gVmVyeSBuaWNlIGFuZCBzaW1wbGUgc2tldyBmYWN0b3IgZm9yIDNEIFxuICB2YXIgaSA9IE1hdGguZmxvb3IoeGluK3MpOyBcbiAgdmFyIGogPSBNYXRoLmZsb29yKHlpbitzKTsgXG4gIHZhciBrID0gTWF0aC5mbG9vcih6aW4rcyk7IFxuICB2YXIgRzMgPSAxLjAvNi4wOyAvLyBWZXJ5IG5pY2UgYW5kIHNpbXBsZSB1bnNrZXcgZmFjdG9yLCB0b28gXG4gIHZhciB0ID0gKGkraitrKSpHMzsgXG4gIHZhciBYMCA9IGktdDsgLy8gVW5za2V3IHRoZSBjZWxsIG9yaWdpbiBiYWNrIHRvICh4LHkseikgc3BhY2UgXG4gIHZhciBZMCA9IGotdDsgXG4gIHZhciBaMCA9IGstdDsgXG4gIHZhciB4MCA9IHhpbi1YMDsgLy8gVGhlIHgseSx6IGRpc3RhbmNlcyBmcm9tIHRoZSBjZWxsIG9yaWdpbiBcbiAgdmFyIHkwID0geWluLVkwOyBcbiAgdmFyIHowID0gemluLVowOyBcbiAgLy8gRm9yIHRoZSAzRCBjYXNlLCB0aGUgc2ltcGxleCBzaGFwZSBpcyBhIHNsaWdodGx5IGlycmVndWxhciB0ZXRyYWhlZHJvbi4gXG4gIC8vIERldGVybWluZSB3aGljaCBzaW1wbGV4IHdlIGFyZSBpbi4gXG4gIHZhciBpMSwgajEsIGsxOyAvLyBPZmZzZXRzIGZvciBzZWNvbmQgY29ybmVyIG9mIHNpbXBsZXggaW4gKGksaixrKSBjb29yZHMgXG4gIHZhciBpMiwgajIsIGsyOyAvLyBPZmZzZXRzIGZvciB0aGlyZCBjb3JuZXIgb2Ygc2ltcGxleCBpbiAoaSxqLGspIGNvb3JkcyBcbiAgaWYoeDA+PXkwKSB7IFxuICAgIGlmKHkwPj16MCkgXG4gICAgICB7IGkxPTE7IGoxPTA7IGsxPTA7IGkyPTE7IGoyPTE7IGsyPTA7IH0gLy8gWCBZIFogb3JkZXIgXG4gICAgICBlbHNlIGlmKHgwPj16MCkgeyBpMT0xOyBqMT0wOyBrMT0wOyBpMj0xOyBqMj0wOyBrMj0xOyB9IC8vIFggWiBZIG9yZGVyIFxuICAgICAgZWxzZSB7IGkxPTA7IGoxPTA7IGsxPTE7IGkyPTE7IGoyPTA7IGsyPTE7IH0gLy8gWiBYIFkgb3JkZXIgXG4gICAgfSBcbiAgZWxzZSB7IC8vIHgwPHkwIFxuICAgIGlmKHkwPHowKSB7IGkxPTA7IGoxPTA7IGsxPTE7IGkyPTA7IGoyPTE7IGsyPTE7IH0gLy8gWiBZIFggb3JkZXIgXG4gICAgZWxzZSBpZih4MDx6MCkgeyBpMT0wOyBqMT0xOyBrMT0wOyBpMj0wOyBqMj0xOyBrMj0xOyB9IC8vIFkgWiBYIG9yZGVyIFxuICAgIGVsc2UgeyBpMT0wOyBqMT0xOyBrMT0wOyBpMj0xOyBqMj0xOyBrMj0wOyB9IC8vIFkgWCBaIG9yZGVyIFxuICB9IFxuICAvLyBBIHN0ZXAgb2YgKDEsMCwwKSBpbiAoaSxqLGspIG1lYW5zIGEgc3RlcCBvZiAoMS1jLC1jLC1jKSBpbiAoeCx5LHopLCBcbiAgLy8gYSBzdGVwIG9mICgwLDEsMCkgaW4gKGksaixrKSBtZWFucyBhIHN0ZXAgb2YgKC1jLDEtYywtYykgaW4gKHgseSx6KSwgYW5kIFxuICAvLyBhIHN0ZXAgb2YgKDAsMCwxKSBpbiAoaSxqLGspIG1lYW5zIGEgc3RlcCBvZiAoLWMsLWMsMS1jKSBpbiAoeCx5LHopLCB3aGVyZSBcbiAgLy8gYyA9IDEvNi5cbiAgdmFyIHgxID0geDAgLSBpMSArIEczOyAvLyBPZmZzZXRzIGZvciBzZWNvbmQgY29ybmVyIGluICh4LHkseikgY29vcmRzIFxuICB2YXIgeTEgPSB5MCAtIGoxICsgRzM7IFxuICB2YXIgejEgPSB6MCAtIGsxICsgRzM7IFxuICB2YXIgeDIgPSB4MCAtIGkyICsgMi4wKkczOyAvLyBPZmZzZXRzIGZvciB0aGlyZCBjb3JuZXIgaW4gKHgseSx6KSBjb29yZHMgXG4gIHZhciB5MiA9IHkwIC0gajIgKyAyLjAqRzM7IFxuICB2YXIgejIgPSB6MCAtIGsyICsgMi4wKkczOyBcbiAgdmFyIHgzID0geDAgLSAxLjAgKyAzLjAqRzM7IC8vIE9mZnNldHMgZm9yIGxhc3QgY29ybmVyIGluICh4LHkseikgY29vcmRzIFxuICB2YXIgeTMgPSB5MCAtIDEuMCArIDMuMCpHMzsgXG4gIHZhciB6MyA9IHowIC0gMS4wICsgMy4wKkczOyBcbiAgLy8gV29yayBvdXQgdGhlIGhhc2hlZCBncmFkaWVudCBpbmRpY2VzIG9mIHRoZSBmb3VyIHNpbXBsZXggY29ybmVycyBcbiAgdmFyIGlpID0gaSAmIDI1NTsgXG4gIHZhciBqaiA9IGogJiAyNTU7IFxuICB2YXIga2sgPSBrICYgMjU1OyBcbiAgdmFyIGdpMCA9IHRoaXMucGVybVtpaSt0aGlzLnBlcm1bamordGhpcy5wZXJtW2trXV1dICUgMTI7IFxuICB2YXIgZ2kxID0gdGhpcy5wZXJtW2lpK2kxK3RoaXMucGVybVtqaitqMSt0aGlzLnBlcm1ba2srazFdXV0gJSAxMjsgXG4gIHZhciBnaTIgPSB0aGlzLnBlcm1baWkraTIrdGhpcy5wZXJtW2pqK2oyK3RoaXMucGVybVtraytrMl1dXSAlIDEyOyBcbiAgdmFyIGdpMyA9IHRoaXMucGVybVtpaSsxK3RoaXMucGVybVtqaisxK3RoaXMucGVybVtraysxXV1dICUgMTI7IFxuICAvLyBDYWxjdWxhdGUgdGhlIGNvbnRyaWJ1dGlvbiBmcm9tIHRoZSBmb3VyIGNvcm5lcnMgXG4gIHZhciB0MCA9IDAuNiAtIHgwKngwIC0geTAqeTAgLSB6MCp6MDsgXG4gIGlmKHQwPDApIG4wID0gMC4wOyBcbiAgZWxzZSB7IFxuICAgIHQwICo9IHQwOyBcbiAgICBuMCA9IHQwICogdDAgKiB0aGlzLmRvdCh0aGlzLmdyYWQzW2dpMF0sIHgwLCB5MCwgejApOyBcbiAgfVxuICB2YXIgdDEgPSAwLjYgLSB4MSp4MSAtIHkxKnkxIC0gejEqejE7IFxuICBpZih0MTwwKSBuMSA9IDAuMDsgXG4gIGVsc2UgeyBcbiAgICB0MSAqPSB0MTsgXG4gICAgbjEgPSB0MSAqIHQxICogdGhpcy5kb3QodGhpcy5ncmFkM1tnaTFdLCB4MSwgeTEsIHoxKTsgXG4gIH0gXG4gIHZhciB0MiA9IDAuNiAtIHgyKngyIC0geTIqeTIgLSB6Mip6MjsgXG4gIGlmKHQyPDApIG4yID0gMC4wOyBcbiAgZWxzZSB7IFxuICAgIHQyICo9IHQyOyBcbiAgICBuMiA9IHQyICogdDIgKiB0aGlzLmRvdCh0aGlzLmdyYWQzW2dpMl0sIHgyLCB5MiwgejIpOyBcbiAgfSBcbiAgdmFyIHQzID0gMC42IC0geDMqeDMgLSB5Myp5MyAtIHozKnozOyBcbiAgaWYodDM8MCkgbjMgPSAwLjA7IFxuICBlbHNlIHsgXG4gICAgdDMgKj0gdDM7IFxuICAgIG4zID0gdDMgKiB0MyAqIHRoaXMuZG90KHRoaXMuZ3JhZDNbZ2kzXSwgeDMsIHkzLCB6Myk7IFxuICB9IFxuICAvLyBBZGQgY29udHJpYnV0aW9ucyBmcm9tIGVhY2ggY29ybmVyIHRvIGdldCB0aGUgZmluYWwgbm9pc2UgdmFsdWUuIFxuICAvLyBUaGUgcmVzdWx0IGlzIHNjYWxlZCB0byBzdGF5IGp1c3QgaW5zaWRlIFstMSwxXSBcbiAgcmV0dXJuIDMyLjAqKG4wICsgbjEgKyBuMiArIG4zKTsgXG59OyIsIihmdW5jdGlvbiAocHJvY2Vzcyl7XG4vKiFcbiAqIEBvdmVydmlldyBSU1ZQIC0gYSB0aW55IGltcGxlbWVudGF0aW9uIG9mIFByb21pc2VzL0ErLlxuICogQGNvcHlyaWdodCBDb3B5cmlnaHQgKGMpIDIwMTQgWWVodWRhIEthdHosIFRvbSBEYWxlLCBTdGVmYW4gUGVubmVyIGFuZCBjb250cmlidXRvcnNcbiAqIEBsaWNlbnNlICAgTGljZW5zZWQgdW5kZXIgTUlUIGxpY2Vuc2VcbiAqICAgICAgICAgICAgU2VlIGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS90aWxkZWlvL3JzdnAuanMvbWFzdGVyL0xJQ0VOU0VcbiAqIEB2ZXJzaW9uICAgMy4wLjE0XG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJGV2ZW50cyQkaW5kZXhPZihjYWxsYmFja3MsIGNhbGxiYWNrKSB7XG4gICAgICBmb3IgKHZhciBpPTAsIGw9Y2FsbGJhY2tzLmxlbmd0aDsgaTxsOyBpKyspIHtcbiAgICAgICAgaWYgKGNhbGxiYWNrc1tpXSA9PT0gY2FsbGJhY2spIHsgcmV0dXJuIGk7IH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkcnN2cCRldmVudHMkJGNhbGxiYWNrc0ZvcihvYmplY3QpIHtcbiAgICAgIHZhciBjYWxsYmFja3MgPSBvYmplY3QuX3Byb21pc2VDYWxsYmFja3M7XG5cbiAgICAgIGlmICghY2FsbGJhY2tzKSB7XG4gICAgICAgIGNhbGxiYWNrcyA9IG9iamVjdC5fcHJvbWlzZUNhbGxiYWNrcyA9IHt9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY2FsbGJhY2tzO1xuICAgIH1cblxuICAgIHZhciAkJHJzdnAkZXZlbnRzJCRkZWZhdWx0ID0ge1xuXG4gICAgICAvKipcbiAgICAgICAgYFJTVlAuRXZlbnRUYXJnZXQubWl4aW5gIGV4dGVuZHMgYW4gb2JqZWN0IHdpdGggRXZlbnRUYXJnZXQgbWV0aG9kcy4gRm9yXG4gICAgICAgIEV4YW1wbGU6XG5cbiAgICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgICB2YXIgb2JqZWN0ID0ge307XG5cbiAgICAgICAgUlNWUC5FdmVudFRhcmdldC5taXhpbihvYmplY3QpO1xuXG4gICAgICAgIG9iamVjdC5vbignZmluaXNoZWQnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIC8vIGhhbmRsZSBldmVudFxuICAgICAgICB9KTtcblxuICAgICAgICBvYmplY3QudHJpZ2dlcignZmluaXNoZWQnLCB7IGRldGFpbDogdmFsdWUgfSk7XG4gICAgICAgIGBgYFxuXG4gICAgICAgIGBFdmVudFRhcmdldC5taXhpbmAgYWxzbyB3b3JrcyB3aXRoIHByb3RvdHlwZXM6XG5cbiAgICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgICB2YXIgUGVyc29uID0gZnVuY3Rpb24oKSB7fTtcbiAgICAgICAgUlNWUC5FdmVudFRhcmdldC5taXhpbihQZXJzb24ucHJvdG90eXBlKTtcblxuICAgICAgICB2YXIgeWVodWRhID0gbmV3IFBlcnNvbigpO1xuICAgICAgICB2YXIgdG9tID0gbmV3IFBlcnNvbigpO1xuXG4gICAgICAgIHllaHVkYS5vbigncG9rZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ1llaHVkYSBzYXlzIE9XJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRvbS5vbigncG9rZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ1RvbSBzYXlzIE9XJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHllaHVkYS50cmlnZ2VyKCdwb2tlJyk7XG4gICAgICAgIHRvbS50cmlnZ2VyKCdwb2tlJyk7XG4gICAgICAgIGBgYFxuXG4gICAgICAgIEBtZXRob2QgbWl4aW5cbiAgICAgICAgQGZvciBSU1ZQLkV2ZW50VGFyZ2V0XG4gICAgICAgIEBwcml2YXRlXG4gICAgICAgIEBwYXJhbSB7T2JqZWN0fSBvYmplY3Qgb2JqZWN0IHRvIGV4dGVuZCB3aXRoIEV2ZW50VGFyZ2V0IG1ldGhvZHNcbiAgICAgICovXG4gICAgICBtaXhpbjogZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgICAgIG9iamVjdC5vbiA9IHRoaXMub247XG4gICAgICAgIG9iamVjdC5vZmYgPSB0aGlzLm9mZjtcbiAgICAgICAgb2JqZWN0LnRyaWdnZXIgPSB0aGlzLnRyaWdnZXI7XG4gICAgICAgIG9iamVjdC5fcHJvbWlzZUNhbGxiYWNrcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICBSZWdpc3RlcnMgYSBjYWxsYmFjayB0byBiZSBleGVjdXRlZCB3aGVuIGBldmVudE5hbWVgIGlzIHRyaWdnZXJlZFxuXG4gICAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgICAgb2JqZWN0Lm9uKCdldmVudCcsIGZ1bmN0aW9uKGV2ZW50SW5mbyl7XG4gICAgICAgICAgLy8gaGFuZGxlIHRoZSBldmVudFxuICAgICAgICB9KTtcblxuICAgICAgICBvYmplY3QudHJpZ2dlcignZXZlbnQnKTtcbiAgICAgICAgYGBgXG5cbiAgICAgICAgQG1ldGhvZCBvblxuICAgICAgICBAZm9yIFJTVlAuRXZlbnRUYXJnZXRcbiAgICAgICAgQHByaXZhdGVcbiAgICAgICAgQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZSBuYW1lIG9mIHRoZSBldmVudCB0byBsaXN0ZW4gZm9yXG4gICAgICAgIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBldmVudCBpcyB0cmlnZ2VyZWQuXG4gICAgICAqL1xuICAgICAgb246IGZ1bmN0aW9uKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGFsbENhbGxiYWNrcyA9ICQkcnN2cCRldmVudHMkJGNhbGxiYWNrc0Zvcih0aGlzKSwgY2FsbGJhY2tzO1xuXG4gICAgICAgIGNhbGxiYWNrcyA9IGFsbENhbGxiYWNrc1tldmVudE5hbWVdO1xuXG4gICAgICAgIGlmICghY2FsbGJhY2tzKSB7XG4gICAgICAgICAgY2FsbGJhY2tzID0gYWxsQ2FsbGJhY2tzW2V2ZW50TmFtZV0gPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgkJHJzdnAkZXZlbnRzJCRpbmRleE9mKGNhbGxiYWNrcywgY2FsbGJhY2spID09PSAtMSkge1xuICAgICAgICAgIGNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgIFlvdSBjYW4gdXNlIGBvZmZgIHRvIHN0b3AgZmlyaW5nIGEgcGFydGljdWxhciBjYWxsYmFjayBmb3IgYW4gZXZlbnQ6XG5cbiAgICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgICBmdW5jdGlvbiBkb1N0dWZmKCkgeyAvLyBkbyBzdHVmZiEgfVxuICAgICAgICBvYmplY3Qub24oJ3N0dWZmJywgZG9TdHVmZik7XG5cbiAgICAgICAgb2JqZWN0LnRyaWdnZXIoJ3N0dWZmJyk7IC8vIGRvU3R1ZmYgd2lsbCBiZSBjYWxsZWRcblxuICAgICAgICAvLyBVbnJlZ2lzdGVyIE9OTFkgdGhlIGRvU3R1ZmYgY2FsbGJhY2tcbiAgICAgICAgb2JqZWN0Lm9mZignc3R1ZmYnLCBkb1N0dWZmKTtcbiAgICAgICAgb2JqZWN0LnRyaWdnZXIoJ3N0dWZmJyk7IC8vIGRvU3R1ZmYgd2lsbCBOT1QgYmUgY2FsbGVkXG4gICAgICAgIGBgYFxuXG4gICAgICAgIElmIHlvdSBkb24ndCBwYXNzIGEgYGNhbGxiYWNrYCBhcmd1bWVudCB0byBgb2ZmYCwgQUxMIGNhbGxiYWNrcyBmb3IgdGhlXG4gICAgICAgIGV2ZW50IHdpbGwgbm90IGJlIGV4ZWN1dGVkIHdoZW4gdGhlIGV2ZW50IGZpcmVzLiBGb3IgZXhhbXBsZTpcblxuICAgICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICAgIHZhciBjYWxsYmFjazEgPSBmdW5jdGlvbigpe307XG4gICAgICAgIHZhciBjYWxsYmFjazIgPSBmdW5jdGlvbigpe307XG5cbiAgICAgICAgb2JqZWN0Lm9uKCdzdHVmZicsIGNhbGxiYWNrMSk7XG4gICAgICAgIG9iamVjdC5vbignc3R1ZmYnLCBjYWxsYmFjazIpO1xuXG4gICAgICAgIG9iamVjdC50cmlnZ2VyKCdzdHVmZicpOyAvLyBjYWxsYmFjazEgYW5kIGNhbGxiYWNrMiB3aWxsIGJlIGV4ZWN1dGVkLlxuXG4gICAgICAgIG9iamVjdC5vZmYoJ3N0dWZmJyk7XG4gICAgICAgIG9iamVjdC50cmlnZ2VyKCdzdHVmZicpOyAvLyBjYWxsYmFjazEgYW5kIGNhbGxiYWNrMiB3aWxsIG5vdCBiZSBleGVjdXRlZCFcbiAgICAgICAgYGBgXG5cbiAgICAgICAgQG1ldGhvZCBvZmZcbiAgICAgICAgQGZvciBSU1ZQLkV2ZW50VGFyZ2V0XG4gICAgICAgIEBwcml2YXRlXG4gICAgICAgIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWUgZXZlbnQgdG8gc3RvcCBsaXN0ZW5pbmcgdG9cbiAgICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgb3B0aW9uYWwgYXJndW1lbnQuIElmIGdpdmVuLCBvbmx5IHRoZSBmdW5jdGlvblxuICAgICAgICBnaXZlbiB3aWxsIGJlIHJlbW92ZWQgZnJvbSB0aGUgZXZlbnQncyBjYWxsYmFjayBxdWV1ZS4gSWYgbm8gYGNhbGxiYWNrYFxuICAgICAgICBhcmd1bWVudCBpcyBnaXZlbiwgYWxsIGNhbGxiYWNrcyB3aWxsIGJlIHJlbW92ZWQgZnJvbSB0aGUgZXZlbnQncyBjYWxsYmFja1xuICAgICAgICBxdWV1ZS5cbiAgICAgICovXG4gICAgICBvZmY6IGZ1bmN0aW9uKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGFsbENhbGxiYWNrcyA9ICQkcnN2cCRldmVudHMkJGNhbGxiYWNrc0Zvcih0aGlzKSwgY2FsbGJhY2tzLCBpbmRleDtcblxuICAgICAgICBpZiAoIWNhbGxiYWNrKSB7XG4gICAgICAgICAgYWxsQ2FsbGJhY2tzW2V2ZW50TmFtZV0gPSBbXTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFja3MgPSBhbGxDYWxsYmFja3NbZXZlbnROYW1lXTtcblxuICAgICAgICBpbmRleCA9ICQkcnN2cCRldmVudHMkJGluZGV4T2YoY2FsbGJhY2tzLCBjYWxsYmFjayk7XG5cbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkgeyBjYWxsYmFja3Muc3BsaWNlKGluZGV4LCAxKTsgfVxuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgIFVzZSBgdHJpZ2dlcmAgdG8gZmlyZSBjdXN0b20gZXZlbnRzLiBGb3IgZXhhbXBsZTpcblxuICAgICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICAgIG9iamVjdC5vbignZm9vJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICBjb25zb2xlLmxvZygnZm9vIGV2ZW50IGhhcHBlbmVkIScpO1xuICAgICAgICB9KTtcbiAgICAgICAgb2JqZWN0LnRyaWdnZXIoJ2ZvbycpO1xuICAgICAgICAvLyAnZm9vIGV2ZW50IGhhcHBlbmVkIScgbG9nZ2VkIHRvIHRoZSBjb25zb2xlXG4gICAgICAgIGBgYFxuXG4gICAgICAgIFlvdSBjYW4gYWxzbyBwYXNzIGEgdmFsdWUgYXMgYSBzZWNvbmQgYXJndW1lbnQgdG8gYHRyaWdnZXJgIHRoYXQgd2lsbCBiZVxuICAgICAgICBwYXNzZWQgYXMgYW4gYXJndW1lbnQgdG8gYWxsIGV2ZW50IGxpc3RlbmVycyBmb3IgdGhlIGV2ZW50OlxuXG4gICAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgICAgb2JqZWN0Lm9uKCdmb28nLCBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgICAgY29uc29sZS5sb2codmFsdWUubmFtZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG9iamVjdC50cmlnZ2VyKCdmb28nLCB7IG5hbWU6ICdiYXInIH0pO1xuICAgICAgICAvLyAnYmFyJyBsb2dnZWQgdG8gdGhlIGNvbnNvbGVcbiAgICAgICAgYGBgXG5cbiAgICAgICAgQG1ldGhvZCB0cmlnZ2VyXG4gICAgICAgIEBmb3IgUlNWUC5FdmVudFRhcmdldFxuICAgICAgICBAcHJpdmF0ZVxuICAgICAgICBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lIG5hbWUgb2YgdGhlIGV2ZW50IHRvIGJlIHRyaWdnZXJlZFxuICAgICAgICBAcGFyYW0ge0FueX0gb3B0aW9ucyBvcHRpb25hbCB2YWx1ZSB0byBiZSBwYXNzZWQgdG8gYW55IGV2ZW50IGhhbmRsZXJzIGZvclxuICAgICAgICB0aGUgZ2l2ZW4gYGV2ZW50TmFtZWBcbiAgICAgICovXG4gICAgICB0cmlnZ2VyOiBmdW5jdGlvbihldmVudE5hbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGFsbENhbGxiYWNrcyA9ICQkcnN2cCRldmVudHMkJGNhbGxiYWNrc0Zvcih0aGlzKSwgY2FsbGJhY2tzLCBjYWxsYmFjaztcblxuICAgICAgICBpZiAoY2FsbGJhY2tzID0gYWxsQ2FsbGJhY2tzW2V2ZW50TmFtZV0pIHtcbiAgICAgICAgICAvLyBEb24ndCBjYWNoZSB0aGUgY2FsbGJhY2tzLmxlbmd0aCBzaW5jZSBpdCBtYXkgZ3Jvd1xuICAgICAgICAgIGZvciAodmFyIGk9MDsgaTxjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2tzW2ldO1xuXG4gICAgICAgICAgICBjYWxsYmFjayhvcHRpb25zKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyICQkcnN2cCRjb25maWckJGNvbmZpZyA9IHtcbiAgICAgIGluc3RydW1lbnQ6IGZhbHNlXG4gICAgfTtcblxuICAgICQkcnN2cCRldmVudHMkJGRlZmF1bHQubWl4aW4oJCRyc3ZwJGNvbmZpZyQkY29uZmlnKTtcblxuICAgIGZ1bmN0aW9uICQkcnN2cCRjb25maWckJGNvbmZpZ3VyZShuYW1lLCB2YWx1ZSkge1xuICAgICAgaWYgKG5hbWUgPT09ICdvbmVycm9yJykge1xuICAgICAgICAvLyBoYW5kbGUgZm9yIGxlZ2FjeSB1c2VycyB0aGF0IGV4cGVjdCB0aGUgYWN0dWFsXG4gICAgICAgIC8vIGVycm9yIHRvIGJlIHBhc3NlZCB0byB0aGVpciBmdW5jdGlvbiBhZGRlZCB2aWFcbiAgICAgICAgLy8gYFJTVlAuY29uZmlndXJlKCdvbmVycm9yJywgc29tZUZ1bmN0aW9uSGVyZSk7YFxuICAgICAgICAkJHJzdnAkY29uZmlnJCRjb25maWcub24oJ2Vycm9yJywgdmFsdWUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICQkcnN2cCRjb25maWckJGNvbmZpZ1tuYW1lXSA9IHZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICQkcnN2cCRjb25maWckJGNvbmZpZ1tuYW1lXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHV0aWxzJCRvYmplY3RPckZ1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJyB8fCAodHlwZW9mIHggPT09ICdvYmplY3QnICYmIHggIT09IG51bGwpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkdXRpbHMkJGlzRnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkdXRpbHMkJGlzTWF5YmVUaGVuYWJsZSh4KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHggPT09ICdvYmplY3QnICYmIHggIT09IG51bGw7XG4gICAgfVxuXG4gICAgdmFyICQkdXRpbHMkJF9pc0FycmF5O1xuXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KSB7XG4gICAgICAkJHV0aWxzJCRfaXNBcnJheSA9IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAkJHV0aWxzJCRfaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG4gICAgfVxuXG4gICAgdmFyICQkdXRpbHMkJGlzQXJyYXkgPSAkJHV0aWxzJCRfaXNBcnJheTtcbiAgICB2YXIgJCR1dGlscyQkbm93ID0gRGF0ZS5ub3cgfHwgZnVuY3Rpb24oKSB7IHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTsgfTtcbiAgICBmdW5jdGlvbiAkJHV0aWxzJCRGKCkgeyB9XG5cbiAgICB2YXIgJCR1dGlscyQkb19jcmVhdGUgPSAoT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbiAobykge1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU2Vjb25kIGFyZ3VtZW50IG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgbyAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhbiBvYmplY3QnKTtcbiAgICAgIH1cbiAgICAgICQkdXRpbHMkJEYucHJvdG90eXBlID0gbztcbiAgICAgIHJldHVybiBuZXcgJCR1dGlscyQkRigpO1xuICAgIH0pO1xuXG4gICAgdmFyICQkaW5zdHJ1bWVudCQkcXVldWUgPSBbXTtcblxuICAgIHZhciAkJGluc3RydW1lbnQkJGRlZmF1bHQgPSBmdW5jdGlvbiBpbnN0cnVtZW50KGV2ZW50TmFtZSwgcHJvbWlzZSwgY2hpbGQpIHtcbiAgICAgIGlmICgxID09PSAkJGluc3RydW1lbnQkJHF1ZXVlLnB1c2goe1xuICAgICAgICAgIG5hbWU6IGV2ZW50TmFtZSxcbiAgICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICBndWlkOiBwcm9taXNlLl9ndWlkS2V5ICsgcHJvbWlzZS5faWQsXG4gICAgICAgICAgICBldmVudE5hbWU6IGV2ZW50TmFtZSxcbiAgICAgICAgICAgIGRldGFpbDogcHJvbWlzZS5fcmVzdWx0LFxuICAgICAgICAgICAgY2hpbGRHdWlkOiBjaGlsZCAmJiBwcm9taXNlLl9ndWlkS2V5ICsgY2hpbGQuX2lkLFxuICAgICAgICAgICAgbGFiZWw6IHByb21pc2UuX2xhYmVsLFxuICAgICAgICAgICAgdGltZVN0YW1wOiAkJHV0aWxzJCRub3coKSxcbiAgICAgICAgICAgIHN0YWNrOiBuZXcgRXJyb3IocHJvbWlzZS5fbGFiZWwpLnN0YWNrXG4gICAgICAgICAgfX0pKSB7XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhciBlbnRyeTtcbiAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkJGluc3RydW1lbnQkJHF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZW50cnkgPSAkJGluc3RydW1lbnQkJHF1ZXVlW2ldO1xuICAgICAgICAgICAgICAgICQkcnN2cCRjb25maWckJGNvbmZpZy50cmlnZ2VyKGVudHJ5Lm5hbWUsIGVudHJ5LnBheWxvYWQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICQkaW5zdHJ1bWVudCQkcXVldWUubGVuZ3RoID0gMDtcbiAgICAgICAgICAgIH0sIDUwKTtcbiAgICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJG5vb3AoKSB7fVxuICAgIHZhciAkJCRpbnRlcm5hbCQkUEVORElORyAgID0gdm9pZCAwO1xuICAgIHZhciAkJCRpbnRlcm5hbCQkRlVMRklMTEVEID0gMTtcbiAgICB2YXIgJCQkaW50ZXJuYWwkJFJFSkVDVEVEICA9IDI7XG4gICAgdmFyICQkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUiA9IG5ldyAkJCRpbnRlcm5hbCQkRXJyb3JPYmplY3QoKTtcblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRnZXRUaGVuKHByb21pc2UpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBwcm9taXNlLnRoZW47XG4gICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICQkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUi5lcnJvciA9IGVycm9yO1xuICAgICAgICByZXR1cm4gJCQkaW50ZXJuYWwkJEdFVF9USEVOX0VSUk9SO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCR0cnlUaGVuKHRoZW4sIHZhbHVlLCBmdWxmaWxsbWVudEhhbmRsZXIsIHJlamVjdGlvbkhhbmRsZXIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoZW4uY2FsbCh2YWx1ZSwgZnVsZmlsbG1lbnRIYW5kbGVyLCByZWplY3Rpb25IYW5kbGVyKTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZXR1cm4gZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkaGFuZGxlRm9yZWlnblRoZW5hYmxlKHByb21pc2UsIHRoZW5hYmxlLCB0aGVuKSB7XG4gICAgICAkJHJzdnAkY29uZmlnJCRjb25maWcuYXN5bmMoZnVuY3Rpb24ocHJvbWlzZSkge1xuICAgICAgICB2YXIgc2VhbGVkID0gZmFsc2U7XG4gICAgICAgIHZhciBlcnJvciA9ICQkJGludGVybmFsJCR0cnlUaGVuKHRoZW4sIHRoZW5hYmxlLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGlmIChzZWFsZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgc2VhbGVkID0gdHJ1ZTtcbiAgICAgICAgICBpZiAodGhlbmFibGUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICAgIGlmIChzZWFsZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgc2VhbGVkID0gdHJ1ZTtcblxuICAgICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgICAgfSwgJ1NldHRsZTogJyArIChwcm9taXNlLl9sYWJlbCB8fCAnIHVua25vd24gcHJvbWlzZScpKTtcblxuICAgICAgICBpZiAoIXNlYWxlZCAmJiBlcnJvcikge1xuICAgICAgICAgIHNlYWxlZCA9IHRydWU7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH0sIHByb21pc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRoYW5kbGVPd25UaGVuYWJsZShwcm9taXNlLCB0aGVuYWJsZSkge1xuICAgICAgaWYgKHRoZW5hYmxlLl9zdGF0ZSA9PT0gJCQkaW50ZXJuYWwkJEZVTEZJTExFRCkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB0aGVuYWJsZS5fcmVzdWx0KTtcbiAgICAgIH0gZWxzZSBpZiAocHJvbWlzZS5fc3RhdGUgPT09ICQkJGludGVybmFsJCRSRUpFQ1RFRCkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHRoZW5hYmxlLl9yZXN1bHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHN1YnNjcmliZSh0aGVuYWJsZSwgdW5kZWZpbmVkLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGlmICh0aGVuYWJsZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICQkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkaGFuZGxlTWF5YmVUaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlKSB7XG4gICAgICBpZiAobWF5YmVUaGVuYWJsZS5jb25zdHJ1Y3RvciA9PT0gcHJvbWlzZS5jb25zdHJ1Y3Rvcikge1xuICAgICAgICAkJCRpbnRlcm5hbCQkaGFuZGxlT3duVGhlbmFibGUocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgdGhlbiA9ICQkJGludGVybmFsJCRnZXRUaGVuKG1heWJlVGhlbmFibGUpO1xuXG4gICAgICAgIGlmICh0aGVuID09PSAkJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IpIHtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsICQkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUi5lcnJvcik7XG4gICAgICAgIH0gZWxzZSBpZiAodGhlbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoJCR1dGlscyQkaXNGdW5jdGlvbih0aGVuKSkge1xuICAgICAgICAgICQkJGludGVybmFsJCRoYW5kbGVGb3JlaWduVGhlbmFibGUocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSwgdGhlbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSkge1xuICAgICAgaWYgKHByb21pc2UgPT09IHZhbHVlKSB7XG4gICAgICAgICQkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoJCR1dGlscyQkb2JqZWN0T3JGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJGhhbmRsZU1heWJlVGhlbmFibGUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRwdWJsaXNoUmVqZWN0aW9uKHByb21pc2UpIHtcbiAgICAgIGlmIChwcm9taXNlLl9vbmVycm9yKSB7XG4gICAgICAgIHByb21pc2UuX29uZXJyb3IocHJvbWlzZS5fcmVzdWx0KTtcbiAgICAgIH1cblxuICAgICAgJCQkaW50ZXJuYWwkJHB1Ymxpc2gocHJvbWlzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpIHtcbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gJCQkaW50ZXJuYWwkJFBFTkRJTkcpIHsgcmV0dXJuOyB9XG5cbiAgICAgIHByb21pc2UuX3Jlc3VsdCA9IHZhbHVlO1xuICAgICAgcHJvbWlzZS5fc3RhdGUgPSAkJCRpbnRlcm5hbCQkRlVMRklMTEVEO1xuXG4gICAgICBpZiAocHJvbWlzZS5fc3Vic2NyaWJlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGlmICgkJHJzdnAkY29uZmlnJCRjb25maWcuaW5zdHJ1bWVudCkge1xuICAgICAgICAgICQkaW5zdHJ1bWVudCQkZGVmYXVsdCgnZnVsZmlsbGVkJywgcHJvbWlzZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQkcnN2cCRjb25maWckJGNvbmZpZy5hc3luYygkJCRpbnRlcm5hbCQkcHVibGlzaCwgcHJvbWlzZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pIHtcbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gJCQkaW50ZXJuYWwkJFBFTkRJTkcpIHsgcmV0dXJuOyB9XG4gICAgICBwcm9taXNlLl9zdGF0ZSA9ICQkJGludGVybmFsJCRSRUpFQ1RFRDtcbiAgICAgIHByb21pc2UuX3Jlc3VsdCA9IHJlYXNvbjtcblxuICAgICAgJCRyc3ZwJGNvbmZpZyQkY29uZmlnLmFzeW5jKCQkJGludGVybmFsJCRwdWJsaXNoUmVqZWN0aW9uLCBwcm9taXNlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkc3Vic2NyaWJlKHBhcmVudCwgY2hpbGQsIG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKSB7XG4gICAgICB2YXIgc3Vic2NyaWJlcnMgPSBwYXJlbnQuX3N1YnNjcmliZXJzO1xuICAgICAgdmFyIGxlbmd0aCA9IHN1YnNjcmliZXJzLmxlbmd0aDtcblxuICAgICAgcGFyZW50Ll9vbmVycm9yID0gbnVsbDtcblxuICAgICAgc3Vic2NyaWJlcnNbbGVuZ3RoXSA9IGNoaWxkO1xuICAgICAgc3Vic2NyaWJlcnNbbGVuZ3RoICsgJCQkaW50ZXJuYWwkJEZVTEZJTExFRF0gPSBvbkZ1bGZpbGxtZW50O1xuICAgICAgc3Vic2NyaWJlcnNbbGVuZ3RoICsgJCQkaW50ZXJuYWwkJFJFSkVDVEVEXSAgPSBvblJlamVjdGlvbjtcblxuICAgICAgaWYgKGxlbmd0aCA9PT0gMCAmJiBwYXJlbnQuX3N0YXRlKSB7XG4gICAgICAgICQkcnN2cCRjb25maWckJGNvbmZpZy5hc3luYygkJCRpbnRlcm5hbCQkcHVibGlzaCwgcGFyZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkcHVibGlzaChwcm9taXNlKSB7XG4gICAgICB2YXIgc3Vic2NyaWJlcnMgPSBwcm9taXNlLl9zdWJzY3JpYmVycztcbiAgICAgIHZhciBzZXR0bGVkID0gcHJvbWlzZS5fc3RhdGU7XG5cbiAgICAgIGlmICgkJHJzdnAkY29uZmlnJCRjb25maWcuaW5zdHJ1bWVudCkge1xuICAgICAgICAkJGluc3RydW1lbnQkJGRlZmF1bHQoc2V0dGxlZCA9PT0gJCQkaW50ZXJuYWwkJEZVTEZJTExFRCA/ICdmdWxmaWxsZWQnIDogJ3JlamVjdGVkJywgcHJvbWlzZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdWJzY3JpYmVycy5sZW5ndGggPT09IDApIHsgcmV0dXJuOyB9XG5cbiAgICAgIHZhciBjaGlsZCwgY2FsbGJhY2ssIGRldGFpbCA9IHByb21pc2UuX3Jlc3VsdDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdWJzY3JpYmVycy5sZW5ndGg7IGkgKz0gMykge1xuICAgICAgICBjaGlsZCA9IHN1YnNjcmliZXJzW2ldO1xuICAgICAgICBjYWxsYmFjayA9IHN1YnNjcmliZXJzW2kgKyBzZXR0bGVkXTtcblxuICAgICAgICBpZiAoY2hpbGQpIHtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkaW52b2tlQ2FsbGJhY2soc2V0dGxlZCwgY2hpbGQsIGNhbGxiYWNrLCBkZXRhaWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNhbGxiYWNrKGRldGFpbCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcHJvbWlzZS5fc3Vic2NyaWJlcnMubGVuZ3RoID0gMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkRXJyb3JPYmplY3QoKSB7XG4gICAgICB0aGlzLmVycm9yID0gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgJCQkaW50ZXJuYWwkJFRSWV9DQVRDSF9FUlJPUiA9IG5ldyAkJCRpbnRlcm5hbCQkRXJyb3JPYmplY3QoKTtcblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCR0cnlDYXRjaChjYWxsYmFjaywgZGV0YWlsKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soZGV0YWlsKTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SLmVycm9yID0gZTtcbiAgICAgICAgcmV0dXJuICQkJGludGVybmFsJCRUUllfQ0FUQ0hfRVJST1I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJGludm9rZUNhbGxiYWNrKHNldHRsZWQsIHByb21pc2UsIGNhbGxiYWNrLCBkZXRhaWwpIHtcbiAgICAgIHZhciBoYXNDYWxsYmFjayA9ICQkdXRpbHMkJGlzRnVuY3Rpb24oY2FsbGJhY2spLFxuICAgICAgICAgIHZhbHVlLCBlcnJvciwgc3VjY2VlZGVkLCBmYWlsZWQ7XG5cbiAgICAgIGlmIChoYXNDYWxsYmFjaykge1xuICAgICAgICB2YWx1ZSA9ICQkJGludGVybmFsJCR0cnlDYXRjaChjYWxsYmFjaywgZGV0YWlsKTtcblxuICAgICAgICBpZiAodmFsdWUgPT09ICQkJGludGVybmFsJCRUUllfQ0FUQ0hfRVJST1IpIHtcbiAgICAgICAgICBmYWlsZWQgPSB0cnVlO1xuICAgICAgICAgIGVycm9yID0gdmFsdWUuZXJyb3I7XG4gICAgICAgICAgdmFsdWUgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN1Y2NlZWRlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvbWlzZSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIG5ldyBUeXBlRXJyb3IoJ0EgcHJvbWlzZXMgY2FsbGJhY2sgY2Fubm90IHJldHVybiB0aGF0IHNhbWUgcHJvbWlzZS4nKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gZGV0YWlsO1xuICAgICAgICBzdWNjZWVkZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAocHJvbWlzZS5fc3RhdGUgIT09ICQkJGludGVybmFsJCRQRU5ESU5HKSB7XG4gICAgICAgIC8vIG5vb3BcbiAgICAgIH0gZWxzZSBpZiAoaGFzQ2FsbGJhY2sgJiYgc3VjY2VlZGVkKSB7XG4gICAgICAgICQkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoZmFpbGVkKSB7XG4gICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgZXJyb3IpO1xuICAgICAgfSBlbHNlIGlmIChzZXR0bGVkID09PSAkJCRpbnRlcm5hbCQkRlVMRklMTEVEKSB7XG4gICAgICAgICQkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoc2V0dGxlZCA9PT0gJCQkaW50ZXJuYWwkJFJFSkVDVEVEKSB7XG4gICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRpbml0aWFsaXplUHJvbWlzZShwcm9taXNlLCByZXNvbHZlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzb2x2ZXIoZnVuY3Rpb24gcmVzb2x2ZVByb21pc2UodmFsdWUpe1xuICAgICAgICAgICQkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gcmVqZWN0UHJvbWlzZShyZWFzb24pIHtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRlbnVtZXJhdG9yJCRtYWtlU2V0dGxlZFJlc3VsdChzdGF0ZSwgcG9zaXRpb24sIHZhbHVlKSB7XG4gICAgICBpZiAoc3RhdGUgPT09ICQkJGludGVybmFsJCRGVUxGSUxMRUQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdGF0ZTogJ2Z1bGZpbGxlZCcsXG4gICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN0YXRlOiAncmVqZWN0ZWQnLFxuICAgICAgICAgIHJlYXNvbjogdmFsdWVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJGVudW1lcmF0b3IkJEVudW1lcmF0b3IoQ29uc3RydWN0b3IsIGlucHV0LCBhYm9ydE9uUmVqZWN0LCBsYWJlbCkge1xuICAgICAgdGhpcy5faW5zdGFuY2VDb25zdHJ1Y3RvciA9IENvbnN0cnVjdG9yO1xuICAgICAgdGhpcy5wcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKCQkJGludGVybmFsJCRub29wLCBsYWJlbCk7XG4gICAgICB0aGlzLl9hYm9ydE9uUmVqZWN0ID0gYWJvcnRPblJlamVjdDtcblxuICAgICAgaWYgKHRoaXMuX3ZhbGlkYXRlSW5wdXQoaW5wdXQpKSB7XG4gICAgICAgIHRoaXMuX2lucHV0ICAgICA9IGlucHV0O1xuICAgICAgICB0aGlzLmxlbmd0aCAgICAgPSBpbnB1dC5sZW5ndGg7XG4gICAgICAgIHRoaXMuX3JlbWFpbmluZyA9IGlucHV0Lmxlbmd0aDtcblxuICAgICAgICB0aGlzLl9pbml0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJGZ1bGZpbGwodGhpcy5wcm9taXNlLCB0aGlzLl9yZXN1bHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMubGVuZ3RoID0gdGhpcy5sZW5ndGggfHwgMDtcbiAgICAgICAgICB0aGlzLl9lbnVtZXJhdGUoKTtcbiAgICAgICAgICBpZiAodGhpcy5fcmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgICAgICAkJCRpbnRlcm5hbCQkZnVsZmlsbCh0aGlzLnByb21pc2UsIHRoaXMuX3Jlc3VsdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHRoaXMucHJvbWlzZSwgdGhpcy5fdmFsaWRhdGlvbkVycm9yKCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgICQkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX3ZhbGlkYXRlSW5wdXQgPSBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgcmV0dXJuICQkdXRpbHMkJGlzQXJyYXkoaW5wdXQpO1xuICAgIH07XG5cbiAgICAkJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl92YWxpZGF0aW9uRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRXJyb3IoJ0FycmF5IE1ldGhvZHMgbXVzdCBiZSBwcm92aWRlZCBhbiBBcnJheScpO1xuICAgIH07XG5cbiAgICAkJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9yZXN1bHQgPSBuZXcgQXJyYXkodGhpcy5sZW5ndGgpO1xuICAgIH07XG5cbiAgICB2YXIgJCRlbnVtZXJhdG9yJCRkZWZhdWx0ID0gJCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yO1xuXG4gICAgJCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fZW51bWVyYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGVuZ3RoICA9IHRoaXMubGVuZ3RoO1xuICAgICAgdmFyIHByb21pc2UgPSB0aGlzLnByb21pc2U7XG4gICAgICB2YXIgaW5wdXQgICA9IHRoaXMuX2lucHV0O1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgcHJvbWlzZS5fc3RhdGUgPT09ICQkJGludGVybmFsJCRQRU5ESU5HICYmIGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLl9lYWNoRW50cnkoaW5wdXRbaV0sIGkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAkJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl9lYWNoRW50cnkgPSBmdW5jdGlvbihlbnRyeSwgaSkge1xuICAgICAgdmFyIGMgPSB0aGlzLl9pbnN0YW5jZUNvbnN0cnVjdG9yO1xuICAgICAgaWYgKCQkdXRpbHMkJGlzTWF5YmVUaGVuYWJsZShlbnRyeSkpIHtcbiAgICAgICAgaWYgKGVudHJ5LmNvbnN0cnVjdG9yID09PSBjICYmIGVudHJ5Ll9zdGF0ZSAhPT0gJCQkaW50ZXJuYWwkJFBFTkRJTkcpIHtcbiAgICAgICAgICBlbnRyeS5fb25lcnJvciA9IG51bGw7XG4gICAgICAgICAgdGhpcy5fc2V0dGxlZEF0KGVudHJ5Ll9zdGF0ZSwgaSwgZW50cnkuX3Jlc3VsdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fd2lsbFNldHRsZUF0KGMucmVzb2x2ZShlbnRyeSksIGkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9yZW1haW5pbmctLTtcbiAgICAgICAgdGhpcy5fcmVzdWx0W2ldID0gdGhpcy5fbWFrZVJlc3VsdCgkJCRpbnRlcm5hbCQkRlVMRklMTEVELCBpLCBlbnRyeSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgICQkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX3NldHRsZWRBdCA9IGZ1bmN0aW9uKHN0YXRlLCBpLCB2YWx1ZSkge1xuICAgICAgdmFyIHByb21pc2UgPSB0aGlzLnByb21pc2U7XG5cbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSA9PT0gJCQkaW50ZXJuYWwkJFBFTkRJTkcpIHtcbiAgICAgICAgdGhpcy5fcmVtYWluaW5nLS07XG5cbiAgICAgICAgaWYgKHRoaXMuX2Fib3J0T25SZWplY3QgJiYgc3RhdGUgPT09ICQkJGludGVybmFsJCRSRUpFQ1RFRCkge1xuICAgICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3Jlc3VsdFtpXSA9IHRoaXMuX21ha2VSZXN1bHQoc3RhdGUsIGksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fcmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgICQkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHRoaXMuX3Jlc3VsdCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgICQkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX21ha2VSZXN1bHQgPSBmdW5jdGlvbihzdGF0ZSwgaSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuXG4gICAgJCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fd2lsbFNldHRsZUF0ID0gZnVuY3Rpb24ocHJvbWlzZSwgaSkge1xuICAgICAgdmFyIGVudW1lcmF0b3IgPSB0aGlzO1xuXG4gICAgICAkJCRpbnRlcm5hbCQkc3Vic2NyaWJlKHByb21pc2UsIHVuZGVmaW5lZCwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgZW51bWVyYXRvci5fc2V0dGxlZEF0KCQkJGludGVybmFsJCRGVUxGSUxMRUQsIGksIHZhbHVlKTtcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICBlbnVtZXJhdG9yLl9zZXR0bGVkQXQoJCQkaW50ZXJuYWwkJFJFSkVDVEVELCBpLCByZWFzb24pO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHZhciAkJHByb21pc2UkYWxsJCRkZWZhdWx0ID0gZnVuY3Rpb24gYWxsKGVudHJpZXMsIGxhYmVsKSB7XG4gICAgICByZXR1cm4gbmV3ICQkZW51bWVyYXRvciQkZGVmYXVsdCh0aGlzLCBlbnRyaWVzLCB0cnVlIC8qIGFib3J0IG9uIHJlamVjdCAqLywgbGFiZWwpLnByb21pc2U7XG4gICAgfTtcblxuICAgIHZhciAkJHByb21pc2UkcmFjZSQkZGVmYXVsdCA9IGZ1bmN0aW9uIHJhY2UoZW50cmllcywgbGFiZWwpIHtcbiAgICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gICAgICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuXG4gICAgICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcigkJCRpbnRlcm5hbCQkbm9vcCwgbGFiZWwpO1xuXG4gICAgICBpZiAoISQkdXRpbHMkJGlzQXJyYXkoZW50cmllcykpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBuZXcgVHlwZUVycm9yKCdZb3UgbXVzdCBwYXNzIGFuIGFycmF5IHRvIHJhY2UuJykpO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgIH1cblxuICAgICAgdmFyIGxlbmd0aCA9IGVudHJpZXMubGVuZ3RoO1xuXG4gICAgICBmdW5jdGlvbiBvbkZ1bGZpbGxtZW50KHZhbHVlKSB7XG4gICAgICAgICQkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gb25SZWplY3Rpb24ocmVhc29uKSB7XG4gICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IHByb21pc2UuX3N0YXRlID09PSAkJCRpbnRlcm5hbCQkUEVORElORyAmJiBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHN1YnNjcmliZShDb25zdHJ1Y3Rvci5yZXNvbHZlKGVudHJpZXNbaV0pLCB1bmRlZmluZWQsIG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfTtcblxuICAgIHZhciAkJHByb21pc2UkcmVzb2x2ZSQkZGVmYXVsdCA9IGZ1bmN0aW9uIHJlc29sdmUob2JqZWN0LCBsYWJlbCkge1xuICAgICAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgICAgIHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG5cbiAgICAgIGlmIChvYmplY3QgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcgJiYgb2JqZWN0LmNvbnN0cnVjdG9yID09PSBDb25zdHJ1Y3Rvcikge1xuICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgICAgfVxuXG4gICAgICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcigkJCRpbnRlcm5hbCQkbm9vcCwgbGFiZWwpO1xuICAgICAgJCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgb2JqZWN0KTtcbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH07XG5cbiAgICB2YXIgJCRwcm9taXNlJHJlamVjdCQkZGVmYXVsdCA9IGZ1bmN0aW9uIHJlamVjdChyZWFzb24sIGxhYmVsKSB7XG4gICAgICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICAgICAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcbiAgICAgIHZhciBwcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKCQkJGludGVybmFsJCRub29wLCBsYWJlbCk7XG4gICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9O1xuXG4gICAgdmFyICQkcnN2cCRwcm9taXNlJCRndWlkS2V5ID0gJ3JzdnBfJyArICQkdXRpbHMkJG5vdygpICsgJy0nO1xuICAgIHZhciAkJHJzdnAkcHJvbWlzZSQkY291bnRlciA9IDA7XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkcHJvbWlzZSQkbmVlZHNSZXNvbHZlcigpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1lvdSBtdXN0IHBhc3MgYSByZXNvbHZlciBmdW5jdGlvbiBhcyB0aGUgZmlyc3QgYXJndW1lbnQgdG8gdGhlIHByb21pc2UgY29uc3RydWN0b3InKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkcHJvbWlzZSQkbmVlZHNOZXcoKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmFpbGVkIHRvIGNvbnN0cnVjdCAnUHJvbWlzZSc6IFBsZWFzZSB1c2UgdGhlICduZXcnIG9wZXJhdG9yLCB0aGlzIG9iamVjdCBjb25zdHJ1Y3RvciBjYW5ub3QgYmUgY2FsbGVkIGFzIGEgZnVuY3Rpb24uXCIpO1xuICAgIH1cblxuICAgIHZhciAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdCA9ICQkcnN2cCRwcm9taXNlJCRQcm9taXNlO1xuXG4gICAgLyoqXG4gICAgICBQcm9taXNlIG9iamVjdHMgcmVwcmVzZW50IHRoZSBldmVudHVhbCByZXN1bHQgb2YgYW4gYXN5bmNocm9ub3VzIG9wZXJhdGlvbi4gVGhlXG4gICAgICBwcmltYXJ5IHdheSBvZiBpbnRlcmFjdGluZyB3aXRoIGEgcHJvbWlzZSBpcyB0aHJvdWdoIGl0cyBgdGhlbmAgbWV0aG9kLCB3aGljaFxuICAgICAgcmVnaXN0ZXJzIGNhbGxiYWNrcyB0byByZWNlaXZlIGVpdGhlciBhIHByb21pc2XigJlzIGV2ZW50dWFsIHZhbHVlIG9yIHRoZSByZWFzb25cbiAgICAgIHdoeSB0aGUgcHJvbWlzZSBjYW5ub3QgYmUgZnVsZmlsbGVkLlxuXG4gICAgICBUZXJtaW5vbG9neVxuICAgICAgLS0tLS0tLS0tLS1cblxuICAgICAgLSBgcHJvbWlzZWAgaXMgYW4gb2JqZWN0IG9yIGZ1bmN0aW9uIHdpdGggYSBgdGhlbmAgbWV0aG9kIHdob3NlIGJlaGF2aW9yIGNvbmZvcm1zIHRvIHRoaXMgc3BlY2lmaWNhdGlvbi5cbiAgICAgIC0gYHRoZW5hYmxlYCBpcyBhbiBvYmplY3Qgb3IgZnVuY3Rpb24gdGhhdCBkZWZpbmVzIGEgYHRoZW5gIG1ldGhvZC5cbiAgICAgIC0gYHZhbHVlYCBpcyBhbnkgbGVnYWwgSmF2YVNjcmlwdCB2YWx1ZSAoaW5jbHVkaW5nIHVuZGVmaW5lZCwgYSB0aGVuYWJsZSwgb3IgYSBwcm9taXNlKS5cbiAgICAgIC0gYGV4Y2VwdGlvbmAgaXMgYSB2YWx1ZSB0aGF0IGlzIHRocm93biB1c2luZyB0aGUgdGhyb3cgc3RhdGVtZW50LlxuICAgICAgLSBgcmVhc29uYCBpcyBhIHZhbHVlIHRoYXQgaW5kaWNhdGVzIHdoeSBhIHByb21pc2Ugd2FzIHJlamVjdGVkLlxuICAgICAgLSBgc2V0dGxlZGAgdGhlIGZpbmFsIHJlc3Rpbmcgc3RhdGUgb2YgYSBwcm9taXNlLCBmdWxmaWxsZWQgb3IgcmVqZWN0ZWQuXG5cbiAgICAgIEEgcHJvbWlzZSBjYW4gYmUgaW4gb25lIG9mIHRocmVlIHN0YXRlczogcGVuZGluZywgZnVsZmlsbGVkLCBvciByZWplY3RlZC5cblxuICAgICAgUHJvbWlzZXMgdGhhdCBhcmUgZnVsZmlsbGVkIGhhdmUgYSBmdWxmaWxsbWVudCB2YWx1ZSBhbmQgYXJlIGluIHRoZSBmdWxmaWxsZWRcbiAgICAgIHN0YXRlLiAgUHJvbWlzZXMgdGhhdCBhcmUgcmVqZWN0ZWQgaGF2ZSBhIHJlamVjdGlvbiByZWFzb24gYW5kIGFyZSBpbiB0aGVcbiAgICAgIHJlamVjdGVkIHN0YXRlLiAgQSBmdWxmaWxsbWVudCB2YWx1ZSBpcyBuZXZlciBhIHRoZW5hYmxlLlxuXG4gICAgICBQcm9taXNlcyBjYW4gYWxzbyBiZSBzYWlkIHRvICpyZXNvbHZlKiBhIHZhbHVlLiAgSWYgdGhpcyB2YWx1ZSBpcyBhbHNvIGFcbiAgICAgIHByb21pc2UsIHRoZW4gdGhlIG9yaWdpbmFsIHByb21pc2UncyBzZXR0bGVkIHN0YXRlIHdpbGwgbWF0Y2ggdGhlIHZhbHVlJ3NcbiAgICAgIHNldHRsZWQgc3RhdGUuICBTbyBhIHByb21pc2UgdGhhdCAqcmVzb2x2ZXMqIGEgcHJvbWlzZSB0aGF0IHJlamVjdHMgd2lsbFxuICAgICAgaXRzZWxmIHJlamVjdCwgYW5kIGEgcHJvbWlzZSB0aGF0ICpyZXNvbHZlcyogYSBwcm9taXNlIHRoYXQgZnVsZmlsbHMgd2lsbFxuICAgICAgaXRzZWxmIGZ1bGZpbGwuXG5cblxuICAgICAgQmFzaWMgVXNhZ2U6XG4gICAgICAtLS0tLS0tLS0tLS1cblxuICAgICAgYGBganNcbiAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIC8vIG9uIHN1Y2Nlc3NcbiAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG5cbiAgICAgICAgLy8gb24gZmFpbHVyZVxuICAgICAgICByZWplY3QocmVhc29uKTtcbiAgICAgIH0pO1xuXG4gICAgICBwcm9taXNlLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgLy8gb24gZnVsZmlsbG1lbnRcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICAvLyBvbiByZWplY3Rpb25cbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEFkdmFuY2VkIFVzYWdlOlxuICAgICAgLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAgIFByb21pc2VzIHNoaW5lIHdoZW4gYWJzdHJhY3RpbmcgYXdheSBhc3luY2hyb25vdXMgaW50ZXJhY3Rpb25zIHN1Y2ggYXNcbiAgICAgIGBYTUxIdHRwUmVxdWVzdGBzLlxuXG4gICAgICBgYGBqc1xuICAgICAgZnVuY3Rpb24gZ2V0SlNPTih1cmwpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICAgICAgeGhyLm9wZW4oJ0dFVCcsIHVybCk7XG4gICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGhhbmRsZXI7XG4gICAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdqc29uJztcbiAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICB4aHIuc2VuZCgpO1xuXG4gICAgICAgICAgZnVuY3Rpb24gaGFuZGxlcigpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IHRoaXMuRE9ORSkge1xuICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUodGhpcy5yZXNwb25zZSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignZ2V0SlNPTjogYCcgKyB1cmwgKyAnYCBmYWlsZWQgd2l0aCBzdGF0dXM6IFsnICsgdGhpcy5zdGF0dXMgKyAnXScpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBnZXRKU09OKCcvcG9zdHMuanNvbicpLnRoZW4oZnVuY3Rpb24oanNvbikge1xuICAgICAgICAvLyBvbiBmdWxmaWxsbWVudFxuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgIC8vIG9uIHJlamVjdGlvblxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgVW5saWtlIGNhbGxiYWNrcywgcHJvbWlzZXMgYXJlIGdyZWF0IGNvbXBvc2FibGUgcHJpbWl0aXZlcy5cblxuICAgICAgYGBganNcbiAgICAgIFByb21pc2UuYWxsKFtcbiAgICAgICAgZ2V0SlNPTignL3Bvc3RzJyksXG4gICAgICAgIGdldEpTT04oJy9jb21tZW50cycpXG4gICAgICBdKS50aGVuKGZ1bmN0aW9uKHZhbHVlcyl7XG4gICAgICAgIHZhbHVlc1swXSAvLyA9PiBwb3N0c0pTT05cbiAgICAgICAgdmFsdWVzWzFdIC8vID0+IGNvbW1lbnRzSlNPTlxuXG4gICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBAY2xhc3MgUlNWUC5Qcm9taXNlXG4gICAgICBAcGFyYW0ge2Z1bmN0aW9ufSByZXNvbHZlclxuICAgICAgQHBhcmFtIHtTdHJpbmd9IGxhYmVsIG9wdGlvbmFsIHN0cmluZyBmb3IgbGFiZWxpbmcgdGhlIHByb21pc2UuXG4gICAgICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gICAgICBAY29uc3RydWN0b3JcbiAgICAqL1xuICAgIGZ1bmN0aW9uICQkcnN2cCRwcm9taXNlJCRQcm9taXNlKHJlc29sdmVyLCBsYWJlbCkge1xuICAgICAgdGhpcy5faWQgPSAkJHJzdnAkcHJvbWlzZSQkY291bnRlcisrO1xuICAgICAgdGhpcy5fbGFiZWwgPSBsYWJlbDtcbiAgICAgIHRoaXMuX3N0YXRlID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5fcmVzdWx0ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5fc3Vic2NyaWJlcnMgPSBbXTtcblxuICAgICAgaWYgKCQkcnN2cCRjb25maWckJGNvbmZpZy5pbnN0cnVtZW50KSB7XG4gICAgICAgICQkaW5zdHJ1bWVudCQkZGVmYXVsdCgnY3JlYXRlZCcsIHRoaXMpO1xuICAgICAgfVxuXG4gICAgICBpZiAoJCQkaW50ZXJuYWwkJG5vb3AgIT09IHJlc29sdmVyKSB7XG4gICAgICAgIGlmICghJCR1dGlscyQkaXNGdW5jdGlvbihyZXNvbHZlcikpIHtcbiAgICAgICAgICAkJHJzdnAkcHJvbWlzZSQkbmVlZHNSZXNvbHZlcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mICQkcnN2cCRwcm9taXNlJCRQcm9taXNlKSkge1xuICAgICAgICAgICQkcnN2cCRwcm9taXNlJCRuZWVkc05ldygpO1xuICAgICAgICB9XG5cbiAgICAgICAgJCQkaW50ZXJuYWwkJGluaXRpYWxpemVQcm9taXNlKHRoaXMsIHJlc29sdmVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBkZXByZWNhdGVkXG4gICAgJCRyc3ZwJHByb21pc2UkJFByb21pc2UuY2FzdCA9ICQkcHJvbWlzZSRyZXNvbHZlJCRkZWZhdWx0O1xuXG4gICAgJCRyc3ZwJHByb21pc2UkJFByb21pc2UuYWxsID0gJCRwcm9taXNlJGFsbCQkZGVmYXVsdDtcbiAgICAkJHJzdnAkcHJvbWlzZSQkUHJvbWlzZS5yYWNlID0gJCRwcm9taXNlJHJhY2UkJGRlZmF1bHQ7XG4gICAgJCRyc3ZwJHByb21pc2UkJFByb21pc2UucmVzb2x2ZSA9ICQkcHJvbWlzZSRyZXNvbHZlJCRkZWZhdWx0O1xuICAgICQkcnN2cCRwcm9taXNlJCRQcm9taXNlLnJlamVjdCA9ICQkcHJvbWlzZSRyZWplY3QkJGRlZmF1bHQ7XG5cbiAgICAkJHJzdnAkcHJvbWlzZSQkUHJvbWlzZS5wcm90b3R5cGUgPSB7XG4gICAgICBjb25zdHJ1Y3RvcjogJCRyc3ZwJHByb21pc2UkJFByb21pc2UsXG5cbiAgICAgIF9ndWlkS2V5OiAkJHJzdnAkcHJvbWlzZSQkZ3VpZEtleSxcblxuICAgICAgX29uZXJyb3I6IGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgJCRyc3ZwJGNvbmZpZyQkY29uZmlnLnRyaWdnZXIoJ2Vycm9yJywgcmVhc29uKTtcbiAgICAgIH0sXG5cbiAgICAvKipcbiAgICAgIFRoZSBwcmltYXJ5IHdheSBvZiBpbnRlcmFjdGluZyB3aXRoIGEgcHJvbWlzZSBpcyB0aHJvdWdoIGl0cyBgdGhlbmAgbWV0aG9kLFxuICAgICAgd2hpY2ggcmVnaXN0ZXJzIGNhbGxiYWNrcyB0byByZWNlaXZlIGVpdGhlciBhIHByb21pc2UncyBldmVudHVhbCB2YWx1ZSBvciB0aGVcbiAgICAgIHJlYXNvbiB3aHkgdGhlIHByb21pc2UgY2Fubm90IGJlIGZ1bGZpbGxlZC5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgLy8gdXNlciBpcyBhdmFpbGFibGVcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAgIC8vIHVzZXIgaXMgdW5hdmFpbGFibGUsIGFuZCB5b3UgYXJlIGdpdmVuIHRoZSByZWFzb24gd2h5XG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBDaGFpbmluZ1xuICAgICAgLS0tLS0tLS1cblxuICAgICAgVGhlIHJldHVybiB2YWx1ZSBvZiBgdGhlbmAgaXMgaXRzZWxmIGEgcHJvbWlzZS4gIFRoaXMgc2Vjb25kLCAnZG93bnN0cmVhbSdcbiAgICAgIHByb21pc2UgaXMgcmVzb2x2ZWQgd2l0aCB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmaXJzdCBwcm9taXNlJ3MgZnVsZmlsbG1lbnRcbiAgICAgIG9yIHJlamVjdGlvbiBoYW5kbGVyLCBvciByZWplY3RlZCBpZiB0aGUgaGFuZGxlciB0aHJvd3MgYW4gZXhjZXB0aW9uLlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHJldHVybiB1c2VyLm5hbWU7XG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIHJldHVybiAnZGVmYXVsdCBuYW1lJztcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHVzZXJOYW1lKSB7XG4gICAgICAgIC8vIElmIGBmaW5kVXNlcmAgZnVsZmlsbGVkLCBgdXNlck5hbWVgIHdpbGwgYmUgdGhlIHVzZXIncyBuYW1lLCBvdGhlcndpc2UgaXRcbiAgICAgICAgLy8gd2lsbCBiZSBgJ2RlZmF1bHQgbmFtZSdgXG4gICAgICB9KTtcblxuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRm91bmQgdXNlciwgYnV0IHN0aWxsIHVuaGFwcHknKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdgZmluZFVzZXJgIHJlamVjdGVkIGFuZCB3ZSdyZSB1bmhhcHB5Jyk7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyBuZXZlciByZWFjaGVkXG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vIGlmIGBmaW5kVXNlcmAgZnVsZmlsbGVkLCBgcmVhc29uYCB3aWxsIGJlICdGb3VuZCB1c2VyLCBidXQgc3RpbGwgdW5oYXBweScuXG4gICAgICAgIC8vIElmIGBmaW5kVXNlcmAgcmVqZWN0ZWQsIGByZWFzb25gIHdpbGwgYmUgJ2BmaW5kVXNlcmAgcmVqZWN0ZWQgYW5kIHdlJ3JlIHVuaGFwcHknLlxuICAgICAgfSk7XG4gICAgICBgYGBcbiAgICAgIElmIHRoZSBkb3duc3RyZWFtIHByb21pc2UgZG9lcyBub3Qgc3BlY2lmeSBhIHJlamVjdGlvbiBoYW5kbGVyLCByZWplY3Rpb24gcmVhc29ucyB3aWxsIGJlIHByb3BhZ2F0ZWQgZnVydGhlciBkb3duc3RyZWFtLlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHRocm93IG5ldyBQZWRhZ29naWNhbEV4Y2VwdGlvbignVXBzdHJlYW0gZXJyb3InKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgLy8gVGhlIGBQZWRnYWdvY2lhbEV4Y2VwdGlvbmAgaXMgcHJvcGFnYXRlZCBhbGwgdGhlIHdheSBkb3duIHRvIGhlcmVcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEFzc2ltaWxhdGlvblxuICAgICAgLS0tLS0tLS0tLS0tXG5cbiAgICAgIFNvbWV0aW1lcyB0aGUgdmFsdWUgeW91IHdhbnQgdG8gcHJvcGFnYXRlIHRvIGEgZG93bnN0cmVhbSBwcm9taXNlIGNhbiBvbmx5IGJlXG4gICAgICByZXRyaWV2ZWQgYXN5bmNocm9ub3VzbHkuIFRoaXMgY2FuIGJlIGFjaGlldmVkIGJ5IHJldHVybmluZyBhIHByb21pc2UgaW4gdGhlXG4gICAgICBmdWxmaWxsbWVudCBvciByZWplY3Rpb24gaGFuZGxlci4gVGhlIGRvd25zdHJlYW0gcHJvbWlzZSB3aWxsIHRoZW4gYmUgcGVuZGluZ1xuICAgICAgdW50aWwgdGhlIHJldHVybmVkIHByb21pc2UgaXMgc2V0dGxlZC4gVGhpcyBpcyBjYWxsZWQgKmFzc2ltaWxhdGlvbiouXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgcmV0dXJuIGZpbmRDb21tZW50c0J5QXV0aG9yKHVzZXIpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAoY29tbWVudHMpIHtcbiAgICAgICAgLy8gVGhlIHVzZXIncyBjb21tZW50cyBhcmUgbm93IGF2YWlsYWJsZVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgSWYgdGhlIGFzc2ltbGlhdGVkIHByb21pc2UgcmVqZWN0cywgdGhlbiB0aGUgZG93bnN0cmVhbSBwcm9taXNlIHdpbGwgYWxzbyByZWplY3QuXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgcmV0dXJuIGZpbmRDb21tZW50c0J5QXV0aG9yKHVzZXIpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAoY29tbWVudHMpIHtcbiAgICAgICAgLy8gSWYgYGZpbmRDb21tZW50c0J5QXV0aG9yYCBmdWxmaWxscywgd2UnbGwgaGF2ZSB0aGUgdmFsdWUgaGVyZVxuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAvLyBJZiBgZmluZENvbW1lbnRzQnlBdXRob3JgIHJlamVjdHMsIHdlJ2xsIGhhdmUgdGhlIHJlYXNvbiBoZXJlXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBTaW1wbGUgRXhhbXBsZVxuICAgICAgLS0tLS0tLS0tLS0tLS1cblxuICAgICAgU3luY2hyb25vdXMgRXhhbXBsZVxuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICB0cnkge1xuICAgICAgICByZXN1bHQgPSBmaW5kUmVzdWx0KCk7XG4gICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgIC8vIGZhaWx1cmVcbiAgICAgIH1cbiAgICAgIGBgYFxuXG4gICAgICBFcnJiYWNrIEV4YW1wbGVcblxuICAgICAgYGBganNcbiAgICAgIGZpbmRSZXN1bHQoZnVuY3Rpb24ocmVzdWx0LCBlcnIpe1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgUHJvbWlzZSBFeGFtcGxlO1xuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICBmaW5kUmVzdWx0KCkudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuICAgICAgICAvLyBzdWNjZXNzXG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICAvLyBmYWlsdXJlXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBBZHZhbmNlZCBFeGFtcGxlXG4gICAgICAtLS0tLS0tLS0tLS0tLVxuXG4gICAgICBTeW5jaHJvbm91cyBFeGFtcGxlXG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIHZhciBhdXRob3IsIGJvb2tzO1xuXG4gICAgICB0cnkge1xuICAgICAgICBhdXRob3IgPSBmaW5kQXV0aG9yKCk7XG4gICAgICAgIGJvb2tzICA9IGZpbmRCb29rc0J5QXV0aG9yKGF1dGhvcik7XG4gICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgIC8vIGZhaWx1cmVcbiAgICAgIH1cbiAgICAgIGBgYFxuXG4gICAgICBFcnJiYWNrIEV4YW1wbGVcblxuICAgICAgYGBganNcblxuICAgICAgZnVuY3Rpb24gZm91bmRCb29rcyhib29rcykge1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGZhaWx1cmUocmVhc29uKSB7XG5cbiAgICAgIH1cblxuICAgICAgZmluZEF1dGhvcihmdW5jdGlvbihhdXRob3IsIGVycil7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmaW5kQm9vb2tzQnlBdXRob3IoYXV0aG9yLCBmdW5jdGlvbihib29rcywgZXJyKSB7XG4gICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIGZvdW5kQm9va3MoYm9va3MpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgICBmYWlsdXJlKHJlYXNvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgUHJvbWlzZSBFeGFtcGxlO1xuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICBmaW5kQXV0aG9yKCkuXG4gICAgICAgIHRoZW4oZmluZEJvb2tzQnlBdXRob3IpLlxuICAgICAgICB0aGVuKGZ1bmN0aW9uKGJvb2tzKXtcbiAgICAgICAgICAvLyBmb3VuZCBib29rc1xuICAgICAgfSkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEBtZXRob2QgdGhlblxuICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gb25GdWxmaWxsZWRcbiAgICAgIEBwYXJhbSB7RnVuY3Rpb259IG9uUmVqZWN0ZWRcbiAgICAgIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCBvcHRpb25hbCBzdHJpbmcgZm9yIGxhYmVsaW5nIHRoZSBwcm9taXNlLlxuICAgICAgVXNlZnVsIGZvciB0b29saW5nLlxuICAgICAgQHJldHVybiB7UHJvbWlzZX1cbiAgICAqL1xuICAgICAgdGhlbjogZnVuY3Rpb24ob25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24sIGxhYmVsKSB7XG4gICAgICAgIHZhciBwYXJlbnQgPSB0aGlzO1xuICAgICAgICB2YXIgc3RhdGUgPSBwYXJlbnQuX3N0YXRlO1xuXG4gICAgICAgIGlmIChzdGF0ZSA9PT0gJCQkaW50ZXJuYWwkJEZVTEZJTExFRCAmJiAhb25GdWxmaWxsbWVudCB8fCBzdGF0ZSA9PT0gJCQkaW50ZXJuYWwkJFJFSkVDVEVEICYmICFvblJlamVjdGlvbikge1xuICAgICAgICAgIGlmICgkJHJzdnAkY29uZmlnJCRjb25maWcuaW5zdHJ1bWVudCkge1xuICAgICAgICAgICAgJCRpbnN0cnVtZW50JCRkZWZhdWx0KCdjaGFpbmVkJywgdGhpcywgdGhpcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgcGFyZW50Ll9vbmVycm9yID0gbnVsbDtcblxuICAgICAgICB2YXIgY2hpbGQgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcigkJCRpbnRlcm5hbCQkbm9vcCwgbGFiZWwpO1xuICAgICAgICB2YXIgcmVzdWx0ID0gcGFyZW50Ll9yZXN1bHQ7XG5cbiAgICAgICAgaWYgKCQkcnN2cCRjb25maWckJGNvbmZpZy5pbnN0cnVtZW50KSB7XG4gICAgICAgICAgJCRpbnN0cnVtZW50JCRkZWZhdWx0KCdjaGFpbmVkJywgcGFyZW50LCBjaGlsZCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3RhdGUpIHtcbiAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmd1bWVudHNbc3RhdGUgLSAxXTtcbiAgICAgICAgICAkJHJzdnAkY29uZmlnJCRjb25maWcuYXN5bmMoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICQkJGludGVybmFsJCRpbnZva2VDYWxsYmFjayhzdGF0ZSwgY2hpbGQsIGNhbGxiYWNrLCByZXN1bHQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICQkJGludGVybmFsJCRzdWJzY3JpYmUocGFyZW50LCBjaGlsZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNoaWxkO1xuICAgICAgfSxcblxuICAgIC8qKlxuICAgICAgYGNhdGNoYCBpcyBzaW1wbHkgc3VnYXIgZm9yIGB0aGVuKHVuZGVmaW5lZCwgb25SZWplY3Rpb24pYCB3aGljaCBtYWtlcyBpdCB0aGUgc2FtZVxuICAgICAgYXMgdGhlIGNhdGNoIGJsb2NrIG9mIGEgdHJ5L2NhdGNoIHN0YXRlbWVudC5cblxuICAgICAgYGBganNcbiAgICAgIGZ1bmN0aW9uIGZpbmRBdXRob3IoKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZG4ndCBmaW5kIHRoYXQgYXV0aG9yJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIHN5bmNocm9ub3VzXG4gICAgICB0cnkge1xuICAgICAgICBmaW5kQXV0aG9yKCk7XG4gICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICAgICAgfVxuXG4gICAgICAvLyBhc3luYyB3aXRoIHByb21pc2VzXG4gICAgICBmaW5kQXV0aG9yKCkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEBtZXRob2QgY2F0Y2hcbiAgICAgIEBwYXJhbSB7RnVuY3Rpb259IG9uUmVqZWN0aW9uXG4gICAgICBAcGFyYW0ge1N0cmluZ30gbGFiZWwgb3B0aW9uYWwgc3RyaW5nIGZvciBsYWJlbGluZyB0aGUgcHJvbWlzZS5cbiAgICAgIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgICAgIEByZXR1cm4ge1Byb21pc2V9XG4gICAgKi9cbiAgICAgICdjYXRjaCc6IGZ1bmN0aW9uKG9uUmVqZWN0aW9uLCBsYWJlbCkge1xuICAgICAgICByZXR1cm4gdGhpcy50aGVuKG51bGwsIG9uUmVqZWN0aW9uLCBsYWJlbCk7XG4gICAgICB9LFxuXG4gICAgLyoqXG4gICAgICBgZmluYWxseWAgd2lsbCBiZSBpbnZva2VkIHJlZ2FyZGxlc3Mgb2YgdGhlIHByb21pc2UncyBmYXRlIGp1c3QgYXMgbmF0aXZlXG4gICAgICB0cnkvY2F0Y2gvZmluYWxseSBiZWhhdmVzXG5cbiAgICAgIFN5bmNocm9ub3VzIGV4YW1wbGU6XG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kQXV0aG9yKCkge1xuICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA+IDAuNSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgQXV0aG9yKCk7XG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBmaW5kQXV0aG9yKCk7IC8vIHN1Y2NlZWQgb3IgZmFpbFxuICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICByZXR1cm4gZmluZE90aGVyQXV0aGVyKCk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICAvLyBhbHdheXMgcnVuc1xuICAgICAgICAvLyBkb2Vzbid0IGFmZmVjdCB0aGUgcmV0dXJuIHZhbHVlXG4gICAgICB9XG4gICAgICBgYGBcblxuICAgICAgQXN5bmNocm9ub3VzIGV4YW1wbGU6XG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kQXV0aG9yKCkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgcmV0dXJuIGZpbmRPdGhlckF1dGhlcigpO1xuICAgICAgfSkuZmluYWxseShmdW5jdGlvbigpe1xuICAgICAgICAvLyBhdXRob3Igd2FzIGVpdGhlciBmb3VuZCwgb3Igbm90XG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBAbWV0aG9kIGZpbmFsbHlcbiAgICAgIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gICAgICBAcGFyYW0ge1N0cmluZ30gbGFiZWwgb3B0aW9uYWwgc3RyaW5nIGZvciBsYWJlbGluZyB0aGUgcHJvbWlzZS5cbiAgICAgIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgICAgIEByZXR1cm4ge1Byb21pc2V9XG4gICAgKi9cbiAgICAgICdmaW5hbGx5JzogZnVuY3Rpb24oY2FsbGJhY2ssIGxhYmVsKSB7XG4gICAgICAgIHZhciBjb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3I7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIHJldHVybiBjb25zdHJ1Y3Rvci5yZXNvbHZlKGNhbGxiYWNrKCkpLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnN0cnVjdG9yLnJlc29sdmUoY2FsbGJhY2soKSkudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgICAgdGhyb3cgcmVhc29uO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LCBsYWJlbCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uICQkcnN2cCRub2RlJCRSZXN1bHQoKSB7XG4gICAgICB0aGlzLnZhbHVlID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHZhciAkJHJzdnAkbm9kZSQkRVJST1IgPSBuZXcgJCRyc3ZwJG5vZGUkJFJlc3VsdCgpO1xuICAgIHZhciAkJHJzdnAkbm9kZSQkR0VUX1RIRU5fRVJST1IgPSBuZXcgJCRyc3ZwJG5vZGUkJFJlc3VsdCgpO1xuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJG5vZGUkJGdldFRoZW4ob2JqKSB7XG4gICAgICB0cnkge1xuICAgICAgIHJldHVybiBvYmoudGhlbjtcbiAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgJCRyc3ZwJG5vZGUkJEVSUk9SLnZhbHVlPSBlcnJvcjtcbiAgICAgICAgcmV0dXJuICQkcnN2cCRub2RlJCRFUlJPUjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkbm9kZSQkdHJ5QXBwbHkoZiwgcywgYSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZi5hcHBseShzLCBhKTtcbiAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgJCRyc3ZwJG5vZGUkJEVSUk9SLnZhbHVlID0gZXJyb3I7XG4gICAgICAgIHJldHVybiAkJHJzdnAkbm9kZSQkRVJST1I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJG5vZGUkJG1ha2VPYmplY3QoXywgYXJndW1lbnROYW1lcykge1xuICAgICAgdmFyIG9iaiA9IHt9O1xuICAgICAgdmFyIG5hbWU7XG4gICAgICB2YXIgaTtcbiAgICAgIHZhciBsZW5ndGggPSBfLmxlbmd0aDtcbiAgICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGxlbmd0aCk7XG5cbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgbGVuZ3RoOyB4KyspIHtcbiAgICAgICAgYXJnc1t4XSA9IF9beF07XG4gICAgICB9XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBhcmd1bWVudE5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG5hbWUgPSBhcmd1bWVudE5hbWVzW2ldO1xuICAgICAgICBvYmpbbmFtZV0gPSBhcmdzW2kgKyAxXTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkbm9kZSQkYXJyYXlSZXN1bHQoXykge1xuICAgICAgdmFyIGxlbmd0aCA9IF8ubGVuZ3RoO1xuICAgICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkobGVuZ3RoIC0gMSk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYXJnc1tpIC0gMV0gPSBfW2ldO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gYXJncztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkbm9kZSQkd3JhcFRoZW5hYmxlKHRoZW4sIHByb21pc2UpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRoZW46IGZ1bmN0aW9uKG9uRnVsRmlsbG1lbnQsIG9uUmVqZWN0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIHRoZW4uY2FsbChwcm9taXNlLCBvbkZ1bEZpbGxtZW50LCBvblJlamVjdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyICQkcnN2cCRub2RlJCRkZWZhdWx0ID0gZnVuY3Rpb24gZGVub2RlaWZ5KG5vZGVGdW5jLCBvcHRpb25zKSB7XG4gICAgICB2YXIgZm4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgbCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGwgKyAxKTtcbiAgICAgICAgdmFyIGFyZztcbiAgICAgICAgdmFyIHByb21pc2VJbnB1dCA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgKytpKSB7XG4gICAgICAgICAgYXJnID0gYXJndW1lbnRzW2ldO1xuXG4gICAgICAgICAgaWYgKCFwcm9taXNlSW5wdXQpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IGNsZWFuIHRoaXMgdXBcbiAgICAgICAgICAgIHByb21pc2VJbnB1dCA9ICQkcnN2cCRub2RlJCRuZWVkc1Byb21pc2VJbnB1dChhcmcpO1xuICAgICAgICAgICAgaWYgKHByb21pc2VJbnB1dCA9PT0gJCRyc3ZwJG5vZGUkJEdFVF9USEVOX0VSUk9SKSB7XG4gICAgICAgICAgICAgIHZhciBwID0gbmV3ICQkcnN2cCRwcm9taXNlJCRkZWZhdWx0KCQkJGludGVybmFsJCRub29wKTtcbiAgICAgICAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwLCAkJHJzdnAkbm9kZSQkR0VUX1RIRU5fRVJST1IudmFsdWUpO1xuICAgICAgICAgICAgICByZXR1cm4gcDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvbWlzZUlucHV0ICYmIHByb21pc2VJbnB1dCAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICBhcmcgPSAkJHJzdnAkbm9kZSQkd3JhcFRoZW5hYmxlKHByb21pc2VJbnB1dCwgYXJnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYXJnc1tpXSA9IGFyZztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwcm9taXNlID0gbmV3ICQkcnN2cCRwcm9taXNlJCRkZWZhdWx0KCQkJGludGVybmFsJCRub29wKTtcblxuICAgICAgICBhcmdzW2xdID0gZnVuY3Rpb24oZXJyLCB2YWwpIHtcbiAgICAgICAgICBpZiAoZXJyKVxuICAgICAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBlcnIpO1xuICAgICAgICAgIGVsc2UgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICQkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbCk7XG4gICAgICAgICAgZWxzZSBpZiAob3B0aW9ucyA9PT0gdHJ1ZSlcbiAgICAgICAgICAgICQkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsICQkcnN2cCRub2RlJCRhcnJheVJlc3VsdChhcmd1bWVudHMpKTtcbiAgICAgICAgICBlbHNlIGlmICgkJHV0aWxzJCRpc0FycmF5KG9wdGlvbnMpKVxuICAgICAgICAgICAgJCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgJCRyc3ZwJG5vZGUkJG1ha2VPYmplY3QoYXJndW1lbnRzLCBvcHRpb25zKSk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgJCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsKTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAocHJvbWlzZUlucHV0KSB7XG4gICAgICAgICAgcmV0dXJuICQkcnN2cCRub2RlJCRoYW5kbGVQcm9taXNlSW5wdXQocHJvbWlzZSwgYXJncywgbm9kZUZ1bmMsIHNlbGYpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiAkJHJzdnAkbm9kZSQkaGFuZGxlVmFsdWVJbnB1dChwcm9taXNlLCBhcmdzLCBub2RlRnVuYywgc2VsZik7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGZuLl9fcHJvdG9fXyA9IG5vZGVGdW5jO1xuXG4gICAgICByZXR1cm4gZm47XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uICQkcnN2cCRub2RlJCRoYW5kbGVWYWx1ZUlucHV0KHByb21pc2UsIGFyZ3MsIG5vZGVGdW5jLCBzZWxmKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gJCRyc3ZwJG5vZGUkJHRyeUFwcGx5KG5vZGVGdW5jLCBzZWxmLCBhcmdzKTtcbiAgICAgIGlmIChyZXN1bHQgPT09ICQkcnN2cCRub2RlJCRFUlJPUikge1xuICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlc3VsdC52YWx1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkbm9kZSQkaGFuZGxlUHJvbWlzZUlucHV0KHByb21pc2UsIGFyZ3MsIG5vZGVGdW5jLCBzZWxmKXtcbiAgICAgIHJldHVybiAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdC5hbGwoYXJncykudGhlbihmdW5jdGlvbihhcmdzKXtcbiAgICAgICAgdmFyIHJlc3VsdCA9ICQkcnN2cCRub2RlJCR0cnlBcHBseShub2RlRnVuYywgc2VsZiwgYXJncyk7XG4gICAgICAgIGlmIChyZXN1bHQgPT09ICQkcnN2cCRub2RlJCRFUlJPUikge1xuICAgICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVzdWx0LnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkcnN2cCRub2RlJCRuZWVkc1Byb21pc2VJbnB1dChhcmcpIHtcbiAgICAgIGlmIChhcmcgJiYgdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgaWYgKGFyZy5jb25zdHJ1Y3RvciA9PT0gJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gJCRyc3ZwJG5vZGUkJGdldFRoZW4oYXJnKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciAkJHJzdnAkYWxsJCRkZWZhdWx0ID0gZnVuY3Rpb24gYWxsKGFycmF5LCBsYWJlbCkge1xuICAgICAgcmV0dXJuICQkcnN2cCRwcm9taXNlJCRkZWZhdWx0LmFsbChhcnJheSwgbGFiZWwpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkYWxsJHNldHRsZWQkJEFsbFNldHRsZWQoQ29uc3RydWN0b3IsIGVudHJpZXMsIGxhYmVsKSB7XG4gICAgICB0aGlzLl9zdXBlckNvbnN0cnVjdG9yKENvbnN0cnVjdG9yLCBlbnRyaWVzLCBmYWxzZSAvKiBkb24ndCBhYm9ydCBvbiByZWplY3QgKi8sIGxhYmVsKTtcbiAgICB9XG5cbiAgICAkJHJzdnAkYWxsJHNldHRsZWQkJEFsbFNldHRsZWQucHJvdG90eXBlID0gJCR1dGlscyQkb19jcmVhdGUoJCRlbnVtZXJhdG9yJCRkZWZhdWx0LnByb3RvdHlwZSk7XG4gICAgJCRyc3ZwJGFsbCRzZXR0bGVkJCRBbGxTZXR0bGVkLnByb3RvdHlwZS5fc3VwZXJDb25zdHJ1Y3RvciA9ICQkZW51bWVyYXRvciQkZGVmYXVsdDtcbiAgICAkJHJzdnAkYWxsJHNldHRsZWQkJEFsbFNldHRsZWQucHJvdG90eXBlLl9tYWtlUmVzdWx0ID0gJCRlbnVtZXJhdG9yJCRtYWtlU2V0dGxlZFJlc3VsdDtcblxuICAgICQkcnN2cCRhbGwkc2V0dGxlZCQkQWxsU2V0dGxlZC5wcm90b3R5cGUuX3ZhbGlkYXRpb25FcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyBFcnJvcignYWxsU2V0dGxlZCBtdXN0IGJlIGNhbGxlZCB3aXRoIGFuIGFycmF5Jyk7XG4gICAgfTtcblxuICAgIHZhciAkJHJzdnAkYWxsJHNldHRsZWQkJGRlZmF1bHQgPSBmdW5jdGlvbiBhbGxTZXR0bGVkKGVudHJpZXMsIGxhYmVsKSB7XG4gICAgICByZXR1cm4gbmV3ICQkcnN2cCRhbGwkc2V0dGxlZCQkQWxsU2V0dGxlZCgkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdCwgZW50cmllcywgbGFiZWwpLnByb21pc2U7XG4gICAgfTtcblxuICAgIHZhciAkJHJzdnAkcmFjZSQkZGVmYXVsdCA9IGZ1bmN0aW9uIHJhY2UoYXJyYXksIGxhYmVsKSB7XG4gICAgICByZXR1cm4gJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQucmFjZShhcnJheSwgbGFiZWwpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiAkJHByb21pc2UkaGFzaCQkUHJvbWlzZUhhc2goQ29uc3RydWN0b3IsIG9iamVjdCwgbGFiZWwpIHtcbiAgICAgIHRoaXMuX3N1cGVyQ29uc3RydWN0b3IoQ29uc3RydWN0b3IsIG9iamVjdCwgdHJ1ZSwgbGFiZWwpO1xuICAgIH1cblxuICAgIHZhciAkJHByb21pc2UkaGFzaCQkZGVmYXVsdCA9ICQkcHJvbWlzZSRoYXNoJCRQcm9taXNlSGFzaDtcbiAgICAkJHByb21pc2UkaGFzaCQkUHJvbWlzZUhhc2gucHJvdG90eXBlID0gJCR1dGlscyQkb19jcmVhdGUoJCRlbnVtZXJhdG9yJCRkZWZhdWx0LnByb3RvdHlwZSk7XG4gICAgJCRwcm9taXNlJGhhc2gkJFByb21pc2VIYXNoLnByb3RvdHlwZS5fc3VwZXJDb25zdHJ1Y3RvciA9ICQkZW51bWVyYXRvciQkZGVmYXVsdDtcblxuICAgICQkcHJvbWlzZSRoYXNoJCRQcm9taXNlSGFzaC5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX3Jlc3VsdCA9IHt9O1xuICAgIH07XG5cbiAgICAkJHByb21pc2UkaGFzaCQkUHJvbWlzZUhhc2gucHJvdG90eXBlLl92YWxpZGF0ZUlucHV0ID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgIHJldHVybiBpbnB1dCAmJiB0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnO1xuICAgIH07XG5cbiAgICAkJHByb21pc2UkaGFzaCQkUHJvbWlzZUhhc2gucHJvdG90eXBlLl92YWxpZGF0aW9uRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRXJyb3IoJ1Byb21pc2UuaGFzaCBtdXN0IGJlIGNhbGxlZCB3aXRoIGFuIG9iamVjdCcpO1xuICAgIH07XG5cbiAgICAkJHByb21pc2UkaGFzaCQkUHJvbWlzZUhhc2gucHJvdG90eXBlLl9lbnVtZXJhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwcm9taXNlID0gdGhpcy5wcm9taXNlO1xuICAgICAgdmFyIGlucHV0ICAgPSB0aGlzLl9pbnB1dDtcbiAgICAgIHZhciByZXN1bHRzID0gW107XG5cbiAgICAgIGZvciAodmFyIGtleSBpbiBpbnB1dCkge1xuICAgICAgICBpZiAocHJvbWlzZS5fc3RhdGUgPT09ICQkJGludGVybmFsJCRQRU5ESU5HICYmIGlucHV0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICAgICAgcG9zaXRpb246IGtleSxcbiAgICAgICAgICAgIGVudHJ5OiBpbnB1dFtrZXldXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIGxlbmd0aCA9IHJlc3VsdHMubGVuZ3RoO1xuICAgICAgdGhpcy5fcmVtYWluaW5nID0gbGVuZ3RoO1xuICAgICAgdmFyIHJlc3VsdDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IHByb21pc2UuX3N0YXRlID09PSAkJCRpbnRlcm5hbCQkUEVORElORyAmJiBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0c1tpXTtcbiAgICAgICAgdGhpcy5fZWFjaEVudHJ5KHJlc3VsdC5lbnRyeSwgcmVzdWx0LnBvc2l0aW9uKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyICQkcnN2cCRoYXNoJCRkZWZhdWx0ID0gZnVuY3Rpb24gaGFzaChvYmplY3QsIGxhYmVsKSB7XG4gICAgICByZXR1cm4gbmV3ICQkcHJvbWlzZSRoYXNoJCRkZWZhdWx0KCQkcnN2cCRwcm9taXNlJCRkZWZhdWx0LCBvYmplY3QsIGxhYmVsKS5wcm9taXNlO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkaGFzaCRzZXR0bGVkJCRIYXNoU2V0dGxlZChDb25zdHJ1Y3Rvciwgb2JqZWN0LCBsYWJlbCkge1xuICAgICAgdGhpcy5fc3VwZXJDb25zdHJ1Y3RvcihDb25zdHJ1Y3Rvciwgb2JqZWN0LCBmYWxzZSwgbGFiZWwpO1xuICAgIH1cblxuICAgICQkcnN2cCRoYXNoJHNldHRsZWQkJEhhc2hTZXR0bGVkLnByb3RvdHlwZSA9ICQkdXRpbHMkJG9fY3JlYXRlKCQkcHJvbWlzZSRoYXNoJCRkZWZhdWx0LnByb3RvdHlwZSk7XG4gICAgJCRyc3ZwJGhhc2gkc2V0dGxlZCQkSGFzaFNldHRsZWQucHJvdG90eXBlLl9zdXBlckNvbnN0cnVjdG9yID0gJCRlbnVtZXJhdG9yJCRkZWZhdWx0O1xuICAgICQkcnN2cCRoYXNoJHNldHRsZWQkJEhhc2hTZXR0bGVkLnByb3RvdHlwZS5fbWFrZVJlc3VsdCA9ICQkZW51bWVyYXRvciQkbWFrZVNldHRsZWRSZXN1bHQ7XG5cbiAgICAkJHJzdnAkaGFzaCRzZXR0bGVkJCRIYXNoU2V0dGxlZC5wcm90b3R5cGUuX3ZhbGlkYXRpb25FcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyBFcnJvcignaGFzaFNldHRsZWQgbXVzdCBiZSBjYWxsZWQgd2l0aCBhbiBvYmplY3QnKTtcbiAgICB9O1xuXG4gICAgdmFyICQkcnN2cCRoYXNoJHNldHRsZWQkJGRlZmF1bHQgPSBmdW5jdGlvbiBoYXNoU2V0dGxlZChvYmplY3QsIGxhYmVsKSB7XG4gICAgICByZXR1cm4gbmV3ICQkcnN2cCRoYXNoJHNldHRsZWQkJEhhc2hTZXR0bGVkKCQkcnN2cCRwcm9taXNlJCRkZWZhdWx0LCBvYmplY3QsIGxhYmVsKS5wcm9taXNlO1xuICAgIH07XG5cbiAgICB2YXIgJCRyc3ZwJHJldGhyb3ckJGRlZmF1bHQgPSBmdW5jdGlvbiByZXRocm93KHJlYXNvbikge1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhyb3cgcmVhc29uO1xuICAgICAgfSk7XG4gICAgICB0aHJvdyByZWFzb247XG4gICAgfTtcblxuICAgIHZhciAkJHJzdnAkZGVmZXIkJGRlZmF1bHQgPSBmdW5jdGlvbiBkZWZlcihsYWJlbCkge1xuICAgICAgdmFyIGRlZmVycmVkID0geyB9O1xuXG4gICAgICBkZWZlcnJlZC5wcm9taXNlID0gbmV3ICQkcnN2cCRwcm9taXNlJCRkZWZhdWx0KGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0ID0gcmVqZWN0O1xuICAgICAgfSwgbGFiZWwpO1xuXG4gICAgICByZXR1cm4gZGVmZXJyZWQ7XG4gICAgfTtcblxuICAgIHZhciAkJHJzdnAkbWFwJCRkZWZhdWx0ID0gZnVuY3Rpb24gbWFwKHByb21pc2VzLCBtYXBGbiwgbGFiZWwpIHtcbiAgICAgIHJldHVybiAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdC5hbGwocHJvbWlzZXMsIGxhYmVsKS50aGVuKGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICBpZiAoISQkdXRpbHMkJGlzRnVuY3Rpb24obWFwRm4pKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIllvdSBtdXN0IHBhc3MgYSBmdW5jdGlvbiBhcyBtYXAncyBzZWNvbmQgYXJndW1lbnQuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxlbmd0aCA9IHZhbHVlcy5sZW5ndGg7XG4gICAgICAgIHZhciByZXN1bHRzID0gbmV3IEFycmF5KGxlbmd0aCk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgIHJlc3VsdHNbaV0gPSBtYXBGbih2YWx1ZXNbaV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICQkcnN2cCRwcm9taXNlJCRkZWZhdWx0LmFsbChyZXN1bHRzLCBsYWJlbCk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdmFyICQkcnN2cCRyZXNvbHZlJCRkZWZhdWx0ID0gZnVuY3Rpb24gcmVzb2x2ZSh2YWx1ZSwgbGFiZWwpIHtcbiAgICAgIHJldHVybiAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdC5yZXNvbHZlKHZhbHVlLCBsYWJlbCk7XG4gICAgfTtcblxuICAgIHZhciAkJHJzdnAkcmVqZWN0JCRkZWZhdWx0ID0gZnVuY3Rpb24gcmVqZWN0KHJlYXNvbiwgbGFiZWwpIHtcbiAgICAgIHJldHVybiAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdC5yZWplY3QocmVhc29uLCBsYWJlbCk7XG4gICAgfTtcblxuICAgIHZhciAkJHJzdnAkZmlsdGVyJCRkZWZhdWx0ID0gZnVuY3Rpb24gZmlsdGVyKHByb21pc2VzLCBmaWx0ZXJGbiwgbGFiZWwpIHtcbiAgICAgIHJldHVybiAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdC5hbGwocHJvbWlzZXMsIGxhYmVsKS50aGVuKGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICBpZiAoISQkdXRpbHMkJGlzRnVuY3Rpb24oZmlsdGVyRm4pKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIllvdSBtdXN0IHBhc3MgYSBmdW5jdGlvbiBhcyBmaWx0ZXIncyBzZWNvbmQgYXJndW1lbnQuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxlbmd0aCA9IHZhbHVlcy5sZW5ndGg7XG4gICAgICAgIHZhciBmaWx0ZXJlZCA9IG5ldyBBcnJheShsZW5ndGgpO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBmaWx0ZXJlZFtpXSA9IGZpbHRlckZuKHZhbHVlc1tpXSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQuYWxsKGZpbHRlcmVkLCBsYWJlbCkudGhlbihmdW5jdGlvbihmaWx0ZXJlZCkge1xuICAgICAgICAgIHZhciByZXN1bHRzID0gbmV3IEFycmF5KGxlbmd0aCk7XG4gICAgICAgICAgdmFyIG5ld0xlbmd0aCA9IDA7XG5cbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZmlsdGVyZWRbaV0pIHtcbiAgICAgICAgICAgICAgcmVzdWx0c1tuZXdMZW5ndGhdID0gdmFsdWVzW2ldO1xuICAgICAgICAgICAgICBuZXdMZW5ndGgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXN1bHRzLmxlbmd0aCA9IG5ld0xlbmd0aDtcblxuICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgJCRyc3ZwJGFzYXAkJGxlbiA9IDA7XG5cbiAgICB2YXIgJCRyc3ZwJGFzYXAkJGRlZmF1bHQgPSBmdW5jdGlvbiBhc2FwKGNhbGxiYWNrLCBhcmcpIHtcbiAgICAgICQkcnN2cCRhc2FwJCRxdWV1ZVskJHJzdnAkYXNhcCQkbGVuXSA9IGNhbGxiYWNrO1xuICAgICAgJCRyc3ZwJGFzYXAkJHF1ZXVlWyQkcnN2cCRhc2FwJCRsZW4gKyAxXSA9IGFyZztcbiAgICAgICQkcnN2cCRhc2FwJCRsZW4gKz0gMjtcbiAgICAgIGlmICgkJHJzdnAkYXNhcCQkbGVuID09PSAyKSB7XG4gICAgICAgIC8vIElmIGxlbiBpcyAxLCB0aGF0IG1lYW5zIHRoYXQgd2UgbmVlZCB0byBzY2hlZHVsZSBhbiBhc3luYyBmbHVzaC5cbiAgICAgICAgLy8gSWYgYWRkaXRpb25hbCBjYWxsYmFja3MgYXJlIHF1ZXVlZCBiZWZvcmUgdGhlIHF1ZXVlIGlzIGZsdXNoZWQsIHRoZXlcbiAgICAgICAgLy8gd2lsbCBiZSBwcm9jZXNzZWQgYnkgdGhpcyBmbHVzaCB0aGF0IHdlIGFyZSBzY2hlZHVsaW5nLlxuICAgICAgICAkJHJzdnAkYXNhcCQkc2NoZWR1bGVGbHVzaCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgJCRyc3ZwJGFzYXAkJGJyb3dzZXJHbG9iYWwgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpID8gd2luZG93IDoge307XG4gICAgdmFyICQkcnN2cCRhc2FwJCRCcm93c2VyTXV0YXRpb25PYnNlcnZlciA9ICQkcnN2cCRhc2FwJCRicm93c2VyR2xvYmFsLk11dGF0aW9uT2JzZXJ2ZXIgfHwgJCRyc3ZwJGFzYXAkJGJyb3dzZXJHbG9iYWwuV2ViS2l0TXV0YXRpb25PYnNlcnZlcjtcblxuICAgIC8vIHRlc3QgZm9yIHdlYiB3b3JrZXIgYnV0IG5vdCBpbiBJRTEwXG4gICAgdmFyICQkcnN2cCRhc2FwJCRpc1dvcmtlciA9IHR5cGVvZiBVaW50OENsYW1wZWRBcnJheSAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgIHR5cGVvZiBpbXBvcnRTY3JpcHRzICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgdHlwZW9mIE1lc3NhZ2VDaGFubmVsICE9PSAndW5kZWZpbmVkJztcblxuICAgIC8vIG5vZGVcbiAgICBmdW5jdGlvbiAkJHJzdnAkYXNhcCQkdXNlTmV4dFRpY2soKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soJCRyc3ZwJGFzYXAkJGZsdXNoKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJGFzYXAkJHVzZU11dGF0aW9uT2JzZXJ2ZXIoKSB7XG4gICAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgJCRyc3ZwJGFzYXAkJEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKCQkcnN2cCRhc2FwJCRmbHVzaCk7XG4gICAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgICAgIG9ic2VydmVyLm9ic2VydmUobm9kZSwgeyBjaGFyYWN0ZXJEYXRhOiB0cnVlIH0pO1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIG5vZGUuZGF0YSA9IChpdGVyYXRpb25zID0gKytpdGVyYXRpb25zICUgMik7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIHdlYiB3b3JrZXJcbiAgICBmdW5jdGlvbiAkJHJzdnAkYXNhcCQkdXNlTWVzc2FnZUNoYW5uZWwoKSB7XG4gICAgICB2YXIgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO1xuICAgICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSAkJHJzdnAkYXNhcCQkZmx1c2g7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBjaGFubmVsLnBvcnQyLnBvc3RNZXNzYWdlKDApO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkYXNhcCQkdXNlU2V0VGltZW91dCgpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgc2V0VGltZW91dCgkJHJzdnAkYXNhcCQkZmx1c2gsIDEpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgJCRyc3ZwJGFzYXAkJHF1ZXVlID0gbmV3IEFycmF5KDEwMDApO1xuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJGFzYXAkJGZsdXNoKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkJHJzdnAkYXNhcCQkbGVuOyBpKz0yKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9ICQkcnN2cCRhc2FwJCRxdWV1ZVtpXTtcbiAgICAgICAgdmFyIGFyZyA9ICQkcnN2cCRhc2FwJCRxdWV1ZVtpKzFdO1xuXG4gICAgICAgIGNhbGxiYWNrKGFyZyk7XG5cbiAgICAgICAgJCRyc3ZwJGFzYXAkJHF1ZXVlW2ldID0gdW5kZWZpbmVkO1xuICAgICAgICAkJHJzdnAkYXNhcCQkcXVldWVbaSsxXSA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgJCRyc3ZwJGFzYXAkJGxlbiA9IDA7XG4gICAgfVxuXG4gICAgdmFyICQkcnN2cCRhc2FwJCRzY2hlZHVsZUZsdXNoO1xuXG4gICAgLy8gRGVjaWRlIHdoYXQgYXN5bmMgbWV0aG9kIHRvIHVzZSB0byB0cmlnZ2VyaW5nIHByb2Nlc3Npbmcgb2YgcXVldWVkIGNhbGxiYWNrczpcbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHt9LnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJykge1xuICAgICAgJCRyc3ZwJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSAkJHJzdnAkYXNhcCQkdXNlTmV4dFRpY2soKTtcbiAgICB9IGVsc2UgaWYgKCQkcnN2cCRhc2FwJCRCcm93c2VyTXV0YXRpb25PYnNlcnZlcikge1xuICAgICAgJCRyc3ZwJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSAkJHJzdnAkYXNhcCQkdXNlTXV0YXRpb25PYnNlcnZlcigpO1xuICAgIH0gZWxzZSBpZiAoJCRyc3ZwJGFzYXAkJGlzV29ya2VyKSB7XG4gICAgICAkJHJzdnAkYXNhcCQkc2NoZWR1bGVGbHVzaCA9ICQkcnN2cCRhc2FwJCR1c2VNZXNzYWdlQ2hhbm5lbCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkJHJzdnAkYXNhcCQkc2NoZWR1bGVGbHVzaCA9ICQkcnN2cCRhc2FwJCR1c2VTZXRUaW1lb3V0KCk7XG4gICAgfVxuXG4gICAgLy8gZGVmYXVsdCBhc3luYyBpcyBhc2FwO1xuICAgICQkcnN2cCRjb25maWckJGNvbmZpZy5hc3luYyA9ICQkcnN2cCRhc2FwJCRkZWZhdWx0O1xuXG4gICAgdmFyICQkcnN2cCQkY2FzdCA9ICQkcnN2cCRyZXNvbHZlJCRkZWZhdWx0O1xuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJCRhc3luYyhjYWxsYmFjaywgYXJnKSB7XG4gICAgICAkJHJzdnAkY29uZmlnJCRjb25maWcuYXN5bmMoY2FsbGJhY2ssIGFyZyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJCRvbigpIHtcbiAgICAgICQkcnN2cCRjb25maWckJGNvbmZpZy5vbi5hcHBseSgkJHJzdnAkY29uZmlnJCRjb25maWcsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJCRvZmYoKSB7XG4gICAgICAkJHJzdnAkY29uZmlnJCRjb25maWcub2ZmLmFwcGx5KCQkcnN2cCRjb25maWckJGNvbmZpZywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICAvLyBTZXQgdXAgaW5zdHJ1bWVudGF0aW9uIHRocm91Z2ggYHdpbmRvdy5fX1BST01JU0VfSU5UUlVNRU5UQVRJT05fX2BcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHdpbmRvd1snX19QUk9NSVNFX0lOU1RSVU1FTlRBVElPTl9fJ10gPT09ICdvYmplY3QnKSB7XG4gICAgICB2YXIgJCRyc3ZwJCRjYWxsYmFja3MgPSB3aW5kb3dbJ19fUFJPTUlTRV9JTlNUUlVNRU5UQVRJT05fXyddO1xuICAgICAgJCRyc3ZwJGNvbmZpZyQkY29uZmlndXJlKCdpbnN0cnVtZW50JywgdHJ1ZSk7XG4gICAgICBmb3IgKHZhciAkJHJzdnAkJGV2ZW50TmFtZSBpbiAkJHJzdnAkJGNhbGxiYWNrcykge1xuICAgICAgICBpZiAoJCRyc3ZwJCRjYWxsYmFja3MuaGFzT3duUHJvcGVydHkoJCRyc3ZwJCRldmVudE5hbWUpKSB7XG4gICAgICAgICAgJCRyc3ZwJCRvbigkJHJzdnAkJGV2ZW50TmFtZSwgJCRyc3ZwJCRjYWxsYmFja3NbJCRyc3ZwJCRldmVudE5hbWVdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciByc3ZwJHVtZCQkUlNWUCA9IHtcbiAgICAgICdyYWNlJzogJCRyc3ZwJHJhY2UkJGRlZmF1bHQsXG4gICAgICAnUHJvbWlzZSc6ICQkcnN2cCRwcm9taXNlJCRkZWZhdWx0LFxuICAgICAgJ2FsbFNldHRsZWQnOiAkJHJzdnAkYWxsJHNldHRsZWQkJGRlZmF1bHQsXG4gICAgICAnaGFzaCc6ICQkcnN2cCRoYXNoJCRkZWZhdWx0LFxuICAgICAgJ2hhc2hTZXR0bGVkJzogJCRyc3ZwJGhhc2gkc2V0dGxlZCQkZGVmYXVsdCxcbiAgICAgICdkZW5vZGVpZnknOiAkJHJzdnAkbm9kZSQkZGVmYXVsdCxcbiAgICAgICdvbic6ICQkcnN2cCQkb24sXG4gICAgICAnb2ZmJzogJCRyc3ZwJCRvZmYsXG4gICAgICAnbWFwJzogJCRyc3ZwJG1hcCQkZGVmYXVsdCxcbiAgICAgICdmaWx0ZXInOiAkJHJzdnAkZmlsdGVyJCRkZWZhdWx0LFxuICAgICAgJ3Jlc29sdmUnOiAkJHJzdnAkcmVzb2x2ZSQkZGVmYXVsdCxcbiAgICAgICdyZWplY3QnOiAkJHJzdnAkcmVqZWN0JCRkZWZhdWx0LFxuICAgICAgJ2FsbCc6ICQkcnN2cCRhbGwkJGRlZmF1bHQsXG4gICAgICAncmV0aHJvdyc6ICQkcnN2cCRyZXRocm93JCRkZWZhdWx0LFxuICAgICAgJ2RlZmVyJzogJCRyc3ZwJGRlZmVyJCRkZWZhdWx0LFxuICAgICAgJ0V2ZW50VGFyZ2V0JzogJCRyc3ZwJGV2ZW50cyQkZGVmYXVsdCxcbiAgICAgICdjb25maWd1cmUnOiAkJHJzdnAkY29uZmlnJCRjb25maWd1cmUsXG4gICAgICAnYXN5bmMnOiAkJHJzdnAkJGFzeW5jXG4gICAgfTtcblxuICAgIC8qIGdsb2JhbCBkZWZpbmU6dHJ1ZSBtb2R1bGU6dHJ1ZSB3aW5kb3c6IHRydWUgKi9cbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiByc3ZwJHVtZCQkUlNWUDsgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgbW9kdWxlLmV4cG9ydHMgPSByc3ZwJHVtZCQkUlNWUDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpc1snUlNWUCddID0gcnN2cCR1bWQkJFJTVlA7XG4gICAgfVxufSkuY2FsbCh0aGlzKTtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKCdfcHJvY2VzcycpKSJdfQ==
