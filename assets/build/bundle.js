(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./js":[function(require,module,exports){
require('./utils/ThreeConsole');

var routing = require('./routing');
var ui = require('./ui');

routing.start(
	require('./Poem'),
	require('../manifests')
);
},{"../manifests":"/Users/gregtatum/Google Drive/greg-sites/sandbox/manifests/index.js","./Poem":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/Poem.js","./routing":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/routing.js","./ui":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/ui/index.js","./utils/ThreeConsole":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/ThreeConsole.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/Poem.js":[function(require,module,exports){
var Camera = require('./components/cameras/Camera');
var Stats = require('./utils/Stats');
var EventDispatcher = require('./utils/EventDispatcher');
var Clock = require('./utils/Clock');
var renderer = require('./renderer');

function createFog( config, cameraPositionZ ) {
	
	var fog = _.extend({
		color : 0x222222,
		nearFactor : 0.5,
		farFactor : 2
	}, config );
	
	return new THREE.Fog(
		fog.color,
		cameraPositionZ * fog.nearFactor,
		cameraPositionZ * fog.farFactor
	);
	
}

var Poem = function( level, slug ) {

	this.ratio = _.isNumber( window.devicePixelRatio ) ? window.devicePixelRatio : 1;
	this.slug = slug;
	
	this.controls = undefined;
	this.scene = new THREE.Scene();
	this.requestedFrame = undefined;
	this.started = false;
	this.$div = $("#container");

	this.clock = new Clock();
	this.camera = new Camera( this, level.config.camera || {} );
	this.scene.fog = createFog( level.config.fog, this.camera.object.position.z );

	this.renderer = renderer( this, level.config.renderer );
	this.canvas = $("canvas")[0];
	
	this.parseLevel( level );
	
	this.dispatch({
		type: 'levelParsed'
	});
	
	this.statsEnabled = false;
	this.addStats();
	
	this.start();
	
};

module.exports = Poem;

Poem.prototype = {
	
	parseLevel : function( level ) {
		_.each( level.objects, function loadComponent( value, key ) {
			if(_.isObject( value )) {
				this[ key ] = new value.object( this, value.properties );
			} else {
				this[ key ] = value;
			}
			
		}, this);
	},	
	
	addStats : function() {
		
		if( this.statsEnabled ) {
			this.stats = new Stats();
			this.stats.domElement.style.position = 'absolute';
			this.stats.domElement.style.top = '0px';
			$("#container").append( this.stats.domElement );
			
			this.on('update', function() {
				this.stats.update();
			}.bind(this));
		}
		
	},
		
	
	start : function() {
		if( !this.started ) {
			
			this.loop();
		}
		this.started = true;
	},
	
	loop : function() {

		this.requestedFrame = requestAnimationFrame( this.loop.bind(this) );
		this.update();

	},
	
	pause : function() {
		
		window.cancelAnimationFrame( this.requestedFrame );
		this.started = false;
		
	},
			
	update : function() {
		
		var dt = this.clock.getDelta();
		
		this.dispatch({
			type: "update",
			dt: dt,
			time: this.clock.time,
			unitDt: dt * 0.016666667
		});

		this.dispatch({
			type: "draw"
		});
		
		
		

	},
	
	destroy : function() {
		
		window.cancelAnimationFrame( this.requestedFrame );
		
		this.dispatch({
			type: "destroy"
		});
	}
};

EventDispatcher.prototype.apply( Poem.prototype );

},{"./components/cameras/Camera":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/cameras/Camera.js","./renderer":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/renderer.js","./utils/Clock":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/Clock.js","./utils/EventDispatcher":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/EventDispatcher.js","./utils/Stats":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/Stats.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/Info.js":[function(require,module,exports){
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
},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/Stars.js":[function(require,module,exports){
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
},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/ambiance/Clouds/index.js":[function(require,module,exports){
var glslify = require("glslify");
var createShader = require("three-glslify")(THREE);

function setupTexture(mesh, scene) {
    var img = new Image();
    var texture = new THREE.Texture(img);
    img.src = "assets/images/cloud1024.png";
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    $(img).on("load", function() {
        texture.needsUpdate = true;
        scene.add(mesh);
    });

    return texture;
}

var Clouds = function(poem, properties) {
    var config = _.extend({
        width: 500,
        offset: new THREE.Vector2(1, 1),
        color: new THREE.Vector4(0.5, 1, 0.7, 1),
        height: -200,
        rotation: Math.PI / 2
    }, properties);

    var geometry = new THREE.PlaneGeometry(config.width, config.width);
    var shader = createShader(require("glslify/simple-adapter.js")("\n#define GLSLIFY 1\n\nvarying vec2 vUv;\nvoid main() {\n  vUv = uv;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}", "\n#define GLSLIFY 1\n\nuniform float time;\nuniform vec4 color;\nuniform vec2 offset;\nuniform sampler2D texture;\nvarying vec2 vUv;\nvoid main() {\n  vec4 texel = texture2D(texture, vUv * 0.1 + (offset + time * 0.00001) * offset) + texture2D(texture, vUv * 0.22 + (offset + time * 0.0000055) * offset);\n  float edges = 0.5 - length(vUv - 0.5);\n  gl_FragColor = color * edges * vec4(1.0, 1.0, 1.0, texel.w * texel.w * 2.5);\n}", [{"name":"time","type":"float"},{"name":"color","type":"vec4"},{"name":"offset","type":"vec2"},{"name":"texture","type":"sampler2D"}], []));
    shader.side = THREE.BackSide;

    shader.uniforms = {
        time: {
            type: "f",
            value: 0
        },

        texture: {
            type: "t",
            value: null
        },

        offset: {
            type: "v2",
            value: config.offset
        },

        color: {
            type: "v4",
            value: config.color
        }
    };

    var material = new THREE.ShaderMaterial(shader);
    material.transparent = true;
    material.blending = THREE.AdditiveBlending;
    material.side = THREE.DoubleSide;
    material.depthTest = false;
    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = config.rotation;
    mesh.position.y = config.height;
    mesh.scale.multiplyScalar(10);
    shader.uniforms.texture.value = setupTexture(mesh, poem.scene);

    poem.on("update", function(e) {
        var cameraPosition = poem.camera.object.position;
        shader.uniforms.time.value = e.time;
        mesh.position.set(cameraPosition.x, mesh.position.y, cameraPosition.z);
    });
};

module.exports = Clouds;
},{"glslify":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/glslify/browser.js","glslify/simple-adapter.js":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/glslify/simple-adapter.js","three-glslify":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/three-glslify/index.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/cameras/Camera.js":[function(require,module,exports){
var Camera = function( poem, properties ) {
	
	this.poem = poem;
		
	this.object = new THREE.PerspectiveCamera(
		properties.fov || 50,					// fov
		window.innerWidth / window.innerHeight,	// aspect ratio
		properties.near || 3,					// near frustum
		properties.far || 10000					// far frustum
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
},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/cameras/ConstantMove.js":[function(require,module,exports){
function updateCamera( position, movement ) {

	var changeMovement = new THREE.Vector3();

	return function(e) {
		
		changeMovement
			.copy( movement )
			.multiplyScalar(e.unitDt);
		
		position.add( changeMovement );
		
	};
}

var ConstantMove = function( poem, properties ) {
	
	var config = _.extend({
		x : 0,
		y : 0,
		z : 0
	}, properties);
	
	var movement = new THREE.Vector3( config.x, config.y, config.z );
	
	poem.on('update', updateCamera( poem.camera.object.position, movement));
};

module.exports = ConstantMove;
},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/cameras/Controls.js":[function(require,module,exports){
var OrbitControls = require('../../vendor/OrbitControls');

var Controls = function( poem, properties ) {
	
	this.poem = poem;
	this.properties = properties;

	this.controls = new OrbitControls( this.poem.camera.object, this.poem.canvas );
	
	_.extend( this.controls, properties );
	
	this.poem.on( 'update', this.controls.update.bind( this.controls ) );
	
};

module.exports = Controls;

},{"../../vendor/OrbitControls":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/vendor/OrbitControls.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/cameras/Orientation.js":[function(require,module,exports){
var OrbitControls = require('../../vendor/OrbitControls');
var DeviceOrientationControls = require('../../vendor/DeviceOrientationControls');
var _e;

$(window).one( 'deviceorientation', function( e ) {
	_e = e;
});


var Orientation = function( poem ) {
	
	this.poem = poem;
	this.camera = this.poem.camera.object;
	
	this.controls = new OrbitControls( this.camera, this.poem.canvas );
	this.controls.rotateUp(Math.PI / 4);
	this.controls.target.set(
		this.camera.position.x + 0.1,
		this.camera.position.y,
		this.camera.position.z
	);
	this.controls.noZoom = true;
	this.controls.noPan = true;

	this.deviceOrientationHandler = this.setOrientationControls.bind(this);

	$(window).on( 'deviceorientation', this.deviceOrientationHandler );
	
	this.poem.on( 'update', this.update.bind(this) );
	this.poem.on( 'destroy', this.destroy.bind(this) );
	
	if( _e ) this.setOrientationControls( _e );
	
};

module.exports = Orientation;

Orientation.prototype = {

	setOrientationControls : function( e ) {
		// if( !e.originalEvent.alpha ) {
		// 	return;
		// }

		this.controls = new DeviceOrientationControls( this.camera, true );
		this.controls.connect();
		this.controls.update();

		$(window).off( 'deviceorientation', this.deviceOrientationHandler );
	},
	
	update : function( e ) {
		this.controls.update();
	},
	
	destroy : function( e ) {
		$(window).off( 'deviceorientation', this.deviceOrientationHandler );
	}
	
};
},{"../../vendor/DeviceOrientationControls":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/vendor/DeviceOrientationControls.js","../../vendor/OrbitControls":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/vendor/OrbitControls.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/cameras/RotateAroundOrigin.js":[function(require,module,exports){
var RotateAroundOrigin = function( poem ) {
	
	var camera = poem.camera.object;
	var speed = 0.00005;
	var baseY = camera.position.y;
	var baseZ = camera.position.z / 2;
	
	poem.on('update', function( e ) {
		
		poem.grid.grid.rotation.y += e.dt * speed;
		if( poem.pointcloud.object ) {
			poem.pointcloud.object.rotation.y += e.dt * speed;
		}
		
		camera.position.y = baseY + Math.sin( e.time * speed * 10 ) * 200;
		camera.position.z = baseY + Math.sin( e.time * speed * 10 ) * baseZ;
		
		
	});
	
};

module.exports = RotateAroundOrigin;

RotateAroundOrigin.prototype = {

};
},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/cameras/Swivel.js":[function(require,module,exports){
function mouseMove( prevXY, quaternion, speedX, speedY ) {
	
	var axisX = new THREE.Vector3(1,0,0);
	var axisY = new THREE.Vector3(0,1,0);
	
	var q1 = new THREE.Quaternion();
	var q2 = new THREE.Quaternion();
	
	var rotationX = 0;
	var rotationY = 0;
	
	return function( e ) {
		
		e.preventDefault();
			
		var x = e.pageX;
		var y = e.pageY;
		
		var offsetX = prevXY.x - x;
		var offsetY = prevXY.y - y;
			
		rotationY += offsetX * speedX;
		rotationX += offsetY * speedY;
		
		rotationX = Math.min( rotationX, Math.PI * 0.45 );
		rotationX = Math.max( rotationX, -Math.PI * 0.45 );
		
		q1.setFromAxisAngle( axisY, rotationY );
		q2.setFromAxisAngle( axisX, rotationX );
		quaternion.multiplyQuaternions( q1, q2 );
		
		
		prevXY.x = x;
		prevXY.y = y;
		
	};
}

function mouseUp( $canvas, handlers ) {

	return function() {
		$canvas.off('mouseleave', handlers.mouseUp);
		$canvas.off('mouseup', handlers.mouseUp);
		$canvas.off('mousemove', handlers.mouseMove);
	};
}

function mouseDown( $canvas, handlers, prevXY ) {

	return function( e ) {
		e.preventDefault();
		
		prevXY.x = e.pageX;
		prevXY.y = e.pageY;
		
		$canvas.on('mouseleave', handlers.mouseUp );
		$canvas.on('mouseup', handlers.mouseUp );
		$canvas.on('mousemove', handlers.mouseMove );
	};
}

function stopHandlers( $canvas, handlers ) {

	return function() {
		$canvas.off('mouseleave', handlers.mouseUp);
		$canvas.off('mouseup', handlers.mouseUp);
		$canvas.off('mousemove', handlers.mouseMove);
		$canvas.off('mousedown', handlers.mouseDown);
	};
}

function startMouseHandlers( canvas, cameraObj, poem, speedX, speedY ) {
	
	var prevXY = {x:0,y:0};
	var $canvas = $(canvas);
	var handlers = {};	
	var quaternion = new THREE.Quaternion().copy( cameraObj.quaternion );
	
	handlers.mouseMove = mouseMove( prevXY, quaternion, speedX, speedY );
	handlers.mouseUp = mouseUp( $canvas, handlers );
	handlers.mouseDown = mouseDown( $canvas, handlers, prevXY );
	
	$canvas.on('mousedown', handlers.mouseDown);
	poem.on('destroy', stopHandlers( $canvas, handlers ) );
	
	return quaternion;
}

function updateCamera( cameraQuaternion, targetQuaternion, unitI ) {
	
	return function( e ) {
		
		cameraQuaternion.slerp( targetQuaternion, unitI * e.unitDt );
		
	};
}

var Swivel = function( poem, properties ) {
	
	var config = _.extend({
		easing : 0.5,
		speedX : 0.002,
		speedY : 0.002
	}, properties);
	
	var targetQuaternion = startMouseHandlers(
		poem.canvas,
		poem.camera.object,
		poem,
		config.speedX, config.speedY
	);
	
	poem.on('update', updateCamera( poem.camera.object.quaternion, targetQuaternion, config.easing ) );
	
};

module.exports = Swivel;
},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/lights/TrackCameraLights.js":[function(require,module,exports){
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
},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/utils/Stats.js":[function(require,module,exports){
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
},{"../../vendor/Stats":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/vendor/Stats.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/Earth.js":[function(require,module,exports){
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
},{"../utils/loadTexture":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/loadTexture.js","../utils/random":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/random.js","rsvp":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/rsvp/dist/rsvp.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/EndlessTerrain/index.js":[function(require,module,exports){
var glslify = require("glslify");
var createShader = require("three-glslify")(THREE);

function createGeometry(width, segments) {
    var geometry = new THREE.PlaneGeometry(width, width, segments, segments);
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI * 0.5));
    return geometry;
}

function createTexture(mesh, scene) {
    var img = new Image();
    var texture = new THREE.Texture(img);
    img.src = "assets/images/cloud1024.png";
    texture.wrapT = THREE.RepeatWrapping;
    texture.wrapS = THREE.RepeatWrapping;

    $(img).on("load", function() {
        texture.needsUpdate = true;
        scene.add(mesh);
    });

    return texture;
}

function updateShader() {}

function createMeshGrid(material, width, gridLength, totalPolygonDensity) {
    var geometry = createGeometry(width / gridLength, Math.floor(totalPolygonDensity / gridLength));
    var meshGrid = new THREE.Object3D();
    var mesh;
    var step = width / gridLength;

    for (var i = 0; i < gridLength; i++) {
        for (var j = 0; j < gridLength; j++) {
            mesh = new THREE.Mesh(geometry, material);
            meshGrid.add(mesh);
            mesh.position.set(i * step, 0, j * step);
        }
    }

    return meshGrid;
}

function updateModuloMeshGrid(cameraPosition, meshes, width) {
    var il = meshes.length;
    var halfWidth = width / 2;

    return function() {
        var position;

        for (var i = 0; i < il; i++) {
            position = meshes[i].position;
            position.set((position.x - cameraPosition.x + halfWidth) % width + cameraPosition.x - halfWidth, position.y, (position.z - cameraPosition.z + halfWidth) % width + cameraPosition.z - halfWidth);
        }
    };
}

var EndlessTerrain = function(poem, properties) {
    var config = _.extend({
        width: 4000,
        gridLength: 16,
        totalPolygonDensity: 1024,
        positionY: 0
    }, properties);

    var shader = createShader(require("glslify/simple-adapter.js")("\n#define GLSLIFY 1\n\nuniform sampler2D terrain;\nuniform float heightScale;\nuniform float width;\nvarying float height;\nvarying vec2 vUv;\nvarying float vCameraDistance;\nvoid main() {\n  vec4 modelPosition = modelMatrix * vec4(position, 1.0);\n  vUv = vec2(modelPosition.x, modelPosition.z) / width;\n  height = texture2D(terrain, vUv * 0.3).w;\n  vCameraDistance = distance(modelPosition.xyz, cameraPosition);\n  vec4 modifiedPosition = vec4(position.x, position.y + height * heightScale, position.z, 1.0);\n  gl_Position = projectionMatrix * modelViewMatrix * modifiedPosition;\n}", "\n#define GLSLIFY 1\n\nvec3 a_x_hsv2rgb(vec3 c) {\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\nuniform float width;\nvarying float height;\nvarying vec2 vUv;\nvarying float vCameraDistance;\nvoid main() {\n  float hueX = abs(0.5 - fract(vUv.x * 0.8)) * 2.0;\n  float hueY = abs(0.5 - fract(vUv.y * 0.63)) * 2.0;\n  gl_FragColor = vec4(a_x_hsv2rgb(vec3((hueX + hueY) * 0.2 + 0.3, mix(height, 0.5, 0.8), mix(height, 1.2, 0.35))), 1.0);\n  float fogFactor = smoothstep(0.0, 1.0, vCameraDistance / width);\n  vec3 fogColor = vec3(0.14, 0.14, 0.14);\n  gl_FragColor = mix(gl_FragColor, vec4(fogColor, gl_FragColor.w), fogFactor);\n}", [{"name":"terrain","type":"sampler2D"},{"name":"heightScale","type":"float"},{"name":"width","type":"float"},{"name":"width","type":"float"}], []));
    var material = new THREE.ShaderMaterial(shader);
    material.side = THREE.DoubleSide;
    var meshGrid = createMeshGrid(material, config.width, config.gridLength, config.totalPolygonDensity);
    meshGrid.position.y = config.positionY;
    shader.uniforms.terrain.value = createTexture(meshGrid, poem.scene);
    shader.uniforms.heightScale.value = config.width / 20;
    shader.uniforms.width.value = config.width / 2;
    poem.on("update", updateModuloMeshGrid(poem.camera.object.position, meshGrid.children, config.width));
};

module.exports = EndlessTerrain;
},{"glslify":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/glslify/browser.js","glslify/simple-adapter.js":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/glslify/simple-adapter.js","three-glslify":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/three-glslify/index.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/Grid.js":[function(require,module,exports){
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
},{"../utils/random":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/random.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/MeshGroupBoxDemo/MeshGroup.js":[function(require,module,exports){
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
			this.buildMaterial();
			
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
		
		var i, il, j, jl;
		
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
},{"../../utils/calculateSquaredTextureWidth":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/calculateSquaredTextureWidth.js","../../utils/loadText":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/loadText.js","../../utils/loadTexture":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/loadTexture.js","rsvp":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/rsvp/dist/rsvp.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/MeshGroupBoxDemo/index.js":[function(require,module,exports){
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
		var box;
		
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
			
			box.updateMatrix();
			
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
},{"../../utils/random":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/random.js","./MeshGroup":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/MeshGroupBoxDemo/MeshGroup.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/SineGravityCloud.js":[function(require,module,exports){
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
		
	_.extend( this, properties );
	
	
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
			this.positions[ v * 3 + 1 ] = Math.sin( x * Math.PI * 10 ) * this.radius;
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
		
		this.object.scale.multiplyScalar( 1.5 );
		
	
	
		this.poem.on( 'update', this.update.bind(this) );
		
	},
	
	error : function( error ) {
		throw new Error("Could not load assets for the SineGravityCloud", error);
	},
	
	update : function(e) {
		
		var unitTimeX = Math.cos( e.time * 0.00005 * 1 );
		var unitTimeY = Math.cos( e.time * 0.00005 * 2 );
		var unitTimeZ = Math.cos( e.time * 0.00005 * 3 );
		
		var d2;
	
		for( var i = 0; i < this.count; i++ ) {
			
			d2 =this.positions[ i * 3 + 0 ] * this.positions[ i * 3 + 0 ] +
			    this.positions[ i * 3 + 1 ] * this.positions[ i * 3 + 1 ] +
			    this.positions[ i * 3 + 2 ] * this.positions[ i * 3 + 2 ];

			this.velocity[ i * 3 + 0 ] -= unitTimeX * this.positions[ i * 3 + 0 ] / d2;
			this.velocity[ i * 3 + 1 ] -= unitTimeY * this.positions[ i * 3 + 1 ] / d2;
			this.velocity[ i * 3 + 2 ] -= unitTimeZ * this.positions[ i * 3 + 2 ] / d2;

			this.positions[ i * 3 + 0 ] += unitTimeX * this.velocity[ i * 3 + 0 ];
			this.positions[ i * 3 + 1 ] += unitTimeY * this.velocity[ i * 3 + 1 ];
			this.positions[ i * 3 + 2 ] += unitTimeZ * this.velocity[ i * 3 + 2 ];
			
		}
		
		this.geometry.attributes.position.needsUpdate = true;
		
	}
	
};
},{"../utils/loadText":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/loadText.js","../utils/loadTexture":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/loadTexture.js","../utils/random":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/random.js","rsvp":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/rsvp/dist/rsvp.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/texturePositionalMatrices/index.js":[function(require,module,exports){
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
		
		this.matrices = [];
		this.matricesData = new Float32Array( this.matricesTextureSize * this.matricesTextureSize * 4 );
		
		var rotateM = new THREE.Matrix4();
		var translateM = new THREE.Matrix4();
		var scaleM = new THREE.Matrix4();
		var euler = new THREE.Euler();
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
		
			for( var i = 0; i < this.count ; i++ ) {
				
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
		};
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
 
};
},{"../../utils/loadText":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/loadText.js","../../utils/loadTexture":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/loadTexture.js","../../utils/random":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/random.js","../../utils/simplex2":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/simplex2.js","rsvp":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/rsvp/dist/rsvp.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/uniformPositionalMatrices/index.js":[function(require,module,exports){
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
		this.transformIndices = new Float32Array( this.count );

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
},{"../../utils/loadText":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/loadText.js","../../utils/loadTexture":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/loadTexture.js","../../utils/random":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/random.js","rsvp":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/rsvp/dist/rsvp.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/levelLoader.js":[function(require,module,exports){
var Poem = null;
var levels = null;
var EventDispatcher = require('./utils/EventDispatcher');

var currentLevel = null;
var currentPoem = null;
var titleHideTimeout = null;

function showTitles() {
	
	clearTimeout( titleHideTimeout );
	
	$('#title')
		.removeClass('transform-transition')
		.addClass('hide')
		.addClass('transform-transition')
		.show();
	
	setTimeout(function() {
		$('#title').removeClass('hide');
	}, 1);
	
	$('.score').css('opacity', 0);
	
}

function hideTitles() {

	$('.score').css('opacity', 1);
	
	if( $('#title:visible').length > 0 ) {		
	
		$('#title')
			.addClass('transform-transition')
			.addClass('hide');

		titleHideTimeout = setTimeout(function() {
	
			$('#title').hide();
	
		}, 1000);
	}
			
	
}

var levelLoader = {
	
	init : function( PoemClass, levelsObject ) {
		Poem = PoemClass;
		levels = levelsObject;
	},
	
	load : function( slug ) {
		
		if( !_.isObject(levels[slug]) ) {
			return false;
		}
		
		if(currentPoem) currentPoem.destroy();
		
		currentLevel = levels[slug];
		currentPoem = new Poem( currentLevel, slug );
		
		if( slug === "titles" ) {
			showTitles();
		} else {
			hideTitles();
		}
		
		this.dispatch({
			type: "newLevel",
			level: currentLevel,
			poem: currentPoem
		});
		
		window.poem = currentPoem;
	
		return true;
	}
	
};

EventDispatcher.prototype.apply( levelLoader );

module.exports = levelLoader;

},{"./utils/EventDispatcher":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/EventDispatcher.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/postprocessing/BloomPass.js":[function(require,module,exports){
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.BloomPass = function ( strength, kernelSize, sigma, resolution ) {

	strength = ( strength !== undefined ) ? strength : 1;
	kernelSize = ( kernelSize !== undefined ) ? kernelSize : 25;
	sigma = ( sigma !== undefined ) ? sigma : 4.0;
	resolution = ( resolution !== undefined ) ? resolution : 256;

	// render targets

	var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };

	this.renderTargetX = new THREE.WebGLRenderTarget( resolution, resolution, pars );
	this.renderTargetY = new THREE.WebGLRenderTarget( resolution, resolution, pars );

	// copy material

	if ( THREE.CopyShader === undefined )
		console.error( "THREE.BloomPass relies on THREE.CopyShader" );

	var copyShader = THREE.CopyShader;

	this.copyUniforms = THREE.UniformsUtils.clone( copyShader.uniforms );

	this.copyUniforms[ "opacity" ].value = strength;

	this.materialCopy = new THREE.ShaderMaterial( {

		uniforms: this.copyUniforms,
		vertexShader: copyShader.vertexShader,
		fragmentShader: copyShader.fragmentShader,
		blending: THREE.AdditiveBlending,
		transparent: true

	} );

	// convolution material

	if ( THREE.ConvolutionShader === undefined )
		console.error( "THREE.BloomPass relies on THREE.ConvolutionShader" );

	var convolutionShader = THREE.ConvolutionShader;

	this.convolutionUniforms = THREE.UniformsUtils.clone( convolutionShader.uniforms );

	this.convolutionUniforms[ "uImageIncrement" ].value = THREE.BloomPass.blurx;
	this.convolutionUniforms[ "cKernel" ].value = THREE.ConvolutionShader.buildKernel( sigma );

	this.materialConvolution = new THREE.ShaderMaterial( {

		uniforms: this.convolutionUniforms,
		vertexShader:  convolutionShader.vertexShader,
		fragmentShader: convolutionShader.fragmentShader,
		defines: {
			"KERNEL_SIZE_FLOAT": kernelSize.toFixed( 1 ),
			"KERNEL_SIZE_INT": kernelSize.toFixed( 0 )
		}

	} );

	this.enabled = true;
	this.needsSwap = false;
	this.clear = false;


	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.BloomPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		if ( maskActive ) renderer.context.disable( renderer.context.STENCIL_TEST );

		// Render quad with blured scene into texture (convolution pass 1)

		this.quad.material = this.materialConvolution;

		this.convolutionUniforms[ "tDiffuse" ].value = readBuffer;
		this.convolutionUniforms[ "uImageIncrement" ].value = THREE.BloomPass.blurX;

		renderer.render( this.scene, this.camera, this.renderTargetX, true );


		// Render quad with blured scene into texture (convolution pass 2)

		this.convolutionUniforms[ "tDiffuse" ].value = this.renderTargetX;
		this.convolutionUniforms[ "uImageIncrement" ].value = THREE.BloomPass.blurY;

		renderer.render( this.scene, this.camera, this.renderTargetY, true );

		// Render original scene with superimposed blur to texture

		this.quad.material = this.materialCopy;

		this.copyUniforms[ "tDiffuse" ].value = this.renderTargetY;

		if ( maskActive ) renderer.context.enable( renderer.context.STENCIL_TEST );

		renderer.render( this.scene, this.camera, readBuffer, this.clear );

	}

};

THREE.BloomPass.blurX = new THREE.Vector2( 0.001953125, 0.0 );
THREE.BloomPass.blurY = new THREE.Vector2( 0.0, 0.001953125 );

},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/postprocessing/EffectComposer.js":[function(require,module,exports){
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.EffectComposer = function ( renderer, renderTarget ) {

	this.renderer = renderer;

	if ( renderTarget === undefined ) {

		var width = window.innerWidth || 1;
		var height = window.innerHeight || 1;
		var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };

		renderTarget = new THREE.WebGLRenderTarget( width, height, parameters );

	}

	this.renderTarget1 = renderTarget;
	this.renderTarget2 = renderTarget.clone();

	this.writeBuffer = this.renderTarget1;
	this.readBuffer = this.renderTarget2;

	this.passes = [];

	if ( THREE.CopyShader === undefined )
		console.error( "THREE.EffectComposer relies on THREE.CopyShader" );

	this.copyPass = new THREE.ShaderPass( THREE.CopyShader );

};

THREE.EffectComposer.prototype = {

	swapBuffers: function() {

		var tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;

	},

	addPass: function ( pass ) {

		this.passes.push( pass );

	},

	insertPass: function ( pass, index ) {

		this.passes.splice( index, 0, pass );

	},

	render: function ( delta ) {

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

		var maskActive = false;

		var pass, i, il = this.passes.length;

		for ( i = 0; i < il; i ++ ) {

			pass = this.passes[ i ];

			if ( !pass.enabled ) continue;

			pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );

			if ( pass.needsSwap ) {

				if ( maskActive ) {

					var context = this.renderer.context;

					context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

					this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );

					context.stencilFunc( context.EQUAL, 1, 0xffffffff );

				}

				this.swapBuffers();

			}

			if ( pass instanceof THREE.MaskPass ) {

				maskActive = true;

			} else if ( pass instanceof THREE.ClearMaskPass ) {

				maskActive = false;

			}

		}

	},

	reset: function ( renderTarget ) {

		if ( renderTarget === undefined ) {

			renderTarget = this.renderTarget1.clone();

			renderTarget.width = window.innerWidth;
			renderTarget.height = window.innerHeight;

		}

		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

	},

	setSize: function ( width, height ) {

		var renderTarget = this.renderTarget1.clone();

		renderTarget.width = width;
		renderTarget.height = height;

		this.reset( renderTarget );

	}

};

},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/postprocessing/FilmPass.js":[function(require,module,exports){
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.FilmPass = function ( noiseIntensity, scanlinesIntensity, scanlinesCount, grayscale ) {

	if ( THREE.FilmShader === undefined )
		console.error( "THREE.FilmPass relies on THREE.FilmShader" );

	var shader = THREE.FilmShader;

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.material = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	if ( grayscale !== undefined )	this.uniforms.grayscale.value = grayscale;
	if ( noiseIntensity !== undefined ) this.uniforms.nIntensity.value = noiseIntensity;
	if ( scanlinesIntensity !== undefined ) this.uniforms.sIntensity.value = scanlinesIntensity;
	if ( scanlinesCount !== undefined ) this.uniforms.sCount.value = scanlinesCount;

	this.enabled = true;
	this.renderToScreen = false;
	this.needsSwap = true;


	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.FilmPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		this.uniforms[ "tDiffuse" ].value = readBuffer;
		this.uniforms[ "time" ].value += delta;

		this.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, false );

		}

	}

};

},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/postprocessing/MaskPass.js":[function(require,module,exports){
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.MaskPass = function ( scene, camera ) {

	this.scene = scene;
	this.camera = camera;

	this.enabled = true;
	this.clear = true;
	this.needsSwap = false;

	this.inverse = false;

};

THREE.MaskPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		var context = renderer.context;

		// don't update color or depth

		context.colorMask( false, false, false, false );
		context.depthMask( false );

		// set up stencil

		var writeValue, clearValue;

		if ( this.inverse ) {

			writeValue = 0;
			clearValue = 1;

		} else {

			writeValue = 1;
			clearValue = 0;

		}

		context.enable( context.STENCIL_TEST );
		context.stencilOp( context.REPLACE, context.REPLACE, context.REPLACE );
		context.stencilFunc( context.ALWAYS, writeValue, 0xffffffff );
		context.clearStencil( clearValue );

		// draw into the stencil buffer

		renderer.render( this.scene, this.camera, readBuffer, this.clear );
		renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		// re-enable update of color and depth

		context.colorMask( true, true, true, true );
		context.depthMask( true );

		// only render where stencil is set to 1

		context.stencilFunc( context.EQUAL, 1, 0xffffffff );  // draw if == 1
		context.stencilOp( context.KEEP, context.KEEP, context.KEEP );

	}

};


THREE.ClearMaskPass = function () {

	this.enabled = true;

};

THREE.ClearMaskPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		var context = renderer.context;

		context.disable( context.STENCIL_TEST );

	}

};

},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/postprocessing/RenderPass.js":[function(require,module,exports){
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

	this.scene = scene;
	this.camera = camera;

	this.overrideMaterial = overrideMaterial;

	this.clearColor = clearColor;
	this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 1;

	this.oldClearColor = new THREE.Color();
	this.oldClearAlpha = 1;

	this.enabled = true;
	this.clear = true;
	this.needsSwap = false;

};

THREE.RenderPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		this.scene.overrideMaterial = this.overrideMaterial;

		if ( this.clearColor ) {

			this.oldClearColor.copy( renderer.getClearColor() );
			this.oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}

		renderer.render( this.scene, this.camera, readBuffer, this.clear );

		if ( this.clearColor ) {

			renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );

		}

		this.scene.overrideMaterial = null;

	}

};

},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/postprocessing/ShaderPass.js":[function(require,module,exports){
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ShaderPass = function ( shader, textureID ) {

	this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.material = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.renderToScreen = false;

	this.enabled = true;
	this.needsSwap = true;
	this.clear = false;


	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.ShaderPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer;

		}

		this.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		}

	}

};

},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/postprocessing/chromaticAberration/index.js":[function(require,module,exports){
var glslify = require("glslify");
var createShader = require("three-glslify")(THREE);
var shader = createShader(require("glslify/simple-adapter.js")("\n#define GLSLIFY 1\n\nvarying vec2 vUv;\nvoid main() {\n  vUv = uv;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}", "\n#define GLSLIFY 1\n\nhighp float a_x_random(vec2 co) {\n  highp float a = 12.9898;\n  highp float b = 78.233;\n  highp float c = 43758.5453;\n  highp float dt = dot(co.xy, vec2(a, b));\n  highp float sn = mod(dt, 3.14);\n  return fract(sin(sn) * c);\n}\nuniform float opacity;\nuniform sampler2D tDiffuse;\nvarying vec2 vUv;\nvoid main() {\n  vec2 unitI_ToSide = (vUv * 2.0 - 1.0);\n  unitI_ToSide = pow(unitI_ToSide, vec2(3.0, 5.0)) * a_x_random(vUv) * -0.01;\n  vec4 texel = texture2D(tDiffuse, vUv);\n  vec4 smallshift = texture2D(tDiffuse, vUv + unitI_ToSide * 0.5);\n  vec4 bigshift = texture2D(tDiffuse, vUv + unitI_ToSide);\n  gl_FragColor = opacity * vec4(bigshift.x, texel.y, smallshift.z, texel.w);\n}", [{"name":"opacity","type":"float"},{"name":"tDiffuse","type":"sampler2D"}], []));
shader.uniforms.opacity.value = 1;
module.exports = shader;
},{"glslify":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/glslify/browser.js","glslify/simple-adapter.js":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/glslify/simple-adapter.js","three-glslify":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/three-glslify/index.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/postprocessing/index.js":[function(require,module,exports){
require('./EffectComposer');
require('./MaskPass');
require('./BloomPass');
require('./RenderPass');
require('./ShaderPass');
require('./FilmPass');
},{"./BloomPass":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/postprocessing/BloomPass.js","./EffectComposer":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/postprocessing/EffectComposer.js","./FilmPass":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/postprocessing/FilmPass.js","./MaskPass":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/postprocessing/MaskPass.js","./RenderPass":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/postprocessing/RenderPass.js","./ShaderPass":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/postprocessing/ShaderPass.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/renderer.js":[function(require,module,exports){
require('./postprocessing');
require('./shaders/CopyShader');
require('./shaders/FilmShader');
require('./shaders/ConvolutionShader');
require('./shaders/FXAAShader');
var chromaticAberrationShader = require('./postprocessing/chromaticAberration');
var StereoEffect = require('./vendor/StereoEffect');

//Singletons
var _ratio = _.isNumber( window.devicePixelRatio ) ? window.devicePixelRatio : 1;
var _webGLRenderer = addRenderer();
var _renderer = _webGLRenderer;
var _rendererPass = new THREE.RenderPass();
var _composer = addEffectsComposer( _rendererPass );

function addEffectsComposer( renderPass ) {
	
	var bloom = new THREE.BloomPass( 1.5, 15, 16, 512 );
	var copy = new THREE.ShaderPass( THREE.CopyShader );
	var antialias = new THREE.ShaderPass( THREE.FXAAShader );
	var chromaticAberration = new THREE.ShaderPass( chromaticAberrationShader );
	
	antialias.uniforms.resolution.value.set(
		1 / (window.innerWidth * _ratio),
		1 / (window.innerHeight * _ratio)
	);
	copy.renderToScreen = true;

	var composer = new THREE.EffectComposer( _renderer );
	composer.renderTarget1.setSize( window.innerWidth * _ratio, window.innerHeight * _ratio );
	composer.renderTarget2.setSize( window.innerWidth * _ratio, window.innerHeight * _ratio );

	composer.addPass( renderPass );
	composer.addPass( antialias );
	// composer.addPass( chromaticAberration );
	composer.addPass( bloom );
	composer.addPass( copy );
	
	return composer;
	
}

function addSceneAndCameraToEffects( scene, camera ) {
	
	_rendererPass.scene = scene;
	_rendererPass.camera = camera;
	
}

var newResizeHandler = (function() {
	
	var handler;
	var $window = $(window);
	
	return function( camera ) {
		
		var newHandler = function() {
			
			_renderer.setSize(
				window.innerWidth,
				window.innerHeight
			);
			
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			
		};
		
		if( handler ) {
			$(window).off('resize', handler);
		}
		
		$window.on('resize', newHandler);
		newHandler();
		handler = newHandler;
		
	};
		
})();

function addRenderer() {
	
	var renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( _ratio );
	renderer.setSize(
		window.innerWidth,
		window.innerHeight
	);
	document.getElementById( 'container' ).appendChild( renderer.domElement );
		
	return renderer;
	
}

function handleNewPoem( poem, properties ) {
	
	var config = _.extend({
		clearColor : 0x222222,
		useEffects : false,
		useVR : false
	}, properties);
	
	var scene = poem.scene;
	var camera = poem.camera.object;
	
	_renderer.setClearColor( config.clearColor );
	
	if( config.useVR ) {
		_renderer = new StereoEffect( _webGLRenderer );
		_renderer.separation = 10;
		// this.hideUI();
	} else {
		_renderer = _webGLRenderer;
		// this.showUI();
	}
	
	addSceneAndCameraToEffects( scene, camera );
	newResizeHandler( camera );
	
	if( config.useEffects ) {
		_renderer.autoClear = false;
		poem.on( 'draw', function() {
			_composer.render( scene, camera );
		});
	} else {
		_renderer.autoClear = true;
		poem.on( 'draw', function() {
			_renderer.render( scene, camera );
		});
	}
	
	return _renderer;
}

module.exports = handleNewPoem;
},{"./postprocessing":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/postprocessing/index.js","./postprocessing/chromaticAberration":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/postprocessing/chromaticAberration/index.js","./shaders/ConvolutionShader":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/shaders/ConvolutionShader.js","./shaders/CopyShader":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/shaders/CopyShader.js","./shaders/FXAAShader":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/shaders/FXAAShader.js","./shaders/FilmShader":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/shaders/FilmShader.js","./vendor/StereoEffect":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/vendor/StereoEffect.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/routing.js":[function(require,module,exports){
var crossroads = require('crossroads');
var hasher = require('hasher');
var levelLoader = require('./levelLoader');

var baseUrl = '/sandbox';
var defaultLevel = "sineGravityCloud";
var currentLevel = "";

var routing = {
	
	start : function( Poem, manifests ) {
		
		levelLoader.init( Poem, manifests );
		
		function parseHash( newHash, oldHash ){
			crossroads.parse( newHash );
		}
		
		crossroads.addRoute( '/',				routing.showMainTitles );
		crossroads.addRoute( 'level/{name}',	routing.loadUpALevel );
	
		crossroads.addRoute( /.*/, function reRouteToMainTitlesIfNoMatch() {
			hasher.replaceHash('');
		});
	
		hasher.initialized.add(parseHash); // parse initial hash
		hasher.changed.add(parseHash); //parse hash changes
		hasher.init(); //start listening for history change
		
	},
	
	showMainTitles : function() {

		_gaq.push( [ '_trackPageview', baseUrl ] );
	
		levelLoader.load( defaultLevel );		

	},

	loadUpALevel : function( levelName ) {

		_gaq.push( [ '_trackPageview', baseUrl+'/#level/'+levelName ] );
	
		var levelFound = levelLoader.load( levelName );
	
		if( !levelFound ) {
			levelLoader.load( defaultLevel );
		}
		
	},
	
	on : levelLoader.on.bind( levelLoader ),
	off : levelLoader.off.bind( levelLoader )
	
};

module.exports = routing;
},{"./levelLoader":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/levelLoader.js","crossroads":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/crossroads/dist/crossroads.js","hasher":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/hasher/dist/js/hasher.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/shaders/ConvolutionShader.js":[function(require,module,exports){
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Convolution shader
 * ported from o3d sample to WebGL / GLSL
 * http://o3d.googlecode.com/svn/trunk/samples/convolution.html
 */

THREE.ConvolutionShader = {

	defines: {

		"KERNEL_SIZE_FLOAT": "25.0",
		"KERNEL_SIZE_INT": "25",

	},

	uniforms: {

		"tDiffuse":        { type: "t", value: null },
		"uImageIncrement": { type: "v2", value: new THREE.Vector2( 0.001953125, 0.0 ) },
		"cKernel":         { type: "fv1", value: [] }

	},

	vertexShader: [

		"uniform vec2 uImageIncrement;",

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float cKernel[ KERNEL_SIZE_INT ];",

		"uniform sampler2D tDiffuse;",
		"uniform vec2 uImageIncrement;",

		"varying vec2 vUv;",

		"void main() {",

			"vec2 imageCoord = vUv;",
			"vec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );",

			"for( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {",

				"sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];",
				"imageCoord += uImageIncrement;",

			"}",

			"gl_FragColor = sum;",

		"}"


	].join("\n"),

	buildKernel: function ( sigma ) {

		// We lop off the sqrt(2 * pi) * sigma term, since we're going to normalize anyway.

		function gauss( x, sigma ) {

			return Math.exp( - ( x * x ) / ( 2.0 * sigma * sigma ) );

		}

		var i, values, sum, halfWidth, kMaxKernelSize = 25, kernelSize = 2 * Math.ceil( sigma * 3.0 ) + 1;

		if ( kernelSize > kMaxKernelSize ) kernelSize = kMaxKernelSize;
		halfWidth = ( kernelSize - 1 ) * 0.5;

		values = new Array( kernelSize );
		sum = 0.0;
		for ( i = 0; i < kernelSize; ++i ) {

			values[ i ] = gauss( i - halfWidth, sigma );
			sum += values[ i ];

		}

		// normalize the kernel

		for ( i = 0; i < kernelSize; ++i ) values[ i ] /= sum;

		return values;

	}

};

},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/shaders/CopyShader.js":[function(require,module,exports){
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */

THREE.CopyShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"opacity":  { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float opacity;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel = texture2D( tDiffuse, vUv );",
			"gl_FragColor = opacity * texel;",

		"}"

	].join("\n")

};

},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/shaders/FXAAShader.js":[function(require,module,exports){
/**
 * @author alteredq / http://alteredqualia.com/
 * @author davidedc / http://www.sketchpatch.net/
 *
 * NVIDIA FXAA by Timothy Lottes
 * http://timothylottes.blogspot.com/2011/06/fxaa3-source-released.html
 * - WebGL port by @supereggbert
 * http://www.glge.org/demos/fxaa/
 */

THREE.FXAAShader = {

	uniforms: {

		"tDiffuse":   { type: "t", value: null },
		"resolution": { type: "v2", value: new THREE.Vector2( 1 / 1024, 1 / 512 )  }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform vec2 resolution;",

		"varying vec2 vUv;",

		"#define FXAA_REDUCE_MIN   (1.0/128.0)",
		"#define FXAA_REDUCE_MUL   (1.0/8.0)",
		"#define FXAA_SPAN_MAX     8.0",

		"void main() {",

			"vec3 rgbNW = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( -1.0, -1.0 ) ) * resolution ).xyz;",
			"vec3 rgbNE = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( 1.0, -1.0 ) ) * resolution ).xyz;",
			"vec3 rgbSW = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( -1.0, 1.0 ) ) * resolution ).xyz;",
			"vec3 rgbSE = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( 1.0, 1.0 ) ) * resolution ).xyz;",
			"vec4 rgbaM  = texture2D( tDiffuse,  gl_FragCoord.xy  * resolution );",
			"vec3 rgbM  = rgbaM.xyz;",
			"vec3 luma = vec3( 0.299, 0.587, 0.114 );",

			"float lumaNW = dot( rgbNW, luma );",
			"float lumaNE = dot( rgbNE, luma );",
			"float lumaSW = dot( rgbSW, luma );",
			"float lumaSE = dot( rgbSE, luma );",
			"float lumaM  = dot( rgbM,  luma );",
			"float lumaMin = min( lumaM, min( min( lumaNW, lumaNE ), min( lumaSW, lumaSE ) ) );",
			"float lumaMax = max( lumaM, max( max( lumaNW, lumaNE) , max( lumaSW, lumaSE ) ) );",

			"vec2 dir;",
			"dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));",
			"dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));",

			"float dirReduce = max( ( lumaNW + lumaNE + lumaSW + lumaSE ) * ( 0.25 * FXAA_REDUCE_MUL ), FXAA_REDUCE_MIN );",

			"float rcpDirMin = 1.0 / ( min( abs( dir.x ), abs( dir.y ) ) + dirReduce );",
			"dir = min( vec2( FXAA_SPAN_MAX,  FXAA_SPAN_MAX),",
				  "max( vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),",
						"dir * rcpDirMin)) * resolution;",
			"vec4 rgbA = (1.0/2.0) * (",
        	"texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (1.0/3.0 - 0.5)) +",
			"texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (2.0/3.0 - 0.5)));",
    		"vec4 rgbB = rgbA * (1.0/2.0) + (1.0/4.0) * (",
			"texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (0.0/3.0 - 0.5)) +",
      		"texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (3.0/3.0 - 0.5)));",
    		"float lumaB = dot(rgbB, vec4(luma, 0.0));",

			"if ( ( lumaB < lumaMin ) || ( lumaB > lumaMax ) ) {",

				"gl_FragColor = rgbA;",

			"} else {",
				"gl_FragColor = rgbB;",

			"}",

		"}"

	].join("\n")

};

},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/shaders/FilmShader.js":[function(require,module,exports){
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Film grain & scanlines shader
 *
 * - ported from HLSL to WebGL / GLSL
 * http://www.truevision3d.com/forums/showcase/staticnoise_colorblackwhite_scanline_shaders-t18698.0.html
 *
 * Screen Space Static Postprocessor
 *
 * Produces an analogue noise overlay similar to a film grain / TV static
 *
 * Original implementation and noise algorithm
 * Pat 'Hawthorne' Shearon
 *
 * Optimized scanlines + noise version with intensity scaling
 * Georg 'Leviathan' Steinrohder
 *
 * This version is provided under a Creative Commons Attribution 3.0 License
 * http://creativecommons.org/licenses/by/3.0/
 */

THREE.FilmShader = {

	uniforms: {

		"tDiffuse":   { type: "t", value: null },
		"time":       { type: "f", value: 0.0 },
		"nIntensity": { type: "f", value: 0.5 },
		"sIntensity": { type: "f", value: 0.05 },
		"sCount":     { type: "f", value: 4096 },
		"grayscale":  { type: "i", value: 1 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		// control parameter
		"uniform float time;",

		"uniform bool grayscale;",

		// noise effect intensity value (0 = no effect, 1 = full effect)
		"uniform float nIntensity;",

		// scanlines effect intensity value (0 = no effect, 1 = full effect)
		"uniform float sIntensity;",

		// scanlines effect count value (0 = no effect, 4096 = full effect)
		"uniform float sCount;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			// sample the source
			"vec4 cTextureScreen = texture2D( tDiffuse, vUv );",

			// make some noise
			"float x = vUv.x * vUv.y * time *  1000.0;",
			"x = mod( x, 13.0 ) * mod( x, 123.0 );",
			"float dx = mod( x, 0.01 );",

			// add noise
			"vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx * 100.0, 0.0, 1.0 );",

			// get us a sine and cosine
			"vec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );",

			// add scanlines
			"cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;",

			// interpolate between source and result by intensity
			"cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );",

			// convert to grayscale if desired
			"if( grayscale ) {",

				"cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );",

			"}",

			"gl_FragColor =  vec4( cResult, cTextureScreen.a );",

		"}"

	].join("\n")

};

},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/sound/Music.js":[function(require,module,exports){
var soundcloud = require('soundcloud-badge');
var muter = require('./muter');

var soundOff = false;

var audio = null;
var fetchAndPlaySong = null;
var timesCalledSoundcloud = 0;

var Music = function( poem, properties ) {

	fetchAndPlaySong = function() {
		
		var currentTime = ++timesCalledSoundcloud;
		
		soundcloud({
			
			client_id: '6057c9af862bf245d4c402179e317f52',
			song: properties.url,
			dark: false,
			getFonts: false
			
		}, function( err, src, data, div ) {
			
			//Nullify callbacks that are out of order
			if( currentTime !== timesCalledSoundcloud ) return;
			if( muter.muted ) return;

			if( err ) throw err;

			audio = new Audio();
			audio.src = src;
			audio.play();
			audio.loop = true;
			audio.volume = properties.volume || 0.6;
		
			$(audio).on('loadedmetadata', function() {
				if( audio )	audio.currentTime = properties.startTime || 0;
			});
		

		});
	
		poem.on('destroy', function() {
			
			if( audio ) {
				audio.pause();
				audio = null;
			}
			
			$('.npm-scb-white').remove();
			
		});
		
	};
	
	if( !muter.muted ) {
		
		fetchAndPlaySong();
		fetchAndPlaySong = null;
		
	}
	
};

Music.prototype.muted = false;

muter.on('mute', function muteMusic( e ) {

	if( audio ) audio.pause();
	
	$('.npm-scb-white').hide();

});

muter.on('unmute', function unmuteMusic( e ) {

	if( audio ) audio.play();

	if( fetchAndPlaySong ) {
		fetchAndPlaySong();
		fetchAndPlaySong = null;
	}
	
	$('.npm-scb-white').show();
	

});

module.exports = Music;
},{"./muter":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/sound/muter.js","soundcloud-badge":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/soundcloud-badge/index.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/sound/muter.js":[function(require,module,exports){
var EventDispatcher = require('../utils/EventDispatcher');
var localforage = require('localforage');
var muter;

var Muter = function() {
	
	this.muted = true;
	
	localforage.getItem('muted', function( err, value ) {

		if( err || value === null ) {
			this.muted = false;
		} else {
			this.muted = value;
		}
		
		this.dispatchChanged();
		
	}.bind(this));
	
};

Muter.prototype = {
	
	mute : function() {
		this.muted = true;
		this.dispatchChanged();
		this.save();
	},
	
	unmute : function() {
		this.muted = false;
		this.dispatchChanged();
		this.save();
	},
	
	save : function() {
		localforage.setItem( 'muted', this.muted );
	},
	
	dispatchChanged : function() {
		
		if( this.muted ) {
			muter.dispatch({
				type: 'mute'
			});
			
		} else {
			muter.dispatch({
				type: 'unmute'
			});
		}
	}
	
};

EventDispatcher.prototype.apply( Muter.prototype );

muter = new Muter();

$(window).on('keydown', function muteAudioOnHittingS( e ) {
	
	if( e.keyCode !== 83 ) return;
	
	if( muter.muted ) {
		muter.unmute();
	} else {
		muter.mute();
	}
	
});

module.exports = muter;

},{"../utils/EventDispatcher":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/EventDispatcher.js","localforage":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/localforage/src/localforage.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/ui/index.js":[function(require,module,exports){
var menu = require('./menu');
var mute = require('./mute');
var menuLevels = require('./menuLevels');

jQuery(function($) {
	
	menu.setHandlers();
	mute.setHandlers();
	
});
},{"./menu":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/ui/menu.js","./menuLevels":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/ui/menuLevels.js","./mute":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/ui/mute.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/ui/menu.js":[function(require,module,exports){
var	EventDispatcher	= require('../utils/EventDispatcher');
var	routing			= require('../routing');

var poem;
var isOpen = false;
var $body;

routing.on( 'newLevel', function( e ) {

	poem = e.poem;
	
});


var menu = {
	
	setHandlers : function() {
		
		$body = $('body');
		
		$('#menu a, #container-blocker').click( menu.close );
		
		$('#menu-button').off().click( this.toggle );
		
		routing.on( 'newLevel', menu.close );
		
		$(window).on('keydown', function toggleMenuHandler( e ) {
	
			if( e.keyCode !== 27 ) return;
			menu.toggle(e);
	
		});
		
		
	},
		
	toggle : function( e ) {

		e.preventDefault();
		
		if( isOpen ) {
			menu.close();
		} else {
			menu.open();
		}
		
		isOpen = !isOpen;
		
	},
	
	close : function() {
		$body.removeClass('menu-open');
		if( poem ) poem.start();
	},
	
	open : function() {
		$body.addClass('menu-open');
		if( poem ) poem.pause();
	}
	
};

EventDispatcher.prototype.apply( menu );
module.exports = menu;
},{"../routing":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/routing.js","../utils/EventDispatcher":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/EventDispatcher.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/ui/menuLevels.js":[function(require,module,exports){
var levelKeyPairs = (function sortAndFilterLevels( levels ) {
		
	return _.chain(levels)
		.pairs()
		// .filter(function( keypair ) {
		// 	return keypair[1].order;
		// })
		.sortBy(function( keypair ) {
			return keypair[1].order;
		})
	.value();
	
})( require('../../manifests') );

function reactiveLevels( $scope, template ) {
	
	$scope.children().remove();
	
	var templateData = _.map( levelKeyPairs, function( keypair ) {
		
		var slug = keypair[0];
		var level = keypair[1];
		
		return {
			name : level.name,
			description : level.description,
			slug : slug
		};
		
	});
	
	$scope.append( _.reduce( templateData, function( memo, text) {
		
		return memo + template( text );
		
	}, "") );
}

(function init() {
	
	var template = _.template( $('#menu-level-template').text() );
	var $scope = $('#menu-levels');
	
	function updateReactiveLevels() {
		reactiveLevels( $scope, template );
	}
	
	updateReactiveLevels();
	
})();

},{"../../manifests":"/Users/gregtatum/Google Drive/greg-sites/sandbox/manifests/index.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/ui/mute.js":[function(require,module,exports){
var muter = require('../sound/muter');

var mutedSrc = 'assets/images/sound-mute.png';
var unMutedSrc = 'assets/images/sound-unmute.png';
var mutedSrcHover = 'assets/images/sound-mute-hover.png';
var unMutedSrcHover = 'assets/images/sound-unmute-hover.png';

new Image().src = mutedSrc;
new Image().src = unMutedSrc;
new Image().src = mutedSrcHover;
new Image().src = unMutedSrcHover;


var $mute;
var $img;

module.exports = {
	
	setHandlers : function() {
		
		$mute = $('#mute');
		$img = $mute.find('img');
		
		muter.on('mute', function() {
			$img.attr( 'src', mutedSrc );
		});
		
		muter.on('unmute', function() {
			$img.attr( 'src', unMutedSrc );
		});
		
		$img.attr( 'src', muter.muted ? mutedSrc : unMutedSrc );
		
		$mute.off().click( function( e ) {
			
			e.preventDefault();
		
			if( muter.muted ) {
			
				$img.attr('src', unMutedSrcHover);
				muter.unmute();
			
			} else {
			
				$img.attr('src', mutedSrcHover);
				muter.mute();
			
			}
			e.stopImmediatePropagation();
		
		});

		$mute.on('mouseover', function( e ) {
			
			e.preventDefault();
		
			if( muter.muted ) {
				$img.attr('src', mutedSrcHover);
			} else {
				$img.attr('src', unMutedSrcHover);
			}
		
		});
		
		$mute.on('mouseout', function( e ) {
			
			if( muter.muted ) {
				$img.attr('src', mutedSrc);
			} else {
				$img.attr('src', unMutedSrc);
			}		
		});
		
	}
	
};
},{"../sound/muter":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/sound/muter.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/Clock.js":[function(require,module,exports){
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
},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/EventDispatcher.js":[function(require,module,exports){
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
		
		return listener;

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
},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/Stats.js":[function(require,module,exports){
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
},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/ThreeConsole.js":[function(require,module,exports){
function roundTo( value, decimalPlaces ) {
	
	if( typeof decimalPlaces === "number" ) {

		return Math.round( Math.pow(10, decimalPlaces) * value ) / Math.pow(10, decimalPlaces);

	} else {
		
		return value;
		
	}
	
}

THREE.Console = {
	
	vector : function( vectorOrList, decimalPlaces ) {
		
		var results = [];
		var list;
		
		if( vectorOrList instanceof THREE.Vector2 || vectorOrList instanceof THREE.Vector3  || vectorOrList instanceof THREE.Vector4 ) {
			list = [ vectorOrList ];
		} else {
			list = vectorOrList;
		}
		
		console.table(
			_.map( list, function( vector ) {
				return _.map( vector.toArray(), function( x ) {
					return roundTo( x, decimalPlaces );
				});
			})
		);
		
	},
	
	matrix : function( matrixOrElements, decimalPlaces ) {
 
		var i, j, el, els, results;
 
		results = [];
		j = 0;
		
		if( matrixOrElements instanceof THREE.Matrix3 || matrixOrElements instanceof THREE.Matrix3 ) {
			els = matrixOrElements.elements;
		} else {
			els = matrixOrElements;
		}
 
		for( i=0; i < els.length; i++ ) {
		
			if( j === 0 ) {
				results.push([]);
			}
 
			el = roundTo( els[i], decimalPlaces );
 
			results[Math.floor(i / 4) % 4].push( el );
 
			j++;
			j %= 4;
		
			if( i % 16 === 15 ) {
				console.table( results );
				results = [];
			}
 
		}
 
	},
};

module.exports = THREE.Console;
},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/calculateSquaredTextureWidth.js":[function(require,module,exports){
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

},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/loadText.js":[function(require,module,exports){
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
},{"rsvp":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/rsvp/dist/rsvp.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/loadTexture.js":[function(require,module,exports){
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
},{"rsvp":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/rsvp/dist/rsvp.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/random.js":[function(require,module,exports){
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

},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/simplex2.js":[function(require,module,exports){
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

},{"perlin-simplex":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/perlin-simplex/index.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/vendor/DeviceOrientationControls.js":[function(require,module,exports){
/* globals THREE */
/**
 * DeviceOrientationControls - applies device orientation on object rotation
 *
 * @param {Object} object - instance of THREE.Object3D
 * @constructor
 *
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 * @author jonobr1 / http://jonobr1.com
 * @author arodic / http://aleksandarrodic.com
 * @author doug / http://github.com/doug
 *
 * W3C Device Orientation control
 * (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */


var deviceOrientation = {};
	var screenOrientation = window.orientation || 0;

function onDeviceOrientationChangeEvent(evt) {
	deviceOrientation = evt;
}
window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);

function getOrientation() {
	switch (window.screen.orientation || window.screen.mozOrientation) {
		case 'landscape-primary':
			return 90;
		case 'landscape-secondary':
			return -90;
		case 'portrait-secondary':
			return 180;
		case 'portrait-primary':
			return 0;
	}
	// this returns 90 if width is greater then height
	// and window orientation is undefined OR 0
	// if (!window.orientation && window.innerWidth > window.innerHeight)
	//	 return 90;
	return window.orientation || 0;
}

function onScreenOrientationChangeEvent() {
	screenOrientation = getOrientation();
}
window.addEventListener('orientationchange', onScreenOrientationChangeEvent, false);


THREE.DeviceOrientationControls = function(object) {

	this.object = object;

	this.object.rotation.reorder('YXZ');

	this.freeze = true;

	this.movementSpeed = 1.0;
	this.rollSpeed = 0.005;
	this.autoAlign = true;
	this.autoForward = false;

	this.alpha = 0;
	this.beta = 0;
	this.gamma = 0;
	this.orient = 0;

	this.alignQuaternion = new THREE.Quaternion();
	this.orientationQuaternion = new THREE.Quaternion();

	var quaternion = new THREE.Quaternion();
	var quaternionLerp = new THREE.Quaternion();

	var tempVector3 = new THREE.Vector3();
	var tempMatrix4 = new THREE.Matrix4();
	var tempEuler = new THREE.Euler(0, 0, 0, 'YXZ');
	var tempQuaternion = new THREE.Quaternion();

	var zee = new THREE.Vector3(0, 0, 1);
	var up = new THREE.Vector3(0, 1, 0);
	var v0 = new THREE.Vector3(0, 0, 0);
	var euler = new THREE.Euler();
	var q0 = new THREE.Quaternion(); // - PI/2 around the x-axis
	var q1 = new THREE.Quaternion(- Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));


	this.update = (function(delta) {

		return function(delta) {

			if (this.freeze) return;

			// should not need this
			//var orientation = getOrientation();
			//if (orientation !== this.screenOrientation) {
				//this.screenOrientation = orientation;
				//this.autoAlign = true;
			//}

			this.alpha = deviceOrientation.gamma ?
				THREE.Math.degToRad(deviceOrientation.alpha) : 0; // Z
			this.beta = deviceOrientation.beta ?
				THREE.Math.degToRad(deviceOrientation.beta) : 0; // X'
			this.gamma = deviceOrientation.gamma ?
				THREE.Math.degToRad(deviceOrientation.gamma) : 0; // Y''
			this.orient = screenOrientation ?
				THREE.Math.degToRad(screenOrientation) : 0; // O

			// The angles alpha, beta and gamma
			// form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

			// 'ZXY' for the device, but 'YXZ' for us
			euler.set(this.beta, this.alpha, - this.gamma, 'YXZ');

			quaternion.setFromEuler(euler);
			quaternionLerp.slerp(quaternion, 0.5); // interpolate

			// orient the device
			if (this.autoAlign) this.orientationQuaternion.copy(quaternion); // interpolation breaks the auto alignment
			else this.orientationQuaternion.copy(quaternionLerp);

			// camera looks out the back of the device, not the top
			this.orientationQuaternion.multiply(q1);

			// adjust for screen orientation
			this.orientationQuaternion.multiply(q0.setFromAxisAngle(zee, - this.orient));

			this.object.quaternion.copy(this.alignQuaternion);
			this.object.quaternion.multiply(this.orientationQuaternion);

			if (this.autoForward) {

				tempVector3
					.set(0, 0, -1)
					.applyQuaternion(this.object.quaternion, 'ZXY')
					.setLength(this.movementSpeed / 50); // TODO: why 50 :S

				this.object.position.add(tempVector3);

			}

			if (this.autoAlign && this.alpha !== 0) {

				this.autoAlign = false;

				this.align();

			}

		};

	})();

	this.align = function() {

		tempVector3
			.set(0, 0, -1)
			.applyQuaternion( tempQuaternion.copy(this.orientationQuaternion).inverse(), 'ZXY' );

		tempEuler.setFromQuaternion(
			tempQuaternion.setFromRotationMatrix(
				tempMatrix4.lookAt(tempVector3, v0, up)
		 )
	 );

		tempEuler.set(0, tempEuler.y, 0);
		this.alignQuaternion.setFromEuler(tempEuler);

	};

	this.connect = function() {
		this.freeze = false;
	};

	this.disconnect = function() {
		this.freze = true;
	};

};

module.exports = THREE.DeviceOrientationControls;
},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/vendor/OrbitControls.js":[function(require,module,exports){
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

THREE.OrbitControls = function ( object, domElement ) {

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

	// How far you can orbit horizontally, upper and lower limits.
	// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
	this.minAzimuthAngle = - Infinity; // radians
	this.maxAzimuthAngle = Infinity; // radians

	// Set to true to disable use of the keys
	this.noKeys = false;

	// The four arrow keys
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	// Mouse buttons
	this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };

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
	var panOffset = new THREE.Vector3();

	var offset = new THREE.Vector3();

	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();

	var theta;
	var phi;
	var phiDelta = 0;
	var thetaDelta = 0;
	var scale = 1;
	var pan = new THREE.Vector3();

	var lastPosition = new THREE.Vector3();
	var lastQuaternion = new THREE.Quaternion();

	var STATE = { NONE : -1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };

	var state = STATE.NONE;

	// for reset

	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();

	// so camera.up is the orbit axis

	var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
	var quatInverse = quat.clone().inverse();

	// events

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start'};
	var endEvent = { type: 'end'};

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

		var te = this.object.matrix.elements;

		// get X column of matrix
		panOffset.set( te[ 0 ], te[ 1 ], te[ 2 ] );
		panOffset.multiplyScalar( - distance );

		pan.add( panOffset );

	};

	// pass in distance in world space to move up
	this.panUp = function ( distance ) {

		var te = this.object.matrix.elements;

		// get Y column of matrix
		panOffset.set( te[ 4 ], te[ 5 ], te[ 6 ] );
		panOffset.multiplyScalar( distance );

		pan.add( panOffset );

	};

	// pass in x,y of change desired in pixel space,
	// right and down are positive
	this.pan = function ( deltaX, deltaY ) {

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		if ( scope.object.fov !== undefined ) {

			// perspective
			var position = scope.object.position;
			var offset = position.clone().sub( scope.target );
			var targetDistance = offset.length();

			// half of the fov is center to top of screen
			targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

			// we actually don't use screenWidth, since perspective camera is fixed to screen height
			scope.panLeft( 2 * deltaX * targetDistance / element.clientHeight );
			scope.panUp( 2 * deltaY * targetDistance / element.clientHeight );

		} else if ( scope.object.top !== undefined ) {

			// orthographic
			scope.panLeft( deltaX * (scope.object.right - scope.object.left) / element.clientWidth );
			scope.panUp( deltaY * (scope.object.top - scope.object.bottom) / element.clientHeight );

		} else {

			// camera neither orthographic or perspective
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

		offset.copy( position ).sub( this.target );

		// rotate offset to "y-axis-is-up" space
		offset.applyQuaternion( quat );

		// angle from z-axis around y-axis

		theta = Math.atan2( offset.x, offset.z );

		// angle from y-axis

		phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

		if ( this.autoRotate && state === STATE.NONE ) {

			this.rotateLeft( getAutoRotationAngle() );

		}

		theta += thetaDelta;
		phi += phiDelta;

		// restrict theta to be between desired limits
		theta = Math.max( this.minAzimuthAngle, Math.min( this.maxAzimuthAngle, theta ) );

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

		// rotate offset back to "camera-up-vector-is-up" space
		offset.applyQuaternion( quatInverse );

		position.copy( this.target ).add( offset );

		this.object.lookAt( this.target );

		thetaDelta = 0;
		phiDelta = 0;
		scale = 1;
		pan.set( 0, 0, 0 );

		// update condition is:
		// min(camera displacement, camera rotation in radians)^2 > EPS
		// using small-angle approximation cos(x/2) = 1 - x^2 / 8

		if ( lastPosition.distanceToSquared( this.object.position ) > EPS || 8 * (1 - lastQuaternion.dot(this.object.quaternion)) > EPS ) {

			this.dispatchEvent( changeEvent );

			lastPosition.copy( this.object.position );
			lastQuaternion.copy (this.object.quaternion );

		}

	};


	this.reset = function () {

		state = STATE.NONE;

		this.target.copy( this.target0 );
		this.object.position.copy( this.position0 );

		this.update();

	};

	this.getPolarAngle = function () {

		return phi;

	};

	this.getAzimuthalAngle = function () {

		return theta;

	};

	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {

		return Math.pow( 0.95, scope.zoomSpeed );

	}

	function onMouseDown( event ) {

		if ( scope.enabled === false ) return;
		event.preventDefault();

		if ( event.button === scope.mouseButtons.ORBIT ) {
			if ( scope.noRotate === true ) return;

			state = STATE.ROTATE;

			rotateStart.set( event.clientX, event.clientY );

		} else if ( event.button === scope.mouseButtons.ZOOM ) {
			if ( scope.noZoom === true ) return;

			state = STATE.DOLLY;

			dollyStart.set( event.clientX, event.clientY );

		} else if ( event.button === scope.mouseButtons.PAN ) {
			if ( scope.noPan === true ) return;

			state = STATE.PAN;

			panStart.set( event.clientX, event.clientY );

		}

		if ( state !== STATE.NONE ) {
			document.addEventListener( 'mousemove', onMouseMove, false );
			document.addEventListener( 'mouseup', onMouseUp, false );
			scope.dispatchEvent( startEvent );
		}

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

			scope.pan( panDelta.x, panDelta.y );

			panStart.copy( panEnd );

		}

		if ( state !== STATE.NONE ) scope.update();

	}

	function onMouseUp( /* event */ ) {

		if ( scope.enabled === false ) return;

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );
		scope.dispatchEvent( endEvent );
		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		if ( scope.enabled === false || scope.noZoom === true || state !== STATE.NONE ) return;

		event.preventDefault();
		event.stopPropagation();

		var delta = 0;

		if ( event.wheelDelta !== undefined ) { // WebKit / Opera / Explorer 9

			delta = event.wheelDelta;

		} else if ( event.detail !== undefined ) { // Firefox

			delta = - event.detail;

		}

		if ( delta > 0 ) {

			scope.dollyOut();

		} else {

			scope.dollyIn();

		}

		scope.update();
		scope.dispatchEvent( startEvent );
		scope.dispatchEvent( endEvent );

	}

	function onKeyDown( event ) {

		if ( scope.enabled === false || scope.noKeys === true || scope.noPan === true ) return;

		switch ( event.keyCode ) {

			case scope.keys.UP:
				scope.pan( 0, scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.BOTTOM:
				scope.pan( 0, - scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.LEFT:
				scope.pan( scope.keyPanSpeed, 0 );
				scope.update();
				break;

			case scope.keys.RIGHT:
				scope.pan( - scope.keyPanSpeed, 0 );
				scope.update();
				break;

		}

	}

	function touchstart( event ) {

		if ( scope.enabled === false ) return;

		switch ( event.touches.length ) {

			case 1:	// one-fingered touch: rotate

				if ( scope.noRotate === true ) return;

				state = STATE.TOUCH_ROTATE;

				rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

			case 2:	// two-fingered touch: dolly

				if ( scope.noZoom === true ) return;

				state = STATE.TOUCH_DOLLY;

				var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
				var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
				var distance = Math.sqrt( dx * dx + dy * dy );
				dollyStart.set( 0, distance );
				break;

			case 3: // three-fingered touch: pan

				if ( scope.noPan === true ) return;

				state = STATE.TOUCH_PAN;

				panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

			default:

				state = STATE.NONE;

		}

		if ( state !== STATE.NONE ) scope.dispatchEvent( startEvent );

	}

	function touchmove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		switch ( event.touches.length ) {

			case 1: // one-fingered touch: rotate

				if ( scope.noRotate === true ) return;
				if ( state !== STATE.TOUCH_ROTATE ) return;

				rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				rotateDelta.subVectors( rotateEnd, rotateStart );

				// rotating across whole screen goes 360 degrees around
				scope.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );
				// rotating up and down along whole screen attempts to go 360, but limited to 180
				scope.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

				rotateStart.copy( rotateEnd );

				scope.update();
				break;

			case 2: // two-fingered touch: dolly

				if ( scope.noZoom === true ) return;
				if ( state !== STATE.TOUCH_DOLLY ) return;

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

				scope.update();
				break;

			case 3: // three-fingered touch: pan

				if ( scope.noPan === true ) return;
				if ( state !== STATE.TOUCH_PAN ) return;

				panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				panDelta.subVectors( panEnd, panStart );

				scope.pan( panDelta.x, panDelta.y );

				panStart.copy( panEnd );

				scope.update();
				break;

			default:

				state = STATE.NONE;

		}

	}

	function touchend( /* event */ ) {

		if ( scope.enabled === false ) return;

		scope.dispatchEvent( endEvent );
		state = STATE.NONE;

	}

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
	this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox

	this.domElement.addEventListener( 'touchstart', touchstart, false );
	this.domElement.addEventListener( 'touchend', touchend, false );
	this.domElement.addEventListener( 'touchmove', touchmove, false );

	window.addEventListener( 'keydown', onKeyDown, false );

	// force an update at start
	this.update();

};

THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;

module.exports = THREE.OrbitControls;
},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/vendor/Stats.js":[function(require,module,exports){
module.exports=require("/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/Stats.js")
},{"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/Stats.js":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/Stats.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/vendor/StereoEffect.js":[function(require,module,exports){
/**
 * @author alteredq / http://alteredqualia.com/
 * @authod mrdoob / http://mrdoob.com/
 * @authod arodic / http://aleksandarrodic.com/
 */

THREE.StereoEffect = function ( renderer ) {

	// API

	this.separation = 3;

	// internals

	var _width, _height;

	var _position = new THREE.Vector3();
	var _quaternion = new THREE.Quaternion();
	var _scale = new THREE.Vector3();

	var _cameraL = new THREE.PerspectiveCamera();
	var _cameraR = new THREE.PerspectiveCamera();

	// initialization

	renderer.autoClear = false;

	this.setSize = function ( width, height ) {

		_width = width / 2;
		_height = height;

		renderer.setSize( width, height );

	};

	this.render = function ( scene, camera ) {

		scene.updateMatrixWorld();

		if ( camera.parent === undefined ) camera.updateMatrixWorld();
	
		camera.matrixWorld.decompose( _position, _quaternion, _scale );

		// left

		_cameraL.fov = camera.fov;
		_cameraL.aspect = 0.5 * camera.aspect;
		_cameraL.near = camera.near;
		_cameraL.far = camera.far;
		_cameraL.updateProjectionMatrix();

		_cameraL.position.copy( _position );
		_cameraL.quaternion.copy( _quaternion );
		_cameraL.translateX( - this.separation );

		// right

		_cameraR.near = camera.near;
		_cameraR.far = camera.far;
		_cameraR.projectionMatrix = _cameraL.projectionMatrix;

		_cameraR.position.copy( _position );
		_cameraR.quaternion.copy( _quaternion );
		_cameraR.translateX( this.separation );

		//

		renderer.setViewport( 0, 0, _width * 2, _height );
		renderer.clear();

		renderer.setViewport( 0, 0, _width, _height );
		renderer.render( scene, _cameraL );

		renderer.setViewport( _width, 0, _width, _height );
		renderer.render( scene, _cameraR );

	};

};

module.exports = THREE.StereoEffect;
},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/manifests/carbonDioxideEarth.js":[function(require,module,exports){
module.exports = {
	name : "Carbon Dioxide Earth",
	description : "Mapping NASA Data",
	order : 0,
	config : {
		camera : {
			x : -400,
			far : 3000
		}
	},
	objects : {
		sphere : {
			object: require("../js/demos/Earth"),
			properties: {}
		},
		controls : {
			object: require("../js/components/cameras/Controls"),
			properties: {
				minDistance : 500,
				maxDistance : 1000,
				zoomSpeed : 0.1,
				autoRotate : true,
				autoRotateSpeed : 0.2
			}
		},
		info : {
			object: require("../js/components/Info"),
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
			object: require("../js/components/Stars"),
		},
		// stats : {
		// 	object: require("../js/components/utils/Stats")
		// },
		lights : {
			object: require("../js/components/lights/TrackCameraLights")
		}
	}
};
},{"../js/components/Info":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/Info.js","../js/components/Stars":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/Stars.js","../js/components/cameras/Controls":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/cameras/Controls.js","../js/components/lights/TrackCameraLights":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/lights/TrackCameraLights.js","../js/demos/Earth":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/Earth.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/manifests/endlessTerrain.js":[function(require,module,exports){
module.exports = {
	name : "Endless Terrain",
	description : "An ever-repeating environment",
	order : 0,
	config : {
		camera : {
			x : -400,
			near : 0.1,
			fov : 40
		},
		renderer : {
			useEffects : true
		}
	},
	objects : {
		endlessTerrain : {
			object: require("../js/demos/EndlessTerrain"),
			properties: {
				positionY: -250
			}
		},
		swivelCamera : {
			object: require("../js/components/cameras/Swivel"),
		},
		constantMove : {
			object: require("../js/components/cameras/ConstantMove"),
			properties: {
				z: -2
			}
		},
		cloudsTop : {
			object: require("../js/components/ambiance/Clouds"),
			properties: {
				height: 200,
				rotation: Math.PI / 2
			}
		},
		music : {
			object: require("../js/sound/Music"),
			properties: {
				url: "https://soundcloud.com/synaptyx/mech-attack"
			}
		}
		// stats : {
		// 	object: require("../js/components/utils/Stats")
		// }
	}
};
},{"../js/components/ambiance/Clouds":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/ambiance/Clouds/index.js","../js/components/cameras/ConstantMove":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/cameras/ConstantMove.js","../js/components/cameras/Swivel":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/cameras/Swivel.js","../js/demos/EndlessTerrain":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/EndlessTerrain/index.js","../js/sound/Music":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/sound/Music.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/manifests/index.js":[function(require,module,exports){
module.exports = {
	meshGroupBoxDemo : require("./meshGroupBoxDemo"),
	carbonDioxideEarth : require("./carbonDioxideEarth"),
	endlessTerrain : require("./endlessTerrain"),
	vr : require("./vr"),
	sineGravityCloud : require("./sineGravityCloud"),
	uniformPositionalMatrices : require("./uniformPositionalMatrices"),
	texturePositionalMatrices : require("./texturePositionalMatrices")
};
},{"./carbonDioxideEarth":"/Users/gregtatum/Google Drive/greg-sites/sandbox/manifests/carbonDioxideEarth.js","./endlessTerrain":"/Users/gregtatum/Google Drive/greg-sites/sandbox/manifests/endlessTerrain.js","./meshGroupBoxDemo":"/Users/gregtatum/Google Drive/greg-sites/sandbox/manifests/meshGroupBoxDemo.js","./sineGravityCloud":"/Users/gregtatum/Google Drive/greg-sites/sandbox/manifests/sineGravityCloud.js","./texturePositionalMatrices":"/Users/gregtatum/Google Drive/greg-sites/sandbox/manifests/texturePositionalMatrices.js","./uniformPositionalMatrices":"/Users/gregtatum/Google Drive/greg-sites/sandbox/manifests/uniformPositionalMatrices.js","./vr":"/Users/gregtatum/Google Drive/greg-sites/sandbox/manifests/vr.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/manifests/meshGroupBoxDemo.js":[function(require,module,exports){
module.exports = {
	name : "MeshGroup() Proof of Concept",
	description : "Batching multiple Three.js meshes into one draw call",
	order : 50,
	config : {
		camera : {
			x : -400
		}
	},
	objects : {
		demo : {
			object: require("../js/demos/MeshGroupBoxDemo"),
			properties: {}
		},
		controls : {
			object: require("../js/components/cameras/Controls"),
		},
		grid : {
			object: require("../js/demos/Grid"),
		},
		stats : {
			object: require("../js/components/utils/Stats")
		}
	}
};
},{"../js/components/cameras/Controls":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/cameras/Controls.js","../js/components/utils/Stats":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/utils/Stats.js","../js/demos/Grid":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/Grid.js","../js/demos/MeshGroupBoxDemo":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/MeshGroupBoxDemo/index.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/manifests/sineGravityCloud.js":[function(require,module,exports){
module.exports = {
	name : "Sine Gravity Cloud",
	description : "An evolving cloud of movement",
	order : 0,
	config : {
		camera : {
			x : -400
		}
	},
	objects : {
		controls : {
			object: require("../js/components/cameras/Controls"),
		},
		pointcloud : {
			object: require("../js/demos/SineGravityCloud"),
		},
		grid : {
			object: require("../js/demos/Grid"),
		},
		// stats : {
		// 	object: require("../js/components/utils/Stats")
		// }
	}
};
},{"../js/components/cameras/Controls":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/cameras/Controls.js","../js/demos/Grid":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/Grid.js","../js/demos/SineGravityCloud":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/SineGravityCloud.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/manifests/texturePositionalMatrices.js":[function(require,module,exports){
module.exports = {
	name : "MeshGroup() Pre-Cursor 2",
	description : "Position matrices packed into a texture",
	order : 52,
	config : {
		camera : {
			x : -400
		}
	},
	objects : {
		controls : {
			object: require("../js/components/cameras/Controls"),
		},
		texturePositionalMatrices : {
			object: require("../js/demos/texturePositionalMatrices"),
		},
		grid : {
			object: require("../js/demos/Grid"),
		},
		stats : {
			object: require("../js/components/utils/Stats")
		}
	}
};
},{"../js/components/cameras/Controls":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/cameras/Controls.js","../js/components/utils/Stats":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/utils/Stats.js","../js/demos/Grid":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/Grid.js","../js/demos/texturePositionalMatrices":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/texturePositionalMatrices/index.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/manifests/uniformPositionalMatrices.js":[function(require,module,exports){
module.exports = {
	name : "MeshGroup() Pre-Cursor 1",
	description : "Position matrices set in uniforms",
	order : 51,
	config : {
		camera : {
			x : -400
		}
	},
	objects : {
		controls : {
			object: require("../js/components/cameras/Controls"),
		},
		uniformPositionalMatrices : {
			object: require("../js/demos/uniformPositionalMatrices"),
		},
		grid : {
			object: require("../js/demos/Grid"),
		},
		stats : {
			object: require("../js/components/utils/Stats")
		}
	}
};
},{"../js/components/cameras/Controls":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/cameras/Controls.js","../js/components/utils/Stats":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/utils/Stats.js","../js/demos/Grid":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/Grid.js","../js/demos/uniformPositionalMatrices":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/uniformPositionalMatrices/index.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/manifests/vr.js":[function(require,module,exports){
module.exports = {
	name : "VR Demo",
	description : "The Sine Gravity wave as a VR demo",
	order : 0,
	config : {
		camera : {
			x : -300,
			fov : 70
		},
		renderer : {
			useVR : true
		}
	},
	objects : {
		pointcloud : {
			object: require("../js/demos/SineGravityCloud"),
			properties: {
				count: 50 * 1000,
				pointSize : 4
			}
		},
		controls : {
			object: require("../js/components/cameras/Orientation"),
		},
		cameraRotation : {
			object: require("../js/components/cameras/RotateAroundOrigin"),
		},
		grid : {
			object: require("../js/demos/Grid"),
		}
	}
};
},{"../js/components/cameras/Orientation":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/cameras/Orientation.js","../js/components/cameras/RotateAroundOrigin":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/cameras/RotateAroundOrigin.js","../js/demos/Grid":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/Grid.js","../js/demos/SineGravityCloud":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/SineGravityCloud.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/crossroads/dist/crossroads.js":[function(require,module,exports){
/** @license
 * crossroads <http://millermedeiros.github.com/crossroads.js/>
 * Author: Miller Medeiros | MIT License
 * v0.12.0 (2013/01/21 13:47)
 */

(function () {
var factory = function (signals) {

    var crossroads,
        _hasOptionalGroupBug,
        UNDEF;

    // Helpers -----------
    //====================

    // IE 7-8 capture optional groups as empty strings while other browsers
    // capture as `undefined`
    _hasOptionalGroupBug = (/t(.+)?/).exec('t')[1] === '';

    function arrayIndexOf(arr, val) {
        if (arr.indexOf) {
            return arr.indexOf(val);
        } else {
            //Array.indexOf doesn't work on IE 6-7
            var n = arr.length;
            while (n--) {
                if (arr[n] === val) {
                    return n;
                }
            }
            return -1;
        }
    }

    function arrayRemove(arr, item) {
        var i = arrayIndexOf(arr, item);
        if (i !== -1) {
            arr.splice(i, 1);
        }
    }

    function isKind(val, kind) {
        return '[object '+ kind +']' === Object.prototype.toString.call(val);
    }

    function isRegExp(val) {
        return isKind(val, 'RegExp');
    }

    function isArray(val) {
        return isKind(val, 'Array');
    }

    function isFunction(val) {
        return typeof val === 'function';
    }

    //borrowed from AMD-utils
    function typecastValue(val) {
        var r;
        if (val === null || val === 'null') {
            r = null;
        } else if (val === 'true') {
            r = true;
        } else if (val === 'false') {
            r = false;
        } else if (val === UNDEF || val === 'undefined') {
            r = UNDEF;
        } else if (val === '' || isNaN(val)) {
            //isNaN('') returns false
            r = val;
        } else {
            //parseFloat(null || '') returns NaN
            r = parseFloat(val);
        }
        return r;
    }

    function typecastArrayValues(values) {
        var n = values.length,
            result = [];
        while (n--) {
            result[n] = typecastValue(values[n]);
        }
        return result;
    }

    //borrowed from AMD-Utils
    function decodeQueryString(str, shouldTypecast) {
        var queryArr = (str || '').replace('?', '').split('&'),
            n = queryArr.length,
            obj = {},
            item, val;
        while (n--) {
            item = queryArr[n].split('=');
            val = shouldTypecast ? typecastValue(item[1]) : item[1];
            obj[item[0]] = (typeof val === 'string')? decodeURIComponent(val) : val;
        }
        return obj;
    }


    // Crossroads --------
    //====================

    /**
     * @constructor
     */
    function Crossroads() {
        this.bypassed = new signals.Signal();
        this.routed = new signals.Signal();
        this._routes = [];
        this._prevRoutes = [];
        this._piped = [];
        this.resetState();
    }

    Crossroads.prototype = {

        greedy : false,

        greedyEnabled : true,

        ignoreCase : true,

        ignoreState : false,

        shouldTypecast : false,

        normalizeFn : null,

        resetState : function(){
            this._prevRoutes.length = 0;
            this._prevMatchedRequest = null;
            this._prevBypassedRequest = null;
        },

        create : function () {
            return new Crossroads();
        },

        addRoute : function (pattern, callback, priority) {
            var route = new Route(pattern, callback, priority, this);
            this._sortedInsert(route);
            return route;
        },

        removeRoute : function (route) {
            arrayRemove(this._routes, route);
            route._destroy();
        },

        removeAllRoutes : function () {
            var n = this.getNumRoutes();
            while (n--) {
                this._routes[n]._destroy();
            }
            this._routes.length = 0;
        },

        parse : function (request, defaultArgs) {
            request = request || '';
            defaultArgs = defaultArgs || [];

            // should only care about different requests if ignoreState isn't true
            if ( !this.ignoreState &&
                (request === this._prevMatchedRequest ||
                 request === this._prevBypassedRequest) ) {
                return;
            }

            var routes = this._getMatchedRoutes(request),
                i = 0,
                n = routes.length,
                cur;

            if (n) {
                this._prevMatchedRequest = request;

                this._notifyPrevRoutes(routes, request);
                this._prevRoutes = routes;
                //should be incremental loop, execute routes in order
                while (i < n) {
                    cur = routes[i];
                    cur.route.matched.dispatch.apply(cur.route.matched, defaultArgs.concat(cur.params));
                    cur.isFirst = !i;
                    this.routed.dispatch.apply(this.routed, defaultArgs.concat([request, cur]));
                    i += 1;
                }
            } else {
                this._prevBypassedRequest = request;
                this.bypassed.dispatch.apply(this.bypassed, defaultArgs.concat([request]));
            }

            this._pipeParse(request, defaultArgs);
        },

        _notifyPrevRoutes : function(matchedRoutes, request) {
            var i = 0, prev;
            while (prev = this._prevRoutes[i++]) {
                //check if switched exist since route may be disposed
                if(prev.route.switched && this._didSwitch(prev.route, matchedRoutes)) {
                    prev.route.switched.dispatch(request);
                }
            }
        },

        _didSwitch : function (route, matchedRoutes){
            var matched,
                i = 0;
            while (matched = matchedRoutes[i++]) {
                // only dispatch switched if it is going to a different route
                if (matched.route === route) {
                    return false;
                }
            }
            return true;
        },

        _pipeParse : function(request, defaultArgs) {
            var i = 0, route;
            while (route = this._piped[i++]) {
                route.parse(request, defaultArgs);
            }
        },

        getNumRoutes : function () {
            return this._routes.length;
        },

        _sortedInsert : function (route) {
            //simplified insertion sort
            var routes = this._routes,
                n = routes.length;
            do { --n; } while (routes[n] && route._priority <= routes[n]._priority);
            routes.splice(n+1, 0, route);
        },

        _getMatchedRoutes : function (request) {
            var res = [],
                routes = this._routes,
                n = routes.length,
                route;
            //should be decrement loop since higher priorities are added at the end of array
            while (route = routes[--n]) {
                if ((!res.length || this.greedy || route.greedy) && route.match(request)) {
                    res.push({
                        route : route,
                        params : route._getParamsArray(request)
                    });
                }
                if (!this.greedyEnabled && res.length) {
                    break;
                }
            }
            return res;
        },

        pipe : function (otherRouter) {
            this._piped.push(otherRouter);
        },

        unpipe : function (otherRouter) {
            arrayRemove(this._piped, otherRouter);
        },

        toString : function () {
            return '[crossroads numRoutes:'+ this.getNumRoutes() +']';
        }
    };

    //"static" instance
    crossroads = new Crossroads();
    crossroads.VERSION = '0.12.0';

    crossroads.NORM_AS_ARRAY = function (req, vals) {
        return [vals.vals_];
    };

    crossroads.NORM_AS_OBJECT = function (req, vals) {
        return [vals];
    };


    // Route --------------
    //=====================

    /**
     * @constructor
     */
    function Route(pattern, callback, priority, router) {
        var isRegexPattern = isRegExp(pattern),
            patternLexer = router.patternLexer;
        this._router = router;
        this._pattern = pattern;
        this._paramsIds = isRegexPattern? null : patternLexer.getParamIds(pattern);
        this._optionalParamsIds = isRegexPattern? null : patternLexer.getOptionalParamsIds(pattern);
        this._matchRegexp = isRegexPattern? pattern : patternLexer.compilePattern(pattern, router.ignoreCase);
        this.matched = new signals.Signal();
        this.switched = new signals.Signal();
        if (callback) {
            this.matched.add(callback);
        }
        this._priority = priority || 0;
    }

    Route.prototype = {

        greedy : false,

        rules : void(0),

        match : function (request) {
            request = request || '';
            return this._matchRegexp.test(request) && this._validateParams(request); //validate params even if regexp because of `request_` rule.
        },

        _validateParams : function (request) {
            var rules = this.rules,
                values = this._getParamsObject(request),
                key;
            for (key in rules) {
                // normalize_ isn't a validation rule... (#39)
                if(key !== 'normalize_' && rules.hasOwnProperty(key) && ! this._isValidParam(request, key, values)){
                    return false;
                }
            }
            return true;
        },

        _isValidParam : function (request, prop, values) {
            var validationRule = this.rules[prop],
                val = values[prop],
                isValid = false,
                isQuery = (prop.indexOf('?') === 0);

            if (val == null && this._optionalParamsIds && arrayIndexOf(this._optionalParamsIds, prop) !== -1) {
                isValid = true;
            }
            else if (isRegExp(validationRule)) {
                if (isQuery) {
                    val = values[prop +'_']; //use raw string
                }
                isValid = validationRule.test(val);
            }
            else if (isArray(validationRule)) {
                if (isQuery) {
                    val = values[prop +'_']; //use raw string
                }
                isValid = this._isValidArrayRule(validationRule, val);
            }
            else if (isFunction(validationRule)) {
                isValid = validationRule(val, request, values);
            }

            return isValid; //fail silently if validationRule is from an unsupported type
        },

        _isValidArrayRule : function (arr, val) {
            if (! this._router.ignoreCase) {
                return arrayIndexOf(arr, val) !== -1;
            }

            if (typeof val === 'string') {
                val = val.toLowerCase();
            }

            var n = arr.length,
                item,
                compareVal;

            while (n--) {
                item = arr[n];
                compareVal = (typeof item === 'string')? item.toLowerCase() : item;
                if (compareVal === val) {
                    return true;
                }
            }
            return false;
        },

        _getParamsObject : function (request) {
            var shouldTypecast = this._router.shouldTypecast,
                values = this._router.patternLexer.getParamValues(request, this._matchRegexp, shouldTypecast),
                o = {},
                n = values.length,
                param, val;
            while (n--) {
                val = values[n];
                if (this._paramsIds) {
                    param = this._paramsIds[n];
                    if (param.indexOf('?') === 0 && val) {
                        //make a copy of the original string so array and
                        //RegExp validation can be applied properly
                        o[param +'_'] = val;
                        //update vals_ array as well since it will be used
                        //during dispatch
                        val = decodeQueryString(val, shouldTypecast);
                        values[n] = val;
                    }
                    // IE will capture optional groups as empty strings while other
                    // browsers will capture `undefined` so normalize behavior.
                    // see: #gh-58, #gh-59, #gh-60
                    if ( _hasOptionalGroupBug && val === '' && arrayIndexOf(this._optionalParamsIds, param) !== -1 ) {
                        val = void(0);
                        values[n] = val;
                    }
                    o[param] = val;
                }
                //alias to paths and for RegExp pattern
                o[n] = val;
            }
            o.request_ = shouldTypecast? typecastValue(request) : request;
            o.vals_ = values;
            return o;
        },

        _getParamsArray : function (request) {
            var norm = this.rules? this.rules.normalize_ : null,
                params;
            norm = norm || this._router.normalizeFn; // default normalize
            if (norm && isFunction(norm)) {
                params = norm(request, this._getParamsObject(request));
            } else {
                params = this._getParamsObject(request).vals_;
            }
            return params;
        },

        interpolate : function(replacements) {
            var str = this._router.patternLexer.interpolate(this._pattern, replacements);
            if (! this._validateParams(str) ) {
                throw new Error('Generated string doesn\'t validate against `Route.rules`.');
            }
            return str;
        },

        dispose : function () {
            this._router.removeRoute(this);
        },

        _destroy : function () {
            this.matched.dispose();
            this.switched.dispose();
            this.matched = this.switched = this._pattern = this._matchRegexp = null;
        },

        toString : function () {
            return '[Route pattern:"'+ this._pattern +'", numListeners:'+ this.matched.getNumListeners() +']';
        }

    };



    // Pattern Lexer ------
    //=====================

    Crossroads.prototype.patternLexer = (function () {

        var
            //match chars that should be escaped on string regexp
            ESCAPE_CHARS_REGEXP = /[\\.+*?\^$\[\](){}\/'#]/g,

            //trailing slashes (begin/end of string)
            LOOSE_SLASHES_REGEXP = /^\/|\/$/g,
            LEGACY_SLASHES_REGEXP = /\/$/g,

            //params - everything between `{ }` or `: :`
            PARAMS_REGEXP = /(?:\{|:)([^}:]+)(?:\}|:)/g,

            //used to save params during compile (avoid escaping things that
            //shouldn't be escaped).
            TOKENS = {
                'OS' : {
                    //optional slashes
                    //slash between `::` or `}:` or `\w:` or `:{?` or `}{?` or `\w{?`
                    rgx : /([:}]|\w(?=\/))\/?(:|(?:\{\?))/g,
                    save : '$1{{id}}$2',
                    res : '\\/?'
                },
                'RS' : {
                    //required slashes
                    //used to insert slash between `:{` and `}{`
                    rgx : /([:}])\/?(\{)/g,
                    save : '$1{{id}}$2',
                    res : '\\/'
                },
                'RQ' : {
                    //required query string - everything in between `{? }`
                    rgx : /\{\?([^}]+)\}/g,
                    //everything from `?` till `#` or end of string
                    res : '\\?([^#]+)'
                },
                'OQ' : {
                    //optional query string - everything in between `:? :`
                    rgx : /:\?([^:]+):/g,
                    //everything from `?` till `#` or end of string
                    res : '(?:\\?([^#]*))?'
                },
                'OR' : {
                    //optional rest - everything in between `: *:`
                    rgx : /:([^:]+)\*:/g,
                    res : '(.*)?' // optional group to avoid passing empty string as captured
                },
                'RR' : {
                    //rest param - everything in between `{ *}`
                    rgx : /\{([^}]+)\*\}/g,
                    res : '(.+)'
                },
                // required/optional params should come after rest segments
                'RP' : {
                    //required params - everything between `{ }`
                    rgx : /\{([^}]+)\}/g,
                    res : '([^\\/?]+)'
                },
                'OP' : {
                    //optional params - everything between `: :`
                    rgx : /:([^:]+):/g,
                    res : '([^\\/?]+)?\/?'
                }
            },

            LOOSE_SLASH = 1,
            STRICT_SLASH = 2,
            LEGACY_SLASH = 3,

            _slashMode = LOOSE_SLASH;


        function precompileTokens(){
            var key, cur;
            for (key in TOKENS) {
                if (TOKENS.hasOwnProperty(key)) {
                    cur = TOKENS[key];
                    cur.id = '__CR_'+ key +'__';
                    cur.save = ('save' in cur)? cur.save.replace('{{id}}', cur.id) : cur.id;
                    cur.rRestore = new RegExp(cur.id, 'g');
                }
            }
        }
        precompileTokens();


        function captureVals(regex, pattern) {
            var vals = [], match;
            // very important to reset lastIndex since RegExp can have "g" flag
            // and multiple runs might affect the result, specially if matching
            // same string multiple times on IE 7-8
            regex.lastIndex = 0;
            while (match = regex.exec(pattern)) {
                vals.push(match[1]);
            }
            return vals;
        }

        function getParamIds(pattern) {
            return captureVals(PARAMS_REGEXP, pattern);
        }

        function getOptionalParamsIds(pattern) {
            return captureVals(TOKENS.OP.rgx, pattern);
        }

        function compilePattern(pattern, ignoreCase) {
            pattern = pattern || '';

            if(pattern){
                if (_slashMode === LOOSE_SLASH) {
                    pattern = pattern.replace(LOOSE_SLASHES_REGEXP, '');
                }
                else if (_slashMode === LEGACY_SLASH) {
                    pattern = pattern.replace(LEGACY_SLASHES_REGEXP, '');
                }

                //save tokens
                pattern = replaceTokens(pattern, 'rgx', 'save');
                //regexp escape
                pattern = pattern.replace(ESCAPE_CHARS_REGEXP, '\\$&');
                //restore tokens
                pattern = replaceTokens(pattern, 'rRestore', 'res');

                if (_slashMode === LOOSE_SLASH) {
                    pattern = '\\/?'+ pattern;
                }
            }

            if (_slashMode !== STRICT_SLASH) {
                //single slash is treated as empty and end slash is optional
                pattern += '\\/?';
            }
            return new RegExp('^'+ pattern + '$', ignoreCase? 'i' : '');
        }

        function replaceTokens(pattern, regexpName, replaceName) {
            var cur, key;
            for (key in TOKENS) {
                if (TOKENS.hasOwnProperty(key)) {
                    cur = TOKENS[key];
                    pattern = pattern.replace(cur[regexpName], cur[replaceName]);
                }
            }
            return pattern;
        }

        function getParamValues(request, regexp, shouldTypecast) {
            var vals = regexp.exec(request);
            if (vals) {
                vals.shift();
                if (shouldTypecast) {
                    vals = typecastArrayValues(vals);
                }
            }
            return vals;
        }

        function interpolate(pattern, replacements) {
            if (typeof pattern !== 'string') {
                throw new Error('Route pattern should be a string.');
            }

            var replaceFn = function(match, prop){
                    var val;
                    prop = (prop.substr(0, 1) === '?')? prop.substr(1) : prop;
                    if (replacements[prop] != null) {
                        if (typeof replacements[prop] === 'object') {
                            var queryParts = [];
                            for(var key in replacements[prop]) {
                                queryParts.push(encodeURI(key + '=' + replacements[prop][key]));
                            }
                            val = '?' + queryParts.join('&');
                        } else {
                            // make sure value is a string see #gh-54
                            val = String(replacements[prop]);
                        }

                        if (match.indexOf('*') === -1 && val.indexOf('/') !== -1) {
                            throw new Error('Invalid value "'+ val +'" for segment "'+ match +'".');
                        }
                    }
                    else if (match.indexOf('{') !== -1) {
                        throw new Error('The segment '+ match +' is required.');
                    }
                    else {
                        val = '';
                    }
                    return val;
                };

            if (! TOKENS.OS.trail) {
                TOKENS.OS.trail = new RegExp('(?:'+ TOKENS.OS.id +')+$');
            }

            return pattern
                        .replace(TOKENS.OS.rgx, TOKENS.OS.save)
                        .replace(PARAMS_REGEXP, replaceFn)
                        .replace(TOKENS.OS.trail, '') // remove trailing
                        .replace(TOKENS.OS.rRestore, '/'); // add slash between segments
        }

        //API
        return {
            strict : function(){
                _slashMode = STRICT_SLASH;
            },
            loose : function(){
                _slashMode = LOOSE_SLASH;
            },
            legacy : function(){
                _slashMode = LEGACY_SLASH;
            },
            getParamIds : getParamIds,
            getOptionalParamsIds : getOptionalParamsIds,
            getParamValues : getParamValues,
            compilePattern : compilePattern,
            interpolate : interpolate
        };

    }());


    return crossroads;
};

if (typeof define === 'function' && define.amd) {
    define(['signals'], factory);
} else if (typeof module !== 'undefined' && module.exports) { //Node
    module.exports = factory(require('signals'));
} else {
    /*jshint sub:true */
    window['crossroads'] = factory(window['signals']);
}

}());


},{"signals":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/crossroads/node_modules/signals/dist/signals.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/crossroads/node_modules/signals/dist/signals.js":[function(require,module,exports){
/*jslint onevar:true, undef:true, newcap:true, regexp:true, bitwise:true, maxerr:50, indent:4, white:false, nomen:false, plusplus:false */
/*global define:false, require:false, exports:false, module:false, signals:false */

/** @license
 * JS Signals <http://millermedeiros.github.com/js-signals/>
 * Released under the MIT license
 * Author: Miller Medeiros
 * Version: 1.0.0 - Build: 268 (2012/11/29 05:48 PM)
 */

(function(global){

    // SignalBinding -------------------------------------------------
    //================================================================

    /**
     * Object that represents a binding between a Signal and a listener function.
     * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
     * <br />- inspired by Joa Ebert AS3 SignalBinding and Robert Penner's Slot classes.
     * @author Miller Medeiros
     * @constructor
     * @internal
     * @name SignalBinding
     * @param {Signal} signal Reference to Signal object that listener is currently bound to.
     * @param {Function} listener Handler function bound to the signal.
     * @param {boolean} isOnce If binding should be executed just once.
     * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
     * @param {Number} [priority] The priority level of the event listener. (default = 0).
     */
    function SignalBinding(signal, listener, isOnce, listenerContext, priority) {

        /**
         * Handler function bound to the signal.
         * @type Function
         * @private
         */
        this._listener = listener;

        /**
         * If binding should be executed just once.
         * @type boolean
         * @private
         */
        this._isOnce = isOnce;

        /**
         * Context on which listener will be executed (object that should represent the `this` variable inside listener function).
         * @memberOf SignalBinding.prototype
         * @name context
         * @type Object|undefined|null
         */
        this.context = listenerContext;

        /**
         * Reference to Signal object that listener is currently bound to.
         * @type Signal
         * @private
         */
        this._signal = signal;

        /**
         * Listener priority
         * @type Number
         * @private
         */
        this._priority = priority || 0;
    }

    SignalBinding.prototype = {

        /**
         * If binding is active and should be executed.
         * @type boolean
         */
        active : true,

        /**
         * Default parameters passed to listener during `Signal.dispatch` and `SignalBinding.execute`. (curried parameters)
         * @type Array|null
         */
        params : null,

        /**
         * Call listener passing arbitrary parameters.
         * <p>If binding was added using `Signal.addOnce()` it will be automatically removed from signal dispatch queue, this method is used internally for the signal dispatch.</p>
         * @param {Array} [paramsArr] Array of parameters that should be passed to the listener
         * @return {*} Value returned by the listener.
         */
        execute : function (paramsArr) {
            var handlerReturn, params;
            if (this.active && !!this._listener) {
                params = this.params? this.params.concat(paramsArr) : paramsArr;
                handlerReturn = this._listener.apply(this.context, params);
                if (this._isOnce) {
                    this.detach();
                }
            }
            return handlerReturn;
        },

        /**
         * Detach binding from signal.
         * - alias to: mySignal.remove(myBinding.getListener());
         * @return {Function|null} Handler function bound to the signal or `null` if binding was previously detached.
         */
        detach : function () {
            return this.isBound()? this._signal.remove(this._listener, this.context) : null;
        },

        /**
         * @return {Boolean} `true` if binding is still bound to the signal and have a listener.
         */
        isBound : function () {
            return (!!this._signal && !!this._listener);
        },

        /**
         * @return {boolean} If SignalBinding will only be executed once.
         */
        isOnce : function () {
            return this._isOnce;
        },

        /**
         * @return {Function} Handler function bound to the signal.
         */
        getListener : function () {
            return this._listener;
        },

        /**
         * @return {Signal} Signal that listener is currently bound to.
         */
        getSignal : function () {
            return this._signal;
        },

        /**
         * Delete instance properties
         * @private
         */
        _destroy : function () {
            delete this._signal;
            delete this._listener;
            delete this.context;
        },

        /**
         * @return {string} String representation of the object.
         */
        toString : function () {
            return '[SignalBinding isOnce:' + this._isOnce +', isBound:'+ this.isBound() +', active:' + this.active + ']';
        }

    };


/*global SignalBinding:false*/

    // Signal --------------------------------------------------------
    //================================================================

    function validateListener(listener, fnName) {
        if (typeof listener !== 'function') {
            throw new Error( 'listener is a required param of {fn}() and should be a Function.'.replace('{fn}', fnName) );
        }
    }

    /**
     * Custom event broadcaster
     * <br />- inspired by Robert Penner's AS3 Signals.
     * @name Signal
     * @author Miller Medeiros
     * @constructor
     */
    function Signal() {
        /**
         * @type Array.<SignalBinding>
         * @private
         */
        this._bindings = [];
        this._prevParams = null;

        // enforce dispatch to aways work on same context (#47)
        var self = this;
        this.dispatch = function(){
            Signal.prototype.dispatch.apply(self, arguments);
        };
    }

    Signal.prototype = {

        /**
         * Signals Version Number
         * @type String
         * @const
         */
        VERSION : '1.0.0',

        /**
         * If Signal should keep record of previously dispatched parameters and
         * automatically execute listener during `add()`/`addOnce()` if Signal was
         * already dispatched before.
         * @type boolean
         */
        memorize : false,

        /**
         * @type boolean
         * @private
         */
        _shouldPropagate : true,

        /**
         * If Signal is active and should broadcast events.
         * <p><strong>IMPORTANT:</strong> Setting this property during a dispatch will only affect the next dispatch, if you want to stop the propagation of a signal use `halt()` instead.</p>
         * @type boolean
         */
        active : true,

        /**
         * @param {Function} listener
         * @param {boolean} isOnce
         * @param {Object} [listenerContext]
         * @param {Number} [priority]
         * @return {SignalBinding}
         * @private
         */
        _registerListener : function (listener, isOnce, listenerContext, priority) {

            var prevIndex = this._indexOfListener(listener, listenerContext),
                binding;

            if (prevIndex !== -1) {
                binding = this._bindings[prevIndex];
                if (binding.isOnce() !== isOnce) {
                    throw new Error('You cannot add'+ (isOnce? '' : 'Once') +'() then add'+ (!isOnce? '' : 'Once') +'() the same listener without removing the relationship first.');
                }
            } else {
                binding = new SignalBinding(this, listener, isOnce, listenerContext, priority);
                this._addBinding(binding);
            }

            if(this.memorize && this._prevParams){
                binding.execute(this._prevParams);
            }

            return binding;
        },

        /**
         * @param {SignalBinding} binding
         * @private
         */
        _addBinding : function (binding) {
            //simplified insertion sort
            var n = this._bindings.length;
            do { --n; } while (this._bindings[n] && binding._priority <= this._bindings[n]._priority);
            this._bindings.splice(n + 1, 0, binding);
        },

        /**
         * @param {Function} listener
         * @return {number}
         * @private
         */
        _indexOfListener : function (listener, context) {
            var n = this._bindings.length,
                cur;
            while (n--) {
                cur = this._bindings[n];
                if (cur._listener === listener && cur.context === context) {
                    return n;
                }
            }
            return -1;
        },

        /**
         * Check if listener was attached to Signal.
         * @param {Function} listener
         * @param {Object} [context]
         * @return {boolean} if Signal has the specified listener.
         */
        has : function (listener, context) {
            return this._indexOfListener(listener, context) !== -1;
        },

        /**
         * Add a listener to the signal.
         * @param {Function} listener Signal handler function.
         * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
         * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
         * @return {SignalBinding} An Object representing the binding between the Signal and listener.
         */
        add : function (listener, listenerContext, priority) {
            validateListener(listener, 'add');
            return this._registerListener(listener, false, listenerContext, priority);
        },

        /**
         * Add listener to the signal that should be removed after first execution (will be executed only once).
         * @param {Function} listener Signal handler function.
         * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
         * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
         * @return {SignalBinding} An Object representing the binding between the Signal and listener.
         */
        addOnce : function (listener, listenerContext, priority) {
            validateListener(listener, 'addOnce');
            return this._registerListener(listener, true, listenerContext, priority);
        },

        /**
         * Remove a single listener from the dispatch queue.
         * @param {Function} listener Handler function that should be removed.
         * @param {Object} [context] Execution context (since you can add the same handler multiple times if executing in a different context).
         * @return {Function} Listener handler function.
         */
        remove : function (listener, context) {
            validateListener(listener, 'remove');

            var i = this._indexOfListener(listener, context);
            if (i !== -1) {
                this._bindings[i]._destroy(); //no reason to a SignalBinding exist if it isn't attached to a signal
                this._bindings.splice(i, 1);
            }
            return listener;
        },

        /**
         * Remove all listeners from the Signal.
         */
        removeAll : function () {
            var n = this._bindings.length;
            while (n--) {
                this._bindings[n]._destroy();
            }
            this._bindings.length = 0;
        },

        /**
         * @return {number} Number of listeners attached to the Signal.
         */
        getNumListeners : function () {
            return this._bindings.length;
        },

        /**
         * Stop propagation of the event, blocking the dispatch to next listeners on the queue.
         * <p><strong>IMPORTANT:</strong> should be called only during signal dispatch, calling it before/after dispatch won't affect signal broadcast.</p>
         * @see Signal.prototype.disable
         */
        halt : function () {
            this._shouldPropagate = false;
        },

        /**
         * Dispatch/Broadcast Signal to all listeners added to the queue.
         * @param {...*} [params] Parameters that should be passed to each handler.
         */
        dispatch : function (params) {
            if (! this.active) {
                return;
            }

            var paramsArr = Array.prototype.slice.call(arguments),
                n = this._bindings.length,
                bindings;

            if (this.memorize) {
                this._prevParams = paramsArr;
            }

            if (! n) {
                //should come after memorize
                return;
            }

            bindings = this._bindings.slice(); //clone array in case add/remove items during dispatch
            this._shouldPropagate = true; //in case `halt` was called before dispatch or during the previous dispatch.

            //execute all callbacks until end of the list or until a callback returns `false` or stops propagation
            //reverse loop since listeners with higher priority will be added at the end of the list
            do { n--; } while (bindings[n] && this._shouldPropagate && bindings[n].execute(paramsArr) !== false);
        },

        /**
         * Forget memorized arguments.
         * @see Signal.memorize
         */
        forget : function(){
            this._prevParams = null;
        },

        /**
         * Remove all bindings from signal and destroy any reference to external objects (destroy Signal object).
         * <p><strong>IMPORTANT:</strong> calling any method on the signal instance after calling dispose will throw errors.</p>
         */
        dispose : function () {
            this.removeAll();
            delete this._bindings;
            delete this._prevParams;
        },

        /**
         * @return {string} String representation of the object.
         */
        toString : function () {
            return '[Signal active:'+ this.active +' numListeners:'+ this.getNumListeners() +']';
        }

    };


    // Namespace -----------------------------------------------------
    //================================================================

    /**
     * Signals namespace
     * @namespace
     * @name signals
     */
    var signals = Signal;

    /**
     * Custom event broadcaster
     * @see Signal
     */
    // alias for backwards compatibility (see #gh-44)
    signals.Signal = Signal;



    //exports to multiple environments
    if(typeof define === 'function' && define.amd){ //AMD
        define(function () { return signals; });
    } else if (typeof module !== 'undefined' && module.exports){ //node
        module.exports = signals;
    } else { //browser
        //use string because of Google closure compiler ADVANCED_MODE
        /*jslint sub:true */
        global['signals'] = signals;
    }

}(this));

},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/glslify/browser.js":[function(require,module,exports){
module.exports = noop

function noop() {
  throw new Error(
      'You should bundle your code ' +
      'using `glslify` as a transform.'
  )
}

},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/glslify/simple-adapter.js":[function(require,module,exports){
module.exports = programify

function programify(vertex, fragment, uniforms, attributes) {
  return {
    vertex: vertex, 
    fragment: fragment,
    uniforms: uniforms, 
    attributes: attributes
  };
}

},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/gulpfile/node_modules/browserify/lib/_empty.js":[function(require,module,exports){

},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/gulpfile/node_modules/browserify/node_modules/process/browser.js":[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
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
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/gulpfile/node_modules/browserify/node_modules/querystring-es3/decode.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/gulpfile/node_modules/browserify/node_modules/querystring-es3/encode.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/gulpfile/node_modules/browserify/node_modules/querystring-es3/index.js":[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/gulpfile/node_modules/browserify/node_modules/querystring-es3/decode.js","./encode":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/gulpfile/node_modules/browserify/node_modules/querystring-es3/encode.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/hasher/dist/js/hasher.js":[function(require,module,exports){
/*!!
 * Hasher <http://github.com/millermedeiros/hasher>
 * @author Miller Medeiros
 * @version 1.2.0 (2013/11/11 03:18 PM)
 * Released under the MIT License
 */

;(function () {
var factory = function(signals){

/*jshint white:false*/
/*global signals:false, window:false*/

/**
 * Hasher
 * @namespace History Manager for rich-media applications.
 * @name hasher
 */
var hasher = (function(window){

    //--------------------------------------------------------------------------------------
    // Private Vars
    //--------------------------------------------------------------------------------------

    var

        // frequency that it will check hash value on IE 6-7 since it doesn't
        // support the hashchange event
        POOL_INTERVAL = 25,

        // local storage for brevity and better compression --------------------------------

        document = window.document,
        history = window.history,
        Signal = signals.Signal,

        // local vars ----------------------------------------------------------------------

        hasher,
        _hash,
        _checkInterval,
        _isActive,
        _frame, //iframe used for legacy IE (6-7)
        _checkHistory,
        _hashValRegexp = /#(.*)$/,
        _baseUrlRegexp = /(\?.*)|(\#.*)/,
        _hashRegexp = /^\#/,

        // sniffing/feature detection -------------------------------------------------------

        //hack based on this: http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
        _isIE = (!+"\v1"),
        // hashchange is supported by FF3.6+, IE8+, Chrome 5+, Safari 5+ but
        // feature detection fails on IE compatibility mode, so we need to
        // check documentMode
        _isHashChangeSupported = ('onhashchange' in window) && document.documentMode !== 7,
        //check if is IE6-7 since hash change is only supported on IE8+ and
        //changing hash value on IE6-7 doesn't generate history record.
        _isLegacyIE = _isIE && !_isHashChangeSupported,
        _isLocal = (location.protocol === 'file:');


    //--------------------------------------------------------------------------------------
    // Private Methods
    //--------------------------------------------------------------------------------------

    function _escapeRegExp(str){
        return String(str || '').replace(/\W/g, "\\$&");
    }

    function _trimHash(hash){
        if (!hash) return '';
        var regexp = new RegExp('^' + _escapeRegExp(hasher.prependHash) + '|' + _escapeRegExp(hasher.appendHash) + '$', 'g');
        return hash.replace(regexp, '');
    }

    function _getWindowHash(){
        //parsed full URL instead of getting window.location.hash because Firefox decode hash value (and all the other browsers don't)
        //also because of IE8 bug with hash query in local file [issue #6]
        var result = _hashValRegexp.exec( hasher.getURL() );
        var path = (result && result[1]) || '';
        try {
          return hasher.raw? path : decodeURIComponent(path);
        } catch (e) {
          // in case user did not set `hasher.raw` and decodeURIComponent
          // throws an error (see #57)
          return path;
        }
    }

    function _getFrameHash(){
        return (_frame)? _frame.contentWindow.frameHash : null;
    }

    function _createFrame(){
        _frame = document.createElement('iframe');
        _frame.src = 'about:blank';
        _frame.style.display = 'none';
        document.body.appendChild(_frame);
    }

    function _updateFrame(){
        if(_frame && _hash !== _getFrameHash()){
            var frameDoc = _frame.contentWindow.document;
            frameDoc.open();
            //update iframe content to force new history record.
            //based on Really Simple History, SWFAddress and YUI.history.
            frameDoc.write('<html><head><title>' + document.title + '</title><script type="text/javascript">var frameHash="' + _hash + '";</script></head><body>&nbsp;</body></html>');
            frameDoc.close();
        }
    }

    function _registerChange(newHash, isReplace){
        if(_hash !== newHash){
            var oldHash = _hash;
            _hash = newHash; //should come before event dispatch to make sure user can get proper value inside event handler
            if(_isLegacyIE){
                if(!isReplace){
                    _updateFrame();
                } else {
                    _frame.contentWindow.frameHash = newHash;
                }
            }
            hasher.changed.dispatch(_trimHash(newHash), _trimHash(oldHash));
        }
    }

    if (_isLegacyIE) {
        /**
         * @private
         */
        _checkHistory = function(){
            var windowHash = _getWindowHash(),
                frameHash = _getFrameHash();
            if(frameHash !== _hash && frameHash !== windowHash){
                //detect changes made pressing browser history buttons.
                //Workaround since history.back() and history.forward() doesn't
                //update hash value on IE6/7 but updates content of the iframe.
                //needs to trim hash since value stored already have
                //prependHash + appendHash for fast check.
                hasher.setHash(_trimHash(frameHash));
            } else if (windowHash !== _hash){
                //detect if hash changed (manually or using setHash)
                _registerChange(windowHash);
            }
        };
    } else {
        /**
         * @private
         */
        _checkHistory = function(){
            var windowHash = _getWindowHash();
            if(windowHash !== _hash){
                _registerChange(windowHash);
            }
        };
    }

    function _addListener(elm, eType, fn){
        if(elm.addEventListener){
            elm.addEventListener(eType, fn, false);
        } else if (elm.attachEvent){
            elm.attachEvent('on' + eType, fn);
        }
    }

    function _removeListener(elm, eType, fn){
        if(elm.removeEventListener){
            elm.removeEventListener(eType, fn, false);
        } else if (elm.detachEvent){
            elm.detachEvent('on' + eType, fn);
        }
    }

    function _makePath(paths){
        paths = Array.prototype.slice.call(arguments);

        var path = paths.join(hasher.separator);
        path = path? hasher.prependHash + path.replace(_hashRegexp, '') + hasher.appendHash : path;
        return path;
    }

    function _encodePath(path){
        //used encodeURI instead of encodeURIComponent to preserve '?', '/',
        //'#'. Fixes Safari bug [issue #8]
        path = encodeURI(path);
        if(_isIE && _isLocal){
            //fix IE8 local file bug [issue #6]
            path = path.replace(/\?/, '%3F');
        }
        return path;
    }

    //--------------------------------------------------------------------------------------
    // Public (API)
    //--------------------------------------------------------------------------------------

    hasher = /** @lends hasher */ {

        /**
         * hasher Version Number
         * @type string
         * @constant
         */
        VERSION : '1.2.0',

        /**
         * Boolean deciding if hasher encodes/decodes the hash or not.
         * <ul>
         * <li>default value: false;</li>
         * </ul>
         * @type boolean
         */
        raw : false,

        /**
         * String that should always be added to the end of Hash value.
         * <ul>
         * <li>default value: '';</li>
         * <li>will be automatically removed from `hasher.getHash()`</li>
         * <li>avoid conflicts with elements that contain ID equal to hash value;</li>
         * </ul>
         * @type string
         */
        appendHash : '',

        /**
         * String that should always be added to the beginning of Hash value.
         * <ul>
         * <li>default value: '/';</li>
         * <li>will be automatically removed from `hasher.getHash()`</li>
         * <li>avoid conflicts with elements that contain ID equal to hash value;</li>
         * </ul>
         * @type string
         */
        prependHash : '/',

        /**
         * String used to split hash paths; used by `hasher.getHashAsArray()` to split paths.
         * <ul>
         * <li>default value: '/';</li>
         * </ul>
         * @type string
         */
        separator : '/',

        /**
         * Signal dispatched when hash value changes.
         * - pass current hash as 1st parameter to listeners and previous hash value as 2nd parameter.
         * @type signals.Signal
         */
        changed : new Signal(),

        /**
         * Signal dispatched when hasher is stopped.
         * -  pass current hash as first parameter to listeners
         * @type signals.Signal
         */
        stopped : new Signal(),

        /**
         * Signal dispatched when hasher is initialized.
         * - pass current hash as first parameter to listeners.
         * @type signals.Signal
         */
        initialized : new Signal(),

        /**
         * Start listening/dispatching changes in the hash/history.
         * <ul>
         *   <li>hasher won't dispatch CHANGE events by manually typing a new value or pressing the back/forward buttons before calling this method.</li>
         * </ul>
         */
        init : function(){
            if(_isActive) return;

            _hash = _getWindowHash();

            //thought about branching/overloading hasher.init() to avoid checking multiple times but
            //don't think worth doing it since it probably won't be called multiple times.
            if(_isHashChangeSupported){
                _addListener(window, 'hashchange', _checkHistory);
            }else {
                if(_isLegacyIE){
                    if(! _frame){
                        _createFrame();
                    }
                    _updateFrame();
                }
                _checkInterval = setInterval(_checkHistory, POOL_INTERVAL);
            }

            _isActive = true;
            hasher.initialized.dispatch(_trimHash(_hash));
        },

        /**
         * Stop listening/dispatching changes in the hash/history.
         * <ul>
         *   <li>hasher won't dispatch CHANGE events by manually typing a new value or pressing the back/forward buttons after calling this method, unless you call hasher.init() again.</li>
         *   <li>hasher will still dispatch changes made programatically by calling hasher.setHash();</li>
         * </ul>
         */
        stop : function(){
            if(! _isActive) return;

            if(_isHashChangeSupported){
                _removeListener(window, 'hashchange', _checkHistory);
            }else{
                clearInterval(_checkInterval);
                _checkInterval = null;
            }

            _isActive = false;
            hasher.stopped.dispatch(_trimHash(_hash));
        },

        /**
         * @return {boolean}    If hasher is listening to changes on the browser history and/or hash value.
         */
        isActive : function(){
            return _isActive;
        },

        /**
         * @return {string} Full URL.
         */
        getURL : function(){
            return window.location.href;
        },

        /**
         * @return {string} Retrieve URL without query string and hash.
         */
        getBaseURL : function(){
            return hasher.getURL().replace(_baseUrlRegexp, ''); //removes everything after '?' and/or '#'
        },

        /**
         * Set Hash value, generating a new history record.
         * @param {...string} path    Hash value without '#'. Hasher will join
         * path segments using `hasher.separator` and prepend/append hash value
         * with `hasher.appendHash` and `hasher.prependHash`
         * @example hasher.setHash('lorem', 'ipsum', 'dolor') -> '#/lorem/ipsum/dolor'
         */
        setHash : function(path){
            path = _makePath.apply(null, arguments);
            if(path !== _hash){
                // we should store raw value
                _registerChange(path);
                if (path === _hash) {
                    // we check if path is still === _hash to avoid error in
                    // case of multiple consecutive redirects [issue #39]
                    if (! hasher.raw) {
                        path = _encodePath(path);
                    }
                    window.location.hash = '#' + path;
                }
            }
        },

        /**
         * Set Hash value without keeping previous hash on the history record.
         * Similar to calling `window.location.replace("#/hash")` but will also work on IE6-7.
         * @param {...string} path    Hash value without '#'. Hasher will join
         * path segments using `hasher.separator` and prepend/append hash value
         * with `hasher.appendHash` and `hasher.prependHash`
         * @example hasher.replaceHash('lorem', 'ipsum', 'dolor') -> '#/lorem/ipsum/dolor'
         */
        replaceHash : function(path){
            path = _makePath.apply(null, arguments);
            if(path !== _hash){
                // we should store raw value
                _registerChange(path, true);
                if (path === _hash) {
                    // we check if path is still === _hash to avoid error in
                    // case of multiple consecutive redirects [issue #39]
                    if (! hasher.raw) {
                        path = _encodePath(path);
                    }
                    window.location.replace('#' + path);
                }
            }
        },

        /**
         * @return {string} Hash value without '#', `hasher.appendHash` and `hasher.prependHash`.
         */
        getHash : function(){
            //didn't used actual value of the `window.location.hash` to avoid breaking the application in case `window.location.hash` isn't available and also because value should always be synched.
            return _trimHash(_hash);
        },

        /**
         * @return {Array.<string>} Hash value split into an Array.
         */
        getHashAsArray : function(){
            return hasher.getHash().split(hasher.separator);
        },

        /**
         * Removes all event listeners, stops hasher and destroy hasher object.
         * - IMPORTANT: hasher won't work after calling this method, hasher Object will be deleted.
         */
        dispose : function(){
            hasher.stop();
            hasher.initialized.dispose();
            hasher.stopped.dispose();
            hasher.changed.dispose();
            _frame = hasher = window.hasher = null;
        },

        /**
         * @return {string} A string representation of the object.
         */
        toString : function(){
            return '[hasher version="'+ hasher.VERSION +'" hash="'+ hasher.getHash() +'"]';
        }

    };

    hasher.initialized.memorize = true; //see #33

    return hasher;

}(window));


    return hasher;
};

if (typeof define === 'function' && define.amd) {
    define(['signals'], factory);
} else if (typeof exports === 'object') {
    module.exports = factory(require('signals'));
} else {
    /*jshint sub:true */
    window['hasher'] = factory(window['signals']);
}

}());

},{"signals":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/hasher/node_modules/signals/dist/signals.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/hasher/node_modules/signals/dist/signals.js":[function(require,module,exports){
module.exports=require("/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/crossroads/node_modules/signals/dist/signals.js")
},{"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/crossroads/node_modules/signals/dist/signals.js":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/crossroads/node_modules/signals/dist/signals.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/localforage/node_modules/promise/core.js":[function(require,module,exports){
'use strict';

var asap = require('asap')

module.exports = Promise
function Promise(fn) {
  if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new')
  if (typeof fn !== 'function') throw new TypeError('not a function')
  var state = null
  var value = null
  var deferreds = []
  var self = this

  this.then = function(onFulfilled, onRejected) {
    return new Promise(function(resolve, reject) {
      handle(new Handler(onFulfilled, onRejected, resolve, reject))
    })
  }

  function handle(deferred) {
    if (state === null) {
      deferreds.push(deferred)
      return
    }
    asap(function() {
      var cb = state ? deferred.onFulfilled : deferred.onRejected
      if (cb === null) {
        (state ? deferred.resolve : deferred.reject)(value)
        return
      }
      var ret
      try {
        ret = cb(value)
      }
      catch (e) {
        deferred.reject(e)
        return
      }
      deferred.resolve(ret)
    })
  }

  function resolve(newValue) {
    try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.')
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then
        if (typeof then === 'function') {
          doResolve(then.bind(newValue), resolve, reject)
          return
        }
      }
      state = true
      value = newValue
      finale()
    } catch (e) { reject(e) }
  }

  function reject(newValue) {
    state = false
    value = newValue
    finale()
  }

  function finale() {
    for (var i = 0, len = deferreds.length; i < len; i++)
      handle(deferreds[i])
    deferreds = null
  }

  doResolve(fn, resolve, reject)
}


function Handler(onFulfilled, onRejected, resolve, reject){
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null
  this.onRejected = typeof onRejected === 'function' ? onRejected : null
  this.resolve = resolve
  this.reject = reject
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, onFulfilled, onRejected) {
  var done = false;
  try {
    fn(function (value) {
      if (done) return
      done = true
      onFulfilled(value)
    }, function (reason) {
      if (done) return
      done = true
      onRejected(reason)
    })
  } catch (ex) {
    if (done) return
    done = true
    onRejected(ex)
  }
}

},{"asap":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/localforage/node_modules/promise/node_modules/asap/asap.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/localforage/node_modules/promise/index.js":[function(require,module,exports){
'use strict';

//This file contains then/promise specific extensions to the core promise API

var Promise = require('./core.js')
var asap = require('asap')

module.exports = Promise

/* Static Functions */

function ValuePromise(value) {
  this.then = function (onFulfilled) {
    if (typeof onFulfilled !== 'function') return this
    return new Promise(function (resolve, reject) {
      asap(function () {
        try {
          resolve(onFulfilled(value))
        } catch (ex) {
          reject(ex);
        }
      })
    })
  }
}
ValuePromise.prototype = Object.create(Promise.prototype)

var TRUE = new ValuePromise(true)
var FALSE = new ValuePromise(false)
var NULL = new ValuePromise(null)
var UNDEFINED = new ValuePromise(undefined)
var ZERO = new ValuePromise(0)
var EMPTYSTRING = new ValuePromise('')

Promise.resolve = function (value) {
  if (value instanceof Promise) return value

  if (value === null) return NULL
  if (value === undefined) return UNDEFINED
  if (value === true) return TRUE
  if (value === false) return FALSE
  if (value === 0) return ZERO
  if (value === '') return EMPTYSTRING

  if (typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then
      if (typeof then === 'function') {
        return new Promise(then.bind(value))
      }
    } catch (ex) {
      return new Promise(function (resolve, reject) {
        reject(ex)
      })
    }
  }

  return new ValuePromise(value)
}

Promise.from = Promise.cast = function (value) {
  var err = new Error('Promise.from and Promise.cast are deprecated, use Promise.resolve instead')
  err.name = 'Warning'
  console.warn(err.stack)
  return Promise.resolve(value)
}

Promise.denodeify = function (fn, argumentCount) {
  argumentCount = argumentCount || Infinity
  return function () {
    var self = this
    var args = Array.prototype.slice.call(arguments)
    return new Promise(function (resolve, reject) {
      while (args.length && args.length > argumentCount) {
        args.pop()
      }
      args.push(function (err, res) {
        if (err) reject(err)
        else resolve(res)
      })
      fn.apply(self, args)
    })
  }
}
Promise.nodeify = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments)
    var callback = typeof args[args.length - 1] === 'function' ? args.pop() : null
    try {
      return fn.apply(this, arguments).nodeify(callback)
    } catch (ex) {
      if (callback === null || typeof callback == 'undefined') {
        return new Promise(function (resolve, reject) { reject(ex) })
      } else {
        asap(function () {
          callback(ex)
        })
      }
    }
  }
}

Promise.all = function () {
  var calledWithArray = arguments.length === 1 && Array.isArray(arguments[0])
  var args = Array.prototype.slice.call(calledWithArray ? arguments[0] : arguments)

  if (!calledWithArray) {
    var err = new Error('Promise.all should be called with a single array, calling it with multiple arguments is deprecated')
    err.name = 'Warning'
    console.warn(err.stack)
  }

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([])
    var remaining = args.length
    function res(i, val) {
      try {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then
          if (typeof then === 'function') {
            then.call(val, function (val) { res(i, val) }, reject)
            return
          }
        }
        args[i] = val
        if (--remaining === 0) {
          resolve(args);
        }
      } catch (ex) {
        reject(ex)
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i])
    }
  })
}

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) { 
    reject(value);
  });
}

Promise.race = function (values) {
  return new Promise(function (resolve, reject) { 
    values.forEach(function(value){
      Promise.resolve(value).then(resolve, reject);
    })
  });
}

/* Prototype Methods */

Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this
  self.then(null, function (err) {
    asap(function () {
      throw err
    })
  })
}

Promise.prototype.nodeify = function (callback) {
  if (typeof callback != 'function') return this

  this.then(function (value) {
    asap(function () {
      callback(null, value)
    })
  }, function (err) {
    asap(function () {
      callback(err)
    })
  })
}

Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
}

},{"./core.js":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/localforage/node_modules/promise/core.js","asap":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/localforage/node_modules/promise/node_modules/asap/asap.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/localforage/node_modules/promise/node_modules/asap/asap.js":[function(require,module,exports){
(function (process){

// Use the fastest possible means to execute a task in a future turn
// of the event loop.

// linked list of tasks (single, with head node)
var head = {task: void 0, next: null};
var tail = head;
var flushing = false;
var requestFlush = void 0;
var isNodeJS = false;

function flush() {
    /* jshint loopfunc: true */

    while (head.next) {
        head = head.next;
        var task = head.task;
        head.task = void 0;
        var domain = head.domain;

        if (domain) {
            head.domain = void 0;
            domain.enter();
        }

        try {
            task();

        } catch (e) {
            if (isNodeJS) {
                // In node, uncaught exceptions are considered fatal errors.
                // Re-throw them synchronously to interrupt flushing!

                // Ensure continuation if the uncaught exception is suppressed
                // listening "uncaughtException" events (as domains does).
                // Continue in next event to avoid tick recursion.
                if (domain) {
                    domain.exit();
                }
                setTimeout(flush, 0);
                if (domain) {
                    domain.enter();
                }

                throw e;

            } else {
                // In browsers, uncaught exceptions are not fatal.
                // Re-throw them asynchronously to avoid slow-downs.
                setTimeout(function() {
                   throw e;
                }, 0);
            }
        }

        if (domain) {
            domain.exit();
        }
    }

    flushing = false;
}

if (typeof process !== "undefined" && process.nextTick) {
    // Node.js before 0.9. Note that some fake-Node environments, like the
    // Mocha test runner, introduce a `process` global without a `nextTick`.
    isNodeJS = true;

    requestFlush = function () {
        process.nextTick(flush);
    };

} else if (typeof setImmediate === "function") {
    // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
    if (typeof window !== "undefined") {
        requestFlush = setImmediate.bind(window, flush);
    } else {
        requestFlush = function () {
            setImmediate(flush);
        };
    }

} else if (typeof MessageChannel !== "undefined") {
    // modern browsers
    // http://www.nonblocking.io/2011/06/windownexttick.html
    var channel = new MessageChannel();
    channel.port1.onmessage = flush;
    requestFlush = function () {
        channel.port2.postMessage(0);
    };

} else {
    // old browsers
    requestFlush = function () {
        setTimeout(flush, 0);
    };
}

function asap(task) {
    tail = tail.next = {
        task: task,
        domain: isNodeJS && process.domain,
        next: null
    };

    if (!flushing) {
        flushing = true;
        requestFlush();
    }
};

module.exports = asap;


}).call(this,require('_process'))

},{"_process":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/gulpfile/node_modules/browserify/node_modules/process/browser.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/localforage/src/drivers/indexeddb.js":[function(require,module,exports){
// Some code originally from async_storage.js in
// [Gaia](https://github.com/mozilla-b2g/gaia).
(function() {
    'use strict';

    // Originally found in https://github.com/mozilla-b2g/gaia/blob/e8f624e4cc9ea945727278039b3bc9bcb9f8667a/shared/js/async_storage.js

    // Promises!
    var Promise = (typeof module !== 'undefined' && module.exports) ?
                  require('promise') : this.Promise;

    // Initialize IndexedDB; fall back to vendor-prefixed versions if needed.
    var indexedDB = indexedDB || this.indexedDB || this.webkitIndexedDB ||
                    this.mozIndexedDB || this.OIndexedDB ||
                    this.msIndexedDB;

    // If IndexedDB isn't available, we get outta here!
    if (!indexedDB) {
        return;
    }

    // Open the IndexedDB database (automatically creates one if one didn't
    // previously exist), using any options set in the config.
    function _initStorage(options) {
        var self = this;
        var dbInfo = {
            db: null
        };

        if (options) {
            for (var i in options) {
                dbInfo[i] = options[i];
            }
        }

        return new Promise(function(resolve, reject) {
            var openreq = indexedDB.open(dbInfo.name, dbInfo.version);
            openreq.onerror = function() {
                reject(openreq.error);
            };
            openreq.onupgradeneeded = function() {
                // First time setup: create an empty object store
                openreq.result.createObjectStore(dbInfo.storeName);
            };
            openreq.onsuccess = function() {
                dbInfo.db = openreq.result;
                self._dbInfo = dbInfo;
                resolve();
            };
        });
    }

    function getItem(key, callback) {
        var self = this;

        // Cast the key to a string, as that's all we can set as a key.
        if (typeof key !== 'string') {
            window.console.warn(key +
                                ' used as a key, but it is not a string.');
            key = String(key);
        }

        var promise = new Promise(function(resolve, reject) {
            self.ready().then(function() {
                var dbInfo = self._dbInfo;
                var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly')
                    .objectStore(dbInfo.storeName);
                var req = store.get(key);

                req.onsuccess = function() {
                    var value = req.result;
                    if (value === undefined) {
                        value = null;
                    }

                    resolve(value);
                };

                req.onerror = function() {
                    reject(req.error);
                };
            }).catch(reject);
        });

        executeDeferedCallback(promise, callback);
        return promise;
    }

    // Iterate over all items stored in database.
    function iterate(iterator, callback) {
        var self = this;

        var promise = new Promise(function(resolve, reject) {
            self.ready().then(function() {
                var dbInfo = self._dbInfo;
                var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly')
                                     .objectStore(dbInfo.storeName);

                var req = store.openCursor();

                req.onsuccess = function() {
                    var cursor = req.result;

                    if (cursor) {
                        var result = iterator(cursor.value, cursor.key);

                        if (result !== void(0)) {
                            resolve(result);
                        } else {
                            cursor.continue();
                        }
                    } else {
                        resolve();
                    }
                };

                req.onerror = function() {
                    reject(req.error);
                };
            }).catch(reject);
        });

        executeDeferedCallback(promise, callback);

        return promise;
    }

    function setItem(key, value, callback) {
        var self = this;

        // Cast the key to a string, as that's all we can set as a key.
        if (typeof key !== 'string') {
            window.console.warn(key +
                                ' used as a key, but it is not a string.');
            key = String(key);
        }

        var promise = new Promise(function(resolve, reject) {
            self.ready().then(function() {
                var dbInfo = self._dbInfo;
                var store = dbInfo.db.transaction(dbInfo.storeName, 'readwrite')
                              .objectStore(dbInfo.storeName);

                // The reason we don't _save_ null is because IE 10 does
                // not support saving the `null` type in IndexedDB. How
                // ironic, given the bug below!
                // See: https://github.com/mozilla/localForage/issues/161
                if (value === null) {
                    value = undefined;
                }

                var req = store.put(value, key);
                req.onsuccess = function() {
                    // Cast to undefined so the value passed to
                    // callback/promise is the same as what one would get out
                    // of `getItem()` later. This leads to some weirdness
                    // (setItem('foo', undefined) will return `null`), but
                    // it's not my fault localStorage is our baseline and that
                    // it's weird.
                    if (value === undefined) {
                        value = null;
                    }

                    resolve(value);
                };
                req.onerror = function() {
                    reject(req.error);
                };
            }).catch(reject);
        });

        executeDeferedCallback(promise, callback);
        return promise;
    }

    function removeItem(key, callback) {
        var self = this;

        // Cast the key to a string, as that's all we can set as a key.
        if (typeof key !== 'string') {
            window.console.warn(key +
                                ' used as a key, but it is not a string.');
            key = String(key);
        }

        var promise = new Promise(function(resolve, reject) {
            self.ready().then(function() {
                var dbInfo = self._dbInfo;
                var store = dbInfo.db.transaction(dbInfo.storeName, 'readwrite')
                              .objectStore(dbInfo.storeName);

                // We use a Grunt task to make this safe for IE and some
                // versions of Android (including those used by Cordova).
                // Normally IE won't like `.delete()` and will insist on
                // using `['delete']()`, but we have a build step that
                // fixes this for us now.
                var req = store.delete(key);
                req.onsuccess = function() {
                    resolve();
                };

                req.onerror = function() {
                    reject(req.error);
                };

                // The request will be aborted if we've exceeded our storage
                // space. In this case, we will reject with a specific
                // "QuotaExceededError".
                req.onabort = function(event) {
                    var error = event.target.error;
                    if (error === 'QuotaExceededError') {
                        reject(error);
                    }
                };
            }).catch(reject);
        });

        executeDeferedCallback(promise, callback);
        return promise;
    }

    function clear(callback) {
        var self = this;

        var promise = new Promise(function(resolve, reject) {
            self.ready().then(function() {
                var dbInfo = self._dbInfo;
                var store = dbInfo.db.transaction(dbInfo.storeName, 'readwrite')
                              .objectStore(dbInfo.storeName);
                var req = store.clear();

                req.onsuccess = function() {
                    resolve();
                };

                req.onerror = function() {
                    reject(req.error);
                };
            }).catch(reject);
        });

        executeDeferedCallback(promise, callback);
        return promise;
    }

    function length(callback) {
        var self = this;

        var promise = new Promise(function(resolve, reject) {
            self.ready().then(function() {
                var dbInfo = self._dbInfo;
                var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly')
                              .objectStore(dbInfo.storeName);
                var req = store.count();

                req.onsuccess = function() {
                    resolve(req.result);
                };

                req.onerror = function() {
                    reject(req.error);
                };
            }).catch(reject);
        });

        executeCallback(promise, callback);
        return promise;
    }

    function key(n, callback) {
        var self = this;

        var promise = new Promise(function(resolve, reject) {
            if (n < 0) {
                resolve(null);

                return;
            }

            self.ready().then(function() {
                var dbInfo = self._dbInfo;
                var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly')
                              .objectStore(dbInfo.storeName);

                var advanced = false;
                var req = store.openCursor();
                req.onsuccess = function() {
                    var cursor = req.result;
                    if (!cursor) {
                        // this means there weren't enough keys
                        resolve(null);

                        return;
                    }

                    if (n === 0) {
                        // We have the first key, return it if that's what they
                        // wanted.
                        resolve(cursor.key);
                    } else {
                        if (!advanced) {
                            // Otherwise, ask the cursor to skip ahead n
                            // records.
                            advanced = true;
                            cursor.advance(n);
                        } else {
                            // When we get here, we've got the nth key.
                            resolve(cursor.key);
                        }
                    }
                };

                req.onerror = function() {
                    reject(req.error);
                };
            }).catch(reject);
        });

        executeCallback(promise, callback);
        return promise;
    }

    function keys(callback) {
        var self = this;

        var promise = new Promise(function(resolve, reject) {
            self.ready().then(function() {
                var dbInfo = self._dbInfo;
                var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly')
                              .objectStore(dbInfo.storeName);

                var req = store.openCursor();
                var keys = [];

                req.onsuccess = function() {
                    var cursor = req.result;

                    if (!cursor) {
                        resolve(keys);
                        return;
                    }

                    keys.push(cursor.key);
                    cursor.continue();
                };

                req.onerror = function() {
                    reject(req.error);
                };
            }).catch(reject);
        });

        executeCallback(promise, callback);
        return promise;
    }

    function executeCallback(promise, callback) {
        if (callback) {
            promise.then(function(result) {
                callback(null, result);
            }, function(error) {
                callback(error);
            });
        }
    }

    function executeDeferedCallback(promise, callback) {
        if (callback) {
            promise.then(function(result) {
                deferCallback(callback, result);
            }, function(error) {
                callback(error);
            });
        }
    }

    // Under Chrome the callback is called before the changes (save, clear)
    // are actually made. So we use a defer function which wait that the
    // call stack to be empty.
    // For more info : https://github.com/mozilla/localForage/issues/175
    // Pull request : https://github.com/mozilla/localForage/pull/178
    function deferCallback(callback, result) {
        if (callback) {
            return setTimeout(function() {
                return callback(null, result);
            }, 0);
        }
    }

    var asyncStorage = {
        _driver: 'asyncStorage',
        _initStorage: _initStorage,
        iterate: iterate,
        getItem: getItem,
        setItem: setItem,
        removeItem: removeItem,
        clear: clear,
        length: length,
        key: key,
        keys: keys
    };

    if (typeof define === 'function' && define.amd) {
        define('asyncStorage', function() {
            return asyncStorage;
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = asyncStorage;
    } else {
        this.asyncStorage = asyncStorage;
    }
}).call(window);

},{"promise":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/localforage/node_modules/promise/index.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/localforage/src/drivers/localstorage.js":[function(require,module,exports){
// If IndexedDB isn't available, we'll fall back to localStorage.
// Note that this will have considerable performance and storage
// side-effects (all data will be serialized on save and only data that
// can be converted to a string via `JSON.stringify()` will be saved).
(function() {
    'use strict';

    // Promises!
    var Promise = (typeof module !== 'undefined' && module.exports) ?
                  require('promise') : this.Promise;
    var localStorage = null;

    // If the app is running inside a Google Chrome packaged webapp, or some
    // other context where localStorage isn't available, we don't use
    // localStorage. This feature detection is preferred over the old
    // `if (window.chrome && window.chrome.runtime)` code.
    // See: https://github.com/mozilla/localForage/issues/68
    try {
        // If localStorage isn't available, we get outta here!
        // This should be inside a try catch
        if (!this.localStorage || !('setItem' in this.localStorage)) {
            return;
        }
        // Initialize localStorage and create a variable to use throughout
        // the code.
        localStorage = this.localStorage;
    } catch (e) {
        return;
    }

    // Config the localStorage backend, using options set in the config.
    function _initStorage(options) {
        var self = this;
        var dbInfo = {};
        if (options) {
            for (var i in options) {
                dbInfo[i] = options[i];
            }
        }

        dbInfo.keyPrefix = dbInfo.name + '/';

        self._dbInfo = dbInfo;
        return Promise.resolve();
    }

    var SERIALIZED_MARKER = '__lfsc__:';
    var SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER.length;

    // OMG the serializations!
    var TYPE_ARRAYBUFFER = 'arbf';
    var TYPE_BLOB = 'blob';
    var TYPE_INT8ARRAY = 'si08';
    var TYPE_UINT8ARRAY = 'ui08';
    var TYPE_UINT8CLAMPEDARRAY = 'uic8';
    var TYPE_INT16ARRAY = 'si16';
    var TYPE_INT32ARRAY = 'si32';
    var TYPE_UINT16ARRAY = 'ur16';
    var TYPE_UINT32ARRAY = 'ui32';
    var TYPE_FLOAT32ARRAY = 'fl32';
    var TYPE_FLOAT64ARRAY = 'fl64';
    var TYPE_SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER_LENGTH +
                                        TYPE_ARRAYBUFFER.length;

    // Remove all keys from the datastore, effectively destroying all data in
    // the app's key/value store!
    function clear(callback) {
        var self = this;
        var promise = new Promise(function(resolve, reject) {
            self.ready().then(function() {
                var keyPrefix = self._dbInfo.keyPrefix;

                for (var i = localStorage.length - 1; i >= 0; i--) {
                    var key = localStorage.key(i);

                    if (key.indexOf(keyPrefix) === 0) {
                        localStorage.removeItem(key);
                    }
                }

                resolve();
            }).catch(reject);
        });

        executeCallback(promise, callback);
        return promise;
    }

    // Retrieve an item from the store. Unlike the original async_storage
    // library in Gaia, we don't modify return values at all. If a key's value
    // is `undefined`, we pass that value to the callback function.
    function getItem(key, callback) {
        var self = this;

        // Cast the key to a string, as that's all we can set as a key.
        if (typeof key !== 'string') {
            window.console.warn(key +
                                ' used as a key, but it is not a string.');
            key = String(key);
        }

        var promise = new Promise(function(resolve, reject) {
            self.ready().then(function() {
                try {
                    var dbInfo = self._dbInfo;
                    var result = localStorage.getItem(dbInfo.keyPrefix + key);

                    // If a result was found, parse it from the serialized
                    // string into a JS object. If result isn't truthy, the key
                    // is likely undefined and we'll pass it straight to the
                    // callback.
                    if (result) {
                        result = _deserialize(result);
                    }

                    resolve(result);
                } catch (e) {
                    reject(e);
                }
            }).catch(reject);
        });

        executeCallback(promise, callback);
        return promise;
    }

    // Iterate over all items in the store.
    function iterate(iterator, callback) {
        var self = this;

        var promise = new Promise(function(resolve, reject) {
            self.ready().then(function() {
                try {
                    var keyPrefix = self._dbInfo.keyPrefix;
                    var keyPrefixLength = keyPrefix.length;
                    var length = localStorage.length;

                    for (var i = 0; i < length; i++) {
                        var key = localStorage.key(i);
                        var value = localStorage.getItem(key);

                        // If a result was found, parse it from the serialized
                        // string into a JS object. If result isn't truthy, the
                        // key is likely undefined and we'll pass it straight
                        // to the iterator.
                        if (value) {
                            value = _deserialize(value);
                        }

                        value = iterator(value, key.substring(keyPrefixLength));

                        if (value !== void(0)) {
                            resolve(value);
                            return;
                        }
                    }

                    resolve();
                } catch (e) {
                    reject(e);
                }
            }).catch(reject);
        });

        executeCallback(promise, callback);
        return promise;
    }

    // Same as localStorage's key() method, except takes a callback.
    function key(n, callback) {
        var self = this;
        var promise = new Promise(function(resolve, reject) {
            self.ready().then(function() {
                var dbInfo = self._dbInfo;
                var result;
                try {
                    result = localStorage.key(n);
                } catch (error) {
                    result = null;
                }

                // Remove the prefix from the key, if a key is found.
                if (result) {
                    result = result.substring(dbInfo.keyPrefix.length);
                }

                resolve(result);
            }).catch(reject);
        });

        executeCallback(promise, callback);
        return promise;
    }

    function keys(callback) {
        var self = this;
        var promise = new Promise(function(resolve, reject) {
            self.ready().then(function() {
                var dbInfo = self._dbInfo;
                var length = localStorage.length;
                var keys = [];

                for (var i = 0; i < length; i++) {
                    if (localStorage.key(i).indexOf(dbInfo.keyPrefix) === 0) {
                        keys.push(localStorage.key(i).substring(dbInfo.keyPrefix.length));
                    }
                }

                resolve(keys);
            }).catch(reject);
        });

        executeCallback(promise, callback);
        return promise;
    }

    // Supply the number of keys in the datastore to the callback function.
    function length(callback) {
        var self = this;
        var promise = new Promise(function(resolve, reject) {
            self.keys().then(function(keys) {
                resolve(keys.length);
            }).catch(reject);
        });

        executeCallback(promise, callback);
        return promise;
    }

    // Remove an item from the store, nice and simple.
    function removeItem(key, callback) {
        var self = this;

        // Cast the key to a string, as that's all we can set as a key.
        if (typeof key !== 'string') {
            window.console.warn(key +
                                ' used as a key, but it is not a string.');
            key = String(key);
        }

        var promise = new Promise(function(resolve, reject) {
            self.ready().then(function() {
                var dbInfo = self._dbInfo;
                localStorage.removeItem(dbInfo.keyPrefix + key);

                resolve();
            }).catch(reject);
        });

        executeCallback(promise, callback);
        return promise;
    }

    // Deserialize data we've inserted into a value column/field. We place
    // special markers into our strings to mark them as encoded; this isn't
    // as nice as a meta field, but it's the only sane thing we can do whilst
    // keeping localStorage support intact.
    //
    // Oftentimes this will just deserialize JSON content, but if we have a
    // special marker (SERIALIZED_MARKER, defined above), we will extract
    // some kind of arraybuffer/binary data/typed array out of the string.
    function _deserialize(value) {
        // If we haven't marked this string as being specially serialized (i.e.
        // something other than serialized JSON), we can just return it and be
        // done with it.
        if (value.substring(0,
            SERIALIZED_MARKER_LENGTH) !== SERIALIZED_MARKER) {
            return JSON.parse(value);
        }

        // The following code deals with deserializing some kind of Blob or
        // TypedArray. First we separate out the type of data we're dealing
        // with from the data itself.
        var serializedString = value.substring(TYPE_SERIALIZED_MARKER_LENGTH);
        var type = value.substring(SERIALIZED_MARKER_LENGTH,
                                   TYPE_SERIALIZED_MARKER_LENGTH);

        // Fill the string into a ArrayBuffer.
        // 2 bytes for each char.
        var buffer = new ArrayBuffer(serializedString.length * 2);
        var bufferView = new Uint16Array(buffer);
        for (var i = serializedString.length - 1; i >= 0; i--) {
            bufferView[i] = serializedString.charCodeAt(i);
        }

        // Return the right type based on the code/type set during
        // serialization.
        switch (type) {
            case TYPE_ARRAYBUFFER:
                return buffer;
            case TYPE_BLOB:
                return new Blob([buffer]);
            case TYPE_INT8ARRAY:
                return new Int8Array(buffer);
            case TYPE_UINT8ARRAY:
                return new Uint8Array(buffer);
            case TYPE_UINT8CLAMPEDARRAY:
                return new Uint8ClampedArray(buffer);
            case TYPE_INT16ARRAY:
                return new Int16Array(buffer);
            case TYPE_UINT16ARRAY:
                return new Uint16Array(buffer);
            case TYPE_INT32ARRAY:
                return new Int32Array(buffer);
            case TYPE_UINT32ARRAY:
                return new Uint32Array(buffer);
            case TYPE_FLOAT32ARRAY:
                return new Float32Array(buffer);
            case TYPE_FLOAT64ARRAY:
                return new Float64Array(buffer);
            default:
                throw new Error('Unkown type: ' + type);
        }
    }

    // Converts a buffer to a string to store, serialized, in the backend
    // storage library.
    function _bufferToString(buffer) {
        var str = '';
        var uint16Array = new Uint16Array(buffer);

        try {
            str = String.fromCharCode.apply(null, uint16Array);
        } catch (e) {
            // This is a fallback implementation in case the first one does
            // not work. This is required to get the phantomjs passing...
            for (var i = 0; i < uint16Array.length; i++) {
                str += String.fromCharCode(uint16Array[i]);
            }
        }

        return str;
    }

    // Serialize a value, afterwards executing a callback (which usually
    // instructs the `setItem()` callback/promise to be executed). This is how
    // we store binary data with localStorage.
    function _serialize(value, callback) {
        var valueString = '';
        if (value) {
            valueString = value.toString();
        }

        // Cannot use `value instanceof ArrayBuffer` or such here, as these
        // checks fail when running the tests using casper.js...
        //
        // TODO: See why those tests fail and use a better solution.
        if (value && (value.toString() === '[object ArrayBuffer]' ||
                      value.buffer &&
                      value.buffer.toString() === '[object ArrayBuffer]')) {
            // Convert binary arrays to a string and prefix the string with
            // a special marker.
            var buffer;
            var marker = SERIALIZED_MARKER;

            if (value instanceof ArrayBuffer) {
                buffer = value;
                marker += TYPE_ARRAYBUFFER;
            } else {
                buffer = value.buffer;

                if (valueString === '[object Int8Array]') {
                    marker += TYPE_INT8ARRAY;
                } else if (valueString === '[object Uint8Array]') {
                    marker += TYPE_UINT8ARRAY;
                } else if (valueString === '[object Uint8ClampedArray]') {
                    marker += TYPE_UINT8CLAMPEDARRAY;
                } else if (valueString === '[object Int16Array]') {
                    marker += TYPE_INT16ARRAY;
                } else if (valueString === '[object Uint16Array]') {
                    marker += TYPE_UINT16ARRAY;
                } else if (valueString === '[object Int32Array]') {
                    marker += TYPE_INT32ARRAY;
                } else if (valueString === '[object Uint32Array]') {
                    marker += TYPE_UINT32ARRAY;
                } else if (valueString === '[object Float32Array]') {
                    marker += TYPE_FLOAT32ARRAY;
                } else if (valueString === '[object Float64Array]') {
                    marker += TYPE_FLOAT64ARRAY;
                } else {
                    callback(new Error('Failed to get type for BinaryArray'));
                }
            }

            callback(marker + _bufferToString(buffer));
        } else if (valueString === '[object Blob]') {
            // Conver the blob to a binaryArray and then to a string.
            var fileReader = new FileReader();

            fileReader.onload = function() {
                var str = _bufferToString(this.result);

                callback(SERIALIZED_MARKER + TYPE_BLOB + str);
            };

            fileReader.readAsArrayBuffer(value);
        } else {
            try {
                callback(JSON.stringify(value));
            } catch (e) {
                window.console.error("Couldn't convert value into a JSON " +
                                     'string: ', value);

                callback(e);
            }
        }
    }

    // Set a key's value and run an optional callback once the value is set.
    // Unlike Gaia's implementation, the callback function is passed the value,
    // in case you want to operate on that value only after you're sure it
    // saved, or something like that.
    function setItem(key, value, callback) {
        var self = this;

        // Cast the key to a string, as that's all we can set as a key.
        if (typeof key !== 'string') {
            window.console.warn(key +
                                ' used as a key, but it is not a string.');
            key = String(key);
        }

        var promise = new Promise(function(resolve, reject) {
            self.ready().then(function() {
                // Convert undefined values to null.
                // https://github.com/mozilla/localForage/pull/42
                if (value === undefined) {
                    value = null;
                }

                // Save the original value to pass to the callback.
                var originalValue = value;

                _serialize(value, function(value, error) {
                    if (error) {
                        reject(error);
                    } else {
                        try {
                            var dbInfo = self._dbInfo;
                            localStorage.setItem(dbInfo.keyPrefix + key, value);
                        } catch (e) {
                            // localStorage capacity exceeded.
                            // TODO: Make this a specific error/event.
                            if (e.name === 'QuotaExceededError' ||
                                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                                reject(e);
                            }
                        }

                        resolve(originalValue);
                    }
                });
            }).catch(reject);
        });

        executeCallback(promise, callback);
        return promise;
    }

    function executeCallback(promise, callback) {
        if (callback) {
            promise.then(function(result) {
                callback(null, result);
            }, function(error) {
                callback(error);
            });
        }
    }

    var localStorageWrapper = {
        _driver: 'localStorageWrapper',
        _initStorage: _initStorage,
        // Default API, from Gaia/localStorage.
        iterate: iterate,
        getItem: getItem,
        setItem: setItem,
        removeItem: removeItem,
        clear: clear,
        length: length,
        key: key,
        keys: keys
    };

    if (typeof define === 'function' && define.amd) {
        define('localStorageWrapper', function() {
            return localStorageWrapper;
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = localStorageWrapper;
    } else {
        this.localStorageWrapper = localStorageWrapper;
    }
}).call(window);

},{"promise":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/localforage/node_modules/promise/index.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/localforage/src/drivers/websql.js":[function(require,module,exports){
/*
 * Includes code from:
 *
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */
(function() {
    'use strict';

    // Sadly, the best way to save binary data in WebSQL is Base64 serializing
    // it, so this is how we store it to prevent very strange errors with less
    // verbose ways of binary <-> string data storage.
    var BASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    // Promises!
    var Promise = (typeof module !== 'undefined' && module.exports) ?
                  require('promise') : this.Promise;

    var openDatabase = this.openDatabase;

    var SERIALIZED_MARKER = '__lfsc__:';
    var SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER.length;

    // OMG the serializations!
    var TYPE_ARRAYBUFFER = 'arbf';
    var TYPE_BLOB = 'blob';
    var TYPE_INT8ARRAY = 'si08';
    var TYPE_UINT8ARRAY = 'ui08';
    var TYPE_UINT8CLAMPEDARRAY = 'uic8';
    var TYPE_INT16ARRAY = 'si16';
    var TYPE_INT32ARRAY = 'si32';
    var TYPE_UINT16ARRAY = 'ur16';
    var TYPE_UINT32ARRAY = 'ui32';
    var TYPE_FLOAT32ARRAY = 'fl32';
    var TYPE_FLOAT64ARRAY = 'fl64';
    var TYPE_SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER_LENGTH +
                                        TYPE_ARRAYBUFFER.length;

    // If WebSQL methods aren't available, we can stop now.
    if (!openDatabase) {
        return;
    }

    // Open the WebSQL database (automatically creates one if one didn't
    // previously exist), using any options set in the config.
    function _initStorage(options) {
        var self = this;
        var dbInfo = {
            db: null
        };

        if (options) {
            for (var i in options) {
                dbInfo[i] = typeof(options[i]) !== 'string' ?
                            options[i].toString() : options[i];
            }
        }

        return new Promise(function(resolve, reject) {
            // Open the database; the openDatabase API will automatically
            // create it for us if it doesn't exist.
            try {
                dbInfo.db = openDatabase(dbInfo.name, String(dbInfo.version),
                                         dbInfo.description, dbInfo.size);
            } catch (e) {
                return self.setDriver('localStorageWrapper')
                    .then(function() {
                        return self._initStorage(options);
                    })
                    .then(resolve)
                    .catch(reject);
            }

            // Create our key/value table if it doesn't exist.
            dbInfo.db.transaction(function(t) {
                t.executeSql('CREATE TABLE IF NOT EXISTS ' + dbInfo.storeName +
                             ' (id INTEGER PRIMARY KEY, key unique, value)', [],
                             function() {
                    self._dbInfo = dbInfo;
                    resolve();
                }, function(t, error) {
                    reject(error);
                });
            });
        });
    }

    function getItem(key, callback) {
        var self = this;

        // Cast the key to a string, as that's all we can set as a key.
        if (typeof key !== 'string') {
            window.console.warn(key +
                                ' used as a key, but it is not a string.');
            key = String(key);
        }

        var promise = new Promise(function(resolve, reject) {
            self.ready().then(function() {
                var dbInfo = self._dbInfo;
                dbInfo.db.transaction(function(t) {
                    t.executeSql('SELECT * FROM ' + dbInfo.storeName +
                                 ' WHERE key = ? LIMIT 1', [key],
                                 function(t, results) {
                        var result = results.rows.length ?
                                     results.rows.item(0).value : null;

                        // Check to see if this is serialized content we need to
                        // unpack.
                        if (result) {
                            result = _deserialize(result);
                        }

                        resolve(result);
                    }, function(t, error) {

                        reject(error);
                    });
                });
            }).catch(reject);
        });

        executeCallback(promise, callback);
        return promise;
    }

    function iterate(iterator, callback) {
        var self = this;

        var promise = new Promise(function(resolve, reject) {
            self.ready().then(function() {
                var dbInfo = self._dbInfo;

                dbInfo.db.transaction(function(t) {
                    t.executeSql('SELECT * FROM ' + dbInfo.storeName, [],
                        function(t, results) {
                            var rows = results.rows;
                            var length = rows.length;

                            for (var i = 0; i < length; i++) {
                                var item = rows.item(i);
                                var result = item.value;

                                // Check to see if this is serialized content
                                // we need to unpack.
                                if (result) {
                                    result = _deserialize(result);
                                }

                                result = iterator(result, item.key);

                                // void(0) prevents problems with redefinition
                                // of `undefined`.
                                if (result !== void(0)) {
                                    resolve(result);
                                    return;
                                }
                            }

                            resolve();
                        }, function(t, error) {
                            reject(error);
                        });
                });
            }).catch(reject);
        });

        executeCallback(promise, callback);
        return promise;
    }

    function setItem(key, value, callback) {
        var self = this;

        // Cast the key to a string, as that's all we can set as a key.
        if (typeof key !== 'string') {
            window.console.warn(key +
                                ' used as a key, but it is not a string.');
            key = String(key);
        }

        var promise = new Promise(function(resolve, reject) {
            self.ready().then(function() {
                // The localStorage API doesn't return undefined values in an
                // "expected" way, so undefined is always cast to null in all
                // drivers. See: https://github.com/mozilla/localForage/pull/42
                if (value === undefined) {
                    value = null;
                }

                // Save the original value to pass to the callback.
                var originalValue = value;

                _serialize(value, function(value, error) {
                    if (error) {
                        reject(error);
                    } else {
                        var dbInfo = self._dbInfo;
                        dbInfo.db.transaction(function(t) {
                            t.executeSql('INSERT OR REPLACE INTO ' +
                                         dbInfo.storeName +
                                         ' (key, value) VALUES (?, ?)',
                                         [key, value], function() {
                                resolve(originalValue);
                            }, function(t, error) {
                                reject(error);
                            });
                        }, function(sqlError) { // The transaction failed; check
                                                // to see if it's a quota error.
                            if (sqlError.code === sqlError.QUOTA_ERR) {
                                // We reject the callback outright for now, but
                                // it's worth trying to re-run the transaction.
                                // Even if the user accepts the prompt to use
                                // more storage on Safari, this error will
                                // be called.
                                //
                                // TODO: Try to re-run the transaction.
                                reject(sqlError);
                            }
                        });
                    }
                });
            }).catch(reject);
        });

        executeCallback(promise, callback);
        return promise;
    }

    function removeItem(key, callback) {
        var self = this;

        // Cast the key to a string, as that's all we can set as a key.
        if (typeof key !== 'string') {
            window.console.warn(key +
                                ' used as a key, but it is not a string.');
            key = String(key);
        }

        var promise = new Promise(function(resolve, reject) {
            self.ready().then(function() {
                var dbInfo = self._dbInfo;
                dbInfo.db.transaction(function(t) {
                    t.executeSql('DELETE FROM ' + dbInfo.storeName +
                                 ' WHERE key = ?', [key], function() {

                        resolve();
                    }, function(t, error) {

                        reject(error);
                    });
                });
            }).catch(reject);
        });

        executeCallback(promise, callback);
        return promise;
    }

    // Deletes every item in the table.
    // TODO: Find out if this resets the AUTO_INCREMENT number.
    function clear(callback) {
        var self = this;

        var promise = new Promise(function(resolve, reject) {
            self.ready().then(function() {
                var dbInfo = self._dbInfo;
                dbInfo.db.transaction(function(t) {
                    t.executeSql('DELETE FROM ' + dbInfo.storeName, [],
                                 function() {
                        resolve();
                    }, function(t, error) {
                        reject(error);
                    });
                });
            }).catch(reject);
        });

        executeCallback(promise, callback);
        return promise;
    }

    // Does a simple `COUNT(key)` to get the number of items stored in
    // localForage.
    function length(callback) {
        var self = this;

        var promise = new Promise(function(resolve, reject) {
            self.ready().then(function() {
                var dbInfo = self._dbInfo;
                dbInfo.db.transaction(function(t) {
                    // Ahhh, SQL makes this one soooooo easy.
                    t.executeSql('SELECT COUNT(key) as c FROM ' +
                                 dbInfo.storeName, [], function(t, results) {
                        var result = results.rows.item(0).c;

                        resolve(result);
                    }, function(t, error) {

                        reject(error);
                    });
                });
            }).catch(reject);
        });

        executeCallback(promise, callback);
        return promise;
    }

    // Return the key located at key index X; essentially gets the key from a
    // `WHERE id = ?`. This is the most efficient way I can think to implement
    // this rarely-used (in my experience) part of the API, but it can seem
    // inconsistent, because we do `INSERT OR REPLACE INTO` on `setItem()`, so
    // the ID of each key will change every time it's updated. Perhaps a stored
    // procedure for the `setItem()` SQL would solve this problem?
    // TODO: Don't change ID on `setItem()`.
    function key(n, callback) {
        var self = this;

        var promise = new Promise(function(resolve, reject) {
            self.ready().then(function() {
                var dbInfo = self._dbInfo;
                dbInfo.db.transaction(function(t) {
                    t.executeSql('SELECT key FROM ' + dbInfo.storeName +
                                 ' WHERE id = ? LIMIT 1', [n + 1],
                                 function(t, results) {
                        var result = results.rows.length ?
                                     results.rows.item(0).key : null;
                        resolve(result);
                    }, function(t, error) {
                        reject(error);
                    });
                });
            }).catch(reject);
        });

        executeCallback(promise, callback);
        return promise;
    }

    function keys(callback) {
        var self = this;

        var promise = new Promise(function(resolve, reject) {
            self.ready().then(function() {
                var dbInfo = self._dbInfo;
                dbInfo.db.transaction(function(t) {
                    t.executeSql('SELECT key FROM ' + dbInfo.storeName, [],
                                 function(t, results) {
                        var keys = [];

                        for (var i = 0; i < results.rows.length; i++) {
                            keys.push(results.rows.item(i).key);
                        }

                        resolve(keys);
                    }, function(t, error) {

                        reject(error);
                    });
                });
            }).catch(reject);
        });

        executeCallback(promise, callback);
        return promise;
    }

    // Converts a buffer to a string to store, serialized, in the backend
    // storage library.
    function _bufferToString(buffer) {
        // base64-arraybuffer
        var bytes = new Uint8Array(buffer);
        var i;
        var base64String = '';

        for (i = 0; i < bytes.length; i += 3) {
            /*jslint bitwise: true */
            base64String += BASE_CHARS[bytes[i] >> 2];
            base64String += BASE_CHARS[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
            base64String += BASE_CHARS[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
            base64String += BASE_CHARS[bytes[i + 2] & 63];
        }

        if ((bytes.length % 3) === 2) {
            base64String = base64String.substring(0, base64String.length - 1) + '=';
        } else if (bytes.length % 3 === 1) {
            base64String = base64String.substring(0, base64String.length - 2) + '==';
        }

        return base64String;
    }

    // Deserialize data we've inserted into a value column/field. We place
    // special markers into our strings to mark them as encoded; this isn't
    // as nice as a meta field, but it's the only sane thing we can do whilst
    // keeping localStorage support intact.
    //
    // Oftentimes this will just deserialize JSON content, but if we have a
    // special marker (SERIALIZED_MARKER, defined above), we will extract
    // some kind of arraybuffer/binary data/typed array out of the string.
    function _deserialize(value) {
        // If we haven't marked this string as being specially serialized (i.e.
        // something other than serialized JSON), we can just return it and be
        // done with it.
        if (value.substring(0,
                            SERIALIZED_MARKER_LENGTH) !== SERIALIZED_MARKER) {
            return JSON.parse(value);
        }

        // The following code deals with deserializing some kind of Blob or
        // TypedArray. First we separate out the type of data we're dealing
        // with from the data itself.
        var serializedString = value.substring(TYPE_SERIALIZED_MARKER_LENGTH);
        var type = value.substring(SERIALIZED_MARKER_LENGTH,
                                   TYPE_SERIALIZED_MARKER_LENGTH);

        // Fill the string into a ArrayBuffer.
        var bufferLength = serializedString.length * 0.75;
        var len = serializedString.length;
        var i;
        var p = 0;
        var encoded1, encoded2, encoded3, encoded4;

        if (serializedString[serializedString.length - 1] === '=') {
            bufferLength--;
            if (serializedString[serializedString.length - 2] === '=') {
                bufferLength--;
            }
        }

        var buffer = new ArrayBuffer(bufferLength);
        var bytes = new Uint8Array(buffer);

        for (i = 0; i < len; i+=4) {
            encoded1 = BASE_CHARS.indexOf(serializedString[i]);
            encoded2 = BASE_CHARS.indexOf(serializedString[i+1]);
            encoded3 = BASE_CHARS.indexOf(serializedString[i+2]);
            encoded4 = BASE_CHARS.indexOf(serializedString[i+3]);

            /*jslint bitwise: true */
            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }

        // Return the right type based on the code/type set during
        // serialization.
        switch (type) {
            case TYPE_ARRAYBUFFER:
                return buffer;
            case TYPE_BLOB:
                return new Blob([buffer]);
            case TYPE_INT8ARRAY:
                return new Int8Array(buffer);
            case TYPE_UINT8ARRAY:
                return new Uint8Array(buffer);
            case TYPE_UINT8CLAMPEDARRAY:
                return new Uint8ClampedArray(buffer);
            case TYPE_INT16ARRAY:
                return new Int16Array(buffer);
            case TYPE_UINT16ARRAY:
                return new Uint16Array(buffer);
            case TYPE_INT32ARRAY:
                return new Int32Array(buffer);
            case TYPE_UINT32ARRAY:
                return new Uint32Array(buffer);
            case TYPE_FLOAT32ARRAY:
                return new Float32Array(buffer);
            case TYPE_FLOAT64ARRAY:
                return new Float64Array(buffer);
            default:
                throw new Error('Unkown type: ' + type);
        }
    }

    // Serialize a value, afterwards executing a callback (which usually
    // instructs the `setItem()` callback/promise to be executed). This is how
    // we store binary data with localStorage.
    function _serialize(value, callback) {
        var valueString = '';
        if (value) {
            valueString = value.toString();
        }

        // Cannot use `value instanceof ArrayBuffer` or such here, as these
        // checks fail when running the tests using casper.js...
        //
        // TODO: See why those tests fail and use a better solution.
        if (value && (value.toString() === '[object ArrayBuffer]' ||
                      value.buffer &&
                      value.buffer.toString() === '[object ArrayBuffer]')) {
            // Convert binary arrays to a string and prefix the string with
            // a special marker.
            var buffer;
            var marker = SERIALIZED_MARKER;

            if (value instanceof ArrayBuffer) {
                buffer = value;
                marker += TYPE_ARRAYBUFFER;
            } else {
                buffer = value.buffer;

                if (valueString === '[object Int8Array]') {
                    marker += TYPE_INT8ARRAY;
                } else if (valueString === '[object Uint8Array]') {
                    marker += TYPE_UINT8ARRAY;
                } else if (valueString === '[object Uint8ClampedArray]') {
                    marker += TYPE_UINT8CLAMPEDARRAY;
                } else if (valueString === '[object Int16Array]') {
                    marker += TYPE_INT16ARRAY;
                } else if (valueString === '[object Uint16Array]') {
                    marker += TYPE_UINT16ARRAY;
                } else if (valueString === '[object Int32Array]') {
                    marker += TYPE_INT32ARRAY;
                } else if (valueString === '[object Uint32Array]') {
                    marker += TYPE_UINT32ARRAY;
                } else if (valueString === '[object Float32Array]') {
                    marker += TYPE_FLOAT32ARRAY;
                } else if (valueString === '[object Float64Array]') {
                    marker += TYPE_FLOAT64ARRAY;
                } else {
                    callback(new Error('Failed to get type for BinaryArray'));
                }
            }

            callback(marker + _bufferToString(buffer));
        } else if (valueString === '[object Blob]') {
            // Conver the blob to a binaryArray and then to a string.
            var fileReader = new FileReader();

            fileReader.onload = function() {
                var str = _bufferToString(this.result);

                callback(SERIALIZED_MARKER + TYPE_BLOB + str);
            };

            fileReader.readAsArrayBuffer(value);
        } else {
            try {
                callback(JSON.stringify(value));
            } catch (e) {
                window.console.error("Couldn't convert value into a JSON " +
                                     'string: ', value);

                callback(null, e);
            }
        }
    }

    function executeCallback(promise, callback) {
        if (callback) {
            promise.then(function(result) {
                callback(null, result);
            }, function(error) {
                callback(error);
            });
        }
    }

    var webSQLStorage = {
        _driver: 'webSQLStorage',
        _initStorage: _initStorage,
        iterate: iterate,
        getItem: getItem,
        setItem: setItem,
        removeItem: removeItem,
        clear: clear,
        length: length,
        key: key,
        keys: keys
    };

    if (typeof define === 'function' && define.amd) {
        define('webSQLStorage', function() {
            return webSQLStorage;
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = webSQLStorage;
    } else {
        this.webSQLStorage = webSQLStorage;
    }
}).call(window);

},{"promise":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/localforage/node_modules/promise/index.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/localforage/src/localforage.js":[function(require,module,exports){
(function() {
    'use strict';

    // Promises!
    var Promise = (typeof module !== 'undefined' && module.exports) ?
                  require('promise') : this.Promise;

    // Custom drivers are stored here when `defineDriver()` is called.
    // They are shared across all instances of localForage.
    var CustomDrivers = {};

    var DriverType = {
        INDEXEDDB: 'asyncStorage',
        LOCALSTORAGE: 'localStorageWrapper',
        WEBSQL: 'webSQLStorage'
    };

    var DefaultDriverOrder = [
        DriverType.INDEXEDDB,
        DriverType.WEBSQL,
        DriverType.LOCALSTORAGE
    ];

    var LibraryMethods = [
        'clear',
        'getItem',
        'iterate',
        'key',
        'keys',
        'length',
        'removeItem',
        'setItem'
    ];

    var ModuleType = {
        DEFINE: 1,
        EXPORT: 2,
        WINDOW: 3
    };

    var DefaultConfig = {
        description: '',
        driver: DefaultDriverOrder.slice(),
        name: 'localforage',
        // Default DB size is _JUST UNDER_ 5MB, as it's the highest size
        // we can use without a prompt.
        size: 4980736,
        storeName: 'keyvaluepairs',
        version: 1.0
    };

    // Attaching to window (i.e. no module loader) is the assumed,
    // simple default.
    var moduleType = ModuleType.WINDOW;

    // Find out what kind of module setup we have; if none, we'll just attach
    // localForage to the main window.
    if (typeof define === 'function' && define.amd) {
        moduleType = ModuleType.DEFINE;
    } else if (typeof module !== 'undefined' && module.exports) {
        moduleType = ModuleType.EXPORT;
    }

    // Check to see if IndexedDB is available and if it is the latest
    // implementation; it's our preferred backend library. We use "_spec_test"
    // as the name of the database because it's not the one we'll operate on,
    // but it's useful to make sure its using the right spec.
    // See: https://github.com/mozilla/localForage/issues/128
    var driverSupport = (function(self) {
        // Initialize IndexedDB; fall back to vendor-prefixed versions
        // if needed.
        var indexedDB = indexedDB || self.indexedDB || self.webkitIndexedDB ||
                        self.mozIndexedDB || self.OIndexedDB ||
                        self.msIndexedDB;

        var result = {};

        result[DriverType.WEBSQL] = !!self.openDatabase;
        result[DriverType.INDEXEDDB] = !!(function() {
            // We mimic PouchDB here; just UA test for Safari (which, as of
            // iOS 8/Yosemite, doesn't properly support IndexedDB).
            // IndexedDB support is broken and different from Blink's.
            // This is faster than the test case (and it's sync), so we just
            // do this. *SIGH*
            // http://bl.ocks.org/nolanlawson/raw/c83e9039edf2278047e9/
            //
            // We test for openDatabase because IE Mobile identifies itself
            // as Safari. Oh the lulz...
            if (typeof self.openDatabase !== 'undefined' && self.navigator &&
                self.navigator.userAgent &&
                /Safari/.test(self.navigator.userAgent) &&
                !/Chrome/.test(self.navigator.userAgent)) {
                return false;
            }
            try {
                return indexedDB &&
                       typeof indexedDB.open === 'function' &&
                       // Some Samsung/HTC Android 4.0-4.3 devices
                       // have older IndexedDB specs; if this isn't available
                       // their IndexedDB is too old for us to use.
                       // (Replaces the onupgradeneeded test.)
                       typeof self.IDBKeyRange !== 'undefined';
            } catch (e) {
                return false;
            }
        })();

        result[DriverType.LOCALSTORAGE] = !!(function() {
            try {
                return (self.localStorage &&
                        ('setItem' in self.localStorage) &&
                        (self.localStorage.setItem));
            } catch (e) {
                return false;
            }
        })();

        return result;
    })(this);

    var isArray = Array.isArray || function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };

    function callWhenReady(localForageInstance, libraryMethod) {
        localForageInstance[libraryMethod] = function() {
            var _args = arguments;
            return localForageInstance.ready().then(function() {
                return localForageInstance[libraryMethod].apply(localForageInstance, _args);
            });
        };
    }

    function extend() {
        for (var i = 1; i < arguments.length; i++) {
            var arg = arguments[i];

            if (arg) {
                for (var key in arg) {
                    if (arg.hasOwnProperty(key)) {
                        if (isArray(arg[key])) {
                            arguments[0][key] = arg[key].slice();
                        } else {
                            arguments[0][key] = arg[key];
                        }
                    }
                }
            }
        }

        return arguments[0];
    }

    function isLibraryDriver(driverName) {
        for (var driver in DriverType) {
            if (DriverType.hasOwnProperty(driver) &&
                DriverType[driver] === driverName) {
                return true;
            }
        }

        return false;
    }

    var globalObject = this;

    function LocalForage(options) {
        this._config = extend({}, DefaultConfig, options);
        this._driverSet = null;
        this._ready = false;
        this._dbInfo = null;

        // Add a stub for each driver API method that delays the call to the
        // corresponding driver method until localForage is ready. These stubs
        // will be replaced by the driver methods as soon as the driver is
        // loaded, so there is no performance impact.
        for (var i = 0; i < LibraryMethods.length; i++) {
            callWhenReady(this, LibraryMethods[i]);
        }

        this.setDriver(this._config.driver);
    }

    LocalForage.prototype.INDEXEDDB = DriverType.INDEXEDDB;
    LocalForage.prototype.LOCALSTORAGE = DriverType.LOCALSTORAGE;
    LocalForage.prototype.WEBSQL = DriverType.WEBSQL;

    // Set any config values for localForage; can be called anytime before
    // the first API call (e.g. `getItem`, `setItem`).
    // We loop through options so we don't overwrite existing config
    // values.
    LocalForage.prototype.config = function(options) {
        // If the options argument is an object, we use it to set values.
        // Otherwise, we return either a specified config value or all
        // config values.
        if (typeof(options) === 'object') {
            // If localforage is ready and fully initialized, we can't set
            // any new configuration values. Instead, we return an error.
            if (this._ready) {
                return new Error("Can't call config() after localforage " +
                                 'has been used.');
            }

            for (var i in options) {
                if (i === 'storeName') {
                    options[i] = options[i].replace(/\W/g, '_');
                }

                this._config[i] = options[i];
            }

            // after all config options are set and
            // the driver option is used, try setting it
            if ('driver' in options && options.driver) {
                this.setDriver(this._config.driver);
            }

            return true;
        } else if (typeof(options) === 'string') {
            return this._config[options];
        } else {
            return this._config;
        }
    };

    // Used to define a custom driver, shared across all instances of
    // localForage.
    LocalForage.prototype.defineDriver = function(driverObject, callback,
                                                  errorCallback) {
        var defineDriver = new Promise(function(resolve, reject) {
            try {
                var driverName = driverObject._driver;
                var complianceError = new Error(
                    'Custom driver not compliant; see ' +
                    'https://mozilla.github.io/localForage/#definedriver'
                );
                var namingError = new Error(
                    'Custom driver name already in use: ' + driverObject._driver
                );

                // A driver name should be defined and not overlap with the
                // library-defined, default drivers.
                if (!driverObject._driver) {
                    reject(complianceError);
                    return;
                }
                if (isLibraryDriver(driverObject._driver)) {
                    reject(namingError);
                    return;
                }

                var customDriverMethods = LibraryMethods.concat('_initStorage');
                for (var i = 0; i < customDriverMethods.length; i++) {
                    var customDriverMethod = customDriverMethods[i];
                    if (!customDriverMethod ||
                        !driverObject[customDriverMethod] ||
                        typeof driverObject[customDriverMethod] !== 'function') {
                        reject(complianceError);
                        return;
                    }
                }

                var supportPromise = Promise.resolve(true);
                if ('_support'  in driverObject) {
                    if (driverObject._support && typeof driverObject._support === 'function') {
                        supportPromise = driverObject._support();
                    } else {
                        supportPromise = Promise.resolve(!!driverObject._support);
                    }
                }

                supportPromise.then(function(supportResult) {
                    driverSupport[driverName] = supportResult;
                    CustomDrivers[driverName] = driverObject;
                    resolve();
                }, reject);
            } catch (e) {
                reject(e);
            }
        });

        defineDriver.then(callback, errorCallback);
        return defineDriver;
    };

    LocalForage.prototype.driver = function() {
        return this._driver || null;
    };

    LocalForage.prototype.ready = function(callback) {
        var self = this;

        var ready = new Promise(function(resolve, reject) {
            self._driverSet.then(function() {
                if (self._ready === null) {
                    self._ready = self._initStorage(self._config);
                }

                self._ready.then(resolve, reject);
            }).catch(reject);
        });

        ready.then(callback, callback);
        return ready;
    };

    LocalForage.prototype.setDriver = function(drivers, callback,
                                               errorCallback) {
        var self = this;

        if (typeof drivers === 'string') {
            drivers = [drivers];
        }

        this._driverSet = new Promise(function(resolve, reject) {
            var driverName = self._getFirstSupportedDriver(drivers);
            var error = new Error('No available storage method found.');

            if (!driverName) {
                self._driverSet = Promise.reject(error);
                reject(error);
                return;
            }

            self._dbInfo = null;
            self._ready = null;

            if (isLibraryDriver(driverName)) {
                // We allow localForage to be declared as a module or as a
                // library available without AMD/require.js.
                if (moduleType === ModuleType.DEFINE) {
                    require([driverName], function(lib) {
                        self._extend(lib);

                        resolve();
                    });

                    return;
                } else if (moduleType === ModuleType.EXPORT) {
                    // Making it browserify friendly
                    var driver;
                    switch (driverName) {
                        case self.INDEXEDDB:
                            driver = require('./drivers/indexeddb');
                            break;
                        case self.LOCALSTORAGE:
                            driver = require('./drivers/localstorage');
                            break;
                        case self.WEBSQL:
                            driver = require('./drivers/websql');
                    }

                    self._extend(driver);
                } else {
                    self._extend(globalObject[driverName]);
                }
            } else if (CustomDrivers[driverName]) {
                self._extend(CustomDrivers[driverName]);
            } else {
                self._driverSet = Promise.reject(error);
                reject(error);
                return;
            }

            resolve();
        });

        function setDriverToConfig() {
            self._config.driver = self.driver();
        }
        this._driverSet.then(setDriverToConfig, setDriverToConfig);

        this._driverSet.then(callback, errorCallback);
        return this._driverSet;
    };

    LocalForage.prototype.supports = function(driverName) {
        return !!driverSupport[driverName];
    };

    LocalForage.prototype._extend = function(libraryMethodsAndProperties) {
        extend(this, libraryMethodsAndProperties);
    };

    // Used to determine which driver we should use as the backend for this
    // instance of localForage.
    LocalForage.prototype._getFirstSupportedDriver = function(drivers) {
        if (drivers && isArray(drivers)) {
            for (var i = 0; i < drivers.length; i++) {
                var driver = drivers[i];

                if (this.supports(driver)) {
                    return driver;
                }
            }
        }

        return null;
    };

    LocalForage.prototype.createInstance = function(options) {
        return new LocalForage(options);
    };

    // The actual localForage object that we expose as a module or via a
    // global. It's extended by pulling in one of our other libraries.
    var localForage = new LocalForage();

    // We allow localForage to be declared as a module or as a library
    // available without AMD/require.js.
    if (moduleType === ModuleType.DEFINE) {
        define('localforage', function() {
            return localForage;
        });
    } else if (moduleType === ModuleType.EXPORT) {
        module.exports = localForage;
    } else {
        this.localforage = localForage;
    }
}).call(window);

},{"./drivers/indexeddb":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/localforage/src/drivers/indexeddb.js","./drivers/localstorage":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/localforage/src/drivers/localstorage.js","./drivers/websql":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/localforage/src/drivers/websql.js","promise":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/localforage/node_modules/promise/index.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/perlin-simplex/index.js":[function(require,module,exports){
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
},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/rsvp/dist/rsvp.js":[function(require,module,exports){
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

},{"_process":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/gulpfile/node_modules/browserify/node_modules/process/browser.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/soundcloud-badge/index.js":[function(require,module,exports){
var resolve = require('soundcloud-resolve')
var fonts = require('google-fonts')
var minstache = require('minstache')
var insert = require('insert-css')
var fs = require('fs')

var icons = {
    black: 'http://developers.soundcloud.com/assets/logo_black.png'
  , white: 'http://developers.soundcloud.com/assets/logo_white.png'
}

module.exports = badge
function noop(err){ if (err) throw err }

var inserted = false
var gwfadded = false
var template = null

function badge(options, callback) {
  if (!inserted) insert(".npm-scb-wrap {\n  font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;\n  font-weight: 200;\n  position: absolute;\n  top: 0;\n  left: 0;\n  z-index: 999;\n}\n\n.npm-scb-wrap a {\n  text-decoration: none;\n  color: #000;\n}\n.npm-scb-white\n.npm-scb-wrap a {\n  color: #fff;\n}\n\n.npm-scb-inner {\n  position: absolute;\n  top: -120px; left: 0;\n  padding: 8px;\n  width: 100%;\n  height: 150px;\n  z-index: 2;\n  -webkit-transition: width 0.5s cubic-bezier(1, 0, 0, 1), top 0.5s;\n     -moz-transition: width 0.5s cubic-bezier(1, 0, 0, 1), top 0.5s;\n      -ms-transition: width 0.5s cubic-bezier(1, 0, 0, 1), top 0.5s;\n       -o-transition: width 0.5s cubic-bezier(1, 0, 0, 1), top 0.5s;\n          transition: width 0.5s cubic-bezier(1, 0, 0, 1), top 0.5s;\n}\n.npm-scb-wrap:hover\n.npm-scb-inner {\n  top: 0;\n}\n\n.npm-scb-artwork {\n  position: absolute;\n  top: 16px; left: 16px;\n  width: 104px; height: 104px;\n  box-shadow: 0 0 8px -3px #000;\n  outline: 1px solid rgba(0,0,0,0.1);\n  z-index: 2;\n}\n.npm-scb-white\n.npm-scb-artwork {\n  outline: 1px solid rgba(255,255,255,0.1);\n  box-shadow: 0 0 10px -2px rgba(255,255,255,0.9);\n}\n\n.npm-scb-info {\n  position: absolute;\n  top: 16px;\n  left: 120px;\n  width: 300px;\n  z-index: 1;\n}\n\n.npm-scb-info > a {\n  display: block;\n}\n\n.npm-scb-now-playing {\n  font-size: 12px;\n  line-height: 12px;\n  position: absolute;\n  width: 500px;\n  z-index: 1;\n  padding: 15px 0;\n  top: 0; left: 138px;\n  opacity: 1;\n  -webkit-transition: opacity 0.25s;\n     -moz-transition: opacity 0.25s;\n      -ms-transition: opacity 0.25s;\n       -o-transition: opacity 0.25s;\n          transition: opacity 0.25s;\n}\n\n.npm-scb-wrap:hover\n.npm-scb-now-playing {\n  opacity: 0;\n}\n\n.npm-scb-white\n.npm-scb-now-playing {\n  color: #fff;\n}\n.npm-scb-now-playing > a {\n  font-weight: bold;\n}\n\n.npm-scb-info > a > p {\n  margin: 0;\n  padding-bottom: 0.25em;\n  line-height: 1.35em;\n  margin-left: 1em;\n  font-size: 1em;\n}\n\n.npm-scb-title {\n  font-weight: bold;\n}\n\n.npm-scb-icon {\n  position: absolute;\n  top: 120px;\n  padding-top: 0.75em;\n  left: 16px;\n}\n"), inserted = true
  if (!template) template = minstache.compile("<div class=\"npm-scb-wrap\">\n  <div class=\"npm-scb-inner\">\n    <a target=\"_blank\" href=\"{{urls.song}}\">\n      <img class=\"npm-scb-icon\" src=\"{{icon}}\">\n      <img class=\"npm-scb-artwork\" src=\"{{artwork}}\">\n    </a>\n    <div class=\"npm-scb-info\">\n      <a target=\"_blank\" href=\"{{urls.song}}\">\n        <p class=\"npm-scb-title\">{{title}}</p>\n      </a>\n      <a target=\"_blank\" href=\"{{urls.artist}}\">\n        <p class=\"npm-scb-artist\">{{artist}}</p>\n      </a>\n    </div>\n  </div>\n  <div class=\"npm-scb-now-playing\">\n    Now Playing:\n    <a href=\"{{urls.song}}\">{{title}}</a>\n    by\n    <a href=\"{{urls.artist}}\">{{artist}}</a>\n  </div>\n</div>\n")

  if (!gwfadded && options.getFonts) {
    fonts.add({ 'Open Sans': [300, 600] })
    gwfadded = true
  }

  options = options || {}
  callback = callback || noop

  var div   = options.el || document.createElement('div')
  var icon  = !('dark' in options) || options.dark ? 'black' : 'white'
  var id    = options.client_id
  var song  = options.song

  resolve(id, song, function(err, json) {
    if (err) return callback(err)
    if (json.kind !== 'track') throw new Error(
      'soundcloud-badge only supports individual tracks at the moment'
    )

    div.classList[
      icon === 'black' ? 'remove' : 'add'
    ]('npm-scb-white')

    div.innerHTML = template({
        artwork: json.artwork_url || json.user.avatar_url
      , artist: json.user.username
      , title: json.title
      , icon: icons[icon]
      , urls: {
          song: json.permalink_url
        , artist: json.user.permalink_url
      }
    })

    document.body.appendChild(div)

    callback(null, json.stream_url + '?client_id=' + id, json, div)
  })

  return div
}

},{"fs":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/gulpfile/node_modules/browserify/lib/_empty.js","google-fonts":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/soundcloud-badge/node_modules/google-fonts/index.js","insert-css":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/soundcloud-badge/node_modules/insert-css/index.js","minstache":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/soundcloud-badge/node_modules/minstache/index.js","soundcloud-resolve":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/soundcloud-badge/node_modules/soundcloud-resolve/browser.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/soundcloud-badge/node_modules/google-fonts/index.js":[function(require,module,exports){
module.exports = asString
module.exports.add = append

function asString(fonts) {
  var href = getHref(fonts)
  return '<link href="' + href + '" rel="stylesheet" type="text/css">'
}

function asElement(fonts) {
  var href = getHref(fonts)
  var link = document.createElement('link')
  link.setAttribute('href', href)
  link.setAttribute('rel', 'stylesheet')
  link.setAttribute('type', 'text/css')
  return link
}

function getHref(fonts) {
  var family = Object.keys(fonts).map(function(name) {
    var details = fonts[name]
    name = name.replace(/\s+/, '+')
    return typeof details === 'boolean'
      ? name
      : name + ':' + makeArray(details).join(',')
  }).join('|')

  return 'http://fonts.googleapis.com/css?family=' + family
}

function append(fonts) {
  var link = asElement(fonts)
  document.head.appendChild(link)
  return link
}

function makeArray(arr) {
  return Array.isArray(arr) ? arr : [arr]
}

},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/soundcloud-badge/node_modules/insert-css/index.js":[function(require,module,exports){
var inserted = [];

module.exports = function (css) {
    if (inserted.indexOf(css) >= 0) return;
    inserted.push(css);
    
    var elem = document.createElement('style');
    var text = document.createTextNode(css);
    elem.appendChild(text);
    
    if (document.head.childNodes.length) {
        document.head.insertBefore(elem, document.head.childNodes[0]);
    }
    else {
        document.head.appendChild(elem);
    }
};

},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/soundcloud-badge/node_modules/minstache/index.js":[function(require,module,exports){

/**
 * Expose `render()`.`
 */

exports = module.exports = render;

/**
 * Expose `compile()`.
 */

exports.compile = compile;

/**
 * Render the given mustache `str` with `obj`.
 *
 * @param {String} str
 * @param {Object} obj
 * @return {String}
 * @api public
 */

function render(str, obj) {
  obj = obj || {};
  var fn = compile(str);
  return fn(obj);
}

/**
 * Compile the given `str` to a `Function`.
 *
 * @param {String} str
 * @return {Function}
 * @api public
 */

function compile(str) {
  var js = [];
  var toks = parse(str);
  var tok;

  for (var i = 0; i < toks.length; ++i) {
    tok = toks[i];
    if (i % 2 == 0) {
      js.push('"' + tok.replace(/"/g, '\\"') + '"');
    } else {
      switch (tok[0]) {
        case '/':
          tok = tok.slice(1);
          js.push(') + ');
          break;
        case '^':
          tok = tok.slice(1);
          assertProperty(tok);
          js.push(' + section(obj, "' + tok + '", true, ');
          break;
        case '#':
          tok = tok.slice(1);
          assertProperty(tok);
          js.push(' + section(obj, "' + tok + '", false, ');
          break;
        case '!':
          tok = tok.slice(1);
          assertProperty(tok);
          js.push(' + obj.' + tok + ' + ');
          break;
        default:
          assertProperty(tok);
          js.push(' + escape(obj.' + tok + ') + ');
      }
    }
  }

  js = '\n'
    + indent(escape.toString()) + ';\n\n'
    + indent(section.toString()) + ';\n\n'
    + '  return ' + js.join('').replace(/\n/g, '\\n');

  return new Function('obj', js);
}

/**
 * Assert that `prop` is a valid property.
 *
 * @param {String} prop
 * @api private
 */

function assertProperty(prop) {
  if (!prop.match(/^[\w.]+$/)) throw new Error('invalid property "' + prop + '"');
}

/**
 * Parse `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function parse(str) {
  return str.split(/\{\{|\}\}/);
}

/**
 * Indent `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function indent(str) {
  return str.replace(/^/gm, '  ');
}

/**
 * Section handler.
 *
 * @param {Object} context obj
 * @param {String} prop
 * @param {String} str
 * @param {Boolean} negate
 * @api private
 */

function section(obj, prop, negate, str) {
  var val = obj[prop];
  if ('function' == typeof val) return val.call(obj, str);
  if (negate) val = !val;
  if (val) return str;
  return '';
}

/**
 * Escape the given `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

function escape(html) {
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/soundcloud-badge/node_modules/soundcloud-resolve/browser.js":[function(require,module,exports){
var qs  = require('querystring')
var xhr = require('xhr')

module.exports = resolve

function resolve(id, goal, callback) {
  var uri = 'http://api.soundcloud.com/resolve.json?' + qs.stringify({
      url: goal
    , client_id: id
  })

  xhr({
      uri: uri
    , method: 'GET'
  }, function(err, res, body) {
    if (err) return callback(err)
    try {
      body = JSON.parse(body)
    } catch(e) {
      return callback(e)
    }
    if (body.errors) return callback(new Error(
      body.errors[0].error_message
    ))
    return callback(null, body)
  })
}

},{"querystring":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/gulpfile/node_modules/browserify/node_modules/querystring-es3/index.js","xhr":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/soundcloud-badge/node_modules/soundcloud-resolve/node_modules/xhr/index.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/soundcloud-badge/node_modules/soundcloud-resolve/node_modules/xhr/index.js":[function(require,module,exports){
var window = require("global/window")
var once = require("once")

var messages = {
    "0": "Internal XMLHttpRequest Error",
    "4": "4xx Client Error",
    "5": "5xx Server Error"
}

var XHR = window.XMLHttpRequest || noop
var XDR = "withCredentials" in (new XHR()) ?
        window.XMLHttpRequest : window.XDomainRequest

module.exports = createXHR

function createXHR(options, callback) {
    if (typeof options === "string") {
        options = { uri: options }
    }

    options = options || {}
    callback = once(callback)

    var xhr

    if (options.cors) {
        xhr = new XDR()
    } else {
        xhr = new XHR()
    }

    var uri = xhr.url = options.uri
    var method = xhr.method = options.method || "GET"
    var body = options.body || options.data
    var headers = xhr.headers = options.headers || {}
    var isJson = false

    if ("json" in options) {
        isJson = true
        headers["Content-Type"] = "application/json"
        body = JSON.stringify(options.json)
    }

    xhr.onreadystatechange = readystatechange
    xhr.onload = load
    xhr.onerror = error
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function () {
        // IE must die
    }
    // hate IE
    xhr.ontimeout = noop
    xhr.open(method, uri)
    if (options.cors) {
        xhr.withCredentials = true
    }
    xhr.timeout = "timeout" in options ? options.timeout : 5000

    if ( xhr.setRequestHeader) {
        Object.keys(headers).forEach(function (key) {
            xhr.setRequestHeader(key, headers[key])
        })
    }

    xhr.send(body)

    return xhr

    function readystatechange() {
        if (xhr.readyState === 4) {
            load()
        }
    }

    function load() {
        var error = null
        var status = xhr.statusCode = xhr.status
        var body = xhr.body = xhr.response ||
            xhr.responseText || xhr.responseXML

        if (status === 0 || (status >= 400 && status < 600)) {
            var message = xhr.responseText ||
                messages[String(xhr.status).charAt(0)]
            error = new Error(message)

            error.statusCode = xhr.status
        }

        if (isJson) {
            try {
                body = xhr.body = JSON.parse(body)
            } catch (e) {}
        }

        callback(error, xhr, body)
    }

    function error(evt) {
        callback(evt, xhr)
    }
}


function noop() {}

},{"global/window":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/soundcloud-badge/node_modules/soundcloud-resolve/node_modules/xhr/node_modules/global/window.js","once":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/soundcloud-badge/node_modules/soundcloud-resolve/node_modules/xhr/node_modules/once/once.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/soundcloud-badge/node_modules/soundcloud-resolve/node_modules/xhr/node_modules/global/window.js":[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window
} else if (typeof global !== "undefined") {
    module.exports = global
} else {
    module.exports = {}
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/soundcloud-badge/node_modules/soundcloud-resolve/node_modules/xhr/node_modules/once/once.js":[function(require,module,exports){
module.exports = once

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })
})

function once (fn) {
  var called = false
  return function () {
    if (called) return
    called = true
    return fn.apply(this, arguments)
  }
}

},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/three-glslify/index.js":[function(require,module,exports){
var createTypes = require('./types')


module.exports = function(THREE) {

    var types = createTypes(THREE) 

    return function create(glShader, opts) {
        opts = opts||{}

        if (typeof opts.colors === 'string')
            opts.colors = [opts.colors]
        
        var tUniforms = types( glShader.uniforms, opts.colors )
        var tAttribs = types( glShader.attributes, opts.colors )
            
        //clear the attribute arrays
        for (var k in tAttribs) {
            tAttribs[k].value = []
        }

        return {
            vertexShader: glShader.vertex,
            fragmentShader: glShader.fragment,
            uniforms: tUniforms,
            attributes: tAttribs
        }
    }
}
},{"./types":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/three-glslify/types.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/three-glslify/types.js":[function(require,module,exports){
var typeMap = {
    'int': 'i',
    'float': 'f',
    'ivec2': 'i2',
    'ivec3': 'i3',
    'ivec4': 'i4',
    'vec2': 'v2',
    'vec3': 'v3',
    'vec4': 'v4',
    'mat4': 'm4',
    'mat3': 'm3',
    'sampler2D': 't',
    'samplerCube': 't'
}

function create(THREE) {
    function newInstance(type, isArray) {
        switch (type) {
            case 'float': 
            case 'int':
                return 0
            case 'vec2':
            case 'ivec2':
                return new THREE.Vector2()
            case 'vec3':
            case 'ivec3':
                return new THREE.Vector3()
            case 'vec4':
            case 'ivec4':
                return new THREE.Vector4()
            case 'mat4':
                return new THREE.Matrix4()
            case 'mat3':
                return new THREE.Matrix3()
            case 'samplerCube':
            case 'sampler2D':
                return new THREE.Texture()
            default:
                return undefined
        }
    }

    function defaultValue(type, isArray, arrayLen) {
        if (isArray) {
            //ThreeJS flattens ivec3 type
            //(we don't support 'fv' type)
            if (type === 'ivec3')
                arrayLen *= 3
            var ar = new Array(arrayLen)
            for (var i=0; i<ar.length; i++)
                ar[i] = newInstance(type, isArray)
            return ar
        }  
        return newInstance(type)
    }

    function getType(type, isArray) {
        if (!isArray)
            return typeMap[type]

        if (type === 'int')
            return 'iv1'
        else if (type === 'float')
            return 'fv1'
        else
            return typeMap[type]+'v'
    }

    return function setupUniforms(glUniforms, colorNames) {
        if (!Array.isArray(colorNames))
            colorNames = Array.prototype.slice.call(arguments, 1)

        var result = {}
        var arrays = {}

        //map uniform types
        glUniforms.forEach(function(uniform) {
            var name = uniform.name
            var isArray = /(.+)\[[0-9]+\]/.exec(name)

            //special case: colors...
            if (colorNames && colorNames.indexOf(name) !== -1) {
                if (isArray)
                    throw new Error("array of color uniforms not supported")
                if (uniform.type !== 'vec3')
                    throw new Error("ThreeJS expects vec3 for Color uniforms") 
                result[name] = {
                    type: 'c',
                    value: new THREE.Color()
                }
                return
            }

            if (isArray) {
                name = isArray[1]
                if (name in arrays) 
                    arrays[name].count++ 
                else
                    arrays[name] = { count: 1, type: uniform.type }
            }
            result[name] = { 
                type: getType(uniform.type, isArray), 
                value: isArray ? null : defaultValue(uniform.type) 
            }
        })

        //now clean up any array values
        for (var k in result) {
            var u = result[k]
            if (k in arrays) { //is an array
                var a = arrays[k]
                u.value = defaultValue(a.type, true, a.count)
            }
        }
        return result
    }
}

module.exports = create
},{}]},{},["./js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ndWxwZmlsZS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwianMiLCJqcy9Qb2VtLmpzIiwianMvY29tcG9uZW50cy9JbmZvLmpzIiwianMvY29tcG9uZW50cy9TdGFycy5qcyIsImpzL2NvbXBvbmVudHMvYW1iaWFuY2UvQ2xvdWRzL2luZGV4LmpzIiwianMvY29tcG9uZW50cy9jYW1lcmFzL0NhbWVyYS5qcyIsImpzL2NvbXBvbmVudHMvY2FtZXJhcy9Db25zdGFudE1vdmUuanMiLCJqcy9jb21wb25lbnRzL2NhbWVyYXMvQ29udHJvbHMuanMiLCJqcy9jb21wb25lbnRzL2NhbWVyYXMvT3JpZW50YXRpb24uanMiLCJqcy9jb21wb25lbnRzL2NhbWVyYXMvUm90YXRlQXJvdW5kT3JpZ2luLmpzIiwianMvY29tcG9uZW50cy9jYW1lcmFzL1N3aXZlbC5qcyIsImpzL2NvbXBvbmVudHMvbGlnaHRzL1RyYWNrQ2FtZXJhTGlnaHRzLmpzIiwianMvY29tcG9uZW50cy91dGlscy9TdGF0cy5qcyIsImpzL2RlbW9zL0VhcnRoLmpzIiwianMvZGVtb3MvRW5kbGVzc1RlcnJhaW4vaW5kZXguanMiLCJqcy9kZW1vcy9HcmlkLmpzIiwianMvZGVtb3MvTWVzaEdyb3VwQm94RGVtby9NZXNoR3JvdXAuanMiLCJqcy9kZW1vcy9NZXNoR3JvdXBCb3hEZW1vL2luZGV4LmpzIiwianMvZGVtb3MvU2luZUdyYXZpdHlDbG91ZC5qcyIsImpzL2RlbW9zL3RleHR1cmVQb3NpdGlvbmFsTWF0cmljZXMvaW5kZXguanMiLCJqcy9kZW1vcy91bmlmb3JtUG9zaXRpb25hbE1hdHJpY2VzL2luZGV4LmpzIiwianMvbGV2ZWxMb2FkZXIuanMiLCJqcy9wb3N0cHJvY2Vzc2luZy9CbG9vbVBhc3MuanMiLCJqcy9wb3N0cHJvY2Vzc2luZy9FZmZlY3RDb21wb3Nlci5qcyIsImpzL3Bvc3Rwcm9jZXNzaW5nL0ZpbG1QYXNzLmpzIiwianMvcG9zdHByb2Nlc3NpbmcvTWFza1Bhc3MuanMiLCJqcy9wb3N0cHJvY2Vzc2luZy9SZW5kZXJQYXNzLmpzIiwianMvcG9zdHByb2Nlc3NpbmcvU2hhZGVyUGFzcy5qcyIsImpzL3Bvc3Rwcm9jZXNzaW5nL2Nocm9tYXRpY0FiZXJyYXRpb24vaW5kZXguanMiLCJqcy9wb3N0cHJvY2Vzc2luZy9pbmRleC5qcyIsImpzL3JlbmRlcmVyLmpzIiwianMvcm91dGluZy5qcyIsImpzL3NoYWRlcnMvQ29udm9sdXRpb25TaGFkZXIuanMiLCJqcy9zaGFkZXJzL0NvcHlTaGFkZXIuanMiLCJqcy9zaGFkZXJzL0ZYQUFTaGFkZXIuanMiLCJqcy9zaGFkZXJzL0ZpbG1TaGFkZXIuanMiLCJqcy9zb3VuZC9NdXNpYy5qcyIsImpzL3NvdW5kL211dGVyLmpzIiwianMvdWkvaW5kZXguanMiLCJqcy91aS9tZW51LmpzIiwianMvdWkvbWVudUxldmVscy5qcyIsImpzL3VpL211dGUuanMiLCJqcy91dGlscy9DbG9jay5qcyIsImpzL3V0aWxzL0V2ZW50RGlzcGF0Y2hlci5qcyIsImpzL3V0aWxzL1N0YXRzLmpzIiwianMvdXRpbHMvVGhyZWVDb25zb2xlLmpzIiwianMvdXRpbHMvY2FsY3VsYXRlU3F1YXJlZFRleHR1cmVXaWR0aC5qcyIsImpzL3V0aWxzL2xvYWRUZXh0LmpzIiwianMvdXRpbHMvbG9hZFRleHR1cmUuanMiLCJqcy91dGlscy9yYW5kb20uanMiLCJqcy91dGlscy9zaW1wbGV4Mi5qcyIsImpzL3ZlbmRvci9EZXZpY2VPcmllbnRhdGlvbkNvbnRyb2xzLmpzIiwianMvdmVuZG9yL09yYml0Q29udHJvbHMuanMiLCJqcy92ZW5kb3IvU3RlcmVvRWZmZWN0LmpzIiwibWFuaWZlc3RzL2NhcmJvbkRpb3hpZGVFYXJ0aC5qcyIsIm1hbmlmZXN0cy9lbmRsZXNzVGVycmFpbi5qcyIsIm1hbmlmZXN0cy9pbmRleC5qcyIsIm1hbmlmZXN0cy9tZXNoR3JvdXBCb3hEZW1vLmpzIiwibWFuaWZlc3RzL3NpbmVHcmF2aXR5Q2xvdWQuanMiLCJtYW5pZmVzdHMvdGV4dHVyZVBvc2l0aW9uYWxNYXRyaWNlcy5qcyIsIm1hbmlmZXN0cy91bmlmb3JtUG9zaXRpb25hbE1hdHJpY2VzLmpzIiwibWFuaWZlc3RzL3ZyLmpzIiwibm9kZV9tb2R1bGVzL2Nyb3Nzcm9hZHMvZGlzdC9jcm9zc3JvYWRzLmpzIiwibm9kZV9tb2R1bGVzL2Nyb3Nzcm9hZHMvbm9kZV9tb2R1bGVzL3NpZ25hbHMvZGlzdC9zaWduYWxzLmpzIiwibm9kZV9tb2R1bGVzL2dsc2xpZnkvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9nbHNsaWZ5L3NpbXBsZS1hZGFwdGVyLmpzIiwibm9kZV9tb2R1bGVzL2d1bHBmaWxlL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L2xpYi9fZW1wdHkuanMiLCJub2RlX21vZHVsZXMvZ3VscGZpbGUvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9ndWxwZmlsZS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2RlY29kZS5qcyIsIm5vZGVfbW9kdWxlcy9ndWxwZmlsZS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2VuY29kZS5qcyIsIm5vZGVfbW9kdWxlcy9ndWxwZmlsZS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2hhc2hlci9kaXN0L2pzL2hhc2hlci5qcyIsIm5vZGVfbW9kdWxlcy9sb2NhbGZvcmFnZS9ub2RlX21vZHVsZXMvcHJvbWlzZS9jb3JlLmpzIiwibm9kZV9tb2R1bGVzL2xvY2FsZm9yYWdlL25vZGVfbW9kdWxlcy9wcm9taXNlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvY2FsZm9yYWdlL25vZGVfbW9kdWxlcy9wcm9taXNlL25vZGVfbW9kdWxlcy9hc2FwL2FzYXAuanMiLCJub2RlX21vZHVsZXMvbG9jYWxmb3JhZ2Uvc3JjL2RyaXZlcnMvaW5kZXhlZGRiLmpzIiwibm9kZV9tb2R1bGVzL2xvY2FsZm9yYWdlL3NyYy9kcml2ZXJzL2xvY2Fsc3RvcmFnZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2NhbGZvcmFnZS9zcmMvZHJpdmVycy93ZWJzcWwuanMiLCJub2RlX21vZHVsZXMvbG9jYWxmb3JhZ2Uvc3JjL2xvY2FsZm9yYWdlLmpzIiwibm9kZV9tb2R1bGVzL3Blcmxpbi1zaW1wbGV4L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JzdnAvZGlzdC9yc3ZwLmpzIiwibm9kZV9tb2R1bGVzL3NvdW5kY2xvdWQtYmFkZ2UvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc291bmRjbG91ZC1iYWRnZS9ub2RlX21vZHVsZXMvZ29vZ2xlLWZvbnRzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NvdW5kY2xvdWQtYmFkZ2Uvbm9kZV9tb2R1bGVzL2luc2VydC1jc3MvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc291bmRjbG91ZC1iYWRnZS9ub2RlX21vZHVsZXMvbWluc3RhY2hlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NvdW5kY2xvdWQtYmFkZ2Uvbm9kZV9tb2R1bGVzL3NvdW5kY2xvdWQtcmVzb2x2ZS9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3NvdW5kY2xvdWQtYmFkZ2Uvbm9kZV9tb2R1bGVzL3NvdW5kY2xvdWQtcmVzb2x2ZS9ub2RlX21vZHVsZXMveGhyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NvdW5kY2xvdWQtYmFkZ2Uvbm9kZV9tb2R1bGVzL3NvdW5kY2xvdWQtcmVzb2x2ZS9ub2RlX21vZHVsZXMveGhyL25vZGVfbW9kdWxlcy9nbG9iYWwvd2luZG93LmpzIiwibm9kZV9tb2R1bGVzL3NvdW5kY2xvdWQtYmFkZ2Uvbm9kZV9tb2R1bGVzL3NvdW5kY2xvdWQtcmVzb2x2ZS9ub2RlX21vZHVsZXMveGhyL25vZGVfbW9kdWxlcy9vbmNlL29uY2UuanMiLCJub2RlX21vZHVsZXMvdGhyZWUtZ2xzbGlmeS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy90aHJlZS1nbHNsaWZ5L3R5cGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNucUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4ckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN6YkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNwTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN2VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMWtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3BMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDemtEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInJlcXVpcmUoJy4vdXRpbHMvVGhyZWVDb25zb2xlJyk7XG5cbnZhciByb3V0aW5nID0gcmVxdWlyZSgnLi9yb3V0aW5nJyk7XG52YXIgdWkgPSByZXF1aXJlKCcuL3VpJyk7XG5cbnJvdXRpbmcuc3RhcnQoXG5cdHJlcXVpcmUoJy4vUG9lbScpLFxuXHRyZXF1aXJlKCcuLi9tYW5pZmVzdHMnKVxuKTsiLCJ2YXIgQ2FtZXJhID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL2NhbWVyYXMvQ2FtZXJhJyk7XG52YXIgU3RhdHMgPSByZXF1aXJlKCcuL3V0aWxzL1N0YXRzJyk7XG52YXIgRXZlbnREaXNwYXRjaGVyID0gcmVxdWlyZSgnLi91dGlscy9FdmVudERpc3BhdGNoZXInKTtcbnZhciBDbG9jayA9IHJlcXVpcmUoJy4vdXRpbHMvQ2xvY2snKTtcbnZhciByZW5kZXJlciA9IHJlcXVpcmUoJy4vcmVuZGVyZXInKTtcblxuZnVuY3Rpb24gY3JlYXRlRm9nKCBjb25maWcsIGNhbWVyYVBvc2l0aW9uWiApIHtcblx0XG5cdHZhciBmb2cgPSBfLmV4dGVuZCh7XG5cdFx0Y29sb3IgOiAweDIyMjIyMixcblx0XHRuZWFyRmFjdG9yIDogMC41LFxuXHRcdGZhckZhY3RvciA6IDJcblx0fSwgY29uZmlnICk7XG5cdFxuXHRyZXR1cm4gbmV3IFRIUkVFLkZvZyhcblx0XHRmb2cuY29sb3IsXG5cdFx0Y2FtZXJhUG9zaXRpb25aICogZm9nLm5lYXJGYWN0b3IsXG5cdFx0Y2FtZXJhUG9zaXRpb25aICogZm9nLmZhckZhY3RvclxuXHQpO1xuXHRcbn1cblxudmFyIFBvZW0gPSBmdW5jdGlvbiggbGV2ZWwsIHNsdWcgKSB7XG5cblx0dGhpcy5yYXRpbyA9IF8uaXNOdW1iZXIoIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvICkgPyB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA6IDE7XG5cdHRoaXMuc2x1ZyA9IHNsdWc7XG5cdFxuXHR0aGlzLmNvbnRyb2xzID0gdW5kZWZpbmVkO1xuXHR0aGlzLnNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG5cdHRoaXMucmVxdWVzdGVkRnJhbWUgPSB1bmRlZmluZWQ7XG5cdHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xuXHR0aGlzLiRkaXYgPSAkKFwiI2NvbnRhaW5lclwiKTtcblxuXHR0aGlzLmNsb2NrID0gbmV3IENsb2NrKCk7XG5cdHRoaXMuY2FtZXJhID0gbmV3IENhbWVyYSggdGhpcywgbGV2ZWwuY29uZmlnLmNhbWVyYSB8fCB7fSApO1xuXHR0aGlzLnNjZW5lLmZvZyA9IGNyZWF0ZUZvZyggbGV2ZWwuY29uZmlnLmZvZywgdGhpcy5jYW1lcmEub2JqZWN0LnBvc2l0aW9uLnogKTtcblxuXHR0aGlzLnJlbmRlcmVyID0gcmVuZGVyZXIoIHRoaXMsIGxldmVsLmNvbmZpZy5yZW5kZXJlciApO1xuXHR0aGlzLmNhbnZhcyA9ICQoXCJjYW52YXNcIilbMF07XG5cdFxuXHR0aGlzLnBhcnNlTGV2ZWwoIGxldmVsICk7XG5cdFxuXHR0aGlzLmRpc3BhdGNoKHtcblx0XHR0eXBlOiAnbGV2ZWxQYXJzZWQnXG5cdH0pO1xuXHRcblx0dGhpcy5zdGF0c0VuYWJsZWQgPSBmYWxzZTtcblx0dGhpcy5hZGRTdGF0cygpO1xuXHRcblx0dGhpcy5zdGFydCgpO1xuXHRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUG9lbTtcblxuUG9lbS5wcm90b3R5cGUgPSB7XG5cdFxuXHRwYXJzZUxldmVsIDogZnVuY3Rpb24oIGxldmVsICkge1xuXHRcdF8uZWFjaCggbGV2ZWwub2JqZWN0cywgZnVuY3Rpb24gbG9hZENvbXBvbmVudCggdmFsdWUsIGtleSApIHtcblx0XHRcdGlmKF8uaXNPYmplY3QoIHZhbHVlICkpIHtcblx0XHRcdFx0dGhpc1sga2V5IF0gPSBuZXcgdmFsdWUub2JqZWN0KCB0aGlzLCB2YWx1ZS5wcm9wZXJ0aWVzICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzWyBrZXkgXSA9IHZhbHVlO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0fSwgdGhpcyk7XG5cdH0sXHRcblx0XG5cdGFkZFN0YXRzIDogZnVuY3Rpb24oKSB7XG5cdFx0XG5cdFx0aWYoIHRoaXMuc3RhdHNFbmFibGVkICkge1xuXHRcdFx0dGhpcy5zdGF0cyA9IG5ldyBTdGF0cygpO1xuXHRcdFx0dGhpcy5zdGF0cy5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcblx0XHRcdHRoaXMuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4Jztcblx0XHRcdCQoXCIjY29udGFpbmVyXCIpLmFwcGVuZCggdGhpcy5zdGF0cy5kb21FbGVtZW50ICk7XG5cdFx0XHRcblx0XHRcdHRoaXMub24oJ3VwZGF0ZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0aGlzLnN0YXRzLnVwZGF0ZSgpO1xuXHRcdFx0fS5iaW5kKHRoaXMpKTtcblx0XHR9XG5cdFx0XG5cdH0sXG5cdFx0XG5cdFxuXHRzdGFydCA6IGZ1bmN0aW9uKCkge1xuXHRcdGlmKCAhdGhpcy5zdGFydGVkICkge1xuXHRcdFx0XG5cdFx0XHR0aGlzLmxvb3AoKTtcblx0XHR9XG5cdFx0dGhpcy5zdGFydGVkID0gdHJ1ZTtcblx0fSxcblx0XG5cdGxvb3AgOiBmdW5jdGlvbigpIHtcblxuXHRcdHRoaXMucmVxdWVzdGVkRnJhbWUgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIHRoaXMubG9vcC5iaW5kKHRoaXMpICk7XG5cdFx0dGhpcy51cGRhdGUoKTtcblxuXHR9LFxuXHRcblx0cGF1c2UgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHR3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoIHRoaXMucmVxdWVzdGVkRnJhbWUgKTtcblx0XHR0aGlzLnN0YXJ0ZWQgPSBmYWxzZTtcblx0XHRcblx0fSxcblx0XHRcdFxuXHR1cGRhdGUgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHR2YXIgZHQgPSB0aGlzLmNsb2NrLmdldERlbHRhKCk7XG5cdFx0XG5cdFx0dGhpcy5kaXNwYXRjaCh7XG5cdFx0XHR0eXBlOiBcInVwZGF0ZVwiLFxuXHRcdFx0ZHQ6IGR0LFxuXHRcdFx0dGltZTogdGhpcy5jbG9jay50aW1lLFxuXHRcdFx0dW5pdER0OiBkdCAqIDAuMDE2NjY2NjY3XG5cdFx0fSk7XG5cblx0XHR0aGlzLmRpc3BhdGNoKHtcblx0XHRcdHR5cGU6IFwiZHJhd1wiXG5cdFx0fSk7XG5cdFx0XG5cdFx0XG5cdFx0XG5cblx0fSxcblx0XG5cdGRlc3Ryb3kgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHR3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoIHRoaXMucmVxdWVzdGVkRnJhbWUgKTtcblx0XHRcblx0XHR0aGlzLmRpc3BhdGNoKHtcblx0XHRcdHR5cGU6IFwiZGVzdHJveVwiXG5cdFx0fSk7XG5cdH1cbn07XG5cbkV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUuYXBwbHkoIFBvZW0ucHJvdG90eXBlICk7XG4iLCJ2YXIgSW5mbyA9IGZ1bmN0aW9uKCBwb2VtLCBwcm9wZXJ0aWVzICkge1xuXHRcblx0aWYoIHByb3BlcnRpZXMuYXBwZW5kQ3JlZGl0cyApICQoJy5jcmVkaXRzJykuYXBwZW5kKCBwcm9wZXJ0aWVzLmFwcGVuZENyZWRpdHMgKTtcblx0aWYoIHByb3BlcnRpZXMudGl0bGUgKSAkKFwiI2luZm8tdGl0bGVcIikudGV4dCggcHJvcGVydGllcy50aXRsZSApO1xuXHRpZiggcHJvcGVydGllcy5zdWJ0aXRsZSApICQoXCIjaW5mby1zdWJ0aXRsZVwiKS50ZXh0KCBwcm9wZXJ0aWVzLnN1YnRpdGxlKTtcblx0XG5cdGlmKCBwcm9wZXJ0aWVzLnRpdGxlQ3NzICkgJChcIiNpbmZvLXRpdGxlXCIpLmNzcyggcHJvcGVydGllcy50aXRsZUNzcyApO1xuXHRpZiggcHJvcGVydGllcy5zdWJ0aXRsZUNzcyApICQoXCIjaW5mby1zdWJ0aXRsZVwiKS5jc3MoIHByb3BlcnRpZXMuc3VidGl0bGVDc3MgKTtcblx0XG5cdFxuXHRpZiggcHJvcGVydGllcy5kb2N1bWVudFRpdGxlICkgZG9jdW1lbnQudGl0bGUgPSBwcm9wZXJ0aWVzLmRvY3VtZW50VGl0bGU7XG5cdFxuXHRpZiggcHJvcGVydGllcy5zaG93QXJyb3dOZXh0ICkgJChcIi5hcnJvdy1uZXh0XCIpLnNob3coKTtcblxuXHQkKFwiI2luZm9cIikuc2hvdygpO1xuXHRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW5mbzsiLCJ2YXIgU3RhcnMgPSBmdW5jdGlvbiggcG9lbSApIHtcblx0dGhpcy5wb2VtID0gcG9lbTtcblx0dGhpcy5vYmplY3QgPSBudWxsO1xuXHRcblx0dGhpcy5jb3VudCA9IDMwMDAwO1xuXHR0aGlzLmRlcHRoID0gNTAwMDtcblx0dGhpcy5taW5EZXB0aCA9IDcwMDtcblx0dGhpcy5jb2xvciA9IDB4YWFhYWFhO1xuXHRcblx0dGhpcy5hZGRPYmplY3QoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhcnM7XG5cblN0YXJzLnByb3RvdHlwZSA9IHtcblx0XG5cdGdlbmVyYXRlR2VvbWV0cnkgOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgciwgdGhldGEsIHgsIHksIHosIGdlb21ldHJ5O1xuXHRcdFxuXHRcdGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XG5cdFx0XG5cdFx0Zm9yKHZhciBpPTA7IGkgPCB0aGlzLmNvdW50OyBpKyspIHtcblx0XHRcdFxuXHRcdFx0ciA9IE1hdGgucmFuZG9tKCkgKiB0aGlzLmRlcHRoICsgdGhpcy5taW5EZXB0aDtcblxuXHRcdFx0dGhldGEgPSBNYXRoLnJhbmRvbSgpICogMiAqIE1hdGguUEk7XG5cdFx0XHRcblx0XHRcdHggPSBNYXRoLmNvcyggdGhldGEgKSAqIHI7XG5cdFx0XHR6ID0gTWF0aC5zaW4oIHRoZXRhICkgKiByO1xuXHRcdFx0eSA9ICgwLjUgLSBNYXRoLnJhbmRvbSgpKSAqIHRoaXMuZGVwdGg7XG5cdFx0XHRcblx0XHRcdGdlb21ldHJ5LnZlcnRpY2VzLnB1c2goIG5ldyBUSFJFRS5WZWN0b3IzKHgseSx6KSApO1xuXHRcdFx0XHRcdFxuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gZ2VvbWV0cnk7XG5cdH0sXG5cdFxuXHRhZGRPYmplY3QgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHR2YXIgZ2VvbWV0cnksIGxpbmVNYXRlcmlhbDtcblx0XHRcblx0XHRnZW9tZXRyeSA9IHRoaXMuZ2VuZXJhdGVHZW9tZXRyeSgpO1xuXHRcdFxuXHRcdFxuXHRcdHRoaXMub2JqZWN0ID0gbmV3IFRIUkVFLlBvaW50Q2xvdWQoXG5cdFx0XHRnZW9tZXRyeSxcblx0XHRcdG5ldyBUSFJFRS5Qb2ludENsb3VkTWF0ZXJpYWwoe1xuXHRcdFx0XHQgc2l6ZTogMyAqIHRoaXMucG9lbS5yYXRpbyxcblx0XHRcdFx0IGNvbG9yOiB0aGlzLmNvbG9yLFxuXHRcdFx0XHQgZm9nOiBmYWxzZVxuXHRcdFx0fVxuXHRcdCkgKTtcblx0XHRcblx0XHR0aGlzLnBvZW0uc2NlbmUuYWRkKCB0aGlzLm9iamVjdCApIDtcblx0XHRcblx0fVxufTsiLCJ2YXIgZ2xzbGlmeSA9IHJlcXVpcmUoXCJnbHNsaWZ5XCIpO1xudmFyIGNyZWF0ZVNoYWRlciA9IHJlcXVpcmUoXCJ0aHJlZS1nbHNsaWZ5XCIpKFRIUkVFKTtcblxuZnVuY3Rpb24gc2V0dXBUZXh0dXJlKG1lc2gsIHNjZW5lKSB7XG4gICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICAgIHZhciB0ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUoaW1nKTtcbiAgICBpbWcuc3JjID0gXCJhc3NldHMvaW1hZ2VzL2Nsb3VkMTAyNC5wbmdcIjtcbiAgICB0ZXh0dXJlLndyYXBTID0gVEhSRUUuUmVwZWF0V3JhcHBpbmc7XG4gICAgdGV4dHVyZS53cmFwVCA9IFRIUkVFLlJlcGVhdFdyYXBwaW5nO1xuXG4gICAgJChpbWcpLm9uKFwibG9hZFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICAgIHNjZW5lLmFkZChtZXNoKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0ZXh0dXJlO1xufVxuXG52YXIgQ2xvdWRzID0gZnVuY3Rpb24ocG9lbSwgcHJvcGVydGllcykge1xuICAgIHZhciBjb25maWcgPSBfLmV4dGVuZCh7XG4gICAgICAgIHdpZHRoOiA1MDAsXG4gICAgICAgIG9mZnNldDogbmV3IFRIUkVFLlZlY3RvcjIoMSwgMSksXG4gICAgICAgIGNvbG9yOiBuZXcgVEhSRUUuVmVjdG9yNCgwLjUsIDEsIDAuNywgMSksXG4gICAgICAgIGhlaWdodDogLTIwMCxcbiAgICAgICAgcm90YXRpb246IE1hdGguUEkgLyAyXG4gICAgfSwgcHJvcGVydGllcyk7XG5cbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeShjb25maWcud2lkdGgsIGNvbmZpZy53aWR0aCk7XG4gICAgdmFyIHNoYWRlciA9IGNyZWF0ZVNoYWRlcihyZXF1aXJlKFwiZ2xzbGlmeS9zaW1wbGUtYWRhcHRlci5qc1wiKShcIlxcbiNkZWZpbmUgR0xTTElGWSAxXFxuXFxudmFyeWluZyB2ZWMyIHZVdjtcXG52b2lkIG1haW4oKSB7XFxuICB2VXYgPSB1djtcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7XFxufVwiLCBcIlxcbiNkZWZpbmUgR0xTTElGWSAxXFxuXFxudW5pZm9ybSBmbG9hdCB0aW1lO1xcbnVuaWZvcm0gdmVjNCBjb2xvcjtcXG51bmlmb3JtIHZlYzIgb2Zmc2V0O1xcbnVuaWZvcm0gc2FtcGxlcjJEIHRleHR1cmU7XFxudmFyeWluZyB2ZWMyIHZVdjtcXG52b2lkIG1haW4oKSB7XFxuICB2ZWM0IHRleGVsID0gdGV4dHVyZTJEKHRleHR1cmUsIHZVdiAqIDAuMSArIChvZmZzZXQgKyB0aW1lICogMC4wMDAwMSkgKiBvZmZzZXQpICsgdGV4dHVyZTJEKHRleHR1cmUsIHZVdiAqIDAuMjIgKyAob2Zmc2V0ICsgdGltZSAqIDAuMDAwMDA1NSkgKiBvZmZzZXQpO1xcbiAgZmxvYXQgZWRnZXMgPSAwLjUgLSBsZW5ndGgodlV2IC0gMC41KTtcXG4gIGdsX0ZyYWdDb2xvciA9IGNvbG9yICogZWRnZXMgKiB2ZWM0KDEuMCwgMS4wLCAxLjAsIHRleGVsLncgKiB0ZXhlbC53ICogMi41KTtcXG59XCIsIFt7XCJuYW1lXCI6XCJ0aW1lXCIsXCJ0eXBlXCI6XCJmbG9hdFwifSx7XCJuYW1lXCI6XCJjb2xvclwiLFwidHlwZVwiOlwidmVjNFwifSx7XCJuYW1lXCI6XCJvZmZzZXRcIixcInR5cGVcIjpcInZlYzJcIn0se1wibmFtZVwiOlwidGV4dHVyZVwiLFwidHlwZVwiOlwic2FtcGxlcjJEXCJ9XSwgW10pKTtcbiAgICBzaGFkZXIuc2lkZSA9IFRIUkVFLkJhY2tTaWRlO1xuXG4gICAgc2hhZGVyLnVuaWZvcm1zID0ge1xuICAgICAgICB0aW1lOiB7XG4gICAgICAgICAgICB0eXBlOiBcImZcIixcbiAgICAgICAgICAgIHZhbHVlOiAwXG4gICAgICAgIH0sXG5cbiAgICAgICAgdGV4dHVyZToge1xuICAgICAgICAgICAgdHlwZTogXCJ0XCIsXG4gICAgICAgICAgICB2YWx1ZTogbnVsbFxuICAgICAgICB9LFxuXG4gICAgICAgIG9mZnNldDoge1xuICAgICAgICAgICAgdHlwZTogXCJ2MlwiLFxuICAgICAgICAgICAgdmFsdWU6IGNvbmZpZy5vZmZzZXRcbiAgICAgICAgfSxcblxuICAgICAgICBjb2xvcjoge1xuICAgICAgICAgICAgdHlwZTogXCJ2NFwiLFxuICAgICAgICAgICAgdmFsdWU6IGNvbmZpZy5jb2xvclxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbChzaGFkZXIpO1xuICAgIG1hdGVyaWFsLnRyYW5zcGFyZW50ID0gdHJ1ZTtcbiAgICBtYXRlcmlhbC5ibGVuZGluZyA9IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmc7XG4gICAgbWF0ZXJpYWwuc2lkZSA9IFRIUkVFLkRvdWJsZVNpZGU7XG4gICAgbWF0ZXJpYWwuZGVwdGhUZXN0ID0gZmFsc2U7XG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuICAgIG1lc2gucm90YXRpb24ueCA9IGNvbmZpZy5yb3RhdGlvbjtcbiAgICBtZXNoLnBvc2l0aW9uLnkgPSBjb25maWcuaGVpZ2h0O1xuICAgIG1lc2guc2NhbGUubXVsdGlwbHlTY2FsYXIoMTApO1xuICAgIHNoYWRlci51bmlmb3Jtcy50ZXh0dXJlLnZhbHVlID0gc2V0dXBUZXh0dXJlKG1lc2gsIHBvZW0uc2NlbmUpO1xuXG4gICAgcG9lbS5vbihcInVwZGF0ZVwiLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBjYW1lcmFQb3NpdGlvbiA9IHBvZW0uY2FtZXJhLm9iamVjdC5wb3NpdGlvbjtcbiAgICAgICAgc2hhZGVyLnVuaWZvcm1zLnRpbWUudmFsdWUgPSBlLnRpbWU7XG4gICAgICAgIG1lc2gucG9zaXRpb24uc2V0KGNhbWVyYVBvc2l0aW9uLngsIG1lc2gucG9zaXRpb24ueSwgY2FtZXJhUG9zaXRpb24ueik7XG4gICAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENsb3VkczsiLCJ2YXIgQ2FtZXJhID0gZnVuY3Rpb24oIHBvZW0sIHByb3BlcnRpZXMgKSB7XG5cdFxuXHR0aGlzLnBvZW0gPSBwb2VtO1xuXHRcdFxuXHR0aGlzLm9iamVjdCA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYShcblx0XHRwcm9wZXJ0aWVzLmZvdiB8fCA1MCxcdFx0XHRcdFx0Ly8gZm92XG5cdFx0d2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQsXHQvLyBhc3BlY3QgcmF0aW9cblx0XHRwcm9wZXJ0aWVzLm5lYXIgfHwgMyxcdFx0XHRcdFx0Ly8gbmVhciBmcnVzdHVtXG5cdFx0cHJvcGVydGllcy5mYXIgfHwgMTAwMDBcdFx0XHRcdFx0Ly8gZmFyIGZydXN0dW1cblx0KTtcblx0XG5cdHRoaXMub2JqZWN0LnBvc2l0aW9uLnggPSBfLmlzTnVtYmVyKCBwcm9wZXJ0aWVzLnggKSA/IHByb3BlcnRpZXMueCA6IDA7XG5cdHRoaXMub2JqZWN0LnBvc2l0aW9uLnkgPSBfLmlzTnVtYmVyKCBwcm9wZXJ0aWVzLnkgKSA/IHByb3BlcnRpZXMueSA6IDA7XG5cdHRoaXMub2JqZWN0LnBvc2l0aW9uLnogPSBfLmlzTnVtYmVyKCBwcm9wZXJ0aWVzLnogKSA/IHByb3BlcnRpZXMueiA6IDUwMDtcblx0XG5cdHRoaXMucG9lbS5zY2VuZS5hZGQoIHRoaXMub2JqZWN0ICk7XG5cdFxuXHR0aGlzLnBvZW0ub24oICdyZXNpemUnLCB0aGlzLnJlc2l6ZS5iaW5kKHRoaXMpICk7XG5cdFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW1lcmE7XG5cbkNhbWVyYS5wcm90b3R5cGUgPSB7XG5cdFxuXHRyZXNpemUgOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLm9iamVjdC5hc3BlY3QgPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodDtcblx0XHR0aGlzLm9iamVjdC51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG5cdH1cbn07IiwiZnVuY3Rpb24gdXBkYXRlQ2FtZXJhKCBwb3NpdGlvbiwgbW92ZW1lbnQgKSB7XG5cblx0dmFyIGNoYW5nZU1vdmVtZW50ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuXHRyZXR1cm4gZnVuY3Rpb24oZSkge1xuXHRcdFxuXHRcdGNoYW5nZU1vdmVtZW50XG5cdFx0XHQuY29weSggbW92ZW1lbnQgKVxuXHRcdFx0Lm11bHRpcGx5U2NhbGFyKGUudW5pdER0KTtcblx0XHRcblx0XHRwb3NpdGlvbi5hZGQoIGNoYW5nZU1vdmVtZW50ICk7XG5cdFx0XG5cdH07XG59XG5cbnZhciBDb25zdGFudE1vdmUgPSBmdW5jdGlvbiggcG9lbSwgcHJvcGVydGllcyApIHtcblx0XG5cdHZhciBjb25maWcgPSBfLmV4dGVuZCh7XG5cdFx0eCA6IDAsXG5cdFx0eSA6IDAsXG5cdFx0eiA6IDBcblx0fSwgcHJvcGVydGllcyk7XG5cdFxuXHR2YXIgbW92ZW1lbnQgPSBuZXcgVEhSRUUuVmVjdG9yMyggY29uZmlnLngsIGNvbmZpZy55LCBjb25maWcueiApO1xuXHRcblx0cG9lbS5vbigndXBkYXRlJywgdXBkYXRlQ2FtZXJhKCBwb2VtLmNhbWVyYS5vYmplY3QucG9zaXRpb24sIG1vdmVtZW50KSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbnN0YW50TW92ZTsiLCJ2YXIgT3JiaXRDb250cm9scyA9IHJlcXVpcmUoJy4uLy4uL3ZlbmRvci9PcmJpdENvbnRyb2xzJyk7XG5cbnZhciBDb250cm9scyA9IGZ1bmN0aW9uKCBwb2VtLCBwcm9wZXJ0aWVzICkge1xuXHRcblx0dGhpcy5wb2VtID0gcG9lbTtcblx0dGhpcy5wcm9wZXJ0aWVzID0gcHJvcGVydGllcztcblxuXHR0aGlzLmNvbnRyb2xzID0gbmV3IE9yYml0Q29udHJvbHMoIHRoaXMucG9lbS5jYW1lcmEub2JqZWN0LCB0aGlzLnBvZW0uY2FudmFzICk7XG5cdFxuXHRfLmV4dGVuZCggdGhpcy5jb250cm9scywgcHJvcGVydGllcyApO1xuXHRcblx0dGhpcy5wb2VtLm9uKCAndXBkYXRlJywgdGhpcy5jb250cm9scy51cGRhdGUuYmluZCggdGhpcy5jb250cm9scyApICk7XG5cdFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9scztcbiIsInZhciBPcmJpdENvbnRyb2xzID0gcmVxdWlyZSgnLi4vLi4vdmVuZG9yL09yYml0Q29udHJvbHMnKTtcbnZhciBEZXZpY2VPcmllbnRhdGlvbkNvbnRyb2xzID0gcmVxdWlyZSgnLi4vLi4vdmVuZG9yL0RldmljZU9yaWVudGF0aW9uQ29udHJvbHMnKTtcbnZhciBfZTtcblxuJCh3aW5kb3cpLm9uZSggJ2RldmljZW9yaWVudGF0aW9uJywgZnVuY3Rpb24oIGUgKSB7XG5cdF9lID0gZTtcbn0pO1xuXG5cbnZhciBPcmllbnRhdGlvbiA9IGZ1bmN0aW9uKCBwb2VtICkge1xuXHRcblx0dGhpcy5wb2VtID0gcG9lbTtcblx0dGhpcy5jYW1lcmEgPSB0aGlzLnBvZW0uY2FtZXJhLm9iamVjdDtcblx0XG5cdHRoaXMuY29udHJvbHMgPSBuZXcgT3JiaXRDb250cm9scyggdGhpcy5jYW1lcmEsIHRoaXMucG9lbS5jYW52YXMgKTtcblx0dGhpcy5jb250cm9scy5yb3RhdGVVcChNYXRoLlBJIC8gNCk7XG5cdHRoaXMuY29udHJvbHMudGFyZ2V0LnNldChcblx0XHR0aGlzLmNhbWVyYS5wb3NpdGlvbi54ICsgMC4xLFxuXHRcdHRoaXMuY2FtZXJhLnBvc2l0aW9uLnksXG5cdFx0dGhpcy5jYW1lcmEucG9zaXRpb24uelxuXHQpO1xuXHR0aGlzLmNvbnRyb2xzLm5vWm9vbSA9IHRydWU7XG5cdHRoaXMuY29udHJvbHMubm9QYW4gPSB0cnVlO1xuXG5cdHRoaXMuZGV2aWNlT3JpZW50YXRpb25IYW5kbGVyID0gdGhpcy5zZXRPcmllbnRhdGlvbkNvbnRyb2xzLmJpbmQodGhpcyk7XG5cblx0JCh3aW5kb3cpLm9uKCAnZGV2aWNlb3JpZW50YXRpb24nLCB0aGlzLmRldmljZU9yaWVudGF0aW9uSGFuZGxlciApO1xuXHRcblx0dGhpcy5wb2VtLm9uKCAndXBkYXRlJywgdGhpcy51cGRhdGUuYmluZCh0aGlzKSApO1xuXHR0aGlzLnBvZW0ub24oICdkZXN0cm95JywgdGhpcy5kZXN0cm95LmJpbmQodGhpcykgKTtcblx0XG5cdGlmKCBfZSApIHRoaXMuc2V0T3JpZW50YXRpb25Db250cm9scyggX2UgKTtcblx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9yaWVudGF0aW9uO1xuXG5PcmllbnRhdGlvbi5wcm90b3R5cGUgPSB7XG5cblx0c2V0T3JpZW50YXRpb25Db250cm9scyA6IGZ1bmN0aW9uKCBlICkge1xuXHRcdC8vIGlmKCAhZS5vcmlnaW5hbEV2ZW50LmFscGhhICkge1xuXHRcdC8vIFx0cmV0dXJuO1xuXHRcdC8vIH1cblxuXHRcdHRoaXMuY29udHJvbHMgPSBuZXcgRGV2aWNlT3JpZW50YXRpb25Db250cm9scyggdGhpcy5jYW1lcmEsIHRydWUgKTtcblx0XHR0aGlzLmNvbnRyb2xzLmNvbm5lY3QoKTtcblx0XHR0aGlzLmNvbnRyb2xzLnVwZGF0ZSgpO1xuXG5cdFx0JCh3aW5kb3cpLm9mZiggJ2RldmljZW9yaWVudGF0aW9uJywgdGhpcy5kZXZpY2VPcmllbnRhdGlvbkhhbmRsZXIgKTtcblx0fSxcblx0XG5cdHVwZGF0ZSA6IGZ1bmN0aW9uKCBlICkge1xuXHRcdHRoaXMuY29udHJvbHMudXBkYXRlKCk7XG5cdH0sXG5cdFxuXHRkZXN0cm95IDogZnVuY3Rpb24oIGUgKSB7XG5cdFx0JCh3aW5kb3cpLm9mZiggJ2RldmljZW9yaWVudGF0aW9uJywgdGhpcy5kZXZpY2VPcmllbnRhdGlvbkhhbmRsZXIgKTtcblx0fVxuXHRcbn07IiwidmFyIFJvdGF0ZUFyb3VuZE9yaWdpbiA9IGZ1bmN0aW9uKCBwb2VtICkge1xuXHRcblx0dmFyIGNhbWVyYSA9IHBvZW0uY2FtZXJhLm9iamVjdDtcblx0dmFyIHNwZWVkID0gMC4wMDAwNTtcblx0dmFyIGJhc2VZID0gY2FtZXJhLnBvc2l0aW9uLnk7XG5cdHZhciBiYXNlWiA9IGNhbWVyYS5wb3NpdGlvbi56IC8gMjtcblx0XG5cdHBvZW0ub24oJ3VwZGF0ZScsIGZ1bmN0aW9uKCBlICkge1xuXHRcdFxuXHRcdHBvZW0uZ3JpZC5ncmlkLnJvdGF0aW9uLnkgKz0gZS5kdCAqIHNwZWVkO1xuXHRcdGlmKCBwb2VtLnBvaW50Y2xvdWQub2JqZWN0ICkge1xuXHRcdFx0cG9lbS5wb2ludGNsb3VkLm9iamVjdC5yb3RhdGlvbi55ICs9IGUuZHQgKiBzcGVlZDtcblx0XHR9XG5cdFx0XG5cdFx0Y2FtZXJhLnBvc2l0aW9uLnkgPSBiYXNlWSArIE1hdGguc2luKCBlLnRpbWUgKiBzcGVlZCAqIDEwICkgKiAyMDA7XG5cdFx0Y2FtZXJhLnBvc2l0aW9uLnogPSBiYXNlWSArIE1hdGguc2luKCBlLnRpbWUgKiBzcGVlZCAqIDEwICkgKiBiYXNlWjtcblx0XHRcblx0XHRcblx0fSk7XG5cdFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBSb3RhdGVBcm91bmRPcmlnaW47XG5cblJvdGF0ZUFyb3VuZE9yaWdpbi5wcm90b3R5cGUgPSB7XG5cbn07IiwiZnVuY3Rpb24gbW91c2VNb3ZlKCBwcmV2WFksIHF1YXRlcm5pb24sIHNwZWVkWCwgc3BlZWRZICkge1xuXHRcblx0dmFyIGF4aXNYID0gbmV3IFRIUkVFLlZlY3RvcjMoMSwwLDApO1xuXHR2YXIgYXhpc1kgPSBuZXcgVEhSRUUuVmVjdG9yMygwLDEsMCk7XG5cdFxuXHR2YXIgcTEgPSBuZXcgVEhSRUUuUXVhdGVybmlvbigpO1xuXHR2YXIgcTIgPSBuZXcgVEhSRUUuUXVhdGVybmlvbigpO1xuXHRcblx0dmFyIHJvdGF0aW9uWCA9IDA7XG5cdHZhciByb3RhdGlvblkgPSAwO1xuXHRcblx0cmV0dXJuIGZ1bmN0aW9uKCBlICkge1xuXHRcdFxuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFxuXHRcdHZhciB4ID0gZS5wYWdlWDtcblx0XHR2YXIgeSA9IGUucGFnZVk7XG5cdFx0XG5cdFx0dmFyIG9mZnNldFggPSBwcmV2WFkueCAtIHg7XG5cdFx0dmFyIG9mZnNldFkgPSBwcmV2WFkueSAtIHk7XG5cdFx0XHRcblx0XHRyb3RhdGlvblkgKz0gb2Zmc2V0WCAqIHNwZWVkWDtcblx0XHRyb3RhdGlvblggKz0gb2Zmc2V0WSAqIHNwZWVkWTtcblx0XHRcblx0XHRyb3RhdGlvblggPSBNYXRoLm1pbiggcm90YXRpb25YLCBNYXRoLlBJICogMC40NSApO1xuXHRcdHJvdGF0aW9uWCA9IE1hdGgubWF4KCByb3RhdGlvblgsIC1NYXRoLlBJICogMC40NSApO1xuXHRcdFxuXHRcdHExLnNldEZyb21BeGlzQW5nbGUoIGF4aXNZLCByb3RhdGlvblkgKTtcblx0XHRxMi5zZXRGcm9tQXhpc0FuZ2xlKCBheGlzWCwgcm90YXRpb25YICk7XG5cdFx0cXVhdGVybmlvbi5tdWx0aXBseVF1YXRlcm5pb25zKCBxMSwgcTIgKTtcblx0XHRcblx0XHRcblx0XHRwcmV2WFkueCA9IHg7XG5cdFx0cHJldlhZLnkgPSB5O1xuXHRcdFxuXHR9O1xufVxuXG5mdW5jdGlvbiBtb3VzZVVwKCAkY2FudmFzLCBoYW5kbGVycyApIHtcblxuXHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0JGNhbnZhcy5vZmYoJ21vdXNlbGVhdmUnLCBoYW5kbGVycy5tb3VzZVVwKTtcblx0XHQkY2FudmFzLm9mZignbW91c2V1cCcsIGhhbmRsZXJzLm1vdXNlVXApO1xuXHRcdCRjYW52YXMub2ZmKCdtb3VzZW1vdmUnLCBoYW5kbGVycy5tb3VzZU1vdmUpO1xuXHR9O1xufVxuXG5mdW5jdGlvbiBtb3VzZURvd24oICRjYW52YXMsIGhhbmRsZXJzLCBwcmV2WFkgKSB7XG5cblx0cmV0dXJuIGZ1bmN0aW9uKCBlICkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcblx0XHRwcmV2WFkueCA9IGUucGFnZVg7XG5cdFx0cHJldlhZLnkgPSBlLnBhZ2VZO1xuXHRcdFxuXHRcdCRjYW52YXMub24oJ21vdXNlbGVhdmUnLCBoYW5kbGVycy5tb3VzZVVwICk7XG5cdFx0JGNhbnZhcy5vbignbW91c2V1cCcsIGhhbmRsZXJzLm1vdXNlVXAgKTtcblx0XHQkY2FudmFzLm9uKCdtb3VzZW1vdmUnLCBoYW5kbGVycy5tb3VzZU1vdmUgKTtcblx0fTtcbn1cblxuZnVuY3Rpb24gc3RvcEhhbmRsZXJzKCAkY2FudmFzLCBoYW5kbGVycyApIHtcblxuXHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0JGNhbnZhcy5vZmYoJ21vdXNlbGVhdmUnLCBoYW5kbGVycy5tb3VzZVVwKTtcblx0XHQkY2FudmFzLm9mZignbW91c2V1cCcsIGhhbmRsZXJzLm1vdXNlVXApO1xuXHRcdCRjYW52YXMub2ZmKCdtb3VzZW1vdmUnLCBoYW5kbGVycy5tb3VzZU1vdmUpO1xuXHRcdCRjYW52YXMub2ZmKCdtb3VzZWRvd24nLCBoYW5kbGVycy5tb3VzZURvd24pO1xuXHR9O1xufVxuXG5mdW5jdGlvbiBzdGFydE1vdXNlSGFuZGxlcnMoIGNhbnZhcywgY2FtZXJhT2JqLCBwb2VtLCBzcGVlZFgsIHNwZWVkWSApIHtcblx0XG5cdHZhciBwcmV2WFkgPSB7eDowLHk6MH07XG5cdHZhciAkY2FudmFzID0gJChjYW52YXMpO1xuXHR2YXIgaGFuZGxlcnMgPSB7fTtcdFxuXHR2YXIgcXVhdGVybmlvbiA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKCkuY29weSggY2FtZXJhT2JqLnF1YXRlcm5pb24gKTtcblx0XG5cdGhhbmRsZXJzLm1vdXNlTW92ZSA9IG1vdXNlTW92ZSggcHJldlhZLCBxdWF0ZXJuaW9uLCBzcGVlZFgsIHNwZWVkWSApO1xuXHRoYW5kbGVycy5tb3VzZVVwID0gbW91c2VVcCggJGNhbnZhcywgaGFuZGxlcnMgKTtcblx0aGFuZGxlcnMubW91c2VEb3duID0gbW91c2VEb3duKCAkY2FudmFzLCBoYW5kbGVycywgcHJldlhZICk7XG5cdFxuXHQkY2FudmFzLm9uKCdtb3VzZWRvd24nLCBoYW5kbGVycy5tb3VzZURvd24pO1xuXHRwb2VtLm9uKCdkZXN0cm95Jywgc3RvcEhhbmRsZXJzKCAkY2FudmFzLCBoYW5kbGVycyApICk7XG5cdFxuXHRyZXR1cm4gcXVhdGVybmlvbjtcbn1cblxuZnVuY3Rpb24gdXBkYXRlQ2FtZXJhKCBjYW1lcmFRdWF0ZXJuaW9uLCB0YXJnZXRRdWF0ZXJuaW9uLCB1bml0SSApIHtcblx0XG5cdHJldHVybiBmdW5jdGlvbiggZSApIHtcblx0XHRcblx0XHRjYW1lcmFRdWF0ZXJuaW9uLnNsZXJwKCB0YXJnZXRRdWF0ZXJuaW9uLCB1bml0SSAqIGUudW5pdER0ICk7XG5cdFx0XG5cdH07XG59XG5cbnZhciBTd2l2ZWwgPSBmdW5jdGlvbiggcG9lbSwgcHJvcGVydGllcyApIHtcblx0XG5cdHZhciBjb25maWcgPSBfLmV4dGVuZCh7XG5cdFx0ZWFzaW5nIDogMC41LFxuXHRcdHNwZWVkWCA6IDAuMDAyLFxuXHRcdHNwZWVkWSA6IDAuMDAyXG5cdH0sIHByb3BlcnRpZXMpO1xuXHRcblx0dmFyIHRhcmdldFF1YXRlcm5pb24gPSBzdGFydE1vdXNlSGFuZGxlcnMoXG5cdFx0cG9lbS5jYW52YXMsXG5cdFx0cG9lbS5jYW1lcmEub2JqZWN0LFxuXHRcdHBvZW0sXG5cdFx0Y29uZmlnLnNwZWVkWCwgY29uZmlnLnNwZWVkWVxuXHQpO1xuXHRcblx0cG9lbS5vbigndXBkYXRlJywgdXBkYXRlQ2FtZXJhKCBwb2VtLmNhbWVyYS5vYmplY3QucXVhdGVybmlvbiwgdGFyZ2V0UXVhdGVybmlvbiwgY29uZmlnLmVhc2luZyApICk7XG5cdFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTd2l2ZWw7IiwidmFyIFRyYWNrQ2FtZXJhTGlnaHRzID0gZnVuY3Rpb24oIHBvZW0sIHByb3BlcnRpZXMgKSB7XG5cdFxuXHR0aGlzLmxpZ2h0cyA9IFtdO1xuXHRcblx0dmFyIGFtYmllbnQgPSBuZXcgVEhSRUUuQW1iaWVudExpZ2h0KCAweDExMTExMSwgMSwgMCApO1xuXHRcdGFtYmllbnQucG9zaXRpb24uc2V0KDAsIDIwMDAsIDEwMDApO1xuXHRcblx0dmFyIGZyb250ID0gbmV3IFRIUkVFLlBvaW50TGlnaHQoIDB4ZmZmZmZmLCAwLjMsIDAgKTtcblxuXHR2YXIgcmlnaHRGaWxsID0gbmV3IFRIUkVFLlBvaW50TGlnaHQoIDB4ZmZmZmZmLCAxLCAwICk7XG5cdFx0cmlnaHRGaWxsLnBvc2l0aW9uLnNldCgzMDAwLCAyMDAwLCA1MDAwKTtcblx0XG5cdHZhciByaW1Cb3R0b20gPSBuZXcgVEhSRUUuUG9pbnRMaWdodCggMHhmZmZmZmYsIDEsIDAgKTtcblx0XHRyaW1Cb3R0b20ucG9zaXRpb24uc2V0KC0xMDAwLCAtMTAwMCwgLTEwMDApO1xuXHRcdFxuXHR2YXIgcmltQmFja0xlZnQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCggMHhmZmZmZmYsIDIsIDAgKTtcblx0XHRyaW1CYWNrTGVmdC5wb3NpdGlvbi5zZXQoLTcwMCwgNTAwLCAtMTAwMCk7XG5cdFxuXHRwb2VtLnNjZW5lLmFkZCggYW1iaWVudCApO1xuXHQvLyBwb2VtLmNhbWVyYS5vYmplY3QuYWRkKCBmcm9udCApO1xuXHRwb2VtLmNhbWVyYS5vYmplY3QuYWRkKCByaWdodEZpbGwgKTtcblx0cG9lbS5jYW1lcmEub2JqZWN0LmFkZCggcmltQm90dG9tICk7XG5cdHBvZW0uY2FtZXJhLm9iamVjdC5hZGQoIHJpbUJhY2tMZWZ0ICk7XG5cdFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUcmFja0NhbWVyYUxpZ2h0cztcblxuVHJhY2tDYW1lcmFMaWdodHMucHJvdG90eXBlID0ge1xuXG59OyIsInZhciBNckRvb2JTdGF0cyA9IHJlcXVpcmUoJy4uLy4uL3ZlbmRvci9TdGF0cycpO1xuXG52YXIgU3RhdHMgPSBmdW5jdGlvbiggcG9lbSApIHtcblx0XG5cdHRoaXMucG9lbSA9IHBvZW07XG5cdFxuXHR0aGlzLnN0YXRzID0gbmV3IE1yRG9vYlN0YXRzKCk7XG5cdHRoaXMuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG5cdHRoaXMuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4Jztcblx0JCggdGhpcy5wb2VtLmRpdiApLmFwcGVuZCggdGhpcy5zdGF0cy5kb21FbGVtZW50ICk7XG5cdFxuXHR0aGlzLnBvZW0ub24oICd1cGRhdGUnLCB0aGlzLnN0YXRzLnVwZGF0ZS5iaW5kKCB0aGlzLnN0YXRzICkgKTtcblx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXRzOyIsInZhciByYW5kb20gPSByZXF1aXJlKCcuLi91dGlscy9yYW5kb20nKVxuICAsIGxvYWRUZXh0dXJlXHQ9IHJlcXVpcmUoJy4uL3V0aWxzL2xvYWRUZXh0dXJlJylcbiAgLCBSU1ZQID0gcmVxdWlyZSgncnN2cCcpO1xuXG52YXIgRWFydGggPSBmdW5jdGlvbihwb2VtLCBwcm9wZXJ0aWVzKSB7XG5cdFxuXHR0aGlzLnBvZW0gPSBwb2VtO1xuXHRcblx0dGhpcy5nZW9tZXRyeSA9IG51bGw7XG5cdHRoaXMubWF0ZXJpYWwgPSBudWxsO1xuICAgIHRoaXMubWVzaCA9IG51bGw7XG5cdHRoaXMudGV4dHVyZSA9IG51bGw7XG5cdFxuXHQkKCcjTGV2ZWxTZWxlY3QnKS5oaWRlKCk7XG5cdFxuXHR0aGlzLnJhZGl1cyA9IHByb3BlcnRpZXMucmFkaXVzID4gMCA/IHByb3BlcnRpZXMucmFkaXVzIDogMjUwO1xuXG5cdHZhciAkYSA9ICQoXCI8YSBocmVmPSdodHRwOi8vc3ZzLmdzZmMubmFzYS5nb3YvY2dpLWJpbi9kZXRhaWxzLmNnaT9haWQ9MTE3MTknPjwvYT5cIik7XG5cdCRhLmFwcGVuZCggJChcIjxpbWcgY2xhc3M9J25hc2EtbG9nbyB3aWRlJyBzcmM9J2Fzc2V0cy9pbWFnZXMvbmFzYS1nb2RkYXJkLnBuZycgLz5cIikgKTtcblx0JGEuYXR0cihcInRpdGxlXCIsIFwiTWFwIHZpc3VhbGl6YXRpb24gY3JlZGl0IHRvIE5BU0EncyBHb2RkYXJkIFNwYWNlIEZsaWdodCBDZW50ZXJcIik7XG5cdFxuXHR0aGlzLnBvZW0uJGRpdi5hcHBlbmQoICRhICk7XG5cdFxuXHR0aGlzLnN0YXJ0KCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVhcnRoO1xuXG5FYXJ0aC5wcm90b3R5cGUgPSB7XG5cdFxuXHRzdGFydCA6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdHRoaXMuY3JlYXRlVGV4dHVyZSgpO1xuXG5cdFx0dGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSggdGhpcy5yYWRpdXMsIDY0LCA2NCApO1xuXHRcdHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuXHRcdFx0bWFwOiB0aGlzLnRleHR1cmUsXG5cdFx0XHRzaGluaW5lc3M6IDI1LFxuXHRcdFx0c3BlY3VsYXI6IDB4MTExMTExLFxuXHRcdFx0Ly8gY29sb3I6IDB4ZmYwMDAwXG5cdFx0fSk7XG5cdFxuXHRcdHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKCB0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsICk7XG5cdFxuXHRcdHRoaXMucG9lbS5zY2VuZS5hZGQoIHRoaXMubWVzaCApO1xuXHRcblx0XHR0aGlzLnBvZW0ub24oICd1cGRhdGUnLCB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpICk7XG5cdFx0XG5cdH0sXG5cdFxuXHRjcmVhdGVUZXh0dXJlIDogZnVuY3Rpb24oKSB7XG5cdFx0XG5cdFx0dGhpcy52aWRlbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICd2aWRlbycgKTtcblx0XHR0aGlzLiR2aWRlbyA9ICQodGhpcy52aWRlbyk7XG5cblx0XHQvLyB0aGlzLnZpZGVvLm11dGVkID0gdHJ1ZTtcblx0XHR0aGlzLnZpZGVvLmNvbnRyb2xzID0gdHJ1ZTtcblx0XHR0aGlzLnZpZGVvLmxvb3AgPSB0cnVlO1xuXHRcdFxuXHRcdC8vIHRoaXMucG9lbS4kZGl2LmFwcGVuZCggdGhpcy52aWRlbyApO1xuXHRcdFxuXHRcdC8vIHRoaXMuJHZpZGVvLmNzcyh7XG5cdFx0Ly8gXHRwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxuXHRcdC8vIFx0dG9wOiAwLFxuXHRcdC8vIFx0bGVmdDogMFxuXHRcdC8vIH0pO1xuXHRcdFxuXHRcdC8vIHdpbmRvdy52ID0gdGhpcy52aWRlbztcblx0XHRcblx0XHRcblx0XHQvLyB2aWRlby5pZCA9ICd2aWRlbyc7XG5cdFx0Ly8gdmlkZW8udHlwZSA9ICcgdmlkZW8vb2dnOyBjb2RlY3M9XCJ0aGVvcmEsIHZvcmJpc1wiICc7XG5cdFx0Ly8gdGhpcy52aWRlby5zcmMgPSBcImFzc2V0cy92aWRlby9lYXJ0aGNvMi5tNHZcIjtcblx0XHRcblx0XHRcdFxuXHRcdGlmKCB0aGlzLnZpZGVvLmNhblBsYXlUeXBlKFwidmlkZW8vbXA0XCIpICkge1xuXHRcdFx0XG5cdFx0XHR0aGlzLnZpZGVvLnNyYyA9IFwiYXNzZXRzL3ZpZGVvL2VhcnRoY28yLWxhcmdlLm1wNFwiO1xuXHRcdFx0XG5cdFx0fSBlbHNlIHtcblx0XHRcdFxuXHRcdFx0dGhpcy52aWRlby5zcmMgPSBcImFzc2V0cy92aWRlby9lYXJ0aGNvMi53ZWJtXCI7XG5cdFx0XHRcblx0XHR9XG5cdFx0XHRcblx0XHRcdFx0XG5cdFx0XG5cdFx0dGhpcy52aWRlby5sb2FkKCk7IC8vIG11c3QgY2FsbCBhZnRlciBzZXR0aW5nL2NoYW5naW5nIHNvdXJjZVxuXHRcdHRoaXMudmlkZW8ucGxheSgpO1xuXHRcblx0XHR0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XG5cdFx0Ly8gdGhpcy5jYW52YXMud2lkdGggPSA5NjA7XG5cdFx0Ly8gdGhpcy5jYW52YXMuaGVpZ2h0ID0gNDgwO1xuXHRcdHRoaXMuY2FudmFzLndpZHRoID0gMTkyMDtcblx0XHR0aGlzLmNhbnZhcy5oZWlnaHQgPSA5NjA7XG5cblxuXHRcdHRoaXMuY3R4MmQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICk7XG5cdFx0Ly8gYmFja2dyb3VuZCBjb2xvciBpZiBubyB2aWRlbyBwcmVzZW50XG5cdFx0dGhpcy5jdHgyZC5maWxsU3R5bGUgPSAnIzAwMDAwMCc7XG5cdFx0dGhpcy5jdHgyZC5maWxsUmVjdCggMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCApO1xuXG5cdFx0dGhpcy50ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUoIHRoaXMuY2FudmFzICk7XG5cdFx0dGhpcy50ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhckZpbHRlcjtcblx0XHR0aGlzLnRleHR1cmUubWFnRmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuXHRcdFxuXHR9LFxuXHRcblx0ZXJyb3IgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0fSxcblx0XG5cdHVwZGF0ZSA6IGZ1bmN0aW9uKGUpIHtcblx0XHRcblx0XHRpZiAoIHRoaXMudmlkZW8ucmVhZHlTdGF0ZSA9PT0gdGhpcy52aWRlby5IQVZFX0VOT1VHSF9EQVRBICkge1xuXHRcdFx0XG5cdFx0XHR0aGlzLmN0eDJkLmRyYXdJbWFnZSggdGhpcy52aWRlbywgMCwgMCApO1xuXHRcdFx0XG5cdFx0XHRpZiAoIHRoaXMudGV4dHVyZSApIHRoaXMudGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cdFx0XHRcblx0XHR9XG5cdFx0XG5cdFx0dGhpcy5tZXNoLnJvdGF0aW9uLnkgKz0gZS5kdCAqIDAuMDAwMDU7XG5cdFx0XG5cdH1cblx0XG59OyIsInZhciBnbHNsaWZ5ID0gcmVxdWlyZShcImdsc2xpZnlcIik7XG52YXIgY3JlYXRlU2hhZGVyID0gcmVxdWlyZShcInRocmVlLWdsc2xpZnlcIikoVEhSRUUpO1xuXG5mdW5jdGlvbiBjcmVhdGVHZW9tZXRyeSh3aWR0aCwgc2VnbWVudHMpIHtcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSh3aWR0aCwgd2lkdGgsIHNlZ21lbnRzLCBzZWdtZW50cyk7XG4gICAgZ2VvbWV0cnkuYXBwbHlNYXRyaXgobmV3IFRIUkVFLk1hdHJpeDQoKS5tYWtlUm90YXRpb25YKE1hdGguUEkgKiAwLjUpKTtcbiAgICByZXR1cm4gZ2VvbWV0cnk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVRleHR1cmUobWVzaCwgc2NlbmUpIHtcbiAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgdmFyIHRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZShpbWcpO1xuICAgIGltZy5zcmMgPSBcImFzc2V0cy9pbWFnZXMvY2xvdWQxMDI0LnBuZ1wiO1xuICAgIHRleHR1cmUud3JhcFQgPSBUSFJFRS5SZXBlYXRXcmFwcGluZztcbiAgICB0ZXh0dXJlLndyYXBTID0gVEhSRUUuUmVwZWF0V3JhcHBpbmc7XG5cbiAgICAkKGltZykub24oXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICB0ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgc2NlbmUuYWRkKG1lc2gpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRleHR1cmU7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVNoYWRlcigpIHt9XG5cbmZ1bmN0aW9uIGNyZWF0ZU1lc2hHcmlkKG1hdGVyaWFsLCB3aWR0aCwgZ3JpZExlbmd0aCwgdG90YWxQb2x5Z29uRGVuc2l0eSkge1xuICAgIHZhciBnZW9tZXRyeSA9IGNyZWF0ZUdlb21ldHJ5KHdpZHRoIC8gZ3JpZExlbmd0aCwgTWF0aC5mbG9vcih0b3RhbFBvbHlnb25EZW5zaXR5IC8gZ3JpZExlbmd0aCkpO1xuICAgIHZhciBtZXNoR3JpZCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuICAgIHZhciBtZXNoO1xuICAgIHZhciBzdGVwID0gd2lkdGggLyBncmlkTGVuZ3RoO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBncmlkTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBncmlkTGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuICAgICAgICAgICAgbWVzaEdyaWQuYWRkKG1lc2gpO1xuICAgICAgICAgICAgbWVzaC5wb3NpdGlvbi5zZXQoaSAqIHN0ZXAsIDAsIGogKiBzdGVwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtZXNoR3JpZDtcbn1cblxuZnVuY3Rpb24gdXBkYXRlTW9kdWxvTWVzaEdyaWQoY2FtZXJhUG9zaXRpb24sIG1lc2hlcywgd2lkdGgpIHtcbiAgICB2YXIgaWwgPSBtZXNoZXMubGVuZ3RoO1xuICAgIHZhciBoYWxmV2lkdGggPSB3aWR0aCAvIDI7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwb3NpdGlvbjtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGlsOyBpKyspIHtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gbWVzaGVzW2ldLnBvc2l0aW9uO1xuICAgICAgICAgICAgcG9zaXRpb24uc2V0KChwb3NpdGlvbi54IC0gY2FtZXJhUG9zaXRpb24ueCArIGhhbGZXaWR0aCkgJSB3aWR0aCArIGNhbWVyYVBvc2l0aW9uLnggLSBoYWxmV2lkdGgsIHBvc2l0aW9uLnksIChwb3NpdGlvbi56IC0gY2FtZXJhUG9zaXRpb24ueiArIGhhbGZXaWR0aCkgJSB3aWR0aCArIGNhbWVyYVBvc2l0aW9uLnogLSBoYWxmV2lkdGgpO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxudmFyIEVuZGxlc3NUZXJyYWluID0gZnVuY3Rpb24ocG9lbSwgcHJvcGVydGllcykge1xuICAgIHZhciBjb25maWcgPSBfLmV4dGVuZCh7XG4gICAgICAgIHdpZHRoOiA0MDAwLFxuICAgICAgICBncmlkTGVuZ3RoOiAxNixcbiAgICAgICAgdG90YWxQb2x5Z29uRGVuc2l0eTogMTAyNCxcbiAgICAgICAgcG9zaXRpb25ZOiAwXG4gICAgfSwgcHJvcGVydGllcyk7XG5cbiAgICB2YXIgc2hhZGVyID0gY3JlYXRlU2hhZGVyKHJlcXVpcmUoXCJnbHNsaWZ5L3NpbXBsZS1hZGFwdGVyLmpzXCIpKFwiXFxuI2RlZmluZSBHTFNMSUZZIDFcXG5cXG51bmlmb3JtIHNhbXBsZXIyRCB0ZXJyYWluO1xcbnVuaWZvcm0gZmxvYXQgaGVpZ2h0U2NhbGU7XFxudW5pZm9ybSBmbG9hdCB3aWR0aDtcXG52YXJ5aW5nIGZsb2F0IGhlaWdodDtcXG52YXJ5aW5nIHZlYzIgdlV2O1xcbnZhcnlpbmcgZmxvYXQgdkNhbWVyYURpc3RhbmNlO1xcbnZvaWQgbWFpbigpIHtcXG4gIHZlYzQgbW9kZWxQb3NpdGlvbiA9IG1vZGVsTWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTtcXG4gIHZVdiA9IHZlYzIobW9kZWxQb3NpdGlvbi54LCBtb2RlbFBvc2l0aW9uLnopIC8gd2lkdGg7XFxuICBoZWlnaHQgPSB0ZXh0dXJlMkQodGVycmFpbiwgdlV2ICogMC4zKS53O1xcbiAgdkNhbWVyYURpc3RhbmNlID0gZGlzdGFuY2UobW9kZWxQb3NpdGlvbi54eXosIGNhbWVyYVBvc2l0aW9uKTtcXG4gIHZlYzQgbW9kaWZpZWRQb3NpdGlvbiA9IHZlYzQocG9zaXRpb24ueCwgcG9zaXRpb24ueSArIGhlaWdodCAqIGhlaWdodFNjYWxlLCBwb3NpdGlvbi56LCAxLjApO1xcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxWaWV3TWF0cml4ICogbW9kaWZpZWRQb3NpdGlvbjtcXG59XCIsIFwiXFxuI2RlZmluZSBHTFNMSUZZIDFcXG5cXG52ZWMzIGFfeF9oc3YycmdiKHZlYzMgYykge1xcbiAgdmVjNCBLID0gdmVjNCgxLjAsIDIuMCAvIDMuMCwgMS4wIC8gMy4wLCAzLjApO1xcbiAgdmVjMyBwID0gYWJzKGZyYWN0KGMueHh4ICsgSy54eXopICogNi4wIC0gSy53d3cpO1xcbiAgcmV0dXJuIGMueiAqIG1peChLLnh4eCwgY2xhbXAocCAtIEsueHh4LCAwLjAsIDEuMCksIGMueSk7XFxufVxcbnVuaWZvcm0gZmxvYXQgd2lkdGg7XFxudmFyeWluZyBmbG9hdCBoZWlnaHQ7XFxudmFyeWluZyB2ZWMyIHZVdjtcXG52YXJ5aW5nIGZsb2F0IHZDYW1lcmFEaXN0YW5jZTtcXG52b2lkIG1haW4oKSB7XFxuICBmbG9hdCBodWVYID0gYWJzKDAuNSAtIGZyYWN0KHZVdi54ICogMC44KSkgKiAyLjA7XFxuICBmbG9hdCBodWVZID0gYWJzKDAuNSAtIGZyYWN0KHZVdi55ICogMC42MykpICogMi4wO1xcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNChhX3hfaHN2MnJnYih2ZWMzKChodWVYICsgaHVlWSkgKiAwLjIgKyAwLjMsIG1peChoZWlnaHQsIDAuNSwgMC44KSwgbWl4KGhlaWdodCwgMS4yLCAwLjM1KSkpLCAxLjApO1xcbiAgZmxvYXQgZm9nRmFjdG9yID0gc21vb3Roc3RlcCgwLjAsIDEuMCwgdkNhbWVyYURpc3RhbmNlIC8gd2lkdGgpO1xcbiAgdmVjMyBmb2dDb2xvciA9IHZlYzMoMC4xNCwgMC4xNCwgMC4xNCk7XFxuICBnbF9GcmFnQ29sb3IgPSBtaXgoZ2xfRnJhZ0NvbG9yLCB2ZWM0KGZvZ0NvbG9yLCBnbF9GcmFnQ29sb3IudyksIGZvZ0ZhY3Rvcik7XFxufVwiLCBbe1wibmFtZVwiOlwidGVycmFpblwiLFwidHlwZVwiOlwic2FtcGxlcjJEXCJ9LHtcIm5hbWVcIjpcImhlaWdodFNjYWxlXCIsXCJ0eXBlXCI6XCJmbG9hdFwifSx7XCJuYW1lXCI6XCJ3aWR0aFwiLFwidHlwZVwiOlwiZmxvYXRcIn0se1wibmFtZVwiOlwid2lkdGhcIixcInR5cGVcIjpcImZsb2F0XCJ9XSwgW10pKTtcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoc2hhZGVyKTtcbiAgICBtYXRlcmlhbC5zaWRlID0gVEhSRUUuRG91YmxlU2lkZTtcbiAgICB2YXIgbWVzaEdyaWQgPSBjcmVhdGVNZXNoR3JpZChtYXRlcmlhbCwgY29uZmlnLndpZHRoLCBjb25maWcuZ3JpZExlbmd0aCwgY29uZmlnLnRvdGFsUG9seWdvbkRlbnNpdHkpO1xuICAgIG1lc2hHcmlkLnBvc2l0aW9uLnkgPSBjb25maWcucG9zaXRpb25ZO1xuICAgIHNoYWRlci51bmlmb3Jtcy50ZXJyYWluLnZhbHVlID0gY3JlYXRlVGV4dHVyZShtZXNoR3JpZCwgcG9lbS5zY2VuZSk7XG4gICAgc2hhZGVyLnVuaWZvcm1zLmhlaWdodFNjYWxlLnZhbHVlID0gY29uZmlnLndpZHRoIC8gMjA7XG4gICAgc2hhZGVyLnVuaWZvcm1zLndpZHRoLnZhbHVlID0gY29uZmlnLndpZHRoIC8gMjtcbiAgICBwb2VtLm9uKFwidXBkYXRlXCIsIHVwZGF0ZU1vZHVsb01lc2hHcmlkKHBvZW0uY2FtZXJhLm9iamVjdC5wb3NpdGlvbiwgbWVzaEdyaWQuY2hpbGRyZW4sIGNvbmZpZy53aWR0aCkpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFbmRsZXNzVGVycmFpbjsiLCJ2YXIgcmFuZG9tID0gcmVxdWlyZSgnLi4vdXRpbHMvcmFuZG9tJyk7XG5cbnZhciBHcmlkID0gZnVuY3Rpb24oIHBvZW0sIHByb3BlcnRpZXMgKSB7XG5cdFxuXHR0aGlzLnBvZW0gPSBwb2VtO1xuXG5cdHZhciBsaW5lTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTGluZUJhc2ljTWF0ZXJpYWwoIHsgY29sb3I6IDB4MzAzMDMwIH0gKSxcblx0XHRnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpLFxuXHRcdGZsb29yID0gLTc1LCBzdGVwID0gMjU7XG5cblx0Zm9yICggdmFyIGkgPSAwOyBpIDw9IDQwOyBpICsrICkge1xuXG5cdFx0Z2VvbWV0cnkudmVydGljZXMucHVzaCggbmV3IFRIUkVFLlZlY3RvcjMoIC0gNTAwLCBmbG9vciwgaSAqIHN0ZXAgLSA1MDAgKSApO1xuXHRcdGdlb21ldHJ5LnZlcnRpY2VzLnB1c2goIG5ldyBUSFJFRS5WZWN0b3IzKCAgIDUwMCwgZmxvb3IsIGkgKiBzdGVwIC0gNTAwICkgKTtcblxuXHRcdGdlb21ldHJ5LnZlcnRpY2VzLnB1c2goIG5ldyBUSFJFRS5WZWN0b3IzKCBpICogc3RlcCAtIDUwMCwgZmxvb3IsIC01MDAgKSApO1xuXHRcdGdlb21ldHJ5LnZlcnRpY2VzLnB1c2goIG5ldyBUSFJFRS5WZWN0b3IzKCBpICogc3RlcCAtIDUwMCwgZmxvb3IsICA1MDAgKSApO1xuXG5cdH1cblxuXHR0aGlzLmdyaWQgPSBuZXcgVEhSRUUuTGluZSggZ2VvbWV0cnksIGxpbmVNYXRlcmlhbCwgVEhSRUUuTGluZVBpZWNlcyApO1xuXHR0aGlzLnBvZW0uc2NlbmUuYWRkKCB0aGlzLmdyaWQgKTtcblx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdyaWQ7IiwidmFyIGNhbGN1bGF0ZVNxdWFyZWRUZXh0dXJlV2lkdGggPSByZXF1aXJlKCcuLi8uLi91dGlscy9jYWxjdWxhdGVTcXVhcmVkVGV4dHVyZVdpZHRoJylcbiAgLCBsb2FkVGV4dHVyZVx0PSByZXF1aXJlKCcuLi8uLi91dGlscy9sb2FkVGV4dHVyZScpXG4gICwgbG9hZFRleHRcdD0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvbG9hZFRleHQnKVxuICAsIFJTVlAgPSByZXF1aXJlKCdyc3ZwJyk7XG5cbnZhciBNZXNoR3JvdXAgPSBmdW5jdGlvbiggcG9lbSApIHtcblx0XG5cdFRIUkVFLk9iamVjdDNELmNhbGwoIHRoaXMgKTtcblx0XG5cdHRoaXMucG9lbSA9IHBvZW07XG5cdHRoaXMudHlwZSA9ICdNZXNoR3JvdXAnO1xuXHR0aGlzLmJ1ZmZlckdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XG5cdFxuXHR0aGlzLm1hdHJpY2VzVGV4dHVyZVdpZHRoID0gbnVsbDtcblx0dGhpcy5tYXRyaWNlc0RhdGEgPSBudWxsO1xuXHR0aGlzLm1hdHJpeEluZGljZXMgPSBudWxsO1xuXHRcblx0dGhpcy50ZXh0dXJlID0gbnVsbDtcblx0dGhpcy52ZXJ0ZXhTaGFkZXIgPSBudWxsO1xuXHR0aGlzLmZyYWdtZW50U2hhZGVyID0gbnVsbDtcblx0XG5cdHRoaXMubG9hZGVkID0gUlNWUC5hbGwoW1xuXHRcdGxvYWRUZXh0dXJlKCBcImFzc2V0cy9pbWFnZXMvc2luZWdyYXZpdHljbG91ZC5wbmdcIiwgdGhpcywgXCJ0ZXh0dXJlXCIgKSxcblx0XHRsb2FkVGV4dCggXCJqcy9kZW1vcy9NZXNoR3JvdXBCb3hEZW1vL3NoYWRlci52ZXJ0XCIsIHRoaXMsIFwidmVydGV4U2hhZGVyXCIgKSxcblx0XHRsb2FkVGV4dCggXCJqcy9kZW1vcy9NZXNoR3JvdXBCb3hEZW1vL3NoYWRlci5mcmFnXCIsIHRoaXMsIFwiZnJhZ21lbnRTaGFkZXJcIiApXG5cdF0pXG5cdC5jYXRjaCggZnVuY3Rpb24oIGVycm9yICkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCBsb2FkIGFzc2V0cyBmb3IgdGhlIE1lc2hHcm91cFwiLCBlcnJvcik7XG5cdH0pO1xuXHRcdFxufTtcblxuTWVzaEdyb3VwLnByb3RvdHlwZSA9IF8uZXh0ZW5kKCBPYmplY3QuY3JlYXRlKCBUSFJFRS5PYmplY3QzRC5wcm90b3R5cGUgKSwge1xuXG5cdGJ1aWxkIDogZnVuY3Rpb24oIHNjZW5lICkge1xuXHRcdFxuXHRcdHRoaXMubG9hZGVkLnRoZW4oIGZ1bmN0aW9uKCkge1xuXHRcdFx0XG5cdFx0XHR0aGlzLmJ1aWxkR2VvbWV0cnkoKTtcblx0XHRcdHRoaXMuYnVpbGRNYXRyaWNlcygpO1xuXHRcdFx0dGhpcy5idWlsZE1hdGVyaWFsKCk7XG5cdFx0XHRcblx0XHRcdHRoaXMub2JqZWN0ID0gbmV3IFRIUkVFLlBvaW50Q2xvdWQoIHRoaXMuYnVmZmVyR2VvbWV0cnksIHRoaXMubWF0ZXJpYWwgKTtcblx0XHRcdFxuXHRcdFx0c2NlbmUuYWRkKCB0aGlzLm9iamVjdCApO1xuXHRcdFx0XG5cdFx0XHR0aGlzLnBvZW0ub24oICd1cGRhdGUnLCB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpICk7XG5cdFx0XHRcblx0XHRcdFxuXHRcdH0uYmluZCh0aGlzKSApO1xuXHRcdFxuXHR9LFxuXHRcblx0YnVpbGRHZW9tZXRyeSA6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdHZhciBtZXJnZWRHZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xuXHRcdFxuXHRcdHZhciBjaGlsZEdlb21ldHJ5O1xuXHRcdHZhciBtYXRyaXhJbmRpY2VzID0gW107XG5cdFx0dmFyIGksIGlsLCBqLCBqbDtcblx0XHRcblx0XHRmb3IoIGkgPSAwLCBpbCA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpIDwgaWw7IGkrKyApIHtcblx0XHRcdFxuXHRcdFx0Y2hpbGRHZW9tZXRyeSA9IHRoaXMuY2hpbGRyZW5baV0uZ2VvbWV0cnk7XG5cdFx0XHRcblx0XHRcdGlmKCBjaGlsZEdlb21ldHJ5ICkge1xuXHRcdFx0XHRcblx0XHRcdFx0bWVyZ2VkR2VvbWV0cnkubWVyZ2UoIGNoaWxkR2VvbWV0cnkgKTtcblx0XHRcdFx0XG5cdFx0XHRcdGogPSBtZXJnZWRHZW9tZXRyeS52ZXJ0aWNlcy5sZW5ndGggLSBjaGlsZEdlb21ldHJ5LnZlcnRpY2VzLmxlbmd0aDtcblx0XHRcdFx0amwgPSBtZXJnZWRHZW9tZXRyeS52ZXJ0aWNlcy5sZW5ndGg7XG5cdFx0XHRcdFxuXHRcdFx0XHRmb3IoIDsgaiA8IGpsOyBqKysgKSB7XG5cdFx0XHRcdFx0bWF0cml4SW5kaWNlc1tqXSA9IGk7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHR9XG5cdFx0XHRcblx0XHR9XG5cdFx0XG5cdFx0dGhpcy5idWZmZXJHZW9tZXRyeS5mcm9tR2VvbWV0cnkoIG1lcmdlZEdlb21ldHJ5ICk7XG5cdFx0XG5cdH0sXG5cdFxuXHRnZW5lcmF0ZVRyYW5zZm9ybU1hdHJpeEluZGljZXMgOiBmdW5jdGlvbiggb2JqZWN0M0RzICkge1xuXHRcdFxuXHRcdHZhciBtYXRyaXhJbmRpY2VzID0gW107XG5cdFx0dmFyIHRvdGFsTGVuZ3RoID0gMDtcblx0XHR2YXIgcG9zaXRpb25zSW5GYWNlcztcblx0XHR2YXIgY2hpbGRHZW9tZXRyeTtcblx0XHRcblx0XHR2YXIgaSwgaWwsIGosIGpsO1xuXHRcdFxuXHRcdGZvciggaSA9IDAsIGlsID0gb2JqZWN0M0RzLmxlbmd0aDsgaSA8IGlsOyBpKysgKSB7XG5cdFx0XHRcblx0XHRcdGNoaWxkR2VvbWV0cnkgPSBvYmplY3QzRHNbaV0uZ2VvbWV0cnk7XG5cdFx0XHRcblx0XHRcdGlmKCBjaGlsZEdlb21ldHJ5ICkge1xuXHRcdFx0XHRcblx0XHRcdFx0cG9zaXRpb25zSW5GYWNlcyA9IGNoaWxkR2VvbWV0cnkuZmFjZXMubGVuZ3RoICogMzsgLy8zIHZlcnRpY2VzIHBlciBmYWNlXG5cdFx0XHRcdHRvdGFsTGVuZ3RoICs9IHBvc2l0aW9uc0luRmFjZXM7XG5cdFx0XHRcdFxuXHRcdFx0XHRqID0gdG90YWxMZW5ndGggLSBwb3NpdGlvbnNJbkZhY2VzO1xuXHRcdFx0XHRqbCA9IHRvdGFsTGVuZ3RoO1xuXHRcdFx0XHRcblx0XHRcdFx0Zm9yKCA7IGogPCBqbDsgaisrICkge1xuXHRcdFx0XHRcdG1hdHJpeEluZGljZXNbal0gPSBpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBuZXcgRmxvYXQzMkFycmF5KCBtYXRyaXhJbmRpY2VzICk7XG5cdH0sXG5cdFxuXHRidWlsZE1hdHJpY2VzIDogZnVuY3Rpb24oKSB7XG5cdFx0XG5cdFx0Ly9DYWxjdWxhdGVzIHRoZSBuXjIgd2lkdGggb2YgdGhlIHRleHR1cmVcblx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZVdpZHRoID0gY2FsY3VsYXRlU3F1YXJlZFRleHR1cmVXaWR0aCggdGhpcy5jaGlsZHJlbi5sZW5ndGggKiAxNiApOyAvLzE2IGZsb2F0cyBwZXIgbWF0cml4XG5cdFx0XG5cdFx0Ly9UaGUgdGV4dHVyZSBoYXMgNCBmbG9hdHMgcGVyIHBpeGVsXG5cdFx0dGhpcy5tYXRyaWNlc0RhdGEgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLm1hdHJpY2VzVGV4dHVyZVdpZHRoICogdGhpcy5tYXRyaWNlc1RleHR1cmVXaWR0aCAqIDQgKTtcblx0XHRcblx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZSA9IG5ldyBUSFJFRS5EYXRhVGV4dHVyZShcblx0XHRcdHRoaXMubWF0cmljZXNEYXRhLFxuXHRcdFx0dGhpcy5tYXRyaWNlc1RleHR1cmVXaWR0aCxcblx0XHRcdHRoaXMubWF0cmljZXNUZXh0dXJlV2lkdGgsXG5cdFx0XHRUSFJFRS5SR0JBRm9ybWF0LFxuXHRcdFx0VEhSRUUuRmxvYXRUeXBlXG5cdFx0KTtcblx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xuXHRcdHRoaXMubWF0cmljZXNUZXh0dXJlLm1hZ0ZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XG5cdFx0dGhpcy5tYXRyaWNlc1RleHR1cmUuZ2VuZXJhdGVNaXBtYXBzID0gZmFsc2U7XG5cdFx0dGhpcy5tYXRyaWNlc1RleHR1cmUuZmxpcFkgPSBmYWxzZTtcblx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cdFx0XG5cdH0sXG5cdFxuXHRidWlsZE1hdGVyaWFsIDogZnVuY3Rpb24oKSB7XG5cdFx0XG5cdFx0dGhpcy5hdHRyaWJ1dGVzID0ge1xuXHRcdFx0XG5cdFx0XHR0cmFuc2Zvcm1NYXRyaXhJbmRleDpcdHsgdHlwZTogJ2YnLCB2YWx1ZTogbnVsbCB9XG5cdFx0XHRcblx0XHR9O1xuXHRcdFxuXHRcdHRoaXMubWF0cml4SW5kaWNlcyA9IHRoaXMuZ2VuZXJhdGVUcmFuc2Zvcm1NYXRyaXhJbmRpY2VzKCB0aGlzLmNoaWxkcmVuICk7XG5cdFx0XG5cdFx0dGhpcy5idWZmZXJHZW9tZXRyeS5hZGRBdHRyaWJ1dGUoICd0cmFuc2Zvcm1NYXRyaXhJbmRleCcsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIHRoaXMubWF0cml4SW5kaWNlcywgMSApICk7XG5cblx0XHR0aGlzLnVuaWZvcm1zID0ge1xuXHRcdFx0XG5cdFx0XHRjb2xvcjogICAgIFx0XHRcdFx0eyB0eXBlOiBcImNcIiwgdmFsdWU6IG5ldyBUSFJFRS5Db2xvciggMHhmZjAwMDAgKSB9LFxuXHRcdFx0bWF0cmljZXNUZXh0dXJlOlx0XHR7IHR5cGU6IFwidFwiLCB2YWx1ZTogdGhpcy5tYXRyaWNlc1RleHR1cmUgfSxcblx0XHRcdHRpbWU6ICAgICAgXHRcdFx0XHR7IHR5cGU6ICdmJywgdmFsdWU6IERhdGUubm93KCkgfSxcblx0XHRcdHRleHR1cmU6ICAgXHRcdFx0XHR7IHR5cGU6IFwidFwiLCB2YWx1ZTogdGhpcy50ZXh0dXJlIH0sXG5cdFx0XHRtYXRyaWNlc1RleHR1cmVXaWR0aDpcdHsgdHlwZTogJ2YnLCB2YWx1ZTogdGhpcy5tYXRyaWNlc1RleHR1cmVXaWR0aCB9XG5cdFx0XHRcblx0XHR9O1xuXG5cdFx0dGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCgge1xuXHRcdFx0XG5cdFx0XHR1bmlmb3JtczogICAgICAgdGhpcy51bmlmb3Jtcyxcblx0XHRcdGF0dHJpYnV0ZXM6ICAgICB0aGlzLmF0dHJpYnV0ZXMsXG5cdFx0XHR2ZXJ0ZXhTaGFkZXI6ICAgdGhpcy52ZXJ0ZXhTaGFkZXIsXG5cdFx0XHRmcmFnbWVudFNoYWRlcjogdGhpcy5mcmFnbWVudFNoYWRlcixcblx0XHRcdFxuXHRcdFx0YmxlbmRpbmc6ICAgICAgIFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG5cdFx0XHRkZXB0aFRlc3Q6ICAgICAgZmFsc2UsXG5cdFx0XHR0cmFuc3BhcmVudDogICAgdHJ1ZVxuXHRcdFx0XG5cdFx0fSk7XG5cdFx0XHRcdFxuXHR9LFxuXHRcblx0dXBkYXRlIDogZnVuY3Rpb24oKSB7XG5cdFx0XG5cdFx0Zm9yKCB2YXIgaSA9IDAsIGlsID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkgPCBpbCA7IGkrKyApIHtcblxuXHRcdFx0dGhpcy5jaGlsZHJlbltpXS5tYXRyaXguZmxhdHRlblRvQXJyYXlPZmZzZXQoIHRoaXMubWF0cmljZXNEYXRhLCBpICogMTYgKTtcblx0XHRcdHRoaXMubWF0cmljZXNUZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblx0XHRcdFxuXHRcdH1cblx0XHRcblx0fVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNZXNoR3JvdXA7IiwidmFyIE1lc2hHcm91cCA9IHJlcXVpcmUoJy4vTWVzaEdyb3VwJylcbiAgLCByYW5kb20gPSByZXF1aXJlKCcuLi8uLi91dGlscy9yYW5kb20nKVxuICAsIHR3b8+AID0gTWF0aC5QSSAqIDI7XG5cbnZhciBNZXNoR3JvdXBCb3hEZW1vID0gZnVuY3Rpb24oIHBvZW0sIHByb3BlcnRpZXMgKSB7XG5cdFxuXHR0aGlzLnBvZW0gPSBwb2VtO1xuXHRcblx0dGhpcy5jb3VudCA9IDEwMDAwO1xuXHRcblx0dGhpcy5wb2VtLm9uKCd1cGRhdGUnLCB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpICk7XG5cdFxuXHR0aGlzLmdyb3VwID0gbmV3IE1lc2hHcm91cCggcG9lbSApO1xuXHRcblx0dGhpcy5ib3hlcyA9IHRoaXMuZ2VuZXJhdGVCb3hlcyggdGhpcy5ncm91cCApO1xuXG5cdHRoaXMuZ3JvdXAuYnVpbGQoIHBvZW0uc2NlbmUgKTtcblx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1lc2hHcm91cEJveERlbW87XG5cbk1lc2hHcm91cEJveERlbW8ucHJvdG90eXBlID0ge1xuXG5cdGdlbmVyYXRlQm94ZXMgOiBmdW5jdGlvbiggZ3JvdXAgKSB7XG5cdFx0XG5cdFx0dmFyIGJveGVzID0gW107XG5cdFx0XG5cdFx0dmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KCAxLCAxLCAxICk7XG5cdFx0dmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKCB7IGNvbG9yOiAweDAwZmYwMCB9ICk7XG5cdFx0dmFyIGJveDtcblx0XHRcblx0XHR2YXIgaSA9IHRoaXMuY291bnQ7IHdoaWxlIChpLS0pIHtcblx0XHRcdFxuXHRcdFx0Ym94ID0gbmV3IFRIUkVFLk1lc2goIG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSggMSwgMSwgMSApICk7XG5cdFx0XHRcblx0XHRcdGJveC5wb3NpdGlvbi54ID0gcmFuZG9tLnJhbmdlKCAtMTAwLCAxMDAgKTtcblx0XHRcdGJveC5wb3NpdGlvbi55ID0gcmFuZG9tLnJhbmdlKCAtMTAwLCAxMDAgKTtcblx0XHRcdGJveC5wb3NpdGlvbi56ID0gcmFuZG9tLnJhbmdlKCAtMTAwLCAxMDAgKTtcblx0XHRcdFxuXHRcdFx0Ym94LnJvdGF0aW9uLnggPSByYW5kb20ucmFuZ2UoIC10d2/PgCwgdHdvz4AgKTtcblx0XHRcdGJveC5yb3RhdGlvbi55ID0gcmFuZG9tLnJhbmdlKCAtdHdvz4AsIHR3b8+AICk7XG5cdFx0XHRib3gucm90YXRpb24ueiA9IHJhbmRvbS5yYW5nZSggLXR3b8+ALCB0d2/PgCApO1xuXHRcdFx0XG5cdFx0XHRib3gudmVsb2NpdHkgPSBuZXcgVEhSRUUuVmVjdG9yMyhcblx0XHRcdFx0XG5cdFx0XHRcdHJhbmRvbS5yYW5nZSggLTEsIDEgKSxcblx0XHRcdFx0cmFuZG9tLnJhbmdlKCAtMSwgMSApLFxuXHRcdFx0XHRyYW5kb20ucmFuZ2UoIC0xLCAxIClcblx0XHRcdFx0XG5cdFx0XHQpLm11bHRpcGx5U2NhbGFyKDAuMSk7XG5cdFx0XHRcblx0XHRcdGJveC5zcGluID0gbmV3IFRIUkVFLlZlY3RvcjMoXG5cdFx0XHRcdFxuXHRcdFx0XHRyYW5kb20ucmFuZ2UoIC10d2/PgCwgdHdvz4AgKSxcblx0XHRcdFx0cmFuZG9tLnJhbmdlKCAtdHdvz4AsIHR3b8+AICksXG5cdFx0XHRcdHJhbmRvbS5yYW5nZSggLXR3b8+ALCB0d2/PgCApXG5cdFx0XHRcdFxuXHRcdFx0KS5tdWx0aXBseVNjYWxhcigwLjAxKTtcblx0XHRcdFxuXHRcdFx0Ym94LnNjYWxlLm11bHRpcGx5U2NhbGFyKCByYW5kb20ucmFuZ2UoIDEsIDIpICk7XG5cdFx0XHRcblx0XHRcdGJveC51cGRhdGVNYXRyaXgoKTtcblx0XHRcdFxuXHRcdFx0Ym94ZXMucHVzaCggYm94ICk7XG5cdFx0XHRcblx0XHRcdGdyb3VwLmFkZCggYm94ICk7XG5cdFx0XHRcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIGJveGVzO1xuXHRcdFxuXHR9LFxuXHRcblx0dXBkYXRlIDogZnVuY3Rpb24oIGUgKSB7XG5cdFx0XG5cdFx0dmFyIGJveDtcblx0XHRcblx0XHRmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuY291bnQ7IGkrKyApIHtcblx0XHRcdFxuXHRcdFx0Ym94ID0gdGhpcy5ib3hlc1tpXTtcblx0XHRcdFxuXHRcdFx0Ym94LnBvc2l0aW9uLmFkZCggYm94LnZlbG9jaXR5ICk7XG5cdFx0XHRcblx0XHRcdGJveC5yb3RhdGlvbi54ICs9IGJveC5zcGluLng7XG5cdFx0XHRib3gucm90YXRpb24ueSArPSBib3guc3Bpbi55O1xuXHRcdFx0Ym94LnJvdGF0aW9uLnogKz0gYm94LnNwaW4uejtcblx0XHRcdFxuXHRcdFx0Ym94LnVwZGF0ZU1hdHJpeCgpO1xuXHRcdFx0XG5cdFx0fVxuXHRcdFxuXHR9XG5cdFxufTsiLCJ2YXIgcmFuZG9tXHRcdD0gcmVxdWlyZSgnLi4vdXRpbHMvcmFuZG9tJylcbiAgLCBsb2FkVGV4dHVyZVx0PSByZXF1aXJlKCcuLi91dGlscy9sb2FkVGV4dHVyZScpXG4gICwgbG9hZFRleHRcdD0gcmVxdWlyZSgnLi4vdXRpbHMvbG9hZFRleHQnKVxuICAsIFJTVlBcdFx0PSByZXF1aXJlKCdyc3ZwJylcbjtcblxudmFyIFNpbmVHcmF2aXR5Q2xvdWQgPSBmdW5jdGlvbihwb2VtLCBwcm9wZXJ0aWVzKSB7XG5cdFxuXHR0aGlzLnBvZW0gPSBwb2VtO1xuXHRcblx0dGhpcy5vYmplY3QgPSBudWxsO1xuXHR0aGlzLm1hdGVyaWFsID0gbnVsbDtcblx0dGhpcy5hdHRyaWJ1dGVzID0gbnVsbDtcblx0dGhpcy51bmlmb3JtcyA9IG51bGw7XG5cblx0dGhpcy50ZXh0dXJlID0gbnVsbDtcblx0dGhpcy52ZXJ0ZXhTaGFkZXIgPSBudWxsO1xuXHR0aGlzLmZyYWdtZW50U2hhZGVyID0gbnVsbDtcblx0XG5cdHRoaXMuY291bnQgPSAyMDAwMDA7XG5cdHRoaXMucmFkaXVzID0gMjAwO1xuXHR0aGlzLnBvaW50U2l6ZSA9IDc7XG5cdFx0XG5cdF8uZXh0ZW5kKCB0aGlzLCBwcm9wZXJ0aWVzICk7XG5cdFxuXHRcblx0UlNWUC5hbGwoW1xuXHRcdGxvYWRUZXh0dXJlKCBcImFzc2V0cy9pbWFnZXMvc2luZWdyYXZpdHljbG91ZC5wbmdcIiwgdGhpcywgXCJ0ZXh0dXJlXCIgKSxcblx0XHRsb2FkVGV4dCggXCJhc3NldHMvc2hhZGVycy9zaW5lZ3Jhdml0eWNsb3VkLnZlcnRcIiwgdGhpcywgXCJ2ZXJ0ZXhTaGFkZXJcIiApLFxuXHRcdGxvYWRUZXh0KCBcImFzc2V0cy9zaGFkZXJzL3NpbmVncmF2aXR5Y2xvdWQuZnJhZ1wiLCB0aGlzLCBcImZyYWdtZW50U2hhZGVyXCIgKVxuXHRdKVxuXHQudGhlbihcblx0XHR0aGlzLnN0YXJ0LmJpbmQodGhpcyksXG5cdFx0dGhpcy5lcnJvci5iaW5kKHRoaXMpXG5cdCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbmVHcmF2aXR5Q2xvdWQ7XG5cblNpbmVHcmF2aXR5Q2xvdWQucHJvdG90eXBlID0ge1xuXHRcblx0c3RhcnQgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHR0aGlzLmF0dHJpYnV0ZXMgPSB7XG5cblx0XHRcdHNpemU6ICAgICAgICB7IHR5cGU6ICdmJywgdmFsdWU6IG51bGwgfSxcblx0XHRcdGN1c3RvbUNvbG9yOiB7IHR5cGU6ICdjJywgdmFsdWU6IG51bGwgfVxuXG5cdFx0fTtcblxuXHRcdHRoaXMudW5pZm9ybXMgPSB7XG5cblx0XHRcdGNvbG9yOiAgICAgeyB0eXBlOiBcImNcIiwgdmFsdWU6IG5ldyBUSFJFRS5Db2xvciggMHhmZmZmZmYgKSB9LFxuXHRcdFx0dGV4dHVyZTogICB7IHR5cGU6IFwidFwiLCB2YWx1ZTogdGhpcy50ZXh0dXJlIH1cblxuXHRcdH07XG5cblx0XHR0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKCB7XG5cblx0XHRcdHVuaWZvcm1zOiAgICAgICB0aGlzLnVuaWZvcm1zLFxuXHRcdFx0YXR0cmlidXRlczogICAgIHRoaXMuYXR0cmlidXRlcyxcblx0XHRcdHZlcnRleFNoYWRlcjogICB0aGlzLnZlcnRleFNoYWRlcixcblx0XHRcdGZyYWdtZW50U2hhZGVyOiB0aGlzLmZyYWdtZW50U2hhZGVyLFxuXG5cdFx0XHRibGVuZGluZzogICAgICAgVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcblx0XHRcdGRlcHRoVGVzdDogICAgICBmYWxzZSxcblx0XHRcdHRyYW5zcGFyZW50OiAgICB0cnVlXG5cblx0XHR9KTtcblxuXHRcdHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcblxuXHRcdHRoaXMucG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5jb3VudCAqIDMgKTtcblx0XHR0aGlzLnZlbG9jaXR5ID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5jb3VudCAqIDMgKTtcblx0XHR0aGlzLmNvbG9ycyA9IG5ldyBGbG9hdDMyQXJyYXkoIHRoaXMuY291bnQgKiAzICk7XG5cdFx0dGhpcy5zaXplcyA9IG5ldyBGbG9hdDMyQXJyYXkoIHRoaXMuY291bnQgKTtcblxuXHRcdHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigweDAwMDAwMCk7XG5cdFx0XG5cdFx0dmFyIGh1ZTtcblx0XHRcblx0XHR2YXIgdGhldGEsIHBoaTtcblx0XHRcblx0XHR2YXIgeDtcblxuXHRcdGZvciggdmFyIHYgPSAwOyB2IDwgdGhpcy5jb3VudDsgdisrICkge1xuXG5cdFx0XHR0aGlzLnNpemVzWyB2IF0gPSB0aGlzLnBvaW50U2l6ZTtcblx0XHRcdFxuXHRcdFx0Ly8gdGhldGEgPSByYW5kb20ucmFuZ2VMb3coIDAuMSwgTWF0aC5QSSApO1xuXHRcdFx0Ly8gcGhpID0gcmFuZG9tLnJhbmdlTG93KCBNYXRoLlBJICogMC4zLCBNYXRoLlBJICk7XG5cdFx0XHQvL1xuXHRcdFx0Ly8gdGhpcy5wb3NpdGlvbnNbIHYgKiAzICsgMCBdID0gTWF0aC5zaW4oIHRoZXRhICkgKiBNYXRoLmNvcyggcGhpICkgKiB0aGlzLnJhZGl1cyAqIHRoZXRhICogNTtcblx0XHRcdC8vIHRoaXMucG9zaXRpb25zWyB2ICogMyArIDEgXSA9IE1hdGguc2luKCB0aGV0YSApICogTWF0aC5zaW4oIHBoaSApICogdGhpcy5yYWRpdXM7XG5cdFx0XHQvLyB0aGlzLnBvc2l0aW9uc1sgdiAqIDMgKyAyIF0gPSBNYXRoLmNvcyggdGhldGEgKSAqIHRoaXMucmFkaXVzICogMC4xO1xuXHRcdFx0XG5cdFx0XHR4ID0gcmFuZG9tLnJhbmdlKCAtMSwgMSApO1xuXHRcdFx0XG5cdFx0XHR0aGlzLnBvc2l0aW9uc1sgdiAqIDMgKyAwIF0gPSB4ICogdGhpcy5yYWRpdXM7XG5cdFx0XHR0aGlzLnBvc2l0aW9uc1sgdiAqIDMgKyAxIF0gPSBNYXRoLnNpbiggeCAqIE1hdGguUEkgKiAxMCApICogdGhpcy5yYWRpdXM7XG5cdFx0XHR0aGlzLnBvc2l0aW9uc1sgdiAqIDMgKyAyIF0gPSB0aGlzLnJhZGl1cyAqIC0wLjU7XG5cblx0XHRcdHRoaXMudmVsb2NpdHlbIHYgKiAzICsgMCBdID0gcmFuZG9tLnJhbmdlKCAtMC4wMSwgMC4wMSApICogMDtcblx0XHRcdHRoaXMudmVsb2NpdHlbIHYgKiAzICsgMSBdID0gcmFuZG9tLnJhbmdlKCAtMC4wMSwgMC4wMSApICogMTA7XG5cdFx0XHR0aGlzLnZlbG9jaXR5WyB2ICogMyArIDIgXSA9IHJhbmRvbS5yYW5nZSggLTAuMDEsIDAuMDEgKSAqIDA7XG5cblx0XHRcdC8vIGh1ZSA9ICh2IC8gdGhpcy5jb3VudCApICogMC4yICsgMC40NTtcblx0XHRcdFxuXHRcdFx0aHVlID0geCAqIDAuMyArIDAuNjU7XG5cblx0XHRcdGNvbG9yLnNldEhTTCggaHVlLCAxLjAsIDAuNTUgKTtcblxuXHRcdFx0dGhpcy5jb2xvcnNbIHYgKiAzICsgMCBdID0gY29sb3Iucjtcblx0XHRcdHRoaXMuY29sb3JzWyB2ICogMyArIDEgXSA9IGNvbG9yLmc7XG5cdFx0XHR0aGlzLmNvbG9yc1sgdiAqIDMgKyAyIF0gPSBjb2xvci5iO1xuXG5cdFx0fVxuXG5cdFx0dGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoICdwb3NpdGlvbicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIHRoaXMucG9zaXRpb25zLCAzICkgKTtcblx0XHR0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSggJ2N1c3RvbUNvbG9yJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSggdGhpcy5jb2xvcnMsIDMgKSApO1xuXHRcdHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCAnc2l6ZScsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIHRoaXMuc2l6ZXMsIDEgKSApO1xuXG5cdFx0dGhpcy5vYmplY3QgPSBuZXcgVEhSRUUuUG9pbnRDbG91ZCggdGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCApO1xuXHRcdHRoaXMub2JqZWN0LnBvc2l0aW9uLnkgLT0gdGhpcy5yYWRpdXMgKiAwLjI7XG5cdFx0XG5cdFx0dGhpcy5wb2VtLnNjZW5lLmFkZCggdGhpcy5vYmplY3QgKTtcblx0XHRcblx0XHR0aGlzLm9iamVjdC5zY2FsZS5tdWx0aXBseVNjYWxhciggMS41ICk7XG5cdFx0XG5cdFxuXHRcblx0XHR0aGlzLnBvZW0ub24oICd1cGRhdGUnLCB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpICk7XG5cdFx0XG5cdH0sXG5cdFxuXHRlcnJvciA6IGZ1bmN0aW9uKCBlcnJvciApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgbG9hZCBhc3NldHMgZm9yIHRoZSBTaW5lR3Jhdml0eUNsb3VkXCIsIGVycm9yKTtcblx0fSxcblx0XG5cdHVwZGF0ZSA6IGZ1bmN0aW9uKGUpIHtcblx0XHRcblx0XHR2YXIgdW5pdFRpbWVYID0gTWF0aC5jb3MoIGUudGltZSAqIDAuMDAwMDUgKiAxICk7XG5cdFx0dmFyIHVuaXRUaW1lWSA9IE1hdGguY29zKCBlLnRpbWUgKiAwLjAwMDA1ICogMiApO1xuXHRcdHZhciB1bml0VGltZVogPSBNYXRoLmNvcyggZS50aW1lICogMC4wMDAwNSAqIDMgKTtcblx0XHRcblx0XHR2YXIgZDI7XG5cdFxuXHRcdGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5jb3VudDsgaSsrICkge1xuXHRcdFx0XG5cdFx0XHRkMiA9dGhpcy5wb3NpdGlvbnNbIGkgKiAzICsgMCBdICogdGhpcy5wb3NpdGlvbnNbIGkgKiAzICsgMCBdICtcblx0XHRcdCAgICB0aGlzLnBvc2l0aW9uc1sgaSAqIDMgKyAxIF0gKiB0aGlzLnBvc2l0aW9uc1sgaSAqIDMgKyAxIF0gK1xuXHRcdFx0ICAgIHRoaXMucG9zaXRpb25zWyBpICogMyArIDIgXSAqIHRoaXMucG9zaXRpb25zWyBpICogMyArIDIgXTtcblxuXHRcdFx0dGhpcy52ZWxvY2l0eVsgaSAqIDMgKyAwIF0gLT0gdW5pdFRpbWVYICogdGhpcy5wb3NpdGlvbnNbIGkgKiAzICsgMCBdIC8gZDI7XG5cdFx0XHR0aGlzLnZlbG9jaXR5WyBpICogMyArIDEgXSAtPSB1bml0VGltZVkgKiB0aGlzLnBvc2l0aW9uc1sgaSAqIDMgKyAxIF0gLyBkMjtcblx0XHRcdHRoaXMudmVsb2NpdHlbIGkgKiAzICsgMiBdIC09IHVuaXRUaW1lWiAqIHRoaXMucG9zaXRpb25zWyBpICogMyArIDIgXSAvIGQyO1xuXG5cdFx0XHR0aGlzLnBvc2l0aW9uc1sgaSAqIDMgKyAwIF0gKz0gdW5pdFRpbWVYICogdGhpcy52ZWxvY2l0eVsgaSAqIDMgKyAwIF07XG5cdFx0XHR0aGlzLnBvc2l0aW9uc1sgaSAqIDMgKyAxIF0gKz0gdW5pdFRpbWVZICogdGhpcy52ZWxvY2l0eVsgaSAqIDMgKyAxIF07XG5cdFx0XHR0aGlzLnBvc2l0aW9uc1sgaSAqIDMgKyAyIF0gKz0gdW5pdFRpbWVaICogdGhpcy52ZWxvY2l0eVsgaSAqIDMgKyAyIF07XG5cdFx0XHRcblx0XHR9XG5cdFx0XG5cdFx0dGhpcy5nZW9tZXRyeS5hdHRyaWJ1dGVzLnBvc2l0aW9uLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblx0XHRcblx0fVxuXHRcbn07IiwidmFyIHJhbmRvbVx0XHQ9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3JhbmRvbScpXG4gICwgbG9hZFRleHR1cmVcdD0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvbG9hZFRleHR1cmUnKVxuICAsIGxvYWRUZXh0XHQ9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL2xvYWRUZXh0JylcbiAgLCBSU1ZQXHRcdD0gcmVxdWlyZSgncnN2cCcpXG4gICwgc2ltcGxleDJcdD0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvc2ltcGxleDInKVxuO1xuXHRcbnZhciBUZXh0dXJlUG9zaXRpb25hbE1hdHJpY2VzID0gZnVuY3Rpb24ocG9lbSwgcHJvcGVydGllcykge1xuXG5cdHRoaXMucG9lbSA9IHBvZW07XG5cdFxuXHR0aGlzLm9iamVjdCA9IG51bGw7XG5cdHRoaXMubWF0ZXJpYWwgPSBudWxsO1xuXHR0aGlzLmF0dHJpYnV0ZXMgPSBudWxsO1xuXHR0aGlzLnVuaWZvcm1zID0gbnVsbDtcblxuXHR0aGlzLnRleHR1cmUgPSBudWxsO1xuXHR0aGlzLnZlcnRleFNoYWRlciA9IG51bGw7XG5cdHRoaXMuZnJhZ21lbnRTaGFkZXIgPSBudWxsO1xuXHRcblx0dGhpcy5jb3VudCA9IDUwMDAwO1xuXHR0aGlzLnJhZGl1cyA9IDQwMDtcblx0dGhpcy5wb2ludFNpemUgPSAxNDtcblx0XG5cdFJTVlAuYWxsKFtcblx0XHRsb2FkVGV4dHVyZSggXCJhc3NldHMvaW1hZ2VzL3NpbmVncmF2aXR5Y2xvdWQucG5nXCIsIHRoaXMsIFwidGV4dHVyZVwiICksXG5cdFx0bG9hZFRleHQoIFwianMvZGVtb3MvVGV4dHVyZVBvc2l0aW9uYWxNYXRyaWNlcy9zaGFkZXIudmVydFwiLCB0aGlzLCBcInZlcnRleFNoYWRlclwiICksXG5cdFx0bG9hZFRleHQoIFwianMvZGVtb3MvVGV4dHVyZVBvc2l0aW9uYWxNYXRyaWNlcy9zaGFkZXIuZnJhZ1wiLCB0aGlzLCBcImZyYWdtZW50U2hhZGVyXCIgKVxuXHRdKVxuXHQudGhlbihcblx0XHR0aGlzLnN0YXJ0LmJpbmQodGhpcyksXG5cdFx0dGhpcy5lcnJvci5iaW5kKHRoaXMpXG5cdCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRleHR1cmVQb3NpdGlvbmFsTWF0cmljZXM7XG5cblRleHR1cmVQb3NpdGlvbmFsTWF0cmljZXMucHJvdG90eXBlID0ge1xuXHRcblx0c3RhcnQgOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciB2ZWMzRmxvYXRMZW5ndGggPSAzO1xuXHRcdHZhciBwb2ludHNMZW5ndGggPSA4O1xuXHRcdHZhciBib3hHZW9tZXRyeUxlbmd0aCA9IHBvaW50c0xlbmd0aCAqIHZlYzNGbG9hdExlbmd0aDtcblxuXHRcdHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcblxuXHRcdHRoaXMucG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5jb3VudCAqIGJveEdlb21ldHJ5TGVuZ3RoICk7XG5cdFx0dGhpcy52ZWxvY2l0eSA9IG5ldyBGbG9hdDMyQXJyYXkoIHRoaXMuY291bnQgKiB2ZWMzRmxvYXRMZW5ndGggKTtcblx0XHR0aGlzLmNvbG9ycyA9IG5ldyBGbG9hdDMyQXJyYXkoIHRoaXMuY291bnQgKiBib3hHZW9tZXRyeUxlbmd0aCApO1xuXHRcdHRoaXMuc2l6ZXMgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLmNvdW50ICogcG9pbnRzTGVuZ3RoICk7XG5cdFx0dGhpcy50cmFuc2Zvcm1JbmRpY2VzID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5jb3VudCAqIHBvaW50c0xlbmd0aCApO1xuXG5cdFx0dmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKDB4MDAwMDAwKTtcblx0XHR2YXIgaHVlO1xuXHRcdFxuXHRcdHZhciB2ZXJ0aWNlcyA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSggMSwgMSwgMSApLnZlcnRpY2VzO1xuXG5cdFx0dmFyIHgsIHksIHosIGksIGo7XG5cblx0XHRmb3IoIGkgPSAwOyBpIDwgdGhpcy5jb3VudDsgaSsrICkge1xuXHRcdFx0XG5cdFx0XHRodWUgPSAodGhpcy5wb3NpdGlvbnNbIGkgKiAzICsgMCBdIC8gdGhpcy5yYWRpdXMgKiAwLjMgKyAwLjY1KSAlIDE7XG5cdFx0XHRodWUgPSByYW5kb20ucmFuZ2UoIDAsIDEgKTtcblxuXHRcdFx0Y29sb3Iuc2V0SFNMKCBodWUsIDEuMCwgMC41NSApO1xuXHRcdFx0XG5cdFx0XHRmb3IoIGo9MDsgaiA8IHZlcnRpY2VzLmxlbmd0aCA7IGorKyApIHtcblx0XHRcdFx0XG5cdFx0XHRcdHZhciBvZmZzZXQzID0gKGkgKiBib3hHZW9tZXRyeUxlbmd0aCkgKyAoaiAqIHZlYzNGbG9hdExlbmd0aCk7XG5cdFx0XHRcdHZhciBvZmZzZXQxID0gKGkgKiBwb2ludHNMZW5ndGggKyBqKTtcblxuXHRcdFx0XHR0aGlzLnNpemVzWyBvZmZzZXQxIF0gPSB0aGlzLnBvaW50U2l6ZTtcblx0XHRcdFx0dGhpcy50cmFuc2Zvcm1JbmRpY2VzWyBvZmZzZXQxIF0gPSBpO1xuXHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0dGhpcy5wb3NpdGlvbnNbIG9mZnNldDMgKyAwIF0gPSB2ZXJ0aWNlc1tqXS54ICogNDtcblx0XHRcdFx0dGhpcy5wb3NpdGlvbnNbIG9mZnNldDMgKyAxIF0gPSB2ZXJ0aWNlc1tqXS55ICogNDtcblx0XHRcdFx0dGhpcy5wb3NpdGlvbnNbIG9mZnNldDMgKyAyIF0gPSB2ZXJ0aWNlc1tqXS56ICogNDtcblxuXHRcdFx0XHR0aGlzLmNvbG9yc1sgb2Zmc2V0MyArIDAgXSA9IGNvbG9yLnI7XG5cdFx0XHRcdHRoaXMuY29sb3JzWyBvZmZzZXQzICsgMSBdID0gY29sb3IuZztcblx0XHRcdFx0dGhpcy5jb2xvcnNbIG9mZnNldDMgKyAyIF0gPSBjb2xvci5iO1xuXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5tYXRyaWNlc1RleHR1cmVTaXplID0gdGhpcy5jYWxjdWxhdGVTcXVhcmVkVGV4dHVyZVNpemUoIHRoaXMuY291bnQgKiAxNiApOyAvLzE2IGZsb2F0cyBwZXIgbWF0cml4XG5cdFx0XG5cdFx0dGhpcy5tYXRyaWNlcyA9IFtdO1xuXHRcdHRoaXMubWF0cmljZXNEYXRhID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5tYXRyaWNlc1RleHR1cmVTaXplICogdGhpcy5tYXRyaWNlc1RleHR1cmVTaXplICogNCApO1xuXHRcdFxuXHRcdHZhciByb3RhdGVNID0gbmV3IFRIUkVFLk1hdHJpeDQoKTtcblx0XHR2YXIgdHJhbnNsYXRlTSA9IG5ldyBUSFJFRS5NYXRyaXg0KCk7XG5cdFx0dmFyIHNjYWxlTSA9IG5ldyBUSFJFRS5NYXRyaXg0KCk7XG5cdFx0dmFyIGV1bGVyID0gbmV3IFRIUkVFLkV1bGVyKCk7XG5cdFx0dmFyIHM7XG5cdFx0XG5cdFx0Zm9yKCBpID0gMDsgaSA8IHRoaXMuY291bnQgOyBpKysgKSB7XG5cdFx0XHRcblx0XHRcdHMgPSByYW5kb20ucmFuZ2UoIDAuNSwgMiApO1xuXHRcdFx0XG5cdFx0XHRzY2FsZU0ubWFrZVNjYWxlKCBzLCBzLCBzICk7XG5cdFx0XHRcblx0XHRcdHRyYW5zbGF0ZU0ubWFrZVRyYW5zbGF0aW9uKFxuXHRcdFx0XHRyYW5kb20ucmFuZ2UoIC10aGlzLnJhZGl1cywgdGhpcy5yYWRpdXMgKSAqIDAuNSxcblx0XHRcdFx0cmFuZG9tLnJhbmdlKCAtdGhpcy5yYWRpdXMsIHRoaXMucmFkaXVzICkgKiAwLjUsXG5cdFx0XHRcdHJhbmRvbS5yYW5nZSggLXRoaXMucmFkaXVzLCB0aGlzLnJhZGl1cyApICogMC41XG5cdFx0XHQpO1xuXHRcdFx0XG5cdFx0XHRldWxlci5zZXQoXG5cdFx0XHRcdHJhbmRvbS5yYW5nZSggMCwgMiAqIE1hdGguUEkgKSxcblx0XHRcdFx0cmFuZG9tLnJhbmdlKCAwLCAyICogTWF0aC5QSSApLFxuXHRcdFx0XHRyYW5kb20ucmFuZ2UoIDAsIDIgKiBNYXRoLlBJIClcblx0XHRcdCk7XG5cblx0XHRcdHJvdGF0ZU0ubWFrZVJvdGF0aW9uRnJvbUV1bGVyKCBldWxlciApO1xuXHRcdFx0XG5cdFx0XHR0aGlzLm1hdHJpY2VzW2ldID0gbmV3IFRIUkVFLk1hdHJpeDQoKVxuXHRcdFx0XHQubXVsdGlwbHkoIHRyYW5zbGF0ZU0gKVxuXHRcdFx0XHQubXVsdGlwbHkoIHJvdGF0ZU0gKVxuXHRcdFx0XHQubXVsdGlwbHkoIHNjYWxlTSApO1xuXHRcdFx0XG5cdFx0XHQvLyB0aGlzLm1hdHJpY2VzW2ldID0gbmV3IFRIUkVFLk1hdHJpeDQoKTtcblx0XHRcdFxuXHRcdFx0dGhpcy5tYXRyaWNlc1tpXS5mbGF0dGVuVG9BcnJheU9mZnNldCggdGhpcy5tYXRyaWNlc0RhdGEsIGkgKiAxNiApO1xuXHRcdFx0XG5cdFx0fVxuXHRcdFxuXHRcdHRoaXMubWF0cmljZXNUZXh0dXJlID0gbmV3IFRIUkVFLkRhdGFUZXh0dXJlKFxuXHRcdFx0dGhpcy5tYXRyaWNlc0RhdGEsXG5cdFx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZVNpemUsXG5cdFx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZVNpemUsXG5cdFx0XHRUSFJFRS5SR0JBRm9ybWF0LFxuXHRcdFx0VEhSRUUuRmxvYXRUeXBlXG5cdFx0KTtcblx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xuXHRcdHRoaXMubWF0cmljZXNUZXh0dXJlLm1hZ0ZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XG5cdFx0dGhpcy5tYXRyaWNlc1RleHR1cmUuZ2VuZXJhdGVNaXBtYXBzID0gZmFsc2U7XG5cdFx0dGhpcy5tYXRyaWNlc1RleHR1cmUuZmxpcFkgPSBmYWxzZTtcblx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cdFx0XG5cdFx0dGhpcy5hdHRyaWJ1dGVzID0ge1xuXG5cdFx0XHRzaXplOiAgICAgICBcdHsgdHlwZTogJ2YnLCB2YWx1ZTogbnVsbCB9LFxuXHRcdFx0Y3VzdG9tQ29sb3I6XHR7IHR5cGU6ICdjJywgdmFsdWU6IG51bGwgfSxcblx0XHRcdHRyYW5zZm9ybUluZGV4Olx0eyB0eXBlOiAnZicsIHZhbHVlOiBudWxsIH1cblxuXHRcdH07XG5cblx0XHR0aGlzLnVuaWZvcm1zID0ge1xuXG5cdFx0XHRjb2xvcjogICAgIFx0XHRcdFx0eyB0eXBlOiBcImNcIiwgdmFsdWU6IG5ldyBUSFJFRS5Db2xvciggMHhmZmZmZmYgKSB9LFxuXHRcdFx0dGV4dHVyZTogICBcdFx0XHRcdHsgdHlwZTogXCJ0XCIsIHZhbHVlOiB0aGlzLnRleHR1cmUgfSxcblx0XHRcdG1hdHJpY2VzVGV4dHVyZTpcdFx0eyB0eXBlOiBcInRcIiwgdmFsdWU6IHRoaXMubWF0cmljZXNUZXh0dXJlIH0sXG5cdFx0XHR0aW1lOiAgICAgIFx0XHRcdFx0eyB0eXBlOiAnZicsIHZhbHVlOiBEYXRlLm5vdygpIH0sXG5cdFx0XHRtYXRyaWNlc1RleHR1cmVTaXplOlx0eyB0eXBlOiAnZicsIHZhbHVlOiB0aGlzLm1hdHJpY2VzVGV4dHVyZVNpemUgfVxuXG5cdFx0fTtcblxuXHRcdHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoIHtcblxuXHRcdFx0dW5pZm9ybXM6ICAgICAgIHRoaXMudW5pZm9ybXMsXG5cdFx0XHRhdHRyaWJ1dGVzOiAgICAgdGhpcy5hdHRyaWJ1dGVzLFxuXHRcdFx0dmVydGV4U2hhZGVyOiAgIHRoaXMudmVydGV4U2hhZGVyLFxuXHRcdFx0ZnJhZ21lbnRTaGFkZXI6IHRoaXMuZnJhZ21lbnRTaGFkZXIsXG5cblx0XHRcdGJsZW5kaW5nOiAgICAgICBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxuXHRcdFx0ZGVwdGhUZXN0OiAgICAgIGZhbHNlLFxuXHRcdFx0dHJhbnNwYXJlbnQ6ICAgIHRydWVcblxuXHRcdH0pO1xuXHRcdFxuXHRcdHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCAncG9zaXRpb24nLFx0XHRcdG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIHRoaXMucG9zaXRpb25zLCAzICkgKTtcblx0XHR0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSggJ2N1c3RvbUNvbG9yJyxcdFx0bmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSggdGhpcy5jb2xvcnMsIDMgKSApO1xuXHRcdHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCAnc2l6ZScsXHRcdFx0XHRuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKCB0aGlzLnNpemVzLCAxICkgKTtcblx0XHR0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSggJ3RyYW5zZm9ybUluZGV4JyxcdG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIHRoaXMudHJhbnNmb3JtSW5kaWNlcywgMSApICk7XG5cblx0XHR0aGlzLm9iamVjdCA9IG5ldyBUSFJFRS5Qb2ludENsb3VkKCB0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsICk7XG5cdFx0dGhpcy5vYmplY3QucG9zaXRpb24ueSAtPSB0aGlzLnJhZGl1cyAqIDAuMjtcblx0XHRcblx0XHR0aGlzLnBvZW0uc2NlbmUuYWRkKCB0aGlzLm9iamVjdCApO1xuXHRcblx0XG5cdFx0dGhpcy5wb2VtLm9uKCAndXBkYXRlJywgdGhpcy51cGRhdGUuYmluZCh0aGlzKSApO1xuXHRcdFxuXHR9LFxuXHRcblx0Y2FsY3VsYXRlU3F1YXJlZFRleHR1cmVTaXplIDogZnVuY3Rpb24oIGNvdW50ICkge1xuXHRcdFxuXHRcdHZhciBzaXplID0gMTtcblx0XHR2YXIgaSA9IDA7XG5cdFx0XG5cdFx0d2hpbGUoIHNpemUgKiBzaXplIDwgKGNvdW50IC8gNCkgKSB7XG5cdFx0XHRcblx0XHRcdGkrKztcblx0XHRcdHNpemUgPSBNYXRoLnBvdyggMiwgaSApO1xuXHRcdFx0XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBzaXplO1xuXHR9LFxuXHRcblx0ZXJyb3IgOiBmdW5jdGlvbiggZXJyb3IgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQ291bGQgbm90IGxvYWQgYXNzZXRzIGZvciB0aGUgVGV4dHVyZVBvc2l0aW9uYWxNYXRyaWNlc1wiLCBlcnJvcik7XG5cdH0sXG5cdFxuXHR1cGRhdGUgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHR2YXIgdHJhbnNsYXRpb24gPSBuZXcgVEhSRUUuTWF0cml4NCgpO1xuXHRcdHZhciBldWxlciA9IG5ldyBUSFJFRS5FdWxlcigpO1xuXHRcdFxuXHRcdHJldHVybiBmdW5jdGlvbihlKSB7XG5cblx0XHRcdHRoaXMudW5pZm9ybXMudGltZS52YWx1ZSA9IGUudGltZTtcblx0XHRcdFxuXHRcdFx0dmFyIHgseTtcblx0XHRcblx0XHRcdGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5jb3VudCA7IGkrKyApIHtcblx0XHRcdFx0XG5cdFx0XHRcdHggPSBlLnRpbWUgLyAxMDAwO1xuXHRcdFx0XHR5ID0gaSAqIDEwMDA7XG5cdFx0XHRcdFxuXHRcdFx0XHR0cmFuc2xhdGlvbi5tYWtlVHJhbnNsYXRpb24oXG5cdFx0XHRcdFx0c2ltcGxleDIucmFuZ2UoIHgsIHksIC0xLCAxICksXG5cdFx0XHRcdFx0c2ltcGxleDIucmFuZ2UoIHgsIHkgKyAzMzMsIC0xLCAxICksXG5cdFx0XHRcdFx0c2ltcGxleDIucmFuZ2UoIHgsIHkgKyA2NjYsIC0xLCAxIClcblx0XHRcdFx0KTtcblx0XHRcdFx0XG5cdFx0XHRcdHRoaXMubWF0cmljZXNbaV0ubXVsdGlwbHlNYXRyaWNlcyggdHJhbnNsYXRpb24sIHRoaXMubWF0cmljZXNbaV0gKTtcblx0XHRcdFx0XG5cdFx0XHRcdC8vIGV1bGVyLnNldChcblx0XHRcdFx0Ly8gXHRyYW5kb20ucmFuZ2UoIDAsIDIgKiBNYXRoLlBJICksXG5cdFx0XHRcdC8vIFx0cmFuZG9tLnJhbmdlKCAwLCAyICogTWF0aC5QSSApLFxuXHRcdFx0XHQvLyBcdHJhbmRvbS5yYW5nZSggMCwgMiAqIE1hdGguUEkgKVxuXHRcdFx0XHQvLyApO1xuXHRcdFx0XHQvL1xuXHRcdFx0XHQvLyByb3RhdGVNLm1ha2VSb3RhdGlvbkZyb21FdWxlciggZXVsZXIgKTtcblx0XHRcdFx0XG5cdFx0XHRcdFxuXHRcdFx0XHR0aGlzLm1hdHJpY2VzW2ldLmZsYXR0ZW5Ub0FycmF5T2Zmc2V0KCB0aGlzLm1hdHJpY2VzRGF0YSwgaSAqIDE2ICk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHRoaXMubWF0cmljZXNUZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblx0XHR9O1xuXHR9KClcblx0XG59O1xuXG53aW5kb3cuY29uc29sZU1hdHJpeEVsZW1lbnRzID0gZnVuY3Rpb24oIGVscywgZGVjaW1hbFBsYWNlcyApIHtcbiBcblx0dmFyIGksIGosIGVsLCByZXN1bHRzO1xuIFxuXHRyZXN1bHRzID0gW107XG5cdGogPSAwO1xuIFxuXHRmb3IoIGk9MDsgaSA8IGVscy5sZW5ndGg7IGkrKyApIHtcblx0XHRcblx0XHRpZiggaiA9PT0gMCApIHtcblx0XHRcdHJlc3VsdHMucHVzaChbXSk7XG5cdFx0fVxuIFxuXHRcdGVsID0gZWxzW2ldO1xuIFxuXHRcdGlmKCB0eXBlb2YgZGVjaW1hbFBsYWNlcyA9PT0gXCJudW1iZXJcIiApIHtcbiBcblx0XHRcdGVsID0gTWF0aC5yb3VuZCggTWF0aC5wb3coMTAsIGRlY2ltYWxQbGFjZXMpICogZWwgKSAvIE1hdGgucG93KDEwLCBkZWNpbWFsUGxhY2VzKTtcbiBcblx0XHR9XG4gXG5cdFx0cmVzdWx0c1tNYXRoLmZsb29yKGkgLyA0KSAlIDRdLnB1c2goIGVsICk7XG4gXG5cdFx0aisrO1xuXHRcdGogJT0gNDtcblx0XHRcblx0XHRpZiggaSAlIDE2ID09PSAxNSApIHtcblx0XHRcdGNvbnNvbGUudGFibGUoIHJlc3VsdHMgKTtcblx0XHRcdHJlc3VsdHMgPSBbXTtcblx0XHR9XG4gXG5cdH1cbiBcbn07IiwidmFyIHJhbmRvbVx0XHQ9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3JhbmRvbScpXG4gICwgbG9hZFRleHR1cmVcdD0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvbG9hZFRleHR1cmUnKVxuICAsIGxvYWRUZXh0XHQ9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL2xvYWRUZXh0JylcbiAgLCBSU1ZQXHRcdD0gcmVxdWlyZSgncnN2cCcpXG47XG5cbnZhciBVbmlmb3JtUG9zaXRpb25hbE1hdHJpY2VzID0gZnVuY3Rpb24ocG9lbSwgcHJvcGVydGllcykge1xuXG5cdHRoaXMucG9lbSA9IHBvZW07XG5cdFxuXHR0aGlzLm9iamVjdCA9IG51bGw7XG5cdHRoaXMubWF0ZXJpYWwgPSBudWxsO1xuXHR0aGlzLmF0dHJpYnV0ZXMgPSBudWxsO1xuXHR0aGlzLnVuaWZvcm1zID0gbnVsbDtcblxuXHR0aGlzLnRleHR1cmUgPSBudWxsO1xuXHR0aGlzLnZlcnRleFNoYWRlciA9IG51bGw7XG5cdHRoaXMuZnJhZ21lbnRTaGFkZXIgPSBudWxsO1xuXHRcblx0dGhpcy5jb3VudCA9IDIwMDAwMDtcblx0dGhpcy5yYWRpdXMgPSAyMDA7XG5cdHRoaXMucG9pbnRTaXplID0gNztcblx0XG5cdFJTVlAuYWxsKFtcblx0XHRsb2FkVGV4dHVyZSggXCJhc3NldHMvaW1hZ2VzL3NpbmVncmF2aXR5Y2xvdWQucG5nXCIsIHRoaXMsIFwidGV4dHVyZVwiICksXG5cdFx0bG9hZFRleHQoIFwianMvZGVtb3MvVW5pZm9ybVBvc2l0aW9uYWxNYXRyaWNlcy9zaGFkZXIudmVydFwiLCB0aGlzLCBcInZlcnRleFNoYWRlclwiICksXG5cdFx0bG9hZFRleHQoIFwianMvZGVtb3MvVW5pZm9ybVBvc2l0aW9uYWxNYXRyaWNlcy9zaGFkZXIuZnJhZ1wiLCB0aGlzLCBcImZyYWdtZW50U2hhZGVyXCIgKVxuXHRdKVxuXHQudGhlbihcblx0XHR0aGlzLnN0YXJ0LmJpbmQodGhpcyksXG5cdFx0dGhpcy5lcnJvci5iaW5kKHRoaXMpXG5cdCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVuaWZvcm1Qb3NpdGlvbmFsTWF0cmljZXM7XG5cblVuaWZvcm1Qb3NpdGlvbmFsTWF0cmljZXMucHJvdG90eXBlID0ge1xuXHRcblx0c3RhcnQgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHR2YXIgdHJhbnNmb3JtQ291bnQgPSA1MDtcblx0XHRcblx0XHRcblx0XHR0aGlzLmF0dHJpYnV0ZXMgPSB7XG5cblx0XHRcdHNpemU6ICAgICAgIFx0eyB0eXBlOiAnZicsIHZhbHVlOiBudWxsIH0sXG5cdFx0XHRjdXN0b21Db2xvcjpcdHsgdHlwZTogJ2MnLCB2YWx1ZTogbnVsbCB9LFxuXHRcdFx0dHJhbnNmb3JtSW5kZXg6XHR7IHR5cGU6ICdmJywgdmFsdWU6IG51bGwgfVxuXG5cdFx0fTtcblxuXHRcdHRoaXMudW5pZm9ybXMgPSB7XG5cblx0XHRcdGNvbG9yOiAgICAgXHRcdFx0eyB0eXBlOiBcImNcIiwgdmFsdWU6IG5ldyBUSFJFRS5Db2xvciggMHhmZmZmZmYgKSB9LFxuXHRcdFx0dGV4dHVyZTogICBcdFx0XHR7IHR5cGU6IFwidFwiLCB2YWx1ZTogdGhpcy50ZXh0dXJlIH0sXG5cdFx0XHR0aW1lOiAgICAgIFx0XHRcdHsgdHlwZTogJ2YnLCB2YWx1ZTogRGF0ZS5ub3coKSB9LFxuXHRcdFx0dHJhbnNmb3JtTWF0cml4Olx0eyB0eXBlOiAnbTR2JywgdmFsdWU6IFtdIH1cblxuXHRcdH07XG5cblx0XHR0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKCB7XG5cblx0XHRcdHVuaWZvcm1zOiAgICAgICB0aGlzLnVuaWZvcm1zLFxuXHRcdFx0YXR0cmlidXRlczogICAgIHRoaXMuYXR0cmlidXRlcyxcblx0XHRcdHZlcnRleFNoYWRlcjogICBcIiNkZWZpbmUgVFJBTlNGT1JNX01BVFJJWF9DT1VOVCBcIiArIHRyYW5zZm9ybUNvdW50ICsgXCJcXG5cIiArIHRoaXMudmVydGV4U2hhZGVyLFxuXHRcdFx0ZnJhZ21lbnRTaGFkZXI6IHRoaXMuZnJhZ21lbnRTaGFkZXIsXG5cblx0XHRcdGJsZW5kaW5nOiAgICAgICBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxuXHRcdFx0ZGVwdGhUZXN0OiAgICAgIGZhbHNlLFxuXHRcdFx0dHJhbnNwYXJlbnQ6ICAgIHRydWVcblxuXHRcdH0pO1xuXG5cdFx0dGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xuXG5cdFx0dGhpcy5wb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLmNvdW50ICogMyApO1xuXHRcdHRoaXMudmVsb2NpdHkgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLmNvdW50ICogMyApO1xuXHRcdHRoaXMuY29sb3JzID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5jb3VudCAqIDMgKTtcblx0XHR0aGlzLnNpemVzID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5jb3VudCApO1xuXHRcdHRoaXMudHJhbnNmb3JtSW5kaWNlcyA9IG5ldyBGbG9hdDMyQXJyYXkoIHRoaXMuY291bnQgKTtcblxuXHRcdHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigweDAwMDAwMCk7XG5cdFx0dmFyIGh1ZTtcblx0XHRcblx0XHR2YXIgdGhldGEsIHBoaTtcblx0XHRcblx0XHR2YXIgeDtcblxuXHRcdGZvciggdmFyIHYgPSAwOyB2IDwgdGhpcy5jb3VudDsgdisrICkge1xuXG5cdFx0XHR0aGlzLnNpemVzWyB2IF0gPSB0aGlzLnBvaW50U2l6ZTtcblx0XHRcdHRoaXMudHJhbnNmb3JtSW5kaWNlc1sgdiBdID0gcmFuZG9tLnJhbmdlSW50KCAwLCB0cmFuc2Zvcm1Db3VudCApO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHR0aGV0YSA9IHJhbmRvbS5yYW5nZUxvdyggMC4xLCBNYXRoLlBJICk7XG5cdFx0XHRwaGkgPSByYW5kb20ucmFuZ2VMb3coIE1hdGguUEkgKiAwLjMsIE1hdGguUEkgKTtcblx0XHRcdFxuXHRcdFx0dGhpcy5wb3NpdGlvbnNbIHYgKiAzICsgMCBdID0gTWF0aC5zaW4oIHRoZXRhICkgKiBNYXRoLmNvcyggcGhpICkgKiB0aGlzLnJhZGl1cyAqIHRoZXRhO1xuXHRcdFx0dGhpcy5wb3NpdGlvbnNbIHYgKiAzICsgMSBdID0gTWF0aC5zaW4oIHRoZXRhICkgKiBNYXRoLnNpbiggcGhpICkgKiB0aGlzLnJhZGl1cztcblx0XHRcdHRoaXMucG9zaXRpb25zWyB2ICogMyArIDIgXSA9IE1hdGguY29zKCB0aGV0YSApICogdGhpcy5yYWRpdXMgO1xuXHRcdFx0XG5cdFx0XHRcblx0XHRcdGh1ZSA9ICh0aGlzLnBvc2l0aW9uc1sgdiAqIDMgKyAwIF0gLyB0aGlzLnJhZGl1cyAqIDAuMyArIDAuNjUpICUgMTtcblxuXHRcdFx0Y29sb3Iuc2V0SFNMKCBodWUsIDEuMCwgMC41NSApO1xuXG5cdFx0XHR0aGlzLmNvbG9yc1sgdiAqIDMgKyAwIF0gPSBjb2xvci5yO1xuXHRcdFx0dGhpcy5jb2xvcnNbIHYgKiAzICsgMSBdID0gY29sb3IuZztcblx0XHRcdHRoaXMuY29sb3JzWyB2ICogMyArIDIgXSA9IGNvbG9yLmI7XG5cblx0XHR9XG5cdFx0XG5cdFx0Zm9yKCB2YXIgaSA9IDA7IGkgPCB0cmFuc2Zvcm1Db3VudCA7IGkrKyApIHtcblx0XHRcdFxuXHRcdFx0dGhpcy51bmlmb3Jtcy50cmFuc2Zvcm1NYXRyaXgudmFsdWVbaV0gPSBuZXcgVEhSRUUuTWF0cml4NCgpLm1ha2VUcmFuc2xhdGlvbihcblx0XHRcdFx0cmFuZG9tLnJhbmdlKCAtdGhpcy5yYWRpdXMsIHRoaXMucmFkaXVzICkgKiAwLjUsXG5cdFx0XHRcdHJhbmRvbS5yYW5nZSggLXRoaXMucmFkaXVzLCB0aGlzLnJhZGl1cyApICogMC41LFxuXHRcdFx0XHRyYW5kb20ucmFuZ2UoIC10aGlzLnJhZGl1cywgdGhpcy5yYWRpdXMgKSAqIDAuNVxuXHRcdFx0KTtcblx0XHRcdFxuXHRcdH1cblxuXHRcdHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCAncG9zaXRpb24nLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKCB0aGlzLnBvc2l0aW9ucywgMyApICk7XG5cdFx0dGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoICdjdXN0b21Db2xvcicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIHRoaXMuY29sb3JzLCAzICkgKTtcblx0XHR0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSggJ3NpemUnLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKCB0aGlzLnNpemVzLCAxICkgKTtcblx0XHR0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSggJ3RyYW5zZm9ybUluZGV4JywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSggdGhpcy50cmFuc2Zvcm1JbmRpY2VzLCAxICkgKTtcblxuXHRcdHRoaXMub2JqZWN0ID0gbmV3IFRIUkVFLlBvaW50Q2xvdWQoIHRoaXMuZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwgKTtcblx0XHR0aGlzLm9iamVjdC5wb3NpdGlvbi55IC09IHRoaXMucmFkaXVzICogMC4yO1xuXHRcdFxuXHRcdHRoaXMucG9lbS5zY2VuZS5hZGQoIHRoaXMub2JqZWN0ICk7XG5cdFxuXHRcblx0XHR0aGlzLnBvZW0ub24oICd1cGRhdGUnLCB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpICk7XG5cdFx0XG5cdH0sXG5cdFxuXHRlcnJvciA6IGZ1bmN0aW9uKCBlcnJvciApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgbG9hZCBhc3NldHMgZm9yIHRoZSBVbmlmb3JtUG9zaXRpb25hbE1hdHJpY2VzXCIsIGVycm9yKTtcblx0fSxcblx0XG5cdHVwZGF0ZSA6IGZ1bmN0aW9uKGUpIHtcblxuXHRcdHRoaXMudW5pZm9ybXMudGltZS52YWx1ZSA9IGUudGltZTtcblx0XHRcblx0fVxuXHRcbn07IiwidmFyIFBvZW0gPSBudWxsO1xudmFyIGxldmVscyA9IG51bGw7XG52YXIgRXZlbnREaXNwYXRjaGVyID0gcmVxdWlyZSgnLi91dGlscy9FdmVudERpc3BhdGNoZXInKTtcblxudmFyIGN1cnJlbnRMZXZlbCA9IG51bGw7XG52YXIgY3VycmVudFBvZW0gPSBudWxsO1xudmFyIHRpdGxlSGlkZVRpbWVvdXQgPSBudWxsO1xuXG5mdW5jdGlvbiBzaG93VGl0bGVzKCkge1xuXHRcblx0Y2xlYXJUaW1lb3V0KCB0aXRsZUhpZGVUaW1lb3V0ICk7XG5cdFxuXHQkKCcjdGl0bGUnKVxuXHRcdC5yZW1vdmVDbGFzcygndHJhbnNmb3JtLXRyYW5zaXRpb24nKVxuXHRcdC5hZGRDbGFzcygnaGlkZScpXG5cdFx0LmFkZENsYXNzKCd0cmFuc2Zvcm0tdHJhbnNpdGlvbicpXG5cdFx0LnNob3coKTtcblx0XG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0JCgnI3RpdGxlJykucmVtb3ZlQ2xhc3MoJ2hpZGUnKTtcblx0fSwgMSk7XG5cdFxuXHQkKCcuc2NvcmUnKS5jc3MoJ29wYWNpdHknLCAwKTtcblx0XG59XG5cbmZ1bmN0aW9uIGhpZGVUaXRsZXMoKSB7XG5cblx0JCgnLnNjb3JlJykuY3NzKCdvcGFjaXR5JywgMSk7XG5cdFxuXHRpZiggJCgnI3RpdGxlOnZpc2libGUnKS5sZW5ndGggPiAwICkge1x0XHRcblx0XG5cdFx0JCgnI3RpdGxlJylcblx0XHRcdC5hZGRDbGFzcygndHJhbnNmb3JtLXRyYW5zaXRpb24nKVxuXHRcdFx0LmFkZENsYXNzKCdoaWRlJyk7XG5cblx0XHR0aXRsZUhpZGVUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XG5cdFx0XHQkKCcjdGl0bGUnKS5oaWRlKCk7XG5cdFxuXHRcdH0sIDEwMDApO1xuXHR9XG5cdFx0XHRcblx0XG59XG5cbnZhciBsZXZlbExvYWRlciA9IHtcblx0XG5cdGluaXQgOiBmdW5jdGlvbiggUG9lbUNsYXNzLCBsZXZlbHNPYmplY3QgKSB7XG5cdFx0UG9lbSA9IFBvZW1DbGFzcztcblx0XHRsZXZlbHMgPSBsZXZlbHNPYmplY3Q7XG5cdH0sXG5cdFxuXHRsb2FkIDogZnVuY3Rpb24oIHNsdWcgKSB7XG5cdFx0XG5cdFx0aWYoICFfLmlzT2JqZWN0KGxldmVsc1tzbHVnXSkgKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdFxuXHRcdGlmKGN1cnJlbnRQb2VtKSBjdXJyZW50UG9lbS5kZXN0cm95KCk7XG5cdFx0XG5cdFx0Y3VycmVudExldmVsID0gbGV2ZWxzW3NsdWddO1xuXHRcdGN1cnJlbnRQb2VtID0gbmV3IFBvZW0oIGN1cnJlbnRMZXZlbCwgc2x1ZyApO1xuXHRcdFxuXHRcdGlmKCBzbHVnID09PSBcInRpdGxlc1wiICkge1xuXHRcdFx0c2hvd1RpdGxlcygpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRoaWRlVGl0bGVzKCk7XG5cdFx0fVxuXHRcdFxuXHRcdHRoaXMuZGlzcGF0Y2goe1xuXHRcdFx0dHlwZTogXCJuZXdMZXZlbFwiLFxuXHRcdFx0bGV2ZWw6IGN1cnJlbnRMZXZlbCxcblx0XHRcdHBvZW06IGN1cnJlbnRQb2VtXG5cdFx0fSk7XG5cdFx0XG5cdFx0d2luZG93LnBvZW0gPSBjdXJyZW50UG9lbTtcblx0XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0XG59O1xuXG5FdmVudERpc3BhdGNoZXIucHJvdG90eXBlLmFwcGx5KCBsZXZlbExvYWRlciApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxldmVsTG9hZGVyO1xuIiwiLyoqXG4gKiBAYXV0aG9yIGFsdGVyZWRxIC8gaHR0cDovL2FsdGVyZWRxdWFsaWEuY29tL1xuICovXG5cblRIUkVFLkJsb29tUGFzcyA9IGZ1bmN0aW9uICggc3RyZW5ndGgsIGtlcm5lbFNpemUsIHNpZ21hLCByZXNvbHV0aW9uICkge1xuXG5cdHN0cmVuZ3RoID0gKCBzdHJlbmd0aCAhPT0gdW5kZWZpbmVkICkgPyBzdHJlbmd0aCA6IDE7XG5cdGtlcm5lbFNpemUgPSAoIGtlcm5lbFNpemUgIT09IHVuZGVmaW5lZCApID8ga2VybmVsU2l6ZSA6IDI1O1xuXHRzaWdtYSA9ICggc2lnbWEgIT09IHVuZGVmaW5lZCApID8gc2lnbWEgOiA0LjA7XG5cdHJlc29sdXRpb24gPSAoIHJlc29sdXRpb24gIT09IHVuZGVmaW5lZCApID8gcmVzb2x1dGlvbiA6IDI1NjtcblxuXHQvLyByZW5kZXIgdGFyZ2V0c1xuXG5cdHZhciBwYXJzID0geyBtaW5GaWx0ZXI6IFRIUkVFLkxpbmVhckZpbHRlciwgbWFnRmlsdGVyOiBUSFJFRS5MaW5lYXJGaWx0ZXIsIGZvcm1hdDogVEhSRUUuUkdCRm9ybWF0IH07XG5cblx0dGhpcy5yZW5kZXJUYXJnZXRYID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0KCByZXNvbHV0aW9uLCByZXNvbHV0aW9uLCBwYXJzICk7XG5cdHRoaXMucmVuZGVyVGFyZ2V0WSA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlclRhcmdldCggcmVzb2x1dGlvbiwgcmVzb2x1dGlvbiwgcGFycyApO1xuXG5cdC8vIGNvcHkgbWF0ZXJpYWxcblxuXHRpZiAoIFRIUkVFLkNvcHlTaGFkZXIgPT09IHVuZGVmaW5lZCApXG5cdFx0Y29uc29sZS5lcnJvciggXCJUSFJFRS5CbG9vbVBhc3MgcmVsaWVzIG9uIFRIUkVFLkNvcHlTaGFkZXJcIiApO1xuXG5cdHZhciBjb3B5U2hhZGVyID0gVEhSRUUuQ29weVNoYWRlcjtcblxuXHR0aGlzLmNvcHlVbmlmb3JtcyA9IFRIUkVFLlVuaWZvcm1zVXRpbHMuY2xvbmUoIGNvcHlTaGFkZXIudW5pZm9ybXMgKTtcblxuXHR0aGlzLmNvcHlVbmlmb3Jtc1sgXCJvcGFjaXR5XCIgXS52YWx1ZSA9IHN0cmVuZ3RoO1xuXG5cdHRoaXMubWF0ZXJpYWxDb3B5ID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKCB7XG5cblx0XHR1bmlmb3JtczogdGhpcy5jb3B5VW5pZm9ybXMsXG5cdFx0dmVydGV4U2hhZGVyOiBjb3B5U2hhZGVyLnZlcnRleFNoYWRlcixcblx0XHRmcmFnbWVudFNoYWRlcjogY29weVNoYWRlci5mcmFnbWVudFNoYWRlcixcblx0XHRibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcblx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXG5cdH0gKTtcblxuXHQvLyBjb252b2x1dGlvbiBtYXRlcmlhbFxuXG5cdGlmICggVEhSRUUuQ29udm9sdXRpb25TaGFkZXIgPT09IHVuZGVmaW5lZCApXG5cdFx0Y29uc29sZS5lcnJvciggXCJUSFJFRS5CbG9vbVBhc3MgcmVsaWVzIG9uIFRIUkVFLkNvbnZvbHV0aW9uU2hhZGVyXCIgKTtcblxuXHR2YXIgY29udm9sdXRpb25TaGFkZXIgPSBUSFJFRS5Db252b2x1dGlvblNoYWRlcjtcblxuXHR0aGlzLmNvbnZvbHV0aW9uVW5pZm9ybXMgPSBUSFJFRS5Vbmlmb3Jtc1V0aWxzLmNsb25lKCBjb252b2x1dGlvblNoYWRlci51bmlmb3JtcyApO1xuXG5cdHRoaXMuY29udm9sdXRpb25Vbmlmb3Jtc1sgXCJ1SW1hZ2VJbmNyZW1lbnRcIiBdLnZhbHVlID0gVEhSRUUuQmxvb21QYXNzLmJsdXJ4O1xuXHR0aGlzLmNvbnZvbHV0aW9uVW5pZm9ybXNbIFwiY0tlcm5lbFwiIF0udmFsdWUgPSBUSFJFRS5Db252b2x1dGlvblNoYWRlci5idWlsZEtlcm5lbCggc2lnbWEgKTtcblxuXHR0aGlzLm1hdGVyaWFsQ29udm9sdXRpb24gPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoIHtcblxuXHRcdHVuaWZvcm1zOiB0aGlzLmNvbnZvbHV0aW9uVW5pZm9ybXMsXG5cdFx0dmVydGV4U2hhZGVyOiAgY29udm9sdXRpb25TaGFkZXIudmVydGV4U2hhZGVyLFxuXHRcdGZyYWdtZW50U2hhZGVyOiBjb252b2x1dGlvblNoYWRlci5mcmFnbWVudFNoYWRlcixcblx0XHRkZWZpbmVzOiB7XG5cdFx0XHRcIktFUk5FTF9TSVpFX0ZMT0FUXCI6IGtlcm5lbFNpemUudG9GaXhlZCggMSApLFxuXHRcdFx0XCJLRVJORUxfU0laRV9JTlRcIjoga2VybmVsU2l6ZS50b0ZpeGVkKCAwIClcblx0XHR9XG5cblx0fSApO1xuXG5cdHRoaXMuZW5hYmxlZCA9IHRydWU7XG5cdHRoaXMubmVlZHNTd2FwID0gZmFsc2U7XG5cdHRoaXMuY2xlYXIgPSBmYWxzZTtcblxuXG5cdHRoaXMuY2FtZXJhID0gbmV3IFRIUkVFLk9ydGhvZ3JhcGhpY0NhbWVyYSggLTEsIDEsIDEsIC0xLCAwLCAxICk7XG5cdHRoaXMuc2NlbmUgID0gbmV3IFRIUkVFLlNjZW5lKCk7XG5cblx0dGhpcy5xdWFkID0gbmV3IFRIUkVFLk1lc2goIG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAyLCAyICksIG51bGwgKTtcblx0dGhpcy5zY2VuZS5hZGQoIHRoaXMucXVhZCApO1xuXG59O1xuXG5USFJFRS5CbG9vbVBhc3MucHJvdG90eXBlID0ge1xuXG5cdHJlbmRlcjogZnVuY3Rpb24gKCByZW5kZXJlciwgd3JpdGVCdWZmZXIsIHJlYWRCdWZmZXIsIGRlbHRhLCBtYXNrQWN0aXZlICkge1xuXG5cdFx0aWYgKCBtYXNrQWN0aXZlICkgcmVuZGVyZXIuY29udGV4dC5kaXNhYmxlKCByZW5kZXJlci5jb250ZXh0LlNURU5DSUxfVEVTVCApO1xuXG5cdFx0Ly8gUmVuZGVyIHF1YWQgd2l0aCBibHVyZWQgc2NlbmUgaW50byB0ZXh0dXJlIChjb252b2x1dGlvbiBwYXNzIDEpXG5cblx0XHR0aGlzLnF1YWQubWF0ZXJpYWwgPSB0aGlzLm1hdGVyaWFsQ29udm9sdXRpb247XG5cblx0XHR0aGlzLmNvbnZvbHV0aW9uVW5pZm9ybXNbIFwidERpZmZ1c2VcIiBdLnZhbHVlID0gcmVhZEJ1ZmZlcjtcblx0XHR0aGlzLmNvbnZvbHV0aW9uVW5pZm9ybXNbIFwidUltYWdlSW5jcmVtZW50XCIgXS52YWx1ZSA9IFRIUkVFLkJsb29tUGFzcy5ibHVyWDtcblxuXHRcdHJlbmRlcmVyLnJlbmRlciggdGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEsIHRoaXMucmVuZGVyVGFyZ2V0WCwgdHJ1ZSApO1xuXG5cblx0XHQvLyBSZW5kZXIgcXVhZCB3aXRoIGJsdXJlZCBzY2VuZSBpbnRvIHRleHR1cmUgKGNvbnZvbHV0aW9uIHBhc3MgMilcblxuXHRcdHRoaXMuY29udm9sdXRpb25Vbmlmb3Jtc1sgXCJ0RGlmZnVzZVwiIF0udmFsdWUgPSB0aGlzLnJlbmRlclRhcmdldFg7XG5cdFx0dGhpcy5jb252b2x1dGlvblVuaWZvcm1zWyBcInVJbWFnZUluY3JlbWVudFwiIF0udmFsdWUgPSBUSFJFRS5CbG9vbVBhc3MuYmx1clk7XG5cblx0XHRyZW5kZXJlci5yZW5kZXIoIHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhLCB0aGlzLnJlbmRlclRhcmdldFksIHRydWUgKTtcblxuXHRcdC8vIFJlbmRlciBvcmlnaW5hbCBzY2VuZSB3aXRoIHN1cGVyaW1wb3NlZCBibHVyIHRvIHRleHR1cmVcblxuXHRcdHRoaXMucXVhZC5tYXRlcmlhbCA9IHRoaXMubWF0ZXJpYWxDb3B5O1xuXG5cdFx0dGhpcy5jb3B5VW5pZm9ybXNbIFwidERpZmZ1c2VcIiBdLnZhbHVlID0gdGhpcy5yZW5kZXJUYXJnZXRZO1xuXG5cdFx0aWYgKCBtYXNrQWN0aXZlICkgcmVuZGVyZXIuY29udGV4dC5lbmFibGUoIHJlbmRlcmVyLmNvbnRleHQuU1RFTkNJTF9URVNUICk7XG5cblx0XHRyZW5kZXJlci5yZW5kZXIoIHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhLCByZWFkQnVmZmVyLCB0aGlzLmNsZWFyICk7XG5cblx0fVxuXG59O1xuXG5USFJFRS5CbG9vbVBhc3MuYmx1clggPSBuZXcgVEhSRUUuVmVjdG9yMiggMC4wMDE5NTMxMjUsIDAuMCApO1xuVEhSRUUuQmxvb21QYXNzLmJsdXJZID0gbmV3IFRIUkVFLlZlY3RvcjIoIDAuMCwgMC4wMDE5NTMxMjUgKTtcbiIsIi8qKlxuICogQGF1dGhvciBhbHRlcmVkcSAvIGh0dHA6Ly9hbHRlcmVkcXVhbGlhLmNvbS9cbiAqL1xuXG5USFJFRS5FZmZlY3RDb21wb3NlciA9IGZ1bmN0aW9uICggcmVuZGVyZXIsIHJlbmRlclRhcmdldCApIHtcblxuXHR0aGlzLnJlbmRlcmVyID0gcmVuZGVyZXI7XG5cblx0aWYgKCByZW5kZXJUYXJnZXQgPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdHZhciB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoIHx8IDE7XG5cdFx0dmFyIGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCB8fCAxO1xuXHRcdHZhciBwYXJhbWV0ZXJzID0geyBtaW5GaWx0ZXI6IFRIUkVFLkxpbmVhckZpbHRlciwgbWFnRmlsdGVyOiBUSFJFRS5MaW5lYXJGaWx0ZXIsIGZvcm1hdDogVEhSRUUuUkdCRm9ybWF0LCBzdGVuY2lsQnVmZmVyOiBmYWxzZSB9O1xuXG5cdFx0cmVuZGVyVGFyZ2V0ID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0KCB3aWR0aCwgaGVpZ2h0LCBwYXJhbWV0ZXJzICk7XG5cblx0fVxuXG5cdHRoaXMucmVuZGVyVGFyZ2V0MSA9IHJlbmRlclRhcmdldDtcblx0dGhpcy5yZW5kZXJUYXJnZXQyID0gcmVuZGVyVGFyZ2V0LmNsb25lKCk7XG5cblx0dGhpcy53cml0ZUJ1ZmZlciA9IHRoaXMucmVuZGVyVGFyZ2V0MTtcblx0dGhpcy5yZWFkQnVmZmVyID0gdGhpcy5yZW5kZXJUYXJnZXQyO1xuXG5cdHRoaXMucGFzc2VzID0gW107XG5cblx0aWYgKCBUSFJFRS5Db3B5U2hhZGVyID09PSB1bmRlZmluZWQgKVxuXHRcdGNvbnNvbGUuZXJyb3IoIFwiVEhSRUUuRWZmZWN0Q29tcG9zZXIgcmVsaWVzIG9uIFRIUkVFLkNvcHlTaGFkZXJcIiApO1xuXG5cdHRoaXMuY29weVBhc3MgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuQ29weVNoYWRlciApO1xuXG59O1xuXG5USFJFRS5FZmZlY3RDb21wb3Nlci5wcm90b3R5cGUgPSB7XG5cblx0c3dhcEJ1ZmZlcnM6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHRtcCA9IHRoaXMucmVhZEJ1ZmZlcjtcblx0XHR0aGlzLnJlYWRCdWZmZXIgPSB0aGlzLndyaXRlQnVmZmVyO1xuXHRcdHRoaXMud3JpdGVCdWZmZXIgPSB0bXA7XG5cblx0fSxcblxuXHRhZGRQYXNzOiBmdW5jdGlvbiAoIHBhc3MgKSB7XG5cblx0XHR0aGlzLnBhc3Nlcy5wdXNoKCBwYXNzICk7XG5cblx0fSxcblxuXHRpbnNlcnRQYXNzOiBmdW5jdGlvbiAoIHBhc3MsIGluZGV4ICkge1xuXG5cdFx0dGhpcy5wYXNzZXMuc3BsaWNlKCBpbmRleCwgMCwgcGFzcyApO1xuXG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbiAoIGRlbHRhICkge1xuXG5cdFx0dGhpcy53cml0ZUJ1ZmZlciA9IHRoaXMucmVuZGVyVGFyZ2V0MTtcblx0XHR0aGlzLnJlYWRCdWZmZXIgPSB0aGlzLnJlbmRlclRhcmdldDI7XG5cblx0XHR2YXIgbWFza0FjdGl2ZSA9IGZhbHNlO1xuXG5cdFx0dmFyIHBhc3MsIGksIGlsID0gdGhpcy5wYXNzZXMubGVuZ3RoO1xuXG5cdFx0Zm9yICggaSA9IDA7IGkgPCBpbDsgaSArKyApIHtcblxuXHRcdFx0cGFzcyA9IHRoaXMucGFzc2VzWyBpIF07XG5cblx0XHRcdGlmICggIXBhc3MuZW5hYmxlZCApIGNvbnRpbnVlO1xuXG5cdFx0XHRwYXNzLnJlbmRlciggdGhpcy5yZW5kZXJlciwgdGhpcy53cml0ZUJ1ZmZlciwgdGhpcy5yZWFkQnVmZmVyLCBkZWx0YSwgbWFza0FjdGl2ZSApO1xuXG5cdFx0XHRpZiAoIHBhc3MubmVlZHNTd2FwICkge1xuXG5cdFx0XHRcdGlmICggbWFza0FjdGl2ZSApIHtcblxuXHRcdFx0XHRcdHZhciBjb250ZXh0ID0gdGhpcy5yZW5kZXJlci5jb250ZXh0O1xuXG5cdFx0XHRcdFx0Y29udGV4dC5zdGVuY2lsRnVuYyggY29udGV4dC5OT1RFUVVBTCwgMSwgMHhmZmZmZmZmZiApO1xuXG5cdFx0XHRcdFx0dGhpcy5jb3B5UGFzcy5yZW5kZXIoIHRoaXMucmVuZGVyZXIsIHRoaXMud3JpdGVCdWZmZXIsIHRoaXMucmVhZEJ1ZmZlciwgZGVsdGEgKTtcblxuXHRcdFx0XHRcdGNvbnRleHQuc3RlbmNpbEZ1bmMoIGNvbnRleHQuRVFVQUwsIDEsIDB4ZmZmZmZmZmYgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhpcy5zd2FwQnVmZmVycygpO1xuXG5cdFx0XHR9XG5cblx0XHRcdGlmICggcGFzcyBpbnN0YW5jZW9mIFRIUkVFLk1hc2tQYXNzICkge1xuXG5cdFx0XHRcdG1hc2tBY3RpdmUgPSB0cnVlO1xuXG5cdFx0XHR9IGVsc2UgaWYgKCBwYXNzIGluc3RhbmNlb2YgVEhSRUUuQ2xlYXJNYXNrUGFzcyApIHtcblxuXHRcdFx0XHRtYXNrQWN0aXZlID0gZmFsc2U7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHR9LFxuXG5cdHJlc2V0OiBmdW5jdGlvbiAoIHJlbmRlclRhcmdldCApIHtcblxuXHRcdGlmICggcmVuZGVyVGFyZ2V0ID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdHJlbmRlclRhcmdldCA9IHRoaXMucmVuZGVyVGFyZ2V0MS5jbG9uZSgpO1xuXG5cdFx0XHRyZW5kZXJUYXJnZXQud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcblx0XHRcdHJlbmRlclRhcmdldC5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cblx0XHR9XG5cblx0XHR0aGlzLnJlbmRlclRhcmdldDEgPSByZW5kZXJUYXJnZXQ7XG5cdFx0dGhpcy5yZW5kZXJUYXJnZXQyID0gcmVuZGVyVGFyZ2V0LmNsb25lKCk7XG5cblx0XHR0aGlzLndyaXRlQnVmZmVyID0gdGhpcy5yZW5kZXJUYXJnZXQxO1xuXHRcdHRoaXMucmVhZEJ1ZmZlciA9IHRoaXMucmVuZGVyVGFyZ2V0MjtcblxuXHR9LFxuXG5cdHNldFNpemU6IGZ1bmN0aW9uICggd2lkdGgsIGhlaWdodCApIHtcblxuXHRcdHZhciByZW5kZXJUYXJnZXQgPSB0aGlzLnJlbmRlclRhcmdldDEuY2xvbmUoKTtcblxuXHRcdHJlbmRlclRhcmdldC53aWR0aCA9IHdpZHRoO1xuXHRcdHJlbmRlclRhcmdldC5oZWlnaHQgPSBoZWlnaHQ7XG5cblx0XHR0aGlzLnJlc2V0KCByZW5kZXJUYXJnZXQgKTtcblxuXHR9XG5cbn07XG4iLCIvKipcbiAqIEBhdXRob3IgYWx0ZXJlZHEgLyBodHRwOi8vYWx0ZXJlZHF1YWxpYS5jb20vXG4gKi9cblxuVEhSRUUuRmlsbVBhc3MgPSBmdW5jdGlvbiAoIG5vaXNlSW50ZW5zaXR5LCBzY2FubGluZXNJbnRlbnNpdHksIHNjYW5saW5lc0NvdW50LCBncmF5c2NhbGUgKSB7XG5cblx0aWYgKCBUSFJFRS5GaWxtU2hhZGVyID09PSB1bmRlZmluZWQgKVxuXHRcdGNvbnNvbGUuZXJyb3IoIFwiVEhSRUUuRmlsbVBhc3MgcmVsaWVzIG9uIFRIUkVFLkZpbG1TaGFkZXJcIiApO1xuXG5cdHZhciBzaGFkZXIgPSBUSFJFRS5GaWxtU2hhZGVyO1xuXG5cdHRoaXMudW5pZm9ybXMgPSBUSFJFRS5Vbmlmb3Jtc1V0aWxzLmNsb25lKCBzaGFkZXIudW5pZm9ybXMgKTtcblxuXHR0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKCB7XG5cblx0XHR1bmlmb3JtczogdGhpcy51bmlmb3Jtcyxcblx0XHR2ZXJ0ZXhTaGFkZXI6IHNoYWRlci52ZXJ0ZXhTaGFkZXIsXG5cdFx0ZnJhZ21lbnRTaGFkZXI6IHNoYWRlci5mcmFnbWVudFNoYWRlclxuXG5cdH0gKTtcblxuXHRpZiAoIGdyYXlzY2FsZSAhPT0gdW5kZWZpbmVkIClcdHRoaXMudW5pZm9ybXMuZ3JheXNjYWxlLnZhbHVlID0gZ3JheXNjYWxlO1xuXHRpZiAoIG5vaXNlSW50ZW5zaXR5ICE9PSB1bmRlZmluZWQgKSB0aGlzLnVuaWZvcm1zLm5JbnRlbnNpdHkudmFsdWUgPSBub2lzZUludGVuc2l0eTtcblx0aWYgKCBzY2FubGluZXNJbnRlbnNpdHkgIT09IHVuZGVmaW5lZCApIHRoaXMudW5pZm9ybXMuc0ludGVuc2l0eS52YWx1ZSA9IHNjYW5saW5lc0ludGVuc2l0eTtcblx0aWYgKCBzY2FubGluZXNDb3VudCAhPT0gdW5kZWZpbmVkICkgdGhpcy51bmlmb3Jtcy5zQ291bnQudmFsdWUgPSBzY2FubGluZXNDb3VudDtcblxuXHR0aGlzLmVuYWJsZWQgPSB0cnVlO1xuXHR0aGlzLnJlbmRlclRvU2NyZWVuID0gZmFsc2U7XG5cdHRoaXMubmVlZHNTd2FwID0gdHJ1ZTtcblxuXG5cdHRoaXMuY2FtZXJhID0gbmV3IFRIUkVFLk9ydGhvZ3JhcGhpY0NhbWVyYSggLTEsIDEsIDEsIC0xLCAwLCAxICk7XG5cdHRoaXMuc2NlbmUgID0gbmV3IFRIUkVFLlNjZW5lKCk7XG5cblx0dGhpcy5xdWFkID0gbmV3IFRIUkVFLk1lc2goIG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAyLCAyICksIG51bGwgKTtcblx0dGhpcy5zY2VuZS5hZGQoIHRoaXMucXVhZCApO1xuXG59O1xuXG5USFJFRS5GaWxtUGFzcy5wcm90b3R5cGUgPSB7XG5cblx0cmVuZGVyOiBmdW5jdGlvbiAoIHJlbmRlcmVyLCB3cml0ZUJ1ZmZlciwgcmVhZEJ1ZmZlciwgZGVsdGEgKSB7XG5cblx0XHR0aGlzLnVuaWZvcm1zWyBcInREaWZmdXNlXCIgXS52YWx1ZSA9IHJlYWRCdWZmZXI7XG5cdFx0dGhpcy51bmlmb3Jtc1sgXCJ0aW1lXCIgXS52YWx1ZSArPSBkZWx0YTtcblxuXHRcdHRoaXMucXVhZC5tYXRlcmlhbCA9IHRoaXMubWF0ZXJpYWw7XG5cblx0XHRpZiAoIHRoaXMucmVuZGVyVG9TY3JlZW4gKSB7XG5cblx0XHRcdHJlbmRlcmVyLnJlbmRlciggdGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEgKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdHJlbmRlcmVyLnJlbmRlciggdGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEsIHdyaXRlQnVmZmVyLCBmYWxzZSApO1xuXG5cdFx0fVxuXG5cdH1cblxufTtcbiIsIi8qKlxuICogQGF1dGhvciBhbHRlcmVkcSAvIGh0dHA6Ly9hbHRlcmVkcXVhbGlhLmNvbS9cbiAqL1xuXG5USFJFRS5NYXNrUGFzcyA9IGZ1bmN0aW9uICggc2NlbmUsIGNhbWVyYSApIHtcblxuXHR0aGlzLnNjZW5lID0gc2NlbmU7XG5cdHRoaXMuY2FtZXJhID0gY2FtZXJhO1xuXG5cdHRoaXMuZW5hYmxlZCA9IHRydWU7XG5cdHRoaXMuY2xlYXIgPSB0cnVlO1xuXHR0aGlzLm5lZWRzU3dhcCA9IGZhbHNlO1xuXG5cdHRoaXMuaW52ZXJzZSA9IGZhbHNlO1xuXG59O1xuXG5USFJFRS5NYXNrUGFzcy5wcm90b3R5cGUgPSB7XG5cblx0cmVuZGVyOiBmdW5jdGlvbiAoIHJlbmRlcmVyLCB3cml0ZUJ1ZmZlciwgcmVhZEJ1ZmZlciwgZGVsdGEgKSB7XG5cblx0XHR2YXIgY29udGV4dCA9IHJlbmRlcmVyLmNvbnRleHQ7XG5cblx0XHQvLyBkb24ndCB1cGRhdGUgY29sb3Igb3IgZGVwdGhcblxuXHRcdGNvbnRleHQuY29sb3JNYXNrKCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSApO1xuXHRcdGNvbnRleHQuZGVwdGhNYXNrKCBmYWxzZSApO1xuXG5cdFx0Ly8gc2V0IHVwIHN0ZW5jaWxcblxuXHRcdHZhciB3cml0ZVZhbHVlLCBjbGVhclZhbHVlO1xuXG5cdFx0aWYgKCB0aGlzLmludmVyc2UgKSB7XG5cblx0XHRcdHdyaXRlVmFsdWUgPSAwO1xuXHRcdFx0Y2xlYXJWYWx1ZSA9IDE7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHR3cml0ZVZhbHVlID0gMTtcblx0XHRcdGNsZWFyVmFsdWUgPSAwO1xuXG5cdFx0fVxuXG5cdFx0Y29udGV4dC5lbmFibGUoIGNvbnRleHQuU1RFTkNJTF9URVNUICk7XG5cdFx0Y29udGV4dC5zdGVuY2lsT3AoIGNvbnRleHQuUkVQTEFDRSwgY29udGV4dC5SRVBMQUNFLCBjb250ZXh0LlJFUExBQ0UgKTtcblx0XHRjb250ZXh0LnN0ZW5jaWxGdW5jKCBjb250ZXh0LkFMV0FZUywgd3JpdGVWYWx1ZSwgMHhmZmZmZmZmZiApO1xuXHRcdGNvbnRleHQuY2xlYXJTdGVuY2lsKCBjbGVhclZhbHVlICk7XG5cblx0XHQvLyBkcmF3IGludG8gdGhlIHN0ZW5jaWwgYnVmZmVyXG5cblx0XHRyZW5kZXJlci5yZW5kZXIoIHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhLCByZWFkQnVmZmVyLCB0aGlzLmNsZWFyICk7XG5cdFx0cmVuZGVyZXIucmVuZGVyKCB0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSwgd3JpdGVCdWZmZXIsIHRoaXMuY2xlYXIgKTtcblxuXHRcdC8vIHJlLWVuYWJsZSB1cGRhdGUgb2YgY29sb3IgYW5kIGRlcHRoXG5cblx0XHRjb250ZXh0LmNvbG9yTWFzayggdHJ1ZSwgdHJ1ZSwgdHJ1ZSwgdHJ1ZSApO1xuXHRcdGNvbnRleHQuZGVwdGhNYXNrKCB0cnVlICk7XG5cblx0XHQvLyBvbmx5IHJlbmRlciB3aGVyZSBzdGVuY2lsIGlzIHNldCB0byAxXG5cblx0XHRjb250ZXh0LnN0ZW5jaWxGdW5jKCBjb250ZXh0LkVRVUFMLCAxLCAweGZmZmZmZmZmICk7ICAvLyBkcmF3IGlmID09IDFcblx0XHRjb250ZXh0LnN0ZW5jaWxPcCggY29udGV4dC5LRUVQLCBjb250ZXh0LktFRVAsIGNvbnRleHQuS0VFUCApO1xuXG5cdH1cblxufTtcblxuXG5USFJFRS5DbGVhck1hc2tQYXNzID0gZnVuY3Rpb24gKCkge1xuXG5cdHRoaXMuZW5hYmxlZCA9IHRydWU7XG5cbn07XG5cblRIUkVFLkNsZWFyTWFza1Bhc3MucHJvdG90eXBlID0ge1xuXG5cdHJlbmRlcjogZnVuY3Rpb24gKCByZW5kZXJlciwgd3JpdGVCdWZmZXIsIHJlYWRCdWZmZXIsIGRlbHRhICkge1xuXG5cdFx0dmFyIGNvbnRleHQgPSByZW5kZXJlci5jb250ZXh0O1xuXG5cdFx0Y29udGV4dC5kaXNhYmxlKCBjb250ZXh0LlNURU5DSUxfVEVTVCApO1xuXG5cdH1cblxufTtcbiIsIi8qKlxuICogQGF1dGhvciBhbHRlcmVkcSAvIGh0dHA6Ly9hbHRlcmVkcXVhbGlhLmNvbS9cbiAqL1xuXG5USFJFRS5SZW5kZXJQYXNzID0gZnVuY3Rpb24gKCBzY2VuZSwgY2FtZXJhLCBvdmVycmlkZU1hdGVyaWFsLCBjbGVhckNvbG9yLCBjbGVhckFscGhhICkge1xuXG5cdHRoaXMuc2NlbmUgPSBzY2VuZTtcblx0dGhpcy5jYW1lcmEgPSBjYW1lcmE7XG5cblx0dGhpcy5vdmVycmlkZU1hdGVyaWFsID0gb3ZlcnJpZGVNYXRlcmlhbDtcblxuXHR0aGlzLmNsZWFyQ29sb3IgPSBjbGVhckNvbG9yO1xuXHR0aGlzLmNsZWFyQWxwaGEgPSAoIGNsZWFyQWxwaGEgIT09IHVuZGVmaW5lZCApID8gY2xlYXJBbHBoYSA6IDE7XG5cblx0dGhpcy5vbGRDbGVhckNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCk7XG5cdHRoaXMub2xkQ2xlYXJBbHBoYSA9IDE7XG5cblx0dGhpcy5lbmFibGVkID0gdHJ1ZTtcblx0dGhpcy5jbGVhciA9IHRydWU7XG5cdHRoaXMubmVlZHNTd2FwID0gZmFsc2U7XG5cbn07XG5cblRIUkVFLlJlbmRlclBhc3MucHJvdG90eXBlID0ge1xuXG5cdHJlbmRlcjogZnVuY3Rpb24gKCByZW5kZXJlciwgd3JpdGVCdWZmZXIsIHJlYWRCdWZmZXIsIGRlbHRhICkge1xuXG5cdFx0dGhpcy5zY2VuZS5vdmVycmlkZU1hdGVyaWFsID0gdGhpcy5vdmVycmlkZU1hdGVyaWFsO1xuXG5cdFx0aWYgKCB0aGlzLmNsZWFyQ29sb3IgKSB7XG5cblx0XHRcdHRoaXMub2xkQ2xlYXJDb2xvci5jb3B5KCByZW5kZXJlci5nZXRDbGVhckNvbG9yKCkgKTtcblx0XHRcdHRoaXMub2xkQ2xlYXJBbHBoYSA9IHJlbmRlcmVyLmdldENsZWFyQWxwaGEoKTtcblxuXHRcdFx0cmVuZGVyZXIuc2V0Q2xlYXJDb2xvciggdGhpcy5jbGVhckNvbG9yLCB0aGlzLmNsZWFyQWxwaGEgKTtcblxuXHRcdH1cblxuXHRcdHJlbmRlcmVyLnJlbmRlciggdGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEsIHJlYWRCdWZmZXIsIHRoaXMuY2xlYXIgKTtcblxuXHRcdGlmICggdGhpcy5jbGVhckNvbG9yICkge1xuXG5cdFx0XHRyZW5kZXJlci5zZXRDbGVhckNvbG9yKCB0aGlzLm9sZENsZWFyQ29sb3IsIHRoaXMub2xkQ2xlYXJBbHBoYSApO1xuXG5cdFx0fVxuXG5cdFx0dGhpcy5zY2VuZS5vdmVycmlkZU1hdGVyaWFsID0gbnVsbDtcblxuXHR9XG5cbn07XG4iLCIvKipcbiAqIEBhdXRob3IgYWx0ZXJlZHEgLyBodHRwOi8vYWx0ZXJlZHF1YWxpYS5jb20vXG4gKi9cblxuVEhSRUUuU2hhZGVyUGFzcyA9IGZ1bmN0aW9uICggc2hhZGVyLCB0ZXh0dXJlSUQgKSB7XG5cblx0dGhpcy50ZXh0dXJlSUQgPSAoIHRleHR1cmVJRCAhPT0gdW5kZWZpbmVkICkgPyB0ZXh0dXJlSUQgOiBcInREaWZmdXNlXCI7XG5cblx0dGhpcy51bmlmb3JtcyA9IFRIUkVFLlVuaWZvcm1zVXRpbHMuY2xvbmUoIHNoYWRlci51bmlmb3JtcyApO1xuXG5cdHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoIHtcblxuXHRcdHVuaWZvcm1zOiB0aGlzLnVuaWZvcm1zLFxuXHRcdHZlcnRleFNoYWRlcjogc2hhZGVyLnZlcnRleFNoYWRlcixcblx0XHRmcmFnbWVudFNoYWRlcjogc2hhZGVyLmZyYWdtZW50U2hhZGVyXG5cblx0fSApO1xuXG5cdHRoaXMucmVuZGVyVG9TY3JlZW4gPSBmYWxzZTtcblxuXHR0aGlzLmVuYWJsZWQgPSB0cnVlO1xuXHR0aGlzLm5lZWRzU3dhcCA9IHRydWU7XG5cdHRoaXMuY2xlYXIgPSBmYWxzZTtcblxuXG5cdHRoaXMuY2FtZXJhID0gbmV3IFRIUkVFLk9ydGhvZ3JhcGhpY0NhbWVyYSggLTEsIDEsIDEsIC0xLCAwLCAxICk7XG5cdHRoaXMuc2NlbmUgID0gbmV3IFRIUkVFLlNjZW5lKCk7XG5cblx0dGhpcy5xdWFkID0gbmV3IFRIUkVFLk1lc2goIG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAyLCAyICksIG51bGwgKTtcblx0dGhpcy5zY2VuZS5hZGQoIHRoaXMucXVhZCApO1xuXG59O1xuXG5USFJFRS5TaGFkZXJQYXNzLnByb3RvdHlwZSA9IHtcblxuXHRyZW5kZXI6IGZ1bmN0aW9uICggcmVuZGVyZXIsIHdyaXRlQnVmZmVyLCByZWFkQnVmZmVyLCBkZWx0YSApIHtcblxuXHRcdGlmICggdGhpcy51bmlmb3Jtc1sgdGhpcy50ZXh0dXJlSUQgXSApIHtcblxuXHRcdFx0dGhpcy51bmlmb3Jtc1sgdGhpcy50ZXh0dXJlSUQgXS52YWx1ZSA9IHJlYWRCdWZmZXI7XG5cblx0XHR9XG5cblx0XHR0aGlzLnF1YWQubWF0ZXJpYWwgPSB0aGlzLm1hdGVyaWFsO1xuXG5cdFx0aWYgKCB0aGlzLnJlbmRlclRvU2NyZWVuICkge1xuXG5cdFx0XHRyZW5kZXJlci5yZW5kZXIoIHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhICk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRyZW5kZXJlci5yZW5kZXIoIHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhLCB3cml0ZUJ1ZmZlciwgdGhpcy5jbGVhciApO1xuXG5cdFx0fVxuXG5cdH1cblxufTtcbiIsInZhciBnbHNsaWZ5ID0gcmVxdWlyZShcImdsc2xpZnlcIik7XG52YXIgY3JlYXRlU2hhZGVyID0gcmVxdWlyZShcInRocmVlLWdsc2xpZnlcIikoVEhSRUUpO1xudmFyIHNoYWRlciA9IGNyZWF0ZVNoYWRlcihyZXF1aXJlKFwiZ2xzbGlmeS9zaW1wbGUtYWRhcHRlci5qc1wiKShcIlxcbiNkZWZpbmUgR0xTTElGWSAxXFxuXFxudmFyeWluZyB2ZWMyIHZVdjtcXG52b2lkIG1haW4oKSB7XFxuICB2VXYgPSB1djtcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7XFxufVwiLCBcIlxcbiNkZWZpbmUgR0xTTElGWSAxXFxuXFxuaGlnaHAgZmxvYXQgYV94X3JhbmRvbSh2ZWMyIGNvKSB7XFxuICBoaWdocCBmbG9hdCBhID0gMTIuOTg5ODtcXG4gIGhpZ2hwIGZsb2F0IGIgPSA3OC4yMzM7XFxuICBoaWdocCBmbG9hdCBjID0gNDM3NTguNTQ1MztcXG4gIGhpZ2hwIGZsb2F0IGR0ID0gZG90KGNvLnh5LCB2ZWMyKGEsIGIpKTtcXG4gIGhpZ2hwIGZsb2F0IHNuID0gbW9kKGR0LCAzLjE0KTtcXG4gIHJldHVybiBmcmFjdChzaW4oc24pICogYyk7XFxufVxcbnVuaWZvcm0gZmxvYXQgb3BhY2l0eTtcXG51bmlmb3JtIHNhbXBsZXIyRCB0RGlmZnVzZTtcXG52YXJ5aW5nIHZlYzIgdlV2O1xcbnZvaWQgbWFpbigpIHtcXG4gIHZlYzIgdW5pdElfVG9TaWRlID0gKHZVdiAqIDIuMCAtIDEuMCk7XFxuICB1bml0SV9Ub1NpZGUgPSBwb3codW5pdElfVG9TaWRlLCB2ZWMyKDMuMCwgNS4wKSkgKiBhX3hfcmFuZG9tKHZVdikgKiAtMC4wMTtcXG4gIHZlYzQgdGV4ZWwgPSB0ZXh0dXJlMkQodERpZmZ1c2UsIHZVdik7XFxuICB2ZWM0IHNtYWxsc2hpZnQgPSB0ZXh0dXJlMkQodERpZmZ1c2UsIHZVdiArIHVuaXRJX1RvU2lkZSAqIDAuNSk7XFxuICB2ZWM0IGJpZ3NoaWZ0ID0gdGV4dHVyZTJEKHREaWZmdXNlLCB2VXYgKyB1bml0SV9Ub1NpZGUpO1xcbiAgZ2xfRnJhZ0NvbG9yID0gb3BhY2l0eSAqIHZlYzQoYmlnc2hpZnQueCwgdGV4ZWwueSwgc21hbGxzaGlmdC56LCB0ZXhlbC53KTtcXG59XCIsIFt7XCJuYW1lXCI6XCJvcGFjaXR5XCIsXCJ0eXBlXCI6XCJmbG9hdFwifSx7XCJuYW1lXCI6XCJ0RGlmZnVzZVwiLFwidHlwZVwiOlwic2FtcGxlcjJEXCJ9XSwgW10pKTtcbnNoYWRlci51bmlmb3Jtcy5vcGFjaXR5LnZhbHVlID0gMTtcbm1vZHVsZS5leHBvcnRzID0gc2hhZGVyOyIsInJlcXVpcmUoJy4vRWZmZWN0Q29tcG9zZXInKTtcbnJlcXVpcmUoJy4vTWFza1Bhc3MnKTtcbnJlcXVpcmUoJy4vQmxvb21QYXNzJyk7XG5yZXF1aXJlKCcuL1JlbmRlclBhc3MnKTtcbnJlcXVpcmUoJy4vU2hhZGVyUGFzcycpO1xucmVxdWlyZSgnLi9GaWxtUGFzcycpOyIsInJlcXVpcmUoJy4vcG9zdHByb2Nlc3NpbmcnKTtcbnJlcXVpcmUoJy4vc2hhZGVycy9Db3B5U2hhZGVyJyk7XG5yZXF1aXJlKCcuL3NoYWRlcnMvRmlsbVNoYWRlcicpO1xucmVxdWlyZSgnLi9zaGFkZXJzL0NvbnZvbHV0aW9uU2hhZGVyJyk7XG5yZXF1aXJlKCcuL3NoYWRlcnMvRlhBQVNoYWRlcicpO1xudmFyIGNocm9tYXRpY0FiZXJyYXRpb25TaGFkZXIgPSByZXF1aXJlKCcuL3Bvc3Rwcm9jZXNzaW5nL2Nocm9tYXRpY0FiZXJyYXRpb24nKTtcbnZhciBTdGVyZW9FZmZlY3QgPSByZXF1aXJlKCcuL3ZlbmRvci9TdGVyZW9FZmZlY3QnKTtcblxuLy9TaW5nbGV0b25zXG52YXIgX3JhdGlvID0gXy5pc051bWJlciggd2luZG93LmRldmljZVBpeGVsUmF0aW8gKSA/IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIDogMTtcbnZhciBfd2ViR0xSZW5kZXJlciA9IGFkZFJlbmRlcmVyKCk7XG52YXIgX3JlbmRlcmVyID0gX3dlYkdMUmVuZGVyZXI7XG52YXIgX3JlbmRlcmVyUGFzcyA9IG5ldyBUSFJFRS5SZW5kZXJQYXNzKCk7XG52YXIgX2NvbXBvc2VyID0gYWRkRWZmZWN0c0NvbXBvc2VyKCBfcmVuZGVyZXJQYXNzICk7XG5cbmZ1bmN0aW9uIGFkZEVmZmVjdHNDb21wb3NlciggcmVuZGVyUGFzcyApIHtcblx0XG5cdHZhciBibG9vbSA9IG5ldyBUSFJFRS5CbG9vbVBhc3MoIDEuNSwgMTUsIDE2LCA1MTIgKTtcblx0dmFyIGNvcHkgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuQ29weVNoYWRlciApO1xuXHR2YXIgYW50aWFsaWFzID0gbmV3IFRIUkVFLlNoYWRlclBhc3MoIFRIUkVFLkZYQUFTaGFkZXIgKTtcblx0dmFyIGNocm9tYXRpY0FiZXJyYXRpb24gPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggY2hyb21hdGljQWJlcnJhdGlvblNoYWRlciApO1xuXHRcblx0YW50aWFsaWFzLnVuaWZvcm1zLnJlc29sdXRpb24udmFsdWUuc2V0KFxuXHRcdDEgLyAod2luZG93LmlubmVyV2lkdGggKiBfcmF0aW8pLFxuXHRcdDEgLyAod2luZG93LmlubmVySGVpZ2h0ICogX3JhdGlvKVxuXHQpO1xuXHRjb3B5LnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcblxuXHR2YXIgY29tcG9zZXIgPSBuZXcgVEhSRUUuRWZmZWN0Q29tcG9zZXIoIF9yZW5kZXJlciApO1xuXHRjb21wb3Nlci5yZW5kZXJUYXJnZXQxLnNldFNpemUoIHdpbmRvdy5pbm5lcldpZHRoICogX3JhdGlvLCB3aW5kb3cuaW5uZXJIZWlnaHQgKiBfcmF0aW8gKTtcblx0Y29tcG9zZXIucmVuZGVyVGFyZ2V0Mi5zZXRTaXplKCB3aW5kb3cuaW5uZXJXaWR0aCAqIF9yYXRpbywgd2luZG93LmlubmVySGVpZ2h0ICogX3JhdGlvICk7XG5cblx0Y29tcG9zZXIuYWRkUGFzcyggcmVuZGVyUGFzcyApO1xuXHRjb21wb3Nlci5hZGRQYXNzKCBhbnRpYWxpYXMgKTtcblx0Ly8gY29tcG9zZXIuYWRkUGFzcyggY2hyb21hdGljQWJlcnJhdGlvbiApO1xuXHRjb21wb3Nlci5hZGRQYXNzKCBibG9vbSApO1xuXHRjb21wb3Nlci5hZGRQYXNzKCBjb3B5ICk7XG5cdFxuXHRyZXR1cm4gY29tcG9zZXI7XG5cdFxufVxuXG5mdW5jdGlvbiBhZGRTY2VuZUFuZENhbWVyYVRvRWZmZWN0cyggc2NlbmUsIGNhbWVyYSApIHtcblx0XG5cdF9yZW5kZXJlclBhc3Muc2NlbmUgPSBzY2VuZTtcblx0X3JlbmRlcmVyUGFzcy5jYW1lcmEgPSBjYW1lcmE7XG5cdFxufVxuXG52YXIgbmV3UmVzaXplSGFuZGxlciA9IChmdW5jdGlvbigpIHtcblx0XG5cdHZhciBoYW5kbGVyO1xuXHR2YXIgJHdpbmRvdyA9ICQod2luZG93KTtcblx0XG5cdHJldHVybiBmdW5jdGlvbiggY2FtZXJhICkge1xuXHRcdFxuXHRcdHZhciBuZXdIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcblx0XHRcdF9yZW5kZXJlci5zZXRTaXplKFxuXHRcdFx0XHR3aW5kb3cuaW5uZXJXaWR0aCxcblx0XHRcdFx0d2luZG93LmlubmVySGVpZ2h0XG5cdFx0XHQpO1xuXHRcdFx0XG5cdFx0XHRjYW1lcmEuYXNwZWN0ID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cdFx0XHRjYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuXHRcdFx0XG5cdFx0fTtcblx0XHRcblx0XHRpZiggaGFuZGxlciApIHtcblx0XHRcdCQod2luZG93KS5vZmYoJ3Jlc2l6ZScsIGhhbmRsZXIpO1xuXHRcdH1cblx0XHRcblx0XHQkd2luZG93Lm9uKCdyZXNpemUnLCBuZXdIYW5kbGVyKTtcblx0XHRuZXdIYW5kbGVyKCk7XG5cdFx0aGFuZGxlciA9IG5ld0hhbmRsZXI7XG5cdFx0XG5cdH07XG5cdFx0XG59KSgpO1xuXG5mdW5jdGlvbiBhZGRSZW5kZXJlcigpIHtcblx0XG5cdHZhciByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKCk7XG5cdHJlbmRlcmVyLnNldFBpeGVsUmF0aW8oIF9yYXRpbyApO1xuXHRyZW5kZXJlci5zZXRTaXplKFxuXHRcdHdpbmRvdy5pbm5lcldpZHRoLFxuXHRcdHdpbmRvdy5pbm5lckhlaWdodFxuXHQpO1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJ2NvbnRhaW5lcicgKS5hcHBlbmRDaGlsZCggcmVuZGVyZXIuZG9tRWxlbWVudCApO1xuXHRcdFxuXHRyZXR1cm4gcmVuZGVyZXI7XG5cdFxufVxuXG5mdW5jdGlvbiBoYW5kbGVOZXdQb2VtKCBwb2VtLCBwcm9wZXJ0aWVzICkge1xuXHRcblx0dmFyIGNvbmZpZyA9IF8uZXh0ZW5kKHtcblx0XHRjbGVhckNvbG9yIDogMHgyMjIyMjIsXG5cdFx0dXNlRWZmZWN0cyA6IGZhbHNlLFxuXHRcdHVzZVZSIDogZmFsc2Vcblx0fSwgcHJvcGVydGllcyk7XG5cdFxuXHR2YXIgc2NlbmUgPSBwb2VtLnNjZW5lO1xuXHR2YXIgY2FtZXJhID0gcG9lbS5jYW1lcmEub2JqZWN0O1xuXHRcblx0X3JlbmRlcmVyLnNldENsZWFyQ29sb3IoIGNvbmZpZy5jbGVhckNvbG9yICk7XG5cdFxuXHRpZiggY29uZmlnLnVzZVZSICkge1xuXHRcdF9yZW5kZXJlciA9IG5ldyBTdGVyZW9FZmZlY3QoIF93ZWJHTFJlbmRlcmVyICk7XG5cdFx0X3JlbmRlcmVyLnNlcGFyYXRpb24gPSAxMDtcblx0XHQvLyB0aGlzLmhpZGVVSSgpO1xuXHR9IGVsc2Uge1xuXHRcdF9yZW5kZXJlciA9IF93ZWJHTFJlbmRlcmVyO1xuXHRcdC8vIHRoaXMuc2hvd1VJKCk7XG5cdH1cblx0XG5cdGFkZFNjZW5lQW5kQ2FtZXJhVG9FZmZlY3RzKCBzY2VuZSwgY2FtZXJhICk7XG5cdG5ld1Jlc2l6ZUhhbmRsZXIoIGNhbWVyYSApO1xuXHRcblx0aWYoIGNvbmZpZy51c2VFZmZlY3RzICkge1xuXHRcdF9yZW5kZXJlci5hdXRvQ2xlYXIgPSBmYWxzZTtcblx0XHRwb2VtLm9uKCAnZHJhdycsIGZ1bmN0aW9uKCkge1xuXHRcdFx0X2NvbXBvc2VyLnJlbmRlciggc2NlbmUsIGNhbWVyYSApO1xuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdF9yZW5kZXJlci5hdXRvQ2xlYXIgPSB0cnVlO1xuXHRcdHBvZW0ub24oICdkcmF3JywgZnVuY3Rpb24oKSB7XG5cdFx0XHRfcmVuZGVyZXIucmVuZGVyKCBzY2VuZSwgY2FtZXJhICk7XG5cdFx0fSk7XG5cdH1cblx0XG5cdHJldHVybiBfcmVuZGVyZXI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFuZGxlTmV3UG9lbTsiLCJ2YXIgY3Jvc3Nyb2FkcyA9IHJlcXVpcmUoJ2Nyb3Nzcm9hZHMnKTtcbnZhciBoYXNoZXIgPSByZXF1aXJlKCdoYXNoZXInKTtcbnZhciBsZXZlbExvYWRlciA9IHJlcXVpcmUoJy4vbGV2ZWxMb2FkZXInKTtcblxudmFyIGJhc2VVcmwgPSAnL3NhbmRib3gnO1xudmFyIGRlZmF1bHRMZXZlbCA9IFwic2luZUdyYXZpdHlDbG91ZFwiO1xudmFyIGN1cnJlbnRMZXZlbCA9IFwiXCI7XG5cbnZhciByb3V0aW5nID0ge1xuXHRcblx0c3RhcnQgOiBmdW5jdGlvbiggUG9lbSwgbWFuaWZlc3RzICkge1xuXHRcdFxuXHRcdGxldmVsTG9hZGVyLmluaXQoIFBvZW0sIG1hbmlmZXN0cyApO1xuXHRcdFxuXHRcdGZ1bmN0aW9uIHBhcnNlSGFzaCggbmV3SGFzaCwgb2xkSGFzaCApe1xuXHRcdFx0Y3Jvc3Nyb2Fkcy5wYXJzZSggbmV3SGFzaCApO1xuXHRcdH1cblx0XHRcblx0XHRjcm9zc3JvYWRzLmFkZFJvdXRlKCAnLycsXHRcdFx0XHRyb3V0aW5nLnNob3dNYWluVGl0bGVzICk7XG5cdFx0Y3Jvc3Nyb2Fkcy5hZGRSb3V0ZSggJ2xldmVsL3tuYW1lfScsXHRyb3V0aW5nLmxvYWRVcEFMZXZlbCApO1xuXHRcblx0XHRjcm9zc3JvYWRzLmFkZFJvdXRlKCAvLiovLCBmdW5jdGlvbiByZVJvdXRlVG9NYWluVGl0bGVzSWZOb01hdGNoKCkge1xuXHRcdFx0aGFzaGVyLnJlcGxhY2VIYXNoKCcnKTtcblx0XHR9KTtcblx0XG5cdFx0aGFzaGVyLmluaXRpYWxpemVkLmFkZChwYXJzZUhhc2gpOyAvLyBwYXJzZSBpbml0aWFsIGhhc2hcblx0XHRoYXNoZXIuY2hhbmdlZC5hZGQocGFyc2VIYXNoKTsgLy9wYXJzZSBoYXNoIGNoYW5nZXNcblx0XHRoYXNoZXIuaW5pdCgpOyAvL3N0YXJ0IGxpc3RlbmluZyBmb3IgaGlzdG9yeSBjaGFuZ2Vcblx0XHRcblx0fSxcblx0XG5cdHNob3dNYWluVGl0bGVzIDogZnVuY3Rpb24oKSB7XG5cblx0XHRfZ2FxLnB1c2goIFsgJ190cmFja1BhZ2V2aWV3JywgYmFzZVVybCBdICk7XG5cdFxuXHRcdGxldmVsTG9hZGVyLmxvYWQoIGRlZmF1bHRMZXZlbCApO1x0XHRcblxuXHR9LFxuXG5cdGxvYWRVcEFMZXZlbCA6IGZ1bmN0aW9uKCBsZXZlbE5hbWUgKSB7XG5cblx0XHRfZ2FxLnB1c2goIFsgJ190cmFja1BhZ2V2aWV3JywgYmFzZVVybCsnLyNsZXZlbC8nK2xldmVsTmFtZSBdICk7XG5cdFxuXHRcdHZhciBsZXZlbEZvdW5kID0gbGV2ZWxMb2FkZXIubG9hZCggbGV2ZWxOYW1lICk7XG5cdFxuXHRcdGlmKCAhbGV2ZWxGb3VuZCApIHtcblx0XHRcdGxldmVsTG9hZGVyLmxvYWQoIGRlZmF1bHRMZXZlbCApO1xuXHRcdH1cblx0XHRcblx0fSxcblx0XG5cdG9uIDogbGV2ZWxMb2FkZXIub24uYmluZCggbGV2ZWxMb2FkZXIgKSxcblx0b2ZmIDogbGV2ZWxMb2FkZXIub2ZmLmJpbmQoIGxldmVsTG9hZGVyIClcblx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRpbmc7IiwiLyoqXG4gKiBAYXV0aG9yIGFsdGVyZWRxIC8gaHR0cDovL2FsdGVyZWRxdWFsaWEuY29tL1xuICpcbiAqIENvbnZvbHV0aW9uIHNoYWRlclxuICogcG9ydGVkIGZyb20gbzNkIHNhbXBsZSB0byBXZWJHTCAvIEdMU0xcbiAqIGh0dHA6Ly9vM2QuZ29vZ2xlY29kZS5jb20vc3ZuL3RydW5rL3NhbXBsZXMvY29udm9sdXRpb24uaHRtbFxuICovXG5cblRIUkVFLkNvbnZvbHV0aW9uU2hhZGVyID0ge1xuXG5cdGRlZmluZXM6IHtcblxuXHRcdFwiS0VSTkVMX1NJWkVfRkxPQVRcIjogXCIyNS4wXCIsXG5cdFx0XCJLRVJORUxfU0laRV9JTlRcIjogXCIyNVwiLFxuXG5cdH0sXG5cblx0dW5pZm9ybXM6IHtcblxuXHRcdFwidERpZmZ1c2VcIjogICAgICAgIHsgdHlwZTogXCJ0XCIsIHZhbHVlOiBudWxsIH0sXG5cdFx0XCJ1SW1hZ2VJbmNyZW1lbnRcIjogeyB0eXBlOiBcInYyXCIsIHZhbHVlOiBuZXcgVEhSRUUuVmVjdG9yMiggMC4wMDE5NTMxMjUsIDAuMCApIH0sXG5cdFx0XCJjS2VybmVsXCI6ICAgICAgICAgeyB0eXBlOiBcImZ2MVwiLCB2YWx1ZTogW10gfVxuXG5cdH0sXG5cblx0dmVydGV4U2hhZGVyOiBbXG5cblx0XHRcInVuaWZvcm0gdmVjMiB1SW1hZ2VJbmNyZW1lbnQ7XCIsXG5cblx0XHRcInZhcnlpbmcgdmVjMiB2VXY7XCIsXG5cblx0XHRcInZvaWQgbWFpbigpIHtcIixcblxuXHRcdFx0XCJ2VXYgPSB1diAtICggKCBLRVJORUxfU0laRV9GTE9BVCAtIDEuMCApIC8gMi4wICkgKiB1SW1hZ2VJbmNyZW1lbnQ7XCIsXG5cdFx0XHRcImdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQoIHBvc2l0aW9uLCAxLjAgKTtcIixcblxuXHRcdFwifVwiXG5cblx0XS5qb2luKFwiXFxuXCIpLFxuXG5cdGZyYWdtZW50U2hhZGVyOiBbXG5cblx0XHRcInVuaWZvcm0gZmxvYXQgY0tlcm5lbFsgS0VSTkVMX1NJWkVfSU5UIF07XCIsXG5cblx0XHRcInVuaWZvcm0gc2FtcGxlcjJEIHREaWZmdXNlO1wiLFxuXHRcdFwidW5pZm9ybSB2ZWMyIHVJbWFnZUluY3JlbWVudDtcIixcblxuXHRcdFwidmFyeWluZyB2ZWMyIHZVdjtcIixcblxuXHRcdFwidm9pZCBtYWluKCkge1wiLFxuXG5cdFx0XHRcInZlYzIgaW1hZ2VDb29yZCA9IHZVdjtcIixcblx0XHRcdFwidmVjNCBzdW0gPSB2ZWM0KCAwLjAsIDAuMCwgMC4wLCAwLjAgKTtcIixcblxuXHRcdFx0XCJmb3IoIGludCBpID0gMDsgaSA8IEtFUk5FTF9TSVpFX0lOVDsgaSArKyApIHtcIixcblxuXHRcdFx0XHRcInN1bSArPSB0ZXh0dXJlMkQoIHREaWZmdXNlLCBpbWFnZUNvb3JkICkgKiBjS2VybmVsWyBpIF07XCIsXG5cdFx0XHRcdFwiaW1hZ2VDb29yZCArPSB1SW1hZ2VJbmNyZW1lbnQ7XCIsXG5cblx0XHRcdFwifVwiLFxuXG5cdFx0XHRcImdsX0ZyYWdDb2xvciA9IHN1bTtcIixcblxuXHRcdFwifVwiXG5cblxuXHRdLmpvaW4oXCJcXG5cIiksXG5cblx0YnVpbGRLZXJuZWw6IGZ1bmN0aW9uICggc2lnbWEgKSB7XG5cblx0XHQvLyBXZSBsb3Agb2ZmIHRoZSBzcXJ0KDIgKiBwaSkgKiBzaWdtYSB0ZXJtLCBzaW5jZSB3ZSdyZSBnb2luZyB0byBub3JtYWxpemUgYW55d2F5LlxuXG5cdFx0ZnVuY3Rpb24gZ2F1c3MoIHgsIHNpZ21hICkge1xuXG5cdFx0XHRyZXR1cm4gTWF0aC5leHAoIC0gKCB4ICogeCApIC8gKCAyLjAgKiBzaWdtYSAqIHNpZ21hICkgKTtcblxuXHRcdH1cblxuXHRcdHZhciBpLCB2YWx1ZXMsIHN1bSwgaGFsZldpZHRoLCBrTWF4S2VybmVsU2l6ZSA9IDI1LCBrZXJuZWxTaXplID0gMiAqIE1hdGguY2VpbCggc2lnbWEgKiAzLjAgKSArIDE7XG5cblx0XHRpZiAoIGtlcm5lbFNpemUgPiBrTWF4S2VybmVsU2l6ZSApIGtlcm5lbFNpemUgPSBrTWF4S2VybmVsU2l6ZTtcblx0XHRoYWxmV2lkdGggPSAoIGtlcm5lbFNpemUgLSAxICkgKiAwLjU7XG5cblx0XHR2YWx1ZXMgPSBuZXcgQXJyYXkoIGtlcm5lbFNpemUgKTtcblx0XHRzdW0gPSAwLjA7XG5cdFx0Zm9yICggaSA9IDA7IGkgPCBrZXJuZWxTaXplOyArK2kgKSB7XG5cblx0XHRcdHZhbHVlc1sgaSBdID0gZ2F1c3MoIGkgLSBoYWxmV2lkdGgsIHNpZ21hICk7XG5cdFx0XHRzdW0gKz0gdmFsdWVzWyBpIF07XG5cblx0XHR9XG5cblx0XHQvLyBub3JtYWxpemUgdGhlIGtlcm5lbFxuXG5cdFx0Zm9yICggaSA9IDA7IGkgPCBrZXJuZWxTaXplOyArK2kgKSB2YWx1ZXNbIGkgXSAvPSBzdW07XG5cblx0XHRyZXR1cm4gdmFsdWVzO1xuXG5cdH1cblxufTtcbiIsIi8qKlxuICogQGF1dGhvciBhbHRlcmVkcSAvIGh0dHA6Ly9hbHRlcmVkcXVhbGlhLmNvbS9cbiAqXG4gKiBGdWxsLXNjcmVlbiB0ZXh0dXJlZCBxdWFkIHNoYWRlclxuICovXG5cblRIUkVFLkNvcHlTaGFkZXIgPSB7XG5cblx0dW5pZm9ybXM6IHtcblxuXHRcdFwidERpZmZ1c2VcIjogeyB0eXBlOiBcInRcIiwgdmFsdWU6IG51bGwgfSxcblx0XHRcIm9wYWNpdHlcIjogIHsgdHlwZTogXCJmXCIsIHZhbHVlOiAxLjAgfVxuXG5cdH0sXG5cblx0dmVydGV4U2hhZGVyOiBbXG5cblx0XHRcInZhcnlpbmcgdmVjMiB2VXY7XCIsXG5cblx0XHRcInZvaWQgbWFpbigpIHtcIixcblxuXHRcdFx0XCJ2VXYgPSB1djtcIixcblx0XHRcdFwiZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxWaWV3TWF0cml4ICogdmVjNCggcG9zaXRpb24sIDEuMCApO1wiLFxuXG5cdFx0XCJ9XCJcblxuXHRdLmpvaW4oXCJcXG5cIiksXG5cblx0ZnJhZ21lbnRTaGFkZXI6IFtcblxuXHRcdFwidW5pZm9ybSBmbG9hdCBvcGFjaXR5O1wiLFxuXG5cdFx0XCJ1bmlmb3JtIHNhbXBsZXIyRCB0RGlmZnVzZTtcIixcblxuXHRcdFwidmFyeWluZyB2ZWMyIHZVdjtcIixcblxuXHRcdFwidm9pZCBtYWluKCkge1wiLFxuXG5cdFx0XHRcInZlYzQgdGV4ZWwgPSB0ZXh0dXJlMkQoIHREaWZmdXNlLCB2VXYgKTtcIixcblx0XHRcdFwiZ2xfRnJhZ0NvbG9yID0gb3BhY2l0eSAqIHRleGVsO1wiLFxuXG5cdFx0XCJ9XCJcblxuXHRdLmpvaW4oXCJcXG5cIilcblxufTtcbiIsIi8qKlxuICogQGF1dGhvciBhbHRlcmVkcSAvIGh0dHA6Ly9hbHRlcmVkcXVhbGlhLmNvbS9cbiAqIEBhdXRob3IgZGF2aWRlZGMgLyBodHRwOi8vd3d3LnNrZXRjaHBhdGNoLm5ldC9cbiAqXG4gKiBOVklESUEgRlhBQSBieSBUaW1vdGh5IExvdHRlc1xuICogaHR0cDovL3RpbW90aHlsb3R0ZXMuYmxvZ3Nwb3QuY29tLzIwMTEvMDYvZnhhYTMtc291cmNlLXJlbGVhc2VkLmh0bWxcbiAqIC0gV2ViR0wgcG9ydCBieSBAc3VwZXJlZ2diZXJ0XG4gKiBodHRwOi8vd3d3LmdsZ2Uub3JnL2RlbW9zL2Z4YWEvXG4gKi9cblxuVEhSRUUuRlhBQVNoYWRlciA9IHtcblxuXHR1bmlmb3Jtczoge1xuXG5cdFx0XCJ0RGlmZnVzZVwiOiAgIHsgdHlwZTogXCJ0XCIsIHZhbHVlOiBudWxsIH0sXG5cdFx0XCJyZXNvbHV0aW9uXCI6IHsgdHlwZTogXCJ2MlwiLCB2YWx1ZTogbmV3IFRIUkVFLlZlY3RvcjIoIDEgLyAxMDI0LCAxIC8gNTEyICkgIH1cblxuXHR9LFxuXG5cdHZlcnRleFNoYWRlcjogW1xuXG5cdFx0XCJ2YXJ5aW5nIHZlYzIgdlV2O1wiLFxuXG5cdFx0XCJ2b2lkIG1haW4oKSB7XCIsXG5cblx0XHRcdFwidlV2ID0gdXY7XCIsXG5cdFx0XHRcImdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQoIHBvc2l0aW9uLCAxLjAgKTtcIixcblxuXHRcdFwifVwiXG5cblx0XS5qb2luKFwiXFxuXCIpLFxuXG5cdGZyYWdtZW50U2hhZGVyOiBbXG5cblx0XHRcInVuaWZvcm0gc2FtcGxlcjJEIHREaWZmdXNlO1wiLFxuXHRcdFwidW5pZm9ybSB2ZWMyIHJlc29sdXRpb247XCIsXG5cblx0XHRcInZhcnlpbmcgdmVjMiB2VXY7XCIsXG5cblx0XHRcIiNkZWZpbmUgRlhBQV9SRURVQ0VfTUlOICAgKDEuMC8xMjguMClcIixcblx0XHRcIiNkZWZpbmUgRlhBQV9SRURVQ0VfTVVMICAgKDEuMC84LjApXCIsXG5cdFx0XCIjZGVmaW5lIEZYQUFfU1BBTl9NQVggICAgIDguMFwiLFxuXG5cdFx0XCJ2b2lkIG1haW4oKSB7XCIsXG5cblx0XHRcdFwidmVjMyByZ2JOVyA9IHRleHR1cmUyRCggdERpZmZ1c2UsICggZ2xfRnJhZ0Nvb3JkLnh5ICsgdmVjMiggLTEuMCwgLTEuMCApICkgKiByZXNvbHV0aW9uICkueHl6O1wiLFxuXHRcdFx0XCJ2ZWMzIHJnYk5FID0gdGV4dHVyZTJEKCB0RGlmZnVzZSwgKCBnbF9GcmFnQ29vcmQueHkgKyB2ZWMyKCAxLjAsIC0xLjAgKSApICogcmVzb2x1dGlvbiApLnh5ejtcIixcblx0XHRcdFwidmVjMyByZ2JTVyA9IHRleHR1cmUyRCggdERpZmZ1c2UsICggZ2xfRnJhZ0Nvb3JkLnh5ICsgdmVjMiggLTEuMCwgMS4wICkgKSAqIHJlc29sdXRpb24gKS54eXo7XCIsXG5cdFx0XHRcInZlYzMgcmdiU0UgPSB0ZXh0dXJlMkQoIHREaWZmdXNlLCAoIGdsX0ZyYWdDb29yZC54eSArIHZlYzIoIDEuMCwgMS4wICkgKSAqIHJlc29sdXRpb24gKS54eXo7XCIsXG5cdFx0XHRcInZlYzQgcmdiYU0gID0gdGV4dHVyZTJEKCB0RGlmZnVzZSwgIGdsX0ZyYWdDb29yZC54eSAgKiByZXNvbHV0aW9uICk7XCIsXG5cdFx0XHRcInZlYzMgcmdiTSAgPSByZ2JhTS54eXo7XCIsXG5cdFx0XHRcInZlYzMgbHVtYSA9IHZlYzMoIDAuMjk5LCAwLjU4NywgMC4xMTQgKTtcIixcblxuXHRcdFx0XCJmbG9hdCBsdW1hTlcgPSBkb3QoIHJnYk5XLCBsdW1hICk7XCIsXG5cdFx0XHRcImZsb2F0IGx1bWFORSA9IGRvdCggcmdiTkUsIGx1bWEgKTtcIixcblx0XHRcdFwiZmxvYXQgbHVtYVNXID0gZG90KCByZ2JTVywgbHVtYSApO1wiLFxuXHRcdFx0XCJmbG9hdCBsdW1hU0UgPSBkb3QoIHJnYlNFLCBsdW1hICk7XCIsXG5cdFx0XHRcImZsb2F0IGx1bWFNICA9IGRvdCggcmdiTSwgIGx1bWEgKTtcIixcblx0XHRcdFwiZmxvYXQgbHVtYU1pbiA9IG1pbiggbHVtYU0sIG1pbiggbWluKCBsdW1hTlcsIGx1bWFORSApLCBtaW4oIGx1bWFTVywgbHVtYVNFICkgKSApO1wiLFxuXHRcdFx0XCJmbG9hdCBsdW1hTWF4ID0gbWF4KCBsdW1hTSwgbWF4KCBtYXgoIGx1bWFOVywgbHVtYU5FKSAsIG1heCggbHVtYVNXLCBsdW1hU0UgKSApICk7XCIsXG5cblx0XHRcdFwidmVjMiBkaXI7XCIsXG5cdFx0XHRcImRpci54ID0gLSgobHVtYU5XICsgbHVtYU5FKSAtIChsdW1hU1cgKyBsdW1hU0UpKTtcIixcblx0XHRcdFwiZGlyLnkgPSAgKChsdW1hTlcgKyBsdW1hU1cpIC0gKGx1bWFORSArIGx1bWFTRSkpO1wiLFxuXG5cdFx0XHRcImZsb2F0IGRpclJlZHVjZSA9IG1heCggKCBsdW1hTlcgKyBsdW1hTkUgKyBsdW1hU1cgKyBsdW1hU0UgKSAqICggMC4yNSAqIEZYQUFfUkVEVUNFX01VTCApLCBGWEFBX1JFRFVDRV9NSU4gKTtcIixcblxuXHRcdFx0XCJmbG9hdCByY3BEaXJNaW4gPSAxLjAgLyAoIG1pbiggYWJzKCBkaXIueCApLCBhYnMoIGRpci55ICkgKSArIGRpclJlZHVjZSApO1wiLFxuXHRcdFx0XCJkaXIgPSBtaW4oIHZlYzIoIEZYQUFfU1BBTl9NQVgsICBGWEFBX1NQQU5fTUFYKSxcIixcblx0XHRcdFx0ICBcIm1heCggdmVjMigtRlhBQV9TUEFOX01BWCwgLUZYQUFfU1BBTl9NQVgpLFwiLFxuXHRcdFx0XHRcdFx0XCJkaXIgKiByY3BEaXJNaW4pKSAqIHJlc29sdXRpb247XCIsXG5cdFx0XHRcInZlYzQgcmdiQSA9ICgxLjAvMi4wKSAqIChcIixcbiAgICAgICAgXHRcInRleHR1cmUyRCh0RGlmZnVzZSwgIGdsX0ZyYWdDb29yZC54eSAgKiByZXNvbHV0aW9uICsgZGlyICogKDEuMC8zLjAgLSAwLjUpKSArXCIsXG5cdFx0XHRcInRleHR1cmUyRCh0RGlmZnVzZSwgIGdsX0ZyYWdDb29yZC54eSAgKiByZXNvbHV0aW9uICsgZGlyICogKDIuMC8zLjAgLSAwLjUpKSk7XCIsXG4gICAgXHRcdFwidmVjNCByZ2JCID0gcmdiQSAqICgxLjAvMi4wKSArICgxLjAvNC4wKSAqIChcIixcblx0XHRcdFwidGV4dHVyZTJEKHREaWZmdXNlLCAgZ2xfRnJhZ0Nvb3JkLnh5ICAqIHJlc29sdXRpb24gKyBkaXIgKiAoMC4wLzMuMCAtIDAuNSkpICtcIixcbiAgICAgIFx0XHRcInRleHR1cmUyRCh0RGlmZnVzZSwgIGdsX0ZyYWdDb29yZC54eSAgKiByZXNvbHV0aW9uICsgZGlyICogKDMuMC8zLjAgLSAwLjUpKSk7XCIsXG4gICAgXHRcdFwiZmxvYXQgbHVtYUIgPSBkb3QocmdiQiwgdmVjNChsdW1hLCAwLjApKTtcIixcblxuXHRcdFx0XCJpZiAoICggbHVtYUIgPCBsdW1hTWluICkgfHwgKCBsdW1hQiA+IGx1bWFNYXggKSApIHtcIixcblxuXHRcdFx0XHRcImdsX0ZyYWdDb2xvciA9IHJnYkE7XCIsXG5cblx0XHRcdFwifSBlbHNlIHtcIixcblx0XHRcdFx0XCJnbF9GcmFnQ29sb3IgPSByZ2JCO1wiLFxuXG5cdFx0XHRcIn1cIixcblxuXHRcdFwifVwiXG5cblx0XS5qb2luKFwiXFxuXCIpXG5cbn07XG4iLCIvKipcbiAqIEBhdXRob3IgYWx0ZXJlZHEgLyBodHRwOi8vYWx0ZXJlZHF1YWxpYS5jb20vXG4gKlxuICogRmlsbSBncmFpbiAmIHNjYW5saW5lcyBzaGFkZXJcbiAqXG4gKiAtIHBvcnRlZCBmcm9tIEhMU0wgdG8gV2ViR0wgLyBHTFNMXG4gKiBodHRwOi8vd3d3LnRydWV2aXNpb24zZC5jb20vZm9ydW1zL3Nob3djYXNlL3N0YXRpY25vaXNlX2NvbG9yYmxhY2t3aGl0ZV9zY2FubGluZV9zaGFkZXJzLXQxODY5OC4wLmh0bWxcbiAqXG4gKiBTY3JlZW4gU3BhY2UgU3RhdGljIFBvc3Rwcm9jZXNzb3JcbiAqXG4gKiBQcm9kdWNlcyBhbiBhbmFsb2d1ZSBub2lzZSBvdmVybGF5IHNpbWlsYXIgdG8gYSBmaWxtIGdyYWluIC8gVFYgc3RhdGljXG4gKlxuICogT3JpZ2luYWwgaW1wbGVtZW50YXRpb24gYW5kIG5vaXNlIGFsZ29yaXRobVxuICogUGF0ICdIYXd0aG9ybmUnIFNoZWFyb25cbiAqXG4gKiBPcHRpbWl6ZWQgc2NhbmxpbmVzICsgbm9pc2UgdmVyc2lvbiB3aXRoIGludGVuc2l0eSBzY2FsaW5nXG4gKiBHZW9yZyAnTGV2aWF0aGFuJyBTdGVpbnJvaGRlclxuICpcbiAqIFRoaXMgdmVyc2lvbiBpcyBwcm92aWRlZCB1bmRlciBhIENyZWF0aXZlIENvbW1vbnMgQXR0cmlidXRpb24gMy4wIExpY2Vuc2VcbiAqIGh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzMuMC9cbiAqL1xuXG5USFJFRS5GaWxtU2hhZGVyID0ge1xuXG5cdHVuaWZvcm1zOiB7XG5cblx0XHRcInREaWZmdXNlXCI6ICAgeyB0eXBlOiBcInRcIiwgdmFsdWU6IG51bGwgfSxcblx0XHRcInRpbWVcIjogICAgICAgeyB0eXBlOiBcImZcIiwgdmFsdWU6IDAuMCB9LFxuXHRcdFwibkludGVuc2l0eVwiOiB7IHR5cGU6IFwiZlwiLCB2YWx1ZTogMC41IH0sXG5cdFx0XCJzSW50ZW5zaXR5XCI6IHsgdHlwZTogXCJmXCIsIHZhbHVlOiAwLjA1IH0sXG5cdFx0XCJzQ291bnRcIjogICAgIHsgdHlwZTogXCJmXCIsIHZhbHVlOiA0MDk2IH0sXG5cdFx0XCJncmF5c2NhbGVcIjogIHsgdHlwZTogXCJpXCIsIHZhbHVlOiAxIH1cblxuXHR9LFxuXG5cdHZlcnRleFNoYWRlcjogW1xuXG5cdFx0XCJ2YXJ5aW5nIHZlYzIgdlV2O1wiLFxuXG5cdFx0XCJ2b2lkIG1haW4oKSB7XCIsXG5cblx0XHRcdFwidlV2ID0gdXY7XCIsXG5cdFx0XHRcImdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQoIHBvc2l0aW9uLCAxLjAgKTtcIixcblxuXHRcdFwifVwiXG5cblx0XS5qb2luKFwiXFxuXCIpLFxuXG5cdGZyYWdtZW50U2hhZGVyOiBbXG5cblx0XHQvLyBjb250cm9sIHBhcmFtZXRlclxuXHRcdFwidW5pZm9ybSBmbG9hdCB0aW1lO1wiLFxuXG5cdFx0XCJ1bmlmb3JtIGJvb2wgZ3JheXNjYWxlO1wiLFxuXG5cdFx0Ly8gbm9pc2UgZWZmZWN0IGludGVuc2l0eSB2YWx1ZSAoMCA9IG5vIGVmZmVjdCwgMSA9IGZ1bGwgZWZmZWN0KVxuXHRcdFwidW5pZm9ybSBmbG9hdCBuSW50ZW5zaXR5O1wiLFxuXG5cdFx0Ly8gc2NhbmxpbmVzIGVmZmVjdCBpbnRlbnNpdHkgdmFsdWUgKDAgPSBubyBlZmZlY3QsIDEgPSBmdWxsIGVmZmVjdClcblx0XHRcInVuaWZvcm0gZmxvYXQgc0ludGVuc2l0eTtcIixcblxuXHRcdC8vIHNjYW5saW5lcyBlZmZlY3QgY291bnQgdmFsdWUgKDAgPSBubyBlZmZlY3QsIDQwOTYgPSBmdWxsIGVmZmVjdClcblx0XHRcInVuaWZvcm0gZmxvYXQgc0NvdW50O1wiLFxuXG5cdFx0XCJ1bmlmb3JtIHNhbXBsZXIyRCB0RGlmZnVzZTtcIixcblxuXHRcdFwidmFyeWluZyB2ZWMyIHZVdjtcIixcblxuXHRcdFwidm9pZCBtYWluKCkge1wiLFxuXG5cdFx0XHQvLyBzYW1wbGUgdGhlIHNvdXJjZVxuXHRcdFx0XCJ2ZWM0IGNUZXh0dXJlU2NyZWVuID0gdGV4dHVyZTJEKCB0RGlmZnVzZSwgdlV2ICk7XCIsXG5cblx0XHRcdC8vIG1ha2Ugc29tZSBub2lzZVxuXHRcdFx0XCJmbG9hdCB4ID0gdlV2LnggKiB2VXYueSAqIHRpbWUgKiAgMTAwMC4wO1wiLFxuXHRcdFx0XCJ4ID0gbW9kKCB4LCAxMy4wICkgKiBtb2QoIHgsIDEyMy4wICk7XCIsXG5cdFx0XHRcImZsb2F0IGR4ID0gbW9kKCB4LCAwLjAxICk7XCIsXG5cblx0XHRcdC8vIGFkZCBub2lzZVxuXHRcdFx0XCJ2ZWMzIGNSZXN1bHQgPSBjVGV4dHVyZVNjcmVlbi5yZ2IgKyBjVGV4dHVyZVNjcmVlbi5yZ2IgKiBjbGFtcCggMC4xICsgZHggKiAxMDAuMCwgMC4wLCAxLjAgKTtcIixcblxuXHRcdFx0Ly8gZ2V0IHVzIGEgc2luZSBhbmQgY29zaW5lXG5cdFx0XHRcInZlYzIgc2MgPSB2ZWMyKCBzaW4oIHZVdi55ICogc0NvdW50ICksIGNvcyggdlV2LnkgKiBzQ291bnQgKSApO1wiLFxuXG5cdFx0XHQvLyBhZGQgc2NhbmxpbmVzXG5cdFx0XHRcImNSZXN1bHQgKz0gY1RleHR1cmVTY3JlZW4ucmdiICogdmVjMyggc2MueCwgc2MueSwgc2MueCApICogc0ludGVuc2l0eTtcIixcblxuXHRcdFx0Ly8gaW50ZXJwb2xhdGUgYmV0d2VlbiBzb3VyY2UgYW5kIHJlc3VsdCBieSBpbnRlbnNpdHlcblx0XHRcdFwiY1Jlc3VsdCA9IGNUZXh0dXJlU2NyZWVuLnJnYiArIGNsYW1wKCBuSW50ZW5zaXR5LCAwLjAsMS4wICkgKiAoIGNSZXN1bHQgLSBjVGV4dHVyZVNjcmVlbi5yZ2IgKTtcIixcblxuXHRcdFx0Ly8gY29udmVydCB0byBncmF5c2NhbGUgaWYgZGVzaXJlZFxuXHRcdFx0XCJpZiggZ3JheXNjYWxlICkge1wiLFxuXG5cdFx0XHRcdFwiY1Jlc3VsdCA9IHZlYzMoIGNSZXN1bHQuciAqIDAuMyArIGNSZXN1bHQuZyAqIDAuNTkgKyBjUmVzdWx0LmIgKiAwLjExICk7XCIsXG5cblx0XHRcdFwifVwiLFxuXG5cdFx0XHRcImdsX0ZyYWdDb2xvciA9ICB2ZWM0KCBjUmVzdWx0LCBjVGV4dHVyZVNjcmVlbi5hICk7XCIsXG5cblx0XHRcIn1cIlxuXG5cdF0uam9pbihcIlxcblwiKVxuXG59O1xuIiwidmFyIHNvdW5kY2xvdWQgPSByZXF1aXJlKCdzb3VuZGNsb3VkLWJhZGdlJyk7XG52YXIgbXV0ZXIgPSByZXF1aXJlKCcuL211dGVyJyk7XG5cbnZhciBzb3VuZE9mZiA9IGZhbHNlO1xuXG52YXIgYXVkaW8gPSBudWxsO1xudmFyIGZldGNoQW5kUGxheVNvbmcgPSBudWxsO1xudmFyIHRpbWVzQ2FsbGVkU291bmRjbG91ZCA9IDA7XG5cbnZhciBNdXNpYyA9IGZ1bmN0aW9uKCBwb2VtLCBwcm9wZXJ0aWVzICkge1xuXG5cdGZldGNoQW5kUGxheVNvbmcgPSBmdW5jdGlvbigpIHtcblx0XHRcblx0XHR2YXIgY3VycmVudFRpbWUgPSArK3RpbWVzQ2FsbGVkU291bmRjbG91ZDtcblx0XHRcblx0XHRzb3VuZGNsb3VkKHtcblx0XHRcdFxuXHRcdFx0Y2xpZW50X2lkOiAnNjA1N2M5YWY4NjJiZjI0NWQ0YzQwMjE3OWUzMTdmNTInLFxuXHRcdFx0c29uZzogcHJvcGVydGllcy51cmwsXG5cdFx0XHRkYXJrOiBmYWxzZSxcblx0XHRcdGdldEZvbnRzOiBmYWxzZVxuXHRcdFx0XG5cdFx0fSwgZnVuY3Rpb24oIGVyciwgc3JjLCBkYXRhLCBkaXYgKSB7XG5cdFx0XHRcblx0XHRcdC8vTnVsbGlmeSBjYWxsYmFja3MgdGhhdCBhcmUgb3V0IG9mIG9yZGVyXG5cdFx0XHRpZiggY3VycmVudFRpbWUgIT09IHRpbWVzQ2FsbGVkU291bmRjbG91ZCApIHJldHVybjtcblx0XHRcdGlmKCBtdXRlci5tdXRlZCApIHJldHVybjtcblxuXHRcdFx0aWYoIGVyciApIHRocm93IGVycjtcblxuXHRcdFx0YXVkaW8gPSBuZXcgQXVkaW8oKTtcblx0XHRcdGF1ZGlvLnNyYyA9IHNyYztcblx0XHRcdGF1ZGlvLnBsYXkoKTtcblx0XHRcdGF1ZGlvLmxvb3AgPSB0cnVlO1xuXHRcdFx0YXVkaW8udm9sdW1lID0gcHJvcGVydGllcy52b2x1bWUgfHwgMC42O1xuXHRcdFxuXHRcdFx0JChhdWRpbykub24oJ2xvYWRlZG1ldGFkYXRhJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmKCBhdWRpbyApXHRhdWRpby5jdXJyZW50VGltZSA9IHByb3BlcnRpZXMuc3RhcnRUaW1lIHx8IDA7XG5cdFx0XHR9KTtcblx0XHRcblxuXHRcdH0pO1xuXHRcblx0XHRwb2VtLm9uKCdkZXN0cm95JywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcblx0XHRcdGlmKCBhdWRpbyApIHtcblx0XHRcdFx0YXVkaW8ucGF1c2UoKTtcblx0XHRcdFx0YXVkaW8gPSBudWxsO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQkKCcubnBtLXNjYi13aGl0ZScpLnJlbW92ZSgpO1xuXHRcdFx0XG5cdFx0fSk7XG5cdFx0XG5cdH07XG5cdFxuXHRpZiggIW11dGVyLm11dGVkICkge1xuXHRcdFxuXHRcdGZldGNoQW5kUGxheVNvbmcoKTtcblx0XHRmZXRjaEFuZFBsYXlTb25nID0gbnVsbDtcblx0XHRcblx0fVxuXHRcbn07XG5cbk11c2ljLnByb3RvdHlwZS5tdXRlZCA9IGZhbHNlO1xuXG5tdXRlci5vbignbXV0ZScsIGZ1bmN0aW9uIG11dGVNdXNpYyggZSApIHtcblxuXHRpZiggYXVkaW8gKSBhdWRpby5wYXVzZSgpO1xuXHRcblx0JCgnLm5wbS1zY2Itd2hpdGUnKS5oaWRlKCk7XG5cbn0pO1xuXG5tdXRlci5vbigndW5tdXRlJywgZnVuY3Rpb24gdW5tdXRlTXVzaWMoIGUgKSB7XG5cblx0aWYoIGF1ZGlvICkgYXVkaW8ucGxheSgpO1xuXG5cdGlmKCBmZXRjaEFuZFBsYXlTb25nICkge1xuXHRcdGZldGNoQW5kUGxheVNvbmcoKTtcblx0XHRmZXRjaEFuZFBsYXlTb25nID0gbnVsbDtcblx0fVxuXHRcblx0JCgnLm5wbS1zY2Itd2hpdGUnKS5zaG93KCk7XG5cdFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNdXNpYzsiLCJ2YXIgRXZlbnREaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vdXRpbHMvRXZlbnREaXNwYXRjaGVyJyk7XG52YXIgbG9jYWxmb3JhZ2UgPSByZXF1aXJlKCdsb2NhbGZvcmFnZScpO1xudmFyIG11dGVyO1xuXG52YXIgTXV0ZXIgPSBmdW5jdGlvbigpIHtcblx0XG5cdHRoaXMubXV0ZWQgPSB0cnVlO1xuXHRcblx0bG9jYWxmb3JhZ2UuZ2V0SXRlbSgnbXV0ZWQnLCBmdW5jdGlvbiggZXJyLCB2YWx1ZSApIHtcblxuXHRcdGlmKCBlcnIgfHwgdmFsdWUgPT09IG51bGwgKSB7XG5cdFx0XHR0aGlzLm11dGVkID0gZmFsc2U7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMubXV0ZWQgPSB2YWx1ZTtcblx0XHR9XG5cdFx0XG5cdFx0dGhpcy5kaXNwYXRjaENoYW5nZWQoKTtcblx0XHRcblx0fS5iaW5kKHRoaXMpKTtcblx0XG59O1xuXG5NdXRlci5wcm90b3R5cGUgPSB7XG5cdFxuXHRtdXRlIDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5tdXRlZCA9IHRydWU7XG5cdFx0dGhpcy5kaXNwYXRjaENoYW5nZWQoKTtcblx0XHR0aGlzLnNhdmUoKTtcblx0fSxcblx0XG5cdHVubXV0ZSA6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMubXV0ZWQgPSBmYWxzZTtcblx0XHR0aGlzLmRpc3BhdGNoQ2hhbmdlZCgpO1xuXHRcdHRoaXMuc2F2ZSgpO1xuXHR9LFxuXHRcblx0c2F2ZSA6IGZ1bmN0aW9uKCkge1xuXHRcdGxvY2FsZm9yYWdlLnNldEl0ZW0oICdtdXRlZCcsIHRoaXMubXV0ZWQgKTtcblx0fSxcblx0XG5cdGRpc3BhdGNoQ2hhbmdlZCA6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdGlmKCB0aGlzLm11dGVkICkge1xuXHRcdFx0bXV0ZXIuZGlzcGF0Y2goe1xuXHRcdFx0XHR0eXBlOiAnbXV0ZSdcblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0fSBlbHNlIHtcblx0XHRcdG11dGVyLmRpc3BhdGNoKHtcblx0XHRcdFx0dHlwZTogJ3VubXV0ZSdcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXHRcbn07XG5cbkV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUuYXBwbHkoIE11dGVyLnByb3RvdHlwZSApO1xuXG5tdXRlciA9IG5ldyBNdXRlcigpO1xuXG4kKHdpbmRvdykub24oJ2tleWRvd24nLCBmdW5jdGlvbiBtdXRlQXVkaW9PbkhpdHRpbmdTKCBlICkge1xuXHRcblx0aWYoIGUua2V5Q29kZSAhPT0gODMgKSByZXR1cm47XG5cdFxuXHRpZiggbXV0ZXIubXV0ZWQgKSB7XG5cdFx0bXV0ZXIudW5tdXRlKCk7XG5cdH0gZWxzZSB7XG5cdFx0bXV0ZXIubXV0ZSgpO1xuXHR9XG5cdFxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbXV0ZXI7XG4iLCJ2YXIgbWVudSA9IHJlcXVpcmUoJy4vbWVudScpO1xudmFyIG11dGUgPSByZXF1aXJlKCcuL211dGUnKTtcbnZhciBtZW51TGV2ZWxzID0gcmVxdWlyZSgnLi9tZW51TGV2ZWxzJyk7XG5cbmpRdWVyeShmdW5jdGlvbigkKSB7XG5cdFxuXHRtZW51LnNldEhhbmRsZXJzKCk7XG5cdG11dGUuc2V0SGFuZGxlcnMoKTtcblx0XG59KTsiLCJ2YXJcdEV2ZW50RGlzcGF0Y2hlclx0PSByZXF1aXJlKCcuLi91dGlscy9FdmVudERpc3BhdGNoZXInKTtcbnZhclx0cm91dGluZ1x0XHRcdD0gcmVxdWlyZSgnLi4vcm91dGluZycpO1xuXG52YXIgcG9lbTtcbnZhciBpc09wZW4gPSBmYWxzZTtcbnZhciAkYm9keTtcblxucm91dGluZy5vbiggJ25ld0xldmVsJywgZnVuY3Rpb24oIGUgKSB7XG5cblx0cG9lbSA9IGUucG9lbTtcblx0XG59KTtcblxuXG52YXIgbWVudSA9IHtcblx0XG5cdHNldEhhbmRsZXJzIDogZnVuY3Rpb24oKSB7XG5cdFx0XG5cdFx0JGJvZHkgPSAkKCdib2R5Jyk7XG5cdFx0XG5cdFx0JCgnI21lbnUgYSwgI2NvbnRhaW5lci1ibG9ja2VyJykuY2xpY2soIG1lbnUuY2xvc2UgKTtcblx0XHRcblx0XHQkKCcjbWVudS1idXR0b24nKS5vZmYoKS5jbGljayggdGhpcy50b2dnbGUgKTtcblx0XHRcblx0XHRyb3V0aW5nLm9uKCAnbmV3TGV2ZWwnLCBtZW51LmNsb3NlICk7XG5cdFx0XG5cdFx0JCh3aW5kb3cpLm9uKCdrZXlkb3duJywgZnVuY3Rpb24gdG9nZ2xlTWVudUhhbmRsZXIoIGUgKSB7XG5cdFxuXHRcdFx0aWYoIGUua2V5Q29kZSAhPT0gMjcgKSByZXR1cm47XG5cdFx0XHRtZW51LnRvZ2dsZShlKTtcblx0XG5cdFx0fSk7XG5cdFx0XG5cdFx0XG5cdH0sXG5cdFx0XG5cdHRvZ2dsZSA6IGZ1bmN0aW9uKCBlICkge1xuXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFxuXHRcdGlmKCBpc09wZW4gKSB7XG5cdFx0XHRtZW51LmNsb3NlKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG1lbnUub3BlbigpO1xuXHRcdH1cblx0XHRcblx0XHRpc09wZW4gPSAhaXNPcGVuO1xuXHRcdFxuXHR9LFxuXHRcblx0Y2xvc2UgOiBmdW5jdGlvbigpIHtcblx0XHQkYm9keS5yZW1vdmVDbGFzcygnbWVudS1vcGVuJyk7XG5cdFx0aWYoIHBvZW0gKSBwb2VtLnN0YXJ0KCk7XG5cdH0sXG5cdFxuXHRvcGVuIDogZnVuY3Rpb24oKSB7XG5cdFx0JGJvZHkuYWRkQ2xhc3MoJ21lbnUtb3BlbicpO1xuXHRcdGlmKCBwb2VtICkgcG9lbS5wYXVzZSgpO1xuXHR9XG5cdFxufTtcblxuRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5hcHBseSggbWVudSApO1xubW9kdWxlLmV4cG9ydHMgPSBtZW51OyIsInZhciBsZXZlbEtleVBhaXJzID0gKGZ1bmN0aW9uIHNvcnRBbmRGaWx0ZXJMZXZlbHMoIGxldmVscyApIHtcblx0XHRcblx0cmV0dXJuIF8uY2hhaW4obGV2ZWxzKVxuXHRcdC5wYWlycygpXG5cdFx0Ly8gLmZpbHRlcihmdW5jdGlvbigga2V5cGFpciApIHtcblx0XHQvLyBcdHJldHVybiBrZXlwYWlyWzFdLm9yZGVyO1xuXHRcdC8vIH0pXG5cdFx0LnNvcnRCeShmdW5jdGlvbigga2V5cGFpciApIHtcblx0XHRcdHJldHVybiBrZXlwYWlyWzFdLm9yZGVyO1xuXHRcdH0pXG5cdC52YWx1ZSgpO1xuXHRcbn0pKCByZXF1aXJlKCcuLi8uLi9tYW5pZmVzdHMnKSApO1xuXG5mdW5jdGlvbiByZWFjdGl2ZUxldmVscyggJHNjb3BlLCB0ZW1wbGF0ZSApIHtcblx0XG5cdCRzY29wZS5jaGlsZHJlbigpLnJlbW92ZSgpO1xuXHRcblx0dmFyIHRlbXBsYXRlRGF0YSA9IF8ubWFwKCBsZXZlbEtleVBhaXJzLCBmdW5jdGlvbigga2V5cGFpciApIHtcblx0XHRcblx0XHR2YXIgc2x1ZyA9IGtleXBhaXJbMF07XG5cdFx0dmFyIGxldmVsID0ga2V5cGFpclsxXTtcblx0XHRcblx0XHRyZXR1cm4ge1xuXHRcdFx0bmFtZSA6IGxldmVsLm5hbWUsXG5cdFx0XHRkZXNjcmlwdGlvbiA6IGxldmVsLmRlc2NyaXB0aW9uLFxuXHRcdFx0c2x1ZyA6IHNsdWdcblx0XHR9O1xuXHRcdFxuXHR9KTtcblx0XG5cdCRzY29wZS5hcHBlbmQoIF8ucmVkdWNlKCB0ZW1wbGF0ZURhdGEsIGZ1bmN0aW9uKCBtZW1vLCB0ZXh0KSB7XG5cdFx0XG5cdFx0cmV0dXJuIG1lbW8gKyB0ZW1wbGF0ZSggdGV4dCApO1xuXHRcdFxuXHR9LCBcIlwiKSApO1xufVxuXG4oZnVuY3Rpb24gaW5pdCgpIHtcblx0XG5cdHZhciB0ZW1wbGF0ZSA9IF8udGVtcGxhdGUoICQoJyNtZW51LWxldmVsLXRlbXBsYXRlJykudGV4dCgpICk7XG5cdHZhciAkc2NvcGUgPSAkKCcjbWVudS1sZXZlbHMnKTtcblx0XG5cdGZ1bmN0aW9uIHVwZGF0ZVJlYWN0aXZlTGV2ZWxzKCkge1xuXHRcdHJlYWN0aXZlTGV2ZWxzKCAkc2NvcGUsIHRlbXBsYXRlICk7XG5cdH1cblx0XG5cdHVwZGF0ZVJlYWN0aXZlTGV2ZWxzKCk7XG5cdFxufSkoKTtcbiIsInZhciBtdXRlciA9IHJlcXVpcmUoJy4uL3NvdW5kL211dGVyJyk7XG5cbnZhciBtdXRlZFNyYyA9ICdhc3NldHMvaW1hZ2VzL3NvdW5kLW11dGUucG5nJztcbnZhciB1bk11dGVkU3JjID0gJ2Fzc2V0cy9pbWFnZXMvc291bmQtdW5tdXRlLnBuZyc7XG52YXIgbXV0ZWRTcmNIb3ZlciA9ICdhc3NldHMvaW1hZ2VzL3NvdW5kLW11dGUtaG92ZXIucG5nJztcbnZhciB1bk11dGVkU3JjSG92ZXIgPSAnYXNzZXRzL2ltYWdlcy9zb3VuZC11bm11dGUtaG92ZXIucG5nJztcblxubmV3IEltYWdlKCkuc3JjID0gbXV0ZWRTcmM7XG5uZXcgSW1hZ2UoKS5zcmMgPSB1bk11dGVkU3JjO1xubmV3IEltYWdlKCkuc3JjID0gbXV0ZWRTcmNIb3Zlcjtcbm5ldyBJbWFnZSgpLnNyYyA9IHVuTXV0ZWRTcmNIb3ZlcjtcblxuXG52YXIgJG11dGU7XG52YXIgJGltZztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdFxuXHRzZXRIYW5kbGVycyA6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdCRtdXRlID0gJCgnI211dGUnKTtcblx0XHQkaW1nID0gJG11dGUuZmluZCgnaW1nJyk7XG5cdFx0XG5cdFx0bXV0ZXIub24oJ211dGUnLCBmdW5jdGlvbigpIHtcblx0XHRcdCRpbWcuYXR0ciggJ3NyYycsIG11dGVkU3JjICk7XG5cdFx0fSk7XG5cdFx0XG5cdFx0bXV0ZXIub24oJ3VubXV0ZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0JGltZy5hdHRyKCAnc3JjJywgdW5NdXRlZFNyYyApO1xuXHRcdH0pO1xuXHRcdFxuXHRcdCRpbWcuYXR0ciggJ3NyYycsIG11dGVyLm11dGVkID8gbXV0ZWRTcmMgOiB1bk11dGVkU3JjICk7XG5cdFx0XG5cdFx0JG11dGUub2ZmKCkuY2xpY2soIGZ1bmN0aW9uKCBlICkge1xuXHRcdFx0XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XG5cdFx0XHRpZiggbXV0ZXIubXV0ZWQgKSB7XG5cdFx0XHRcblx0XHRcdFx0JGltZy5hdHRyKCdzcmMnLCB1bk11dGVkU3JjSG92ZXIpO1xuXHRcdFx0XHRtdXRlci51bm11dGUoKTtcblx0XHRcdFxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFxuXHRcdFx0XHQkaW1nLmF0dHIoJ3NyYycsIG11dGVkU3JjSG92ZXIpO1xuXHRcdFx0XHRtdXRlci5tdXRlKCk7XG5cdFx0XHRcblx0XHRcdH1cblx0XHRcdGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG5cdFx0XG5cdFx0fSk7XG5cblx0XHQkbXV0ZS5vbignbW91c2VvdmVyJywgZnVuY3Rpb24oIGUgKSB7XG5cdFx0XHRcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcblx0XHRcdGlmKCBtdXRlci5tdXRlZCApIHtcblx0XHRcdFx0JGltZy5hdHRyKCdzcmMnLCBtdXRlZFNyY0hvdmVyKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCRpbWcuYXR0cignc3JjJywgdW5NdXRlZFNyY0hvdmVyKTtcblx0XHRcdH1cblx0XHRcblx0XHR9KTtcblx0XHRcblx0XHQkbXV0ZS5vbignbW91c2VvdXQnLCBmdW5jdGlvbiggZSApIHtcblx0XHRcdFxuXHRcdFx0aWYoIG11dGVyLm11dGVkICkge1xuXHRcdFx0XHQkaW1nLmF0dHIoJ3NyYycsIG11dGVkU3JjKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCRpbWcuYXR0cignc3JjJywgdW5NdXRlZFNyYyk7XG5cdFx0XHR9XHRcdFxuXHRcdH0pO1xuXHRcdFxuXHR9XG5cdFxufTsiLCJ2YXIgQ2xvY2sgPSBmdW5jdGlvbiggYXV0b3N0YXJ0ICkge1xuXG5cdHRoaXMubWF4RHQgPSA2MDtcblx0dGhpcy5taW5EdCA9IDE2O1xuXHR0aGlzLnBUaW1lID0gMDtcblx0dGhpcy50aW1lID0gMDtcblx0XG5cdGlmKGF1dG9zdGFydCAhPT0gZmFsc2UpIHtcblx0XHR0aGlzLnN0YXJ0KCk7XG5cdH1cblx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENsb2NrO1xuXG5DbG9jay5wcm90b3R5cGUgPSB7XG5cblx0c3RhcnQgOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnBUaW1lID0gRGF0ZS5ub3coKTtcblx0fSxcblx0XG5cdGdldERlbHRhIDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG5vdywgZHQ7XG5cdFx0XG5cdFx0bm93ID0gRGF0ZS5ub3coKTtcblx0XHRkdCA9IG5vdyAtIHRoaXMucFRpbWU7XG5cdFx0XG5cdFx0ZHQgPSBNYXRoLm1pbiggZHQsIHRoaXMubWF4RHQgKTtcblx0XHRkdCA9IE1hdGgubWF4KCBkdCwgdGhpcy5taW5EdCApO1xuXHRcdFxuXHRcdHRoaXMudGltZSArPSBkdDtcblx0XHR0aGlzLnBUaW1lID0gbm93O1xuXHRcdFxuXHRcdHJldHVybiBkdDtcblx0fVxuXHRcbn07IiwiLyoqXG4gKiBAYXV0aG9yIG1yZG9vYiAvIGh0dHA6Ly9tcmRvb2IuY29tL1xuICpcbiAqIE1vZGlmaWNhdGlvbnM6IEdyZWcgVGF0dW1cbiAqXG4gKiB1c2FnZTpcbiAqIFxuICogXHRcdEV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUuYXBwbHkoIE15T2JqZWN0LnByb3RvdHlwZSApO1xuICogXG4gKiBcdFx0TXlPYmplY3QuZGlzcGF0Y2goe1xuICogXHRcdFx0dHlwZTogXCJjbGlja1wiLFxuICogXHRcdFx0ZGF0dW0xOiBcImZvb1wiLFxuICogXHRcdFx0ZGF0dW0yOiBcImJhclwiXG4gKiBcdFx0fSk7XG4gKiBcbiAqIFx0XHRNeU9iamVjdC5vbiggXCJjbGlja1wiLCBmdW5jdGlvbiggZXZlbnQgKSB7XG4gKiBcdFx0XHRldmVudC5kYXR1bTE7IC8vRm9vXG4gKiBcdFx0XHRldmVudC50YXJnZXQ7IC8vTXlPYmplY3RcbiAqIFx0XHR9KTtcbiAqIFxuICpcbiAqL1xuXG52YXIgRXZlbnREaXNwYXRjaGVyID0gZnVuY3Rpb24gKCkge307XG5cbkV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUgPSB7XG5cblx0Y29uc3RydWN0b3I6IEV2ZW50RGlzcGF0Y2hlcixcblxuXHRhcHBseTogZnVuY3Rpb24gKCBvYmplY3QgKSB7XG5cblx0XHRvYmplY3Qub25cdFx0XHRcdFx0PSBFdmVudERpc3BhdGNoZXIucHJvdG90eXBlLm9uO1xuXHRcdG9iamVjdC5oYXNFdmVudExpc3RlbmVyXHRcdD0gRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5oYXNFdmVudExpc3RlbmVyO1xuXHRcdG9iamVjdC5vZmZcdFx0XHRcdFx0PSBFdmVudERpc3BhdGNoZXIucHJvdG90eXBlLm9mZjtcblx0XHRvYmplY3QuZGlzcGF0Y2hcdFx0XHRcdD0gRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5kaXNwYXRjaDtcblxuXHR9LFxuXG5cdG9uOiBmdW5jdGlvbiAoIHR5cGUsIGxpc3RlbmVyICkge1xuXG5cdFx0aWYgKCB0aGlzLl9saXN0ZW5lcnMgPT09IHVuZGVmaW5lZCApIHRoaXMuX2xpc3RlbmVycyA9IHt9O1xuXG5cdFx0dmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcblxuXHRcdGlmICggbGlzdGVuZXJzWyB0eXBlIF0gPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0bGlzdGVuZXJzWyB0eXBlIF0gPSBbXTtcblxuXHRcdH1cblxuXHRcdGlmICggbGlzdGVuZXJzWyB0eXBlIF0uaW5kZXhPZiggbGlzdGVuZXIgKSA9PT0gLSAxICkge1xuXG5cdFx0XHRsaXN0ZW5lcnNbIHR5cGUgXS5wdXNoKCBsaXN0ZW5lciApO1xuXG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBsaXN0ZW5lcjtcblxuXHR9LFxuXG5cdGhhc0V2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uICggdHlwZSwgbGlzdGVuZXIgKSB7XG5cblx0XHRpZiAoIHRoaXMuX2xpc3RlbmVycyA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIGZhbHNlO1xuXG5cdFx0dmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcblxuXHRcdGlmICggbGlzdGVuZXJzWyB0eXBlIF0gIT09IHVuZGVmaW5lZCAmJiBsaXN0ZW5lcnNbIHR5cGUgXS5pbmRleE9mKCBsaXN0ZW5lciApICE9PSAtIDEgKSB7XG5cblx0XHRcdHJldHVybiB0cnVlO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXG5cdH0sXG5cblx0b2ZmOiBmdW5jdGlvbiAoIHR5cGUsIGxpc3RlbmVyICkge1xuXG5cdFx0aWYgKCB0aGlzLl9saXN0ZW5lcnMgPT09IHVuZGVmaW5lZCApIHJldHVybjtcblxuXHRcdHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cdFx0dmFyIGxpc3RlbmVyQXJyYXkgPSBsaXN0ZW5lcnNbIHR5cGUgXTtcblxuXHRcdGlmICggbGlzdGVuZXJBcnJheSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHR2YXIgaW5kZXggPSBsaXN0ZW5lckFycmF5LmluZGV4T2YoIGxpc3RlbmVyICk7XG5cblx0XHRcdGlmICggaW5kZXggIT09IC0gMSApIHtcblxuXHRcdFx0XHRsaXN0ZW5lckFycmF5LnNwbGljZSggaW5kZXgsIDEgKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH0sXG5cblx0ZGlzcGF0Y2g6IGZ1bmN0aW9uICggZXZlbnQgKSB7XG5cdFx0XHRcblx0XHRpZiAoIHRoaXMuX2xpc3RlbmVycyA9PT0gdW5kZWZpbmVkICkgcmV0dXJuO1xuXG5cdFx0dmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcblx0XHR2YXIgbGlzdGVuZXJBcnJheSA9IGxpc3RlbmVyc1sgZXZlbnQudHlwZSBdO1xuXG5cdFx0aWYgKCBsaXN0ZW5lckFycmF5ICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGV2ZW50LnRhcmdldCA9IHRoaXM7XG5cblx0XHRcdHZhciBhcnJheSA9IFtdO1xuXHRcdFx0dmFyIGxlbmd0aCA9IGxpc3RlbmVyQXJyYXkubGVuZ3RoO1xuXHRcdFx0dmFyIGk7XG5cblx0XHRcdGZvciAoIGkgPSAwOyBpIDwgbGVuZ3RoOyBpICsrICkge1xuXG5cdFx0XHRcdGFycmF5WyBpIF0gPSBsaXN0ZW5lckFycmF5WyBpIF07XG5cblx0XHRcdH1cblxuXHRcdFx0Zm9yICggaSA9IDA7IGkgPCBsZW5ndGg7IGkgKysgKSB7XG5cblx0XHRcdFx0YXJyYXlbIGkgXS5jYWxsKCB0aGlzLCBldmVudCApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fVxuXG59O1xuXG5pZiAoIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICkge1xuXG5cdG1vZHVsZS5leHBvcnRzID0gRXZlbnREaXNwYXRjaGVyO1xuXG59IiwiLyoqXG4gKiBAYXV0aG9yIG1yZG9vYiAvIGh0dHA6Ly9tcmRvb2IuY29tL1xuICovXG5cbnZhciBTdGF0cyA9IGZ1bmN0aW9uICgpIHtcblxuXHR2YXIgc3RhcnRUaW1lID0gRGF0ZS5ub3coKSwgcHJldlRpbWUgPSBzdGFydFRpbWU7XG5cdHZhciBtcyA9IDAsIG1zTWluID0gSW5maW5pdHksIG1zTWF4ID0gMDtcblx0dmFyIGZwcyA9IDAsIGZwc01pbiA9IEluZmluaXR5LCBmcHNNYXggPSAwO1xuXHR2YXIgZnJhbWVzID0gMCwgbW9kZSA9IDA7XG5cblx0dmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdGNvbnRhaW5lci5pZCA9ICdzdGF0cyc7XG5cdGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgZnVuY3Rpb24gKCBldmVudCApIHsgZXZlbnQucHJldmVudERlZmF1bHQoKTsgc2V0TW9kZSggKysgbW9kZSAlIDIgKTsgfSwgZmFsc2UgKTtcblx0Y29udGFpbmVyLnN0eWxlLmNzc1RleHQgPSAnd2lkdGg6ODBweDtvcGFjaXR5OjAuOTtjdXJzb3I6cG9pbnRlcic7XG5cblx0dmFyIGZwc0RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdGZwc0Rpdi5pZCA9ICdmcHMnO1xuXHRmcHNEaXYuc3R5bGUuY3NzVGV4dCA9ICdwYWRkaW5nOjAgMCAzcHggM3B4O3RleHQtYWxpZ246bGVmdDtiYWNrZ3JvdW5kLWNvbG9yOiMwMDInO1xuXHRjb250YWluZXIuYXBwZW5kQ2hpbGQoIGZwc0RpdiApO1xuXG5cdHZhciBmcHNUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblx0ZnBzVGV4dC5pZCA9ICdmcHNUZXh0Jztcblx0ZnBzVGV4dC5zdHlsZS5jc3NUZXh0ID0gJ2NvbG9yOiMwZmY7Zm9udC1mYW1pbHk6SGVsdmV0aWNhLEFyaWFsLHNhbnMtc2VyaWY7Zm9udC1zaXplOjlweDtmb250LXdlaWdodDpib2xkO2xpbmUtaGVpZ2h0OjE1cHgnO1xuXHRmcHNUZXh0LmlubmVySFRNTCA9ICdGUFMnO1xuXHRmcHNEaXYuYXBwZW5kQ2hpbGQoIGZwc1RleHQgKTtcblxuXHR2YXIgZnBzR3JhcGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuXHRmcHNHcmFwaC5pZCA9ICdmcHNHcmFwaCc7XG5cdGZwc0dyYXBoLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246cmVsYXRpdmU7d2lkdGg6NzRweDtoZWlnaHQ6MzBweDtiYWNrZ3JvdW5kLWNvbG9yOiMwZmYnO1xuXHRmcHNEaXYuYXBwZW5kQ2hpbGQoIGZwc0dyYXBoICk7XG5cblx0d2hpbGUgKCBmcHNHcmFwaC5jaGlsZHJlbi5sZW5ndGggPCA3NCApIHtcblxuXHRcdHZhciBiYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnc3BhbicgKTtcblx0XHRiYXIuc3R5bGUuY3NzVGV4dCA9ICd3aWR0aDoxcHg7aGVpZ2h0OjMwcHg7ZmxvYXQ6bGVmdDtiYWNrZ3JvdW5kLWNvbG9yOiMxMTMnO1xuXHRcdGZwc0dyYXBoLmFwcGVuZENoaWxkKCBiYXIgKTtcblxuXHR9XG5cblx0dmFyIG1zRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblx0bXNEaXYuaWQgPSAnbXMnO1xuXHRtc0Rpdi5zdHlsZS5jc3NUZXh0ID0gJ3BhZGRpbmc6MCAwIDNweCAzcHg7dGV4dC1hbGlnbjpsZWZ0O2JhY2tncm91bmQtY29sb3I6IzAyMDtkaXNwbGF5Om5vbmUnO1xuXHRjb250YWluZXIuYXBwZW5kQ2hpbGQoIG1zRGl2ICk7XG5cblx0dmFyIG1zVGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdG1zVGV4dC5pZCA9ICdtc1RleHQnO1xuXHRtc1RleHQuc3R5bGUuY3NzVGV4dCA9ICdjb2xvcjojMGYwO2ZvbnQtZmFtaWx5OkhlbHZldGljYSxBcmlhbCxzYW5zLXNlcmlmO2ZvbnQtc2l6ZTo5cHg7Zm9udC13ZWlnaHQ6Ym9sZDtsaW5lLWhlaWdodDoxNXB4Jztcblx0bXNUZXh0LmlubmVySFRNTCA9ICdNUyc7XG5cdG1zRGl2LmFwcGVuZENoaWxkKCBtc1RleHQgKTtcblxuXHR2YXIgbXNHcmFwaCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdG1zR3JhcGguaWQgPSAnbXNHcmFwaCc7XG5cdG1zR3JhcGguc3R5bGUuY3NzVGV4dCA9ICdwb3NpdGlvbjpyZWxhdGl2ZTt3aWR0aDo3NHB4O2hlaWdodDozMHB4O2JhY2tncm91bmQtY29sb3I6IzBmMCc7XG5cdG1zRGl2LmFwcGVuZENoaWxkKCBtc0dyYXBoICk7XG5cblx0d2hpbGUgKCBtc0dyYXBoLmNoaWxkcmVuLmxlbmd0aCA8IDc0ICkge1xuXG5cdFx0dmFyIGJhcjIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnc3BhbicgKTtcblx0XHRiYXIyLnN0eWxlLmNzc1RleHQgPSAnd2lkdGg6MXB4O2hlaWdodDozMHB4O2Zsb2F0OmxlZnQ7YmFja2dyb3VuZC1jb2xvcjojMTMxJztcblx0XHRtc0dyYXBoLmFwcGVuZENoaWxkKCBiYXIyICk7XG5cblx0fVxuXG5cdHZhciBzZXRNb2RlID0gZnVuY3Rpb24gKCB2YWx1ZSApIHtcblxuXHRcdG1vZGUgPSB2YWx1ZTtcblxuXHRcdHN3aXRjaCAoIG1vZGUgKSB7XG5cblx0XHRcdGNhc2UgMDpcblx0XHRcdFx0ZnBzRGl2LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0XHRtc0Rpdi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0ZnBzRGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cdFx0XHRcdG1zRGl2LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0fTtcblxuXHR2YXIgdXBkYXRlR3JhcGggPSBmdW5jdGlvbiAoIGRvbSwgdmFsdWUgKSB7XG5cblx0XHR2YXIgY2hpbGQgPSBkb20uYXBwZW5kQ2hpbGQoIGRvbS5maXJzdENoaWxkICk7XG5cdFx0Y2hpbGQuc3R5bGUuaGVpZ2h0ID0gdmFsdWUgKyAncHgnO1xuXG5cdH07XG5cblx0cmV0dXJuIHtcblxuXHRcdFJFVklTSU9OOiAxMixcblxuXHRcdGRvbUVsZW1lbnQ6IGNvbnRhaW5lcixcblxuXHRcdHNldE1vZGU6IHNldE1vZGUsXG5cblx0XHRiZWdpbjogZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuXG5cdFx0fSxcblxuXHRcdGVuZDogZnVuY3Rpb24gKCkge1xuXG5cdFx0XHR2YXIgdGltZSA9IERhdGUubm93KCk7XG5cblx0XHRcdG1zID0gdGltZSAtIHN0YXJ0VGltZTtcblx0XHRcdG1zTWluID0gTWF0aC5taW4oIG1zTWluLCBtcyApO1xuXHRcdFx0bXNNYXggPSBNYXRoLm1heCggbXNNYXgsIG1zICk7XG5cblx0XHRcdG1zVGV4dC50ZXh0Q29udGVudCA9IG1zICsgJyBNUyAoJyArIG1zTWluICsgJy0nICsgbXNNYXggKyAnKSc7XG5cdFx0XHR1cGRhdGVHcmFwaCggbXNHcmFwaCwgTWF0aC5taW4oIDMwLCAzMCAtICggbXMgLyAyMDAgKSAqIDMwICkgKTtcblxuXHRcdFx0ZnJhbWVzICsrO1xuXG5cdFx0XHRpZiAoIHRpbWUgPiBwcmV2VGltZSArIDEwMDAgKSB7XG5cblx0XHRcdFx0ZnBzID0gTWF0aC5yb3VuZCggKCBmcmFtZXMgKiAxMDAwICkgLyAoIHRpbWUgLSBwcmV2VGltZSApICk7XG5cdFx0XHRcdGZwc01pbiA9IE1hdGgubWluKCBmcHNNaW4sIGZwcyApO1xuXHRcdFx0XHRmcHNNYXggPSBNYXRoLm1heCggZnBzTWF4LCBmcHMgKTtcblxuXHRcdFx0XHRmcHNUZXh0LnRleHRDb250ZW50ID0gZnBzICsgJyBGUFMgKCcgKyBmcHNNaW4gKyAnLScgKyBmcHNNYXggKyAnKSc7XG5cdFx0XHRcdHVwZGF0ZUdyYXBoKCBmcHNHcmFwaCwgTWF0aC5taW4oIDMwLCAzMCAtICggZnBzIC8gMTAwICkgKiAzMCApICk7XG5cblx0XHRcdFx0cHJldlRpbWUgPSB0aW1lO1xuXHRcdFx0XHRmcmFtZXMgPSAwO1xuXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aW1lO1xuXG5cdFx0fSxcblxuXHRcdHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRzdGFydFRpbWUgPSB0aGlzLmVuZCgpO1xuXG5cdFx0fVxuXG5cdH07XG5cbn07XG5cbmlmICggdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgKSB7XG5cblx0bW9kdWxlLmV4cG9ydHMgPSBTdGF0cztcblxufSIsImZ1bmN0aW9uIHJvdW5kVG8oIHZhbHVlLCBkZWNpbWFsUGxhY2VzICkge1xuXHRcblx0aWYoIHR5cGVvZiBkZWNpbWFsUGxhY2VzID09PSBcIm51bWJlclwiICkge1xuXG5cdFx0cmV0dXJuIE1hdGgucm91bmQoIE1hdGgucG93KDEwLCBkZWNpbWFsUGxhY2VzKSAqIHZhbHVlICkgLyBNYXRoLnBvdygxMCwgZGVjaW1hbFBsYWNlcyk7XG5cblx0fSBlbHNlIHtcblx0XHRcblx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XG5cdH1cblx0XG59XG5cblRIUkVFLkNvbnNvbGUgPSB7XG5cdFxuXHR2ZWN0b3IgOiBmdW5jdGlvbiggdmVjdG9yT3JMaXN0LCBkZWNpbWFsUGxhY2VzICkge1xuXHRcdFxuXHRcdHZhciByZXN1bHRzID0gW107XG5cdFx0dmFyIGxpc3Q7XG5cdFx0XG5cdFx0aWYoIHZlY3Rvck9yTGlzdCBpbnN0YW5jZW9mIFRIUkVFLlZlY3RvcjIgfHwgdmVjdG9yT3JMaXN0IGluc3RhbmNlb2YgVEhSRUUuVmVjdG9yMyAgfHwgdmVjdG9yT3JMaXN0IGluc3RhbmNlb2YgVEhSRUUuVmVjdG9yNCApIHtcblx0XHRcdGxpc3QgPSBbIHZlY3Rvck9yTGlzdCBdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsaXN0ID0gdmVjdG9yT3JMaXN0O1xuXHRcdH1cblx0XHRcblx0XHRjb25zb2xlLnRhYmxlKFxuXHRcdFx0Xy5tYXAoIGxpc3QsIGZ1bmN0aW9uKCB2ZWN0b3IgKSB7XG5cdFx0XHRcdHJldHVybiBfLm1hcCggdmVjdG9yLnRvQXJyYXkoKSwgZnVuY3Rpb24oIHggKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJvdW5kVG8oIHgsIGRlY2ltYWxQbGFjZXMgKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KVxuXHRcdCk7XG5cdFx0XG5cdH0sXG5cdFxuXHRtYXRyaXggOiBmdW5jdGlvbiggbWF0cml4T3JFbGVtZW50cywgZGVjaW1hbFBsYWNlcyApIHtcbiBcblx0XHR2YXIgaSwgaiwgZWwsIGVscywgcmVzdWx0cztcbiBcblx0XHRyZXN1bHRzID0gW107XG5cdFx0aiA9IDA7XG5cdFx0XG5cdFx0aWYoIG1hdHJpeE9yRWxlbWVudHMgaW5zdGFuY2VvZiBUSFJFRS5NYXRyaXgzIHx8IG1hdHJpeE9yRWxlbWVudHMgaW5zdGFuY2VvZiBUSFJFRS5NYXRyaXgzICkge1xuXHRcdFx0ZWxzID0gbWF0cml4T3JFbGVtZW50cy5lbGVtZW50cztcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZWxzID0gbWF0cml4T3JFbGVtZW50cztcblx0XHR9XG4gXG5cdFx0Zm9yKCBpPTA7IGkgPCBlbHMubGVuZ3RoOyBpKysgKSB7XG5cdFx0XG5cdFx0XHRpZiggaiA9PT0gMCApIHtcblx0XHRcdFx0cmVzdWx0cy5wdXNoKFtdKTtcblx0XHRcdH1cbiBcblx0XHRcdGVsID0gcm91bmRUbyggZWxzW2ldLCBkZWNpbWFsUGxhY2VzICk7XG4gXG5cdFx0XHRyZXN1bHRzW01hdGguZmxvb3IoaSAvIDQpICUgNF0ucHVzaCggZWwgKTtcbiBcblx0XHRcdGorKztcblx0XHRcdGogJT0gNDtcblx0XHRcblx0XHRcdGlmKCBpICUgMTYgPT09IDE1ICkge1xuXHRcdFx0XHRjb25zb2xlLnRhYmxlKCByZXN1bHRzICk7XG5cdFx0XHRcdHJlc3VsdHMgPSBbXTtcblx0XHRcdH1cbiBcblx0XHR9XG4gXG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRIUkVFLkNvbnNvbGU7IiwidmFyIGNhbGN1bGF0ZVNxdWFyZWRUZXh0dXJlV2lkdGggPSBmdW5jdGlvbiggY291bnQgKSB7XG5cdHZhciB3aWR0aCA9IDE7XG5cdHZhciBpID0gMDtcblx0XG5cdHdoaWxlKCB3aWR0aCAqIHdpZHRoIDwgKGNvdW50IC8gNCkgKSB7XG5cdFx0XG5cdFx0aSsrO1xuXHRcdHdpZHRoID0gTWF0aC5wb3coIDIsIGkgKTtcblx0XHRcblx0fVxuXHRcblx0cmV0dXJuIHdpZHRoO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjYWxjdWxhdGVTcXVhcmVkVGV4dHVyZVdpZHRoO1xuIiwidmFyIFJTVlAgPSByZXF1aXJlKCdyc3ZwJyk7XG5cbnZhciBsb2FkVGV4dCA9IGZ1bmN0aW9uKCB1cmwsIG9iamVjdCwga2V5ICkge1xuXHRcblx0dmFyIHByb21pc2UgPSBuZXcgUlNWUC5Qcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG5cdFx0XG5cdFx0JC5hamF4KHVybCwge1xuXHRcdFx0ZGF0YVR5cGU6IFwidGV4dFwiXG5cdFx0fSkudGhlbihcblx0XHRcdGZ1bmN0aW9uKCBkYXRhICkge1xuXHRcdFx0XHRcblx0XHRcdFx0aWYoIF8uaXNPYmplY3QoIG9iamVjdCApICkge1xuXHRcdFx0XHRcdG9iamVjdFtrZXldID0gZGF0YTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0cmVzb2x2ZSggZGF0YSApO1xuXHRcdFx0fSxcblx0XHRcdGZ1bmN0aW9uKCBlcnJvciApIHtcblx0XHRcdFx0cmVqZWN0KCBlcnJvciApO1xuXHRcdFx0fVxuXHRcdCk7XG5cdFx0XG5cdH0pO1xuXG5cdHJldHVybiBwcm9taXNlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBsb2FkVGV4dDsiLCJ2YXIgUlNWUCA9IHJlcXVpcmUoJ3JzdnAnKTtcblxudmFyIGxvYWRUZXh0dXJlID0gZnVuY3Rpb24oIHVybCwgb2JqZWN0LCBrZXkgKSB7XG5cdFxuXHRyZXR1cm4gbmV3IFJTVlAuUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcblx0XHRcblx0XHRUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCB1cmwsIHVuZGVmaW5lZCwgZnVuY3Rpb24oIHRleHR1cmUgKSB7XG5cdFx0XHRcblx0XHRcdGlmKCBfLmlzT2JqZWN0KCBvYmplY3QgKSApIHtcblx0XHRcdFx0b2JqZWN0W2tleV0gPSB0ZXh0dXJlO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRyZXNvbHZlKCB0ZXh0dXJlICk7XG5cdFx0XHRcblx0XHR9LCByZWplY3QgKTtcblx0XHRcblx0fSk7XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbG9hZFRleHR1cmU7IiwidmFyIHJhbmRvbSA9IHtcblx0XG5cdGZsaXAgOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gTWF0aC5yYW5kb20oKSA+IDAuNSA/IHRydWU6IGZhbHNlO1xuXHR9LFxuXHRcblx0cmFuZ2UgOiBmdW5jdGlvbihtaW4sIG1heCkge1xuXHRcdHJldHVybiBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW47XG5cdH0sXG5cdFxuXHRyYW5nZUludCA6IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG5cdFx0cmV0dXJuIE1hdGguZmxvb3IoIHRoaXMucmFuZ2UobWluLCBtYXggKyAxKSApO1xuXHR9LFxuXHRcblx0cmFuZ2VMb3cgOiBmdW5jdGlvbihtaW4sIG1heCkge1xuXHRcdC8vTW9yZSBsaWtlbHkgdG8gcmV0dXJuIGEgbG93IHZhbHVlXG5cdCAgcmV0dXJuIE1hdGgucmFuZG9tKCkgKiBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW47XG5cdH0sXG5cdFxuXHRyYW5nZUhpZ2ggOiBmdW5jdGlvbihtaW4sIG1heCkge1xuXHRcdC8vTW9yZSBsaWtlbHkgdG8gcmV0dXJuIGEgaGlnaCB2YWx1ZVxuXHRcdHJldHVybiAoMSAtIE1hdGgucmFuZG9tKCkgKiBNYXRoLnJhbmRvbSgpKSAqIChtYXggLSBtaW4pICsgbWluO1xuXHR9XG5cdCBcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gcmFuZG9tO1xuIiwidmFyIHBlcmxpblNpbXBsZXggPSByZXF1aXJlKCdwZXJsaW4tc2ltcGxleCcpO1xudmFyIGdlbmVyYXRvciA9IG5ldyBwZXJsaW5TaW1wbGV4KCk7XG4vLyBnZW5lcmF0b3Iubm9pc2UoeCwgeSlcbi8vIGdlbmVyYXRvci5ub2lzZTNkKHgsIHksIHopXG5cbmZ1bmN0aW9uIHVuaXRTaW1wbGV4KCB4LCB5ICkge1xuXHRyZXR1cm4gKGdlbmVyYXRvci5ub2lzZSh4LHkpICsgMSkgLyAyO1xufVxuXG52YXIgc2ltcGxleDIgPSB7XG5cdFxuXHRmbGlwIDogZnVuY3Rpb24oIHgsIHkgKSB7XG5cdFx0cmV0dXJuIGdlbmVyYXRvci5ub2lzZSh4LHkpID4gMCA/IHRydWU6IGZhbHNlO1xuXHR9LFxuXHRcblx0cmFuZ2UgOiBmdW5jdGlvbiggeCwgeSwgbWluLCBtYXggKSB7XG5cdFx0cmV0dXJuIHVuaXRTaW1wbGV4KHgseSkgKiAobWF4IC0gbWluKSArIG1pbjtcblx0fSxcblx0XG5cdHJhbmdlSW50IDogZnVuY3Rpb24oIHgsIHksIG1pbiwgbWF4ICkge1xuXHRcdHJldHVybiBNYXRoLmZsb29yKCB0aGlzLnJhbmdlKG1pbiwgbWF4ICsgMSkgKTtcblx0fSxcblx0XG5cdHJhbmdlTG93IDogZnVuY3Rpb24oIHgsIHksIG1pbiwgbWF4KSB7XG5cdFx0Ly9Nb3JlIGxpa2VseSB0byByZXR1cm4gYSBsb3cgdmFsdWVcblx0XHR2YXIgciA9IHVuaXRTaW1wbGV4KHgseSk7XG5cdFx0cmV0dXJuIHIgKiByICogKG1heCAtIG1pbikgKyBtaW47XG5cdH0sXG5cdFxuXHRyYW5nZUhpZ2ggOiBmdW5jdGlvbiggeCwgeSwgbWluLCBtYXgpIHtcblx0XHQvL01vcmUgbGlrZWx5IHRvIHJldHVybiBhIGhpZ2ggdmFsdWVcblx0XHR2YXIgciA9IHVuaXRTaW1wbGV4KHgseSk7XG5cdFx0cmV0dXJuICgxIC0gciAqIHIpICogKG1heCAtIG1pbikgKyBtaW47XG5cdH1cblx0IFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBzaW1wbGV4MjtcbiIsIi8qIGdsb2JhbHMgVEhSRUUgKi9cbi8qKlxuICogRGV2aWNlT3JpZW50YXRpb25Db250cm9scyAtIGFwcGxpZXMgZGV2aWNlIG9yaWVudGF0aW9uIG9uIG9iamVjdCByb3RhdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgLSBpbnN0YW5jZSBvZiBUSFJFRS5PYmplY3QzRFxuICogQGNvbnN0cnVjdG9yXG4gKlxuICogQGF1dGhvciByaWNodCAvIGh0dHA6Ly9yaWNodC5tZVxuICogQGF1dGhvciBXZXN0TGFuZ2xleSAvIGh0dHA6Ly9naXRodWIuY29tL1dlc3RMYW5nbGV5XG4gKiBAYXV0aG9yIGpvbm9icjEgLyBodHRwOi8vam9ub2JyMS5jb21cbiAqIEBhdXRob3IgYXJvZGljIC8gaHR0cDovL2FsZWtzYW5kYXJyb2RpYy5jb21cbiAqIEBhdXRob3IgZG91ZyAvIGh0dHA6Ly9naXRodWIuY29tL2RvdWdcbiAqXG4gKiBXM0MgRGV2aWNlIE9yaWVudGF0aW9uIGNvbnRyb2xcbiAqIChodHRwOi8vdzNjLmdpdGh1Yi5pby9kZXZpY2VvcmllbnRhdGlvbi9zcGVjLXNvdXJjZS1vcmllbnRhdGlvbi5odG1sKVxuICovXG5cblxudmFyIGRldmljZU9yaWVudGF0aW9uID0ge307XG5cdHZhciBzY3JlZW5PcmllbnRhdGlvbiA9IHdpbmRvdy5vcmllbnRhdGlvbiB8fCAwO1xuXG5mdW5jdGlvbiBvbkRldmljZU9yaWVudGF0aW9uQ2hhbmdlRXZlbnQoZXZ0KSB7XG5cdGRldmljZU9yaWVudGF0aW9uID0gZXZ0O1xufVxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2RldmljZW9yaWVudGF0aW9uJywgb25EZXZpY2VPcmllbnRhdGlvbkNoYW5nZUV2ZW50LCBmYWxzZSk7XG5cbmZ1bmN0aW9uIGdldE9yaWVudGF0aW9uKCkge1xuXHRzd2l0Y2ggKHdpbmRvdy5zY3JlZW4ub3JpZW50YXRpb24gfHwgd2luZG93LnNjcmVlbi5tb3pPcmllbnRhdGlvbikge1xuXHRcdGNhc2UgJ2xhbmRzY2FwZS1wcmltYXJ5Jzpcblx0XHRcdHJldHVybiA5MDtcblx0XHRjYXNlICdsYW5kc2NhcGUtc2Vjb25kYXJ5Jzpcblx0XHRcdHJldHVybiAtOTA7XG5cdFx0Y2FzZSAncG9ydHJhaXQtc2Vjb25kYXJ5Jzpcblx0XHRcdHJldHVybiAxODA7XG5cdFx0Y2FzZSAncG9ydHJhaXQtcHJpbWFyeSc6XG5cdFx0XHRyZXR1cm4gMDtcblx0fVxuXHQvLyB0aGlzIHJldHVybnMgOTAgaWYgd2lkdGggaXMgZ3JlYXRlciB0aGVuIGhlaWdodFxuXHQvLyBhbmQgd2luZG93IG9yaWVudGF0aW9uIGlzIHVuZGVmaW5lZCBPUiAwXG5cdC8vIGlmICghd2luZG93Lm9yaWVudGF0aW9uICYmIHdpbmRvdy5pbm5lcldpZHRoID4gd2luZG93LmlubmVySGVpZ2h0KVxuXHQvL1x0IHJldHVybiA5MDtcblx0cmV0dXJuIHdpbmRvdy5vcmllbnRhdGlvbiB8fCAwO1xufVxuXG5mdW5jdGlvbiBvblNjcmVlbk9yaWVudGF0aW9uQ2hhbmdlRXZlbnQoKSB7XG5cdHNjcmVlbk9yaWVudGF0aW9uID0gZ2V0T3JpZW50YXRpb24oKTtcbn1cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdvcmllbnRhdGlvbmNoYW5nZScsIG9uU2NyZWVuT3JpZW50YXRpb25DaGFuZ2VFdmVudCwgZmFsc2UpO1xuXG5cblRIUkVFLkRldmljZU9yaWVudGF0aW9uQ29udHJvbHMgPSBmdW5jdGlvbihvYmplY3QpIHtcblxuXHR0aGlzLm9iamVjdCA9IG9iamVjdDtcblxuXHR0aGlzLm9iamVjdC5yb3RhdGlvbi5yZW9yZGVyKCdZWFonKTtcblxuXHR0aGlzLmZyZWV6ZSA9IHRydWU7XG5cblx0dGhpcy5tb3ZlbWVudFNwZWVkID0gMS4wO1xuXHR0aGlzLnJvbGxTcGVlZCA9IDAuMDA1O1xuXHR0aGlzLmF1dG9BbGlnbiA9IHRydWU7XG5cdHRoaXMuYXV0b0ZvcndhcmQgPSBmYWxzZTtcblxuXHR0aGlzLmFscGhhID0gMDtcblx0dGhpcy5iZXRhID0gMDtcblx0dGhpcy5nYW1tYSA9IDA7XG5cdHRoaXMub3JpZW50ID0gMDtcblxuXHR0aGlzLmFsaWduUXVhdGVybmlvbiA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKCk7XG5cdHRoaXMub3JpZW50YXRpb25RdWF0ZXJuaW9uID0gbmV3IFRIUkVFLlF1YXRlcm5pb24oKTtcblxuXHR2YXIgcXVhdGVybmlvbiA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKCk7XG5cdHZhciBxdWF0ZXJuaW9uTGVycCA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKCk7XG5cblx0dmFyIHRlbXBWZWN0b3IzID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblx0dmFyIHRlbXBNYXRyaXg0ID0gbmV3IFRIUkVFLk1hdHJpeDQoKTtcblx0dmFyIHRlbXBFdWxlciA9IG5ldyBUSFJFRS5FdWxlcigwLCAwLCAwLCAnWVhaJyk7XG5cdHZhciB0ZW1wUXVhdGVybmlvbiA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKCk7XG5cblx0dmFyIHplZSA9IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDEpO1xuXHR2YXIgdXAgPSBuZXcgVEhSRUUuVmVjdG9yMygwLCAxLCAwKTtcblx0dmFyIHYwID0gbmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCk7XG5cdHZhciBldWxlciA9IG5ldyBUSFJFRS5FdWxlcigpO1xuXHR2YXIgcTAgPSBuZXcgVEhSRUUuUXVhdGVybmlvbigpOyAvLyAtIFBJLzIgYXJvdW5kIHRoZSB4LWF4aXNcblx0dmFyIHExID0gbmV3IFRIUkVFLlF1YXRlcm5pb24oLSBNYXRoLnNxcnQoMC41KSwgMCwgMCwgTWF0aC5zcXJ0KDAuNSkpO1xuXG5cblx0dGhpcy51cGRhdGUgPSAoZnVuY3Rpb24oZGVsdGEpIHtcblxuXHRcdHJldHVybiBmdW5jdGlvbihkZWx0YSkge1xuXG5cdFx0XHRpZiAodGhpcy5mcmVlemUpIHJldHVybjtcblxuXHRcdFx0Ly8gc2hvdWxkIG5vdCBuZWVkIHRoaXNcblx0XHRcdC8vdmFyIG9yaWVudGF0aW9uID0gZ2V0T3JpZW50YXRpb24oKTtcblx0XHRcdC8vaWYgKG9yaWVudGF0aW9uICE9PSB0aGlzLnNjcmVlbk9yaWVudGF0aW9uKSB7XG5cdFx0XHRcdC8vdGhpcy5zY3JlZW5PcmllbnRhdGlvbiA9IG9yaWVudGF0aW9uO1xuXHRcdFx0XHQvL3RoaXMuYXV0b0FsaWduID0gdHJ1ZTtcblx0XHRcdC8vfVxuXG5cdFx0XHR0aGlzLmFscGhhID0gZGV2aWNlT3JpZW50YXRpb24uZ2FtbWEgP1xuXHRcdFx0XHRUSFJFRS5NYXRoLmRlZ1RvUmFkKGRldmljZU9yaWVudGF0aW9uLmFscGhhKSA6IDA7IC8vIFpcblx0XHRcdHRoaXMuYmV0YSA9IGRldmljZU9yaWVudGF0aW9uLmJldGEgP1xuXHRcdFx0XHRUSFJFRS5NYXRoLmRlZ1RvUmFkKGRldmljZU9yaWVudGF0aW9uLmJldGEpIDogMDsgLy8gWCdcblx0XHRcdHRoaXMuZ2FtbWEgPSBkZXZpY2VPcmllbnRhdGlvbi5nYW1tYSA/XG5cdFx0XHRcdFRIUkVFLk1hdGguZGVnVG9SYWQoZGV2aWNlT3JpZW50YXRpb24uZ2FtbWEpIDogMDsgLy8gWScnXG5cdFx0XHR0aGlzLm9yaWVudCA9IHNjcmVlbk9yaWVudGF0aW9uID9cblx0XHRcdFx0VEhSRUUuTWF0aC5kZWdUb1JhZChzY3JlZW5PcmllbnRhdGlvbikgOiAwOyAvLyBPXG5cblx0XHRcdC8vIFRoZSBhbmdsZXMgYWxwaGEsIGJldGEgYW5kIGdhbW1hXG5cdFx0XHQvLyBmb3JtIGEgc2V0IG9mIGludHJpbnNpYyBUYWl0LUJyeWFuIGFuZ2xlcyBvZiB0eXBlIFotWCctWScnXG5cblx0XHRcdC8vICdaWFknIGZvciB0aGUgZGV2aWNlLCBidXQgJ1lYWicgZm9yIHVzXG5cdFx0XHRldWxlci5zZXQodGhpcy5iZXRhLCB0aGlzLmFscGhhLCAtIHRoaXMuZ2FtbWEsICdZWFonKTtcblxuXHRcdFx0cXVhdGVybmlvbi5zZXRGcm9tRXVsZXIoZXVsZXIpO1xuXHRcdFx0cXVhdGVybmlvbkxlcnAuc2xlcnAocXVhdGVybmlvbiwgMC41KTsgLy8gaW50ZXJwb2xhdGVcblxuXHRcdFx0Ly8gb3JpZW50IHRoZSBkZXZpY2Vcblx0XHRcdGlmICh0aGlzLmF1dG9BbGlnbikgdGhpcy5vcmllbnRhdGlvblF1YXRlcm5pb24uY29weShxdWF0ZXJuaW9uKTsgLy8gaW50ZXJwb2xhdGlvbiBicmVha3MgdGhlIGF1dG8gYWxpZ25tZW50XG5cdFx0XHRlbHNlIHRoaXMub3JpZW50YXRpb25RdWF0ZXJuaW9uLmNvcHkocXVhdGVybmlvbkxlcnApO1xuXG5cdFx0XHQvLyBjYW1lcmEgbG9va3Mgb3V0IHRoZSBiYWNrIG9mIHRoZSBkZXZpY2UsIG5vdCB0aGUgdG9wXG5cdFx0XHR0aGlzLm9yaWVudGF0aW9uUXVhdGVybmlvbi5tdWx0aXBseShxMSk7XG5cblx0XHRcdC8vIGFkanVzdCBmb3Igc2NyZWVuIG9yaWVudGF0aW9uXG5cdFx0XHR0aGlzLm9yaWVudGF0aW9uUXVhdGVybmlvbi5tdWx0aXBseShxMC5zZXRGcm9tQXhpc0FuZ2xlKHplZSwgLSB0aGlzLm9yaWVudCkpO1xuXG5cdFx0XHR0aGlzLm9iamVjdC5xdWF0ZXJuaW9uLmNvcHkodGhpcy5hbGlnblF1YXRlcm5pb24pO1xuXHRcdFx0dGhpcy5vYmplY3QucXVhdGVybmlvbi5tdWx0aXBseSh0aGlzLm9yaWVudGF0aW9uUXVhdGVybmlvbik7XG5cblx0XHRcdGlmICh0aGlzLmF1dG9Gb3J3YXJkKSB7XG5cblx0XHRcdFx0dGVtcFZlY3RvcjNcblx0XHRcdFx0XHQuc2V0KDAsIDAsIC0xKVxuXHRcdFx0XHRcdC5hcHBseVF1YXRlcm5pb24odGhpcy5vYmplY3QucXVhdGVybmlvbiwgJ1pYWScpXG5cdFx0XHRcdFx0LnNldExlbmd0aCh0aGlzLm1vdmVtZW50U3BlZWQgLyA1MCk7IC8vIFRPRE86IHdoeSA1MCA6U1xuXG5cdFx0XHRcdHRoaXMub2JqZWN0LnBvc2l0aW9uLmFkZCh0ZW1wVmVjdG9yMyk7XG5cblx0XHRcdH1cblxuXHRcdFx0aWYgKHRoaXMuYXV0b0FsaWduICYmIHRoaXMuYWxwaGEgIT09IDApIHtcblxuXHRcdFx0XHR0aGlzLmF1dG9BbGlnbiA9IGZhbHNlO1xuXG5cdFx0XHRcdHRoaXMuYWxpZ24oKTtcblxuXHRcdFx0fVxuXG5cdFx0fTtcblxuXHR9KSgpO1xuXG5cdHRoaXMuYWxpZ24gPSBmdW5jdGlvbigpIHtcblxuXHRcdHRlbXBWZWN0b3IzXG5cdFx0XHQuc2V0KDAsIDAsIC0xKVxuXHRcdFx0LmFwcGx5UXVhdGVybmlvbiggdGVtcFF1YXRlcm5pb24uY29weSh0aGlzLm9yaWVudGF0aW9uUXVhdGVybmlvbikuaW52ZXJzZSgpLCAnWlhZJyApO1xuXG5cdFx0dGVtcEV1bGVyLnNldEZyb21RdWF0ZXJuaW9uKFxuXHRcdFx0dGVtcFF1YXRlcm5pb24uc2V0RnJvbVJvdGF0aW9uTWF0cml4KFxuXHRcdFx0XHR0ZW1wTWF0cml4NC5sb29rQXQodGVtcFZlY3RvcjMsIHYwLCB1cClcblx0XHQgKVxuXHQgKTtcblxuXHRcdHRlbXBFdWxlci5zZXQoMCwgdGVtcEV1bGVyLnksIDApO1xuXHRcdHRoaXMuYWxpZ25RdWF0ZXJuaW9uLnNldEZyb21FdWxlcih0ZW1wRXVsZXIpO1xuXG5cdH07XG5cblx0dGhpcy5jb25uZWN0ID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5mcmVlemUgPSBmYWxzZTtcblx0fTtcblxuXHR0aGlzLmRpc2Nvbm5lY3QgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmZyZXplID0gdHJ1ZTtcblx0fTtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUSFJFRS5EZXZpY2VPcmllbnRhdGlvbkNvbnRyb2xzOyIsIi8qKlxuICogQGF1dGhvciBxaWFvIC8gaHR0cHM6Ly9naXRodWIuY29tL3FpYW9cbiAqIEBhdXRob3IgbXJkb29iIC8gaHR0cDovL21yZG9vYi5jb21cbiAqIEBhdXRob3IgYWx0ZXJlZHEgLyBodHRwOi8vYWx0ZXJlZHF1YWxpYS5jb20vXG4gKiBAYXV0aG9yIFdlc3RMYW5nbGV5IC8gaHR0cDovL2dpdGh1Yi5jb20vV2VzdExhbmdsZXlcbiAqIEBhdXRob3IgZXJpY2g2NjYgLyBodHRwOi8vZXJpY2hhaW5lcy5jb21cbiAqL1xuLypnbG9iYWwgVEhSRUUsIGNvbnNvbGUgKi9cblxuLy8gVGhpcyBzZXQgb2YgY29udHJvbHMgcGVyZm9ybXMgb3JiaXRpbmcsIGRvbGx5aW5nICh6b29taW5nKSwgYW5kIHBhbm5pbmcuIEl0IG1haW50YWluc1xuLy8gdGhlIFwidXBcIiBkaXJlY3Rpb24gYXMgK1ksIHVubGlrZSB0aGUgVHJhY2tiYWxsQ29udHJvbHMuIFRvdWNoIG9uIHRhYmxldCBhbmQgcGhvbmVzIGlzXG4vLyBzdXBwb3J0ZWQuXG4vL1xuLy8gICAgT3JiaXQgLSBsZWZ0IG1vdXNlIC8gdG91Y2g6IG9uZSBmaW5nZXIgbW92ZVxuLy8gICAgWm9vbSAtIG1pZGRsZSBtb3VzZSwgb3IgbW91c2V3aGVlbCAvIHRvdWNoOiB0d28gZmluZ2VyIHNwcmVhZCBvciBzcXVpc2hcbi8vICAgIFBhbiAtIHJpZ2h0IG1vdXNlLCBvciBhcnJvdyBrZXlzIC8gdG91Y2g6IHRocmVlIGZpbnRlciBzd2lwZVxuLy9cbi8vIFRoaXMgaXMgYSBkcm9wLWluIHJlcGxhY2VtZW50IGZvciAobW9zdCkgVHJhY2tiYWxsQ29udHJvbHMgdXNlZCBpbiBleGFtcGxlcy5cbi8vIFRoYXQgaXMsIGluY2x1ZGUgdGhpcyBqcyBmaWxlIGFuZCB3aGVyZXZlciB5b3Ugc2VlOlxuLy8gICAgXHRjb250cm9scyA9IG5ldyBUSFJFRS5UcmFja2JhbGxDb250cm9scyggY2FtZXJhICk7XG4vLyAgICAgIGNvbnRyb2xzLnRhcmdldC56ID0gMTUwO1xuLy8gU2ltcGxlIHN1YnN0aXR1dGUgXCJPcmJpdENvbnRyb2xzXCIgYW5kIHRoZSBjb250cm9sIHNob3VsZCB3b3JrIGFzLWlzLlxuXG5USFJFRS5PcmJpdENvbnRyb2xzID0gZnVuY3Rpb24gKCBvYmplY3QsIGRvbUVsZW1lbnQgKSB7XG5cblx0dGhpcy5vYmplY3QgPSBvYmplY3Q7XG5cdHRoaXMuZG9tRWxlbWVudCA9ICggZG9tRWxlbWVudCAhPT0gdW5kZWZpbmVkICkgPyBkb21FbGVtZW50IDogZG9jdW1lbnQ7XG5cblx0Ly8gQVBJXG5cblx0Ly8gU2V0IHRvIGZhbHNlIHRvIGRpc2FibGUgdGhpcyBjb250cm9sXG5cdHRoaXMuZW5hYmxlZCA9IHRydWU7XG5cblx0Ly8gXCJ0YXJnZXRcIiBzZXRzIHRoZSBsb2NhdGlvbiBvZiBmb2N1cywgd2hlcmUgdGhlIGNvbnRyb2wgb3JiaXRzIGFyb3VuZFxuXHQvLyBhbmQgd2hlcmUgaXQgcGFucyB3aXRoIHJlc3BlY3QgdG8uXG5cdHRoaXMudGFyZ2V0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuXHQvLyBjZW50ZXIgaXMgb2xkLCBkZXByZWNhdGVkOyB1c2UgXCJ0YXJnZXRcIiBpbnN0ZWFkXG5cdHRoaXMuY2VudGVyID0gdGhpcy50YXJnZXQ7XG5cblx0Ly8gVGhpcyBvcHRpb24gYWN0dWFsbHkgZW5hYmxlcyBkb2xseWluZyBpbiBhbmQgb3V0OyBsZWZ0IGFzIFwiem9vbVwiIGZvclxuXHQvLyBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuXHR0aGlzLm5vWm9vbSA9IGZhbHNlO1xuXHR0aGlzLnpvb21TcGVlZCA9IDEuMDtcblxuXHQvLyBMaW1pdHMgdG8gaG93IGZhciB5b3UgY2FuIGRvbGx5IGluIGFuZCBvdXRcblx0dGhpcy5taW5EaXN0YW5jZSA9IDA7XG5cdHRoaXMubWF4RGlzdGFuY2UgPSBJbmZpbml0eTtcblxuXHQvLyBTZXQgdG8gdHJ1ZSB0byBkaXNhYmxlIHRoaXMgY29udHJvbFxuXHR0aGlzLm5vUm90YXRlID0gZmFsc2U7XG5cdHRoaXMucm90YXRlU3BlZWQgPSAxLjA7XG5cblx0Ly8gU2V0IHRvIHRydWUgdG8gZGlzYWJsZSB0aGlzIGNvbnRyb2xcblx0dGhpcy5ub1BhbiA9IGZhbHNlO1xuXHR0aGlzLmtleVBhblNwZWVkID0gNy4wO1x0Ly8gcGl4ZWxzIG1vdmVkIHBlciBhcnJvdyBrZXkgcHVzaFxuXG5cdC8vIFNldCB0byB0cnVlIHRvIGF1dG9tYXRpY2FsbHkgcm90YXRlIGFyb3VuZCB0aGUgdGFyZ2V0XG5cdHRoaXMuYXV0b1JvdGF0ZSA9IGZhbHNlO1xuXHR0aGlzLmF1dG9Sb3RhdGVTcGVlZCA9IDIuMDsgLy8gMzAgc2Vjb25kcyBwZXIgcm91bmQgd2hlbiBmcHMgaXMgNjBcblxuXHQvLyBIb3cgZmFyIHlvdSBjYW4gb3JiaXQgdmVydGljYWxseSwgdXBwZXIgYW5kIGxvd2VyIGxpbWl0cy5cblx0Ly8gUmFuZ2UgaXMgMCB0byBNYXRoLlBJIHJhZGlhbnMuXG5cdHRoaXMubWluUG9sYXJBbmdsZSA9IDA7IC8vIHJhZGlhbnNcblx0dGhpcy5tYXhQb2xhckFuZ2xlID0gTWF0aC5QSTsgLy8gcmFkaWFuc1xuXG5cdC8vIEhvdyBmYXIgeW91IGNhbiBvcmJpdCBob3Jpem9udGFsbHksIHVwcGVyIGFuZCBsb3dlciBsaW1pdHMuXG5cdC8vIElmIHNldCwgbXVzdCBiZSBhIHN1Yi1pbnRlcnZhbCBvZiB0aGUgaW50ZXJ2YWwgWyAtIE1hdGguUEksIE1hdGguUEkgXS5cblx0dGhpcy5taW5BemltdXRoQW5nbGUgPSAtIEluZmluaXR5OyAvLyByYWRpYW5zXG5cdHRoaXMubWF4QXppbXV0aEFuZ2xlID0gSW5maW5pdHk7IC8vIHJhZGlhbnNcblxuXHQvLyBTZXQgdG8gdHJ1ZSB0byBkaXNhYmxlIHVzZSBvZiB0aGUga2V5c1xuXHR0aGlzLm5vS2V5cyA9IGZhbHNlO1xuXG5cdC8vIFRoZSBmb3VyIGFycm93IGtleXNcblx0dGhpcy5rZXlzID0geyBMRUZUOiAzNywgVVA6IDM4LCBSSUdIVDogMzksIEJPVFRPTTogNDAgfTtcblxuXHQvLyBNb3VzZSBidXR0b25zXG5cdHRoaXMubW91c2VCdXR0b25zID0geyBPUkJJVDogVEhSRUUuTU9VU0UuTEVGVCwgWk9PTTogVEhSRUUuTU9VU0UuTUlERExFLCBQQU46IFRIUkVFLk1PVVNFLlJJR0hUIH07XG5cblx0Ly8vLy8vLy8vLy8vXG5cdC8vIGludGVybmFsc1xuXG5cdHZhciBzY29wZSA9IHRoaXM7XG5cblx0dmFyIEVQUyA9IDAuMDAwMDAxO1xuXG5cdHZhciByb3RhdGVTdGFydCA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cdHZhciByb3RhdGVFbmQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXHR2YXIgcm90YXRlRGVsdGEgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXG5cdHZhciBwYW5TdGFydCA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cdHZhciBwYW5FbmQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXHR2YXIgcGFuRGVsdGEgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXHR2YXIgcGFuT2Zmc2V0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuXHR2YXIgb2Zmc2V0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuXHR2YXIgZG9sbHlTdGFydCA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cdHZhciBkb2xseUVuZCA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cdHZhciBkb2xseURlbHRhID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblxuXHR2YXIgdGhldGE7XG5cdHZhciBwaGk7XG5cdHZhciBwaGlEZWx0YSA9IDA7XG5cdHZhciB0aGV0YURlbHRhID0gMDtcblx0dmFyIHNjYWxlID0gMTtcblx0dmFyIHBhbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cblx0dmFyIGxhc3RQb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cdHZhciBsYXN0UXVhdGVybmlvbiA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKCk7XG5cblx0dmFyIFNUQVRFID0geyBOT05FIDogLTEsIFJPVEFURSA6IDAsIERPTExZIDogMSwgUEFOIDogMiwgVE9VQ0hfUk9UQVRFIDogMywgVE9VQ0hfRE9MTFkgOiA0LCBUT1VDSF9QQU4gOiA1IH07XG5cblx0dmFyIHN0YXRlID0gU1RBVEUuTk9ORTtcblxuXHQvLyBmb3IgcmVzZXRcblxuXHR0aGlzLnRhcmdldDAgPSB0aGlzLnRhcmdldC5jbG9uZSgpO1xuXHR0aGlzLnBvc2l0aW9uMCA9IHRoaXMub2JqZWN0LnBvc2l0aW9uLmNsb25lKCk7XG5cblx0Ly8gc28gY2FtZXJhLnVwIGlzIHRoZSBvcmJpdCBheGlzXG5cblx0dmFyIHF1YXQgPSBuZXcgVEhSRUUuUXVhdGVybmlvbigpLnNldEZyb21Vbml0VmVjdG9ycyggb2JqZWN0LnVwLCBuZXcgVEhSRUUuVmVjdG9yMyggMCwgMSwgMCApICk7XG5cdHZhciBxdWF0SW52ZXJzZSA9IHF1YXQuY2xvbmUoKS5pbnZlcnNlKCk7XG5cblx0Ly8gZXZlbnRzXG5cblx0dmFyIGNoYW5nZUV2ZW50ID0geyB0eXBlOiAnY2hhbmdlJyB9O1xuXHR2YXIgc3RhcnRFdmVudCA9IHsgdHlwZTogJ3N0YXJ0J307XG5cdHZhciBlbmRFdmVudCA9IHsgdHlwZTogJ2VuZCd9O1xuXG5cdHRoaXMucm90YXRlTGVmdCA9IGZ1bmN0aW9uICggYW5nbGUgKSB7XG5cblx0XHRpZiAoIGFuZ2xlID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGFuZ2xlID0gZ2V0QXV0b1JvdGF0aW9uQW5nbGUoKTtcblxuXHRcdH1cblxuXHRcdHRoZXRhRGVsdGEgLT0gYW5nbGU7XG5cblx0fTtcblxuXHR0aGlzLnJvdGF0ZVVwID0gZnVuY3Rpb24gKCBhbmdsZSApIHtcblxuXHRcdGlmICggYW5nbGUgPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0YW5nbGUgPSBnZXRBdXRvUm90YXRpb25BbmdsZSgpO1xuXG5cdFx0fVxuXG5cdFx0cGhpRGVsdGEgLT0gYW5nbGU7XG5cblx0fTtcblxuXHQvLyBwYXNzIGluIGRpc3RhbmNlIGluIHdvcmxkIHNwYWNlIHRvIG1vdmUgbGVmdFxuXHR0aGlzLnBhbkxlZnQgPSBmdW5jdGlvbiAoIGRpc3RhbmNlICkge1xuXG5cdFx0dmFyIHRlID0gdGhpcy5vYmplY3QubWF0cml4LmVsZW1lbnRzO1xuXG5cdFx0Ly8gZ2V0IFggY29sdW1uIG9mIG1hdHJpeFxuXHRcdHBhbk9mZnNldC5zZXQoIHRlWyAwIF0sIHRlWyAxIF0sIHRlWyAyIF0gKTtcblx0XHRwYW5PZmZzZXQubXVsdGlwbHlTY2FsYXIoIC0gZGlzdGFuY2UgKTtcblxuXHRcdHBhbi5hZGQoIHBhbk9mZnNldCApO1xuXG5cdH07XG5cblx0Ly8gcGFzcyBpbiBkaXN0YW5jZSBpbiB3b3JsZCBzcGFjZSB0byBtb3ZlIHVwXG5cdHRoaXMucGFuVXAgPSBmdW5jdGlvbiAoIGRpc3RhbmNlICkge1xuXG5cdFx0dmFyIHRlID0gdGhpcy5vYmplY3QubWF0cml4LmVsZW1lbnRzO1xuXG5cdFx0Ly8gZ2V0IFkgY29sdW1uIG9mIG1hdHJpeFxuXHRcdHBhbk9mZnNldC5zZXQoIHRlWyA0IF0sIHRlWyA1IF0sIHRlWyA2IF0gKTtcblx0XHRwYW5PZmZzZXQubXVsdGlwbHlTY2FsYXIoIGRpc3RhbmNlICk7XG5cblx0XHRwYW4uYWRkKCBwYW5PZmZzZXQgKTtcblxuXHR9O1xuXG5cdC8vIHBhc3MgaW4geCx5IG9mIGNoYW5nZSBkZXNpcmVkIGluIHBpeGVsIHNwYWNlLFxuXHQvLyByaWdodCBhbmQgZG93biBhcmUgcG9zaXRpdmVcblx0dGhpcy5wYW4gPSBmdW5jdGlvbiAoIGRlbHRhWCwgZGVsdGFZICkge1xuXG5cdFx0dmFyIGVsZW1lbnQgPSBzY29wZS5kb21FbGVtZW50ID09PSBkb2N1bWVudCA/IHNjb3BlLmRvbUVsZW1lbnQuYm9keSA6IHNjb3BlLmRvbUVsZW1lbnQ7XG5cblx0XHRpZiAoIHNjb3BlLm9iamVjdC5mb3YgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0Ly8gcGVyc3BlY3RpdmVcblx0XHRcdHZhciBwb3NpdGlvbiA9IHNjb3BlLm9iamVjdC5wb3NpdGlvbjtcblx0XHRcdHZhciBvZmZzZXQgPSBwb3NpdGlvbi5jbG9uZSgpLnN1Yiggc2NvcGUudGFyZ2V0ICk7XG5cdFx0XHR2YXIgdGFyZ2V0RGlzdGFuY2UgPSBvZmZzZXQubGVuZ3RoKCk7XG5cblx0XHRcdC8vIGhhbGYgb2YgdGhlIGZvdiBpcyBjZW50ZXIgdG8gdG9wIG9mIHNjcmVlblxuXHRcdFx0dGFyZ2V0RGlzdGFuY2UgKj0gTWF0aC50YW4oICggc2NvcGUub2JqZWN0LmZvdiAvIDIgKSAqIE1hdGguUEkgLyAxODAuMCApO1xuXG5cdFx0XHQvLyB3ZSBhY3R1YWxseSBkb24ndCB1c2Ugc2NyZWVuV2lkdGgsIHNpbmNlIHBlcnNwZWN0aXZlIGNhbWVyYSBpcyBmaXhlZCB0byBzY3JlZW4gaGVpZ2h0XG5cdFx0XHRzY29wZS5wYW5MZWZ0KCAyICogZGVsdGFYICogdGFyZ2V0RGlzdGFuY2UgLyBlbGVtZW50LmNsaWVudEhlaWdodCApO1xuXHRcdFx0c2NvcGUucGFuVXAoIDIgKiBkZWx0YVkgKiB0YXJnZXREaXN0YW5jZSAvIGVsZW1lbnQuY2xpZW50SGVpZ2h0ICk7XG5cblx0XHR9IGVsc2UgaWYgKCBzY29wZS5vYmplY3QudG9wICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdC8vIG9ydGhvZ3JhcGhpY1xuXHRcdFx0c2NvcGUucGFuTGVmdCggZGVsdGFYICogKHNjb3BlLm9iamVjdC5yaWdodCAtIHNjb3BlLm9iamVjdC5sZWZ0KSAvIGVsZW1lbnQuY2xpZW50V2lkdGggKTtcblx0XHRcdHNjb3BlLnBhblVwKCBkZWx0YVkgKiAoc2NvcGUub2JqZWN0LnRvcCAtIHNjb3BlLm9iamVjdC5ib3R0b20pIC8gZWxlbWVudC5jbGllbnRIZWlnaHQgKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdC8vIGNhbWVyYSBuZWl0aGVyIG9ydGhvZ3JhcGhpYyBvciBwZXJzcGVjdGl2ZVxuXHRcdFx0Y29uc29sZS53YXJuKCAnV0FSTklORzogT3JiaXRDb250cm9scy5qcyBlbmNvdW50ZXJlZCBhbiB1bmtub3duIGNhbWVyYSB0eXBlIC0gcGFuIGRpc2FibGVkLicgKTtcblxuXHRcdH1cblxuXHR9O1xuXG5cdHRoaXMuZG9sbHlJbiA9IGZ1bmN0aW9uICggZG9sbHlTY2FsZSApIHtcblxuXHRcdGlmICggZG9sbHlTY2FsZSA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRkb2xseVNjYWxlID0gZ2V0Wm9vbVNjYWxlKCk7XG5cblx0XHR9XG5cblx0XHRzY2FsZSAvPSBkb2xseVNjYWxlO1xuXG5cdH07XG5cblx0dGhpcy5kb2xseU91dCA9IGZ1bmN0aW9uICggZG9sbHlTY2FsZSApIHtcblxuXHRcdGlmICggZG9sbHlTY2FsZSA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRkb2xseVNjYWxlID0gZ2V0Wm9vbVNjYWxlKCk7XG5cblx0XHR9XG5cblx0XHRzY2FsZSAqPSBkb2xseVNjYWxlO1xuXG5cdH07XG5cblx0dGhpcy51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHR2YXIgcG9zaXRpb24gPSB0aGlzLm9iamVjdC5wb3NpdGlvbjtcblxuXHRcdG9mZnNldC5jb3B5KCBwb3NpdGlvbiApLnN1YiggdGhpcy50YXJnZXQgKTtcblxuXHRcdC8vIHJvdGF0ZSBvZmZzZXQgdG8gXCJ5LWF4aXMtaXMtdXBcIiBzcGFjZVxuXHRcdG9mZnNldC5hcHBseVF1YXRlcm5pb24oIHF1YXQgKTtcblxuXHRcdC8vIGFuZ2xlIGZyb20gei1heGlzIGFyb3VuZCB5LWF4aXNcblxuXHRcdHRoZXRhID0gTWF0aC5hdGFuMiggb2Zmc2V0LngsIG9mZnNldC56ICk7XG5cblx0XHQvLyBhbmdsZSBmcm9tIHktYXhpc1xuXG5cdFx0cGhpID0gTWF0aC5hdGFuMiggTWF0aC5zcXJ0KCBvZmZzZXQueCAqIG9mZnNldC54ICsgb2Zmc2V0LnogKiBvZmZzZXQueiApLCBvZmZzZXQueSApO1xuXG5cdFx0aWYgKCB0aGlzLmF1dG9Sb3RhdGUgJiYgc3RhdGUgPT09IFNUQVRFLk5PTkUgKSB7XG5cblx0XHRcdHRoaXMucm90YXRlTGVmdCggZ2V0QXV0b1JvdGF0aW9uQW5nbGUoKSApO1xuXG5cdFx0fVxuXG5cdFx0dGhldGEgKz0gdGhldGFEZWx0YTtcblx0XHRwaGkgKz0gcGhpRGVsdGE7XG5cblx0XHQvLyByZXN0cmljdCB0aGV0YSB0byBiZSBiZXR3ZWVuIGRlc2lyZWQgbGltaXRzXG5cdFx0dGhldGEgPSBNYXRoLm1heCggdGhpcy5taW5BemltdXRoQW5nbGUsIE1hdGgubWluKCB0aGlzLm1heEF6aW11dGhBbmdsZSwgdGhldGEgKSApO1xuXG5cdFx0Ly8gcmVzdHJpY3QgcGhpIHRvIGJlIGJldHdlZW4gZGVzaXJlZCBsaW1pdHNcblx0XHRwaGkgPSBNYXRoLm1heCggdGhpcy5taW5Qb2xhckFuZ2xlLCBNYXRoLm1pbiggdGhpcy5tYXhQb2xhckFuZ2xlLCBwaGkgKSApO1xuXG5cdFx0Ly8gcmVzdHJpY3QgcGhpIHRvIGJlIGJldHdlZSBFUFMgYW5kIFBJLUVQU1xuXHRcdHBoaSA9IE1hdGgubWF4KCBFUFMsIE1hdGgubWluKCBNYXRoLlBJIC0gRVBTLCBwaGkgKSApO1xuXG5cdFx0dmFyIHJhZGl1cyA9IG9mZnNldC5sZW5ndGgoKSAqIHNjYWxlO1xuXG5cdFx0Ly8gcmVzdHJpY3QgcmFkaXVzIHRvIGJlIGJldHdlZW4gZGVzaXJlZCBsaW1pdHNcblx0XHRyYWRpdXMgPSBNYXRoLm1heCggdGhpcy5taW5EaXN0YW5jZSwgTWF0aC5taW4oIHRoaXMubWF4RGlzdGFuY2UsIHJhZGl1cyApICk7XG5cblx0XHQvLyBtb3ZlIHRhcmdldCB0byBwYW5uZWQgbG9jYXRpb25cblx0XHR0aGlzLnRhcmdldC5hZGQoIHBhbiApO1xuXG5cdFx0b2Zmc2V0LnggPSByYWRpdXMgKiBNYXRoLnNpbiggcGhpICkgKiBNYXRoLnNpbiggdGhldGEgKTtcblx0XHRvZmZzZXQueSA9IHJhZGl1cyAqIE1hdGguY29zKCBwaGkgKTtcblx0XHRvZmZzZXQueiA9IHJhZGl1cyAqIE1hdGguc2luKCBwaGkgKSAqIE1hdGguY29zKCB0aGV0YSApO1xuXG5cdFx0Ly8gcm90YXRlIG9mZnNldCBiYWNrIHRvIFwiY2FtZXJhLXVwLXZlY3Rvci1pcy11cFwiIHNwYWNlXG5cdFx0b2Zmc2V0LmFwcGx5UXVhdGVybmlvbiggcXVhdEludmVyc2UgKTtcblxuXHRcdHBvc2l0aW9uLmNvcHkoIHRoaXMudGFyZ2V0ICkuYWRkKCBvZmZzZXQgKTtcblxuXHRcdHRoaXMub2JqZWN0Lmxvb2tBdCggdGhpcy50YXJnZXQgKTtcblxuXHRcdHRoZXRhRGVsdGEgPSAwO1xuXHRcdHBoaURlbHRhID0gMDtcblx0XHRzY2FsZSA9IDE7XG5cdFx0cGFuLnNldCggMCwgMCwgMCApO1xuXG5cdFx0Ly8gdXBkYXRlIGNvbmRpdGlvbiBpczpcblx0XHQvLyBtaW4oY2FtZXJhIGRpc3BsYWNlbWVudCwgY2FtZXJhIHJvdGF0aW9uIGluIHJhZGlhbnMpXjIgPiBFUFNcblx0XHQvLyB1c2luZyBzbWFsbC1hbmdsZSBhcHByb3hpbWF0aW9uIGNvcyh4LzIpID0gMSAtIHheMiAvIDhcblxuXHRcdGlmICggbGFzdFBvc2l0aW9uLmRpc3RhbmNlVG9TcXVhcmVkKCB0aGlzLm9iamVjdC5wb3NpdGlvbiApID4gRVBTIHx8IDggKiAoMSAtIGxhc3RRdWF0ZXJuaW9uLmRvdCh0aGlzLm9iamVjdC5xdWF0ZXJuaW9uKSkgPiBFUFMgKSB7XG5cblx0XHRcdHRoaXMuZGlzcGF0Y2hFdmVudCggY2hhbmdlRXZlbnQgKTtcblxuXHRcdFx0bGFzdFBvc2l0aW9uLmNvcHkoIHRoaXMub2JqZWN0LnBvc2l0aW9uICk7XG5cdFx0XHRsYXN0UXVhdGVybmlvbi5jb3B5ICh0aGlzLm9iamVjdC5xdWF0ZXJuaW9uICk7XG5cblx0XHR9XG5cblx0fTtcblxuXG5cdHRoaXMucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHRzdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0XHR0aGlzLnRhcmdldC5jb3B5KCB0aGlzLnRhcmdldDAgKTtcblx0XHR0aGlzLm9iamVjdC5wb3NpdGlvbi5jb3B5KCB0aGlzLnBvc2l0aW9uMCApO1xuXG5cdFx0dGhpcy51cGRhdGUoKTtcblxuXHR9O1xuXG5cdHRoaXMuZ2V0UG9sYXJBbmdsZSA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdHJldHVybiBwaGk7XG5cblx0fTtcblxuXHR0aGlzLmdldEF6aW11dGhhbEFuZ2xlID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0cmV0dXJuIHRoZXRhO1xuXG5cdH07XG5cblx0ZnVuY3Rpb24gZ2V0QXV0b1JvdGF0aW9uQW5nbGUoKSB7XG5cblx0XHRyZXR1cm4gMiAqIE1hdGguUEkgLyA2MCAvIDYwICogc2NvcGUuYXV0b1JvdGF0ZVNwZWVkO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBnZXRab29tU2NhbGUoKSB7XG5cblx0XHRyZXR1cm4gTWF0aC5wb3coIDAuOTUsIHNjb3BlLnpvb21TcGVlZCApO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBvbk1vdXNlRG93biggZXZlbnQgKSB7XG5cblx0XHRpZiAoIHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRpZiAoIGV2ZW50LmJ1dHRvbiA9PT0gc2NvcGUubW91c2VCdXR0b25zLk9SQklUICkge1xuXHRcdFx0aWYgKCBzY29wZS5ub1JvdGF0ZSA9PT0gdHJ1ZSApIHJldHVybjtcblxuXHRcdFx0c3RhdGUgPSBTVEFURS5ST1RBVEU7XG5cblx0XHRcdHJvdGF0ZVN0YXJ0LnNldCggZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSApO1xuXG5cdFx0fSBlbHNlIGlmICggZXZlbnQuYnV0dG9uID09PSBzY29wZS5tb3VzZUJ1dHRvbnMuWk9PTSApIHtcblx0XHRcdGlmICggc2NvcGUubm9ab29tID09PSB0cnVlICkgcmV0dXJuO1xuXG5cdFx0XHRzdGF0ZSA9IFNUQVRFLkRPTExZO1xuXG5cdFx0XHRkb2xseVN0YXJ0LnNldCggZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSApO1xuXG5cdFx0fSBlbHNlIGlmICggZXZlbnQuYnV0dG9uID09PSBzY29wZS5tb3VzZUJ1dHRvbnMuUEFOICkge1xuXHRcdFx0aWYgKCBzY29wZS5ub1BhbiA9PT0gdHJ1ZSApIHJldHVybjtcblxuXHRcdFx0c3RhdGUgPSBTVEFURS5QQU47XG5cblx0XHRcdHBhblN0YXJ0LnNldCggZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSApO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCBzdGF0ZSAhPT0gU1RBVEUuTk9ORSApIHtcblx0XHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSwgZmFsc2UgKTtcblx0XHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgb25Nb3VzZVVwLCBmYWxzZSApO1xuXHRcdFx0c2NvcGUuZGlzcGF0Y2hFdmVudCggc3RhcnRFdmVudCApO1xuXHRcdH1cblxuXHR9XG5cblx0ZnVuY3Rpb24gb25Nb3VzZU1vdmUoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBzY29wZS5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHR2YXIgZWxlbWVudCA9IHNjb3BlLmRvbUVsZW1lbnQgPT09IGRvY3VtZW50ID8gc2NvcGUuZG9tRWxlbWVudC5ib2R5IDogc2NvcGUuZG9tRWxlbWVudDtcblxuXHRcdGlmICggc3RhdGUgPT09IFNUQVRFLlJPVEFURSApIHtcblxuXHRcdFx0aWYgKCBzY29wZS5ub1JvdGF0ZSA9PT0gdHJ1ZSApIHJldHVybjtcblxuXHRcdFx0cm90YXRlRW5kLnNldCggZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSApO1xuXHRcdFx0cm90YXRlRGVsdGEuc3ViVmVjdG9ycyggcm90YXRlRW5kLCByb3RhdGVTdGFydCApO1xuXG5cdFx0XHQvLyByb3RhdGluZyBhY3Jvc3Mgd2hvbGUgc2NyZWVuIGdvZXMgMzYwIGRlZ3JlZXMgYXJvdW5kXG5cdFx0XHRzY29wZS5yb3RhdGVMZWZ0KCAyICogTWF0aC5QSSAqIHJvdGF0ZURlbHRhLnggLyBlbGVtZW50LmNsaWVudFdpZHRoICogc2NvcGUucm90YXRlU3BlZWQgKTtcblxuXHRcdFx0Ly8gcm90YXRpbmcgdXAgYW5kIGRvd24gYWxvbmcgd2hvbGUgc2NyZWVuIGF0dGVtcHRzIHRvIGdvIDM2MCwgYnV0IGxpbWl0ZWQgdG8gMTgwXG5cdFx0XHRzY29wZS5yb3RhdGVVcCggMiAqIE1hdGguUEkgKiByb3RhdGVEZWx0YS55IC8gZWxlbWVudC5jbGllbnRIZWlnaHQgKiBzY29wZS5yb3RhdGVTcGVlZCApO1xuXG5cdFx0XHRyb3RhdGVTdGFydC5jb3B5KCByb3RhdGVFbmQgKTtcblxuXHRcdH0gZWxzZSBpZiAoIHN0YXRlID09PSBTVEFURS5ET0xMWSApIHtcblxuXHRcdFx0aWYgKCBzY29wZS5ub1pvb20gPT09IHRydWUgKSByZXR1cm47XG5cblx0XHRcdGRvbGx5RW5kLnNldCggZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSApO1xuXHRcdFx0ZG9sbHlEZWx0YS5zdWJWZWN0b3JzKCBkb2xseUVuZCwgZG9sbHlTdGFydCApO1xuXG5cdFx0XHRpZiAoIGRvbGx5RGVsdGEueSA+IDAgKSB7XG5cblx0XHRcdFx0c2NvcGUuZG9sbHlJbigpO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdHNjb3BlLmRvbGx5T3V0KCk7XG5cblx0XHRcdH1cblxuXHRcdFx0ZG9sbHlTdGFydC5jb3B5KCBkb2xseUVuZCApO1xuXG5cdFx0fSBlbHNlIGlmICggc3RhdGUgPT09IFNUQVRFLlBBTiApIHtcblxuXHRcdFx0aWYgKCBzY29wZS5ub1BhbiA9PT0gdHJ1ZSApIHJldHVybjtcblxuXHRcdFx0cGFuRW5kLnNldCggZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSApO1xuXHRcdFx0cGFuRGVsdGEuc3ViVmVjdG9ycyggcGFuRW5kLCBwYW5TdGFydCApO1xuXG5cdFx0XHRzY29wZS5wYW4oIHBhbkRlbHRhLngsIHBhbkRlbHRhLnkgKTtcblxuXHRcdFx0cGFuU3RhcnQuY29weSggcGFuRW5kICk7XG5cblx0XHR9XG5cblx0XHRpZiAoIHN0YXRlICE9PSBTVEFURS5OT05FICkgc2NvcGUudXBkYXRlKCk7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIG9uTW91c2VVcCggLyogZXZlbnQgKi8gKSB7XG5cblx0XHRpZiAoIHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlLCBmYWxzZSApO1xuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgb25Nb3VzZVVwLCBmYWxzZSApO1xuXHRcdHNjb3BlLmRpc3BhdGNoRXZlbnQoIGVuZEV2ZW50ICk7XG5cdFx0c3RhdGUgPSBTVEFURS5OT05FO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBvbk1vdXNlV2hlZWwoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBzY29wZS5lbmFibGVkID09PSBmYWxzZSB8fCBzY29wZS5ub1pvb20gPT09IHRydWUgfHwgc3RhdGUgIT09IFNUQVRFLk5PTkUgKSByZXR1cm47XG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0dmFyIGRlbHRhID0gMDtcblxuXHRcdGlmICggZXZlbnQud2hlZWxEZWx0YSAhPT0gdW5kZWZpbmVkICkgeyAvLyBXZWJLaXQgLyBPcGVyYSAvIEV4cGxvcmVyIDlcblxuXHRcdFx0ZGVsdGEgPSBldmVudC53aGVlbERlbHRhO1xuXG5cdFx0fSBlbHNlIGlmICggZXZlbnQuZGV0YWlsICE9PSB1bmRlZmluZWQgKSB7IC8vIEZpcmVmb3hcblxuXHRcdFx0ZGVsdGEgPSAtIGV2ZW50LmRldGFpbDtcblxuXHRcdH1cblxuXHRcdGlmICggZGVsdGEgPiAwICkge1xuXG5cdFx0XHRzY29wZS5kb2xseU91dCgpO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0c2NvcGUuZG9sbHlJbigpO1xuXG5cdFx0fVxuXG5cdFx0c2NvcGUudXBkYXRlKCk7XG5cdFx0c2NvcGUuZGlzcGF0Y2hFdmVudCggc3RhcnRFdmVudCApO1xuXHRcdHNjb3BlLmRpc3BhdGNoRXZlbnQoIGVuZEV2ZW50ICk7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIG9uS2V5RG93biggZXZlbnQgKSB7XG5cblx0XHRpZiAoIHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlIHx8IHNjb3BlLm5vS2V5cyA9PT0gdHJ1ZSB8fCBzY29wZS5ub1BhbiA9PT0gdHJ1ZSApIHJldHVybjtcblxuXHRcdHN3aXRjaCAoIGV2ZW50LmtleUNvZGUgKSB7XG5cblx0XHRcdGNhc2Ugc2NvcGUua2V5cy5VUDpcblx0XHRcdFx0c2NvcGUucGFuKCAwLCBzY29wZS5rZXlQYW5TcGVlZCApO1xuXHRcdFx0XHRzY29wZS51cGRhdGUoKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2Ugc2NvcGUua2V5cy5CT1RUT006XG5cdFx0XHRcdHNjb3BlLnBhbiggMCwgLSBzY29wZS5rZXlQYW5TcGVlZCApO1xuXHRcdFx0XHRzY29wZS51cGRhdGUoKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2Ugc2NvcGUua2V5cy5MRUZUOlxuXHRcdFx0XHRzY29wZS5wYW4oIHNjb3BlLmtleVBhblNwZWVkLCAwICk7XG5cdFx0XHRcdHNjb3BlLnVwZGF0ZSgpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBzY29wZS5rZXlzLlJJR0hUOlxuXHRcdFx0XHRzY29wZS5wYW4oIC0gc2NvcGUua2V5UGFuU3BlZWQsIDAgKTtcblx0XHRcdFx0c2NvcGUudXBkYXRlKCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRmdW5jdGlvbiB0b3VjaHN0YXJ0KCBldmVudCApIHtcblxuXHRcdGlmICggc2NvcGUuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRzd2l0Y2ggKCBldmVudC50b3VjaGVzLmxlbmd0aCApIHtcblxuXHRcdFx0Y2FzZSAxOlx0Ly8gb25lLWZpbmdlcmVkIHRvdWNoOiByb3RhdGVcblxuXHRcdFx0XHRpZiAoIHNjb3BlLm5vUm90YXRlID09PSB0cnVlICkgcmV0dXJuO1xuXG5cdFx0XHRcdHN0YXRlID0gU1RBVEUuVE9VQ0hfUk9UQVRFO1xuXG5cdFx0XHRcdHJvdGF0ZVN0YXJ0LnNldCggZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYLCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMjpcdC8vIHR3by1maW5nZXJlZCB0b3VjaDogZG9sbHlcblxuXHRcdFx0XHRpZiAoIHNjb3BlLm5vWm9vbSA9PT0gdHJ1ZSApIHJldHVybjtcblxuXHRcdFx0XHRzdGF0ZSA9IFNUQVRFLlRPVUNIX0RPTExZO1xuXG5cdFx0XHRcdHZhciBkeCA9IGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCAtIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWDtcblx0XHRcdFx0dmFyIGR5ID0gZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZIC0gZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VZO1xuXHRcdFx0XHR2YXIgZGlzdGFuY2UgPSBNYXRoLnNxcnQoIGR4ICogZHggKyBkeSAqIGR5ICk7XG5cdFx0XHRcdGRvbGx5U3RhcnQuc2V0KCAwLCBkaXN0YW5jZSApO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAzOiAvLyB0aHJlZS1maW5nZXJlZCB0b3VjaDogcGFuXG5cblx0XHRcdFx0aWYgKCBzY29wZS5ub1BhbiA9PT0gdHJ1ZSApIHJldHVybjtcblxuXHRcdFx0XHRzdGF0ZSA9IFNUQVRFLlRPVUNIX1BBTjtcblxuXHRcdFx0XHRwYW5TdGFydC5zZXQoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCwgZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXG5cdFx0XHRcdHN0YXRlID0gU1RBVEUuTk9ORTtcblxuXHRcdH1cblxuXHRcdGlmICggc3RhdGUgIT09IFNUQVRFLk5PTkUgKSBzY29wZS5kaXNwYXRjaEV2ZW50KCBzdGFydEV2ZW50ICk7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIHRvdWNobW92ZSggZXZlbnQgKSB7XG5cblx0XHRpZiAoIHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdHZhciBlbGVtZW50ID0gc2NvcGUuZG9tRWxlbWVudCA9PT0gZG9jdW1lbnQgPyBzY29wZS5kb21FbGVtZW50LmJvZHkgOiBzY29wZS5kb21FbGVtZW50O1xuXG5cdFx0c3dpdGNoICggZXZlbnQudG91Y2hlcy5sZW5ndGggKSB7XG5cblx0XHRcdGNhc2UgMTogLy8gb25lLWZpbmdlcmVkIHRvdWNoOiByb3RhdGVcblxuXHRcdFx0XHRpZiAoIHNjb3BlLm5vUm90YXRlID09PSB0cnVlICkgcmV0dXJuO1xuXHRcdFx0XHRpZiAoIHN0YXRlICE9PSBTVEFURS5UT1VDSF9ST1RBVEUgKSByZXR1cm47XG5cblx0XHRcdFx0cm90YXRlRW5kLnNldCggZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYLCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgKTtcblx0XHRcdFx0cm90YXRlRGVsdGEuc3ViVmVjdG9ycyggcm90YXRlRW5kLCByb3RhdGVTdGFydCApO1xuXG5cdFx0XHRcdC8vIHJvdGF0aW5nIGFjcm9zcyB3aG9sZSBzY3JlZW4gZ29lcyAzNjAgZGVncmVlcyBhcm91bmRcblx0XHRcdFx0c2NvcGUucm90YXRlTGVmdCggMiAqIE1hdGguUEkgKiByb3RhdGVEZWx0YS54IC8gZWxlbWVudC5jbGllbnRXaWR0aCAqIHNjb3BlLnJvdGF0ZVNwZWVkICk7XG5cdFx0XHRcdC8vIHJvdGF0aW5nIHVwIGFuZCBkb3duIGFsb25nIHdob2xlIHNjcmVlbiBhdHRlbXB0cyB0byBnbyAzNjAsIGJ1dCBsaW1pdGVkIHRvIDE4MFxuXHRcdFx0XHRzY29wZS5yb3RhdGVVcCggMiAqIE1hdGguUEkgKiByb3RhdGVEZWx0YS55IC8gZWxlbWVudC5jbGllbnRIZWlnaHQgKiBzY29wZS5yb3RhdGVTcGVlZCApO1xuXG5cdFx0XHRcdHJvdGF0ZVN0YXJ0LmNvcHkoIHJvdGF0ZUVuZCApO1xuXG5cdFx0XHRcdHNjb3BlLnVwZGF0ZSgpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAyOiAvLyB0d28tZmluZ2VyZWQgdG91Y2g6IGRvbGx5XG5cblx0XHRcdFx0aWYgKCBzY29wZS5ub1pvb20gPT09IHRydWUgKSByZXR1cm47XG5cdFx0XHRcdGlmICggc3RhdGUgIT09IFNUQVRFLlRPVUNIX0RPTExZICkgcmV0dXJuO1xuXG5cdFx0XHRcdHZhciBkeCA9IGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCAtIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWDtcblx0XHRcdFx0dmFyIGR5ID0gZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZIC0gZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VZO1xuXHRcdFx0XHR2YXIgZGlzdGFuY2UgPSBNYXRoLnNxcnQoIGR4ICogZHggKyBkeSAqIGR5ICk7XG5cblx0XHRcdFx0ZG9sbHlFbmQuc2V0KCAwLCBkaXN0YW5jZSApO1xuXHRcdFx0XHRkb2xseURlbHRhLnN1YlZlY3RvcnMoIGRvbGx5RW5kLCBkb2xseVN0YXJ0ICk7XG5cblx0XHRcdFx0aWYgKCBkb2xseURlbHRhLnkgPiAwICkge1xuXG5cdFx0XHRcdFx0c2NvcGUuZG9sbHlPdXQoKTtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0c2NvcGUuZG9sbHlJbigpO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRkb2xseVN0YXJ0LmNvcHkoIGRvbGx5RW5kICk7XG5cblx0XHRcdFx0c2NvcGUudXBkYXRlKCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIDM6IC8vIHRocmVlLWZpbmdlcmVkIHRvdWNoOiBwYW5cblxuXHRcdFx0XHRpZiAoIHNjb3BlLm5vUGFuID09PSB0cnVlICkgcmV0dXJuO1xuXHRcdFx0XHRpZiAoIHN0YXRlICE9PSBTVEFURS5UT1VDSF9QQU4gKSByZXR1cm47XG5cblx0XHRcdFx0cGFuRW5kLnNldCggZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYLCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgKTtcblx0XHRcdFx0cGFuRGVsdGEuc3ViVmVjdG9ycyggcGFuRW5kLCBwYW5TdGFydCApO1xuXG5cdFx0XHRcdHNjb3BlLnBhbiggcGFuRGVsdGEueCwgcGFuRGVsdGEueSApO1xuXG5cdFx0XHRcdHBhblN0YXJ0LmNvcHkoIHBhbkVuZCApO1xuXG5cdFx0XHRcdHNjb3BlLnVwZGF0ZSgpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0ZGVmYXVsdDpcblxuXHRcdFx0XHRzdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0XHR9XG5cblx0fVxuXG5cdGZ1bmN0aW9uIHRvdWNoZW5kKCAvKiBldmVudCAqLyApIHtcblxuXHRcdGlmICggc2NvcGUuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRzY29wZS5kaXNwYXRjaEV2ZW50KCBlbmRFdmVudCApO1xuXHRcdHN0YXRlID0gU1RBVEUuTk9ORTtcblxuXHR9XG5cblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdjb250ZXh0bWVudScsIGZ1bmN0aW9uICggZXZlbnQgKSB7IGV2ZW50LnByZXZlbnREZWZhdWx0KCk7IH0sIGZhbHNlICk7XG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgb25Nb3VzZURvd24sIGZhbHNlICk7XG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2V3aGVlbCcsIG9uTW91c2VXaGVlbCwgZmFsc2UgKTtcblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdET01Nb3VzZVNjcm9sbCcsIG9uTW91c2VXaGVlbCwgZmFsc2UgKTsgLy8gZmlyZWZveFxuXG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIHRvdWNoc3RhcnQsIGZhbHNlICk7XG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hlbmQnLCB0b3VjaGVuZCwgZmFsc2UgKTtcblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaG1vdmUnLCB0b3VjaG1vdmUsIGZhbHNlICk7XG5cblx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgb25LZXlEb3duLCBmYWxzZSApO1xuXG5cdC8vIGZvcmNlIGFuIHVwZGF0ZSBhdCBzdGFydFxuXHR0aGlzLnVwZGF0ZSgpO1xuXG59O1xuXG5USFJFRS5PcmJpdENvbnRyb2xzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRIUkVFLkV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUgKTtcblRIUkVFLk9yYml0Q29udHJvbHMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVEhSRUUuT3JiaXRDb250cm9scztcblxubW9kdWxlLmV4cG9ydHMgPSBUSFJFRS5PcmJpdENvbnRyb2xzOyIsIi8qKlxuICogQGF1dGhvciBhbHRlcmVkcSAvIGh0dHA6Ly9hbHRlcmVkcXVhbGlhLmNvbS9cbiAqIEBhdXRob2QgbXJkb29iIC8gaHR0cDovL21yZG9vYi5jb20vXG4gKiBAYXV0aG9kIGFyb2RpYyAvIGh0dHA6Ly9hbGVrc2FuZGFycm9kaWMuY29tL1xuICovXG5cblRIUkVFLlN0ZXJlb0VmZmVjdCA9IGZ1bmN0aW9uICggcmVuZGVyZXIgKSB7XG5cblx0Ly8gQVBJXG5cblx0dGhpcy5zZXBhcmF0aW9uID0gMztcblxuXHQvLyBpbnRlcm5hbHNcblxuXHR2YXIgX3dpZHRoLCBfaGVpZ2h0O1xuXG5cdHZhciBfcG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXHR2YXIgX3F1YXRlcm5pb24gPSBuZXcgVEhSRUUuUXVhdGVybmlvbigpO1xuXHR2YXIgX3NjYWxlID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuXHR2YXIgX2NhbWVyYUwgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoKTtcblx0dmFyIF9jYW1lcmFSID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKCk7XG5cblx0Ly8gaW5pdGlhbGl6YXRpb25cblxuXHRyZW5kZXJlci5hdXRvQ2xlYXIgPSBmYWxzZTtcblxuXHR0aGlzLnNldFNpemUgPSBmdW5jdGlvbiAoIHdpZHRoLCBoZWlnaHQgKSB7XG5cblx0XHRfd2lkdGggPSB3aWR0aCAvIDI7XG5cdFx0X2hlaWdodCA9IGhlaWdodDtcblxuXHRcdHJlbmRlcmVyLnNldFNpemUoIHdpZHRoLCBoZWlnaHQgKTtcblxuXHR9O1xuXG5cdHRoaXMucmVuZGVyID0gZnVuY3Rpb24gKCBzY2VuZSwgY2FtZXJhICkge1xuXG5cdFx0c2NlbmUudXBkYXRlTWF0cml4V29ybGQoKTtcblxuXHRcdGlmICggY2FtZXJhLnBhcmVudCA9PT0gdW5kZWZpbmVkICkgY2FtZXJhLnVwZGF0ZU1hdHJpeFdvcmxkKCk7XG5cdFxuXHRcdGNhbWVyYS5tYXRyaXhXb3JsZC5kZWNvbXBvc2UoIF9wb3NpdGlvbiwgX3F1YXRlcm5pb24sIF9zY2FsZSApO1xuXG5cdFx0Ly8gbGVmdFxuXG5cdFx0X2NhbWVyYUwuZm92ID0gY2FtZXJhLmZvdjtcblx0XHRfY2FtZXJhTC5hc3BlY3QgPSAwLjUgKiBjYW1lcmEuYXNwZWN0O1xuXHRcdF9jYW1lcmFMLm5lYXIgPSBjYW1lcmEubmVhcjtcblx0XHRfY2FtZXJhTC5mYXIgPSBjYW1lcmEuZmFyO1xuXHRcdF9jYW1lcmFMLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcblxuXHRcdF9jYW1lcmFMLnBvc2l0aW9uLmNvcHkoIF9wb3NpdGlvbiApO1xuXHRcdF9jYW1lcmFMLnF1YXRlcm5pb24uY29weSggX3F1YXRlcm5pb24gKTtcblx0XHRfY2FtZXJhTC50cmFuc2xhdGVYKCAtIHRoaXMuc2VwYXJhdGlvbiApO1xuXG5cdFx0Ly8gcmlnaHRcblxuXHRcdF9jYW1lcmFSLm5lYXIgPSBjYW1lcmEubmVhcjtcblx0XHRfY2FtZXJhUi5mYXIgPSBjYW1lcmEuZmFyO1xuXHRcdF9jYW1lcmFSLnByb2plY3Rpb25NYXRyaXggPSBfY2FtZXJhTC5wcm9qZWN0aW9uTWF0cml4O1xuXG5cdFx0X2NhbWVyYVIucG9zaXRpb24uY29weSggX3Bvc2l0aW9uICk7XG5cdFx0X2NhbWVyYVIucXVhdGVybmlvbi5jb3B5KCBfcXVhdGVybmlvbiApO1xuXHRcdF9jYW1lcmFSLnRyYW5zbGF0ZVgoIHRoaXMuc2VwYXJhdGlvbiApO1xuXG5cdFx0Ly9cblxuXHRcdHJlbmRlcmVyLnNldFZpZXdwb3J0KCAwLCAwLCBfd2lkdGggKiAyLCBfaGVpZ2h0ICk7XG5cdFx0cmVuZGVyZXIuY2xlYXIoKTtcblxuXHRcdHJlbmRlcmVyLnNldFZpZXdwb3J0KCAwLCAwLCBfd2lkdGgsIF9oZWlnaHQgKTtcblx0XHRyZW5kZXJlci5yZW5kZXIoIHNjZW5lLCBfY2FtZXJhTCApO1xuXG5cdFx0cmVuZGVyZXIuc2V0Vmlld3BvcnQoIF93aWR0aCwgMCwgX3dpZHRoLCBfaGVpZ2h0ICk7XG5cdFx0cmVuZGVyZXIucmVuZGVyKCBzY2VuZSwgX2NhbWVyYVIgKTtcblxuXHR9O1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRIUkVFLlN0ZXJlb0VmZmVjdDsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcblx0bmFtZSA6IFwiQ2FyYm9uIERpb3hpZGUgRWFydGhcIixcblx0ZGVzY3JpcHRpb24gOiBcIk1hcHBpbmcgTkFTQSBEYXRhXCIsXG5cdG9yZGVyIDogMCxcblx0Y29uZmlnIDoge1xuXHRcdGNhbWVyYSA6IHtcblx0XHRcdHggOiAtNDAwLFxuXHRcdFx0ZmFyIDogMzAwMFxuXHRcdH1cblx0fSxcblx0b2JqZWN0cyA6IHtcblx0XHRzcGhlcmUgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9qcy9kZW1vcy9FYXJ0aFwiKSxcblx0XHRcdHByb3BlcnRpZXM6IHt9XG5cdFx0fSxcblx0XHRjb250cm9scyA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2pzL2NvbXBvbmVudHMvY2FtZXJhcy9Db250cm9sc1wiKSxcblx0XHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdFx0bWluRGlzdGFuY2UgOiA1MDAsXG5cdFx0XHRcdG1heERpc3RhbmNlIDogMTAwMCxcblx0XHRcdFx0em9vbVNwZWVkIDogMC4xLFxuXHRcdFx0XHRhdXRvUm90YXRlIDogdHJ1ZSxcblx0XHRcdFx0YXV0b1JvdGF0ZVNwZWVkIDogMC4yXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRpbmZvIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vanMvY29tcG9uZW50cy9JbmZvXCIpLFxuXHRcdFx0cHJvcGVydGllcyA6IHtcblx0XHRcdFx0ZG9jdW1lbnRUaXRsZSA6IFwiRWFydGgncyBDTzIg4oCTIGEgVGhyZWUuanMgVmlzdWFsaXphdGlvbiBhZGFwdGVkIGJ5IEdyZWcgVGF0dW1cIixcblx0XHRcdFx0dGl0bGUgOiBcIkVhcnRoJ3MgQ08yXCIsXG5cdFx0XHRcdHN1YnRpdGxlIDogXCIzZCBWaXN1YWxpc2F0aW9uIG9mIGEgbWFwIGZyb20gTkFTQVwiLFxuXHRcdFx0XHRhcHBlbmRDcmVkaXRzIDogXCI8YnIvPiBNYXAgdmlzdWFsaXphdGlvbiBieSA8YSBocmVmPSdodHRwOi8vc3ZzLmdzZmMubmFzYS5nb3YvY2dpLWJpbi9kZXRhaWxzLmNnaT9haWQ9MTE3MTknPk5BU0EncyBHb2RkYXJkIFNwYWNlIEZsaWdodCBDZW50ZXI8L2E+XCIsXG5cdFx0XHRcdHRpdGxlQ3NzIDogeyBcImZvbnQtc2l6ZVwiOiBcIjMuMzVlbVwiIH0sXG5cdFx0XHRcdHN1YnRpdGxlQ3NzIDoge1x0XCJmb250LXNpemVcIjogXCIwLjdlbVwiIH0sXG5cdFx0XHRcdHNob3dBcnJvd05leHQgOiB0cnVlXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRzdGFycyA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2pzL2NvbXBvbmVudHMvU3RhcnNcIiksXG5cdFx0fSxcblx0XHQvLyBzdGF0cyA6IHtcblx0XHQvLyBcdG9iamVjdDogcmVxdWlyZShcIi4uL2pzL2NvbXBvbmVudHMvdXRpbHMvU3RhdHNcIilcblx0XHQvLyB9LFxuXHRcdGxpZ2h0cyA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2pzL2NvbXBvbmVudHMvbGlnaHRzL1RyYWNrQ2FtZXJhTGlnaHRzXCIpXG5cdFx0fVxuXHR9XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRuYW1lIDogXCJFbmRsZXNzIFRlcnJhaW5cIixcblx0ZGVzY3JpcHRpb24gOiBcIkFuIGV2ZXItcmVwZWF0aW5nIGVudmlyb25tZW50XCIsXG5cdG9yZGVyIDogMCxcblx0Y29uZmlnIDoge1xuXHRcdGNhbWVyYSA6IHtcblx0XHRcdHggOiAtNDAwLFxuXHRcdFx0bmVhciA6IDAuMSxcblx0XHRcdGZvdiA6IDQwXG5cdFx0fSxcblx0XHRyZW5kZXJlciA6IHtcblx0XHRcdHVzZUVmZmVjdHMgOiB0cnVlXG5cdFx0fVxuXHR9LFxuXHRvYmplY3RzIDoge1xuXHRcdGVuZGxlc3NUZXJyYWluIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vanMvZGVtb3MvRW5kbGVzc1RlcnJhaW5cIiksXG5cdFx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRcdHBvc2l0aW9uWTogLTI1MFxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0c3dpdmVsQ2FtZXJhIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vanMvY29tcG9uZW50cy9jYW1lcmFzL1N3aXZlbFwiKSxcblx0XHR9LFxuXHRcdGNvbnN0YW50TW92ZSA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2pzL2NvbXBvbmVudHMvY2FtZXJhcy9Db25zdGFudE1vdmVcIiksXG5cdFx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRcdHo6IC0yXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRjbG91ZHNUb3AgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9qcy9jb21wb25lbnRzL2FtYmlhbmNlL0Nsb3Vkc1wiKSxcblx0XHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdFx0aGVpZ2h0OiAyMDAsXG5cdFx0XHRcdHJvdGF0aW9uOiBNYXRoLlBJIC8gMlxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0bXVzaWMgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9qcy9zb3VuZC9NdXNpY1wiKSxcblx0XHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdFx0dXJsOiBcImh0dHBzOi8vc291bmRjbG91ZC5jb20vc3luYXB0eXgvbWVjaC1hdHRhY2tcIlxuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyBzdGF0cyA6IHtcblx0XHQvLyBcdG9iamVjdDogcmVxdWlyZShcIi4uL2pzL2NvbXBvbmVudHMvdXRpbHMvU3RhdHNcIilcblx0XHQvLyB9XG5cdH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cdG1lc2hHcm91cEJveERlbW8gOiByZXF1aXJlKFwiLi9tZXNoR3JvdXBCb3hEZW1vXCIpLFxuXHRjYXJib25EaW94aWRlRWFydGggOiByZXF1aXJlKFwiLi9jYXJib25EaW94aWRlRWFydGhcIiksXG5cdGVuZGxlc3NUZXJyYWluIDogcmVxdWlyZShcIi4vZW5kbGVzc1RlcnJhaW5cIiksXG5cdHZyIDogcmVxdWlyZShcIi4vdnJcIiksXG5cdHNpbmVHcmF2aXR5Q2xvdWQgOiByZXF1aXJlKFwiLi9zaW5lR3Jhdml0eUNsb3VkXCIpLFxuXHR1bmlmb3JtUG9zaXRpb25hbE1hdHJpY2VzIDogcmVxdWlyZShcIi4vdW5pZm9ybVBvc2l0aW9uYWxNYXRyaWNlc1wiKSxcblx0dGV4dHVyZVBvc2l0aW9uYWxNYXRyaWNlcyA6IHJlcXVpcmUoXCIuL3RleHR1cmVQb3NpdGlvbmFsTWF0cmljZXNcIilcbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cdG5hbWUgOiBcIk1lc2hHcm91cCgpIFByb29mIG9mIENvbmNlcHRcIixcblx0ZGVzY3JpcHRpb24gOiBcIkJhdGNoaW5nIG11bHRpcGxlIFRocmVlLmpzIG1lc2hlcyBpbnRvIG9uZSBkcmF3IGNhbGxcIixcblx0b3JkZXIgOiA1MCxcblx0Y29uZmlnIDoge1xuXHRcdGNhbWVyYSA6IHtcblx0XHRcdHggOiAtNDAwXG5cdFx0fVxuXHR9LFxuXHRvYmplY3RzIDoge1xuXHRcdGRlbW8gOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9qcy9kZW1vcy9NZXNoR3JvdXBCb3hEZW1vXCIpLFxuXHRcdFx0cHJvcGVydGllczoge31cblx0XHR9LFxuXHRcdGNvbnRyb2xzIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vanMvY29tcG9uZW50cy9jYW1lcmFzL0NvbnRyb2xzXCIpLFxuXHRcdH0sXG5cdFx0Z3JpZCA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2pzL2RlbW9zL0dyaWRcIiksXG5cdFx0fSxcblx0XHRzdGF0cyA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2pzL2NvbXBvbmVudHMvdXRpbHMvU3RhdHNcIilcblx0XHR9XG5cdH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cdG5hbWUgOiBcIlNpbmUgR3Jhdml0eSBDbG91ZFwiLFxuXHRkZXNjcmlwdGlvbiA6IFwiQW4gZXZvbHZpbmcgY2xvdWQgb2YgbW92ZW1lbnRcIixcblx0b3JkZXIgOiAwLFxuXHRjb25maWcgOiB7XG5cdFx0Y2FtZXJhIDoge1xuXHRcdFx0eCA6IC00MDBcblx0XHR9XG5cdH0sXG5cdG9iamVjdHMgOiB7XG5cdFx0Y29udHJvbHMgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9qcy9jb21wb25lbnRzL2NhbWVyYXMvQ29udHJvbHNcIiksXG5cdFx0fSxcblx0XHRwb2ludGNsb3VkIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vanMvZGVtb3MvU2luZUdyYXZpdHlDbG91ZFwiKSxcblx0XHR9LFxuXHRcdGdyaWQgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9qcy9kZW1vcy9HcmlkXCIpLFxuXHRcdH0sXG5cdFx0Ly8gc3RhdHMgOiB7XG5cdFx0Ly8gXHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9qcy9jb21wb25lbnRzL3V0aWxzL1N0YXRzXCIpXG5cdFx0Ly8gfVxuXHR9XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRuYW1lIDogXCJNZXNoR3JvdXAoKSBQcmUtQ3Vyc29yIDJcIixcblx0ZGVzY3JpcHRpb24gOiBcIlBvc2l0aW9uIG1hdHJpY2VzIHBhY2tlZCBpbnRvIGEgdGV4dHVyZVwiLFxuXHRvcmRlciA6IDUyLFxuXHRjb25maWcgOiB7XG5cdFx0Y2FtZXJhIDoge1xuXHRcdFx0eCA6IC00MDBcblx0XHR9XG5cdH0sXG5cdG9iamVjdHMgOiB7XG5cdFx0Y29udHJvbHMgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9qcy9jb21wb25lbnRzL2NhbWVyYXMvQ29udHJvbHNcIiksXG5cdFx0fSxcblx0XHR0ZXh0dXJlUG9zaXRpb25hbE1hdHJpY2VzIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vanMvZGVtb3MvdGV4dHVyZVBvc2l0aW9uYWxNYXRyaWNlc1wiKSxcblx0XHR9LFxuXHRcdGdyaWQgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9qcy9kZW1vcy9HcmlkXCIpLFxuXHRcdH0sXG5cdFx0c3RhdHMgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9qcy9jb21wb25lbnRzL3V0aWxzL1N0YXRzXCIpXG5cdFx0fVxuXHR9XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRuYW1lIDogXCJNZXNoR3JvdXAoKSBQcmUtQ3Vyc29yIDFcIixcblx0ZGVzY3JpcHRpb24gOiBcIlBvc2l0aW9uIG1hdHJpY2VzIHNldCBpbiB1bmlmb3Jtc1wiLFxuXHRvcmRlciA6IDUxLFxuXHRjb25maWcgOiB7XG5cdFx0Y2FtZXJhIDoge1xuXHRcdFx0eCA6IC00MDBcblx0XHR9XG5cdH0sXG5cdG9iamVjdHMgOiB7XG5cdFx0Y29udHJvbHMgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9qcy9jb21wb25lbnRzL2NhbWVyYXMvQ29udHJvbHNcIiksXG5cdFx0fSxcblx0XHR1bmlmb3JtUG9zaXRpb25hbE1hdHJpY2VzIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vanMvZGVtb3MvdW5pZm9ybVBvc2l0aW9uYWxNYXRyaWNlc1wiKSxcblx0XHR9LFxuXHRcdGdyaWQgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9qcy9kZW1vcy9HcmlkXCIpLFxuXHRcdH0sXG5cdFx0c3RhdHMgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9qcy9jb21wb25lbnRzL3V0aWxzL1N0YXRzXCIpXG5cdFx0fVxuXHR9XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRuYW1lIDogXCJWUiBEZW1vXCIsXG5cdGRlc2NyaXB0aW9uIDogXCJUaGUgU2luZSBHcmF2aXR5IHdhdmUgYXMgYSBWUiBkZW1vXCIsXG5cdG9yZGVyIDogMCxcblx0Y29uZmlnIDoge1xuXHRcdGNhbWVyYSA6IHtcblx0XHRcdHggOiAtMzAwLFxuXHRcdFx0Zm92IDogNzBcblx0XHR9LFxuXHRcdHJlbmRlcmVyIDoge1xuXHRcdFx0dXNlVlIgOiB0cnVlXG5cdFx0fVxuXHR9LFxuXHRvYmplY3RzIDoge1xuXHRcdHBvaW50Y2xvdWQgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9qcy9kZW1vcy9TaW5lR3Jhdml0eUNsb3VkXCIpLFxuXHRcdFx0cHJvcGVydGllczoge1xuXHRcdFx0XHRjb3VudDogNTAgKiAxMDAwLFxuXHRcdFx0XHRwb2ludFNpemUgOiA0XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRjb250cm9scyA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2pzL2NvbXBvbmVudHMvY2FtZXJhcy9PcmllbnRhdGlvblwiKSxcblx0XHR9LFxuXHRcdGNhbWVyYVJvdGF0aW9uIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vanMvY29tcG9uZW50cy9jYW1lcmFzL1JvdGF0ZUFyb3VuZE9yaWdpblwiKSxcblx0XHR9LFxuXHRcdGdyaWQgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9qcy9kZW1vcy9HcmlkXCIpLFxuXHRcdH1cblx0fVxufTsiLCIvKiogQGxpY2Vuc2VcbiAqIGNyb3Nzcm9hZHMgPGh0dHA6Ly9taWxsZXJtZWRlaXJvcy5naXRodWIuY29tL2Nyb3Nzcm9hZHMuanMvPlxuICogQXV0aG9yOiBNaWxsZXIgTWVkZWlyb3MgfCBNSVQgTGljZW5zZVxuICogdjAuMTIuMCAoMjAxMy8wMS8yMSAxMzo0NylcbiAqL1xuXG4oZnVuY3Rpb24gKCkge1xudmFyIGZhY3RvcnkgPSBmdW5jdGlvbiAoc2lnbmFscykge1xuXG4gICAgdmFyIGNyb3Nzcm9hZHMsXG4gICAgICAgIF9oYXNPcHRpb25hbEdyb3VwQnVnLFxuICAgICAgICBVTkRFRjtcblxuICAgIC8vIEhlbHBlcnMgLS0tLS0tLS0tLS1cbiAgICAvLz09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvLyBJRSA3LTggY2FwdHVyZSBvcHRpb25hbCBncm91cHMgYXMgZW1wdHkgc3RyaW5ncyB3aGlsZSBvdGhlciBicm93c2Vyc1xuICAgIC8vIGNhcHR1cmUgYXMgYHVuZGVmaW5lZGBcbiAgICBfaGFzT3B0aW9uYWxHcm91cEJ1ZyA9ICgvdCguKyk/LykuZXhlYygndCcpWzFdID09PSAnJztcblxuICAgIGZ1bmN0aW9uIGFycmF5SW5kZXhPZihhcnIsIHZhbCkge1xuICAgICAgICBpZiAoYXJyLmluZGV4T2YpIHtcbiAgICAgICAgICAgIHJldHVybiBhcnIuaW5kZXhPZih2YWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy9BcnJheS5pbmRleE9mIGRvZXNuJ3Qgd29yayBvbiBJRSA2LTdcbiAgICAgICAgICAgIHZhciBuID0gYXJyLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlIChuLS0pIHtcbiAgICAgICAgICAgICAgICBpZiAoYXJyW25dID09PSB2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXJyYXlSZW1vdmUoYXJyLCBpdGVtKSB7XG4gICAgICAgIHZhciBpID0gYXJyYXlJbmRleE9mKGFyciwgaXRlbSk7XG4gICAgICAgIGlmIChpICE9PSAtMSkge1xuICAgICAgICAgICAgYXJyLnNwbGljZShpLCAxKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzS2luZCh2YWwsIGtpbmQpIHtcbiAgICAgICAgcmV0dXJuICdbb2JqZWN0ICcrIGtpbmQgKyddJyA9PT0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNSZWdFeHAodmFsKSB7XG4gICAgICAgIHJldHVybiBpc0tpbmQodmFsLCAnUmVnRXhwJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgICAgICAgcmV0dXJuIGlzS2luZCh2YWwsICdBcnJheScpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsKSB7XG4gICAgICAgIHJldHVybiB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nO1xuICAgIH1cblxuICAgIC8vYm9ycm93ZWQgZnJvbSBBTUQtdXRpbHNcbiAgICBmdW5jdGlvbiB0eXBlY2FzdFZhbHVlKHZhbCkge1xuICAgICAgICB2YXIgcjtcbiAgICAgICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB2YWwgPT09ICdudWxsJykge1xuICAgICAgICAgICAgciA9IG51bGw7XG4gICAgICAgIH0gZWxzZSBpZiAodmFsID09PSAndHJ1ZScpIHtcbiAgICAgICAgICAgIHIgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbCA9PT0gJ2ZhbHNlJykge1xuICAgICAgICAgICAgciA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbCA9PT0gVU5ERUYgfHwgdmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgciA9IFVOREVGO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbCA9PT0gJycgfHwgaXNOYU4odmFsKSkge1xuICAgICAgICAgICAgLy9pc05hTignJykgcmV0dXJucyBmYWxzZVxuICAgICAgICAgICAgciA9IHZhbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vcGFyc2VGbG9hdChudWxsIHx8ICcnKSByZXR1cm5zIE5hTlxuICAgICAgICAgICAgciA9IHBhcnNlRmxvYXQodmFsKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0eXBlY2FzdEFycmF5VmFsdWVzKHZhbHVlcykge1xuICAgICAgICB2YXIgbiA9IHZhbHVlcy5sZW5ndGgsXG4gICAgICAgICAgICByZXN1bHQgPSBbXTtcbiAgICAgICAgd2hpbGUgKG4tLSkge1xuICAgICAgICAgICAgcmVzdWx0W25dID0gdHlwZWNhc3RWYWx1ZSh2YWx1ZXNbbl0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy9ib3Jyb3dlZCBmcm9tIEFNRC1VdGlsc1xuICAgIGZ1bmN0aW9uIGRlY29kZVF1ZXJ5U3RyaW5nKHN0ciwgc2hvdWxkVHlwZWNhc3QpIHtcbiAgICAgICAgdmFyIHF1ZXJ5QXJyID0gKHN0ciB8fCAnJykucmVwbGFjZSgnPycsICcnKS5zcGxpdCgnJicpLFxuICAgICAgICAgICAgbiA9IHF1ZXJ5QXJyLmxlbmd0aCxcbiAgICAgICAgICAgIG9iaiA9IHt9LFxuICAgICAgICAgICAgaXRlbSwgdmFsO1xuICAgICAgICB3aGlsZSAobi0tKSB7XG4gICAgICAgICAgICBpdGVtID0gcXVlcnlBcnJbbl0uc3BsaXQoJz0nKTtcbiAgICAgICAgICAgIHZhbCA9IHNob3VsZFR5cGVjYXN0ID8gdHlwZWNhc3RWYWx1ZShpdGVtWzFdKSA6IGl0ZW1bMV07XG4gICAgICAgICAgICBvYmpbaXRlbVswXV0gPSAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpPyBkZWNvZGVVUklDb21wb25lbnQodmFsKSA6IHZhbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH1cblxuXG4gICAgLy8gQ3Jvc3Nyb2FkcyAtLS0tLS0tLVxuICAgIC8vPT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGZ1bmN0aW9uIENyb3Nzcm9hZHMoKSB7XG4gICAgICAgIHRoaXMuYnlwYXNzZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICAgICAgdGhpcy5yb3V0ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICAgICAgdGhpcy5fcm91dGVzID0gW107XG4gICAgICAgIHRoaXMuX3ByZXZSb3V0ZXMgPSBbXTtcbiAgICAgICAgdGhpcy5fcGlwZWQgPSBbXTtcbiAgICAgICAgdGhpcy5yZXNldFN0YXRlKCk7XG4gICAgfVxuXG4gICAgQ3Jvc3Nyb2Fkcy5wcm90b3R5cGUgPSB7XG5cbiAgICAgICAgZ3JlZWR5IDogZmFsc2UsXG5cbiAgICAgICAgZ3JlZWR5RW5hYmxlZCA6IHRydWUsXG5cbiAgICAgICAgaWdub3JlQ2FzZSA6IHRydWUsXG5cbiAgICAgICAgaWdub3JlU3RhdGUgOiBmYWxzZSxcblxuICAgICAgICBzaG91bGRUeXBlY2FzdCA6IGZhbHNlLFxuXG4gICAgICAgIG5vcm1hbGl6ZUZuIDogbnVsbCxcblxuICAgICAgICByZXNldFN0YXRlIDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZSb3V0ZXMubGVuZ3RoID0gMDtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZNYXRjaGVkUmVxdWVzdCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9wcmV2QnlwYXNzZWRSZXF1ZXN0ID0gbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGUgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IENyb3Nzcm9hZHMoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGRSb3V0ZSA6IGZ1bmN0aW9uIChwYXR0ZXJuLCBjYWxsYmFjaywgcHJpb3JpdHkpIHtcbiAgICAgICAgICAgIHZhciByb3V0ZSA9IG5ldyBSb3V0ZShwYXR0ZXJuLCBjYWxsYmFjaywgcHJpb3JpdHksIHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5fc29ydGVkSW5zZXJ0KHJvdXRlKTtcbiAgICAgICAgICAgIHJldHVybiByb3V0ZTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVSb3V0ZSA6IGZ1bmN0aW9uIChyb3V0ZSkge1xuICAgICAgICAgICAgYXJyYXlSZW1vdmUodGhpcy5fcm91dGVzLCByb3V0ZSk7XG4gICAgICAgICAgICByb3V0ZS5fZGVzdHJveSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZUFsbFJvdXRlcyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBuID0gdGhpcy5nZXROdW1Sb3V0ZXMoKTtcbiAgICAgICAgICAgIHdoaWxlIChuLS0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yb3V0ZXNbbl0uX2Rlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3JvdXRlcy5sZW5ndGggPSAwO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBhcnNlIDogZnVuY3Rpb24gKHJlcXVlc3QsIGRlZmF1bHRBcmdzKSB7XG4gICAgICAgICAgICByZXF1ZXN0ID0gcmVxdWVzdCB8fCAnJztcbiAgICAgICAgICAgIGRlZmF1bHRBcmdzID0gZGVmYXVsdEFyZ3MgfHwgW107XG5cbiAgICAgICAgICAgIC8vIHNob3VsZCBvbmx5IGNhcmUgYWJvdXQgZGlmZmVyZW50IHJlcXVlc3RzIGlmIGlnbm9yZVN0YXRlIGlzbid0IHRydWVcbiAgICAgICAgICAgIGlmICggIXRoaXMuaWdub3JlU3RhdGUgJiZcbiAgICAgICAgICAgICAgICAocmVxdWVzdCA9PT0gdGhpcy5fcHJldk1hdGNoZWRSZXF1ZXN0IHx8XG4gICAgICAgICAgICAgICAgIHJlcXVlc3QgPT09IHRoaXMuX3ByZXZCeXBhc3NlZFJlcXVlc3QpICkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHJvdXRlcyA9IHRoaXMuX2dldE1hdGNoZWRSb3V0ZXMocmVxdWVzdCksXG4gICAgICAgICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgICAgICAgbiA9IHJvdXRlcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgY3VyO1xuXG4gICAgICAgICAgICBpZiAobikge1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZNYXRjaGVkUmVxdWVzdCA9IHJlcXVlc3Q7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9ub3RpZnlQcmV2Um91dGVzKHJvdXRlcywgcmVxdWVzdCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldlJvdXRlcyA9IHJvdXRlcztcbiAgICAgICAgICAgICAgICAvL3Nob3VsZCBiZSBpbmNyZW1lbnRhbCBsb29wLCBleGVjdXRlIHJvdXRlcyBpbiBvcmRlclxuICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgbikge1xuICAgICAgICAgICAgICAgICAgICBjdXIgPSByb3V0ZXNbaV07XG4gICAgICAgICAgICAgICAgICAgIGN1ci5yb3V0ZS5tYXRjaGVkLmRpc3BhdGNoLmFwcGx5KGN1ci5yb3V0ZS5tYXRjaGVkLCBkZWZhdWx0QXJncy5jb25jYXQoY3VyLnBhcmFtcykpO1xuICAgICAgICAgICAgICAgICAgICBjdXIuaXNGaXJzdCA9ICFpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJvdXRlZC5kaXNwYXRjaC5hcHBseSh0aGlzLnJvdXRlZCwgZGVmYXVsdEFyZ3MuY29uY2F0KFtyZXF1ZXN0LCBjdXJdKSk7XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZCeXBhc3NlZFJlcXVlc3QgPSByZXF1ZXN0O1xuICAgICAgICAgICAgICAgIHRoaXMuYnlwYXNzZWQuZGlzcGF0Y2guYXBwbHkodGhpcy5ieXBhc3NlZCwgZGVmYXVsdEFyZ3MuY29uY2F0KFtyZXF1ZXN0XSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9waXBlUGFyc2UocmVxdWVzdCwgZGVmYXVsdEFyZ3MpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9ub3RpZnlQcmV2Um91dGVzIDogZnVuY3Rpb24obWF0Y2hlZFJvdXRlcywgcmVxdWVzdCkge1xuICAgICAgICAgICAgdmFyIGkgPSAwLCBwcmV2O1xuICAgICAgICAgICAgd2hpbGUgKHByZXYgPSB0aGlzLl9wcmV2Um91dGVzW2krK10pIHtcbiAgICAgICAgICAgICAgICAvL2NoZWNrIGlmIHN3aXRjaGVkIGV4aXN0IHNpbmNlIHJvdXRlIG1heSBiZSBkaXNwb3NlZFxuICAgICAgICAgICAgICAgIGlmKHByZXYucm91dGUuc3dpdGNoZWQgJiYgdGhpcy5fZGlkU3dpdGNoKHByZXYucm91dGUsIG1hdGNoZWRSb3V0ZXMpKSB7XG4gICAgICAgICAgICAgICAgICAgIHByZXYucm91dGUuc3dpdGNoZWQuZGlzcGF0Y2gocmVxdWVzdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9kaWRTd2l0Y2ggOiBmdW5jdGlvbiAocm91dGUsIG1hdGNoZWRSb3V0ZXMpe1xuICAgICAgICAgICAgdmFyIG1hdGNoZWQsXG4gICAgICAgICAgICAgICAgaSA9IDA7XG4gICAgICAgICAgICB3aGlsZSAobWF0Y2hlZCA9IG1hdGNoZWRSb3V0ZXNbaSsrXSkge1xuICAgICAgICAgICAgICAgIC8vIG9ubHkgZGlzcGF0Y2ggc3dpdGNoZWQgaWYgaXQgaXMgZ29pbmcgdG8gYSBkaWZmZXJlbnQgcm91dGVcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlZC5yb3V0ZSA9PT0gcm91dGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9waXBlUGFyc2UgOiBmdW5jdGlvbihyZXF1ZXN0LCBkZWZhdWx0QXJncykge1xuICAgICAgICAgICAgdmFyIGkgPSAwLCByb3V0ZTtcbiAgICAgICAgICAgIHdoaWxlIChyb3V0ZSA9IHRoaXMuX3BpcGVkW2krK10pIHtcbiAgICAgICAgICAgICAgICByb3V0ZS5wYXJzZShyZXF1ZXN0LCBkZWZhdWx0QXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TnVtUm91dGVzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3JvdXRlcy5sZW5ndGg7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3NvcnRlZEluc2VydCA6IGZ1bmN0aW9uIChyb3V0ZSkge1xuICAgICAgICAgICAgLy9zaW1wbGlmaWVkIGluc2VydGlvbiBzb3J0XG4gICAgICAgICAgICB2YXIgcm91dGVzID0gdGhpcy5fcm91dGVzLFxuICAgICAgICAgICAgICAgIG4gPSByb3V0ZXMubGVuZ3RoO1xuICAgICAgICAgICAgZG8geyAtLW47IH0gd2hpbGUgKHJvdXRlc1tuXSAmJiByb3V0ZS5fcHJpb3JpdHkgPD0gcm91dGVzW25dLl9wcmlvcml0eSk7XG4gICAgICAgICAgICByb3V0ZXMuc3BsaWNlKG4rMSwgMCwgcm91dGUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRNYXRjaGVkUm91dGVzIDogZnVuY3Rpb24gKHJlcXVlc3QpIHtcbiAgICAgICAgICAgIHZhciByZXMgPSBbXSxcbiAgICAgICAgICAgICAgICByb3V0ZXMgPSB0aGlzLl9yb3V0ZXMsXG4gICAgICAgICAgICAgICAgbiA9IHJvdXRlcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgcm91dGU7XG4gICAgICAgICAgICAvL3Nob3VsZCBiZSBkZWNyZW1lbnQgbG9vcCBzaW5jZSBoaWdoZXIgcHJpb3JpdGllcyBhcmUgYWRkZWQgYXQgdGhlIGVuZCBvZiBhcnJheVxuICAgICAgICAgICAgd2hpbGUgKHJvdXRlID0gcm91dGVzWy0tbl0pIHtcbiAgICAgICAgICAgICAgICBpZiAoKCFyZXMubGVuZ3RoIHx8IHRoaXMuZ3JlZWR5IHx8IHJvdXRlLmdyZWVkeSkgJiYgcm91dGUubWF0Y2gocmVxdWVzdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgcm91dGUgOiByb3V0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcyA6IHJvdXRlLl9nZXRQYXJhbXNBcnJheShyZXF1ZXN0KVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmdyZWVkeUVuYWJsZWQgJiYgcmVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBpcGUgOiBmdW5jdGlvbiAob3RoZXJSb3V0ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3BpcGVkLnB1c2gob3RoZXJSb3V0ZXIpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVucGlwZSA6IGZ1bmN0aW9uIChvdGhlclJvdXRlcikge1xuICAgICAgICAgICAgYXJyYXlSZW1vdmUodGhpcy5fcGlwZWQsIG90aGVyUm91dGVyKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0b1N0cmluZyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAnW2Nyb3Nzcm9hZHMgbnVtUm91dGVzOicrIHRoaXMuZ2V0TnVtUm91dGVzKCkgKyddJztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvL1wic3RhdGljXCIgaW5zdGFuY2VcbiAgICBjcm9zc3JvYWRzID0gbmV3IENyb3Nzcm9hZHMoKTtcbiAgICBjcm9zc3JvYWRzLlZFUlNJT04gPSAnMC4xMi4wJztcblxuICAgIGNyb3Nzcm9hZHMuTk9STV9BU19BUlJBWSA9IGZ1bmN0aW9uIChyZXEsIHZhbHMpIHtcbiAgICAgICAgcmV0dXJuIFt2YWxzLnZhbHNfXTtcbiAgICB9O1xuXG4gICAgY3Jvc3Nyb2Fkcy5OT1JNX0FTX09CSkVDVCA9IGZ1bmN0aW9uIChyZXEsIHZhbHMpIHtcbiAgICAgICAgcmV0dXJuIFt2YWxzXTtcbiAgICB9O1xuXG5cbiAgICAvLyBSb3V0ZSAtLS0tLS0tLS0tLS0tLVxuICAgIC8vPT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBSb3V0ZShwYXR0ZXJuLCBjYWxsYmFjaywgcHJpb3JpdHksIHJvdXRlcikge1xuICAgICAgICB2YXIgaXNSZWdleFBhdHRlcm4gPSBpc1JlZ0V4cChwYXR0ZXJuKSxcbiAgICAgICAgICAgIHBhdHRlcm5MZXhlciA9IHJvdXRlci5wYXR0ZXJuTGV4ZXI7XG4gICAgICAgIHRoaXMuX3JvdXRlciA9IHJvdXRlcjtcbiAgICAgICAgdGhpcy5fcGF0dGVybiA9IHBhdHRlcm47XG4gICAgICAgIHRoaXMuX3BhcmFtc0lkcyA9IGlzUmVnZXhQYXR0ZXJuPyBudWxsIDogcGF0dGVybkxleGVyLmdldFBhcmFtSWRzKHBhdHRlcm4pO1xuICAgICAgICB0aGlzLl9vcHRpb25hbFBhcmFtc0lkcyA9IGlzUmVnZXhQYXR0ZXJuPyBudWxsIDogcGF0dGVybkxleGVyLmdldE9wdGlvbmFsUGFyYW1zSWRzKHBhdHRlcm4pO1xuICAgICAgICB0aGlzLl9tYXRjaFJlZ2V4cCA9IGlzUmVnZXhQYXR0ZXJuPyBwYXR0ZXJuIDogcGF0dGVybkxleGVyLmNvbXBpbGVQYXR0ZXJuKHBhdHRlcm4sIHJvdXRlci5pZ25vcmVDYXNlKTtcbiAgICAgICAgdGhpcy5tYXRjaGVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgICAgIHRoaXMuc3dpdGNoZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB0aGlzLm1hdGNoZWQuYWRkKGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9wcmlvcml0eSA9IHByaW9yaXR5IHx8IDA7XG4gICAgfVxuXG4gICAgUm91dGUucHJvdG90eXBlID0ge1xuXG4gICAgICAgIGdyZWVkeSA6IGZhbHNlLFxuXG4gICAgICAgIHJ1bGVzIDogdm9pZCgwKSxcblxuICAgICAgICBtYXRjaCA6IGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG4gICAgICAgICAgICByZXF1ZXN0ID0gcmVxdWVzdCB8fCAnJztcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYXRjaFJlZ2V4cC50ZXN0KHJlcXVlc3QpICYmIHRoaXMuX3ZhbGlkYXRlUGFyYW1zKHJlcXVlc3QpOyAvL3ZhbGlkYXRlIHBhcmFtcyBldmVuIGlmIHJlZ2V4cCBiZWNhdXNlIG9mIGByZXF1ZXN0X2AgcnVsZS5cbiAgICAgICAgfSxcblxuICAgICAgICBfdmFsaWRhdGVQYXJhbXMgOiBmdW5jdGlvbiAocmVxdWVzdCkge1xuICAgICAgICAgICAgdmFyIHJ1bGVzID0gdGhpcy5ydWxlcyxcbiAgICAgICAgICAgICAgICB2YWx1ZXMgPSB0aGlzLl9nZXRQYXJhbXNPYmplY3QocmVxdWVzdCksXG4gICAgICAgICAgICAgICAga2V5O1xuICAgICAgICAgICAgZm9yIChrZXkgaW4gcnVsZXMpIHtcbiAgICAgICAgICAgICAgICAvLyBub3JtYWxpemVfIGlzbid0IGEgdmFsaWRhdGlvbiBydWxlLi4uICgjMzkpXG4gICAgICAgICAgICAgICAgaWYoa2V5ICE9PSAnbm9ybWFsaXplXycgJiYgcnVsZXMuaGFzT3duUHJvcGVydHkoa2V5KSAmJiAhIHRoaXMuX2lzVmFsaWRQYXJhbShyZXF1ZXN0LCBrZXksIHZhbHVlcykpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2lzVmFsaWRQYXJhbSA6IGZ1bmN0aW9uIChyZXF1ZXN0LCBwcm9wLCB2YWx1ZXMpIHtcbiAgICAgICAgICAgIHZhciB2YWxpZGF0aW9uUnVsZSA9IHRoaXMucnVsZXNbcHJvcF0sXG4gICAgICAgICAgICAgICAgdmFsID0gdmFsdWVzW3Byb3BdLFxuICAgICAgICAgICAgICAgIGlzVmFsaWQgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICBpc1F1ZXJ5ID0gKHByb3AuaW5kZXhPZignPycpID09PSAwKTtcblxuICAgICAgICAgICAgaWYgKHZhbCA9PSBudWxsICYmIHRoaXMuX29wdGlvbmFsUGFyYW1zSWRzICYmIGFycmF5SW5kZXhPZih0aGlzLl9vcHRpb25hbFBhcmFtc0lkcywgcHJvcCkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgaXNWYWxpZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc1JlZ0V4cCh2YWxpZGF0aW9uUnVsZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNRdWVyeSkge1xuICAgICAgICAgICAgICAgICAgICB2YWwgPSB2YWx1ZXNbcHJvcCArJ18nXTsgLy91c2UgcmF3IHN0cmluZ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpc1ZhbGlkID0gdmFsaWRhdGlvblJ1bGUudGVzdCh2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaXNBcnJheSh2YWxpZGF0aW9uUnVsZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNRdWVyeSkge1xuICAgICAgICAgICAgICAgICAgICB2YWwgPSB2YWx1ZXNbcHJvcCArJ18nXTsgLy91c2UgcmF3IHN0cmluZ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpc1ZhbGlkID0gdGhpcy5faXNWYWxpZEFycmF5UnVsZSh2YWxpZGF0aW9uUnVsZSwgdmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRnVuY3Rpb24odmFsaWRhdGlvblJ1bGUpKSB7XG4gICAgICAgICAgICAgICAgaXNWYWxpZCA9IHZhbGlkYXRpb25SdWxlKHZhbCwgcmVxdWVzdCwgdmFsdWVzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGlzVmFsaWQ7IC8vZmFpbCBzaWxlbnRseSBpZiB2YWxpZGF0aW9uUnVsZSBpcyBmcm9tIGFuIHVuc3VwcG9ydGVkIHR5cGVcbiAgICAgICAgfSxcblxuICAgICAgICBfaXNWYWxpZEFycmF5UnVsZSA6IGZ1bmN0aW9uIChhcnIsIHZhbCkge1xuICAgICAgICAgICAgaWYgKCEgdGhpcy5fcm91dGVyLmlnbm9yZUNhc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJyYXlJbmRleE9mKGFyciwgdmFsKSAhPT0gLTE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHZhbCA9IHZhbC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgbiA9IGFyci5sZW5ndGgsXG4gICAgICAgICAgICAgICAgaXRlbSxcbiAgICAgICAgICAgICAgICBjb21wYXJlVmFsO1xuXG4gICAgICAgICAgICB3aGlsZSAobi0tKSB7XG4gICAgICAgICAgICAgICAgaXRlbSA9IGFycltuXTtcbiAgICAgICAgICAgICAgICBjb21wYXJlVmFsID0gKHR5cGVvZiBpdGVtID09PSAnc3RyaW5nJyk/IGl0ZW0udG9Mb3dlckNhc2UoKSA6IGl0ZW07XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBhcmVWYWwgPT09IHZhbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldFBhcmFtc09iamVjdCA6IGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG4gICAgICAgICAgICB2YXIgc2hvdWxkVHlwZWNhc3QgPSB0aGlzLl9yb3V0ZXIuc2hvdWxkVHlwZWNhc3QsXG4gICAgICAgICAgICAgICAgdmFsdWVzID0gdGhpcy5fcm91dGVyLnBhdHRlcm5MZXhlci5nZXRQYXJhbVZhbHVlcyhyZXF1ZXN0LCB0aGlzLl9tYXRjaFJlZ2V4cCwgc2hvdWxkVHlwZWNhc3QpLFxuICAgICAgICAgICAgICAgIG8gPSB7fSxcbiAgICAgICAgICAgICAgICBuID0gdmFsdWVzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBwYXJhbSwgdmFsO1xuICAgICAgICAgICAgd2hpbGUgKG4tLSkge1xuICAgICAgICAgICAgICAgIHZhbCA9IHZhbHVlc1tuXTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fcGFyYW1zSWRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmFtID0gdGhpcy5fcGFyYW1zSWRzW25dO1xuICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW0uaW5kZXhPZignPycpID09PSAwICYmIHZhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9tYWtlIGEgY29weSBvZiB0aGUgb3JpZ2luYWwgc3RyaW5nIHNvIGFycmF5IGFuZFxuICAgICAgICAgICAgICAgICAgICAgICAgLy9SZWdFeHAgdmFsaWRhdGlvbiBjYW4gYmUgYXBwbGllZCBwcm9wZXJseVxuICAgICAgICAgICAgICAgICAgICAgICAgb1twYXJhbSArJ18nXSA9IHZhbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vdXBkYXRlIHZhbHNfIGFycmF5IGFzIHdlbGwgc2luY2UgaXQgd2lsbCBiZSB1c2VkXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2R1cmluZyBkaXNwYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsID0gZGVjb2RlUXVlcnlTdHJpbmcodmFsLCBzaG91bGRUeXBlY2FzdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXNbbl0gPSB2YWw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gSUUgd2lsbCBjYXB0dXJlIG9wdGlvbmFsIGdyb3VwcyBhcyBlbXB0eSBzdHJpbmdzIHdoaWxlIG90aGVyXG4gICAgICAgICAgICAgICAgICAgIC8vIGJyb3dzZXJzIHdpbGwgY2FwdHVyZSBgdW5kZWZpbmVkYCBzbyBub3JtYWxpemUgYmVoYXZpb3IuXG4gICAgICAgICAgICAgICAgICAgIC8vIHNlZTogI2doLTU4LCAjZ2gtNTksICNnaC02MFxuICAgICAgICAgICAgICAgICAgICBpZiAoIF9oYXNPcHRpb25hbEdyb3VwQnVnICYmIHZhbCA9PT0gJycgJiYgYXJyYXlJbmRleE9mKHRoaXMuX29wdGlvbmFsUGFyYW1zSWRzLCBwYXJhbSkgIT09IC0xICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsID0gdm9pZCgwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlc1tuXSA9IHZhbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBvW3BhcmFtXSA9IHZhbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9hbGlhcyB0byBwYXRocyBhbmQgZm9yIFJlZ0V4cCBwYXR0ZXJuXG4gICAgICAgICAgICAgICAgb1tuXSA9IHZhbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG8ucmVxdWVzdF8gPSBzaG91bGRUeXBlY2FzdD8gdHlwZWNhc3RWYWx1ZShyZXF1ZXN0KSA6IHJlcXVlc3Q7XG4gICAgICAgICAgICBvLnZhbHNfID0gdmFsdWVzO1xuICAgICAgICAgICAgcmV0dXJuIG87XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldFBhcmFtc0FycmF5IDogZnVuY3Rpb24gKHJlcXVlc3QpIHtcbiAgICAgICAgICAgIHZhciBub3JtID0gdGhpcy5ydWxlcz8gdGhpcy5ydWxlcy5ub3JtYWxpemVfIDogbnVsbCxcbiAgICAgICAgICAgICAgICBwYXJhbXM7XG4gICAgICAgICAgICBub3JtID0gbm9ybSB8fCB0aGlzLl9yb3V0ZXIubm9ybWFsaXplRm47IC8vIGRlZmF1bHQgbm9ybWFsaXplXG4gICAgICAgICAgICBpZiAobm9ybSAmJiBpc0Z1bmN0aW9uKG5vcm0pKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zID0gbm9ybShyZXF1ZXN0LCB0aGlzLl9nZXRQYXJhbXNPYmplY3QocmVxdWVzdCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwYXJhbXMgPSB0aGlzLl9nZXRQYXJhbXNPYmplY3QocmVxdWVzdCkudmFsc187XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcGFyYW1zO1xuICAgICAgICB9LFxuXG4gICAgICAgIGludGVycG9sYXRlIDogZnVuY3Rpb24ocmVwbGFjZW1lbnRzKSB7XG4gICAgICAgICAgICB2YXIgc3RyID0gdGhpcy5fcm91dGVyLnBhdHRlcm5MZXhlci5pbnRlcnBvbGF0ZSh0aGlzLl9wYXR0ZXJuLCByZXBsYWNlbWVudHMpO1xuICAgICAgICAgICAgaWYgKCEgdGhpcy5fdmFsaWRhdGVQYXJhbXMoc3RyKSApIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0dlbmVyYXRlZCBzdHJpbmcgZG9lc25cXCd0IHZhbGlkYXRlIGFnYWluc3QgYFJvdXRlLnJ1bGVzYC4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzcG9zZSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuX3JvdXRlci5yZW1vdmVSb3V0ZSh0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfZGVzdHJveSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMubWF0Y2hlZC5kaXNwb3NlKCk7XG4gICAgICAgICAgICB0aGlzLnN3aXRjaGVkLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIHRoaXMubWF0Y2hlZCA9IHRoaXMuc3dpdGNoZWQgPSB0aGlzLl9wYXR0ZXJuID0gdGhpcy5fbWF0Y2hSZWdleHAgPSBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRvU3RyaW5nIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICdbUm91dGUgcGF0dGVybjpcIicrIHRoaXMuX3BhdHRlcm4gKydcIiwgbnVtTGlzdGVuZXJzOicrIHRoaXMubWF0Y2hlZC5nZXROdW1MaXN0ZW5lcnMoKSArJ10nO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG5cblxuICAgIC8vIFBhdHRlcm4gTGV4ZXIgLS0tLS0tXG4gICAgLy89PT09PT09PT09PT09PT09PT09PT1cblxuICAgIENyb3Nzcm9hZHMucHJvdG90eXBlLnBhdHRlcm5MZXhlciA9IChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdmFyXG4gICAgICAgICAgICAvL21hdGNoIGNoYXJzIHRoYXQgc2hvdWxkIGJlIGVzY2FwZWQgb24gc3RyaW5nIHJlZ2V4cFxuICAgICAgICAgICAgRVNDQVBFX0NIQVJTX1JFR0VYUCA9IC9bXFxcXC4rKj9cXF4kXFxbXFxdKCl7fVxcLycjXS9nLFxuXG4gICAgICAgICAgICAvL3RyYWlsaW5nIHNsYXNoZXMgKGJlZ2luL2VuZCBvZiBzdHJpbmcpXG4gICAgICAgICAgICBMT09TRV9TTEFTSEVTX1JFR0VYUCA9IC9eXFwvfFxcLyQvZyxcbiAgICAgICAgICAgIExFR0FDWV9TTEFTSEVTX1JFR0VYUCA9IC9cXC8kL2csXG5cbiAgICAgICAgICAgIC8vcGFyYW1zIC0gZXZlcnl0aGluZyBiZXR3ZWVuIGB7IH1gIG9yIGA6IDpgXG4gICAgICAgICAgICBQQVJBTVNfUkVHRVhQID0gLyg/Olxce3w6KShbXn06XSspKD86XFx9fDopL2csXG5cbiAgICAgICAgICAgIC8vdXNlZCB0byBzYXZlIHBhcmFtcyBkdXJpbmcgY29tcGlsZSAoYXZvaWQgZXNjYXBpbmcgdGhpbmdzIHRoYXRcbiAgICAgICAgICAgIC8vc2hvdWxkbid0IGJlIGVzY2FwZWQpLlxuICAgICAgICAgICAgVE9LRU5TID0ge1xuICAgICAgICAgICAgICAgICdPUycgOiB7XG4gICAgICAgICAgICAgICAgICAgIC8vb3B0aW9uYWwgc2xhc2hlc1xuICAgICAgICAgICAgICAgICAgICAvL3NsYXNoIGJldHdlZW4gYDo6YCBvciBgfTpgIG9yIGBcXHc6YCBvciBgOns/YCBvciBgfXs/YCBvciBgXFx3ez9gXG4gICAgICAgICAgICAgICAgICAgIHJneCA6IC8oWzp9XXxcXHcoPz1cXC8pKVxcLz8oOnwoPzpcXHtcXD8pKS9nLFxuICAgICAgICAgICAgICAgICAgICBzYXZlIDogJyQxe3tpZH19JDInLFxuICAgICAgICAgICAgICAgICAgICByZXMgOiAnXFxcXC8/J1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJ1JTJyA6IHtcbiAgICAgICAgICAgICAgICAgICAgLy9yZXF1aXJlZCBzbGFzaGVzXG4gICAgICAgICAgICAgICAgICAgIC8vdXNlZCB0byBpbnNlcnQgc2xhc2ggYmV0d2VlbiBgOntgIGFuZCBgfXtgXG4gICAgICAgICAgICAgICAgICAgIHJneCA6IC8oWzp9XSlcXC8/KFxceykvZyxcbiAgICAgICAgICAgICAgICAgICAgc2F2ZSA6ICckMXt7aWR9fSQyJyxcbiAgICAgICAgICAgICAgICAgICAgcmVzIDogJ1xcXFwvJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJ1JRJyA6IHtcbiAgICAgICAgICAgICAgICAgICAgLy9yZXF1aXJlZCBxdWVyeSBzdHJpbmcgLSBldmVyeXRoaW5nIGluIGJldHdlZW4gYHs/IH1gXG4gICAgICAgICAgICAgICAgICAgIHJneCA6IC9cXHtcXD8oW159XSspXFx9L2csXG4gICAgICAgICAgICAgICAgICAgIC8vZXZlcnl0aGluZyBmcm9tIGA/YCB0aWxsIGAjYCBvciBlbmQgb2Ygc3RyaW5nXG4gICAgICAgICAgICAgICAgICAgIHJlcyA6ICdcXFxcPyhbXiNdKyknXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnT1EnIDoge1xuICAgICAgICAgICAgICAgICAgICAvL29wdGlvbmFsIHF1ZXJ5IHN0cmluZyAtIGV2ZXJ5dGhpbmcgaW4gYmV0d2VlbiBgOj8gOmBcbiAgICAgICAgICAgICAgICAgICAgcmd4IDogLzpcXD8oW146XSspOi9nLFxuICAgICAgICAgICAgICAgICAgICAvL2V2ZXJ5dGhpbmcgZnJvbSBgP2AgdGlsbCBgI2Agb3IgZW5kIG9mIHN0cmluZ1xuICAgICAgICAgICAgICAgICAgICByZXMgOiAnKD86XFxcXD8oW14jXSopKT8nXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnT1InIDoge1xuICAgICAgICAgICAgICAgICAgICAvL29wdGlvbmFsIHJlc3QgLSBldmVyeXRoaW5nIGluIGJldHdlZW4gYDogKjpgXG4gICAgICAgICAgICAgICAgICAgIHJneCA6IC86KFteOl0rKVxcKjovZyxcbiAgICAgICAgICAgICAgICAgICAgcmVzIDogJyguKik/JyAvLyBvcHRpb25hbCBncm91cCB0byBhdm9pZCBwYXNzaW5nIGVtcHR5IHN0cmluZyBhcyBjYXB0dXJlZFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJ1JSJyA6IHtcbiAgICAgICAgICAgICAgICAgICAgLy9yZXN0IHBhcmFtIC0gZXZlcnl0aGluZyBpbiBiZXR3ZWVuIGB7ICp9YFxuICAgICAgICAgICAgICAgICAgICByZ3ggOiAvXFx7KFtefV0rKVxcKlxcfS9nLFxuICAgICAgICAgICAgICAgICAgICByZXMgOiAnKC4rKSdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIC8vIHJlcXVpcmVkL29wdGlvbmFsIHBhcmFtcyBzaG91bGQgY29tZSBhZnRlciByZXN0IHNlZ21lbnRzXG4gICAgICAgICAgICAgICAgJ1JQJyA6IHtcbiAgICAgICAgICAgICAgICAgICAgLy9yZXF1aXJlZCBwYXJhbXMgLSBldmVyeXRoaW5nIGJldHdlZW4gYHsgfWBcbiAgICAgICAgICAgICAgICAgICAgcmd4IDogL1xceyhbXn1dKylcXH0vZyxcbiAgICAgICAgICAgICAgICAgICAgcmVzIDogJyhbXlxcXFwvP10rKSdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICdPUCcgOiB7XG4gICAgICAgICAgICAgICAgICAgIC8vb3B0aW9uYWwgcGFyYW1zIC0gZXZlcnl0aGluZyBiZXR3ZWVuIGA6IDpgXG4gICAgICAgICAgICAgICAgICAgIHJneCA6IC86KFteOl0rKTovZyxcbiAgICAgICAgICAgICAgICAgICAgcmVzIDogJyhbXlxcXFwvP10rKT9cXC8/J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIExPT1NFX1NMQVNIID0gMSxcbiAgICAgICAgICAgIFNUUklDVF9TTEFTSCA9IDIsXG4gICAgICAgICAgICBMRUdBQ1lfU0xBU0ggPSAzLFxuXG4gICAgICAgICAgICBfc2xhc2hNb2RlID0gTE9PU0VfU0xBU0g7XG5cblxuICAgICAgICBmdW5jdGlvbiBwcmVjb21waWxlVG9rZW5zKCl7XG4gICAgICAgICAgICB2YXIga2V5LCBjdXI7XG4gICAgICAgICAgICBmb3IgKGtleSBpbiBUT0tFTlMpIHtcbiAgICAgICAgICAgICAgICBpZiAoVE9LRU5TLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VyID0gVE9LRU5TW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGN1ci5pZCA9ICdfX0NSXycrIGtleSArJ19fJztcbiAgICAgICAgICAgICAgICAgICAgY3VyLnNhdmUgPSAoJ3NhdmUnIGluIGN1cik/IGN1ci5zYXZlLnJlcGxhY2UoJ3t7aWR9fScsIGN1ci5pZCkgOiBjdXIuaWQ7XG4gICAgICAgICAgICAgICAgICAgIGN1ci5yUmVzdG9yZSA9IG5ldyBSZWdFeHAoY3VyLmlkLCAnZycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwcmVjb21waWxlVG9rZW5zKCk7XG5cblxuICAgICAgICBmdW5jdGlvbiBjYXB0dXJlVmFscyhyZWdleCwgcGF0dGVybikge1xuICAgICAgICAgICAgdmFyIHZhbHMgPSBbXSwgbWF0Y2g7XG4gICAgICAgICAgICAvLyB2ZXJ5IGltcG9ydGFudCB0byByZXNldCBsYXN0SW5kZXggc2luY2UgUmVnRXhwIGNhbiBoYXZlIFwiZ1wiIGZsYWdcbiAgICAgICAgICAgIC8vIGFuZCBtdWx0aXBsZSBydW5zIG1pZ2h0IGFmZmVjdCB0aGUgcmVzdWx0LCBzcGVjaWFsbHkgaWYgbWF0Y2hpbmdcbiAgICAgICAgICAgIC8vIHNhbWUgc3RyaW5nIG11bHRpcGxlIHRpbWVzIG9uIElFIDctOFxuICAgICAgICAgICAgcmVnZXgubGFzdEluZGV4ID0gMDtcbiAgICAgICAgICAgIHdoaWxlIChtYXRjaCA9IHJlZ2V4LmV4ZWMocGF0dGVybikpIHtcbiAgICAgICAgICAgICAgICB2YWxzLnB1c2gobWF0Y2hbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZhbHM7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZXRQYXJhbUlkcyhwYXR0ZXJuKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FwdHVyZVZhbHMoUEFSQU1TX1JFR0VYUCwgcGF0dGVybik7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZXRPcHRpb25hbFBhcmFtc0lkcyhwYXR0ZXJuKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FwdHVyZVZhbHMoVE9LRU5TLk9QLnJneCwgcGF0dGVybik7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBjb21waWxlUGF0dGVybihwYXR0ZXJuLCBpZ25vcmVDYXNlKSB7XG4gICAgICAgICAgICBwYXR0ZXJuID0gcGF0dGVybiB8fCAnJztcblxuICAgICAgICAgICAgaWYocGF0dGVybil7XG4gICAgICAgICAgICAgICAgaWYgKF9zbGFzaE1vZGUgPT09IExPT1NFX1NMQVNIKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhdHRlcm4gPSBwYXR0ZXJuLnJlcGxhY2UoTE9PU0VfU0xBU0hFU19SRUdFWFAsICcnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoX3NsYXNoTW9kZSA9PT0gTEVHQUNZX1NMQVNIKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhdHRlcm4gPSBwYXR0ZXJuLnJlcGxhY2UoTEVHQUNZX1NMQVNIRVNfUkVHRVhQLCAnJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy9zYXZlIHRva2Vuc1xuICAgICAgICAgICAgICAgIHBhdHRlcm4gPSByZXBsYWNlVG9rZW5zKHBhdHRlcm4sICdyZ3gnLCAnc2F2ZScpO1xuICAgICAgICAgICAgICAgIC8vcmVnZXhwIGVzY2FwZVxuICAgICAgICAgICAgICAgIHBhdHRlcm4gPSBwYXR0ZXJuLnJlcGxhY2UoRVNDQVBFX0NIQVJTX1JFR0VYUCwgJ1xcXFwkJicpO1xuICAgICAgICAgICAgICAgIC8vcmVzdG9yZSB0b2tlbnNcbiAgICAgICAgICAgICAgICBwYXR0ZXJuID0gcmVwbGFjZVRva2VucyhwYXR0ZXJuLCAnclJlc3RvcmUnLCAncmVzJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoX3NsYXNoTW9kZSA9PT0gTE9PU0VfU0xBU0gpIHtcbiAgICAgICAgICAgICAgICAgICAgcGF0dGVybiA9ICdcXFxcLz8nKyBwYXR0ZXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKF9zbGFzaE1vZGUgIT09IFNUUklDVF9TTEFTSCkge1xuICAgICAgICAgICAgICAgIC8vc2luZ2xlIHNsYXNoIGlzIHRyZWF0ZWQgYXMgZW1wdHkgYW5kIGVuZCBzbGFzaCBpcyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIHBhdHRlcm4gKz0gJ1xcXFwvPyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cCgnXicrIHBhdHRlcm4gKyAnJCcsIGlnbm9yZUNhc2U/ICdpJyA6ICcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlcGxhY2VUb2tlbnMocGF0dGVybiwgcmVnZXhwTmFtZSwgcmVwbGFjZU5hbWUpIHtcbiAgICAgICAgICAgIHZhciBjdXIsIGtleTtcbiAgICAgICAgICAgIGZvciAoa2V5IGluIFRPS0VOUykge1xuICAgICAgICAgICAgICAgIGlmIChUT0tFTlMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBjdXIgPSBUT0tFTlNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgcGF0dGVybiA9IHBhdHRlcm4ucmVwbGFjZShjdXJbcmVnZXhwTmFtZV0sIGN1cltyZXBsYWNlTmFtZV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwYXR0ZXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0UGFyYW1WYWx1ZXMocmVxdWVzdCwgcmVnZXhwLCBzaG91bGRUeXBlY2FzdCkge1xuICAgICAgICAgICAgdmFyIHZhbHMgPSByZWdleHAuZXhlYyhyZXF1ZXN0KTtcbiAgICAgICAgICAgIGlmICh2YWxzKSB7XG4gICAgICAgICAgICAgICAgdmFscy5zaGlmdCgpO1xuICAgICAgICAgICAgICAgIGlmIChzaG91bGRUeXBlY2FzdCkge1xuICAgICAgICAgICAgICAgICAgICB2YWxzID0gdHlwZWNhc3RBcnJheVZhbHVlcyh2YWxzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdmFscztcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGludGVycG9sYXRlKHBhdHRlcm4sIHJlcGxhY2VtZW50cykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXR0ZXJuICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUm91dGUgcGF0dGVybiBzaG91bGQgYmUgYSBzdHJpbmcuJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciByZXBsYWNlRm4gPSBmdW5jdGlvbihtYXRjaCwgcHJvcCl7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWw7XG4gICAgICAgICAgICAgICAgICAgIHByb3AgPSAocHJvcC5zdWJzdHIoMCwgMSkgPT09ICc/Jyk/IHByb3Auc3Vic3RyKDEpIDogcHJvcDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlcGxhY2VtZW50c1twcm9wXSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VtZW50c1twcm9wXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcXVlcnlQYXJ0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcih2YXIga2V5IGluIHJlcGxhY2VtZW50c1twcm9wXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVyeVBhcnRzLnB1c2goZW5jb2RlVVJJKGtleSArICc9JyArIHJlcGxhY2VtZW50c1twcm9wXVtrZXldKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbCA9ICc/JyArIHF1ZXJ5UGFydHMuam9pbignJicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBtYWtlIHN1cmUgdmFsdWUgaXMgYSBzdHJpbmcgc2VlICNnaC01NFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbCA9IFN0cmluZyhyZXBsYWNlbWVudHNbcHJvcF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWF0Y2guaW5kZXhPZignKicpID09PSAtMSAmJiB2YWwuaW5kZXhPZignLycpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCB2YWx1ZSBcIicrIHZhbCArJ1wiIGZvciBzZWdtZW50IFwiJysgbWF0Y2ggKydcIi4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtYXRjaC5pbmRleE9mKCd7JykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBzZWdtZW50ICcrIG1hdGNoICsnIGlzIHJlcXVpcmVkLicpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbDtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAoISBUT0tFTlMuT1MudHJhaWwpIHtcbiAgICAgICAgICAgICAgICBUT0tFTlMuT1MudHJhaWwgPSBuZXcgUmVnRXhwKCcoPzonKyBUT0tFTlMuT1MuaWQgKycpKyQnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHBhdHRlcm5cbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKFRPS0VOUy5PUy5yZ3gsIFRPS0VOUy5PUy5zYXZlKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoUEFSQU1TX1JFR0VYUCwgcmVwbGFjZUZuKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoVE9LRU5TLk9TLnRyYWlsLCAnJykgLy8gcmVtb3ZlIHRyYWlsaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZShUT0tFTlMuT1MuclJlc3RvcmUsICcvJyk7IC8vIGFkZCBzbGFzaCBiZXR3ZWVuIHNlZ21lbnRzXG4gICAgICAgIH1cblxuICAgICAgICAvL0FQSVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RyaWN0IDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBfc2xhc2hNb2RlID0gU1RSSUNUX1NMQVNIO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxvb3NlIDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBfc2xhc2hNb2RlID0gTE9PU0VfU0xBU0g7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGVnYWN5IDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBfc2xhc2hNb2RlID0gTEVHQUNZX1NMQVNIO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldFBhcmFtSWRzIDogZ2V0UGFyYW1JZHMsXG4gICAgICAgICAgICBnZXRPcHRpb25hbFBhcmFtc0lkcyA6IGdldE9wdGlvbmFsUGFyYW1zSWRzLFxuICAgICAgICAgICAgZ2V0UGFyYW1WYWx1ZXMgOiBnZXRQYXJhbVZhbHVlcyxcbiAgICAgICAgICAgIGNvbXBpbGVQYXR0ZXJuIDogY29tcGlsZVBhdHRlcm4sXG4gICAgICAgICAgICBpbnRlcnBvbGF0ZSA6IGludGVycG9sYXRlXG4gICAgICAgIH07XG5cbiAgICB9KCkpO1xuXG5cbiAgICByZXR1cm4gY3Jvc3Nyb2Fkcztcbn07XG5cbmlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoWydzaWduYWxzJ10sIGZhY3RvcnkpO1xufSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykgeyAvL05vZGVcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZSgnc2lnbmFscycpKTtcbn0gZWxzZSB7XG4gICAgLypqc2hpbnQgc3ViOnRydWUgKi9cbiAgICB3aW5kb3dbJ2Nyb3Nzcm9hZHMnXSA9IGZhY3Rvcnkod2luZG93WydzaWduYWxzJ10pO1xufVxuXG59KCkpO1xuXG4iLCIvKmpzbGludCBvbmV2YXI6dHJ1ZSwgdW5kZWY6dHJ1ZSwgbmV3Y2FwOnRydWUsIHJlZ2V4cDp0cnVlLCBiaXR3aXNlOnRydWUsIG1heGVycjo1MCwgaW5kZW50OjQsIHdoaXRlOmZhbHNlLCBub21lbjpmYWxzZSwgcGx1c3BsdXM6ZmFsc2UgKi9cbi8qZ2xvYmFsIGRlZmluZTpmYWxzZSwgcmVxdWlyZTpmYWxzZSwgZXhwb3J0czpmYWxzZSwgbW9kdWxlOmZhbHNlLCBzaWduYWxzOmZhbHNlICovXG5cbi8qKiBAbGljZW5zZVxuICogSlMgU2lnbmFscyA8aHR0cDovL21pbGxlcm1lZGVpcm9zLmdpdGh1Yi5jb20vanMtc2lnbmFscy8+XG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqIEF1dGhvcjogTWlsbGVyIE1lZGVpcm9zXG4gKiBWZXJzaW9uOiAxLjAuMCAtIEJ1aWxkOiAyNjggKDIwMTIvMTEvMjkgMDU6NDggUE0pXG4gKi9cblxuKGZ1bmN0aW9uKGdsb2JhbCl7XG5cbiAgICAvLyBTaWduYWxCaW5kaW5nIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8qKlxuICAgICAqIE9iamVjdCB0aGF0IHJlcHJlc2VudHMgYSBiaW5kaW5nIGJldHdlZW4gYSBTaWduYWwgYW5kIGEgbGlzdGVuZXIgZnVuY3Rpb24uXG4gICAgICogPGJyIC8+LSA8c3Ryb25nPlRoaXMgaXMgYW4gaW50ZXJuYWwgY29uc3RydWN0b3IgYW5kIHNob3VsZG4ndCBiZSBjYWxsZWQgYnkgcmVndWxhciB1c2Vycy48L3N0cm9uZz5cbiAgICAgKiA8YnIgLz4tIGluc3BpcmVkIGJ5IEpvYSBFYmVydCBBUzMgU2lnbmFsQmluZGluZyBhbmQgUm9iZXJ0IFBlbm5lcidzIFNsb3QgY2xhc3Nlcy5cbiAgICAgKiBAYXV0aG9yIE1pbGxlciBNZWRlaXJvc1xuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBuYW1lIFNpZ25hbEJpbmRpbmdcbiAgICAgKiBAcGFyYW0ge1NpZ25hbH0gc2lnbmFsIFJlZmVyZW5jZSB0byBTaWduYWwgb2JqZWN0IHRoYXQgbGlzdGVuZXIgaXMgY3VycmVudGx5IGJvdW5kIHRvLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyIEhhbmRsZXIgZnVuY3Rpb24gYm91bmQgdG8gdGhlIHNpZ25hbC5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzT25jZSBJZiBiaW5kaW5nIHNob3VsZCBiZSBleGVjdXRlZCBqdXN0IG9uY2UuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtsaXN0ZW5lckNvbnRleHRdIENvbnRleHQgb24gd2hpY2ggbGlzdGVuZXIgd2lsbCBiZSBleGVjdXRlZCAob2JqZWN0IHRoYXQgc2hvdWxkIHJlcHJlc2VudCB0aGUgYHRoaXNgIHZhcmlhYmxlIGluc2lkZSBsaXN0ZW5lciBmdW5jdGlvbikuXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFtwcmlvcml0eV0gVGhlIHByaW9yaXR5IGxldmVsIG9mIHRoZSBldmVudCBsaXN0ZW5lci4gKGRlZmF1bHQgPSAwKS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBTaWduYWxCaW5kaW5nKHNpZ25hbCwgbGlzdGVuZXIsIGlzT25jZSwgbGlzdGVuZXJDb250ZXh0LCBwcmlvcml0eSkge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBIYW5kbGVyIGZ1bmN0aW9uIGJvdW5kIHRvIHRoZSBzaWduYWwuXG4gICAgICAgICAqIEB0eXBlIEZ1bmN0aW9uXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9saXN0ZW5lciA9IGxpc3RlbmVyO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJZiBiaW5kaW5nIHNob3VsZCBiZSBleGVjdXRlZCBqdXN0IG9uY2UuXG4gICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2lzT25jZSA9IGlzT25jZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ29udGV4dCBvbiB3aGljaCBsaXN0ZW5lciB3aWxsIGJlIGV4ZWN1dGVkIChvYmplY3QgdGhhdCBzaG91bGQgcmVwcmVzZW50IHRoZSBgdGhpc2AgdmFyaWFibGUgaW5zaWRlIGxpc3RlbmVyIGZ1bmN0aW9uKS5cbiAgICAgICAgICogQG1lbWJlck9mIFNpZ25hbEJpbmRpbmcucHJvdG90eXBlXG4gICAgICAgICAqIEBuYW1lIGNvbnRleHRcbiAgICAgICAgICogQHR5cGUgT2JqZWN0fHVuZGVmaW5lZHxudWxsXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNvbnRleHQgPSBsaXN0ZW5lckNvbnRleHQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlZmVyZW5jZSB0byBTaWduYWwgb2JqZWN0IHRoYXQgbGlzdGVuZXIgaXMgY3VycmVudGx5IGJvdW5kIHRvLlxuICAgICAgICAgKiBAdHlwZSBTaWduYWxcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3NpZ25hbCA9IHNpZ25hbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogTGlzdGVuZXIgcHJpb3JpdHlcbiAgICAgICAgICogQHR5cGUgTnVtYmVyXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9wcmlvcml0eSA9IHByaW9yaXR5IHx8IDA7XG4gICAgfVxuXG4gICAgU2lnbmFsQmluZGluZy5wcm90b3R5cGUgPSB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIElmIGJpbmRpbmcgaXMgYWN0aXZlIGFuZCBzaG91bGQgYmUgZXhlY3V0ZWQuXG4gICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgICovXG4gICAgICAgIGFjdGl2ZSA6IHRydWUsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlZmF1bHQgcGFyYW1ldGVycyBwYXNzZWQgdG8gbGlzdGVuZXIgZHVyaW5nIGBTaWduYWwuZGlzcGF0Y2hgIGFuZCBgU2lnbmFsQmluZGluZy5leGVjdXRlYC4gKGN1cnJpZWQgcGFyYW1ldGVycylcbiAgICAgICAgICogQHR5cGUgQXJyYXl8bnVsbFxuICAgICAgICAgKi9cbiAgICAgICAgcGFyYW1zIDogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2FsbCBsaXN0ZW5lciBwYXNzaW5nIGFyYml0cmFyeSBwYXJhbWV0ZXJzLlxuICAgICAgICAgKiA8cD5JZiBiaW5kaW5nIHdhcyBhZGRlZCB1c2luZyBgU2lnbmFsLmFkZE9uY2UoKWAgaXQgd2lsbCBiZSBhdXRvbWF0aWNhbGx5IHJlbW92ZWQgZnJvbSBzaWduYWwgZGlzcGF0Y2ggcXVldWUsIHRoaXMgbWV0aG9kIGlzIHVzZWQgaW50ZXJuYWxseSBmb3IgdGhlIHNpZ25hbCBkaXNwYXRjaC48L3A+XG4gICAgICAgICAqIEBwYXJhbSB7QXJyYXl9IFtwYXJhbXNBcnJdIEFycmF5IG9mIHBhcmFtZXRlcnMgdGhhdCBzaG91bGQgYmUgcGFzc2VkIHRvIHRoZSBsaXN0ZW5lclxuICAgICAgICAgKiBAcmV0dXJuIHsqfSBWYWx1ZSByZXR1cm5lZCBieSB0aGUgbGlzdGVuZXIuXG4gICAgICAgICAqL1xuICAgICAgICBleGVjdXRlIDogZnVuY3Rpb24gKHBhcmFtc0Fycikge1xuICAgICAgICAgICAgdmFyIGhhbmRsZXJSZXR1cm4sIHBhcmFtcztcbiAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZSAmJiAhIXRoaXMuX2xpc3RlbmVyKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zID0gdGhpcy5wYXJhbXM/IHRoaXMucGFyYW1zLmNvbmNhdChwYXJhbXNBcnIpIDogcGFyYW1zQXJyO1xuICAgICAgICAgICAgICAgIGhhbmRsZXJSZXR1cm4gPSB0aGlzLl9saXN0ZW5lci5hcHBseSh0aGlzLmNvbnRleHQsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2lzT25jZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRldGFjaCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVyUmV0dXJuO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZXRhY2ggYmluZGluZyBmcm9tIHNpZ25hbC5cbiAgICAgICAgICogLSBhbGlhcyB0bzogbXlTaWduYWwucmVtb3ZlKG15QmluZGluZy5nZXRMaXN0ZW5lcigpKTtcbiAgICAgICAgICogQHJldHVybiB7RnVuY3Rpb258bnVsbH0gSGFuZGxlciBmdW5jdGlvbiBib3VuZCB0byB0aGUgc2lnbmFsIG9yIGBudWxsYCBpZiBiaW5kaW5nIHdhcyBwcmV2aW91c2x5IGRldGFjaGVkLlxuICAgICAgICAgKi9cbiAgICAgICAgZGV0YWNoIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaXNCb3VuZCgpPyB0aGlzLl9zaWduYWwucmVtb3ZlKHRoaXMuX2xpc3RlbmVyLCB0aGlzLmNvbnRleHQpIDogbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHJldHVybiB7Qm9vbGVhbn0gYHRydWVgIGlmIGJpbmRpbmcgaXMgc3RpbGwgYm91bmQgdG8gdGhlIHNpZ25hbCBhbmQgaGF2ZSBhIGxpc3RlbmVyLlxuICAgICAgICAgKi9cbiAgICAgICAgaXNCb3VuZCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAoISF0aGlzLl9zaWduYWwgJiYgISF0aGlzLl9saXN0ZW5lcik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IElmIFNpZ25hbEJpbmRpbmcgd2lsbCBvbmx5IGJlIGV4ZWN1dGVkIG9uY2UuXG4gICAgICAgICAqL1xuICAgICAgICBpc09uY2UgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faXNPbmNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gSGFuZGxlciBmdW5jdGlvbiBib3VuZCB0byB0aGUgc2lnbmFsLlxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0TGlzdGVuZXIgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbGlzdGVuZXI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZXR1cm4ge1NpZ25hbH0gU2lnbmFsIHRoYXQgbGlzdGVuZXIgaXMgY3VycmVudGx5IGJvdW5kIHRvLlxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0U2lnbmFsIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NpZ25hbDtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogRGVsZXRlIGluc3RhbmNlIHByb3BlcnRpZXNcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9kZXN0cm95IDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3NpZ25hbDtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9saXN0ZW5lcjtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmNvbnRleHQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZXR1cm4ge3N0cmluZ30gU3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBvYmplY3QuXG4gICAgICAgICAqL1xuICAgICAgICB0b1N0cmluZyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAnW1NpZ25hbEJpbmRpbmcgaXNPbmNlOicgKyB0aGlzLl9pc09uY2UgKycsIGlzQm91bmQ6JysgdGhpcy5pc0JvdW5kKCkgKycsIGFjdGl2ZTonICsgdGhpcy5hY3RpdmUgKyAnXSc7XG4gICAgICAgIH1cblxuICAgIH07XG5cblxuLypnbG9iYWwgU2lnbmFsQmluZGluZzpmYWxzZSovXG5cbiAgICAvLyBTaWduYWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIGZ1bmN0aW9uIHZhbGlkYXRlTGlzdGVuZXIobGlzdGVuZXIsIGZuTmFtZSkge1xuICAgICAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdsaXN0ZW5lciBpcyBhIHJlcXVpcmVkIHBhcmFtIG9mIHtmbn0oKSBhbmQgc2hvdWxkIGJlIGEgRnVuY3Rpb24uJy5yZXBsYWNlKCd7Zm59JywgZm5OYW1lKSApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3VzdG9tIGV2ZW50IGJyb2FkY2FzdGVyXG4gICAgICogPGJyIC8+LSBpbnNwaXJlZCBieSBSb2JlcnQgUGVubmVyJ3MgQVMzIFNpZ25hbHMuXG4gICAgICogQG5hbWUgU2lnbmFsXG4gICAgICogQGF1dGhvciBNaWxsZXIgTWVkZWlyb3NcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBTaWduYWwoKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSBBcnJheS48U2lnbmFsQmluZGluZz5cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2JpbmRpbmdzID0gW107XG4gICAgICAgIHRoaXMuX3ByZXZQYXJhbXMgPSBudWxsO1xuXG4gICAgICAgIC8vIGVuZm9yY2UgZGlzcGF0Y2ggdG8gYXdheXMgd29yayBvbiBzYW1lIGNvbnRleHQgKCM0NylcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLmRpc3BhdGNoID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIFNpZ25hbC5wcm90b3R5cGUuZGlzcGF0Y2guYXBwbHkoc2VsZiwgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBTaWduYWwucHJvdG90eXBlID0ge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTaWduYWxzIFZlcnNpb24gTnVtYmVyXG4gICAgICAgICAqIEB0eXBlIFN0cmluZ1xuICAgICAgICAgKiBAY29uc3RcbiAgICAgICAgICovXG4gICAgICAgIFZFUlNJT04gOiAnMS4wLjAnLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJZiBTaWduYWwgc2hvdWxkIGtlZXAgcmVjb3JkIG9mIHByZXZpb3VzbHkgZGlzcGF0Y2hlZCBwYXJhbWV0ZXJzIGFuZFxuICAgICAgICAgKiBhdXRvbWF0aWNhbGx5IGV4ZWN1dGUgbGlzdGVuZXIgZHVyaW5nIGBhZGQoKWAvYGFkZE9uY2UoKWAgaWYgU2lnbmFsIHdhc1xuICAgICAgICAgKiBhbHJlYWR5IGRpc3BhdGNoZWQgYmVmb3JlLlxuICAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICAqL1xuICAgICAgICBtZW1vcml6ZSA6IGZhbHNlLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfc2hvdWxkUHJvcGFnYXRlIDogdHJ1ZSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogSWYgU2lnbmFsIGlzIGFjdGl2ZSBhbmQgc2hvdWxkIGJyb2FkY2FzdCBldmVudHMuXG4gICAgICAgICAqIDxwPjxzdHJvbmc+SU1QT1JUQU5UOjwvc3Ryb25nPiBTZXR0aW5nIHRoaXMgcHJvcGVydHkgZHVyaW5nIGEgZGlzcGF0Y2ggd2lsbCBvbmx5IGFmZmVjdCB0aGUgbmV4dCBkaXNwYXRjaCwgaWYgeW91IHdhbnQgdG8gc3RvcCB0aGUgcHJvcGFnYXRpb24gb2YgYSBzaWduYWwgdXNlIGBoYWx0KClgIGluc3RlYWQuPC9wPlxuICAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICAqL1xuICAgICAgICBhY3RpdmUgOiB0cnVlLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lclxuICAgICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzT25jZVxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gW2xpc3RlbmVyQ29udGV4dF1cbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IFtwcmlvcml0eV1cbiAgICAgICAgICogQHJldHVybiB7U2lnbmFsQmluZGluZ31cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9yZWdpc3Rlckxpc3RlbmVyIDogZnVuY3Rpb24gKGxpc3RlbmVyLCBpc09uY2UsIGxpc3RlbmVyQ29udGV4dCwgcHJpb3JpdHkpIHtcblxuICAgICAgICAgICAgdmFyIHByZXZJbmRleCA9IHRoaXMuX2luZGV4T2ZMaXN0ZW5lcihsaXN0ZW5lciwgbGlzdGVuZXJDb250ZXh0KSxcbiAgICAgICAgICAgICAgICBiaW5kaW5nO1xuXG4gICAgICAgICAgICBpZiAocHJldkluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGJpbmRpbmcgPSB0aGlzLl9iaW5kaW5nc1twcmV2SW5kZXhdO1xuICAgICAgICAgICAgICAgIGlmIChiaW5kaW5nLmlzT25jZSgpICE9PSBpc09uY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgY2Fubm90IGFkZCcrIChpc09uY2U/ICcnIDogJ09uY2UnKSArJygpIHRoZW4gYWRkJysgKCFpc09uY2U/ICcnIDogJ09uY2UnKSArJygpIHRoZSBzYW1lIGxpc3RlbmVyIHdpdGhvdXQgcmVtb3ZpbmcgdGhlIHJlbGF0aW9uc2hpcCBmaXJzdC4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJpbmRpbmcgPSBuZXcgU2lnbmFsQmluZGluZyh0aGlzLCBsaXN0ZW5lciwgaXNPbmNlLCBsaXN0ZW5lckNvbnRleHQsIHByaW9yaXR5KTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRCaW5kaW5nKGJpbmRpbmcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLm1lbW9yaXplICYmIHRoaXMuX3ByZXZQYXJhbXMpe1xuICAgICAgICAgICAgICAgIGJpbmRpbmcuZXhlY3V0ZSh0aGlzLl9wcmV2UGFyYW1zKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGJpbmRpbmc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7U2lnbmFsQmluZGluZ30gYmluZGluZ1xuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX2FkZEJpbmRpbmcgOiBmdW5jdGlvbiAoYmluZGluZykge1xuICAgICAgICAgICAgLy9zaW1wbGlmaWVkIGluc2VydGlvbiBzb3J0XG4gICAgICAgICAgICB2YXIgbiA9IHRoaXMuX2JpbmRpbmdzLmxlbmd0aDtcbiAgICAgICAgICAgIGRvIHsgLS1uOyB9IHdoaWxlICh0aGlzLl9iaW5kaW5nc1tuXSAmJiBiaW5kaW5nLl9wcmlvcml0eSA8PSB0aGlzLl9iaW5kaW5nc1tuXS5fcHJpb3JpdHkpO1xuICAgICAgICAgICAgdGhpcy5fYmluZGluZ3Muc3BsaWNlKG4gKyAxLCAwLCBiaW5kaW5nKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXJcbiAgICAgICAgICogQHJldHVybiB7bnVtYmVyfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX2luZGV4T2ZMaXN0ZW5lciA6IGZ1bmN0aW9uIChsaXN0ZW5lciwgY29udGV4dCkge1xuICAgICAgICAgICAgdmFyIG4gPSB0aGlzLl9iaW5kaW5ncy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgY3VyO1xuICAgICAgICAgICAgd2hpbGUgKG4tLSkge1xuICAgICAgICAgICAgICAgIGN1ciA9IHRoaXMuX2JpbmRpbmdzW25dO1xuICAgICAgICAgICAgICAgIGlmIChjdXIuX2xpc3RlbmVyID09PSBsaXN0ZW5lciAmJiBjdXIuY29udGV4dCA9PT0gY29udGV4dCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENoZWNrIGlmIGxpc3RlbmVyIHdhcyBhdHRhY2hlZCB0byBTaWduYWwuXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbY29udGV4dF1cbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gaWYgU2lnbmFsIGhhcyB0aGUgc3BlY2lmaWVkIGxpc3RlbmVyLlxuICAgICAgICAgKi9cbiAgICAgICAgaGFzIDogZnVuY3Rpb24gKGxpc3RlbmVyLCBjb250ZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faW5kZXhPZkxpc3RlbmVyKGxpc3RlbmVyLCBjb250ZXh0KSAhPT0gLTE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFkZCBhIGxpc3RlbmVyIHRvIHRoZSBzaWduYWwuXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyIFNpZ25hbCBoYW5kbGVyIGZ1bmN0aW9uLlxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gW2xpc3RlbmVyQ29udGV4dF0gQ29udGV4dCBvbiB3aGljaCBsaXN0ZW5lciB3aWxsIGJlIGV4ZWN1dGVkIChvYmplY3QgdGhhdCBzaG91bGQgcmVwcmVzZW50IHRoZSBgdGhpc2AgdmFyaWFibGUgaW5zaWRlIGxpc3RlbmVyIGZ1bmN0aW9uKS5cbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IFtwcmlvcml0eV0gVGhlIHByaW9yaXR5IGxldmVsIG9mIHRoZSBldmVudCBsaXN0ZW5lci4gTGlzdGVuZXJzIHdpdGggaGlnaGVyIHByaW9yaXR5IHdpbGwgYmUgZXhlY3V0ZWQgYmVmb3JlIGxpc3RlbmVycyB3aXRoIGxvd2VyIHByaW9yaXR5LiBMaXN0ZW5lcnMgd2l0aCBzYW1lIHByaW9yaXR5IGxldmVsIHdpbGwgYmUgZXhlY3V0ZWQgYXQgdGhlIHNhbWUgb3JkZXIgYXMgdGhleSB3ZXJlIGFkZGVkLiAoZGVmYXVsdCA9IDApXG4gICAgICAgICAqIEByZXR1cm4ge1NpZ25hbEJpbmRpbmd9IEFuIE9iamVjdCByZXByZXNlbnRpbmcgdGhlIGJpbmRpbmcgYmV0d2VlbiB0aGUgU2lnbmFsIGFuZCBsaXN0ZW5lci5cbiAgICAgICAgICovXG4gICAgICAgIGFkZCA6IGZ1bmN0aW9uIChsaXN0ZW5lciwgbGlzdGVuZXJDb250ZXh0LCBwcmlvcml0eSkge1xuICAgICAgICAgICAgdmFsaWRhdGVMaXN0ZW5lcihsaXN0ZW5lciwgJ2FkZCcpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3JlZ2lzdGVyTGlzdGVuZXIobGlzdGVuZXIsIGZhbHNlLCBsaXN0ZW5lckNvbnRleHQsIHByaW9yaXR5KTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQWRkIGxpc3RlbmVyIHRvIHRoZSBzaWduYWwgdGhhdCBzaG91bGQgYmUgcmVtb3ZlZCBhZnRlciBmaXJzdCBleGVjdXRpb24gKHdpbGwgYmUgZXhlY3V0ZWQgb25seSBvbmNlKS5cbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgU2lnbmFsIGhhbmRsZXIgZnVuY3Rpb24uXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbbGlzdGVuZXJDb250ZXh0XSBDb250ZXh0IG9uIHdoaWNoIGxpc3RlbmVyIHdpbGwgYmUgZXhlY3V0ZWQgKG9iamVjdCB0aGF0IHNob3VsZCByZXByZXNlbnQgdGhlIGB0aGlzYCB2YXJpYWJsZSBpbnNpZGUgbGlzdGVuZXIgZnVuY3Rpb24pLlxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gW3ByaW9yaXR5XSBUaGUgcHJpb3JpdHkgbGV2ZWwgb2YgdGhlIGV2ZW50IGxpc3RlbmVyLiBMaXN0ZW5lcnMgd2l0aCBoaWdoZXIgcHJpb3JpdHkgd2lsbCBiZSBleGVjdXRlZCBiZWZvcmUgbGlzdGVuZXJzIHdpdGggbG93ZXIgcHJpb3JpdHkuIExpc3RlbmVycyB3aXRoIHNhbWUgcHJpb3JpdHkgbGV2ZWwgd2lsbCBiZSBleGVjdXRlZCBhdCB0aGUgc2FtZSBvcmRlciBhcyB0aGV5IHdlcmUgYWRkZWQuIChkZWZhdWx0ID0gMClcbiAgICAgICAgICogQHJldHVybiB7U2lnbmFsQmluZGluZ30gQW4gT2JqZWN0IHJlcHJlc2VudGluZyB0aGUgYmluZGluZyBiZXR3ZWVuIHRoZSBTaWduYWwgYW5kIGxpc3RlbmVyLlxuICAgICAgICAgKi9cbiAgICAgICAgYWRkT25jZSA6IGZ1bmN0aW9uIChsaXN0ZW5lciwgbGlzdGVuZXJDb250ZXh0LCBwcmlvcml0eSkge1xuICAgICAgICAgICAgdmFsaWRhdGVMaXN0ZW5lcihsaXN0ZW5lciwgJ2FkZE9uY2UnKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9yZWdpc3Rlckxpc3RlbmVyKGxpc3RlbmVyLCB0cnVlLCBsaXN0ZW5lckNvbnRleHQsIHByaW9yaXR5KTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVtb3ZlIGEgc2luZ2xlIGxpc3RlbmVyIGZyb20gdGhlIGRpc3BhdGNoIHF1ZXVlLlxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lciBIYW5kbGVyIGZ1bmN0aW9uIHRoYXQgc2hvdWxkIGJlIHJlbW92ZWQuXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbY29udGV4dF0gRXhlY3V0aW9uIGNvbnRleHQgKHNpbmNlIHlvdSBjYW4gYWRkIHRoZSBzYW1lIGhhbmRsZXIgbXVsdGlwbGUgdGltZXMgaWYgZXhlY3V0aW5nIGluIGEgZGlmZmVyZW50IGNvbnRleHQpLlxuICAgICAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gTGlzdGVuZXIgaGFuZGxlciBmdW5jdGlvbi5cbiAgICAgICAgICovXG4gICAgICAgIHJlbW92ZSA6IGZ1bmN0aW9uIChsaXN0ZW5lciwgY29udGV4dCkge1xuICAgICAgICAgICAgdmFsaWRhdGVMaXN0ZW5lcihsaXN0ZW5lciwgJ3JlbW92ZScpO1xuXG4gICAgICAgICAgICB2YXIgaSA9IHRoaXMuX2luZGV4T2ZMaXN0ZW5lcihsaXN0ZW5lciwgY29udGV4dCk7XG4gICAgICAgICAgICBpZiAoaSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9iaW5kaW5nc1tpXS5fZGVzdHJveSgpOyAvL25vIHJlYXNvbiB0byBhIFNpZ25hbEJpbmRpbmcgZXhpc3QgaWYgaXQgaXNuJ3QgYXR0YWNoZWQgdG8gYSBzaWduYWxcbiAgICAgICAgICAgICAgICB0aGlzLl9iaW5kaW5ncy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbGlzdGVuZXI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzIGZyb20gdGhlIFNpZ25hbC5cbiAgICAgICAgICovXG4gICAgICAgIHJlbW92ZUFsbCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBuID0gdGhpcy5fYmluZGluZ3MubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUgKG4tLSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2JpbmRpbmdzW25dLl9kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9iaW5kaW5ncy5sZW5ndGggPSAwO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IE51bWJlciBvZiBsaXN0ZW5lcnMgYXR0YWNoZWQgdG8gdGhlIFNpZ25hbC5cbiAgICAgICAgICovXG4gICAgICAgIGdldE51bUxpc3RlbmVycyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9iaW5kaW5ncy5sZW5ndGg7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN0b3AgcHJvcGFnYXRpb24gb2YgdGhlIGV2ZW50LCBibG9ja2luZyB0aGUgZGlzcGF0Y2ggdG8gbmV4dCBsaXN0ZW5lcnMgb24gdGhlIHF1ZXVlLlxuICAgICAgICAgKiA8cD48c3Ryb25nPklNUE9SVEFOVDo8L3N0cm9uZz4gc2hvdWxkIGJlIGNhbGxlZCBvbmx5IGR1cmluZyBzaWduYWwgZGlzcGF0Y2gsIGNhbGxpbmcgaXQgYmVmb3JlL2FmdGVyIGRpc3BhdGNoIHdvbid0IGFmZmVjdCBzaWduYWwgYnJvYWRjYXN0LjwvcD5cbiAgICAgICAgICogQHNlZSBTaWduYWwucHJvdG90eXBlLmRpc2FibGVcbiAgICAgICAgICovXG4gICAgICAgIGhhbHQgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9zaG91bGRQcm9wYWdhdGUgPSBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogRGlzcGF0Y2gvQnJvYWRjYXN0IFNpZ25hbCB0byBhbGwgbGlzdGVuZXJzIGFkZGVkIHRvIHRoZSBxdWV1ZS5cbiAgICAgICAgICogQHBhcmFtIHsuLi4qfSBbcGFyYW1zXSBQYXJhbWV0ZXJzIHRoYXQgc2hvdWxkIGJlIHBhc3NlZCB0byBlYWNoIGhhbmRsZXIuXG4gICAgICAgICAqL1xuICAgICAgICBkaXNwYXRjaCA6IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgICAgICAgICAgIGlmICghIHRoaXMuYWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcGFyYW1zQXJyID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSxcbiAgICAgICAgICAgICAgICBuID0gdGhpcy5fYmluZGluZ3MubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGJpbmRpbmdzO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5tZW1vcml6ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZQYXJhbXMgPSBwYXJhbXNBcnI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghIG4pIHtcbiAgICAgICAgICAgICAgICAvL3Nob3VsZCBjb21lIGFmdGVyIG1lbW9yaXplXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBiaW5kaW5ncyA9IHRoaXMuX2JpbmRpbmdzLnNsaWNlKCk7IC8vY2xvbmUgYXJyYXkgaW4gY2FzZSBhZGQvcmVtb3ZlIGl0ZW1zIGR1cmluZyBkaXNwYXRjaFxuICAgICAgICAgICAgdGhpcy5fc2hvdWxkUHJvcGFnYXRlID0gdHJ1ZTsgLy9pbiBjYXNlIGBoYWx0YCB3YXMgY2FsbGVkIGJlZm9yZSBkaXNwYXRjaCBvciBkdXJpbmcgdGhlIHByZXZpb3VzIGRpc3BhdGNoLlxuXG4gICAgICAgICAgICAvL2V4ZWN1dGUgYWxsIGNhbGxiYWNrcyB1bnRpbCBlbmQgb2YgdGhlIGxpc3Qgb3IgdW50aWwgYSBjYWxsYmFjayByZXR1cm5zIGBmYWxzZWAgb3Igc3RvcHMgcHJvcGFnYXRpb25cbiAgICAgICAgICAgIC8vcmV2ZXJzZSBsb29wIHNpbmNlIGxpc3RlbmVycyB3aXRoIGhpZ2hlciBwcmlvcml0eSB3aWxsIGJlIGFkZGVkIGF0IHRoZSBlbmQgb2YgdGhlIGxpc3RcbiAgICAgICAgICAgIGRvIHsgbi0tOyB9IHdoaWxlIChiaW5kaW5nc1tuXSAmJiB0aGlzLl9zaG91bGRQcm9wYWdhdGUgJiYgYmluZGluZ3Nbbl0uZXhlY3V0ZShwYXJhbXNBcnIpICE9PSBmYWxzZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZvcmdldCBtZW1vcml6ZWQgYXJndW1lbnRzLlxuICAgICAgICAgKiBAc2VlIFNpZ25hbC5tZW1vcml6ZVxuICAgICAgICAgKi9cbiAgICAgICAgZm9yZ2V0IDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZQYXJhbXMgPSBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmUgYWxsIGJpbmRpbmdzIGZyb20gc2lnbmFsIGFuZCBkZXN0cm95IGFueSByZWZlcmVuY2UgdG8gZXh0ZXJuYWwgb2JqZWN0cyAoZGVzdHJveSBTaWduYWwgb2JqZWN0KS5cbiAgICAgICAgICogPHA+PHN0cm9uZz5JTVBPUlRBTlQ6PC9zdHJvbmc+IGNhbGxpbmcgYW55IG1ldGhvZCBvbiB0aGUgc2lnbmFsIGluc3RhbmNlIGFmdGVyIGNhbGxpbmcgZGlzcG9zZSB3aWxsIHRocm93IGVycm9ycy48L3A+XG4gICAgICAgICAqL1xuICAgICAgICBkaXNwb3NlIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVBbGwoKTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9iaW5kaW5ncztcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9wcmV2UGFyYW1zO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IFN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgb2JqZWN0LlxuICAgICAgICAgKi9cbiAgICAgICAgdG9TdHJpbmcgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gJ1tTaWduYWwgYWN0aXZlOicrIHRoaXMuYWN0aXZlICsnIG51bUxpc3RlbmVyczonKyB0aGlzLmdldE51bUxpc3RlbmVycygpICsnXSc7XG4gICAgICAgIH1cblxuICAgIH07XG5cblxuICAgIC8vIE5hbWVzcGFjZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLyoqXG4gICAgICogU2lnbmFscyBuYW1lc3BhY2VcbiAgICAgKiBAbmFtZXNwYWNlXG4gICAgICogQG5hbWUgc2lnbmFsc1xuICAgICAqL1xuICAgIHZhciBzaWduYWxzID0gU2lnbmFsO1xuXG4gICAgLyoqXG4gICAgICogQ3VzdG9tIGV2ZW50IGJyb2FkY2FzdGVyXG4gICAgICogQHNlZSBTaWduYWxcbiAgICAgKi9cbiAgICAvLyBhbGlhcyBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgKHNlZSAjZ2gtNDQpXG4gICAgc2lnbmFscy5TaWduYWwgPSBTaWduYWw7XG5cblxuXG4gICAgLy9leHBvcnRzIHRvIG11bHRpcGxlIGVudmlyb25tZW50c1xuICAgIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCl7IC8vQU1EXG4gICAgICAgIGRlZmluZShmdW5jdGlvbiAoKSB7IHJldHVybiBzaWduYWxzOyB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKXsgLy9ub2RlXG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gc2lnbmFscztcbiAgICB9IGVsc2UgeyAvL2Jyb3dzZXJcbiAgICAgICAgLy91c2Ugc3RyaW5nIGJlY2F1c2Ugb2YgR29vZ2xlIGNsb3N1cmUgY29tcGlsZXIgQURWQU5DRURfTU9ERVxuICAgICAgICAvKmpzbGludCBzdWI6dHJ1ZSAqL1xuICAgICAgICBnbG9iYWxbJ3NpZ25hbHMnXSA9IHNpZ25hbHM7XG4gICAgfVxuXG59KHRoaXMpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gbm9vcFxuXG5mdW5jdGlvbiBub29wKCkge1xuICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnWW91IHNob3VsZCBidW5kbGUgeW91ciBjb2RlICcgK1xuICAgICAgJ3VzaW5nIGBnbHNsaWZ5YCBhcyBhIHRyYW5zZm9ybS4nXG4gIClcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gcHJvZ3JhbWlmeVxuXG5mdW5jdGlvbiBwcm9ncmFtaWZ5KHZlcnRleCwgZnJhZ21lbnQsIHVuaWZvcm1zLCBhdHRyaWJ1dGVzKSB7XG4gIHJldHVybiB7XG4gICAgdmVydGV4OiB2ZXJ0ZXgsIFxuICAgIGZyYWdtZW50OiBmcmFnbWVudCxcbiAgICB1bmlmb3JtczogdW5pZm9ybXMsIFxuICAgIGF0dHJpYnV0ZXM6IGF0dHJpYnV0ZXNcbiAgfTtcbn1cbiIsbnVsbCwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuTXV0YXRpb25PYnNlcnZlciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93Lk11dGF0aW9uT2JzZXJ2ZXI7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgdmFyIHF1ZXVlID0gW107XG5cbiAgICBpZiAoY2FuTXV0YXRpb25PYnNlcnZlcikge1xuICAgICAgICB2YXIgaGlkZGVuRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgdmFyIG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHF1ZXVlTGlzdCA9IHF1ZXVlLnNsaWNlKCk7XG4gICAgICAgICAgICBxdWV1ZS5sZW5ndGggPSAwO1xuICAgICAgICAgICAgcXVldWVMaXN0LmZvckVhY2goZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGhpZGRlbkRpdiwgeyBhdHRyaWJ1dGVzOiB0cnVlIH0pO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgaWYgKCFxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBoaWRkZW5EaXYuc2V0QXR0cmlidXRlKCd5ZXMnLCAnbm8nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbi8vIElmIG9iai5oYXNPd25Qcm9wZXJ0eSBoYXMgYmVlbiBvdmVycmlkZGVuLCB0aGVuIGNhbGxpbmdcbi8vIG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSB3aWxsIGJyZWFrLlxuLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vam95ZW50L25vZGUvaXNzdWVzLzE3MDdcbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocXMsIHNlcCwgZXEsIG9wdGlvbnMpIHtcbiAgc2VwID0gc2VwIHx8ICcmJztcbiAgZXEgPSBlcSB8fCAnPSc7XG4gIHZhciBvYmogPSB7fTtcblxuICBpZiAodHlwZW9mIHFzICE9PSAnc3RyaW5nJyB8fCBxcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgdmFyIHJlZ2V4cCA9IC9cXCsvZztcbiAgcXMgPSBxcy5zcGxpdChzZXApO1xuXG4gIHZhciBtYXhLZXlzID0gMTAwMDtcbiAgaWYgKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMubWF4S2V5cyA9PT0gJ251bWJlcicpIHtcbiAgICBtYXhLZXlzID0gb3B0aW9ucy5tYXhLZXlzO1xuICB9XG5cbiAgdmFyIGxlbiA9IHFzLmxlbmd0aDtcbiAgLy8gbWF4S2V5cyA8PSAwIG1lYW5zIHRoYXQgd2Ugc2hvdWxkIG5vdCBsaW1pdCBrZXlzIGNvdW50XG4gIGlmIChtYXhLZXlzID4gMCAmJiBsZW4gPiBtYXhLZXlzKSB7XG4gICAgbGVuID0gbWF4S2V5cztcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICB2YXIgeCA9IHFzW2ldLnJlcGxhY2UocmVnZXhwLCAnJTIwJyksXG4gICAgICAgIGlkeCA9IHguaW5kZXhPZihlcSksXG4gICAgICAgIGtzdHIsIHZzdHIsIGssIHY7XG5cbiAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgIGtzdHIgPSB4LnN1YnN0cigwLCBpZHgpO1xuICAgICAgdnN0ciA9IHguc3Vic3RyKGlkeCArIDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBrc3RyID0geDtcbiAgICAgIHZzdHIgPSAnJztcbiAgICB9XG5cbiAgICBrID0gZGVjb2RlVVJJQ29tcG9uZW50KGtzdHIpO1xuICAgIHYgPSBkZWNvZGVVUklDb21wb25lbnQodnN0cik7XG5cbiAgICBpZiAoIWhhc093blByb3BlcnR5KG9iaiwgaykpIHtcbiAgICAgIG9ialtrXSA9IHY7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KG9ialtrXSkpIHtcbiAgICAgIG9ialtrXS5wdXNoKHYpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvYmpba10gPSBbb2JqW2tdLCB2XTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufTtcblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uICh4cykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHhzKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3RyaW5naWZ5UHJpbWl0aXZlID0gZnVuY3Rpb24odikge1xuICBzd2l0Y2ggKHR5cGVvZiB2KSB7XG4gICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgIHJldHVybiB2O1xuXG4gICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICByZXR1cm4gdiA/ICd0cnVlJyA6ICdmYWxzZSc7XG5cbiAgICBjYXNlICdudW1iZXInOlxuICAgICAgcmV0dXJuIGlzRmluaXRlKHYpID8gdiA6ICcnO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAnJztcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmosIHNlcCwgZXEsIG5hbWUpIHtcbiAgc2VwID0gc2VwIHx8ICcmJztcbiAgZXEgPSBlcSB8fCAnPSc7XG4gIGlmIChvYmogPT09IG51bGwpIHtcbiAgICBvYmogPSB1bmRlZmluZWQ7XG4gIH1cblxuICBpZiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gbWFwKG9iamVjdEtleXMob2JqKSwgZnVuY3Rpb24oaykge1xuICAgICAgdmFyIGtzID0gZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShrKSkgKyBlcTtcbiAgICAgIGlmIChpc0FycmF5KG9ialtrXSkpIHtcbiAgICAgICAgcmV0dXJuIG1hcChvYmpba10sIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICByZXR1cm4ga3MgKyBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKHYpKTtcbiAgICAgICAgfSkuam9pbihzZXApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGtzICsgZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShvYmpba10pKTtcbiAgICAgIH1cbiAgICB9KS5qb2luKHNlcCk7XG5cbiAgfVxuXG4gIGlmICghbmFtZSkgcmV0dXJuICcnO1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShuYW1lKSkgKyBlcSArXG4gICAgICAgICBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG9iaikpO1xufTtcblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uICh4cykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHhzKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbmZ1bmN0aW9uIG1hcCAoeHMsIGYpIHtcbiAgaWYgKHhzLm1hcCkgcmV0dXJuIHhzLm1hcChmKTtcbiAgdmFyIHJlcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgcmVzLnB1c2goZih4c1tpXSwgaSkpO1xuICB9XG4gIHJldHVybiByZXM7XG59XG5cbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICB2YXIgcmVzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgcmVzLnB1c2goa2V5KTtcbiAgfVxuICByZXR1cm4gcmVzO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5kZWNvZGUgPSBleHBvcnRzLnBhcnNlID0gcmVxdWlyZSgnLi9kZWNvZGUnKTtcbmV4cG9ydHMuZW5jb2RlID0gZXhwb3J0cy5zdHJpbmdpZnkgPSByZXF1aXJlKCcuL2VuY29kZScpO1xuIiwiLyohIVxuICogSGFzaGVyIDxodHRwOi8vZ2l0aHViLmNvbS9taWxsZXJtZWRlaXJvcy9oYXNoZXI+XG4gKiBAYXV0aG9yIE1pbGxlciBNZWRlaXJvc1xuICogQHZlcnNpb24gMS4yLjAgKDIwMTMvMTEvMTEgMDM6MTggUE0pXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2VcbiAqL1xuXG47KGZ1bmN0aW9uICgpIHtcbnZhciBmYWN0b3J5ID0gZnVuY3Rpb24oc2lnbmFscyl7XG5cbi8qanNoaW50IHdoaXRlOmZhbHNlKi9cbi8qZ2xvYmFsIHNpZ25hbHM6ZmFsc2UsIHdpbmRvdzpmYWxzZSovXG5cbi8qKlxuICogSGFzaGVyXG4gKiBAbmFtZXNwYWNlIEhpc3RvcnkgTWFuYWdlciBmb3IgcmljaC1tZWRpYSBhcHBsaWNhdGlvbnMuXG4gKiBAbmFtZSBoYXNoZXJcbiAqL1xudmFyIGhhc2hlciA9IChmdW5jdGlvbih3aW5kb3cpe1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIFByaXZhdGUgVmFyc1xuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIHZhclxuXG4gICAgICAgIC8vIGZyZXF1ZW5jeSB0aGF0IGl0IHdpbGwgY2hlY2sgaGFzaCB2YWx1ZSBvbiBJRSA2LTcgc2luY2UgaXQgZG9lc24ndFxuICAgICAgICAvLyBzdXBwb3J0IHRoZSBoYXNoY2hhbmdlIGV2ZW50XG4gICAgICAgIFBPT0xfSU5URVJWQUwgPSAyNSxcblxuICAgICAgICAvLyBsb2NhbCBzdG9yYWdlIGZvciBicmV2aXR5IGFuZCBiZXR0ZXIgY29tcHJlc3Npb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgICAgICBkb2N1bWVudCA9IHdpbmRvdy5kb2N1bWVudCxcbiAgICAgICAgaGlzdG9yeSA9IHdpbmRvdy5oaXN0b3J5LFxuICAgICAgICBTaWduYWwgPSBzaWduYWxzLlNpZ25hbCxcblxuICAgICAgICAvLyBsb2NhbCB2YXJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgICAgICBoYXNoZXIsXG4gICAgICAgIF9oYXNoLFxuICAgICAgICBfY2hlY2tJbnRlcnZhbCxcbiAgICAgICAgX2lzQWN0aXZlLFxuICAgICAgICBfZnJhbWUsIC8vaWZyYW1lIHVzZWQgZm9yIGxlZ2FjeSBJRSAoNi03KVxuICAgICAgICBfY2hlY2tIaXN0b3J5LFxuICAgICAgICBfaGFzaFZhbFJlZ2V4cCA9IC8jKC4qKSQvLFxuICAgICAgICBfYmFzZVVybFJlZ2V4cCA9IC8oXFw/LiopfChcXCMuKikvLFxuICAgICAgICBfaGFzaFJlZ2V4cCA9IC9eXFwjLyxcblxuICAgICAgICAvLyBzbmlmZmluZy9mZWF0dXJlIGRldGVjdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAgICAgLy9oYWNrIGJhc2VkIG9uIHRoaXM6IGh0dHA6Ly93ZWJyZWZsZWN0aW9uLmJsb2dzcG90LmNvbS8yMDA5LzAxLzMyLWJ5dGVzLXRvLWtub3ctaWYteW91ci1icm93c2VyLWlzLWllLmh0bWxcbiAgICAgICAgX2lzSUUgPSAoIStcIlxcdjFcIiksXG4gICAgICAgIC8vIGhhc2hjaGFuZ2UgaXMgc3VwcG9ydGVkIGJ5IEZGMy42KywgSUU4KywgQ2hyb21lIDUrLCBTYWZhcmkgNSsgYnV0XG4gICAgICAgIC8vIGZlYXR1cmUgZGV0ZWN0aW9uIGZhaWxzIG9uIElFIGNvbXBhdGliaWxpdHkgbW9kZSwgc28gd2UgbmVlZCB0b1xuICAgICAgICAvLyBjaGVjayBkb2N1bWVudE1vZGVcbiAgICAgICAgX2lzSGFzaENoYW5nZVN1cHBvcnRlZCA9ICgnb25oYXNoY2hhbmdlJyBpbiB3aW5kb3cpICYmIGRvY3VtZW50LmRvY3VtZW50TW9kZSAhPT0gNyxcbiAgICAgICAgLy9jaGVjayBpZiBpcyBJRTYtNyBzaW5jZSBoYXNoIGNoYW5nZSBpcyBvbmx5IHN1cHBvcnRlZCBvbiBJRTgrIGFuZFxuICAgICAgICAvL2NoYW5naW5nIGhhc2ggdmFsdWUgb24gSUU2LTcgZG9lc24ndCBnZW5lcmF0ZSBoaXN0b3J5IHJlY29yZC5cbiAgICAgICAgX2lzTGVnYWN5SUUgPSBfaXNJRSAmJiAhX2lzSGFzaENoYW5nZVN1cHBvcnRlZCxcbiAgICAgICAgX2lzTG9jYWwgPSAobG9jYXRpb24ucHJvdG9jb2wgPT09ICdmaWxlOicpO1xuXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gUHJpdmF0ZSBNZXRob2RzXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgZnVuY3Rpb24gX2VzY2FwZVJlZ0V4cChzdHIpe1xuICAgICAgICByZXR1cm4gU3RyaW5nKHN0ciB8fCAnJykucmVwbGFjZSgvXFxXL2csIFwiXFxcXCQmXCIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF90cmltSGFzaChoYXNoKXtcbiAgICAgICAgaWYgKCFoYXNoKSByZXR1cm4gJyc7XG4gICAgICAgIHZhciByZWdleHAgPSBuZXcgUmVnRXhwKCdeJyArIF9lc2NhcGVSZWdFeHAoaGFzaGVyLnByZXBlbmRIYXNoKSArICd8JyArIF9lc2NhcGVSZWdFeHAoaGFzaGVyLmFwcGVuZEhhc2gpICsgJyQnLCAnZycpO1xuICAgICAgICByZXR1cm4gaGFzaC5yZXBsYWNlKHJlZ2V4cCwgJycpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9nZXRXaW5kb3dIYXNoKCl7XG4gICAgICAgIC8vcGFyc2VkIGZ1bGwgVVJMIGluc3RlYWQgb2YgZ2V0dGluZyB3aW5kb3cubG9jYXRpb24uaGFzaCBiZWNhdXNlIEZpcmVmb3ggZGVjb2RlIGhhc2ggdmFsdWUgKGFuZCBhbGwgdGhlIG90aGVyIGJyb3dzZXJzIGRvbid0KVxuICAgICAgICAvL2Fsc28gYmVjYXVzZSBvZiBJRTggYnVnIHdpdGggaGFzaCBxdWVyeSBpbiBsb2NhbCBmaWxlIFtpc3N1ZSAjNl1cbiAgICAgICAgdmFyIHJlc3VsdCA9IF9oYXNoVmFsUmVnZXhwLmV4ZWMoIGhhc2hlci5nZXRVUkwoKSApO1xuICAgICAgICB2YXIgcGF0aCA9IChyZXN1bHQgJiYgcmVzdWx0WzFdKSB8fCAnJztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gaGFzaGVyLnJhdz8gcGF0aCA6IGRlY29kZVVSSUNvbXBvbmVudChwYXRoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIC8vIGluIGNhc2UgdXNlciBkaWQgbm90IHNldCBgaGFzaGVyLnJhd2AgYW5kIGRlY29kZVVSSUNvbXBvbmVudFxuICAgICAgICAgIC8vIHRocm93cyBhbiBlcnJvciAoc2VlICM1NylcbiAgICAgICAgICByZXR1cm4gcGF0aDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9nZXRGcmFtZUhhc2goKXtcbiAgICAgICAgcmV0dXJuIChfZnJhbWUpPyBfZnJhbWUuY29udGVudFdpbmRvdy5mcmFtZUhhc2ggOiBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9jcmVhdGVGcmFtZSgpe1xuICAgICAgICBfZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgICAgICAgX2ZyYW1lLnNyYyA9ICdhYm91dDpibGFuayc7XG4gICAgICAgIF9mcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKF9mcmFtZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3VwZGF0ZUZyYW1lKCl7XG4gICAgICAgIGlmKF9mcmFtZSAmJiBfaGFzaCAhPT0gX2dldEZyYW1lSGFzaCgpKXtcbiAgICAgICAgICAgIHZhciBmcmFtZURvYyA9IF9mcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50O1xuICAgICAgICAgICAgZnJhbWVEb2Mub3BlbigpO1xuICAgICAgICAgICAgLy91cGRhdGUgaWZyYW1lIGNvbnRlbnQgdG8gZm9yY2UgbmV3IGhpc3RvcnkgcmVjb3JkLlxuICAgICAgICAgICAgLy9iYXNlZCBvbiBSZWFsbHkgU2ltcGxlIEhpc3RvcnksIFNXRkFkZHJlc3MgYW5kIFlVSS5oaXN0b3J5LlxuICAgICAgICAgICAgZnJhbWVEb2Mud3JpdGUoJzxodG1sPjxoZWFkPjx0aXRsZT4nICsgZG9jdW1lbnQudGl0bGUgKyAnPC90aXRsZT48c2NyaXB0IHR5cGU9XCJ0ZXh0L2phdmFzY3JpcHRcIj52YXIgZnJhbWVIYXNoPVwiJyArIF9oYXNoICsgJ1wiOzwvc2NyaXB0PjwvaGVhZD48Ym9keT4mbmJzcDs8L2JvZHk+PC9odG1sPicpO1xuICAgICAgICAgICAgZnJhbWVEb2MuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9yZWdpc3RlckNoYW5nZShuZXdIYXNoLCBpc1JlcGxhY2Upe1xuICAgICAgICBpZihfaGFzaCAhPT0gbmV3SGFzaCl7XG4gICAgICAgICAgICB2YXIgb2xkSGFzaCA9IF9oYXNoO1xuICAgICAgICAgICAgX2hhc2ggPSBuZXdIYXNoOyAvL3Nob3VsZCBjb21lIGJlZm9yZSBldmVudCBkaXNwYXRjaCB0byBtYWtlIHN1cmUgdXNlciBjYW4gZ2V0IHByb3BlciB2YWx1ZSBpbnNpZGUgZXZlbnQgaGFuZGxlclxuICAgICAgICAgICAgaWYoX2lzTGVnYWN5SUUpe1xuICAgICAgICAgICAgICAgIGlmKCFpc1JlcGxhY2Upe1xuICAgICAgICAgICAgICAgICAgICBfdXBkYXRlRnJhbWUoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBfZnJhbWUuY29udGVudFdpbmRvdy5mcmFtZUhhc2ggPSBuZXdIYXNoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGhhc2hlci5jaGFuZ2VkLmRpc3BhdGNoKF90cmltSGFzaChuZXdIYXNoKSwgX3RyaW1IYXNoKG9sZEhhc2gpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChfaXNMZWdhY3lJRSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9jaGVja0hpc3RvcnkgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgdmFyIHdpbmRvd0hhc2ggPSBfZ2V0V2luZG93SGFzaCgpLFxuICAgICAgICAgICAgICAgIGZyYW1lSGFzaCA9IF9nZXRGcmFtZUhhc2goKTtcbiAgICAgICAgICAgIGlmKGZyYW1lSGFzaCAhPT0gX2hhc2ggJiYgZnJhbWVIYXNoICE9PSB3aW5kb3dIYXNoKXtcbiAgICAgICAgICAgICAgICAvL2RldGVjdCBjaGFuZ2VzIG1hZGUgcHJlc3NpbmcgYnJvd3NlciBoaXN0b3J5IGJ1dHRvbnMuXG4gICAgICAgICAgICAgICAgLy9Xb3JrYXJvdW5kIHNpbmNlIGhpc3RvcnkuYmFjaygpIGFuZCBoaXN0b3J5LmZvcndhcmQoKSBkb2Vzbid0XG4gICAgICAgICAgICAgICAgLy91cGRhdGUgaGFzaCB2YWx1ZSBvbiBJRTYvNyBidXQgdXBkYXRlcyBjb250ZW50IG9mIHRoZSBpZnJhbWUuXG4gICAgICAgICAgICAgICAgLy9uZWVkcyB0byB0cmltIGhhc2ggc2luY2UgdmFsdWUgc3RvcmVkIGFscmVhZHkgaGF2ZVxuICAgICAgICAgICAgICAgIC8vcHJlcGVuZEhhc2ggKyBhcHBlbmRIYXNoIGZvciBmYXN0IGNoZWNrLlxuICAgICAgICAgICAgICAgIGhhc2hlci5zZXRIYXNoKF90cmltSGFzaChmcmFtZUhhc2gpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAod2luZG93SGFzaCAhPT0gX2hhc2gpe1xuICAgICAgICAgICAgICAgIC8vZGV0ZWN0IGlmIGhhc2ggY2hhbmdlZCAobWFudWFsbHkgb3IgdXNpbmcgc2V0SGFzaClcbiAgICAgICAgICAgICAgICBfcmVnaXN0ZXJDaGFuZ2Uod2luZG93SGFzaCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfY2hlY2tIaXN0b3J5ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZhciB3aW5kb3dIYXNoID0gX2dldFdpbmRvd0hhc2goKTtcbiAgICAgICAgICAgIGlmKHdpbmRvd0hhc2ggIT09IF9oYXNoKXtcbiAgICAgICAgICAgICAgICBfcmVnaXN0ZXJDaGFuZ2Uod2luZG93SGFzaCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FkZExpc3RlbmVyKGVsbSwgZVR5cGUsIGZuKXtcbiAgICAgICAgaWYoZWxtLmFkZEV2ZW50TGlzdGVuZXIpe1xuICAgICAgICAgICAgZWxtLmFkZEV2ZW50TGlzdGVuZXIoZVR5cGUsIGZuLCBmYWxzZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZWxtLmF0dGFjaEV2ZW50KXtcbiAgICAgICAgICAgIGVsbS5hdHRhY2hFdmVudCgnb24nICsgZVR5cGUsIGZuKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9yZW1vdmVMaXN0ZW5lcihlbG0sIGVUeXBlLCBmbil7XG4gICAgICAgIGlmKGVsbS5yZW1vdmVFdmVudExpc3RlbmVyKXtcbiAgICAgICAgICAgIGVsbS5yZW1vdmVFdmVudExpc3RlbmVyKGVUeXBlLCBmbiwgZmFsc2UpO1xuICAgICAgICB9IGVsc2UgaWYgKGVsbS5kZXRhY2hFdmVudCl7XG4gICAgICAgICAgICBlbG0uZGV0YWNoRXZlbnQoJ29uJyArIGVUeXBlLCBmbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbWFrZVBhdGgocGF0aHMpe1xuICAgICAgICBwYXRocyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG5cbiAgICAgICAgdmFyIHBhdGggPSBwYXRocy5qb2luKGhhc2hlci5zZXBhcmF0b3IpO1xuICAgICAgICBwYXRoID0gcGF0aD8gaGFzaGVyLnByZXBlbmRIYXNoICsgcGF0aC5yZXBsYWNlKF9oYXNoUmVnZXhwLCAnJykgKyBoYXNoZXIuYXBwZW5kSGFzaCA6IHBhdGg7XG4gICAgICAgIHJldHVybiBwYXRoO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9lbmNvZGVQYXRoKHBhdGgpe1xuICAgICAgICAvL3VzZWQgZW5jb2RlVVJJIGluc3RlYWQgb2YgZW5jb2RlVVJJQ29tcG9uZW50IHRvIHByZXNlcnZlICc/JywgJy8nLFxuICAgICAgICAvLycjJy4gRml4ZXMgU2FmYXJpIGJ1ZyBbaXNzdWUgIzhdXG4gICAgICAgIHBhdGggPSBlbmNvZGVVUkkocGF0aCk7XG4gICAgICAgIGlmKF9pc0lFICYmIF9pc0xvY2FsKXtcbiAgICAgICAgICAgIC8vZml4IElFOCBsb2NhbCBmaWxlIGJ1ZyBbaXNzdWUgIzZdXG4gICAgICAgICAgICBwYXRoID0gcGF0aC5yZXBsYWNlKC9cXD8vLCAnJTNGJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhdGg7XG4gICAgfVxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIFB1YmxpYyAoQVBJKVxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIGhhc2hlciA9IC8qKiBAbGVuZHMgaGFzaGVyICovIHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogaGFzaGVyIFZlcnNpb24gTnVtYmVyXG4gICAgICAgICAqIEB0eXBlIHN0cmluZ1xuICAgICAgICAgKiBAY29uc3RhbnRcbiAgICAgICAgICovXG4gICAgICAgIFZFUlNJT04gOiAnMS4yLjAnLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBCb29sZWFuIGRlY2lkaW5nIGlmIGhhc2hlciBlbmNvZGVzL2RlY29kZXMgdGhlIGhhc2ggb3Igbm90LlxuICAgICAgICAgKiA8dWw+XG4gICAgICAgICAqIDxsaT5kZWZhdWx0IHZhbHVlOiBmYWxzZTs8L2xpPlxuICAgICAgICAgKiA8L3VsPlxuICAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICAqL1xuICAgICAgICByYXcgOiBmYWxzZSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogU3RyaW5nIHRoYXQgc2hvdWxkIGFsd2F5cyBiZSBhZGRlZCB0byB0aGUgZW5kIG9mIEhhc2ggdmFsdWUuXG4gICAgICAgICAqIDx1bD5cbiAgICAgICAgICogPGxpPmRlZmF1bHQgdmFsdWU6ICcnOzwvbGk+XG4gICAgICAgICAqIDxsaT53aWxsIGJlIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZCBmcm9tIGBoYXNoZXIuZ2V0SGFzaCgpYDwvbGk+XG4gICAgICAgICAqIDxsaT5hdm9pZCBjb25mbGljdHMgd2l0aCBlbGVtZW50cyB0aGF0IGNvbnRhaW4gSUQgZXF1YWwgdG8gaGFzaCB2YWx1ZTs8L2xpPlxuICAgICAgICAgKiA8L3VsPlxuICAgICAgICAgKiBAdHlwZSBzdHJpbmdcbiAgICAgICAgICovXG4gICAgICAgIGFwcGVuZEhhc2ggOiAnJyxcblxuICAgICAgICAvKipcbiAgICAgICAgICogU3RyaW5nIHRoYXQgc2hvdWxkIGFsd2F5cyBiZSBhZGRlZCB0byB0aGUgYmVnaW5uaW5nIG9mIEhhc2ggdmFsdWUuXG4gICAgICAgICAqIDx1bD5cbiAgICAgICAgICogPGxpPmRlZmF1bHQgdmFsdWU6ICcvJzs8L2xpPlxuICAgICAgICAgKiA8bGk+d2lsbCBiZSBhdXRvbWF0aWNhbGx5IHJlbW92ZWQgZnJvbSBgaGFzaGVyLmdldEhhc2goKWA8L2xpPlxuICAgICAgICAgKiA8bGk+YXZvaWQgY29uZmxpY3RzIHdpdGggZWxlbWVudHMgdGhhdCBjb250YWluIElEIGVxdWFsIHRvIGhhc2ggdmFsdWU7PC9saT5cbiAgICAgICAgICogPC91bD5cbiAgICAgICAgICogQHR5cGUgc3RyaW5nXG4gICAgICAgICAqL1xuICAgICAgICBwcmVwZW5kSGFzaCA6ICcvJyxcblxuICAgICAgICAvKipcbiAgICAgICAgICogU3RyaW5nIHVzZWQgdG8gc3BsaXQgaGFzaCBwYXRoczsgdXNlZCBieSBgaGFzaGVyLmdldEhhc2hBc0FycmF5KClgIHRvIHNwbGl0IHBhdGhzLlxuICAgICAgICAgKiA8dWw+XG4gICAgICAgICAqIDxsaT5kZWZhdWx0IHZhbHVlOiAnLyc7PC9saT5cbiAgICAgICAgICogPC91bD5cbiAgICAgICAgICogQHR5cGUgc3RyaW5nXG4gICAgICAgICAqL1xuICAgICAgICBzZXBhcmF0b3IgOiAnLycsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNpZ25hbCBkaXNwYXRjaGVkIHdoZW4gaGFzaCB2YWx1ZSBjaGFuZ2VzLlxuICAgICAgICAgKiAtIHBhc3MgY3VycmVudCBoYXNoIGFzIDFzdCBwYXJhbWV0ZXIgdG8gbGlzdGVuZXJzIGFuZCBwcmV2aW91cyBoYXNoIHZhbHVlIGFzIDJuZCBwYXJhbWV0ZXIuXG4gICAgICAgICAqIEB0eXBlIHNpZ25hbHMuU2lnbmFsXG4gICAgICAgICAqL1xuICAgICAgICBjaGFuZ2VkIDogbmV3IFNpZ25hbCgpLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTaWduYWwgZGlzcGF0Y2hlZCB3aGVuIGhhc2hlciBpcyBzdG9wcGVkLlxuICAgICAgICAgKiAtICBwYXNzIGN1cnJlbnQgaGFzaCBhcyBmaXJzdCBwYXJhbWV0ZXIgdG8gbGlzdGVuZXJzXG4gICAgICAgICAqIEB0eXBlIHNpZ25hbHMuU2lnbmFsXG4gICAgICAgICAqL1xuICAgICAgICBzdG9wcGVkIDogbmV3IFNpZ25hbCgpLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTaWduYWwgZGlzcGF0Y2hlZCB3aGVuIGhhc2hlciBpcyBpbml0aWFsaXplZC5cbiAgICAgICAgICogLSBwYXNzIGN1cnJlbnQgaGFzaCBhcyBmaXJzdCBwYXJhbWV0ZXIgdG8gbGlzdGVuZXJzLlxuICAgICAgICAgKiBAdHlwZSBzaWduYWxzLlNpZ25hbFxuICAgICAgICAgKi9cbiAgICAgICAgaW5pdGlhbGl6ZWQgOiBuZXcgU2lnbmFsKCksXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN0YXJ0IGxpc3RlbmluZy9kaXNwYXRjaGluZyBjaGFuZ2VzIGluIHRoZSBoYXNoL2hpc3RvcnkuXG4gICAgICAgICAqIDx1bD5cbiAgICAgICAgICogICA8bGk+aGFzaGVyIHdvbid0IGRpc3BhdGNoIENIQU5HRSBldmVudHMgYnkgbWFudWFsbHkgdHlwaW5nIGEgbmV3IHZhbHVlIG9yIHByZXNzaW5nIHRoZSBiYWNrL2ZvcndhcmQgYnV0dG9ucyBiZWZvcmUgY2FsbGluZyB0aGlzIG1ldGhvZC48L2xpPlxuICAgICAgICAgKiA8L3VsPlxuICAgICAgICAgKi9cbiAgICAgICAgaW5pdCA6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZihfaXNBY3RpdmUpIHJldHVybjtcblxuICAgICAgICAgICAgX2hhc2ggPSBfZ2V0V2luZG93SGFzaCgpO1xuXG4gICAgICAgICAgICAvL3Rob3VnaHQgYWJvdXQgYnJhbmNoaW5nL292ZXJsb2FkaW5nIGhhc2hlci5pbml0KCkgdG8gYXZvaWQgY2hlY2tpbmcgbXVsdGlwbGUgdGltZXMgYnV0XG4gICAgICAgICAgICAvL2Rvbid0IHRoaW5rIHdvcnRoIGRvaW5nIGl0IHNpbmNlIGl0IHByb2JhYmx5IHdvbid0IGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcy5cbiAgICAgICAgICAgIGlmKF9pc0hhc2hDaGFuZ2VTdXBwb3J0ZWQpe1xuICAgICAgICAgICAgICAgIF9hZGRMaXN0ZW5lcih3aW5kb3csICdoYXNoY2hhbmdlJywgX2NoZWNrSGlzdG9yeSk7XG4gICAgICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYoX2lzTGVnYWN5SUUpe1xuICAgICAgICAgICAgICAgICAgICBpZighIF9mcmFtZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBfY3JlYXRlRnJhbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBfdXBkYXRlRnJhbWUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgX2NoZWNrSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChfY2hlY2tIaXN0b3J5LCBQT09MX0lOVEVSVkFMKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgX2lzQWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIGhhc2hlci5pbml0aWFsaXplZC5kaXNwYXRjaChfdHJpbUhhc2goX2hhc2gpKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogU3RvcCBsaXN0ZW5pbmcvZGlzcGF0Y2hpbmcgY2hhbmdlcyBpbiB0aGUgaGFzaC9oaXN0b3J5LlxuICAgICAgICAgKiA8dWw+XG4gICAgICAgICAqICAgPGxpPmhhc2hlciB3b24ndCBkaXNwYXRjaCBDSEFOR0UgZXZlbnRzIGJ5IG1hbnVhbGx5IHR5cGluZyBhIG5ldyB2YWx1ZSBvciBwcmVzc2luZyB0aGUgYmFjay9mb3J3YXJkIGJ1dHRvbnMgYWZ0ZXIgY2FsbGluZyB0aGlzIG1ldGhvZCwgdW5sZXNzIHlvdSBjYWxsIGhhc2hlci5pbml0KCkgYWdhaW4uPC9saT5cbiAgICAgICAgICogICA8bGk+aGFzaGVyIHdpbGwgc3RpbGwgZGlzcGF0Y2ggY2hhbmdlcyBtYWRlIHByb2dyYW1hdGljYWxseSBieSBjYWxsaW5nIGhhc2hlci5zZXRIYXNoKCk7PC9saT5cbiAgICAgICAgICogPC91bD5cbiAgICAgICAgICovXG4gICAgICAgIHN0b3AgOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYoISBfaXNBY3RpdmUpIHJldHVybjtcblxuICAgICAgICAgICAgaWYoX2lzSGFzaENoYW5nZVN1cHBvcnRlZCl7XG4gICAgICAgICAgICAgICAgX3JlbW92ZUxpc3RlbmVyKHdpbmRvdywgJ2hhc2hjaGFuZ2UnLCBfY2hlY2tIaXN0b3J5KTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoX2NoZWNrSW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgIF9jaGVja0ludGVydmFsID0gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgX2lzQWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICBoYXNoZXIuc3RvcHBlZC5kaXNwYXRjaChfdHJpbUhhc2goX2hhc2gpKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gICAgSWYgaGFzaGVyIGlzIGxpc3RlbmluZyB0byBjaGFuZ2VzIG9uIHRoZSBicm93c2VyIGhpc3RvcnkgYW5kL29yIGhhc2ggdmFsdWUuXG4gICAgICAgICAqL1xuICAgICAgICBpc0FjdGl2ZSA6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXR1cm4gX2lzQWN0aXZlO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IEZ1bGwgVVJMLlxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0VVJMIDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHJldHVybiB7c3RyaW5nfSBSZXRyaWV2ZSBVUkwgd2l0aG91dCBxdWVyeSBzdHJpbmcgYW5kIGhhc2guXG4gICAgICAgICAqL1xuICAgICAgICBnZXRCYXNlVVJMIDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiBoYXNoZXIuZ2V0VVJMKCkucmVwbGFjZShfYmFzZVVybFJlZ2V4cCwgJycpOyAvL3JlbW92ZXMgZXZlcnl0aGluZyBhZnRlciAnPycgYW5kL29yICcjJ1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZXQgSGFzaCB2YWx1ZSwgZ2VuZXJhdGluZyBhIG5ldyBoaXN0b3J5IHJlY29yZC5cbiAgICAgICAgICogQHBhcmFtIHsuLi5zdHJpbmd9IHBhdGggICAgSGFzaCB2YWx1ZSB3aXRob3V0ICcjJy4gSGFzaGVyIHdpbGwgam9pblxuICAgICAgICAgKiBwYXRoIHNlZ21lbnRzIHVzaW5nIGBoYXNoZXIuc2VwYXJhdG9yYCBhbmQgcHJlcGVuZC9hcHBlbmQgaGFzaCB2YWx1ZVxuICAgICAgICAgKiB3aXRoIGBoYXNoZXIuYXBwZW5kSGFzaGAgYW5kIGBoYXNoZXIucHJlcGVuZEhhc2hgXG4gICAgICAgICAqIEBleGFtcGxlIGhhc2hlci5zZXRIYXNoKCdsb3JlbScsICdpcHN1bScsICdkb2xvcicpIC0+ICcjL2xvcmVtL2lwc3VtL2RvbG9yJ1xuICAgICAgICAgKi9cbiAgICAgICAgc2V0SGFzaCA6IGZ1bmN0aW9uKHBhdGgpe1xuICAgICAgICAgICAgcGF0aCA9IF9tYWtlUGF0aC5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgaWYocGF0aCAhPT0gX2hhc2gpe1xuICAgICAgICAgICAgICAgIC8vIHdlIHNob3VsZCBzdG9yZSByYXcgdmFsdWVcbiAgICAgICAgICAgICAgICBfcmVnaXN0ZXJDaGFuZ2UocGF0aCk7XG4gICAgICAgICAgICAgICAgaWYgKHBhdGggPT09IF9oYXNoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHdlIGNoZWNrIGlmIHBhdGggaXMgc3RpbGwgPT09IF9oYXNoIHRvIGF2b2lkIGVycm9yIGluXG4gICAgICAgICAgICAgICAgICAgIC8vIGNhc2Ugb2YgbXVsdGlwbGUgY29uc2VjdXRpdmUgcmVkaXJlY3RzIFtpc3N1ZSAjMzldXG4gICAgICAgICAgICAgICAgICAgIGlmICghIGhhc2hlci5yYXcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGggPSBfZW5jb2RlUGF0aChwYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICcjJyArIHBhdGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZXQgSGFzaCB2YWx1ZSB3aXRob3V0IGtlZXBpbmcgcHJldmlvdXMgaGFzaCBvbiB0aGUgaGlzdG9yeSByZWNvcmQuXG4gICAgICAgICAqIFNpbWlsYXIgdG8gY2FsbGluZyBgd2luZG93LmxvY2F0aW9uLnJlcGxhY2UoXCIjL2hhc2hcIilgIGJ1dCB3aWxsIGFsc28gd29yayBvbiBJRTYtNy5cbiAgICAgICAgICogQHBhcmFtIHsuLi5zdHJpbmd9IHBhdGggICAgSGFzaCB2YWx1ZSB3aXRob3V0ICcjJy4gSGFzaGVyIHdpbGwgam9pblxuICAgICAgICAgKiBwYXRoIHNlZ21lbnRzIHVzaW5nIGBoYXNoZXIuc2VwYXJhdG9yYCBhbmQgcHJlcGVuZC9hcHBlbmQgaGFzaCB2YWx1ZVxuICAgICAgICAgKiB3aXRoIGBoYXNoZXIuYXBwZW5kSGFzaGAgYW5kIGBoYXNoZXIucHJlcGVuZEhhc2hgXG4gICAgICAgICAqIEBleGFtcGxlIGhhc2hlci5yZXBsYWNlSGFzaCgnbG9yZW0nLCAnaXBzdW0nLCAnZG9sb3InKSAtPiAnIy9sb3JlbS9pcHN1bS9kb2xvcidcbiAgICAgICAgICovXG4gICAgICAgIHJlcGxhY2VIYXNoIDogZnVuY3Rpb24ocGF0aCl7XG4gICAgICAgICAgICBwYXRoID0gX21ha2VQYXRoLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICBpZihwYXRoICE9PSBfaGFzaCl7XG4gICAgICAgICAgICAgICAgLy8gd2Ugc2hvdWxkIHN0b3JlIHJhdyB2YWx1ZVxuICAgICAgICAgICAgICAgIF9yZWdpc3RlckNoYW5nZShwYXRoLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBpZiAocGF0aCA9PT0gX2hhc2gpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gd2UgY2hlY2sgaWYgcGF0aCBpcyBzdGlsbCA9PT0gX2hhc2ggdG8gYXZvaWQgZXJyb3IgaW5cbiAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSBvZiBtdWx0aXBsZSBjb25zZWN1dGl2ZSByZWRpcmVjdHMgW2lzc3VlICMzOV1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCEgaGFzaGVyLnJhdykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aCA9IF9lbmNvZGVQYXRoKHBhdGgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKCcjJyArIHBhdGgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHJldHVybiB7c3RyaW5nfSBIYXNoIHZhbHVlIHdpdGhvdXQgJyMnLCBgaGFzaGVyLmFwcGVuZEhhc2hgIGFuZCBgaGFzaGVyLnByZXBlbmRIYXNoYC5cbiAgICAgICAgICovXG4gICAgICAgIGdldEhhc2ggOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgLy9kaWRuJ3QgdXNlZCBhY3R1YWwgdmFsdWUgb2YgdGhlIGB3aW5kb3cubG9jYXRpb24uaGFzaGAgdG8gYXZvaWQgYnJlYWtpbmcgdGhlIGFwcGxpY2F0aW9uIGluIGNhc2UgYHdpbmRvdy5sb2NhdGlvbi5oYXNoYCBpc24ndCBhdmFpbGFibGUgYW5kIGFsc28gYmVjYXVzZSB2YWx1ZSBzaG91bGQgYWx3YXlzIGJlIHN5bmNoZWQuXG4gICAgICAgICAgICByZXR1cm4gX3RyaW1IYXNoKF9oYXNoKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHJldHVybiB7QXJyYXkuPHN0cmluZz59IEhhc2ggdmFsdWUgc3BsaXQgaW50byBhbiBBcnJheS5cbiAgICAgICAgICovXG4gICAgICAgIGdldEhhc2hBc0FycmF5IDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiBoYXNoZXIuZ2V0SGFzaCgpLnNwbGl0KGhhc2hlci5zZXBhcmF0b3IpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmVzIGFsbCBldmVudCBsaXN0ZW5lcnMsIHN0b3BzIGhhc2hlciBhbmQgZGVzdHJveSBoYXNoZXIgb2JqZWN0LlxuICAgICAgICAgKiAtIElNUE9SVEFOVDogaGFzaGVyIHdvbid0IHdvcmsgYWZ0ZXIgY2FsbGluZyB0aGlzIG1ldGhvZCwgaGFzaGVyIE9iamVjdCB3aWxsIGJlIGRlbGV0ZWQuXG4gICAgICAgICAqL1xuICAgICAgICBkaXNwb3NlIDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGhhc2hlci5zdG9wKCk7XG4gICAgICAgICAgICBoYXNoZXIuaW5pdGlhbGl6ZWQuZGlzcG9zZSgpO1xuICAgICAgICAgICAgaGFzaGVyLnN0b3BwZWQuZGlzcG9zZSgpO1xuICAgICAgICAgICAgaGFzaGVyLmNoYW5nZWQuZGlzcG9zZSgpO1xuICAgICAgICAgICAgX2ZyYW1lID0gaGFzaGVyID0gd2luZG93Lmhhc2hlciA9IG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZXR1cm4ge3N0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG9iamVjdC5cbiAgICAgICAgICovXG4gICAgICAgIHRvU3RyaW5nIDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiAnW2hhc2hlciB2ZXJzaW9uPVwiJysgaGFzaGVyLlZFUlNJT04gKydcIiBoYXNoPVwiJysgaGFzaGVyLmdldEhhc2goKSArJ1wiXSc7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBoYXNoZXIuaW5pdGlhbGl6ZWQubWVtb3JpemUgPSB0cnVlOyAvL3NlZSAjMzNcblxuICAgIHJldHVybiBoYXNoZXI7XG5cbn0od2luZG93KSk7XG5cblxuICAgIHJldHVybiBoYXNoZXI7XG59O1xuXG5pZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKFsnc2lnbmFscyddLCBmYWN0b3J5KTtcbn0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoJ3NpZ25hbHMnKSk7XG59IGVsc2Uge1xuICAgIC8qanNoaW50IHN1Yjp0cnVlICovXG4gICAgd2luZG93WydoYXNoZXInXSA9IGZhY3Rvcnkod2luZG93WydzaWduYWxzJ10pO1xufVxuXG59KCkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXNhcCA9IHJlcXVpcmUoJ2FzYXAnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb21pc2VcbmZ1bmN0aW9uIFByb21pc2UoZm4pIHtcbiAgaWYgKHR5cGVvZiB0aGlzICE9PSAnb2JqZWN0JykgdGhyb3cgbmV3IFR5cGVFcnJvcignUHJvbWlzZXMgbXVzdCBiZSBjb25zdHJ1Y3RlZCB2aWEgbmV3JylcbiAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IFR5cGVFcnJvcignbm90IGEgZnVuY3Rpb24nKVxuICB2YXIgc3RhdGUgPSBudWxsXG4gIHZhciB2YWx1ZSA9IG51bGxcbiAgdmFyIGRlZmVycmVkcyA9IFtdXG4gIHZhciBzZWxmID0gdGhpc1xuXG4gIHRoaXMudGhlbiA9IGZ1bmN0aW9uKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgaGFuZGxlKG5ldyBIYW5kbGVyKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCByZXNvbHZlLCByZWplY3QpKVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGUoZGVmZXJyZWQpIHtcbiAgICBpZiAoc3RhdGUgPT09IG51bGwpIHtcbiAgICAgIGRlZmVycmVkcy5wdXNoKGRlZmVycmVkKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGFzYXAoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY2IgPSBzdGF0ZSA/IGRlZmVycmVkLm9uRnVsZmlsbGVkIDogZGVmZXJyZWQub25SZWplY3RlZFxuICAgICAgaWYgKGNiID09PSBudWxsKSB7XG4gICAgICAgIChzdGF0ZSA/IGRlZmVycmVkLnJlc29sdmUgOiBkZWZlcnJlZC5yZWplY3QpKHZhbHVlKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHZhciByZXRcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldCA9IGNiKHZhbHVlKVxuICAgICAgfVxuICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGUpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXQpXG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc29sdmUobmV3VmFsdWUpIHtcbiAgICB0cnkgeyAvL1Byb21pc2UgUmVzb2x1dGlvbiBQcm9jZWR1cmU6IGh0dHBzOi8vZ2l0aHViLmNvbS9wcm9taXNlcy1hcGx1cy9wcm9taXNlcy1zcGVjI3RoZS1wcm9taXNlLXJlc29sdXRpb24tcHJvY2VkdXJlXG4gICAgICBpZiAobmV3VmFsdWUgPT09IHNlbGYpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0EgcHJvbWlzZSBjYW5ub3QgYmUgcmVzb2x2ZWQgd2l0aCBpdHNlbGYuJylcbiAgICAgIGlmIChuZXdWYWx1ZSAmJiAodHlwZW9mIG5ld1ZhbHVlID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgbmV3VmFsdWUgPT09ICdmdW5jdGlvbicpKSB7XG4gICAgICAgIHZhciB0aGVuID0gbmV3VmFsdWUudGhlblxuICAgICAgICBpZiAodHlwZW9mIHRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBkb1Jlc29sdmUodGhlbi5iaW5kKG5ld1ZhbHVlKSwgcmVzb2x2ZSwgcmVqZWN0KVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzdGF0ZSA9IHRydWVcbiAgICAgIHZhbHVlID0gbmV3VmFsdWVcbiAgICAgIGZpbmFsZSgpXG4gICAgfSBjYXRjaCAoZSkgeyByZWplY3QoZSkgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVqZWN0KG5ld1ZhbHVlKSB7XG4gICAgc3RhdGUgPSBmYWxzZVxuICAgIHZhbHVlID0gbmV3VmFsdWVcbiAgICBmaW5hbGUoKVxuICB9XG5cbiAgZnVuY3Rpb24gZmluYWxlKCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBkZWZlcnJlZHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspXG4gICAgICBoYW5kbGUoZGVmZXJyZWRzW2ldKVxuICAgIGRlZmVycmVkcyA9IG51bGxcbiAgfVxuXG4gIGRvUmVzb2x2ZShmbiwgcmVzb2x2ZSwgcmVqZWN0KVxufVxuXG5cbmZ1bmN0aW9uIEhhbmRsZXIob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIHJlc29sdmUsIHJlamVjdCl7XG4gIHRoaXMub25GdWxmaWxsZWQgPSB0eXBlb2Ygb25GdWxmaWxsZWQgPT09ICdmdW5jdGlvbicgPyBvbkZ1bGZpbGxlZCA6IG51bGxcbiAgdGhpcy5vblJlamVjdGVkID0gdHlwZW9mIG9uUmVqZWN0ZWQgPT09ICdmdW5jdGlvbicgPyBvblJlamVjdGVkIDogbnVsbFxuICB0aGlzLnJlc29sdmUgPSByZXNvbHZlXG4gIHRoaXMucmVqZWN0ID0gcmVqZWN0XG59XG5cbi8qKlxuICogVGFrZSBhIHBvdGVudGlhbGx5IG1pc2JlaGF2aW5nIHJlc29sdmVyIGZ1bmN0aW9uIGFuZCBtYWtlIHN1cmVcbiAqIG9uRnVsZmlsbGVkIGFuZCBvblJlamVjdGVkIGFyZSBvbmx5IGNhbGxlZCBvbmNlLlxuICpcbiAqIE1ha2VzIG5vIGd1YXJhbnRlZXMgYWJvdXQgYXN5bmNocm9ueS5cbiAqL1xuZnVuY3Rpb24gZG9SZXNvbHZlKGZuLCBvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCkge1xuICB2YXIgZG9uZSA9IGZhbHNlO1xuICB0cnkge1xuICAgIGZuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKGRvbmUpIHJldHVyblxuICAgICAgZG9uZSA9IHRydWVcbiAgICAgIG9uRnVsZmlsbGVkKHZhbHVlKVxuICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgIGlmIChkb25lKSByZXR1cm5cbiAgICAgIGRvbmUgPSB0cnVlXG4gICAgICBvblJlamVjdGVkKHJlYXNvbilcbiAgICB9KVxuICB9IGNhdGNoIChleCkge1xuICAgIGlmIChkb25lKSByZXR1cm5cbiAgICBkb25lID0gdHJ1ZVxuICAgIG9uUmVqZWN0ZWQoZXgpXG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLy9UaGlzIGZpbGUgY29udGFpbnMgdGhlbi9wcm9taXNlIHNwZWNpZmljIGV4dGVuc2lvbnMgdG8gdGhlIGNvcmUgcHJvbWlzZSBBUElcblxudmFyIFByb21pc2UgPSByZXF1aXJlKCcuL2NvcmUuanMnKVxudmFyIGFzYXAgPSByZXF1aXJlKCdhc2FwJylcblxubW9kdWxlLmV4cG9ydHMgPSBQcm9taXNlXG5cbi8qIFN0YXRpYyBGdW5jdGlvbnMgKi9cblxuZnVuY3Rpb24gVmFsdWVQcm9taXNlKHZhbHVlKSB7XG4gIHRoaXMudGhlbiA9IGZ1bmN0aW9uIChvbkZ1bGZpbGxlZCkge1xuICAgIGlmICh0eXBlb2Ygb25GdWxmaWxsZWQgIT09ICdmdW5jdGlvbicpIHJldHVybiB0aGlzXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIGFzYXAoZnVuY3Rpb24gKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJlc29sdmUob25GdWxmaWxsZWQodmFsdWUpKVxuICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgIHJlamVjdChleCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxufVxuVmFsdWVQcm9taXNlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUHJvbWlzZS5wcm90b3R5cGUpXG5cbnZhciBUUlVFID0gbmV3IFZhbHVlUHJvbWlzZSh0cnVlKVxudmFyIEZBTFNFID0gbmV3IFZhbHVlUHJvbWlzZShmYWxzZSlcbnZhciBOVUxMID0gbmV3IFZhbHVlUHJvbWlzZShudWxsKVxudmFyIFVOREVGSU5FRCA9IG5ldyBWYWx1ZVByb21pc2UodW5kZWZpbmVkKVxudmFyIFpFUk8gPSBuZXcgVmFsdWVQcm9taXNlKDApXG52YXIgRU1QVFlTVFJJTkcgPSBuZXcgVmFsdWVQcm9taXNlKCcnKVxuXG5Qcm9taXNlLnJlc29sdmUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgaWYgKHZhbHVlIGluc3RhbmNlb2YgUHJvbWlzZSkgcmV0dXJuIHZhbHVlXG5cbiAgaWYgKHZhbHVlID09PSBudWxsKSByZXR1cm4gTlVMTFxuICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuIFVOREVGSU5FRFxuICBpZiAodmFsdWUgPT09IHRydWUpIHJldHVybiBUUlVFXG4gIGlmICh2YWx1ZSA9PT0gZmFsc2UpIHJldHVybiBGQUxTRVxuICBpZiAodmFsdWUgPT09IDApIHJldHVybiBaRVJPXG4gIGlmICh2YWx1ZSA9PT0gJycpIHJldHVybiBFTVBUWVNUUklOR1xuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHRyeSB7XG4gICAgICB2YXIgdGhlbiA9IHZhbHVlLnRoZW5cbiAgICAgIGlmICh0eXBlb2YgdGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UodGhlbi5iaW5kKHZhbHVlKSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChleCkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgcmVqZWN0KGV4KVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFZhbHVlUHJvbWlzZSh2YWx1ZSlcbn1cblxuUHJvbWlzZS5mcm9tID0gUHJvbWlzZS5jYXN0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1Byb21pc2UuZnJvbSBhbmQgUHJvbWlzZS5jYXN0IGFyZSBkZXByZWNhdGVkLCB1c2UgUHJvbWlzZS5yZXNvbHZlIGluc3RlYWQnKVxuICBlcnIubmFtZSA9ICdXYXJuaW5nJ1xuICBjb25zb2xlLndhcm4oZXJyLnN0YWNrKVxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlKVxufVxuXG5Qcm9taXNlLmRlbm9kZWlmeSA9IGZ1bmN0aW9uIChmbiwgYXJndW1lbnRDb3VudCkge1xuICBhcmd1bWVudENvdW50ID0gYXJndW1lbnRDb3VudCB8fCBJbmZpbml0eVxuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpc1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB3aGlsZSAoYXJncy5sZW5ndGggJiYgYXJncy5sZW5ndGggPiBhcmd1bWVudENvdW50KSB7XG4gICAgICAgIGFyZ3MucG9wKClcbiAgICAgIH1cbiAgICAgIGFyZ3MucHVzaChmdW5jdGlvbiAoZXJyLCByZXMpIHtcbiAgICAgICAgaWYgKGVycikgcmVqZWN0KGVycilcbiAgICAgICAgZWxzZSByZXNvbHZlKHJlcylcbiAgICAgIH0pXG4gICAgICBmbi5hcHBseShzZWxmLCBhcmdzKVxuICAgIH0pXG4gIH1cbn1cblByb21pc2Uubm9kZWlmeSA9IGZ1bmN0aW9uIChmbikge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKVxuICAgIHZhciBjYWxsYmFjayA9IHR5cGVvZiBhcmdzW2FyZ3MubGVuZ3RoIC0gMV0gPT09ICdmdW5jdGlvbicgPyBhcmdzLnBvcCgpIDogbnVsbFxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKS5ub2RlaWZ5KGNhbGxiYWNrKVxuICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICBpZiAoY2FsbGJhY2sgPT09IG51bGwgfHwgdHlwZW9mIGNhbGxiYWNrID09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IHJlamVjdChleCkgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFzYXAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNhbGxiYWNrKGV4KVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5Qcm9taXNlLmFsbCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGNhbGxlZFdpdGhBcnJheSA9IGFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiYgQXJyYXkuaXNBcnJheShhcmd1bWVudHNbMF0pXG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoY2FsbGVkV2l0aEFycmF5ID8gYXJndW1lbnRzWzBdIDogYXJndW1lbnRzKVxuXG4gIGlmICghY2FsbGVkV2l0aEFycmF5KSB7XG4gICAgdmFyIGVyciA9IG5ldyBFcnJvcignUHJvbWlzZS5hbGwgc2hvdWxkIGJlIGNhbGxlZCB3aXRoIGEgc2luZ2xlIGFycmF5LCBjYWxsaW5nIGl0IHdpdGggbXVsdGlwbGUgYXJndW1lbnRzIGlzIGRlcHJlY2F0ZWQnKVxuICAgIGVyci5uYW1lID0gJ1dhcm5pbmcnXG4gICAgY29uc29sZS53YXJuKGVyci5zdGFjaylcbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgaWYgKGFyZ3MubGVuZ3RoID09PSAwKSByZXR1cm4gcmVzb2x2ZShbXSlcbiAgICB2YXIgcmVtYWluaW5nID0gYXJncy5sZW5ndGhcbiAgICBmdW5jdGlvbiByZXMoaSwgdmFsKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAodmFsICYmICh0eXBlb2YgdmFsID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSkge1xuICAgICAgICAgIHZhciB0aGVuID0gdmFsLnRoZW5cbiAgICAgICAgICBpZiAodHlwZW9mIHRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRoZW4uY2FsbCh2YWwsIGZ1bmN0aW9uICh2YWwpIHsgcmVzKGksIHZhbCkgfSwgcmVqZWN0KVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGFyZ3NbaV0gPSB2YWxcbiAgICAgICAgaWYgKC0tcmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgICAgcmVzb2x2ZShhcmdzKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgcmVqZWN0KGV4KVxuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlcyhpLCBhcmdzW2ldKVxuICAgIH1cbiAgfSlcbn1cblxuUHJvbWlzZS5yZWplY3QgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsgXG4gICAgcmVqZWN0KHZhbHVlKTtcbiAgfSk7XG59XG5cblByb21pc2UucmFjZSA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsgXG4gICAgdmFsdWVzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpe1xuICAgICAgUHJvbWlzZS5yZXNvbHZlKHZhbHVlKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgfSlcbiAgfSk7XG59XG5cbi8qIFByb3RvdHlwZSBNZXRob2RzICovXG5cblByb21pc2UucHJvdG90eXBlLmRvbmUgPSBmdW5jdGlvbiAob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpIHtcbiAgdmFyIHNlbGYgPSBhcmd1bWVudHMubGVuZ3RoID8gdGhpcy50aGVuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgOiB0aGlzXG4gIHNlbGYudGhlbihudWxsLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgYXNhcChmdW5jdGlvbiAoKSB7XG4gICAgICB0aHJvdyBlcnJcbiAgICB9KVxuICB9KVxufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5ub2RlaWZ5ID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gIGlmICh0eXBlb2YgY2FsbGJhY2sgIT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHRoaXNcblxuICB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgYXNhcChmdW5jdGlvbiAoKSB7XG4gICAgICBjYWxsYmFjayhudWxsLCB2YWx1ZSlcbiAgICB9KVxuICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgYXNhcChmdW5jdGlvbiAoKSB7XG4gICAgICBjYWxsYmFjayhlcnIpXG4gICAgfSlcbiAgfSlcbn1cblxuUHJvbWlzZS5wcm90b3R5cGVbJ2NhdGNoJ10gPSBmdW5jdGlvbiAob25SZWplY3RlZCkge1xuICByZXR1cm4gdGhpcy50aGVuKG51bGwsIG9uUmVqZWN0ZWQpO1xufVxuIiwiXG4vLyBVc2UgdGhlIGZhc3Rlc3QgcG9zc2libGUgbWVhbnMgdG8gZXhlY3V0ZSBhIHRhc2sgaW4gYSBmdXR1cmUgdHVyblxuLy8gb2YgdGhlIGV2ZW50IGxvb3AuXG5cbi8vIGxpbmtlZCBsaXN0IG9mIHRhc2tzIChzaW5nbGUsIHdpdGggaGVhZCBub2RlKVxudmFyIGhlYWQgPSB7dGFzazogdm9pZCAwLCBuZXh0OiBudWxsfTtcbnZhciB0YWlsID0gaGVhZDtcbnZhciBmbHVzaGluZyA9IGZhbHNlO1xudmFyIHJlcXVlc3RGbHVzaCA9IHZvaWQgMDtcbnZhciBpc05vZGVKUyA9IGZhbHNlO1xuXG5mdW5jdGlvbiBmbHVzaCgpIHtcbiAgICAvKiBqc2hpbnQgbG9vcGZ1bmM6IHRydWUgKi9cblxuICAgIHdoaWxlIChoZWFkLm5leHQpIHtcbiAgICAgICAgaGVhZCA9IGhlYWQubmV4dDtcbiAgICAgICAgdmFyIHRhc2sgPSBoZWFkLnRhc2s7XG4gICAgICAgIGhlYWQudGFzayA9IHZvaWQgMDtcbiAgICAgICAgdmFyIGRvbWFpbiA9IGhlYWQuZG9tYWluO1xuXG4gICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgIGhlYWQuZG9tYWluID0gdm9pZCAwO1xuICAgICAgICAgICAgZG9tYWluLmVudGVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGFzaygpO1xuXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmIChpc05vZGVKUykge1xuICAgICAgICAgICAgICAgIC8vIEluIG5vZGUsIHVuY2F1Z2h0IGV4Y2VwdGlvbnMgYXJlIGNvbnNpZGVyZWQgZmF0YWwgZXJyb3JzLlxuICAgICAgICAgICAgICAgIC8vIFJlLXRocm93IHRoZW0gc3luY2hyb25vdXNseSB0byBpbnRlcnJ1cHQgZmx1c2hpbmchXG5cbiAgICAgICAgICAgICAgICAvLyBFbnN1cmUgY29udGludWF0aW9uIGlmIHRoZSB1bmNhdWdodCBleGNlcHRpb24gaXMgc3VwcHJlc3NlZFxuICAgICAgICAgICAgICAgIC8vIGxpc3RlbmluZyBcInVuY2F1Z2h0RXhjZXB0aW9uXCIgZXZlbnRzIChhcyBkb21haW5zIGRvZXMpLlxuICAgICAgICAgICAgICAgIC8vIENvbnRpbnVlIGluIG5leHQgZXZlbnQgdG8gYXZvaWQgdGljayByZWN1cnNpb24uXG4gICAgICAgICAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgICAgICAgICBkb21haW4uZXhpdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZsdXNoLCAwKTtcbiAgICAgICAgICAgICAgICBpZiAoZG9tYWluKSB7XG4gICAgICAgICAgICAgICAgICAgIGRvbWFpbi5lbnRlcigpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRocm93IGU7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSW4gYnJvd3NlcnMsIHVuY2F1Z2h0IGV4Y2VwdGlvbnMgYXJlIG5vdCBmYXRhbC5cbiAgICAgICAgICAgICAgICAvLyBSZS10aHJvdyB0aGVtIGFzeW5jaHJvbm91c2x5IHRvIGF2b2lkIHNsb3ctZG93bnMuXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgZG9tYWluLmV4aXQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZsdXNoaW5nID0gZmFsc2U7XG59XG5cbmlmICh0eXBlb2YgcHJvY2VzcyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBwcm9jZXNzLm5leHRUaWNrKSB7XG4gICAgLy8gTm9kZS5qcyBiZWZvcmUgMC45LiBOb3RlIHRoYXQgc29tZSBmYWtlLU5vZGUgZW52aXJvbm1lbnRzLCBsaWtlIHRoZVxuICAgIC8vIE1vY2hhIHRlc3QgcnVubmVyLCBpbnRyb2R1Y2UgYSBgcHJvY2Vzc2AgZ2xvYmFsIHdpdGhvdXQgYSBgbmV4dFRpY2tgLlxuICAgIGlzTm9kZUpTID0gdHJ1ZTtcblxuICAgIHJlcXVlc3RGbHVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhmbHVzaCk7XG4gICAgfTtcblxufSBlbHNlIGlmICh0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAvLyBJbiBJRTEwLCBOb2RlLmpzIDAuOSssIG9yIGh0dHBzOi8vZ2l0aHViLmNvbS9Ob2JsZUpTL3NldEltbWVkaWF0ZVxuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHJlcXVlc3RGbHVzaCA9IHNldEltbWVkaWF0ZS5iaW5kKHdpbmRvdywgZmx1c2gpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcXVlc3RGbHVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNldEltbWVkaWF0ZShmbHVzaCk7XG4gICAgICAgIH07XG4gICAgfVxuXG59IGVsc2UgaWYgKHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIC8vIG1vZGVybiBicm93c2Vyc1xuICAgIC8vIGh0dHA6Ly93d3cubm9uYmxvY2tpbmcuaW8vMjAxMS8wNi93aW5kb3duZXh0dGljay5odG1sXG4gICAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGZsdXNoO1xuICAgIHJlcXVlc3RGbHVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2hhbm5lbC5wb3J0Mi5wb3N0TWVzc2FnZSgwKTtcbiAgICB9O1xuXG59IGVsc2Uge1xuICAgIC8vIG9sZCBicm93c2Vyc1xuICAgIHJlcXVlc3RGbHVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2V0VGltZW91dChmbHVzaCwgMCk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gYXNhcCh0YXNrKSB7XG4gICAgdGFpbCA9IHRhaWwubmV4dCA9IHtcbiAgICAgICAgdGFzazogdGFzayxcbiAgICAgICAgZG9tYWluOiBpc05vZGVKUyAmJiBwcm9jZXNzLmRvbWFpbixcbiAgICAgICAgbmV4dDogbnVsbFxuICAgIH07XG5cbiAgICBpZiAoIWZsdXNoaW5nKSB7XG4gICAgICAgIGZsdXNoaW5nID0gdHJ1ZTtcbiAgICAgICAgcmVxdWVzdEZsdXNoKCk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBhc2FwO1xuXG4iLCIvLyBTb21lIGNvZGUgb3JpZ2luYWxseSBmcm9tIGFzeW5jX3N0b3JhZ2UuanMgaW5cbi8vIFtHYWlhXShodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS1iMmcvZ2FpYSkuXG4oZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gT3JpZ2luYWxseSBmb3VuZCBpbiBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS1iMmcvZ2FpYS9ibG9iL2U4ZjYyNGU0Y2M5ZWE5NDU3MjcyNzgwMzliM2JjOWJjYjlmODY2N2Evc2hhcmVkL2pzL2FzeW5jX3N0b3JhZ2UuanNcblxuICAgIC8vIFByb21pc2VzIVxuICAgIHZhciBQcm9taXNlID0gKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSA/XG4gICAgICAgICAgICAgICAgICByZXF1aXJlKCdwcm9taXNlJykgOiB0aGlzLlByb21pc2U7XG5cbiAgICAvLyBJbml0aWFsaXplIEluZGV4ZWREQjsgZmFsbCBiYWNrIHRvIHZlbmRvci1wcmVmaXhlZCB2ZXJzaW9ucyBpZiBuZWVkZWQuXG4gICAgdmFyIGluZGV4ZWREQiA9IGluZGV4ZWREQiB8fCB0aGlzLmluZGV4ZWREQiB8fCB0aGlzLndlYmtpdEluZGV4ZWREQiB8fFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vekluZGV4ZWREQiB8fCB0aGlzLk9JbmRleGVkREIgfHxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tc0luZGV4ZWREQjtcblxuICAgIC8vIElmIEluZGV4ZWREQiBpc24ndCBhdmFpbGFibGUsIHdlIGdldCBvdXR0YSBoZXJlIVxuICAgIGlmICghaW5kZXhlZERCKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBPcGVuIHRoZSBJbmRleGVkREIgZGF0YWJhc2UgKGF1dG9tYXRpY2FsbHkgY3JlYXRlcyBvbmUgaWYgb25lIGRpZG4ndFxuICAgIC8vIHByZXZpb3VzbHkgZXhpc3QpLCB1c2luZyBhbnkgb3B0aW9ucyBzZXQgaW4gdGhlIGNvbmZpZy5cbiAgICBmdW5jdGlvbiBfaW5pdFN0b3JhZ2Uob3B0aW9ucykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBkYkluZm8gPSB7XG4gICAgICAgICAgICBkYjogbnVsbFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBkYkluZm9baV0gPSBvcHRpb25zW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgdmFyIG9wZW5yZXEgPSBpbmRleGVkREIub3BlbihkYkluZm8ubmFtZSwgZGJJbmZvLnZlcnNpb24pO1xuICAgICAgICAgICAgb3BlbnJlcS5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG9wZW5yZXEuZXJyb3IpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIG9wZW5yZXEub251cGdyYWRlbmVlZGVkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgLy8gRmlyc3QgdGltZSBzZXR1cDogY3JlYXRlIGFuIGVtcHR5IG9iamVjdCBzdG9yZVxuICAgICAgICAgICAgICAgIG9wZW5yZXEucmVzdWx0LmNyZWF0ZU9iamVjdFN0b3JlKGRiSW5mby5zdG9yZU5hbWUpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIG9wZW5yZXEub25zdWNjZXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZGJJbmZvLmRiID0gb3BlbnJlcS5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgc2VsZi5fZGJJbmZvID0gZGJJbmZvO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEl0ZW0oa2V5LCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgLy8gQ2FzdCB0aGUga2V5IHRvIGEgc3RyaW5nLCBhcyB0aGF0J3MgYWxsIHdlIGNhbiBzZXQgYXMgYSBrZXkuXG4gICAgICAgIGlmICh0eXBlb2Yga2V5ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgd2luZG93LmNvbnNvbGUud2FybihrZXkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIHVzZWQgYXMgYSBrZXksIGJ1dCBpdCBpcyBub3QgYSBzdHJpbmcuJyk7XG4gICAgICAgICAgICBrZXkgPSBTdHJpbmcoa2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuICAgICAgICAgICAgICAgIHZhciBzdG9yZSA9IGRiSW5mby5kYi50cmFuc2FjdGlvbihkYkluZm8uc3RvcmVOYW1lLCAncmVhZG9ubHknKVxuICAgICAgICAgICAgICAgICAgICAub2JqZWN0U3RvcmUoZGJJbmZvLnN0b3JlTmFtZSk7XG4gICAgICAgICAgICAgICAgdmFyIHJlcSA9IHN0b3JlLmdldChrZXkpO1xuXG4gICAgICAgICAgICAgICAgcmVxLm9uc3VjY2VzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSByZXEucmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHJlcS5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXEuZXJyb3IpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KS5jYXRjaChyZWplY3QpO1xuICAgICAgICB9KTtcblxuICAgICAgICBleGVjdXRlRGVmZXJlZENhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuXG4gICAgLy8gSXRlcmF0ZSBvdmVyIGFsbCBpdGVtcyBzdG9yZWQgaW4gZGF0YWJhc2UuXG4gICAgZnVuY3Rpb24gaXRlcmF0ZShpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuICAgICAgICAgICAgICAgIHZhciBzdG9yZSA9IGRiSW5mby5kYi50cmFuc2FjdGlvbihkYkluZm8uc3RvcmVOYW1lLCAncmVhZG9ubHknKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5vYmplY3RTdG9yZShkYkluZm8uc3RvcmVOYW1lKTtcblxuICAgICAgICAgICAgICAgIHZhciByZXEgPSBzdG9yZS5vcGVuQ3Vyc29yKCk7XG5cbiAgICAgICAgICAgICAgICByZXEub25zdWNjZXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJzb3IgPSByZXEucmVzdWx0O1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJzb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBpdGVyYXRvcihjdXJzb3IudmFsdWUsIGN1cnNvci5rZXkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICE9PSB2b2lkKDApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3IuY29udGludWUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICByZXEub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QocmVxLmVycm9yKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkuY2F0Y2gocmVqZWN0KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZXhlY3V0ZURlZmVyZWRDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG5cbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0SXRlbShrZXksIHZhbHVlLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgLy8gQ2FzdCB0aGUga2V5IHRvIGEgc3RyaW5nLCBhcyB0aGF0J3MgYWxsIHdlIGNhbiBzZXQgYXMgYSBrZXkuXG4gICAgICAgIGlmICh0eXBlb2Yga2V5ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgd2luZG93LmNvbnNvbGUud2FybihrZXkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIHVzZWQgYXMgYSBrZXksIGJ1dCBpdCBpcyBub3QgYSBzdHJpbmcuJyk7XG4gICAgICAgICAgICBrZXkgPSBTdHJpbmcoa2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuICAgICAgICAgICAgICAgIHZhciBzdG9yZSA9IGRiSW5mby5kYi50cmFuc2FjdGlvbihkYkluZm8uc3RvcmVOYW1lLCAncmVhZHdyaXRlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5vYmplY3RTdG9yZShkYkluZm8uc3RvcmVOYW1lKTtcblxuICAgICAgICAgICAgICAgIC8vIFRoZSByZWFzb24gd2UgZG9uJ3QgX3NhdmVfIG51bGwgaXMgYmVjYXVzZSBJRSAxMCBkb2VzXG4gICAgICAgICAgICAgICAgLy8gbm90IHN1cHBvcnQgc2F2aW5nIHRoZSBgbnVsbGAgdHlwZSBpbiBJbmRleGVkREIuIEhvd1xuICAgICAgICAgICAgICAgIC8vIGlyb25pYywgZ2l2ZW4gdGhlIGJ1ZyBiZWxvdyFcbiAgICAgICAgICAgICAgICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9tb3ppbGxhL2xvY2FsRm9yYWdlL2lzc3Vlcy8xNjFcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHJlcSA9IHN0b3JlLnB1dCh2YWx1ZSwga2V5KTtcbiAgICAgICAgICAgICAgICByZXEub25zdWNjZXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENhc3QgdG8gdW5kZWZpbmVkIHNvIHRoZSB2YWx1ZSBwYXNzZWQgdG9cbiAgICAgICAgICAgICAgICAgICAgLy8gY2FsbGJhY2svcHJvbWlzZSBpcyB0aGUgc2FtZSBhcyB3aGF0IG9uZSB3b3VsZCBnZXQgb3V0XG4gICAgICAgICAgICAgICAgICAgIC8vIG9mIGBnZXRJdGVtKClgIGxhdGVyLiBUaGlzIGxlYWRzIHRvIHNvbWUgd2VpcmRuZXNzXG4gICAgICAgICAgICAgICAgICAgIC8vIChzZXRJdGVtKCdmb28nLCB1bmRlZmluZWQpIHdpbGwgcmV0dXJuIGBudWxsYCksIGJ1dFxuICAgICAgICAgICAgICAgICAgICAvLyBpdCdzIG5vdCBteSBmYXVsdCBsb2NhbFN0b3JhZ2UgaXMgb3VyIGJhc2VsaW5lIGFuZCB0aGF0XG4gICAgICAgICAgICAgICAgICAgIC8vIGl0J3Mgd2VpcmQuXG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJlcS5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXEuZXJyb3IpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KS5jYXRjaChyZWplY3QpO1xuICAgICAgICB9KTtcblxuICAgICAgICBleGVjdXRlRGVmZXJlZENhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVtb3ZlSXRlbShrZXksIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAvLyBDYXN0IHRoZSBrZXkgdG8gYSBzdHJpbmcsIGFzIHRoYXQncyBhbGwgd2UgY2FuIHNldCBhcyBhIGtleS5cbiAgICAgICAgaWYgKHR5cGVvZiBrZXkgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB3aW5kb3cuY29uc29sZS53YXJuKGtleSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgdXNlZCBhcyBhIGtleSwgYnV0IGl0IGlzIG5vdCBhIHN0cmluZy4nKTtcbiAgICAgICAgICAgIGtleSA9IFN0cmluZyhrZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG4gICAgICAgICAgICAgICAgdmFyIHN0b3JlID0gZGJJbmZvLmRiLnRyYW5zYWN0aW9uKGRiSW5mby5zdG9yZU5hbWUsICdyZWFkd3JpdGUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm9iamVjdFN0b3JlKGRiSW5mby5zdG9yZU5hbWUpO1xuXG4gICAgICAgICAgICAgICAgLy8gV2UgdXNlIGEgR3J1bnQgdGFzayB0byBtYWtlIHRoaXMgc2FmZSBmb3IgSUUgYW5kIHNvbWVcbiAgICAgICAgICAgICAgICAvLyB2ZXJzaW9ucyBvZiBBbmRyb2lkIChpbmNsdWRpbmcgdGhvc2UgdXNlZCBieSBDb3Jkb3ZhKS5cbiAgICAgICAgICAgICAgICAvLyBOb3JtYWxseSBJRSB3b24ndCBsaWtlIGAuZGVsZXRlKClgIGFuZCB3aWxsIGluc2lzdCBvblxuICAgICAgICAgICAgICAgIC8vIHVzaW5nIGBbJ2RlbGV0ZSddKClgLCBidXQgd2UgaGF2ZSBhIGJ1aWxkIHN0ZXAgdGhhdFxuICAgICAgICAgICAgICAgIC8vIGZpeGVzIHRoaXMgZm9yIHVzIG5vdy5cbiAgICAgICAgICAgICAgICB2YXIgcmVxID0gc3RvcmUuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICAgICAgcmVxLm9uc3VjY2VzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHJlcS5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXEuZXJyb3IpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAvLyBUaGUgcmVxdWVzdCB3aWxsIGJlIGFib3J0ZWQgaWYgd2UndmUgZXhjZWVkZWQgb3VyIHN0b3JhZ2VcbiAgICAgICAgICAgICAgICAvLyBzcGFjZS4gSW4gdGhpcyBjYXNlLCB3ZSB3aWxsIHJlamVjdCB3aXRoIGEgc3BlY2lmaWNcbiAgICAgICAgICAgICAgICAvLyBcIlF1b3RhRXhjZWVkZWRFcnJvclwiLlxuICAgICAgICAgICAgICAgIHJlcS5vbmFib3J0ID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVycm9yID0gZXZlbnQudGFyZ2V0LmVycm9yO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IgPT09ICdRdW90YUV4Y2VlZGVkRXJyb3InKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pLmNhdGNoKHJlamVjdCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGV4ZWN1dGVEZWZlcmVkQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjbGVhcihjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG4gICAgICAgICAgICAgICAgdmFyIHN0b3JlID0gZGJJbmZvLmRiLnRyYW5zYWN0aW9uKGRiSW5mby5zdG9yZU5hbWUsICdyZWFkd3JpdGUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm9iamVjdFN0b3JlKGRiSW5mby5zdG9yZU5hbWUpO1xuICAgICAgICAgICAgICAgIHZhciByZXEgPSBzdG9yZS5jbGVhcigpO1xuXG4gICAgICAgICAgICAgICAgcmVxLm9uc3VjY2VzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHJlcS5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXEuZXJyb3IpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KS5jYXRjaChyZWplY3QpO1xuICAgICAgICB9KTtcblxuICAgICAgICBleGVjdXRlRGVmZXJlZENhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGVuZ3RoKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcbiAgICAgICAgICAgICAgICB2YXIgc3RvcmUgPSBkYkluZm8uZGIudHJhbnNhY3Rpb24oZGJJbmZvLnN0b3JlTmFtZSwgJ3JlYWRvbmx5JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5vYmplY3RTdG9yZShkYkluZm8uc3RvcmVOYW1lKTtcbiAgICAgICAgICAgICAgICB2YXIgcmVxID0gc3RvcmUuY291bnQoKTtcblxuICAgICAgICAgICAgICAgIHJlcS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXEucmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgcmVxLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHJlcS5lcnJvcik7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pLmNhdGNoKHJlamVjdCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGtleShuLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGlmIChuIDwgMCkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG4gICAgICAgICAgICAgICAgdmFyIHN0b3JlID0gZGJJbmZvLmRiLnRyYW5zYWN0aW9uKGRiSW5mby5zdG9yZU5hbWUsICdyZWFkb25seScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAub2JqZWN0U3RvcmUoZGJJbmZvLnN0b3JlTmFtZSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgYWR2YW5jZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB2YXIgcmVxID0gc3RvcmUub3BlbkN1cnNvcigpO1xuICAgICAgICAgICAgICAgIHJlcS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnNvciA9IHJlcS5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY3Vyc29yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIG1lYW5zIHRoZXJlIHdlcmVuJ3QgZW5vdWdoIGtleXNcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChuID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIHRoZSBmaXJzdCBrZXksIHJldHVybiBpdCBpZiB0aGF0J3Mgd2hhdCB0aGV5XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3YW50ZWQuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGN1cnNvci5rZXkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFhZHZhbmNlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgYXNrIHRoZSBjdXJzb3IgdG8gc2tpcCBhaGVhZCBuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVjb3Jkcy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZHZhbmNlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yLmFkdmFuY2Uobik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdoZW4gd2UgZ2V0IGhlcmUsIHdlJ3ZlIGdvdCB0aGUgbnRoIGtleS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGN1cnNvci5rZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHJlcS5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXEuZXJyb3IpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KS5jYXRjaChyZWplY3QpO1xuICAgICAgICB9KTtcblxuICAgICAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBrZXlzKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcbiAgICAgICAgICAgICAgICB2YXIgc3RvcmUgPSBkYkluZm8uZGIudHJhbnNhY3Rpb24oZGJJbmZvLnN0b3JlTmFtZSwgJ3JlYWRvbmx5JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5vYmplY3RTdG9yZShkYkluZm8uc3RvcmVOYW1lKTtcblxuICAgICAgICAgICAgICAgIHZhciByZXEgPSBzdG9yZS5vcGVuQ3Vyc29yKCk7XG4gICAgICAgICAgICAgICAgdmFyIGtleXMgPSBbXTtcblxuICAgICAgICAgICAgICAgIHJlcS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnNvciA9IHJlcS5yZXN1bHQ7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjdXJzb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoa2V5cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBrZXlzLnB1c2goY3Vyc29yLmtleSk7XG4gICAgICAgICAgICAgICAgICAgIGN1cnNvci5jb250aW51ZSgpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICByZXEub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QocmVxLmVycm9yKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkuY2F0Y2gocmVqZWN0KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdCk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXhlY3V0ZURlZmVyZWRDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHByb21pc2UudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBkZWZlckNhbGxiYWNrKGNhbGxiYWNrLCByZXN1bHQpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFVuZGVyIENocm9tZSB0aGUgY2FsbGJhY2sgaXMgY2FsbGVkIGJlZm9yZSB0aGUgY2hhbmdlcyAoc2F2ZSwgY2xlYXIpXG4gICAgLy8gYXJlIGFjdHVhbGx5IG1hZGUuIFNvIHdlIHVzZSBhIGRlZmVyIGZ1bmN0aW9uIHdoaWNoIHdhaXQgdGhhdCB0aGVcbiAgICAvLyBjYWxsIHN0YWNrIHRvIGJlIGVtcHR5LlxuICAgIC8vIEZvciBtb3JlIGluZm8gOiBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS9sb2NhbEZvcmFnZS9pc3N1ZXMvMTc1XG4gICAgLy8gUHVsbCByZXF1ZXN0IDogaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEvbG9jYWxGb3JhZ2UvcHVsbC8xNzhcbiAgICBmdW5jdGlvbiBkZWZlckNhbGxiYWNrKGNhbGxiYWNrLCByZXN1bHQpIHtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgcmVzdWx0KTtcbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGFzeW5jU3RvcmFnZSA9IHtcbiAgICAgICAgX2RyaXZlcjogJ2FzeW5jU3RvcmFnZScsXG4gICAgICAgIF9pbml0U3RvcmFnZTogX2luaXRTdG9yYWdlLFxuICAgICAgICBpdGVyYXRlOiBpdGVyYXRlLFxuICAgICAgICBnZXRJdGVtOiBnZXRJdGVtLFxuICAgICAgICBzZXRJdGVtOiBzZXRJdGVtLFxuICAgICAgICByZW1vdmVJdGVtOiByZW1vdmVJdGVtLFxuICAgICAgICBjbGVhcjogY2xlYXIsXG4gICAgICAgIGxlbmd0aDogbGVuZ3RoLFxuICAgICAgICBrZXk6IGtleSxcbiAgICAgICAga2V5czoga2V5c1xuICAgIH07XG5cbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZSgnYXN5bmNTdG9yYWdlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gYXN5bmNTdG9yYWdlO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gYXN5bmNTdG9yYWdlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYXN5bmNTdG9yYWdlID0gYXN5bmNTdG9yYWdlO1xuICAgIH1cbn0pLmNhbGwod2luZG93KTtcbiIsIi8vIElmIEluZGV4ZWREQiBpc24ndCBhdmFpbGFibGUsIHdlJ2xsIGZhbGwgYmFjayB0byBsb2NhbFN0b3JhZ2UuXG4vLyBOb3RlIHRoYXQgdGhpcyB3aWxsIGhhdmUgY29uc2lkZXJhYmxlIHBlcmZvcm1hbmNlIGFuZCBzdG9yYWdlXG4vLyBzaWRlLWVmZmVjdHMgKGFsbCBkYXRhIHdpbGwgYmUgc2VyaWFsaXplZCBvbiBzYXZlIGFuZCBvbmx5IGRhdGEgdGhhdFxuLy8gY2FuIGJlIGNvbnZlcnRlZCB0byBhIHN0cmluZyB2aWEgYEpTT04uc3RyaW5naWZ5KClgIHdpbGwgYmUgc2F2ZWQpLlxuKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIFByb21pc2VzIVxuICAgIHZhciBQcm9taXNlID0gKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSA/XG4gICAgICAgICAgICAgICAgICByZXF1aXJlKCdwcm9taXNlJykgOiB0aGlzLlByb21pc2U7XG4gICAgdmFyIGxvY2FsU3RvcmFnZSA9IG51bGw7XG5cbiAgICAvLyBJZiB0aGUgYXBwIGlzIHJ1bm5pbmcgaW5zaWRlIGEgR29vZ2xlIENocm9tZSBwYWNrYWdlZCB3ZWJhcHAsIG9yIHNvbWVcbiAgICAvLyBvdGhlciBjb250ZXh0IHdoZXJlIGxvY2FsU3RvcmFnZSBpc24ndCBhdmFpbGFibGUsIHdlIGRvbid0IHVzZVxuICAgIC8vIGxvY2FsU3RvcmFnZS4gVGhpcyBmZWF0dXJlIGRldGVjdGlvbiBpcyBwcmVmZXJyZWQgb3ZlciB0aGUgb2xkXG4gICAgLy8gYGlmICh3aW5kb3cuY2hyb21lICYmIHdpbmRvdy5jaHJvbWUucnVudGltZSlgIGNvZGUuXG4gICAgLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS9sb2NhbEZvcmFnZS9pc3N1ZXMvNjhcbiAgICB0cnkge1xuICAgICAgICAvLyBJZiBsb2NhbFN0b3JhZ2UgaXNuJ3QgYXZhaWxhYmxlLCB3ZSBnZXQgb3V0dGEgaGVyZSFcbiAgICAgICAgLy8gVGhpcyBzaG91bGQgYmUgaW5zaWRlIGEgdHJ5IGNhdGNoXG4gICAgICAgIGlmICghdGhpcy5sb2NhbFN0b3JhZ2UgfHwgISgnc2V0SXRlbScgaW4gdGhpcy5sb2NhbFN0b3JhZ2UpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBsb2NhbFN0b3JhZ2UgYW5kIGNyZWF0ZSBhIHZhcmlhYmxlIHRvIHVzZSB0aHJvdWdob3V0XG4gICAgICAgIC8vIHRoZSBjb2RlLlxuICAgICAgICBsb2NhbFN0b3JhZ2UgPSB0aGlzLmxvY2FsU3RvcmFnZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBDb25maWcgdGhlIGxvY2FsU3RvcmFnZSBiYWNrZW5kLCB1c2luZyBvcHRpb25zIHNldCBpbiB0aGUgY29uZmlnLlxuICAgIGZ1bmN0aW9uIF9pbml0U3RvcmFnZShvcHRpb25zKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGRiSW5mbyA9IHt9O1xuICAgICAgICBpZiAob3B0aW9ucykge1xuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgZGJJbmZvW2ldID0gb3B0aW9uc1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGRiSW5mby5rZXlQcmVmaXggPSBkYkluZm8ubmFtZSArICcvJztcblxuICAgICAgICBzZWxmLl9kYkluZm8gPSBkYkluZm87XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICB2YXIgU0VSSUFMSVpFRF9NQVJLRVIgPSAnX19sZnNjX186JztcbiAgICB2YXIgU0VSSUFMSVpFRF9NQVJLRVJfTEVOR1RIID0gU0VSSUFMSVpFRF9NQVJLRVIubGVuZ3RoO1xuXG4gICAgLy8gT01HIHRoZSBzZXJpYWxpemF0aW9ucyFcbiAgICB2YXIgVFlQRV9BUlJBWUJVRkZFUiA9ICdhcmJmJztcbiAgICB2YXIgVFlQRV9CTE9CID0gJ2Jsb2InO1xuICAgIHZhciBUWVBFX0lOVDhBUlJBWSA9ICdzaTA4JztcbiAgICB2YXIgVFlQRV9VSU5UOEFSUkFZID0gJ3VpMDgnO1xuICAgIHZhciBUWVBFX1VJTlQ4Q0xBTVBFREFSUkFZID0gJ3VpYzgnO1xuICAgIHZhciBUWVBFX0lOVDE2QVJSQVkgPSAnc2kxNic7XG4gICAgdmFyIFRZUEVfSU5UMzJBUlJBWSA9ICdzaTMyJztcbiAgICB2YXIgVFlQRV9VSU5UMTZBUlJBWSA9ICd1cjE2JztcbiAgICB2YXIgVFlQRV9VSU5UMzJBUlJBWSA9ICd1aTMyJztcbiAgICB2YXIgVFlQRV9GTE9BVDMyQVJSQVkgPSAnZmwzMic7XG4gICAgdmFyIFRZUEVfRkxPQVQ2NEFSUkFZID0gJ2ZsNjQnO1xuICAgIHZhciBUWVBFX1NFUklBTElaRURfTUFSS0VSX0xFTkdUSCA9IFNFUklBTElaRURfTUFSS0VSX0xFTkdUSCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVFlQRV9BUlJBWUJVRkZFUi5sZW5ndGg7XG5cbiAgICAvLyBSZW1vdmUgYWxsIGtleXMgZnJvbSB0aGUgZGF0YXN0b3JlLCBlZmZlY3RpdmVseSBkZXN0cm95aW5nIGFsbCBkYXRhIGluXG4gICAgLy8gdGhlIGFwcCdzIGtleS92YWx1ZSBzdG9yZSFcbiAgICBmdW5jdGlvbiBjbGVhcihjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIga2V5UHJlZml4ID0gc2VsZi5fZGJJbmZvLmtleVByZWZpeDtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSBsb2NhbFN0b3JhZ2UubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IGxvY2FsU3RvcmFnZS5rZXkoaSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleS5pbmRleE9mKGtleVByZWZpeCkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9KS5jYXRjaChyZWplY3QpO1xuICAgICAgICB9KTtcblxuICAgICAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbiAgICAvLyBSZXRyaWV2ZSBhbiBpdGVtIGZyb20gdGhlIHN0b3JlLiBVbmxpa2UgdGhlIG9yaWdpbmFsIGFzeW5jX3N0b3JhZ2VcbiAgICAvLyBsaWJyYXJ5IGluIEdhaWEsIHdlIGRvbid0IG1vZGlmeSByZXR1cm4gdmFsdWVzIGF0IGFsbC4gSWYgYSBrZXkncyB2YWx1ZVxuICAgIC8vIGlzIGB1bmRlZmluZWRgLCB3ZSBwYXNzIHRoYXQgdmFsdWUgdG8gdGhlIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgIGZ1bmN0aW9uIGdldEl0ZW0oa2V5LCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgLy8gQ2FzdCB0aGUga2V5IHRvIGEgc3RyaW5nLCBhcyB0aGF0J3MgYWxsIHdlIGNhbiBzZXQgYXMgYSBrZXkuXG4gICAgICAgIGlmICh0eXBlb2Yga2V5ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgd2luZG93LmNvbnNvbGUud2FybihrZXkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIHVzZWQgYXMgYSBrZXksIGJ1dCBpdCBpcyBub3QgYSBzdHJpbmcuJyk7XG4gICAgICAgICAgICBrZXkgPSBTdHJpbmcoa2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oZGJJbmZvLmtleVByZWZpeCArIGtleSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgYSByZXN1bHQgd2FzIGZvdW5kLCBwYXJzZSBpdCBmcm9tIHRoZSBzZXJpYWxpemVkXG4gICAgICAgICAgICAgICAgICAgIC8vIHN0cmluZyBpbnRvIGEgSlMgb2JqZWN0LiBJZiByZXN1bHQgaXNuJ3QgdHJ1dGh5LCB0aGUga2V5XG4gICAgICAgICAgICAgICAgICAgIC8vIGlzIGxpa2VseSB1bmRlZmluZWQgYW5kIHdlJ2xsIHBhc3MgaXQgc3RyYWlnaHQgdG8gdGhlXG4gICAgICAgICAgICAgICAgICAgIC8vIGNhbGxiYWNrLlxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBfZGVzZXJpYWxpemUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChyZWplY3QpO1xuICAgICAgICB9KTtcblxuICAgICAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbiAgICAvLyBJdGVyYXRlIG92ZXIgYWxsIGl0ZW1zIGluIHRoZSBzdG9yZS5cbiAgICBmdW5jdGlvbiBpdGVyYXRlKGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXlQcmVmaXggPSBzZWxmLl9kYkluZm8ua2V5UHJlZml4O1xuICAgICAgICAgICAgICAgICAgICB2YXIga2V5UHJlZml4TGVuZ3RoID0ga2V5UHJlZml4Lmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxlbmd0aCA9IGxvY2FsU3RvcmFnZS5sZW5ndGg7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IGxvY2FsU3RvcmFnZS5rZXkoaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBhIHJlc3VsdCB3YXMgZm91bmQsIHBhcnNlIGl0IGZyb20gdGhlIHNlcmlhbGl6ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHN0cmluZyBpbnRvIGEgSlMgb2JqZWN0LiBJZiByZXN1bHQgaXNuJ3QgdHJ1dGh5LCB0aGVcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGtleSBpcyBsaWtlbHkgdW5kZWZpbmVkIGFuZCB3ZSdsbCBwYXNzIGl0IHN0cmFpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0byB0aGUgaXRlcmF0b3IuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IF9kZXNlcmlhbGl6ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gaXRlcmF0b3IodmFsdWUsIGtleS5zdWJzdHJpbmcoa2V5UHJlZml4TGVuZ3RoKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdm9pZCgwKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChyZWplY3QpO1xuICAgICAgICB9KTtcblxuICAgICAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbiAgICAvLyBTYW1lIGFzIGxvY2FsU3RvcmFnZSdzIGtleSgpIG1ldGhvZCwgZXhjZXB0IHRha2VzIGEgY2FsbGJhY2suXG4gICAgZnVuY3Rpb24ga2V5KG4sIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBsb2NhbFN0b3JhZ2Uua2V5KG4pO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRoZSBwcmVmaXggZnJvbSB0aGUga2V5LCBpZiBhIGtleSBpcyBmb3VuZC5cbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5zdWJzdHJpbmcoZGJJbmZvLmtleVByZWZpeC5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKHJlamVjdCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGtleXMoY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcbiAgICAgICAgICAgICAgICB2YXIgbGVuZ3RoID0gbG9jYWxTdG9yYWdlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB2YXIga2V5cyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAobG9jYWxTdG9yYWdlLmtleShpKS5pbmRleE9mKGRiSW5mby5rZXlQcmVmaXgpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXlzLnB1c2gobG9jYWxTdG9yYWdlLmtleShpKS5zdWJzdHJpbmcoZGJJbmZvLmtleVByZWZpeC5sZW5ndGgpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJlc29sdmUoa2V5cyk7XG4gICAgICAgICAgICB9KS5jYXRjaChyZWplY3QpO1xuICAgICAgICB9KTtcblxuICAgICAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbiAgICAvLyBTdXBwbHkgdGhlIG51bWJlciBvZiBrZXlzIGluIHRoZSBkYXRhc3RvcmUgdG8gdGhlIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgIGZ1bmN0aW9uIGxlbmd0aChjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBzZWxmLmtleXMoKS50aGVuKGZ1bmN0aW9uKGtleXMpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGtleXMubGVuZ3RoKTtcbiAgICAgICAgICAgIH0pLmNhdGNoKHJlamVjdCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSBhbiBpdGVtIGZyb20gdGhlIHN0b3JlLCBuaWNlIGFuZCBzaW1wbGUuXG4gICAgZnVuY3Rpb24gcmVtb3ZlSXRlbShrZXksIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAvLyBDYXN0IHRoZSBrZXkgdG8gYSBzdHJpbmcsIGFzIHRoYXQncyBhbGwgd2UgY2FuIHNldCBhcyBhIGtleS5cbiAgICAgICAgaWYgKHR5cGVvZiBrZXkgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB3aW5kb3cuY29uc29sZS53YXJuKGtleSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgdXNlZCBhcyBhIGtleSwgYnV0IGl0IGlzIG5vdCBhIHN0cmluZy4nKTtcbiAgICAgICAgICAgIGtleSA9IFN0cmluZyhrZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG4gICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oZGJJbmZvLmtleVByZWZpeCArIGtleSk7XG5cbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9KS5jYXRjaChyZWplY3QpO1xuICAgICAgICB9KTtcblxuICAgICAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbiAgICAvLyBEZXNlcmlhbGl6ZSBkYXRhIHdlJ3ZlIGluc2VydGVkIGludG8gYSB2YWx1ZSBjb2x1bW4vZmllbGQuIFdlIHBsYWNlXG4gICAgLy8gc3BlY2lhbCBtYXJrZXJzIGludG8gb3VyIHN0cmluZ3MgdG8gbWFyayB0aGVtIGFzIGVuY29kZWQ7IHRoaXMgaXNuJ3RcbiAgICAvLyBhcyBuaWNlIGFzIGEgbWV0YSBmaWVsZCwgYnV0IGl0J3MgdGhlIG9ubHkgc2FuZSB0aGluZyB3ZSBjYW4gZG8gd2hpbHN0XG4gICAgLy8ga2VlcGluZyBsb2NhbFN0b3JhZ2Ugc3VwcG9ydCBpbnRhY3QuXG4gICAgLy9cbiAgICAvLyBPZnRlbnRpbWVzIHRoaXMgd2lsbCBqdXN0IGRlc2VyaWFsaXplIEpTT04gY29udGVudCwgYnV0IGlmIHdlIGhhdmUgYVxuICAgIC8vIHNwZWNpYWwgbWFya2VyIChTRVJJQUxJWkVEX01BUktFUiwgZGVmaW5lZCBhYm92ZSksIHdlIHdpbGwgZXh0cmFjdFxuICAgIC8vIHNvbWUga2luZCBvZiBhcnJheWJ1ZmZlci9iaW5hcnkgZGF0YS90eXBlZCBhcnJheSBvdXQgb2YgdGhlIHN0cmluZy5cbiAgICBmdW5jdGlvbiBfZGVzZXJpYWxpemUodmFsdWUpIHtcbiAgICAgICAgLy8gSWYgd2UgaGF2ZW4ndCBtYXJrZWQgdGhpcyBzdHJpbmcgYXMgYmVpbmcgc3BlY2lhbGx5IHNlcmlhbGl6ZWQgKGkuZS5cbiAgICAgICAgLy8gc29tZXRoaW5nIG90aGVyIHRoYW4gc2VyaWFsaXplZCBKU09OKSwgd2UgY2FuIGp1c3QgcmV0dXJuIGl0IGFuZCBiZVxuICAgICAgICAvLyBkb25lIHdpdGggaXQuXG4gICAgICAgIGlmICh2YWx1ZS5zdWJzdHJpbmcoMCxcbiAgICAgICAgICAgIFNFUklBTElaRURfTUFSS0VSX0xFTkdUSCkgIT09IFNFUklBTElaRURfTUFSS0VSKSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGNvZGUgZGVhbHMgd2l0aCBkZXNlcmlhbGl6aW5nIHNvbWUga2luZCBvZiBCbG9iIG9yXG4gICAgICAgIC8vIFR5cGVkQXJyYXkuIEZpcnN0IHdlIHNlcGFyYXRlIG91dCB0aGUgdHlwZSBvZiBkYXRhIHdlJ3JlIGRlYWxpbmdcbiAgICAgICAgLy8gd2l0aCBmcm9tIHRoZSBkYXRhIGl0c2VsZi5cbiAgICAgICAgdmFyIHNlcmlhbGl6ZWRTdHJpbmcgPSB2YWx1ZS5zdWJzdHJpbmcoVFlQRV9TRVJJQUxJWkVEX01BUktFUl9MRU5HVEgpO1xuICAgICAgICB2YXIgdHlwZSA9IHZhbHVlLnN1YnN0cmluZyhTRVJJQUxJWkVEX01BUktFUl9MRU5HVEgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRZUEVfU0VSSUFMSVpFRF9NQVJLRVJfTEVOR1RIKTtcblxuICAgICAgICAvLyBGaWxsIHRoZSBzdHJpbmcgaW50byBhIEFycmF5QnVmZmVyLlxuICAgICAgICAvLyAyIGJ5dGVzIGZvciBlYWNoIGNoYXIuXG4gICAgICAgIHZhciBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoc2VyaWFsaXplZFN0cmluZy5sZW5ndGggKiAyKTtcbiAgICAgICAgdmFyIGJ1ZmZlclZpZXcgPSBuZXcgVWludDE2QXJyYXkoYnVmZmVyKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IHNlcmlhbGl6ZWRTdHJpbmcubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGJ1ZmZlclZpZXdbaV0gPSBzZXJpYWxpemVkU3RyaW5nLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXR1cm4gdGhlIHJpZ2h0IHR5cGUgYmFzZWQgb24gdGhlIGNvZGUvdHlwZSBzZXQgZHVyaW5nXG4gICAgICAgIC8vIHNlcmlhbGl6YXRpb24uXG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSBUWVBFX0FSUkFZQlVGRkVSOlxuICAgICAgICAgICAgICAgIHJldHVybiBidWZmZXI7XG4gICAgICAgICAgICBjYXNlIFRZUEVfQkxPQjpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEJsb2IoW2J1ZmZlcl0pO1xuICAgICAgICAgICAgY2FzZSBUWVBFX0lOVDhBUlJBWTpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEludDhBcnJheShidWZmZXIpO1xuICAgICAgICAgICAgY2FzZSBUWVBFX1VJTlQ4QVJSQVk6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgICAgICAgICBjYXNlIFRZUEVfVUlOVDhDTEFNUEVEQVJSQVk6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBVaW50OENsYW1wZWRBcnJheShidWZmZXIpO1xuICAgICAgICAgICAgY2FzZSBUWVBFX0lOVDE2QVJSQVk6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBJbnQxNkFycmF5KGJ1ZmZlcik7XG4gICAgICAgICAgICBjYXNlIFRZUEVfVUlOVDE2QVJSQVk6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBVaW50MTZBcnJheShidWZmZXIpO1xuICAgICAgICAgICAgY2FzZSBUWVBFX0lOVDMyQVJSQVk6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBJbnQzMkFycmF5KGJ1ZmZlcik7XG4gICAgICAgICAgICBjYXNlIFRZUEVfVUlOVDMyQVJSQVk6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBVaW50MzJBcnJheShidWZmZXIpO1xuICAgICAgICAgICAgY2FzZSBUWVBFX0ZMT0FUMzJBUlJBWTpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZsb2F0MzJBcnJheShidWZmZXIpO1xuICAgICAgICAgICAgY2FzZSBUWVBFX0ZMT0FUNjRBUlJBWTpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZsb2F0NjRBcnJheShidWZmZXIpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua293biB0eXBlOiAnICsgdHlwZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDb252ZXJ0cyBhIGJ1ZmZlciB0byBhIHN0cmluZyB0byBzdG9yZSwgc2VyaWFsaXplZCwgaW4gdGhlIGJhY2tlbmRcbiAgICAvLyBzdG9yYWdlIGxpYnJhcnkuXG4gICAgZnVuY3Rpb24gX2J1ZmZlclRvU3RyaW5nKGJ1ZmZlcikge1xuICAgICAgICB2YXIgc3RyID0gJyc7XG4gICAgICAgIHZhciB1aW50MTZBcnJheSA9IG5ldyBVaW50MTZBcnJheShidWZmZXIpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzdHIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIHVpbnQxNkFycmF5KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgLy8gVGhpcyBpcyBhIGZhbGxiYWNrIGltcGxlbWVudGF0aW9uIGluIGNhc2UgdGhlIGZpcnN0IG9uZSBkb2VzXG4gICAgICAgICAgICAvLyBub3Qgd29yay4gVGhpcyBpcyByZXF1aXJlZCB0byBnZXQgdGhlIHBoYW50b21qcyBwYXNzaW5nLi4uXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHVpbnQxNkFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUodWludDE2QXJyYXlbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG5cbiAgICAvLyBTZXJpYWxpemUgYSB2YWx1ZSwgYWZ0ZXJ3YXJkcyBleGVjdXRpbmcgYSBjYWxsYmFjayAod2hpY2ggdXN1YWxseVxuICAgIC8vIGluc3RydWN0cyB0aGUgYHNldEl0ZW0oKWAgY2FsbGJhY2svcHJvbWlzZSB0byBiZSBleGVjdXRlZCkuIFRoaXMgaXMgaG93XG4gICAgLy8gd2Ugc3RvcmUgYmluYXJ5IGRhdGEgd2l0aCBsb2NhbFN0b3JhZ2UuXG4gICAgZnVuY3Rpb24gX3NlcmlhbGl6ZSh2YWx1ZSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHZhbHVlU3RyaW5nID0gJyc7XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFsdWVTdHJpbmcgPSB2YWx1ZS50b1N0cmluZygpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2Fubm90IHVzZSBgdmFsdWUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcmAgb3Igc3VjaCBoZXJlLCBhcyB0aGVzZVxuICAgICAgICAvLyBjaGVja3MgZmFpbCB3aGVuIHJ1bm5pbmcgdGhlIHRlc3RzIHVzaW5nIGNhc3Blci5qcy4uLlxuICAgICAgICAvL1xuICAgICAgICAvLyBUT0RPOiBTZWUgd2h5IHRob3NlIHRlc3RzIGZhaWwgYW5kIHVzZSBhIGJldHRlciBzb2x1dGlvbi5cbiAgICAgICAgaWYgKHZhbHVlICYmICh2YWx1ZS50b1N0cmluZygpID09PSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nIHx8XG4gICAgICAgICAgICAgICAgICAgICAgdmFsdWUuYnVmZmVyICYmXG4gICAgICAgICAgICAgICAgICAgICAgdmFsdWUuYnVmZmVyLnRvU3RyaW5nKCkgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXScpKSB7XG4gICAgICAgICAgICAvLyBDb252ZXJ0IGJpbmFyeSBhcnJheXMgdG8gYSBzdHJpbmcgYW5kIHByZWZpeCB0aGUgc3RyaW5nIHdpdGhcbiAgICAgICAgICAgIC8vIGEgc3BlY2lhbCBtYXJrZXIuXG4gICAgICAgICAgICB2YXIgYnVmZmVyO1xuICAgICAgICAgICAgdmFyIG1hcmtlciA9IFNFUklBTElaRURfTUFSS0VSO1xuXG4gICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgICAgICAgICAgICAgIGJ1ZmZlciA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIG1hcmtlciArPSBUWVBFX0FSUkFZQlVGRkVSO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBidWZmZXIgPSB2YWx1ZS5idWZmZXI7XG5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWVTdHJpbmcgPT09ICdbb2JqZWN0IEludDhBcnJheV0nKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcmtlciArPSBUWVBFX0lOVDhBUlJBWTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlU3RyaW5nID09PSAnW29iamVjdCBVaW50OEFycmF5XScpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyICs9IFRZUEVfVUlOVDhBUlJBWTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlU3RyaW5nID09PSAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcmtlciArPSBUWVBFX1VJTlQ4Q0xBTVBFREFSUkFZO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWVTdHJpbmcgPT09ICdbb2JqZWN0IEludDE2QXJyYXldJykge1xuICAgICAgICAgICAgICAgICAgICBtYXJrZXIgKz0gVFlQRV9JTlQxNkFSUkFZO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWVTdHJpbmcgPT09ICdbb2JqZWN0IFVpbnQxNkFycmF5XScpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyICs9IFRZUEVfVUlOVDE2QVJSQVk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVN0cmluZyA9PT0gJ1tvYmplY3QgSW50MzJBcnJheV0nKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcmtlciArPSBUWVBFX0lOVDMyQVJSQVk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVN0cmluZyA9PT0gJ1tvYmplY3QgVWludDMyQXJyYXldJykge1xuICAgICAgICAgICAgICAgICAgICBtYXJrZXIgKz0gVFlQRV9VSU5UMzJBUlJBWTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlU3RyaW5nID09PSAnW29iamVjdCBGbG9hdDMyQXJyYXldJykge1xuICAgICAgICAgICAgICAgICAgICBtYXJrZXIgKz0gVFlQRV9GTE9BVDMyQVJSQVk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVN0cmluZyA9PT0gJ1tvYmplY3QgRmxvYXQ2NEFycmF5XScpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyICs9IFRZUEVfRkxPQVQ2NEFSUkFZO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG5ldyBFcnJvcignRmFpbGVkIHRvIGdldCB0eXBlIGZvciBCaW5hcnlBcnJheScpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNhbGxiYWNrKG1hcmtlciArIF9idWZmZXJUb1N0cmluZyhidWZmZXIpKTtcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVN0cmluZyA9PT0gJ1tvYmplY3QgQmxvYl0nKSB7XG4gICAgICAgICAgICAvLyBDb252ZXIgdGhlIGJsb2IgdG8gYSBiaW5hcnlBcnJheSBhbmQgdGhlbiB0byBhIHN0cmluZy5cbiAgICAgICAgICAgIHZhciBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblxuICAgICAgICAgICAgZmlsZVJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RyID0gX2J1ZmZlclRvU3RyaW5nKHRoaXMucmVzdWx0KTtcblxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKFNFUklBTElaRURfTUFSS0VSICsgVFlQRV9CTE9CICsgc3RyKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZpbGVSZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIodmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5jb25zb2xlLmVycm9yKFwiQ291bGRuJ3QgY29udmVydCB2YWx1ZSBpbnRvIGEgSlNPTiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3N0cmluZzogJywgdmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTZXQgYSBrZXkncyB2YWx1ZSBhbmQgcnVuIGFuIG9wdGlvbmFsIGNhbGxiYWNrIG9uY2UgdGhlIHZhbHVlIGlzIHNldC5cbiAgICAvLyBVbmxpa2UgR2FpYSdzIGltcGxlbWVudGF0aW9uLCB0aGUgY2FsbGJhY2sgZnVuY3Rpb24gaXMgcGFzc2VkIHRoZSB2YWx1ZSxcbiAgICAvLyBpbiBjYXNlIHlvdSB3YW50IHRvIG9wZXJhdGUgb24gdGhhdCB2YWx1ZSBvbmx5IGFmdGVyIHlvdSdyZSBzdXJlIGl0XG4gICAgLy8gc2F2ZWQsIG9yIHNvbWV0aGluZyBsaWtlIHRoYXQuXG4gICAgZnVuY3Rpb24gc2V0SXRlbShrZXksIHZhbHVlLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgLy8gQ2FzdCB0aGUga2V5IHRvIGEgc3RyaW5nLCBhcyB0aGF0J3MgYWxsIHdlIGNhbiBzZXQgYXMgYSBrZXkuXG4gICAgICAgIGlmICh0eXBlb2Yga2V5ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgd2luZG93LmNvbnNvbGUud2FybihrZXkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIHVzZWQgYXMgYSBrZXksIGJ1dCBpdCBpcyBub3QgYSBzdHJpbmcuJyk7XG4gICAgICAgICAgICBrZXkgPSBTdHJpbmcoa2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IHVuZGVmaW5lZCB2YWx1ZXMgdG8gbnVsbC5cbiAgICAgICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS9sb2NhbEZvcmFnZS9wdWxsLzQyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFNhdmUgdGhlIG9yaWdpbmFsIHZhbHVlIHRvIHBhc3MgdG8gdGhlIGNhbGxiYWNrLlxuICAgICAgICAgICAgICAgIHZhciBvcmlnaW5hbFZhbHVlID0gdmFsdWU7XG5cbiAgICAgICAgICAgICAgICBfc2VyaWFsaXplKHZhbHVlLCBmdW5jdGlvbih2YWx1ZSwgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGRiSW5mby5rZXlQcmVmaXggKyBrZXksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBsb2NhbFN0b3JhZ2UgY2FwYWNpdHkgZXhjZWVkZWQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogTWFrZSB0aGlzIGEgc3BlY2lmaWMgZXJyb3IvZXZlbnQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUubmFtZSA9PT0gJ1F1b3RhRXhjZWVkZWRFcnJvcicgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5uYW1lID09PSAnTlNfRVJST1JfRE9NX1FVT1RBX1JFQUNIRUQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUob3JpZ2luYWxWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKHJlamVjdCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHByb21pc2UudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHQpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBsb2NhbFN0b3JhZ2VXcmFwcGVyID0ge1xuICAgICAgICBfZHJpdmVyOiAnbG9jYWxTdG9yYWdlV3JhcHBlcicsXG4gICAgICAgIF9pbml0U3RvcmFnZTogX2luaXRTdG9yYWdlLFxuICAgICAgICAvLyBEZWZhdWx0IEFQSSwgZnJvbSBHYWlhL2xvY2FsU3RvcmFnZS5cbiAgICAgICAgaXRlcmF0ZTogaXRlcmF0ZSxcbiAgICAgICAgZ2V0SXRlbTogZ2V0SXRlbSxcbiAgICAgICAgc2V0SXRlbTogc2V0SXRlbSxcbiAgICAgICAgcmVtb3ZlSXRlbTogcmVtb3ZlSXRlbSxcbiAgICAgICAgY2xlYXI6IGNsZWFyLFxuICAgICAgICBsZW5ndGg6IGxlbmd0aCxcbiAgICAgICAga2V5OiBrZXksXG4gICAgICAgIGtleXM6IGtleXNcbiAgICB9O1xuXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoJ2xvY2FsU3RvcmFnZVdyYXBwZXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2NhbFN0b3JhZ2VXcmFwcGVyO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gbG9jYWxTdG9yYWdlV3JhcHBlcjtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZVdyYXBwZXIgPSBsb2NhbFN0b3JhZ2VXcmFwcGVyO1xuICAgIH1cbn0pLmNhbGwod2luZG93KTtcbiIsIi8qXG4gKiBJbmNsdWRlcyBjb2RlIGZyb206XG4gKlxuICogYmFzZTY0LWFycmF5YnVmZmVyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vbmlrbGFzdmgvYmFzZTY0LWFycmF5YnVmZmVyXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDEyIE5pa2xhcyB2b24gSGVydHplblxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICovXG4oZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gU2FkbHksIHRoZSBiZXN0IHdheSB0byBzYXZlIGJpbmFyeSBkYXRhIGluIFdlYlNRTCBpcyBCYXNlNjQgc2VyaWFsaXppbmdcbiAgICAvLyBpdCwgc28gdGhpcyBpcyBob3cgd2Ugc3RvcmUgaXQgdG8gcHJldmVudCB2ZXJ5IHN0cmFuZ2UgZXJyb3JzIHdpdGggbGVzc1xuICAgIC8vIHZlcmJvc2Ugd2F5cyBvZiBiaW5hcnkgPC0+IHN0cmluZyBkYXRhIHN0b3JhZ2UuXG4gICAgdmFyIEJBU0VfQ0hBUlMgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7XG5cbiAgICAvLyBQcm9taXNlcyFcbiAgICB2YXIgUHJvbWlzZSA9ICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykgP1xuICAgICAgICAgICAgICAgICAgcmVxdWlyZSgncHJvbWlzZScpIDogdGhpcy5Qcm9taXNlO1xuXG4gICAgdmFyIG9wZW5EYXRhYmFzZSA9IHRoaXMub3BlbkRhdGFiYXNlO1xuXG4gICAgdmFyIFNFUklBTElaRURfTUFSS0VSID0gJ19fbGZzY19fOic7XG4gICAgdmFyIFNFUklBTElaRURfTUFSS0VSX0xFTkdUSCA9IFNFUklBTElaRURfTUFSS0VSLmxlbmd0aDtcblxuICAgIC8vIE9NRyB0aGUgc2VyaWFsaXphdGlvbnMhXG4gICAgdmFyIFRZUEVfQVJSQVlCVUZGRVIgPSAnYXJiZic7XG4gICAgdmFyIFRZUEVfQkxPQiA9ICdibG9iJztcbiAgICB2YXIgVFlQRV9JTlQ4QVJSQVkgPSAnc2kwOCc7XG4gICAgdmFyIFRZUEVfVUlOVDhBUlJBWSA9ICd1aTA4JztcbiAgICB2YXIgVFlQRV9VSU5UOENMQU1QRURBUlJBWSA9ICd1aWM4JztcbiAgICB2YXIgVFlQRV9JTlQxNkFSUkFZID0gJ3NpMTYnO1xuICAgIHZhciBUWVBFX0lOVDMyQVJSQVkgPSAnc2kzMic7XG4gICAgdmFyIFRZUEVfVUlOVDE2QVJSQVkgPSAndXIxNic7XG4gICAgdmFyIFRZUEVfVUlOVDMyQVJSQVkgPSAndWkzMic7XG4gICAgdmFyIFRZUEVfRkxPQVQzMkFSUkFZID0gJ2ZsMzInO1xuICAgIHZhciBUWVBFX0ZMT0FUNjRBUlJBWSA9ICdmbDY0JztcbiAgICB2YXIgVFlQRV9TRVJJQUxJWkVEX01BUktFUl9MRU5HVEggPSBTRVJJQUxJWkVEX01BUktFUl9MRU5HVEggK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRZUEVfQVJSQVlCVUZGRVIubGVuZ3RoO1xuXG4gICAgLy8gSWYgV2ViU1FMIG1ldGhvZHMgYXJlbid0IGF2YWlsYWJsZSwgd2UgY2FuIHN0b3Agbm93LlxuICAgIGlmICghb3BlbkRhdGFiYXNlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBPcGVuIHRoZSBXZWJTUUwgZGF0YWJhc2UgKGF1dG9tYXRpY2FsbHkgY3JlYXRlcyBvbmUgaWYgb25lIGRpZG4ndFxuICAgIC8vIHByZXZpb3VzbHkgZXhpc3QpLCB1c2luZyBhbnkgb3B0aW9ucyBzZXQgaW4gdGhlIGNvbmZpZy5cbiAgICBmdW5jdGlvbiBfaW5pdFN0b3JhZ2Uob3B0aW9ucykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBkYkluZm8gPSB7XG4gICAgICAgICAgICBkYjogbnVsbFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBkYkluZm9baV0gPSB0eXBlb2Yob3B0aW9uc1tpXSkgIT09ICdzdHJpbmcnID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zW2ldLnRvU3RyaW5nKCkgOiBvcHRpb25zW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgLy8gT3BlbiB0aGUgZGF0YWJhc2U7IHRoZSBvcGVuRGF0YWJhc2UgQVBJIHdpbGwgYXV0b21hdGljYWxseVxuICAgICAgICAgICAgLy8gY3JlYXRlIGl0IGZvciB1cyBpZiBpdCBkb2Vzbid0IGV4aXN0LlxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBkYkluZm8uZGIgPSBvcGVuRGF0YWJhc2UoZGJJbmZvLm5hbWUsIFN0cmluZyhkYkluZm8udmVyc2lvbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRiSW5mby5kZXNjcmlwdGlvbiwgZGJJbmZvLnNpemUpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLnNldERyaXZlcignbG9jYWxTdG9yYWdlV3JhcHBlcicpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuX2luaXRTdG9yYWdlKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAudGhlbihyZXNvbHZlKVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2gocmVqZWN0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ3JlYXRlIG91ciBrZXkvdmFsdWUgdGFibGUgaWYgaXQgZG9lc24ndCBleGlzdC5cbiAgICAgICAgICAgIGRiSW5mby5kYi50cmFuc2FjdGlvbihmdW5jdGlvbih0KSB7XG4gICAgICAgICAgICAgICAgdC5leGVjdXRlU3FsKCdDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyAnICsgZGJJbmZvLnN0b3JlTmFtZSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgKGlkIElOVEVHRVIgUFJJTUFSWSBLRVksIGtleSB1bmlxdWUsIHZhbHVlKScsIFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fZGJJbmZvID0gZGJJbmZvO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24odCwgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRJdGVtKGtleSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIC8vIENhc3QgdGhlIGtleSB0byBhIHN0cmluZywgYXMgdGhhdCdzIGFsbCB3ZSBjYW4gc2V0IGFzIGEga2V5LlxuICAgICAgICBpZiAodHlwZW9mIGtleSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHdpbmRvdy5jb25zb2xlLndhcm4oa2V5ICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyB1c2VkIGFzIGEga2V5LCBidXQgaXQgaXMgbm90IGEgc3RyaW5nLicpO1xuICAgICAgICAgICAga2V5ID0gU3RyaW5nKGtleSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcbiAgICAgICAgICAgICAgICBkYkluZm8uZGIudHJhbnNhY3Rpb24oZnVuY3Rpb24odCkge1xuICAgICAgICAgICAgICAgICAgICB0LmV4ZWN1dGVTcWwoJ1NFTEVDVCAqIEZST00gJyArIGRiSW5mby5zdG9yZU5hbWUgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyBXSEVSRSBrZXkgPSA/IExJTUlUIDEnLCBba2V5XSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHQsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSByZXN1bHRzLnJvd3MubGVuZ3RoID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnJvd3MuaXRlbSgwKS52YWx1ZSA6IG51bGw7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB0aGlzIGlzIHNlcmlhbGl6ZWQgY29udGVudCB3ZSBuZWVkIHRvXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB1bnBhY2suXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gX2Rlc2VyaWFsaXplKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24odCwgZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaChyZWplY3QpO1xuICAgICAgICB9KTtcblxuICAgICAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpdGVyYXRlKGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG5cbiAgICAgICAgICAgICAgICBkYkluZm8uZGIudHJhbnNhY3Rpb24oZnVuY3Rpb24odCkge1xuICAgICAgICAgICAgICAgICAgICB0LmV4ZWN1dGVTcWwoJ1NFTEVDVCAqIEZST00gJyArIGRiSW5mby5zdG9yZU5hbWUsIFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24odCwgcmVzdWx0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciByb3dzID0gcmVzdWx0cy5yb3dzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsZW5ndGggPSByb3dzLmxlbmd0aDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSByb3dzLml0ZW0oaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBpdGVtLnZhbHVlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB0aGlzIGlzIHNlcmlhbGl6ZWQgY29udGVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSBuZWVkIHRvIHVucGFjay5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gX2Rlc2VyaWFsaXplKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBpdGVyYXRvcihyZXN1bHQsIGl0ZW0ua2V5KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB2b2lkKDApIHByZXZlbnRzIHByb2JsZW1zIHdpdGggcmVkZWZpbml0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9mIGB1bmRlZmluZWRgLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICE9PSB2b2lkKDApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbih0LCBlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKHJlamVjdCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldEl0ZW0oa2V5LCB2YWx1ZSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIC8vIENhc3QgdGhlIGtleSB0byBhIHN0cmluZywgYXMgdGhhdCdzIGFsbCB3ZSBjYW4gc2V0IGFzIGEga2V5LlxuICAgICAgICBpZiAodHlwZW9mIGtleSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHdpbmRvdy5jb25zb2xlLndhcm4oa2V5ICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyB1c2VkIGFzIGEga2V5LCBidXQgaXQgaXMgbm90IGEgc3RyaW5nLicpO1xuICAgICAgICAgICAga2V5ID0gU3RyaW5nKGtleSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIGxvY2FsU3RvcmFnZSBBUEkgZG9lc24ndCByZXR1cm4gdW5kZWZpbmVkIHZhbHVlcyBpbiBhblxuICAgICAgICAgICAgICAgIC8vIFwiZXhwZWN0ZWRcIiB3YXksIHNvIHVuZGVmaW5lZCBpcyBhbHdheXMgY2FzdCB0byBudWxsIGluIGFsbFxuICAgICAgICAgICAgICAgIC8vIGRyaXZlcnMuIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEvbG9jYWxGb3JhZ2UvcHVsbC80MlxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBTYXZlIHRoZSBvcmlnaW5hbCB2YWx1ZSB0byBwYXNzIHRvIHRoZSBjYWxsYmFjay5cbiAgICAgICAgICAgICAgICB2YXIgb3JpZ2luYWxWYWx1ZSA9IHZhbHVlO1xuXG4gICAgICAgICAgICAgICAgX3NlcmlhbGl6ZSh2YWx1ZSwgZnVuY3Rpb24odmFsdWUsIGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG4gICAgICAgICAgICAgICAgICAgICAgICBkYkluZm8uZGIudHJhbnNhY3Rpb24oZnVuY3Rpb24odCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQuZXhlY3V0ZVNxbCgnSU5TRVJUIE9SIFJFUExBQ0UgSU5UTyAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGJJbmZvLnN0b3JlTmFtZSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgKGtleSwgdmFsdWUpIFZBTFVFUyAoPywgPyknLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBba2V5LCB2YWx1ZV0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG9yaWdpbmFsVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKHQsIGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihzcWxFcnJvcikgeyAvLyBUaGUgdHJhbnNhY3Rpb24gZmFpbGVkOyBjaGVja1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdG8gc2VlIGlmIGl0J3MgYSBxdW90YSBlcnJvci5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3FsRXJyb3IuY29kZSA9PT0gc3FsRXJyb3IuUVVPVEFfRVJSKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIHJlamVjdCB0aGUgY2FsbGJhY2sgb3V0cmlnaHQgZm9yIG5vdywgYnV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGl0J3Mgd29ydGggdHJ5aW5nIHRvIHJlLXJ1biB0aGUgdHJhbnNhY3Rpb24uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEV2ZW4gaWYgdGhlIHVzZXIgYWNjZXB0cyB0aGUgcHJvbXB0IHRvIHVzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBtb3JlIHN0b3JhZ2Ugb24gU2FmYXJpLCB0aGlzIGVycm9yIHdpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYmUgY2FsbGVkLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBUcnkgdG8gcmUtcnVuIHRoZSB0cmFuc2FjdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHNxbEVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkuY2F0Y2gocmVqZWN0KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVtb3ZlSXRlbShrZXksIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAvLyBDYXN0IHRoZSBrZXkgdG8gYSBzdHJpbmcsIGFzIHRoYXQncyBhbGwgd2UgY2FuIHNldCBhcyBhIGtleS5cbiAgICAgICAgaWYgKHR5cGVvZiBrZXkgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB3aW5kb3cuY29uc29sZS53YXJuKGtleSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgdXNlZCBhcyBhIGtleSwgYnV0IGl0IGlzIG5vdCBhIHN0cmluZy4nKTtcbiAgICAgICAgICAgIGtleSA9IFN0cmluZyhrZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG4gICAgICAgICAgICAgICAgZGJJbmZvLmRiLnRyYW5zYWN0aW9uKGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdC5leGVjdXRlU3FsKCdERUxFVEUgRlJPTSAnICsgZGJJbmZvLnN0b3JlTmFtZSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIFdIRVJFIGtleSA9ID8nLCBba2V5XSwgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24odCwgZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaChyZWplY3QpO1xuICAgICAgICB9KTtcblxuICAgICAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbiAgICAvLyBEZWxldGVzIGV2ZXJ5IGl0ZW0gaW4gdGhlIHRhYmxlLlxuICAgIC8vIFRPRE86IEZpbmQgb3V0IGlmIHRoaXMgcmVzZXRzIHRoZSBBVVRPX0lOQ1JFTUVOVCBudW1iZXIuXG4gICAgZnVuY3Rpb24gY2xlYXIoY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuICAgICAgICAgICAgICAgIGRiSW5mby5kYi50cmFuc2FjdGlvbihmdW5jdGlvbih0KSB7XG4gICAgICAgICAgICAgICAgICAgIHQuZXhlY3V0ZVNxbCgnREVMRVRFIEZST00gJyArIGRiSW5mby5zdG9yZU5hbWUsIFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKHQsIGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKHJlamVjdCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cblxuICAgIC8vIERvZXMgYSBzaW1wbGUgYENPVU5UKGtleSlgIHRvIGdldCB0aGUgbnVtYmVyIG9mIGl0ZW1zIHN0b3JlZCBpblxuICAgIC8vIGxvY2FsRm9yYWdlLlxuICAgIGZ1bmN0aW9uIGxlbmd0aChjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG4gICAgICAgICAgICAgICAgZGJJbmZvLmRiLnRyYW5zYWN0aW9uKGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQWhoaCwgU1FMIG1ha2VzIHRoaXMgb25lIHNvb29vb28gZWFzeS5cbiAgICAgICAgICAgICAgICAgICAgdC5leGVjdXRlU3FsKCdTRUxFQ1QgQ09VTlQoa2V5KSBhcyBjIEZST00gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYkluZm8uc3RvcmVOYW1lLCBbXSwgZnVuY3Rpb24odCwgcmVzdWx0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHJlc3VsdHMucm93cy5pdGVtKDApLmM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24odCwgZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaChyZWplY3QpO1xuICAgICAgICB9KTtcblxuICAgICAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gdGhlIGtleSBsb2NhdGVkIGF0IGtleSBpbmRleCBYOyBlc3NlbnRpYWxseSBnZXRzIHRoZSBrZXkgZnJvbSBhXG4gICAgLy8gYFdIRVJFIGlkID0gP2AuIFRoaXMgaXMgdGhlIG1vc3QgZWZmaWNpZW50IHdheSBJIGNhbiB0aGluayB0byBpbXBsZW1lbnRcbiAgICAvLyB0aGlzIHJhcmVseS11c2VkIChpbiBteSBleHBlcmllbmNlKSBwYXJ0IG9mIHRoZSBBUEksIGJ1dCBpdCBjYW4gc2VlbVxuICAgIC8vIGluY29uc2lzdGVudCwgYmVjYXVzZSB3ZSBkbyBgSU5TRVJUIE9SIFJFUExBQ0UgSU5UT2Agb24gYHNldEl0ZW0oKWAsIHNvXG4gICAgLy8gdGhlIElEIG9mIGVhY2gga2V5IHdpbGwgY2hhbmdlIGV2ZXJ5IHRpbWUgaXQncyB1cGRhdGVkLiBQZXJoYXBzIGEgc3RvcmVkXG4gICAgLy8gcHJvY2VkdXJlIGZvciB0aGUgYHNldEl0ZW0oKWAgU1FMIHdvdWxkIHNvbHZlIHRoaXMgcHJvYmxlbT9cbiAgICAvLyBUT0RPOiBEb24ndCBjaGFuZ2UgSUQgb24gYHNldEl0ZW0oKWAuXG4gICAgZnVuY3Rpb24ga2V5KG4sIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcbiAgICAgICAgICAgICAgICBkYkluZm8uZGIudHJhbnNhY3Rpb24oZnVuY3Rpb24odCkge1xuICAgICAgICAgICAgICAgICAgICB0LmV4ZWN1dGVTcWwoJ1NFTEVDVCBrZXkgRlJPTSAnICsgZGJJbmZvLnN0b3JlTmFtZSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIFdIRVJFIGlkID0gPyBMSU1JVCAxJywgW24gKyAxXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHQsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSByZXN1bHRzLnJvd3MubGVuZ3RoID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnJvd3MuaXRlbSgwKS5rZXkgOiBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbih0LCBlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaChyZWplY3QpO1xuICAgICAgICB9KTtcblxuICAgICAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBrZXlzKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcbiAgICAgICAgICAgICAgICBkYkluZm8uZGIudHJhbnNhY3Rpb24oZnVuY3Rpb24odCkge1xuICAgICAgICAgICAgICAgICAgICB0LmV4ZWN1dGVTcWwoJ1NFTEVDVCBrZXkgRlJPTSAnICsgZGJJbmZvLnN0b3JlTmFtZSwgW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbih0LCByZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIga2V5cyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc3VsdHMucm93cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleXMucHVzaChyZXN1bHRzLnJvd3MuaXRlbShpKS5rZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGtleXMpO1xuICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbih0LCBlcnJvcikge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKHJlamVjdCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cblxuICAgIC8vIENvbnZlcnRzIGEgYnVmZmVyIHRvIGEgc3RyaW5nIHRvIHN0b3JlLCBzZXJpYWxpemVkLCBpbiB0aGUgYmFja2VuZFxuICAgIC8vIHN0b3JhZ2UgbGlicmFyeS5cbiAgICBmdW5jdGlvbiBfYnVmZmVyVG9TdHJpbmcoYnVmZmVyKSB7XG4gICAgICAgIC8vIGJhc2U2NC1hcnJheWJ1ZmZlclxuICAgICAgICB2YXIgYnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgICAgICB2YXIgaTtcbiAgICAgICAgdmFyIGJhc2U2NFN0cmluZyA9ICcnO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMykge1xuICAgICAgICAgICAgLypqc2xpbnQgYml0d2lzZTogdHJ1ZSAqL1xuICAgICAgICAgICAgYmFzZTY0U3RyaW5nICs9IEJBU0VfQ0hBUlNbYnl0ZXNbaV0gPj4gMl07XG4gICAgICAgICAgICBiYXNlNjRTdHJpbmcgKz0gQkFTRV9DSEFSU1soKGJ5dGVzW2ldICYgMykgPDwgNCkgfCAoYnl0ZXNbaSArIDFdID4+IDQpXTtcbiAgICAgICAgICAgIGJhc2U2NFN0cmluZyArPSBCQVNFX0NIQVJTWygoYnl0ZXNbaSArIDFdICYgMTUpIDw8IDIpIHwgKGJ5dGVzW2kgKyAyXSA+PiA2KV07XG4gICAgICAgICAgICBiYXNlNjRTdHJpbmcgKz0gQkFTRV9DSEFSU1tieXRlc1tpICsgMl0gJiA2M107XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKGJ5dGVzLmxlbmd0aCAlIDMpID09PSAyKSB7XG4gICAgICAgICAgICBiYXNlNjRTdHJpbmcgPSBiYXNlNjRTdHJpbmcuc3Vic3RyaW5nKDAsIGJhc2U2NFN0cmluZy5sZW5ndGggLSAxKSArICc9JztcbiAgICAgICAgfSBlbHNlIGlmIChieXRlcy5sZW5ndGggJSAzID09PSAxKSB7XG4gICAgICAgICAgICBiYXNlNjRTdHJpbmcgPSBiYXNlNjRTdHJpbmcuc3Vic3RyaW5nKDAsIGJhc2U2NFN0cmluZy5sZW5ndGggLSAyKSArICc9PSc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYmFzZTY0U3RyaW5nO1xuICAgIH1cblxuICAgIC8vIERlc2VyaWFsaXplIGRhdGEgd2UndmUgaW5zZXJ0ZWQgaW50byBhIHZhbHVlIGNvbHVtbi9maWVsZC4gV2UgcGxhY2VcbiAgICAvLyBzcGVjaWFsIG1hcmtlcnMgaW50byBvdXIgc3RyaW5ncyB0byBtYXJrIHRoZW0gYXMgZW5jb2RlZDsgdGhpcyBpc24ndFxuICAgIC8vIGFzIG5pY2UgYXMgYSBtZXRhIGZpZWxkLCBidXQgaXQncyB0aGUgb25seSBzYW5lIHRoaW5nIHdlIGNhbiBkbyB3aGlsc3RcbiAgICAvLyBrZWVwaW5nIGxvY2FsU3RvcmFnZSBzdXBwb3J0IGludGFjdC5cbiAgICAvL1xuICAgIC8vIE9mdGVudGltZXMgdGhpcyB3aWxsIGp1c3QgZGVzZXJpYWxpemUgSlNPTiBjb250ZW50LCBidXQgaWYgd2UgaGF2ZSBhXG4gICAgLy8gc3BlY2lhbCBtYXJrZXIgKFNFUklBTElaRURfTUFSS0VSLCBkZWZpbmVkIGFib3ZlKSwgd2Ugd2lsbCBleHRyYWN0XG4gICAgLy8gc29tZSBraW5kIG9mIGFycmF5YnVmZmVyL2JpbmFyeSBkYXRhL3R5cGVkIGFycmF5IG91dCBvZiB0aGUgc3RyaW5nLlxuICAgIGZ1bmN0aW9uIF9kZXNlcmlhbGl6ZSh2YWx1ZSkge1xuICAgICAgICAvLyBJZiB3ZSBoYXZlbid0IG1hcmtlZCB0aGlzIHN0cmluZyBhcyBiZWluZyBzcGVjaWFsbHkgc2VyaWFsaXplZCAoaS5lLlxuICAgICAgICAvLyBzb21ldGhpbmcgb3RoZXIgdGhhbiBzZXJpYWxpemVkIEpTT04pLCB3ZSBjYW4ganVzdCByZXR1cm4gaXQgYW5kIGJlXG4gICAgICAgIC8vIGRvbmUgd2l0aCBpdC5cbiAgICAgICAgaWYgKHZhbHVlLnN1YnN0cmluZygwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNFUklBTElaRURfTUFSS0VSX0xFTkdUSCkgIT09IFNFUklBTElaRURfTUFSS0VSKSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGNvZGUgZGVhbHMgd2l0aCBkZXNlcmlhbGl6aW5nIHNvbWUga2luZCBvZiBCbG9iIG9yXG4gICAgICAgIC8vIFR5cGVkQXJyYXkuIEZpcnN0IHdlIHNlcGFyYXRlIG91dCB0aGUgdHlwZSBvZiBkYXRhIHdlJ3JlIGRlYWxpbmdcbiAgICAgICAgLy8gd2l0aCBmcm9tIHRoZSBkYXRhIGl0c2VsZi5cbiAgICAgICAgdmFyIHNlcmlhbGl6ZWRTdHJpbmcgPSB2YWx1ZS5zdWJzdHJpbmcoVFlQRV9TRVJJQUxJWkVEX01BUktFUl9MRU5HVEgpO1xuICAgICAgICB2YXIgdHlwZSA9IHZhbHVlLnN1YnN0cmluZyhTRVJJQUxJWkVEX01BUktFUl9MRU5HVEgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRZUEVfU0VSSUFMSVpFRF9NQVJLRVJfTEVOR1RIKTtcblxuICAgICAgICAvLyBGaWxsIHRoZSBzdHJpbmcgaW50byBhIEFycmF5QnVmZmVyLlxuICAgICAgICB2YXIgYnVmZmVyTGVuZ3RoID0gc2VyaWFsaXplZFN0cmluZy5sZW5ndGggKiAwLjc1O1xuICAgICAgICB2YXIgbGVuID0gc2VyaWFsaXplZFN0cmluZy5sZW5ndGg7XG4gICAgICAgIHZhciBpO1xuICAgICAgICB2YXIgcCA9IDA7XG4gICAgICAgIHZhciBlbmNvZGVkMSwgZW5jb2RlZDIsIGVuY29kZWQzLCBlbmNvZGVkNDtcblxuICAgICAgICBpZiAoc2VyaWFsaXplZFN0cmluZ1tzZXJpYWxpemVkU3RyaW5nLmxlbmd0aCAtIDFdID09PSAnPScpIHtcbiAgICAgICAgICAgIGJ1ZmZlckxlbmd0aC0tO1xuICAgICAgICAgICAgaWYgKHNlcmlhbGl6ZWRTdHJpbmdbc2VyaWFsaXplZFN0cmluZy5sZW5ndGggLSAyXSA9PT0gJz0nKSB7XG4gICAgICAgICAgICAgICAgYnVmZmVyTGVuZ3RoLS07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGJ1ZmZlckxlbmd0aCk7XG4gICAgICAgIHZhciBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSs9NCkge1xuICAgICAgICAgICAgZW5jb2RlZDEgPSBCQVNFX0NIQVJTLmluZGV4T2Yoc2VyaWFsaXplZFN0cmluZ1tpXSk7XG4gICAgICAgICAgICBlbmNvZGVkMiA9IEJBU0VfQ0hBUlMuaW5kZXhPZihzZXJpYWxpemVkU3RyaW5nW2krMV0pO1xuICAgICAgICAgICAgZW5jb2RlZDMgPSBCQVNFX0NIQVJTLmluZGV4T2Yoc2VyaWFsaXplZFN0cmluZ1tpKzJdKTtcbiAgICAgICAgICAgIGVuY29kZWQ0ID0gQkFTRV9DSEFSUy5pbmRleE9mKHNlcmlhbGl6ZWRTdHJpbmdbaSszXSk7XG5cbiAgICAgICAgICAgIC8qanNsaW50IGJpdHdpc2U6IHRydWUgKi9cbiAgICAgICAgICAgIGJ5dGVzW3ArK10gPSAoZW5jb2RlZDEgPDwgMikgfCAoZW5jb2RlZDIgPj4gNCk7XG4gICAgICAgICAgICBieXRlc1twKytdID0gKChlbmNvZGVkMiAmIDE1KSA8PCA0KSB8IChlbmNvZGVkMyA+PiAyKTtcbiAgICAgICAgICAgIGJ5dGVzW3ArK10gPSAoKGVuY29kZWQzICYgMykgPDwgNikgfCAoZW5jb2RlZDQgJiA2Myk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXR1cm4gdGhlIHJpZ2h0IHR5cGUgYmFzZWQgb24gdGhlIGNvZGUvdHlwZSBzZXQgZHVyaW5nXG4gICAgICAgIC8vIHNlcmlhbGl6YXRpb24uXG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSBUWVBFX0FSUkFZQlVGRkVSOlxuICAgICAgICAgICAgICAgIHJldHVybiBidWZmZXI7XG4gICAgICAgICAgICBjYXNlIFRZUEVfQkxPQjpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEJsb2IoW2J1ZmZlcl0pO1xuICAgICAgICAgICAgY2FzZSBUWVBFX0lOVDhBUlJBWTpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEludDhBcnJheShidWZmZXIpO1xuICAgICAgICAgICAgY2FzZSBUWVBFX1VJTlQ4QVJSQVk6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgICAgICAgICBjYXNlIFRZUEVfVUlOVDhDTEFNUEVEQVJSQVk6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBVaW50OENsYW1wZWRBcnJheShidWZmZXIpO1xuICAgICAgICAgICAgY2FzZSBUWVBFX0lOVDE2QVJSQVk6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBJbnQxNkFycmF5KGJ1ZmZlcik7XG4gICAgICAgICAgICBjYXNlIFRZUEVfVUlOVDE2QVJSQVk6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBVaW50MTZBcnJheShidWZmZXIpO1xuICAgICAgICAgICAgY2FzZSBUWVBFX0lOVDMyQVJSQVk6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBJbnQzMkFycmF5KGJ1ZmZlcik7XG4gICAgICAgICAgICBjYXNlIFRZUEVfVUlOVDMyQVJSQVk6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBVaW50MzJBcnJheShidWZmZXIpO1xuICAgICAgICAgICAgY2FzZSBUWVBFX0ZMT0FUMzJBUlJBWTpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZsb2F0MzJBcnJheShidWZmZXIpO1xuICAgICAgICAgICAgY2FzZSBUWVBFX0ZMT0FUNjRBUlJBWTpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZsb2F0NjRBcnJheShidWZmZXIpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua293biB0eXBlOiAnICsgdHlwZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTZXJpYWxpemUgYSB2YWx1ZSwgYWZ0ZXJ3YXJkcyBleGVjdXRpbmcgYSBjYWxsYmFjayAod2hpY2ggdXN1YWxseVxuICAgIC8vIGluc3RydWN0cyB0aGUgYHNldEl0ZW0oKWAgY2FsbGJhY2svcHJvbWlzZSB0byBiZSBleGVjdXRlZCkuIFRoaXMgaXMgaG93XG4gICAgLy8gd2Ugc3RvcmUgYmluYXJ5IGRhdGEgd2l0aCBsb2NhbFN0b3JhZ2UuXG4gICAgZnVuY3Rpb24gX3NlcmlhbGl6ZSh2YWx1ZSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHZhbHVlU3RyaW5nID0gJyc7XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFsdWVTdHJpbmcgPSB2YWx1ZS50b1N0cmluZygpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2Fubm90IHVzZSBgdmFsdWUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcmAgb3Igc3VjaCBoZXJlLCBhcyB0aGVzZVxuICAgICAgICAvLyBjaGVja3MgZmFpbCB3aGVuIHJ1bm5pbmcgdGhlIHRlc3RzIHVzaW5nIGNhc3Blci5qcy4uLlxuICAgICAgICAvL1xuICAgICAgICAvLyBUT0RPOiBTZWUgd2h5IHRob3NlIHRlc3RzIGZhaWwgYW5kIHVzZSBhIGJldHRlciBzb2x1dGlvbi5cbiAgICAgICAgaWYgKHZhbHVlICYmICh2YWx1ZS50b1N0cmluZygpID09PSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nIHx8XG4gICAgICAgICAgICAgICAgICAgICAgdmFsdWUuYnVmZmVyICYmXG4gICAgICAgICAgICAgICAgICAgICAgdmFsdWUuYnVmZmVyLnRvU3RyaW5nKCkgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXScpKSB7XG4gICAgICAgICAgICAvLyBDb252ZXJ0IGJpbmFyeSBhcnJheXMgdG8gYSBzdHJpbmcgYW5kIHByZWZpeCB0aGUgc3RyaW5nIHdpdGhcbiAgICAgICAgICAgIC8vIGEgc3BlY2lhbCBtYXJrZXIuXG4gICAgICAgICAgICB2YXIgYnVmZmVyO1xuICAgICAgICAgICAgdmFyIG1hcmtlciA9IFNFUklBTElaRURfTUFSS0VSO1xuXG4gICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgICAgICAgICAgICAgIGJ1ZmZlciA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIG1hcmtlciArPSBUWVBFX0FSUkFZQlVGRkVSO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBidWZmZXIgPSB2YWx1ZS5idWZmZXI7XG5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWVTdHJpbmcgPT09ICdbb2JqZWN0IEludDhBcnJheV0nKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcmtlciArPSBUWVBFX0lOVDhBUlJBWTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlU3RyaW5nID09PSAnW29iamVjdCBVaW50OEFycmF5XScpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyICs9IFRZUEVfVUlOVDhBUlJBWTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlU3RyaW5nID09PSAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcmtlciArPSBUWVBFX1VJTlQ4Q0xBTVBFREFSUkFZO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWVTdHJpbmcgPT09ICdbb2JqZWN0IEludDE2QXJyYXldJykge1xuICAgICAgICAgICAgICAgICAgICBtYXJrZXIgKz0gVFlQRV9JTlQxNkFSUkFZO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWVTdHJpbmcgPT09ICdbb2JqZWN0IFVpbnQxNkFycmF5XScpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyICs9IFRZUEVfVUlOVDE2QVJSQVk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVN0cmluZyA9PT0gJ1tvYmplY3QgSW50MzJBcnJheV0nKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcmtlciArPSBUWVBFX0lOVDMyQVJSQVk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVN0cmluZyA9PT0gJ1tvYmplY3QgVWludDMyQXJyYXldJykge1xuICAgICAgICAgICAgICAgICAgICBtYXJrZXIgKz0gVFlQRV9VSU5UMzJBUlJBWTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlU3RyaW5nID09PSAnW29iamVjdCBGbG9hdDMyQXJyYXldJykge1xuICAgICAgICAgICAgICAgICAgICBtYXJrZXIgKz0gVFlQRV9GTE9BVDMyQVJSQVk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVN0cmluZyA9PT0gJ1tvYmplY3QgRmxvYXQ2NEFycmF5XScpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyICs9IFRZUEVfRkxPQVQ2NEFSUkFZO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG5ldyBFcnJvcignRmFpbGVkIHRvIGdldCB0eXBlIGZvciBCaW5hcnlBcnJheScpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNhbGxiYWNrKG1hcmtlciArIF9idWZmZXJUb1N0cmluZyhidWZmZXIpKTtcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVN0cmluZyA9PT0gJ1tvYmplY3QgQmxvYl0nKSB7XG4gICAgICAgICAgICAvLyBDb252ZXIgdGhlIGJsb2IgdG8gYSBiaW5hcnlBcnJheSBhbmQgdGhlbiB0byBhIHN0cmluZy5cbiAgICAgICAgICAgIHZhciBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblxuICAgICAgICAgICAgZmlsZVJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RyID0gX2J1ZmZlclRvU3RyaW5nKHRoaXMucmVzdWx0KTtcblxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKFNFUklBTElaRURfTUFSS0VSICsgVFlQRV9CTE9CICsgc3RyKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZpbGVSZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIodmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5jb25zb2xlLmVycm9yKFwiQ291bGRuJ3QgY29udmVydCB2YWx1ZSBpbnRvIGEgSlNPTiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3N0cmluZzogJywgdmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0KTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgd2ViU1FMU3RvcmFnZSA9IHtcbiAgICAgICAgX2RyaXZlcjogJ3dlYlNRTFN0b3JhZ2UnLFxuICAgICAgICBfaW5pdFN0b3JhZ2U6IF9pbml0U3RvcmFnZSxcbiAgICAgICAgaXRlcmF0ZTogaXRlcmF0ZSxcbiAgICAgICAgZ2V0SXRlbTogZ2V0SXRlbSxcbiAgICAgICAgc2V0SXRlbTogc2V0SXRlbSxcbiAgICAgICAgcmVtb3ZlSXRlbTogcmVtb3ZlSXRlbSxcbiAgICAgICAgY2xlYXI6IGNsZWFyLFxuICAgICAgICBsZW5ndGg6IGxlbmd0aCxcbiAgICAgICAga2V5OiBrZXksXG4gICAgICAgIGtleXM6IGtleXNcbiAgICB9O1xuXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoJ3dlYlNRTFN0b3JhZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB3ZWJTUUxTdG9yYWdlO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gd2ViU1FMU3RvcmFnZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLndlYlNRTFN0b3JhZ2UgPSB3ZWJTUUxTdG9yYWdlO1xuICAgIH1cbn0pLmNhbGwod2luZG93KTtcbiIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBQcm9taXNlcyFcbiAgICB2YXIgUHJvbWlzZSA9ICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykgP1xuICAgICAgICAgICAgICAgICAgcmVxdWlyZSgncHJvbWlzZScpIDogdGhpcy5Qcm9taXNlO1xuXG4gICAgLy8gQ3VzdG9tIGRyaXZlcnMgYXJlIHN0b3JlZCBoZXJlIHdoZW4gYGRlZmluZURyaXZlcigpYCBpcyBjYWxsZWQuXG4gICAgLy8gVGhleSBhcmUgc2hhcmVkIGFjcm9zcyBhbGwgaW5zdGFuY2VzIG9mIGxvY2FsRm9yYWdlLlxuICAgIHZhciBDdXN0b21Ecml2ZXJzID0ge307XG5cbiAgICB2YXIgRHJpdmVyVHlwZSA9IHtcbiAgICAgICAgSU5ERVhFRERCOiAnYXN5bmNTdG9yYWdlJyxcbiAgICAgICAgTE9DQUxTVE9SQUdFOiAnbG9jYWxTdG9yYWdlV3JhcHBlcicsXG4gICAgICAgIFdFQlNRTDogJ3dlYlNRTFN0b3JhZ2UnXG4gICAgfTtcblxuICAgIHZhciBEZWZhdWx0RHJpdmVyT3JkZXIgPSBbXG4gICAgICAgIERyaXZlclR5cGUuSU5ERVhFRERCLFxuICAgICAgICBEcml2ZXJUeXBlLldFQlNRTCxcbiAgICAgICAgRHJpdmVyVHlwZS5MT0NBTFNUT1JBR0VcbiAgICBdO1xuXG4gICAgdmFyIExpYnJhcnlNZXRob2RzID0gW1xuICAgICAgICAnY2xlYXInLFxuICAgICAgICAnZ2V0SXRlbScsXG4gICAgICAgICdpdGVyYXRlJyxcbiAgICAgICAgJ2tleScsXG4gICAgICAgICdrZXlzJyxcbiAgICAgICAgJ2xlbmd0aCcsXG4gICAgICAgICdyZW1vdmVJdGVtJyxcbiAgICAgICAgJ3NldEl0ZW0nXG4gICAgXTtcblxuICAgIHZhciBNb2R1bGVUeXBlID0ge1xuICAgICAgICBERUZJTkU6IDEsXG4gICAgICAgIEVYUE9SVDogMixcbiAgICAgICAgV0lORE9XOiAzXG4gICAgfTtcblxuICAgIHZhciBEZWZhdWx0Q29uZmlnID0ge1xuICAgICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICAgIGRyaXZlcjogRGVmYXVsdERyaXZlck9yZGVyLnNsaWNlKCksXG4gICAgICAgIG5hbWU6ICdsb2NhbGZvcmFnZScsXG4gICAgICAgIC8vIERlZmF1bHQgREIgc2l6ZSBpcyBfSlVTVCBVTkRFUl8gNU1CLCBhcyBpdCdzIHRoZSBoaWdoZXN0IHNpemVcbiAgICAgICAgLy8gd2UgY2FuIHVzZSB3aXRob3V0IGEgcHJvbXB0LlxuICAgICAgICBzaXplOiA0OTgwNzM2LFxuICAgICAgICBzdG9yZU5hbWU6ICdrZXl2YWx1ZXBhaXJzJyxcbiAgICAgICAgdmVyc2lvbjogMS4wXG4gICAgfTtcblxuICAgIC8vIEF0dGFjaGluZyB0byB3aW5kb3cgKGkuZS4gbm8gbW9kdWxlIGxvYWRlcikgaXMgdGhlIGFzc3VtZWQsXG4gICAgLy8gc2ltcGxlIGRlZmF1bHQuXG4gICAgdmFyIG1vZHVsZVR5cGUgPSBNb2R1bGVUeXBlLldJTkRPVztcblxuICAgIC8vIEZpbmQgb3V0IHdoYXQga2luZCBvZiBtb2R1bGUgc2V0dXAgd2UgaGF2ZTsgaWYgbm9uZSwgd2UnbGwganVzdCBhdHRhY2hcbiAgICAvLyBsb2NhbEZvcmFnZSB0byB0aGUgbWFpbiB3aW5kb3cuXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBtb2R1bGVUeXBlID0gTW9kdWxlVHlwZS5ERUZJTkU7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgICBtb2R1bGVUeXBlID0gTW9kdWxlVHlwZS5FWFBPUlQ7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgdG8gc2VlIGlmIEluZGV4ZWREQiBpcyBhdmFpbGFibGUgYW5kIGlmIGl0IGlzIHRoZSBsYXRlc3RcbiAgICAvLyBpbXBsZW1lbnRhdGlvbjsgaXQncyBvdXIgcHJlZmVycmVkIGJhY2tlbmQgbGlicmFyeS4gV2UgdXNlIFwiX3NwZWNfdGVzdFwiXG4gICAgLy8gYXMgdGhlIG5hbWUgb2YgdGhlIGRhdGFiYXNlIGJlY2F1c2UgaXQncyBub3QgdGhlIG9uZSB3ZSdsbCBvcGVyYXRlIG9uLFxuICAgIC8vIGJ1dCBpdCdzIHVzZWZ1bCB0byBtYWtlIHN1cmUgaXRzIHVzaW5nIHRoZSByaWdodCBzcGVjLlxuICAgIC8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEvbG9jYWxGb3JhZ2UvaXNzdWVzLzEyOFxuICAgIHZhciBkcml2ZXJTdXBwb3J0ID0gKGZ1bmN0aW9uKHNlbGYpIHtcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBJbmRleGVkREI7IGZhbGwgYmFjayB0byB2ZW5kb3ItcHJlZml4ZWQgdmVyc2lvbnNcbiAgICAgICAgLy8gaWYgbmVlZGVkLlxuICAgICAgICB2YXIgaW5kZXhlZERCID0gaW5kZXhlZERCIHx8IHNlbGYuaW5kZXhlZERCIHx8IHNlbGYud2Via2l0SW5kZXhlZERCIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLm1vekluZGV4ZWREQiB8fCBzZWxmLk9JbmRleGVkREIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYubXNJbmRleGVkREI7XG5cbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuXG4gICAgICAgIHJlc3VsdFtEcml2ZXJUeXBlLldFQlNRTF0gPSAhIXNlbGYub3BlbkRhdGFiYXNlO1xuICAgICAgICByZXN1bHRbRHJpdmVyVHlwZS5JTkRFWEVEREJdID0gISEoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBXZSBtaW1pYyBQb3VjaERCIGhlcmU7IGp1c3QgVUEgdGVzdCBmb3IgU2FmYXJpICh3aGljaCwgYXMgb2ZcbiAgICAgICAgICAgIC8vIGlPUyA4L1lvc2VtaXRlLCBkb2Vzbid0IHByb3Blcmx5IHN1cHBvcnQgSW5kZXhlZERCKS5cbiAgICAgICAgICAgIC8vIEluZGV4ZWREQiBzdXBwb3J0IGlzIGJyb2tlbiBhbmQgZGlmZmVyZW50IGZyb20gQmxpbmsncy5cbiAgICAgICAgICAgIC8vIFRoaXMgaXMgZmFzdGVyIHRoYW4gdGhlIHRlc3QgY2FzZSAoYW5kIGl0J3Mgc3luYyksIHNvIHdlIGp1c3RcbiAgICAgICAgICAgIC8vIGRvIHRoaXMuICpTSUdIKlxuICAgICAgICAgICAgLy8gaHR0cDovL2JsLm9ja3Mub3JnL25vbGFubGF3c29uL3Jhdy9jODNlOTAzOWVkZjIyNzgwNDdlOS9cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBXZSB0ZXN0IGZvciBvcGVuRGF0YWJhc2UgYmVjYXVzZSBJRSBNb2JpbGUgaWRlbnRpZmllcyBpdHNlbGZcbiAgICAgICAgICAgIC8vIGFzIFNhZmFyaS4gT2ggdGhlIGx1bHouLi5cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2VsZi5vcGVuRGF0YWJhc2UgIT09ICd1bmRlZmluZWQnICYmIHNlbGYubmF2aWdhdG9yICYmXG4gICAgICAgICAgICAgICAgc2VsZi5uYXZpZ2F0b3IudXNlckFnZW50ICYmXG4gICAgICAgICAgICAgICAgL1NhZmFyaS8udGVzdChzZWxmLm5hdmlnYXRvci51c2VyQWdlbnQpICYmXG4gICAgICAgICAgICAgICAgIS9DaHJvbWUvLnRlc3Qoc2VsZi5uYXZpZ2F0b3IudXNlckFnZW50KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluZGV4ZWREQiAmJlxuICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgaW5kZXhlZERCLm9wZW4gPT09ICdmdW5jdGlvbicgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgLy8gU29tZSBTYW1zdW5nL0hUQyBBbmRyb2lkIDQuMC00LjMgZGV2aWNlc1xuICAgICAgICAgICAgICAgICAgICAgICAvLyBoYXZlIG9sZGVyIEluZGV4ZWREQiBzcGVjczsgaWYgdGhpcyBpc24ndCBhdmFpbGFibGVcbiAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlaXIgSW5kZXhlZERCIGlzIHRvbyBvbGQgZm9yIHVzIHRvIHVzZS5cbiAgICAgICAgICAgICAgICAgICAgICAgLy8gKFJlcGxhY2VzIHRoZSBvbnVwZ3JhZGVuZWVkZWQgdGVzdC4pXG4gICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBzZWxmLklEQktleVJhbmdlICE9PSAndW5kZWZpbmVkJztcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKCk7XG5cbiAgICAgICAgcmVzdWx0W0RyaXZlclR5cGUuTE9DQUxTVE9SQUdFXSA9ICEhKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKHNlbGYubG9jYWxTdG9yYWdlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAoJ3NldEl0ZW0nIGluIHNlbGYubG9jYWxTdG9yYWdlKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgKHNlbGYubG9jYWxTdG9yYWdlLnNldEl0ZW0pKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9KSh0aGlzKTtcblxuICAgIHZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcmcpID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBjYWxsV2hlblJlYWR5KGxvY2FsRm9yYWdlSW5zdGFuY2UsIGxpYnJhcnlNZXRob2QpIHtcbiAgICAgICAgbG9jYWxGb3JhZ2VJbnN0YW5jZVtsaWJyYXJ5TWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIF9hcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsRm9yYWdlSW5zdGFuY2UucmVhZHkoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbEZvcmFnZUluc3RhbmNlW2xpYnJhcnlNZXRob2RdLmFwcGx5KGxvY2FsRm9yYWdlSW5zdGFuY2UsIF9hcmdzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4dGVuZCgpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBhcmcgPSBhcmd1bWVudHNbaV07XG5cbiAgICAgICAgICAgIGlmIChhcmcpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gYXJnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhcmcuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzQXJyYXkoYXJnW2tleV0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJndW1lbnRzWzBdW2tleV0gPSBhcmdba2V5XS5zbGljZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmd1bWVudHNbMF1ba2V5XSA9IGFyZ1trZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50c1swXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0xpYnJhcnlEcml2ZXIoZHJpdmVyTmFtZSkge1xuICAgICAgICBmb3IgKHZhciBkcml2ZXIgaW4gRHJpdmVyVHlwZSkge1xuICAgICAgICAgICAgaWYgKERyaXZlclR5cGUuaGFzT3duUHJvcGVydHkoZHJpdmVyKSAmJlxuICAgICAgICAgICAgICAgIERyaXZlclR5cGVbZHJpdmVyXSA9PT0gZHJpdmVyTmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBnbG9iYWxPYmplY3QgPSB0aGlzO1xuXG4gICAgZnVuY3Rpb24gTG9jYWxGb3JhZ2Uob3B0aW9ucykge1xuICAgICAgICB0aGlzLl9jb25maWcgPSBleHRlbmQoe30sIERlZmF1bHRDb25maWcsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLl9kcml2ZXJTZXQgPSBudWxsO1xuICAgICAgICB0aGlzLl9yZWFkeSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9kYkluZm8gPSBudWxsO1xuXG4gICAgICAgIC8vIEFkZCBhIHN0dWIgZm9yIGVhY2ggZHJpdmVyIEFQSSBtZXRob2QgdGhhdCBkZWxheXMgdGhlIGNhbGwgdG8gdGhlXG4gICAgICAgIC8vIGNvcnJlc3BvbmRpbmcgZHJpdmVyIG1ldGhvZCB1bnRpbCBsb2NhbEZvcmFnZSBpcyByZWFkeS4gVGhlc2Ugc3R1YnNcbiAgICAgICAgLy8gd2lsbCBiZSByZXBsYWNlZCBieSB0aGUgZHJpdmVyIG1ldGhvZHMgYXMgc29vbiBhcyB0aGUgZHJpdmVyIGlzXG4gICAgICAgIC8vIGxvYWRlZCwgc28gdGhlcmUgaXMgbm8gcGVyZm9ybWFuY2UgaW1wYWN0LlxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IExpYnJhcnlNZXRob2RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjYWxsV2hlblJlYWR5KHRoaXMsIExpYnJhcnlNZXRob2RzW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0RHJpdmVyKHRoaXMuX2NvbmZpZy5kcml2ZXIpO1xuICAgIH1cblxuICAgIExvY2FsRm9yYWdlLnByb3RvdHlwZS5JTkRFWEVEREIgPSBEcml2ZXJUeXBlLklOREVYRUREQjtcbiAgICBMb2NhbEZvcmFnZS5wcm90b3R5cGUuTE9DQUxTVE9SQUdFID0gRHJpdmVyVHlwZS5MT0NBTFNUT1JBR0U7XG4gICAgTG9jYWxGb3JhZ2UucHJvdG90eXBlLldFQlNRTCA9IERyaXZlclR5cGUuV0VCU1FMO1xuXG4gICAgLy8gU2V0IGFueSBjb25maWcgdmFsdWVzIGZvciBsb2NhbEZvcmFnZTsgY2FuIGJlIGNhbGxlZCBhbnl0aW1lIGJlZm9yZVxuICAgIC8vIHRoZSBmaXJzdCBBUEkgY2FsbCAoZS5nLiBgZ2V0SXRlbWAsIGBzZXRJdGVtYCkuXG4gICAgLy8gV2UgbG9vcCB0aHJvdWdoIG9wdGlvbnMgc28gd2UgZG9uJ3Qgb3ZlcndyaXRlIGV4aXN0aW5nIGNvbmZpZ1xuICAgIC8vIHZhbHVlcy5cbiAgICBMb2NhbEZvcmFnZS5wcm90b3R5cGUuY29uZmlnID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICAvLyBJZiB0aGUgb3B0aW9ucyBhcmd1bWVudCBpcyBhbiBvYmplY3QsIHdlIHVzZSBpdCB0byBzZXQgdmFsdWVzLlxuICAgICAgICAvLyBPdGhlcndpc2UsIHdlIHJldHVybiBlaXRoZXIgYSBzcGVjaWZpZWQgY29uZmlnIHZhbHVlIG9yIGFsbFxuICAgICAgICAvLyBjb25maWcgdmFsdWVzLlxuICAgICAgICBpZiAodHlwZW9mKG9wdGlvbnMpID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgLy8gSWYgbG9jYWxmb3JhZ2UgaXMgcmVhZHkgYW5kIGZ1bGx5IGluaXRpYWxpemVkLCB3ZSBjYW4ndCBzZXRcbiAgICAgICAgICAgIC8vIGFueSBuZXcgY29uZmlndXJhdGlvbiB2YWx1ZXMuIEluc3RlYWQsIHdlIHJldHVybiBhbiBlcnJvci5cbiAgICAgICAgICAgIGlmICh0aGlzLl9yZWFkeSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRXJyb3IoXCJDYW4ndCBjYWxsIGNvbmZpZygpIGFmdGVyIGxvY2FsZm9yYWdlIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdoYXMgYmVlbiB1c2VkLicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoaSA9PT0gJ3N0b3JlTmFtZScpIHtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uc1tpXSA9IG9wdGlvbnNbaV0ucmVwbGFjZSgvXFxXL2csICdfJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5fY29uZmlnW2ldID0gb3B0aW9uc1tpXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gYWZ0ZXIgYWxsIGNvbmZpZyBvcHRpb25zIGFyZSBzZXQgYW5kXG4gICAgICAgICAgICAvLyB0aGUgZHJpdmVyIG9wdGlvbiBpcyB1c2VkLCB0cnkgc2V0dGluZyBpdFxuICAgICAgICAgICAgaWYgKCdkcml2ZXInIGluIG9wdGlvbnMgJiYgb3B0aW9ucy5kcml2ZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldERyaXZlcih0aGlzLl9jb25maWcuZHJpdmVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mKG9wdGlvbnMpID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvbmZpZ1tvcHRpb25zXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb25maWc7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gVXNlZCB0byBkZWZpbmUgYSBjdXN0b20gZHJpdmVyLCBzaGFyZWQgYWNyb3NzIGFsbCBpbnN0YW5jZXMgb2ZcbiAgICAvLyBsb2NhbEZvcmFnZS5cbiAgICBMb2NhbEZvcmFnZS5wcm90b3R5cGUuZGVmaW5lRHJpdmVyID0gZnVuY3Rpb24oZHJpdmVyT2JqZWN0LCBjYWxsYmFjayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDYWxsYmFjaykge1xuICAgICAgICB2YXIgZGVmaW5lRHJpdmVyID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHZhciBkcml2ZXJOYW1lID0gZHJpdmVyT2JqZWN0Ll9kcml2ZXI7XG4gICAgICAgICAgICAgICAgdmFyIGNvbXBsaWFuY2VFcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgJ0N1c3RvbSBkcml2ZXIgbm90IGNvbXBsaWFudDsgc2VlICcgK1xuICAgICAgICAgICAgICAgICAgICAnaHR0cHM6Ly9tb3ppbGxhLmdpdGh1Yi5pby9sb2NhbEZvcmFnZS8jZGVmaW5lZHJpdmVyJ1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgdmFyIG5hbWluZ0Vycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICAnQ3VzdG9tIGRyaXZlciBuYW1lIGFscmVhZHkgaW4gdXNlOiAnICsgZHJpdmVyT2JqZWN0Ll9kcml2ZXJcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgLy8gQSBkcml2ZXIgbmFtZSBzaG91bGQgYmUgZGVmaW5lZCBhbmQgbm90IG92ZXJsYXAgd2l0aCB0aGVcbiAgICAgICAgICAgICAgICAvLyBsaWJyYXJ5LWRlZmluZWQsIGRlZmF1bHQgZHJpdmVycy5cbiAgICAgICAgICAgICAgICBpZiAoIWRyaXZlck9iamVjdC5fZHJpdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChjb21wbGlhbmNlRXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpc0xpYnJhcnlEcml2ZXIoZHJpdmVyT2JqZWN0Ll9kcml2ZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuYW1pbmdFcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgY3VzdG9tRHJpdmVyTWV0aG9kcyA9IExpYnJhcnlNZXRob2RzLmNvbmNhdCgnX2luaXRTdG9yYWdlJyk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjdXN0b21Ecml2ZXJNZXRob2RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXN0b21Ecml2ZXJNZXRob2QgPSBjdXN0b21Ecml2ZXJNZXRob2RzW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWN1c3RvbURyaXZlck1ldGhvZCB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgIWRyaXZlck9iamVjdFtjdXN0b21Ecml2ZXJNZXRob2RdIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgZHJpdmVyT2JqZWN0W2N1c3RvbURyaXZlck1ldGhvZF0gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChjb21wbGlhbmNlRXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHN1cHBvcnRQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgIGlmICgnX3N1cHBvcnQnICBpbiBkcml2ZXJPYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyaXZlck9iamVjdC5fc3VwcG9ydCAmJiB0eXBlb2YgZHJpdmVyT2JqZWN0Ll9zdXBwb3J0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdXBwb3J0UHJvbWlzZSA9IGRyaXZlck9iamVjdC5fc3VwcG9ydCgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VwcG9ydFByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoISFkcml2ZXJPYmplY3QuX3N1cHBvcnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc3VwcG9ydFByb21pc2UudGhlbihmdW5jdGlvbihzdXBwb3J0UmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIGRyaXZlclN1cHBvcnRbZHJpdmVyTmFtZV0gPSBzdXBwb3J0UmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICBDdXN0b21Ecml2ZXJzW2RyaXZlck5hbWVdID0gZHJpdmVyT2JqZWN0O1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSwgcmVqZWN0KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRlZmluZURyaXZlci50aGVuKGNhbGxiYWNrLCBlcnJvckNhbGxiYWNrKTtcbiAgICAgICAgcmV0dXJuIGRlZmluZURyaXZlcjtcbiAgICB9O1xuXG4gICAgTG9jYWxGb3JhZ2UucHJvdG90eXBlLmRyaXZlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZHJpdmVyIHx8IG51bGw7XG4gICAgfTtcblxuICAgIExvY2FsRm9yYWdlLnByb3RvdHlwZS5yZWFkeSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICB2YXIgcmVhZHkgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHNlbGYuX2RyaXZlclNldC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLl9yZWFkeSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9yZWFkeSA9IHNlbGYuX2luaXRTdG9yYWdlKHNlbGYuX2NvbmZpZyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2VsZi5fcmVhZHkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgICAgfSkuY2F0Y2gocmVqZWN0KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVhZHkudGhlbihjYWxsYmFjaywgY2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gcmVhZHk7XG4gICAgfTtcblxuICAgIExvY2FsRm9yYWdlLnByb3RvdHlwZS5zZXREcml2ZXIgPSBmdW5jdGlvbihkcml2ZXJzLCBjYWxsYmFjayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBkcml2ZXJzID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgZHJpdmVycyA9IFtkcml2ZXJzXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2RyaXZlclNldCA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgdmFyIGRyaXZlck5hbWUgPSBzZWxmLl9nZXRGaXJzdFN1cHBvcnRlZERyaXZlcihkcml2ZXJzKTtcbiAgICAgICAgICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcignTm8gYXZhaWxhYmxlIHN0b3JhZ2UgbWV0aG9kIGZvdW5kLicpO1xuXG4gICAgICAgICAgICBpZiAoIWRyaXZlck5hbWUpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9kcml2ZXJTZXQgPSBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbGYuX2RiSW5mbyA9IG51bGw7XG4gICAgICAgICAgICBzZWxmLl9yZWFkeSA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmIChpc0xpYnJhcnlEcml2ZXIoZHJpdmVyTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSBhbGxvdyBsb2NhbEZvcmFnZSB0byBiZSBkZWNsYXJlZCBhcyBhIG1vZHVsZSBvciBhcyBhXG4gICAgICAgICAgICAgICAgLy8gbGlicmFyeSBhdmFpbGFibGUgd2l0aG91dCBBTUQvcmVxdWlyZS5qcy5cbiAgICAgICAgICAgICAgICBpZiAobW9kdWxlVHlwZSA9PT0gTW9kdWxlVHlwZS5ERUZJTkUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZShbZHJpdmVyTmFtZV0sIGZ1bmN0aW9uKGxpYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fZXh0ZW5kKGxpYik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobW9kdWxlVHlwZSA9PT0gTW9kdWxlVHlwZS5FWFBPUlQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTWFraW5nIGl0IGJyb3dzZXJpZnkgZnJpZW5kbHlcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRyaXZlcjtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChkcml2ZXJOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIHNlbGYuSU5ERVhFRERCOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyaXZlciA9IHJlcXVpcmUoJy4vZHJpdmVycy9pbmRleGVkZGInKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2Ugc2VsZi5MT0NBTFNUT1JBR0U6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZHJpdmVyID0gcmVxdWlyZSgnLi9kcml2ZXJzL2xvY2Fsc3RvcmFnZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBzZWxmLldFQlNRTDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkcml2ZXIgPSByZXF1aXJlKCcuL2RyaXZlcnMvd2Vic3FsJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzZWxmLl9leHRlbmQoZHJpdmVyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9leHRlbmQoZ2xvYmFsT2JqZWN0W2RyaXZlck5hbWVdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKEN1c3RvbURyaXZlcnNbZHJpdmVyTmFtZV0pIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9leHRlbmQoQ3VzdG9tRHJpdmVyc1tkcml2ZXJOYW1lXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYuX2RyaXZlclNldCA9IFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBmdW5jdGlvbiBzZXREcml2ZXJUb0NvbmZpZygpIHtcbiAgICAgICAgICAgIHNlbGYuX2NvbmZpZy5kcml2ZXIgPSBzZWxmLmRyaXZlcigpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2RyaXZlclNldC50aGVuKHNldERyaXZlclRvQ29uZmlnLCBzZXREcml2ZXJUb0NvbmZpZyk7XG5cbiAgICAgICAgdGhpcy5fZHJpdmVyU2V0LnRoZW4oY2FsbGJhY2ssIGVycm9yQ2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gdGhpcy5fZHJpdmVyU2V0O1xuICAgIH07XG5cbiAgICBMb2NhbEZvcmFnZS5wcm90b3R5cGUuc3VwcG9ydHMgPSBmdW5jdGlvbihkcml2ZXJOYW1lKSB7XG4gICAgICAgIHJldHVybiAhIWRyaXZlclN1cHBvcnRbZHJpdmVyTmFtZV07XG4gICAgfTtcblxuICAgIExvY2FsRm9yYWdlLnByb3RvdHlwZS5fZXh0ZW5kID0gZnVuY3Rpb24obGlicmFyeU1ldGhvZHNBbmRQcm9wZXJ0aWVzKSB7XG4gICAgICAgIGV4dGVuZCh0aGlzLCBsaWJyYXJ5TWV0aG9kc0FuZFByb3BlcnRpZXMpO1xuICAgIH07XG5cbiAgICAvLyBVc2VkIHRvIGRldGVybWluZSB3aGljaCBkcml2ZXIgd2Ugc2hvdWxkIHVzZSBhcyB0aGUgYmFja2VuZCBmb3IgdGhpc1xuICAgIC8vIGluc3RhbmNlIG9mIGxvY2FsRm9yYWdlLlxuICAgIExvY2FsRm9yYWdlLnByb3RvdHlwZS5fZ2V0Rmlyc3RTdXBwb3J0ZWREcml2ZXIgPSBmdW5jdGlvbihkcml2ZXJzKSB7XG4gICAgICAgIGlmIChkcml2ZXJzICYmIGlzQXJyYXkoZHJpdmVycykpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZHJpdmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBkcml2ZXIgPSBkcml2ZXJzW2ldO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3VwcG9ydHMoZHJpdmVyKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZHJpdmVyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG5cbiAgICBMb2NhbEZvcmFnZS5wcm90b3R5cGUuY3JlYXRlSW5zdGFuY2UgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBuZXcgTG9jYWxGb3JhZ2Uob3B0aW9ucyk7XG4gICAgfTtcblxuICAgIC8vIFRoZSBhY3R1YWwgbG9jYWxGb3JhZ2Ugb2JqZWN0IHRoYXQgd2UgZXhwb3NlIGFzIGEgbW9kdWxlIG9yIHZpYSBhXG4gICAgLy8gZ2xvYmFsLiBJdCdzIGV4dGVuZGVkIGJ5IHB1bGxpbmcgaW4gb25lIG9mIG91ciBvdGhlciBsaWJyYXJpZXMuXG4gICAgdmFyIGxvY2FsRm9yYWdlID0gbmV3IExvY2FsRm9yYWdlKCk7XG5cbiAgICAvLyBXZSBhbGxvdyBsb2NhbEZvcmFnZSB0byBiZSBkZWNsYXJlZCBhcyBhIG1vZHVsZSBvciBhcyBhIGxpYnJhcnlcbiAgICAvLyBhdmFpbGFibGUgd2l0aG91dCBBTUQvcmVxdWlyZS5qcy5cbiAgICBpZiAobW9kdWxlVHlwZSA9PT0gTW9kdWxlVHlwZS5ERUZJTkUpIHtcbiAgICAgICAgZGVmaW5lKCdsb2NhbGZvcmFnZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsRm9yYWdlO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKG1vZHVsZVR5cGUgPT09IE1vZHVsZVR5cGUuRVhQT1JUKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gbG9jYWxGb3JhZ2U7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5sb2NhbGZvcmFnZSA9IGxvY2FsRm9yYWdlO1xuICAgIH1cbn0pLmNhbGwod2luZG93KTtcbiIsIi8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2JhbmtzZWFuLzMwNDUyMlxuLy9cbi8vIFBvcnRlZCBmcm9tIFN0ZWZhbiBHdXN0YXZzb24ncyBqYXZhIGltcGxlbWVudGF0aW9uXG4vLyBodHRwOi8vc3RhZmZ3d3cuaXRuLmxpdS5zZS9+c3RlZ3Uvc2ltcGxleG5vaXNlL3NpbXBsZXhub2lzZS5wZGZcbi8vIFJlYWQgU3RlZmFuJ3MgZXhjZWxsZW50IHBhcGVyIGZvciBkZXRhaWxzIG9uIGhvdyB0aGlzIGNvZGUgd29ya3MuXG4vL1xuLy8gU2VhbiBNY0N1bGxvdWdoIGJhbmtzZWFuQGdtYWlsLmNvbVxuXG4vKipcbiAqIFlvdSBjYW4gcGFzcyBpbiBhIHJhbmRvbSBudW1iZXIgZ2VuZXJhdG9yIG9iamVjdCBpZiB5b3UgbGlrZS5cbiAqIEl0IGlzIGFzc3VtZWQgdG8gaGF2ZSBhIHJhbmRvbSgpIG1ldGhvZC5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGV4Tm9pc2UgPSBmdW5jdGlvbihyKSB7XG4gIGlmIChyID09IHVuZGVmaW5lZCkgciA9IE1hdGg7XG4gIHRoaXMuZ3JhZDMgPSBbWzEsMSwwXSxbLTEsMSwwXSxbMSwtMSwwXSxbLTEsLTEsMF0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWzEsMCwxXSxbLTEsMCwxXSxbMSwwLC0xXSxbLTEsMCwtMV0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWzAsMSwxXSxbMCwtMSwxXSxbMCwxLC0xXSxbMCwtMSwtMV1dOyBcbiAgdGhpcy5wID0gW107XG4gIGZvciAodmFyIGk9MDsgaTwyNTY7IGkrKykge1xuICAgIHRoaXMucFtpXSA9IE1hdGguZmxvb3Ioci5yYW5kb20oKSoyNTYpO1xuICB9XG4gIC8vIFRvIHJlbW92ZSB0aGUgbmVlZCBmb3IgaW5kZXggd3JhcHBpbmcsIGRvdWJsZSB0aGUgcGVybXV0YXRpb24gdGFibGUgbGVuZ3RoIFxuICB0aGlzLnBlcm0gPSBbXTsgXG4gIGZvcih2YXIgaT0wOyBpPDUxMjsgaSsrKSB7XG4gICAgdGhpcy5wZXJtW2ldPXRoaXMucFtpICYgMjU1XTtcbiAgfSBcblxuICAvLyBBIGxvb2t1cCB0YWJsZSB0byB0cmF2ZXJzZSB0aGUgc2ltcGxleCBhcm91bmQgYSBnaXZlbiBwb2ludCBpbiA0RC4gXG4gIC8vIERldGFpbHMgY2FuIGJlIGZvdW5kIHdoZXJlIHRoaXMgdGFibGUgaXMgdXNlZCwgaW4gdGhlIDREIG5vaXNlIG1ldGhvZC4gXG4gIHRoaXMuc2ltcGxleCA9IFsgXG4gICAgWzAsMSwyLDNdLFswLDEsMywyXSxbMCwwLDAsMF0sWzAsMiwzLDFdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFsxLDIsMywwXSwgXG4gICAgWzAsMiwxLDNdLFswLDAsMCwwXSxbMCwzLDEsMl0sWzAsMywyLDFdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFsxLDMsMiwwXSwgXG4gICAgWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSwgXG4gICAgWzEsMiwwLDNdLFswLDAsMCwwXSxbMSwzLDAsMl0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzIsMywwLDFdLFsyLDMsMSwwXSwgXG4gICAgWzEsMCwyLDNdLFsxLDAsMywyXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMiwwLDMsMV0sWzAsMCwwLDBdLFsyLDEsMywwXSwgXG4gICAgWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSwgXG4gICAgWzIsMCwxLDNdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFszLDAsMSwyXSxbMywwLDIsMV0sWzAsMCwwLDBdLFszLDEsMiwwXSwgXG4gICAgWzIsMSwwLDNdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFszLDEsMCwyXSxbMCwwLDAsMF0sWzMsMiwwLDFdLFszLDIsMSwwXV07IFxufTtcblxuU2ltcGxleE5vaXNlLnByb3RvdHlwZS5kb3QgPSBmdW5jdGlvbihnLCB4LCB5KSB7IFxuICByZXR1cm4gZ1swXSp4ICsgZ1sxXSp5O1xufTtcblxuU2ltcGxleE5vaXNlLnByb3RvdHlwZS5ub2lzZSA9IGZ1bmN0aW9uKHhpbiwgeWluKSB7IFxuICB2YXIgbjAsIG4xLCBuMjsgLy8gTm9pc2UgY29udHJpYnV0aW9ucyBmcm9tIHRoZSB0aHJlZSBjb3JuZXJzIFxuICAvLyBTa2V3IHRoZSBpbnB1dCBzcGFjZSB0byBkZXRlcm1pbmUgd2hpY2ggc2ltcGxleCBjZWxsIHdlJ3JlIGluIFxuICB2YXIgRjIgPSAwLjUqKE1hdGguc3FydCgzLjApLTEuMCk7IFxuICB2YXIgcyA9ICh4aW4reWluKSpGMjsgLy8gSGFpcnkgZmFjdG9yIGZvciAyRCBcbiAgdmFyIGkgPSBNYXRoLmZsb29yKHhpbitzKTsgXG4gIHZhciBqID0gTWF0aC5mbG9vcih5aW4rcyk7IFxuICB2YXIgRzIgPSAoMy4wLU1hdGguc3FydCgzLjApKS82LjA7IFxuICB2YXIgdCA9IChpK2opKkcyOyBcbiAgdmFyIFgwID0gaS10OyAvLyBVbnNrZXcgdGhlIGNlbGwgb3JpZ2luIGJhY2sgdG8gKHgseSkgc3BhY2UgXG4gIHZhciBZMCA9IGotdDsgXG4gIHZhciB4MCA9IHhpbi1YMDsgLy8gVGhlIHgseSBkaXN0YW5jZXMgZnJvbSB0aGUgY2VsbCBvcmlnaW4gXG4gIHZhciB5MCA9IHlpbi1ZMDsgXG4gIC8vIEZvciB0aGUgMkQgY2FzZSwgdGhlIHNpbXBsZXggc2hhcGUgaXMgYW4gZXF1aWxhdGVyYWwgdHJpYW5nbGUuIFxuICAvLyBEZXRlcm1pbmUgd2hpY2ggc2ltcGxleCB3ZSBhcmUgaW4uIFxuICB2YXIgaTEsIGoxOyAvLyBPZmZzZXRzIGZvciBzZWNvbmQgKG1pZGRsZSkgY29ybmVyIG9mIHNpbXBsZXggaW4gKGksaikgY29vcmRzIFxuICBpZih4MD55MCkge2kxPTE7IGoxPTA7fSAvLyBsb3dlciB0cmlhbmdsZSwgWFkgb3JkZXI6ICgwLDApLT4oMSwwKS0+KDEsMSkgXG4gIGVsc2Uge2kxPTA7IGoxPTE7fSAgICAgIC8vIHVwcGVyIHRyaWFuZ2xlLCBZWCBvcmRlcjogKDAsMCktPigwLDEpLT4oMSwxKSBcbiAgLy8gQSBzdGVwIG9mICgxLDApIGluIChpLGopIG1lYW5zIGEgc3RlcCBvZiAoMS1jLC1jKSBpbiAoeCx5KSwgYW5kIFxuICAvLyBhIHN0ZXAgb2YgKDAsMSkgaW4gKGksaikgbWVhbnMgYSBzdGVwIG9mICgtYywxLWMpIGluICh4LHkpLCB3aGVyZSBcbiAgLy8gYyA9ICgzLXNxcnQoMykpLzYgXG4gIHZhciB4MSA9IHgwIC0gaTEgKyBHMjsgLy8gT2Zmc2V0cyBmb3IgbWlkZGxlIGNvcm5lciBpbiAoeCx5KSB1bnNrZXdlZCBjb29yZHMgXG4gIHZhciB5MSA9IHkwIC0gajEgKyBHMjsgXG4gIHZhciB4MiA9IHgwIC0gMS4wICsgMi4wICogRzI7IC8vIE9mZnNldHMgZm9yIGxhc3QgY29ybmVyIGluICh4LHkpIHVuc2tld2VkIGNvb3JkcyBcbiAgdmFyIHkyID0geTAgLSAxLjAgKyAyLjAgKiBHMjsgXG4gIC8vIFdvcmsgb3V0IHRoZSBoYXNoZWQgZ3JhZGllbnQgaW5kaWNlcyBvZiB0aGUgdGhyZWUgc2ltcGxleCBjb3JuZXJzIFxuICB2YXIgaWkgPSBpICYgMjU1OyBcbiAgdmFyIGpqID0gaiAmIDI1NTsgXG4gIHZhciBnaTAgPSB0aGlzLnBlcm1baWkrdGhpcy5wZXJtW2pqXV0gJSAxMjsgXG4gIHZhciBnaTEgPSB0aGlzLnBlcm1baWkraTErdGhpcy5wZXJtW2pqK2oxXV0gJSAxMjsgXG4gIHZhciBnaTIgPSB0aGlzLnBlcm1baWkrMSt0aGlzLnBlcm1bamorMV1dICUgMTI7IFxuICAvLyBDYWxjdWxhdGUgdGhlIGNvbnRyaWJ1dGlvbiBmcm9tIHRoZSB0aHJlZSBjb3JuZXJzIFxuICB2YXIgdDAgPSAwLjUgLSB4MCp4MC15MCp5MDsgXG4gIGlmKHQwPDApIG4wID0gMC4wOyBcbiAgZWxzZSB7IFxuICAgIHQwICo9IHQwOyBcbiAgICBuMCA9IHQwICogdDAgKiB0aGlzLmRvdCh0aGlzLmdyYWQzW2dpMF0sIHgwLCB5MCk7ICAvLyAoeCx5KSBvZiBncmFkMyB1c2VkIGZvciAyRCBncmFkaWVudCBcbiAgfSBcbiAgdmFyIHQxID0gMC41IC0geDEqeDEteTEqeTE7IFxuICBpZih0MTwwKSBuMSA9IDAuMDsgXG4gIGVsc2UgeyBcbiAgICB0MSAqPSB0MTsgXG4gICAgbjEgPSB0MSAqIHQxICogdGhpcy5kb3QodGhpcy5ncmFkM1tnaTFdLCB4MSwgeTEpOyBcbiAgfVxuICB2YXIgdDIgPSAwLjUgLSB4Mip4Mi15Mip5MjsgXG4gIGlmKHQyPDApIG4yID0gMC4wOyBcbiAgZWxzZSB7IFxuICAgIHQyICo9IHQyOyBcbiAgICBuMiA9IHQyICogdDIgKiB0aGlzLmRvdCh0aGlzLmdyYWQzW2dpMl0sIHgyLCB5Mik7IFxuICB9IFxuICAvLyBBZGQgY29udHJpYnV0aW9ucyBmcm9tIGVhY2ggY29ybmVyIHRvIGdldCB0aGUgZmluYWwgbm9pc2UgdmFsdWUuIFxuICAvLyBUaGUgcmVzdWx0IGlzIHNjYWxlZCB0byByZXR1cm4gdmFsdWVzIGluIHRoZSBpbnRlcnZhbCBbLTEsMV0uIFxuICByZXR1cm4gNzAuMCAqIChuMCArIG4xICsgbjIpOyBcbn07XG5cbi8vIDNEIHNpbXBsZXggbm9pc2UgXG5TaW1wbGV4Tm9pc2UucHJvdG90eXBlLm5vaXNlM2QgPSBmdW5jdGlvbih4aW4sIHlpbiwgemluKSB7IFxuICB2YXIgbjAsIG4xLCBuMiwgbjM7IC8vIE5vaXNlIGNvbnRyaWJ1dGlvbnMgZnJvbSB0aGUgZm91ciBjb3JuZXJzIFxuICAvLyBTa2V3IHRoZSBpbnB1dCBzcGFjZSB0byBkZXRlcm1pbmUgd2hpY2ggc2ltcGxleCBjZWxsIHdlJ3JlIGluIFxuICB2YXIgRjMgPSAxLjAvMy4wOyBcbiAgdmFyIHMgPSAoeGluK3lpbit6aW4pKkYzOyAvLyBWZXJ5IG5pY2UgYW5kIHNpbXBsZSBza2V3IGZhY3RvciBmb3IgM0QgXG4gIHZhciBpID0gTWF0aC5mbG9vcih4aW4rcyk7IFxuICB2YXIgaiA9IE1hdGguZmxvb3IoeWluK3MpOyBcbiAgdmFyIGsgPSBNYXRoLmZsb29yKHppbitzKTsgXG4gIHZhciBHMyA9IDEuMC82LjA7IC8vIFZlcnkgbmljZSBhbmQgc2ltcGxlIHVuc2tldyBmYWN0b3IsIHRvbyBcbiAgdmFyIHQgPSAoaStqK2spKkczOyBcbiAgdmFyIFgwID0gaS10OyAvLyBVbnNrZXcgdGhlIGNlbGwgb3JpZ2luIGJhY2sgdG8gKHgseSx6KSBzcGFjZSBcbiAgdmFyIFkwID0gai10OyBcbiAgdmFyIFowID0gay10OyBcbiAgdmFyIHgwID0geGluLVgwOyAvLyBUaGUgeCx5LHogZGlzdGFuY2VzIGZyb20gdGhlIGNlbGwgb3JpZ2luIFxuICB2YXIgeTAgPSB5aW4tWTA7IFxuICB2YXIgejAgPSB6aW4tWjA7IFxuICAvLyBGb3IgdGhlIDNEIGNhc2UsIHRoZSBzaW1wbGV4IHNoYXBlIGlzIGEgc2xpZ2h0bHkgaXJyZWd1bGFyIHRldHJhaGVkcm9uLiBcbiAgLy8gRGV0ZXJtaW5lIHdoaWNoIHNpbXBsZXggd2UgYXJlIGluLiBcbiAgdmFyIGkxLCBqMSwgazE7IC8vIE9mZnNldHMgZm9yIHNlY29uZCBjb3JuZXIgb2Ygc2ltcGxleCBpbiAoaSxqLGspIGNvb3JkcyBcbiAgdmFyIGkyLCBqMiwgazI7IC8vIE9mZnNldHMgZm9yIHRoaXJkIGNvcm5lciBvZiBzaW1wbGV4IGluIChpLGosaykgY29vcmRzIFxuICBpZih4MD49eTApIHsgXG4gICAgaWYoeTA+PXowKSBcbiAgICAgIHsgaTE9MTsgajE9MDsgazE9MDsgaTI9MTsgajI9MTsgazI9MDsgfSAvLyBYIFkgWiBvcmRlciBcbiAgICAgIGVsc2UgaWYoeDA+PXowKSB7IGkxPTE7IGoxPTA7IGsxPTA7IGkyPTE7IGoyPTA7IGsyPTE7IH0gLy8gWCBaIFkgb3JkZXIgXG4gICAgICBlbHNlIHsgaTE9MDsgajE9MDsgazE9MTsgaTI9MTsgajI9MDsgazI9MTsgfSAvLyBaIFggWSBvcmRlciBcbiAgICB9IFxuICBlbHNlIHsgLy8geDA8eTAgXG4gICAgaWYoeTA8ejApIHsgaTE9MDsgajE9MDsgazE9MTsgaTI9MDsgajI9MTsgazI9MTsgfSAvLyBaIFkgWCBvcmRlciBcbiAgICBlbHNlIGlmKHgwPHowKSB7IGkxPTA7IGoxPTE7IGsxPTA7IGkyPTA7IGoyPTE7IGsyPTE7IH0gLy8gWSBaIFggb3JkZXIgXG4gICAgZWxzZSB7IGkxPTA7IGoxPTE7IGsxPTA7IGkyPTE7IGoyPTE7IGsyPTA7IH0gLy8gWSBYIFogb3JkZXIgXG4gIH0gXG4gIC8vIEEgc3RlcCBvZiAoMSwwLDApIGluIChpLGosaykgbWVhbnMgYSBzdGVwIG9mICgxLWMsLWMsLWMpIGluICh4LHkseiksIFxuICAvLyBhIHN0ZXAgb2YgKDAsMSwwKSBpbiAoaSxqLGspIG1lYW5zIGEgc3RlcCBvZiAoLWMsMS1jLC1jKSBpbiAoeCx5LHopLCBhbmQgXG4gIC8vIGEgc3RlcCBvZiAoMCwwLDEpIGluIChpLGosaykgbWVhbnMgYSBzdGVwIG9mICgtYywtYywxLWMpIGluICh4LHkseiksIHdoZXJlIFxuICAvLyBjID0gMS82LlxuICB2YXIgeDEgPSB4MCAtIGkxICsgRzM7IC8vIE9mZnNldHMgZm9yIHNlY29uZCBjb3JuZXIgaW4gKHgseSx6KSBjb29yZHMgXG4gIHZhciB5MSA9IHkwIC0gajEgKyBHMzsgXG4gIHZhciB6MSA9IHowIC0gazEgKyBHMzsgXG4gIHZhciB4MiA9IHgwIC0gaTIgKyAyLjAqRzM7IC8vIE9mZnNldHMgZm9yIHRoaXJkIGNvcm5lciBpbiAoeCx5LHopIGNvb3JkcyBcbiAgdmFyIHkyID0geTAgLSBqMiArIDIuMCpHMzsgXG4gIHZhciB6MiA9IHowIC0gazIgKyAyLjAqRzM7IFxuICB2YXIgeDMgPSB4MCAtIDEuMCArIDMuMCpHMzsgLy8gT2Zmc2V0cyBmb3IgbGFzdCBjb3JuZXIgaW4gKHgseSx6KSBjb29yZHMgXG4gIHZhciB5MyA9IHkwIC0gMS4wICsgMy4wKkczOyBcbiAgdmFyIHozID0gejAgLSAxLjAgKyAzLjAqRzM7IFxuICAvLyBXb3JrIG91dCB0aGUgaGFzaGVkIGdyYWRpZW50IGluZGljZXMgb2YgdGhlIGZvdXIgc2ltcGxleCBjb3JuZXJzIFxuICB2YXIgaWkgPSBpICYgMjU1OyBcbiAgdmFyIGpqID0gaiAmIDI1NTsgXG4gIHZhciBrayA9IGsgJiAyNTU7IFxuICB2YXIgZ2kwID0gdGhpcy5wZXJtW2lpK3RoaXMucGVybVtqait0aGlzLnBlcm1ba2tdXV0gJSAxMjsgXG4gIHZhciBnaTEgPSB0aGlzLnBlcm1baWkraTErdGhpcy5wZXJtW2pqK2oxK3RoaXMucGVybVtraytrMV1dXSAlIDEyOyBcbiAgdmFyIGdpMiA9IHRoaXMucGVybVtpaStpMit0aGlzLnBlcm1bamorajIrdGhpcy5wZXJtW2trK2syXV1dICUgMTI7IFxuICB2YXIgZ2kzID0gdGhpcy5wZXJtW2lpKzErdGhpcy5wZXJtW2pqKzErdGhpcy5wZXJtW2trKzFdXV0gJSAxMjsgXG4gIC8vIENhbGN1bGF0ZSB0aGUgY29udHJpYnV0aW9uIGZyb20gdGhlIGZvdXIgY29ybmVycyBcbiAgdmFyIHQwID0gMC42IC0geDAqeDAgLSB5MCp5MCAtIHowKnowOyBcbiAgaWYodDA8MCkgbjAgPSAwLjA7IFxuICBlbHNlIHsgXG4gICAgdDAgKj0gdDA7IFxuICAgIG4wID0gdDAgKiB0MCAqIHRoaXMuZG90KHRoaXMuZ3JhZDNbZ2kwXSwgeDAsIHkwLCB6MCk7IFxuICB9XG4gIHZhciB0MSA9IDAuNiAtIHgxKngxIC0geTEqeTEgLSB6MSp6MTsgXG4gIGlmKHQxPDApIG4xID0gMC4wOyBcbiAgZWxzZSB7IFxuICAgIHQxICo9IHQxOyBcbiAgICBuMSA9IHQxICogdDEgKiB0aGlzLmRvdCh0aGlzLmdyYWQzW2dpMV0sIHgxLCB5MSwgejEpOyBcbiAgfSBcbiAgdmFyIHQyID0gMC42IC0geDIqeDIgLSB5Mip5MiAtIHoyKnoyOyBcbiAgaWYodDI8MCkgbjIgPSAwLjA7IFxuICBlbHNlIHsgXG4gICAgdDIgKj0gdDI7IFxuICAgIG4yID0gdDIgKiB0MiAqIHRoaXMuZG90KHRoaXMuZ3JhZDNbZ2kyXSwgeDIsIHkyLCB6Mik7IFxuICB9IFxuICB2YXIgdDMgPSAwLjYgLSB4Myp4MyAtIHkzKnkzIC0gejMqejM7IFxuICBpZih0MzwwKSBuMyA9IDAuMDsgXG4gIGVsc2UgeyBcbiAgICB0MyAqPSB0MzsgXG4gICAgbjMgPSB0MyAqIHQzICogdGhpcy5kb3QodGhpcy5ncmFkM1tnaTNdLCB4MywgeTMsIHozKTsgXG4gIH0gXG4gIC8vIEFkZCBjb250cmlidXRpb25zIGZyb20gZWFjaCBjb3JuZXIgdG8gZ2V0IHRoZSBmaW5hbCBub2lzZSB2YWx1ZS4gXG4gIC8vIFRoZSByZXN1bHQgaXMgc2NhbGVkIHRvIHN0YXkganVzdCBpbnNpZGUgWy0xLDFdIFxuICByZXR1cm4gMzIuMCoobjAgKyBuMSArIG4yICsgbjMpOyBcbn07IiwiLyohXG4gKiBAb3ZlcnZpZXcgUlNWUCAtIGEgdGlueSBpbXBsZW1lbnRhdGlvbiBvZiBQcm9taXNlcy9BKy5cbiAqIEBjb3B5cmlnaHQgQ29weXJpZ2h0IChjKSAyMDE0IFllaHVkYSBLYXR6LCBUb20gRGFsZSwgU3RlZmFuIFBlbm5lciBhbmQgY29udHJpYnV0b3JzXG4gKiBAbGljZW5zZSAgIExpY2Vuc2VkIHVuZGVyIE1JVCBsaWNlbnNlXG4gKiAgICAgICAgICAgIFNlZSBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vdGlsZGVpby9yc3ZwLmpzL21hc3Rlci9MSUNFTlNFXG4gKiBAdmVyc2lvbiAgIDMuMC4xNFxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGZ1bmN0aW9uICQkcnN2cCRldmVudHMkJGluZGV4T2YoY2FsbGJhY2tzLCBjYWxsYmFjaykge1xuICAgICAgZm9yICh2YXIgaT0wLCBsPWNhbGxiYWNrcy5sZW5ndGg7IGk8bDsgaSsrKSB7XG4gICAgICAgIGlmIChjYWxsYmFja3NbaV0gPT09IGNhbGxiYWNrKSB7IHJldHVybiBpOyB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkZXZlbnRzJCRjYWxsYmFja3NGb3Iob2JqZWN0KSB7XG4gICAgICB2YXIgY2FsbGJhY2tzID0gb2JqZWN0Ll9wcm9taXNlQ2FsbGJhY2tzO1xuXG4gICAgICBpZiAoIWNhbGxiYWNrcykge1xuICAgICAgICBjYWxsYmFja3MgPSBvYmplY3QuX3Byb21pc2VDYWxsYmFja3MgPSB7fTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNhbGxiYWNrcztcbiAgICB9XG5cbiAgICB2YXIgJCRyc3ZwJGV2ZW50cyQkZGVmYXVsdCA9IHtcblxuICAgICAgLyoqXG4gICAgICAgIGBSU1ZQLkV2ZW50VGFyZ2V0Lm1peGluYCBleHRlbmRzIGFuIG9iamVjdCB3aXRoIEV2ZW50VGFyZ2V0IG1ldGhvZHMuIEZvclxuICAgICAgICBFeGFtcGxlOlxuXG4gICAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgICAgdmFyIG9iamVjdCA9IHt9O1xuXG4gICAgICAgIFJTVlAuRXZlbnRUYXJnZXQubWl4aW4ob2JqZWN0KTtcblxuICAgICAgICBvYmplY3Qub24oJ2ZpbmlzaGVkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAvLyBoYW5kbGUgZXZlbnRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgb2JqZWN0LnRyaWdnZXIoJ2ZpbmlzaGVkJywgeyBkZXRhaWw6IHZhbHVlIH0pO1xuICAgICAgICBgYGBcblxuICAgICAgICBgRXZlbnRUYXJnZXQubWl4aW5gIGFsc28gd29ya3Mgd2l0aCBwcm90b3R5cGVzOlxuXG4gICAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgICAgdmFyIFBlcnNvbiA9IGZ1bmN0aW9uKCkge307XG4gICAgICAgIFJTVlAuRXZlbnRUYXJnZXQubWl4aW4oUGVyc29uLnByb3RvdHlwZSk7XG5cbiAgICAgICAgdmFyIHllaHVkYSA9IG5ldyBQZXJzb24oKTtcbiAgICAgICAgdmFyIHRvbSA9IG5ldyBQZXJzb24oKTtcblxuICAgICAgICB5ZWh1ZGEub24oJ3Bva2UnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdZZWh1ZGEgc2F5cyBPVycpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0b20ub24oJ3Bva2UnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdUb20gc2F5cyBPVycpO1xuICAgICAgICB9KTtcblxuICAgICAgICB5ZWh1ZGEudHJpZ2dlcigncG9rZScpO1xuICAgICAgICB0b20udHJpZ2dlcigncG9rZScpO1xuICAgICAgICBgYGBcblxuICAgICAgICBAbWV0aG9kIG1peGluXG4gICAgICAgIEBmb3IgUlNWUC5FdmVudFRhcmdldFxuICAgICAgICBAcHJpdmF0ZVxuICAgICAgICBAcGFyYW0ge09iamVjdH0gb2JqZWN0IG9iamVjdCB0byBleHRlbmQgd2l0aCBFdmVudFRhcmdldCBtZXRob2RzXG4gICAgICAqL1xuICAgICAgbWl4aW46IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgICAgICBvYmplY3Qub24gPSB0aGlzLm9uO1xuICAgICAgICBvYmplY3Qub2ZmID0gdGhpcy5vZmY7XG4gICAgICAgIG9iamVjdC50cmlnZ2VyID0gdGhpcy50cmlnZ2VyO1xuICAgICAgICBvYmplY3QuX3Byb21pc2VDYWxsYmFja3MgPSB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAgUmVnaXN0ZXJzIGEgY2FsbGJhY2sgdG8gYmUgZXhlY3V0ZWQgd2hlbiBgZXZlbnROYW1lYCBpcyB0cmlnZ2VyZWRcblxuICAgICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICAgIG9iamVjdC5vbignZXZlbnQnLCBmdW5jdGlvbihldmVudEluZm8pe1xuICAgICAgICAgIC8vIGhhbmRsZSB0aGUgZXZlbnRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgb2JqZWN0LnRyaWdnZXIoJ2V2ZW50Jyk7XG4gICAgICAgIGBgYFxuXG4gICAgICAgIEBtZXRob2Qgb25cbiAgICAgICAgQGZvciBSU1ZQLkV2ZW50VGFyZ2V0XG4gICAgICAgIEBwcml2YXRlXG4gICAgICAgIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWUgbmFtZSBvZiB0aGUgZXZlbnQgdG8gbGlzdGVuIGZvclxuICAgICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgZXZlbnQgaXMgdHJpZ2dlcmVkLlxuICAgICAgKi9cbiAgICAgIG9uOiBmdW5jdGlvbihldmVudE5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBhbGxDYWxsYmFja3MgPSAkJHJzdnAkZXZlbnRzJCRjYWxsYmFja3NGb3IodGhpcyksIGNhbGxiYWNrcztcblxuICAgICAgICBjYWxsYmFja3MgPSBhbGxDYWxsYmFja3NbZXZlbnROYW1lXTtcblxuICAgICAgICBpZiAoIWNhbGxiYWNrcykge1xuICAgICAgICAgIGNhbGxiYWNrcyA9IGFsbENhbGxiYWNrc1tldmVudE5hbWVdID0gW107XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJCRyc3ZwJGV2ZW50cyQkaW5kZXhPZihjYWxsYmFja3MsIGNhbGxiYWNrKSA9PT0gLTEpIHtcbiAgICAgICAgICBjYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICBZb3UgY2FuIHVzZSBgb2ZmYCB0byBzdG9wIGZpcmluZyBhIHBhcnRpY3VsYXIgY2FsbGJhY2sgZm9yIGFuIGV2ZW50OlxuXG4gICAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgICAgZnVuY3Rpb24gZG9TdHVmZigpIHsgLy8gZG8gc3R1ZmYhIH1cbiAgICAgICAgb2JqZWN0Lm9uKCdzdHVmZicsIGRvU3R1ZmYpO1xuXG4gICAgICAgIG9iamVjdC50cmlnZ2VyKCdzdHVmZicpOyAvLyBkb1N0dWZmIHdpbGwgYmUgY2FsbGVkXG5cbiAgICAgICAgLy8gVW5yZWdpc3RlciBPTkxZIHRoZSBkb1N0dWZmIGNhbGxiYWNrXG4gICAgICAgIG9iamVjdC5vZmYoJ3N0dWZmJywgZG9TdHVmZik7XG4gICAgICAgIG9iamVjdC50cmlnZ2VyKCdzdHVmZicpOyAvLyBkb1N0dWZmIHdpbGwgTk9UIGJlIGNhbGxlZFxuICAgICAgICBgYGBcblxuICAgICAgICBJZiB5b3UgZG9uJ3QgcGFzcyBhIGBjYWxsYmFja2AgYXJndW1lbnQgdG8gYG9mZmAsIEFMTCBjYWxsYmFja3MgZm9yIHRoZVxuICAgICAgICBldmVudCB3aWxsIG5vdCBiZSBleGVjdXRlZCB3aGVuIHRoZSBldmVudCBmaXJlcy4gRm9yIGV4YW1wbGU6XG5cbiAgICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgICB2YXIgY2FsbGJhY2sxID0gZnVuY3Rpb24oKXt9O1xuICAgICAgICB2YXIgY2FsbGJhY2syID0gZnVuY3Rpb24oKXt9O1xuXG4gICAgICAgIG9iamVjdC5vbignc3R1ZmYnLCBjYWxsYmFjazEpO1xuICAgICAgICBvYmplY3Qub24oJ3N0dWZmJywgY2FsbGJhY2syKTtcblxuICAgICAgICBvYmplY3QudHJpZ2dlcignc3R1ZmYnKTsgLy8gY2FsbGJhY2sxIGFuZCBjYWxsYmFjazIgd2lsbCBiZSBleGVjdXRlZC5cblxuICAgICAgICBvYmplY3Qub2ZmKCdzdHVmZicpO1xuICAgICAgICBvYmplY3QudHJpZ2dlcignc3R1ZmYnKTsgLy8gY2FsbGJhY2sxIGFuZCBjYWxsYmFjazIgd2lsbCBub3QgYmUgZXhlY3V0ZWQhXG4gICAgICAgIGBgYFxuXG4gICAgICAgIEBtZXRob2Qgb2ZmXG4gICAgICAgIEBmb3IgUlNWUC5FdmVudFRhcmdldFxuICAgICAgICBAcHJpdmF0ZVxuICAgICAgICBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lIGV2ZW50IHRvIHN0b3AgbGlzdGVuaW5nIHRvXG4gICAgICAgIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIG9wdGlvbmFsIGFyZ3VtZW50LiBJZiBnaXZlbiwgb25seSB0aGUgZnVuY3Rpb25cbiAgICAgICAgZ2l2ZW4gd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlIGV2ZW50J3MgY2FsbGJhY2sgcXVldWUuIElmIG5vIGBjYWxsYmFja2BcbiAgICAgICAgYXJndW1lbnQgaXMgZ2l2ZW4sIGFsbCBjYWxsYmFja3Mgd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlIGV2ZW50J3MgY2FsbGJhY2tcbiAgICAgICAgcXVldWUuXG4gICAgICAqL1xuICAgICAgb2ZmOiBmdW5jdGlvbihldmVudE5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBhbGxDYWxsYmFja3MgPSAkJHJzdnAkZXZlbnRzJCRjYWxsYmFja3NGb3IodGhpcyksIGNhbGxiYWNrcywgaW5kZXg7XG5cbiAgICAgICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgICAgIGFsbENhbGxiYWNrc1tldmVudE5hbWVdID0gW107XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2tzID0gYWxsQ2FsbGJhY2tzW2V2ZW50TmFtZV07XG5cbiAgICAgICAgaW5kZXggPSAkJHJzdnAkZXZlbnRzJCRpbmRleE9mKGNhbGxiYWNrcywgY2FsbGJhY2spO1xuXG4gICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHsgY2FsbGJhY2tzLnNwbGljZShpbmRleCwgMSk7IH1cbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICBVc2UgYHRyaWdnZXJgIHRvIGZpcmUgY3VzdG9tIGV2ZW50cy4gRm9yIGV4YW1wbGU6XG5cbiAgICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgICBvYmplY3Qub24oJ2ZvbycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2ZvbyBldmVudCBoYXBwZW5lZCEnKTtcbiAgICAgICAgfSk7XG4gICAgICAgIG9iamVjdC50cmlnZ2VyKCdmb28nKTtcbiAgICAgICAgLy8gJ2ZvbyBldmVudCBoYXBwZW5lZCEnIGxvZ2dlZCB0byB0aGUgY29uc29sZVxuICAgICAgICBgYGBcblxuICAgICAgICBZb3UgY2FuIGFsc28gcGFzcyBhIHZhbHVlIGFzIGEgc2Vjb25kIGFyZ3VtZW50IHRvIGB0cmlnZ2VyYCB0aGF0IHdpbGwgYmVcbiAgICAgICAgcGFzc2VkIGFzIGFuIGFyZ3VtZW50IHRvIGFsbCBldmVudCBsaXN0ZW5lcnMgZm9yIHRoZSBldmVudDpcblxuICAgICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICAgIG9iamVjdC5vbignZm9vJywgZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICAgIGNvbnNvbGUubG9nKHZhbHVlLm5hbWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBvYmplY3QudHJpZ2dlcignZm9vJywgeyBuYW1lOiAnYmFyJyB9KTtcbiAgICAgICAgLy8gJ2JhcicgbG9nZ2VkIHRvIHRoZSBjb25zb2xlXG4gICAgICAgIGBgYFxuXG4gICAgICAgIEBtZXRob2QgdHJpZ2dlclxuICAgICAgICBAZm9yIFJTVlAuRXZlbnRUYXJnZXRcbiAgICAgICAgQHByaXZhdGVcbiAgICAgICAgQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZSBuYW1lIG9mIHRoZSBldmVudCB0byBiZSB0cmlnZ2VyZWRcbiAgICAgICAgQHBhcmFtIHtBbnl9IG9wdGlvbnMgb3B0aW9uYWwgdmFsdWUgdG8gYmUgcGFzc2VkIHRvIGFueSBldmVudCBoYW5kbGVycyBmb3JcbiAgICAgICAgdGhlIGdpdmVuIGBldmVudE5hbWVgXG4gICAgICAqL1xuICAgICAgdHJpZ2dlcjogZnVuY3Rpb24oZXZlbnROYW1lLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBhbGxDYWxsYmFja3MgPSAkJHJzdnAkZXZlbnRzJCRjYWxsYmFja3NGb3IodGhpcyksIGNhbGxiYWNrcywgY2FsbGJhY2s7XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrcyA9IGFsbENhbGxiYWNrc1tldmVudE5hbWVdKSB7XG4gICAgICAgICAgLy8gRG9uJ3QgY2FjaGUgdGhlIGNhbGxiYWNrcy5sZW5ndGggc2luY2UgaXQgbWF5IGdyb3dcbiAgICAgICAgICBmb3IgKHZhciBpPTA7IGk8Y2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrc1tpXTtcblxuICAgICAgICAgICAgY2FsbGJhY2sob3B0aW9ucyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciAkJHJzdnAkY29uZmlnJCRjb25maWcgPSB7XG4gICAgICBpbnN0cnVtZW50OiBmYWxzZVxuICAgIH07XG5cbiAgICAkJHJzdnAkZXZlbnRzJCRkZWZhdWx0Lm1peGluKCQkcnN2cCRjb25maWckJGNvbmZpZyk7XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkY29uZmlnJCRjb25maWd1cmUobmFtZSwgdmFsdWUpIHtcbiAgICAgIGlmIChuYW1lID09PSAnb25lcnJvcicpIHtcbiAgICAgICAgLy8gaGFuZGxlIGZvciBsZWdhY3kgdXNlcnMgdGhhdCBleHBlY3QgdGhlIGFjdHVhbFxuICAgICAgICAvLyBlcnJvciB0byBiZSBwYXNzZWQgdG8gdGhlaXIgZnVuY3Rpb24gYWRkZWQgdmlhXG4gICAgICAgIC8vIGBSU1ZQLmNvbmZpZ3VyZSgnb25lcnJvcicsIHNvbWVGdW5jdGlvbkhlcmUpO2BcbiAgICAgICAgJCRyc3ZwJGNvbmZpZyQkY29uZmlnLm9uKCdlcnJvcicsIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAkJHJzdnAkY29uZmlnJCRjb25maWdbbmFtZV0gPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAkJHJzdnAkY29uZmlnJCRjb25maWdbbmFtZV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCR1dGlscyQkb2JqZWN0T3JGdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHggPT09ICdmdW5jdGlvbicgfHwgKHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiB4ICE9PSBudWxsKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHV0aWxzJCRpc0Z1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHV0aWxzJCRpc01heWJlVGhlbmFibGUoeCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiB4ICE9PSBudWxsO1xuICAgIH1cblxuICAgIHZhciAkJHV0aWxzJCRfaXNBcnJheTtcblxuICAgIGlmICghQXJyYXkuaXNBcnJheSkge1xuICAgICAgJCR1dGlscyQkX2lzQXJyYXkgPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHgpID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgJCR1dGlscyQkX2lzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuICAgIH1cblxuICAgIHZhciAkJHV0aWxzJCRpc0FycmF5ID0gJCR1dGlscyQkX2lzQXJyYXk7XG4gICAgdmFyICQkdXRpbHMkJG5vdyA9IERhdGUubm93IHx8IGZ1bmN0aW9uKCkgeyByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7IH07XG4gICAgZnVuY3Rpb24gJCR1dGlscyQkRigpIHsgfVxuXG4gICAgdmFyICQkdXRpbHMkJG9fY3JlYXRlID0gKE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gKG8pIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlY29uZCBhcmd1bWVudCBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIG8gIT09ICdvYmplY3QnKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50IG11c3QgYmUgYW4gb2JqZWN0Jyk7XG4gICAgICB9XG4gICAgICAkJHV0aWxzJCRGLnByb3RvdHlwZSA9IG87XG4gICAgICByZXR1cm4gbmV3ICQkdXRpbHMkJEYoKTtcbiAgICB9KTtcblxuICAgIHZhciAkJGluc3RydW1lbnQkJHF1ZXVlID0gW107XG5cbiAgICB2YXIgJCRpbnN0cnVtZW50JCRkZWZhdWx0ID0gZnVuY3Rpb24gaW5zdHJ1bWVudChldmVudE5hbWUsIHByb21pc2UsIGNoaWxkKSB7XG4gICAgICBpZiAoMSA9PT0gJCRpbnN0cnVtZW50JCRxdWV1ZS5wdXNoKHtcbiAgICAgICAgICBuYW1lOiBldmVudE5hbWUsXG4gICAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgICAgZ3VpZDogcHJvbWlzZS5fZ3VpZEtleSArIHByb21pc2UuX2lkLFxuICAgICAgICAgICAgZXZlbnROYW1lOiBldmVudE5hbWUsXG4gICAgICAgICAgICBkZXRhaWw6IHByb21pc2UuX3Jlc3VsdCxcbiAgICAgICAgICAgIGNoaWxkR3VpZDogY2hpbGQgJiYgcHJvbWlzZS5fZ3VpZEtleSArIGNoaWxkLl9pZCxcbiAgICAgICAgICAgIGxhYmVsOiBwcm9taXNlLl9sYWJlbCxcbiAgICAgICAgICAgIHRpbWVTdGFtcDogJCR1dGlscyQkbm93KCksXG4gICAgICAgICAgICBzdGFjazogbmV3IEVycm9yKHByb21pc2UuX2xhYmVsKS5zdGFja1xuICAgICAgICAgIH19KSkge1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgZW50cnk7XG4gICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJCRpbnN0cnVtZW50JCRxdWV1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGVudHJ5ID0gJCRpbnN0cnVtZW50JCRxdWV1ZVtpXTtcbiAgICAgICAgICAgICAgICAkJHJzdnAkY29uZmlnJCRjb25maWcudHJpZ2dlcihlbnRyeS5uYW1lLCBlbnRyeS5wYXlsb2FkKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAkJGluc3RydW1lbnQkJHF1ZXVlLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICB9LCA1MCk7XG4gICAgICAgICAgfVxuICAgICAgfTtcblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRub29wKCkge31cbiAgICB2YXIgJCQkaW50ZXJuYWwkJFBFTkRJTkcgICA9IHZvaWQgMDtcbiAgICB2YXIgJCQkaW50ZXJuYWwkJEZVTEZJTExFRCA9IDE7XG4gICAgdmFyICQkJGludGVybmFsJCRSRUpFQ1RFRCAgPSAyO1xuICAgIHZhciAkJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IgPSBuZXcgJCQkaW50ZXJuYWwkJEVycm9yT2JqZWN0KCk7XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkZ2V0VGhlbihwcm9taXNlKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZS50aGVuO1xuICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICAkJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IuZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgcmV0dXJuICQkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkdHJ5VGhlbih0aGVuLCB2YWx1ZSwgZnVsZmlsbG1lbnRIYW5kbGVyLCByZWplY3Rpb25IYW5kbGVyKSB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGVuLmNhbGwodmFsdWUsIGZ1bGZpbGxtZW50SGFuZGxlciwgcmVqZWN0aW9uSGFuZGxlcik7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJGhhbmRsZUZvcmVpZ25UaGVuYWJsZShwcm9taXNlLCB0aGVuYWJsZSwgdGhlbikge1xuICAgICAgJCRyc3ZwJGNvbmZpZyQkY29uZmlnLmFzeW5jKGZ1bmN0aW9uKHByb21pc2UpIHtcbiAgICAgICAgdmFyIHNlYWxlZCA9IGZhbHNlO1xuICAgICAgICB2YXIgZXJyb3IgPSAkJCRpbnRlcm5hbCQkdHJ5VGhlbih0aGVuLCB0aGVuYWJsZSwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICBpZiAoc2VhbGVkKSB7IHJldHVybjsgfVxuICAgICAgICAgIHNlYWxlZCA9IHRydWU7XG4gICAgICAgICAgaWYgKHRoZW5hYmxlICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgJCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgICBpZiAoc2VhbGVkKSB7IHJldHVybjsgfVxuICAgICAgICAgIHNlYWxlZCA9IHRydWU7XG5cbiAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgICAgIH0sICdTZXR0bGU6ICcgKyAocHJvbWlzZS5fbGFiZWwgfHwgJyB1bmtub3duIHByb21pc2UnKSk7XG5cbiAgICAgICAgaWYgKCFzZWFsZWQgJiYgZXJyb3IpIHtcbiAgICAgICAgICBzZWFsZWQgPSB0cnVlO1xuICAgICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9LCBwcm9taXNlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkaGFuZGxlT3duVGhlbmFibGUocHJvbWlzZSwgdGhlbmFibGUpIHtcbiAgICAgIGlmICh0aGVuYWJsZS5fc3RhdGUgPT09ICQkJGludGVybmFsJCRGVUxGSUxMRUQpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdGhlbmFibGUuX3Jlc3VsdCk7XG4gICAgICB9IGVsc2UgaWYgKHByb21pc2UuX3N0YXRlID09PSAkJCRpbnRlcm5hbCQkUkVKRUNURUQpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCB0aGVuYWJsZS5fcmVzdWx0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQkJGludGVybmFsJCRzdWJzY3JpYmUodGhlbmFibGUsIHVuZGVmaW5lZCwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICBpZiAodGhlbmFibGUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJGhhbmRsZU1heWJlVGhlbmFibGUocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSkge1xuICAgICAgaWYgKG1heWJlVGhlbmFibGUuY29uc3RydWN0b3IgPT09IHByb21pc2UuY29uc3RydWN0b3IpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJGhhbmRsZU93blRoZW5hYmxlKHByb21pc2UsIG1heWJlVGhlbmFibGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHRoZW4gPSAkJCRpbnRlcm5hbCQkZ2V0VGhlbihtYXliZVRoZW5hYmxlKTtcblxuICAgICAgICBpZiAodGhlbiA9PT0gJCQkaW50ZXJuYWwkJEdFVF9USEVOX0VSUk9SKSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCAkJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IuZXJyb3IpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoZW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICQkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIG1heWJlVGhlbmFibGUpO1xuICAgICAgICB9IGVsc2UgaWYgKCQkdXRpbHMkJGlzRnVuY3Rpb24odGhlbikpIHtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkaGFuZGxlRm9yZWlnblRoZW5hYmxlKHByb21pc2UsIG1heWJlVGhlbmFibGUsIHRoZW4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICQkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIG1heWJlVGhlbmFibGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpIHtcbiAgICAgIGlmIChwcm9taXNlID09PSB2YWx1ZSkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKCQkdXRpbHMkJG9iamVjdE9yRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICAgICQkJGludGVybmFsJCRoYW5kbGVNYXliZVRoZW5hYmxlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkcHVibGlzaFJlamVjdGlvbihwcm9taXNlKSB7XG4gICAgICBpZiAocHJvbWlzZS5fb25lcnJvcikge1xuICAgICAgICBwcm9taXNlLl9vbmVycm9yKHByb21pc2UuX3Jlc3VsdCk7XG4gICAgICB9XG5cbiAgICAgICQkJGludGVybmFsJCRwdWJsaXNoKHByb21pc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKSB7XG4gICAgICBpZiAocHJvbWlzZS5fc3RhdGUgIT09ICQkJGludGVybmFsJCRQRU5ESU5HKSB7IHJldHVybjsgfVxuXG4gICAgICBwcm9taXNlLl9yZXN1bHQgPSB2YWx1ZTtcbiAgICAgIHByb21pc2UuX3N0YXRlID0gJCQkaW50ZXJuYWwkJEZVTEZJTExFRDtcblxuICAgICAgaWYgKHByb21pc2UuX3N1YnNjcmliZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBpZiAoJCRyc3ZwJGNvbmZpZyQkY29uZmlnLmluc3RydW1lbnQpIHtcbiAgICAgICAgICAkJGluc3RydW1lbnQkJGRlZmF1bHQoJ2Z1bGZpbGxlZCcsIHByb21pc2UpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkJHJzdnAkY29uZmlnJCRjb25maWcuYXN5bmMoJCQkaW50ZXJuYWwkJHB1Ymxpc2gsIHByb21pc2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKSB7XG4gICAgICBpZiAocHJvbWlzZS5fc3RhdGUgIT09ICQkJGludGVybmFsJCRQRU5ESU5HKSB7IHJldHVybjsgfVxuICAgICAgcHJvbWlzZS5fc3RhdGUgPSAkJCRpbnRlcm5hbCQkUkVKRUNURUQ7XG4gICAgICBwcm9taXNlLl9yZXN1bHQgPSByZWFzb247XG5cbiAgICAgICQkcnN2cCRjb25maWckJGNvbmZpZy5hc3luYygkJCRpbnRlcm5hbCQkcHVibGlzaFJlamVjdGlvbiwgcHJvbWlzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJHN1YnNjcmliZShwYXJlbnQsIGNoaWxkLCBvbkZ1bGZpbGxtZW50LCBvblJlamVjdGlvbikge1xuICAgICAgdmFyIHN1YnNjcmliZXJzID0gcGFyZW50Ll9zdWJzY3JpYmVycztcbiAgICAgIHZhciBsZW5ndGggPSBzdWJzY3JpYmVycy5sZW5ndGg7XG5cbiAgICAgIHBhcmVudC5fb25lcnJvciA9IG51bGw7XG5cbiAgICAgIHN1YnNjcmliZXJzW2xlbmd0aF0gPSBjaGlsZDtcbiAgICAgIHN1YnNjcmliZXJzW2xlbmd0aCArICQkJGludGVybmFsJCRGVUxGSUxMRURdID0gb25GdWxmaWxsbWVudDtcbiAgICAgIHN1YnNjcmliZXJzW2xlbmd0aCArICQkJGludGVybmFsJCRSRUpFQ1RFRF0gID0gb25SZWplY3Rpb247XG5cbiAgICAgIGlmIChsZW5ndGggPT09IDAgJiYgcGFyZW50Ll9zdGF0ZSkge1xuICAgICAgICAkJHJzdnAkY29uZmlnJCRjb25maWcuYXN5bmMoJCQkaW50ZXJuYWwkJHB1Ymxpc2gsIHBhcmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJHB1Ymxpc2gocHJvbWlzZSkge1xuICAgICAgdmFyIHN1YnNjcmliZXJzID0gcHJvbWlzZS5fc3Vic2NyaWJlcnM7XG4gICAgICB2YXIgc2V0dGxlZCA9IHByb21pc2UuX3N0YXRlO1xuXG4gICAgICBpZiAoJCRyc3ZwJGNvbmZpZyQkY29uZmlnLmluc3RydW1lbnQpIHtcbiAgICAgICAgJCRpbnN0cnVtZW50JCRkZWZhdWx0KHNldHRsZWQgPT09ICQkJGludGVybmFsJCRGVUxGSUxMRUQgPyAnZnVsZmlsbGVkJyA6ICdyZWplY3RlZCcsIHByb21pc2UpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3Vic2NyaWJlcnMubGVuZ3RoID09PSAwKSB7IHJldHVybjsgfVxuXG4gICAgICB2YXIgY2hpbGQsIGNhbGxiYWNrLCBkZXRhaWwgPSBwcm9taXNlLl9yZXN1bHQ7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3Vic2NyaWJlcnMubGVuZ3RoOyBpICs9IDMpIHtcbiAgICAgICAgY2hpbGQgPSBzdWJzY3JpYmVyc1tpXTtcbiAgICAgICAgY2FsbGJhY2sgPSBzdWJzY3JpYmVyc1tpICsgc2V0dGxlZF07XG5cbiAgICAgICAgaWYgKGNoaWxkKSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJGludm9rZUNhbGxiYWNrKHNldHRsZWQsIGNoaWxkLCBjYWxsYmFjaywgZGV0YWlsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjYWxsYmFjayhkZXRhaWwpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHByb21pc2UuX3N1YnNjcmliZXJzLmxlbmd0aCA9IDA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJEVycm9yT2JqZWN0KCkge1xuICAgICAgdGhpcy5lcnJvciA9IG51bGw7XG4gICAgfVxuXG4gICAgdmFyICQkJGludGVybmFsJCRUUllfQ0FUQ0hfRVJST1IgPSBuZXcgJCQkaW50ZXJuYWwkJEVycm9yT2JqZWN0KCk7XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkdHJ5Q2F0Y2goY2FsbGJhY2ssIGRldGFpbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGRldGFpbCk7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJFRSWV9DQVRDSF9FUlJPUi5lcnJvciA9IGU7XG4gICAgICAgIHJldHVybiAkJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBwcm9taXNlLCBjYWxsYmFjaywgZGV0YWlsKSB7XG4gICAgICB2YXIgaGFzQ2FsbGJhY2sgPSAkJHV0aWxzJCRpc0Z1bmN0aW9uKGNhbGxiYWNrKSxcbiAgICAgICAgICB2YWx1ZSwgZXJyb3IsIHN1Y2NlZWRlZCwgZmFpbGVkO1xuXG4gICAgICBpZiAoaGFzQ2FsbGJhY2spIHtcbiAgICAgICAgdmFsdWUgPSAkJCRpbnRlcm5hbCQkdHJ5Q2F0Y2goY2FsbGJhY2ssIGRldGFpbCk7XG5cbiAgICAgICAgaWYgKHZhbHVlID09PSAkJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SKSB7XG4gICAgICAgICAgZmFpbGVkID0gdHJ1ZTtcbiAgICAgICAgICBlcnJvciA9IHZhbHVlLmVycm9yO1xuICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdWNjZWVkZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb21pc2UgPT09IHZhbHVlKSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBuZXcgVHlwZUVycm9yKCdBIHByb21pc2VzIGNhbGxiYWNrIGNhbm5vdCByZXR1cm4gdGhhdCBzYW1lIHByb21pc2UuJykpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IGRldGFpbDtcbiAgICAgICAgc3VjY2VlZGVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHByb21pc2UuX3N0YXRlICE9PSAkJCRpbnRlcm5hbCQkUEVORElORykge1xuICAgICAgICAvLyBub29wXG4gICAgICB9IGVsc2UgaWYgKGhhc0NhbGxiYWNrICYmIHN1Y2NlZWRlZCkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGZhaWxlZCkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgICAgIH0gZWxzZSBpZiAoc2V0dGxlZCA9PT0gJCQkaW50ZXJuYWwkJEZVTEZJTExFRCkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKHNldHRsZWQgPT09ICQkJGludGVybmFsJCRSRUpFQ1RFRCkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkaW5pdGlhbGl6ZVByb21pc2UocHJvbWlzZSwgcmVzb2x2ZXIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlc29sdmVyKGZ1bmN0aW9uIHJlc29sdmVQcm9taXNlKHZhbHVlKXtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIHJlamVjdFByb21pc2UocmVhc29uKSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkZW51bWVyYXRvciQkbWFrZVNldHRsZWRSZXN1bHQoc3RhdGUsIHBvc2l0aW9uLCB2YWx1ZSkge1xuICAgICAgaWYgKHN0YXRlID09PSAkJCRpbnRlcm5hbCQkRlVMRklMTEVEKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3RhdGU6ICdmdWxmaWxsZWQnLFxuICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdGF0ZTogJ3JlamVjdGVkJyxcbiAgICAgICAgICByZWFzb246IHZhbHVlXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yKENvbnN0cnVjdG9yLCBpbnB1dCwgYWJvcnRPblJlamVjdCwgbGFiZWwpIHtcbiAgICAgIHRoaXMuX2luc3RhbmNlQ29uc3RydWN0b3IgPSBDb25zdHJ1Y3RvcjtcbiAgICAgIHRoaXMucHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcigkJCRpbnRlcm5hbCQkbm9vcCwgbGFiZWwpO1xuICAgICAgdGhpcy5fYWJvcnRPblJlamVjdCA9IGFib3J0T25SZWplY3Q7XG5cbiAgICAgIGlmICh0aGlzLl92YWxpZGF0ZUlucHV0KGlucHV0KSkge1xuICAgICAgICB0aGlzLl9pbnB1dCAgICAgPSBpbnB1dDtcbiAgICAgICAgdGhpcy5sZW5ndGggICAgID0gaW5wdXQubGVuZ3RoO1xuICAgICAgICB0aGlzLl9yZW1haW5pbmcgPSBpbnB1dC5sZW5ndGg7XG5cbiAgICAgICAgdGhpcy5faW5pdCgpO1xuXG4gICAgICAgIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICQkJGludGVybmFsJCRmdWxmaWxsKHRoaXMucHJvbWlzZSwgdGhpcy5fcmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmxlbmd0aCA9IHRoaXMubGVuZ3RoIHx8IDA7XG4gICAgICAgICAgdGhpcy5fZW51bWVyYXRlKCk7XG4gICAgICAgICAgaWYgKHRoaXMuX3JlbWFpbmluZyA9PT0gMCkge1xuICAgICAgICAgICAgJCQkaW50ZXJuYWwkJGZ1bGZpbGwodGhpcy5wcm9taXNlLCB0aGlzLl9yZXN1bHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdCh0aGlzLnByb21pc2UsIHRoaXMuX3ZhbGlkYXRpb25FcnJvcigpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAkJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl92YWxpZGF0ZUlucHV0ID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgIHJldHVybiAkJHV0aWxzJCRpc0FycmF5KGlucHV0KTtcbiAgICB9O1xuXG4gICAgJCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fdmFsaWRhdGlvbkVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IEVycm9yKCdBcnJheSBNZXRob2RzIG11c3QgYmUgcHJvdmlkZWQgYW4gQXJyYXknKTtcbiAgICB9O1xuXG4gICAgJCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fcmVzdWx0ID0gbmV3IEFycmF5KHRoaXMubGVuZ3RoKTtcbiAgICB9O1xuXG4gICAgdmFyICQkZW51bWVyYXRvciQkZGVmYXVsdCA9ICQkZW51bWVyYXRvciQkRW51bWVyYXRvcjtcblxuICAgICQkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX2VudW1lcmF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGxlbmd0aCAgPSB0aGlzLmxlbmd0aDtcbiAgICAgIHZhciBwcm9taXNlID0gdGhpcy5wcm9taXNlO1xuICAgICAgdmFyIGlucHV0ICAgPSB0aGlzLl9pbnB1dDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IHByb21pc2UuX3N0YXRlID09PSAkJCRpbnRlcm5hbCQkUEVORElORyAmJiBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5fZWFjaEVudHJ5KGlucHV0W2ldLCBpKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgJCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fZWFjaEVudHJ5ID0gZnVuY3Rpb24oZW50cnksIGkpIHtcbiAgICAgIHZhciBjID0gdGhpcy5faW5zdGFuY2VDb25zdHJ1Y3RvcjtcbiAgICAgIGlmICgkJHV0aWxzJCRpc01heWJlVGhlbmFibGUoZW50cnkpKSB7XG4gICAgICAgIGlmIChlbnRyeS5jb25zdHJ1Y3RvciA9PT0gYyAmJiBlbnRyeS5fc3RhdGUgIT09ICQkJGludGVybmFsJCRQRU5ESU5HKSB7XG4gICAgICAgICAgZW50cnkuX29uZXJyb3IgPSBudWxsO1xuICAgICAgICAgIHRoaXMuX3NldHRsZWRBdChlbnRyeS5fc3RhdGUsIGksIGVudHJ5Ll9yZXN1bHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3dpbGxTZXR0bGVBdChjLnJlc29sdmUoZW50cnkpLCBpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcmVtYWluaW5nLS07XG4gICAgICAgIHRoaXMuX3Jlc3VsdFtpXSA9IHRoaXMuX21ha2VSZXN1bHQoJCQkaW50ZXJuYWwkJEZVTEZJTExFRCwgaSwgZW50cnkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAkJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl9zZXR0bGVkQXQgPSBmdW5jdGlvbihzdGF0ZSwgaSwgdmFsdWUpIHtcbiAgICAgIHZhciBwcm9taXNlID0gdGhpcy5wcm9taXNlO1xuXG4gICAgICBpZiAocHJvbWlzZS5fc3RhdGUgPT09ICQkJGludGVybmFsJCRQRU5ESU5HKSB7XG4gICAgICAgIHRoaXMuX3JlbWFpbmluZy0tO1xuXG4gICAgICAgIGlmICh0aGlzLl9hYm9ydE9uUmVqZWN0ICYmIHN0YXRlID09PSAkJCRpbnRlcm5hbCQkUkVKRUNURUQpIHtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9yZXN1bHRbaV0gPSB0aGlzLl9tYWtlUmVzdWx0KHN0YXRlLCBpLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX3JlbWFpbmluZyA9PT0gMCkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB0aGlzLl9yZXN1bHQpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAkJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl9tYWtlUmVzdWx0ID0gZnVuY3Rpb24oc3RhdGUsIGksIHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcblxuICAgICQkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX3dpbGxTZXR0bGVBdCA9IGZ1bmN0aW9uKHByb21pc2UsIGkpIHtcbiAgICAgIHZhciBlbnVtZXJhdG9yID0gdGhpcztcblxuICAgICAgJCQkaW50ZXJuYWwkJHN1YnNjcmliZShwcm9taXNlLCB1bmRlZmluZWQsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGVudW1lcmF0b3IuX3NldHRsZWRBdCgkJCRpbnRlcm5hbCQkRlVMRklMTEVELCBpLCB2YWx1ZSk7XG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgZW51bWVyYXRvci5fc2V0dGxlZEF0KCQkJGludGVybmFsJCRSRUpFQ1RFRCwgaSwgcmVhc29uKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgJCRwcm9taXNlJGFsbCQkZGVmYXVsdCA9IGZ1bmN0aW9uIGFsbChlbnRyaWVzLCBsYWJlbCkge1xuICAgICAgcmV0dXJuIG5ldyAkJGVudW1lcmF0b3IkJGRlZmF1bHQodGhpcywgZW50cmllcywgdHJ1ZSAvKiBhYm9ydCBvbiByZWplY3QgKi8sIGxhYmVsKS5wcm9taXNlO1xuICAgIH07XG5cbiAgICB2YXIgJCRwcm9taXNlJHJhY2UkJGRlZmF1bHQgPSBmdW5jdGlvbiByYWNlKGVudHJpZXMsIGxhYmVsKSB7XG4gICAgICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICAgICAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcblxuICAgICAgdmFyIHByb21pc2UgPSBuZXcgQ29uc3RydWN0b3IoJCQkaW50ZXJuYWwkJG5vb3AsIGxhYmVsKTtcblxuICAgICAgaWYgKCEkJHV0aWxzJCRpc0FycmF5KGVudHJpZXMpKSB7XG4gICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgbmV3IFR5cGVFcnJvcignWW91IG11c3QgcGFzcyBhbiBhcnJheSB0byByYWNlLicpKTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICB9XG5cbiAgICAgIHZhciBsZW5ndGggPSBlbnRyaWVzLmxlbmd0aDtcblxuICAgICAgZnVuY3Rpb24gb25GdWxmaWxsbWVudCh2YWx1ZSkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0aW9uKHJlYXNvbikge1xuICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBwcm9taXNlLl9zdGF0ZSA9PT0gJCQkaW50ZXJuYWwkJFBFTkRJTkcgJiYgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICQkJGludGVybmFsJCRzdWJzY3JpYmUoQ29uc3RydWN0b3IucmVzb2x2ZShlbnRyaWVzW2ldKSwgdW5kZWZpbmVkLCBvbkZ1bGZpbGxtZW50LCBvblJlamVjdGlvbik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH07XG5cbiAgICB2YXIgJCRwcm9taXNlJHJlc29sdmUkJGRlZmF1bHQgPSBmdW5jdGlvbiByZXNvbHZlKG9iamVjdCwgbGFiZWwpIHtcbiAgICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gICAgICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuXG4gICAgICBpZiAob2JqZWN0ICYmIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnICYmIG9iamVjdC5jb25zdHJ1Y3RvciA9PT0gQ29uc3RydWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICAgIH1cblxuICAgICAgdmFyIHByb21pc2UgPSBuZXcgQ29uc3RydWN0b3IoJCQkaW50ZXJuYWwkJG5vb3AsIGxhYmVsKTtcbiAgICAgICQkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIG9iamVjdCk7XG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9O1xuXG4gICAgdmFyICQkcHJvbWlzZSRyZWplY3QkJGRlZmF1bHQgPSBmdW5jdGlvbiByZWplY3QocmVhc29uLCBsYWJlbCkge1xuICAgICAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgICAgIHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG4gICAgICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcigkJCRpbnRlcm5hbCQkbm9vcCwgbGFiZWwpO1xuICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfTtcblxuICAgIHZhciAkJHJzdnAkcHJvbWlzZSQkZ3VpZEtleSA9ICdyc3ZwXycgKyAkJHV0aWxzJCRub3coKSArICctJztcbiAgICB2YXIgJCRyc3ZwJHByb21pc2UkJGNvdW50ZXIgPSAwO1xuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJHByb21pc2UkJG5lZWRzUmVzb2x2ZXIoKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdZb3UgbXVzdCBwYXNzIGEgcmVzb2x2ZXIgZnVuY3Rpb24gYXMgdGhlIGZpcnN0IGFyZ3VtZW50IHRvIHRoZSBwcm9taXNlIGNvbnN0cnVjdG9yJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJHByb21pc2UkJG5lZWRzTmV3KCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkZhaWxlZCB0byBjb25zdHJ1Y3QgJ1Byb21pc2UnOiBQbGVhc2UgdXNlIHRoZSAnbmV3JyBvcGVyYXRvciwgdGhpcyBvYmplY3QgY29uc3RydWN0b3IgY2Fubm90IGJlIGNhbGxlZCBhcyBhIGZ1bmN0aW9uLlwiKTtcbiAgICB9XG5cbiAgICB2YXIgJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQgPSAkJHJzdnAkcHJvbWlzZSQkUHJvbWlzZTtcblxuICAgIC8qKlxuICAgICAgUHJvbWlzZSBvYmplY3RzIHJlcHJlc2VudCB0aGUgZXZlbnR1YWwgcmVzdWx0IG9mIGFuIGFzeW5jaHJvbm91cyBvcGVyYXRpb24uIFRoZVxuICAgICAgcHJpbWFyeSB3YXkgb2YgaW50ZXJhY3Rpbmcgd2l0aCBhIHByb21pc2UgaXMgdGhyb3VnaCBpdHMgYHRoZW5gIG1ldGhvZCwgd2hpY2hcbiAgICAgIHJlZ2lzdGVycyBjYWxsYmFja3MgdG8gcmVjZWl2ZSBlaXRoZXIgYSBwcm9taXNl4oCZcyBldmVudHVhbCB2YWx1ZSBvciB0aGUgcmVhc29uXG4gICAgICB3aHkgdGhlIHByb21pc2UgY2Fubm90IGJlIGZ1bGZpbGxlZC5cblxuICAgICAgVGVybWlub2xvZ3lcbiAgICAgIC0tLS0tLS0tLS0tXG5cbiAgICAgIC0gYHByb21pc2VgIGlzIGFuIG9iamVjdCBvciBmdW5jdGlvbiB3aXRoIGEgYHRoZW5gIG1ldGhvZCB3aG9zZSBiZWhhdmlvciBjb25mb3JtcyB0byB0aGlzIHNwZWNpZmljYXRpb24uXG4gICAgICAtIGB0aGVuYWJsZWAgaXMgYW4gb2JqZWN0IG9yIGZ1bmN0aW9uIHRoYXQgZGVmaW5lcyBhIGB0aGVuYCBtZXRob2QuXG4gICAgICAtIGB2YWx1ZWAgaXMgYW55IGxlZ2FsIEphdmFTY3JpcHQgdmFsdWUgKGluY2x1ZGluZyB1bmRlZmluZWQsIGEgdGhlbmFibGUsIG9yIGEgcHJvbWlzZSkuXG4gICAgICAtIGBleGNlcHRpb25gIGlzIGEgdmFsdWUgdGhhdCBpcyB0aHJvd24gdXNpbmcgdGhlIHRocm93IHN0YXRlbWVudC5cbiAgICAgIC0gYHJlYXNvbmAgaXMgYSB2YWx1ZSB0aGF0IGluZGljYXRlcyB3aHkgYSBwcm9taXNlIHdhcyByZWplY3RlZC5cbiAgICAgIC0gYHNldHRsZWRgIHRoZSBmaW5hbCByZXN0aW5nIHN0YXRlIG9mIGEgcHJvbWlzZSwgZnVsZmlsbGVkIG9yIHJlamVjdGVkLlxuXG4gICAgICBBIHByb21pc2UgY2FuIGJlIGluIG9uZSBvZiB0aHJlZSBzdGF0ZXM6IHBlbmRpbmcsIGZ1bGZpbGxlZCwgb3IgcmVqZWN0ZWQuXG5cbiAgICAgIFByb21pc2VzIHRoYXQgYXJlIGZ1bGZpbGxlZCBoYXZlIGEgZnVsZmlsbG1lbnQgdmFsdWUgYW5kIGFyZSBpbiB0aGUgZnVsZmlsbGVkXG4gICAgICBzdGF0ZS4gIFByb21pc2VzIHRoYXQgYXJlIHJlamVjdGVkIGhhdmUgYSByZWplY3Rpb24gcmVhc29uIGFuZCBhcmUgaW4gdGhlXG4gICAgICByZWplY3RlZCBzdGF0ZS4gIEEgZnVsZmlsbG1lbnQgdmFsdWUgaXMgbmV2ZXIgYSB0aGVuYWJsZS5cblxuICAgICAgUHJvbWlzZXMgY2FuIGFsc28gYmUgc2FpZCB0byAqcmVzb2x2ZSogYSB2YWx1ZS4gIElmIHRoaXMgdmFsdWUgaXMgYWxzbyBhXG4gICAgICBwcm9taXNlLCB0aGVuIHRoZSBvcmlnaW5hbCBwcm9taXNlJ3Mgc2V0dGxlZCBzdGF0ZSB3aWxsIG1hdGNoIHRoZSB2YWx1ZSdzXG4gICAgICBzZXR0bGVkIHN0YXRlLiAgU28gYSBwcm9taXNlIHRoYXQgKnJlc29sdmVzKiBhIHByb21pc2UgdGhhdCByZWplY3RzIHdpbGxcbiAgICAgIGl0c2VsZiByZWplY3QsIGFuZCBhIHByb21pc2UgdGhhdCAqcmVzb2x2ZXMqIGEgcHJvbWlzZSB0aGF0IGZ1bGZpbGxzIHdpbGxcbiAgICAgIGl0c2VsZiBmdWxmaWxsLlxuXG5cbiAgICAgIEJhc2ljIFVzYWdlOlxuICAgICAgLS0tLS0tLS0tLS0tXG5cbiAgICAgIGBgYGpzXG4gICAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAvLyBvbiBzdWNjZXNzXG4gICAgICAgIHJlc29sdmUodmFsdWUpO1xuXG4gICAgICAgIC8vIG9uIGZhaWx1cmVcbiAgICAgICAgcmVqZWN0KHJlYXNvbik7XG4gICAgICB9KTtcblxuICAgICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIC8vIG9uIGZ1bGZpbGxtZW50XG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgLy8gb24gcmVqZWN0aW9uXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBBZHZhbmNlZCBVc2FnZTpcbiAgICAgIC0tLS0tLS0tLS0tLS0tLVxuXG4gICAgICBQcm9taXNlcyBzaGluZSB3aGVuIGFic3RyYWN0aW5nIGF3YXkgYXN5bmNocm9ub3VzIGludGVyYWN0aW9ucyBzdWNoIGFzXG4gICAgICBgWE1MSHR0cFJlcXVlc3Rgcy5cblxuICAgICAgYGBganNcbiAgICAgIGZ1bmN0aW9uIGdldEpTT04odXJsKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgICAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgICAgIHhoci5vcGVuKCdHRVQnLCB1cmwpO1xuICAgICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBoYW5kbGVyO1xuICAgICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnanNvbic7XG4gICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgeGhyLnNlbmQoKTtcblxuICAgICAgICAgIGZ1bmN0aW9uIGhhbmRsZXIoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09PSB0aGlzLkRPTkUpIHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHRoaXMucmVzcG9uc2UpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ2dldEpTT046IGAnICsgdXJsICsgJ2AgZmFpbGVkIHdpdGggc3RhdHVzOiBbJyArIHRoaXMuc3RhdHVzICsgJ10nKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZ2V0SlNPTignL3Bvc3RzLmpzb24nKS50aGVuKGZ1bmN0aW9uKGpzb24pIHtcbiAgICAgICAgLy8gb24gZnVsZmlsbG1lbnRcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICAvLyBvbiByZWplY3Rpb25cbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIFVubGlrZSBjYWxsYmFja3MsIHByb21pc2VzIGFyZSBncmVhdCBjb21wb3NhYmxlIHByaW1pdGl2ZXMuXG5cbiAgICAgIGBgYGpzXG4gICAgICBQcm9taXNlLmFsbChbXG4gICAgICAgIGdldEpTT04oJy9wb3N0cycpLFxuICAgICAgICBnZXRKU09OKCcvY29tbWVudHMnKVxuICAgICAgXSkudGhlbihmdW5jdGlvbih2YWx1ZXMpe1xuICAgICAgICB2YWx1ZXNbMF0gLy8gPT4gcG9zdHNKU09OXG4gICAgICAgIHZhbHVlc1sxXSAvLyA9PiBjb21tZW50c0pTT05cblxuICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQGNsYXNzIFJTVlAuUHJvbWlzZVxuICAgICAgQHBhcmFtIHtmdW5jdGlvbn0gcmVzb2x2ZXJcbiAgICAgIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCBvcHRpb25hbCBzdHJpbmcgZm9yIGxhYmVsaW5nIHRoZSBwcm9taXNlLlxuICAgICAgVXNlZnVsIGZvciB0b29saW5nLlxuICAgICAgQGNvbnN0cnVjdG9yXG4gICAgKi9cbiAgICBmdW5jdGlvbiAkJHJzdnAkcHJvbWlzZSQkUHJvbWlzZShyZXNvbHZlciwgbGFiZWwpIHtcbiAgICAgIHRoaXMuX2lkID0gJCRyc3ZwJHByb21pc2UkJGNvdW50ZXIrKztcbiAgICAgIHRoaXMuX2xhYmVsID0gbGFiZWw7XG4gICAgICB0aGlzLl9zdGF0ZSA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuX3Jlc3VsdCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuX3N1YnNjcmliZXJzID0gW107XG5cbiAgICAgIGlmICgkJHJzdnAkY29uZmlnJCRjb25maWcuaW5zdHJ1bWVudCkge1xuICAgICAgICAkJGluc3RydW1lbnQkJGRlZmF1bHQoJ2NyZWF0ZWQnLCB0aGlzKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCQkJGludGVybmFsJCRub29wICE9PSByZXNvbHZlcikge1xuICAgICAgICBpZiAoISQkdXRpbHMkJGlzRnVuY3Rpb24ocmVzb2x2ZXIpKSB7XG4gICAgICAgICAgJCRyc3ZwJHByb21pc2UkJG5lZWRzUmVzb2x2ZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiAkJHJzdnAkcHJvbWlzZSQkUHJvbWlzZSkpIHtcbiAgICAgICAgICAkJHJzdnAkcHJvbWlzZSQkbmVlZHNOZXcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQkJGludGVybmFsJCRpbml0aWFsaXplUHJvbWlzZSh0aGlzLCByZXNvbHZlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gZGVwcmVjYXRlZFxuICAgICQkcnN2cCRwcm9taXNlJCRQcm9taXNlLmNhc3QgPSAkJHByb21pc2UkcmVzb2x2ZSQkZGVmYXVsdDtcblxuICAgICQkcnN2cCRwcm9taXNlJCRQcm9taXNlLmFsbCA9ICQkcHJvbWlzZSRhbGwkJGRlZmF1bHQ7XG4gICAgJCRyc3ZwJHByb21pc2UkJFByb21pc2UucmFjZSA9ICQkcHJvbWlzZSRyYWNlJCRkZWZhdWx0O1xuICAgICQkcnN2cCRwcm9taXNlJCRQcm9taXNlLnJlc29sdmUgPSAkJHByb21pc2UkcmVzb2x2ZSQkZGVmYXVsdDtcbiAgICAkJHJzdnAkcHJvbWlzZSQkUHJvbWlzZS5yZWplY3QgPSAkJHByb21pc2UkcmVqZWN0JCRkZWZhdWx0O1xuXG4gICAgJCRyc3ZwJHByb21pc2UkJFByb21pc2UucHJvdG90eXBlID0ge1xuICAgICAgY29uc3RydWN0b3I6ICQkcnN2cCRwcm9taXNlJCRQcm9taXNlLFxuXG4gICAgICBfZ3VpZEtleTogJCRyc3ZwJHByb21pc2UkJGd1aWRLZXksXG5cbiAgICAgIF9vbmVycm9yOiBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgICQkcnN2cCRjb25maWckJGNvbmZpZy50cmlnZ2VyKCdlcnJvcicsIHJlYXNvbik7XG4gICAgICB9LFxuXG4gICAgLyoqXG4gICAgICBUaGUgcHJpbWFyeSB3YXkgb2YgaW50ZXJhY3Rpbmcgd2l0aCBhIHByb21pc2UgaXMgdGhyb3VnaCBpdHMgYHRoZW5gIG1ldGhvZCxcbiAgICAgIHdoaWNoIHJlZ2lzdGVycyBjYWxsYmFja3MgdG8gcmVjZWl2ZSBlaXRoZXIgYSBwcm9taXNlJ3MgZXZlbnR1YWwgdmFsdWUgb3IgdGhlXG4gICAgICByZWFzb24gd2h5IHRoZSBwcm9taXNlIGNhbm5vdCBiZSBmdWxmaWxsZWQuXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24odXNlcil7XG4gICAgICAgIC8vIHVzZXIgaXMgYXZhaWxhYmxlXG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICAvLyB1c2VyIGlzIHVuYXZhaWxhYmxlLCBhbmQgeW91IGFyZSBnaXZlbiB0aGUgcmVhc29uIHdoeVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQ2hhaW5pbmdcbiAgICAgIC0tLS0tLS0tXG5cbiAgICAgIFRoZSByZXR1cm4gdmFsdWUgb2YgYHRoZW5gIGlzIGl0c2VsZiBhIHByb21pc2UuICBUaGlzIHNlY29uZCwgJ2Rvd25zdHJlYW0nXG4gICAgICBwcm9taXNlIGlzIHJlc29sdmVkIHdpdGggdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZmlyc3QgcHJvbWlzZSdzIGZ1bGZpbGxtZW50XG4gICAgICBvciByZWplY3Rpb24gaGFuZGxlciwgb3IgcmVqZWN0ZWQgaWYgdGhlIGhhbmRsZXIgdGhyb3dzIGFuIGV4Y2VwdGlvbi5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICByZXR1cm4gdXNlci5uYW1lO1xuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICByZXR1cm4gJ2RlZmF1bHQgbmFtZSc7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uICh1c2VyTmFtZSkge1xuICAgICAgICAvLyBJZiBgZmluZFVzZXJgIGZ1bGZpbGxlZCwgYHVzZXJOYW1lYCB3aWxsIGJlIHRoZSB1c2VyJ3MgbmFtZSwgb3RoZXJ3aXNlIGl0XG4gICAgICAgIC8vIHdpbGwgYmUgYCdkZWZhdWx0IG5hbWUnYFxuICAgICAgfSk7XG5cbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZvdW5kIHVzZXIsIGJ1dCBzdGlsbCB1bmhhcHB5Jyk7XG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYGZpbmRVc2VyYCByZWplY3RlZCBhbmQgd2UncmUgdW5oYXBweScpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgLy8gbmV2ZXIgcmVhY2hlZFxuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAvLyBpZiBgZmluZFVzZXJgIGZ1bGZpbGxlZCwgYHJlYXNvbmAgd2lsbCBiZSAnRm91bmQgdXNlciwgYnV0IHN0aWxsIHVuaGFwcHknLlxuICAgICAgICAvLyBJZiBgZmluZFVzZXJgIHJlamVjdGVkLCBgcmVhc29uYCB3aWxsIGJlICdgZmluZFVzZXJgIHJlamVjdGVkIGFuZCB3ZSdyZSB1bmhhcHB5Jy5cbiAgICAgIH0pO1xuICAgICAgYGBgXG4gICAgICBJZiB0aGUgZG93bnN0cmVhbSBwcm9taXNlIGRvZXMgbm90IHNwZWNpZnkgYSByZWplY3Rpb24gaGFuZGxlciwgcmVqZWN0aW9uIHJlYXNvbnMgd2lsbCBiZSBwcm9wYWdhdGVkIGZ1cnRoZXIgZG93bnN0cmVhbS5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICB0aHJvdyBuZXcgUGVkYWdvZ2ljYWxFeGNlcHRpb24oJ1Vwc3RyZWFtIGVycm9yJyk7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyBuZXZlciByZWFjaGVkXG4gICAgICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyBuZXZlciByZWFjaGVkXG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vIFRoZSBgUGVkZ2Fnb2NpYWxFeGNlcHRpb25gIGlzIHByb3BhZ2F0ZWQgYWxsIHRoZSB3YXkgZG93biB0byBoZXJlXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBBc3NpbWlsYXRpb25cbiAgICAgIC0tLS0tLS0tLS0tLVxuXG4gICAgICBTb21ldGltZXMgdGhlIHZhbHVlIHlvdSB3YW50IHRvIHByb3BhZ2F0ZSB0byBhIGRvd25zdHJlYW0gcHJvbWlzZSBjYW4gb25seSBiZVxuICAgICAgcmV0cmlldmVkIGFzeW5jaHJvbm91c2x5LiBUaGlzIGNhbiBiZSBhY2hpZXZlZCBieSByZXR1cm5pbmcgYSBwcm9taXNlIGluIHRoZVxuICAgICAgZnVsZmlsbG1lbnQgb3IgcmVqZWN0aW9uIGhhbmRsZXIuIFRoZSBkb3duc3RyZWFtIHByb21pc2Ugd2lsbCB0aGVuIGJlIHBlbmRpbmdcbiAgICAgIHVudGlsIHRoZSByZXR1cm5lZCBwcm9taXNlIGlzIHNldHRsZWQuIFRoaXMgaXMgY2FsbGVkICphc3NpbWlsYXRpb24qLlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHJldHVybiBmaW5kQ29tbWVudHNCeUF1dGhvcih1c2VyKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKGNvbW1lbnRzKSB7XG4gICAgICAgIC8vIFRoZSB1c2VyJ3MgY29tbWVudHMgYXJlIG5vdyBhdmFpbGFibGVcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIElmIHRoZSBhc3NpbWxpYXRlZCBwcm9taXNlIHJlamVjdHMsIHRoZW4gdGhlIGRvd25zdHJlYW0gcHJvbWlzZSB3aWxsIGFsc28gcmVqZWN0LlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHJldHVybiBmaW5kQ29tbWVudHNCeUF1dGhvcih1c2VyKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKGNvbW1lbnRzKSB7XG4gICAgICAgIC8vIElmIGBmaW5kQ29tbWVudHNCeUF1dGhvcmAgZnVsZmlsbHMsIHdlJ2xsIGhhdmUgdGhlIHZhbHVlIGhlcmVcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgLy8gSWYgYGZpbmRDb21tZW50c0J5QXV0aG9yYCByZWplY3RzLCB3ZSdsbCBoYXZlIHRoZSByZWFzb24gaGVyZVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgU2ltcGxlIEV4YW1wbGVcbiAgICAgIC0tLS0tLS0tLS0tLS0tXG5cbiAgICAgIFN5bmNocm9ub3VzIEV4YW1wbGVcblxuICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgdmFyIHJlc3VsdDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzdWx0ID0gZmluZFJlc3VsdCgpO1xuICAgICAgICAvLyBzdWNjZXNzXG4gICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAvLyBmYWlsdXJlXG4gICAgICB9XG4gICAgICBgYGBcblxuICAgICAgRXJyYmFjayBFeGFtcGxlXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kUmVzdWx0KGZ1bmN0aW9uKHJlc3VsdCwgZXJyKXtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIC8vIGZhaWx1cmVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBzdWNjZXNzXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIFByb21pc2UgRXhhbXBsZTtcblxuICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgZmluZFJlc3VsdCgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KXtcbiAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQWR2YW5jZWQgRXhhbXBsZVxuICAgICAgLS0tLS0tLS0tLS0tLS1cblxuICAgICAgU3luY2hyb25vdXMgRXhhbXBsZVxuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICB2YXIgYXV0aG9yLCBib29rcztcblxuICAgICAgdHJ5IHtcbiAgICAgICAgYXV0aG9yID0gZmluZEF1dGhvcigpO1xuICAgICAgICBib29rcyAgPSBmaW5kQm9va3NCeUF1dGhvcihhdXRob3IpO1xuICAgICAgICAvLyBzdWNjZXNzXG4gICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAvLyBmYWlsdXJlXG4gICAgICB9XG4gICAgICBgYGBcblxuICAgICAgRXJyYmFjayBFeGFtcGxlXG5cbiAgICAgIGBgYGpzXG5cbiAgICAgIGZ1bmN0aW9uIGZvdW5kQm9va3MoYm9va3MpIHtcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBmYWlsdXJlKHJlYXNvbikge1xuXG4gICAgICB9XG5cbiAgICAgIGZpbmRBdXRob3IoZnVuY3Rpb24oYXV0aG9yLCBlcnIpe1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgZmFpbHVyZShlcnIpO1xuICAgICAgICAgIC8vIGZhaWx1cmVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgZmluZEJvb29rc0J5QXV0aG9yKGF1dGhvciwgZnVuY3Rpb24oYm9va3MsIGVycikge1xuICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgZmFpbHVyZShlcnIpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBmb3VuZEJvb2tzKGJvb2tzKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAgICAgICAgICAgZmFpbHVyZShyZWFzb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICAgICAgZmFpbHVyZShlcnIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBzdWNjZXNzXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIFByb21pc2UgRXhhbXBsZTtcblxuICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgZmluZEF1dGhvcigpLlxuICAgICAgICB0aGVuKGZpbmRCb29rc0J5QXV0aG9yKS5cbiAgICAgICAgdGhlbihmdW5jdGlvbihib29rcyl7XG4gICAgICAgICAgLy8gZm91bmQgYm9va3NcbiAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAgIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBAbWV0aG9kIHRoZW5cbiAgICAgIEBwYXJhbSB7RnVuY3Rpb259IG9uRnVsZmlsbGVkXG4gICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBvblJlamVjdGVkXG4gICAgICBAcGFyYW0ge1N0cmluZ30gbGFiZWwgb3B0aW9uYWwgc3RyaW5nIGZvciBsYWJlbGluZyB0aGUgcHJvbWlzZS5cbiAgICAgIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgICAgIEByZXR1cm4ge1Byb21pc2V9XG4gICAgKi9cbiAgICAgIHRoZW46IGZ1bmN0aW9uKG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uLCBsYWJlbCkge1xuICAgICAgICB2YXIgcGFyZW50ID0gdGhpcztcbiAgICAgICAgdmFyIHN0YXRlID0gcGFyZW50Ll9zdGF0ZTtcblxuICAgICAgICBpZiAoc3RhdGUgPT09ICQkJGludGVybmFsJCRGVUxGSUxMRUQgJiYgIW9uRnVsZmlsbG1lbnQgfHwgc3RhdGUgPT09ICQkJGludGVybmFsJCRSRUpFQ1RFRCAmJiAhb25SZWplY3Rpb24pIHtcbiAgICAgICAgICBpZiAoJCRyc3ZwJGNvbmZpZyQkY29uZmlnLmluc3RydW1lbnQpIHtcbiAgICAgICAgICAgICQkaW5zdHJ1bWVudCQkZGVmYXVsdCgnY2hhaW5lZCcsIHRoaXMsIHRoaXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHBhcmVudC5fb25lcnJvciA9IG51bGw7XG5cbiAgICAgICAgdmFyIGNoaWxkID0gbmV3IHRoaXMuY29uc3RydWN0b3IoJCQkaW50ZXJuYWwkJG5vb3AsIGxhYmVsKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHBhcmVudC5fcmVzdWx0O1xuXG4gICAgICAgIGlmICgkJHJzdnAkY29uZmlnJCRjb25maWcuaW5zdHJ1bWVudCkge1xuICAgICAgICAgICQkaW5zdHJ1bWVudCQkZGVmYXVsdCgnY2hhaW5lZCcsIHBhcmVudCwgY2hpbGQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN0YXRlKSB7XG4gICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJndW1lbnRzW3N0YXRlIC0gMV07XG4gICAgICAgICAgJCRyc3ZwJGNvbmZpZyQkY29uZmlnLmFzeW5jKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkJCRpbnRlcm5hbCQkaW52b2tlQ2FsbGJhY2soc3RhdGUsIGNoaWxkLCBjYWxsYmFjaywgcmVzdWx0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkc3Vic2NyaWJlKHBhcmVudCwgY2hpbGQsIG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjaGlsZDtcbiAgICAgIH0sXG5cbiAgICAvKipcbiAgICAgIGBjYXRjaGAgaXMgc2ltcGx5IHN1Z2FyIGZvciBgdGhlbih1bmRlZmluZWQsIG9uUmVqZWN0aW9uKWAgd2hpY2ggbWFrZXMgaXQgdGhlIHNhbWVcbiAgICAgIGFzIHRoZSBjYXRjaCBibG9jayBvZiBhIHRyeS9jYXRjaCBzdGF0ZW1lbnQuXG5cbiAgICAgIGBgYGpzXG4gICAgICBmdW5jdGlvbiBmaW5kQXV0aG9yKCl7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGRuJ3QgZmluZCB0aGF0IGF1dGhvcicpO1xuICAgICAgfVxuXG4gICAgICAvLyBzeW5jaHJvbm91c1xuICAgICAgdHJ5IHtcbiAgICAgICAgZmluZEF1dGhvcigpO1xuICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgICAgIH1cblxuICAgICAgLy8gYXN5bmMgd2l0aCBwcm9taXNlc1xuICAgICAgZmluZEF1dGhvcigpLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAgIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBAbWV0aG9kIGNhdGNoXG4gICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBvblJlamVjdGlvblxuICAgICAgQHBhcmFtIHtTdHJpbmd9IGxhYmVsIG9wdGlvbmFsIHN0cmluZyBmb3IgbGFiZWxpbmcgdGhlIHByb21pc2UuXG4gICAgICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gICAgICBAcmV0dXJuIHtQcm9taXNlfVxuICAgICovXG4gICAgICAnY2F0Y2gnOiBmdW5jdGlvbihvblJlamVjdGlvbiwgbGFiZWwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGhlbihudWxsLCBvblJlamVjdGlvbiwgbGFiZWwpO1xuICAgICAgfSxcblxuICAgIC8qKlxuICAgICAgYGZpbmFsbHlgIHdpbGwgYmUgaW52b2tlZCByZWdhcmRsZXNzIG9mIHRoZSBwcm9taXNlJ3MgZmF0ZSBqdXN0IGFzIG5hdGl2ZVxuICAgICAgdHJ5L2NhdGNoL2ZpbmFsbHkgYmVoYXZlc1xuXG4gICAgICBTeW5jaHJvbm91cyBleGFtcGxlOlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZEF1dGhvcigpIHtcbiAgICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPiAwLjUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IEF1dGhvcigpO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gZmluZEF1dGhvcigpOyAvLyBzdWNjZWVkIG9yIGZhaWxcbiAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGZpbmRPdGhlckF1dGhlcigpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgLy8gYWx3YXlzIHJ1bnNcbiAgICAgICAgLy8gZG9lc24ndCBhZmZlY3QgdGhlIHJldHVybiB2YWx1ZVxuICAgICAgfVxuICAgICAgYGBgXG5cbiAgICAgIEFzeW5jaHJvbm91cyBleGFtcGxlOlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZEF1dGhvcigpLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAgIHJldHVybiBmaW5kT3RoZXJBdXRoZXIoKTtcbiAgICAgIH0pLmZpbmFsbHkoZnVuY3Rpb24oKXtcbiAgICAgICAgLy8gYXV0aG9yIHdhcyBlaXRoZXIgZm91bmQsIG9yIG5vdFxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQG1ldGhvZCBmaW5hbGx5XG4gICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAgQHBhcmFtIHtTdHJpbmd9IGxhYmVsIG9wdGlvbmFsIHN0cmluZyBmb3IgbGFiZWxpbmcgdGhlIHByb21pc2UuXG4gICAgICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gICAgICBAcmV0dXJuIHtQcm9taXNlfVxuICAgICovXG4gICAgICAnZmluYWxseSc6IGZ1bmN0aW9uKGNhbGxiYWNrLCBsYWJlbCkge1xuICAgICAgICB2YXIgY29uc3RydWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yO1xuXG4gICAgICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICByZXR1cm4gY29uc3RydWN0b3IucmVzb2x2ZShjYWxsYmFjaygpKS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICAgIHJldHVybiBjb25zdHJ1Y3Rvci5yZXNvbHZlKGNhbGxiYWNrKCkpLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHRocm93IHJlYXNvbjtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSwgbGFiZWwpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkbm9kZSQkUmVzdWx0KCkge1xuICAgICAgdGhpcy52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICB2YXIgJCRyc3ZwJG5vZGUkJEVSUk9SID0gbmV3ICQkcnN2cCRub2RlJCRSZXN1bHQoKTtcbiAgICB2YXIgJCRyc3ZwJG5vZGUkJEdFVF9USEVOX0VSUk9SID0gbmV3ICQkcnN2cCRub2RlJCRSZXN1bHQoKTtcblxuICAgIGZ1bmN0aW9uICQkcnN2cCRub2RlJCRnZXRUaGVuKG9iaikge1xuICAgICAgdHJ5IHtcbiAgICAgICByZXR1cm4gb2JqLnRoZW47XG4gICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICQkcnN2cCRub2RlJCRFUlJPUi52YWx1ZT0gZXJyb3I7XG4gICAgICAgIHJldHVybiAkJHJzdnAkbm9kZSQkRVJST1I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJG5vZGUkJHRyeUFwcGx5KGYsIHMsIGEpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGYuYXBwbHkocywgYSk7XG4gICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICQkcnN2cCRub2RlJCRFUlJPUi52YWx1ZSA9IGVycm9yO1xuICAgICAgICByZXR1cm4gJCRyc3ZwJG5vZGUkJEVSUk9SO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkcnN2cCRub2RlJCRtYWtlT2JqZWN0KF8sIGFyZ3VtZW50TmFtZXMpIHtcbiAgICAgIHZhciBvYmogPSB7fTtcbiAgICAgIHZhciBuYW1lO1xuICAgICAgdmFyIGk7XG4gICAgICB2YXIgbGVuZ3RoID0gXy5sZW5ndGg7XG4gICAgICB2YXIgYXJncyA9IG5ldyBBcnJheShsZW5ndGgpO1xuXG4gICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IGxlbmd0aDsgeCsrKSB7XG4gICAgICAgIGFyZ3NbeF0gPSBfW3hdO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgYXJndW1lbnROYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBuYW1lID0gYXJndW1lbnROYW1lc1tpXTtcbiAgICAgICAgb2JqW25hbWVdID0gYXJnc1tpICsgMV07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJG5vZGUkJGFycmF5UmVzdWx0KF8pIHtcbiAgICAgIHZhciBsZW5ndGggPSBfLmxlbmd0aDtcbiAgICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGxlbmd0aCAtIDEpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFyZ3NbaSAtIDFdID0gX1tpXTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGFyZ3M7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJG5vZGUkJHdyYXBUaGVuYWJsZSh0aGVuLCBwcm9taXNlKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0aGVuOiBmdW5jdGlvbihvbkZ1bEZpbGxtZW50LCBvblJlamVjdGlvbikge1xuICAgICAgICAgIHJldHVybiB0aGVuLmNhbGwocHJvbWlzZSwgb25GdWxGaWxsbWVudCwgb25SZWplY3Rpb24pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cblxuICAgIHZhciAkJHJzdnAkbm9kZSQkZGVmYXVsdCA9IGZ1bmN0aW9uIGRlbm9kZWlmeShub2RlRnVuYywgb3B0aW9ucykge1xuICAgICAgdmFyIGZuID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGwgPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICB2YXIgYXJncyA9IG5ldyBBcnJheShsICsgMSk7XG4gICAgICAgIHZhciBhcmc7XG4gICAgICAgIHZhciBwcm9taXNlSW5wdXQgPSBmYWxzZTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7ICsraSkge1xuICAgICAgICAgIGFyZyA9IGFyZ3VtZW50c1tpXTtcblxuICAgICAgICAgIGlmICghcHJvbWlzZUlucHV0KSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBjbGVhbiB0aGlzIHVwXG4gICAgICAgICAgICBwcm9taXNlSW5wdXQgPSAkJHJzdnAkbm9kZSQkbmVlZHNQcm9taXNlSW5wdXQoYXJnKTtcbiAgICAgICAgICAgIGlmIChwcm9taXNlSW5wdXQgPT09ICQkcnN2cCRub2RlJCRHRVRfVEhFTl9FUlJPUikge1xuICAgICAgICAgICAgICB2YXIgcCA9IG5ldyAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdCgkJCRpbnRlcm5hbCQkbm9vcCk7XG4gICAgICAgICAgICAgICQkJGludGVybmFsJCRyZWplY3QocCwgJCRyc3ZwJG5vZGUkJEdFVF9USEVOX0VSUk9SLnZhbHVlKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHA7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHByb21pc2VJbnB1dCAmJiBwcm9taXNlSW5wdXQgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgYXJnID0gJCRyc3ZwJG5vZGUkJHdyYXBUaGVuYWJsZShwcm9taXNlSW5wdXQsIGFyZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGFyZ3NbaV0gPSBhcmc7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdCgkJCRpbnRlcm5hbCQkbm9vcCk7XG5cbiAgICAgICAgYXJnc1tsXSA9IGZ1bmN0aW9uKGVyciwgdmFsKSB7XG4gICAgICAgICAgaWYgKGVycilcbiAgICAgICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgZXJyKTtcbiAgICAgICAgICBlbHNlIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWwpO1xuICAgICAgICAgIGVsc2UgaWYgKG9wdGlvbnMgPT09IHRydWUpXG4gICAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCAkJHJzdnAkbm9kZSQkYXJyYXlSZXN1bHQoYXJndW1lbnRzKSk7XG4gICAgICAgICAgZWxzZSBpZiAoJCR1dGlscyQkaXNBcnJheShvcHRpb25zKSlcbiAgICAgICAgICAgICQkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsICQkcnN2cCRub2RlJCRtYWtlT2JqZWN0KGFyZ3VtZW50cywgb3B0aW9ucykpO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICQkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHByb21pc2VJbnB1dCkge1xuICAgICAgICAgIHJldHVybiAkJHJzdnAkbm9kZSQkaGFuZGxlUHJvbWlzZUlucHV0KHByb21pc2UsIGFyZ3MsIG5vZGVGdW5jLCBzZWxmKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gJCRyc3ZwJG5vZGUkJGhhbmRsZVZhbHVlSW5wdXQocHJvbWlzZSwgYXJncywgbm9kZUZ1bmMsIHNlbGYpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBmbi5fX3Byb3RvX18gPSBub2RlRnVuYztcblxuICAgICAgcmV0dXJuIGZuO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkbm9kZSQkaGFuZGxlVmFsdWVJbnB1dChwcm9taXNlLCBhcmdzLCBub2RlRnVuYywgc2VsZikge1xuICAgICAgdmFyIHJlc3VsdCA9ICQkcnN2cCRub2RlJCR0cnlBcHBseShub2RlRnVuYywgc2VsZiwgYXJncyk7XG4gICAgICBpZiAocmVzdWx0ID09PSAkJHJzdnAkbm9kZSQkRVJST1IpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZXN1bHQudmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJG5vZGUkJGhhbmRsZVByb21pc2VJbnB1dChwcm9taXNlLCBhcmdzLCBub2RlRnVuYywgc2VsZil7XG4gICAgICByZXR1cm4gJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQuYWxsKGFyZ3MpLnRoZW4oZnVuY3Rpb24oYXJncyl7XG4gICAgICAgIHZhciByZXN1bHQgPSAkJHJzdnAkbm9kZSQkdHJ5QXBwbHkobm9kZUZ1bmMsIHNlbGYsIGFyZ3MpO1xuICAgICAgICBpZiAocmVzdWx0ID09PSAkJHJzdnAkbm9kZSQkRVJST1IpIHtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlc3VsdC52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkbm9kZSQkbmVlZHNQcm9taXNlSW5wdXQoYXJnKSB7XG4gICAgICBpZiAoYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGlmIChhcmcuY29uc3RydWN0b3IgPT09ICQkcnN2cCRwcm9taXNlJCRkZWZhdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuICQkcnN2cCRub2RlJCRnZXRUaGVuKGFyZyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgJCRyc3ZwJGFsbCQkZGVmYXVsdCA9IGZ1bmN0aW9uIGFsbChhcnJheSwgbGFiZWwpIHtcbiAgICAgIHJldHVybiAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdC5hbGwoYXJyYXksIGxhYmVsKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJGFsbCRzZXR0bGVkJCRBbGxTZXR0bGVkKENvbnN0cnVjdG9yLCBlbnRyaWVzLCBsYWJlbCkge1xuICAgICAgdGhpcy5fc3VwZXJDb25zdHJ1Y3RvcihDb25zdHJ1Y3RvciwgZW50cmllcywgZmFsc2UgLyogZG9uJ3QgYWJvcnQgb24gcmVqZWN0ICovLCBsYWJlbCk7XG4gICAgfVxuXG4gICAgJCRyc3ZwJGFsbCRzZXR0bGVkJCRBbGxTZXR0bGVkLnByb3RvdHlwZSA9ICQkdXRpbHMkJG9fY3JlYXRlKCQkZW51bWVyYXRvciQkZGVmYXVsdC5wcm90b3R5cGUpO1xuICAgICQkcnN2cCRhbGwkc2V0dGxlZCQkQWxsU2V0dGxlZC5wcm90b3R5cGUuX3N1cGVyQ29uc3RydWN0b3IgPSAkJGVudW1lcmF0b3IkJGRlZmF1bHQ7XG4gICAgJCRyc3ZwJGFsbCRzZXR0bGVkJCRBbGxTZXR0bGVkLnByb3RvdHlwZS5fbWFrZVJlc3VsdCA9ICQkZW51bWVyYXRvciQkbWFrZVNldHRsZWRSZXN1bHQ7XG5cbiAgICAkJHJzdnAkYWxsJHNldHRsZWQkJEFsbFNldHRsZWQucHJvdG90eXBlLl92YWxpZGF0aW9uRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRXJyb3IoJ2FsbFNldHRsZWQgbXVzdCBiZSBjYWxsZWQgd2l0aCBhbiBhcnJheScpO1xuICAgIH07XG5cbiAgICB2YXIgJCRyc3ZwJGFsbCRzZXR0bGVkJCRkZWZhdWx0ID0gZnVuY3Rpb24gYWxsU2V0dGxlZChlbnRyaWVzLCBsYWJlbCkge1xuICAgICAgcmV0dXJuIG5ldyAkJHJzdnAkYWxsJHNldHRsZWQkJEFsbFNldHRsZWQoJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQsIGVudHJpZXMsIGxhYmVsKS5wcm9taXNlO1xuICAgIH07XG5cbiAgICB2YXIgJCRyc3ZwJHJhY2UkJGRlZmF1bHQgPSBmdW5jdGlvbiByYWNlKGFycmF5LCBsYWJlbCkge1xuICAgICAgcmV0dXJuICQkcnN2cCRwcm9taXNlJCRkZWZhdWx0LnJhY2UoYXJyYXksIGxhYmVsKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gJCRwcm9taXNlJGhhc2gkJFByb21pc2VIYXNoKENvbnN0cnVjdG9yLCBvYmplY3QsIGxhYmVsKSB7XG4gICAgICB0aGlzLl9zdXBlckNvbnN0cnVjdG9yKENvbnN0cnVjdG9yLCBvYmplY3QsIHRydWUsIGxhYmVsKTtcbiAgICB9XG5cbiAgICB2YXIgJCRwcm9taXNlJGhhc2gkJGRlZmF1bHQgPSAkJHByb21pc2UkaGFzaCQkUHJvbWlzZUhhc2g7XG4gICAgJCRwcm9taXNlJGhhc2gkJFByb21pc2VIYXNoLnByb3RvdHlwZSA9ICQkdXRpbHMkJG9fY3JlYXRlKCQkZW51bWVyYXRvciQkZGVmYXVsdC5wcm90b3R5cGUpO1xuICAgICQkcHJvbWlzZSRoYXNoJCRQcm9taXNlSGFzaC5wcm90b3R5cGUuX3N1cGVyQ29uc3RydWN0b3IgPSAkJGVudW1lcmF0b3IkJGRlZmF1bHQ7XG5cbiAgICAkJHByb21pc2UkaGFzaCQkUHJvbWlzZUhhc2gucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9yZXN1bHQgPSB7fTtcbiAgICB9O1xuXG4gICAgJCRwcm9taXNlJGhhc2gkJFByb21pc2VIYXNoLnByb3RvdHlwZS5fdmFsaWRhdGVJbnB1dCA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICByZXR1cm4gaW5wdXQgJiYgdHlwZW9mIGlucHV0ID09PSAnb2JqZWN0JztcbiAgICB9O1xuXG4gICAgJCRwcm9taXNlJGhhc2gkJFByb21pc2VIYXNoLnByb3RvdHlwZS5fdmFsaWRhdGlvbkVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IEVycm9yKCdQcm9taXNlLmhhc2ggbXVzdCBiZSBjYWxsZWQgd2l0aCBhbiBvYmplY3QnKTtcbiAgICB9O1xuXG4gICAgJCRwcm9taXNlJGhhc2gkJFByb21pc2VIYXNoLnByb3RvdHlwZS5fZW51bWVyYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcHJvbWlzZSA9IHRoaXMucHJvbWlzZTtcbiAgICAgIHZhciBpbnB1dCAgID0gdGhpcy5faW5wdXQ7XG4gICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuXG4gICAgICBmb3IgKHZhciBrZXkgaW4gaW5wdXQpIHtcbiAgICAgICAgaWYgKHByb21pc2UuX3N0YXRlID09PSAkJCRpbnRlcm5hbCQkUEVORElORyAmJiBpbnB1dC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiBrZXksXG4gICAgICAgICAgICBlbnRyeTogaW5wdXRba2V5XVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBsZW5ndGggPSByZXN1bHRzLmxlbmd0aDtcbiAgICAgIHRoaXMuX3JlbWFpbmluZyA9IGxlbmd0aDtcbiAgICAgIHZhciByZXN1bHQ7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBwcm9taXNlLl9zdGF0ZSA9PT0gJCQkaW50ZXJuYWwkJFBFTkRJTkcgJiYgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdHNbaV07XG4gICAgICAgIHRoaXMuX2VhY2hFbnRyeShyZXN1bHQuZW50cnksIHJlc3VsdC5wb3NpdGlvbik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciAkJHJzdnAkaGFzaCQkZGVmYXVsdCA9IGZ1bmN0aW9uIGhhc2gob2JqZWN0LCBsYWJlbCkge1xuICAgICAgcmV0dXJuIG5ldyAkJHByb21pc2UkaGFzaCQkZGVmYXVsdCgkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdCwgb2JqZWN0LCBsYWJlbCkucHJvbWlzZTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJGhhc2gkc2V0dGxlZCQkSGFzaFNldHRsZWQoQ29uc3RydWN0b3IsIG9iamVjdCwgbGFiZWwpIHtcbiAgICAgIHRoaXMuX3N1cGVyQ29uc3RydWN0b3IoQ29uc3RydWN0b3IsIG9iamVjdCwgZmFsc2UsIGxhYmVsKTtcbiAgICB9XG5cbiAgICAkJHJzdnAkaGFzaCRzZXR0bGVkJCRIYXNoU2V0dGxlZC5wcm90b3R5cGUgPSAkJHV0aWxzJCRvX2NyZWF0ZSgkJHByb21pc2UkaGFzaCQkZGVmYXVsdC5wcm90b3R5cGUpO1xuICAgICQkcnN2cCRoYXNoJHNldHRsZWQkJEhhc2hTZXR0bGVkLnByb3RvdHlwZS5fc3VwZXJDb25zdHJ1Y3RvciA9ICQkZW51bWVyYXRvciQkZGVmYXVsdDtcbiAgICAkJHJzdnAkaGFzaCRzZXR0bGVkJCRIYXNoU2V0dGxlZC5wcm90b3R5cGUuX21ha2VSZXN1bHQgPSAkJGVudW1lcmF0b3IkJG1ha2VTZXR0bGVkUmVzdWx0O1xuXG4gICAgJCRyc3ZwJGhhc2gkc2V0dGxlZCQkSGFzaFNldHRsZWQucHJvdG90eXBlLl92YWxpZGF0aW9uRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRXJyb3IoJ2hhc2hTZXR0bGVkIG11c3QgYmUgY2FsbGVkIHdpdGggYW4gb2JqZWN0Jyk7XG4gICAgfTtcblxuICAgIHZhciAkJHJzdnAkaGFzaCRzZXR0bGVkJCRkZWZhdWx0ID0gZnVuY3Rpb24gaGFzaFNldHRsZWQob2JqZWN0LCBsYWJlbCkge1xuICAgICAgcmV0dXJuIG5ldyAkJHJzdnAkaGFzaCRzZXR0bGVkJCRIYXNoU2V0dGxlZCgkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdCwgb2JqZWN0LCBsYWJlbCkucHJvbWlzZTtcbiAgICB9O1xuXG4gICAgdmFyICQkcnN2cCRyZXRocm93JCRkZWZhdWx0ID0gZnVuY3Rpb24gcmV0aHJvdyhyZWFzb24pIHtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRocm93IHJlYXNvbjtcbiAgICAgIH0pO1xuICAgICAgdGhyb3cgcmVhc29uO1xuICAgIH07XG5cbiAgICB2YXIgJCRyc3ZwJGRlZmVyJCRkZWZhdWx0ID0gZnVuY3Rpb24gZGVmZXIobGFiZWwpIHtcbiAgICAgIHZhciBkZWZlcnJlZCA9IHsgfTtcblxuICAgICAgZGVmZXJyZWQucHJvbWlzZSA9IG5ldyAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdChmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdCA9IHJlamVjdDtcbiAgICAgIH0sIGxhYmVsKTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkO1xuICAgIH07XG5cbiAgICB2YXIgJCRyc3ZwJG1hcCQkZGVmYXVsdCA9IGZ1bmN0aW9uIG1hcChwcm9taXNlcywgbWFwRm4sIGxhYmVsKSB7XG4gICAgICByZXR1cm4gJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQuYWxsKHByb21pc2VzLCBsYWJlbCkudGhlbihmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgaWYgKCEkJHV0aWxzJCRpc0Z1bmN0aW9uKG1hcEZuKSkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJZb3UgbXVzdCBwYXNzIGEgZnVuY3Rpb24gYXMgbWFwJ3Mgc2Vjb25kIGFyZ3VtZW50LlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsZW5ndGggPSB2YWx1ZXMubGVuZ3RoO1xuICAgICAgICB2YXIgcmVzdWx0cyA9IG5ldyBBcnJheShsZW5ndGgpO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICByZXN1bHRzW2ldID0gbWFwRm4odmFsdWVzW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdC5hbGwocmVzdWx0cywgbGFiZWwpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHZhciAkJHJzdnAkcmVzb2x2ZSQkZGVmYXVsdCA9IGZ1bmN0aW9uIHJlc29sdmUodmFsdWUsIGxhYmVsKSB7XG4gICAgICByZXR1cm4gJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQucmVzb2x2ZSh2YWx1ZSwgbGFiZWwpO1xuICAgIH07XG5cbiAgICB2YXIgJCRyc3ZwJHJlamVjdCQkZGVmYXVsdCA9IGZ1bmN0aW9uIHJlamVjdChyZWFzb24sIGxhYmVsKSB7XG4gICAgICByZXR1cm4gJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQucmVqZWN0KHJlYXNvbiwgbGFiZWwpO1xuICAgIH07XG5cbiAgICB2YXIgJCRyc3ZwJGZpbHRlciQkZGVmYXVsdCA9IGZ1bmN0aW9uIGZpbHRlcihwcm9taXNlcywgZmlsdGVyRm4sIGxhYmVsKSB7XG4gICAgICByZXR1cm4gJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQuYWxsKHByb21pc2VzLCBsYWJlbCkudGhlbihmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgaWYgKCEkJHV0aWxzJCRpc0Z1bmN0aW9uKGZpbHRlckZuKSkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJZb3UgbXVzdCBwYXNzIGEgZnVuY3Rpb24gYXMgZmlsdGVyJ3Mgc2Vjb25kIGFyZ3VtZW50LlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsZW5ndGggPSB2YWx1ZXMubGVuZ3RoO1xuICAgICAgICB2YXIgZmlsdGVyZWQgPSBuZXcgQXJyYXkobGVuZ3RoKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgZmlsdGVyZWRbaV0gPSBmaWx0ZXJGbih2YWx1ZXNbaV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICQkcnN2cCRwcm9taXNlJCRkZWZhdWx0LmFsbChmaWx0ZXJlZCwgbGFiZWwpLnRoZW4oZnVuY3Rpb24oZmlsdGVyZWQpIHtcbiAgICAgICAgICB2YXIgcmVzdWx0cyA9IG5ldyBBcnJheShsZW5ndGgpO1xuICAgICAgICAgIHZhciBuZXdMZW5ndGggPSAwO1xuXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGZpbHRlcmVkW2ldKSB7XG4gICAgICAgICAgICAgIHJlc3VsdHNbbmV3TGVuZ3RoXSA9IHZhbHVlc1tpXTtcbiAgICAgICAgICAgICAgbmV3TGVuZ3RoKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVzdWx0cy5sZW5ndGggPSBuZXdMZW5ndGg7XG5cbiAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdmFyICQkcnN2cCRhc2FwJCRsZW4gPSAwO1xuXG4gICAgdmFyICQkcnN2cCRhc2FwJCRkZWZhdWx0ID0gZnVuY3Rpb24gYXNhcChjYWxsYmFjaywgYXJnKSB7XG4gICAgICAkJHJzdnAkYXNhcCQkcXVldWVbJCRyc3ZwJGFzYXAkJGxlbl0gPSBjYWxsYmFjaztcbiAgICAgICQkcnN2cCRhc2FwJCRxdWV1ZVskJHJzdnAkYXNhcCQkbGVuICsgMV0gPSBhcmc7XG4gICAgICAkJHJzdnAkYXNhcCQkbGVuICs9IDI7XG4gICAgICBpZiAoJCRyc3ZwJGFzYXAkJGxlbiA9PT0gMikge1xuICAgICAgICAvLyBJZiBsZW4gaXMgMSwgdGhhdCBtZWFucyB0aGF0IHdlIG5lZWQgdG8gc2NoZWR1bGUgYW4gYXN5bmMgZmx1c2guXG4gICAgICAgIC8vIElmIGFkZGl0aW9uYWwgY2FsbGJhY2tzIGFyZSBxdWV1ZWQgYmVmb3JlIHRoZSBxdWV1ZSBpcyBmbHVzaGVkLCB0aGV5XG4gICAgICAgIC8vIHdpbGwgYmUgcHJvY2Vzc2VkIGJ5IHRoaXMgZmx1c2ggdGhhdCB3ZSBhcmUgc2NoZWR1bGluZy5cbiAgICAgICAgJCRyc3ZwJGFzYXAkJHNjaGVkdWxlRmx1c2goKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyICQkcnN2cCRhc2FwJCRicm93c2VyR2xvYmFsID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSA/IHdpbmRvdyA6IHt9O1xuICAgIHZhciAkJHJzdnAkYXNhcCQkQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIgPSAkJHJzdnAkYXNhcCQkYnJvd3Nlckdsb2JhbC5NdXRhdGlvbk9ic2VydmVyIHx8ICQkcnN2cCRhc2FwJCRicm93c2VyR2xvYmFsLldlYktpdE11dGF0aW9uT2JzZXJ2ZXI7XG5cbiAgICAvLyB0ZXN0IGZvciB3ZWIgd29ya2VyIGJ1dCBub3QgaW4gSUUxMFxuICAgIHZhciAkJHJzdnAkYXNhcCQkaXNXb3JrZXIgPSB0eXBlb2YgVWludDhDbGFtcGVkQXJyYXkgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICB0eXBlb2YgaW1wb3J0U2NyaXB0cyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgIHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCc7XG5cbiAgICAvLyBub2RlXG4gICAgZnVuY3Rpb24gJCRyc3ZwJGFzYXAkJHVzZU5leHRUaWNrKCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKCQkcnN2cCRhc2FwJCRmbHVzaCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkcnN2cCRhc2FwJCR1c2VNdXRhdGlvbk9ic2VydmVyKCkge1xuICAgICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgICAgdmFyIG9ic2VydmVyID0gbmV3ICQkcnN2cCRhc2FwJCRCcm93c2VyTXV0YXRpb25PYnNlcnZlcigkJHJzdnAkYXNhcCQkZmx1c2gpO1xuICAgICAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG4gICAgICBvYnNlcnZlci5vYnNlcnZlKG5vZGUsIHsgY2hhcmFjdGVyRGF0YTogdHJ1ZSB9KTtcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBub2RlLmRhdGEgPSAoaXRlcmF0aW9ucyA9ICsraXRlcmF0aW9ucyAlIDIpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyB3ZWIgd29ya2VyXG4gICAgZnVuY3Rpb24gJCRyc3ZwJGFzYXAkJHVzZU1lc3NhZ2VDaGFubmVsKCkge1xuICAgICAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gJCRyc3ZwJGFzYXAkJGZsdXNoO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2hhbm5lbC5wb3J0Mi5wb3N0TWVzc2FnZSgwKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJGFzYXAkJHVzZVNldFRpbWVvdXQoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNldFRpbWVvdXQoJCRyc3ZwJGFzYXAkJGZsdXNoLCAxKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyICQkcnN2cCRhc2FwJCRxdWV1ZSA9IG5ldyBBcnJheSgxMDAwKTtcblxuICAgIGZ1bmN0aW9uICQkcnN2cCRhc2FwJCRmbHVzaCgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJCRyc3ZwJGFzYXAkJGxlbjsgaSs9Mikge1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSAkJHJzdnAkYXNhcCQkcXVldWVbaV07XG4gICAgICAgIHZhciBhcmcgPSAkJHJzdnAkYXNhcCQkcXVldWVbaSsxXTtcblxuICAgICAgICBjYWxsYmFjayhhcmcpO1xuXG4gICAgICAgICQkcnN2cCRhc2FwJCRxdWV1ZVtpXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgJCRyc3ZwJGFzYXAkJHF1ZXVlW2krMV0gPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgICQkcnN2cCRhc2FwJCRsZW4gPSAwO1xuICAgIH1cblxuICAgIHZhciAkJHJzdnAkYXNhcCQkc2NoZWR1bGVGbHVzaDtcblxuICAgIC8vIERlY2lkZSB3aGF0IGFzeW5jIG1ldGhvZCB0byB1c2UgdG8gdHJpZ2dlcmluZyBwcm9jZXNzaW5nIG9mIHF1ZXVlZCBjYWxsYmFja3M6XG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiB7fS50b1N0cmluZy5jYWxsKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXScpIHtcbiAgICAgICQkcnN2cCRhc2FwJCRzY2hlZHVsZUZsdXNoID0gJCRyc3ZwJGFzYXAkJHVzZU5leHRUaWNrKCk7XG4gICAgfSBlbHNlIGlmICgkJHJzdnAkYXNhcCQkQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgICQkcnN2cCRhc2FwJCRzY2hlZHVsZUZsdXNoID0gJCRyc3ZwJGFzYXAkJHVzZU11dGF0aW9uT2JzZXJ2ZXIoKTtcbiAgICB9IGVsc2UgaWYgKCQkcnN2cCRhc2FwJCRpc1dvcmtlcikge1xuICAgICAgJCRyc3ZwJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSAkJHJzdnAkYXNhcCQkdXNlTWVzc2FnZUNoYW5uZWwoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJCRyc3ZwJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSAkJHJzdnAkYXNhcCQkdXNlU2V0VGltZW91dCgpO1xuICAgIH1cblxuICAgIC8vIGRlZmF1bHQgYXN5bmMgaXMgYXNhcDtcbiAgICAkJHJzdnAkY29uZmlnJCRjb25maWcuYXN5bmMgPSAkJHJzdnAkYXNhcCQkZGVmYXVsdDtcblxuICAgIHZhciAkJHJzdnAkJGNhc3QgPSAkJHJzdnAkcmVzb2x2ZSQkZGVmYXVsdDtcblxuICAgIGZ1bmN0aW9uICQkcnN2cCQkYXN5bmMoY2FsbGJhY2ssIGFyZykge1xuICAgICAgJCRyc3ZwJGNvbmZpZyQkY29uZmlnLmFzeW5jKGNhbGxiYWNrLCBhcmcpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkcnN2cCQkb24oKSB7XG4gICAgICAkJHJzdnAkY29uZmlnJCRjb25maWcub24uYXBwbHkoJCRyc3ZwJGNvbmZpZyQkY29uZmlnLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkcnN2cCQkb2ZmKCkge1xuICAgICAgJCRyc3ZwJGNvbmZpZyQkY29uZmlnLm9mZi5hcHBseSgkJHJzdnAkY29uZmlnJCRjb25maWcsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgLy8gU2V0IHVwIGluc3RydW1lbnRhdGlvbiB0aHJvdWdoIGB3aW5kb3cuX19QUk9NSVNFX0lOVFJVTUVOVEFUSU9OX19gXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiB3aW5kb3dbJ19fUFJPTUlTRV9JTlNUUlVNRU5UQVRJT05fXyddID09PSAnb2JqZWN0Jykge1xuICAgICAgdmFyICQkcnN2cCQkY2FsbGJhY2tzID0gd2luZG93WydfX1BST01JU0VfSU5TVFJVTUVOVEFUSU9OX18nXTtcbiAgICAgICQkcnN2cCRjb25maWckJGNvbmZpZ3VyZSgnaW5zdHJ1bWVudCcsIHRydWUpO1xuICAgICAgZm9yICh2YXIgJCRyc3ZwJCRldmVudE5hbWUgaW4gJCRyc3ZwJCRjYWxsYmFja3MpIHtcbiAgICAgICAgaWYgKCQkcnN2cCQkY2FsbGJhY2tzLmhhc093blByb3BlcnR5KCQkcnN2cCQkZXZlbnROYW1lKSkge1xuICAgICAgICAgICQkcnN2cCQkb24oJCRyc3ZwJCRldmVudE5hbWUsICQkcnN2cCQkY2FsbGJhY2tzWyQkcnN2cCQkZXZlbnROYW1lXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcnN2cCR1bWQkJFJTVlAgPSB7XG4gICAgICAncmFjZSc6ICQkcnN2cCRyYWNlJCRkZWZhdWx0LFxuICAgICAgJ1Byb21pc2UnOiAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdCxcbiAgICAgICdhbGxTZXR0bGVkJzogJCRyc3ZwJGFsbCRzZXR0bGVkJCRkZWZhdWx0LFxuICAgICAgJ2hhc2gnOiAkJHJzdnAkaGFzaCQkZGVmYXVsdCxcbiAgICAgICdoYXNoU2V0dGxlZCc6ICQkcnN2cCRoYXNoJHNldHRsZWQkJGRlZmF1bHQsXG4gICAgICAnZGVub2RlaWZ5JzogJCRyc3ZwJG5vZGUkJGRlZmF1bHQsXG4gICAgICAnb24nOiAkJHJzdnAkJG9uLFxuICAgICAgJ29mZic6ICQkcnN2cCQkb2ZmLFxuICAgICAgJ21hcCc6ICQkcnN2cCRtYXAkJGRlZmF1bHQsXG4gICAgICAnZmlsdGVyJzogJCRyc3ZwJGZpbHRlciQkZGVmYXVsdCxcbiAgICAgICdyZXNvbHZlJzogJCRyc3ZwJHJlc29sdmUkJGRlZmF1bHQsXG4gICAgICAncmVqZWN0JzogJCRyc3ZwJHJlamVjdCQkZGVmYXVsdCxcbiAgICAgICdhbGwnOiAkJHJzdnAkYWxsJCRkZWZhdWx0LFxuICAgICAgJ3JldGhyb3cnOiAkJHJzdnAkcmV0aHJvdyQkZGVmYXVsdCxcbiAgICAgICdkZWZlcic6ICQkcnN2cCRkZWZlciQkZGVmYXVsdCxcbiAgICAgICdFdmVudFRhcmdldCc6ICQkcnN2cCRldmVudHMkJGRlZmF1bHQsXG4gICAgICAnY29uZmlndXJlJzogJCRyc3ZwJGNvbmZpZyQkY29uZmlndXJlLFxuICAgICAgJ2FzeW5jJzogJCRyc3ZwJCRhc3luY1xuICAgIH07XG5cbiAgICAvKiBnbG9iYWwgZGVmaW5lOnRydWUgbW9kdWxlOnRydWUgd2luZG93OiB0cnVlICovXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gcnN2cCR1bWQkJFJTVlA7IH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgIG1vZHVsZS5leHBvcnRzID0gcnN2cCR1bWQkJFJTVlA7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXNbJ1JTVlAnXSA9IHJzdnAkdW1kJCRSU1ZQO1xuICAgIH1cbn0pLmNhbGwodGhpcyk7IiwidmFyIHJlc29sdmUgPSByZXF1aXJlKCdzb3VuZGNsb3VkLXJlc29sdmUnKVxudmFyIGZvbnRzID0gcmVxdWlyZSgnZ29vZ2xlLWZvbnRzJylcbnZhciBtaW5zdGFjaGUgPSByZXF1aXJlKCdtaW5zdGFjaGUnKVxudmFyIGluc2VydCA9IHJlcXVpcmUoJ2luc2VydC1jc3MnKVxudmFyIGZzID0gcmVxdWlyZSgnZnMnKVxuXG52YXIgaWNvbnMgPSB7XG4gICAgYmxhY2s6ICdodHRwOi8vZGV2ZWxvcGVycy5zb3VuZGNsb3VkLmNvbS9hc3NldHMvbG9nb19ibGFjay5wbmcnXG4gICwgd2hpdGU6ICdodHRwOi8vZGV2ZWxvcGVycy5zb3VuZGNsb3VkLmNvbS9hc3NldHMvbG9nb193aGl0ZS5wbmcnXG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFkZ2VcbmZ1bmN0aW9uIG5vb3AoZXJyKXsgaWYgKGVycikgdGhyb3cgZXJyIH1cblxudmFyIGluc2VydGVkID0gZmFsc2VcbnZhciBnd2ZhZGRlZCA9IGZhbHNlXG52YXIgdGVtcGxhdGUgPSBudWxsXG5cbmZ1bmN0aW9uIGJhZGdlKG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gIGlmICghaW5zZXJ0ZWQpIGluc2VydChcIi5ucG0tc2NiLXdyYXAge1xcbiAgZm9udC1mYW1pbHk6ICdPcGVuIFNhbnMnLCAnSGVsdmV0aWNhIE5ldWUnLCBIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmO1xcbiAgZm9udC13ZWlnaHQ6IDIwMDtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG4gIGxlZnQ6IDA7XFxuICB6LWluZGV4OiA5OTk7XFxufVxcblxcbi5ucG0tc2NiLXdyYXAgYSB7XFxuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICBjb2xvcjogIzAwMDtcXG59XFxuLm5wbS1zY2Itd2hpdGVcXG4ubnBtLXNjYi13cmFwIGEge1xcbiAgY29sb3I6ICNmZmY7XFxufVxcblxcbi5ucG0tc2NiLWlubmVyIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogLTEyMHB4OyBsZWZ0OiAwO1xcbiAgcGFkZGluZzogOHB4O1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDE1MHB4O1xcbiAgei1pbmRleDogMjtcXG4gIC13ZWJraXQtdHJhbnNpdGlvbjogd2lkdGggMC41cyBjdWJpYy1iZXppZXIoMSwgMCwgMCwgMSksIHRvcCAwLjVzO1xcbiAgICAgLW1vei10cmFuc2l0aW9uOiB3aWR0aCAwLjVzIGN1YmljLWJlemllcigxLCAwLCAwLCAxKSwgdG9wIDAuNXM7XFxuICAgICAgLW1zLXRyYW5zaXRpb246IHdpZHRoIDAuNXMgY3ViaWMtYmV6aWVyKDEsIDAsIDAsIDEpLCB0b3AgMC41cztcXG4gICAgICAgLW8tdHJhbnNpdGlvbjogd2lkdGggMC41cyBjdWJpYy1iZXppZXIoMSwgMCwgMCwgMSksIHRvcCAwLjVzO1xcbiAgICAgICAgICB0cmFuc2l0aW9uOiB3aWR0aCAwLjVzIGN1YmljLWJlemllcigxLCAwLCAwLCAxKSwgdG9wIDAuNXM7XFxufVxcbi5ucG0tc2NiLXdyYXA6aG92ZXJcXG4ubnBtLXNjYi1pbm5lciB7XFxuICB0b3A6IDA7XFxufVxcblxcbi5ucG0tc2NiLWFydHdvcmsge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAxNnB4OyBsZWZ0OiAxNnB4O1xcbiAgd2lkdGg6IDEwNHB4OyBoZWlnaHQ6IDEwNHB4O1xcbiAgYm94LXNoYWRvdzogMCAwIDhweCAtM3B4ICMwMDA7XFxuICBvdXRsaW5lOiAxcHggc29saWQgcmdiYSgwLDAsMCwwLjEpO1xcbiAgei1pbmRleDogMjtcXG59XFxuLm5wbS1zY2Itd2hpdGVcXG4ubnBtLXNjYi1hcnR3b3JrIHtcXG4gIG91dGxpbmU6IDFweCBzb2xpZCByZ2JhKDI1NSwyNTUsMjU1LDAuMSk7XFxuICBib3gtc2hhZG93OiAwIDAgMTBweCAtMnB4IHJnYmEoMjU1LDI1NSwyNTUsMC45KTtcXG59XFxuXFxuLm5wbS1zY2ItaW5mbyB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDE2cHg7XFxuICBsZWZ0OiAxMjBweDtcXG4gIHdpZHRoOiAzMDBweDtcXG4gIHotaW5kZXg6IDE7XFxufVxcblxcbi5ucG0tc2NiLWluZm8gPiBhIHtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbn1cXG5cXG4ubnBtLXNjYi1ub3ctcGxheWluZyB7XFxuICBmb250LXNpemU6IDEycHg7XFxuICBsaW5lLWhlaWdodDogMTJweDtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHdpZHRoOiA1MDBweDtcXG4gIHotaW5kZXg6IDE7XFxuICBwYWRkaW5nOiAxNXB4IDA7XFxuICB0b3A6IDA7IGxlZnQ6IDEzOHB4O1xcbiAgb3BhY2l0eTogMTtcXG4gIC13ZWJraXQtdHJhbnNpdGlvbjogb3BhY2l0eSAwLjI1cztcXG4gICAgIC1tb3otdHJhbnNpdGlvbjogb3BhY2l0eSAwLjI1cztcXG4gICAgICAtbXMtdHJhbnNpdGlvbjogb3BhY2l0eSAwLjI1cztcXG4gICAgICAgLW8tdHJhbnNpdGlvbjogb3BhY2l0eSAwLjI1cztcXG4gICAgICAgICAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjI1cztcXG59XFxuXFxuLm5wbS1zY2Itd3JhcDpob3Zlclxcbi5ucG0tc2NiLW5vdy1wbGF5aW5nIHtcXG4gIG9wYWNpdHk6IDA7XFxufVxcblxcbi5ucG0tc2NiLXdoaXRlXFxuLm5wbS1zY2Itbm93LXBsYXlpbmcge1xcbiAgY29sb3I6ICNmZmY7XFxufVxcbi5ucG0tc2NiLW5vdy1wbGF5aW5nID4gYSB7XFxuICBmb250LXdlaWdodDogYm9sZDtcXG59XFxuXFxuLm5wbS1zY2ItaW5mbyA+IGEgPiBwIHtcXG4gIG1hcmdpbjogMDtcXG4gIHBhZGRpbmctYm90dG9tOiAwLjI1ZW07XFxuICBsaW5lLWhlaWdodDogMS4zNWVtO1xcbiAgbWFyZ2luLWxlZnQ6IDFlbTtcXG4gIGZvbnQtc2l6ZTogMWVtO1xcbn1cXG5cXG4ubnBtLXNjYi10aXRsZSB7XFxuICBmb250LXdlaWdodDogYm9sZDtcXG59XFxuXFxuLm5wbS1zY2ItaWNvbiB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDEyMHB4O1xcbiAgcGFkZGluZy10b3A6IDAuNzVlbTtcXG4gIGxlZnQ6IDE2cHg7XFxufVxcblwiKSwgaW5zZXJ0ZWQgPSB0cnVlXG4gIGlmICghdGVtcGxhdGUpIHRlbXBsYXRlID0gbWluc3RhY2hlLmNvbXBpbGUoXCI8ZGl2IGNsYXNzPVxcXCJucG0tc2NiLXdyYXBcXFwiPlxcbiAgPGRpdiBjbGFzcz1cXFwibnBtLXNjYi1pbm5lclxcXCI+XFxuICAgIDxhIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBocmVmPVxcXCJ7e3VybHMuc29uZ319XFxcIj5cXG4gICAgICA8aW1nIGNsYXNzPVxcXCJucG0tc2NiLWljb25cXFwiIHNyYz1cXFwie3tpY29ufX1cXFwiPlxcbiAgICAgIDxpbWcgY2xhc3M9XFxcIm5wbS1zY2ItYXJ0d29ya1xcXCIgc3JjPVxcXCJ7e2FydHdvcmt9fVxcXCI+XFxuICAgIDwvYT5cXG4gICAgPGRpdiBjbGFzcz1cXFwibnBtLXNjYi1pbmZvXFxcIj5cXG4gICAgICA8YSB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj1cXFwie3t1cmxzLnNvbmd9fVxcXCI+XFxuICAgICAgICA8cCBjbGFzcz1cXFwibnBtLXNjYi10aXRsZVxcXCI+e3t0aXRsZX19PC9wPlxcbiAgICAgIDwvYT5cXG4gICAgICA8YSB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj1cXFwie3t1cmxzLmFydGlzdH19XFxcIj5cXG4gICAgICAgIDxwIGNsYXNzPVxcXCJucG0tc2NiLWFydGlzdFxcXCI+e3thcnRpc3R9fTwvcD5cXG4gICAgICA8L2E+XFxuICAgIDwvZGl2PlxcbiAgPC9kaXY+XFxuICA8ZGl2IGNsYXNzPVxcXCJucG0tc2NiLW5vdy1wbGF5aW5nXFxcIj5cXG4gICAgTm93IFBsYXlpbmc6XFxuICAgIDxhIGhyZWY9XFxcInt7dXJscy5zb25nfX1cXFwiPnt7dGl0bGV9fTwvYT5cXG4gICAgYnlcXG4gICAgPGEgaHJlZj1cXFwie3t1cmxzLmFydGlzdH19XFxcIj57e2FydGlzdH19PC9hPlxcbiAgPC9kaXY+XFxuPC9kaXY+XFxuXCIpXG5cbiAgaWYgKCFnd2ZhZGRlZCAmJiBvcHRpb25zLmdldEZvbnRzKSB7XG4gICAgZm9udHMuYWRkKHsgJ09wZW4gU2Fucyc6IFszMDAsIDYwMF0gfSlcbiAgICBnd2ZhZGRlZCA9IHRydWVcbiAgfVxuXG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcFxuXG4gIHZhciBkaXYgICA9IG9wdGlvbnMuZWwgfHwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgdmFyIGljb24gID0gISgnZGFyaycgaW4gb3B0aW9ucykgfHwgb3B0aW9ucy5kYXJrID8gJ2JsYWNrJyA6ICd3aGl0ZSdcbiAgdmFyIGlkICAgID0gb3B0aW9ucy5jbGllbnRfaWRcbiAgdmFyIHNvbmcgID0gb3B0aW9ucy5zb25nXG5cbiAgcmVzb2x2ZShpZCwgc29uZywgZnVuY3Rpb24oZXJyLCBqc29uKSB7XG4gICAgaWYgKGVycikgcmV0dXJuIGNhbGxiYWNrKGVycilcbiAgICBpZiAoanNvbi5raW5kICE9PSAndHJhY2snKSB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnc291bmRjbG91ZC1iYWRnZSBvbmx5IHN1cHBvcnRzIGluZGl2aWR1YWwgdHJhY2tzIGF0IHRoZSBtb21lbnQnXG4gICAgKVxuXG4gICAgZGl2LmNsYXNzTGlzdFtcbiAgICAgIGljb24gPT09ICdibGFjaycgPyAncmVtb3ZlJyA6ICdhZGQnXG4gICAgXSgnbnBtLXNjYi13aGl0ZScpXG5cbiAgICBkaXYuaW5uZXJIVE1MID0gdGVtcGxhdGUoe1xuICAgICAgICBhcnR3b3JrOiBqc29uLmFydHdvcmtfdXJsIHx8IGpzb24udXNlci5hdmF0YXJfdXJsXG4gICAgICAsIGFydGlzdDoganNvbi51c2VyLnVzZXJuYW1lXG4gICAgICAsIHRpdGxlOiBqc29uLnRpdGxlXG4gICAgICAsIGljb246IGljb25zW2ljb25dXG4gICAgICAsIHVybHM6IHtcbiAgICAgICAgICBzb25nOiBqc29uLnBlcm1hbGlua191cmxcbiAgICAgICAgLCBhcnRpc3Q6IGpzb24udXNlci5wZXJtYWxpbmtfdXJsXG4gICAgICB9XG4gICAgfSlcblxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGl2KVxuXG4gICAgY2FsbGJhY2sobnVsbCwganNvbi5zdHJlYW1fdXJsICsgJz9jbGllbnRfaWQ9JyArIGlkLCBqc29uLCBkaXYpXG4gIH0pXG5cbiAgcmV0dXJuIGRpdlxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBhc1N0cmluZ1xubW9kdWxlLmV4cG9ydHMuYWRkID0gYXBwZW5kXG5cbmZ1bmN0aW9uIGFzU3RyaW5nKGZvbnRzKSB7XG4gIHZhciBocmVmID0gZ2V0SHJlZihmb250cylcbiAgcmV0dXJuICc8bGluayBocmVmPVwiJyArIGhyZWYgKyAnXCIgcmVsPVwic3R5bGVzaGVldFwiIHR5cGU9XCJ0ZXh0L2Nzc1wiPidcbn1cblxuZnVuY3Rpb24gYXNFbGVtZW50KGZvbnRzKSB7XG4gIHZhciBocmVmID0gZ2V0SHJlZihmb250cylcbiAgdmFyIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJylcbiAgbGluay5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKVxuICBsaW5rLnNldEF0dHJpYnV0ZSgncmVsJywgJ3N0eWxlc2hlZXQnKVxuICBsaW5rLnNldEF0dHJpYnV0ZSgndHlwZScsICd0ZXh0L2NzcycpXG4gIHJldHVybiBsaW5rXG59XG5cbmZ1bmN0aW9uIGdldEhyZWYoZm9udHMpIHtcbiAgdmFyIGZhbWlseSA9IE9iamVjdC5rZXlzKGZvbnRzKS5tYXAoZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBkZXRhaWxzID0gZm9udHNbbmFtZV1cbiAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC9cXHMrLywgJysnKVxuICAgIHJldHVybiB0eXBlb2YgZGV0YWlscyA9PT0gJ2Jvb2xlYW4nXG4gICAgICA/IG5hbWVcbiAgICAgIDogbmFtZSArICc6JyArIG1ha2VBcnJheShkZXRhaWxzKS5qb2luKCcsJylcbiAgfSkuam9pbignfCcpXG5cbiAgcmV0dXJuICdodHRwOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzP2ZhbWlseT0nICsgZmFtaWx5XG59XG5cbmZ1bmN0aW9uIGFwcGVuZChmb250cykge1xuICB2YXIgbGluayA9IGFzRWxlbWVudChmb250cylcbiAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChsaW5rKVxuICByZXR1cm4gbGlua1xufVxuXG5mdW5jdGlvbiBtYWtlQXJyYXkoYXJyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFycikgPyBhcnIgOiBbYXJyXVxufVxuIiwidmFyIGluc2VydGVkID0gW107XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzcykge1xuICAgIGlmIChpbnNlcnRlZC5pbmRleE9mKGNzcykgPj0gMCkgcmV0dXJuO1xuICAgIGluc2VydGVkLnB1c2goY3NzKTtcbiAgICBcbiAgICB2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgdmFyIHRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpO1xuICAgIGVsZW0uYXBwZW5kQ2hpbGQodGV4dCk7XG4gICAgXG4gICAgaWYgKGRvY3VtZW50LmhlYWQuY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgZG9jdW1lbnQuaGVhZC5pbnNlcnRCZWZvcmUoZWxlbSwgZG9jdW1lbnQuaGVhZC5jaGlsZE5vZGVzWzBdKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoZWxlbSk7XG4gICAgfVxufTtcbiIsIlxuLyoqXG4gKiBFeHBvc2UgYHJlbmRlcigpYC5gXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVuZGVyO1xuXG4vKipcbiAqIEV4cG9zZSBgY29tcGlsZSgpYC5cbiAqL1xuXG5leHBvcnRzLmNvbXBpbGUgPSBjb21waWxlO1xuXG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gbXVzdGFjaGUgYHN0cmAgd2l0aCBgb2JqYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHJlbmRlcihzdHIsIG9iaikge1xuICBvYmogPSBvYmogfHwge307XG4gIHZhciBmbiA9IGNvbXBpbGUoc3RyKTtcbiAgcmV0dXJuIGZuKG9iaik7XG59XG5cbi8qKlxuICogQ29tcGlsZSB0aGUgZ2l2ZW4gYHN0cmAgdG8gYSBgRnVuY3Rpb25gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBjb21waWxlKHN0cikge1xuICB2YXIganMgPSBbXTtcbiAgdmFyIHRva3MgPSBwYXJzZShzdHIpO1xuICB2YXIgdG9rO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdG9rcy5sZW5ndGg7ICsraSkge1xuICAgIHRvayA9IHRva3NbaV07XG4gICAgaWYgKGkgJSAyID09IDApIHtcbiAgICAgIGpzLnB1c2goJ1wiJyArIHRvay5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJykgKyAnXCInKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3dpdGNoICh0b2tbMF0pIHtcbiAgICAgICAgY2FzZSAnLyc6XG4gICAgICAgICAgdG9rID0gdG9rLnNsaWNlKDEpO1xuICAgICAgICAgIGpzLnB1c2goJykgKyAnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnXic6XG4gICAgICAgICAgdG9rID0gdG9rLnNsaWNlKDEpO1xuICAgICAgICAgIGFzc2VydFByb3BlcnR5KHRvayk7XG4gICAgICAgICAganMucHVzaCgnICsgc2VjdGlvbihvYmosIFwiJyArIHRvayArICdcIiwgdHJ1ZSwgJyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJyMnOlxuICAgICAgICAgIHRvayA9IHRvay5zbGljZSgxKTtcbiAgICAgICAgICBhc3NlcnRQcm9wZXJ0eSh0b2spO1xuICAgICAgICAgIGpzLnB1c2goJyArIHNlY3Rpb24ob2JqLCBcIicgKyB0b2sgKyAnXCIsIGZhbHNlLCAnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnISc6XG4gICAgICAgICAgdG9rID0gdG9rLnNsaWNlKDEpO1xuICAgICAgICAgIGFzc2VydFByb3BlcnR5KHRvayk7XG4gICAgICAgICAganMucHVzaCgnICsgb2JqLicgKyB0b2sgKyAnICsgJyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgYXNzZXJ0UHJvcGVydHkodG9rKTtcbiAgICAgICAgICBqcy5wdXNoKCcgKyBlc2NhcGUob2JqLicgKyB0b2sgKyAnKSArICcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGpzID0gJ1xcbidcbiAgICArIGluZGVudChlc2NhcGUudG9TdHJpbmcoKSkgKyAnO1xcblxcbidcbiAgICArIGluZGVudChzZWN0aW9uLnRvU3RyaW5nKCkpICsgJztcXG5cXG4nXG4gICAgKyAnICByZXR1cm4gJyArIGpzLmpvaW4oJycpLnJlcGxhY2UoL1xcbi9nLCAnXFxcXG4nKTtcblxuICByZXR1cm4gbmV3IEZ1bmN0aW9uKCdvYmonLCBqcyk7XG59XG5cbi8qKlxuICogQXNzZXJ0IHRoYXQgYHByb3BgIGlzIGEgdmFsaWQgcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGFzc2VydFByb3BlcnR5KHByb3ApIHtcbiAgaWYgKCFwcm9wLm1hdGNoKC9eW1xcdy5dKyQvKSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHByb3BlcnR5IFwiJyArIHByb3AgKyAnXCInKTtcbn1cblxuLyoqXG4gKiBQYXJzZSBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlKHN0cikge1xuICByZXR1cm4gc3RyLnNwbGl0KC9cXHtcXHt8XFx9XFx9Lyk7XG59XG5cbi8qKlxuICogSW5kZW50IGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGluZGVudChzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eL2dtLCAnICAnKTtcbn1cblxuLyoqXG4gKiBTZWN0aW9uIGhhbmRsZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgb2JqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtCb29sZWFufSBuZWdhdGVcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNlY3Rpb24ob2JqLCBwcm9wLCBuZWdhdGUsIHN0cikge1xuICB2YXIgdmFsID0gb2JqW3Byb3BdO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgdmFsKSByZXR1cm4gdmFsLmNhbGwob2JqLCBzdHIpO1xuICBpZiAobmVnYXRlKSB2YWwgPSAhdmFsO1xuICBpZiAodmFsKSByZXR1cm4gc3RyO1xuICByZXR1cm4gJyc7XG59XG5cbi8qKlxuICogRXNjYXBlIHRoZSBnaXZlbiBgaHRtbGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGh0bWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGVzY2FwZShodG1sKSB7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKTtcbn1cbiIsInZhciBxcyAgPSByZXF1aXJlKCdxdWVyeXN0cmluZycpXG52YXIgeGhyID0gcmVxdWlyZSgneGhyJylcblxubW9kdWxlLmV4cG9ydHMgPSByZXNvbHZlXG5cbmZ1bmN0aW9uIHJlc29sdmUoaWQsIGdvYWwsIGNhbGxiYWNrKSB7XG4gIHZhciB1cmkgPSAnaHR0cDovL2FwaS5zb3VuZGNsb3VkLmNvbS9yZXNvbHZlLmpzb24/JyArIHFzLnN0cmluZ2lmeSh7XG4gICAgICB1cmw6IGdvYWxcbiAgICAsIGNsaWVudF9pZDogaWRcbiAgfSlcblxuICB4aHIoe1xuICAgICAgdXJpOiB1cmlcbiAgICAsIG1ldGhvZDogJ0dFVCdcbiAgfSwgZnVuY3Rpb24oZXJyLCByZXMsIGJvZHkpIHtcbiAgICBpZiAoZXJyKSByZXR1cm4gY2FsbGJhY2soZXJyKVxuICAgIHRyeSB7XG4gICAgICBib2R5ID0gSlNPTi5wYXJzZShib2R5KVxuICAgIH0gY2F0Y2goZSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGUpXG4gICAgfVxuICAgIGlmIChib2R5LmVycm9ycykgcmV0dXJuIGNhbGxiYWNrKG5ldyBFcnJvcihcbiAgICAgIGJvZHkuZXJyb3JzWzBdLmVycm9yX21lc3NhZ2VcbiAgICApKVxuICAgIHJldHVybiBjYWxsYmFjayhudWxsLCBib2R5KVxuICB9KVxufVxuIiwidmFyIHdpbmRvdyA9IHJlcXVpcmUoXCJnbG9iYWwvd2luZG93XCIpXG52YXIgb25jZSA9IHJlcXVpcmUoXCJvbmNlXCIpXG5cbnZhciBtZXNzYWdlcyA9IHtcbiAgICBcIjBcIjogXCJJbnRlcm5hbCBYTUxIdHRwUmVxdWVzdCBFcnJvclwiLFxuICAgIFwiNFwiOiBcIjR4eCBDbGllbnQgRXJyb3JcIixcbiAgICBcIjVcIjogXCI1eHggU2VydmVyIEVycm9yXCJcbn1cblxudmFyIFhIUiA9IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCB8fCBub29wXG52YXIgWERSID0gXCJ3aXRoQ3JlZGVudGlhbHNcIiBpbiAobmV3IFhIUigpKSA/XG4gICAgICAgIHdpbmRvdy5YTUxIdHRwUmVxdWVzdCA6IHdpbmRvdy5YRG9tYWluUmVxdWVzdFxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZVhIUlxuXG5mdW5jdGlvbiBjcmVhdGVYSFIob3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgb3B0aW9ucyA9IHsgdXJpOiBvcHRpb25zIH1cbiAgICB9XG5cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIGNhbGxiYWNrID0gb25jZShjYWxsYmFjaylcblxuICAgIHZhciB4aHJcblxuICAgIGlmIChvcHRpb25zLmNvcnMpIHtcbiAgICAgICAgeGhyID0gbmV3IFhEUigpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgeGhyID0gbmV3IFhIUigpXG4gICAgfVxuXG4gICAgdmFyIHVyaSA9IHhoci51cmwgPSBvcHRpb25zLnVyaVxuICAgIHZhciBtZXRob2QgPSB4aHIubWV0aG9kID0gb3B0aW9ucy5tZXRob2QgfHwgXCJHRVRcIlxuICAgIHZhciBib2R5ID0gb3B0aW9ucy5ib2R5IHx8IG9wdGlvbnMuZGF0YVxuICAgIHZhciBoZWFkZXJzID0geGhyLmhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnMgfHwge31cbiAgICB2YXIgaXNKc29uID0gZmFsc2VcblxuICAgIGlmIChcImpzb25cIiBpbiBvcHRpb25zKSB7XG4gICAgICAgIGlzSnNvbiA9IHRydWVcbiAgICAgICAgaGVhZGVyc1tcIkNvbnRlbnQtVHlwZVwiXSA9IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeShvcHRpb25zLmpzb24pXG4gICAgfVxuXG4gICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IHJlYWR5c3RhdGVjaGFuZ2VcbiAgICB4aHIub25sb2FkID0gbG9hZFxuICAgIHhoci5vbmVycm9yID0gZXJyb3JcbiAgICAvLyBJRTkgbXVzdCBoYXZlIG9ucHJvZ3Jlc3MgYmUgc2V0IHRvIGEgdW5pcXVlIGZ1bmN0aW9uLlxuICAgIHhoci5vbnByb2dyZXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBJRSBtdXN0IGRpZVxuICAgIH1cbiAgICAvLyBoYXRlIElFXG4gICAgeGhyLm9udGltZW91dCA9IG5vb3BcbiAgICB4aHIub3BlbihtZXRob2QsIHVyaSlcbiAgICBpZiAob3B0aW9ucy5jb3JzKSB7XG4gICAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlXG4gICAgfVxuICAgIHhoci50aW1lb3V0ID0gXCJ0aW1lb3V0XCIgaW4gb3B0aW9ucyA/IG9wdGlvbnMudGltZW91dCA6IDUwMDBcblxuICAgIGlmICggeGhyLnNldFJlcXVlc3RIZWFkZXIpIHtcbiAgICAgICAgT2JqZWN0LmtleXMoaGVhZGVycykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihrZXksIGhlYWRlcnNba2V5XSlcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICB4aHIuc2VuZChib2R5KVxuXG4gICAgcmV0dXJuIHhoclxuXG4gICAgZnVuY3Rpb24gcmVhZHlzdGF0ZWNoYW5nZSgpIHtcbiAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICBsb2FkKClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxvYWQoKSB7XG4gICAgICAgIHZhciBlcnJvciA9IG51bGxcbiAgICAgICAgdmFyIHN0YXR1cyA9IHhoci5zdGF0dXNDb2RlID0geGhyLnN0YXR1c1xuICAgICAgICB2YXIgYm9keSA9IHhoci5ib2R5ID0geGhyLnJlc3BvbnNlIHx8XG4gICAgICAgICAgICB4aHIucmVzcG9uc2VUZXh0IHx8IHhoci5yZXNwb25zZVhNTFxuXG4gICAgICAgIGlmIChzdGF0dXMgPT09IDAgfHwgKHN0YXR1cyA+PSA0MDAgJiYgc3RhdHVzIDwgNjAwKSkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSB4aHIucmVzcG9uc2VUZXh0IHx8XG4gICAgICAgICAgICAgICAgbWVzc2FnZXNbU3RyaW5nKHhoci5zdGF0dXMpLmNoYXJBdCgwKV1cbiAgICAgICAgICAgIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpXG5cbiAgICAgICAgICAgIGVycm9yLnN0YXR1c0NvZGUgPSB4aHIuc3RhdHVzXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNKc29uKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGJvZHkgPSB4aHIuYm9keSA9IEpTT04ucGFyc2UoYm9keSlcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayhlcnJvciwgeGhyLCBib2R5KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGVycm9yKGV2dCkge1xuICAgICAgICBjYWxsYmFjayhldnQsIHhocilcbiAgICB9XG59XG5cblxuZnVuY3Rpb24gbm9vcCgpIHt9XG4iLCJpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIG1vZHVsZS5leHBvcnRzID0gd2luZG93XG59IGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGdsb2JhbFxufSBlbHNlIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHt9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IG9uY2Vcblxub25jZS5wcm90byA9IG9uY2UoZnVuY3Rpb24gKCkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRnVuY3Rpb24ucHJvdG90eXBlLCAnb25jZScsIHtcbiAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG9uY2UodGhpcylcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KVxufSlcblxuZnVuY3Rpb24gb25jZSAoZm4pIHtcbiAgdmFyIGNhbGxlZCA9IGZhbHNlXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGNhbGxlZCkgcmV0dXJuXG4gICAgY2FsbGVkID0gdHJ1ZVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gIH1cbn1cbiIsInZhciBjcmVhdGVUeXBlcyA9IHJlcXVpcmUoJy4vdHlwZXMnKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oVEhSRUUpIHtcblxuICAgIHZhciB0eXBlcyA9IGNyZWF0ZVR5cGVzKFRIUkVFKSBcblxuICAgIHJldHVybiBmdW5jdGlvbiBjcmVhdGUoZ2xTaGFkZXIsIG9wdHMpIHtcbiAgICAgICAgb3B0cyA9IG9wdHN8fHt9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBvcHRzLmNvbG9ycyA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICBvcHRzLmNvbG9ycyA9IFtvcHRzLmNvbG9yc11cbiAgICAgICAgXG4gICAgICAgIHZhciB0VW5pZm9ybXMgPSB0eXBlcyggZ2xTaGFkZXIudW5pZm9ybXMsIG9wdHMuY29sb3JzIClcbiAgICAgICAgdmFyIHRBdHRyaWJzID0gdHlwZXMoIGdsU2hhZGVyLmF0dHJpYnV0ZXMsIG9wdHMuY29sb3JzIClcbiAgICAgICAgICAgIFxuICAgICAgICAvL2NsZWFyIHRoZSBhdHRyaWJ1dGUgYXJyYXlzXG4gICAgICAgIGZvciAodmFyIGsgaW4gdEF0dHJpYnMpIHtcbiAgICAgICAgICAgIHRBdHRyaWJzW2tdLnZhbHVlID0gW11cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2ZXJ0ZXhTaGFkZXI6IGdsU2hhZGVyLnZlcnRleCxcbiAgICAgICAgICAgIGZyYWdtZW50U2hhZGVyOiBnbFNoYWRlci5mcmFnbWVudCxcbiAgICAgICAgICAgIHVuaWZvcm1zOiB0VW5pZm9ybXMsXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB0QXR0cmlic1xuICAgICAgICB9XG4gICAgfVxufSIsInZhciB0eXBlTWFwID0ge1xuICAgICdpbnQnOiAnaScsXG4gICAgJ2Zsb2F0JzogJ2YnLFxuICAgICdpdmVjMic6ICdpMicsXG4gICAgJ2l2ZWMzJzogJ2kzJyxcbiAgICAnaXZlYzQnOiAnaTQnLFxuICAgICd2ZWMyJzogJ3YyJyxcbiAgICAndmVjMyc6ICd2MycsXG4gICAgJ3ZlYzQnOiAndjQnLFxuICAgICdtYXQ0JzogJ200JyxcbiAgICAnbWF0Myc6ICdtMycsXG4gICAgJ3NhbXBsZXIyRCc6ICd0JyxcbiAgICAnc2FtcGxlckN1YmUnOiAndCdcbn1cblxuZnVuY3Rpb24gY3JlYXRlKFRIUkVFKSB7XG4gICAgZnVuY3Rpb24gbmV3SW5zdGFuY2UodHlwZSwgaXNBcnJheSkge1xuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2Zsb2F0JzogXG4gICAgICAgICAgICBjYXNlICdpbnQnOlxuICAgICAgICAgICAgICAgIHJldHVybiAwXG4gICAgICAgICAgICBjYXNlICd2ZWMyJzpcbiAgICAgICAgICAgIGNhc2UgJ2l2ZWMyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRIUkVFLlZlY3RvcjIoKVxuICAgICAgICAgICAgY2FzZSAndmVjMyc6XG4gICAgICAgICAgICBjYXNlICdpdmVjMyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUSFJFRS5WZWN0b3IzKClcbiAgICAgICAgICAgIGNhc2UgJ3ZlYzQnOlxuICAgICAgICAgICAgY2FzZSAnaXZlYzQnOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVEhSRUUuVmVjdG9yNCgpXG4gICAgICAgICAgICBjYXNlICdtYXQ0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRIUkVFLk1hdHJpeDQoKVxuICAgICAgICAgICAgY2FzZSAnbWF0Myc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUSFJFRS5NYXRyaXgzKClcbiAgICAgICAgICAgIGNhc2UgJ3NhbXBsZXJDdWJlJzpcbiAgICAgICAgICAgIGNhc2UgJ3NhbXBsZXIyRCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUSFJFRS5UZXh0dXJlKClcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGVmYXVsdFZhbHVlKHR5cGUsIGlzQXJyYXksIGFycmF5TGVuKSB7XG4gICAgICAgIGlmIChpc0FycmF5KSB7XG4gICAgICAgICAgICAvL1RocmVlSlMgZmxhdHRlbnMgaXZlYzMgdHlwZVxuICAgICAgICAgICAgLy8od2UgZG9uJ3Qgc3VwcG9ydCAnZnYnIHR5cGUpXG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ2l2ZWMzJylcbiAgICAgICAgICAgICAgICBhcnJheUxlbiAqPSAzXG4gICAgICAgICAgICB2YXIgYXIgPSBuZXcgQXJyYXkoYXJyYXlMZW4pXG4gICAgICAgICAgICBmb3IgKHZhciBpPTA7IGk8YXIubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICAgICAgYXJbaV0gPSBuZXdJbnN0YW5jZSh0eXBlLCBpc0FycmF5KVxuICAgICAgICAgICAgcmV0dXJuIGFyXG4gICAgICAgIH0gIFxuICAgICAgICByZXR1cm4gbmV3SW5zdGFuY2UodHlwZSlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRUeXBlKHR5cGUsIGlzQXJyYXkpIHtcbiAgICAgICAgaWYgKCFpc0FycmF5KVxuICAgICAgICAgICAgcmV0dXJuIHR5cGVNYXBbdHlwZV1cblxuICAgICAgICBpZiAodHlwZSA9PT0gJ2ludCcpXG4gICAgICAgICAgICByZXR1cm4gJ2l2MSdcbiAgICAgICAgZWxzZSBpZiAodHlwZSA9PT0gJ2Zsb2F0JylcbiAgICAgICAgICAgIHJldHVybiAnZnYxJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gdHlwZU1hcFt0eXBlXSsndidcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gc2V0dXBVbmlmb3JtcyhnbFVuaWZvcm1zLCBjb2xvck5hbWVzKSB7XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShjb2xvck5hbWVzKSlcbiAgICAgICAgICAgIGNvbG9yTmFtZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG5cbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9XG4gICAgICAgIHZhciBhcnJheXMgPSB7fVxuXG4gICAgICAgIC8vbWFwIHVuaWZvcm0gdHlwZXNcbiAgICAgICAgZ2xVbmlmb3Jtcy5mb3JFYWNoKGZ1bmN0aW9uKHVuaWZvcm0pIHtcbiAgICAgICAgICAgIHZhciBuYW1lID0gdW5pZm9ybS5uYW1lXG4gICAgICAgICAgICB2YXIgaXNBcnJheSA9IC8oLispXFxbWzAtOV0rXFxdLy5leGVjKG5hbWUpXG5cbiAgICAgICAgICAgIC8vc3BlY2lhbCBjYXNlOiBjb2xvcnMuLi5cbiAgICAgICAgICAgIGlmIChjb2xvck5hbWVzICYmIGNvbG9yTmFtZXMuaW5kZXhPZihuYW1lKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNBcnJheSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYXJyYXkgb2YgY29sb3IgdW5pZm9ybXMgbm90IHN1cHBvcnRlZFwiKVxuICAgICAgICAgICAgICAgIGlmICh1bmlmb3JtLnR5cGUgIT09ICd2ZWMzJylcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhyZWVKUyBleHBlY3RzIHZlYzMgZm9yIENvbG9yIHVuaWZvcm1zXCIpIFxuICAgICAgICAgICAgICAgIHJlc3VsdFtuYW1lXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2MnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpc0FycmF5KSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IGlzQXJyYXlbMV1cbiAgICAgICAgICAgICAgICBpZiAobmFtZSBpbiBhcnJheXMpIFxuICAgICAgICAgICAgICAgICAgICBhcnJheXNbbmFtZV0uY291bnQrKyBcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGFycmF5c1tuYW1lXSA9IHsgY291bnQ6IDEsIHR5cGU6IHVuaWZvcm0udHlwZSB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHRbbmFtZV0gPSB7IFxuICAgICAgICAgICAgICAgIHR5cGU6IGdldFR5cGUodW5pZm9ybS50eXBlLCBpc0FycmF5KSwgXG4gICAgICAgICAgICAgICAgdmFsdWU6IGlzQXJyYXkgPyBudWxsIDogZGVmYXVsdFZhbHVlKHVuaWZvcm0udHlwZSkgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgLy9ub3cgY2xlYW4gdXAgYW55IGFycmF5IHZhbHVlc1xuICAgICAgICBmb3IgKHZhciBrIGluIHJlc3VsdCkge1xuICAgICAgICAgICAgdmFyIHUgPSByZXN1bHRba11cbiAgICAgICAgICAgIGlmIChrIGluIGFycmF5cykgeyAvL2lzIGFuIGFycmF5XG4gICAgICAgICAgICAgICAgdmFyIGEgPSBhcnJheXNba11cbiAgICAgICAgICAgICAgICB1LnZhbHVlID0gZGVmYXVsdFZhbHVlKGEudHlwZSwgdHJ1ZSwgYS5jb3VudClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZSJdfQ==
