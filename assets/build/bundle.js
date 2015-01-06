(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./js":[function(require,module,exports){
var LevelLoader = require('./LevelLoader');

function camelCaseToSpaced( string ) {
	
	return string
	    .replace(/([A-Z])/g, ' $1')
		.replace(/^./, function(str){ return str.toUpperCase(); })
	;
		
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
},{"./LevelLoader":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/LevelLoader.js","./levels":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/levels/index.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/LevelLoader.js":[function(require,module,exports){
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
},{"./Poem":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/Poem.js","./levels":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/levels/index.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/Poem.js":[function(require,module,exports){
var Stats = require('./vendor/Stats');
var EventDispatcher = require('./utils/EventDispatcher');
var Clock = require('./utils/Clock');
var Camera = require('./components/cameras/Camera');
var StereoEffect = require('./vendor/StereoEffect');
var DeviceOrientationControls = require('./vendor/DeviceOrientationControls');
var _renderer;
var _webGLRenderer;

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
	
	this.addRenderer( level.config.vr );
	
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
	
	addRenderer : function( useVR ) {
				
		if(!_renderer) {
			_webGLRenderer = new THREE.WebGLRenderer({
				alpha : true
			});
		}

		if( useVR ) {
			_renderer = new StereoEffect( _webGLRenderer );
			_renderer.separation = 10;
			this.hideUI();
		} else {
			_renderer = _webGLRenderer;
			this.showUI();
		}
		
		_renderer.setSize( window.innerWidth, window.innerHeight );
		this.div.appendChild( _webGLRenderer.domElement );
		this.canvas = _webGLRenderer.domElement;
	},
	
	hideUI : function() {
		$('.info, .credits, .level-select').hide();
	},
	
	showUI : function() {

		$('.info, .credits, .level-select').show();
	},
	
	addStats : function() {

	},
	
	addEventListeners : function() {
		$(window).on('resize', this.resizeHandler.bind(this));
		$(window).on('deviceorientation', this.resizeHandler.bind(this));
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
},{"./components/cameras/Camera":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/cameras/Camera.js","./utils/Clock":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/Clock.js","./utils/EventDispatcher":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/EventDispatcher.js","./vendor/DeviceOrientationControls":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/vendor/DeviceOrientationControls.js","./vendor/Stats":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/vendor/Stats.js","./vendor/StereoEffect":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/vendor/StereoEffect.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/Info.js":[function(require,module,exports){
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
},{"glslify":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/glslify/browser.js","glslify/simple-adapter.js":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/glslify/simple-adapter.js","three-glslify":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/three-glslify/index.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/ambiance/Sky/index.js":[function(require,module,exports){
var glslify = require("glslify");
var createShader = require("three-glslify")(THREE);

var Sky = function(poem, properties) {
    var config = _.extend({
        width: 5000
    }, properties);

    var geometry = new THREE.SphereGeometry(config.width, 32, 15);
    var shader = createShader(require("glslify/simple-adapter.js")("\n#define GLSLIFY 1\n\nuniform float time;\nvarying vec4 vColor;\nvarying vec2 vUv;\nvec4 a_x_mod289(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\nfloat a_x_mod289(float x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\nvec4 a_x_permute(vec4 x) {\n  return a_x_mod289(((x * 34.0) + 1.0) * x);\n}\nfloat a_x_permute(float x) {\n  return a_x_mod289(((x * 34.0) + 1.0) * x);\n}\nvec4 a_x_taylorInvSqrt(vec4 r) {\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\nfloat a_x_taylorInvSqrt(float r) {\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\nvec4 a_x_grad4(float j, vec4 ip) {\n  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);\n  vec4 p, s;\n  p.xyz = floor(fract(vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;\n  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);\n  s = vec4(lessThan(p, vec4(0.0)));\n  p.xyz = p.xyz + (s.xyz * 2.0 - 1.0) * s.www;\n  return p;\n}\n#define F4 0.309016994374947451\n\nfloat a_x_snoise(vec4 v) {\n  const vec4 C = vec4(0.138196601125011, 0.276393202250021, 0.414589803375032, -0.447213595499958);\n  vec4 i = floor(v + dot(v, vec4(F4)));\n  vec4 x0 = v - i + dot(i, C.xxxx);\n  vec4 i0;\n  vec3 isX = step(x0.yzw, x0.xxx);\n  vec3 isYZ = step(x0.zww, x0.yyz);\n  i0.x = isX.x + isX.y + isX.z;\n  i0.yzw = 1.0 - isX;\n  i0.y += isYZ.x + isYZ.y;\n  i0.zw += 1.0 - isYZ.xy;\n  i0.z += isYZ.z;\n  i0.w += 1.0 - isYZ.z;\n  vec4 i3 = clamp(i0, 0.0, 1.0);\n  vec4 i2 = clamp(i0 - 1.0, 0.0, 1.0);\n  vec4 i1 = clamp(i0 - 2.0, 0.0, 1.0);\n  vec4 x1 = x0 - i1 + C.xxxx;\n  vec4 x2 = x0 - i2 + C.yyyy;\n  vec4 x3 = x0 - i3 + C.zzzz;\n  vec4 x4 = x0 + C.wwww;\n  i = a_x_mod289(i);\n  float j0 = a_x_permute(a_x_permute(a_x_permute(a_x_permute(i.w) + i.z) + i.y) + i.x);\n  vec4 j1 = a_x_permute(a_x_permute(a_x_permute(a_x_permute(i.w + vec4(i1.w, i2.w, i3.w, 1.0)) + i.z + vec4(i1.z, i2.z, i3.z, 1.0)) + i.y + vec4(i1.y, i2.y, i3.y, 1.0)) + i.x + vec4(i1.x, i2.x, i3.x, 1.0));\n  vec4 ip = vec4(1.0 / 294.0, 1.0 / 49.0, 1.0 / 7.0, 0.0);\n  vec4 p0 = a_x_grad4(j0, ip);\n  vec4 p1 = a_x_grad4(j1.x, ip);\n  vec4 p2 = a_x_grad4(j1.y, ip);\n  vec4 p3 = a_x_grad4(j1.z, ip);\n  vec4 p4 = a_x_grad4(j1.w, ip);\n  vec4 norm = a_x_taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));\n  p0 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n  p4 *= a_x_taylorInvSqrt(dot(p4, p4));\n  vec3 m0 = max(0.6 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), 0.0);\n  vec2 m1 = max(0.6 - vec2(dot(x3, x3), dot(x4, x4)), 0.0);\n  m0 = m0 * m0;\n  m1 = m1 * m1;\n  return 49.0 * (dot(m0 * m0, vec3(dot(p0, x0), dot(p1, x1), dot(p2, x2))) + dot(m1 * m1, vec2(dot(p3, x3), dot(p4, x4))));\n}\nvec3 b_x_hsv2rgb(vec3 c) {\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\nfloat inRange(in float value, in float start, in float stop) {\n  return min(1.0, max(0.0, (value - start) / (stop - start)));\n}\nvec4 calculateColor(in vec2 uv, in vec3 position) {\n  float gradient = inRange(uv.y, 0.55, 0.7) + inRange(uv.y, 0.45, 0.3);\n  float noise = a_x_snoise(vec4(position * 0.03, time * 0.0001));\n  vec3 color = b_x_hsv2rgb(vec3(max(0.0, noise) * 0.2 + 0.4, 1.0, 1.0));\n  return vec4(color, noise * gradient);\n}\nvoid main() {\n  vUv = uv;\n  vColor = calculateColor(uv, position);\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}", "\n#define GLSLIFY 1\n\nvarying vec4 vColor;\nvoid main() {\n  gl_FragColor = vColor;\n}", [{"name":"time","type":"float"}], []));
    shader.side = THREE.BackSide;

    shader.uniforms = {
        time: {
            type: "f",
            value: 0
        }
    };

    var material = new THREE.ShaderMaterial(shader);
    material.transparent = true;
    material.blending = THREE.AdditiveBlending;
    material.depthTest = false;
    var mesh = new THREE.Mesh(geometry, material);
    poem.scene.add(mesh);

    poem.on("update", function(e) {
        shader.uniforms.time.value = e.time;
        mesh.position.copy(poem.camera.object.position);
    });
};

module.exports = Sky;
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
},{"../utils/loadTexture":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/loadTexture.js","../utils/random":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/random.js","rsvp":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/rsvp/dist/rsvp.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/EndlessTerrain/camera.js":[function(require,module,exports){
function updateCamera( camera ) {

	return function(e) {
		camera.object.position.z -= 1;
	};
}

function mouseDown( canvas, cameraObj, poem ) {
	
	window.cameraObj = cameraObj;
	
	var px, py;

	var $canvas = $(canvas);
	
	var dragMouseHandler = (function() {
		
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
			
			var offsetX = px - x;
			var offsetY = py - y;
				
			rotationY += offsetX * 0.005;
			rotationX += offsetY * 0.005;
			
			q1.setFromAxisAngle( axisY, rotationY );
			q2.setFromAxisAngle( axisX, rotationX );
			cameraObj.quaternion.multiplyQuaternions( q1, q2 );
			
			
			px = x;
			py = y;
		
		};
		
	})();
	
	var mouseUpHandler = function() {
		$canvas.off('mouseup', mouseUpHandler);
		$canvas.off('mousemove', dragMouseHandler);
	};
		
	var mouseDownHandler = function( e ) {
		
		e.preventDefault();
		
		px = e.pageX;
		py = e.pageY;
		
		$canvas.on('mouseup', mouseUpHandler);
		$canvas.on('mousemove', dragMouseHandler);
	};
	
	$canvas.on('mousedown', mouseDownHandler);
	
	poem.on('destroy', function() {
		$canvas.off('mouseup', mouseUpHandler);
		$canvas.off('mousemove', dragMouseHandler);
		$canvas.off('mousedown', mouseDownHandler);
	});
}

var EndlessCamera = function( poem ) {
	
	poem.on('update', updateCamera( poem.camera ));
	
	mouseDown( poem.canvas, poem.camera.object, poem );
};

module.exports = EndlessCamera;
},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/EndlessTerrain/index.js":[function(require,module,exports){
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

    $(img).on("load", function() {
        texture.needsUpdate = true;
        scene.add(mesh);
        console.log("texture loaded");
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
        totalPolygonDensity: 1024
    }, properties);

    var shader = createShader(require("glslify/simple-adapter.js")("\n#define GLSLIFY 1\n\nuniform sampler2D terrain;\nuniform float heightScale;\nuniform float width;\nvarying float height;\nvarying vec2 vUv;\nvarying float vCameraDistance;\nvoid main() {\n  vec4 modelPosition = modelMatrix * vec4(position, 1.0);\n  vUv = mod(vec2(modelPosition.x, modelPosition.z), width) / width;\n  height = texture2D(terrain, vUv).w;\n  vCameraDistance = distance(modelPosition.xyz, cameraPosition);\n  vec4 modifiedPosition = vec4(position.x, position.y + height * heightScale, position.z, 1.0);\n  gl_Position = projectionMatrix * modelViewMatrix * modifiedPosition;\n}", "\n#define GLSLIFY 1\n\nvec3 a_x_hsv2rgb(vec3 c) {\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\nuniform float width;\nvarying float height;\nvarying vec2 vUv;\nvarying float vCameraDistance;\nvoid main() {\n  float invDistort = 1.0 - height;\n  float xHue = abs(0.5 - vUv.x) * 2.0;\n  float yHue = abs(0.5 - vUv.y) * 2.0;\n  gl_FragColor = vec4(a_x_hsv2rgb(vec3((xHue + yHue) * 0.2 + 0.3, mix(height, 0.5, 0.8), mix(height, 1.0, 0.35))), 1.0);\n  float fogFactor = smoothstep(0.0, 1.0, vCameraDistance / width);\n  vec3 fogColor = vec3(0.125, 0.125, 0.125);\n  gl_FragColor = mix(gl_FragColor, vec4(fogColor, gl_FragColor.w), fogFactor);\n}", [{"name":"terrain","type":"sampler2D"},{"name":"heightScale","type":"float"},{"name":"width","type":"float"},{"name":"width","type":"float"}], []));
    var material = new THREE.ShaderMaterial(shader);
    material.side = THREE.DoubleSide;
    var meshGrid = createMeshGrid(material, config.width, config.gridLength, config.totalPolygonDensity);
    meshGrid.position.y = 100;
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
},{"../utils/loadText":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/loadText.js","../utils/loadTexture":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/loadTexture.js","../utils/random":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/random.js","rsvp":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/rsvp/dist/rsvp.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/Spheres.js":[function(require,module,exports){
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
},{"../utils/random":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/random.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/texturePositionalMatrices/index.js":[function(require,module,exports){
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
},{"../../utils/loadText":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/loadText.js","../../utils/loadTexture":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/loadTexture.js","../../utils/random":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/random.js","rsvp":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/rsvp/dist/rsvp.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/levels/carbonDioxideEarth.js":[function(require,module,exports){
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
},{"../components/Info":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/Info.js","../components/Stars":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/Stars.js","../components/cameras/Controls":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/cameras/Controls.js","../components/lights/TrackCameraLights":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/lights/TrackCameraLights.js","../demos/Earth":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/Earth.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/levels/endlessTerrain.js":[function(require,module,exports){
module.exports = {
	config : {
		camera : {
			x : -400
		}
	},
	objects : {
		endlessTerrain : {
			object: require("../demos/EndlessTerrain"),
		},
		endlessCamera : {
			object: require("../demos/EndlessTerrain/camera"),
		},
		sky : {
			object: require("../components/ambiance/Sky"),
			properties: {
				width: 10000
			}
		},
		cloudsBottom : {
			object: require("../components/ambiance/Clouds"),
			properties: {
				height: -200,
				rotation: Math.PI / 2
			}
		}
		// stats : {
		// 	object: require("../components/utils/Stats")
		// }
	}
};
},{"../components/ambiance/Clouds":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/ambiance/Clouds/index.js","../components/ambiance/Sky":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/ambiance/Sky/index.js","../demos/EndlessTerrain":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/EndlessTerrain/index.js","../demos/EndlessTerrain/camera":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/EndlessTerrain/camera.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/levels/index.js":[function(require,module,exports){
module.exports = {
	meshGroupBoxDemo : require("./meshGroupBoxDemo"),
	carbonDioxideEarth : require("./carbonDioxideEarth"),
	endlessTerrain : require("./endlessTerrain"),
	spheresDemo : require("./spheresDemo"),
	vr : require("./vr"),
	sineGravityCloud : require("./sineGravityCloud"),
	uniformPositionalMatrices : require("./uniformPositionalMatrices"),
	texturePositionalMatrices : require("./texturePositionalMatrices")
};
},{"./carbonDioxideEarth":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/levels/carbonDioxideEarth.js","./endlessTerrain":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/levels/endlessTerrain.js","./meshGroupBoxDemo":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/levels/meshGroupBoxDemo.js","./sineGravityCloud":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/levels/sineGravityCloud.js","./spheresDemo":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/levels/spheresDemo.js","./texturePositionalMatrices":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/levels/texturePositionalMatrices.js","./uniformPositionalMatrices":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/levels/uniformPositionalMatrices.js","./vr":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/levels/vr.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/levels/meshGroupBoxDemo.js":[function(require,module,exports){
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
},{"../components/cameras/Controls":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/cameras/Controls.js","../components/utils/Stats":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/utils/Stats.js","../demos/Grid":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/Grid.js","../demos/MeshGroupBoxDemo":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/MeshGroupBoxDemo/index.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/levels/sineGravityCloud.js":[function(require,module,exports){
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
},{"../components/cameras/Controls":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/cameras/Controls.js","../demos/Grid":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/Grid.js","../demos/SineGravityCloud":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/SineGravityCloud.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/levels/spheresDemo.js":[function(require,module,exports){
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
},{"../components/cameras/Controls":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/cameras/Controls.js","../components/utils/Stats":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/utils/Stats.js","../demos/Grid":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/Grid.js","../demos/Spheres":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/Spheres.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/levels/texturePositionalMatrices.js":[function(require,module,exports){
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
},{"../components/cameras/Controls":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/cameras/Controls.js","../components/utils/Stats":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/utils/Stats.js","../demos/Grid":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/Grid.js","../demos/texturePositionalMatrices":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/texturePositionalMatrices/index.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/levels/uniformPositionalMatrices.js":[function(require,module,exports){
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
},{"../components/cameras/Controls":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/cameras/Controls.js","../components/utils/Stats":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/utils/Stats.js","../demos/Grid":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/Grid.js","../demos/uniformPositionalMatrices":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/uniformPositionalMatrices/index.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/levels/vr.js":[function(require,module,exports){
module.exports = {
	config : {
		vr : true,
		camera : {
			x : -300,
			fov : 70
		}
	},
	objects : {
		pointcloud : {
			object: require("../demos/SineGravityCloud"),
			properties: {
				count: 50 * 1000,
				pointSize : 4
			}
		},
		controls : {
			object: require("../components/cameras/Orientation"),
		},
		cameraRotation : {
			object: require("../components/cameras/RotateAroundOrigin"),
		},
		grid : {
			object: require("../demos/Grid"),
		}
	}
};
},{"../components/cameras/Orientation":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/cameras/Orientation.js","../components/cameras/RotateAroundOrigin":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/components/cameras/RotateAroundOrigin.js","../demos/Grid":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/Grid.js","../demos/SineGravityCloud":"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/demos/SineGravityCloud.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/utils/Clock.js":[function(require,module,exports){
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

},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/vendor/Stats.js":[function(require,module,exports){
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
},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/js/vendor/StereoEffect.js":[function(require,module,exports){
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

},{}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/perlin-simplex/index.js":[function(require,module,exports){
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

},{"_process":"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/gulpfile/node_modules/browserify/node_modules/process/browser.js"}],"/Users/gregtatum/Google Drive/greg-sites/sandbox/node_modules/three-glslify/index.js":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ndWxwZmlsZS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwianMiLCJqcy9MZXZlbExvYWRlci5qcyIsImpzL1BvZW0uanMiLCJqcy9jb21wb25lbnRzL0luZm8uanMiLCJqcy9jb21wb25lbnRzL1N0YXJzLmpzIiwianMvY29tcG9uZW50cy9hbWJpYW5jZS9DbG91ZHMvaW5kZXguanMiLCJqcy9jb21wb25lbnRzL2FtYmlhbmNlL1NreS9pbmRleC5qcyIsImpzL2NvbXBvbmVudHMvY2FtZXJhcy9DYW1lcmEuanMiLCJqcy9jb21wb25lbnRzL2NhbWVyYXMvQ29udHJvbHMuanMiLCJqcy9jb21wb25lbnRzL2NhbWVyYXMvT3JpZW50YXRpb24uanMiLCJqcy9jb21wb25lbnRzL2NhbWVyYXMvUm90YXRlQXJvdW5kT3JpZ2luLmpzIiwianMvY29tcG9uZW50cy9saWdodHMvVHJhY2tDYW1lcmFMaWdodHMuanMiLCJqcy9jb21wb25lbnRzL3V0aWxzL1N0YXRzLmpzIiwianMvZGVtb3MvRWFydGguanMiLCJqcy9kZW1vcy9FbmRsZXNzVGVycmFpbi9jYW1lcmEuanMiLCJqcy9kZW1vcy9FbmRsZXNzVGVycmFpbi9pbmRleC5qcyIsImpzL2RlbW9zL0dyaWQuanMiLCJqcy9kZW1vcy9NZXNoR3JvdXBCb3hEZW1vL01lc2hHcm91cC5qcyIsImpzL2RlbW9zL01lc2hHcm91cEJveERlbW8vaW5kZXguanMiLCJqcy9kZW1vcy9TaW5lR3Jhdml0eUNsb3VkLmpzIiwianMvZGVtb3MvU3BoZXJlcy5qcyIsImpzL2RlbW9zL3RleHR1cmVQb3NpdGlvbmFsTWF0cmljZXMvaW5kZXguanMiLCJqcy9kZW1vcy91bmlmb3JtUG9zaXRpb25hbE1hdHJpY2VzL2luZGV4LmpzIiwianMvbGV2ZWxzL2NhcmJvbkRpb3hpZGVFYXJ0aC5qcyIsImpzL2xldmVscy9lbmRsZXNzVGVycmFpbi5qcyIsImpzL2xldmVscy9pbmRleC5qcyIsImpzL2xldmVscy9tZXNoR3JvdXBCb3hEZW1vLmpzIiwianMvbGV2ZWxzL3NpbmVHcmF2aXR5Q2xvdWQuanMiLCJqcy9sZXZlbHMvc3BoZXJlc0RlbW8uanMiLCJqcy9sZXZlbHMvdGV4dHVyZVBvc2l0aW9uYWxNYXRyaWNlcy5qcyIsImpzL2xldmVscy91bmlmb3JtUG9zaXRpb25hbE1hdHJpY2VzLmpzIiwianMvbGV2ZWxzL3ZyLmpzIiwianMvdXRpbHMvQ2xvY2suanMiLCJqcy91dGlscy9FdmVudERpc3BhdGNoZXIuanMiLCJqcy91dGlscy9jYWxjdWxhdGVTcXVhcmVkVGV4dHVyZVdpZHRoLmpzIiwianMvdXRpbHMvbG9hZFRleHQuanMiLCJqcy91dGlscy9sb2FkVGV4dHVyZS5qcyIsImpzL3V0aWxzL3JhbmRvbS5qcyIsImpzL3V0aWxzL3NpbXBsZXgyLmpzIiwianMvdmVuZG9yL0RldmljZU9yaWVudGF0aW9uQ29udHJvbHMuanMiLCJqcy92ZW5kb3IvT3JiaXRDb250cm9scy5qcyIsImpzL3ZlbmRvci9TdGF0cy5qcyIsImpzL3ZlbmRvci9TdGVyZW9FZmZlY3QuanMiLCJub2RlX21vZHVsZXMvZ2xzbGlmeS9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2dsc2xpZnkvc2ltcGxlLWFkYXB0ZXIuanMiLCJub2RlX21vZHVsZXMvZ3VscGZpbGUvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9wZXJsaW4tc2ltcGxleC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yc3ZwL2Rpc3QvcnN2cC5qcyIsIm5vZGVfbW9kdWxlcy90aHJlZS1nbHNsaWZ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3RocmVlLWdsc2xpZnkvdHlwZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3prQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3BMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDemtEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBMZXZlbExvYWRlciA9IHJlcXVpcmUoJy4vTGV2ZWxMb2FkZXInKTtcblxuZnVuY3Rpb24gY2FtZWxDYXNlVG9TcGFjZWQoIHN0cmluZyApIHtcblx0XG5cdHJldHVybiBzdHJpbmdcblx0ICAgIC5yZXBsYWNlKC8oW0EtWl0pL2csICcgJDEnKVxuXHRcdC5yZXBsYWNlKC9eLi8sIGZ1bmN0aW9uKHN0cil7IHJldHVybiBzdHIudG9VcHBlckNhc2UoKTsgfSlcblx0O1xuXHRcdFxufVxuXG4kKGZ1bmN0aW9uKCkge1xuXHRcblx0dmFyIGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSk7XG5cdFxuXHR2YXIgbGV2ZWxzID0gXy5rZXlzKCByZXF1aXJlKCcuL2xldmVscycpICk7XG5cdFxuXHR2YXIgbGV2ZWxUb0xvYWQgPSBfLmNvbnRhaW5zKCBsZXZlbHMsIGhhc2ggKSA/IGhhc2ggOiBfLmZpcnN0KCBsZXZlbHMgKTtcblx0XG5cdHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gbGV2ZWxUb0xvYWQ7XG5cdFxuXHQkKCcjTGV2ZWxTZWxlY3QnKVxuXHRcdC5hcHBlbmQoXG5cdFx0XG5cdFx0XHRfLnJlZHVjZSggbGV2ZWxzLCBmdW5jdGlvbiggbWVtbywgbGV2ZWwgKSB7XG5cdFx0XHRcdFxuXHRcdFx0XHR2YXIgbGV2ZWxQcmV0dHkgPSBjYW1lbENhc2VUb1NwYWNlZCggbGV2ZWwgKTtcblx0XHRcdFx0dmFyIHNlbGVjdGVkID0gbGV2ZWwgPT09IGxldmVsVG9Mb2FkID8gXCIgc2VsZWN0ZWRcIiA6IFwiXCI7XG5cblx0XHRcdFx0cmV0dXJuIG1lbW8gKyBcIjxvcHRpb24gdmFsdWU9J1wiK2xldmVsK1wiJ1wiK3NlbGVjdGVkK1wiPlwiK2xldmVsUHJldHR5K1wiPC9vcHRpb24+XCI7XG5cdFx0XHRcdFxuXHRcdFx0fSwgXCJcIilcblx0XG5cdFx0KVxuXHRcdC5vbiggXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbGV2ZWwgPSAkKHRoaXMpLnZhbCgpO1xuXHRcdFx0TGV2ZWxMb2FkZXIoIGxldmVsICk7XG5cdFx0XHR3aW5kb3cubG9jYXRpb24uaGFzaCA9IGxldmVsO1xuXHRcdH0pXG5cdDtcblxuXHRMZXZlbExvYWRlciggbGV2ZWxUb0xvYWQgICk7XG59KTsiLCIvLyBEZWNsYXJhdGl2ZWx5IHNldCB1cCB0aGUgc2NlbmUgdXNpbmcgYSBsZXZlbCBtYW5pZmVzdC4gRWFjaCBvYmplY3Rcbi8vIGluIHRoZSBsZXZlbCBtYW5pZmVzdCBnZXRzIGluaXRpYXRlZCBhcyBhIHByb3BlcnR5IG9uIHRoZSBwb2VtIG9iamVjdFxuLy8gYW5kIGdldHMgcGFzc2VkIHRoZSBwb2VtIGFzIHRoZSBmaXJzdCB2YXJpYWJsZSwgYW5kIHRoZSBwcm9wZXJ0aWVzIGFzXG4vLyB0aGUgc2Vjb25kXG5cbnZhciBQb2VtID0gcmVxdWlyZSgnLi9Qb2VtJyk7XG52YXIgbGV2ZWxzID0gcmVxdWlyZSgnLi9sZXZlbHMnKTtcblxudmFyIGN1cnJlbnRMZXZlbCA9IG51bGw7XG52YXIgY3VycmVudFBvZW0gPSBudWxsO1xuXG53aW5kb3cuTGV2ZWxMb2FkZXIgPSBmdW5jdGlvbiggbmFtZSApIHtcblx0XG5cdGlmKGN1cnJlbnRQb2VtKSBjdXJyZW50UG9lbS5kZXN0cm95KCk7XG5cdFxuXHRjdXJyZW50TGV2ZWwgPSBsZXZlbHNbbmFtZV07XG5cdGN1cnJlbnRQb2VtID0gbmV3IFBvZW0oIGN1cnJlbnRMZXZlbCApO1xuXHR3aW5kb3cucG9lbSA9IGN1cnJlbnRQb2VtO1xuXG59O1xuXHRcbm1vZHVsZS5leHBvcnRzID0gTGV2ZWxMb2FkZXI7IiwidmFyIFN0YXRzID0gcmVxdWlyZSgnLi92ZW5kb3IvU3RhdHMnKTtcbnZhciBFdmVudERpc3BhdGNoZXIgPSByZXF1aXJlKCcuL3V0aWxzL0V2ZW50RGlzcGF0Y2hlcicpO1xudmFyIENsb2NrID0gcmVxdWlyZSgnLi91dGlscy9DbG9jaycpO1xudmFyIENhbWVyYSA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9jYW1lcmFzL0NhbWVyYScpO1xudmFyIFN0ZXJlb0VmZmVjdCA9IHJlcXVpcmUoJy4vdmVuZG9yL1N0ZXJlb0VmZmVjdCcpO1xudmFyIERldmljZU9yaWVudGF0aW9uQ29udHJvbHMgPSByZXF1aXJlKCcuL3ZlbmRvci9EZXZpY2VPcmllbnRhdGlvbkNvbnRyb2xzJyk7XG52YXIgX3JlbmRlcmVyO1xudmFyIF93ZWJHTFJlbmRlcmVyO1xuXG52YXIgUG9lbSA9IGZ1bmN0aW9uKCBsZXZlbCApIHtcblxuXHR0aGlzLnJhdGlvID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gPj0gMSA/IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIDogMTtcblx0XG5cdHRoaXMuZGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoICdjb250YWluZXInICk7XG5cdHRoaXMuJGRpdiA9ICQodGhpcy5kaXYpO1xuXHR0aGlzLmNhbnZhcyA9IG51bGw7XG5cdHRoaXMuc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcblx0dGhpcy5yZXF1ZXN0ZWRGcmFtZSA9IHVuZGVmaW5lZDtcblxuXHR0aGlzLmNsb2NrID0gbmV3IENsb2NrKCk7XG5cdHRoaXMuY2FtZXJhID0gbmV3IENhbWVyYSggdGhpcywgXy5pc09iamVjdCggbGV2ZWwuY29uZmlnLmNhbWVyYSApID8gbGV2ZWwuY29uZmlnLmNhbWVyYSA6IHt9ICk7XG5cdHRoaXMuc2NlbmUuZm9nID0gbmV3IFRIUkVFLkZvZyggMHgyMjIyMjIsIHRoaXMuY2FtZXJhLm9iamVjdC5wb3NpdGlvbi56IC8gMiwgdGhpcy5jYW1lcmEub2JqZWN0LnBvc2l0aW9uLnogKiAyICk7XG5cdFxuXHR0aGlzLmFkZFJlbmRlcmVyKCBsZXZlbC5jb25maWcudnIgKTtcblx0XG5cdHRoaXMucGFyc2VMZXZlbCggbGV2ZWwgKTtcblx0XG5cdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcnMoKTtcblx0XG5cdHRoaXMubG9vcCgpO1xuXHRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUG9lbTtcblxuUG9lbS5wcm90b3R5cGUgPSB7XG5cdFxuXHRwYXJzZUxldmVsIDogZnVuY3Rpb24oIGxldmVsICkge1xuXHRcdF8uZWFjaCggbGV2ZWwub2JqZWN0cywgZnVuY3Rpb24oIHZhbHVlLCBrZXkgKSB7XG5cdFx0XHRpZihfLmlzT2JqZWN0KCB2YWx1ZSApKSB7XG5cdFx0XHRcdHRoaXNbIGtleSBdID0gbmV3IHZhbHVlLm9iamVjdCggdGhpcywgdmFsdWUucHJvcGVydGllcyApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpc1sga2V5IF0gPSB2YWx1ZTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdH0sIHRoaXMpO1xuXHR9LFxuXHRcblx0YWRkUmVuZGVyZXIgOiBmdW5jdGlvbiggdXNlVlIgKSB7XG5cdFx0XHRcdFxuXHRcdGlmKCFfcmVuZGVyZXIpIHtcblx0XHRcdF93ZWJHTFJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe1xuXHRcdFx0XHRhbHBoYSA6IHRydWVcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGlmKCB1c2VWUiApIHtcblx0XHRcdF9yZW5kZXJlciA9IG5ldyBTdGVyZW9FZmZlY3QoIF93ZWJHTFJlbmRlcmVyICk7XG5cdFx0XHRfcmVuZGVyZXIuc2VwYXJhdGlvbiA9IDEwO1xuXHRcdFx0dGhpcy5oaWRlVUkoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0X3JlbmRlcmVyID0gX3dlYkdMUmVuZGVyZXI7XG5cdFx0XHR0aGlzLnNob3dVSSgpO1xuXHRcdH1cblx0XHRcblx0XHRfcmVuZGVyZXIuc2V0U2l6ZSggd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCApO1xuXHRcdHRoaXMuZGl2LmFwcGVuZENoaWxkKCBfd2ViR0xSZW5kZXJlci5kb21FbGVtZW50ICk7XG5cdFx0dGhpcy5jYW52YXMgPSBfd2ViR0xSZW5kZXJlci5kb21FbGVtZW50O1xuXHR9LFxuXHRcblx0aGlkZVVJIDogZnVuY3Rpb24oKSB7XG5cdFx0JCgnLmluZm8sIC5jcmVkaXRzLCAubGV2ZWwtc2VsZWN0JykuaGlkZSgpO1xuXHR9LFxuXHRcblx0c2hvd1VJIDogZnVuY3Rpb24oKSB7XG5cblx0XHQkKCcuaW5mbywgLmNyZWRpdHMsIC5sZXZlbC1zZWxlY3QnKS5zaG93KCk7XG5cdH0sXG5cdFxuXHRhZGRTdGF0cyA6IGZ1bmN0aW9uKCkge1xuXG5cdH0sXG5cdFxuXHRhZGRFdmVudExpc3RlbmVycyA6IGZ1bmN0aW9uKCkge1xuXHRcdCQod2luZG93KS5vbigncmVzaXplJywgdGhpcy5yZXNpemVIYW5kbGVyLmJpbmQodGhpcykpO1xuXHRcdCQod2luZG93KS5vbignZGV2aWNlb3JpZW50YXRpb24nLCB0aGlzLnJlc2l6ZUhhbmRsZXIuYmluZCh0aGlzKSk7XG5cdH0sXG5cdFxuXHRyZXNpemVIYW5kbGVyIDogZnVuY3Rpb24oKSB7XG5cdFx0XG5cdFx0X3JlbmRlcmVyLnNldFNpemUoIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQgKTtcblx0XHR0aGlzLmRpc3BhdGNoKCB7IHR5cGUgOiBcInJlc2l6ZVwiIH0gKTtcblx0XHRcblx0fSxcblx0XHRcdFxuXHRsb29wIDogZnVuY3Rpb24oKSB7XG5cblx0XHR0aGlzLnJlcXVlc3RlZEZyYW1lID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCB0aGlzLmxvb3AuYmluZCh0aGlzKSApO1xuXHRcdHRoaXMudXBkYXRlKCk7XG5cblx0fSxcblx0XHRcdFxuXHR1cGRhdGUgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHR0aGlzLmRpc3BhdGNoKHtcblx0XHRcdHR5cGU6IFwidXBkYXRlXCIsXG5cdFx0XHRkdDogdGhpcy5jbG9jay5nZXREZWx0YSgpLFxuXHRcdFx0dGltZTogdGhpcy5jbG9jay50aW1lXG5cdFx0fSk7XG5cdFx0XG5cdFx0X3JlbmRlcmVyLnJlbmRlciggdGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEub2JqZWN0ICk7XG5cblx0fSxcblx0XG5cdGRlc3Ryb3kgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHR3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoIHRoaXMucmVxdWVzdGVkRnJhbWUgKTtcblx0XHRcblx0XHR0aGlzLmRpc3BhdGNoKHtcblx0XHRcdHR5cGU6IFwiZGVzdHJveVwiXG5cdFx0fSk7XG5cdH1cbn07XG5cbkV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUuYXBwbHkoIFBvZW0ucHJvdG90eXBlICk7IiwidmFyIEluZm8gPSBmdW5jdGlvbiggcG9lbSwgcHJvcGVydGllcyApIHtcblx0XG5cdGlmKCBwcm9wZXJ0aWVzLmFwcGVuZENyZWRpdHMgKSAkKCcuY3JlZGl0cycpLmFwcGVuZCggcHJvcGVydGllcy5hcHBlbmRDcmVkaXRzICk7XG5cdGlmKCBwcm9wZXJ0aWVzLnRpdGxlICkgJChcIiNpbmZvLXRpdGxlXCIpLnRleHQoIHByb3BlcnRpZXMudGl0bGUgKTtcblx0aWYoIHByb3BlcnRpZXMuc3VidGl0bGUgKSAkKFwiI2luZm8tc3VidGl0bGVcIikudGV4dCggcHJvcGVydGllcy5zdWJ0aXRsZSk7XG5cdFxuXHRpZiggcHJvcGVydGllcy50aXRsZUNzcyApICQoXCIjaW5mby10aXRsZVwiKS5jc3MoIHByb3BlcnRpZXMudGl0bGVDc3MgKTtcblx0aWYoIHByb3BlcnRpZXMuc3VidGl0bGVDc3MgKSAkKFwiI2luZm8tc3VidGl0bGVcIikuY3NzKCBwcm9wZXJ0aWVzLnN1YnRpdGxlQ3NzICk7XG5cdFxuXHRcblx0aWYoIHByb3BlcnRpZXMuZG9jdW1lbnRUaXRsZSApIGRvY3VtZW50LnRpdGxlID0gcHJvcGVydGllcy5kb2N1bWVudFRpdGxlO1xuXHRcblx0aWYoIHByb3BlcnRpZXMuc2hvd0Fycm93TmV4dCApICQoXCIuYXJyb3ctbmV4dFwiKS5zaG93KCk7XG5cblx0JChcIiNpbmZvXCIpLnNob3coKTtcblx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEluZm87IiwidmFyIFN0YXJzID0gZnVuY3Rpb24oIHBvZW0gKSB7XG5cdHRoaXMucG9lbSA9IHBvZW07XG5cdHRoaXMub2JqZWN0ID0gbnVsbDtcblx0XG5cdHRoaXMuY291bnQgPSAzMDAwMDtcblx0dGhpcy5kZXB0aCA9IDUwMDA7XG5cdHRoaXMubWluRGVwdGggPSA3MDA7XG5cdHRoaXMuY29sb3IgPSAweGFhYWFhYTtcblx0XG5cdHRoaXMuYWRkT2JqZWN0KCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXJzO1xuXG5TdGFycy5wcm90b3R5cGUgPSB7XG5cdFxuXHRnZW5lcmF0ZUdlb21ldHJ5IDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHIsIHRoZXRhLCB4LCB5LCB6LCBnZW9tZXRyeTtcblx0XHRcblx0XHRnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xuXHRcdFxuXHRcdGZvcih2YXIgaT0wOyBpIDwgdGhpcy5jb3VudDsgaSsrKSB7XG5cdFx0XHRcblx0XHRcdHIgPSBNYXRoLnJhbmRvbSgpICogdGhpcy5kZXB0aCArIHRoaXMubWluRGVwdGg7XG5cblx0XHRcdHRoZXRhID0gTWF0aC5yYW5kb20oKSAqIDIgKiBNYXRoLlBJO1xuXHRcdFx0XG5cdFx0XHR4ID0gTWF0aC5jb3MoIHRoZXRhICkgKiByO1xuXHRcdFx0eiA9IE1hdGguc2luKCB0aGV0YSApICogcjtcblx0XHRcdHkgPSAoMC41IC0gTWF0aC5yYW5kb20oKSkgKiB0aGlzLmRlcHRoO1xuXHRcdFx0XG5cdFx0XHRnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKCBuZXcgVEhSRUUuVmVjdG9yMyh4LHkseikgKTtcblx0XHRcdFx0XHRcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIGdlb21ldHJ5O1xuXHR9LFxuXHRcblx0YWRkT2JqZWN0IDogZnVuY3Rpb24oKSB7XG5cdFx0XG5cdFx0dmFyIGdlb21ldHJ5LCBsaW5lTWF0ZXJpYWw7XG5cdFx0XG5cdFx0Z2VvbWV0cnkgPSB0aGlzLmdlbmVyYXRlR2VvbWV0cnkoKTtcblx0XHRcblx0XHRcblx0XHR0aGlzLm9iamVjdCA9IG5ldyBUSFJFRS5Qb2ludENsb3VkKFxuXHRcdFx0Z2VvbWV0cnksXG5cdFx0XHRuZXcgVEhSRUUuUG9pbnRDbG91ZE1hdGVyaWFsKHtcblx0XHRcdFx0IHNpemU6IDMgKiB0aGlzLnBvZW0ucmF0aW8sXG5cdFx0XHRcdCBjb2xvcjogdGhpcy5jb2xvcixcblx0XHRcdFx0IGZvZzogZmFsc2Vcblx0XHRcdH1cblx0XHQpICk7XG5cdFx0XG5cdFx0dGhpcy5wb2VtLnNjZW5lLmFkZCggdGhpcy5vYmplY3QgKSA7XG5cdFx0XG5cdH1cbn07IiwidmFyIGdsc2xpZnkgPSByZXF1aXJlKFwiZ2xzbGlmeVwiKTtcbnZhciBjcmVhdGVTaGFkZXIgPSByZXF1aXJlKFwidGhyZWUtZ2xzbGlmeVwiKShUSFJFRSk7XG5cbmZ1bmN0aW9uIHNldHVwVGV4dHVyZShtZXNoLCBzY2VuZSkge1xuICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICB2YXIgdGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKGltZyk7XG4gICAgaW1nLnNyYyA9IFwiYXNzZXRzL2ltYWdlcy9jbG91ZDEwMjQucG5nXCI7XG4gICAgdGV4dHVyZS53cmFwUyA9IFRIUkVFLlJlcGVhdFdyYXBwaW5nO1xuICAgIHRleHR1cmUud3JhcFQgPSBUSFJFRS5SZXBlYXRXcmFwcGluZztcblxuICAgICQoaW1nKS5vbihcImxvYWRcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgICBzY2VuZS5hZGQobWVzaCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGV4dHVyZTtcbn1cblxudmFyIENsb3VkcyA9IGZ1bmN0aW9uKHBvZW0sIHByb3BlcnRpZXMpIHtcbiAgICB2YXIgY29uZmlnID0gXy5leHRlbmQoe1xuICAgICAgICB3aWR0aDogNTAwLFxuICAgICAgICBvZmZzZXQ6IG5ldyBUSFJFRS5WZWN0b3IyKDEsIDEpLFxuICAgICAgICBjb2xvcjogbmV3IFRIUkVFLlZlY3RvcjQoMC41LCAxLCAwLjcsIDEpLFxuICAgICAgICBoZWlnaHQ6IC0yMDAsXG4gICAgICAgIHJvdGF0aW9uOiBNYXRoLlBJIC8gMlxuICAgIH0sIHByb3BlcnRpZXMpO1xuXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoY29uZmlnLndpZHRoLCBjb25maWcud2lkdGgpO1xuICAgIHZhciBzaGFkZXIgPSBjcmVhdGVTaGFkZXIocmVxdWlyZShcImdsc2xpZnkvc2ltcGxlLWFkYXB0ZXIuanNcIikoXCJcXG4jZGVmaW5lIEdMU0xJRlkgMVxcblxcbnZhcnlpbmcgdmVjMiB2VXY7XFxudm9pZCBtYWluKCkge1xcbiAgdlV2ID0gdXY7XFxuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApO1xcbn1cIiwgXCJcXG4jZGVmaW5lIEdMU0xJRlkgMVxcblxcbnVuaWZvcm0gZmxvYXQgdGltZTtcXG51bmlmb3JtIHZlYzQgY29sb3I7XFxudW5pZm9ybSB2ZWMyIG9mZnNldDtcXG51bmlmb3JtIHNhbXBsZXIyRCB0ZXh0dXJlO1xcbnZhcnlpbmcgdmVjMiB2VXY7XFxudm9pZCBtYWluKCkge1xcbiAgdmVjNCB0ZXhlbCA9IHRleHR1cmUyRCh0ZXh0dXJlLCB2VXYgKiAwLjEgKyAob2Zmc2V0ICsgdGltZSAqIDAuMDAwMDEpICogb2Zmc2V0KSArIHRleHR1cmUyRCh0ZXh0dXJlLCB2VXYgKiAwLjIyICsgKG9mZnNldCArIHRpbWUgKiAwLjAwMDAwNTUpICogb2Zmc2V0KTtcXG4gIGZsb2F0IGVkZ2VzID0gMC41IC0gbGVuZ3RoKHZVdiAtIDAuNSk7XFxuICBnbF9GcmFnQ29sb3IgPSBjb2xvciAqIGVkZ2VzICogdmVjNCgxLjAsIDEuMCwgMS4wLCB0ZXhlbC53ICogdGV4ZWwudyAqIDIuNSk7XFxufVwiLCBbe1wibmFtZVwiOlwidGltZVwiLFwidHlwZVwiOlwiZmxvYXRcIn0se1wibmFtZVwiOlwiY29sb3JcIixcInR5cGVcIjpcInZlYzRcIn0se1wibmFtZVwiOlwib2Zmc2V0XCIsXCJ0eXBlXCI6XCJ2ZWMyXCJ9LHtcIm5hbWVcIjpcInRleHR1cmVcIixcInR5cGVcIjpcInNhbXBsZXIyRFwifV0sIFtdKSk7XG4gICAgc2hhZGVyLnNpZGUgPSBUSFJFRS5CYWNrU2lkZTtcblxuICAgIHNoYWRlci51bmlmb3JtcyA9IHtcbiAgICAgICAgdGltZToge1xuICAgICAgICAgICAgdHlwZTogXCJmXCIsXG4gICAgICAgICAgICB2YWx1ZTogMFxuICAgICAgICB9LFxuXG4gICAgICAgIHRleHR1cmU6IHtcbiAgICAgICAgICAgIHR5cGU6IFwidFwiLFxuICAgICAgICAgICAgdmFsdWU6IG51bGxcbiAgICAgICAgfSxcblxuICAgICAgICBvZmZzZXQ6IHtcbiAgICAgICAgICAgIHR5cGU6IFwidjJcIixcbiAgICAgICAgICAgIHZhbHVlOiBjb25maWcub2Zmc2V0XG4gICAgICAgIH0sXG5cbiAgICAgICAgY29sb3I6IHtcbiAgICAgICAgICAgIHR5cGU6IFwidjRcIixcbiAgICAgICAgICAgIHZhbHVlOiBjb25maWcuY29sb3JcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoc2hhZGVyKTtcbiAgICBtYXRlcmlhbC50cmFuc3BhcmVudCA9IHRydWU7XG4gICAgbWF0ZXJpYWwuYmxlbmRpbmcgPSBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nO1xuICAgIG1hdGVyaWFsLnNpZGUgPSBUSFJFRS5Eb3VibGVTaWRlO1xuICAgIG1hdGVyaWFsLmRlcHRoVGVzdCA9IGZhbHNlO1xuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcbiAgICBtZXNoLnJvdGF0aW9uLnggPSBjb25maWcucm90YXRpb247XG4gICAgbWVzaC5wb3NpdGlvbi55ID0gY29uZmlnLmhlaWdodDtcbiAgICBtZXNoLnNjYWxlLm11bHRpcGx5U2NhbGFyKDEwKTtcbiAgICBzaGFkZXIudW5pZm9ybXMudGV4dHVyZS52YWx1ZSA9IHNldHVwVGV4dHVyZShtZXNoLCBwb2VtLnNjZW5lKTtcblxuICAgIHBvZW0ub24oXCJ1cGRhdGVcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgY2FtZXJhUG9zaXRpb24gPSBwb2VtLmNhbWVyYS5vYmplY3QucG9zaXRpb247XG4gICAgICAgIHNoYWRlci51bmlmb3Jtcy50aW1lLnZhbHVlID0gZS50aW1lO1xuICAgICAgICBtZXNoLnBvc2l0aW9uLnNldChjYW1lcmFQb3NpdGlvbi54LCBtZXNoLnBvc2l0aW9uLnksIGNhbWVyYVBvc2l0aW9uLnopO1xuICAgIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDbG91ZHM7IiwidmFyIGdsc2xpZnkgPSByZXF1aXJlKFwiZ2xzbGlmeVwiKTtcbnZhciBjcmVhdGVTaGFkZXIgPSByZXF1aXJlKFwidGhyZWUtZ2xzbGlmeVwiKShUSFJFRSk7XG5cbnZhciBTa3kgPSBmdW5jdGlvbihwb2VtLCBwcm9wZXJ0aWVzKSB7XG4gICAgdmFyIGNvbmZpZyA9IF8uZXh0ZW5kKHtcbiAgICAgICAgd2lkdGg6IDUwMDBcbiAgICB9LCBwcm9wZXJ0aWVzKTtcblxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeShjb25maWcud2lkdGgsIDMyLCAxNSk7XG4gICAgdmFyIHNoYWRlciA9IGNyZWF0ZVNoYWRlcihyZXF1aXJlKFwiZ2xzbGlmeS9zaW1wbGUtYWRhcHRlci5qc1wiKShcIlxcbiNkZWZpbmUgR0xTTElGWSAxXFxuXFxudW5pZm9ybSBmbG9hdCB0aW1lO1xcbnZhcnlpbmcgdmVjNCB2Q29sb3I7XFxudmFyeWluZyB2ZWMyIHZVdjtcXG52ZWM0IGFfeF9tb2QyODkodmVjNCB4KSB7XFxuICByZXR1cm4geCAtIGZsb29yKHggKiAoMS4wIC8gMjg5LjApKSAqIDI4OS4wO1xcbn1cXG5mbG9hdCBhX3hfbW9kMjg5KGZsb2F0IHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcbnZlYzQgYV94X3Blcm11dGUodmVjNCB4KSB7XFxuICByZXR1cm4gYV94X21vZDI4OSgoKHggKiAzNC4wKSArIDEuMCkgKiB4KTtcXG59XFxuZmxvYXQgYV94X3Blcm11dGUoZmxvYXQgeCkge1xcbiAgcmV0dXJuIGFfeF9tb2QyODkoKCh4ICogMzQuMCkgKyAxLjApICogeCk7XFxufVxcbnZlYzQgYV94X3RheWxvckludlNxcnQodmVjNCByKSB7XFxuICByZXR1cm4gMS43OTI4NDI5MTQwMDE1OSAtIDAuODUzNzM0NzIwOTUzMTQgKiByO1xcbn1cXG5mbG9hdCBhX3hfdGF5bG9ySW52U3FydChmbG9hdCByKSB7XFxuICByZXR1cm4gMS43OTI4NDI5MTQwMDE1OSAtIDAuODUzNzM0NzIwOTUzMTQgKiByO1xcbn1cXG52ZWM0IGFfeF9ncmFkNChmbG9hdCBqLCB2ZWM0IGlwKSB7XFxuICBjb25zdCB2ZWM0IG9uZXMgPSB2ZWM0KDEuMCwgMS4wLCAxLjAsIC0xLjApO1xcbiAgdmVjNCBwLCBzO1xcbiAgcC54eXogPSBmbG9vcihmcmFjdCh2ZWMzKGopICogaXAueHl6KSAqIDcuMCkgKiBpcC56IC0gMS4wO1xcbiAgcC53ID0gMS41IC0gZG90KGFicyhwLnh5eiksIG9uZXMueHl6KTtcXG4gIHMgPSB2ZWM0KGxlc3NUaGFuKHAsIHZlYzQoMC4wKSkpO1xcbiAgcC54eXogPSBwLnh5eiArIChzLnh5eiAqIDIuMCAtIDEuMCkgKiBzLnd3dztcXG4gIHJldHVybiBwO1xcbn1cXG4jZGVmaW5lIEY0IDAuMzA5MDE2OTk0Mzc0OTQ3NDUxXFxuXFxuZmxvYXQgYV94X3Nub2lzZSh2ZWM0IHYpIHtcXG4gIGNvbnN0IHZlYzQgQyA9IHZlYzQoMC4xMzgxOTY2MDExMjUwMTEsIDAuMjc2MzkzMjAyMjUwMDIxLCAwLjQxNDU4OTgwMzM3NTAzMiwgLTAuNDQ3MjEzNTk1NDk5OTU4KTtcXG4gIHZlYzQgaSA9IGZsb29yKHYgKyBkb3QodiwgdmVjNChGNCkpKTtcXG4gIHZlYzQgeDAgPSB2IC0gaSArIGRvdChpLCBDLnh4eHgpO1xcbiAgdmVjNCBpMDtcXG4gIHZlYzMgaXNYID0gc3RlcCh4MC55encsIHgwLnh4eCk7XFxuICB2ZWMzIGlzWVogPSBzdGVwKHgwLnp3dywgeDAueXl6KTtcXG4gIGkwLnggPSBpc1gueCArIGlzWC55ICsgaXNYLno7XFxuICBpMC55encgPSAxLjAgLSBpc1g7XFxuICBpMC55ICs9IGlzWVoueCArIGlzWVoueTtcXG4gIGkwLnp3ICs9IDEuMCAtIGlzWVoueHk7XFxuICBpMC56ICs9IGlzWVouejtcXG4gIGkwLncgKz0gMS4wIC0gaXNZWi56O1xcbiAgdmVjNCBpMyA9IGNsYW1wKGkwLCAwLjAsIDEuMCk7XFxuICB2ZWM0IGkyID0gY2xhbXAoaTAgLSAxLjAsIDAuMCwgMS4wKTtcXG4gIHZlYzQgaTEgPSBjbGFtcChpMCAtIDIuMCwgMC4wLCAxLjApO1xcbiAgdmVjNCB4MSA9IHgwIC0gaTEgKyBDLnh4eHg7XFxuICB2ZWM0IHgyID0geDAgLSBpMiArIEMueXl5eTtcXG4gIHZlYzQgeDMgPSB4MCAtIGkzICsgQy56enp6O1xcbiAgdmVjNCB4NCA9IHgwICsgQy53d3d3O1xcbiAgaSA9IGFfeF9tb2QyODkoaSk7XFxuICBmbG9hdCBqMCA9IGFfeF9wZXJtdXRlKGFfeF9wZXJtdXRlKGFfeF9wZXJtdXRlKGFfeF9wZXJtdXRlKGkudykgKyBpLnopICsgaS55KSArIGkueCk7XFxuICB2ZWM0IGoxID0gYV94X3Blcm11dGUoYV94X3Blcm11dGUoYV94X3Blcm11dGUoYV94X3Blcm11dGUoaS53ICsgdmVjNChpMS53LCBpMi53LCBpMy53LCAxLjApKSArIGkueiArIHZlYzQoaTEueiwgaTIueiwgaTMueiwgMS4wKSkgKyBpLnkgKyB2ZWM0KGkxLnksIGkyLnksIGkzLnksIDEuMCkpICsgaS54ICsgdmVjNChpMS54LCBpMi54LCBpMy54LCAxLjApKTtcXG4gIHZlYzQgaXAgPSB2ZWM0KDEuMCAvIDI5NC4wLCAxLjAgLyA0OS4wLCAxLjAgLyA3LjAsIDAuMCk7XFxuICB2ZWM0IHAwID0gYV94X2dyYWQ0KGowLCBpcCk7XFxuICB2ZWM0IHAxID0gYV94X2dyYWQ0KGoxLngsIGlwKTtcXG4gIHZlYzQgcDIgPSBhX3hfZ3JhZDQoajEueSwgaXApO1xcbiAgdmVjNCBwMyA9IGFfeF9ncmFkNChqMS56LCBpcCk7XFxuICB2ZWM0IHA0ID0gYV94X2dyYWQ0KGoxLncsIGlwKTtcXG4gIHZlYzQgbm9ybSA9IGFfeF90YXlsb3JJbnZTcXJ0KHZlYzQoZG90KHAwLCBwMCksIGRvdChwMSwgcDEpLCBkb3QocDIsIHAyKSwgZG90KHAzLCBwMykpKTtcXG4gIHAwICo9IG5vcm0ueDtcXG4gIHAxICo9IG5vcm0ueTtcXG4gIHAyICo9IG5vcm0uejtcXG4gIHAzICo9IG5vcm0udztcXG4gIHA0ICo9IGFfeF90YXlsb3JJbnZTcXJ0KGRvdChwNCwgcDQpKTtcXG4gIHZlYzMgbTAgPSBtYXgoMC42IC0gdmVjMyhkb3QoeDAsIHgwKSwgZG90KHgxLCB4MSksIGRvdCh4MiwgeDIpKSwgMC4wKTtcXG4gIHZlYzIgbTEgPSBtYXgoMC42IC0gdmVjMihkb3QoeDMsIHgzKSwgZG90KHg0LCB4NCkpLCAwLjApO1xcbiAgbTAgPSBtMCAqIG0wO1xcbiAgbTEgPSBtMSAqIG0xO1xcbiAgcmV0dXJuIDQ5LjAgKiAoZG90KG0wICogbTAsIHZlYzMoZG90KHAwLCB4MCksIGRvdChwMSwgeDEpLCBkb3QocDIsIHgyKSkpICsgZG90KG0xICogbTEsIHZlYzIoZG90KHAzLCB4MyksIGRvdChwNCwgeDQpKSkpO1xcbn1cXG52ZWMzIGJfeF9oc3YycmdiKHZlYzMgYykge1xcbiAgdmVjNCBLID0gdmVjNCgxLjAsIDIuMCAvIDMuMCwgMS4wIC8gMy4wLCAzLjApO1xcbiAgdmVjMyBwID0gYWJzKGZyYWN0KGMueHh4ICsgSy54eXopICogNi4wIC0gSy53d3cpO1xcbiAgcmV0dXJuIGMueiAqIG1peChLLnh4eCwgY2xhbXAocCAtIEsueHh4LCAwLjAsIDEuMCksIGMueSk7XFxufVxcbmZsb2F0IGluUmFuZ2UoaW4gZmxvYXQgdmFsdWUsIGluIGZsb2F0IHN0YXJ0LCBpbiBmbG9hdCBzdG9wKSB7XFxuICByZXR1cm4gbWluKDEuMCwgbWF4KDAuMCwgKHZhbHVlIC0gc3RhcnQpIC8gKHN0b3AgLSBzdGFydCkpKTtcXG59XFxudmVjNCBjYWxjdWxhdGVDb2xvcihpbiB2ZWMyIHV2LCBpbiB2ZWMzIHBvc2l0aW9uKSB7XFxuICBmbG9hdCBncmFkaWVudCA9IGluUmFuZ2UodXYueSwgMC41NSwgMC43KSArIGluUmFuZ2UodXYueSwgMC40NSwgMC4zKTtcXG4gIGZsb2F0IG5vaXNlID0gYV94X3Nub2lzZSh2ZWM0KHBvc2l0aW9uICogMC4wMywgdGltZSAqIDAuMDAwMSkpO1xcbiAgdmVjMyBjb2xvciA9IGJfeF9oc3YycmdiKHZlYzMobWF4KDAuMCwgbm9pc2UpICogMC4yICsgMC40LCAxLjAsIDEuMCkpO1xcbiAgcmV0dXJuIHZlYzQoY29sb3IsIG5vaXNlICogZ3JhZGllbnQpO1xcbn1cXG52b2lkIG1haW4oKSB7XFxuICB2VXYgPSB1djtcXG4gIHZDb2xvciA9IGNhbGN1bGF0ZUNvbG9yKHV2LCBwb3NpdGlvbik7XFxuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApO1xcbn1cIiwgXCJcXG4jZGVmaW5lIEdMU0xJRlkgMVxcblxcbnZhcnlpbmcgdmVjNCB2Q29sb3I7XFxudm9pZCBtYWluKCkge1xcbiAgZ2xfRnJhZ0NvbG9yID0gdkNvbG9yO1xcbn1cIiwgW3tcIm5hbWVcIjpcInRpbWVcIixcInR5cGVcIjpcImZsb2F0XCJ9XSwgW10pKTtcbiAgICBzaGFkZXIuc2lkZSA9IFRIUkVFLkJhY2tTaWRlO1xuXG4gICAgc2hhZGVyLnVuaWZvcm1zID0ge1xuICAgICAgICB0aW1lOiB7XG4gICAgICAgICAgICB0eXBlOiBcImZcIixcbiAgICAgICAgICAgIHZhbHVlOiAwXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKHNoYWRlcik7XG4gICAgbWF0ZXJpYWwudHJhbnNwYXJlbnQgPSB0cnVlO1xuICAgIG1hdGVyaWFsLmJsZW5kaW5nID0gVEhSRUUuQWRkaXRpdmVCbGVuZGluZztcbiAgICBtYXRlcmlhbC5kZXB0aFRlc3QgPSBmYWxzZTtcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG4gICAgcG9lbS5zY2VuZS5hZGQobWVzaCk7XG5cbiAgICBwb2VtLm9uKFwidXBkYXRlXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgc2hhZGVyLnVuaWZvcm1zLnRpbWUudmFsdWUgPSBlLnRpbWU7XG4gICAgICAgIG1lc2gucG9zaXRpb24uY29weShwb2VtLmNhbWVyYS5vYmplY3QucG9zaXRpb24pO1xuICAgIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTa3k7IiwidmFyIENhbWVyYSA9IGZ1bmN0aW9uKCBwb2VtLCBwcm9wZXJ0aWVzICkge1xuXHRcblx0dGhpcy5wb2VtID0gcG9lbTtcblx0XHRcblx0dGhpcy5vYmplY3QgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoXG5cdFx0cHJvcGVydGllcy5mb3YgfHwgNTAsXHRcdFx0XHRcdC8vIGZvdlxuXHRcdHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0LFx0Ly8gYXNwZWN0IHJhdGlvXG5cdFx0cHJvcGVydGllcy5uZWFyIHx8IDMsXHRcdFx0XHRcdC8vIG5lYXIgZnJ1c3R1bVxuXHRcdHByb3BlcnRpZXMuZmFyIHx8IDEwMDAwXHRcdFx0XHRcdC8vIGZhciBmcnVzdHVtXG5cdCk7XG5cdFxuXHR0aGlzLm9iamVjdC5wb3NpdGlvbi54ID0gXy5pc051bWJlciggcHJvcGVydGllcy54ICkgPyBwcm9wZXJ0aWVzLnggOiAwO1xuXHR0aGlzLm9iamVjdC5wb3NpdGlvbi55ID0gXy5pc051bWJlciggcHJvcGVydGllcy55ICkgPyBwcm9wZXJ0aWVzLnkgOiAwO1xuXHR0aGlzLm9iamVjdC5wb3NpdGlvbi56ID0gXy5pc051bWJlciggcHJvcGVydGllcy56ICkgPyBwcm9wZXJ0aWVzLnogOiA1MDA7XG5cdFxuXHR0aGlzLnBvZW0uc2NlbmUuYWRkKCB0aGlzLm9iamVjdCApO1xuXHRcblx0dGhpcy5wb2VtLm9uKCAncmVzaXplJywgdGhpcy5yZXNpemUuYmluZCh0aGlzKSApO1xuXHRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FtZXJhO1xuXG5DYW1lcmEucHJvdG90eXBlID0ge1xuXHRcblx0cmVzaXplIDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5vYmplY3QuYXNwZWN0ID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cdFx0dGhpcy5vYmplY3QudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuXHR9XG59OyIsInZhciBPcmJpdENvbnRyb2xzID0gcmVxdWlyZSgnLi4vLi4vdmVuZG9yL09yYml0Q29udHJvbHMnKTtcblxudmFyIENvbnRyb2xzID0gZnVuY3Rpb24oIHBvZW0sIHByb3BlcnRpZXMgKSB7XG5cdFxuXHR0aGlzLnBvZW0gPSBwb2VtO1xuXHR0aGlzLnByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzO1xuXG5cdHRoaXMuY29udHJvbHMgPSBuZXcgT3JiaXRDb250cm9scyggdGhpcy5wb2VtLmNhbWVyYS5vYmplY3QsIHRoaXMucG9lbS5jYW52YXMgKTtcblx0XG5cdF8uZXh0ZW5kKCB0aGlzLmNvbnRyb2xzLCBwcm9wZXJ0aWVzICk7XG5cdFxuXHR0aGlzLnBvZW0ub24oICd1cGRhdGUnLCB0aGlzLmNvbnRyb2xzLnVwZGF0ZS5iaW5kKCB0aGlzLmNvbnRyb2xzICkgKTtcblx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xzO1xuIiwidmFyIE9yYml0Q29udHJvbHMgPSByZXF1aXJlKCcuLi8uLi92ZW5kb3IvT3JiaXRDb250cm9scycpO1xudmFyIERldmljZU9yaWVudGF0aW9uQ29udHJvbHMgPSByZXF1aXJlKCcuLi8uLi92ZW5kb3IvRGV2aWNlT3JpZW50YXRpb25Db250cm9scycpO1xudmFyIF9lO1xuXG4kKHdpbmRvdykub25lKCAnZGV2aWNlb3JpZW50YXRpb24nLCBmdW5jdGlvbiggZSApIHtcblx0X2UgPSBlO1xufSk7XG5cblxudmFyIE9yaWVudGF0aW9uID0gZnVuY3Rpb24oIHBvZW0gKSB7XG5cdFxuXHR0aGlzLnBvZW0gPSBwb2VtO1xuXHR0aGlzLmNhbWVyYSA9IHRoaXMucG9lbS5jYW1lcmEub2JqZWN0O1xuXHRcblx0dGhpcy5jb250cm9scyA9IG5ldyBPcmJpdENvbnRyb2xzKCB0aGlzLmNhbWVyYSwgdGhpcy5wb2VtLmNhbnZhcyApO1xuXHR0aGlzLmNvbnRyb2xzLnJvdGF0ZVVwKE1hdGguUEkgLyA0KTtcblx0dGhpcy5jb250cm9scy50YXJnZXQuc2V0KFxuXHRcdHRoaXMuY2FtZXJhLnBvc2l0aW9uLnggKyAwLjEsXG5cdFx0dGhpcy5jYW1lcmEucG9zaXRpb24ueSxcblx0XHR0aGlzLmNhbWVyYS5wb3NpdGlvbi56XG5cdCk7XG5cdHRoaXMuY29udHJvbHMubm9ab29tID0gdHJ1ZTtcblx0dGhpcy5jb250cm9scy5ub1BhbiA9IHRydWU7XG5cblx0dGhpcy5kZXZpY2VPcmllbnRhdGlvbkhhbmRsZXIgPSB0aGlzLnNldE9yaWVudGF0aW9uQ29udHJvbHMuYmluZCh0aGlzKTtcblxuXHQkKHdpbmRvdykub24oICdkZXZpY2VvcmllbnRhdGlvbicsIHRoaXMuZGV2aWNlT3JpZW50YXRpb25IYW5kbGVyICk7XG5cdFxuXHR0aGlzLnBvZW0ub24oICd1cGRhdGUnLCB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpICk7XG5cdHRoaXMucG9lbS5vbiggJ2Rlc3Ryb3knLCB0aGlzLmRlc3Ryb3kuYmluZCh0aGlzKSApO1xuXHRcblx0aWYoIF9lICkgdGhpcy5zZXRPcmllbnRhdGlvbkNvbnRyb2xzKCBfZSApO1xuXHRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gT3JpZW50YXRpb247XG5cbk9yaWVudGF0aW9uLnByb3RvdHlwZSA9IHtcblxuXHRzZXRPcmllbnRhdGlvbkNvbnRyb2xzIDogZnVuY3Rpb24oIGUgKSB7XG5cdFx0Ly8gaWYoICFlLm9yaWdpbmFsRXZlbnQuYWxwaGEgKSB7XG5cdFx0Ly8gXHRyZXR1cm47XG5cdFx0Ly8gfVxuXG5cdFx0dGhpcy5jb250cm9scyA9IG5ldyBEZXZpY2VPcmllbnRhdGlvbkNvbnRyb2xzKCB0aGlzLmNhbWVyYSwgdHJ1ZSApO1xuXHRcdHRoaXMuY29udHJvbHMuY29ubmVjdCgpO1xuXHRcdHRoaXMuY29udHJvbHMudXBkYXRlKCk7XG5cblx0XHQkKHdpbmRvdykub2ZmKCAnZGV2aWNlb3JpZW50YXRpb24nLCB0aGlzLmRldmljZU9yaWVudGF0aW9uSGFuZGxlciApO1xuXHR9LFxuXHRcblx0dXBkYXRlIDogZnVuY3Rpb24oIGUgKSB7XG5cdFx0dGhpcy5jb250cm9scy51cGRhdGUoKTtcblx0fSxcblx0XG5cdGRlc3Ryb3kgOiBmdW5jdGlvbiggZSApIHtcblx0XHQkKHdpbmRvdykub2ZmKCAnZGV2aWNlb3JpZW50YXRpb24nLCB0aGlzLmRldmljZU9yaWVudGF0aW9uSGFuZGxlciApO1xuXHR9XG5cdFxufTsiLCJ2YXIgUm90YXRlQXJvdW5kT3JpZ2luID0gZnVuY3Rpb24oIHBvZW0gKSB7XG5cdFxuXHR2YXIgY2FtZXJhID0gcG9lbS5jYW1lcmEub2JqZWN0O1xuXHR2YXIgc3BlZWQgPSAwLjAwMDA1O1xuXHR2YXIgYmFzZVkgPSBjYW1lcmEucG9zaXRpb24ueTtcblx0dmFyIGJhc2VaID0gY2FtZXJhLnBvc2l0aW9uLnogLyAyO1xuXHRcblx0cG9lbS5vbigndXBkYXRlJywgZnVuY3Rpb24oIGUgKSB7XG5cdFx0XG5cdFx0cG9lbS5ncmlkLmdyaWQucm90YXRpb24ueSArPSBlLmR0ICogc3BlZWQ7XG5cdFx0aWYoIHBvZW0ucG9pbnRjbG91ZC5vYmplY3QgKSB7XG5cdFx0XHRwb2VtLnBvaW50Y2xvdWQub2JqZWN0LnJvdGF0aW9uLnkgKz0gZS5kdCAqIHNwZWVkO1xuXHRcdH1cblx0XHRcblx0XHRjYW1lcmEucG9zaXRpb24ueSA9IGJhc2VZICsgTWF0aC5zaW4oIGUudGltZSAqIHNwZWVkICogMTAgKSAqIDIwMDtcblx0XHRjYW1lcmEucG9zaXRpb24ueiA9IGJhc2VZICsgTWF0aC5zaW4oIGUudGltZSAqIHNwZWVkICogMTAgKSAqIGJhc2VaO1xuXHRcdFxuXHRcdFxuXHR9KTtcblx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJvdGF0ZUFyb3VuZE9yaWdpbjtcblxuUm90YXRlQXJvdW5kT3JpZ2luLnByb3RvdHlwZSA9IHtcblxufTsiLCJ2YXIgVHJhY2tDYW1lcmFMaWdodHMgPSBmdW5jdGlvbiggcG9lbSwgcHJvcGVydGllcyApIHtcblx0XG5cdHRoaXMubGlnaHRzID0gW107XG5cdFxuXHR2YXIgYW1iaWVudCA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoIDB4MTExMTExLCAxLCAwICk7XG5cdFx0YW1iaWVudC5wb3NpdGlvbi5zZXQoMCwgMjAwMCwgMTAwMCk7XG5cdFxuXHR2YXIgZnJvbnQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCggMHhmZmZmZmYsIDAuMywgMCApO1xuXG5cdHZhciByaWdodEZpbGwgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCggMHhmZmZmZmYsIDEsIDAgKTtcblx0XHRyaWdodEZpbGwucG9zaXRpb24uc2V0KDMwMDAsIDIwMDAsIDUwMDApO1xuXHRcblx0dmFyIHJpbUJvdHRvbSA9IG5ldyBUSFJFRS5Qb2ludExpZ2h0KCAweGZmZmZmZiwgMSwgMCApO1xuXHRcdHJpbUJvdHRvbS5wb3NpdGlvbi5zZXQoLTEwMDAsIC0xMDAwLCAtMTAwMCk7XG5cdFx0XG5cdHZhciByaW1CYWNrTGVmdCA9IG5ldyBUSFJFRS5Qb2ludExpZ2h0KCAweGZmZmZmZiwgMiwgMCApO1xuXHRcdHJpbUJhY2tMZWZ0LnBvc2l0aW9uLnNldCgtNzAwLCA1MDAsIC0xMDAwKTtcblx0XG5cdHBvZW0uc2NlbmUuYWRkKCBhbWJpZW50ICk7XG5cdC8vIHBvZW0uY2FtZXJhLm9iamVjdC5hZGQoIGZyb250ICk7XG5cdHBvZW0uY2FtZXJhLm9iamVjdC5hZGQoIHJpZ2h0RmlsbCApO1xuXHRwb2VtLmNhbWVyYS5vYmplY3QuYWRkKCByaW1Cb3R0b20gKTtcblx0cG9lbS5jYW1lcmEub2JqZWN0LmFkZCggcmltQmFja0xlZnQgKTtcblx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYWNrQ2FtZXJhTGlnaHRzO1xuXG5UcmFja0NhbWVyYUxpZ2h0cy5wcm90b3R5cGUgPSB7XG5cbn07IiwidmFyIE1yRG9vYlN0YXRzID0gcmVxdWlyZSgnLi4vLi4vdmVuZG9yL1N0YXRzJyk7XG5cbnZhciBTdGF0cyA9IGZ1bmN0aW9uKCBwb2VtICkge1xuXHRcblx0dGhpcy5wb2VtID0gcG9lbTtcblx0XG5cdHRoaXMuc3RhdHMgPSBuZXcgTXJEb29iU3RhdHMoKTtcblx0dGhpcy5zdGF0cy5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcblx0dGhpcy5zdGF0cy5kb21FbGVtZW50LnN0eWxlLnRvcCA9ICcwcHgnO1xuXHQkKCB0aGlzLnBvZW0uZGl2ICkuYXBwZW5kKCB0aGlzLnN0YXRzLmRvbUVsZW1lbnQgKTtcblx0XG5cdHRoaXMucG9lbS5vbiggJ3VwZGF0ZScsIHRoaXMuc3RhdHMudXBkYXRlLmJpbmQoIHRoaXMuc3RhdHMgKSApO1xuXHRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhdHM7IiwidmFyIHJhbmRvbSA9IHJlcXVpcmUoJy4uL3V0aWxzL3JhbmRvbScpXG4gICwgbG9hZFRleHR1cmVcdD0gcmVxdWlyZSgnLi4vdXRpbHMvbG9hZFRleHR1cmUnKVxuICAsIFJTVlAgPSByZXF1aXJlKCdyc3ZwJyk7XG5cbnZhciBFYXJ0aCA9IGZ1bmN0aW9uKHBvZW0sIHByb3BlcnRpZXMpIHtcblx0XG5cdHRoaXMucG9lbSA9IHBvZW07XG5cdFxuXHR0aGlzLmdlb21ldHJ5ID0gbnVsbDtcblx0dGhpcy5tYXRlcmlhbCA9IG51bGw7XG4gICAgdGhpcy5tZXNoID0gbnVsbDtcblx0dGhpcy50ZXh0dXJlID0gbnVsbDtcblx0XG5cdCQoJyNMZXZlbFNlbGVjdCcpLmhpZGUoKTtcblx0XG5cdHRoaXMucmFkaXVzID0gcHJvcGVydGllcy5yYWRpdXMgPiAwID8gcHJvcGVydGllcy5yYWRpdXMgOiAyNTA7XG5cblx0dmFyICRhID0gJChcIjxhIGhyZWY9J2h0dHA6Ly9zdnMuZ3NmYy5uYXNhLmdvdi9jZ2ktYmluL2RldGFpbHMuY2dpP2FpZD0xMTcxOSc+PC9hPlwiKTtcblx0JGEuYXBwZW5kKCAkKFwiPGltZyBjbGFzcz0nbmFzYS1sb2dvIHdpZGUnIHNyYz0nYXNzZXRzL2ltYWdlcy9uYXNhLWdvZGRhcmQucG5nJyAvPlwiKSApO1xuXHQkYS5hdHRyKFwidGl0bGVcIiwgXCJNYXAgdmlzdWFsaXphdGlvbiBjcmVkaXQgdG8gTkFTQSdzIEdvZGRhcmQgU3BhY2UgRmxpZ2h0IENlbnRlclwiKTtcblx0XG5cdHRoaXMucG9lbS4kZGl2LmFwcGVuZCggJGEgKTtcblx0XG5cdHRoaXMuc3RhcnQoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRWFydGg7XG5cbkVhcnRoLnByb3RvdHlwZSA9IHtcblx0XG5cdHN0YXJ0IDogZnVuY3Rpb24oKSB7XG5cdFx0XG5cdFx0dGhpcy5jcmVhdGVUZXh0dXJlKCk7XG5cblx0XHR0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KCB0aGlzLnJhZGl1cywgNjQsIDY0ICk7XG5cdFx0dGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG5cdFx0XHRtYXA6IHRoaXMudGV4dHVyZSxcblx0XHRcdHNoaW5pbmVzczogMjUsXG5cdFx0XHRzcGVjdWxhcjogMHgxMTExMTEsXG5cdFx0XHQvLyBjb2xvcjogMHhmZjAwMDBcblx0XHR9KTtcblx0XG5cdFx0dGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goIHRoaXMuZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwgKTtcblx0XG5cdFx0dGhpcy5wb2VtLnNjZW5lLmFkZCggdGhpcy5tZXNoICk7XG5cdFxuXHRcdHRoaXMucG9lbS5vbiggJ3VwZGF0ZScsIHRoaXMudXBkYXRlLmJpbmQodGhpcykgKTtcblx0XHRcblx0fSxcblx0XG5cdGNyZWF0ZVRleHR1cmUgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHR0aGlzLnZpZGVvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ3ZpZGVvJyApO1xuXHRcdHRoaXMuJHZpZGVvID0gJCh0aGlzLnZpZGVvKTtcblxuXHRcdC8vIHRoaXMudmlkZW8ubXV0ZWQgPSB0cnVlO1xuXHRcdHRoaXMudmlkZW8uY29udHJvbHMgPSB0cnVlO1xuXHRcdHRoaXMudmlkZW8ubG9vcCA9IHRydWU7XG5cdFx0XG5cdFx0Ly8gdGhpcy5wb2VtLiRkaXYuYXBwZW5kKCB0aGlzLnZpZGVvICk7XG5cdFx0XG5cdFx0Ly8gdGhpcy4kdmlkZW8uY3NzKHtcblx0XHQvLyBcdHBvc2l0aW9uOiBcImFic29sdXRlXCIsXG5cdFx0Ly8gXHR0b3A6IDAsXG5cdFx0Ly8gXHRsZWZ0OiAwXG5cdFx0Ly8gfSk7XG5cdFx0XG5cdFx0Ly8gd2luZG93LnYgPSB0aGlzLnZpZGVvO1xuXHRcdFxuXHRcdFxuXHRcdC8vIHZpZGVvLmlkID0gJ3ZpZGVvJztcblx0XHQvLyB2aWRlby50eXBlID0gJyB2aWRlby9vZ2c7IGNvZGVjcz1cInRoZW9yYSwgdm9yYmlzXCIgJztcblx0XHQvLyB0aGlzLnZpZGVvLnNyYyA9IFwiYXNzZXRzL3ZpZGVvL2VhcnRoY28yLm00dlwiO1xuXHRcdFxuXHRcdFx0XG5cdFx0aWYoIHRoaXMudmlkZW8uY2FuUGxheVR5cGUoXCJ2aWRlby9tcDRcIikgKSB7XG5cdFx0XHRcblx0XHRcdHRoaXMudmlkZW8uc3JjID0gXCJhc3NldHMvdmlkZW8vZWFydGhjbzItbGFyZ2UubXA0XCI7XG5cdFx0XHRcblx0XHR9IGVsc2Uge1xuXHRcdFx0XG5cdFx0XHR0aGlzLnZpZGVvLnNyYyA9IFwiYXNzZXRzL3ZpZGVvL2VhcnRoY28yLndlYm1cIjtcblx0XHRcdFxuXHRcdH1cblx0XHRcdFxuXHRcdFx0XHRcblx0XHRcblx0XHR0aGlzLnZpZGVvLmxvYWQoKTsgLy8gbXVzdCBjYWxsIGFmdGVyIHNldHRpbmcvY2hhbmdpbmcgc291cmNlXG5cdFx0dGhpcy52aWRlby5wbGF5KCk7XG5cdFxuXHRcdHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcblx0XHQvLyB0aGlzLmNhbnZhcy53aWR0aCA9IDk2MDtcblx0XHQvLyB0aGlzLmNhbnZhcy5oZWlnaHQgPSA0ODA7XG5cdFx0dGhpcy5jYW52YXMud2lkdGggPSAxOTIwO1xuXHRcdHRoaXMuY2FudmFzLmhlaWdodCA9IDk2MDtcblxuXG5cdFx0dGhpcy5jdHgyZCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcblx0XHQvLyBiYWNrZ3JvdW5kIGNvbG9yIGlmIG5vIHZpZGVvIHByZXNlbnRcblx0XHR0aGlzLmN0eDJkLmZpbGxTdHlsZSA9ICcjMDAwMDAwJztcblx0XHR0aGlzLmN0eDJkLmZpbGxSZWN0KCAwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0ICk7XG5cblx0XHR0aGlzLnRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZSggdGhpcy5jYW52YXMgKTtcblx0XHR0aGlzLnRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuXHRcdHRoaXMudGV4dHVyZS5tYWdGaWx0ZXIgPSBUSFJFRS5MaW5lYXJGaWx0ZXI7XG5cdFx0XG5cdH0sXG5cdFxuXHRlcnJvciA6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHR9LFxuXHRcblx0dXBkYXRlIDogZnVuY3Rpb24oZSkge1xuXHRcdFxuXHRcdGlmICggdGhpcy52aWRlby5yZWFkeVN0YXRlID09PSB0aGlzLnZpZGVvLkhBVkVfRU5PVUdIX0RBVEEgKSB7XG5cdFx0XHRcblx0XHRcdHRoaXMuY3R4MmQuZHJhd0ltYWdlKCB0aGlzLnZpZGVvLCAwLCAwICk7XG5cdFx0XHRcblx0XHRcdGlmICggdGhpcy50ZXh0dXJlICkgdGhpcy50ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblx0XHRcdFxuXHRcdH1cblx0XHRcblx0XHR0aGlzLm1lc2gucm90YXRpb24ueSArPSBlLmR0ICogMC4wMDAwNTtcblx0XHRcblx0fVxuXHRcbn07IiwiZnVuY3Rpb24gdXBkYXRlQ2FtZXJhKCBjYW1lcmEgKSB7XG5cblx0cmV0dXJuIGZ1bmN0aW9uKGUpIHtcblx0XHRjYW1lcmEub2JqZWN0LnBvc2l0aW9uLnogLT0gMTtcblx0fTtcbn1cblxuZnVuY3Rpb24gbW91c2VEb3duKCBjYW52YXMsIGNhbWVyYU9iaiwgcG9lbSApIHtcblx0XG5cdHdpbmRvdy5jYW1lcmFPYmogPSBjYW1lcmFPYmo7XG5cdFxuXHR2YXIgcHgsIHB5O1xuXG5cdHZhciAkY2FudmFzID0gJChjYW52YXMpO1xuXHRcblx0dmFyIGRyYWdNb3VzZUhhbmRsZXIgPSAoZnVuY3Rpb24oKSB7XG5cdFx0XG5cdFx0dmFyIGF4aXNYID0gbmV3IFRIUkVFLlZlY3RvcjMoMSwwLDApO1xuXHRcdHZhciBheGlzWSA9IG5ldyBUSFJFRS5WZWN0b3IzKDAsMSwwKTtcblx0XHRcblx0XHR2YXIgcTEgPSBuZXcgVEhSRUUuUXVhdGVybmlvbigpO1xuXHRcdHZhciBxMiA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKCk7XG5cdFx0XG5cdFx0dmFyIHJvdGF0aW9uWCA9IDA7XG5cdFx0dmFyIHJvdGF0aW9uWSA9IDA7XG5cdFx0XG5cdFx0XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKCBlICkge1xuXHRcdFx0XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFxuXHRcdFx0dmFyIHggPSBlLnBhZ2VYO1xuXHRcdFx0dmFyIHkgPSBlLnBhZ2VZO1xuXHRcdFx0XG5cdFx0XHR2YXIgb2Zmc2V0WCA9IHB4IC0geDtcblx0XHRcdHZhciBvZmZzZXRZID0gcHkgLSB5O1xuXHRcdFx0XHRcblx0XHRcdHJvdGF0aW9uWSArPSBvZmZzZXRYICogMC4wMDU7XG5cdFx0XHRyb3RhdGlvblggKz0gb2Zmc2V0WSAqIDAuMDA1O1xuXHRcdFx0XG5cdFx0XHRxMS5zZXRGcm9tQXhpc0FuZ2xlKCBheGlzWSwgcm90YXRpb25ZICk7XG5cdFx0XHRxMi5zZXRGcm9tQXhpc0FuZ2xlKCBheGlzWCwgcm90YXRpb25YICk7XG5cdFx0XHRjYW1lcmFPYmoucXVhdGVybmlvbi5tdWx0aXBseVF1YXRlcm5pb25zKCBxMSwgcTIgKTtcblx0XHRcdFxuXHRcdFx0XG5cdFx0XHRweCA9IHg7XG5cdFx0XHRweSA9IHk7XG5cdFx0XG5cdFx0fTtcblx0XHRcblx0fSkoKTtcblx0XG5cdHZhciBtb3VzZVVwSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuXHRcdCRjYW52YXMub2ZmKCdtb3VzZXVwJywgbW91c2VVcEhhbmRsZXIpO1xuXHRcdCRjYW52YXMub2ZmKCdtb3VzZW1vdmUnLCBkcmFnTW91c2VIYW5kbGVyKTtcblx0fTtcblx0XHRcblx0dmFyIG1vdXNlRG93bkhhbmRsZXIgPSBmdW5jdGlvbiggZSApIHtcblx0XHRcblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XG5cdFx0cHggPSBlLnBhZ2VYO1xuXHRcdHB5ID0gZS5wYWdlWTtcblx0XHRcblx0XHQkY2FudmFzLm9uKCdtb3VzZXVwJywgbW91c2VVcEhhbmRsZXIpO1xuXHRcdCRjYW52YXMub24oJ21vdXNlbW92ZScsIGRyYWdNb3VzZUhhbmRsZXIpO1xuXHR9O1xuXHRcblx0JGNhbnZhcy5vbignbW91c2Vkb3duJywgbW91c2VEb3duSGFuZGxlcik7XG5cdFxuXHRwb2VtLm9uKCdkZXN0cm95JywgZnVuY3Rpb24oKSB7XG5cdFx0JGNhbnZhcy5vZmYoJ21vdXNldXAnLCBtb3VzZVVwSGFuZGxlcik7XG5cdFx0JGNhbnZhcy5vZmYoJ21vdXNlbW92ZScsIGRyYWdNb3VzZUhhbmRsZXIpO1xuXHRcdCRjYW52YXMub2ZmKCdtb3VzZWRvd24nLCBtb3VzZURvd25IYW5kbGVyKTtcblx0fSk7XG59XG5cbnZhciBFbmRsZXNzQ2FtZXJhID0gZnVuY3Rpb24oIHBvZW0gKSB7XG5cdFxuXHRwb2VtLm9uKCd1cGRhdGUnLCB1cGRhdGVDYW1lcmEoIHBvZW0uY2FtZXJhICkpO1xuXHRcblx0bW91c2VEb3duKCBwb2VtLmNhbnZhcywgcG9lbS5jYW1lcmEub2JqZWN0LCBwb2VtICk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVuZGxlc3NDYW1lcmE7IiwidmFyIGdsc2xpZnkgPSByZXF1aXJlKFwiZ2xzbGlmeVwiKTtcbnZhciBjcmVhdGVTaGFkZXIgPSByZXF1aXJlKFwidGhyZWUtZ2xzbGlmeVwiKShUSFJFRSk7XG5cbmZ1bmN0aW9uIGNyZWF0ZUdlb21ldHJ5KHdpZHRoLCBzZWdtZW50cykge1xuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHdpZHRoLCB3aWR0aCwgc2VnbWVudHMsIHNlZ21lbnRzKTtcbiAgICBnZW9tZXRyeS5hcHBseU1hdHJpeChuZXcgVEhSRUUuTWF0cml4NCgpLm1ha2VSb3RhdGlvblgoTWF0aC5QSSAqIDAuNSkpO1xuICAgIHJldHVybiBnZW9tZXRyeTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlVGV4dHVyZShtZXNoLCBzY2VuZSkge1xuICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICB2YXIgdGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKGltZyk7XG4gICAgaW1nLnNyYyA9IFwiYXNzZXRzL2ltYWdlcy9jbG91ZDEwMjQucG5nXCI7XG5cbiAgICAkKGltZykub24oXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICB0ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgc2NlbmUuYWRkKG1lc2gpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInRleHR1cmUgbG9hZGVkXCIpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRleHR1cmU7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVNoYWRlcigpIHt9XG5cbmZ1bmN0aW9uIGNyZWF0ZU1lc2hHcmlkKG1hdGVyaWFsLCB3aWR0aCwgZ3JpZExlbmd0aCwgdG90YWxQb2x5Z29uRGVuc2l0eSkge1xuICAgIHZhciBnZW9tZXRyeSA9IGNyZWF0ZUdlb21ldHJ5KHdpZHRoIC8gZ3JpZExlbmd0aCwgTWF0aC5mbG9vcih0b3RhbFBvbHlnb25EZW5zaXR5IC8gZ3JpZExlbmd0aCkpO1xuICAgIHZhciBtZXNoR3JpZCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuICAgIHZhciBtZXNoO1xuICAgIHZhciBzdGVwID0gd2lkdGggLyBncmlkTGVuZ3RoO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBncmlkTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBncmlkTGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuICAgICAgICAgICAgbWVzaEdyaWQuYWRkKG1lc2gpO1xuICAgICAgICAgICAgbWVzaC5wb3NpdGlvbi5zZXQoaSAqIHN0ZXAsIDAsIGogKiBzdGVwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtZXNoR3JpZDtcbn1cblxuZnVuY3Rpb24gdXBkYXRlTW9kdWxvTWVzaEdyaWQoY2FtZXJhUG9zaXRpb24sIG1lc2hlcywgd2lkdGgpIHtcbiAgICB2YXIgaWwgPSBtZXNoZXMubGVuZ3RoO1xuICAgIHZhciBoYWxmV2lkdGggPSB3aWR0aCAvIDI7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwb3NpdGlvbjtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGlsOyBpKyspIHtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gbWVzaGVzW2ldLnBvc2l0aW9uO1xuICAgICAgICAgICAgcG9zaXRpb24uc2V0KChwb3NpdGlvbi54IC0gY2FtZXJhUG9zaXRpb24ueCArIGhhbGZXaWR0aCkgJSB3aWR0aCArIGNhbWVyYVBvc2l0aW9uLnggLSBoYWxmV2lkdGgsIHBvc2l0aW9uLnksIChwb3NpdGlvbi56IC0gY2FtZXJhUG9zaXRpb24ueiArIGhhbGZXaWR0aCkgJSB3aWR0aCArIGNhbWVyYVBvc2l0aW9uLnogLSBoYWxmV2lkdGgpO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxudmFyIEVuZGxlc3NUZXJyYWluID0gZnVuY3Rpb24ocG9lbSwgcHJvcGVydGllcykge1xuICAgIHZhciBjb25maWcgPSBfLmV4dGVuZCh7XG4gICAgICAgIHdpZHRoOiA0MDAwLFxuICAgICAgICBncmlkTGVuZ3RoOiAxNixcbiAgICAgICAgdG90YWxQb2x5Z29uRGVuc2l0eTogMTAyNFxuICAgIH0sIHByb3BlcnRpZXMpO1xuXG4gICAgdmFyIHNoYWRlciA9IGNyZWF0ZVNoYWRlcihyZXF1aXJlKFwiZ2xzbGlmeS9zaW1wbGUtYWRhcHRlci5qc1wiKShcIlxcbiNkZWZpbmUgR0xTTElGWSAxXFxuXFxudW5pZm9ybSBzYW1wbGVyMkQgdGVycmFpbjtcXG51bmlmb3JtIGZsb2F0IGhlaWdodFNjYWxlO1xcbnVuaWZvcm0gZmxvYXQgd2lkdGg7XFxudmFyeWluZyBmbG9hdCBoZWlnaHQ7XFxudmFyeWluZyB2ZWMyIHZVdjtcXG52YXJ5aW5nIGZsb2F0IHZDYW1lcmFEaXN0YW5jZTtcXG52b2lkIG1haW4oKSB7XFxuICB2ZWM0IG1vZGVsUG9zaXRpb24gPSBtb2RlbE1hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7XFxuICB2VXYgPSBtb2QodmVjMihtb2RlbFBvc2l0aW9uLngsIG1vZGVsUG9zaXRpb24ueiksIHdpZHRoKSAvIHdpZHRoO1xcbiAgaGVpZ2h0ID0gdGV4dHVyZTJEKHRlcnJhaW4sIHZVdikudztcXG4gIHZDYW1lcmFEaXN0YW5jZSA9IGRpc3RhbmNlKG1vZGVsUG9zaXRpb24ueHl6LCBjYW1lcmFQb3NpdGlvbik7XFxuICB2ZWM0IG1vZGlmaWVkUG9zaXRpb24gPSB2ZWM0KHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgKyBoZWlnaHQgKiBoZWlnaHRTY2FsZSwgcG9zaXRpb24ueiwgMS4wKTtcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIG1vZGlmaWVkUG9zaXRpb247XFxufVwiLCBcIlxcbiNkZWZpbmUgR0xTTElGWSAxXFxuXFxudmVjMyBhX3hfaHN2MnJnYih2ZWMzIGMpIHtcXG4gIHZlYzQgSyA9IHZlYzQoMS4wLCAyLjAgLyAzLjAsIDEuMCAvIDMuMCwgMy4wKTtcXG4gIHZlYzMgcCA9IGFicyhmcmFjdChjLnh4eCArIEsueHl6KSAqIDYuMCAtIEsud3d3KTtcXG4gIHJldHVybiBjLnogKiBtaXgoSy54eHgsIGNsYW1wKHAgLSBLLnh4eCwgMC4wLCAxLjApLCBjLnkpO1xcbn1cXG51bmlmb3JtIGZsb2F0IHdpZHRoO1xcbnZhcnlpbmcgZmxvYXQgaGVpZ2h0O1xcbnZhcnlpbmcgdmVjMiB2VXY7XFxudmFyeWluZyBmbG9hdCB2Q2FtZXJhRGlzdGFuY2U7XFxudm9pZCBtYWluKCkge1xcbiAgZmxvYXQgaW52RGlzdG9ydCA9IDEuMCAtIGhlaWdodDtcXG4gIGZsb2F0IHhIdWUgPSBhYnMoMC41IC0gdlV2LngpICogMi4wO1xcbiAgZmxvYXQgeUh1ZSA9IGFicygwLjUgLSB2VXYueSkgKiAyLjA7XFxuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGFfeF9oc3YycmdiKHZlYzMoKHhIdWUgKyB5SHVlKSAqIDAuMiArIDAuMywgbWl4KGhlaWdodCwgMC41LCAwLjgpLCBtaXgoaGVpZ2h0LCAxLjAsIDAuMzUpKSksIDEuMCk7XFxuICBmbG9hdCBmb2dGYWN0b3IgPSBzbW9vdGhzdGVwKDAuMCwgMS4wLCB2Q2FtZXJhRGlzdGFuY2UgLyB3aWR0aCk7XFxuICB2ZWMzIGZvZ0NvbG9yID0gdmVjMygwLjEyNSwgMC4xMjUsIDAuMTI1KTtcXG4gIGdsX0ZyYWdDb2xvciA9IG1peChnbF9GcmFnQ29sb3IsIHZlYzQoZm9nQ29sb3IsIGdsX0ZyYWdDb2xvci53KSwgZm9nRmFjdG9yKTtcXG59XCIsIFt7XCJuYW1lXCI6XCJ0ZXJyYWluXCIsXCJ0eXBlXCI6XCJzYW1wbGVyMkRcIn0se1wibmFtZVwiOlwiaGVpZ2h0U2NhbGVcIixcInR5cGVcIjpcImZsb2F0XCJ9LHtcIm5hbWVcIjpcIndpZHRoXCIsXCJ0eXBlXCI6XCJmbG9hdFwifSx7XCJuYW1lXCI6XCJ3aWR0aFwiLFwidHlwZVwiOlwiZmxvYXRcIn1dLCBbXSkpO1xuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbChzaGFkZXIpO1xuICAgIG1hdGVyaWFsLnNpZGUgPSBUSFJFRS5Eb3VibGVTaWRlO1xuICAgIHZhciBtZXNoR3JpZCA9IGNyZWF0ZU1lc2hHcmlkKG1hdGVyaWFsLCBjb25maWcud2lkdGgsIGNvbmZpZy5ncmlkTGVuZ3RoLCBjb25maWcudG90YWxQb2x5Z29uRGVuc2l0eSk7XG4gICAgbWVzaEdyaWQucG9zaXRpb24ueSA9IDEwMDtcbiAgICBzaGFkZXIudW5pZm9ybXMudGVycmFpbi52YWx1ZSA9IGNyZWF0ZVRleHR1cmUobWVzaEdyaWQsIHBvZW0uc2NlbmUpO1xuICAgIHNoYWRlci51bmlmb3Jtcy5oZWlnaHRTY2FsZS52YWx1ZSA9IGNvbmZpZy53aWR0aCAvIDIwO1xuICAgIHNoYWRlci51bmlmb3Jtcy53aWR0aC52YWx1ZSA9IGNvbmZpZy53aWR0aCAvIDI7XG4gICAgcG9lbS5vbihcInVwZGF0ZVwiLCB1cGRhdGVNb2R1bG9NZXNoR3JpZChwb2VtLmNhbWVyYS5vYmplY3QucG9zaXRpb24sIG1lc2hHcmlkLmNoaWxkcmVuLCBjb25maWcud2lkdGgpKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRW5kbGVzc1RlcnJhaW47IiwidmFyIHJhbmRvbSA9IHJlcXVpcmUoJy4uL3V0aWxzL3JhbmRvbScpO1xuXG52YXIgR3JpZCA9IGZ1bmN0aW9uKCBwb2VtLCBwcm9wZXJ0aWVzICkge1xuXHRcblx0dGhpcy5wb2VtID0gcG9lbTtcblxuXHR2YXIgbGluZU1hdGVyaWFsID0gbmV3IFRIUkVFLkxpbmVCYXNpY01hdGVyaWFsKCB7IGNvbG9yOiAweDMwMzAzMCB9ICksXG5cdFx0Z2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKSxcblx0XHRmbG9vciA9IC03NSwgc3RlcCA9IDI1O1xuXG5cdGZvciAoIHZhciBpID0gMDsgaSA8PSA0MDsgaSArKyApIHtcblxuXHRcdGdlb21ldHJ5LnZlcnRpY2VzLnB1c2goIG5ldyBUSFJFRS5WZWN0b3IzKCAtIDUwMCwgZmxvb3IsIGkgKiBzdGVwIC0gNTAwICkgKTtcblx0XHRnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKCBuZXcgVEhSRUUuVmVjdG9yMyggICA1MDAsIGZsb29yLCBpICogc3RlcCAtIDUwMCApICk7XG5cblx0XHRnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKCBuZXcgVEhSRUUuVmVjdG9yMyggaSAqIHN0ZXAgLSA1MDAsIGZsb29yLCAtNTAwICkgKTtcblx0XHRnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKCBuZXcgVEhSRUUuVmVjdG9yMyggaSAqIHN0ZXAgLSA1MDAsIGZsb29yLCAgNTAwICkgKTtcblxuXHR9XG5cblx0dGhpcy5ncmlkID0gbmV3IFRIUkVFLkxpbmUoIGdlb21ldHJ5LCBsaW5lTWF0ZXJpYWwsIFRIUkVFLkxpbmVQaWVjZXMgKTtcblx0dGhpcy5wb2VtLnNjZW5lLmFkZCggdGhpcy5ncmlkICk7XG5cdFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBHcmlkOyIsInZhciBjYWxjdWxhdGVTcXVhcmVkVGV4dHVyZVdpZHRoID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvY2FsY3VsYXRlU3F1YXJlZFRleHR1cmVXaWR0aCcpXG4gICwgbG9hZFRleHR1cmVcdD0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvbG9hZFRleHR1cmUnKVxuICAsIGxvYWRUZXh0XHQ9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL2xvYWRUZXh0JylcbiAgLCBSU1ZQID0gcmVxdWlyZSgncnN2cCcpO1xuXG52YXIgTWVzaEdyb3VwID0gZnVuY3Rpb24oIHBvZW0gKSB7XG5cdFxuXHRUSFJFRS5PYmplY3QzRC5jYWxsKCB0aGlzICk7XG5cdFxuXHR0aGlzLnBvZW0gPSBwb2VtO1xuXHR0aGlzLnR5cGUgPSAnTWVzaEdyb3VwJztcblx0dGhpcy5idWZmZXJHZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xuXHRcblx0dGhpcy5tYXRyaWNlc1RleHR1cmVXaWR0aCA9IG51bGw7XG5cdHRoaXMubWF0cmljZXNEYXRhID0gbnVsbDtcblx0dGhpcy5tYXRyaXhJbmRpY2VzID0gbnVsbDtcblx0XG5cdHRoaXMudGV4dHVyZSA9IG51bGw7XG5cdHRoaXMudmVydGV4U2hhZGVyID0gbnVsbDtcblx0dGhpcy5mcmFnbWVudFNoYWRlciA9IG51bGw7XG5cdFxuXHR0aGlzLmxvYWRlZCA9IFJTVlAuYWxsKFtcblx0XHRsb2FkVGV4dHVyZSggXCJhc3NldHMvaW1hZ2VzL3NpbmVncmF2aXR5Y2xvdWQucG5nXCIsIHRoaXMsIFwidGV4dHVyZVwiICksXG5cdFx0bG9hZFRleHQoIFwianMvZGVtb3MvTWVzaEdyb3VwQm94RGVtby9zaGFkZXIudmVydFwiLCB0aGlzLCBcInZlcnRleFNoYWRlclwiICksXG5cdFx0bG9hZFRleHQoIFwianMvZGVtb3MvTWVzaEdyb3VwQm94RGVtby9zaGFkZXIuZnJhZ1wiLCB0aGlzLCBcImZyYWdtZW50U2hhZGVyXCIgKVxuXHRdKVxuXHQuY2F0Y2goIGZ1bmN0aW9uKCBlcnJvciApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgbG9hZCBhc3NldHMgZm9yIHRoZSBNZXNoR3JvdXBcIiwgZXJyb3IpO1xuXHR9KTtcblx0XHRcbn07XG5cbk1lc2hHcm91cC5wcm90b3R5cGUgPSBfLmV4dGVuZCggT2JqZWN0LmNyZWF0ZSggVEhSRUUuT2JqZWN0M0QucHJvdG90eXBlICksIHtcblxuXHRidWlsZCA6IGZ1bmN0aW9uKCBzY2VuZSApIHtcblx0XHRcblx0XHR0aGlzLmxvYWRlZC50aGVuKCBmdW5jdGlvbigpIHtcblx0XHRcdFxuXHRcdFx0dGhpcy5idWlsZEdlb21ldHJ5KCk7XG5cdFx0XHR0aGlzLmJ1aWxkTWF0cmljZXMoKTtcblx0XHRcdHRoaXMuYnVpbGRNYXRlcmlhbCgpO1xuXHRcdFx0XG5cdFx0XHR0aGlzLm9iamVjdCA9IG5ldyBUSFJFRS5Qb2ludENsb3VkKCB0aGlzLmJ1ZmZlckdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsICk7XG5cdFx0XHRcblx0XHRcdHNjZW5lLmFkZCggdGhpcy5vYmplY3QgKTtcblx0XHRcdFxuXHRcdFx0dGhpcy5wb2VtLm9uKCAndXBkYXRlJywgdGhpcy51cGRhdGUuYmluZCh0aGlzKSApO1xuXHRcdFx0XG5cdFx0XHRcblx0XHR9LmJpbmQodGhpcykgKTtcblx0XHRcblx0fSxcblx0XG5cdGJ1aWxkR2VvbWV0cnkgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHR2YXIgbWVyZ2VkR2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcblx0XHRcblx0XHR2YXIgY2hpbGRHZW9tZXRyeTtcblx0XHR2YXIgbWF0cml4SW5kaWNlcyA9IFtdO1xuXHRcdHZhciBpLCBpbCwgaiwgamw7XG5cdFx0XG5cdFx0Zm9yKCBpID0gMCwgaWwgPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGlsOyBpKysgKSB7XG5cdFx0XHRcblx0XHRcdGNoaWxkR2VvbWV0cnkgPSB0aGlzLmNoaWxkcmVuW2ldLmdlb21ldHJ5O1xuXHRcdFx0XG5cdFx0XHRpZiggY2hpbGRHZW9tZXRyeSApIHtcblx0XHRcdFx0XG5cdFx0XHRcdG1lcmdlZEdlb21ldHJ5Lm1lcmdlKCBjaGlsZEdlb21ldHJ5ICk7XG5cdFx0XHRcdFxuXHRcdFx0XHRqID0gbWVyZ2VkR2VvbWV0cnkudmVydGljZXMubGVuZ3RoIC0gY2hpbGRHZW9tZXRyeS52ZXJ0aWNlcy5sZW5ndGg7XG5cdFx0XHRcdGpsID0gbWVyZ2VkR2VvbWV0cnkudmVydGljZXMubGVuZ3RoO1xuXHRcdFx0XHRcblx0XHRcdFx0Zm9yKCA7IGogPCBqbDsgaisrICkge1xuXHRcdFx0XHRcdG1hdHJpeEluZGljZXNbal0gPSBpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0fVxuXHRcdFxuXHRcdHRoaXMuYnVmZmVyR2VvbWV0cnkuZnJvbUdlb21ldHJ5KCBtZXJnZWRHZW9tZXRyeSApO1xuXHRcdFxuXHR9LFxuXHRcblx0Z2VuZXJhdGVUcmFuc2Zvcm1NYXRyaXhJbmRpY2VzIDogZnVuY3Rpb24oIG9iamVjdDNEcyApIHtcblx0XHRcblx0XHR2YXIgbWF0cml4SW5kaWNlcyA9IFtdO1xuXHRcdHZhciB0b3RhbExlbmd0aCA9IDA7XG5cdFx0dmFyIHBvc2l0aW9uc0luRmFjZXM7XG5cdFx0dmFyIGNoaWxkR2VvbWV0cnk7XG5cdFx0XG5cdFx0dmFyIGksIGlsLCBqLCBqbDtcblx0XHRcblx0XHRmb3IoIGkgPSAwLCBpbCA9IG9iamVjdDNEcy5sZW5ndGg7IGkgPCBpbDsgaSsrICkge1xuXHRcdFx0XG5cdFx0XHRjaGlsZEdlb21ldHJ5ID0gb2JqZWN0M0RzW2ldLmdlb21ldHJ5O1xuXHRcdFx0XG5cdFx0XHRpZiggY2hpbGRHZW9tZXRyeSApIHtcblx0XHRcdFx0XG5cdFx0XHRcdHBvc2l0aW9uc0luRmFjZXMgPSBjaGlsZEdlb21ldHJ5LmZhY2VzLmxlbmd0aCAqIDM7IC8vMyB2ZXJ0aWNlcyBwZXIgZmFjZVxuXHRcdFx0XHR0b3RhbExlbmd0aCArPSBwb3NpdGlvbnNJbkZhY2VzO1xuXHRcdFx0XHRcblx0XHRcdFx0aiA9IHRvdGFsTGVuZ3RoIC0gcG9zaXRpb25zSW5GYWNlcztcblx0XHRcdFx0amwgPSB0b3RhbExlbmd0aDtcblx0XHRcdFx0XG5cdFx0XHRcdGZvciggOyBqIDwgamw7IGorKyApIHtcblx0XHRcdFx0XHRtYXRyaXhJbmRpY2VzW2pdID0gaTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdH1cblx0XHRcdFxuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gbmV3IEZsb2F0MzJBcnJheSggbWF0cml4SW5kaWNlcyApO1xuXHR9LFxuXHRcblx0YnVpbGRNYXRyaWNlcyA6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdC8vQ2FsY3VsYXRlcyB0aGUgbl4yIHdpZHRoIG9mIHRoZSB0ZXh0dXJlXG5cdFx0dGhpcy5tYXRyaWNlc1RleHR1cmVXaWR0aCA9IGNhbGN1bGF0ZVNxdWFyZWRUZXh0dXJlV2lkdGgoIHRoaXMuY2hpbGRyZW4ubGVuZ3RoICogMTYgKTsgLy8xNiBmbG9hdHMgcGVyIG1hdHJpeFxuXHRcdFxuXHRcdC8vVGhlIHRleHR1cmUgaGFzIDQgZmxvYXRzIHBlciBwaXhlbFxuXHRcdHRoaXMubWF0cmljZXNEYXRhID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5tYXRyaWNlc1RleHR1cmVXaWR0aCAqIHRoaXMubWF0cmljZXNUZXh0dXJlV2lkdGggKiA0ICk7XG5cdFx0XG5cdFx0dGhpcy5tYXRyaWNlc1RleHR1cmUgPSBuZXcgVEhSRUUuRGF0YVRleHR1cmUoXG5cdFx0XHR0aGlzLm1hdHJpY2VzRGF0YSxcblx0XHRcdHRoaXMubWF0cmljZXNUZXh0dXJlV2lkdGgsXG5cdFx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZVdpZHRoLFxuXHRcdFx0VEhSRUUuUkdCQUZvcm1hdCxcblx0XHRcdFRIUkVFLkZsb2F0VHlwZVxuXHRcdCk7XG5cdFx0dGhpcy5tYXRyaWNlc1RleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcblx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZS5tYWdGaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xuXHRcdHRoaXMubWF0cmljZXNUZXh0dXJlLmdlbmVyYXRlTWlwbWFwcyA9IGZhbHNlO1xuXHRcdHRoaXMubWF0cmljZXNUZXh0dXJlLmZsaXBZID0gZmFsc2U7XG5cdFx0dGhpcy5tYXRyaWNlc1RleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xuXHRcdFxuXHR9LFxuXHRcblx0YnVpbGRNYXRlcmlhbCA6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdHRoaXMuYXR0cmlidXRlcyA9IHtcblx0XHRcdFxuXHRcdFx0dHJhbnNmb3JtTWF0cml4SW5kZXg6XHR7IHR5cGU6ICdmJywgdmFsdWU6IG51bGwgfVxuXHRcdFx0XG5cdFx0fTtcblx0XHRcblx0XHR0aGlzLm1hdHJpeEluZGljZXMgPSB0aGlzLmdlbmVyYXRlVHJhbnNmb3JtTWF0cml4SW5kaWNlcyggdGhpcy5jaGlsZHJlbiApO1xuXHRcdFxuXHRcdHRoaXMuYnVmZmVyR2VvbWV0cnkuYWRkQXR0cmlidXRlKCAndHJhbnNmb3JtTWF0cml4SW5kZXgnLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKCB0aGlzLm1hdHJpeEluZGljZXMsIDEgKSApO1xuXG5cdFx0dGhpcy51bmlmb3JtcyA9IHtcblx0XHRcdFxuXHRcdFx0Y29sb3I6ICAgICBcdFx0XHRcdHsgdHlwZTogXCJjXCIsIHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IoIDB4ZmYwMDAwICkgfSxcblx0XHRcdG1hdHJpY2VzVGV4dHVyZTpcdFx0eyB0eXBlOiBcInRcIiwgdmFsdWU6IHRoaXMubWF0cmljZXNUZXh0dXJlIH0sXG5cdFx0XHR0aW1lOiAgICAgIFx0XHRcdFx0eyB0eXBlOiAnZicsIHZhbHVlOiBEYXRlLm5vdygpIH0sXG5cdFx0XHR0ZXh0dXJlOiAgIFx0XHRcdFx0eyB0eXBlOiBcInRcIiwgdmFsdWU6IHRoaXMudGV4dHVyZSB9LFxuXHRcdFx0bWF0cmljZXNUZXh0dXJlV2lkdGg6XHR7IHR5cGU6ICdmJywgdmFsdWU6IHRoaXMubWF0cmljZXNUZXh0dXJlV2lkdGggfVxuXHRcdFx0XG5cdFx0fTtcblxuXHRcdHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoIHtcblx0XHRcdFxuXHRcdFx0dW5pZm9ybXM6ICAgICAgIHRoaXMudW5pZm9ybXMsXG5cdFx0XHRhdHRyaWJ1dGVzOiAgICAgdGhpcy5hdHRyaWJ1dGVzLFxuXHRcdFx0dmVydGV4U2hhZGVyOiAgIHRoaXMudmVydGV4U2hhZGVyLFxuXHRcdFx0ZnJhZ21lbnRTaGFkZXI6IHRoaXMuZnJhZ21lbnRTaGFkZXIsXG5cdFx0XHRcblx0XHRcdGJsZW5kaW5nOiAgICAgICBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxuXHRcdFx0ZGVwdGhUZXN0OiAgICAgIGZhbHNlLFxuXHRcdFx0dHJhbnNwYXJlbnQ6ICAgIHRydWVcblx0XHRcdFxuXHRcdH0pO1xuXHRcdFx0XHRcblx0fSxcblx0XG5cdHVwZGF0ZSA6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdGZvciggdmFyIGkgPSAwLCBpbCA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpIDwgaWwgOyBpKysgKSB7XG5cblx0XHRcdHRoaXMuY2hpbGRyZW5baV0ubWF0cml4LmZsYXR0ZW5Ub0FycmF5T2Zmc2V0KCB0aGlzLm1hdHJpY2VzRGF0YSwgaSAqIDE2ICk7XG5cdFx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cdFx0XHRcblx0XHR9XG5cdFx0XG5cdH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWVzaEdyb3VwOyIsInZhciBNZXNoR3JvdXAgPSByZXF1aXJlKCcuL01lc2hHcm91cCcpXG4gICwgcmFuZG9tID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvcmFuZG9tJylcbiAgLCB0d2/PgCA9IE1hdGguUEkgKiAyO1xuXG52YXIgTWVzaEdyb3VwQm94RGVtbyA9IGZ1bmN0aW9uKCBwb2VtLCBwcm9wZXJ0aWVzICkge1xuXHRcblx0dGhpcy5wb2VtID0gcG9lbTtcblx0XG5cdHRoaXMuY291bnQgPSAxMDAwMDtcblx0XG5cdHRoaXMucG9lbS5vbigndXBkYXRlJywgdGhpcy51cGRhdGUuYmluZCh0aGlzKSApO1xuXHRcblx0dGhpcy5ncm91cCA9IG5ldyBNZXNoR3JvdXAoIHBvZW0gKTtcblx0XG5cdHRoaXMuYm94ZXMgPSB0aGlzLmdlbmVyYXRlQm94ZXMoIHRoaXMuZ3JvdXAgKTtcblxuXHR0aGlzLmdyb3VwLmJ1aWxkKCBwb2VtLnNjZW5lICk7XG5cdFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNZXNoR3JvdXBCb3hEZW1vO1xuXG5NZXNoR3JvdXBCb3hEZW1vLnByb3RvdHlwZSA9IHtcblxuXHRnZW5lcmF0ZUJveGVzIDogZnVuY3Rpb24oIGdyb3VwICkge1xuXHRcdFxuXHRcdHZhciBib3hlcyA9IFtdO1xuXHRcdFxuXHRcdHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSggMSwgMSwgMSApO1xuXHRcdHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCggeyBjb2xvcjogMHgwMGZmMDAgfSApO1xuXHRcdHZhciBib3g7XG5cdFx0XG5cdFx0dmFyIGkgPSB0aGlzLmNvdW50OyB3aGlsZSAoaS0tKSB7XG5cdFx0XHRcblx0XHRcdGJveCA9IG5ldyBUSFJFRS5NZXNoKCBuZXcgVEhSRUUuQm94R2VvbWV0cnkoIDEsIDEsIDEgKSApO1xuXHRcdFx0XG5cdFx0XHRib3gucG9zaXRpb24ueCA9IHJhbmRvbS5yYW5nZSggLTEwMCwgMTAwICk7XG5cdFx0XHRib3gucG9zaXRpb24ueSA9IHJhbmRvbS5yYW5nZSggLTEwMCwgMTAwICk7XG5cdFx0XHRib3gucG9zaXRpb24ueiA9IHJhbmRvbS5yYW5nZSggLTEwMCwgMTAwICk7XG5cdFx0XHRcblx0XHRcdGJveC5yb3RhdGlvbi54ID0gcmFuZG9tLnJhbmdlKCAtdHdvz4AsIHR3b8+AICk7XG5cdFx0XHRib3gucm90YXRpb24ueSA9IHJhbmRvbS5yYW5nZSggLXR3b8+ALCB0d2/PgCApO1xuXHRcdFx0Ym94LnJvdGF0aW9uLnogPSByYW5kb20ucmFuZ2UoIC10d2/PgCwgdHdvz4AgKTtcblx0XHRcdFxuXHRcdFx0Ym94LnZlbG9jaXR5ID0gbmV3IFRIUkVFLlZlY3RvcjMoXG5cdFx0XHRcdFxuXHRcdFx0XHRyYW5kb20ucmFuZ2UoIC0xLCAxICksXG5cdFx0XHRcdHJhbmRvbS5yYW5nZSggLTEsIDEgKSxcblx0XHRcdFx0cmFuZG9tLnJhbmdlKCAtMSwgMSApXG5cdFx0XHRcdFxuXHRcdFx0KS5tdWx0aXBseVNjYWxhcigwLjEpO1xuXHRcdFx0XG5cdFx0XHRib3guc3BpbiA9IG5ldyBUSFJFRS5WZWN0b3IzKFxuXHRcdFx0XHRcblx0XHRcdFx0cmFuZG9tLnJhbmdlKCAtdHdvz4AsIHR3b8+AICksXG5cdFx0XHRcdHJhbmRvbS5yYW5nZSggLXR3b8+ALCB0d2/PgCApLFxuXHRcdFx0XHRyYW5kb20ucmFuZ2UoIC10d2/PgCwgdHdvz4AgKVxuXHRcdFx0XHRcblx0XHRcdCkubXVsdGlwbHlTY2FsYXIoMC4wMSk7XG5cdFx0XHRcblx0XHRcdGJveC5zY2FsZS5tdWx0aXBseVNjYWxhciggcmFuZG9tLnJhbmdlKCAxLCAyKSApO1xuXHRcdFx0XG5cdFx0XHRib3gudXBkYXRlTWF0cml4KCk7XG5cdFx0XHRcblx0XHRcdGJveGVzLnB1c2goIGJveCApO1xuXHRcdFx0XG5cdFx0XHRncm91cC5hZGQoIGJveCApO1xuXHRcdFx0XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBib3hlcztcblx0XHRcblx0fSxcblx0XG5cdHVwZGF0ZSA6IGZ1bmN0aW9uKCBlICkge1xuXHRcdFxuXHRcdHZhciBib3g7XG5cdFx0XG5cdFx0Zm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmNvdW50OyBpKysgKSB7XG5cdFx0XHRcblx0XHRcdGJveCA9IHRoaXMuYm94ZXNbaV07XG5cdFx0XHRcblx0XHRcdGJveC5wb3NpdGlvbi5hZGQoIGJveC52ZWxvY2l0eSApO1xuXHRcdFx0XG5cdFx0XHRib3gucm90YXRpb24ueCArPSBib3guc3Bpbi54O1xuXHRcdFx0Ym94LnJvdGF0aW9uLnkgKz0gYm94LnNwaW4ueTtcblx0XHRcdGJveC5yb3RhdGlvbi56ICs9IGJveC5zcGluLno7XG5cdFx0XHRcblx0XHRcdGJveC51cGRhdGVNYXRyaXgoKTtcblx0XHRcdFxuXHRcdH1cblx0XHRcblx0fVxuXHRcbn07IiwidmFyIHJhbmRvbVx0XHQ9IHJlcXVpcmUoJy4uL3V0aWxzL3JhbmRvbScpXG4gICwgbG9hZFRleHR1cmVcdD0gcmVxdWlyZSgnLi4vdXRpbHMvbG9hZFRleHR1cmUnKVxuICAsIGxvYWRUZXh0XHQ9IHJlcXVpcmUoJy4uL3V0aWxzL2xvYWRUZXh0JylcbiAgLCBSU1ZQXHRcdD0gcmVxdWlyZSgncnN2cCcpXG47XG5cbnZhciBTaW5lR3Jhdml0eUNsb3VkID0gZnVuY3Rpb24ocG9lbSwgcHJvcGVydGllcykge1xuXHRcblx0dGhpcy5wb2VtID0gcG9lbTtcblx0XG5cdHRoaXMub2JqZWN0ID0gbnVsbDtcblx0dGhpcy5tYXRlcmlhbCA9IG51bGw7XG5cdHRoaXMuYXR0cmlidXRlcyA9IG51bGw7XG5cdHRoaXMudW5pZm9ybXMgPSBudWxsO1xuXG5cdHRoaXMudGV4dHVyZSA9IG51bGw7XG5cdHRoaXMudmVydGV4U2hhZGVyID0gbnVsbDtcblx0dGhpcy5mcmFnbWVudFNoYWRlciA9IG51bGw7XG5cdFxuXHR0aGlzLmNvdW50ID0gMjAwMDAwO1xuXHR0aGlzLnJhZGl1cyA9IDIwMDtcblx0dGhpcy5wb2ludFNpemUgPSA3O1xuXHRcdFxuXHRfLmV4dGVuZCggdGhpcywgcHJvcGVydGllcyApO1xuXHRcblx0XG5cdFJTVlAuYWxsKFtcblx0XHRsb2FkVGV4dHVyZSggXCJhc3NldHMvaW1hZ2VzL3NpbmVncmF2aXR5Y2xvdWQucG5nXCIsIHRoaXMsIFwidGV4dHVyZVwiICksXG5cdFx0bG9hZFRleHQoIFwiYXNzZXRzL3NoYWRlcnMvc2luZWdyYXZpdHljbG91ZC52ZXJ0XCIsIHRoaXMsIFwidmVydGV4U2hhZGVyXCIgKSxcblx0XHRsb2FkVGV4dCggXCJhc3NldHMvc2hhZGVycy9zaW5lZ3Jhdml0eWNsb3VkLmZyYWdcIiwgdGhpcywgXCJmcmFnbWVudFNoYWRlclwiIClcblx0XSlcblx0LnRoZW4oXG5cdFx0dGhpcy5zdGFydC5iaW5kKHRoaXMpLFxuXHRcdHRoaXMuZXJyb3IuYmluZCh0aGlzKVxuXHQpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaW5lR3Jhdml0eUNsb3VkO1xuXG5TaW5lR3Jhdml0eUNsb3VkLnByb3RvdHlwZSA9IHtcblx0XG5cdHN0YXJ0IDogZnVuY3Rpb24oKSB7XG5cdFx0XG5cdFx0dGhpcy5hdHRyaWJ1dGVzID0ge1xuXG5cdFx0XHRzaXplOiAgICAgICAgeyB0eXBlOiAnZicsIHZhbHVlOiBudWxsIH0sXG5cdFx0XHRjdXN0b21Db2xvcjogeyB0eXBlOiAnYycsIHZhbHVlOiBudWxsIH1cblxuXHRcdH07XG5cblx0XHR0aGlzLnVuaWZvcm1zID0ge1xuXG5cdFx0XHRjb2xvcjogICAgIHsgdHlwZTogXCJjXCIsIHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IoIDB4ZmZmZmZmICkgfSxcblx0XHRcdHRleHR1cmU6ICAgeyB0eXBlOiBcInRcIiwgdmFsdWU6IHRoaXMudGV4dHVyZSB9XG5cblx0XHR9O1xuXG5cdFx0dGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCgge1xuXG5cdFx0XHR1bmlmb3JtczogICAgICAgdGhpcy51bmlmb3Jtcyxcblx0XHRcdGF0dHJpYnV0ZXM6ICAgICB0aGlzLmF0dHJpYnV0ZXMsXG5cdFx0XHR2ZXJ0ZXhTaGFkZXI6ICAgdGhpcy52ZXJ0ZXhTaGFkZXIsXG5cdFx0XHRmcmFnbWVudFNoYWRlcjogdGhpcy5mcmFnbWVudFNoYWRlcixcblxuXHRcdFx0YmxlbmRpbmc6ICAgICAgIFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG5cdFx0XHRkZXB0aFRlc3Q6ICAgICAgZmFsc2UsXG5cdFx0XHR0cmFuc3BhcmVudDogICAgdHJ1ZVxuXG5cdFx0fSk7XG5cblx0XHR0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XG5cblx0XHR0aGlzLnBvc2l0aW9ucyA9IG5ldyBGbG9hdDMyQXJyYXkoIHRoaXMuY291bnQgKiAzICk7XG5cdFx0dGhpcy52ZWxvY2l0eSA9IG5ldyBGbG9hdDMyQXJyYXkoIHRoaXMuY291bnQgKiAzICk7XG5cdFx0dGhpcy5jb2xvcnMgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLmNvdW50ICogMyApO1xuXHRcdHRoaXMuc2l6ZXMgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLmNvdW50ICk7XG5cblx0XHR2YXIgY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoMHgwMDAwMDApO1xuXHRcdFxuXHRcdHZhciBodWU7XG5cdFx0XG5cdFx0dmFyIHRoZXRhLCBwaGk7XG5cdFx0XG5cdFx0dmFyIHg7XG5cblx0XHRmb3IoIHZhciB2ID0gMDsgdiA8IHRoaXMuY291bnQ7IHYrKyApIHtcblxuXHRcdFx0dGhpcy5zaXplc1sgdiBdID0gdGhpcy5wb2ludFNpemU7XG5cdFx0XHRcblx0XHRcdC8vIHRoZXRhID0gcmFuZG9tLnJhbmdlTG93KCAwLjEsIE1hdGguUEkgKTtcblx0XHRcdC8vIHBoaSA9IHJhbmRvbS5yYW5nZUxvdyggTWF0aC5QSSAqIDAuMywgTWF0aC5QSSApO1xuXHRcdFx0Ly9cblx0XHRcdC8vIHRoaXMucG9zaXRpb25zWyB2ICogMyArIDAgXSA9IE1hdGguc2luKCB0aGV0YSApICogTWF0aC5jb3MoIHBoaSApICogdGhpcy5yYWRpdXMgKiB0aGV0YSAqIDU7XG5cdFx0XHQvLyB0aGlzLnBvc2l0aW9uc1sgdiAqIDMgKyAxIF0gPSBNYXRoLnNpbiggdGhldGEgKSAqIE1hdGguc2luKCBwaGkgKSAqIHRoaXMucmFkaXVzO1xuXHRcdFx0Ly8gdGhpcy5wb3NpdGlvbnNbIHYgKiAzICsgMiBdID0gTWF0aC5jb3MoIHRoZXRhICkgKiB0aGlzLnJhZGl1cyAqIDAuMTtcblx0XHRcdFxuXHRcdFx0eCA9IHJhbmRvbS5yYW5nZSggLTEsIDEgKTtcblx0XHRcdFxuXHRcdFx0dGhpcy5wb3NpdGlvbnNbIHYgKiAzICsgMCBdID0geCAqIHRoaXMucmFkaXVzO1xuXHRcdFx0dGhpcy5wb3NpdGlvbnNbIHYgKiAzICsgMSBdID0gTWF0aC5zaW4oIHggKiBNYXRoLlBJICogMTAgKSAqIHRoaXMucmFkaXVzO1xuXHRcdFx0dGhpcy5wb3NpdGlvbnNbIHYgKiAzICsgMiBdID0gdGhpcy5yYWRpdXMgKiAtMC41O1xuXG5cdFx0XHR0aGlzLnZlbG9jaXR5WyB2ICogMyArIDAgXSA9IHJhbmRvbS5yYW5nZSggLTAuMDEsIDAuMDEgKSAqIDA7XG5cdFx0XHR0aGlzLnZlbG9jaXR5WyB2ICogMyArIDEgXSA9IHJhbmRvbS5yYW5nZSggLTAuMDEsIDAuMDEgKSAqIDEwO1xuXHRcdFx0dGhpcy52ZWxvY2l0eVsgdiAqIDMgKyAyIF0gPSByYW5kb20ucmFuZ2UoIC0wLjAxLCAwLjAxICkgKiAwO1xuXG5cdFx0XHQvLyBodWUgPSAodiAvIHRoaXMuY291bnQgKSAqIDAuMiArIDAuNDU7XG5cdFx0XHRcblx0XHRcdGh1ZSA9IHggKiAwLjMgKyAwLjY1O1xuXG5cdFx0XHRjb2xvci5zZXRIU0woIGh1ZSwgMS4wLCAwLjU1ICk7XG5cblx0XHRcdHRoaXMuY29sb3JzWyB2ICogMyArIDAgXSA9IGNvbG9yLnI7XG5cdFx0XHR0aGlzLmNvbG9yc1sgdiAqIDMgKyAxIF0gPSBjb2xvci5nO1xuXHRcdFx0dGhpcy5jb2xvcnNbIHYgKiAzICsgMiBdID0gY29sb3IuYjtcblxuXHRcdH1cblxuXHRcdHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCAncG9zaXRpb24nLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKCB0aGlzLnBvc2l0aW9ucywgMyApICk7XG5cdFx0dGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoICdjdXN0b21Db2xvcicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIHRoaXMuY29sb3JzLCAzICkgKTtcblx0XHR0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSggJ3NpemUnLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKCB0aGlzLnNpemVzLCAxICkgKTtcblxuXHRcdHRoaXMub2JqZWN0ID0gbmV3IFRIUkVFLlBvaW50Q2xvdWQoIHRoaXMuZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwgKTtcblx0XHR0aGlzLm9iamVjdC5wb3NpdGlvbi55IC09IHRoaXMucmFkaXVzICogMC4yO1xuXHRcdFxuXHRcdHRoaXMucG9lbS5zY2VuZS5hZGQoIHRoaXMub2JqZWN0ICk7XG5cdFx0XG5cdFx0dGhpcy5vYmplY3Quc2NhbGUubXVsdGlwbHlTY2FsYXIoIDEuNSApO1xuXHRcdFxuXHRcblx0XG5cdFx0dGhpcy5wb2VtLm9uKCAndXBkYXRlJywgdGhpcy51cGRhdGUuYmluZCh0aGlzKSApO1xuXHRcdFxuXHR9LFxuXHRcblx0ZXJyb3IgOiBmdW5jdGlvbiggZXJyb3IgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQ291bGQgbm90IGxvYWQgYXNzZXRzIGZvciB0aGUgU2luZUdyYXZpdHlDbG91ZFwiLCBlcnJvcik7XG5cdH0sXG5cdFxuXHR1cGRhdGUgOiBmdW5jdGlvbihlKSB7XG5cdFx0XG5cdFx0dmFyIHVuaXRUaW1lWCA9IE1hdGguY29zKCBlLnRpbWUgKiAwLjAwMDA1ICogMSApO1xuXHRcdHZhciB1bml0VGltZVkgPSBNYXRoLmNvcyggZS50aW1lICogMC4wMDAwNSAqIDIgKTtcblx0XHR2YXIgdW5pdFRpbWVaID0gTWF0aC5jb3MoIGUudGltZSAqIDAuMDAwMDUgKiAzICk7XG5cdFx0XG5cdFx0dmFyIGQyO1xuXHRcblx0XHRmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuY291bnQ7IGkrKyApIHtcblx0XHRcdFxuXHRcdFx0ZDIgPXRoaXMucG9zaXRpb25zWyBpICogMyArIDAgXSAqIHRoaXMucG9zaXRpb25zWyBpICogMyArIDAgXSArXG5cdFx0XHQgICAgdGhpcy5wb3NpdGlvbnNbIGkgKiAzICsgMSBdICogdGhpcy5wb3NpdGlvbnNbIGkgKiAzICsgMSBdICtcblx0XHRcdCAgICB0aGlzLnBvc2l0aW9uc1sgaSAqIDMgKyAyIF0gKiB0aGlzLnBvc2l0aW9uc1sgaSAqIDMgKyAyIF07XG5cblx0XHRcdHRoaXMudmVsb2NpdHlbIGkgKiAzICsgMCBdIC09IHVuaXRUaW1lWCAqIHRoaXMucG9zaXRpb25zWyBpICogMyArIDAgXSAvIGQyO1xuXHRcdFx0dGhpcy52ZWxvY2l0eVsgaSAqIDMgKyAxIF0gLT0gdW5pdFRpbWVZICogdGhpcy5wb3NpdGlvbnNbIGkgKiAzICsgMSBdIC8gZDI7XG5cdFx0XHR0aGlzLnZlbG9jaXR5WyBpICogMyArIDIgXSAtPSB1bml0VGltZVogKiB0aGlzLnBvc2l0aW9uc1sgaSAqIDMgKyAyIF0gLyBkMjtcblxuXHRcdFx0dGhpcy5wb3NpdGlvbnNbIGkgKiAzICsgMCBdICs9IHVuaXRUaW1lWCAqIHRoaXMudmVsb2NpdHlbIGkgKiAzICsgMCBdO1xuXHRcdFx0dGhpcy5wb3NpdGlvbnNbIGkgKiAzICsgMSBdICs9IHVuaXRUaW1lWSAqIHRoaXMudmVsb2NpdHlbIGkgKiAzICsgMSBdO1xuXHRcdFx0dGhpcy5wb3NpdGlvbnNbIGkgKiAzICsgMiBdICs9IHVuaXRUaW1lWiAqIHRoaXMudmVsb2NpdHlbIGkgKiAzICsgMiBdO1xuXHRcdFx0XG5cdFx0fVxuXHRcdFxuXHRcdHRoaXMuZ2VvbWV0cnkuYXR0cmlidXRlcy5wb3NpdGlvbi5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cdFx0XG5cdH1cblx0XG59OyIsInZhciByYW5kb20gPSByZXF1aXJlKCcuLi91dGlscy9yYW5kb20nKTtcblxudmFyIFNwaGVyZXMgPSBmdW5jdGlvbihwb2VtLCBwcm9wZXJ0aWVzKSB7XG5cdFxuXHR0aGlzLnBvZW0gPSBwb2VtO1xuXG5cdHRoaXMuY291bnQgPSBwcm9wZXJ0aWVzLmNvdW50ID4gMCA/IHByb3BlcnRpZXMuY291bnQgOiAxMDtcblx0dGhpcy5kaXNwZXJzaW9uID0gcHJvcGVydGllcy5kaXNwZXJzaW9uIHx8IDEwO1xuXHR0aGlzLnJhZGl1cyA9IHByb3BlcnRpZXMucmFkaXVzID4gMCA/IHByb3BlcnRpZXMucmFkaXVzIDogMTtcblx0XG5cdHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoIHRoaXMucmFkaXVzLCAzMiwgMzIgKTtcblx0dGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCggeyBjb2xvciA6IDB4ZmYwMDAwIH0gKTtcblx0XG5cblx0dGhpcy5tZXNoZXMgPSBbXTtcblx0XG5cdHZhciBpPSAtMTsgd2hpbGUoICsraSA8IHByb3BlcnRpZXMuY291bnQgKSB7XG5cdFx0XG5cdFx0dmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaCggdGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCApO1xuXHRcdFxuXHRcdG1lc2gucG9zaXRpb24ueCA9IHJhbmRvbS5yYW5nZSggLXRoaXMuZGlzcGVyc2lvbiwgdGhpcy5kaXNwZXJzaW9uICk7XG5cdFx0bWVzaC5wb3NpdGlvbi55ID0gcmFuZG9tLnJhbmdlKCAtdGhpcy5kaXNwZXJzaW9uLCB0aGlzLmRpc3BlcnNpb24gKTtcblx0XHRtZXNoLnBvc2l0aW9uLnogPSByYW5kb20ucmFuZ2UoIC10aGlzLmRpc3BlcnNpb24sIHRoaXMuZGlzcGVyc2lvbiApO1xuXHRcdFxuXHRcdHRoaXMucG9lbS5zY2VuZS5hZGQoIG1lc2ggKTtcblx0XHR0aGlzLm1lc2hlcy5wdXNoKCBtZXNoICk7XG5cdH1cblx0XG5cdHRoaXMucG9lbS5vbiggJ3VwZGF0ZScsIHRoaXMudXBkYXRlLmJpbmQodGhpcykgKTtcblx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNwaGVyZXM7XG5cblNwaGVyZXMucHJvdG90eXBlID0ge1xuXHRcblx0dXBkYXRlIDogZnVuY3Rpb24oZSkge1xuXHRcdFxuXHRcdHZhciBpPSAtMTsgd2hpbGUoICsraSA8IHRoaXMuY291bnQgKSB7XG5cdFx0XG5cdFx0XHR0aGlzLm1lc2hlc1tpXS5wb3NpdGlvbi54ICs9IHJhbmRvbS5yYW5nZSggLTAuMDAwNSwgMC4wMDA1ICkgKiB0aGlzLmRpc3BlcnNpb24gKiBlLmR0O1xuXHRcdFx0dGhpcy5tZXNoZXNbaV0ucG9zaXRpb24ueSArPSByYW5kb20ucmFuZ2UoIC0wLjAwMDUsIDAuMDAwNSApICogdGhpcy5kaXNwZXJzaW9uICogZS5kdDtcblx0XHRcdHRoaXMubWVzaGVzW2ldLnBvc2l0aW9uLnogKz0gcmFuZG9tLnJhbmdlKCAtMC4wMDA1LCAwLjAwMDUgKSAqIHRoaXMuZGlzcGVyc2lvbiAqIGUuZHQ7XG5cdFx0XG5cdFx0fVxuXHRcdFxuXHR9XG5cdFxufTsiLCJ2YXIgcmFuZG9tXHRcdD0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvcmFuZG9tJylcbiAgLCBsb2FkVGV4dHVyZVx0PSByZXF1aXJlKCcuLi8uLi91dGlscy9sb2FkVGV4dHVyZScpXG4gICwgbG9hZFRleHRcdD0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvbG9hZFRleHQnKVxuICAsIFJTVlBcdFx0PSByZXF1aXJlKCdyc3ZwJylcbiAgLCBzaW1wbGV4Mlx0PSByZXF1aXJlKCcuLi8uLi91dGlscy9zaW1wbGV4MicpXG47XG5cdFxudmFyIFRleHR1cmVQb3NpdGlvbmFsTWF0cmljZXMgPSBmdW5jdGlvbihwb2VtLCBwcm9wZXJ0aWVzKSB7XG5cblx0dGhpcy5wb2VtID0gcG9lbTtcblx0XG5cdHRoaXMub2JqZWN0ID0gbnVsbDtcblx0dGhpcy5tYXRlcmlhbCA9IG51bGw7XG5cdHRoaXMuYXR0cmlidXRlcyA9IG51bGw7XG5cdHRoaXMudW5pZm9ybXMgPSBudWxsO1xuXG5cdHRoaXMudGV4dHVyZSA9IG51bGw7XG5cdHRoaXMudmVydGV4U2hhZGVyID0gbnVsbDtcblx0dGhpcy5mcmFnbWVudFNoYWRlciA9IG51bGw7XG5cdFxuXHR0aGlzLmNvdW50ID0gNTAwMDA7XG5cdHRoaXMucmFkaXVzID0gNDAwO1xuXHR0aGlzLnBvaW50U2l6ZSA9IDE0O1xuXHRcblx0UlNWUC5hbGwoW1xuXHRcdGxvYWRUZXh0dXJlKCBcImFzc2V0cy9pbWFnZXMvc2luZWdyYXZpdHljbG91ZC5wbmdcIiwgdGhpcywgXCJ0ZXh0dXJlXCIgKSxcblx0XHRsb2FkVGV4dCggXCJqcy9kZW1vcy9UZXh0dXJlUG9zaXRpb25hbE1hdHJpY2VzL3NoYWRlci52ZXJ0XCIsIHRoaXMsIFwidmVydGV4U2hhZGVyXCIgKSxcblx0XHRsb2FkVGV4dCggXCJqcy9kZW1vcy9UZXh0dXJlUG9zaXRpb25hbE1hdHJpY2VzL3NoYWRlci5mcmFnXCIsIHRoaXMsIFwiZnJhZ21lbnRTaGFkZXJcIiApXG5cdF0pXG5cdC50aGVuKFxuXHRcdHRoaXMuc3RhcnQuYmluZCh0aGlzKSxcblx0XHR0aGlzLmVycm9yLmJpbmQodGhpcylcblx0KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVGV4dHVyZVBvc2l0aW9uYWxNYXRyaWNlcztcblxuVGV4dHVyZVBvc2l0aW9uYWxNYXRyaWNlcy5wcm90b3R5cGUgPSB7XG5cdFxuXHRzdGFydCA6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHZlYzNGbG9hdExlbmd0aCA9IDM7XG5cdFx0dmFyIHBvaW50c0xlbmd0aCA9IDg7XG5cdFx0dmFyIGJveEdlb21ldHJ5TGVuZ3RoID0gcG9pbnRzTGVuZ3RoICogdmVjM0Zsb2F0TGVuZ3RoO1xuXG5cdFx0dGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xuXG5cdFx0dGhpcy5wb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLmNvdW50ICogYm94R2VvbWV0cnlMZW5ndGggKTtcblx0XHR0aGlzLnZlbG9jaXR5ID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5jb3VudCAqIHZlYzNGbG9hdExlbmd0aCApO1xuXHRcdHRoaXMuY29sb3JzID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5jb3VudCAqIGJveEdlb21ldHJ5TGVuZ3RoICk7XG5cdFx0dGhpcy5zaXplcyA9IG5ldyBGbG9hdDMyQXJyYXkoIHRoaXMuY291bnQgKiBwb2ludHNMZW5ndGggKTtcblx0XHR0aGlzLnRyYW5zZm9ybUluZGljZXMgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLmNvdW50ICogcG9pbnRzTGVuZ3RoICk7XG5cblx0XHR2YXIgY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoMHgwMDAwMDApO1xuXHRcdHZhciBodWU7XG5cdFx0XG5cdFx0dmFyIHZlcnRpY2VzID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KCAxLCAxLCAxICkudmVydGljZXM7XG5cblx0XHR2YXIgeCwgeSwgeiwgaSwgajtcblxuXHRcdGZvciggaSA9IDA7IGkgPCB0aGlzLmNvdW50OyBpKysgKSB7XG5cdFx0XHRcblx0XHRcdGh1ZSA9ICh0aGlzLnBvc2l0aW9uc1sgaSAqIDMgKyAwIF0gLyB0aGlzLnJhZGl1cyAqIDAuMyArIDAuNjUpICUgMTtcblx0XHRcdGh1ZSA9IHJhbmRvbS5yYW5nZSggMCwgMSApO1xuXG5cdFx0XHRjb2xvci5zZXRIU0woIGh1ZSwgMS4wLCAwLjU1ICk7XG5cdFx0XHRcblx0XHRcdGZvciggaj0wOyBqIDwgdmVydGljZXMubGVuZ3RoIDsgaisrICkge1xuXHRcdFx0XHRcblx0XHRcdFx0dmFyIG9mZnNldDMgPSAoaSAqIGJveEdlb21ldHJ5TGVuZ3RoKSArIChqICogdmVjM0Zsb2F0TGVuZ3RoKTtcblx0XHRcdFx0dmFyIG9mZnNldDEgPSAoaSAqIHBvaW50c0xlbmd0aCArIGopO1xuXG5cdFx0XHRcdHRoaXMuc2l6ZXNbIG9mZnNldDEgXSA9IHRoaXMucG9pbnRTaXplO1xuXHRcdFx0XHR0aGlzLnRyYW5zZm9ybUluZGljZXNbIG9mZnNldDEgXSA9IGk7XG5cdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHR0aGlzLnBvc2l0aW9uc1sgb2Zmc2V0MyArIDAgXSA9IHZlcnRpY2VzW2pdLnggKiA0O1xuXHRcdFx0XHR0aGlzLnBvc2l0aW9uc1sgb2Zmc2V0MyArIDEgXSA9IHZlcnRpY2VzW2pdLnkgKiA0O1xuXHRcdFx0XHR0aGlzLnBvc2l0aW9uc1sgb2Zmc2V0MyArIDIgXSA9IHZlcnRpY2VzW2pdLnogKiA0O1xuXG5cdFx0XHRcdHRoaXMuY29sb3JzWyBvZmZzZXQzICsgMCBdID0gY29sb3Iucjtcblx0XHRcdFx0dGhpcy5jb2xvcnNbIG9mZnNldDMgKyAxIF0gPSBjb2xvci5nO1xuXHRcdFx0XHR0aGlzLmNvbG9yc1sgb2Zmc2V0MyArIDIgXSA9IGNvbG9yLmI7XG5cblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZVNpemUgPSB0aGlzLmNhbGN1bGF0ZVNxdWFyZWRUZXh0dXJlU2l6ZSggdGhpcy5jb3VudCAqIDE2ICk7IC8vMTYgZmxvYXRzIHBlciBtYXRyaXhcblx0XHRcblx0XHR0aGlzLm1hdHJpY2VzID0gW107XG5cdFx0dGhpcy5tYXRyaWNlc0RhdGEgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLm1hdHJpY2VzVGV4dHVyZVNpemUgKiB0aGlzLm1hdHJpY2VzVGV4dHVyZVNpemUgKiA0ICk7XG5cdFx0XG5cdFx0dmFyIHJvdGF0ZU0gPSBuZXcgVEhSRUUuTWF0cml4NCgpO1xuXHRcdHZhciB0cmFuc2xhdGVNID0gbmV3IFRIUkVFLk1hdHJpeDQoKTtcblx0XHR2YXIgc2NhbGVNID0gbmV3IFRIUkVFLk1hdHJpeDQoKTtcblx0XHR2YXIgZXVsZXIgPSBuZXcgVEhSRUUuRXVsZXIoKTtcblx0XHR2YXIgcztcblx0XHRcblx0XHRmb3IoIGkgPSAwOyBpIDwgdGhpcy5jb3VudCA7IGkrKyApIHtcblx0XHRcdFxuXHRcdFx0cyA9IHJhbmRvbS5yYW5nZSggMC41LCAyICk7XG5cdFx0XHRcblx0XHRcdHNjYWxlTS5tYWtlU2NhbGUoIHMsIHMsIHMgKTtcblx0XHRcdFxuXHRcdFx0dHJhbnNsYXRlTS5tYWtlVHJhbnNsYXRpb24oXG5cdFx0XHRcdHJhbmRvbS5yYW5nZSggLXRoaXMucmFkaXVzLCB0aGlzLnJhZGl1cyApICogMC41LFxuXHRcdFx0XHRyYW5kb20ucmFuZ2UoIC10aGlzLnJhZGl1cywgdGhpcy5yYWRpdXMgKSAqIDAuNSxcblx0XHRcdFx0cmFuZG9tLnJhbmdlKCAtdGhpcy5yYWRpdXMsIHRoaXMucmFkaXVzICkgKiAwLjVcblx0XHRcdCk7XG5cdFx0XHRcblx0XHRcdGV1bGVyLnNldChcblx0XHRcdFx0cmFuZG9tLnJhbmdlKCAwLCAyICogTWF0aC5QSSApLFxuXHRcdFx0XHRyYW5kb20ucmFuZ2UoIDAsIDIgKiBNYXRoLlBJICksXG5cdFx0XHRcdHJhbmRvbS5yYW5nZSggMCwgMiAqIE1hdGguUEkgKVxuXHRcdFx0KTtcblxuXHRcdFx0cm90YXRlTS5tYWtlUm90YXRpb25Gcm9tRXVsZXIoIGV1bGVyICk7XG5cdFx0XHRcblx0XHRcdHRoaXMubWF0cmljZXNbaV0gPSBuZXcgVEhSRUUuTWF0cml4NCgpXG5cdFx0XHRcdC5tdWx0aXBseSggdHJhbnNsYXRlTSApXG5cdFx0XHRcdC5tdWx0aXBseSggcm90YXRlTSApXG5cdFx0XHRcdC5tdWx0aXBseSggc2NhbGVNICk7XG5cdFx0XHRcblx0XHRcdC8vIHRoaXMubWF0cmljZXNbaV0gPSBuZXcgVEhSRUUuTWF0cml4NCgpO1xuXHRcdFx0XG5cdFx0XHR0aGlzLm1hdHJpY2VzW2ldLmZsYXR0ZW5Ub0FycmF5T2Zmc2V0KCB0aGlzLm1hdHJpY2VzRGF0YSwgaSAqIDE2ICk7XG5cdFx0XHRcblx0XHR9XG5cdFx0XG5cdFx0dGhpcy5tYXRyaWNlc1RleHR1cmUgPSBuZXcgVEhSRUUuRGF0YVRleHR1cmUoXG5cdFx0XHR0aGlzLm1hdHJpY2VzRGF0YSxcblx0XHRcdHRoaXMubWF0cmljZXNUZXh0dXJlU2l6ZSxcblx0XHRcdHRoaXMubWF0cmljZXNUZXh0dXJlU2l6ZSxcblx0XHRcdFRIUkVFLlJHQkFGb3JtYXQsXG5cdFx0XHRUSFJFRS5GbG9hdFR5cGVcblx0XHQpO1xuXHRcdHRoaXMubWF0cmljZXNUZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XG5cdFx0dGhpcy5tYXRyaWNlc1RleHR1cmUubWFnRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcblx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZS5nZW5lcmF0ZU1pcG1hcHMgPSBmYWxzZTtcblx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZS5mbGlwWSA9IGZhbHNlO1xuXHRcdHRoaXMubWF0cmljZXNUZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblx0XHRcblx0XHR0aGlzLmF0dHJpYnV0ZXMgPSB7XG5cblx0XHRcdHNpemU6ICAgICAgIFx0eyB0eXBlOiAnZicsIHZhbHVlOiBudWxsIH0sXG5cdFx0XHRjdXN0b21Db2xvcjpcdHsgdHlwZTogJ2MnLCB2YWx1ZTogbnVsbCB9LFxuXHRcdFx0dHJhbnNmb3JtSW5kZXg6XHR7IHR5cGU6ICdmJywgdmFsdWU6IG51bGwgfVxuXG5cdFx0fTtcblxuXHRcdHRoaXMudW5pZm9ybXMgPSB7XG5cblx0XHRcdGNvbG9yOiAgICAgXHRcdFx0XHR7IHR5cGU6IFwiY1wiLCB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCAweGZmZmZmZiApIH0sXG5cdFx0XHR0ZXh0dXJlOiAgIFx0XHRcdFx0eyB0eXBlOiBcInRcIiwgdmFsdWU6IHRoaXMudGV4dHVyZSB9LFxuXHRcdFx0bWF0cmljZXNUZXh0dXJlOlx0XHR7IHR5cGU6IFwidFwiLCB2YWx1ZTogdGhpcy5tYXRyaWNlc1RleHR1cmUgfSxcblx0XHRcdHRpbWU6ICAgICAgXHRcdFx0XHR7IHR5cGU6ICdmJywgdmFsdWU6IERhdGUubm93KCkgfSxcblx0XHRcdG1hdHJpY2VzVGV4dHVyZVNpemU6XHR7IHR5cGU6ICdmJywgdmFsdWU6IHRoaXMubWF0cmljZXNUZXh0dXJlU2l6ZSB9XG5cblx0XHR9O1xuXG5cdFx0dGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCgge1xuXG5cdFx0XHR1bmlmb3JtczogICAgICAgdGhpcy51bmlmb3Jtcyxcblx0XHRcdGF0dHJpYnV0ZXM6ICAgICB0aGlzLmF0dHJpYnV0ZXMsXG5cdFx0XHR2ZXJ0ZXhTaGFkZXI6ICAgdGhpcy52ZXJ0ZXhTaGFkZXIsXG5cdFx0XHRmcmFnbWVudFNoYWRlcjogdGhpcy5mcmFnbWVudFNoYWRlcixcblxuXHRcdFx0YmxlbmRpbmc6ICAgICAgIFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG5cdFx0XHRkZXB0aFRlc3Q6ICAgICAgZmFsc2UsXG5cdFx0XHR0cmFuc3BhcmVudDogICAgdHJ1ZVxuXG5cdFx0fSk7XG5cdFx0XG5cdFx0dGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoICdwb3NpdGlvbicsXHRcdFx0bmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSggdGhpcy5wb3NpdGlvbnMsIDMgKSApO1xuXHRcdHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCAnY3VzdG9tQ29sb3InLFx0XHRuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKCB0aGlzLmNvbG9ycywgMyApICk7XG5cdFx0dGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoICdzaXplJyxcdFx0XHRcdG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIHRoaXMuc2l6ZXMsIDEgKSApO1xuXHRcdHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCAndHJhbnNmb3JtSW5kZXgnLFx0bmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSggdGhpcy50cmFuc2Zvcm1JbmRpY2VzLCAxICkgKTtcblxuXHRcdHRoaXMub2JqZWN0ID0gbmV3IFRIUkVFLlBvaW50Q2xvdWQoIHRoaXMuZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwgKTtcblx0XHR0aGlzLm9iamVjdC5wb3NpdGlvbi55IC09IHRoaXMucmFkaXVzICogMC4yO1xuXHRcdFxuXHRcdHRoaXMucG9lbS5zY2VuZS5hZGQoIHRoaXMub2JqZWN0ICk7XG5cdFxuXHRcblx0XHR0aGlzLnBvZW0ub24oICd1cGRhdGUnLCB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpICk7XG5cdFx0XG5cdH0sXG5cdFxuXHRjYWxjdWxhdGVTcXVhcmVkVGV4dHVyZVNpemUgOiBmdW5jdGlvbiggY291bnQgKSB7XG5cdFx0XG5cdFx0dmFyIHNpemUgPSAxO1xuXHRcdHZhciBpID0gMDtcblx0XHRcblx0XHR3aGlsZSggc2l6ZSAqIHNpemUgPCAoY291bnQgLyA0KSApIHtcblx0XHRcdFxuXHRcdFx0aSsrO1xuXHRcdFx0c2l6ZSA9IE1hdGgucG93KCAyLCBpICk7XG5cdFx0XHRcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIHNpemU7XG5cdH0sXG5cdFxuXHRlcnJvciA6IGZ1bmN0aW9uKCBlcnJvciApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgbG9hZCBhc3NldHMgZm9yIHRoZSBUZXh0dXJlUG9zaXRpb25hbE1hdHJpY2VzXCIsIGVycm9yKTtcblx0fSxcblx0XG5cdHVwZGF0ZSA6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdHZhciB0cmFuc2xhdGlvbiA9IG5ldyBUSFJFRS5NYXRyaXg0KCk7XG5cdFx0dmFyIGV1bGVyID0gbmV3IFRIUkVFLkV1bGVyKCk7XG5cdFx0XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGUpIHtcblxuXHRcdFx0dGhpcy51bmlmb3Jtcy50aW1lLnZhbHVlID0gZS50aW1lO1xuXHRcdFx0XG5cdFx0XHR2YXIgeCx5O1xuXHRcdFxuXHRcdFx0Zm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmNvdW50IDsgaSsrICkge1xuXHRcdFx0XHRcblx0XHRcdFx0eCA9IGUudGltZSAvIDEwMDA7XG5cdFx0XHRcdHkgPSBpICogMTAwMDtcblx0XHRcdFx0XG5cdFx0XHRcdHRyYW5zbGF0aW9uLm1ha2VUcmFuc2xhdGlvbihcblx0XHRcdFx0XHRzaW1wbGV4Mi5yYW5nZSggeCwgeSwgLTEsIDEgKSxcblx0XHRcdFx0XHRzaW1wbGV4Mi5yYW5nZSggeCwgeSArIDMzMywgLTEsIDEgKSxcblx0XHRcdFx0XHRzaW1wbGV4Mi5yYW5nZSggeCwgeSArIDY2NiwgLTEsIDEgKVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRcblx0XHRcdFx0dGhpcy5tYXRyaWNlc1tpXS5tdWx0aXBseU1hdHJpY2VzKCB0cmFuc2xhdGlvbiwgdGhpcy5tYXRyaWNlc1tpXSApO1xuXHRcdFx0XHRcblx0XHRcdFx0Ly8gZXVsZXIuc2V0KFxuXHRcdFx0XHQvLyBcdHJhbmRvbS5yYW5nZSggMCwgMiAqIE1hdGguUEkgKSxcblx0XHRcdFx0Ly8gXHRyYW5kb20ucmFuZ2UoIDAsIDIgKiBNYXRoLlBJICksXG5cdFx0XHRcdC8vIFx0cmFuZG9tLnJhbmdlKCAwLCAyICogTWF0aC5QSSApXG5cdFx0XHRcdC8vICk7XG5cdFx0XHRcdC8vXG5cdFx0XHRcdC8vIHJvdGF0ZU0ubWFrZVJvdGF0aW9uRnJvbUV1bGVyKCBldWxlciApO1xuXHRcdFx0XHRcblx0XHRcdFx0XG5cdFx0XHRcdHRoaXMubWF0cmljZXNbaV0uZmxhdHRlblRvQXJyYXlPZmZzZXQoIHRoaXMubWF0cmljZXNEYXRhLCBpICogMTYgKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0dGhpcy5tYXRyaWNlc1RleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xuXHRcdH07XG5cdH0oKVxuXHRcbn07XG5cbndpbmRvdy5jb25zb2xlTWF0cml4RWxlbWVudHMgPSBmdW5jdGlvbiggZWxzLCBkZWNpbWFsUGxhY2VzICkge1xuIFxuXHR2YXIgaSwgaiwgZWwsIHJlc3VsdHM7XG4gXG5cdHJlc3VsdHMgPSBbXTtcblx0aiA9IDA7XG4gXG5cdGZvciggaT0wOyBpIDwgZWxzLmxlbmd0aDsgaSsrICkge1xuXHRcdFxuXHRcdGlmKCBqID09PSAwICkge1xuXHRcdFx0cmVzdWx0cy5wdXNoKFtdKTtcblx0XHR9XG4gXG5cdFx0ZWwgPSBlbHNbaV07XG4gXG5cdFx0aWYoIHR5cGVvZiBkZWNpbWFsUGxhY2VzID09PSBcIm51bWJlclwiICkge1xuIFxuXHRcdFx0ZWwgPSBNYXRoLnJvdW5kKCBNYXRoLnBvdygxMCwgZGVjaW1hbFBsYWNlcykgKiBlbCApIC8gTWF0aC5wb3coMTAsIGRlY2ltYWxQbGFjZXMpO1xuIFxuXHRcdH1cbiBcblx0XHRyZXN1bHRzW01hdGguZmxvb3IoaSAvIDQpICUgNF0ucHVzaCggZWwgKTtcbiBcblx0XHRqKys7XG5cdFx0aiAlPSA0O1xuXHRcdFxuXHRcdGlmKCBpICUgMTYgPT09IDE1ICkge1xuXHRcdFx0Y29uc29sZS50YWJsZSggcmVzdWx0cyApO1xuXHRcdFx0cmVzdWx0cyA9IFtdO1xuXHRcdH1cbiBcblx0fVxuIFxufTsiLCJ2YXIgcmFuZG9tXHRcdD0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvcmFuZG9tJylcbiAgLCBsb2FkVGV4dHVyZVx0PSByZXF1aXJlKCcuLi8uLi91dGlscy9sb2FkVGV4dHVyZScpXG4gICwgbG9hZFRleHRcdD0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvbG9hZFRleHQnKVxuICAsIFJTVlBcdFx0PSByZXF1aXJlKCdyc3ZwJylcbjtcblxudmFyIFVuaWZvcm1Qb3NpdGlvbmFsTWF0cmljZXMgPSBmdW5jdGlvbihwb2VtLCBwcm9wZXJ0aWVzKSB7XG5cblx0dGhpcy5wb2VtID0gcG9lbTtcblx0XG5cdHRoaXMub2JqZWN0ID0gbnVsbDtcblx0dGhpcy5tYXRlcmlhbCA9IG51bGw7XG5cdHRoaXMuYXR0cmlidXRlcyA9IG51bGw7XG5cdHRoaXMudW5pZm9ybXMgPSBudWxsO1xuXG5cdHRoaXMudGV4dHVyZSA9IG51bGw7XG5cdHRoaXMudmVydGV4U2hhZGVyID0gbnVsbDtcblx0dGhpcy5mcmFnbWVudFNoYWRlciA9IG51bGw7XG5cdFxuXHR0aGlzLmNvdW50ID0gMjAwMDAwO1xuXHR0aGlzLnJhZGl1cyA9IDIwMDtcblx0dGhpcy5wb2ludFNpemUgPSA3O1xuXHRcblx0UlNWUC5hbGwoW1xuXHRcdGxvYWRUZXh0dXJlKCBcImFzc2V0cy9pbWFnZXMvc2luZWdyYXZpdHljbG91ZC5wbmdcIiwgdGhpcywgXCJ0ZXh0dXJlXCIgKSxcblx0XHRsb2FkVGV4dCggXCJqcy9kZW1vcy9Vbmlmb3JtUG9zaXRpb25hbE1hdHJpY2VzL3NoYWRlci52ZXJ0XCIsIHRoaXMsIFwidmVydGV4U2hhZGVyXCIgKSxcblx0XHRsb2FkVGV4dCggXCJqcy9kZW1vcy9Vbmlmb3JtUG9zaXRpb25hbE1hdHJpY2VzL3NoYWRlci5mcmFnXCIsIHRoaXMsIFwiZnJhZ21lbnRTaGFkZXJcIiApXG5cdF0pXG5cdC50aGVuKFxuXHRcdHRoaXMuc3RhcnQuYmluZCh0aGlzKSxcblx0XHR0aGlzLmVycm9yLmJpbmQodGhpcylcblx0KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVW5pZm9ybVBvc2l0aW9uYWxNYXRyaWNlcztcblxuVW5pZm9ybVBvc2l0aW9uYWxNYXRyaWNlcy5wcm90b3R5cGUgPSB7XG5cdFxuXHRzdGFydCA6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdHZhciB0cmFuc2Zvcm1Db3VudCA9IDUwO1xuXHRcdFxuXHRcdFxuXHRcdHRoaXMuYXR0cmlidXRlcyA9IHtcblxuXHRcdFx0c2l6ZTogICAgICAgXHR7IHR5cGU6ICdmJywgdmFsdWU6IG51bGwgfSxcblx0XHRcdGN1c3RvbUNvbG9yOlx0eyB0eXBlOiAnYycsIHZhbHVlOiBudWxsIH0sXG5cdFx0XHR0cmFuc2Zvcm1JbmRleDpcdHsgdHlwZTogJ2YnLCB2YWx1ZTogbnVsbCB9XG5cblx0XHR9O1xuXG5cdFx0dGhpcy51bmlmb3JtcyA9IHtcblxuXHRcdFx0Y29sb3I6ICAgICBcdFx0XHR7IHR5cGU6IFwiY1wiLCB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCAweGZmZmZmZiApIH0sXG5cdFx0XHR0ZXh0dXJlOiAgIFx0XHRcdHsgdHlwZTogXCJ0XCIsIHZhbHVlOiB0aGlzLnRleHR1cmUgfSxcblx0XHRcdHRpbWU6ICAgICAgXHRcdFx0eyB0eXBlOiAnZicsIHZhbHVlOiBEYXRlLm5vdygpIH0sXG5cdFx0XHR0cmFuc2Zvcm1NYXRyaXg6XHR7IHR5cGU6ICdtNHYnLCB2YWx1ZTogW10gfVxuXG5cdFx0fTtcblxuXHRcdHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoIHtcblxuXHRcdFx0dW5pZm9ybXM6ICAgICAgIHRoaXMudW5pZm9ybXMsXG5cdFx0XHRhdHRyaWJ1dGVzOiAgICAgdGhpcy5hdHRyaWJ1dGVzLFxuXHRcdFx0dmVydGV4U2hhZGVyOiAgIFwiI2RlZmluZSBUUkFOU0ZPUk1fTUFUUklYX0NPVU5UIFwiICsgdHJhbnNmb3JtQ291bnQgKyBcIlxcblwiICsgdGhpcy52ZXJ0ZXhTaGFkZXIsXG5cdFx0XHRmcmFnbWVudFNoYWRlcjogdGhpcy5mcmFnbWVudFNoYWRlcixcblxuXHRcdFx0YmxlbmRpbmc6ICAgICAgIFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG5cdFx0XHRkZXB0aFRlc3Q6ICAgICAgZmFsc2UsXG5cdFx0XHR0cmFuc3BhcmVudDogICAgdHJ1ZVxuXG5cdFx0fSk7XG5cblx0XHR0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XG5cblx0XHR0aGlzLnBvc2l0aW9ucyA9IG5ldyBGbG9hdDMyQXJyYXkoIHRoaXMuY291bnQgKiAzICk7XG5cdFx0dGhpcy52ZWxvY2l0eSA9IG5ldyBGbG9hdDMyQXJyYXkoIHRoaXMuY291bnQgKiAzICk7XG5cdFx0dGhpcy5jb2xvcnMgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLmNvdW50ICogMyApO1xuXHRcdHRoaXMuc2l6ZXMgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLmNvdW50ICk7XG5cdFx0dGhpcy50cmFuc2Zvcm1JbmRpY2VzID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5jb3VudCApO1xuXG5cdFx0dmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKDB4MDAwMDAwKTtcblx0XHR2YXIgaHVlO1xuXHRcdFxuXHRcdHZhciB0aGV0YSwgcGhpO1xuXHRcdFxuXHRcdHZhciB4O1xuXG5cdFx0Zm9yKCB2YXIgdiA9IDA7IHYgPCB0aGlzLmNvdW50OyB2KysgKSB7XG5cblx0XHRcdHRoaXMuc2l6ZXNbIHYgXSA9IHRoaXMucG9pbnRTaXplO1xuXHRcdFx0dGhpcy50cmFuc2Zvcm1JbmRpY2VzWyB2IF0gPSByYW5kb20ucmFuZ2VJbnQoIDAsIHRyYW5zZm9ybUNvdW50ICk7XG5cdFx0XHRcdFx0XHRcblx0XHRcdHRoZXRhID0gcmFuZG9tLnJhbmdlTG93KCAwLjEsIE1hdGguUEkgKTtcblx0XHRcdHBoaSA9IHJhbmRvbS5yYW5nZUxvdyggTWF0aC5QSSAqIDAuMywgTWF0aC5QSSApO1xuXHRcdFx0XG5cdFx0XHR0aGlzLnBvc2l0aW9uc1sgdiAqIDMgKyAwIF0gPSBNYXRoLnNpbiggdGhldGEgKSAqIE1hdGguY29zKCBwaGkgKSAqIHRoaXMucmFkaXVzICogdGhldGE7XG5cdFx0XHR0aGlzLnBvc2l0aW9uc1sgdiAqIDMgKyAxIF0gPSBNYXRoLnNpbiggdGhldGEgKSAqIE1hdGguc2luKCBwaGkgKSAqIHRoaXMucmFkaXVzO1xuXHRcdFx0dGhpcy5wb3NpdGlvbnNbIHYgKiAzICsgMiBdID0gTWF0aC5jb3MoIHRoZXRhICkgKiB0aGlzLnJhZGl1cyA7XG5cdFx0XHRcblx0XHRcdFxuXHRcdFx0aHVlID0gKHRoaXMucG9zaXRpb25zWyB2ICogMyArIDAgXSAvIHRoaXMucmFkaXVzICogMC4zICsgMC42NSkgJSAxO1xuXG5cdFx0XHRjb2xvci5zZXRIU0woIGh1ZSwgMS4wLCAwLjU1ICk7XG5cblx0XHRcdHRoaXMuY29sb3JzWyB2ICogMyArIDAgXSA9IGNvbG9yLnI7XG5cdFx0XHR0aGlzLmNvbG9yc1sgdiAqIDMgKyAxIF0gPSBjb2xvci5nO1xuXHRcdFx0dGhpcy5jb2xvcnNbIHYgKiAzICsgMiBdID0gY29sb3IuYjtcblxuXHRcdH1cblx0XHRcblx0XHRmb3IoIHZhciBpID0gMDsgaSA8IHRyYW5zZm9ybUNvdW50IDsgaSsrICkge1xuXHRcdFx0XG5cdFx0XHR0aGlzLnVuaWZvcm1zLnRyYW5zZm9ybU1hdHJpeC52YWx1ZVtpXSA9IG5ldyBUSFJFRS5NYXRyaXg0KCkubWFrZVRyYW5zbGF0aW9uKFxuXHRcdFx0XHRyYW5kb20ucmFuZ2UoIC10aGlzLnJhZGl1cywgdGhpcy5yYWRpdXMgKSAqIDAuNSxcblx0XHRcdFx0cmFuZG9tLnJhbmdlKCAtdGhpcy5yYWRpdXMsIHRoaXMucmFkaXVzICkgKiAwLjUsXG5cdFx0XHRcdHJhbmRvbS5yYW5nZSggLXRoaXMucmFkaXVzLCB0aGlzLnJhZGl1cyApICogMC41XG5cdFx0XHQpO1xuXHRcdFx0XG5cdFx0fVxuXG5cdFx0dGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoICdwb3NpdGlvbicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIHRoaXMucG9zaXRpb25zLCAzICkgKTtcblx0XHR0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSggJ2N1c3RvbUNvbG9yJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSggdGhpcy5jb2xvcnMsIDMgKSApO1xuXHRcdHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCAnc2l6ZScsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIHRoaXMuc2l6ZXMsIDEgKSApO1xuXHRcdHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCAndHJhbnNmb3JtSW5kZXgnLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKCB0aGlzLnRyYW5zZm9ybUluZGljZXMsIDEgKSApO1xuXG5cdFx0dGhpcy5vYmplY3QgPSBuZXcgVEhSRUUuUG9pbnRDbG91ZCggdGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCApO1xuXHRcdHRoaXMub2JqZWN0LnBvc2l0aW9uLnkgLT0gdGhpcy5yYWRpdXMgKiAwLjI7XG5cdFx0XG5cdFx0dGhpcy5wb2VtLnNjZW5lLmFkZCggdGhpcy5vYmplY3QgKTtcblx0XG5cdFxuXHRcdHRoaXMucG9lbS5vbiggJ3VwZGF0ZScsIHRoaXMudXBkYXRlLmJpbmQodGhpcykgKTtcblx0XHRcblx0fSxcblx0XG5cdGVycm9yIDogZnVuY3Rpb24oIGVycm9yICkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCBsb2FkIGFzc2V0cyBmb3IgdGhlIFVuaWZvcm1Qb3NpdGlvbmFsTWF0cmljZXNcIiwgZXJyb3IpO1xuXHR9LFxuXHRcblx0dXBkYXRlIDogZnVuY3Rpb24oZSkge1xuXG5cdFx0dGhpcy51bmlmb3Jtcy50aW1lLnZhbHVlID0gZS50aW1lO1xuXHRcdFxuXHR9XG5cdFxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcblx0Y29uZmlnIDoge1xuXHRcdGNhbWVyYSA6IHtcblx0XHRcdHggOiAtNDAwLFxuXHRcdFx0ZmFyIDogMzAwMFxuXHRcdH1cblx0fSxcblx0b2JqZWN0cyA6IHtcblx0XHRzcGhlcmUgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9kZW1vcy9FYXJ0aFwiKSxcblx0XHRcdHByb3BlcnRpZXM6IHt9XG5cdFx0fSxcblx0XHRjb250cm9scyA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2NvbXBvbmVudHMvY2FtZXJhcy9Db250cm9sc1wiKSxcblx0XHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdFx0bWluRGlzdGFuY2UgOiA1MDAsXG5cdFx0XHRcdG1heERpc3RhbmNlIDogMTAwMCxcblx0XHRcdFx0em9vbVNwZWVkIDogMC4xLFxuXHRcdFx0XHRhdXRvUm90YXRlIDogdHJ1ZSxcblx0XHRcdFx0YXV0b1JvdGF0ZVNwZWVkIDogMC4yXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRpbmZvIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vY29tcG9uZW50cy9JbmZvXCIpLFxuXHRcdFx0cHJvcGVydGllcyA6IHtcblx0XHRcdFx0ZG9jdW1lbnRUaXRsZSA6IFwiRWFydGgncyBDTzIg4oCTIGEgVGhyZWUuanMgVmlzdWFsaXphdGlvbiBhZGFwdGVkIGJ5IEdyZWcgVGF0dW1cIixcblx0XHRcdFx0dGl0bGUgOiBcIkVhcnRoJ3MgQ08yXCIsXG5cdFx0XHRcdHN1YnRpdGxlIDogXCIzZCBWaXN1YWxpc2F0aW9uIG9mIGEgbWFwIGZyb20gTkFTQVwiLFxuXHRcdFx0XHRhcHBlbmRDcmVkaXRzIDogXCI8YnIvPiBNYXAgdmlzdWFsaXphdGlvbiBieSA8YSBocmVmPSdodHRwOi8vc3ZzLmdzZmMubmFzYS5nb3YvY2dpLWJpbi9kZXRhaWxzLmNnaT9haWQ9MTE3MTknPk5BU0EncyBHb2RkYXJkIFNwYWNlIEZsaWdodCBDZW50ZXI8L2E+XCIsXG5cdFx0XHRcdHRpdGxlQ3NzIDogeyBcImZvbnQtc2l6ZVwiOiBcIjMuMzVlbVwiIH0sXG5cdFx0XHRcdHN1YnRpdGxlQ3NzIDoge1x0XCJmb250LXNpemVcIjogXCIwLjdlbVwiIH0sXG5cdFx0XHRcdHNob3dBcnJvd05leHQgOiB0cnVlXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRzdGFycyA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2NvbXBvbmVudHMvU3RhcnNcIiksXG5cdFx0fSxcblx0XHQvLyBzdGF0cyA6IHtcblx0XHQvLyBcdG9iamVjdDogcmVxdWlyZShcIi4uL2NvbXBvbmVudHMvdXRpbHMvU3RhdHNcIilcblx0XHQvLyB9LFxuXHRcdGxpZ2h0cyA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2NvbXBvbmVudHMvbGlnaHRzL1RyYWNrQ2FtZXJhTGlnaHRzXCIpXG5cdFx0fVxuXHR9XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRjb25maWcgOiB7XG5cdFx0Y2FtZXJhIDoge1xuXHRcdFx0eCA6IC00MDBcblx0XHR9XG5cdH0sXG5cdG9iamVjdHMgOiB7XG5cdFx0ZW5kbGVzc1RlcnJhaW4gOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9kZW1vcy9FbmRsZXNzVGVycmFpblwiKSxcblx0XHR9LFxuXHRcdGVuZGxlc3NDYW1lcmEgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9kZW1vcy9FbmRsZXNzVGVycmFpbi9jYW1lcmFcIiksXG5cdFx0fSxcblx0XHRza3kgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL2FtYmlhbmNlL1NreVwiKSxcblx0XHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdFx0d2lkdGg6IDEwMDAwXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRjbG91ZHNCb3R0b20gOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL2FtYmlhbmNlL0Nsb3Vkc1wiKSxcblx0XHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdFx0aGVpZ2h0OiAtMjAwLFxuXHRcdFx0XHRyb3RhdGlvbjogTWF0aC5QSSAvIDJcblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gc3RhdHMgOiB7XG5cdFx0Ly8gXHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL3V0aWxzL1N0YXRzXCIpXG5cdFx0Ly8gfVxuXHR9XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRtZXNoR3JvdXBCb3hEZW1vIDogcmVxdWlyZShcIi4vbWVzaEdyb3VwQm94RGVtb1wiKSxcblx0Y2FyYm9uRGlveGlkZUVhcnRoIDogcmVxdWlyZShcIi4vY2FyYm9uRGlveGlkZUVhcnRoXCIpLFxuXHRlbmRsZXNzVGVycmFpbiA6IHJlcXVpcmUoXCIuL2VuZGxlc3NUZXJyYWluXCIpLFxuXHRzcGhlcmVzRGVtbyA6IHJlcXVpcmUoXCIuL3NwaGVyZXNEZW1vXCIpLFxuXHR2ciA6IHJlcXVpcmUoXCIuL3ZyXCIpLFxuXHRzaW5lR3Jhdml0eUNsb3VkIDogcmVxdWlyZShcIi4vc2luZUdyYXZpdHlDbG91ZFwiKSxcblx0dW5pZm9ybVBvc2l0aW9uYWxNYXRyaWNlcyA6IHJlcXVpcmUoXCIuL3VuaWZvcm1Qb3NpdGlvbmFsTWF0cmljZXNcIiksXG5cdHRleHR1cmVQb3NpdGlvbmFsTWF0cmljZXMgOiByZXF1aXJlKFwiLi90ZXh0dXJlUG9zaXRpb25hbE1hdHJpY2VzXCIpXG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRjb25maWcgOiB7XG5cdFx0Y2FtZXJhIDoge1xuXHRcdFx0eCA6IC00MDBcblx0XHR9XG5cdH0sXG5cdG9iamVjdHMgOiB7XG5cdFx0ZGVtbyA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2RlbW9zL01lc2hHcm91cEJveERlbW9cIiksXG5cdFx0XHRwcm9wZXJ0aWVzOiB7fVxuXHRcdH0sXG5cdFx0Y29udHJvbHMgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL2NhbWVyYXMvQ29udHJvbHNcIiksXG5cdFx0fSxcblx0XHRncmlkIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vZGVtb3MvR3JpZFwiKSxcblx0XHR9LFxuXHRcdHN0YXRzIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vY29tcG9uZW50cy91dGlscy9TdGF0c1wiKVxuXHRcdH1cblx0fVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcblx0Y29uZmlnIDoge1xuXHRcdGNhbWVyYSA6IHtcblx0XHRcdHggOiAtNDAwXG5cdFx0fVxuXHR9LFxuXHRvYmplY3RzIDoge1xuXHRcdGNvbnRyb2xzIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vY29tcG9uZW50cy9jYW1lcmFzL0NvbnRyb2xzXCIpLFxuXHRcdH0sXG5cdFx0cG9pbnRjbG91ZCA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2RlbW9zL1NpbmVHcmF2aXR5Q2xvdWRcIiksXG5cdFx0fSxcblx0XHRncmlkIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vZGVtb3MvR3JpZFwiKSxcblx0XHR9LFxuXHRcdC8vIHN0YXRzIDoge1xuXHRcdC8vIFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vY29tcG9uZW50cy91dGlscy9TdGF0c1wiKVxuXHRcdC8vIH1cblx0fVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcblx0Y29uZmlnIDoge1xuXHRcdGNhbWVyYSA6IHtcblx0XHRcdHggOiAtNDAwXG5cdFx0fVxuXHR9LFxuXHRvYmplY3RzIDoge1xuXHRcdHNwaGVyZSA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2RlbW9zL1NwaGVyZXNcIiksXG5cdFx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRcdGNvdW50IDogNTAsXG5cdFx0XHRcdGRpc3BlcnNpb24gOiAxMjAsXG5cdFx0XHRcdHJhZGl1cyA6IDEwXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRjb250cm9scyA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2NvbXBvbmVudHMvY2FtZXJhcy9Db250cm9sc1wiKSxcblx0XHR9LFxuXHRcdGdyaWQgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9kZW1vcy9HcmlkXCIpLFxuXHRcdH0sXG5cdFx0c3RhdHMgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL3V0aWxzL1N0YXRzXCIpXG5cdFx0fVxuXHR9XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRjb25maWcgOiB7XG5cdFx0Y2FtZXJhIDoge1xuXHRcdFx0eCA6IC00MDBcblx0XHR9XG5cdH0sXG5cdG9iamVjdHMgOiB7XG5cdFx0Y29udHJvbHMgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL2NhbWVyYXMvQ29udHJvbHNcIiksXG5cdFx0fSxcblx0XHR0ZXh0dXJlUG9zaXRpb25hbE1hdHJpY2VzIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vZGVtb3MvdGV4dHVyZVBvc2l0aW9uYWxNYXRyaWNlc1wiKSxcblx0XHR9LFxuXHRcdGdyaWQgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9kZW1vcy9HcmlkXCIpLFxuXHRcdH0sXG5cdFx0c3RhdHMgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL3V0aWxzL1N0YXRzXCIpXG5cdFx0fVxuXHR9XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRjb25maWcgOiB7XG5cdFx0Y2FtZXJhIDoge1xuXHRcdFx0eCA6IC00MDBcblx0XHR9XG5cdH0sXG5cdG9iamVjdHMgOiB7XG5cdFx0Y29udHJvbHMgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL2NhbWVyYXMvQ29udHJvbHNcIiksXG5cdFx0fSxcblx0XHR1bmlmb3JtUG9zaXRpb25hbE1hdHJpY2VzIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vZGVtb3MvdW5pZm9ybVBvc2l0aW9uYWxNYXRyaWNlc1wiKSxcblx0XHR9LFxuXHRcdGdyaWQgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9kZW1vcy9HcmlkXCIpLFxuXHRcdH0sXG5cdFx0c3RhdHMgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL3V0aWxzL1N0YXRzXCIpXG5cdFx0fVxuXHR9XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRjb25maWcgOiB7XG5cdFx0dnIgOiB0cnVlLFxuXHRcdGNhbWVyYSA6IHtcblx0XHRcdHggOiAtMzAwLFxuXHRcdFx0Zm92IDogNzBcblx0XHR9XG5cdH0sXG5cdG9iamVjdHMgOiB7XG5cdFx0cG9pbnRjbG91ZCA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2RlbW9zL1NpbmVHcmF2aXR5Q2xvdWRcIiksXG5cdFx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRcdGNvdW50OiA1MCAqIDEwMDAsXG5cdFx0XHRcdHBvaW50U2l6ZSA6IDRcblx0XHRcdH1cblx0XHR9LFxuXHRcdGNvbnRyb2xzIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vY29tcG9uZW50cy9jYW1lcmFzL09yaWVudGF0aW9uXCIpLFxuXHRcdH0sXG5cdFx0Y2FtZXJhUm90YXRpb24gOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL2NhbWVyYXMvUm90YXRlQXJvdW5kT3JpZ2luXCIpLFxuXHRcdH0sXG5cdFx0Z3JpZCA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2RlbW9zL0dyaWRcIiksXG5cdFx0fVxuXHR9XG59OyIsInZhciBDbG9jayA9IGZ1bmN0aW9uKCBhdXRvc3RhcnQgKSB7XG5cblx0dGhpcy5tYXhEdCA9IDYwO1xuXHR0aGlzLm1pbkR0ID0gMTY7XG5cdHRoaXMucFRpbWUgPSAwO1xuXHR0aGlzLnRpbWUgPSAwO1xuXHRcblx0aWYoYXV0b3N0YXJ0ICE9PSBmYWxzZSkge1xuXHRcdHRoaXMuc3RhcnQoKTtcblx0fVxuXHRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2xvY2s7XG5cbkNsb2NrLnByb3RvdHlwZSA9IHtcblxuXHRzdGFydCA6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMucFRpbWUgPSBEYXRlLm5vdygpO1xuXHR9LFxuXHRcblx0Z2V0RGVsdGEgOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbm93LCBkdDtcblx0XHRcblx0XHRub3cgPSBEYXRlLm5vdygpO1xuXHRcdGR0ID0gbm93IC0gdGhpcy5wVGltZTtcblx0XHRcblx0XHRkdCA9IE1hdGgubWluKCBkdCwgdGhpcy5tYXhEdCApO1xuXHRcdGR0ID0gTWF0aC5tYXgoIGR0LCB0aGlzLm1pbkR0ICk7XG5cdFx0XG5cdFx0dGhpcy50aW1lICs9IGR0O1xuXHRcdHRoaXMucFRpbWUgPSBub3c7XG5cdFx0XG5cdFx0cmV0dXJuIGR0O1xuXHR9XG5cdFxufTsiLCIvKipcbiAqIEBhdXRob3IgbXJkb29iIC8gaHR0cDovL21yZG9vYi5jb20vXG4gKlxuICogTW9kaWZpY2F0aW9uczogR3JlZyBUYXR1bVxuICpcbiAqIHVzYWdlOlxuICogXG4gKiBcdFx0RXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5hcHBseSggTXlPYmplY3QucHJvdG90eXBlICk7XG4gKiBcbiAqIFx0XHRNeU9iamVjdC5kaXNwYXRjaCh7XG4gKiBcdFx0XHR0eXBlOiBcImNsaWNrXCIsXG4gKiBcdFx0XHRkYXR1bTE6IFwiZm9vXCIsXG4gKiBcdFx0XHRkYXR1bTI6IFwiYmFyXCJcbiAqIFx0XHR9KTtcbiAqIFxuICogXHRcdE15T2JqZWN0Lm9uKCBcImNsaWNrXCIsIGZ1bmN0aW9uKCBldmVudCApIHtcbiAqIFx0XHRcdGV2ZW50LmRhdHVtMTsgLy9Gb29cbiAqIFx0XHRcdGV2ZW50LnRhcmdldDsgLy9NeU9iamVjdFxuICogXHRcdH0pO1xuICogXG4gKlxuICovXG5cbnZhciBFdmVudERpc3BhdGNoZXIgPSBmdW5jdGlvbiAoKSB7fTtcblxuRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZSA9IHtcblxuXHRjb25zdHJ1Y3RvcjogRXZlbnREaXNwYXRjaGVyLFxuXG5cdGFwcGx5OiBmdW5jdGlvbiAoIG9iamVjdCApIHtcblxuXHRcdG9iamVjdC5vblx0XHRcdFx0XHQ9IEV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUub247XG5cdFx0b2JqZWN0Lmhhc0V2ZW50TGlzdGVuZXJcdFx0PSBFdmVudERpc3BhdGNoZXIucHJvdG90eXBlLmhhc0V2ZW50TGlzdGVuZXI7XG5cdFx0b2JqZWN0Lm9mZlx0XHRcdFx0XHQ9IEV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUub2ZmO1xuXHRcdG9iamVjdC5kaXNwYXRjaFx0XHRcdFx0PSBFdmVudERpc3BhdGNoZXIucHJvdG90eXBlLmRpc3BhdGNoO1xuXG5cdH0sXG5cblx0b246IGZ1bmN0aW9uICggdHlwZSwgbGlzdGVuZXIgKSB7XG5cblx0XHRpZiAoIHRoaXMuX2xpc3RlbmVycyA9PT0gdW5kZWZpbmVkICkgdGhpcy5fbGlzdGVuZXJzID0ge307XG5cblx0XHR2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuXG5cdFx0aWYgKCBsaXN0ZW5lcnNbIHR5cGUgXSA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRsaXN0ZW5lcnNbIHR5cGUgXSA9IFtdO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCBsaXN0ZW5lcnNbIHR5cGUgXS5pbmRleE9mKCBsaXN0ZW5lciApID09PSAtIDEgKSB7XG5cblx0XHRcdGxpc3RlbmVyc1sgdHlwZSBdLnB1c2goIGxpc3RlbmVyICk7XG5cblx0XHR9XG5cblx0fSxcblxuXHRoYXNFdmVudExpc3RlbmVyOiBmdW5jdGlvbiAoIHR5cGUsIGxpc3RlbmVyICkge1xuXG5cdFx0aWYgKCB0aGlzLl9saXN0ZW5lcnMgPT09IHVuZGVmaW5lZCApIHJldHVybiBmYWxzZTtcblxuXHRcdHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cblx0XHRpZiAoIGxpc3RlbmVyc1sgdHlwZSBdICE9PSB1bmRlZmluZWQgJiYgbGlzdGVuZXJzWyB0eXBlIF0uaW5kZXhPZiggbGlzdGVuZXIgKSAhPT0gLSAxICkge1xuXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblxuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblxuXHR9LFxuXG5cdG9mZjogZnVuY3Rpb24gKCB0eXBlLCBsaXN0ZW5lciApIHtcblxuXHRcdGlmICggdGhpcy5fbGlzdGVuZXJzID09PSB1bmRlZmluZWQgKSByZXR1cm47XG5cblx0XHR2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuXHRcdHZhciBsaXN0ZW5lckFycmF5ID0gbGlzdGVuZXJzWyB0eXBlIF07XG5cblx0XHRpZiAoIGxpc3RlbmVyQXJyYXkgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0dmFyIGluZGV4ID0gbGlzdGVuZXJBcnJheS5pbmRleE9mKCBsaXN0ZW5lciApO1xuXG5cdFx0XHRpZiAoIGluZGV4ICE9PSAtIDEgKSB7XG5cblx0XHRcdFx0bGlzdGVuZXJBcnJheS5zcGxpY2UoIGluZGV4LCAxICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHR9LFxuXG5cdGRpc3BhdGNoOiBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXHRcdFx0XG5cdFx0aWYgKCB0aGlzLl9saXN0ZW5lcnMgPT09IHVuZGVmaW5lZCApIHJldHVybjtcblxuXHRcdHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cdFx0dmFyIGxpc3RlbmVyQXJyYXkgPSBsaXN0ZW5lcnNbIGV2ZW50LnR5cGUgXTtcblxuXHRcdGlmICggbGlzdGVuZXJBcnJheSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRldmVudC50YXJnZXQgPSB0aGlzO1xuXG5cdFx0XHR2YXIgYXJyYXkgPSBbXTtcblx0XHRcdHZhciBsZW5ndGggPSBsaXN0ZW5lckFycmF5Lmxlbmd0aDtcblx0XHRcdHZhciBpO1xuXG5cdFx0XHRmb3IgKCBpID0gMDsgaSA8IGxlbmd0aDsgaSArKyApIHtcblxuXHRcdFx0XHRhcnJheVsgaSBdID0gbGlzdGVuZXJBcnJheVsgaSBdO1xuXG5cdFx0XHR9XG5cblx0XHRcdGZvciAoIGkgPSAwOyBpIDwgbGVuZ3RoOyBpICsrICkge1xuXG5cdFx0XHRcdGFycmF5WyBpIF0uY2FsbCggdGhpcywgZXZlbnQgKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH1cblxufTtcblxuaWYgKCB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyApIHtcblxuXHRtb2R1bGUuZXhwb3J0cyA9IEV2ZW50RGlzcGF0Y2hlcjtcblxufSIsInZhciBjYWxjdWxhdGVTcXVhcmVkVGV4dHVyZVdpZHRoID0gZnVuY3Rpb24oIGNvdW50ICkge1xuXHR2YXIgd2lkdGggPSAxO1xuXHR2YXIgaSA9IDA7XG5cdFxuXHR3aGlsZSggd2lkdGggKiB3aWR0aCA8IChjb3VudCAvIDQpICkge1xuXHRcdFxuXHRcdGkrKztcblx0XHR3aWR0aCA9IE1hdGgucG93KCAyLCBpICk7XG5cdFx0XG5cdH1cblx0XG5cdHJldHVybiB3aWR0aDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gY2FsY3VsYXRlU3F1YXJlZFRleHR1cmVXaWR0aDtcbiIsInZhciBSU1ZQID0gcmVxdWlyZSgncnN2cCcpO1xuXG52YXIgbG9hZFRleHQgPSBmdW5jdGlvbiggdXJsLCBvYmplY3QsIGtleSApIHtcblx0XG5cdHZhciBwcm9taXNlID0gbmV3IFJTVlAuUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuXHRcdFxuXHRcdCQuYWpheCh1cmwsIHtcblx0XHRcdGRhdGFUeXBlOiBcInRleHRcIlxuXHRcdH0pLnRoZW4oXG5cdFx0XHRmdW5jdGlvbiggZGF0YSApIHtcblx0XHRcdFx0XG5cdFx0XHRcdGlmKCBfLmlzT2JqZWN0KCBvYmplY3QgKSApIHtcblx0XHRcdFx0XHRvYmplY3Rba2V5XSA9IGRhdGE7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdHJlc29sdmUoIGRhdGEgKTtcblx0XHRcdH0sXG5cdFx0XHRmdW5jdGlvbiggZXJyb3IgKSB7XG5cdFx0XHRcdHJlamVjdCggZXJyb3IgKTtcblx0XHRcdH1cblx0XHQpO1xuXHRcdFxuXHR9KTtcblxuXHRyZXR1cm4gcHJvbWlzZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbG9hZFRleHQ7IiwidmFyIFJTVlAgPSByZXF1aXJlKCdyc3ZwJyk7XG5cbnZhciBsb2FkVGV4dHVyZSA9IGZ1bmN0aW9uKCB1cmwsIG9iamVjdCwga2V5ICkge1xuXHRcblx0cmV0dXJuIG5ldyBSU1ZQLlByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0XG5cdFx0VEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSggdXJsLCB1bmRlZmluZWQsIGZ1bmN0aW9uKCB0ZXh0dXJlICkge1xuXHRcdFx0XG5cdFx0XHRpZiggXy5pc09iamVjdCggb2JqZWN0ICkgKSB7XG5cdFx0XHRcdG9iamVjdFtrZXldID0gdGV4dHVyZTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0cmVzb2x2ZSggdGV4dHVyZSApO1xuXHRcdFx0XG5cdFx0fSwgcmVqZWN0ICk7XG5cdFx0XG5cdH0pO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxvYWRUZXh0dXJlOyIsInZhciByYW5kb20gPSB7XG5cdFxuXHRmbGlwIDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIE1hdGgucmFuZG9tKCkgPiAwLjUgPyB0cnVlOiBmYWxzZTtcblx0fSxcblx0XG5cdHJhbmdlIDogZnVuY3Rpb24obWluLCBtYXgpIHtcblx0XHRyZXR1cm4gTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluO1xuXHR9LFxuXHRcblx0cmFuZ2VJbnQgOiBmdW5jdGlvbihtaW4sIG1heCkge1xuXHRcdHJldHVybiBNYXRoLmZsb29yKCB0aGlzLnJhbmdlKG1pbiwgbWF4ICsgMSkgKTtcblx0fSxcblx0XG5cdHJhbmdlTG93IDogZnVuY3Rpb24obWluLCBtYXgpIHtcblx0XHQvL01vcmUgbGlrZWx5IHRvIHJldHVybiBhIGxvdyB2YWx1ZVxuXHQgIHJldHVybiBNYXRoLnJhbmRvbSgpICogTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluO1xuXHR9LFxuXHRcblx0cmFuZ2VIaWdoIDogZnVuY3Rpb24obWluLCBtYXgpIHtcblx0XHQvL01vcmUgbGlrZWx5IHRvIHJldHVybiBhIGhpZ2ggdmFsdWVcblx0XHRyZXR1cm4gKDEgLSBNYXRoLnJhbmRvbSgpICogTWF0aC5yYW5kb20oKSkgKiAobWF4IC0gbWluKSArIG1pbjtcblx0fVxuXHQgXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJhbmRvbTtcbiIsInZhciBwZXJsaW5TaW1wbGV4ID0gcmVxdWlyZSgncGVybGluLXNpbXBsZXgnKTtcbnZhciBnZW5lcmF0b3IgPSBuZXcgcGVybGluU2ltcGxleCgpO1xuLy8gZ2VuZXJhdG9yLm5vaXNlKHgsIHkpXG4vLyBnZW5lcmF0b3Iubm9pc2UzZCh4LCB5LCB6KVxuXG5mdW5jdGlvbiB1bml0U2ltcGxleCggeCwgeSApIHtcblx0cmV0dXJuIChnZW5lcmF0b3Iubm9pc2UoeCx5KSArIDEpIC8gMjtcbn1cblxudmFyIHNpbXBsZXgyID0ge1xuXHRcblx0ZmxpcCA6IGZ1bmN0aW9uKCB4LCB5ICkge1xuXHRcdHJldHVybiBnZW5lcmF0b3Iubm9pc2UoeCx5KSA+IDAgPyB0cnVlOiBmYWxzZTtcblx0fSxcblx0XG5cdHJhbmdlIDogZnVuY3Rpb24oIHgsIHksIG1pbiwgbWF4ICkge1xuXHRcdHJldHVybiB1bml0U2ltcGxleCh4LHkpICogKG1heCAtIG1pbikgKyBtaW47XG5cdH0sXG5cdFxuXHRyYW5nZUludCA6IGZ1bmN0aW9uKCB4LCB5LCBtaW4sIG1heCApIHtcblx0XHRyZXR1cm4gTWF0aC5mbG9vciggdGhpcy5yYW5nZShtaW4sIG1heCArIDEpICk7XG5cdH0sXG5cdFxuXHRyYW5nZUxvdyA6IGZ1bmN0aW9uKCB4LCB5LCBtaW4sIG1heCkge1xuXHRcdC8vTW9yZSBsaWtlbHkgdG8gcmV0dXJuIGEgbG93IHZhbHVlXG5cdFx0dmFyIHIgPSB1bml0U2ltcGxleCh4LHkpO1xuXHRcdHJldHVybiByICogciAqIChtYXggLSBtaW4pICsgbWluO1xuXHR9LFxuXHRcblx0cmFuZ2VIaWdoIDogZnVuY3Rpb24oIHgsIHksIG1pbiwgbWF4KSB7XG5cdFx0Ly9Nb3JlIGxpa2VseSB0byByZXR1cm4gYSBoaWdoIHZhbHVlXG5cdFx0dmFyIHIgPSB1bml0U2ltcGxleCh4LHkpO1xuXHRcdHJldHVybiAoMSAtIHIgKiByKSAqIChtYXggLSBtaW4pICsgbWluO1xuXHR9XG5cdCBcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gc2ltcGxleDI7XG4iLCIvKiBnbG9iYWxzIFRIUkVFICovXG4vKipcbiAqIERldmljZU9yaWVudGF0aW9uQ29udHJvbHMgLSBhcHBsaWVzIGRldmljZSBvcmllbnRhdGlvbiBvbiBvYmplY3Qgcm90YXRpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IC0gaW5zdGFuY2Ugb2YgVEhSRUUuT2JqZWN0M0RcbiAqIEBjb25zdHJ1Y3RvclxuICpcbiAqIEBhdXRob3IgcmljaHQgLyBodHRwOi8vcmljaHQubWVcbiAqIEBhdXRob3IgV2VzdExhbmdsZXkgLyBodHRwOi8vZ2l0aHViLmNvbS9XZXN0TGFuZ2xleVxuICogQGF1dGhvciBqb25vYnIxIC8gaHR0cDovL2pvbm9icjEuY29tXG4gKiBAYXV0aG9yIGFyb2RpYyAvIGh0dHA6Ly9hbGVrc2FuZGFycm9kaWMuY29tXG4gKiBAYXV0aG9yIGRvdWcgLyBodHRwOi8vZ2l0aHViLmNvbS9kb3VnXG4gKlxuICogVzNDIERldmljZSBPcmllbnRhdGlvbiBjb250cm9sXG4gKiAoaHR0cDovL3czYy5naXRodWIuaW8vZGV2aWNlb3JpZW50YXRpb24vc3BlYy1zb3VyY2Utb3JpZW50YXRpb24uaHRtbClcbiAqL1xuXG5cbnZhciBkZXZpY2VPcmllbnRhdGlvbiA9IHt9O1xuXHR2YXIgc2NyZWVuT3JpZW50YXRpb24gPSB3aW5kb3cub3JpZW50YXRpb24gfHwgMDtcblxuZnVuY3Rpb24gb25EZXZpY2VPcmllbnRhdGlvbkNoYW5nZUV2ZW50KGV2dCkge1xuXHRkZXZpY2VPcmllbnRhdGlvbiA9IGV2dDtcbn1cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdkZXZpY2VvcmllbnRhdGlvbicsIG9uRGV2aWNlT3JpZW50YXRpb25DaGFuZ2VFdmVudCwgZmFsc2UpO1xuXG5mdW5jdGlvbiBnZXRPcmllbnRhdGlvbigpIHtcblx0c3dpdGNoICh3aW5kb3cuc2NyZWVuLm9yaWVudGF0aW9uIHx8IHdpbmRvdy5zY3JlZW4ubW96T3JpZW50YXRpb24pIHtcblx0XHRjYXNlICdsYW5kc2NhcGUtcHJpbWFyeSc6XG5cdFx0XHRyZXR1cm4gOTA7XG5cdFx0Y2FzZSAnbGFuZHNjYXBlLXNlY29uZGFyeSc6XG5cdFx0XHRyZXR1cm4gLTkwO1xuXHRcdGNhc2UgJ3BvcnRyYWl0LXNlY29uZGFyeSc6XG5cdFx0XHRyZXR1cm4gMTgwO1xuXHRcdGNhc2UgJ3BvcnRyYWl0LXByaW1hcnknOlxuXHRcdFx0cmV0dXJuIDA7XG5cdH1cblx0Ly8gdGhpcyByZXR1cm5zIDkwIGlmIHdpZHRoIGlzIGdyZWF0ZXIgdGhlbiBoZWlnaHRcblx0Ly8gYW5kIHdpbmRvdyBvcmllbnRhdGlvbiBpcyB1bmRlZmluZWQgT1IgMFxuXHQvLyBpZiAoIXdpbmRvdy5vcmllbnRhdGlvbiAmJiB3aW5kb3cuaW5uZXJXaWR0aCA+IHdpbmRvdy5pbm5lckhlaWdodClcblx0Ly9cdCByZXR1cm4gOTA7XG5cdHJldHVybiB3aW5kb3cub3JpZW50YXRpb24gfHwgMDtcbn1cblxuZnVuY3Rpb24gb25TY3JlZW5PcmllbnRhdGlvbkNoYW5nZUV2ZW50KCkge1xuXHRzY3JlZW5PcmllbnRhdGlvbiA9IGdldE9yaWVudGF0aW9uKCk7XG59XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignb3JpZW50YXRpb25jaGFuZ2UnLCBvblNjcmVlbk9yaWVudGF0aW9uQ2hhbmdlRXZlbnQsIGZhbHNlKTtcblxuXG5USFJFRS5EZXZpY2VPcmllbnRhdGlvbkNvbnRyb2xzID0gZnVuY3Rpb24ob2JqZWN0KSB7XG5cblx0dGhpcy5vYmplY3QgPSBvYmplY3Q7XG5cblx0dGhpcy5vYmplY3Qucm90YXRpb24ucmVvcmRlcignWVhaJyk7XG5cblx0dGhpcy5mcmVlemUgPSB0cnVlO1xuXG5cdHRoaXMubW92ZW1lbnRTcGVlZCA9IDEuMDtcblx0dGhpcy5yb2xsU3BlZWQgPSAwLjAwNTtcblx0dGhpcy5hdXRvQWxpZ24gPSB0cnVlO1xuXHR0aGlzLmF1dG9Gb3J3YXJkID0gZmFsc2U7XG5cblx0dGhpcy5hbHBoYSA9IDA7XG5cdHRoaXMuYmV0YSA9IDA7XG5cdHRoaXMuZ2FtbWEgPSAwO1xuXHR0aGlzLm9yaWVudCA9IDA7XG5cblx0dGhpcy5hbGlnblF1YXRlcm5pb24gPSBuZXcgVEhSRUUuUXVhdGVybmlvbigpO1xuXHR0aGlzLm9yaWVudGF0aW9uUXVhdGVybmlvbiA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKCk7XG5cblx0dmFyIHF1YXRlcm5pb24gPSBuZXcgVEhSRUUuUXVhdGVybmlvbigpO1xuXHR2YXIgcXVhdGVybmlvbkxlcnAgPSBuZXcgVEhSRUUuUXVhdGVybmlvbigpO1xuXG5cdHZhciB0ZW1wVmVjdG9yMyA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cdHZhciB0ZW1wTWF0cml4NCA9IG5ldyBUSFJFRS5NYXRyaXg0KCk7XG5cdHZhciB0ZW1wRXVsZXIgPSBuZXcgVEhSRUUuRXVsZXIoMCwgMCwgMCwgJ1lYWicpO1xuXHR2YXIgdGVtcFF1YXRlcm5pb24gPSBuZXcgVEhSRUUuUXVhdGVybmlvbigpO1xuXG5cdHZhciB6ZWUgPSBuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAxKTtcblx0dmFyIHVwID0gbmV3IFRIUkVFLlZlY3RvcjMoMCwgMSwgMCk7XG5cdHZhciB2MCA9IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApO1xuXHR2YXIgZXVsZXIgPSBuZXcgVEhSRUUuRXVsZXIoKTtcblx0dmFyIHEwID0gbmV3IFRIUkVFLlF1YXRlcm5pb24oKTsgLy8gLSBQSS8yIGFyb3VuZCB0aGUgeC1heGlzXG5cdHZhciBxMSA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKC0gTWF0aC5zcXJ0KDAuNSksIDAsIDAsIE1hdGguc3FydCgwLjUpKTtcblxuXG5cdHRoaXMudXBkYXRlID0gKGZ1bmN0aW9uKGRlbHRhKSB7XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24oZGVsdGEpIHtcblxuXHRcdFx0aWYgKHRoaXMuZnJlZXplKSByZXR1cm47XG5cblx0XHRcdC8vIHNob3VsZCBub3QgbmVlZCB0aGlzXG5cdFx0XHQvL3ZhciBvcmllbnRhdGlvbiA9IGdldE9yaWVudGF0aW9uKCk7XG5cdFx0XHQvL2lmIChvcmllbnRhdGlvbiAhPT0gdGhpcy5zY3JlZW5PcmllbnRhdGlvbikge1xuXHRcdFx0XHQvL3RoaXMuc2NyZWVuT3JpZW50YXRpb24gPSBvcmllbnRhdGlvbjtcblx0XHRcdFx0Ly90aGlzLmF1dG9BbGlnbiA9IHRydWU7XG5cdFx0XHQvL31cblxuXHRcdFx0dGhpcy5hbHBoYSA9IGRldmljZU9yaWVudGF0aW9uLmdhbW1hID9cblx0XHRcdFx0VEhSRUUuTWF0aC5kZWdUb1JhZChkZXZpY2VPcmllbnRhdGlvbi5hbHBoYSkgOiAwOyAvLyBaXG5cdFx0XHR0aGlzLmJldGEgPSBkZXZpY2VPcmllbnRhdGlvbi5iZXRhID9cblx0XHRcdFx0VEhSRUUuTWF0aC5kZWdUb1JhZChkZXZpY2VPcmllbnRhdGlvbi5iZXRhKSA6IDA7IC8vIFgnXG5cdFx0XHR0aGlzLmdhbW1hID0gZGV2aWNlT3JpZW50YXRpb24uZ2FtbWEgP1xuXHRcdFx0XHRUSFJFRS5NYXRoLmRlZ1RvUmFkKGRldmljZU9yaWVudGF0aW9uLmdhbW1hKSA6IDA7IC8vIFknJ1xuXHRcdFx0dGhpcy5vcmllbnQgPSBzY3JlZW5PcmllbnRhdGlvbiA/XG5cdFx0XHRcdFRIUkVFLk1hdGguZGVnVG9SYWQoc2NyZWVuT3JpZW50YXRpb24pIDogMDsgLy8gT1xuXG5cdFx0XHQvLyBUaGUgYW5nbGVzIGFscGhhLCBiZXRhIGFuZCBnYW1tYVxuXHRcdFx0Ly8gZm9ybSBhIHNldCBvZiBpbnRyaW5zaWMgVGFpdC1CcnlhbiBhbmdsZXMgb2YgdHlwZSBaLVgnLVknJ1xuXG5cdFx0XHQvLyAnWlhZJyBmb3IgdGhlIGRldmljZSwgYnV0ICdZWFonIGZvciB1c1xuXHRcdFx0ZXVsZXIuc2V0KHRoaXMuYmV0YSwgdGhpcy5hbHBoYSwgLSB0aGlzLmdhbW1hLCAnWVhaJyk7XG5cblx0XHRcdHF1YXRlcm5pb24uc2V0RnJvbUV1bGVyKGV1bGVyKTtcblx0XHRcdHF1YXRlcm5pb25MZXJwLnNsZXJwKHF1YXRlcm5pb24sIDAuNSk7IC8vIGludGVycG9sYXRlXG5cblx0XHRcdC8vIG9yaWVudCB0aGUgZGV2aWNlXG5cdFx0XHRpZiAodGhpcy5hdXRvQWxpZ24pIHRoaXMub3JpZW50YXRpb25RdWF0ZXJuaW9uLmNvcHkocXVhdGVybmlvbik7IC8vIGludGVycG9sYXRpb24gYnJlYWtzIHRoZSBhdXRvIGFsaWdubWVudFxuXHRcdFx0ZWxzZSB0aGlzLm9yaWVudGF0aW9uUXVhdGVybmlvbi5jb3B5KHF1YXRlcm5pb25MZXJwKTtcblxuXHRcdFx0Ly8gY2FtZXJhIGxvb2tzIG91dCB0aGUgYmFjayBvZiB0aGUgZGV2aWNlLCBub3QgdGhlIHRvcFxuXHRcdFx0dGhpcy5vcmllbnRhdGlvblF1YXRlcm5pb24ubXVsdGlwbHkocTEpO1xuXG5cdFx0XHQvLyBhZGp1c3QgZm9yIHNjcmVlbiBvcmllbnRhdGlvblxuXHRcdFx0dGhpcy5vcmllbnRhdGlvblF1YXRlcm5pb24ubXVsdGlwbHkocTAuc2V0RnJvbUF4aXNBbmdsZSh6ZWUsIC0gdGhpcy5vcmllbnQpKTtcblxuXHRcdFx0dGhpcy5vYmplY3QucXVhdGVybmlvbi5jb3B5KHRoaXMuYWxpZ25RdWF0ZXJuaW9uKTtcblx0XHRcdHRoaXMub2JqZWN0LnF1YXRlcm5pb24ubXVsdGlwbHkodGhpcy5vcmllbnRhdGlvblF1YXRlcm5pb24pO1xuXG5cdFx0XHRpZiAodGhpcy5hdXRvRm9yd2FyZCkge1xuXG5cdFx0XHRcdHRlbXBWZWN0b3IzXG5cdFx0XHRcdFx0LnNldCgwLCAwLCAtMSlcblx0XHRcdFx0XHQuYXBwbHlRdWF0ZXJuaW9uKHRoaXMub2JqZWN0LnF1YXRlcm5pb24sICdaWFknKVxuXHRcdFx0XHRcdC5zZXRMZW5ndGgodGhpcy5tb3ZlbWVudFNwZWVkIC8gNTApOyAvLyBUT0RPOiB3aHkgNTAgOlNcblxuXHRcdFx0XHR0aGlzLm9iamVjdC5wb3NpdGlvbi5hZGQodGVtcFZlY3RvcjMpO1xuXG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLmF1dG9BbGlnbiAmJiB0aGlzLmFscGhhICE9PSAwKSB7XG5cblx0XHRcdFx0dGhpcy5hdXRvQWxpZ24gPSBmYWxzZTtcblxuXHRcdFx0XHR0aGlzLmFsaWduKCk7XG5cblx0XHRcdH1cblxuXHRcdH07XG5cblx0fSkoKTtcblxuXHR0aGlzLmFsaWduID0gZnVuY3Rpb24oKSB7XG5cblx0XHR0ZW1wVmVjdG9yM1xuXHRcdFx0LnNldCgwLCAwLCAtMSlcblx0XHRcdC5hcHBseVF1YXRlcm5pb24oIHRlbXBRdWF0ZXJuaW9uLmNvcHkodGhpcy5vcmllbnRhdGlvblF1YXRlcm5pb24pLmludmVyc2UoKSwgJ1pYWScgKTtcblxuXHRcdHRlbXBFdWxlci5zZXRGcm9tUXVhdGVybmlvbihcblx0XHRcdHRlbXBRdWF0ZXJuaW9uLnNldEZyb21Sb3RhdGlvbk1hdHJpeChcblx0XHRcdFx0dGVtcE1hdHJpeDQubG9va0F0KHRlbXBWZWN0b3IzLCB2MCwgdXApXG5cdFx0IClcblx0ICk7XG5cblx0XHR0ZW1wRXVsZXIuc2V0KDAsIHRlbXBFdWxlci55LCAwKTtcblx0XHR0aGlzLmFsaWduUXVhdGVybmlvbi5zZXRGcm9tRXVsZXIodGVtcEV1bGVyKTtcblxuXHR9O1xuXG5cdHRoaXMuY29ubmVjdCA9IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZnJlZXplID0gZmFsc2U7XG5cdH07XG5cblx0dGhpcy5kaXNjb25uZWN0ID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5mcmV6ZSA9IHRydWU7XG5cdH07XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVEhSRUUuRGV2aWNlT3JpZW50YXRpb25Db250cm9sczsiLCIvKipcbiAqIEBhdXRob3IgcWlhbyAvIGh0dHBzOi8vZ2l0aHViLmNvbS9xaWFvXG4gKiBAYXV0aG9yIG1yZG9vYiAvIGh0dHA6Ly9tcmRvb2IuY29tXG4gKiBAYXV0aG9yIGFsdGVyZWRxIC8gaHR0cDovL2FsdGVyZWRxdWFsaWEuY29tL1xuICogQGF1dGhvciBXZXN0TGFuZ2xleSAvIGh0dHA6Ly9naXRodWIuY29tL1dlc3RMYW5nbGV5XG4gKiBAYXV0aG9yIGVyaWNoNjY2IC8gaHR0cDovL2VyaWNoYWluZXMuY29tXG4gKi9cbi8qZ2xvYmFsIFRIUkVFLCBjb25zb2xlICovXG5cbi8vIFRoaXMgc2V0IG9mIGNvbnRyb2xzIHBlcmZvcm1zIG9yYml0aW5nLCBkb2xseWluZyAoem9vbWluZyksIGFuZCBwYW5uaW5nLiBJdCBtYWludGFpbnNcbi8vIHRoZSBcInVwXCIgZGlyZWN0aW9uIGFzICtZLCB1bmxpa2UgdGhlIFRyYWNrYmFsbENvbnRyb2xzLiBUb3VjaCBvbiB0YWJsZXQgYW5kIHBob25lcyBpc1xuLy8gc3VwcG9ydGVkLlxuLy9cbi8vICAgIE9yYml0IC0gbGVmdCBtb3VzZSAvIHRvdWNoOiBvbmUgZmluZ2VyIG1vdmVcbi8vICAgIFpvb20gLSBtaWRkbGUgbW91c2UsIG9yIG1vdXNld2hlZWwgLyB0b3VjaDogdHdvIGZpbmdlciBzcHJlYWQgb3Igc3F1aXNoXG4vLyAgICBQYW4gLSByaWdodCBtb3VzZSwgb3IgYXJyb3cga2V5cyAvIHRvdWNoOiB0aHJlZSBmaW50ZXIgc3dpcGVcbi8vXG4vLyBUaGlzIGlzIGEgZHJvcC1pbiByZXBsYWNlbWVudCBmb3IgKG1vc3QpIFRyYWNrYmFsbENvbnRyb2xzIHVzZWQgaW4gZXhhbXBsZXMuXG4vLyBUaGF0IGlzLCBpbmNsdWRlIHRoaXMganMgZmlsZSBhbmQgd2hlcmV2ZXIgeW91IHNlZTpcbi8vICAgIFx0Y29udHJvbHMgPSBuZXcgVEhSRUUuVHJhY2tiYWxsQ29udHJvbHMoIGNhbWVyYSApO1xuLy8gICAgICBjb250cm9scy50YXJnZXQueiA9IDE1MDtcbi8vIFNpbXBsZSBzdWJzdGl0dXRlIFwiT3JiaXRDb250cm9sc1wiIGFuZCB0aGUgY29udHJvbCBzaG91bGQgd29yayBhcy1pcy5cblxudmFyIE9yYml0Q29udHJvbHMgPSBmdW5jdGlvbiAoIG9iamVjdCwgZG9tRWxlbWVudCApIHtcblxuXHR0aGlzLm9iamVjdCA9IG9iamVjdDtcblx0dGhpcy5kb21FbGVtZW50ID0gKCBkb21FbGVtZW50ICE9PSB1bmRlZmluZWQgKSA/IGRvbUVsZW1lbnQgOiBkb2N1bWVudDtcblxuXHQvLyBBUElcblxuXHQvLyBTZXQgdG8gZmFsc2UgdG8gZGlzYWJsZSB0aGlzIGNvbnRyb2xcblx0dGhpcy5lbmFibGVkID0gdHJ1ZTtcblxuXHQvLyBcInRhcmdldFwiIHNldHMgdGhlIGxvY2F0aW9uIG9mIGZvY3VzLCB3aGVyZSB0aGUgY29udHJvbCBvcmJpdHMgYXJvdW5kXG5cdC8vIGFuZCB3aGVyZSBpdCBwYW5zIHdpdGggcmVzcGVjdCB0by5cblx0dGhpcy50YXJnZXQgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXHQvLyBjZW50ZXIgaXMgb2xkLCBkZXByZWNhdGVkOyB1c2UgXCJ0YXJnZXRcIiBpbnN0ZWFkXG5cdHRoaXMuY2VudGVyID0gdGhpcy50YXJnZXQ7XG5cblx0Ly8gVGhpcyBvcHRpb24gYWN0dWFsbHkgZW5hYmxlcyBkb2xseWluZyBpbiBhbmQgb3V0OyBsZWZ0IGFzIFwiem9vbVwiIGZvclxuXHQvLyBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuXHR0aGlzLm5vWm9vbSA9IGZhbHNlO1xuXHR0aGlzLnpvb21TcGVlZCA9IDEuMDtcblx0Ly8gTGltaXRzIHRvIGhvdyBmYXIgeW91IGNhbiBkb2xseSBpbiBhbmQgb3V0XG5cdHRoaXMubWluRGlzdGFuY2UgPSAwO1xuXHR0aGlzLm1heERpc3RhbmNlID0gSW5maW5pdHk7XG5cblx0Ly8gU2V0IHRvIHRydWUgdG8gZGlzYWJsZSB0aGlzIGNvbnRyb2xcblx0dGhpcy5ub1JvdGF0ZSA9IGZhbHNlO1xuXHR0aGlzLnJvdGF0ZVNwZWVkID0gMS4wO1xuXG5cdC8vIFNldCB0byB0cnVlIHRvIGRpc2FibGUgdGhpcyBjb250cm9sXG5cdHRoaXMubm9QYW4gPSBmYWxzZTtcblx0dGhpcy5rZXlQYW5TcGVlZCA9IDcuMDtcdC8vIHBpeGVscyBtb3ZlZCBwZXIgYXJyb3cga2V5IHB1c2hcblxuXHQvLyBTZXQgdG8gdHJ1ZSB0byBhdXRvbWF0aWNhbGx5IHJvdGF0ZSBhcm91bmQgdGhlIHRhcmdldFxuXHR0aGlzLmF1dG9Sb3RhdGUgPSBmYWxzZTtcblx0dGhpcy5hdXRvUm90YXRlU3BlZWQgPSAyLjA7IC8vIDMwIHNlY29uZHMgcGVyIHJvdW5kIHdoZW4gZnBzIGlzIDYwXG5cblx0Ly8gSG93IGZhciB5b3UgY2FuIG9yYml0IHZlcnRpY2FsbHksIHVwcGVyIGFuZCBsb3dlciBsaW1pdHMuXG5cdC8vIFJhbmdlIGlzIDAgdG8gTWF0aC5QSSByYWRpYW5zLlxuXHR0aGlzLm1pblBvbGFyQW5nbGUgPSAwOyAvLyByYWRpYW5zXG5cdHRoaXMubWF4UG9sYXJBbmdsZSA9IE1hdGguUEk7IC8vIHJhZGlhbnNcblxuXHQvLyBTZXQgdG8gdHJ1ZSB0byBkaXNhYmxlIHVzZSBvZiB0aGUga2V5c1xuXHR0aGlzLm5vS2V5cyA9IGZhbHNlO1xuXHQvLyBUaGUgZm91ciBhcnJvdyBrZXlzXG5cdHRoaXMua2V5cyA9IHsgTEVGVDogMzcsIFVQOiAzOCwgUklHSFQ6IDM5LCBCT1RUT006IDQwIH07XG5cblx0Ly8vLy8vLy8vLy8vXG5cdC8vIGludGVybmFsc1xuXG5cdHZhciBzY29wZSA9IHRoaXM7XG5cblx0dmFyIEVQUyA9IDAuMDAwMDAxO1xuXG5cdHZhciByb3RhdGVTdGFydCA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cdHZhciByb3RhdGVFbmQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXHR2YXIgcm90YXRlRGVsdGEgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXG5cdHZhciBwYW5TdGFydCA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cdHZhciBwYW5FbmQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXHR2YXIgcGFuRGVsdGEgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXG5cdHZhciBkb2xseVN0YXJ0ID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblx0dmFyIGRvbGx5RW5kID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblx0dmFyIGRvbGx5RGVsdGEgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXG5cdHZhciBwaGlEZWx0YSA9IDA7XG5cdHZhciB0aGV0YURlbHRhID0gMDtcblx0dmFyIHNjYWxlID0gMTtcblx0dmFyIHBhbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cblx0dmFyIGxhc3RQb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cblx0dmFyIFNUQVRFID0geyBOT05FIDogLTEsIFJPVEFURSA6IDAsIERPTExZIDogMSwgUEFOIDogMiwgVE9VQ0hfUk9UQVRFIDogMywgVE9VQ0hfRE9MTFkgOiA0LCBUT1VDSF9QQU4gOiA1IH07XG5cdHZhciBzdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0Ly8gZXZlbnRzXG5cblx0dmFyIGNoYW5nZUV2ZW50ID0geyB0eXBlOiAnY2hhbmdlJyB9O1xuXG5cblx0dGhpcy5yb3RhdGVMZWZ0ID0gZnVuY3Rpb24gKCBhbmdsZSApIHtcblxuXHRcdGlmICggYW5nbGUgPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0YW5nbGUgPSBnZXRBdXRvUm90YXRpb25BbmdsZSgpO1xuXG5cdFx0fVxuXG5cdFx0dGhldGFEZWx0YSAtPSBhbmdsZTtcblxuXHR9O1xuXG5cdHRoaXMucm90YXRlVXAgPSBmdW5jdGlvbiAoIGFuZ2xlICkge1xuXG5cdFx0aWYgKCBhbmdsZSA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRhbmdsZSA9IGdldEF1dG9Sb3RhdGlvbkFuZ2xlKCk7XG5cblx0XHR9XG5cblx0XHRwaGlEZWx0YSAtPSBhbmdsZTtcblxuXHR9O1xuXG5cdC8vIHBhc3MgaW4gZGlzdGFuY2UgaW4gd29ybGQgc3BhY2UgdG8gbW92ZSBsZWZ0XG5cdHRoaXMucGFuTGVmdCA9IGZ1bmN0aW9uICggZGlzdGFuY2UgKSB7XG5cblx0XHR2YXIgcGFuT2Zmc2V0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblx0XHR2YXIgdGUgPSB0aGlzLm9iamVjdC5tYXRyaXguZWxlbWVudHM7XG5cdFx0Ly8gZ2V0IFggY29sdW1uIG9mIG1hdHJpeFxuXHRcdHBhbk9mZnNldC5zZXQoIHRlWzBdLCB0ZVsxXSwgdGVbMl0gKTtcblx0XHRwYW5PZmZzZXQubXVsdGlwbHlTY2FsYXIoLWRpc3RhbmNlKTtcblx0XHRcblx0XHRwYW4uYWRkKCBwYW5PZmZzZXQgKTtcblxuXHR9O1xuXG5cdC8vIHBhc3MgaW4gZGlzdGFuY2UgaW4gd29ybGQgc3BhY2UgdG8gbW92ZSB1cFxuXHR0aGlzLnBhblVwID0gZnVuY3Rpb24gKCBkaXN0YW5jZSApIHtcblxuXHRcdHZhciBwYW5PZmZzZXQgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXHRcdHZhciB0ZSA9IHRoaXMub2JqZWN0Lm1hdHJpeC5lbGVtZW50cztcblx0XHQvLyBnZXQgWSBjb2x1bW4gb2YgbWF0cml4XG5cdFx0cGFuT2Zmc2V0LnNldCggdGVbNF0sIHRlWzVdLCB0ZVs2XSApO1xuXHRcdHBhbk9mZnNldC5tdWx0aXBseVNjYWxhcihkaXN0YW5jZSk7XG5cdFx0XG5cdFx0cGFuLmFkZCggcGFuT2Zmc2V0ICk7XG5cdH07XG5cdFxuXHQvLyBtYWluIGVudHJ5IHBvaW50OyBwYXNzIGluIFZlY3RvcjIgb2YgY2hhbmdlIGRlc2lyZWQgaW4gcGl4ZWwgc3BhY2UsXG5cdC8vIHJpZ2h0IGFuZCBkb3duIGFyZSBwb3NpdGl2ZVxuXHR0aGlzLnBhbiA9IGZ1bmN0aW9uICggZGVsdGEgKSB7XG5cblx0XHR2YXIgZWxlbWVudCA9IHNjb3BlLmRvbUVsZW1lbnQgPT09IGRvY3VtZW50ID8gc2NvcGUuZG9tRWxlbWVudC5ib2R5IDogc2NvcGUuZG9tRWxlbWVudDtcblxuXHRcdGlmICggc2NvcGUub2JqZWN0LmZvdiAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHQvLyBwZXJzcGVjdGl2ZVxuXHRcdFx0dmFyIHBvc2l0aW9uID0gc2NvcGUub2JqZWN0LnBvc2l0aW9uO1xuXHRcdFx0dmFyIG9mZnNldCA9IHBvc2l0aW9uLmNsb25lKCkuc3ViKCBzY29wZS50YXJnZXQgKTtcblx0XHRcdHZhciB0YXJnZXREaXN0YW5jZSA9IG9mZnNldC5sZW5ndGgoKTtcblxuXHRcdFx0Ly8gaGFsZiBvZiB0aGUgZm92IGlzIGNlbnRlciB0byB0b3Agb2Ygc2NyZWVuXG5cdFx0XHR0YXJnZXREaXN0YW5jZSAqPSBNYXRoLnRhbiggKHNjb3BlLm9iamVjdC5mb3YvMikgKiBNYXRoLlBJIC8gMTgwLjAgKTtcblx0XHRcdC8vIHdlIGFjdHVhbGx5IGRvbid0IHVzZSBzY3JlZW5XaWR0aCwgc2luY2UgcGVyc3BlY3RpdmUgY2FtZXJhIGlzIGZpeGVkIHRvIHNjcmVlbiBoZWlnaHRcblx0XHRcdHNjb3BlLnBhbkxlZnQoIDIgKiBkZWx0YS54ICogdGFyZ2V0RGlzdGFuY2UgLyBlbGVtZW50LmNsaWVudEhlaWdodCApO1xuXHRcdFx0c2NvcGUucGFuVXAoIDIgKiBkZWx0YS55ICogdGFyZ2V0RGlzdGFuY2UgLyBlbGVtZW50LmNsaWVudEhlaWdodCApO1xuXG5cdFx0fSBlbHNlIGlmICggc2NvcGUub2JqZWN0LnRvcCAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHQvLyBvcnRob2dyYXBoaWNcblx0XHRcdHNjb3BlLnBhbkxlZnQoIGRlbHRhLnggKiAoc2NvcGUub2JqZWN0LnJpZ2h0IC0gc2NvcGUub2JqZWN0LmxlZnQpIC8gZWxlbWVudC5jbGllbnRXaWR0aCApO1xuXHRcdFx0c2NvcGUucGFuVXAoIGRlbHRhLnkgKiAoc2NvcGUub2JqZWN0LnRvcCAtIHNjb3BlLm9iamVjdC5ib3R0b20pIC8gZWxlbWVudC5jbGllbnRIZWlnaHQgKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdC8vIGNhbWVyYSBuZWl0aGVyIG9ydGhvZ3JhcGhpYyBvciBwZXJzcGVjdGl2ZSAtIHdhcm4gdXNlclxuXHRcdFx0Y29uc29sZS53YXJuKCAnV0FSTklORzogT3JiaXRDb250cm9scy5qcyBlbmNvdW50ZXJlZCBhbiB1bmtub3duIGNhbWVyYSB0eXBlIC0gcGFuIGRpc2FibGVkLicgKTtcblxuXHRcdH1cblxuXHR9O1xuXG5cdHRoaXMuZG9sbHlJbiA9IGZ1bmN0aW9uICggZG9sbHlTY2FsZSApIHtcblxuXHRcdGlmICggZG9sbHlTY2FsZSA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRkb2xseVNjYWxlID0gZ2V0Wm9vbVNjYWxlKCk7XG5cblx0XHR9XG5cblx0XHRzY2FsZSAvPSBkb2xseVNjYWxlO1xuXG5cdH07XG5cblx0dGhpcy5kb2xseU91dCA9IGZ1bmN0aW9uICggZG9sbHlTY2FsZSApIHtcblxuXHRcdGlmICggZG9sbHlTY2FsZSA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRkb2xseVNjYWxlID0gZ2V0Wm9vbVNjYWxlKCk7XG5cblx0XHR9XG5cblx0XHRzY2FsZSAqPSBkb2xseVNjYWxlO1xuXG5cdH07XG5cblx0dGhpcy51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHR2YXIgcG9zaXRpb24gPSB0aGlzLm9iamVjdC5wb3NpdGlvbjtcblx0XHR2YXIgb2Zmc2V0ID0gcG9zaXRpb24uY2xvbmUoKS5zdWIoIHRoaXMudGFyZ2V0ICk7XG5cblx0XHQvLyBhbmdsZSBmcm9tIHotYXhpcyBhcm91bmQgeS1heGlzXG5cblx0XHR2YXIgdGhldGEgPSBNYXRoLmF0YW4yKCBvZmZzZXQueCwgb2Zmc2V0LnogKTtcblxuXHRcdC8vIGFuZ2xlIGZyb20geS1heGlzXG5cblx0XHR2YXIgcGhpID0gTWF0aC5hdGFuMiggTWF0aC5zcXJ0KCBvZmZzZXQueCAqIG9mZnNldC54ICsgb2Zmc2V0LnogKiBvZmZzZXQueiApLCBvZmZzZXQueSApO1xuXG5cdFx0aWYgKCB0aGlzLmF1dG9Sb3RhdGUgKSB7XG5cblx0XHRcdHRoaXMucm90YXRlTGVmdCggZ2V0QXV0b1JvdGF0aW9uQW5nbGUoKSApO1xuXG5cdFx0fVxuXG5cdFx0dGhldGEgKz0gdGhldGFEZWx0YTtcblx0XHRwaGkgKz0gcGhpRGVsdGE7XG5cblx0XHQvLyByZXN0cmljdCBwaGkgdG8gYmUgYmV0d2VlbiBkZXNpcmVkIGxpbWl0c1xuXHRcdHBoaSA9IE1hdGgubWF4KCB0aGlzLm1pblBvbGFyQW5nbGUsIE1hdGgubWluKCB0aGlzLm1heFBvbGFyQW5nbGUsIHBoaSApICk7XG5cblx0XHQvLyByZXN0cmljdCBwaGkgdG8gYmUgYmV0d2VlIEVQUyBhbmQgUEktRVBTXG5cdFx0cGhpID0gTWF0aC5tYXgoIEVQUywgTWF0aC5taW4oIE1hdGguUEkgLSBFUFMsIHBoaSApICk7XG5cblx0XHR2YXIgcmFkaXVzID0gb2Zmc2V0Lmxlbmd0aCgpICogc2NhbGU7XG5cblx0XHQvLyByZXN0cmljdCByYWRpdXMgdG8gYmUgYmV0d2VlbiBkZXNpcmVkIGxpbWl0c1xuXHRcdHJhZGl1cyA9IE1hdGgubWF4KCB0aGlzLm1pbkRpc3RhbmNlLCBNYXRoLm1pbiggdGhpcy5tYXhEaXN0YW5jZSwgcmFkaXVzICkgKTtcblx0XHRcblx0XHQvLyBtb3ZlIHRhcmdldCB0byBwYW5uZWQgbG9jYXRpb25cblx0XHR0aGlzLnRhcmdldC5hZGQoIHBhbiApO1xuXG5cdFx0b2Zmc2V0LnggPSByYWRpdXMgKiBNYXRoLnNpbiggcGhpICkgKiBNYXRoLnNpbiggdGhldGEgKTtcblx0XHRvZmZzZXQueSA9IHJhZGl1cyAqIE1hdGguY29zKCBwaGkgKTtcblx0XHRvZmZzZXQueiA9IHJhZGl1cyAqIE1hdGguc2luKCBwaGkgKSAqIE1hdGguY29zKCB0aGV0YSApO1xuXG5cdFx0cG9zaXRpb24uY29weSggdGhpcy50YXJnZXQgKS5hZGQoIG9mZnNldCApO1xuXG5cdFx0dGhpcy5vYmplY3QubG9va0F0KCB0aGlzLnRhcmdldCApO1xuXG5cdFx0dGhldGFEZWx0YSA9IDA7XG5cdFx0cGhpRGVsdGEgPSAwO1xuXHRcdHNjYWxlID0gMTtcblx0XHRwYW4uc2V0KDAsMCwwKTtcblxuXHRcdGlmICggbGFzdFBvc2l0aW9uLmRpc3RhbmNlVG8oIHRoaXMub2JqZWN0LnBvc2l0aW9uICkgPiAwICkge1xuXG5cdFx0XHR0aGlzLmRpc3BhdGNoRXZlbnQoIGNoYW5nZUV2ZW50ICk7XG5cblx0XHRcdGxhc3RQb3NpdGlvbi5jb3B5KCB0aGlzLm9iamVjdC5wb3NpdGlvbiApO1xuXG5cdFx0fVxuXG5cdH07XG5cblxuXHRmdW5jdGlvbiBnZXRBdXRvUm90YXRpb25BbmdsZSgpIHtcblxuXHRcdHJldHVybiAyICogTWF0aC5QSSAvIDYwIC8gNjAgKiBzY29wZS5hdXRvUm90YXRlU3BlZWQ7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIGdldFpvb21TY2FsZSgpIHtcblxuXHRcdHJldHVybiBNYXRoLnBvdyggMC45NSwgc2NvcGUuem9vbVNwZWVkICk7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIG9uTW91c2VEb3duKCBldmVudCApIHtcblxuXHRcdGlmICggc2NvcGUuZW5hYmxlZCA9PT0gZmFsc2UgKSB7IHJldHVybjsgfVxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRpZiAoIGV2ZW50LmJ1dHRvbiA9PT0gMCApIHtcblx0XHRcdGlmICggc2NvcGUubm9Sb3RhdGUgPT09IHRydWUgKSB7IHJldHVybjsgfVxuXG5cdFx0XHRzdGF0ZSA9IFNUQVRFLlJPVEFURTtcblxuXHRcdFx0cm90YXRlU3RhcnQuc2V0KCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZICk7XG5cblx0XHR9IGVsc2UgaWYgKCBldmVudC5idXR0b24gPT09IDEgKSB7XG5cdFx0XHRpZiAoIHNjb3BlLm5vWm9vbSA9PT0gdHJ1ZSApIHsgcmV0dXJuOyB9XG5cblx0XHRcdHN0YXRlID0gU1RBVEUuRE9MTFk7XG5cblx0XHRcdGRvbGx5U3RhcnQuc2V0KCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZICk7XG5cblx0XHR9IGVsc2UgaWYgKCBldmVudC5idXR0b24gPT09IDIgKSB7XG5cdFx0XHRpZiAoIHNjb3BlLm5vUGFuID09PSB0cnVlICkgeyByZXR1cm47IH1cblxuXHRcdFx0c3RhdGUgPSBTVEFURS5QQU47XG5cblx0XHRcdHBhblN0YXJ0LnNldCggZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSApO1xuXG5cdFx0fVxuXG5cdFx0Ly8gR3JlZ2dtYW4gZml4OiBodHRwczovL2dpdGh1Yi5jb20vZ3JlZ2dtYW4vdGhyZWUuanMvY29tbWl0L2ZkZTlmOTkxN2Q2ZDgzODFmMDZiZjIyY2RmZjc2NjAyOWQxNzYxYmVcblx0XHRzY29wZS5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSwgZmFsc2UgKTtcblx0XHRzY29wZS5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgb25Nb3VzZVVwLCBmYWxzZSApO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBvbk1vdXNlTW92ZSggZXZlbnQgKSB7XG5cblx0XHRpZiAoIHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdHZhciBlbGVtZW50ID0gc2NvcGUuZG9tRWxlbWVudCA9PT0gZG9jdW1lbnQgPyBzY29wZS5kb21FbGVtZW50LmJvZHkgOiBzY29wZS5kb21FbGVtZW50O1xuXG5cdFx0aWYgKCBzdGF0ZSA9PT0gU1RBVEUuUk9UQVRFICkge1xuXG5cdFx0XHRpZiAoIHNjb3BlLm5vUm90YXRlID09PSB0cnVlICkgcmV0dXJuO1xuXG5cdFx0XHRyb3RhdGVFbmQuc2V0KCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZICk7XG5cdFx0XHRyb3RhdGVEZWx0YS5zdWJWZWN0b3JzKCByb3RhdGVFbmQsIHJvdGF0ZVN0YXJ0ICk7XG5cblx0XHRcdC8vIHJvdGF0aW5nIGFjcm9zcyB3aG9sZSBzY3JlZW4gZ29lcyAzNjAgZGVncmVlcyBhcm91bmRcblx0XHRcdHNjb3BlLnJvdGF0ZUxlZnQoIDIgKiBNYXRoLlBJICogcm90YXRlRGVsdGEueCAvIGVsZW1lbnQuY2xpZW50V2lkdGggKiBzY29wZS5yb3RhdGVTcGVlZCApO1xuXHRcdFx0Ly8gcm90YXRpbmcgdXAgYW5kIGRvd24gYWxvbmcgd2hvbGUgc2NyZWVuIGF0dGVtcHRzIHRvIGdvIDM2MCwgYnV0IGxpbWl0ZWQgdG8gMTgwXG5cdFx0XHRzY29wZS5yb3RhdGVVcCggMiAqIE1hdGguUEkgKiByb3RhdGVEZWx0YS55IC8gZWxlbWVudC5jbGllbnRIZWlnaHQgKiBzY29wZS5yb3RhdGVTcGVlZCApO1xuXG5cdFx0XHRyb3RhdGVTdGFydC5jb3B5KCByb3RhdGVFbmQgKTtcblxuXHRcdH0gZWxzZSBpZiAoIHN0YXRlID09PSBTVEFURS5ET0xMWSApIHtcblxuXHRcdFx0aWYgKCBzY29wZS5ub1pvb20gPT09IHRydWUgKSByZXR1cm47XG5cblx0XHRcdGRvbGx5RW5kLnNldCggZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSApO1xuXHRcdFx0ZG9sbHlEZWx0YS5zdWJWZWN0b3JzKCBkb2xseUVuZCwgZG9sbHlTdGFydCApO1xuXG5cdFx0XHRpZiAoIGRvbGx5RGVsdGEueSA+IDAgKSB7XG5cblx0XHRcdFx0c2NvcGUuZG9sbHlJbigpO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdHNjb3BlLmRvbGx5T3V0KCk7XG5cblx0XHRcdH1cblxuXHRcdFx0ZG9sbHlTdGFydC5jb3B5KCBkb2xseUVuZCApO1xuXG5cdFx0fSBlbHNlIGlmICggc3RhdGUgPT09IFNUQVRFLlBBTiApIHtcblxuXHRcdFx0aWYgKCBzY29wZS5ub1BhbiA9PT0gdHJ1ZSApIHJldHVybjtcblxuXHRcdFx0cGFuRW5kLnNldCggZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSApO1xuXHRcdFx0cGFuRGVsdGEuc3ViVmVjdG9ycyggcGFuRW5kLCBwYW5TdGFydCApO1xuXHRcdFx0XG5cdFx0XHRzY29wZS5wYW4oIHBhbkRlbHRhICk7XG5cblx0XHRcdHBhblN0YXJ0LmNvcHkoIHBhbkVuZCApO1xuXG5cdFx0fVxuXG5cdFx0Ly8gR3JlZ2dtYW4gZml4OiBodHRwczovL2dpdGh1Yi5jb20vZ3JlZ2dtYW4vdGhyZWUuanMvY29tbWl0L2ZkZTlmOTkxN2Q2ZDgzODFmMDZiZjIyY2RmZjc2NjAyOWQxNzYxYmVcblx0XHRzY29wZS51cGRhdGUoKTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gb25Nb3VzZVVwKCAvKiBldmVudCAqLyApIHtcblxuXHRcdGlmICggc2NvcGUuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHQvLyBHcmVnZ21hbiBmaXg6IGh0dHBzOi8vZ2l0aHViLmNvbS9ncmVnZ21hbi90aHJlZS5qcy9jb21taXQvZmRlOWY5OTE3ZDZkODM4MWYwNmJmMjJjZGZmNzY2MDI5ZDE3NjFiZVxuXHRcdHNjb3BlLmRvbUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlLCBmYWxzZSApO1xuXHRcdHNjb3BlLmRvbUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCBvbk1vdXNlVXAsIGZhbHNlICk7XG5cblx0XHRzdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIG9uTW91c2VXaGVlbCggZXZlbnQgKSB7XG5cblx0XHRpZiAoIHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlIHx8IHNjb3BlLm5vWm9vbSA9PT0gdHJ1ZSApIHJldHVybjtcblxuXHRcdHZhciBkZWx0YSA9IDA7XG5cblx0XHRpZiAoIGV2ZW50LndoZWVsRGVsdGEgKSB7IC8vIFdlYktpdCAvIE9wZXJhIC8gRXhwbG9yZXIgOVxuXG5cdFx0XHRkZWx0YSA9IGV2ZW50LndoZWVsRGVsdGE7XG5cblx0XHR9IGVsc2UgaWYgKCBldmVudC5kZXRhaWwgKSB7IC8vIEZpcmVmb3hcblxuXHRcdFx0ZGVsdGEgPSAtIGV2ZW50LmRldGFpbDtcblxuXHRcdH1cblxuXHRcdGlmICggZGVsdGEgPiAwICkge1xuXG5cdFx0XHRzY29wZS5kb2xseU91dCgpO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0c2NvcGUuZG9sbHlJbigpO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRmdW5jdGlvbiBvbktleURvd24oIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBzY29wZS5lbmFibGVkID09PSBmYWxzZSApIHsgcmV0dXJuOyB9XG5cdFx0aWYgKCBzY29wZS5ub0tleXMgPT09IHRydWUgKSB7IHJldHVybjsgfVxuXHRcdGlmICggc2NvcGUubm9QYW4gPT09IHRydWUgKSB7IHJldHVybjsgfVxuXG5cdFx0Ly8gcGFuIGEgcGl4ZWwgLSBJIGd1ZXNzIGZvciBwcmVjaXNlIHBvc2l0aW9uaW5nP1xuXHRcdC8vIEdyZWdnbWFuIGZpeDogaHR0cHM6Ly9naXRodWIuY29tL2dyZWdnbWFuL3RocmVlLmpzL2NvbW1pdC9mZGU5Zjk5MTdkNmQ4MzgxZjA2YmYyMmNkZmY3NjYwMjlkMTc2MWJlXG5cdFx0dmFyIG5lZWRVcGRhdGUgPSBmYWxzZTtcblx0XHRcblx0XHRzd2l0Y2ggKCBldmVudC5rZXlDb2RlICkge1xuXG5cdFx0XHRjYXNlIHNjb3BlLmtleXMuVVA6XG5cdFx0XHRcdHNjb3BlLnBhbiggbmV3IFRIUkVFLlZlY3RvcjIoIDAsIHNjb3BlLmtleVBhblNwZWVkICkgKTtcblx0XHRcdFx0bmVlZFVwZGF0ZSA9IHRydWU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBzY29wZS5rZXlzLkJPVFRPTTpcblx0XHRcdFx0c2NvcGUucGFuKCBuZXcgVEhSRUUuVmVjdG9yMiggMCwgLXNjb3BlLmtleVBhblNwZWVkICkgKTtcblx0XHRcdFx0bmVlZFVwZGF0ZSA9IHRydWU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBzY29wZS5rZXlzLkxFRlQ6XG5cdFx0XHRcdHNjb3BlLnBhbiggbmV3IFRIUkVFLlZlY3RvcjIoIHNjb3BlLmtleVBhblNwZWVkLCAwICkgKTtcblx0XHRcdFx0bmVlZFVwZGF0ZSA9IHRydWU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBzY29wZS5rZXlzLlJJR0hUOlxuXHRcdFx0XHRzY29wZS5wYW4oIG5ldyBUSFJFRS5WZWN0b3IyKCAtc2NvcGUua2V5UGFuU3BlZWQsIDAgKSApO1xuXHRcdFx0XHRuZWVkVXBkYXRlID0gdHJ1ZTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0Ly8gR3JlZ2dtYW4gZml4OiBodHRwczovL2dpdGh1Yi5jb20vZ3JlZ2dtYW4vdGhyZWUuanMvY29tbWl0L2ZkZTlmOTkxN2Q2ZDgzODFmMDZiZjIyY2RmZjc2NjAyOWQxNzYxYmVcblx0XHRpZiAoIG5lZWRVcGRhdGUgKSB7XG5cblx0XHRcdHNjb3BlLnVwZGF0ZSgpO1xuXG5cdFx0fVxuXG5cdH1cblx0XG5cdGZ1bmN0aW9uIHRvdWNoc3RhcnQoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBzY29wZS5lbmFibGVkID09PSBmYWxzZSApIHsgcmV0dXJuOyB9XG5cblx0XHRzd2l0Y2ggKCBldmVudC50b3VjaGVzLmxlbmd0aCApIHtcblxuXHRcdFx0Y2FzZSAxOlx0Ly8gb25lLWZpbmdlcmVkIHRvdWNoOiByb3RhdGVcblx0XHRcdFx0aWYgKCBzY29wZS5ub1JvdGF0ZSA9PT0gdHJ1ZSApIHsgcmV0dXJuOyB9XG5cblx0XHRcdFx0c3RhdGUgPSBTVEFURS5UT1VDSF9ST1RBVEU7XG5cblx0XHRcdFx0cm90YXRlU3RhcnQuc2V0KCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVgsIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSApO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAyOlx0Ly8gdHdvLWZpbmdlcmVkIHRvdWNoOiBkb2xseVxuXHRcdFx0XHRpZiAoIHNjb3BlLm5vWm9vbSA9PT0gdHJ1ZSApIHsgcmV0dXJuOyB9XG5cblx0XHRcdFx0c3RhdGUgPSBTVEFURS5UT1VDSF9ET0xMWTtcblxuXHRcdFx0XHR2YXIgZHggPSBldmVudC50b3VjaGVzWyAwIF0ucGFnZVggLSBldmVudC50b3VjaGVzWyAxIF0ucGFnZVg7XG5cdFx0XHRcdHZhciBkeSA9IGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSAtIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWTtcblx0XHRcdFx0dmFyIGRpc3RhbmNlID0gTWF0aC5zcXJ0KCBkeCAqIGR4ICsgZHkgKiBkeSApO1xuXHRcdFx0XHRkb2xseVN0YXJ0LnNldCggMCwgZGlzdGFuY2UgKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMzogLy8gdGhyZWUtZmluZ2VyZWQgdG91Y2g6IHBhblxuXHRcdFx0XHRpZiAoIHNjb3BlLm5vUGFuID09PSB0cnVlICkgeyByZXR1cm47IH1cblxuXHRcdFx0XHRzdGF0ZSA9IFNUQVRFLlRPVUNIX1BBTjtcblxuXHRcdFx0XHRwYW5TdGFydC5zZXQoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCwgZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRzdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiB0b3VjaG1vdmUoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBzY29wZS5lbmFibGVkID09PSBmYWxzZSApIHsgcmV0dXJuOyB9XG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0dmFyIGVsZW1lbnQgPSBzY29wZS5kb21FbGVtZW50ID09PSBkb2N1bWVudCA/IHNjb3BlLmRvbUVsZW1lbnQuYm9keSA6IHNjb3BlLmRvbUVsZW1lbnQ7XG5cblx0XHRzd2l0Y2ggKCBldmVudC50b3VjaGVzLmxlbmd0aCApIHtcblxuXHRcdFx0Y2FzZSAxOiAvLyBvbmUtZmluZ2VyZWQgdG91Y2g6IHJvdGF0ZVxuXHRcdFx0XHRpZiAoIHNjb3BlLm5vUm90YXRlID09PSB0cnVlICkgeyByZXR1cm47IH1cblx0XHRcdFx0aWYgKCBzdGF0ZSAhPT0gU1RBVEUuVE9VQ0hfUk9UQVRFICkgeyByZXR1cm47IH1cblxuXHRcdFx0XHRyb3RhdGVFbmQuc2V0KCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVgsIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSApO1xuXHRcdFx0XHRyb3RhdGVEZWx0YS5zdWJWZWN0b3JzKCByb3RhdGVFbmQsIHJvdGF0ZVN0YXJ0ICk7XG5cblx0XHRcdFx0Ly8gcm90YXRpbmcgYWNyb3NzIHdob2xlIHNjcmVlbiBnb2VzIDM2MCBkZWdyZWVzIGFyb3VuZFxuXHRcdFx0XHRzY29wZS5yb3RhdGVMZWZ0KCAyICogTWF0aC5QSSAqIHJvdGF0ZURlbHRhLnggLyBlbGVtZW50LmNsaWVudFdpZHRoICogc2NvcGUucm90YXRlU3BlZWQgKTtcblx0XHRcdFx0Ly8gcm90YXRpbmcgdXAgYW5kIGRvd24gYWxvbmcgd2hvbGUgc2NyZWVuIGF0dGVtcHRzIHRvIGdvIDM2MCwgYnV0IGxpbWl0ZWQgdG8gMTgwXG5cdFx0XHRcdHNjb3BlLnJvdGF0ZVVwKCAyICogTWF0aC5QSSAqIHJvdGF0ZURlbHRhLnkgLyBlbGVtZW50LmNsaWVudEhlaWdodCAqIHNjb3BlLnJvdGF0ZVNwZWVkICk7XG5cblx0XHRcdFx0cm90YXRlU3RhcnQuY29weSggcm90YXRlRW5kICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIDI6IC8vIHR3by1maW5nZXJlZCB0b3VjaDogZG9sbHlcblx0XHRcdFx0aWYgKCBzY29wZS5ub1pvb20gPT09IHRydWUgKSB7IHJldHVybjsgfVxuXHRcdFx0XHRpZiAoIHN0YXRlICE9PSBTVEFURS5UT1VDSF9ET0xMWSApIHsgcmV0dXJuOyB9XG5cblx0XHRcdFx0dmFyIGR4ID0gZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYIC0gZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VYO1xuXHRcdFx0XHR2YXIgZHkgPSBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgLSBldmVudC50b3VjaGVzWyAxIF0ucGFnZVk7XG5cdFx0XHRcdHZhciBkaXN0YW5jZSA9IE1hdGguc3FydCggZHggKiBkeCArIGR5ICogZHkgKTtcblxuXHRcdFx0XHRkb2xseUVuZC5zZXQoIDAsIGRpc3RhbmNlICk7XG5cdFx0XHRcdGRvbGx5RGVsdGEuc3ViVmVjdG9ycyggZG9sbHlFbmQsIGRvbGx5U3RhcnQgKTtcblxuXHRcdFx0XHRpZiAoIGRvbGx5RGVsdGEueSA+IDAgKSB7XG5cblx0XHRcdFx0XHRzY29wZS5kb2xseU91dCgpO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRzY29wZS5kb2xseUluKCk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGRvbGx5U3RhcnQuY29weSggZG9sbHlFbmQgKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMzogLy8gdGhyZWUtZmluZ2VyZWQgdG91Y2g6IHBhblxuXHRcdFx0XHRpZiAoIHNjb3BlLm5vUGFuID09PSB0cnVlICkgeyByZXR1cm47IH1cblx0XHRcdFx0aWYgKCBzdGF0ZSAhPT0gU1RBVEUuVE9VQ0hfUEFOICkgeyByZXR1cm47IH1cblxuXHRcdFx0XHRwYW5FbmQuc2V0KCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVgsIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSApO1xuXHRcdFx0XHRwYW5EZWx0YS5zdWJWZWN0b3JzKCBwYW5FbmQsIHBhblN0YXJ0ICk7XG5cdFx0XHRcdFxuXHRcdFx0XHRzY29wZS5wYW4oIHBhbkRlbHRhICk7XG5cblx0XHRcdFx0cGFuU3RhcnQuY29weSggcGFuRW5kICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRzdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0XHR9XG5cblx0fVxuXG5cdGZ1bmN0aW9uIHRvdWNoZW5kKCAvKiBldmVudCAqLyApIHtcblxuXHRcdGlmICggc2NvcGUuZW5hYmxlZCA9PT0gZmFsc2UgKSB7IHJldHVybjsgfVxuXG5cdFx0c3RhdGUgPSBTVEFURS5OT05FO1xuXHR9XG5cblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdjb250ZXh0bWVudScsIGZ1bmN0aW9uICggZXZlbnQgKSB7IGV2ZW50LnByZXZlbnREZWZhdWx0KCk7IH0sIGZhbHNlICk7XG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgb25Nb3VzZURvd24sIGZhbHNlICk7XG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2V3aGVlbCcsIG9uTW91c2VXaGVlbCwgZmFsc2UgKTtcblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdET01Nb3VzZVNjcm9sbCcsIG9uTW91c2VXaGVlbCwgZmFsc2UgKTsgLy8gZmlyZWZveFxuXG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIG9uS2V5RG93biwgZmFsc2UgKTtcblxuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCB0b3VjaHN0YXJ0LCBmYWxzZSApO1xuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoZW5kJywgdG91Y2hlbmQsIGZhbHNlICk7XG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAndG91Y2htb3ZlJywgdG91Y2htb3ZlLCBmYWxzZSApO1xuXG59O1xuXG5PcmJpdENvbnRyb2xzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRIUkVFLkV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUgKTtcblxubW9kdWxlLmV4cG9ydHMgPSBPcmJpdENvbnRyb2xzO1xuIiwiLyoqXG4gKiBAYXV0aG9yIG1yZG9vYiAvIGh0dHA6Ly9tcmRvb2IuY29tL1xuICovXG5cbnZhciBTdGF0cyA9IGZ1bmN0aW9uICgpIHtcblxuXHR2YXIgc3RhcnRUaW1lID0gRGF0ZS5ub3coKSwgcHJldlRpbWUgPSBzdGFydFRpbWU7XG5cdHZhciBtcyA9IDAsIG1zTWluID0gSW5maW5pdHksIG1zTWF4ID0gMDtcblx0dmFyIGZwcyA9IDAsIGZwc01pbiA9IEluZmluaXR5LCBmcHNNYXggPSAwO1xuXHR2YXIgZnJhbWVzID0gMCwgbW9kZSA9IDA7XG5cblx0dmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdGNvbnRhaW5lci5pZCA9ICdzdGF0cyc7XG5cdGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgZnVuY3Rpb24gKCBldmVudCApIHsgZXZlbnQucHJldmVudERlZmF1bHQoKTsgc2V0TW9kZSggKysgbW9kZSAlIDIgKTsgfSwgZmFsc2UgKTtcblx0Y29udGFpbmVyLnN0eWxlLmNzc1RleHQgPSAnd2lkdGg6ODBweDtvcGFjaXR5OjAuOTtjdXJzb3I6cG9pbnRlcic7XG5cblx0dmFyIGZwc0RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdGZwc0Rpdi5pZCA9ICdmcHMnO1xuXHRmcHNEaXYuc3R5bGUuY3NzVGV4dCA9ICdwYWRkaW5nOjAgMCAzcHggM3B4O3RleHQtYWxpZ246bGVmdDtiYWNrZ3JvdW5kLWNvbG9yOiMwMDInO1xuXHRjb250YWluZXIuYXBwZW5kQ2hpbGQoIGZwc0RpdiApO1xuXG5cdHZhciBmcHNUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblx0ZnBzVGV4dC5pZCA9ICdmcHNUZXh0Jztcblx0ZnBzVGV4dC5zdHlsZS5jc3NUZXh0ID0gJ2NvbG9yOiMwZmY7Zm9udC1mYW1pbHk6SGVsdmV0aWNhLEFyaWFsLHNhbnMtc2VyaWY7Zm9udC1zaXplOjlweDtmb250LXdlaWdodDpib2xkO2xpbmUtaGVpZ2h0OjE1cHgnO1xuXHRmcHNUZXh0LmlubmVySFRNTCA9ICdGUFMnO1xuXHRmcHNEaXYuYXBwZW5kQ2hpbGQoIGZwc1RleHQgKTtcblxuXHR2YXIgZnBzR3JhcGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuXHRmcHNHcmFwaC5pZCA9ICdmcHNHcmFwaCc7XG5cdGZwc0dyYXBoLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246cmVsYXRpdmU7d2lkdGg6NzRweDtoZWlnaHQ6MzBweDtiYWNrZ3JvdW5kLWNvbG9yOiMwZmYnO1xuXHRmcHNEaXYuYXBwZW5kQ2hpbGQoIGZwc0dyYXBoICk7XG5cblx0d2hpbGUgKCBmcHNHcmFwaC5jaGlsZHJlbi5sZW5ndGggPCA3NCApIHtcblxuXHRcdHZhciBiYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnc3BhbicgKTtcblx0XHRiYXIuc3R5bGUuY3NzVGV4dCA9ICd3aWR0aDoxcHg7aGVpZ2h0OjMwcHg7ZmxvYXQ6bGVmdDtiYWNrZ3JvdW5kLWNvbG9yOiMxMTMnO1xuXHRcdGZwc0dyYXBoLmFwcGVuZENoaWxkKCBiYXIgKTtcblxuXHR9XG5cblx0dmFyIG1zRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblx0bXNEaXYuaWQgPSAnbXMnO1xuXHRtc0Rpdi5zdHlsZS5jc3NUZXh0ID0gJ3BhZGRpbmc6MCAwIDNweCAzcHg7dGV4dC1hbGlnbjpsZWZ0O2JhY2tncm91bmQtY29sb3I6IzAyMDtkaXNwbGF5Om5vbmUnO1xuXHRjb250YWluZXIuYXBwZW5kQ2hpbGQoIG1zRGl2ICk7XG5cblx0dmFyIG1zVGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdG1zVGV4dC5pZCA9ICdtc1RleHQnO1xuXHRtc1RleHQuc3R5bGUuY3NzVGV4dCA9ICdjb2xvcjojMGYwO2ZvbnQtZmFtaWx5OkhlbHZldGljYSxBcmlhbCxzYW5zLXNlcmlmO2ZvbnQtc2l6ZTo5cHg7Zm9udC13ZWlnaHQ6Ym9sZDtsaW5lLWhlaWdodDoxNXB4Jztcblx0bXNUZXh0LmlubmVySFRNTCA9ICdNUyc7XG5cdG1zRGl2LmFwcGVuZENoaWxkKCBtc1RleHQgKTtcblxuXHR2YXIgbXNHcmFwaCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdG1zR3JhcGguaWQgPSAnbXNHcmFwaCc7XG5cdG1zR3JhcGguc3R5bGUuY3NzVGV4dCA9ICdwb3NpdGlvbjpyZWxhdGl2ZTt3aWR0aDo3NHB4O2hlaWdodDozMHB4O2JhY2tncm91bmQtY29sb3I6IzBmMCc7XG5cdG1zRGl2LmFwcGVuZENoaWxkKCBtc0dyYXBoICk7XG5cblx0d2hpbGUgKCBtc0dyYXBoLmNoaWxkcmVuLmxlbmd0aCA8IDc0ICkge1xuXG5cdFx0dmFyIGJhcjIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnc3BhbicgKTtcblx0XHRiYXIyLnN0eWxlLmNzc1RleHQgPSAnd2lkdGg6MXB4O2hlaWdodDozMHB4O2Zsb2F0OmxlZnQ7YmFja2dyb3VuZC1jb2xvcjojMTMxJztcblx0XHRtc0dyYXBoLmFwcGVuZENoaWxkKCBiYXIyICk7XG5cblx0fVxuXG5cdHZhciBzZXRNb2RlID0gZnVuY3Rpb24gKCB2YWx1ZSApIHtcblxuXHRcdG1vZGUgPSB2YWx1ZTtcblxuXHRcdHN3aXRjaCAoIG1vZGUgKSB7XG5cblx0XHRcdGNhc2UgMDpcblx0XHRcdFx0ZnBzRGl2LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0XHRtc0Rpdi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0ZnBzRGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cdFx0XHRcdG1zRGl2LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0fTtcblxuXHR2YXIgdXBkYXRlR3JhcGggPSBmdW5jdGlvbiAoIGRvbSwgdmFsdWUgKSB7XG5cblx0XHR2YXIgY2hpbGQgPSBkb20uYXBwZW5kQ2hpbGQoIGRvbS5maXJzdENoaWxkICk7XG5cdFx0Y2hpbGQuc3R5bGUuaGVpZ2h0ID0gdmFsdWUgKyAncHgnO1xuXG5cdH07XG5cblx0cmV0dXJuIHtcblxuXHRcdFJFVklTSU9OOiAxMixcblxuXHRcdGRvbUVsZW1lbnQ6IGNvbnRhaW5lcixcblxuXHRcdHNldE1vZGU6IHNldE1vZGUsXG5cblx0XHRiZWdpbjogZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuXG5cdFx0fSxcblxuXHRcdGVuZDogZnVuY3Rpb24gKCkge1xuXG5cdFx0XHR2YXIgdGltZSA9IERhdGUubm93KCk7XG5cblx0XHRcdG1zID0gdGltZSAtIHN0YXJ0VGltZTtcblx0XHRcdG1zTWluID0gTWF0aC5taW4oIG1zTWluLCBtcyApO1xuXHRcdFx0bXNNYXggPSBNYXRoLm1heCggbXNNYXgsIG1zICk7XG5cblx0XHRcdG1zVGV4dC50ZXh0Q29udGVudCA9IG1zICsgJyBNUyAoJyArIG1zTWluICsgJy0nICsgbXNNYXggKyAnKSc7XG5cdFx0XHR1cGRhdGVHcmFwaCggbXNHcmFwaCwgTWF0aC5taW4oIDMwLCAzMCAtICggbXMgLyAyMDAgKSAqIDMwICkgKTtcblxuXHRcdFx0ZnJhbWVzICsrO1xuXG5cdFx0XHRpZiAoIHRpbWUgPiBwcmV2VGltZSArIDEwMDAgKSB7XG5cblx0XHRcdFx0ZnBzID0gTWF0aC5yb3VuZCggKCBmcmFtZXMgKiAxMDAwICkgLyAoIHRpbWUgLSBwcmV2VGltZSApICk7XG5cdFx0XHRcdGZwc01pbiA9IE1hdGgubWluKCBmcHNNaW4sIGZwcyApO1xuXHRcdFx0XHRmcHNNYXggPSBNYXRoLm1heCggZnBzTWF4LCBmcHMgKTtcblxuXHRcdFx0XHRmcHNUZXh0LnRleHRDb250ZW50ID0gZnBzICsgJyBGUFMgKCcgKyBmcHNNaW4gKyAnLScgKyBmcHNNYXggKyAnKSc7XG5cdFx0XHRcdHVwZGF0ZUdyYXBoKCBmcHNHcmFwaCwgTWF0aC5taW4oIDMwLCAzMCAtICggZnBzIC8gMTAwICkgKiAzMCApICk7XG5cblx0XHRcdFx0cHJldlRpbWUgPSB0aW1lO1xuXHRcdFx0XHRmcmFtZXMgPSAwO1xuXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aW1lO1xuXG5cdFx0fSxcblxuXHRcdHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRzdGFydFRpbWUgPSB0aGlzLmVuZCgpO1xuXG5cdFx0fVxuXG5cdH07XG5cbn07XG5cbmlmICggdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgKSB7XG5cblx0bW9kdWxlLmV4cG9ydHMgPSBTdGF0cztcblxufSIsIi8qKlxuICogQGF1dGhvciBhbHRlcmVkcSAvIGh0dHA6Ly9hbHRlcmVkcXVhbGlhLmNvbS9cbiAqIEBhdXRob2QgbXJkb29iIC8gaHR0cDovL21yZG9vYi5jb20vXG4gKiBAYXV0aG9kIGFyb2RpYyAvIGh0dHA6Ly9hbGVrc2FuZGFycm9kaWMuY29tL1xuICovXG5cblRIUkVFLlN0ZXJlb0VmZmVjdCA9IGZ1bmN0aW9uICggcmVuZGVyZXIgKSB7XG5cblx0Ly8gQVBJXG5cblx0dGhpcy5zZXBhcmF0aW9uID0gMztcblxuXHQvLyBpbnRlcm5hbHNcblxuXHR2YXIgX3dpZHRoLCBfaGVpZ2h0O1xuXG5cdHZhciBfcG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXHR2YXIgX3F1YXRlcm5pb24gPSBuZXcgVEhSRUUuUXVhdGVybmlvbigpO1xuXHR2YXIgX3NjYWxlID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuXHR2YXIgX2NhbWVyYUwgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoKTtcblx0dmFyIF9jYW1lcmFSID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKCk7XG5cblx0Ly8gaW5pdGlhbGl6YXRpb25cblxuXHRyZW5kZXJlci5hdXRvQ2xlYXIgPSBmYWxzZTtcblxuXHR0aGlzLnNldFNpemUgPSBmdW5jdGlvbiAoIHdpZHRoLCBoZWlnaHQgKSB7XG5cblx0XHRfd2lkdGggPSB3aWR0aCAvIDI7XG5cdFx0X2hlaWdodCA9IGhlaWdodDtcblxuXHRcdHJlbmRlcmVyLnNldFNpemUoIHdpZHRoLCBoZWlnaHQgKTtcblxuXHR9O1xuXG5cdHRoaXMucmVuZGVyID0gZnVuY3Rpb24gKCBzY2VuZSwgY2FtZXJhICkge1xuXG5cdFx0c2NlbmUudXBkYXRlTWF0cml4V29ybGQoKTtcblxuXHRcdGlmICggY2FtZXJhLnBhcmVudCA9PT0gdW5kZWZpbmVkICkgY2FtZXJhLnVwZGF0ZU1hdHJpeFdvcmxkKCk7XG5cdFxuXHRcdGNhbWVyYS5tYXRyaXhXb3JsZC5kZWNvbXBvc2UoIF9wb3NpdGlvbiwgX3F1YXRlcm5pb24sIF9zY2FsZSApO1xuXG5cdFx0Ly8gbGVmdFxuXG5cdFx0X2NhbWVyYUwuZm92ID0gY2FtZXJhLmZvdjtcblx0XHRfY2FtZXJhTC5hc3BlY3QgPSAwLjUgKiBjYW1lcmEuYXNwZWN0O1xuXHRcdF9jYW1lcmFMLm5lYXIgPSBjYW1lcmEubmVhcjtcblx0XHRfY2FtZXJhTC5mYXIgPSBjYW1lcmEuZmFyO1xuXHRcdF9jYW1lcmFMLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcblxuXHRcdF9jYW1lcmFMLnBvc2l0aW9uLmNvcHkoIF9wb3NpdGlvbiApO1xuXHRcdF9jYW1lcmFMLnF1YXRlcm5pb24uY29weSggX3F1YXRlcm5pb24gKTtcblx0XHRfY2FtZXJhTC50cmFuc2xhdGVYKCAtIHRoaXMuc2VwYXJhdGlvbiApO1xuXG5cdFx0Ly8gcmlnaHRcblxuXHRcdF9jYW1lcmFSLm5lYXIgPSBjYW1lcmEubmVhcjtcblx0XHRfY2FtZXJhUi5mYXIgPSBjYW1lcmEuZmFyO1xuXHRcdF9jYW1lcmFSLnByb2plY3Rpb25NYXRyaXggPSBfY2FtZXJhTC5wcm9qZWN0aW9uTWF0cml4O1xuXG5cdFx0X2NhbWVyYVIucG9zaXRpb24uY29weSggX3Bvc2l0aW9uICk7XG5cdFx0X2NhbWVyYVIucXVhdGVybmlvbi5jb3B5KCBfcXVhdGVybmlvbiApO1xuXHRcdF9jYW1lcmFSLnRyYW5zbGF0ZVgoIHRoaXMuc2VwYXJhdGlvbiApO1xuXG5cdFx0Ly9cblxuXHRcdHJlbmRlcmVyLnNldFZpZXdwb3J0KCAwLCAwLCBfd2lkdGggKiAyLCBfaGVpZ2h0ICk7XG5cdFx0cmVuZGVyZXIuY2xlYXIoKTtcblxuXHRcdHJlbmRlcmVyLnNldFZpZXdwb3J0KCAwLCAwLCBfd2lkdGgsIF9oZWlnaHQgKTtcblx0XHRyZW5kZXJlci5yZW5kZXIoIHNjZW5lLCBfY2FtZXJhTCApO1xuXG5cdFx0cmVuZGVyZXIuc2V0Vmlld3BvcnQoIF93aWR0aCwgMCwgX3dpZHRoLCBfaGVpZ2h0ICk7XG5cdFx0cmVuZGVyZXIucmVuZGVyKCBzY2VuZSwgX2NhbWVyYVIgKTtcblxuXHR9O1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRIUkVFLlN0ZXJlb0VmZmVjdDsiLCJtb2R1bGUuZXhwb3J0cyA9IG5vb3BcblxuZnVuY3Rpb24gbm9vcCgpIHtcbiAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ1lvdSBzaG91bGQgYnVuZGxlIHlvdXIgY29kZSAnICtcbiAgICAgICd1c2luZyBgZ2xzbGlmeWAgYXMgYSB0cmFuc2Zvcm0uJ1xuICApXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHByb2dyYW1pZnlcblxuZnVuY3Rpb24gcHJvZ3JhbWlmeSh2ZXJ0ZXgsIGZyYWdtZW50LCB1bmlmb3JtcywgYXR0cmlidXRlcykge1xuICByZXR1cm4ge1xuICAgIHZlcnRleDogdmVydGV4LCBcbiAgICBmcmFnbWVudDogZnJhZ21lbnQsXG4gICAgdW5pZm9ybXM6IHVuaWZvcm1zLCBcbiAgICBhdHRyaWJ1dGVzOiBhdHRyaWJ1dGVzXG4gIH07XG59XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5NdXRhdGlvbk9ic2VydmVyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuTXV0YXRpb25PYnNlcnZlcjtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICB2YXIgcXVldWUgPSBbXTtcblxuICAgIGlmIChjYW5NdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICAgIHZhciBoaWRkZW5EaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcXVldWVMaXN0ID0gcXVldWUuc2xpY2UoKTtcbiAgICAgICAgICAgIHF1ZXVlLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICBxdWV1ZUxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoaGlkZGVuRGl2LCB7IGF0dHJpYnV0ZXM6IHRydWUgfSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBpZiAoIXF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGhpZGRlbkRpdi5zZXRBdHRyaWJ1dGUoJ3llcycsICdubycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwiLy8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vYmFua3NlYW4vMzA0NTIyXG4vL1xuLy8gUG9ydGVkIGZyb20gU3RlZmFuIEd1c3RhdnNvbidzIGphdmEgaW1wbGVtZW50YXRpb25cbi8vIGh0dHA6Ly9zdGFmZnd3dy5pdG4ubGl1LnNlL35zdGVndS9zaW1wbGV4bm9pc2Uvc2ltcGxleG5vaXNlLnBkZlxuLy8gUmVhZCBTdGVmYW4ncyBleGNlbGxlbnQgcGFwZXIgZm9yIGRldGFpbHMgb24gaG93IHRoaXMgY29kZSB3b3Jrcy5cbi8vXG4vLyBTZWFuIE1jQ3VsbG91Z2ggYmFua3NlYW5AZ21haWwuY29tXG5cbi8qKlxuICogWW91IGNhbiBwYXNzIGluIGEgcmFuZG9tIG51bWJlciBnZW5lcmF0b3Igb2JqZWN0IGlmIHlvdSBsaWtlLlxuICogSXQgaXMgYXNzdW1lZCB0byBoYXZlIGEgcmFuZG9tKCkgbWV0aG9kLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXBsZXhOb2lzZSA9IGZ1bmN0aW9uKHIpIHtcbiAgaWYgKHIgPT0gdW5kZWZpbmVkKSByID0gTWF0aDtcbiAgdGhpcy5ncmFkMyA9IFtbMSwxLDBdLFstMSwxLDBdLFsxLC0xLDBdLFstMSwtMSwwXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbMSwwLDFdLFstMSwwLDFdLFsxLDAsLTFdLFstMSwwLC0xXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbMCwxLDFdLFswLC0xLDFdLFswLDEsLTFdLFswLC0xLC0xXV07IFxuICB0aGlzLnAgPSBbXTtcbiAgZm9yICh2YXIgaT0wOyBpPDI1NjsgaSsrKSB7XG4gICAgdGhpcy5wW2ldID0gTWF0aC5mbG9vcihyLnJhbmRvbSgpKjI1Nik7XG4gIH1cbiAgLy8gVG8gcmVtb3ZlIHRoZSBuZWVkIGZvciBpbmRleCB3cmFwcGluZywgZG91YmxlIHRoZSBwZXJtdXRhdGlvbiB0YWJsZSBsZW5ndGggXG4gIHRoaXMucGVybSA9IFtdOyBcbiAgZm9yKHZhciBpPTA7IGk8NTEyOyBpKyspIHtcbiAgICB0aGlzLnBlcm1baV09dGhpcy5wW2kgJiAyNTVdO1xuICB9IFxuXG4gIC8vIEEgbG9va3VwIHRhYmxlIHRvIHRyYXZlcnNlIHRoZSBzaW1wbGV4IGFyb3VuZCBhIGdpdmVuIHBvaW50IGluIDRELiBcbiAgLy8gRGV0YWlscyBjYW4gYmUgZm91bmQgd2hlcmUgdGhpcyB0YWJsZSBpcyB1c2VkLCBpbiB0aGUgNEQgbm9pc2UgbWV0aG9kLiBcbiAgdGhpcy5zaW1wbGV4ID0gWyBcbiAgICBbMCwxLDIsM10sWzAsMSwzLDJdLFswLDAsMCwwXSxbMCwyLDMsMV0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzEsMiwzLDBdLCBcbiAgICBbMCwyLDEsM10sWzAsMCwwLDBdLFswLDMsMSwyXSxbMCwzLDIsMV0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzEsMywyLDBdLCBcbiAgICBbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLCBcbiAgICBbMSwyLDAsM10sWzAsMCwwLDBdLFsxLDMsMCwyXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMiwzLDAsMV0sWzIsMywxLDBdLCBcbiAgICBbMSwwLDIsM10sWzEsMCwzLDJdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFsyLDAsMywxXSxbMCwwLDAsMF0sWzIsMSwzLDBdLCBcbiAgICBbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLCBcbiAgICBbMiwwLDEsM10sWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzMsMCwxLDJdLFszLDAsMiwxXSxbMCwwLDAsMF0sWzMsMSwyLDBdLCBcbiAgICBbMiwxLDAsM10sWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzMsMSwwLDJdLFswLDAsMCwwXSxbMywyLDAsMV0sWzMsMiwxLDBdXTsgXG59O1xuXG5TaW1wbGV4Tm9pc2UucHJvdG90eXBlLmRvdCA9IGZ1bmN0aW9uKGcsIHgsIHkpIHsgXG4gIHJldHVybiBnWzBdKnggKyBnWzFdKnk7XG59O1xuXG5TaW1wbGV4Tm9pc2UucHJvdG90eXBlLm5vaXNlID0gZnVuY3Rpb24oeGluLCB5aW4pIHsgXG4gIHZhciBuMCwgbjEsIG4yOyAvLyBOb2lzZSBjb250cmlidXRpb25zIGZyb20gdGhlIHRocmVlIGNvcm5lcnMgXG4gIC8vIFNrZXcgdGhlIGlucHV0IHNwYWNlIHRvIGRldGVybWluZSB3aGljaCBzaW1wbGV4IGNlbGwgd2UncmUgaW4gXG4gIHZhciBGMiA9IDAuNSooTWF0aC5zcXJ0KDMuMCktMS4wKTsgXG4gIHZhciBzID0gKHhpbit5aW4pKkYyOyAvLyBIYWlyeSBmYWN0b3IgZm9yIDJEIFxuICB2YXIgaSA9IE1hdGguZmxvb3IoeGluK3MpOyBcbiAgdmFyIGogPSBNYXRoLmZsb29yKHlpbitzKTsgXG4gIHZhciBHMiA9ICgzLjAtTWF0aC5zcXJ0KDMuMCkpLzYuMDsgXG4gIHZhciB0ID0gKGkraikqRzI7IFxuICB2YXIgWDAgPSBpLXQ7IC8vIFVuc2tldyB0aGUgY2VsbCBvcmlnaW4gYmFjayB0byAoeCx5KSBzcGFjZSBcbiAgdmFyIFkwID0gai10OyBcbiAgdmFyIHgwID0geGluLVgwOyAvLyBUaGUgeCx5IGRpc3RhbmNlcyBmcm9tIHRoZSBjZWxsIG9yaWdpbiBcbiAgdmFyIHkwID0geWluLVkwOyBcbiAgLy8gRm9yIHRoZSAyRCBjYXNlLCB0aGUgc2ltcGxleCBzaGFwZSBpcyBhbiBlcXVpbGF0ZXJhbCB0cmlhbmdsZS4gXG4gIC8vIERldGVybWluZSB3aGljaCBzaW1wbGV4IHdlIGFyZSBpbi4gXG4gIHZhciBpMSwgajE7IC8vIE9mZnNldHMgZm9yIHNlY29uZCAobWlkZGxlKSBjb3JuZXIgb2Ygc2ltcGxleCBpbiAoaSxqKSBjb29yZHMgXG4gIGlmKHgwPnkwKSB7aTE9MTsgajE9MDt9IC8vIGxvd2VyIHRyaWFuZ2xlLCBYWSBvcmRlcjogKDAsMCktPigxLDApLT4oMSwxKSBcbiAgZWxzZSB7aTE9MDsgajE9MTt9ICAgICAgLy8gdXBwZXIgdHJpYW5nbGUsIFlYIG9yZGVyOiAoMCwwKS0+KDAsMSktPigxLDEpIFxuICAvLyBBIHN0ZXAgb2YgKDEsMCkgaW4gKGksaikgbWVhbnMgYSBzdGVwIG9mICgxLWMsLWMpIGluICh4LHkpLCBhbmQgXG4gIC8vIGEgc3RlcCBvZiAoMCwxKSBpbiAoaSxqKSBtZWFucyBhIHN0ZXAgb2YgKC1jLDEtYykgaW4gKHgseSksIHdoZXJlIFxuICAvLyBjID0gKDMtc3FydCgzKSkvNiBcbiAgdmFyIHgxID0geDAgLSBpMSArIEcyOyAvLyBPZmZzZXRzIGZvciBtaWRkbGUgY29ybmVyIGluICh4LHkpIHVuc2tld2VkIGNvb3JkcyBcbiAgdmFyIHkxID0geTAgLSBqMSArIEcyOyBcbiAgdmFyIHgyID0geDAgLSAxLjAgKyAyLjAgKiBHMjsgLy8gT2Zmc2V0cyBmb3IgbGFzdCBjb3JuZXIgaW4gKHgseSkgdW5za2V3ZWQgY29vcmRzIFxuICB2YXIgeTIgPSB5MCAtIDEuMCArIDIuMCAqIEcyOyBcbiAgLy8gV29yayBvdXQgdGhlIGhhc2hlZCBncmFkaWVudCBpbmRpY2VzIG9mIHRoZSB0aHJlZSBzaW1wbGV4IGNvcm5lcnMgXG4gIHZhciBpaSA9IGkgJiAyNTU7IFxuICB2YXIgamogPSBqICYgMjU1OyBcbiAgdmFyIGdpMCA9IHRoaXMucGVybVtpaSt0aGlzLnBlcm1bampdXSAlIDEyOyBcbiAgdmFyIGdpMSA9IHRoaXMucGVybVtpaStpMSt0aGlzLnBlcm1bamorajFdXSAlIDEyOyBcbiAgdmFyIGdpMiA9IHRoaXMucGVybVtpaSsxK3RoaXMucGVybVtqaisxXV0gJSAxMjsgXG4gIC8vIENhbGN1bGF0ZSB0aGUgY29udHJpYnV0aW9uIGZyb20gdGhlIHRocmVlIGNvcm5lcnMgXG4gIHZhciB0MCA9IDAuNSAtIHgwKngwLXkwKnkwOyBcbiAgaWYodDA8MCkgbjAgPSAwLjA7IFxuICBlbHNlIHsgXG4gICAgdDAgKj0gdDA7IFxuICAgIG4wID0gdDAgKiB0MCAqIHRoaXMuZG90KHRoaXMuZ3JhZDNbZ2kwXSwgeDAsIHkwKTsgIC8vICh4LHkpIG9mIGdyYWQzIHVzZWQgZm9yIDJEIGdyYWRpZW50IFxuICB9IFxuICB2YXIgdDEgPSAwLjUgLSB4MSp4MS15MSp5MTsgXG4gIGlmKHQxPDApIG4xID0gMC4wOyBcbiAgZWxzZSB7IFxuICAgIHQxICo9IHQxOyBcbiAgICBuMSA9IHQxICogdDEgKiB0aGlzLmRvdCh0aGlzLmdyYWQzW2dpMV0sIHgxLCB5MSk7IFxuICB9XG4gIHZhciB0MiA9IDAuNSAtIHgyKngyLXkyKnkyOyBcbiAgaWYodDI8MCkgbjIgPSAwLjA7IFxuICBlbHNlIHsgXG4gICAgdDIgKj0gdDI7IFxuICAgIG4yID0gdDIgKiB0MiAqIHRoaXMuZG90KHRoaXMuZ3JhZDNbZ2kyXSwgeDIsIHkyKTsgXG4gIH0gXG4gIC8vIEFkZCBjb250cmlidXRpb25zIGZyb20gZWFjaCBjb3JuZXIgdG8gZ2V0IHRoZSBmaW5hbCBub2lzZSB2YWx1ZS4gXG4gIC8vIFRoZSByZXN1bHQgaXMgc2NhbGVkIHRvIHJldHVybiB2YWx1ZXMgaW4gdGhlIGludGVydmFsIFstMSwxXS4gXG4gIHJldHVybiA3MC4wICogKG4wICsgbjEgKyBuMik7IFxufTtcblxuLy8gM0Qgc2ltcGxleCBub2lzZSBcblNpbXBsZXhOb2lzZS5wcm90b3R5cGUubm9pc2UzZCA9IGZ1bmN0aW9uKHhpbiwgeWluLCB6aW4pIHsgXG4gIHZhciBuMCwgbjEsIG4yLCBuMzsgLy8gTm9pc2UgY29udHJpYnV0aW9ucyBmcm9tIHRoZSBmb3VyIGNvcm5lcnMgXG4gIC8vIFNrZXcgdGhlIGlucHV0IHNwYWNlIHRvIGRldGVybWluZSB3aGljaCBzaW1wbGV4IGNlbGwgd2UncmUgaW4gXG4gIHZhciBGMyA9IDEuMC8zLjA7IFxuICB2YXIgcyA9ICh4aW4reWluK3ppbikqRjM7IC8vIFZlcnkgbmljZSBhbmQgc2ltcGxlIHNrZXcgZmFjdG9yIGZvciAzRCBcbiAgdmFyIGkgPSBNYXRoLmZsb29yKHhpbitzKTsgXG4gIHZhciBqID0gTWF0aC5mbG9vcih5aW4rcyk7IFxuICB2YXIgayA9IE1hdGguZmxvb3IoemluK3MpOyBcbiAgdmFyIEczID0gMS4wLzYuMDsgLy8gVmVyeSBuaWNlIGFuZCBzaW1wbGUgdW5za2V3IGZhY3RvciwgdG9vIFxuICB2YXIgdCA9IChpK2oraykqRzM7IFxuICB2YXIgWDAgPSBpLXQ7IC8vIFVuc2tldyB0aGUgY2VsbCBvcmlnaW4gYmFjayB0byAoeCx5LHopIHNwYWNlIFxuICB2YXIgWTAgPSBqLXQ7IFxuICB2YXIgWjAgPSBrLXQ7IFxuICB2YXIgeDAgPSB4aW4tWDA7IC8vIFRoZSB4LHkseiBkaXN0YW5jZXMgZnJvbSB0aGUgY2VsbCBvcmlnaW4gXG4gIHZhciB5MCA9IHlpbi1ZMDsgXG4gIHZhciB6MCA9IHppbi1aMDsgXG4gIC8vIEZvciB0aGUgM0QgY2FzZSwgdGhlIHNpbXBsZXggc2hhcGUgaXMgYSBzbGlnaHRseSBpcnJlZ3VsYXIgdGV0cmFoZWRyb24uIFxuICAvLyBEZXRlcm1pbmUgd2hpY2ggc2ltcGxleCB3ZSBhcmUgaW4uIFxuICB2YXIgaTEsIGoxLCBrMTsgLy8gT2Zmc2V0cyBmb3Igc2Vjb25kIGNvcm5lciBvZiBzaW1wbGV4IGluIChpLGosaykgY29vcmRzIFxuICB2YXIgaTIsIGoyLCBrMjsgLy8gT2Zmc2V0cyBmb3IgdGhpcmQgY29ybmVyIG9mIHNpbXBsZXggaW4gKGksaixrKSBjb29yZHMgXG4gIGlmKHgwPj15MCkgeyBcbiAgICBpZih5MD49ejApIFxuICAgICAgeyBpMT0xOyBqMT0wOyBrMT0wOyBpMj0xOyBqMj0xOyBrMj0wOyB9IC8vIFggWSBaIG9yZGVyIFxuICAgICAgZWxzZSBpZih4MD49ejApIHsgaTE9MTsgajE9MDsgazE9MDsgaTI9MTsgajI9MDsgazI9MTsgfSAvLyBYIFogWSBvcmRlciBcbiAgICAgIGVsc2UgeyBpMT0wOyBqMT0wOyBrMT0xOyBpMj0xOyBqMj0wOyBrMj0xOyB9IC8vIFogWCBZIG9yZGVyIFxuICAgIH0gXG4gIGVsc2UgeyAvLyB4MDx5MCBcbiAgICBpZih5MDx6MCkgeyBpMT0wOyBqMT0wOyBrMT0xOyBpMj0wOyBqMj0xOyBrMj0xOyB9IC8vIFogWSBYIG9yZGVyIFxuICAgIGVsc2UgaWYoeDA8ejApIHsgaTE9MDsgajE9MTsgazE9MDsgaTI9MDsgajI9MTsgazI9MTsgfSAvLyBZIFogWCBvcmRlciBcbiAgICBlbHNlIHsgaTE9MDsgajE9MTsgazE9MDsgaTI9MTsgajI9MTsgazI9MDsgfSAvLyBZIFggWiBvcmRlciBcbiAgfSBcbiAgLy8gQSBzdGVwIG9mICgxLDAsMCkgaW4gKGksaixrKSBtZWFucyBhIHN0ZXAgb2YgKDEtYywtYywtYykgaW4gKHgseSx6KSwgXG4gIC8vIGEgc3RlcCBvZiAoMCwxLDApIGluIChpLGosaykgbWVhbnMgYSBzdGVwIG9mICgtYywxLWMsLWMpIGluICh4LHkseiksIGFuZCBcbiAgLy8gYSBzdGVwIG9mICgwLDAsMSkgaW4gKGksaixrKSBtZWFucyBhIHN0ZXAgb2YgKC1jLC1jLDEtYykgaW4gKHgseSx6KSwgd2hlcmUgXG4gIC8vIGMgPSAxLzYuXG4gIHZhciB4MSA9IHgwIC0gaTEgKyBHMzsgLy8gT2Zmc2V0cyBmb3Igc2Vjb25kIGNvcm5lciBpbiAoeCx5LHopIGNvb3JkcyBcbiAgdmFyIHkxID0geTAgLSBqMSArIEczOyBcbiAgdmFyIHoxID0gejAgLSBrMSArIEczOyBcbiAgdmFyIHgyID0geDAgLSBpMiArIDIuMCpHMzsgLy8gT2Zmc2V0cyBmb3IgdGhpcmQgY29ybmVyIGluICh4LHkseikgY29vcmRzIFxuICB2YXIgeTIgPSB5MCAtIGoyICsgMi4wKkczOyBcbiAgdmFyIHoyID0gejAgLSBrMiArIDIuMCpHMzsgXG4gIHZhciB4MyA9IHgwIC0gMS4wICsgMy4wKkczOyAvLyBPZmZzZXRzIGZvciBsYXN0IGNvcm5lciBpbiAoeCx5LHopIGNvb3JkcyBcbiAgdmFyIHkzID0geTAgLSAxLjAgKyAzLjAqRzM7IFxuICB2YXIgejMgPSB6MCAtIDEuMCArIDMuMCpHMzsgXG4gIC8vIFdvcmsgb3V0IHRoZSBoYXNoZWQgZ3JhZGllbnQgaW5kaWNlcyBvZiB0aGUgZm91ciBzaW1wbGV4IGNvcm5lcnMgXG4gIHZhciBpaSA9IGkgJiAyNTU7IFxuICB2YXIgamogPSBqICYgMjU1OyBcbiAgdmFyIGtrID0gayAmIDI1NTsgXG4gIHZhciBnaTAgPSB0aGlzLnBlcm1baWkrdGhpcy5wZXJtW2pqK3RoaXMucGVybVtra11dXSAlIDEyOyBcbiAgdmFyIGdpMSA9IHRoaXMucGVybVtpaStpMSt0aGlzLnBlcm1bamorajErdGhpcy5wZXJtW2trK2sxXV1dICUgMTI7IFxuICB2YXIgZ2kyID0gdGhpcy5wZXJtW2lpK2kyK3RoaXMucGVybVtqaitqMit0aGlzLnBlcm1ba2srazJdXV0gJSAxMjsgXG4gIHZhciBnaTMgPSB0aGlzLnBlcm1baWkrMSt0aGlzLnBlcm1bamorMSt0aGlzLnBlcm1ba2srMV1dXSAlIDEyOyBcbiAgLy8gQ2FsY3VsYXRlIHRoZSBjb250cmlidXRpb24gZnJvbSB0aGUgZm91ciBjb3JuZXJzIFxuICB2YXIgdDAgPSAwLjYgLSB4MCp4MCAtIHkwKnkwIC0gejAqejA7IFxuICBpZih0MDwwKSBuMCA9IDAuMDsgXG4gIGVsc2UgeyBcbiAgICB0MCAqPSB0MDsgXG4gICAgbjAgPSB0MCAqIHQwICogdGhpcy5kb3QodGhpcy5ncmFkM1tnaTBdLCB4MCwgeTAsIHowKTsgXG4gIH1cbiAgdmFyIHQxID0gMC42IC0geDEqeDEgLSB5MSp5MSAtIHoxKnoxOyBcbiAgaWYodDE8MCkgbjEgPSAwLjA7IFxuICBlbHNlIHsgXG4gICAgdDEgKj0gdDE7IFxuICAgIG4xID0gdDEgKiB0MSAqIHRoaXMuZG90KHRoaXMuZ3JhZDNbZ2kxXSwgeDEsIHkxLCB6MSk7IFxuICB9IFxuICB2YXIgdDIgPSAwLjYgLSB4Mip4MiAtIHkyKnkyIC0gejIqejI7IFxuICBpZih0MjwwKSBuMiA9IDAuMDsgXG4gIGVsc2UgeyBcbiAgICB0MiAqPSB0MjsgXG4gICAgbjIgPSB0MiAqIHQyICogdGhpcy5kb3QodGhpcy5ncmFkM1tnaTJdLCB4MiwgeTIsIHoyKTsgXG4gIH0gXG4gIHZhciB0MyA9IDAuNiAtIHgzKngzIC0geTMqeTMgLSB6Myp6MzsgXG4gIGlmKHQzPDApIG4zID0gMC4wOyBcbiAgZWxzZSB7IFxuICAgIHQzICo9IHQzOyBcbiAgICBuMyA9IHQzICogdDMgKiB0aGlzLmRvdCh0aGlzLmdyYWQzW2dpM10sIHgzLCB5MywgejMpOyBcbiAgfSBcbiAgLy8gQWRkIGNvbnRyaWJ1dGlvbnMgZnJvbSBlYWNoIGNvcm5lciB0byBnZXQgdGhlIGZpbmFsIG5vaXNlIHZhbHVlLiBcbiAgLy8gVGhlIHJlc3VsdCBpcyBzY2FsZWQgdG8gc3RheSBqdXN0IGluc2lkZSBbLTEsMV0gXG4gIHJldHVybiAzMi4wKihuMCArIG4xICsgbjIgKyBuMyk7IFxufTsiLCIvKiFcbiAqIEBvdmVydmlldyBSU1ZQIC0gYSB0aW55IGltcGxlbWVudGF0aW9uIG9mIFByb21pc2VzL0ErLlxuICogQGNvcHlyaWdodCBDb3B5cmlnaHQgKGMpIDIwMTQgWWVodWRhIEthdHosIFRvbSBEYWxlLCBTdGVmYW4gUGVubmVyIGFuZCBjb250cmlidXRvcnNcbiAqIEBsaWNlbnNlICAgTGljZW5zZWQgdW5kZXIgTUlUIGxpY2Vuc2VcbiAqICAgICAgICAgICAgU2VlIGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS90aWxkZWlvL3JzdnAuanMvbWFzdGVyL0xJQ0VOU0VcbiAqIEB2ZXJzaW9uICAgMy4wLjE0XG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJGV2ZW50cyQkaW5kZXhPZihjYWxsYmFja3MsIGNhbGxiYWNrKSB7XG4gICAgICBmb3IgKHZhciBpPTAsIGw9Y2FsbGJhY2tzLmxlbmd0aDsgaTxsOyBpKyspIHtcbiAgICAgICAgaWYgKGNhbGxiYWNrc1tpXSA9PT0gY2FsbGJhY2spIHsgcmV0dXJuIGk7IH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkcnN2cCRldmVudHMkJGNhbGxiYWNrc0ZvcihvYmplY3QpIHtcbiAgICAgIHZhciBjYWxsYmFja3MgPSBvYmplY3QuX3Byb21pc2VDYWxsYmFja3M7XG5cbiAgICAgIGlmICghY2FsbGJhY2tzKSB7XG4gICAgICAgIGNhbGxiYWNrcyA9IG9iamVjdC5fcHJvbWlzZUNhbGxiYWNrcyA9IHt9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY2FsbGJhY2tzO1xuICAgIH1cblxuICAgIHZhciAkJHJzdnAkZXZlbnRzJCRkZWZhdWx0ID0ge1xuXG4gICAgICAvKipcbiAgICAgICAgYFJTVlAuRXZlbnRUYXJnZXQubWl4aW5gIGV4dGVuZHMgYW4gb2JqZWN0IHdpdGggRXZlbnRUYXJnZXQgbWV0aG9kcy4gRm9yXG4gICAgICAgIEV4YW1wbGU6XG5cbiAgICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgICB2YXIgb2JqZWN0ID0ge307XG5cbiAgICAgICAgUlNWUC5FdmVudFRhcmdldC5taXhpbihvYmplY3QpO1xuXG4gICAgICAgIG9iamVjdC5vbignZmluaXNoZWQnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIC8vIGhhbmRsZSBldmVudFxuICAgICAgICB9KTtcblxuICAgICAgICBvYmplY3QudHJpZ2dlcignZmluaXNoZWQnLCB7IGRldGFpbDogdmFsdWUgfSk7XG4gICAgICAgIGBgYFxuXG4gICAgICAgIGBFdmVudFRhcmdldC5taXhpbmAgYWxzbyB3b3JrcyB3aXRoIHByb3RvdHlwZXM6XG5cbiAgICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgICB2YXIgUGVyc29uID0gZnVuY3Rpb24oKSB7fTtcbiAgICAgICAgUlNWUC5FdmVudFRhcmdldC5taXhpbihQZXJzb24ucHJvdG90eXBlKTtcblxuICAgICAgICB2YXIgeWVodWRhID0gbmV3IFBlcnNvbigpO1xuICAgICAgICB2YXIgdG9tID0gbmV3IFBlcnNvbigpO1xuXG4gICAgICAgIHllaHVkYS5vbigncG9rZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ1llaHVkYSBzYXlzIE9XJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRvbS5vbigncG9rZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ1RvbSBzYXlzIE9XJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHllaHVkYS50cmlnZ2VyKCdwb2tlJyk7XG4gICAgICAgIHRvbS50cmlnZ2VyKCdwb2tlJyk7XG4gICAgICAgIGBgYFxuXG4gICAgICAgIEBtZXRob2QgbWl4aW5cbiAgICAgICAgQGZvciBSU1ZQLkV2ZW50VGFyZ2V0XG4gICAgICAgIEBwcml2YXRlXG4gICAgICAgIEBwYXJhbSB7T2JqZWN0fSBvYmplY3Qgb2JqZWN0IHRvIGV4dGVuZCB3aXRoIEV2ZW50VGFyZ2V0IG1ldGhvZHNcbiAgICAgICovXG4gICAgICBtaXhpbjogZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgICAgIG9iamVjdC5vbiA9IHRoaXMub247XG4gICAgICAgIG9iamVjdC5vZmYgPSB0aGlzLm9mZjtcbiAgICAgICAgb2JqZWN0LnRyaWdnZXIgPSB0aGlzLnRyaWdnZXI7XG4gICAgICAgIG9iamVjdC5fcHJvbWlzZUNhbGxiYWNrcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICBSZWdpc3RlcnMgYSBjYWxsYmFjayB0byBiZSBleGVjdXRlZCB3aGVuIGBldmVudE5hbWVgIGlzIHRyaWdnZXJlZFxuXG4gICAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgICAgb2JqZWN0Lm9uKCdldmVudCcsIGZ1bmN0aW9uKGV2ZW50SW5mbyl7XG4gICAgICAgICAgLy8gaGFuZGxlIHRoZSBldmVudFxuICAgICAgICB9KTtcblxuICAgICAgICBvYmplY3QudHJpZ2dlcignZXZlbnQnKTtcbiAgICAgICAgYGBgXG5cbiAgICAgICAgQG1ldGhvZCBvblxuICAgICAgICBAZm9yIFJTVlAuRXZlbnRUYXJnZXRcbiAgICAgICAgQHByaXZhdGVcbiAgICAgICAgQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZSBuYW1lIG9mIHRoZSBldmVudCB0byBsaXN0ZW4gZm9yXG4gICAgICAgIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBldmVudCBpcyB0cmlnZ2VyZWQuXG4gICAgICAqL1xuICAgICAgb246IGZ1bmN0aW9uKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGFsbENhbGxiYWNrcyA9ICQkcnN2cCRldmVudHMkJGNhbGxiYWNrc0Zvcih0aGlzKSwgY2FsbGJhY2tzO1xuXG4gICAgICAgIGNhbGxiYWNrcyA9IGFsbENhbGxiYWNrc1tldmVudE5hbWVdO1xuXG4gICAgICAgIGlmICghY2FsbGJhY2tzKSB7XG4gICAgICAgICAgY2FsbGJhY2tzID0gYWxsQ2FsbGJhY2tzW2V2ZW50TmFtZV0gPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgkJHJzdnAkZXZlbnRzJCRpbmRleE9mKGNhbGxiYWNrcywgY2FsbGJhY2spID09PSAtMSkge1xuICAgICAgICAgIGNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgIFlvdSBjYW4gdXNlIGBvZmZgIHRvIHN0b3AgZmlyaW5nIGEgcGFydGljdWxhciBjYWxsYmFjayBmb3IgYW4gZXZlbnQ6XG5cbiAgICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgICBmdW5jdGlvbiBkb1N0dWZmKCkgeyAvLyBkbyBzdHVmZiEgfVxuICAgICAgICBvYmplY3Qub24oJ3N0dWZmJywgZG9TdHVmZik7XG5cbiAgICAgICAgb2JqZWN0LnRyaWdnZXIoJ3N0dWZmJyk7IC8vIGRvU3R1ZmYgd2lsbCBiZSBjYWxsZWRcblxuICAgICAgICAvLyBVbnJlZ2lzdGVyIE9OTFkgdGhlIGRvU3R1ZmYgY2FsbGJhY2tcbiAgICAgICAgb2JqZWN0Lm9mZignc3R1ZmYnLCBkb1N0dWZmKTtcbiAgICAgICAgb2JqZWN0LnRyaWdnZXIoJ3N0dWZmJyk7IC8vIGRvU3R1ZmYgd2lsbCBOT1QgYmUgY2FsbGVkXG4gICAgICAgIGBgYFxuXG4gICAgICAgIElmIHlvdSBkb24ndCBwYXNzIGEgYGNhbGxiYWNrYCBhcmd1bWVudCB0byBgb2ZmYCwgQUxMIGNhbGxiYWNrcyBmb3IgdGhlXG4gICAgICAgIGV2ZW50IHdpbGwgbm90IGJlIGV4ZWN1dGVkIHdoZW4gdGhlIGV2ZW50IGZpcmVzLiBGb3IgZXhhbXBsZTpcblxuICAgICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICAgIHZhciBjYWxsYmFjazEgPSBmdW5jdGlvbigpe307XG4gICAgICAgIHZhciBjYWxsYmFjazIgPSBmdW5jdGlvbigpe307XG5cbiAgICAgICAgb2JqZWN0Lm9uKCdzdHVmZicsIGNhbGxiYWNrMSk7XG4gICAgICAgIG9iamVjdC5vbignc3R1ZmYnLCBjYWxsYmFjazIpO1xuXG4gICAgICAgIG9iamVjdC50cmlnZ2VyKCdzdHVmZicpOyAvLyBjYWxsYmFjazEgYW5kIGNhbGxiYWNrMiB3aWxsIGJlIGV4ZWN1dGVkLlxuXG4gICAgICAgIG9iamVjdC5vZmYoJ3N0dWZmJyk7XG4gICAgICAgIG9iamVjdC50cmlnZ2VyKCdzdHVmZicpOyAvLyBjYWxsYmFjazEgYW5kIGNhbGxiYWNrMiB3aWxsIG5vdCBiZSBleGVjdXRlZCFcbiAgICAgICAgYGBgXG5cbiAgICAgICAgQG1ldGhvZCBvZmZcbiAgICAgICAgQGZvciBSU1ZQLkV2ZW50VGFyZ2V0XG4gICAgICAgIEBwcml2YXRlXG4gICAgICAgIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWUgZXZlbnQgdG8gc3RvcCBsaXN0ZW5pbmcgdG9cbiAgICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgb3B0aW9uYWwgYXJndW1lbnQuIElmIGdpdmVuLCBvbmx5IHRoZSBmdW5jdGlvblxuICAgICAgICBnaXZlbiB3aWxsIGJlIHJlbW92ZWQgZnJvbSB0aGUgZXZlbnQncyBjYWxsYmFjayBxdWV1ZS4gSWYgbm8gYGNhbGxiYWNrYFxuICAgICAgICBhcmd1bWVudCBpcyBnaXZlbiwgYWxsIGNhbGxiYWNrcyB3aWxsIGJlIHJlbW92ZWQgZnJvbSB0aGUgZXZlbnQncyBjYWxsYmFja1xuICAgICAgICBxdWV1ZS5cbiAgICAgICovXG4gICAgICBvZmY6IGZ1bmN0aW9uKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGFsbENhbGxiYWNrcyA9ICQkcnN2cCRldmVudHMkJGNhbGxiYWNrc0Zvcih0aGlzKSwgY2FsbGJhY2tzLCBpbmRleDtcblxuICAgICAgICBpZiAoIWNhbGxiYWNrKSB7XG4gICAgICAgICAgYWxsQ2FsbGJhY2tzW2V2ZW50TmFtZV0gPSBbXTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFja3MgPSBhbGxDYWxsYmFja3NbZXZlbnROYW1lXTtcblxuICAgICAgICBpbmRleCA9ICQkcnN2cCRldmVudHMkJGluZGV4T2YoY2FsbGJhY2tzLCBjYWxsYmFjayk7XG5cbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkgeyBjYWxsYmFja3Muc3BsaWNlKGluZGV4LCAxKTsgfVxuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgIFVzZSBgdHJpZ2dlcmAgdG8gZmlyZSBjdXN0b20gZXZlbnRzLiBGb3IgZXhhbXBsZTpcblxuICAgICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICAgIG9iamVjdC5vbignZm9vJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICBjb25zb2xlLmxvZygnZm9vIGV2ZW50IGhhcHBlbmVkIScpO1xuICAgICAgICB9KTtcbiAgICAgICAgb2JqZWN0LnRyaWdnZXIoJ2ZvbycpO1xuICAgICAgICAvLyAnZm9vIGV2ZW50IGhhcHBlbmVkIScgbG9nZ2VkIHRvIHRoZSBjb25zb2xlXG4gICAgICAgIGBgYFxuXG4gICAgICAgIFlvdSBjYW4gYWxzbyBwYXNzIGEgdmFsdWUgYXMgYSBzZWNvbmQgYXJndW1lbnQgdG8gYHRyaWdnZXJgIHRoYXQgd2lsbCBiZVxuICAgICAgICBwYXNzZWQgYXMgYW4gYXJndW1lbnQgdG8gYWxsIGV2ZW50IGxpc3RlbmVycyBmb3IgdGhlIGV2ZW50OlxuXG4gICAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgICAgb2JqZWN0Lm9uKCdmb28nLCBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgICAgY29uc29sZS5sb2codmFsdWUubmFtZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG9iamVjdC50cmlnZ2VyKCdmb28nLCB7IG5hbWU6ICdiYXInIH0pO1xuICAgICAgICAvLyAnYmFyJyBsb2dnZWQgdG8gdGhlIGNvbnNvbGVcbiAgICAgICAgYGBgXG5cbiAgICAgICAgQG1ldGhvZCB0cmlnZ2VyXG4gICAgICAgIEBmb3IgUlNWUC5FdmVudFRhcmdldFxuICAgICAgICBAcHJpdmF0ZVxuICAgICAgICBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lIG5hbWUgb2YgdGhlIGV2ZW50IHRvIGJlIHRyaWdnZXJlZFxuICAgICAgICBAcGFyYW0ge0FueX0gb3B0aW9ucyBvcHRpb25hbCB2YWx1ZSB0byBiZSBwYXNzZWQgdG8gYW55IGV2ZW50IGhhbmRsZXJzIGZvclxuICAgICAgICB0aGUgZ2l2ZW4gYGV2ZW50TmFtZWBcbiAgICAgICovXG4gICAgICB0cmlnZ2VyOiBmdW5jdGlvbihldmVudE5hbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGFsbENhbGxiYWNrcyA9ICQkcnN2cCRldmVudHMkJGNhbGxiYWNrc0Zvcih0aGlzKSwgY2FsbGJhY2tzLCBjYWxsYmFjaztcblxuICAgICAgICBpZiAoY2FsbGJhY2tzID0gYWxsQ2FsbGJhY2tzW2V2ZW50TmFtZV0pIHtcbiAgICAgICAgICAvLyBEb24ndCBjYWNoZSB0aGUgY2FsbGJhY2tzLmxlbmd0aCBzaW5jZSBpdCBtYXkgZ3Jvd1xuICAgICAgICAgIGZvciAodmFyIGk9MDsgaTxjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2tzW2ldO1xuXG4gICAgICAgICAgICBjYWxsYmFjayhvcHRpb25zKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyICQkcnN2cCRjb25maWckJGNvbmZpZyA9IHtcbiAgICAgIGluc3RydW1lbnQ6IGZhbHNlXG4gICAgfTtcblxuICAgICQkcnN2cCRldmVudHMkJGRlZmF1bHQubWl4aW4oJCRyc3ZwJGNvbmZpZyQkY29uZmlnKTtcblxuICAgIGZ1bmN0aW9uICQkcnN2cCRjb25maWckJGNvbmZpZ3VyZShuYW1lLCB2YWx1ZSkge1xuICAgICAgaWYgKG5hbWUgPT09ICdvbmVycm9yJykge1xuICAgICAgICAvLyBoYW5kbGUgZm9yIGxlZ2FjeSB1c2VycyB0aGF0IGV4cGVjdCB0aGUgYWN0dWFsXG4gICAgICAgIC8vIGVycm9yIHRvIGJlIHBhc3NlZCB0byB0aGVpciBmdW5jdGlvbiBhZGRlZCB2aWFcbiAgICAgICAgLy8gYFJTVlAuY29uZmlndXJlKCdvbmVycm9yJywgc29tZUZ1bmN0aW9uSGVyZSk7YFxuICAgICAgICAkJHJzdnAkY29uZmlnJCRjb25maWcub24oJ2Vycm9yJywgdmFsdWUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICQkcnN2cCRjb25maWckJGNvbmZpZ1tuYW1lXSA9IHZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICQkcnN2cCRjb25maWckJGNvbmZpZ1tuYW1lXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHV0aWxzJCRvYmplY3RPckZ1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJyB8fCAodHlwZW9mIHggPT09ICdvYmplY3QnICYmIHggIT09IG51bGwpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkdXRpbHMkJGlzRnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkdXRpbHMkJGlzTWF5YmVUaGVuYWJsZSh4KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHggPT09ICdvYmplY3QnICYmIHggIT09IG51bGw7XG4gICAgfVxuXG4gICAgdmFyICQkdXRpbHMkJF9pc0FycmF5O1xuXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KSB7XG4gICAgICAkJHV0aWxzJCRfaXNBcnJheSA9IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAkJHV0aWxzJCRfaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG4gICAgfVxuXG4gICAgdmFyICQkdXRpbHMkJGlzQXJyYXkgPSAkJHV0aWxzJCRfaXNBcnJheTtcbiAgICB2YXIgJCR1dGlscyQkbm93ID0gRGF0ZS5ub3cgfHwgZnVuY3Rpb24oKSB7IHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTsgfTtcbiAgICBmdW5jdGlvbiAkJHV0aWxzJCRGKCkgeyB9XG5cbiAgICB2YXIgJCR1dGlscyQkb19jcmVhdGUgPSAoT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbiAobykge1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU2Vjb25kIGFyZ3VtZW50IG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgbyAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhbiBvYmplY3QnKTtcbiAgICAgIH1cbiAgICAgICQkdXRpbHMkJEYucHJvdG90eXBlID0gbztcbiAgICAgIHJldHVybiBuZXcgJCR1dGlscyQkRigpO1xuICAgIH0pO1xuXG4gICAgdmFyICQkaW5zdHJ1bWVudCQkcXVldWUgPSBbXTtcblxuICAgIHZhciAkJGluc3RydW1lbnQkJGRlZmF1bHQgPSBmdW5jdGlvbiBpbnN0cnVtZW50KGV2ZW50TmFtZSwgcHJvbWlzZSwgY2hpbGQpIHtcbiAgICAgIGlmICgxID09PSAkJGluc3RydW1lbnQkJHF1ZXVlLnB1c2goe1xuICAgICAgICAgIG5hbWU6IGV2ZW50TmFtZSxcbiAgICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICBndWlkOiBwcm9taXNlLl9ndWlkS2V5ICsgcHJvbWlzZS5faWQsXG4gICAgICAgICAgICBldmVudE5hbWU6IGV2ZW50TmFtZSxcbiAgICAgICAgICAgIGRldGFpbDogcHJvbWlzZS5fcmVzdWx0LFxuICAgICAgICAgICAgY2hpbGRHdWlkOiBjaGlsZCAmJiBwcm9taXNlLl9ndWlkS2V5ICsgY2hpbGQuX2lkLFxuICAgICAgICAgICAgbGFiZWw6IHByb21pc2UuX2xhYmVsLFxuICAgICAgICAgICAgdGltZVN0YW1wOiAkJHV0aWxzJCRub3coKSxcbiAgICAgICAgICAgIHN0YWNrOiBuZXcgRXJyb3IocHJvbWlzZS5fbGFiZWwpLnN0YWNrXG4gICAgICAgICAgfX0pKSB7XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhciBlbnRyeTtcbiAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkJGluc3RydW1lbnQkJHF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZW50cnkgPSAkJGluc3RydW1lbnQkJHF1ZXVlW2ldO1xuICAgICAgICAgICAgICAgICQkcnN2cCRjb25maWckJGNvbmZpZy50cmlnZ2VyKGVudHJ5Lm5hbWUsIGVudHJ5LnBheWxvYWQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICQkaW5zdHJ1bWVudCQkcXVldWUubGVuZ3RoID0gMDtcbiAgICAgICAgICAgIH0sIDUwKTtcbiAgICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJG5vb3AoKSB7fVxuICAgIHZhciAkJCRpbnRlcm5hbCQkUEVORElORyAgID0gdm9pZCAwO1xuICAgIHZhciAkJCRpbnRlcm5hbCQkRlVMRklMTEVEID0gMTtcbiAgICB2YXIgJCQkaW50ZXJuYWwkJFJFSkVDVEVEICA9IDI7XG4gICAgdmFyICQkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUiA9IG5ldyAkJCRpbnRlcm5hbCQkRXJyb3JPYmplY3QoKTtcblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRnZXRUaGVuKHByb21pc2UpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBwcm9taXNlLnRoZW47XG4gICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICQkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUi5lcnJvciA9IGVycm9yO1xuICAgICAgICByZXR1cm4gJCQkaW50ZXJuYWwkJEdFVF9USEVOX0VSUk9SO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCR0cnlUaGVuKHRoZW4sIHZhbHVlLCBmdWxmaWxsbWVudEhhbmRsZXIsIHJlamVjdGlvbkhhbmRsZXIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoZW4uY2FsbCh2YWx1ZSwgZnVsZmlsbG1lbnRIYW5kbGVyLCByZWplY3Rpb25IYW5kbGVyKTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZXR1cm4gZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkaGFuZGxlRm9yZWlnblRoZW5hYmxlKHByb21pc2UsIHRoZW5hYmxlLCB0aGVuKSB7XG4gICAgICAkJHJzdnAkY29uZmlnJCRjb25maWcuYXN5bmMoZnVuY3Rpb24ocHJvbWlzZSkge1xuICAgICAgICB2YXIgc2VhbGVkID0gZmFsc2U7XG4gICAgICAgIHZhciBlcnJvciA9ICQkJGludGVybmFsJCR0cnlUaGVuKHRoZW4sIHRoZW5hYmxlLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGlmIChzZWFsZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgc2VhbGVkID0gdHJ1ZTtcbiAgICAgICAgICBpZiAodGhlbmFibGUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICAgIGlmIChzZWFsZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgc2VhbGVkID0gdHJ1ZTtcblxuICAgICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgICAgfSwgJ1NldHRsZTogJyArIChwcm9taXNlLl9sYWJlbCB8fCAnIHVua25vd24gcHJvbWlzZScpKTtcblxuICAgICAgICBpZiAoIXNlYWxlZCAmJiBlcnJvcikge1xuICAgICAgICAgIHNlYWxlZCA9IHRydWU7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH0sIHByb21pc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRoYW5kbGVPd25UaGVuYWJsZShwcm9taXNlLCB0aGVuYWJsZSkge1xuICAgICAgaWYgKHRoZW5hYmxlLl9zdGF0ZSA9PT0gJCQkaW50ZXJuYWwkJEZVTEZJTExFRCkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB0aGVuYWJsZS5fcmVzdWx0KTtcbiAgICAgIH0gZWxzZSBpZiAocHJvbWlzZS5fc3RhdGUgPT09ICQkJGludGVybmFsJCRSRUpFQ1RFRCkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHRoZW5hYmxlLl9yZXN1bHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHN1YnNjcmliZSh0aGVuYWJsZSwgdW5kZWZpbmVkLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGlmICh0aGVuYWJsZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICQkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkaGFuZGxlTWF5YmVUaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlKSB7XG4gICAgICBpZiAobWF5YmVUaGVuYWJsZS5jb25zdHJ1Y3RvciA9PT0gcHJvbWlzZS5jb25zdHJ1Y3Rvcikge1xuICAgICAgICAkJCRpbnRlcm5hbCQkaGFuZGxlT3duVGhlbmFibGUocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgdGhlbiA9ICQkJGludGVybmFsJCRnZXRUaGVuKG1heWJlVGhlbmFibGUpO1xuXG4gICAgICAgIGlmICh0aGVuID09PSAkJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IpIHtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsICQkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUi5lcnJvcik7XG4gICAgICAgIH0gZWxzZSBpZiAodGhlbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoJCR1dGlscyQkaXNGdW5jdGlvbih0aGVuKSkge1xuICAgICAgICAgICQkJGludGVybmFsJCRoYW5kbGVGb3JlaWduVGhlbmFibGUocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSwgdGhlbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSkge1xuICAgICAgaWYgKHByb21pc2UgPT09IHZhbHVlKSB7XG4gICAgICAgICQkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoJCR1dGlscyQkb2JqZWN0T3JGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJGhhbmRsZU1heWJlVGhlbmFibGUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRwdWJsaXNoUmVqZWN0aW9uKHByb21pc2UpIHtcbiAgICAgIGlmIChwcm9taXNlLl9vbmVycm9yKSB7XG4gICAgICAgIHByb21pc2UuX29uZXJyb3IocHJvbWlzZS5fcmVzdWx0KTtcbiAgICAgIH1cblxuICAgICAgJCQkaW50ZXJuYWwkJHB1Ymxpc2gocHJvbWlzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpIHtcbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gJCQkaW50ZXJuYWwkJFBFTkRJTkcpIHsgcmV0dXJuOyB9XG5cbiAgICAgIHByb21pc2UuX3Jlc3VsdCA9IHZhbHVlO1xuICAgICAgcHJvbWlzZS5fc3RhdGUgPSAkJCRpbnRlcm5hbCQkRlVMRklMTEVEO1xuXG4gICAgICBpZiAocHJvbWlzZS5fc3Vic2NyaWJlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGlmICgkJHJzdnAkY29uZmlnJCRjb25maWcuaW5zdHJ1bWVudCkge1xuICAgICAgICAgICQkaW5zdHJ1bWVudCQkZGVmYXVsdCgnZnVsZmlsbGVkJywgcHJvbWlzZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQkcnN2cCRjb25maWckJGNvbmZpZy5hc3luYygkJCRpbnRlcm5hbCQkcHVibGlzaCwgcHJvbWlzZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pIHtcbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gJCQkaW50ZXJuYWwkJFBFTkRJTkcpIHsgcmV0dXJuOyB9XG4gICAgICBwcm9taXNlLl9zdGF0ZSA9ICQkJGludGVybmFsJCRSRUpFQ1RFRDtcbiAgICAgIHByb21pc2UuX3Jlc3VsdCA9IHJlYXNvbjtcblxuICAgICAgJCRyc3ZwJGNvbmZpZyQkY29uZmlnLmFzeW5jKCQkJGludGVybmFsJCRwdWJsaXNoUmVqZWN0aW9uLCBwcm9taXNlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkc3Vic2NyaWJlKHBhcmVudCwgY2hpbGQsIG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKSB7XG4gICAgICB2YXIgc3Vic2NyaWJlcnMgPSBwYXJlbnQuX3N1YnNjcmliZXJzO1xuICAgICAgdmFyIGxlbmd0aCA9IHN1YnNjcmliZXJzLmxlbmd0aDtcblxuICAgICAgcGFyZW50Ll9vbmVycm9yID0gbnVsbDtcblxuICAgICAgc3Vic2NyaWJlcnNbbGVuZ3RoXSA9IGNoaWxkO1xuICAgICAgc3Vic2NyaWJlcnNbbGVuZ3RoICsgJCQkaW50ZXJuYWwkJEZVTEZJTExFRF0gPSBvbkZ1bGZpbGxtZW50O1xuICAgICAgc3Vic2NyaWJlcnNbbGVuZ3RoICsgJCQkaW50ZXJuYWwkJFJFSkVDVEVEXSAgPSBvblJlamVjdGlvbjtcblxuICAgICAgaWYgKGxlbmd0aCA9PT0gMCAmJiBwYXJlbnQuX3N0YXRlKSB7XG4gICAgICAgICQkcnN2cCRjb25maWckJGNvbmZpZy5hc3luYygkJCRpbnRlcm5hbCQkcHVibGlzaCwgcGFyZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkcHVibGlzaChwcm9taXNlKSB7XG4gICAgICB2YXIgc3Vic2NyaWJlcnMgPSBwcm9taXNlLl9zdWJzY3JpYmVycztcbiAgICAgIHZhciBzZXR0bGVkID0gcHJvbWlzZS5fc3RhdGU7XG5cbiAgICAgIGlmICgkJHJzdnAkY29uZmlnJCRjb25maWcuaW5zdHJ1bWVudCkge1xuICAgICAgICAkJGluc3RydW1lbnQkJGRlZmF1bHQoc2V0dGxlZCA9PT0gJCQkaW50ZXJuYWwkJEZVTEZJTExFRCA/ICdmdWxmaWxsZWQnIDogJ3JlamVjdGVkJywgcHJvbWlzZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdWJzY3JpYmVycy5sZW5ndGggPT09IDApIHsgcmV0dXJuOyB9XG5cbiAgICAgIHZhciBjaGlsZCwgY2FsbGJhY2ssIGRldGFpbCA9IHByb21pc2UuX3Jlc3VsdDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdWJzY3JpYmVycy5sZW5ndGg7IGkgKz0gMykge1xuICAgICAgICBjaGlsZCA9IHN1YnNjcmliZXJzW2ldO1xuICAgICAgICBjYWxsYmFjayA9IHN1YnNjcmliZXJzW2kgKyBzZXR0bGVkXTtcblxuICAgICAgICBpZiAoY2hpbGQpIHtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkaW52b2tlQ2FsbGJhY2soc2V0dGxlZCwgY2hpbGQsIGNhbGxiYWNrLCBkZXRhaWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNhbGxiYWNrKGRldGFpbCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcHJvbWlzZS5fc3Vic2NyaWJlcnMubGVuZ3RoID0gMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkRXJyb3JPYmplY3QoKSB7XG4gICAgICB0aGlzLmVycm9yID0gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgJCQkaW50ZXJuYWwkJFRSWV9DQVRDSF9FUlJPUiA9IG5ldyAkJCRpbnRlcm5hbCQkRXJyb3JPYmplY3QoKTtcblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCR0cnlDYXRjaChjYWxsYmFjaywgZGV0YWlsKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soZGV0YWlsKTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SLmVycm9yID0gZTtcbiAgICAgICAgcmV0dXJuICQkJGludGVybmFsJCRUUllfQ0FUQ0hfRVJST1I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJGludm9rZUNhbGxiYWNrKHNldHRsZWQsIHByb21pc2UsIGNhbGxiYWNrLCBkZXRhaWwpIHtcbiAgICAgIHZhciBoYXNDYWxsYmFjayA9ICQkdXRpbHMkJGlzRnVuY3Rpb24oY2FsbGJhY2spLFxuICAgICAgICAgIHZhbHVlLCBlcnJvciwgc3VjY2VlZGVkLCBmYWlsZWQ7XG5cbiAgICAgIGlmIChoYXNDYWxsYmFjaykge1xuICAgICAgICB2YWx1ZSA9ICQkJGludGVybmFsJCR0cnlDYXRjaChjYWxsYmFjaywgZGV0YWlsKTtcblxuICAgICAgICBpZiAodmFsdWUgPT09ICQkJGludGVybmFsJCRUUllfQ0FUQ0hfRVJST1IpIHtcbiAgICAgICAgICBmYWlsZWQgPSB0cnVlO1xuICAgICAgICAgIGVycm9yID0gdmFsdWUuZXJyb3I7XG4gICAgICAgICAgdmFsdWUgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN1Y2NlZWRlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvbWlzZSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIG5ldyBUeXBlRXJyb3IoJ0EgcHJvbWlzZXMgY2FsbGJhY2sgY2Fubm90IHJldHVybiB0aGF0IHNhbWUgcHJvbWlzZS4nKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gZGV0YWlsO1xuICAgICAgICBzdWNjZWVkZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAocHJvbWlzZS5fc3RhdGUgIT09ICQkJGludGVybmFsJCRQRU5ESU5HKSB7XG4gICAgICAgIC8vIG5vb3BcbiAgICAgIH0gZWxzZSBpZiAoaGFzQ2FsbGJhY2sgJiYgc3VjY2VlZGVkKSB7XG4gICAgICAgICQkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoZmFpbGVkKSB7XG4gICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgZXJyb3IpO1xuICAgICAgfSBlbHNlIGlmIChzZXR0bGVkID09PSAkJCRpbnRlcm5hbCQkRlVMRklMTEVEKSB7XG4gICAgICAgICQkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoc2V0dGxlZCA9PT0gJCQkaW50ZXJuYWwkJFJFSkVDVEVEKSB7XG4gICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRpbml0aWFsaXplUHJvbWlzZShwcm9taXNlLCByZXNvbHZlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzb2x2ZXIoZnVuY3Rpb24gcmVzb2x2ZVByb21pc2UodmFsdWUpe1xuICAgICAgICAgICQkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gcmVqZWN0UHJvbWlzZShyZWFzb24pIHtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRlbnVtZXJhdG9yJCRtYWtlU2V0dGxlZFJlc3VsdChzdGF0ZSwgcG9zaXRpb24sIHZhbHVlKSB7XG4gICAgICBpZiAoc3RhdGUgPT09ICQkJGludGVybmFsJCRGVUxGSUxMRUQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdGF0ZTogJ2Z1bGZpbGxlZCcsXG4gICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN0YXRlOiAncmVqZWN0ZWQnLFxuICAgICAgICAgIHJlYXNvbjogdmFsdWVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJGVudW1lcmF0b3IkJEVudW1lcmF0b3IoQ29uc3RydWN0b3IsIGlucHV0LCBhYm9ydE9uUmVqZWN0LCBsYWJlbCkge1xuICAgICAgdGhpcy5faW5zdGFuY2VDb25zdHJ1Y3RvciA9IENvbnN0cnVjdG9yO1xuICAgICAgdGhpcy5wcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKCQkJGludGVybmFsJCRub29wLCBsYWJlbCk7XG4gICAgICB0aGlzLl9hYm9ydE9uUmVqZWN0ID0gYWJvcnRPblJlamVjdDtcblxuICAgICAgaWYgKHRoaXMuX3ZhbGlkYXRlSW5wdXQoaW5wdXQpKSB7XG4gICAgICAgIHRoaXMuX2lucHV0ICAgICA9IGlucHV0O1xuICAgICAgICB0aGlzLmxlbmd0aCAgICAgPSBpbnB1dC5sZW5ndGg7XG4gICAgICAgIHRoaXMuX3JlbWFpbmluZyA9IGlucHV0Lmxlbmd0aDtcblxuICAgICAgICB0aGlzLl9pbml0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJGZ1bGZpbGwodGhpcy5wcm9taXNlLCB0aGlzLl9yZXN1bHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMubGVuZ3RoID0gdGhpcy5sZW5ndGggfHwgMDtcbiAgICAgICAgICB0aGlzLl9lbnVtZXJhdGUoKTtcbiAgICAgICAgICBpZiAodGhpcy5fcmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgICAgICAkJCRpbnRlcm5hbCQkZnVsZmlsbCh0aGlzLnByb21pc2UsIHRoaXMuX3Jlc3VsdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHRoaXMucHJvbWlzZSwgdGhpcy5fdmFsaWRhdGlvbkVycm9yKCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgICQkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX3ZhbGlkYXRlSW5wdXQgPSBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgcmV0dXJuICQkdXRpbHMkJGlzQXJyYXkoaW5wdXQpO1xuICAgIH07XG5cbiAgICAkJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl92YWxpZGF0aW9uRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRXJyb3IoJ0FycmF5IE1ldGhvZHMgbXVzdCBiZSBwcm92aWRlZCBhbiBBcnJheScpO1xuICAgIH07XG5cbiAgICAkJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9yZXN1bHQgPSBuZXcgQXJyYXkodGhpcy5sZW5ndGgpO1xuICAgIH07XG5cbiAgICB2YXIgJCRlbnVtZXJhdG9yJCRkZWZhdWx0ID0gJCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yO1xuXG4gICAgJCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fZW51bWVyYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGVuZ3RoICA9IHRoaXMubGVuZ3RoO1xuICAgICAgdmFyIHByb21pc2UgPSB0aGlzLnByb21pc2U7XG4gICAgICB2YXIgaW5wdXQgICA9IHRoaXMuX2lucHV0O1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgcHJvbWlzZS5fc3RhdGUgPT09ICQkJGludGVybmFsJCRQRU5ESU5HICYmIGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLl9lYWNoRW50cnkoaW5wdXRbaV0sIGkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAkJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl9lYWNoRW50cnkgPSBmdW5jdGlvbihlbnRyeSwgaSkge1xuICAgICAgdmFyIGMgPSB0aGlzLl9pbnN0YW5jZUNvbnN0cnVjdG9yO1xuICAgICAgaWYgKCQkdXRpbHMkJGlzTWF5YmVUaGVuYWJsZShlbnRyeSkpIHtcbiAgICAgICAgaWYgKGVudHJ5LmNvbnN0cnVjdG9yID09PSBjICYmIGVudHJ5Ll9zdGF0ZSAhPT0gJCQkaW50ZXJuYWwkJFBFTkRJTkcpIHtcbiAgICAgICAgICBlbnRyeS5fb25lcnJvciA9IG51bGw7XG4gICAgICAgICAgdGhpcy5fc2V0dGxlZEF0KGVudHJ5Ll9zdGF0ZSwgaSwgZW50cnkuX3Jlc3VsdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fd2lsbFNldHRsZUF0KGMucmVzb2x2ZShlbnRyeSksIGkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9yZW1haW5pbmctLTtcbiAgICAgICAgdGhpcy5fcmVzdWx0W2ldID0gdGhpcy5fbWFrZVJlc3VsdCgkJCRpbnRlcm5hbCQkRlVMRklMTEVELCBpLCBlbnRyeSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgICQkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX3NldHRsZWRBdCA9IGZ1bmN0aW9uKHN0YXRlLCBpLCB2YWx1ZSkge1xuICAgICAgdmFyIHByb21pc2UgPSB0aGlzLnByb21pc2U7XG5cbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSA9PT0gJCQkaW50ZXJuYWwkJFBFTkRJTkcpIHtcbiAgICAgICAgdGhpcy5fcmVtYWluaW5nLS07XG5cbiAgICAgICAgaWYgKHRoaXMuX2Fib3J0T25SZWplY3QgJiYgc3RhdGUgPT09ICQkJGludGVybmFsJCRSRUpFQ1RFRCkge1xuICAgICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3Jlc3VsdFtpXSA9IHRoaXMuX21ha2VSZXN1bHQoc3RhdGUsIGksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fcmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgICQkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHRoaXMuX3Jlc3VsdCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgICQkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX21ha2VSZXN1bHQgPSBmdW5jdGlvbihzdGF0ZSwgaSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuXG4gICAgJCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fd2lsbFNldHRsZUF0ID0gZnVuY3Rpb24ocHJvbWlzZSwgaSkge1xuICAgICAgdmFyIGVudW1lcmF0b3IgPSB0aGlzO1xuXG4gICAgICAkJCRpbnRlcm5hbCQkc3Vic2NyaWJlKHByb21pc2UsIHVuZGVmaW5lZCwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgZW51bWVyYXRvci5fc2V0dGxlZEF0KCQkJGludGVybmFsJCRGVUxGSUxMRUQsIGksIHZhbHVlKTtcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICBlbnVtZXJhdG9yLl9zZXR0bGVkQXQoJCQkaW50ZXJuYWwkJFJFSkVDVEVELCBpLCByZWFzb24pO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHZhciAkJHByb21pc2UkYWxsJCRkZWZhdWx0ID0gZnVuY3Rpb24gYWxsKGVudHJpZXMsIGxhYmVsKSB7XG4gICAgICByZXR1cm4gbmV3ICQkZW51bWVyYXRvciQkZGVmYXVsdCh0aGlzLCBlbnRyaWVzLCB0cnVlIC8qIGFib3J0IG9uIHJlamVjdCAqLywgbGFiZWwpLnByb21pc2U7XG4gICAgfTtcblxuICAgIHZhciAkJHByb21pc2UkcmFjZSQkZGVmYXVsdCA9IGZ1bmN0aW9uIHJhY2UoZW50cmllcywgbGFiZWwpIHtcbiAgICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gICAgICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuXG4gICAgICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcigkJCRpbnRlcm5hbCQkbm9vcCwgbGFiZWwpO1xuXG4gICAgICBpZiAoISQkdXRpbHMkJGlzQXJyYXkoZW50cmllcykpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBuZXcgVHlwZUVycm9yKCdZb3UgbXVzdCBwYXNzIGFuIGFycmF5IHRvIHJhY2UuJykpO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgIH1cblxuICAgICAgdmFyIGxlbmd0aCA9IGVudHJpZXMubGVuZ3RoO1xuXG4gICAgICBmdW5jdGlvbiBvbkZ1bGZpbGxtZW50KHZhbHVlKSB7XG4gICAgICAgICQkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gb25SZWplY3Rpb24ocmVhc29uKSB7XG4gICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IHByb21pc2UuX3N0YXRlID09PSAkJCRpbnRlcm5hbCQkUEVORElORyAmJiBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHN1YnNjcmliZShDb25zdHJ1Y3Rvci5yZXNvbHZlKGVudHJpZXNbaV0pLCB1bmRlZmluZWQsIG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfTtcblxuICAgIHZhciAkJHByb21pc2UkcmVzb2x2ZSQkZGVmYXVsdCA9IGZ1bmN0aW9uIHJlc29sdmUob2JqZWN0LCBsYWJlbCkge1xuICAgICAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgICAgIHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG5cbiAgICAgIGlmIChvYmplY3QgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcgJiYgb2JqZWN0LmNvbnN0cnVjdG9yID09PSBDb25zdHJ1Y3Rvcikge1xuICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgICAgfVxuXG4gICAgICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcigkJCRpbnRlcm5hbCQkbm9vcCwgbGFiZWwpO1xuICAgICAgJCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgb2JqZWN0KTtcbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH07XG5cbiAgICB2YXIgJCRwcm9taXNlJHJlamVjdCQkZGVmYXVsdCA9IGZ1bmN0aW9uIHJlamVjdChyZWFzb24sIGxhYmVsKSB7XG4gICAgICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICAgICAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcbiAgICAgIHZhciBwcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKCQkJGludGVybmFsJCRub29wLCBsYWJlbCk7XG4gICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9O1xuXG4gICAgdmFyICQkcnN2cCRwcm9taXNlJCRndWlkS2V5ID0gJ3JzdnBfJyArICQkdXRpbHMkJG5vdygpICsgJy0nO1xuICAgIHZhciAkJHJzdnAkcHJvbWlzZSQkY291bnRlciA9IDA7XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkcHJvbWlzZSQkbmVlZHNSZXNvbHZlcigpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1lvdSBtdXN0IHBhc3MgYSByZXNvbHZlciBmdW5jdGlvbiBhcyB0aGUgZmlyc3QgYXJndW1lbnQgdG8gdGhlIHByb21pc2UgY29uc3RydWN0b3InKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkcHJvbWlzZSQkbmVlZHNOZXcoKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmFpbGVkIHRvIGNvbnN0cnVjdCAnUHJvbWlzZSc6IFBsZWFzZSB1c2UgdGhlICduZXcnIG9wZXJhdG9yLCB0aGlzIG9iamVjdCBjb25zdHJ1Y3RvciBjYW5ub3QgYmUgY2FsbGVkIGFzIGEgZnVuY3Rpb24uXCIpO1xuICAgIH1cblxuICAgIHZhciAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdCA9ICQkcnN2cCRwcm9taXNlJCRQcm9taXNlO1xuXG4gICAgLyoqXG4gICAgICBQcm9taXNlIG9iamVjdHMgcmVwcmVzZW50IHRoZSBldmVudHVhbCByZXN1bHQgb2YgYW4gYXN5bmNocm9ub3VzIG9wZXJhdGlvbi4gVGhlXG4gICAgICBwcmltYXJ5IHdheSBvZiBpbnRlcmFjdGluZyB3aXRoIGEgcHJvbWlzZSBpcyB0aHJvdWdoIGl0cyBgdGhlbmAgbWV0aG9kLCB3aGljaFxuICAgICAgcmVnaXN0ZXJzIGNhbGxiYWNrcyB0byByZWNlaXZlIGVpdGhlciBhIHByb21pc2XigJlzIGV2ZW50dWFsIHZhbHVlIG9yIHRoZSByZWFzb25cbiAgICAgIHdoeSB0aGUgcHJvbWlzZSBjYW5ub3QgYmUgZnVsZmlsbGVkLlxuXG4gICAgICBUZXJtaW5vbG9neVxuICAgICAgLS0tLS0tLS0tLS1cblxuICAgICAgLSBgcHJvbWlzZWAgaXMgYW4gb2JqZWN0IG9yIGZ1bmN0aW9uIHdpdGggYSBgdGhlbmAgbWV0aG9kIHdob3NlIGJlaGF2aW9yIGNvbmZvcm1zIHRvIHRoaXMgc3BlY2lmaWNhdGlvbi5cbiAgICAgIC0gYHRoZW5hYmxlYCBpcyBhbiBvYmplY3Qgb3IgZnVuY3Rpb24gdGhhdCBkZWZpbmVzIGEgYHRoZW5gIG1ldGhvZC5cbiAgICAgIC0gYHZhbHVlYCBpcyBhbnkgbGVnYWwgSmF2YVNjcmlwdCB2YWx1ZSAoaW5jbHVkaW5nIHVuZGVmaW5lZCwgYSB0aGVuYWJsZSwgb3IgYSBwcm9taXNlKS5cbiAgICAgIC0gYGV4Y2VwdGlvbmAgaXMgYSB2YWx1ZSB0aGF0IGlzIHRocm93biB1c2luZyB0aGUgdGhyb3cgc3RhdGVtZW50LlxuICAgICAgLSBgcmVhc29uYCBpcyBhIHZhbHVlIHRoYXQgaW5kaWNhdGVzIHdoeSBhIHByb21pc2Ugd2FzIHJlamVjdGVkLlxuICAgICAgLSBgc2V0dGxlZGAgdGhlIGZpbmFsIHJlc3Rpbmcgc3RhdGUgb2YgYSBwcm9taXNlLCBmdWxmaWxsZWQgb3IgcmVqZWN0ZWQuXG5cbiAgICAgIEEgcHJvbWlzZSBjYW4gYmUgaW4gb25lIG9mIHRocmVlIHN0YXRlczogcGVuZGluZywgZnVsZmlsbGVkLCBvciByZWplY3RlZC5cblxuICAgICAgUHJvbWlzZXMgdGhhdCBhcmUgZnVsZmlsbGVkIGhhdmUgYSBmdWxmaWxsbWVudCB2YWx1ZSBhbmQgYXJlIGluIHRoZSBmdWxmaWxsZWRcbiAgICAgIHN0YXRlLiAgUHJvbWlzZXMgdGhhdCBhcmUgcmVqZWN0ZWQgaGF2ZSBhIHJlamVjdGlvbiByZWFzb24gYW5kIGFyZSBpbiB0aGVcbiAgICAgIHJlamVjdGVkIHN0YXRlLiAgQSBmdWxmaWxsbWVudCB2YWx1ZSBpcyBuZXZlciBhIHRoZW5hYmxlLlxuXG4gICAgICBQcm9taXNlcyBjYW4gYWxzbyBiZSBzYWlkIHRvICpyZXNvbHZlKiBhIHZhbHVlLiAgSWYgdGhpcyB2YWx1ZSBpcyBhbHNvIGFcbiAgICAgIHByb21pc2UsIHRoZW4gdGhlIG9yaWdpbmFsIHByb21pc2UncyBzZXR0bGVkIHN0YXRlIHdpbGwgbWF0Y2ggdGhlIHZhbHVlJ3NcbiAgICAgIHNldHRsZWQgc3RhdGUuICBTbyBhIHByb21pc2UgdGhhdCAqcmVzb2x2ZXMqIGEgcHJvbWlzZSB0aGF0IHJlamVjdHMgd2lsbFxuICAgICAgaXRzZWxmIHJlamVjdCwgYW5kIGEgcHJvbWlzZSB0aGF0ICpyZXNvbHZlcyogYSBwcm9taXNlIHRoYXQgZnVsZmlsbHMgd2lsbFxuICAgICAgaXRzZWxmIGZ1bGZpbGwuXG5cblxuICAgICAgQmFzaWMgVXNhZ2U6XG4gICAgICAtLS0tLS0tLS0tLS1cblxuICAgICAgYGBganNcbiAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIC8vIG9uIHN1Y2Nlc3NcbiAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG5cbiAgICAgICAgLy8gb24gZmFpbHVyZVxuICAgICAgICByZWplY3QocmVhc29uKTtcbiAgICAgIH0pO1xuXG4gICAgICBwcm9taXNlLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgLy8gb24gZnVsZmlsbG1lbnRcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICAvLyBvbiByZWplY3Rpb25cbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEFkdmFuY2VkIFVzYWdlOlxuICAgICAgLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAgIFByb21pc2VzIHNoaW5lIHdoZW4gYWJzdHJhY3RpbmcgYXdheSBhc3luY2hyb25vdXMgaW50ZXJhY3Rpb25zIHN1Y2ggYXNcbiAgICAgIGBYTUxIdHRwUmVxdWVzdGBzLlxuXG4gICAgICBgYGBqc1xuICAgICAgZnVuY3Rpb24gZ2V0SlNPTih1cmwpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICAgICAgeGhyLm9wZW4oJ0dFVCcsIHVybCk7XG4gICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGhhbmRsZXI7XG4gICAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdqc29uJztcbiAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICB4aHIuc2VuZCgpO1xuXG4gICAgICAgICAgZnVuY3Rpb24gaGFuZGxlcigpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IHRoaXMuRE9ORSkge1xuICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUodGhpcy5yZXNwb25zZSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignZ2V0SlNPTjogYCcgKyB1cmwgKyAnYCBmYWlsZWQgd2l0aCBzdGF0dXM6IFsnICsgdGhpcy5zdGF0dXMgKyAnXScpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBnZXRKU09OKCcvcG9zdHMuanNvbicpLnRoZW4oZnVuY3Rpb24oanNvbikge1xuICAgICAgICAvLyBvbiBmdWxmaWxsbWVudFxuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgIC8vIG9uIHJlamVjdGlvblxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgVW5saWtlIGNhbGxiYWNrcywgcHJvbWlzZXMgYXJlIGdyZWF0IGNvbXBvc2FibGUgcHJpbWl0aXZlcy5cblxuICAgICAgYGBganNcbiAgICAgIFByb21pc2UuYWxsKFtcbiAgICAgICAgZ2V0SlNPTignL3Bvc3RzJyksXG4gICAgICAgIGdldEpTT04oJy9jb21tZW50cycpXG4gICAgICBdKS50aGVuKGZ1bmN0aW9uKHZhbHVlcyl7XG4gICAgICAgIHZhbHVlc1swXSAvLyA9PiBwb3N0c0pTT05cbiAgICAgICAgdmFsdWVzWzFdIC8vID0+IGNvbW1lbnRzSlNPTlxuXG4gICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBAY2xhc3MgUlNWUC5Qcm9taXNlXG4gICAgICBAcGFyYW0ge2Z1bmN0aW9ufSByZXNvbHZlclxuICAgICAgQHBhcmFtIHtTdHJpbmd9IGxhYmVsIG9wdGlvbmFsIHN0cmluZyBmb3IgbGFiZWxpbmcgdGhlIHByb21pc2UuXG4gICAgICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gICAgICBAY29uc3RydWN0b3JcbiAgICAqL1xuICAgIGZ1bmN0aW9uICQkcnN2cCRwcm9taXNlJCRQcm9taXNlKHJlc29sdmVyLCBsYWJlbCkge1xuICAgICAgdGhpcy5faWQgPSAkJHJzdnAkcHJvbWlzZSQkY291bnRlcisrO1xuICAgICAgdGhpcy5fbGFiZWwgPSBsYWJlbDtcbiAgICAgIHRoaXMuX3N0YXRlID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5fcmVzdWx0ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5fc3Vic2NyaWJlcnMgPSBbXTtcblxuICAgICAgaWYgKCQkcnN2cCRjb25maWckJGNvbmZpZy5pbnN0cnVtZW50KSB7XG4gICAgICAgICQkaW5zdHJ1bWVudCQkZGVmYXVsdCgnY3JlYXRlZCcsIHRoaXMpO1xuICAgICAgfVxuXG4gICAgICBpZiAoJCQkaW50ZXJuYWwkJG5vb3AgIT09IHJlc29sdmVyKSB7XG4gICAgICAgIGlmICghJCR1dGlscyQkaXNGdW5jdGlvbihyZXNvbHZlcikpIHtcbiAgICAgICAgICAkJHJzdnAkcHJvbWlzZSQkbmVlZHNSZXNvbHZlcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mICQkcnN2cCRwcm9taXNlJCRQcm9taXNlKSkge1xuICAgICAgICAgICQkcnN2cCRwcm9taXNlJCRuZWVkc05ldygpO1xuICAgICAgICB9XG5cbiAgICAgICAgJCQkaW50ZXJuYWwkJGluaXRpYWxpemVQcm9taXNlKHRoaXMsIHJlc29sdmVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBkZXByZWNhdGVkXG4gICAgJCRyc3ZwJHByb21pc2UkJFByb21pc2UuY2FzdCA9ICQkcHJvbWlzZSRyZXNvbHZlJCRkZWZhdWx0O1xuXG4gICAgJCRyc3ZwJHByb21pc2UkJFByb21pc2UuYWxsID0gJCRwcm9taXNlJGFsbCQkZGVmYXVsdDtcbiAgICAkJHJzdnAkcHJvbWlzZSQkUHJvbWlzZS5yYWNlID0gJCRwcm9taXNlJHJhY2UkJGRlZmF1bHQ7XG4gICAgJCRyc3ZwJHByb21pc2UkJFByb21pc2UucmVzb2x2ZSA9ICQkcHJvbWlzZSRyZXNvbHZlJCRkZWZhdWx0O1xuICAgICQkcnN2cCRwcm9taXNlJCRQcm9taXNlLnJlamVjdCA9ICQkcHJvbWlzZSRyZWplY3QkJGRlZmF1bHQ7XG5cbiAgICAkJHJzdnAkcHJvbWlzZSQkUHJvbWlzZS5wcm90b3R5cGUgPSB7XG4gICAgICBjb25zdHJ1Y3RvcjogJCRyc3ZwJHByb21pc2UkJFByb21pc2UsXG5cbiAgICAgIF9ndWlkS2V5OiAkJHJzdnAkcHJvbWlzZSQkZ3VpZEtleSxcblxuICAgICAgX29uZXJyb3I6IGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgJCRyc3ZwJGNvbmZpZyQkY29uZmlnLnRyaWdnZXIoJ2Vycm9yJywgcmVhc29uKTtcbiAgICAgIH0sXG5cbiAgICAvKipcbiAgICAgIFRoZSBwcmltYXJ5IHdheSBvZiBpbnRlcmFjdGluZyB3aXRoIGEgcHJvbWlzZSBpcyB0aHJvdWdoIGl0cyBgdGhlbmAgbWV0aG9kLFxuICAgICAgd2hpY2ggcmVnaXN0ZXJzIGNhbGxiYWNrcyB0byByZWNlaXZlIGVpdGhlciBhIHByb21pc2UncyBldmVudHVhbCB2YWx1ZSBvciB0aGVcbiAgICAgIHJlYXNvbiB3aHkgdGhlIHByb21pc2UgY2Fubm90IGJlIGZ1bGZpbGxlZC5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgLy8gdXNlciBpcyBhdmFpbGFibGVcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAgIC8vIHVzZXIgaXMgdW5hdmFpbGFibGUsIGFuZCB5b3UgYXJlIGdpdmVuIHRoZSByZWFzb24gd2h5XG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBDaGFpbmluZ1xuICAgICAgLS0tLS0tLS1cblxuICAgICAgVGhlIHJldHVybiB2YWx1ZSBvZiBgdGhlbmAgaXMgaXRzZWxmIGEgcHJvbWlzZS4gIFRoaXMgc2Vjb25kLCAnZG93bnN0cmVhbSdcbiAgICAgIHByb21pc2UgaXMgcmVzb2x2ZWQgd2l0aCB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmaXJzdCBwcm9taXNlJ3MgZnVsZmlsbG1lbnRcbiAgICAgIG9yIHJlamVjdGlvbiBoYW5kbGVyLCBvciByZWplY3RlZCBpZiB0aGUgaGFuZGxlciB0aHJvd3MgYW4gZXhjZXB0aW9uLlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHJldHVybiB1c2VyLm5hbWU7XG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIHJldHVybiAnZGVmYXVsdCBuYW1lJztcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHVzZXJOYW1lKSB7XG4gICAgICAgIC8vIElmIGBmaW5kVXNlcmAgZnVsZmlsbGVkLCBgdXNlck5hbWVgIHdpbGwgYmUgdGhlIHVzZXIncyBuYW1lLCBvdGhlcndpc2UgaXRcbiAgICAgICAgLy8gd2lsbCBiZSBgJ2RlZmF1bHQgbmFtZSdgXG4gICAgICB9KTtcblxuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRm91bmQgdXNlciwgYnV0IHN0aWxsIHVuaGFwcHknKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdgZmluZFVzZXJgIHJlamVjdGVkIGFuZCB3ZSdyZSB1bmhhcHB5Jyk7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyBuZXZlciByZWFjaGVkXG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vIGlmIGBmaW5kVXNlcmAgZnVsZmlsbGVkLCBgcmVhc29uYCB3aWxsIGJlICdGb3VuZCB1c2VyLCBidXQgc3RpbGwgdW5oYXBweScuXG4gICAgICAgIC8vIElmIGBmaW5kVXNlcmAgcmVqZWN0ZWQsIGByZWFzb25gIHdpbGwgYmUgJ2BmaW5kVXNlcmAgcmVqZWN0ZWQgYW5kIHdlJ3JlIHVuaGFwcHknLlxuICAgICAgfSk7XG4gICAgICBgYGBcbiAgICAgIElmIHRoZSBkb3duc3RyZWFtIHByb21pc2UgZG9lcyBub3Qgc3BlY2lmeSBhIHJlamVjdGlvbiBoYW5kbGVyLCByZWplY3Rpb24gcmVhc29ucyB3aWxsIGJlIHByb3BhZ2F0ZWQgZnVydGhlciBkb3duc3RyZWFtLlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHRocm93IG5ldyBQZWRhZ29naWNhbEV4Y2VwdGlvbignVXBzdHJlYW0gZXJyb3InKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgLy8gVGhlIGBQZWRnYWdvY2lhbEV4Y2VwdGlvbmAgaXMgcHJvcGFnYXRlZCBhbGwgdGhlIHdheSBkb3duIHRvIGhlcmVcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEFzc2ltaWxhdGlvblxuICAgICAgLS0tLS0tLS0tLS0tXG5cbiAgICAgIFNvbWV0aW1lcyB0aGUgdmFsdWUgeW91IHdhbnQgdG8gcHJvcGFnYXRlIHRvIGEgZG93bnN0cmVhbSBwcm9taXNlIGNhbiBvbmx5IGJlXG4gICAgICByZXRyaWV2ZWQgYXN5bmNocm9ub3VzbHkuIFRoaXMgY2FuIGJlIGFjaGlldmVkIGJ5IHJldHVybmluZyBhIHByb21pc2UgaW4gdGhlXG4gICAgICBmdWxmaWxsbWVudCBvciByZWplY3Rpb24gaGFuZGxlci4gVGhlIGRvd25zdHJlYW0gcHJvbWlzZSB3aWxsIHRoZW4gYmUgcGVuZGluZ1xuICAgICAgdW50aWwgdGhlIHJldHVybmVkIHByb21pc2UgaXMgc2V0dGxlZC4gVGhpcyBpcyBjYWxsZWQgKmFzc2ltaWxhdGlvbiouXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgcmV0dXJuIGZpbmRDb21tZW50c0J5QXV0aG9yKHVzZXIpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAoY29tbWVudHMpIHtcbiAgICAgICAgLy8gVGhlIHVzZXIncyBjb21tZW50cyBhcmUgbm93IGF2YWlsYWJsZVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgSWYgdGhlIGFzc2ltbGlhdGVkIHByb21pc2UgcmVqZWN0cywgdGhlbiB0aGUgZG93bnN0cmVhbSBwcm9taXNlIHdpbGwgYWxzbyByZWplY3QuXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgcmV0dXJuIGZpbmRDb21tZW50c0J5QXV0aG9yKHVzZXIpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAoY29tbWVudHMpIHtcbiAgICAgICAgLy8gSWYgYGZpbmRDb21tZW50c0J5QXV0aG9yYCBmdWxmaWxscywgd2UnbGwgaGF2ZSB0aGUgdmFsdWUgaGVyZVxuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAvLyBJZiBgZmluZENvbW1lbnRzQnlBdXRob3JgIHJlamVjdHMsIHdlJ2xsIGhhdmUgdGhlIHJlYXNvbiBoZXJlXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBTaW1wbGUgRXhhbXBsZVxuICAgICAgLS0tLS0tLS0tLS0tLS1cblxuICAgICAgU3luY2hyb25vdXMgRXhhbXBsZVxuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICB0cnkge1xuICAgICAgICByZXN1bHQgPSBmaW5kUmVzdWx0KCk7XG4gICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgIC8vIGZhaWx1cmVcbiAgICAgIH1cbiAgICAgIGBgYFxuXG4gICAgICBFcnJiYWNrIEV4YW1wbGVcblxuICAgICAgYGBganNcbiAgICAgIGZpbmRSZXN1bHQoZnVuY3Rpb24ocmVzdWx0LCBlcnIpe1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgUHJvbWlzZSBFeGFtcGxlO1xuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICBmaW5kUmVzdWx0KCkudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuICAgICAgICAvLyBzdWNjZXNzXG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICAvLyBmYWlsdXJlXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBBZHZhbmNlZCBFeGFtcGxlXG4gICAgICAtLS0tLS0tLS0tLS0tLVxuXG4gICAgICBTeW5jaHJvbm91cyBFeGFtcGxlXG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIHZhciBhdXRob3IsIGJvb2tzO1xuXG4gICAgICB0cnkge1xuICAgICAgICBhdXRob3IgPSBmaW5kQXV0aG9yKCk7XG4gICAgICAgIGJvb2tzICA9IGZpbmRCb29rc0J5QXV0aG9yKGF1dGhvcik7XG4gICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgIC8vIGZhaWx1cmVcbiAgICAgIH1cbiAgICAgIGBgYFxuXG4gICAgICBFcnJiYWNrIEV4YW1wbGVcblxuICAgICAgYGBganNcblxuICAgICAgZnVuY3Rpb24gZm91bmRCb29rcyhib29rcykge1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGZhaWx1cmUocmVhc29uKSB7XG5cbiAgICAgIH1cblxuICAgICAgZmluZEF1dGhvcihmdW5jdGlvbihhdXRob3IsIGVycil7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmaW5kQm9vb2tzQnlBdXRob3IoYXV0aG9yLCBmdW5jdGlvbihib29rcywgZXJyKSB7XG4gICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIGZvdW5kQm9va3MoYm9va3MpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgICBmYWlsdXJlKHJlYXNvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgUHJvbWlzZSBFeGFtcGxlO1xuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICBmaW5kQXV0aG9yKCkuXG4gICAgICAgIHRoZW4oZmluZEJvb2tzQnlBdXRob3IpLlxuICAgICAgICB0aGVuKGZ1bmN0aW9uKGJvb2tzKXtcbiAgICAgICAgICAvLyBmb3VuZCBib29rc1xuICAgICAgfSkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEBtZXRob2QgdGhlblxuICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gb25GdWxmaWxsZWRcbiAgICAgIEBwYXJhbSB7RnVuY3Rpb259IG9uUmVqZWN0ZWRcbiAgICAgIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCBvcHRpb25hbCBzdHJpbmcgZm9yIGxhYmVsaW5nIHRoZSBwcm9taXNlLlxuICAgICAgVXNlZnVsIGZvciB0b29saW5nLlxuICAgICAgQHJldHVybiB7UHJvbWlzZX1cbiAgICAqL1xuICAgICAgdGhlbjogZnVuY3Rpb24ob25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24sIGxhYmVsKSB7XG4gICAgICAgIHZhciBwYXJlbnQgPSB0aGlzO1xuICAgICAgICB2YXIgc3RhdGUgPSBwYXJlbnQuX3N0YXRlO1xuXG4gICAgICAgIGlmIChzdGF0ZSA9PT0gJCQkaW50ZXJuYWwkJEZVTEZJTExFRCAmJiAhb25GdWxmaWxsbWVudCB8fCBzdGF0ZSA9PT0gJCQkaW50ZXJuYWwkJFJFSkVDVEVEICYmICFvblJlamVjdGlvbikge1xuICAgICAgICAgIGlmICgkJHJzdnAkY29uZmlnJCRjb25maWcuaW5zdHJ1bWVudCkge1xuICAgICAgICAgICAgJCRpbnN0cnVtZW50JCRkZWZhdWx0KCdjaGFpbmVkJywgdGhpcywgdGhpcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgcGFyZW50Ll9vbmVycm9yID0gbnVsbDtcblxuICAgICAgICB2YXIgY2hpbGQgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcigkJCRpbnRlcm5hbCQkbm9vcCwgbGFiZWwpO1xuICAgICAgICB2YXIgcmVzdWx0ID0gcGFyZW50Ll9yZXN1bHQ7XG5cbiAgICAgICAgaWYgKCQkcnN2cCRjb25maWckJGNvbmZpZy5pbnN0cnVtZW50KSB7XG4gICAgICAgICAgJCRpbnN0cnVtZW50JCRkZWZhdWx0KCdjaGFpbmVkJywgcGFyZW50LCBjaGlsZCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3RhdGUpIHtcbiAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmd1bWVudHNbc3RhdGUgLSAxXTtcbiAgICAgICAgICAkJHJzdnAkY29uZmlnJCRjb25maWcuYXN5bmMoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICQkJGludGVybmFsJCRpbnZva2VDYWxsYmFjayhzdGF0ZSwgY2hpbGQsIGNhbGxiYWNrLCByZXN1bHQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICQkJGludGVybmFsJCRzdWJzY3JpYmUocGFyZW50LCBjaGlsZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNoaWxkO1xuICAgICAgfSxcblxuICAgIC8qKlxuICAgICAgYGNhdGNoYCBpcyBzaW1wbHkgc3VnYXIgZm9yIGB0aGVuKHVuZGVmaW5lZCwgb25SZWplY3Rpb24pYCB3aGljaCBtYWtlcyBpdCB0aGUgc2FtZVxuICAgICAgYXMgdGhlIGNhdGNoIGJsb2NrIG9mIGEgdHJ5L2NhdGNoIHN0YXRlbWVudC5cblxuICAgICAgYGBganNcbiAgICAgIGZ1bmN0aW9uIGZpbmRBdXRob3IoKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZG4ndCBmaW5kIHRoYXQgYXV0aG9yJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIHN5bmNocm9ub3VzXG4gICAgICB0cnkge1xuICAgICAgICBmaW5kQXV0aG9yKCk7XG4gICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICAgICAgfVxuXG4gICAgICAvLyBhc3luYyB3aXRoIHByb21pc2VzXG4gICAgICBmaW5kQXV0aG9yKCkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEBtZXRob2QgY2F0Y2hcbiAgICAgIEBwYXJhbSB7RnVuY3Rpb259IG9uUmVqZWN0aW9uXG4gICAgICBAcGFyYW0ge1N0cmluZ30gbGFiZWwgb3B0aW9uYWwgc3RyaW5nIGZvciBsYWJlbGluZyB0aGUgcHJvbWlzZS5cbiAgICAgIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgICAgIEByZXR1cm4ge1Byb21pc2V9XG4gICAgKi9cbiAgICAgICdjYXRjaCc6IGZ1bmN0aW9uKG9uUmVqZWN0aW9uLCBsYWJlbCkge1xuICAgICAgICByZXR1cm4gdGhpcy50aGVuKG51bGwsIG9uUmVqZWN0aW9uLCBsYWJlbCk7XG4gICAgICB9LFxuXG4gICAgLyoqXG4gICAgICBgZmluYWxseWAgd2lsbCBiZSBpbnZva2VkIHJlZ2FyZGxlc3Mgb2YgdGhlIHByb21pc2UncyBmYXRlIGp1c3QgYXMgbmF0aXZlXG4gICAgICB0cnkvY2F0Y2gvZmluYWxseSBiZWhhdmVzXG5cbiAgICAgIFN5bmNocm9ub3VzIGV4YW1wbGU6XG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kQXV0aG9yKCkge1xuICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA+IDAuNSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgQXV0aG9yKCk7XG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBmaW5kQXV0aG9yKCk7IC8vIHN1Y2NlZWQgb3IgZmFpbFxuICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICByZXR1cm4gZmluZE90aGVyQXV0aGVyKCk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICAvLyBhbHdheXMgcnVuc1xuICAgICAgICAvLyBkb2Vzbid0IGFmZmVjdCB0aGUgcmV0dXJuIHZhbHVlXG4gICAgICB9XG4gICAgICBgYGBcblxuICAgICAgQXN5bmNocm9ub3VzIGV4YW1wbGU6XG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kQXV0aG9yKCkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgcmV0dXJuIGZpbmRPdGhlckF1dGhlcigpO1xuICAgICAgfSkuZmluYWxseShmdW5jdGlvbigpe1xuICAgICAgICAvLyBhdXRob3Igd2FzIGVpdGhlciBmb3VuZCwgb3Igbm90XG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBAbWV0aG9kIGZpbmFsbHlcbiAgICAgIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gICAgICBAcGFyYW0ge1N0cmluZ30gbGFiZWwgb3B0aW9uYWwgc3RyaW5nIGZvciBsYWJlbGluZyB0aGUgcHJvbWlzZS5cbiAgICAgIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgICAgIEByZXR1cm4ge1Byb21pc2V9XG4gICAgKi9cbiAgICAgICdmaW5hbGx5JzogZnVuY3Rpb24oY2FsbGJhY2ssIGxhYmVsKSB7XG4gICAgICAgIHZhciBjb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3I7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIHJldHVybiBjb25zdHJ1Y3Rvci5yZXNvbHZlKGNhbGxiYWNrKCkpLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnN0cnVjdG9yLnJlc29sdmUoY2FsbGJhY2soKSkudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgICAgdGhyb3cgcmVhc29uO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LCBsYWJlbCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uICQkcnN2cCRub2RlJCRSZXN1bHQoKSB7XG4gICAgICB0aGlzLnZhbHVlID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHZhciAkJHJzdnAkbm9kZSQkRVJST1IgPSBuZXcgJCRyc3ZwJG5vZGUkJFJlc3VsdCgpO1xuICAgIHZhciAkJHJzdnAkbm9kZSQkR0VUX1RIRU5fRVJST1IgPSBuZXcgJCRyc3ZwJG5vZGUkJFJlc3VsdCgpO1xuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJG5vZGUkJGdldFRoZW4ob2JqKSB7XG4gICAgICB0cnkge1xuICAgICAgIHJldHVybiBvYmoudGhlbjtcbiAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgJCRyc3ZwJG5vZGUkJEVSUk9SLnZhbHVlPSBlcnJvcjtcbiAgICAgICAgcmV0dXJuICQkcnN2cCRub2RlJCRFUlJPUjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkbm9kZSQkdHJ5QXBwbHkoZiwgcywgYSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZi5hcHBseShzLCBhKTtcbiAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgJCRyc3ZwJG5vZGUkJEVSUk9SLnZhbHVlID0gZXJyb3I7XG4gICAgICAgIHJldHVybiAkJHJzdnAkbm9kZSQkRVJST1I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJG5vZGUkJG1ha2VPYmplY3QoXywgYXJndW1lbnROYW1lcykge1xuICAgICAgdmFyIG9iaiA9IHt9O1xuICAgICAgdmFyIG5hbWU7XG4gICAgICB2YXIgaTtcbiAgICAgIHZhciBsZW5ndGggPSBfLmxlbmd0aDtcbiAgICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGxlbmd0aCk7XG5cbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgbGVuZ3RoOyB4KyspIHtcbiAgICAgICAgYXJnc1t4XSA9IF9beF07XG4gICAgICB9XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBhcmd1bWVudE5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG5hbWUgPSBhcmd1bWVudE5hbWVzW2ldO1xuICAgICAgICBvYmpbbmFtZV0gPSBhcmdzW2kgKyAxXTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkbm9kZSQkYXJyYXlSZXN1bHQoXykge1xuICAgICAgdmFyIGxlbmd0aCA9IF8ubGVuZ3RoO1xuICAgICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkobGVuZ3RoIC0gMSk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYXJnc1tpIC0gMV0gPSBfW2ldO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gYXJncztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkbm9kZSQkd3JhcFRoZW5hYmxlKHRoZW4sIHByb21pc2UpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRoZW46IGZ1bmN0aW9uKG9uRnVsRmlsbG1lbnQsIG9uUmVqZWN0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIHRoZW4uY2FsbChwcm9taXNlLCBvbkZ1bEZpbGxtZW50LCBvblJlamVjdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyICQkcnN2cCRub2RlJCRkZWZhdWx0ID0gZnVuY3Rpb24gZGVub2RlaWZ5KG5vZGVGdW5jLCBvcHRpb25zKSB7XG4gICAgICB2YXIgZm4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgbCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGwgKyAxKTtcbiAgICAgICAgdmFyIGFyZztcbiAgICAgICAgdmFyIHByb21pc2VJbnB1dCA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgKytpKSB7XG4gICAgICAgICAgYXJnID0gYXJndW1lbnRzW2ldO1xuXG4gICAgICAgICAgaWYgKCFwcm9taXNlSW5wdXQpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IGNsZWFuIHRoaXMgdXBcbiAgICAgICAgICAgIHByb21pc2VJbnB1dCA9ICQkcnN2cCRub2RlJCRuZWVkc1Byb21pc2VJbnB1dChhcmcpO1xuICAgICAgICAgICAgaWYgKHByb21pc2VJbnB1dCA9PT0gJCRyc3ZwJG5vZGUkJEdFVF9USEVOX0VSUk9SKSB7XG4gICAgICAgICAgICAgIHZhciBwID0gbmV3ICQkcnN2cCRwcm9taXNlJCRkZWZhdWx0KCQkJGludGVybmFsJCRub29wKTtcbiAgICAgICAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwLCAkJHJzdnAkbm9kZSQkR0VUX1RIRU5fRVJST1IudmFsdWUpO1xuICAgICAgICAgICAgICByZXR1cm4gcDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvbWlzZUlucHV0ICYmIHByb21pc2VJbnB1dCAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICBhcmcgPSAkJHJzdnAkbm9kZSQkd3JhcFRoZW5hYmxlKHByb21pc2VJbnB1dCwgYXJnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYXJnc1tpXSA9IGFyZztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwcm9taXNlID0gbmV3ICQkcnN2cCRwcm9taXNlJCRkZWZhdWx0KCQkJGludGVybmFsJCRub29wKTtcblxuICAgICAgICBhcmdzW2xdID0gZnVuY3Rpb24oZXJyLCB2YWwpIHtcbiAgICAgICAgICBpZiAoZXJyKVxuICAgICAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBlcnIpO1xuICAgICAgICAgIGVsc2UgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICQkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbCk7XG4gICAgICAgICAgZWxzZSBpZiAob3B0aW9ucyA9PT0gdHJ1ZSlcbiAgICAgICAgICAgICQkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsICQkcnN2cCRub2RlJCRhcnJheVJlc3VsdChhcmd1bWVudHMpKTtcbiAgICAgICAgICBlbHNlIGlmICgkJHV0aWxzJCRpc0FycmF5KG9wdGlvbnMpKVxuICAgICAgICAgICAgJCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgJCRyc3ZwJG5vZGUkJG1ha2VPYmplY3QoYXJndW1lbnRzLCBvcHRpb25zKSk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgJCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsKTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAocHJvbWlzZUlucHV0KSB7XG4gICAgICAgICAgcmV0dXJuICQkcnN2cCRub2RlJCRoYW5kbGVQcm9taXNlSW5wdXQocHJvbWlzZSwgYXJncywgbm9kZUZ1bmMsIHNlbGYpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiAkJHJzdnAkbm9kZSQkaGFuZGxlVmFsdWVJbnB1dChwcm9taXNlLCBhcmdzLCBub2RlRnVuYywgc2VsZik7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGZuLl9fcHJvdG9fXyA9IG5vZGVGdW5jO1xuXG4gICAgICByZXR1cm4gZm47XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uICQkcnN2cCRub2RlJCRoYW5kbGVWYWx1ZUlucHV0KHByb21pc2UsIGFyZ3MsIG5vZGVGdW5jLCBzZWxmKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gJCRyc3ZwJG5vZGUkJHRyeUFwcGx5KG5vZGVGdW5jLCBzZWxmLCBhcmdzKTtcbiAgICAgIGlmIChyZXN1bHQgPT09ICQkcnN2cCRub2RlJCRFUlJPUikge1xuICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlc3VsdC52YWx1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkbm9kZSQkaGFuZGxlUHJvbWlzZUlucHV0KHByb21pc2UsIGFyZ3MsIG5vZGVGdW5jLCBzZWxmKXtcbiAgICAgIHJldHVybiAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdC5hbGwoYXJncykudGhlbihmdW5jdGlvbihhcmdzKXtcbiAgICAgICAgdmFyIHJlc3VsdCA9ICQkcnN2cCRub2RlJCR0cnlBcHBseShub2RlRnVuYywgc2VsZiwgYXJncyk7XG4gICAgICAgIGlmIChyZXN1bHQgPT09ICQkcnN2cCRub2RlJCRFUlJPUikge1xuICAgICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVzdWx0LnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkcnN2cCRub2RlJCRuZWVkc1Byb21pc2VJbnB1dChhcmcpIHtcbiAgICAgIGlmIChhcmcgJiYgdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgaWYgKGFyZy5jb25zdHJ1Y3RvciA9PT0gJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gJCRyc3ZwJG5vZGUkJGdldFRoZW4oYXJnKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciAkJHJzdnAkYWxsJCRkZWZhdWx0ID0gZnVuY3Rpb24gYWxsKGFycmF5LCBsYWJlbCkge1xuICAgICAgcmV0dXJuICQkcnN2cCRwcm9taXNlJCRkZWZhdWx0LmFsbChhcnJheSwgbGFiZWwpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkYWxsJHNldHRsZWQkJEFsbFNldHRsZWQoQ29uc3RydWN0b3IsIGVudHJpZXMsIGxhYmVsKSB7XG4gICAgICB0aGlzLl9zdXBlckNvbnN0cnVjdG9yKENvbnN0cnVjdG9yLCBlbnRyaWVzLCBmYWxzZSAvKiBkb24ndCBhYm9ydCBvbiByZWplY3QgKi8sIGxhYmVsKTtcbiAgICB9XG5cbiAgICAkJHJzdnAkYWxsJHNldHRsZWQkJEFsbFNldHRsZWQucHJvdG90eXBlID0gJCR1dGlscyQkb19jcmVhdGUoJCRlbnVtZXJhdG9yJCRkZWZhdWx0LnByb3RvdHlwZSk7XG4gICAgJCRyc3ZwJGFsbCRzZXR0bGVkJCRBbGxTZXR0bGVkLnByb3RvdHlwZS5fc3VwZXJDb25zdHJ1Y3RvciA9ICQkZW51bWVyYXRvciQkZGVmYXVsdDtcbiAgICAkJHJzdnAkYWxsJHNldHRsZWQkJEFsbFNldHRsZWQucHJvdG90eXBlLl9tYWtlUmVzdWx0ID0gJCRlbnVtZXJhdG9yJCRtYWtlU2V0dGxlZFJlc3VsdDtcblxuICAgICQkcnN2cCRhbGwkc2V0dGxlZCQkQWxsU2V0dGxlZC5wcm90b3R5cGUuX3ZhbGlkYXRpb25FcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyBFcnJvcignYWxsU2V0dGxlZCBtdXN0IGJlIGNhbGxlZCB3aXRoIGFuIGFycmF5Jyk7XG4gICAgfTtcblxuICAgIHZhciAkJHJzdnAkYWxsJHNldHRsZWQkJGRlZmF1bHQgPSBmdW5jdGlvbiBhbGxTZXR0bGVkKGVudHJpZXMsIGxhYmVsKSB7XG4gICAgICByZXR1cm4gbmV3ICQkcnN2cCRhbGwkc2V0dGxlZCQkQWxsU2V0dGxlZCgkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdCwgZW50cmllcywgbGFiZWwpLnByb21pc2U7XG4gICAgfTtcblxuICAgIHZhciAkJHJzdnAkcmFjZSQkZGVmYXVsdCA9IGZ1bmN0aW9uIHJhY2UoYXJyYXksIGxhYmVsKSB7XG4gICAgICByZXR1cm4gJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQucmFjZShhcnJheSwgbGFiZWwpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiAkJHByb21pc2UkaGFzaCQkUHJvbWlzZUhhc2goQ29uc3RydWN0b3IsIG9iamVjdCwgbGFiZWwpIHtcbiAgICAgIHRoaXMuX3N1cGVyQ29uc3RydWN0b3IoQ29uc3RydWN0b3IsIG9iamVjdCwgdHJ1ZSwgbGFiZWwpO1xuICAgIH1cblxuICAgIHZhciAkJHByb21pc2UkaGFzaCQkZGVmYXVsdCA9ICQkcHJvbWlzZSRoYXNoJCRQcm9taXNlSGFzaDtcbiAgICAkJHByb21pc2UkaGFzaCQkUHJvbWlzZUhhc2gucHJvdG90eXBlID0gJCR1dGlscyQkb19jcmVhdGUoJCRlbnVtZXJhdG9yJCRkZWZhdWx0LnByb3RvdHlwZSk7XG4gICAgJCRwcm9taXNlJGhhc2gkJFByb21pc2VIYXNoLnByb3RvdHlwZS5fc3VwZXJDb25zdHJ1Y3RvciA9ICQkZW51bWVyYXRvciQkZGVmYXVsdDtcblxuICAgICQkcHJvbWlzZSRoYXNoJCRQcm9taXNlSGFzaC5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX3Jlc3VsdCA9IHt9O1xuICAgIH07XG5cbiAgICAkJHByb21pc2UkaGFzaCQkUHJvbWlzZUhhc2gucHJvdG90eXBlLl92YWxpZGF0ZUlucHV0ID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgIHJldHVybiBpbnB1dCAmJiB0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnO1xuICAgIH07XG5cbiAgICAkJHByb21pc2UkaGFzaCQkUHJvbWlzZUhhc2gucHJvdG90eXBlLl92YWxpZGF0aW9uRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRXJyb3IoJ1Byb21pc2UuaGFzaCBtdXN0IGJlIGNhbGxlZCB3aXRoIGFuIG9iamVjdCcpO1xuICAgIH07XG5cbiAgICAkJHByb21pc2UkaGFzaCQkUHJvbWlzZUhhc2gucHJvdG90eXBlLl9lbnVtZXJhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwcm9taXNlID0gdGhpcy5wcm9taXNlO1xuICAgICAgdmFyIGlucHV0ICAgPSB0aGlzLl9pbnB1dDtcbiAgICAgIHZhciByZXN1bHRzID0gW107XG5cbiAgICAgIGZvciAodmFyIGtleSBpbiBpbnB1dCkge1xuICAgICAgICBpZiAocHJvbWlzZS5fc3RhdGUgPT09ICQkJGludGVybmFsJCRQRU5ESU5HICYmIGlucHV0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICAgICAgcG9zaXRpb246IGtleSxcbiAgICAgICAgICAgIGVudHJ5OiBpbnB1dFtrZXldXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIGxlbmd0aCA9IHJlc3VsdHMubGVuZ3RoO1xuICAgICAgdGhpcy5fcmVtYWluaW5nID0gbGVuZ3RoO1xuICAgICAgdmFyIHJlc3VsdDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IHByb21pc2UuX3N0YXRlID09PSAkJCRpbnRlcm5hbCQkUEVORElORyAmJiBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0c1tpXTtcbiAgICAgICAgdGhpcy5fZWFjaEVudHJ5KHJlc3VsdC5lbnRyeSwgcmVzdWx0LnBvc2l0aW9uKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyICQkcnN2cCRoYXNoJCRkZWZhdWx0ID0gZnVuY3Rpb24gaGFzaChvYmplY3QsIGxhYmVsKSB7XG4gICAgICByZXR1cm4gbmV3ICQkcHJvbWlzZSRoYXNoJCRkZWZhdWx0KCQkcnN2cCRwcm9taXNlJCRkZWZhdWx0LCBvYmplY3QsIGxhYmVsKS5wcm9taXNlO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkaGFzaCRzZXR0bGVkJCRIYXNoU2V0dGxlZChDb25zdHJ1Y3Rvciwgb2JqZWN0LCBsYWJlbCkge1xuICAgICAgdGhpcy5fc3VwZXJDb25zdHJ1Y3RvcihDb25zdHJ1Y3Rvciwgb2JqZWN0LCBmYWxzZSwgbGFiZWwpO1xuICAgIH1cblxuICAgICQkcnN2cCRoYXNoJHNldHRsZWQkJEhhc2hTZXR0bGVkLnByb3RvdHlwZSA9ICQkdXRpbHMkJG9fY3JlYXRlKCQkcHJvbWlzZSRoYXNoJCRkZWZhdWx0LnByb3RvdHlwZSk7XG4gICAgJCRyc3ZwJGhhc2gkc2V0dGxlZCQkSGFzaFNldHRsZWQucHJvdG90eXBlLl9zdXBlckNvbnN0cnVjdG9yID0gJCRlbnVtZXJhdG9yJCRkZWZhdWx0O1xuICAgICQkcnN2cCRoYXNoJHNldHRsZWQkJEhhc2hTZXR0bGVkLnByb3RvdHlwZS5fbWFrZVJlc3VsdCA9ICQkZW51bWVyYXRvciQkbWFrZVNldHRsZWRSZXN1bHQ7XG5cbiAgICAkJHJzdnAkaGFzaCRzZXR0bGVkJCRIYXNoU2V0dGxlZC5wcm90b3R5cGUuX3ZhbGlkYXRpb25FcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyBFcnJvcignaGFzaFNldHRsZWQgbXVzdCBiZSBjYWxsZWQgd2l0aCBhbiBvYmplY3QnKTtcbiAgICB9O1xuXG4gICAgdmFyICQkcnN2cCRoYXNoJHNldHRsZWQkJGRlZmF1bHQgPSBmdW5jdGlvbiBoYXNoU2V0dGxlZChvYmplY3QsIGxhYmVsKSB7XG4gICAgICByZXR1cm4gbmV3ICQkcnN2cCRoYXNoJHNldHRsZWQkJEhhc2hTZXR0bGVkKCQkcnN2cCRwcm9taXNlJCRkZWZhdWx0LCBvYmplY3QsIGxhYmVsKS5wcm9taXNlO1xuICAgIH07XG5cbiAgICB2YXIgJCRyc3ZwJHJldGhyb3ckJGRlZmF1bHQgPSBmdW5jdGlvbiByZXRocm93KHJlYXNvbikge1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhyb3cgcmVhc29uO1xuICAgICAgfSk7XG4gICAgICB0aHJvdyByZWFzb247XG4gICAgfTtcblxuICAgIHZhciAkJHJzdnAkZGVmZXIkJGRlZmF1bHQgPSBmdW5jdGlvbiBkZWZlcihsYWJlbCkge1xuICAgICAgdmFyIGRlZmVycmVkID0geyB9O1xuXG4gICAgICBkZWZlcnJlZC5wcm9taXNlID0gbmV3ICQkcnN2cCRwcm9taXNlJCRkZWZhdWx0KGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0ID0gcmVqZWN0O1xuICAgICAgfSwgbGFiZWwpO1xuXG4gICAgICByZXR1cm4gZGVmZXJyZWQ7XG4gICAgfTtcblxuICAgIHZhciAkJHJzdnAkbWFwJCRkZWZhdWx0ID0gZnVuY3Rpb24gbWFwKHByb21pc2VzLCBtYXBGbiwgbGFiZWwpIHtcbiAgICAgIHJldHVybiAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdC5hbGwocHJvbWlzZXMsIGxhYmVsKS50aGVuKGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICBpZiAoISQkdXRpbHMkJGlzRnVuY3Rpb24obWFwRm4pKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIllvdSBtdXN0IHBhc3MgYSBmdW5jdGlvbiBhcyBtYXAncyBzZWNvbmQgYXJndW1lbnQuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxlbmd0aCA9IHZhbHVlcy5sZW5ndGg7XG4gICAgICAgIHZhciByZXN1bHRzID0gbmV3IEFycmF5KGxlbmd0aCk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgIHJlc3VsdHNbaV0gPSBtYXBGbih2YWx1ZXNbaV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICQkcnN2cCRwcm9taXNlJCRkZWZhdWx0LmFsbChyZXN1bHRzLCBsYWJlbCk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdmFyICQkcnN2cCRyZXNvbHZlJCRkZWZhdWx0ID0gZnVuY3Rpb24gcmVzb2x2ZSh2YWx1ZSwgbGFiZWwpIHtcbiAgICAgIHJldHVybiAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdC5yZXNvbHZlKHZhbHVlLCBsYWJlbCk7XG4gICAgfTtcblxuICAgIHZhciAkJHJzdnAkcmVqZWN0JCRkZWZhdWx0ID0gZnVuY3Rpb24gcmVqZWN0KHJlYXNvbiwgbGFiZWwpIHtcbiAgICAgIHJldHVybiAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdC5yZWplY3QocmVhc29uLCBsYWJlbCk7XG4gICAgfTtcblxuICAgIHZhciAkJHJzdnAkZmlsdGVyJCRkZWZhdWx0ID0gZnVuY3Rpb24gZmlsdGVyKHByb21pc2VzLCBmaWx0ZXJGbiwgbGFiZWwpIHtcbiAgICAgIHJldHVybiAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdC5hbGwocHJvbWlzZXMsIGxhYmVsKS50aGVuKGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICBpZiAoISQkdXRpbHMkJGlzRnVuY3Rpb24oZmlsdGVyRm4pKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIllvdSBtdXN0IHBhc3MgYSBmdW5jdGlvbiBhcyBmaWx0ZXIncyBzZWNvbmQgYXJndW1lbnQuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxlbmd0aCA9IHZhbHVlcy5sZW5ndGg7XG4gICAgICAgIHZhciBmaWx0ZXJlZCA9IG5ldyBBcnJheShsZW5ndGgpO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBmaWx0ZXJlZFtpXSA9IGZpbHRlckZuKHZhbHVlc1tpXSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQuYWxsKGZpbHRlcmVkLCBsYWJlbCkudGhlbihmdW5jdGlvbihmaWx0ZXJlZCkge1xuICAgICAgICAgIHZhciByZXN1bHRzID0gbmV3IEFycmF5KGxlbmd0aCk7XG4gICAgICAgICAgdmFyIG5ld0xlbmd0aCA9IDA7XG5cbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZmlsdGVyZWRbaV0pIHtcbiAgICAgICAgICAgICAgcmVzdWx0c1tuZXdMZW5ndGhdID0gdmFsdWVzW2ldO1xuICAgICAgICAgICAgICBuZXdMZW5ndGgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXN1bHRzLmxlbmd0aCA9IG5ld0xlbmd0aDtcblxuICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgJCRyc3ZwJGFzYXAkJGxlbiA9IDA7XG5cbiAgICB2YXIgJCRyc3ZwJGFzYXAkJGRlZmF1bHQgPSBmdW5jdGlvbiBhc2FwKGNhbGxiYWNrLCBhcmcpIHtcbiAgICAgICQkcnN2cCRhc2FwJCRxdWV1ZVskJHJzdnAkYXNhcCQkbGVuXSA9IGNhbGxiYWNrO1xuICAgICAgJCRyc3ZwJGFzYXAkJHF1ZXVlWyQkcnN2cCRhc2FwJCRsZW4gKyAxXSA9IGFyZztcbiAgICAgICQkcnN2cCRhc2FwJCRsZW4gKz0gMjtcbiAgICAgIGlmICgkJHJzdnAkYXNhcCQkbGVuID09PSAyKSB7XG4gICAgICAgIC8vIElmIGxlbiBpcyAxLCB0aGF0IG1lYW5zIHRoYXQgd2UgbmVlZCB0byBzY2hlZHVsZSBhbiBhc3luYyBmbHVzaC5cbiAgICAgICAgLy8gSWYgYWRkaXRpb25hbCBjYWxsYmFja3MgYXJlIHF1ZXVlZCBiZWZvcmUgdGhlIHF1ZXVlIGlzIGZsdXNoZWQsIHRoZXlcbiAgICAgICAgLy8gd2lsbCBiZSBwcm9jZXNzZWQgYnkgdGhpcyBmbHVzaCB0aGF0IHdlIGFyZSBzY2hlZHVsaW5nLlxuICAgICAgICAkJHJzdnAkYXNhcCQkc2NoZWR1bGVGbHVzaCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgJCRyc3ZwJGFzYXAkJGJyb3dzZXJHbG9iYWwgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpID8gd2luZG93IDoge307XG4gICAgdmFyICQkcnN2cCRhc2FwJCRCcm93c2VyTXV0YXRpb25PYnNlcnZlciA9ICQkcnN2cCRhc2FwJCRicm93c2VyR2xvYmFsLk11dGF0aW9uT2JzZXJ2ZXIgfHwgJCRyc3ZwJGFzYXAkJGJyb3dzZXJHbG9iYWwuV2ViS2l0TXV0YXRpb25PYnNlcnZlcjtcblxuICAgIC8vIHRlc3QgZm9yIHdlYiB3b3JrZXIgYnV0IG5vdCBpbiBJRTEwXG4gICAgdmFyICQkcnN2cCRhc2FwJCRpc1dvcmtlciA9IHR5cGVvZiBVaW50OENsYW1wZWRBcnJheSAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgIHR5cGVvZiBpbXBvcnRTY3JpcHRzICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgdHlwZW9mIE1lc3NhZ2VDaGFubmVsICE9PSAndW5kZWZpbmVkJztcblxuICAgIC8vIG5vZGVcbiAgICBmdW5jdGlvbiAkJHJzdnAkYXNhcCQkdXNlTmV4dFRpY2soKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soJCRyc3ZwJGFzYXAkJGZsdXNoKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJGFzYXAkJHVzZU11dGF0aW9uT2JzZXJ2ZXIoKSB7XG4gICAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgJCRyc3ZwJGFzYXAkJEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKCQkcnN2cCRhc2FwJCRmbHVzaCk7XG4gICAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgICAgIG9ic2VydmVyLm9ic2VydmUobm9kZSwgeyBjaGFyYWN0ZXJEYXRhOiB0cnVlIH0pO1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIG5vZGUuZGF0YSA9IChpdGVyYXRpb25zID0gKytpdGVyYXRpb25zICUgMik7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIHdlYiB3b3JrZXJcbiAgICBmdW5jdGlvbiAkJHJzdnAkYXNhcCQkdXNlTWVzc2FnZUNoYW5uZWwoKSB7XG4gICAgICB2YXIgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO1xuICAgICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSAkJHJzdnAkYXNhcCQkZmx1c2g7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBjaGFubmVsLnBvcnQyLnBvc3RNZXNzYWdlKDApO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkYXNhcCQkdXNlU2V0VGltZW91dCgpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgc2V0VGltZW91dCgkJHJzdnAkYXNhcCQkZmx1c2gsIDEpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgJCRyc3ZwJGFzYXAkJHF1ZXVlID0gbmV3IEFycmF5KDEwMDApO1xuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJGFzYXAkJGZsdXNoKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkJHJzdnAkYXNhcCQkbGVuOyBpKz0yKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9ICQkcnN2cCRhc2FwJCRxdWV1ZVtpXTtcbiAgICAgICAgdmFyIGFyZyA9ICQkcnN2cCRhc2FwJCRxdWV1ZVtpKzFdO1xuXG4gICAgICAgIGNhbGxiYWNrKGFyZyk7XG5cbiAgICAgICAgJCRyc3ZwJGFzYXAkJHF1ZXVlW2ldID0gdW5kZWZpbmVkO1xuICAgICAgICAkJHJzdnAkYXNhcCQkcXVldWVbaSsxXSA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgJCRyc3ZwJGFzYXAkJGxlbiA9IDA7XG4gICAgfVxuXG4gICAgdmFyICQkcnN2cCRhc2FwJCRzY2hlZHVsZUZsdXNoO1xuXG4gICAgLy8gRGVjaWRlIHdoYXQgYXN5bmMgbWV0aG9kIHRvIHVzZSB0byB0cmlnZ2VyaW5nIHByb2Nlc3Npbmcgb2YgcXVldWVkIGNhbGxiYWNrczpcbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHt9LnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJykge1xuICAgICAgJCRyc3ZwJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSAkJHJzdnAkYXNhcCQkdXNlTmV4dFRpY2soKTtcbiAgICB9IGVsc2UgaWYgKCQkcnN2cCRhc2FwJCRCcm93c2VyTXV0YXRpb25PYnNlcnZlcikge1xuICAgICAgJCRyc3ZwJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSAkJHJzdnAkYXNhcCQkdXNlTXV0YXRpb25PYnNlcnZlcigpO1xuICAgIH0gZWxzZSBpZiAoJCRyc3ZwJGFzYXAkJGlzV29ya2VyKSB7XG4gICAgICAkJHJzdnAkYXNhcCQkc2NoZWR1bGVGbHVzaCA9ICQkcnN2cCRhc2FwJCR1c2VNZXNzYWdlQ2hhbm5lbCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkJHJzdnAkYXNhcCQkc2NoZWR1bGVGbHVzaCA9ICQkcnN2cCRhc2FwJCR1c2VTZXRUaW1lb3V0KCk7XG4gICAgfVxuXG4gICAgLy8gZGVmYXVsdCBhc3luYyBpcyBhc2FwO1xuICAgICQkcnN2cCRjb25maWckJGNvbmZpZy5hc3luYyA9ICQkcnN2cCRhc2FwJCRkZWZhdWx0O1xuXG4gICAgdmFyICQkcnN2cCQkY2FzdCA9ICQkcnN2cCRyZXNvbHZlJCRkZWZhdWx0O1xuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJCRhc3luYyhjYWxsYmFjaywgYXJnKSB7XG4gICAgICAkJHJzdnAkY29uZmlnJCRjb25maWcuYXN5bmMoY2FsbGJhY2ssIGFyZyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJCRvbigpIHtcbiAgICAgICQkcnN2cCRjb25maWckJGNvbmZpZy5vbi5hcHBseSgkJHJzdnAkY29uZmlnJCRjb25maWcsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJCRvZmYoKSB7XG4gICAgICAkJHJzdnAkY29uZmlnJCRjb25maWcub2ZmLmFwcGx5KCQkcnN2cCRjb25maWckJGNvbmZpZywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICAvLyBTZXQgdXAgaW5zdHJ1bWVudGF0aW9uIHRocm91Z2ggYHdpbmRvdy5fX1BST01JU0VfSU5UUlVNRU5UQVRJT05fX2BcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHdpbmRvd1snX19QUk9NSVNFX0lOU1RSVU1FTlRBVElPTl9fJ10gPT09ICdvYmplY3QnKSB7XG4gICAgICB2YXIgJCRyc3ZwJCRjYWxsYmFja3MgPSB3aW5kb3dbJ19fUFJPTUlTRV9JTlNUUlVNRU5UQVRJT05fXyddO1xuICAgICAgJCRyc3ZwJGNvbmZpZyQkY29uZmlndXJlKCdpbnN0cnVtZW50JywgdHJ1ZSk7XG4gICAgICBmb3IgKHZhciAkJHJzdnAkJGV2ZW50TmFtZSBpbiAkJHJzdnAkJGNhbGxiYWNrcykge1xuICAgICAgICBpZiAoJCRyc3ZwJCRjYWxsYmFja3MuaGFzT3duUHJvcGVydHkoJCRyc3ZwJCRldmVudE5hbWUpKSB7XG4gICAgICAgICAgJCRyc3ZwJCRvbigkJHJzdnAkJGV2ZW50TmFtZSwgJCRyc3ZwJCRjYWxsYmFja3NbJCRyc3ZwJCRldmVudE5hbWVdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciByc3ZwJHVtZCQkUlNWUCA9IHtcbiAgICAgICdyYWNlJzogJCRyc3ZwJHJhY2UkJGRlZmF1bHQsXG4gICAgICAnUHJvbWlzZSc6ICQkcnN2cCRwcm9taXNlJCRkZWZhdWx0LFxuICAgICAgJ2FsbFNldHRsZWQnOiAkJHJzdnAkYWxsJHNldHRsZWQkJGRlZmF1bHQsXG4gICAgICAnaGFzaCc6ICQkcnN2cCRoYXNoJCRkZWZhdWx0LFxuICAgICAgJ2hhc2hTZXR0bGVkJzogJCRyc3ZwJGhhc2gkc2V0dGxlZCQkZGVmYXVsdCxcbiAgICAgICdkZW5vZGVpZnknOiAkJHJzdnAkbm9kZSQkZGVmYXVsdCxcbiAgICAgICdvbic6ICQkcnN2cCQkb24sXG4gICAgICAnb2ZmJzogJCRyc3ZwJCRvZmYsXG4gICAgICAnbWFwJzogJCRyc3ZwJG1hcCQkZGVmYXVsdCxcbiAgICAgICdmaWx0ZXInOiAkJHJzdnAkZmlsdGVyJCRkZWZhdWx0LFxuICAgICAgJ3Jlc29sdmUnOiAkJHJzdnAkcmVzb2x2ZSQkZGVmYXVsdCxcbiAgICAgICdyZWplY3QnOiAkJHJzdnAkcmVqZWN0JCRkZWZhdWx0LFxuICAgICAgJ2FsbCc6ICQkcnN2cCRhbGwkJGRlZmF1bHQsXG4gICAgICAncmV0aHJvdyc6ICQkcnN2cCRyZXRocm93JCRkZWZhdWx0LFxuICAgICAgJ2RlZmVyJzogJCRyc3ZwJGRlZmVyJCRkZWZhdWx0LFxuICAgICAgJ0V2ZW50VGFyZ2V0JzogJCRyc3ZwJGV2ZW50cyQkZGVmYXVsdCxcbiAgICAgICdjb25maWd1cmUnOiAkJHJzdnAkY29uZmlnJCRjb25maWd1cmUsXG4gICAgICAnYXN5bmMnOiAkJHJzdnAkJGFzeW5jXG4gICAgfTtcblxuICAgIC8qIGdsb2JhbCBkZWZpbmU6dHJ1ZSBtb2R1bGU6dHJ1ZSB3aW5kb3c6IHRydWUgKi9cbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiByc3ZwJHVtZCQkUlNWUDsgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgbW9kdWxlLmV4cG9ydHMgPSByc3ZwJHVtZCQkUlNWUDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpc1snUlNWUCddID0gcnN2cCR1bWQkJFJTVlA7XG4gICAgfVxufSkuY2FsbCh0aGlzKTsiLCJ2YXIgY3JlYXRlVHlwZXMgPSByZXF1aXJlKCcuL3R5cGVzJylcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKFRIUkVFKSB7XG5cbiAgICB2YXIgdHlwZXMgPSBjcmVhdGVUeXBlcyhUSFJFRSkgXG5cbiAgICByZXR1cm4gZnVuY3Rpb24gY3JlYXRlKGdsU2hhZGVyLCBvcHRzKSB7XG4gICAgICAgIG9wdHMgPSBvcHRzfHx7fVxuXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0cy5jb2xvcnMgPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgb3B0cy5jb2xvcnMgPSBbb3B0cy5jb2xvcnNdXG4gICAgICAgIFxuICAgICAgICB2YXIgdFVuaWZvcm1zID0gdHlwZXMoIGdsU2hhZGVyLnVuaWZvcm1zLCBvcHRzLmNvbG9ycyApXG4gICAgICAgIHZhciB0QXR0cmlicyA9IHR5cGVzKCBnbFNoYWRlci5hdHRyaWJ1dGVzLCBvcHRzLmNvbG9ycyApXG4gICAgICAgICAgICBcbiAgICAgICAgLy9jbGVhciB0aGUgYXR0cmlidXRlIGFycmF5c1xuICAgICAgICBmb3IgKHZhciBrIGluIHRBdHRyaWJzKSB7XG4gICAgICAgICAgICB0QXR0cmlic1trXS52YWx1ZSA9IFtdXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmVydGV4U2hhZGVyOiBnbFNoYWRlci52ZXJ0ZXgsXG4gICAgICAgICAgICBmcmFnbWVudFNoYWRlcjogZ2xTaGFkZXIuZnJhZ21lbnQsXG4gICAgICAgICAgICB1bmlmb3JtczogdFVuaWZvcm1zLFxuICAgICAgICAgICAgYXR0cmlidXRlczogdEF0dHJpYnNcbiAgICAgICAgfVxuICAgIH1cbn0iLCJ2YXIgdHlwZU1hcCA9IHtcbiAgICAnaW50JzogJ2knLFxuICAgICdmbG9hdCc6ICdmJyxcbiAgICAnaXZlYzInOiAnaTInLFxuICAgICdpdmVjMyc6ICdpMycsXG4gICAgJ2l2ZWM0JzogJ2k0JyxcbiAgICAndmVjMic6ICd2MicsXG4gICAgJ3ZlYzMnOiAndjMnLFxuICAgICd2ZWM0JzogJ3Y0JyxcbiAgICAnbWF0NCc6ICdtNCcsXG4gICAgJ21hdDMnOiAnbTMnLFxuICAgICdzYW1wbGVyMkQnOiAndCcsXG4gICAgJ3NhbXBsZXJDdWJlJzogJ3QnXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZShUSFJFRSkge1xuICAgIGZ1bmN0aW9uIG5ld0luc3RhbmNlKHR5cGUsIGlzQXJyYXkpIHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdmbG9hdCc6IFxuICAgICAgICAgICAgY2FzZSAnaW50JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICAgICAgY2FzZSAndmVjMic6XG4gICAgICAgICAgICBjYXNlICdpdmVjMic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUSFJFRS5WZWN0b3IyKClcbiAgICAgICAgICAgIGNhc2UgJ3ZlYzMnOlxuICAgICAgICAgICAgY2FzZSAnaXZlYzMnOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVEhSRUUuVmVjdG9yMygpXG4gICAgICAgICAgICBjYXNlICd2ZWM0JzpcbiAgICAgICAgICAgIGNhc2UgJ2l2ZWM0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRIUkVFLlZlY3RvcjQoKVxuICAgICAgICAgICAgY2FzZSAnbWF0NCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUSFJFRS5NYXRyaXg0KClcbiAgICAgICAgICAgIGNhc2UgJ21hdDMnOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVEhSRUUuTWF0cml4MygpXG4gICAgICAgICAgICBjYXNlICdzYW1wbGVyQ3ViZSc6XG4gICAgICAgICAgICBjYXNlICdzYW1wbGVyMkQnOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVEhSRUUuVGV4dHVyZSgpXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRlZmF1bHRWYWx1ZSh0eXBlLCBpc0FycmF5LCBhcnJheUxlbikge1xuICAgICAgICBpZiAoaXNBcnJheSkge1xuICAgICAgICAgICAgLy9UaHJlZUpTIGZsYXR0ZW5zIGl2ZWMzIHR5cGVcbiAgICAgICAgICAgIC8vKHdlIGRvbid0IHN1cHBvcnQgJ2Z2JyB0eXBlKVxuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdpdmVjMycpXG4gICAgICAgICAgICAgICAgYXJyYXlMZW4gKj0gM1xuICAgICAgICAgICAgdmFyIGFyID0gbmV3IEFycmF5KGFycmF5TGVuKVxuICAgICAgICAgICAgZm9yICh2YXIgaT0wOyBpPGFyLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgICAgIGFyW2ldID0gbmV3SW5zdGFuY2UodHlwZSwgaXNBcnJheSlcbiAgICAgICAgICAgIHJldHVybiBhclxuICAgICAgICB9ICBcbiAgICAgICAgcmV0dXJuIG5ld0luc3RhbmNlKHR5cGUpXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0VHlwZSh0eXBlLCBpc0FycmF5KSB7XG4gICAgICAgIGlmICghaXNBcnJheSlcbiAgICAgICAgICAgIHJldHVybiB0eXBlTWFwW3R5cGVdXG5cbiAgICAgICAgaWYgKHR5cGUgPT09ICdpbnQnKVxuICAgICAgICAgICAgcmV0dXJuICdpdjEnXG4gICAgICAgIGVsc2UgaWYgKHR5cGUgPT09ICdmbG9hdCcpXG4gICAgICAgICAgICByZXR1cm4gJ2Z2MSdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHR5cGVNYXBbdHlwZV0rJ3YnXG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIHNldHVwVW5pZm9ybXMoZ2xVbmlmb3JtcywgY29sb3JOYW1lcykge1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoY29sb3JOYW1lcykpXG4gICAgICAgICAgICBjb2xvck5hbWVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuXG4gICAgICAgIHZhciByZXN1bHQgPSB7fVxuICAgICAgICB2YXIgYXJyYXlzID0ge31cblxuICAgICAgICAvL21hcCB1bmlmb3JtIHR5cGVzXG4gICAgICAgIGdsVW5pZm9ybXMuZm9yRWFjaChmdW5jdGlvbih1bmlmb3JtKSB7XG4gICAgICAgICAgICB2YXIgbmFtZSA9IHVuaWZvcm0ubmFtZVxuICAgICAgICAgICAgdmFyIGlzQXJyYXkgPSAvKC4rKVxcW1swLTldK1xcXS8uZXhlYyhuYW1lKVxuXG4gICAgICAgICAgICAvL3NwZWNpYWwgY2FzZTogY29sb3JzLi4uXG4gICAgICAgICAgICBpZiAoY29sb3JOYW1lcyAmJiBjb2xvck5hbWVzLmluZGV4T2YobmFtZSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzQXJyYXkpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImFycmF5IG9mIGNvbG9yIHVuaWZvcm1zIG5vdCBzdXBwb3J0ZWRcIilcbiAgICAgICAgICAgICAgICBpZiAodW5pZm9ybS50eXBlICE9PSAndmVjMycpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRocmVlSlMgZXhwZWN0cyB2ZWMzIGZvciBDb2xvciB1bmlmb3Jtc1wiKSBcbiAgICAgICAgICAgICAgICByZXN1bHRbbmFtZV0gPSB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcigpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaXNBcnJheSkge1xuICAgICAgICAgICAgICAgIG5hbWUgPSBpc0FycmF5WzFdXG4gICAgICAgICAgICAgICAgaWYgKG5hbWUgaW4gYXJyYXlzKSBcbiAgICAgICAgICAgICAgICAgICAgYXJyYXlzW25hbWVdLmNvdW50KysgXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBhcnJheXNbbmFtZV0gPSB7IGNvdW50OiAxLCB0eXBlOiB1bmlmb3JtLnR5cGUgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0W25hbWVdID0geyBcbiAgICAgICAgICAgICAgICB0eXBlOiBnZXRUeXBlKHVuaWZvcm0udHlwZSwgaXNBcnJheSksIFxuICAgICAgICAgICAgICAgIHZhbHVlOiBpc0FycmF5ID8gbnVsbCA6IGRlZmF1bHRWYWx1ZSh1bmlmb3JtLnR5cGUpIFxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIC8vbm93IGNsZWFuIHVwIGFueSBhcnJheSB2YWx1ZXNcbiAgICAgICAgZm9yICh2YXIgayBpbiByZXN1bHQpIHtcbiAgICAgICAgICAgIHZhciB1ID0gcmVzdWx0W2tdXG4gICAgICAgICAgICBpZiAoayBpbiBhcnJheXMpIHsgLy9pcyBhbiBhcnJheVxuICAgICAgICAgICAgICAgIHZhciBhID0gYXJyYXlzW2tdXG4gICAgICAgICAgICAgICAgdS52YWx1ZSA9IGRlZmF1bHRWYWx1ZShhLnR5cGUsIHRydWUsIGEuY291bnQpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGUiXX0=
