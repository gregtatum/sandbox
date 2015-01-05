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
	
	var px, py;

	var $canvas = $(canvas);
	
	var dragMouseHandler = function( e ) {

		e.preventDefault();
				
		var x = e.pageX;
		var y = e.pageY;
	
		var offsetX = px - x;
		var offsetY = py - y;
	
		cameraObj.rotation.y += offsetX * 0.005;
		cameraObj.rotation.x += offsetY * 0.005;
				
		px = x;
		py = y;
	};
	
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ndWxwZmlsZS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwianMiLCJqcy9MZXZlbExvYWRlci5qcyIsImpzL1BvZW0uanMiLCJqcy9jb21wb25lbnRzL0luZm8uanMiLCJqcy9jb21wb25lbnRzL1N0YXJzLmpzIiwianMvY29tcG9uZW50cy9hbWJpYW5jZS9DbG91ZHMvaW5kZXguanMiLCJqcy9jb21wb25lbnRzL2FtYmlhbmNlL1NreS9pbmRleC5qcyIsImpzL2NvbXBvbmVudHMvY2FtZXJhcy9DYW1lcmEuanMiLCJqcy9jb21wb25lbnRzL2NhbWVyYXMvQ29udHJvbHMuanMiLCJqcy9jb21wb25lbnRzL2NhbWVyYXMvT3JpZW50YXRpb24uanMiLCJqcy9jb21wb25lbnRzL2NhbWVyYXMvUm90YXRlQXJvdW5kT3JpZ2luLmpzIiwianMvY29tcG9uZW50cy9saWdodHMvVHJhY2tDYW1lcmFMaWdodHMuanMiLCJqcy9jb21wb25lbnRzL3V0aWxzL1N0YXRzLmpzIiwianMvZGVtb3MvRWFydGguanMiLCJqcy9kZW1vcy9FbmRsZXNzVGVycmFpbi9jYW1lcmEuanMiLCJqcy9kZW1vcy9FbmRsZXNzVGVycmFpbi9pbmRleC5qcyIsImpzL2RlbW9zL0dyaWQuanMiLCJqcy9kZW1vcy9NZXNoR3JvdXBCb3hEZW1vL01lc2hHcm91cC5qcyIsImpzL2RlbW9zL01lc2hHcm91cEJveERlbW8vaW5kZXguanMiLCJqcy9kZW1vcy9TaW5lR3Jhdml0eUNsb3VkLmpzIiwianMvZGVtb3MvU3BoZXJlcy5qcyIsImpzL2RlbW9zL3RleHR1cmVQb3NpdGlvbmFsTWF0cmljZXMvaW5kZXguanMiLCJqcy9kZW1vcy91bmlmb3JtUG9zaXRpb25hbE1hdHJpY2VzL2luZGV4LmpzIiwianMvbGV2ZWxzL2NhcmJvbkRpb3hpZGVFYXJ0aC5qcyIsImpzL2xldmVscy9lbmRsZXNzVGVycmFpbi5qcyIsImpzL2xldmVscy9pbmRleC5qcyIsImpzL2xldmVscy9tZXNoR3JvdXBCb3hEZW1vLmpzIiwianMvbGV2ZWxzL3NpbmVHcmF2aXR5Q2xvdWQuanMiLCJqcy9sZXZlbHMvc3BoZXJlc0RlbW8uanMiLCJqcy9sZXZlbHMvdGV4dHVyZVBvc2l0aW9uYWxNYXRyaWNlcy5qcyIsImpzL2xldmVscy91bmlmb3JtUG9zaXRpb25hbE1hdHJpY2VzLmpzIiwianMvbGV2ZWxzL3ZyLmpzIiwianMvdXRpbHMvQ2xvY2suanMiLCJqcy91dGlscy9FdmVudERpc3BhdGNoZXIuanMiLCJqcy91dGlscy9jYWxjdWxhdGVTcXVhcmVkVGV4dHVyZVdpZHRoLmpzIiwianMvdXRpbHMvbG9hZFRleHQuanMiLCJqcy91dGlscy9sb2FkVGV4dHVyZS5qcyIsImpzL3V0aWxzL3JhbmRvbS5qcyIsImpzL3V0aWxzL3NpbXBsZXgyLmpzIiwianMvdmVuZG9yL0RldmljZU9yaWVudGF0aW9uQ29udHJvbHMuanMiLCJqcy92ZW5kb3IvT3JiaXRDb250cm9scy5qcyIsImpzL3ZlbmRvci9TdGF0cy5qcyIsImpzL3ZlbmRvci9TdGVyZW9FZmZlY3QuanMiLCJub2RlX21vZHVsZXMvZ2xzbGlmeS9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2dsc2xpZnkvc2ltcGxlLWFkYXB0ZXIuanMiLCJub2RlX21vZHVsZXMvZ3VscGZpbGUvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9wZXJsaW4tc2ltcGxleC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yc3ZwL2Rpc3QvcnN2cC5qcyIsIm5vZGVfbW9kdWxlcy90aHJlZS1nbHNsaWZ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3RocmVlLWdsc2xpZnkvdHlwZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6a0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNwTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3prREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgTGV2ZWxMb2FkZXIgPSByZXF1aXJlKCcuL0xldmVsTG9hZGVyJyk7XG5cbmZ1bmN0aW9uIGNhbWVsQ2FzZVRvU3BhY2VkKCBzdHJpbmcgKSB7XG5cdFxuXHRyZXR1cm4gc3RyaW5nXG5cdCAgICAucmVwbGFjZSgvKFtBLVpdKS9nLCAnICQxJylcblx0XHQucmVwbGFjZSgvXi4vLCBmdW5jdGlvbihzdHIpeyByZXR1cm4gc3RyLnRvVXBwZXJDYXNlKCk7IH0pXG5cdDtcblx0XHRcbn1cblxuJChmdW5jdGlvbigpIHtcblx0XG5cdHZhciBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpO1xuXHRcblx0dmFyIGxldmVscyA9IF8ua2V5cyggcmVxdWlyZSgnLi9sZXZlbHMnKSApO1xuXHRcblx0dmFyIGxldmVsVG9Mb2FkID0gXy5jb250YWlucyggbGV2ZWxzLCBoYXNoICkgPyBoYXNoIDogXy5maXJzdCggbGV2ZWxzICk7XG5cdFxuXHR3aW5kb3cubG9jYXRpb24uaGFzaCA9IGxldmVsVG9Mb2FkO1xuXHRcblx0JCgnI0xldmVsU2VsZWN0Jylcblx0XHQuYXBwZW5kKFxuXHRcdFxuXHRcdFx0Xy5yZWR1Y2UoIGxldmVscywgZnVuY3Rpb24oIG1lbW8sIGxldmVsICkge1xuXHRcdFx0XHRcblx0XHRcdFx0dmFyIGxldmVsUHJldHR5ID0gY2FtZWxDYXNlVG9TcGFjZWQoIGxldmVsICk7XG5cdFx0XHRcdHZhciBzZWxlY3RlZCA9IGxldmVsID09PSBsZXZlbFRvTG9hZCA/IFwiIHNlbGVjdGVkXCIgOiBcIlwiO1xuXG5cdFx0XHRcdHJldHVybiBtZW1vICsgXCI8b3B0aW9uIHZhbHVlPSdcIitsZXZlbCtcIidcIitzZWxlY3RlZCtcIj5cIitsZXZlbFByZXR0eStcIjwvb3B0aW9uPlwiO1xuXHRcdFx0XHRcblx0XHRcdH0sIFwiXCIpXG5cdFxuXHRcdClcblx0XHQub24oIFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGxldmVsID0gJCh0aGlzKS52YWwoKTtcblx0XHRcdExldmVsTG9hZGVyKCBsZXZlbCApO1xuXHRcdFx0d2luZG93LmxvY2F0aW9uLmhhc2ggPSBsZXZlbDtcblx0XHR9KVxuXHQ7XG5cblx0TGV2ZWxMb2FkZXIoIGxldmVsVG9Mb2FkICApO1xufSk7IiwiLy8gRGVjbGFyYXRpdmVseSBzZXQgdXAgdGhlIHNjZW5lIHVzaW5nIGEgbGV2ZWwgbWFuaWZlc3QuIEVhY2ggb2JqZWN0XG4vLyBpbiB0aGUgbGV2ZWwgbWFuaWZlc3QgZ2V0cyBpbml0aWF0ZWQgYXMgYSBwcm9wZXJ0eSBvbiB0aGUgcG9lbSBvYmplY3Rcbi8vIGFuZCBnZXRzIHBhc3NlZCB0aGUgcG9lbSBhcyB0aGUgZmlyc3QgdmFyaWFibGUsIGFuZCB0aGUgcHJvcGVydGllcyBhc1xuLy8gdGhlIHNlY29uZFxuXG52YXIgUG9lbSA9IHJlcXVpcmUoJy4vUG9lbScpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG5cbnZhciBjdXJyZW50TGV2ZWwgPSBudWxsO1xudmFyIGN1cnJlbnRQb2VtID0gbnVsbDtcblxud2luZG93LkxldmVsTG9hZGVyID0gZnVuY3Rpb24oIG5hbWUgKSB7XG5cdFxuXHRpZihjdXJyZW50UG9lbSkgY3VycmVudFBvZW0uZGVzdHJveSgpO1xuXHRcblx0Y3VycmVudExldmVsID0gbGV2ZWxzW25hbWVdO1xuXHRjdXJyZW50UG9lbSA9IG5ldyBQb2VtKCBjdXJyZW50TGV2ZWwgKTtcblx0d2luZG93LnBvZW0gPSBjdXJyZW50UG9lbTtcblxufTtcblx0XG5tb2R1bGUuZXhwb3J0cyA9IExldmVsTG9hZGVyOyIsInZhciBTdGF0cyA9IHJlcXVpcmUoJy4vdmVuZG9yL1N0YXRzJyk7XG52YXIgRXZlbnREaXNwYXRjaGVyID0gcmVxdWlyZSgnLi91dGlscy9FdmVudERpc3BhdGNoZXInKTtcbnZhciBDbG9jayA9IHJlcXVpcmUoJy4vdXRpbHMvQ2xvY2snKTtcbnZhciBDYW1lcmEgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvY2FtZXJhcy9DYW1lcmEnKTtcbnZhciBTdGVyZW9FZmZlY3QgPSByZXF1aXJlKCcuL3ZlbmRvci9TdGVyZW9FZmZlY3QnKTtcbnZhciBEZXZpY2VPcmllbnRhdGlvbkNvbnRyb2xzID0gcmVxdWlyZSgnLi92ZW5kb3IvRGV2aWNlT3JpZW50YXRpb25Db250cm9scycpO1xudmFyIF9yZW5kZXJlcjtcbnZhciBfd2ViR0xSZW5kZXJlcjtcblxudmFyIFBvZW0gPSBmdW5jdGlvbiggbGV2ZWwgKSB7XG5cblx0dGhpcy5yYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID49IDEgPyB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA6IDE7XG5cdFxuXHR0aGlzLmRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCAnY29udGFpbmVyJyApO1xuXHR0aGlzLiRkaXYgPSAkKHRoaXMuZGl2KTtcblx0dGhpcy5jYW52YXMgPSBudWxsO1xuXHR0aGlzLnNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG5cdHRoaXMucmVxdWVzdGVkRnJhbWUgPSB1bmRlZmluZWQ7XG5cblx0dGhpcy5jbG9jayA9IG5ldyBDbG9jaygpO1xuXHR0aGlzLmNhbWVyYSA9IG5ldyBDYW1lcmEoIHRoaXMsIF8uaXNPYmplY3QoIGxldmVsLmNvbmZpZy5jYW1lcmEgKSA/IGxldmVsLmNvbmZpZy5jYW1lcmEgOiB7fSApO1xuXHR0aGlzLnNjZW5lLmZvZyA9IG5ldyBUSFJFRS5Gb2coIDB4MjIyMjIyLCB0aGlzLmNhbWVyYS5vYmplY3QucG9zaXRpb24ueiAvIDIsIHRoaXMuY2FtZXJhLm9iamVjdC5wb3NpdGlvbi56ICogMiApO1xuXHRcblx0dGhpcy5hZGRSZW5kZXJlciggbGV2ZWwuY29uZmlnLnZyICk7XG5cdFxuXHR0aGlzLnBhcnNlTGV2ZWwoIGxldmVsICk7XG5cdFxuXHR0aGlzLmFkZEV2ZW50TGlzdGVuZXJzKCk7XG5cdFxuXHR0aGlzLmxvb3AoKTtcblx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvZW07XG5cblBvZW0ucHJvdG90eXBlID0ge1xuXHRcblx0cGFyc2VMZXZlbCA6IGZ1bmN0aW9uKCBsZXZlbCApIHtcblx0XHRfLmVhY2goIGxldmVsLm9iamVjdHMsIGZ1bmN0aW9uKCB2YWx1ZSwga2V5ICkge1xuXHRcdFx0aWYoXy5pc09iamVjdCggdmFsdWUgKSkge1xuXHRcdFx0XHR0aGlzWyBrZXkgXSA9IG5ldyB2YWx1ZS5vYmplY3QoIHRoaXMsIHZhbHVlLnByb3BlcnRpZXMgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXNbIGtleSBdID0gdmFsdWU7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHR9LCB0aGlzKTtcblx0fSxcblx0XG5cdGFkZFJlbmRlcmVyIDogZnVuY3Rpb24oIHVzZVZSICkge1xuXHRcdFx0XHRcblx0XHRpZighX3JlbmRlcmVyKSB7XG5cdFx0XHRfd2ViR0xSZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHtcblx0XHRcdFx0YWxwaGEgOiB0cnVlXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRpZiggdXNlVlIgKSB7XG5cdFx0XHRfcmVuZGVyZXIgPSBuZXcgU3RlcmVvRWZmZWN0KCBfd2ViR0xSZW5kZXJlciApO1xuXHRcdFx0X3JlbmRlcmVyLnNlcGFyYXRpb24gPSAxMDtcblx0XHRcdHRoaXMuaGlkZVVJKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdF9yZW5kZXJlciA9IF93ZWJHTFJlbmRlcmVyO1xuXHRcdFx0dGhpcy5zaG93VUkoKTtcblx0XHR9XG5cdFx0XG5cdFx0X3JlbmRlcmVyLnNldFNpemUoIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQgKTtcblx0XHR0aGlzLmRpdi5hcHBlbmRDaGlsZCggX3dlYkdMUmVuZGVyZXIuZG9tRWxlbWVudCApO1xuXHRcdHRoaXMuY2FudmFzID0gX3dlYkdMUmVuZGVyZXIuZG9tRWxlbWVudDtcblx0fSxcblx0XG5cdGhpZGVVSSA6IGZ1bmN0aW9uKCkge1xuXHRcdCQoJy5pbmZvLCAuY3JlZGl0cywgLmxldmVsLXNlbGVjdCcpLmhpZGUoKTtcblx0fSxcblx0XG5cdHNob3dVSSA6IGZ1bmN0aW9uKCkge1xuXG5cdFx0JCgnLmluZm8sIC5jcmVkaXRzLCAubGV2ZWwtc2VsZWN0Jykuc2hvdygpO1xuXHR9LFxuXHRcblx0YWRkU3RhdHMgOiBmdW5jdGlvbigpIHtcblxuXHR9LFxuXHRcblx0YWRkRXZlbnRMaXN0ZW5lcnMgOiBmdW5jdGlvbigpIHtcblx0XHQkKHdpbmRvdykub24oJ3Jlc2l6ZScsIHRoaXMucmVzaXplSGFuZGxlci5iaW5kKHRoaXMpKTtcblx0XHQkKHdpbmRvdykub24oJ2RldmljZW9yaWVudGF0aW9uJywgdGhpcy5yZXNpemVIYW5kbGVyLmJpbmQodGhpcykpO1xuXHR9LFxuXHRcblx0cmVzaXplSGFuZGxlciA6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdF9yZW5kZXJlci5zZXRTaXplKCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0ICk7XG5cdFx0dGhpcy5kaXNwYXRjaCggeyB0eXBlIDogXCJyZXNpemVcIiB9ICk7XG5cdFx0XG5cdH0sXG5cdFx0XHRcblx0bG9vcCA6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dGhpcy5yZXF1ZXN0ZWRGcmFtZSA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSggdGhpcy5sb29wLmJpbmQodGhpcykgKTtcblx0XHR0aGlzLnVwZGF0ZSgpO1xuXG5cdH0sXG5cdFx0XHRcblx0dXBkYXRlIDogZnVuY3Rpb24oKSB7XG5cdFx0XG5cdFx0dGhpcy5kaXNwYXRjaCh7XG5cdFx0XHR0eXBlOiBcInVwZGF0ZVwiLFxuXHRcdFx0ZHQ6IHRoaXMuY2xvY2suZ2V0RGVsdGEoKSxcblx0XHRcdHRpbWU6IHRoaXMuY2xvY2sudGltZVxuXHRcdH0pO1xuXHRcdFxuXHRcdF9yZW5kZXJlci5yZW5kZXIoIHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhLm9iamVjdCApO1xuXG5cdH0sXG5cdFxuXHRkZXN0cm95IDogZnVuY3Rpb24oKSB7XG5cdFx0XG5cdFx0d2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKCB0aGlzLnJlcXVlc3RlZEZyYW1lICk7XG5cdFx0XG5cdFx0dGhpcy5kaXNwYXRjaCh7XG5cdFx0XHR0eXBlOiBcImRlc3Ryb3lcIlxuXHRcdH0pO1xuXHR9XG59O1xuXG5FdmVudERpc3BhdGNoZXIucHJvdG90eXBlLmFwcGx5KCBQb2VtLnByb3RvdHlwZSApOyIsInZhciBJbmZvID0gZnVuY3Rpb24oIHBvZW0sIHByb3BlcnRpZXMgKSB7XG5cdFxuXHRpZiggcHJvcGVydGllcy5hcHBlbmRDcmVkaXRzICkgJCgnLmNyZWRpdHMnKS5hcHBlbmQoIHByb3BlcnRpZXMuYXBwZW5kQ3JlZGl0cyApO1xuXHRpZiggcHJvcGVydGllcy50aXRsZSApICQoXCIjaW5mby10aXRsZVwiKS50ZXh0KCBwcm9wZXJ0aWVzLnRpdGxlICk7XG5cdGlmKCBwcm9wZXJ0aWVzLnN1YnRpdGxlICkgJChcIiNpbmZvLXN1YnRpdGxlXCIpLnRleHQoIHByb3BlcnRpZXMuc3VidGl0bGUpO1xuXHRcblx0aWYoIHByb3BlcnRpZXMudGl0bGVDc3MgKSAkKFwiI2luZm8tdGl0bGVcIikuY3NzKCBwcm9wZXJ0aWVzLnRpdGxlQ3NzICk7XG5cdGlmKCBwcm9wZXJ0aWVzLnN1YnRpdGxlQ3NzICkgJChcIiNpbmZvLXN1YnRpdGxlXCIpLmNzcyggcHJvcGVydGllcy5zdWJ0aXRsZUNzcyApO1xuXHRcblx0XG5cdGlmKCBwcm9wZXJ0aWVzLmRvY3VtZW50VGl0bGUgKSBkb2N1bWVudC50aXRsZSA9IHByb3BlcnRpZXMuZG9jdW1lbnRUaXRsZTtcblx0XG5cdGlmKCBwcm9wZXJ0aWVzLnNob3dBcnJvd05leHQgKSAkKFwiLmFycm93LW5leHRcIikuc2hvdygpO1xuXG5cdCQoXCIjaW5mb1wiKS5zaG93KCk7XG5cdFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbmZvOyIsInZhciBTdGFycyA9IGZ1bmN0aW9uKCBwb2VtICkge1xuXHR0aGlzLnBvZW0gPSBwb2VtO1xuXHR0aGlzLm9iamVjdCA9IG51bGw7XG5cdFxuXHR0aGlzLmNvdW50ID0gMzAwMDA7XG5cdHRoaXMuZGVwdGggPSA1MDAwO1xuXHR0aGlzLm1pbkRlcHRoID0gNzAwO1xuXHR0aGlzLmNvbG9yID0gMHhhYWFhYWE7XG5cdFxuXHR0aGlzLmFkZE9iamVjdCgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdGFycztcblxuU3RhcnMucHJvdG90eXBlID0ge1xuXHRcblx0Z2VuZXJhdGVHZW9tZXRyeSA6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciByLCB0aGV0YSwgeCwgeSwgeiwgZ2VvbWV0cnk7XG5cdFx0XG5cdFx0Z2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcblx0XHRcblx0XHRmb3IodmFyIGk9MDsgaSA8IHRoaXMuY291bnQ7IGkrKykge1xuXHRcdFx0XG5cdFx0XHRyID0gTWF0aC5yYW5kb20oKSAqIHRoaXMuZGVwdGggKyB0aGlzLm1pbkRlcHRoO1xuXG5cdFx0XHR0aGV0YSA9IE1hdGgucmFuZG9tKCkgKiAyICogTWF0aC5QSTtcblx0XHRcdFxuXHRcdFx0eCA9IE1hdGguY29zKCB0aGV0YSApICogcjtcblx0XHRcdHogPSBNYXRoLnNpbiggdGhldGEgKSAqIHI7XG5cdFx0XHR5ID0gKDAuNSAtIE1hdGgucmFuZG9tKCkpICogdGhpcy5kZXB0aDtcblx0XHRcdFxuXHRcdFx0Z2VvbWV0cnkudmVydGljZXMucHVzaCggbmV3IFRIUkVFLlZlY3RvcjMoeCx5LHopICk7XG5cdFx0XHRcdFx0XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBnZW9tZXRyeTtcblx0fSxcblx0XG5cdGFkZE9iamVjdCA6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdHZhciBnZW9tZXRyeSwgbGluZU1hdGVyaWFsO1xuXHRcdFxuXHRcdGdlb21ldHJ5ID0gdGhpcy5nZW5lcmF0ZUdlb21ldHJ5KCk7XG5cdFx0XG5cdFx0XG5cdFx0dGhpcy5vYmplY3QgPSBuZXcgVEhSRUUuUG9pbnRDbG91ZChcblx0XHRcdGdlb21ldHJ5LFxuXHRcdFx0bmV3IFRIUkVFLlBvaW50Q2xvdWRNYXRlcmlhbCh7XG5cdFx0XHRcdCBzaXplOiAzICogdGhpcy5wb2VtLnJhdGlvLFxuXHRcdFx0XHQgY29sb3I6IHRoaXMuY29sb3IsXG5cdFx0XHRcdCBmb2c6IGZhbHNlXG5cdFx0XHR9XG5cdFx0KSApO1xuXHRcdFxuXHRcdHRoaXMucG9lbS5zY2VuZS5hZGQoIHRoaXMub2JqZWN0ICkgO1xuXHRcdFxuXHR9XG59OyIsInZhciBnbHNsaWZ5ID0gcmVxdWlyZShcImdsc2xpZnlcIik7XG52YXIgY3JlYXRlU2hhZGVyID0gcmVxdWlyZShcInRocmVlLWdsc2xpZnlcIikoVEhSRUUpO1xuXG5mdW5jdGlvbiBzZXR1cFRleHR1cmUobWVzaCwgc2NlbmUpIHtcbiAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgdmFyIHRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZShpbWcpO1xuICAgIGltZy5zcmMgPSBcImFzc2V0cy9pbWFnZXMvY2xvdWQxMDI0LnBuZ1wiO1xuICAgIHRleHR1cmUud3JhcFMgPSBUSFJFRS5SZXBlYXRXcmFwcGluZztcbiAgICB0ZXh0dXJlLndyYXBUID0gVEhSRUUuUmVwZWF0V3JhcHBpbmc7XG5cbiAgICAkKGltZykub24oXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICB0ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgc2NlbmUuYWRkKG1lc2gpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRleHR1cmU7XG59XG5cbnZhciBDbG91ZHMgPSBmdW5jdGlvbihwb2VtLCBwcm9wZXJ0aWVzKSB7XG4gICAgdmFyIGNvbmZpZyA9IF8uZXh0ZW5kKHtcbiAgICAgICAgd2lkdGg6IDUwMCxcbiAgICAgICAgb2Zmc2V0OiBuZXcgVEhSRUUuVmVjdG9yMigxLCAxKSxcbiAgICAgICAgY29sb3I6IG5ldyBUSFJFRS5WZWN0b3I0KDAuNSwgMSwgMC43LCAxKSxcbiAgICAgICAgaGVpZ2h0OiAtMjAwLFxuICAgICAgICByb3RhdGlvbjogTWF0aC5QSSAvIDJcbiAgICB9LCBwcm9wZXJ0aWVzKTtcblxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KGNvbmZpZy53aWR0aCwgY29uZmlnLndpZHRoKTtcbiAgICB2YXIgc2hhZGVyID0gY3JlYXRlU2hhZGVyKHJlcXVpcmUoXCJnbHNsaWZ5L3NpbXBsZS1hZGFwdGVyLmpzXCIpKFwiXFxuI2RlZmluZSBHTFNMSUZZIDFcXG5cXG52YXJ5aW5nIHZlYzIgdlV2O1xcbnZvaWQgbWFpbigpIHtcXG4gIHZVdiA9IHV2O1xcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTtcXG59XCIsIFwiXFxuI2RlZmluZSBHTFNMSUZZIDFcXG5cXG51bmlmb3JtIGZsb2F0IHRpbWU7XFxudW5pZm9ybSB2ZWM0IGNvbG9yO1xcbnVuaWZvcm0gdmVjMiBvZmZzZXQ7XFxudW5pZm9ybSBzYW1wbGVyMkQgdGV4dHVyZTtcXG52YXJ5aW5nIHZlYzIgdlV2O1xcbnZvaWQgbWFpbigpIHtcXG4gIHZlYzQgdGV4ZWwgPSB0ZXh0dXJlMkQodGV4dHVyZSwgdlV2ICogMC4xICsgKG9mZnNldCArIHRpbWUgKiAwLjAwMDAxKSAqIG9mZnNldCkgKyB0ZXh0dXJlMkQodGV4dHVyZSwgdlV2ICogMC4yMiArIChvZmZzZXQgKyB0aW1lICogMC4wMDAwMDU1KSAqIG9mZnNldCk7XFxuICBmbG9hdCBlZGdlcyA9IDAuNSAtIGxlbmd0aCh2VXYgLSAwLjUpO1xcbiAgZ2xfRnJhZ0NvbG9yID0gY29sb3IgKiBlZGdlcyAqIHZlYzQoMS4wLCAxLjAsIDEuMCwgdGV4ZWwudyAqIHRleGVsLncgKiAyLjUpO1xcbn1cIiwgW3tcIm5hbWVcIjpcInRpbWVcIixcInR5cGVcIjpcImZsb2F0XCJ9LHtcIm5hbWVcIjpcImNvbG9yXCIsXCJ0eXBlXCI6XCJ2ZWM0XCJ9LHtcIm5hbWVcIjpcIm9mZnNldFwiLFwidHlwZVwiOlwidmVjMlwifSx7XCJuYW1lXCI6XCJ0ZXh0dXJlXCIsXCJ0eXBlXCI6XCJzYW1wbGVyMkRcIn1dLCBbXSkpO1xuICAgIHNoYWRlci5zaWRlID0gVEhSRUUuQmFja1NpZGU7XG5cbiAgICBzaGFkZXIudW5pZm9ybXMgPSB7XG4gICAgICAgIHRpbWU6IHtcbiAgICAgICAgICAgIHR5cGU6IFwiZlwiLFxuICAgICAgICAgICAgdmFsdWU6IDBcbiAgICAgICAgfSxcblxuICAgICAgICB0ZXh0dXJlOiB7XG4gICAgICAgICAgICB0eXBlOiBcInRcIixcbiAgICAgICAgICAgIHZhbHVlOiBudWxsXG4gICAgICAgIH0sXG5cbiAgICAgICAgb2Zmc2V0OiB7XG4gICAgICAgICAgICB0eXBlOiBcInYyXCIsXG4gICAgICAgICAgICB2YWx1ZTogY29uZmlnLm9mZnNldFxuICAgICAgICB9LFxuXG4gICAgICAgIGNvbG9yOiB7XG4gICAgICAgICAgICB0eXBlOiBcInY0XCIsXG4gICAgICAgICAgICB2YWx1ZTogY29uZmlnLmNvbG9yXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKHNoYWRlcik7XG4gICAgbWF0ZXJpYWwudHJhbnNwYXJlbnQgPSB0cnVlO1xuICAgIG1hdGVyaWFsLmJsZW5kaW5nID0gVEhSRUUuQWRkaXRpdmVCbGVuZGluZztcbiAgICBtYXRlcmlhbC5zaWRlID0gVEhSRUUuRG91YmxlU2lkZTtcbiAgICBtYXRlcmlhbC5kZXB0aFRlc3QgPSBmYWxzZTtcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG4gICAgbWVzaC5yb3RhdGlvbi54ID0gY29uZmlnLnJvdGF0aW9uO1xuICAgIG1lc2gucG9zaXRpb24ueSA9IGNvbmZpZy5oZWlnaHQ7XG4gICAgbWVzaC5zY2FsZS5tdWx0aXBseVNjYWxhcigxMCk7XG4gICAgc2hhZGVyLnVuaWZvcm1zLnRleHR1cmUudmFsdWUgPSBzZXR1cFRleHR1cmUobWVzaCwgcG9lbS5zY2VuZSk7XG5cbiAgICBwb2VtLm9uKFwidXBkYXRlXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIGNhbWVyYVBvc2l0aW9uID0gcG9lbS5jYW1lcmEub2JqZWN0LnBvc2l0aW9uO1xuICAgICAgICBzaGFkZXIudW5pZm9ybXMudGltZS52YWx1ZSA9IGUudGltZTtcbiAgICAgICAgbWVzaC5wb3NpdGlvbi5zZXQoY2FtZXJhUG9zaXRpb24ueCwgbWVzaC5wb3NpdGlvbi55LCBjYW1lcmFQb3NpdGlvbi56KTtcbiAgICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2xvdWRzOyIsInZhciBnbHNsaWZ5ID0gcmVxdWlyZShcImdsc2xpZnlcIik7XG52YXIgY3JlYXRlU2hhZGVyID0gcmVxdWlyZShcInRocmVlLWdsc2xpZnlcIikoVEhSRUUpO1xuXG52YXIgU2t5ID0gZnVuY3Rpb24ocG9lbSwgcHJvcGVydGllcykge1xuICAgIHZhciBjb25maWcgPSBfLmV4dGVuZCh7XG4gICAgICAgIHdpZHRoOiA1MDAwXG4gICAgfSwgcHJvcGVydGllcyk7XG5cbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoY29uZmlnLndpZHRoLCAzMiwgMTUpO1xuICAgIHZhciBzaGFkZXIgPSBjcmVhdGVTaGFkZXIocmVxdWlyZShcImdsc2xpZnkvc2ltcGxlLWFkYXB0ZXIuanNcIikoXCJcXG4jZGVmaW5lIEdMU0xJRlkgMVxcblxcbnVuaWZvcm0gZmxvYXQgdGltZTtcXG52YXJ5aW5nIHZlYzQgdkNvbG9yO1xcbnZhcnlpbmcgdmVjMiB2VXY7XFxudmVjNCBhX3hfbW9kMjg5KHZlYzQgeCkge1xcbiAgcmV0dXJuIHggLSBmbG9vcih4ICogKDEuMCAvIDI4OS4wKSkgKiAyODkuMDtcXG59XFxuZmxvYXQgYV94X21vZDI4OShmbG9hdCB4KSB7XFxuICByZXR1cm4geCAtIGZsb29yKHggKiAoMS4wIC8gMjg5LjApKSAqIDI4OS4wO1xcbn1cXG52ZWM0IGFfeF9wZXJtdXRlKHZlYzQgeCkge1xcbiAgcmV0dXJuIGFfeF9tb2QyODkoKCh4ICogMzQuMCkgKyAxLjApICogeCk7XFxufVxcbmZsb2F0IGFfeF9wZXJtdXRlKGZsb2F0IHgpIHtcXG4gIHJldHVybiBhX3hfbW9kMjg5KCgoeCAqIDM0LjApICsgMS4wKSAqIHgpO1xcbn1cXG52ZWM0IGFfeF90YXlsb3JJbnZTcXJ0KHZlYzQgcikge1xcbiAgcmV0dXJuIDEuNzkyODQyOTE0MDAxNTkgLSAwLjg1MzczNDcyMDk1MzE0ICogcjtcXG59XFxuZmxvYXQgYV94X3RheWxvckludlNxcnQoZmxvYXQgcikge1xcbiAgcmV0dXJuIDEuNzkyODQyOTE0MDAxNTkgLSAwLjg1MzczNDcyMDk1MzE0ICogcjtcXG59XFxudmVjNCBhX3hfZ3JhZDQoZmxvYXQgaiwgdmVjNCBpcCkge1xcbiAgY29uc3QgdmVjNCBvbmVzID0gdmVjNCgxLjAsIDEuMCwgMS4wLCAtMS4wKTtcXG4gIHZlYzQgcCwgcztcXG4gIHAueHl6ID0gZmxvb3IoZnJhY3QodmVjMyhqKSAqIGlwLnh5eikgKiA3LjApICogaXAueiAtIDEuMDtcXG4gIHAudyA9IDEuNSAtIGRvdChhYnMocC54eXopLCBvbmVzLnh5eik7XFxuICBzID0gdmVjNChsZXNzVGhhbihwLCB2ZWM0KDAuMCkpKTtcXG4gIHAueHl6ID0gcC54eXogKyAocy54eXogKiAyLjAgLSAxLjApICogcy53d3c7XFxuICByZXR1cm4gcDtcXG59XFxuI2RlZmluZSBGNCAwLjMwOTAxNjk5NDM3NDk0NzQ1MVxcblxcbmZsb2F0IGFfeF9zbm9pc2UodmVjNCB2KSB7XFxuICBjb25zdCB2ZWM0IEMgPSB2ZWM0KDAuMTM4MTk2NjAxMTI1MDExLCAwLjI3NjM5MzIwMjI1MDAyMSwgMC40MTQ1ODk4MDMzNzUwMzIsIC0wLjQ0NzIxMzU5NTQ5OTk1OCk7XFxuICB2ZWM0IGkgPSBmbG9vcih2ICsgZG90KHYsIHZlYzQoRjQpKSk7XFxuICB2ZWM0IHgwID0gdiAtIGkgKyBkb3QoaSwgQy54eHh4KTtcXG4gIHZlYzQgaTA7XFxuICB2ZWMzIGlzWCA9IHN0ZXAoeDAueXp3LCB4MC54eHgpO1xcbiAgdmVjMyBpc1laID0gc3RlcCh4MC56d3csIHgwLnl5eik7XFxuICBpMC54ID0gaXNYLnggKyBpc1gueSArIGlzWC56O1xcbiAgaTAueXp3ID0gMS4wIC0gaXNYO1xcbiAgaTAueSArPSBpc1laLnggKyBpc1laLnk7XFxuICBpMC56dyArPSAxLjAgLSBpc1laLnh5O1xcbiAgaTAueiArPSBpc1laLno7XFxuICBpMC53ICs9IDEuMCAtIGlzWVouejtcXG4gIHZlYzQgaTMgPSBjbGFtcChpMCwgMC4wLCAxLjApO1xcbiAgdmVjNCBpMiA9IGNsYW1wKGkwIC0gMS4wLCAwLjAsIDEuMCk7XFxuICB2ZWM0IGkxID0gY2xhbXAoaTAgLSAyLjAsIDAuMCwgMS4wKTtcXG4gIHZlYzQgeDEgPSB4MCAtIGkxICsgQy54eHh4O1xcbiAgdmVjNCB4MiA9IHgwIC0gaTIgKyBDLnl5eXk7XFxuICB2ZWM0IHgzID0geDAgLSBpMyArIEMuenp6ejtcXG4gIHZlYzQgeDQgPSB4MCArIEMud3d3dztcXG4gIGkgPSBhX3hfbW9kMjg5KGkpO1xcbiAgZmxvYXQgajAgPSBhX3hfcGVybXV0ZShhX3hfcGVybXV0ZShhX3hfcGVybXV0ZShhX3hfcGVybXV0ZShpLncpICsgaS56KSArIGkueSkgKyBpLngpO1xcbiAgdmVjNCBqMSA9IGFfeF9wZXJtdXRlKGFfeF9wZXJtdXRlKGFfeF9wZXJtdXRlKGFfeF9wZXJtdXRlKGkudyArIHZlYzQoaTEudywgaTIudywgaTMudywgMS4wKSkgKyBpLnogKyB2ZWM0KGkxLnosIGkyLnosIGkzLnosIDEuMCkpICsgaS55ICsgdmVjNChpMS55LCBpMi55LCBpMy55LCAxLjApKSArIGkueCArIHZlYzQoaTEueCwgaTIueCwgaTMueCwgMS4wKSk7XFxuICB2ZWM0IGlwID0gdmVjNCgxLjAgLyAyOTQuMCwgMS4wIC8gNDkuMCwgMS4wIC8gNy4wLCAwLjApO1xcbiAgdmVjNCBwMCA9IGFfeF9ncmFkNChqMCwgaXApO1xcbiAgdmVjNCBwMSA9IGFfeF9ncmFkNChqMS54LCBpcCk7XFxuICB2ZWM0IHAyID0gYV94X2dyYWQ0KGoxLnksIGlwKTtcXG4gIHZlYzQgcDMgPSBhX3hfZ3JhZDQoajEueiwgaXApO1xcbiAgdmVjNCBwNCA9IGFfeF9ncmFkNChqMS53LCBpcCk7XFxuICB2ZWM0IG5vcm0gPSBhX3hfdGF5bG9ySW52U3FydCh2ZWM0KGRvdChwMCwgcDApLCBkb3QocDEsIHAxKSwgZG90KHAyLCBwMiksIGRvdChwMywgcDMpKSk7XFxuICBwMCAqPSBub3JtLng7XFxuICBwMSAqPSBub3JtLnk7XFxuICBwMiAqPSBub3JtLno7XFxuICBwMyAqPSBub3JtLnc7XFxuICBwNCAqPSBhX3hfdGF5bG9ySW52U3FydChkb3QocDQsIHA0KSk7XFxuICB2ZWMzIG0wID0gbWF4KDAuNiAtIHZlYzMoZG90KHgwLCB4MCksIGRvdCh4MSwgeDEpLCBkb3QoeDIsIHgyKSksIDAuMCk7XFxuICB2ZWMyIG0xID0gbWF4KDAuNiAtIHZlYzIoZG90KHgzLCB4MyksIGRvdCh4NCwgeDQpKSwgMC4wKTtcXG4gIG0wID0gbTAgKiBtMDtcXG4gIG0xID0gbTEgKiBtMTtcXG4gIHJldHVybiA0OS4wICogKGRvdChtMCAqIG0wLCB2ZWMzKGRvdChwMCwgeDApLCBkb3QocDEsIHgxKSwgZG90KHAyLCB4MikpKSArIGRvdChtMSAqIG0xLCB2ZWMyKGRvdChwMywgeDMpLCBkb3QocDQsIHg0KSkpKTtcXG59XFxudmVjMyBiX3hfaHN2MnJnYih2ZWMzIGMpIHtcXG4gIHZlYzQgSyA9IHZlYzQoMS4wLCAyLjAgLyAzLjAsIDEuMCAvIDMuMCwgMy4wKTtcXG4gIHZlYzMgcCA9IGFicyhmcmFjdChjLnh4eCArIEsueHl6KSAqIDYuMCAtIEsud3d3KTtcXG4gIHJldHVybiBjLnogKiBtaXgoSy54eHgsIGNsYW1wKHAgLSBLLnh4eCwgMC4wLCAxLjApLCBjLnkpO1xcbn1cXG5mbG9hdCBpblJhbmdlKGluIGZsb2F0IHZhbHVlLCBpbiBmbG9hdCBzdGFydCwgaW4gZmxvYXQgc3RvcCkge1xcbiAgcmV0dXJuIG1pbigxLjAsIG1heCgwLjAsICh2YWx1ZSAtIHN0YXJ0KSAvIChzdG9wIC0gc3RhcnQpKSk7XFxufVxcbnZlYzQgY2FsY3VsYXRlQ29sb3IoaW4gdmVjMiB1diwgaW4gdmVjMyBwb3NpdGlvbikge1xcbiAgZmxvYXQgZ3JhZGllbnQgPSBpblJhbmdlKHV2LnksIDAuNTUsIDAuNykgKyBpblJhbmdlKHV2LnksIDAuNDUsIDAuMyk7XFxuICBmbG9hdCBub2lzZSA9IGFfeF9zbm9pc2UodmVjNChwb3NpdGlvbiAqIDAuMDMsIHRpbWUgKiAwLjAwMDEpKTtcXG4gIHZlYzMgY29sb3IgPSBiX3hfaHN2MnJnYih2ZWMzKG1heCgwLjAsIG5vaXNlKSAqIDAuMiArIDAuNCwgMS4wLCAxLjApKTtcXG4gIHJldHVybiB2ZWM0KGNvbG9yLCBub2lzZSAqIGdyYWRpZW50KTtcXG59XFxudm9pZCBtYWluKCkge1xcbiAgdlV2ID0gdXY7XFxuICB2Q29sb3IgPSBjYWxjdWxhdGVDb2xvcih1diwgcG9zaXRpb24pO1xcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTtcXG59XCIsIFwiXFxuI2RlZmluZSBHTFNMSUZZIDFcXG5cXG52YXJ5aW5nIHZlYzQgdkNvbG9yO1xcbnZvaWQgbWFpbigpIHtcXG4gIGdsX0ZyYWdDb2xvciA9IHZDb2xvcjtcXG59XCIsIFt7XCJuYW1lXCI6XCJ0aW1lXCIsXCJ0eXBlXCI6XCJmbG9hdFwifV0sIFtdKSk7XG4gICAgc2hhZGVyLnNpZGUgPSBUSFJFRS5CYWNrU2lkZTtcblxuICAgIHNoYWRlci51bmlmb3JtcyA9IHtcbiAgICAgICAgdGltZToge1xuICAgICAgICAgICAgdHlwZTogXCJmXCIsXG4gICAgICAgICAgICB2YWx1ZTogMFxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbChzaGFkZXIpO1xuICAgIG1hdGVyaWFsLnRyYW5zcGFyZW50ID0gdHJ1ZTtcbiAgICBtYXRlcmlhbC5ibGVuZGluZyA9IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmc7XG4gICAgbWF0ZXJpYWwuZGVwdGhUZXN0ID0gZmFsc2U7XG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuICAgIHBvZW0uc2NlbmUuYWRkKG1lc2gpO1xuXG4gICAgcG9lbS5vbihcInVwZGF0ZVwiLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIHNoYWRlci51bmlmb3Jtcy50aW1lLnZhbHVlID0gZS50aW1lO1xuICAgICAgICBtZXNoLnBvc2l0aW9uLmNvcHkocG9lbS5jYW1lcmEub2JqZWN0LnBvc2l0aW9uKTtcbiAgICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2t5OyIsInZhciBDYW1lcmEgPSBmdW5jdGlvbiggcG9lbSwgcHJvcGVydGllcyApIHtcblx0XG5cdHRoaXMucG9lbSA9IHBvZW07XG5cdFx0XG5cdHRoaXMub2JqZWN0ID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKFxuXHRcdHByb3BlcnRpZXMuZm92IHx8IDUwLFx0XHRcdFx0XHQvLyBmb3Zcblx0XHR3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCxcdC8vIGFzcGVjdCByYXRpb1xuXHRcdHByb3BlcnRpZXMubmVhciB8fCAzLFx0XHRcdFx0XHQvLyBuZWFyIGZydXN0dW1cblx0XHRwcm9wZXJ0aWVzLmZhciB8fCAxMDAwMFx0XHRcdFx0XHQvLyBmYXIgZnJ1c3R1bVxuXHQpO1xuXHRcblx0dGhpcy5vYmplY3QucG9zaXRpb24ueCA9IF8uaXNOdW1iZXIoIHByb3BlcnRpZXMueCApID8gcHJvcGVydGllcy54IDogMDtcblx0dGhpcy5vYmplY3QucG9zaXRpb24ueSA9IF8uaXNOdW1iZXIoIHByb3BlcnRpZXMueSApID8gcHJvcGVydGllcy55IDogMDtcblx0dGhpcy5vYmplY3QucG9zaXRpb24ueiA9IF8uaXNOdW1iZXIoIHByb3BlcnRpZXMueiApID8gcHJvcGVydGllcy56IDogNTAwO1xuXHRcblx0dGhpcy5wb2VtLnNjZW5lLmFkZCggdGhpcy5vYmplY3QgKTtcblx0XG5cdHRoaXMucG9lbS5vbiggJ3Jlc2l6ZScsIHRoaXMucmVzaXplLmJpbmQodGhpcykgKTtcblx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbWVyYTtcblxuQ2FtZXJhLnByb3RvdHlwZSA9IHtcblx0XG5cdHJlc2l6ZSA6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMub2JqZWN0LmFzcGVjdCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xuXHRcdHRoaXMub2JqZWN0LnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcblx0fVxufTsiLCJ2YXIgT3JiaXRDb250cm9scyA9IHJlcXVpcmUoJy4uLy4uL3ZlbmRvci9PcmJpdENvbnRyb2xzJyk7XG5cbnZhciBDb250cm9scyA9IGZ1bmN0aW9uKCBwb2VtLCBwcm9wZXJ0aWVzICkge1xuXHRcblx0dGhpcy5wb2VtID0gcG9lbTtcblx0dGhpcy5wcm9wZXJ0aWVzID0gcHJvcGVydGllcztcblxuXHR0aGlzLmNvbnRyb2xzID0gbmV3IE9yYml0Q29udHJvbHMoIHRoaXMucG9lbS5jYW1lcmEub2JqZWN0LCB0aGlzLnBvZW0uY2FudmFzICk7XG5cdFxuXHRfLmV4dGVuZCggdGhpcy5jb250cm9scywgcHJvcGVydGllcyApO1xuXHRcblx0dGhpcy5wb2VtLm9uKCAndXBkYXRlJywgdGhpcy5jb250cm9scy51cGRhdGUuYmluZCggdGhpcy5jb250cm9scyApICk7XG5cdFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9scztcbiIsInZhciBPcmJpdENvbnRyb2xzID0gcmVxdWlyZSgnLi4vLi4vdmVuZG9yL09yYml0Q29udHJvbHMnKTtcbnZhciBEZXZpY2VPcmllbnRhdGlvbkNvbnRyb2xzID0gcmVxdWlyZSgnLi4vLi4vdmVuZG9yL0RldmljZU9yaWVudGF0aW9uQ29udHJvbHMnKTtcbnZhciBfZTtcblxuJCh3aW5kb3cpLm9uZSggJ2RldmljZW9yaWVudGF0aW9uJywgZnVuY3Rpb24oIGUgKSB7XG5cdF9lID0gZTtcbn0pO1xuXG5cbnZhciBPcmllbnRhdGlvbiA9IGZ1bmN0aW9uKCBwb2VtICkge1xuXHRcblx0dGhpcy5wb2VtID0gcG9lbTtcblx0dGhpcy5jYW1lcmEgPSB0aGlzLnBvZW0uY2FtZXJhLm9iamVjdDtcblx0XG5cdHRoaXMuY29udHJvbHMgPSBuZXcgT3JiaXRDb250cm9scyggdGhpcy5jYW1lcmEsIHRoaXMucG9lbS5jYW52YXMgKTtcblx0dGhpcy5jb250cm9scy5yb3RhdGVVcChNYXRoLlBJIC8gNCk7XG5cdHRoaXMuY29udHJvbHMudGFyZ2V0LnNldChcblx0XHR0aGlzLmNhbWVyYS5wb3NpdGlvbi54ICsgMC4xLFxuXHRcdHRoaXMuY2FtZXJhLnBvc2l0aW9uLnksXG5cdFx0dGhpcy5jYW1lcmEucG9zaXRpb24uelxuXHQpO1xuXHR0aGlzLmNvbnRyb2xzLm5vWm9vbSA9IHRydWU7XG5cdHRoaXMuY29udHJvbHMubm9QYW4gPSB0cnVlO1xuXG5cdHRoaXMuZGV2aWNlT3JpZW50YXRpb25IYW5kbGVyID0gdGhpcy5zZXRPcmllbnRhdGlvbkNvbnRyb2xzLmJpbmQodGhpcyk7XG5cblx0JCh3aW5kb3cpLm9uKCAnZGV2aWNlb3JpZW50YXRpb24nLCB0aGlzLmRldmljZU9yaWVudGF0aW9uSGFuZGxlciApO1xuXHRcblx0dGhpcy5wb2VtLm9uKCAndXBkYXRlJywgdGhpcy51cGRhdGUuYmluZCh0aGlzKSApO1xuXHR0aGlzLnBvZW0ub24oICdkZXN0cm95JywgdGhpcy5kZXN0cm95LmJpbmQodGhpcykgKTtcblx0XG5cdGlmKCBfZSApIHRoaXMuc2V0T3JpZW50YXRpb25Db250cm9scyggX2UgKTtcblx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9yaWVudGF0aW9uO1xuXG5PcmllbnRhdGlvbi5wcm90b3R5cGUgPSB7XG5cblx0c2V0T3JpZW50YXRpb25Db250cm9scyA6IGZ1bmN0aW9uKCBlICkge1xuXHRcdC8vIGlmKCAhZS5vcmlnaW5hbEV2ZW50LmFscGhhICkge1xuXHRcdC8vIFx0cmV0dXJuO1xuXHRcdC8vIH1cblxuXHRcdHRoaXMuY29udHJvbHMgPSBuZXcgRGV2aWNlT3JpZW50YXRpb25Db250cm9scyggdGhpcy5jYW1lcmEsIHRydWUgKTtcblx0XHR0aGlzLmNvbnRyb2xzLmNvbm5lY3QoKTtcblx0XHR0aGlzLmNvbnRyb2xzLnVwZGF0ZSgpO1xuXG5cdFx0JCh3aW5kb3cpLm9mZiggJ2RldmljZW9yaWVudGF0aW9uJywgdGhpcy5kZXZpY2VPcmllbnRhdGlvbkhhbmRsZXIgKTtcblx0fSxcblx0XG5cdHVwZGF0ZSA6IGZ1bmN0aW9uKCBlICkge1xuXHRcdHRoaXMuY29udHJvbHMudXBkYXRlKCk7XG5cdH0sXG5cdFxuXHRkZXN0cm95IDogZnVuY3Rpb24oIGUgKSB7XG5cdFx0JCh3aW5kb3cpLm9mZiggJ2RldmljZW9yaWVudGF0aW9uJywgdGhpcy5kZXZpY2VPcmllbnRhdGlvbkhhbmRsZXIgKTtcblx0fVxuXHRcbn07IiwidmFyIFJvdGF0ZUFyb3VuZE9yaWdpbiA9IGZ1bmN0aW9uKCBwb2VtICkge1xuXHRcblx0dmFyIGNhbWVyYSA9IHBvZW0uY2FtZXJhLm9iamVjdDtcblx0dmFyIHNwZWVkID0gMC4wMDAwNTtcblx0dmFyIGJhc2VZID0gY2FtZXJhLnBvc2l0aW9uLnk7XG5cdHZhciBiYXNlWiA9IGNhbWVyYS5wb3NpdGlvbi56IC8gMjtcblx0XG5cdHBvZW0ub24oJ3VwZGF0ZScsIGZ1bmN0aW9uKCBlICkge1xuXHRcdFxuXHRcdHBvZW0uZ3JpZC5ncmlkLnJvdGF0aW9uLnkgKz0gZS5kdCAqIHNwZWVkO1xuXHRcdGlmKCBwb2VtLnBvaW50Y2xvdWQub2JqZWN0ICkge1xuXHRcdFx0cG9lbS5wb2ludGNsb3VkLm9iamVjdC5yb3RhdGlvbi55ICs9IGUuZHQgKiBzcGVlZDtcblx0XHR9XG5cdFx0XG5cdFx0Y2FtZXJhLnBvc2l0aW9uLnkgPSBiYXNlWSArIE1hdGguc2luKCBlLnRpbWUgKiBzcGVlZCAqIDEwICkgKiAyMDA7XG5cdFx0Y2FtZXJhLnBvc2l0aW9uLnogPSBiYXNlWSArIE1hdGguc2luKCBlLnRpbWUgKiBzcGVlZCAqIDEwICkgKiBiYXNlWjtcblx0XHRcblx0XHRcblx0fSk7XG5cdFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBSb3RhdGVBcm91bmRPcmlnaW47XG5cblJvdGF0ZUFyb3VuZE9yaWdpbi5wcm90b3R5cGUgPSB7XG5cbn07IiwidmFyIFRyYWNrQ2FtZXJhTGlnaHRzID0gZnVuY3Rpb24oIHBvZW0sIHByb3BlcnRpZXMgKSB7XG5cdFxuXHR0aGlzLmxpZ2h0cyA9IFtdO1xuXHRcblx0dmFyIGFtYmllbnQgPSBuZXcgVEhSRUUuQW1iaWVudExpZ2h0KCAweDExMTExMSwgMSwgMCApO1xuXHRcdGFtYmllbnQucG9zaXRpb24uc2V0KDAsIDIwMDAsIDEwMDApO1xuXHRcblx0dmFyIGZyb250ID0gbmV3IFRIUkVFLlBvaW50TGlnaHQoIDB4ZmZmZmZmLCAwLjMsIDAgKTtcblxuXHR2YXIgcmlnaHRGaWxsID0gbmV3IFRIUkVFLlBvaW50TGlnaHQoIDB4ZmZmZmZmLCAxLCAwICk7XG5cdFx0cmlnaHRGaWxsLnBvc2l0aW9uLnNldCgzMDAwLCAyMDAwLCA1MDAwKTtcblx0XG5cdHZhciByaW1Cb3R0b20gPSBuZXcgVEhSRUUuUG9pbnRMaWdodCggMHhmZmZmZmYsIDEsIDAgKTtcblx0XHRyaW1Cb3R0b20ucG9zaXRpb24uc2V0KC0xMDAwLCAtMTAwMCwgLTEwMDApO1xuXHRcdFxuXHR2YXIgcmltQmFja0xlZnQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCggMHhmZmZmZmYsIDIsIDAgKTtcblx0XHRyaW1CYWNrTGVmdC5wb3NpdGlvbi5zZXQoLTcwMCwgNTAwLCAtMTAwMCk7XG5cdFxuXHRwb2VtLnNjZW5lLmFkZCggYW1iaWVudCApO1xuXHQvLyBwb2VtLmNhbWVyYS5vYmplY3QuYWRkKCBmcm9udCApO1xuXHRwb2VtLmNhbWVyYS5vYmplY3QuYWRkKCByaWdodEZpbGwgKTtcblx0cG9lbS5jYW1lcmEub2JqZWN0LmFkZCggcmltQm90dG9tICk7XG5cdHBvZW0uY2FtZXJhLm9iamVjdC5hZGQoIHJpbUJhY2tMZWZ0ICk7XG5cdFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUcmFja0NhbWVyYUxpZ2h0cztcblxuVHJhY2tDYW1lcmFMaWdodHMucHJvdG90eXBlID0ge1xuXG59OyIsInZhciBNckRvb2JTdGF0cyA9IHJlcXVpcmUoJy4uLy4uL3ZlbmRvci9TdGF0cycpO1xuXG52YXIgU3RhdHMgPSBmdW5jdGlvbiggcG9lbSApIHtcblx0XG5cdHRoaXMucG9lbSA9IHBvZW07XG5cdFxuXHR0aGlzLnN0YXRzID0gbmV3IE1yRG9vYlN0YXRzKCk7XG5cdHRoaXMuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG5cdHRoaXMuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4Jztcblx0JCggdGhpcy5wb2VtLmRpdiApLmFwcGVuZCggdGhpcy5zdGF0cy5kb21FbGVtZW50ICk7XG5cdFxuXHR0aGlzLnBvZW0ub24oICd1cGRhdGUnLCB0aGlzLnN0YXRzLnVwZGF0ZS5iaW5kKCB0aGlzLnN0YXRzICkgKTtcblx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXRzOyIsInZhciByYW5kb20gPSByZXF1aXJlKCcuLi91dGlscy9yYW5kb20nKVxuICAsIGxvYWRUZXh0dXJlXHQ9IHJlcXVpcmUoJy4uL3V0aWxzL2xvYWRUZXh0dXJlJylcbiAgLCBSU1ZQID0gcmVxdWlyZSgncnN2cCcpO1xuXG52YXIgRWFydGggPSBmdW5jdGlvbihwb2VtLCBwcm9wZXJ0aWVzKSB7XG5cdFxuXHR0aGlzLnBvZW0gPSBwb2VtO1xuXHRcblx0dGhpcy5nZW9tZXRyeSA9IG51bGw7XG5cdHRoaXMubWF0ZXJpYWwgPSBudWxsO1xuICAgIHRoaXMubWVzaCA9IG51bGw7XG5cdHRoaXMudGV4dHVyZSA9IG51bGw7XG5cdFxuXHQkKCcjTGV2ZWxTZWxlY3QnKS5oaWRlKCk7XG5cdFxuXHR0aGlzLnJhZGl1cyA9IHByb3BlcnRpZXMucmFkaXVzID4gMCA/IHByb3BlcnRpZXMucmFkaXVzIDogMjUwO1xuXG5cdHZhciAkYSA9ICQoXCI8YSBocmVmPSdodHRwOi8vc3ZzLmdzZmMubmFzYS5nb3YvY2dpLWJpbi9kZXRhaWxzLmNnaT9haWQ9MTE3MTknPjwvYT5cIik7XG5cdCRhLmFwcGVuZCggJChcIjxpbWcgY2xhc3M9J25hc2EtbG9nbyB3aWRlJyBzcmM9J2Fzc2V0cy9pbWFnZXMvbmFzYS1nb2RkYXJkLnBuZycgLz5cIikgKTtcblx0JGEuYXR0cihcInRpdGxlXCIsIFwiTWFwIHZpc3VhbGl6YXRpb24gY3JlZGl0IHRvIE5BU0EncyBHb2RkYXJkIFNwYWNlIEZsaWdodCBDZW50ZXJcIik7XG5cdFxuXHR0aGlzLnBvZW0uJGRpdi5hcHBlbmQoICRhICk7XG5cdFxuXHR0aGlzLnN0YXJ0KCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVhcnRoO1xuXG5FYXJ0aC5wcm90b3R5cGUgPSB7XG5cdFxuXHRzdGFydCA6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdHRoaXMuY3JlYXRlVGV4dHVyZSgpO1xuXG5cdFx0dGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSggdGhpcy5yYWRpdXMsIDY0LCA2NCApO1xuXHRcdHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuXHRcdFx0bWFwOiB0aGlzLnRleHR1cmUsXG5cdFx0XHRzaGluaW5lc3M6IDI1LFxuXHRcdFx0c3BlY3VsYXI6IDB4MTExMTExLFxuXHRcdFx0Ly8gY29sb3I6IDB4ZmYwMDAwXG5cdFx0fSk7XG5cdFxuXHRcdHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKCB0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsICk7XG5cdFxuXHRcdHRoaXMucG9lbS5zY2VuZS5hZGQoIHRoaXMubWVzaCApO1xuXHRcblx0XHR0aGlzLnBvZW0ub24oICd1cGRhdGUnLCB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpICk7XG5cdFx0XG5cdH0sXG5cdFxuXHRjcmVhdGVUZXh0dXJlIDogZnVuY3Rpb24oKSB7XG5cdFx0XG5cdFx0dGhpcy52aWRlbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICd2aWRlbycgKTtcblx0XHR0aGlzLiR2aWRlbyA9ICQodGhpcy52aWRlbyk7XG5cblx0XHQvLyB0aGlzLnZpZGVvLm11dGVkID0gdHJ1ZTtcblx0XHR0aGlzLnZpZGVvLmNvbnRyb2xzID0gdHJ1ZTtcblx0XHR0aGlzLnZpZGVvLmxvb3AgPSB0cnVlO1xuXHRcdFxuXHRcdC8vIHRoaXMucG9lbS4kZGl2LmFwcGVuZCggdGhpcy52aWRlbyApO1xuXHRcdFxuXHRcdC8vIHRoaXMuJHZpZGVvLmNzcyh7XG5cdFx0Ly8gXHRwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxuXHRcdC8vIFx0dG9wOiAwLFxuXHRcdC8vIFx0bGVmdDogMFxuXHRcdC8vIH0pO1xuXHRcdFxuXHRcdC8vIHdpbmRvdy52ID0gdGhpcy52aWRlbztcblx0XHRcblx0XHRcblx0XHQvLyB2aWRlby5pZCA9ICd2aWRlbyc7XG5cdFx0Ly8gdmlkZW8udHlwZSA9ICcgdmlkZW8vb2dnOyBjb2RlY3M9XCJ0aGVvcmEsIHZvcmJpc1wiICc7XG5cdFx0Ly8gdGhpcy52aWRlby5zcmMgPSBcImFzc2V0cy92aWRlby9lYXJ0aGNvMi5tNHZcIjtcblx0XHRcblx0XHRcdFxuXHRcdGlmKCB0aGlzLnZpZGVvLmNhblBsYXlUeXBlKFwidmlkZW8vbXA0XCIpICkge1xuXHRcdFx0XG5cdFx0XHR0aGlzLnZpZGVvLnNyYyA9IFwiYXNzZXRzL3ZpZGVvL2VhcnRoY28yLWxhcmdlLm1wNFwiO1xuXHRcdFx0XG5cdFx0fSBlbHNlIHtcblx0XHRcdFxuXHRcdFx0dGhpcy52aWRlby5zcmMgPSBcImFzc2V0cy92aWRlby9lYXJ0aGNvMi53ZWJtXCI7XG5cdFx0XHRcblx0XHR9XG5cdFx0XHRcblx0XHRcdFx0XG5cdFx0XG5cdFx0dGhpcy52aWRlby5sb2FkKCk7IC8vIG11c3QgY2FsbCBhZnRlciBzZXR0aW5nL2NoYW5naW5nIHNvdXJjZVxuXHRcdHRoaXMudmlkZW8ucGxheSgpO1xuXHRcblx0XHR0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XG5cdFx0Ly8gdGhpcy5jYW52YXMud2lkdGggPSA5NjA7XG5cdFx0Ly8gdGhpcy5jYW52YXMuaGVpZ2h0ID0gNDgwO1xuXHRcdHRoaXMuY2FudmFzLndpZHRoID0gMTkyMDtcblx0XHR0aGlzLmNhbnZhcy5oZWlnaHQgPSA5NjA7XG5cblxuXHRcdHRoaXMuY3R4MmQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICk7XG5cdFx0Ly8gYmFja2dyb3VuZCBjb2xvciBpZiBubyB2aWRlbyBwcmVzZW50XG5cdFx0dGhpcy5jdHgyZC5maWxsU3R5bGUgPSAnIzAwMDAwMCc7XG5cdFx0dGhpcy5jdHgyZC5maWxsUmVjdCggMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCApO1xuXG5cdFx0dGhpcy50ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUoIHRoaXMuY2FudmFzICk7XG5cdFx0dGhpcy50ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhckZpbHRlcjtcblx0XHR0aGlzLnRleHR1cmUubWFnRmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuXHRcdFxuXHR9LFxuXHRcblx0ZXJyb3IgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0fSxcblx0XG5cdHVwZGF0ZSA6IGZ1bmN0aW9uKGUpIHtcblx0XHRcblx0XHRpZiAoIHRoaXMudmlkZW8ucmVhZHlTdGF0ZSA9PT0gdGhpcy52aWRlby5IQVZFX0VOT1VHSF9EQVRBICkge1xuXHRcdFx0XG5cdFx0XHR0aGlzLmN0eDJkLmRyYXdJbWFnZSggdGhpcy52aWRlbywgMCwgMCApO1xuXHRcdFx0XG5cdFx0XHRpZiAoIHRoaXMudGV4dHVyZSApIHRoaXMudGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cdFx0XHRcblx0XHR9XG5cdFx0XG5cdFx0dGhpcy5tZXNoLnJvdGF0aW9uLnkgKz0gZS5kdCAqIDAuMDAwMDU7XG5cdFx0XG5cdH1cblx0XG59OyIsImZ1bmN0aW9uIHVwZGF0ZUNhbWVyYSggY2FtZXJhICkge1xuXG5cdHJldHVybiBmdW5jdGlvbihlKSB7XG5cdFx0Y2FtZXJhLm9iamVjdC5wb3NpdGlvbi56IC09IDE7XG5cdH07XG59XG5cbmZ1bmN0aW9uIG1vdXNlRG93biggY2FudmFzLCBjYW1lcmFPYmosIHBvZW0gKSB7XG5cdFxuXHR2YXIgcHgsIHB5O1xuXG5cdHZhciAkY2FudmFzID0gJChjYW52YXMpO1xuXHRcblx0dmFyIGRyYWdNb3VzZUhhbmRsZXIgPSBmdW5jdGlvbiggZSApIHtcblxuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XG5cdFx0dmFyIHggPSBlLnBhZ2VYO1xuXHRcdHZhciB5ID0gZS5wYWdlWTtcblx0XG5cdFx0dmFyIG9mZnNldFggPSBweCAtIHg7XG5cdFx0dmFyIG9mZnNldFkgPSBweSAtIHk7XG5cdFxuXHRcdGNhbWVyYU9iai5yb3RhdGlvbi55ICs9IG9mZnNldFggKiAwLjAwNTtcblx0XHRjYW1lcmFPYmoucm90YXRpb24ueCArPSBvZmZzZXRZICogMC4wMDU7XG5cdFx0XHRcdFxuXHRcdHB4ID0geDtcblx0XHRweSA9IHk7XG5cdH07XG5cdFxuXHR2YXIgbW91c2VVcEhhbmRsZXIgPSBmdW5jdGlvbigpIHtcblx0XHQkY2FudmFzLm9mZignbW91c2V1cCcsIG1vdXNlVXBIYW5kbGVyKTtcblx0XHQkY2FudmFzLm9mZignbW91c2Vtb3ZlJywgZHJhZ01vdXNlSGFuZGxlcik7XG5cdH07XG5cdFx0XG5cdHZhciBtb3VzZURvd25IYW5kbGVyID0gZnVuY3Rpb24oIGUgKSB7XG5cdFx0XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFxuXHRcdHB4ID0gZS5wYWdlWDtcblx0XHRweSA9IGUucGFnZVk7XG5cdFx0XG5cdFx0JGNhbnZhcy5vbignbW91c2V1cCcsIG1vdXNlVXBIYW5kbGVyKTtcblx0XHQkY2FudmFzLm9uKCdtb3VzZW1vdmUnLCBkcmFnTW91c2VIYW5kbGVyKTtcblx0fTtcblx0XG5cdCRjYW52YXMub24oJ21vdXNlZG93bicsIG1vdXNlRG93bkhhbmRsZXIpO1xuXHRcblx0cG9lbS5vbignZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuXHRcdCRjYW52YXMub2ZmKCdtb3VzZXVwJywgbW91c2VVcEhhbmRsZXIpO1xuXHRcdCRjYW52YXMub2ZmKCdtb3VzZW1vdmUnLCBkcmFnTW91c2VIYW5kbGVyKTtcblx0XHQkY2FudmFzLm9mZignbW91c2Vkb3duJywgbW91c2VEb3duSGFuZGxlcik7XG5cdH0pO1xufVxuXG52YXIgRW5kbGVzc0NhbWVyYSA9IGZ1bmN0aW9uKCBwb2VtICkge1xuXHRcblx0cG9lbS5vbigndXBkYXRlJywgdXBkYXRlQ2FtZXJhKCBwb2VtLmNhbWVyYSApKTtcblx0XG5cdG1vdXNlRG93biggcG9lbS5jYW52YXMsIHBvZW0uY2FtZXJhLm9iamVjdCwgcG9lbSApO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFbmRsZXNzQ2FtZXJhOyIsInZhciBnbHNsaWZ5ID0gcmVxdWlyZShcImdsc2xpZnlcIik7XG52YXIgY3JlYXRlU2hhZGVyID0gcmVxdWlyZShcInRocmVlLWdsc2xpZnlcIikoVEhSRUUpO1xuXG5mdW5jdGlvbiBjcmVhdGVHZW9tZXRyeSh3aWR0aCwgc2VnbWVudHMpIHtcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSh3aWR0aCwgd2lkdGgsIHNlZ21lbnRzLCBzZWdtZW50cyk7XG4gICAgZ2VvbWV0cnkuYXBwbHlNYXRyaXgobmV3IFRIUkVFLk1hdHJpeDQoKS5tYWtlUm90YXRpb25YKE1hdGguUEkgKiAwLjUpKTtcbiAgICByZXR1cm4gZ2VvbWV0cnk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVRleHR1cmUobWVzaCwgc2NlbmUpIHtcbiAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgdmFyIHRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZShpbWcpO1xuICAgIGltZy5zcmMgPSBcImFzc2V0cy9pbWFnZXMvY2xvdWQxMDI0LnBuZ1wiO1xuXG4gICAgJChpbWcpLm9uKFwibG9hZFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICAgIHNjZW5lLmFkZChtZXNoKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJ0ZXh0dXJlIGxvYWRlZFwiKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0ZXh0dXJlO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVTaGFkZXIoKSB7fVxuXG5mdW5jdGlvbiBjcmVhdGVNZXNoR3JpZChtYXRlcmlhbCwgd2lkdGgsIGdyaWRMZW5ndGgsIHRvdGFsUG9seWdvbkRlbnNpdHkpIHtcbiAgICB2YXIgZ2VvbWV0cnkgPSBjcmVhdGVHZW9tZXRyeSh3aWR0aCAvIGdyaWRMZW5ndGgsIE1hdGguZmxvb3IodG90YWxQb2x5Z29uRGVuc2l0eSAvIGdyaWRMZW5ndGgpKTtcbiAgICB2YXIgbWVzaEdyaWQgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcbiAgICB2YXIgbWVzaDtcbiAgICB2YXIgc3RlcCA9IHdpZHRoIC8gZ3JpZExlbmd0aDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ3JpZExlbmd0aDsgaSsrKSB7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZ3JpZExlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcbiAgICAgICAgICAgIG1lc2hHcmlkLmFkZChtZXNoKTtcbiAgICAgICAgICAgIG1lc2gucG9zaXRpb24uc2V0KGkgKiBzdGVwLCAwLCBqICogc3RlcCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWVzaEdyaWQ7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZU1vZHVsb01lc2hHcmlkKGNhbWVyYVBvc2l0aW9uLCBtZXNoZXMsIHdpZHRoKSB7XG4gICAgdmFyIGlsID0gbWVzaGVzLmxlbmd0aDtcbiAgICB2YXIgaGFsZldpZHRoID0gd2lkdGggLyAyO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcG9zaXRpb247XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbDsgaSsrKSB7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IG1lc2hlc1tpXS5wb3NpdGlvbjtcbiAgICAgICAgICAgIHBvc2l0aW9uLnNldCgocG9zaXRpb24ueCAtIGNhbWVyYVBvc2l0aW9uLnggKyBoYWxmV2lkdGgpICUgd2lkdGggKyBjYW1lcmFQb3NpdGlvbi54IC0gaGFsZldpZHRoLCBwb3NpdGlvbi55LCAocG9zaXRpb24ueiAtIGNhbWVyYVBvc2l0aW9uLnogKyBoYWxmV2lkdGgpICUgd2lkdGggKyBjYW1lcmFQb3NpdGlvbi56IC0gaGFsZldpZHRoKTtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbnZhciBFbmRsZXNzVGVycmFpbiA9IGZ1bmN0aW9uKHBvZW0sIHByb3BlcnRpZXMpIHtcbiAgICB2YXIgY29uZmlnID0gXy5leHRlbmQoe1xuICAgICAgICB3aWR0aDogNDAwMCxcbiAgICAgICAgZ3JpZExlbmd0aDogMTYsXG4gICAgICAgIHRvdGFsUG9seWdvbkRlbnNpdHk6IDEwMjRcbiAgICB9LCBwcm9wZXJ0aWVzKTtcblxuICAgIHZhciBzaGFkZXIgPSBjcmVhdGVTaGFkZXIocmVxdWlyZShcImdsc2xpZnkvc2ltcGxlLWFkYXB0ZXIuanNcIikoXCJcXG4jZGVmaW5lIEdMU0xJRlkgMVxcblxcbnVuaWZvcm0gc2FtcGxlcjJEIHRlcnJhaW47XFxudW5pZm9ybSBmbG9hdCBoZWlnaHRTY2FsZTtcXG51bmlmb3JtIGZsb2F0IHdpZHRoO1xcbnZhcnlpbmcgZmxvYXQgaGVpZ2h0O1xcbnZhcnlpbmcgdmVjMiB2VXY7XFxudmFyeWluZyBmbG9hdCB2Q2FtZXJhRGlzdGFuY2U7XFxudm9pZCBtYWluKCkge1xcbiAgdmVjNCBtb2RlbFBvc2l0aW9uID0gbW9kZWxNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApO1xcbiAgdlV2ID0gbW9kKHZlYzIobW9kZWxQb3NpdGlvbi54LCBtb2RlbFBvc2l0aW9uLnopLCB3aWR0aCkgLyB3aWR0aDtcXG4gIGhlaWdodCA9IHRleHR1cmUyRCh0ZXJyYWluLCB2VXYpLnc7XFxuICB2Q2FtZXJhRGlzdGFuY2UgPSBkaXN0YW5jZShtb2RlbFBvc2l0aW9uLnh5eiwgY2FtZXJhUG9zaXRpb24pO1xcbiAgdmVjNCBtb2RpZmllZFBvc2l0aW9uID0gdmVjNChwb3NpdGlvbi54LCBwb3NpdGlvbi55ICsgaGVpZ2h0ICogaGVpZ2h0U2NhbGUsIHBvc2l0aW9uLnosIDEuMCk7XFxuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiBtb2RpZmllZFBvc2l0aW9uO1xcbn1cIiwgXCJcXG4jZGVmaW5lIEdMU0xJRlkgMVxcblxcbnZlYzMgYV94X2hzdjJyZ2IodmVjMyBjKSB7XFxuICB2ZWM0IEsgPSB2ZWM0KDEuMCwgMi4wIC8gMy4wLCAxLjAgLyAzLjAsIDMuMCk7XFxuICB2ZWMzIHAgPSBhYnMoZnJhY3QoYy54eHggKyBLLnh5eikgKiA2LjAgLSBLLnd3dyk7XFxuICByZXR1cm4gYy56ICogbWl4KEsueHh4LCBjbGFtcChwIC0gSy54eHgsIDAuMCwgMS4wKSwgYy55KTtcXG59XFxudW5pZm9ybSBmbG9hdCB3aWR0aDtcXG52YXJ5aW5nIGZsb2F0IGhlaWdodDtcXG52YXJ5aW5nIHZlYzIgdlV2O1xcbnZhcnlpbmcgZmxvYXQgdkNhbWVyYURpc3RhbmNlO1xcbnZvaWQgbWFpbigpIHtcXG4gIGZsb2F0IGludkRpc3RvcnQgPSAxLjAgLSBoZWlnaHQ7XFxuICBmbG9hdCB4SHVlID0gYWJzKDAuNSAtIHZVdi54KSAqIDIuMDtcXG4gIGZsb2F0IHlIdWUgPSBhYnMoMC41IC0gdlV2LnkpICogMi4wO1xcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNChhX3hfaHN2MnJnYih2ZWMzKCh4SHVlICsgeUh1ZSkgKiAwLjIgKyAwLjMsIG1peChoZWlnaHQsIDAuNSwgMC44KSwgbWl4KGhlaWdodCwgMS4wLCAwLjM1KSkpLCAxLjApO1xcbiAgZmxvYXQgZm9nRmFjdG9yID0gc21vb3Roc3RlcCgwLjAsIDEuMCwgdkNhbWVyYURpc3RhbmNlIC8gd2lkdGgpO1xcbiAgdmVjMyBmb2dDb2xvciA9IHZlYzMoMC4xMjUsIDAuMTI1LCAwLjEyNSk7XFxuICBnbF9GcmFnQ29sb3IgPSBtaXgoZ2xfRnJhZ0NvbG9yLCB2ZWM0KGZvZ0NvbG9yLCBnbF9GcmFnQ29sb3IudyksIGZvZ0ZhY3Rvcik7XFxufVwiLCBbe1wibmFtZVwiOlwidGVycmFpblwiLFwidHlwZVwiOlwic2FtcGxlcjJEXCJ9LHtcIm5hbWVcIjpcImhlaWdodFNjYWxlXCIsXCJ0eXBlXCI6XCJmbG9hdFwifSx7XCJuYW1lXCI6XCJ3aWR0aFwiLFwidHlwZVwiOlwiZmxvYXRcIn0se1wibmFtZVwiOlwid2lkdGhcIixcInR5cGVcIjpcImZsb2F0XCJ9XSwgW10pKTtcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoc2hhZGVyKTtcbiAgICBtYXRlcmlhbC5zaWRlID0gVEhSRUUuRG91YmxlU2lkZTtcbiAgICB2YXIgbWVzaEdyaWQgPSBjcmVhdGVNZXNoR3JpZChtYXRlcmlhbCwgY29uZmlnLndpZHRoLCBjb25maWcuZ3JpZExlbmd0aCwgY29uZmlnLnRvdGFsUG9seWdvbkRlbnNpdHkpO1xuICAgIG1lc2hHcmlkLnBvc2l0aW9uLnkgPSAxMDA7XG4gICAgc2hhZGVyLnVuaWZvcm1zLnRlcnJhaW4udmFsdWUgPSBjcmVhdGVUZXh0dXJlKG1lc2hHcmlkLCBwb2VtLnNjZW5lKTtcbiAgICBzaGFkZXIudW5pZm9ybXMuaGVpZ2h0U2NhbGUudmFsdWUgPSBjb25maWcud2lkdGggLyAyMDtcbiAgICBzaGFkZXIudW5pZm9ybXMud2lkdGgudmFsdWUgPSBjb25maWcud2lkdGggLyAyO1xuICAgIHBvZW0ub24oXCJ1cGRhdGVcIiwgdXBkYXRlTW9kdWxvTWVzaEdyaWQocG9lbS5jYW1lcmEub2JqZWN0LnBvc2l0aW9uLCBtZXNoR3JpZC5jaGlsZHJlbiwgY29uZmlnLndpZHRoKSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVuZGxlc3NUZXJyYWluOyIsInZhciByYW5kb20gPSByZXF1aXJlKCcuLi91dGlscy9yYW5kb20nKTtcblxudmFyIEdyaWQgPSBmdW5jdGlvbiggcG9lbSwgcHJvcGVydGllcyApIHtcblx0XG5cdHRoaXMucG9lbSA9IHBvZW07XG5cblx0dmFyIGxpbmVNYXRlcmlhbCA9IG5ldyBUSFJFRS5MaW5lQmFzaWNNYXRlcmlhbCggeyBjb2xvcjogMHgzMDMwMzAgfSApLFxuXHRcdGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCksXG5cdFx0Zmxvb3IgPSAtNzUsIHN0ZXAgPSAyNTtcblxuXHRmb3IgKCB2YXIgaSA9IDA7IGkgPD0gNDA7IGkgKysgKSB7XG5cblx0XHRnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKCBuZXcgVEhSRUUuVmVjdG9yMyggLSA1MDAsIGZsb29yLCBpICogc3RlcCAtIDUwMCApICk7XG5cdFx0Z2VvbWV0cnkudmVydGljZXMucHVzaCggbmV3IFRIUkVFLlZlY3RvcjMoICAgNTAwLCBmbG9vciwgaSAqIHN0ZXAgLSA1MDAgKSApO1xuXG5cdFx0Z2VvbWV0cnkudmVydGljZXMucHVzaCggbmV3IFRIUkVFLlZlY3RvcjMoIGkgKiBzdGVwIC0gNTAwLCBmbG9vciwgLTUwMCApICk7XG5cdFx0Z2VvbWV0cnkudmVydGljZXMucHVzaCggbmV3IFRIUkVFLlZlY3RvcjMoIGkgKiBzdGVwIC0gNTAwLCBmbG9vciwgIDUwMCApICk7XG5cblx0fVxuXG5cdHRoaXMuZ3JpZCA9IG5ldyBUSFJFRS5MaW5lKCBnZW9tZXRyeSwgbGluZU1hdGVyaWFsLCBUSFJFRS5MaW5lUGllY2VzICk7XG5cdHRoaXMucG9lbS5zY2VuZS5hZGQoIHRoaXMuZ3JpZCApO1xuXHRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR3JpZDsiLCJ2YXIgY2FsY3VsYXRlU3F1YXJlZFRleHR1cmVXaWR0aCA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL2NhbGN1bGF0ZVNxdWFyZWRUZXh0dXJlV2lkdGgnKVxuICAsIGxvYWRUZXh0dXJlXHQ9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL2xvYWRUZXh0dXJlJylcbiAgLCBsb2FkVGV4dFx0PSByZXF1aXJlKCcuLi8uLi91dGlscy9sb2FkVGV4dCcpXG4gICwgUlNWUCA9IHJlcXVpcmUoJ3JzdnAnKTtcblxudmFyIE1lc2hHcm91cCA9IGZ1bmN0aW9uKCBwb2VtICkge1xuXHRcblx0VEhSRUUuT2JqZWN0M0QuY2FsbCggdGhpcyApO1xuXHRcblx0dGhpcy5wb2VtID0gcG9lbTtcblx0dGhpcy50eXBlID0gJ01lc2hHcm91cCc7XG5cdHRoaXMuYnVmZmVyR2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcblx0XG5cdHRoaXMubWF0cmljZXNUZXh0dXJlV2lkdGggPSBudWxsO1xuXHR0aGlzLm1hdHJpY2VzRGF0YSA9IG51bGw7XG5cdHRoaXMubWF0cml4SW5kaWNlcyA9IG51bGw7XG5cdFxuXHR0aGlzLnRleHR1cmUgPSBudWxsO1xuXHR0aGlzLnZlcnRleFNoYWRlciA9IG51bGw7XG5cdHRoaXMuZnJhZ21lbnRTaGFkZXIgPSBudWxsO1xuXHRcblx0dGhpcy5sb2FkZWQgPSBSU1ZQLmFsbChbXG5cdFx0bG9hZFRleHR1cmUoIFwiYXNzZXRzL2ltYWdlcy9zaW5lZ3Jhdml0eWNsb3VkLnBuZ1wiLCB0aGlzLCBcInRleHR1cmVcIiApLFxuXHRcdGxvYWRUZXh0KCBcImpzL2RlbW9zL01lc2hHcm91cEJveERlbW8vc2hhZGVyLnZlcnRcIiwgdGhpcywgXCJ2ZXJ0ZXhTaGFkZXJcIiApLFxuXHRcdGxvYWRUZXh0KCBcImpzL2RlbW9zL01lc2hHcm91cEJveERlbW8vc2hhZGVyLmZyYWdcIiwgdGhpcywgXCJmcmFnbWVudFNoYWRlclwiIClcblx0XSlcblx0LmNhdGNoKCBmdW5jdGlvbiggZXJyb3IgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQ291bGQgbm90IGxvYWQgYXNzZXRzIGZvciB0aGUgTWVzaEdyb3VwXCIsIGVycm9yKTtcblx0fSk7XG5cdFx0XG59O1xuXG5NZXNoR3JvdXAucHJvdG90eXBlID0gXy5leHRlbmQoIE9iamVjdC5jcmVhdGUoIFRIUkVFLk9iamVjdDNELnByb3RvdHlwZSApLCB7XG5cblx0YnVpbGQgOiBmdW5jdGlvbiggc2NlbmUgKSB7XG5cdFx0XG5cdFx0dGhpcy5sb2FkZWQudGhlbiggZnVuY3Rpb24oKSB7XG5cdFx0XHRcblx0XHRcdHRoaXMuYnVpbGRHZW9tZXRyeSgpO1xuXHRcdFx0dGhpcy5idWlsZE1hdHJpY2VzKCk7XG5cdFx0XHR0aGlzLmJ1aWxkTWF0ZXJpYWwoKTtcblx0XHRcdFxuXHRcdFx0dGhpcy5vYmplY3QgPSBuZXcgVEhSRUUuUG9pbnRDbG91ZCggdGhpcy5idWZmZXJHZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCApO1xuXHRcdFx0XG5cdFx0XHRzY2VuZS5hZGQoIHRoaXMub2JqZWN0ICk7XG5cdFx0XHRcblx0XHRcdHRoaXMucG9lbS5vbiggJ3VwZGF0ZScsIHRoaXMudXBkYXRlLmJpbmQodGhpcykgKTtcblx0XHRcdFxuXHRcdFx0XG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cdFx0XG5cdH0sXG5cdFxuXHRidWlsZEdlb21ldHJ5IDogZnVuY3Rpb24oKSB7XG5cdFx0XG5cdFx0dmFyIG1lcmdlZEdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XG5cdFx0XG5cdFx0dmFyIGNoaWxkR2VvbWV0cnk7XG5cdFx0dmFyIG1hdHJpeEluZGljZXMgPSBbXTtcblx0XHR2YXIgaSwgaWwsIGosIGpsO1xuXHRcdFxuXHRcdGZvciggaSA9IDAsIGlsID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkgPCBpbDsgaSsrICkge1xuXHRcdFx0XG5cdFx0XHRjaGlsZEdlb21ldHJ5ID0gdGhpcy5jaGlsZHJlbltpXS5nZW9tZXRyeTtcblx0XHRcdFxuXHRcdFx0aWYoIGNoaWxkR2VvbWV0cnkgKSB7XG5cdFx0XHRcdFxuXHRcdFx0XHRtZXJnZWRHZW9tZXRyeS5tZXJnZSggY2hpbGRHZW9tZXRyeSApO1xuXHRcdFx0XHRcblx0XHRcdFx0aiA9IG1lcmdlZEdlb21ldHJ5LnZlcnRpY2VzLmxlbmd0aCAtIGNoaWxkR2VvbWV0cnkudmVydGljZXMubGVuZ3RoO1xuXHRcdFx0XHRqbCA9IG1lcmdlZEdlb21ldHJ5LnZlcnRpY2VzLmxlbmd0aDtcblx0XHRcdFx0XG5cdFx0XHRcdGZvciggOyBqIDwgamw7IGorKyApIHtcblx0XHRcdFx0XHRtYXRyaXhJbmRpY2VzW2pdID0gaTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdH1cblx0XHRcdFxuXHRcdH1cblx0XHRcblx0XHR0aGlzLmJ1ZmZlckdlb21ldHJ5LmZyb21HZW9tZXRyeSggbWVyZ2VkR2VvbWV0cnkgKTtcblx0XHRcblx0fSxcblx0XG5cdGdlbmVyYXRlVHJhbnNmb3JtTWF0cml4SW5kaWNlcyA6IGZ1bmN0aW9uKCBvYmplY3QzRHMgKSB7XG5cdFx0XG5cdFx0dmFyIG1hdHJpeEluZGljZXMgPSBbXTtcblx0XHR2YXIgdG90YWxMZW5ndGggPSAwO1xuXHRcdHZhciBwb3NpdGlvbnNJbkZhY2VzO1xuXHRcdHZhciBjaGlsZEdlb21ldHJ5O1xuXHRcdFxuXHRcdHZhciBpLCBpbCwgaiwgamw7XG5cdFx0XG5cdFx0Zm9yKCBpID0gMCwgaWwgPSBvYmplY3QzRHMubGVuZ3RoOyBpIDwgaWw7IGkrKyApIHtcblx0XHRcdFxuXHRcdFx0Y2hpbGRHZW9tZXRyeSA9IG9iamVjdDNEc1tpXS5nZW9tZXRyeTtcblx0XHRcdFxuXHRcdFx0aWYoIGNoaWxkR2VvbWV0cnkgKSB7XG5cdFx0XHRcdFxuXHRcdFx0XHRwb3NpdGlvbnNJbkZhY2VzID0gY2hpbGRHZW9tZXRyeS5mYWNlcy5sZW5ndGggKiAzOyAvLzMgdmVydGljZXMgcGVyIGZhY2Vcblx0XHRcdFx0dG90YWxMZW5ndGggKz0gcG9zaXRpb25zSW5GYWNlcztcblx0XHRcdFx0XG5cdFx0XHRcdGogPSB0b3RhbExlbmd0aCAtIHBvc2l0aW9uc0luRmFjZXM7XG5cdFx0XHRcdGpsID0gdG90YWxMZW5ndGg7XG5cdFx0XHRcdFxuXHRcdFx0XHRmb3IoIDsgaiA8IGpsOyBqKysgKSB7XG5cdFx0XHRcdFx0bWF0cml4SW5kaWNlc1tqXSA9IGk7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHR9XG5cdFx0XHRcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIG5ldyBGbG9hdDMyQXJyYXkoIG1hdHJpeEluZGljZXMgKTtcblx0fSxcblx0XG5cdGJ1aWxkTWF0cmljZXMgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHQvL0NhbGN1bGF0ZXMgdGhlIG5eMiB3aWR0aCBvZiB0aGUgdGV4dHVyZVxuXHRcdHRoaXMubWF0cmljZXNUZXh0dXJlV2lkdGggPSBjYWxjdWxhdGVTcXVhcmVkVGV4dHVyZVdpZHRoKCB0aGlzLmNoaWxkcmVuLmxlbmd0aCAqIDE2ICk7IC8vMTYgZmxvYXRzIHBlciBtYXRyaXhcblx0XHRcblx0XHQvL1RoZSB0ZXh0dXJlIGhhcyA0IGZsb2F0cyBwZXIgcGl4ZWxcblx0XHR0aGlzLm1hdHJpY2VzRGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoIHRoaXMubWF0cmljZXNUZXh0dXJlV2lkdGggKiB0aGlzLm1hdHJpY2VzVGV4dHVyZVdpZHRoICogNCApO1xuXHRcdFxuXHRcdHRoaXMubWF0cmljZXNUZXh0dXJlID0gbmV3IFRIUkVFLkRhdGFUZXh0dXJlKFxuXHRcdFx0dGhpcy5tYXRyaWNlc0RhdGEsXG5cdFx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZVdpZHRoLFxuXHRcdFx0dGhpcy5tYXRyaWNlc1RleHR1cmVXaWR0aCxcblx0XHRcdFRIUkVFLlJHQkFGb3JtYXQsXG5cdFx0XHRUSFJFRS5GbG9hdFR5cGVcblx0XHQpO1xuXHRcdHRoaXMubWF0cmljZXNUZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XG5cdFx0dGhpcy5tYXRyaWNlc1RleHR1cmUubWFnRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcblx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZS5nZW5lcmF0ZU1pcG1hcHMgPSBmYWxzZTtcblx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZS5mbGlwWSA9IGZhbHNlO1xuXHRcdHRoaXMubWF0cmljZXNUZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblx0XHRcblx0fSxcblx0XG5cdGJ1aWxkTWF0ZXJpYWwgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHR0aGlzLmF0dHJpYnV0ZXMgPSB7XG5cdFx0XHRcblx0XHRcdHRyYW5zZm9ybU1hdHJpeEluZGV4Olx0eyB0eXBlOiAnZicsIHZhbHVlOiBudWxsIH1cblx0XHRcdFxuXHRcdH07XG5cdFx0XG5cdFx0dGhpcy5tYXRyaXhJbmRpY2VzID0gdGhpcy5nZW5lcmF0ZVRyYW5zZm9ybU1hdHJpeEluZGljZXMoIHRoaXMuY2hpbGRyZW4gKTtcblx0XHRcblx0XHR0aGlzLmJ1ZmZlckdlb21ldHJ5LmFkZEF0dHJpYnV0ZSggJ3RyYW5zZm9ybU1hdHJpeEluZGV4JywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSggdGhpcy5tYXRyaXhJbmRpY2VzLCAxICkgKTtcblxuXHRcdHRoaXMudW5pZm9ybXMgPSB7XG5cdFx0XHRcblx0XHRcdGNvbG9yOiAgICAgXHRcdFx0XHR7IHR5cGU6IFwiY1wiLCB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCAweGZmMDAwMCApIH0sXG5cdFx0XHRtYXRyaWNlc1RleHR1cmU6XHRcdHsgdHlwZTogXCJ0XCIsIHZhbHVlOiB0aGlzLm1hdHJpY2VzVGV4dHVyZSB9LFxuXHRcdFx0dGltZTogICAgICBcdFx0XHRcdHsgdHlwZTogJ2YnLCB2YWx1ZTogRGF0ZS5ub3coKSB9LFxuXHRcdFx0dGV4dHVyZTogICBcdFx0XHRcdHsgdHlwZTogXCJ0XCIsIHZhbHVlOiB0aGlzLnRleHR1cmUgfSxcblx0XHRcdG1hdHJpY2VzVGV4dHVyZVdpZHRoOlx0eyB0eXBlOiAnZicsIHZhbHVlOiB0aGlzLm1hdHJpY2VzVGV4dHVyZVdpZHRoIH1cblx0XHRcdFxuXHRcdH07XG5cblx0XHR0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKCB7XG5cdFx0XHRcblx0XHRcdHVuaWZvcm1zOiAgICAgICB0aGlzLnVuaWZvcm1zLFxuXHRcdFx0YXR0cmlidXRlczogICAgIHRoaXMuYXR0cmlidXRlcyxcblx0XHRcdHZlcnRleFNoYWRlcjogICB0aGlzLnZlcnRleFNoYWRlcixcblx0XHRcdGZyYWdtZW50U2hhZGVyOiB0aGlzLmZyYWdtZW50U2hhZGVyLFxuXHRcdFx0XG5cdFx0XHRibGVuZGluZzogICAgICAgVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcblx0XHRcdGRlcHRoVGVzdDogICAgICBmYWxzZSxcblx0XHRcdHRyYW5zcGFyZW50OiAgICB0cnVlXG5cdFx0XHRcblx0XHR9KTtcblx0XHRcdFx0XG5cdH0sXG5cdFxuXHR1cGRhdGUgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHRmb3IoIHZhciBpID0gMCwgaWwgPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGlsIDsgaSsrICkge1xuXG5cdFx0XHR0aGlzLmNoaWxkcmVuW2ldLm1hdHJpeC5mbGF0dGVuVG9BcnJheU9mZnNldCggdGhpcy5tYXRyaWNlc0RhdGEsIGkgKiAxNiApO1xuXHRcdFx0dGhpcy5tYXRyaWNlc1RleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xuXHRcdFx0XG5cdFx0fVxuXHRcdFxuXHR9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1lc2hHcm91cDsiLCJ2YXIgTWVzaEdyb3VwID0gcmVxdWlyZSgnLi9NZXNoR3JvdXAnKVxuICAsIHJhbmRvbSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3JhbmRvbScpXG4gICwgdHdvz4AgPSBNYXRoLlBJICogMjtcblxudmFyIE1lc2hHcm91cEJveERlbW8gPSBmdW5jdGlvbiggcG9lbSwgcHJvcGVydGllcyApIHtcblx0XG5cdHRoaXMucG9lbSA9IHBvZW07XG5cdFxuXHR0aGlzLmNvdW50ID0gMTAwMDA7XG5cdFxuXHR0aGlzLnBvZW0ub24oJ3VwZGF0ZScsIHRoaXMudXBkYXRlLmJpbmQodGhpcykgKTtcblx0XG5cdHRoaXMuZ3JvdXAgPSBuZXcgTWVzaEdyb3VwKCBwb2VtICk7XG5cdFxuXHR0aGlzLmJveGVzID0gdGhpcy5nZW5lcmF0ZUJveGVzKCB0aGlzLmdyb3VwICk7XG5cblx0dGhpcy5ncm91cC5idWlsZCggcG9lbS5zY2VuZSApO1xuXHRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWVzaEdyb3VwQm94RGVtbztcblxuTWVzaEdyb3VwQm94RGVtby5wcm90b3R5cGUgPSB7XG5cblx0Z2VuZXJhdGVCb3hlcyA6IGZ1bmN0aW9uKCBncm91cCApIHtcblx0XHRcblx0XHR2YXIgYm94ZXMgPSBbXTtcblx0XHRcblx0XHR2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkoIDEsIDEsIDEgKTtcblx0XHR2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoIHsgY29sb3I6IDB4MDBmZjAwIH0gKTtcblx0XHR2YXIgYm94O1xuXHRcdFxuXHRcdHZhciBpID0gdGhpcy5jb3VudDsgd2hpbGUgKGktLSkge1xuXHRcdFx0XG5cdFx0XHRib3ggPSBuZXcgVEhSRUUuTWVzaCggbmV3IFRIUkVFLkJveEdlb21ldHJ5KCAxLCAxLCAxICkgKTtcblx0XHRcdFxuXHRcdFx0Ym94LnBvc2l0aW9uLnggPSByYW5kb20ucmFuZ2UoIC0xMDAsIDEwMCApO1xuXHRcdFx0Ym94LnBvc2l0aW9uLnkgPSByYW5kb20ucmFuZ2UoIC0xMDAsIDEwMCApO1xuXHRcdFx0Ym94LnBvc2l0aW9uLnogPSByYW5kb20ucmFuZ2UoIC0xMDAsIDEwMCApO1xuXHRcdFx0XG5cdFx0XHRib3gucm90YXRpb24ueCA9IHJhbmRvbS5yYW5nZSggLXR3b8+ALCB0d2/PgCApO1xuXHRcdFx0Ym94LnJvdGF0aW9uLnkgPSByYW5kb20ucmFuZ2UoIC10d2/PgCwgdHdvz4AgKTtcblx0XHRcdGJveC5yb3RhdGlvbi56ID0gcmFuZG9tLnJhbmdlKCAtdHdvz4AsIHR3b8+AICk7XG5cdFx0XHRcblx0XHRcdGJveC52ZWxvY2l0eSA9IG5ldyBUSFJFRS5WZWN0b3IzKFxuXHRcdFx0XHRcblx0XHRcdFx0cmFuZG9tLnJhbmdlKCAtMSwgMSApLFxuXHRcdFx0XHRyYW5kb20ucmFuZ2UoIC0xLCAxICksXG5cdFx0XHRcdHJhbmRvbS5yYW5nZSggLTEsIDEgKVxuXHRcdFx0XHRcblx0XHRcdCkubXVsdGlwbHlTY2FsYXIoMC4xKTtcblx0XHRcdFxuXHRcdFx0Ym94LnNwaW4gPSBuZXcgVEhSRUUuVmVjdG9yMyhcblx0XHRcdFx0XG5cdFx0XHRcdHJhbmRvbS5yYW5nZSggLXR3b8+ALCB0d2/PgCApLFxuXHRcdFx0XHRyYW5kb20ucmFuZ2UoIC10d2/PgCwgdHdvz4AgKSxcblx0XHRcdFx0cmFuZG9tLnJhbmdlKCAtdHdvz4AsIHR3b8+AIClcblx0XHRcdFx0XG5cdFx0XHQpLm11bHRpcGx5U2NhbGFyKDAuMDEpO1xuXHRcdFx0XG5cdFx0XHRib3guc2NhbGUubXVsdGlwbHlTY2FsYXIoIHJhbmRvbS5yYW5nZSggMSwgMikgKTtcblx0XHRcdFxuXHRcdFx0Ym94LnVwZGF0ZU1hdHJpeCgpO1xuXHRcdFx0XG5cdFx0XHRib3hlcy5wdXNoKCBib3ggKTtcblx0XHRcdFxuXHRcdFx0Z3JvdXAuYWRkKCBib3ggKTtcblx0XHRcdFxuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gYm94ZXM7XG5cdFx0XG5cdH0sXG5cdFxuXHR1cGRhdGUgOiBmdW5jdGlvbiggZSApIHtcblx0XHRcblx0XHR2YXIgYm94O1xuXHRcdFxuXHRcdGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5jb3VudDsgaSsrICkge1xuXHRcdFx0XG5cdFx0XHRib3ggPSB0aGlzLmJveGVzW2ldO1xuXHRcdFx0XG5cdFx0XHRib3gucG9zaXRpb24uYWRkKCBib3gudmVsb2NpdHkgKTtcblx0XHRcdFxuXHRcdFx0Ym94LnJvdGF0aW9uLnggKz0gYm94LnNwaW4ueDtcblx0XHRcdGJveC5yb3RhdGlvbi55ICs9IGJveC5zcGluLnk7XG5cdFx0XHRib3gucm90YXRpb24ueiArPSBib3guc3Bpbi56O1xuXHRcdFx0XG5cdFx0XHRib3gudXBkYXRlTWF0cml4KCk7XG5cdFx0XHRcblx0XHR9XG5cdFx0XG5cdH1cblx0XG59OyIsInZhciByYW5kb21cdFx0PSByZXF1aXJlKCcuLi91dGlscy9yYW5kb20nKVxuICAsIGxvYWRUZXh0dXJlXHQ9IHJlcXVpcmUoJy4uL3V0aWxzL2xvYWRUZXh0dXJlJylcbiAgLCBsb2FkVGV4dFx0PSByZXF1aXJlKCcuLi91dGlscy9sb2FkVGV4dCcpXG4gICwgUlNWUFx0XHQ9IHJlcXVpcmUoJ3JzdnAnKVxuO1xuXG52YXIgU2luZUdyYXZpdHlDbG91ZCA9IGZ1bmN0aW9uKHBvZW0sIHByb3BlcnRpZXMpIHtcblx0XG5cdHRoaXMucG9lbSA9IHBvZW07XG5cdFxuXHR0aGlzLm9iamVjdCA9IG51bGw7XG5cdHRoaXMubWF0ZXJpYWwgPSBudWxsO1xuXHR0aGlzLmF0dHJpYnV0ZXMgPSBudWxsO1xuXHR0aGlzLnVuaWZvcm1zID0gbnVsbDtcblxuXHR0aGlzLnRleHR1cmUgPSBudWxsO1xuXHR0aGlzLnZlcnRleFNoYWRlciA9IG51bGw7XG5cdHRoaXMuZnJhZ21lbnRTaGFkZXIgPSBudWxsO1xuXHRcblx0dGhpcy5jb3VudCA9IDIwMDAwMDtcblx0dGhpcy5yYWRpdXMgPSAyMDA7XG5cdHRoaXMucG9pbnRTaXplID0gNztcblx0XHRcblx0Xy5leHRlbmQoIHRoaXMsIHByb3BlcnRpZXMgKTtcblx0XG5cdFxuXHRSU1ZQLmFsbChbXG5cdFx0bG9hZFRleHR1cmUoIFwiYXNzZXRzL2ltYWdlcy9zaW5lZ3Jhdml0eWNsb3VkLnBuZ1wiLCB0aGlzLCBcInRleHR1cmVcIiApLFxuXHRcdGxvYWRUZXh0KCBcImFzc2V0cy9zaGFkZXJzL3NpbmVncmF2aXR5Y2xvdWQudmVydFwiLCB0aGlzLCBcInZlcnRleFNoYWRlclwiICksXG5cdFx0bG9hZFRleHQoIFwiYXNzZXRzL3NoYWRlcnMvc2luZWdyYXZpdHljbG91ZC5mcmFnXCIsIHRoaXMsIFwiZnJhZ21lbnRTaGFkZXJcIiApXG5cdF0pXG5cdC50aGVuKFxuXHRcdHRoaXMuc3RhcnQuYmluZCh0aGlzKSxcblx0XHR0aGlzLmVycm9yLmJpbmQodGhpcylcblx0KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2luZUdyYXZpdHlDbG91ZDtcblxuU2luZUdyYXZpdHlDbG91ZC5wcm90b3R5cGUgPSB7XG5cdFxuXHRzdGFydCA6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdHRoaXMuYXR0cmlidXRlcyA9IHtcblxuXHRcdFx0c2l6ZTogICAgICAgIHsgdHlwZTogJ2YnLCB2YWx1ZTogbnVsbCB9LFxuXHRcdFx0Y3VzdG9tQ29sb3I6IHsgdHlwZTogJ2MnLCB2YWx1ZTogbnVsbCB9XG5cblx0XHR9O1xuXG5cdFx0dGhpcy51bmlmb3JtcyA9IHtcblxuXHRcdFx0Y29sb3I6ICAgICB7IHR5cGU6IFwiY1wiLCB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCAweGZmZmZmZiApIH0sXG5cdFx0XHR0ZXh0dXJlOiAgIHsgdHlwZTogXCJ0XCIsIHZhbHVlOiB0aGlzLnRleHR1cmUgfVxuXG5cdFx0fTtcblxuXHRcdHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoIHtcblxuXHRcdFx0dW5pZm9ybXM6ICAgICAgIHRoaXMudW5pZm9ybXMsXG5cdFx0XHRhdHRyaWJ1dGVzOiAgICAgdGhpcy5hdHRyaWJ1dGVzLFxuXHRcdFx0dmVydGV4U2hhZGVyOiAgIHRoaXMudmVydGV4U2hhZGVyLFxuXHRcdFx0ZnJhZ21lbnRTaGFkZXI6IHRoaXMuZnJhZ21lbnRTaGFkZXIsXG5cblx0XHRcdGJsZW5kaW5nOiAgICAgICBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxuXHRcdFx0ZGVwdGhUZXN0OiAgICAgIGZhbHNlLFxuXHRcdFx0dHJhbnNwYXJlbnQ6ICAgIHRydWVcblxuXHRcdH0pO1xuXG5cdFx0dGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xuXG5cdFx0dGhpcy5wb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLmNvdW50ICogMyApO1xuXHRcdHRoaXMudmVsb2NpdHkgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLmNvdW50ICogMyApO1xuXHRcdHRoaXMuY29sb3JzID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5jb3VudCAqIDMgKTtcblx0XHR0aGlzLnNpemVzID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5jb3VudCApO1xuXG5cdFx0dmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKDB4MDAwMDAwKTtcblx0XHRcblx0XHR2YXIgaHVlO1xuXHRcdFxuXHRcdHZhciB0aGV0YSwgcGhpO1xuXHRcdFxuXHRcdHZhciB4O1xuXG5cdFx0Zm9yKCB2YXIgdiA9IDA7IHYgPCB0aGlzLmNvdW50OyB2KysgKSB7XG5cblx0XHRcdHRoaXMuc2l6ZXNbIHYgXSA9IHRoaXMucG9pbnRTaXplO1xuXHRcdFx0XG5cdFx0XHQvLyB0aGV0YSA9IHJhbmRvbS5yYW5nZUxvdyggMC4xLCBNYXRoLlBJICk7XG5cdFx0XHQvLyBwaGkgPSByYW5kb20ucmFuZ2VMb3coIE1hdGguUEkgKiAwLjMsIE1hdGguUEkgKTtcblx0XHRcdC8vXG5cdFx0XHQvLyB0aGlzLnBvc2l0aW9uc1sgdiAqIDMgKyAwIF0gPSBNYXRoLnNpbiggdGhldGEgKSAqIE1hdGguY29zKCBwaGkgKSAqIHRoaXMucmFkaXVzICogdGhldGEgKiA1O1xuXHRcdFx0Ly8gdGhpcy5wb3NpdGlvbnNbIHYgKiAzICsgMSBdID0gTWF0aC5zaW4oIHRoZXRhICkgKiBNYXRoLnNpbiggcGhpICkgKiB0aGlzLnJhZGl1cztcblx0XHRcdC8vIHRoaXMucG9zaXRpb25zWyB2ICogMyArIDIgXSA9IE1hdGguY29zKCB0aGV0YSApICogdGhpcy5yYWRpdXMgKiAwLjE7XG5cdFx0XHRcblx0XHRcdHggPSByYW5kb20ucmFuZ2UoIC0xLCAxICk7XG5cdFx0XHRcblx0XHRcdHRoaXMucG9zaXRpb25zWyB2ICogMyArIDAgXSA9IHggKiB0aGlzLnJhZGl1cztcblx0XHRcdHRoaXMucG9zaXRpb25zWyB2ICogMyArIDEgXSA9IE1hdGguc2luKCB4ICogTWF0aC5QSSAqIDEwICkgKiB0aGlzLnJhZGl1cztcblx0XHRcdHRoaXMucG9zaXRpb25zWyB2ICogMyArIDIgXSA9IHRoaXMucmFkaXVzICogLTAuNTtcblxuXHRcdFx0dGhpcy52ZWxvY2l0eVsgdiAqIDMgKyAwIF0gPSByYW5kb20ucmFuZ2UoIC0wLjAxLCAwLjAxICkgKiAwO1xuXHRcdFx0dGhpcy52ZWxvY2l0eVsgdiAqIDMgKyAxIF0gPSByYW5kb20ucmFuZ2UoIC0wLjAxLCAwLjAxICkgKiAxMDtcblx0XHRcdHRoaXMudmVsb2NpdHlbIHYgKiAzICsgMiBdID0gcmFuZG9tLnJhbmdlKCAtMC4wMSwgMC4wMSApICogMDtcblxuXHRcdFx0Ly8gaHVlID0gKHYgLyB0aGlzLmNvdW50ICkgKiAwLjIgKyAwLjQ1O1xuXHRcdFx0XG5cdFx0XHRodWUgPSB4ICogMC4zICsgMC42NTtcblxuXHRcdFx0Y29sb3Iuc2V0SFNMKCBodWUsIDEuMCwgMC41NSApO1xuXG5cdFx0XHR0aGlzLmNvbG9yc1sgdiAqIDMgKyAwIF0gPSBjb2xvci5yO1xuXHRcdFx0dGhpcy5jb2xvcnNbIHYgKiAzICsgMSBdID0gY29sb3IuZztcblx0XHRcdHRoaXMuY29sb3JzWyB2ICogMyArIDIgXSA9IGNvbG9yLmI7XG5cblx0XHR9XG5cblx0XHR0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSggJ3Bvc2l0aW9uJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSggdGhpcy5wb3NpdGlvbnMsIDMgKSApO1xuXHRcdHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCAnY3VzdG9tQ29sb3InLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKCB0aGlzLmNvbG9ycywgMyApICk7XG5cdFx0dGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoICdzaXplJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSggdGhpcy5zaXplcywgMSApICk7XG5cblx0XHR0aGlzLm9iamVjdCA9IG5ldyBUSFJFRS5Qb2ludENsb3VkKCB0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsICk7XG5cdFx0dGhpcy5vYmplY3QucG9zaXRpb24ueSAtPSB0aGlzLnJhZGl1cyAqIDAuMjtcblx0XHRcblx0XHR0aGlzLnBvZW0uc2NlbmUuYWRkKCB0aGlzLm9iamVjdCApO1xuXHRcdFxuXHRcdHRoaXMub2JqZWN0LnNjYWxlLm11bHRpcGx5U2NhbGFyKCAxLjUgKTtcblx0XHRcblx0XG5cdFxuXHRcdHRoaXMucG9lbS5vbiggJ3VwZGF0ZScsIHRoaXMudXBkYXRlLmJpbmQodGhpcykgKTtcblx0XHRcblx0fSxcblx0XG5cdGVycm9yIDogZnVuY3Rpb24oIGVycm9yICkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCBsb2FkIGFzc2V0cyBmb3IgdGhlIFNpbmVHcmF2aXR5Q2xvdWRcIiwgZXJyb3IpO1xuXHR9LFxuXHRcblx0dXBkYXRlIDogZnVuY3Rpb24oZSkge1xuXHRcdFxuXHRcdHZhciB1bml0VGltZVggPSBNYXRoLmNvcyggZS50aW1lICogMC4wMDAwNSAqIDEgKTtcblx0XHR2YXIgdW5pdFRpbWVZID0gTWF0aC5jb3MoIGUudGltZSAqIDAuMDAwMDUgKiAyICk7XG5cdFx0dmFyIHVuaXRUaW1lWiA9IE1hdGguY29zKCBlLnRpbWUgKiAwLjAwMDA1ICogMyApO1xuXHRcdFxuXHRcdHZhciBkMjtcblx0XG5cdFx0Zm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmNvdW50OyBpKysgKSB7XG5cdFx0XHRcblx0XHRcdGQyID10aGlzLnBvc2l0aW9uc1sgaSAqIDMgKyAwIF0gKiB0aGlzLnBvc2l0aW9uc1sgaSAqIDMgKyAwIF0gK1xuXHRcdFx0ICAgIHRoaXMucG9zaXRpb25zWyBpICogMyArIDEgXSAqIHRoaXMucG9zaXRpb25zWyBpICogMyArIDEgXSArXG5cdFx0XHQgICAgdGhpcy5wb3NpdGlvbnNbIGkgKiAzICsgMiBdICogdGhpcy5wb3NpdGlvbnNbIGkgKiAzICsgMiBdO1xuXG5cdFx0XHR0aGlzLnZlbG9jaXR5WyBpICogMyArIDAgXSAtPSB1bml0VGltZVggKiB0aGlzLnBvc2l0aW9uc1sgaSAqIDMgKyAwIF0gLyBkMjtcblx0XHRcdHRoaXMudmVsb2NpdHlbIGkgKiAzICsgMSBdIC09IHVuaXRUaW1lWSAqIHRoaXMucG9zaXRpb25zWyBpICogMyArIDEgXSAvIGQyO1xuXHRcdFx0dGhpcy52ZWxvY2l0eVsgaSAqIDMgKyAyIF0gLT0gdW5pdFRpbWVaICogdGhpcy5wb3NpdGlvbnNbIGkgKiAzICsgMiBdIC8gZDI7XG5cblx0XHRcdHRoaXMucG9zaXRpb25zWyBpICogMyArIDAgXSArPSB1bml0VGltZVggKiB0aGlzLnZlbG9jaXR5WyBpICogMyArIDAgXTtcblx0XHRcdHRoaXMucG9zaXRpb25zWyBpICogMyArIDEgXSArPSB1bml0VGltZVkgKiB0aGlzLnZlbG9jaXR5WyBpICogMyArIDEgXTtcblx0XHRcdHRoaXMucG9zaXRpb25zWyBpICogMyArIDIgXSArPSB1bml0VGltZVogKiB0aGlzLnZlbG9jaXR5WyBpICogMyArIDIgXTtcblx0XHRcdFxuXHRcdH1cblx0XHRcblx0XHR0aGlzLmdlb21ldHJ5LmF0dHJpYnV0ZXMucG9zaXRpb24ubmVlZHNVcGRhdGUgPSB0cnVlO1xuXHRcdFxuXHR9XG5cdFxufTsiLCJ2YXIgcmFuZG9tID0gcmVxdWlyZSgnLi4vdXRpbHMvcmFuZG9tJyk7XG5cbnZhciBTcGhlcmVzID0gZnVuY3Rpb24ocG9lbSwgcHJvcGVydGllcykge1xuXHRcblx0dGhpcy5wb2VtID0gcG9lbTtcblxuXHR0aGlzLmNvdW50ID0gcHJvcGVydGllcy5jb3VudCA+IDAgPyBwcm9wZXJ0aWVzLmNvdW50IDogMTA7XG5cdHRoaXMuZGlzcGVyc2lvbiA9IHByb3BlcnRpZXMuZGlzcGVyc2lvbiB8fCAxMDtcblx0dGhpcy5yYWRpdXMgPSBwcm9wZXJ0aWVzLnJhZGl1cyA+IDAgPyBwcm9wZXJ0aWVzLnJhZGl1cyA6IDE7XG5cdFxuXHR0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KCB0aGlzLnJhZGl1cywgMzIsIDMyICk7XG5cdHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoIHsgY29sb3IgOiAweGZmMDAwMCB9ICk7XG5cdFxuXG5cdHRoaXMubWVzaGVzID0gW107XG5cdFxuXHR2YXIgaT0gLTE7IHdoaWxlKCArK2kgPCBwcm9wZXJ0aWVzLmNvdW50ICkge1xuXHRcdFxuXHRcdHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goIHRoaXMuZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwgKTtcblx0XHRcblx0XHRtZXNoLnBvc2l0aW9uLnggPSByYW5kb20ucmFuZ2UoIC10aGlzLmRpc3BlcnNpb24sIHRoaXMuZGlzcGVyc2lvbiApO1xuXHRcdG1lc2gucG9zaXRpb24ueSA9IHJhbmRvbS5yYW5nZSggLXRoaXMuZGlzcGVyc2lvbiwgdGhpcy5kaXNwZXJzaW9uICk7XG5cdFx0bWVzaC5wb3NpdGlvbi56ID0gcmFuZG9tLnJhbmdlKCAtdGhpcy5kaXNwZXJzaW9uLCB0aGlzLmRpc3BlcnNpb24gKTtcblx0XHRcblx0XHR0aGlzLnBvZW0uc2NlbmUuYWRkKCBtZXNoICk7XG5cdFx0dGhpcy5tZXNoZXMucHVzaCggbWVzaCApO1xuXHR9XG5cdFxuXHR0aGlzLnBvZW0ub24oICd1cGRhdGUnLCB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpICk7XG5cdFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTcGhlcmVzO1xuXG5TcGhlcmVzLnByb3RvdHlwZSA9IHtcblx0XG5cdHVwZGF0ZSA6IGZ1bmN0aW9uKGUpIHtcblx0XHRcblx0XHR2YXIgaT0gLTE7IHdoaWxlKCArK2kgPCB0aGlzLmNvdW50ICkge1xuXHRcdFxuXHRcdFx0dGhpcy5tZXNoZXNbaV0ucG9zaXRpb24ueCArPSByYW5kb20ucmFuZ2UoIC0wLjAwMDUsIDAuMDAwNSApICogdGhpcy5kaXNwZXJzaW9uICogZS5kdDtcblx0XHRcdHRoaXMubWVzaGVzW2ldLnBvc2l0aW9uLnkgKz0gcmFuZG9tLnJhbmdlKCAtMC4wMDA1LCAwLjAwMDUgKSAqIHRoaXMuZGlzcGVyc2lvbiAqIGUuZHQ7XG5cdFx0XHR0aGlzLm1lc2hlc1tpXS5wb3NpdGlvbi56ICs9IHJhbmRvbS5yYW5nZSggLTAuMDAwNSwgMC4wMDA1ICkgKiB0aGlzLmRpc3BlcnNpb24gKiBlLmR0O1xuXHRcdFxuXHRcdH1cblx0XHRcblx0fVxuXHRcbn07IiwidmFyIHJhbmRvbVx0XHQ9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3JhbmRvbScpXG4gICwgbG9hZFRleHR1cmVcdD0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvbG9hZFRleHR1cmUnKVxuICAsIGxvYWRUZXh0XHQ9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL2xvYWRUZXh0JylcbiAgLCBSU1ZQXHRcdD0gcmVxdWlyZSgncnN2cCcpXG4gICwgc2ltcGxleDJcdD0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvc2ltcGxleDInKVxuO1xuXHRcbnZhciBUZXh0dXJlUG9zaXRpb25hbE1hdHJpY2VzID0gZnVuY3Rpb24ocG9lbSwgcHJvcGVydGllcykge1xuXG5cdHRoaXMucG9lbSA9IHBvZW07XG5cdFxuXHR0aGlzLm9iamVjdCA9IG51bGw7XG5cdHRoaXMubWF0ZXJpYWwgPSBudWxsO1xuXHR0aGlzLmF0dHJpYnV0ZXMgPSBudWxsO1xuXHR0aGlzLnVuaWZvcm1zID0gbnVsbDtcblxuXHR0aGlzLnRleHR1cmUgPSBudWxsO1xuXHR0aGlzLnZlcnRleFNoYWRlciA9IG51bGw7XG5cdHRoaXMuZnJhZ21lbnRTaGFkZXIgPSBudWxsO1xuXHRcblx0dGhpcy5jb3VudCA9IDUwMDAwO1xuXHR0aGlzLnJhZGl1cyA9IDQwMDtcblx0dGhpcy5wb2ludFNpemUgPSAxNDtcblx0XG5cdFJTVlAuYWxsKFtcblx0XHRsb2FkVGV4dHVyZSggXCJhc3NldHMvaW1hZ2VzL3NpbmVncmF2aXR5Y2xvdWQucG5nXCIsIHRoaXMsIFwidGV4dHVyZVwiICksXG5cdFx0bG9hZFRleHQoIFwianMvZGVtb3MvVGV4dHVyZVBvc2l0aW9uYWxNYXRyaWNlcy9zaGFkZXIudmVydFwiLCB0aGlzLCBcInZlcnRleFNoYWRlclwiICksXG5cdFx0bG9hZFRleHQoIFwianMvZGVtb3MvVGV4dHVyZVBvc2l0aW9uYWxNYXRyaWNlcy9zaGFkZXIuZnJhZ1wiLCB0aGlzLCBcImZyYWdtZW50U2hhZGVyXCIgKVxuXHRdKVxuXHQudGhlbihcblx0XHR0aGlzLnN0YXJ0LmJpbmQodGhpcyksXG5cdFx0dGhpcy5lcnJvci5iaW5kKHRoaXMpXG5cdCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRleHR1cmVQb3NpdGlvbmFsTWF0cmljZXM7XG5cblRleHR1cmVQb3NpdGlvbmFsTWF0cmljZXMucHJvdG90eXBlID0ge1xuXHRcblx0c3RhcnQgOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciB2ZWMzRmxvYXRMZW5ndGggPSAzO1xuXHRcdHZhciBwb2ludHNMZW5ndGggPSA4O1xuXHRcdHZhciBib3hHZW9tZXRyeUxlbmd0aCA9IHBvaW50c0xlbmd0aCAqIHZlYzNGbG9hdExlbmd0aDtcblxuXHRcdHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcblxuXHRcdHRoaXMucG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5jb3VudCAqIGJveEdlb21ldHJ5TGVuZ3RoICk7XG5cdFx0dGhpcy52ZWxvY2l0eSA9IG5ldyBGbG9hdDMyQXJyYXkoIHRoaXMuY291bnQgKiB2ZWMzRmxvYXRMZW5ndGggKTtcblx0XHR0aGlzLmNvbG9ycyA9IG5ldyBGbG9hdDMyQXJyYXkoIHRoaXMuY291bnQgKiBib3hHZW9tZXRyeUxlbmd0aCApO1xuXHRcdHRoaXMuc2l6ZXMgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLmNvdW50ICogcG9pbnRzTGVuZ3RoICk7XG5cdFx0dGhpcy50cmFuc2Zvcm1JbmRpY2VzID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5jb3VudCAqIHBvaW50c0xlbmd0aCApO1xuXG5cdFx0dmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKDB4MDAwMDAwKTtcblx0XHR2YXIgaHVlO1xuXHRcdFxuXHRcdHZhciB2ZXJ0aWNlcyA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSggMSwgMSwgMSApLnZlcnRpY2VzO1xuXG5cdFx0dmFyIHgsIHksIHosIGksIGo7XG5cblx0XHRmb3IoIGkgPSAwOyBpIDwgdGhpcy5jb3VudDsgaSsrICkge1xuXHRcdFx0XG5cdFx0XHRodWUgPSAodGhpcy5wb3NpdGlvbnNbIGkgKiAzICsgMCBdIC8gdGhpcy5yYWRpdXMgKiAwLjMgKyAwLjY1KSAlIDE7XG5cdFx0XHRodWUgPSByYW5kb20ucmFuZ2UoIDAsIDEgKTtcblxuXHRcdFx0Y29sb3Iuc2V0SFNMKCBodWUsIDEuMCwgMC41NSApO1xuXHRcdFx0XG5cdFx0XHRmb3IoIGo9MDsgaiA8IHZlcnRpY2VzLmxlbmd0aCA7IGorKyApIHtcblx0XHRcdFx0XG5cdFx0XHRcdHZhciBvZmZzZXQzID0gKGkgKiBib3hHZW9tZXRyeUxlbmd0aCkgKyAoaiAqIHZlYzNGbG9hdExlbmd0aCk7XG5cdFx0XHRcdHZhciBvZmZzZXQxID0gKGkgKiBwb2ludHNMZW5ndGggKyBqKTtcblxuXHRcdFx0XHR0aGlzLnNpemVzWyBvZmZzZXQxIF0gPSB0aGlzLnBvaW50U2l6ZTtcblx0XHRcdFx0dGhpcy50cmFuc2Zvcm1JbmRpY2VzWyBvZmZzZXQxIF0gPSBpO1xuXHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0dGhpcy5wb3NpdGlvbnNbIG9mZnNldDMgKyAwIF0gPSB2ZXJ0aWNlc1tqXS54ICogNDtcblx0XHRcdFx0dGhpcy5wb3NpdGlvbnNbIG9mZnNldDMgKyAxIF0gPSB2ZXJ0aWNlc1tqXS55ICogNDtcblx0XHRcdFx0dGhpcy5wb3NpdGlvbnNbIG9mZnNldDMgKyAyIF0gPSB2ZXJ0aWNlc1tqXS56ICogNDtcblxuXHRcdFx0XHR0aGlzLmNvbG9yc1sgb2Zmc2V0MyArIDAgXSA9IGNvbG9yLnI7XG5cdFx0XHRcdHRoaXMuY29sb3JzWyBvZmZzZXQzICsgMSBdID0gY29sb3IuZztcblx0XHRcdFx0dGhpcy5jb2xvcnNbIG9mZnNldDMgKyAyIF0gPSBjb2xvci5iO1xuXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5tYXRyaWNlc1RleHR1cmVTaXplID0gdGhpcy5jYWxjdWxhdGVTcXVhcmVkVGV4dHVyZVNpemUoIHRoaXMuY291bnQgKiAxNiApOyAvLzE2IGZsb2F0cyBwZXIgbWF0cml4XG5cdFx0XG5cdFx0dGhpcy5tYXRyaWNlcyA9IFtdO1xuXHRcdHRoaXMubWF0cmljZXNEYXRhID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5tYXRyaWNlc1RleHR1cmVTaXplICogdGhpcy5tYXRyaWNlc1RleHR1cmVTaXplICogNCApO1xuXHRcdFxuXHRcdHZhciByb3RhdGVNID0gbmV3IFRIUkVFLk1hdHJpeDQoKTtcblx0XHR2YXIgdHJhbnNsYXRlTSA9IG5ldyBUSFJFRS5NYXRyaXg0KCk7XG5cdFx0dmFyIHNjYWxlTSA9IG5ldyBUSFJFRS5NYXRyaXg0KCk7XG5cdFx0dmFyIGV1bGVyID0gbmV3IFRIUkVFLkV1bGVyKCk7XG5cdFx0dmFyIHM7XG5cdFx0XG5cdFx0Zm9yKCBpID0gMDsgaSA8IHRoaXMuY291bnQgOyBpKysgKSB7XG5cdFx0XHRcblx0XHRcdHMgPSByYW5kb20ucmFuZ2UoIDAuNSwgMiApO1xuXHRcdFx0XG5cdFx0XHRzY2FsZU0ubWFrZVNjYWxlKCBzLCBzLCBzICk7XG5cdFx0XHRcblx0XHRcdHRyYW5zbGF0ZU0ubWFrZVRyYW5zbGF0aW9uKFxuXHRcdFx0XHRyYW5kb20ucmFuZ2UoIC10aGlzLnJhZGl1cywgdGhpcy5yYWRpdXMgKSAqIDAuNSxcblx0XHRcdFx0cmFuZG9tLnJhbmdlKCAtdGhpcy5yYWRpdXMsIHRoaXMucmFkaXVzICkgKiAwLjUsXG5cdFx0XHRcdHJhbmRvbS5yYW5nZSggLXRoaXMucmFkaXVzLCB0aGlzLnJhZGl1cyApICogMC41XG5cdFx0XHQpO1xuXHRcdFx0XG5cdFx0XHRldWxlci5zZXQoXG5cdFx0XHRcdHJhbmRvbS5yYW5nZSggMCwgMiAqIE1hdGguUEkgKSxcblx0XHRcdFx0cmFuZG9tLnJhbmdlKCAwLCAyICogTWF0aC5QSSApLFxuXHRcdFx0XHRyYW5kb20ucmFuZ2UoIDAsIDIgKiBNYXRoLlBJIClcblx0XHRcdCk7XG5cblx0XHRcdHJvdGF0ZU0ubWFrZVJvdGF0aW9uRnJvbUV1bGVyKCBldWxlciApO1xuXHRcdFx0XG5cdFx0XHR0aGlzLm1hdHJpY2VzW2ldID0gbmV3IFRIUkVFLk1hdHJpeDQoKVxuXHRcdFx0XHQubXVsdGlwbHkoIHRyYW5zbGF0ZU0gKVxuXHRcdFx0XHQubXVsdGlwbHkoIHJvdGF0ZU0gKVxuXHRcdFx0XHQubXVsdGlwbHkoIHNjYWxlTSApO1xuXHRcdFx0XG5cdFx0XHQvLyB0aGlzLm1hdHJpY2VzW2ldID0gbmV3IFRIUkVFLk1hdHJpeDQoKTtcblx0XHRcdFxuXHRcdFx0dGhpcy5tYXRyaWNlc1tpXS5mbGF0dGVuVG9BcnJheU9mZnNldCggdGhpcy5tYXRyaWNlc0RhdGEsIGkgKiAxNiApO1xuXHRcdFx0XG5cdFx0fVxuXHRcdFxuXHRcdHRoaXMubWF0cmljZXNUZXh0dXJlID0gbmV3IFRIUkVFLkRhdGFUZXh0dXJlKFxuXHRcdFx0dGhpcy5tYXRyaWNlc0RhdGEsXG5cdFx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZVNpemUsXG5cdFx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZVNpemUsXG5cdFx0XHRUSFJFRS5SR0JBRm9ybWF0LFxuXHRcdFx0VEhSRUUuRmxvYXRUeXBlXG5cdFx0KTtcblx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xuXHRcdHRoaXMubWF0cmljZXNUZXh0dXJlLm1hZ0ZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XG5cdFx0dGhpcy5tYXRyaWNlc1RleHR1cmUuZ2VuZXJhdGVNaXBtYXBzID0gZmFsc2U7XG5cdFx0dGhpcy5tYXRyaWNlc1RleHR1cmUuZmxpcFkgPSBmYWxzZTtcblx0XHR0aGlzLm1hdHJpY2VzVGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cdFx0XG5cdFx0dGhpcy5hdHRyaWJ1dGVzID0ge1xuXG5cdFx0XHRzaXplOiAgICAgICBcdHsgdHlwZTogJ2YnLCB2YWx1ZTogbnVsbCB9LFxuXHRcdFx0Y3VzdG9tQ29sb3I6XHR7IHR5cGU6ICdjJywgdmFsdWU6IG51bGwgfSxcblx0XHRcdHRyYW5zZm9ybUluZGV4Olx0eyB0eXBlOiAnZicsIHZhbHVlOiBudWxsIH1cblxuXHRcdH07XG5cblx0XHR0aGlzLnVuaWZvcm1zID0ge1xuXG5cdFx0XHRjb2xvcjogICAgIFx0XHRcdFx0eyB0eXBlOiBcImNcIiwgdmFsdWU6IG5ldyBUSFJFRS5Db2xvciggMHhmZmZmZmYgKSB9LFxuXHRcdFx0dGV4dHVyZTogICBcdFx0XHRcdHsgdHlwZTogXCJ0XCIsIHZhbHVlOiB0aGlzLnRleHR1cmUgfSxcblx0XHRcdG1hdHJpY2VzVGV4dHVyZTpcdFx0eyB0eXBlOiBcInRcIiwgdmFsdWU6IHRoaXMubWF0cmljZXNUZXh0dXJlIH0sXG5cdFx0XHR0aW1lOiAgICAgIFx0XHRcdFx0eyB0eXBlOiAnZicsIHZhbHVlOiBEYXRlLm5vdygpIH0sXG5cdFx0XHRtYXRyaWNlc1RleHR1cmVTaXplOlx0eyB0eXBlOiAnZicsIHZhbHVlOiB0aGlzLm1hdHJpY2VzVGV4dHVyZVNpemUgfVxuXG5cdFx0fTtcblxuXHRcdHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoIHtcblxuXHRcdFx0dW5pZm9ybXM6ICAgICAgIHRoaXMudW5pZm9ybXMsXG5cdFx0XHRhdHRyaWJ1dGVzOiAgICAgdGhpcy5hdHRyaWJ1dGVzLFxuXHRcdFx0dmVydGV4U2hhZGVyOiAgIHRoaXMudmVydGV4U2hhZGVyLFxuXHRcdFx0ZnJhZ21lbnRTaGFkZXI6IHRoaXMuZnJhZ21lbnRTaGFkZXIsXG5cblx0XHRcdGJsZW5kaW5nOiAgICAgICBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxuXHRcdFx0ZGVwdGhUZXN0OiAgICAgIGZhbHNlLFxuXHRcdFx0dHJhbnNwYXJlbnQ6ICAgIHRydWVcblxuXHRcdH0pO1xuXHRcdFxuXHRcdHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCAncG9zaXRpb24nLFx0XHRcdG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIHRoaXMucG9zaXRpb25zLCAzICkgKTtcblx0XHR0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSggJ2N1c3RvbUNvbG9yJyxcdFx0bmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSggdGhpcy5jb2xvcnMsIDMgKSApO1xuXHRcdHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCAnc2l6ZScsXHRcdFx0XHRuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKCB0aGlzLnNpemVzLCAxICkgKTtcblx0XHR0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSggJ3RyYW5zZm9ybUluZGV4JyxcdG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIHRoaXMudHJhbnNmb3JtSW5kaWNlcywgMSApICk7XG5cblx0XHR0aGlzLm9iamVjdCA9IG5ldyBUSFJFRS5Qb2ludENsb3VkKCB0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsICk7XG5cdFx0dGhpcy5vYmplY3QucG9zaXRpb24ueSAtPSB0aGlzLnJhZGl1cyAqIDAuMjtcblx0XHRcblx0XHR0aGlzLnBvZW0uc2NlbmUuYWRkKCB0aGlzLm9iamVjdCApO1xuXHRcblx0XG5cdFx0dGhpcy5wb2VtLm9uKCAndXBkYXRlJywgdGhpcy51cGRhdGUuYmluZCh0aGlzKSApO1xuXHRcdFxuXHR9LFxuXHRcblx0Y2FsY3VsYXRlU3F1YXJlZFRleHR1cmVTaXplIDogZnVuY3Rpb24oIGNvdW50ICkge1xuXHRcdFxuXHRcdHZhciBzaXplID0gMTtcblx0XHR2YXIgaSA9IDA7XG5cdFx0XG5cdFx0d2hpbGUoIHNpemUgKiBzaXplIDwgKGNvdW50IC8gNCkgKSB7XG5cdFx0XHRcblx0XHRcdGkrKztcblx0XHRcdHNpemUgPSBNYXRoLnBvdyggMiwgaSApO1xuXHRcdFx0XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBzaXplO1xuXHR9LFxuXHRcblx0ZXJyb3IgOiBmdW5jdGlvbiggZXJyb3IgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQ291bGQgbm90IGxvYWQgYXNzZXRzIGZvciB0aGUgVGV4dHVyZVBvc2l0aW9uYWxNYXRyaWNlc1wiLCBlcnJvcik7XG5cdH0sXG5cdFxuXHR1cGRhdGUgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHR2YXIgdHJhbnNsYXRpb24gPSBuZXcgVEhSRUUuTWF0cml4NCgpO1xuXHRcdHZhciBldWxlciA9IG5ldyBUSFJFRS5FdWxlcigpO1xuXHRcdFxuXHRcdHJldHVybiBmdW5jdGlvbihlKSB7XG5cblx0XHRcdHRoaXMudW5pZm9ybXMudGltZS52YWx1ZSA9IGUudGltZTtcblx0XHRcdFxuXHRcdFx0dmFyIHgseTtcblx0XHRcblx0XHRcdGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5jb3VudCA7IGkrKyApIHtcblx0XHRcdFx0XG5cdFx0XHRcdHggPSBlLnRpbWUgLyAxMDAwO1xuXHRcdFx0XHR5ID0gaSAqIDEwMDA7XG5cdFx0XHRcdFxuXHRcdFx0XHR0cmFuc2xhdGlvbi5tYWtlVHJhbnNsYXRpb24oXG5cdFx0XHRcdFx0c2ltcGxleDIucmFuZ2UoIHgsIHksIC0xLCAxICksXG5cdFx0XHRcdFx0c2ltcGxleDIucmFuZ2UoIHgsIHkgKyAzMzMsIC0xLCAxICksXG5cdFx0XHRcdFx0c2ltcGxleDIucmFuZ2UoIHgsIHkgKyA2NjYsIC0xLCAxIClcblx0XHRcdFx0KTtcblx0XHRcdFx0XG5cdFx0XHRcdHRoaXMubWF0cmljZXNbaV0ubXVsdGlwbHlNYXRyaWNlcyggdHJhbnNsYXRpb24sIHRoaXMubWF0cmljZXNbaV0gKTtcblx0XHRcdFx0XG5cdFx0XHRcdC8vIGV1bGVyLnNldChcblx0XHRcdFx0Ly8gXHRyYW5kb20ucmFuZ2UoIDAsIDIgKiBNYXRoLlBJICksXG5cdFx0XHRcdC8vIFx0cmFuZG9tLnJhbmdlKCAwLCAyICogTWF0aC5QSSApLFxuXHRcdFx0XHQvLyBcdHJhbmRvbS5yYW5nZSggMCwgMiAqIE1hdGguUEkgKVxuXHRcdFx0XHQvLyApO1xuXHRcdFx0XHQvL1xuXHRcdFx0XHQvLyByb3RhdGVNLm1ha2VSb3RhdGlvbkZyb21FdWxlciggZXVsZXIgKTtcblx0XHRcdFx0XG5cdFx0XHRcdFxuXHRcdFx0XHR0aGlzLm1hdHJpY2VzW2ldLmZsYXR0ZW5Ub0FycmF5T2Zmc2V0KCB0aGlzLm1hdHJpY2VzRGF0YSwgaSAqIDE2ICk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHRoaXMubWF0cmljZXNUZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblx0XHR9O1xuXHR9KClcblx0XG59O1xuXG53aW5kb3cuY29uc29sZU1hdHJpeEVsZW1lbnRzID0gZnVuY3Rpb24oIGVscywgZGVjaW1hbFBsYWNlcyApIHtcbiBcblx0dmFyIGksIGosIGVsLCByZXN1bHRzO1xuIFxuXHRyZXN1bHRzID0gW107XG5cdGogPSAwO1xuIFxuXHRmb3IoIGk9MDsgaSA8IGVscy5sZW5ndGg7IGkrKyApIHtcblx0XHRcblx0XHRpZiggaiA9PT0gMCApIHtcblx0XHRcdHJlc3VsdHMucHVzaChbXSk7XG5cdFx0fVxuIFxuXHRcdGVsID0gZWxzW2ldO1xuIFxuXHRcdGlmKCB0eXBlb2YgZGVjaW1hbFBsYWNlcyA9PT0gXCJudW1iZXJcIiApIHtcbiBcblx0XHRcdGVsID0gTWF0aC5yb3VuZCggTWF0aC5wb3coMTAsIGRlY2ltYWxQbGFjZXMpICogZWwgKSAvIE1hdGgucG93KDEwLCBkZWNpbWFsUGxhY2VzKTtcbiBcblx0XHR9XG4gXG5cdFx0cmVzdWx0c1tNYXRoLmZsb29yKGkgLyA0KSAlIDRdLnB1c2goIGVsICk7XG4gXG5cdFx0aisrO1xuXHRcdGogJT0gNDtcblx0XHRcblx0XHRpZiggaSAlIDE2ID09PSAxNSApIHtcblx0XHRcdGNvbnNvbGUudGFibGUoIHJlc3VsdHMgKTtcblx0XHRcdHJlc3VsdHMgPSBbXTtcblx0XHR9XG4gXG5cdH1cbiBcbn07IiwidmFyIHJhbmRvbVx0XHQ9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3JhbmRvbScpXG4gICwgbG9hZFRleHR1cmVcdD0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvbG9hZFRleHR1cmUnKVxuICAsIGxvYWRUZXh0XHQ9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL2xvYWRUZXh0JylcbiAgLCBSU1ZQXHRcdD0gcmVxdWlyZSgncnN2cCcpXG47XG5cbnZhciBVbmlmb3JtUG9zaXRpb25hbE1hdHJpY2VzID0gZnVuY3Rpb24ocG9lbSwgcHJvcGVydGllcykge1xuXG5cdHRoaXMucG9lbSA9IHBvZW07XG5cdFxuXHR0aGlzLm9iamVjdCA9IG51bGw7XG5cdHRoaXMubWF0ZXJpYWwgPSBudWxsO1xuXHR0aGlzLmF0dHJpYnV0ZXMgPSBudWxsO1xuXHR0aGlzLnVuaWZvcm1zID0gbnVsbDtcblxuXHR0aGlzLnRleHR1cmUgPSBudWxsO1xuXHR0aGlzLnZlcnRleFNoYWRlciA9IG51bGw7XG5cdHRoaXMuZnJhZ21lbnRTaGFkZXIgPSBudWxsO1xuXHRcblx0dGhpcy5jb3VudCA9IDIwMDAwMDtcblx0dGhpcy5yYWRpdXMgPSAyMDA7XG5cdHRoaXMucG9pbnRTaXplID0gNztcblx0XG5cdFJTVlAuYWxsKFtcblx0XHRsb2FkVGV4dHVyZSggXCJhc3NldHMvaW1hZ2VzL3NpbmVncmF2aXR5Y2xvdWQucG5nXCIsIHRoaXMsIFwidGV4dHVyZVwiICksXG5cdFx0bG9hZFRleHQoIFwianMvZGVtb3MvVW5pZm9ybVBvc2l0aW9uYWxNYXRyaWNlcy9zaGFkZXIudmVydFwiLCB0aGlzLCBcInZlcnRleFNoYWRlclwiICksXG5cdFx0bG9hZFRleHQoIFwianMvZGVtb3MvVW5pZm9ybVBvc2l0aW9uYWxNYXRyaWNlcy9zaGFkZXIuZnJhZ1wiLCB0aGlzLCBcImZyYWdtZW50U2hhZGVyXCIgKVxuXHRdKVxuXHQudGhlbihcblx0XHR0aGlzLnN0YXJ0LmJpbmQodGhpcyksXG5cdFx0dGhpcy5lcnJvci5iaW5kKHRoaXMpXG5cdCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVuaWZvcm1Qb3NpdGlvbmFsTWF0cmljZXM7XG5cblVuaWZvcm1Qb3NpdGlvbmFsTWF0cmljZXMucHJvdG90eXBlID0ge1xuXHRcblx0c3RhcnQgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHR2YXIgdHJhbnNmb3JtQ291bnQgPSA1MDtcblx0XHRcblx0XHRcblx0XHR0aGlzLmF0dHJpYnV0ZXMgPSB7XG5cblx0XHRcdHNpemU6ICAgICAgIFx0eyB0eXBlOiAnZicsIHZhbHVlOiBudWxsIH0sXG5cdFx0XHRjdXN0b21Db2xvcjpcdHsgdHlwZTogJ2MnLCB2YWx1ZTogbnVsbCB9LFxuXHRcdFx0dHJhbnNmb3JtSW5kZXg6XHR7IHR5cGU6ICdmJywgdmFsdWU6IG51bGwgfVxuXG5cdFx0fTtcblxuXHRcdHRoaXMudW5pZm9ybXMgPSB7XG5cblx0XHRcdGNvbG9yOiAgICAgXHRcdFx0eyB0eXBlOiBcImNcIiwgdmFsdWU6IG5ldyBUSFJFRS5Db2xvciggMHhmZmZmZmYgKSB9LFxuXHRcdFx0dGV4dHVyZTogICBcdFx0XHR7IHR5cGU6IFwidFwiLCB2YWx1ZTogdGhpcy50ZXh0dXJlIH0sXG5cdFx0XHR0aW1lOiAgICAgIFx0XHRcdHsgdHlwZTogJ2YnLCB2YWx1ZTogRGF0ZS5ub3coKSB9LFxuXHRcdFx0dHJhbnNmb3JtTWF0cml4Olx0eyB0eXBlOiAnbTR2JywgdmFsdWU6IFtdIH1cblxuXHRcdH07XG5cblx0XHR0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKCB7XG5cblx0XHRcdHVuaWZvcm1zOiAgICAgICB0aGlzLnVuaWZvcm1zLFxuXHRcdFx0YXR0cmlidXRlczogICAgIHRoaXMuYXR0cmlidXRlcyxcblx0XHRcdHZlcnRleFNoYWRlcjogICBcIiNkZWZpbmUgVFJBTlNGT1JNX01BVFJJWF9DT1VOVCBcIiArIHRyYW5zZm9ybUNvdW50ICsgXCJcXG5cIiArIHRoaXMudmVydGV4U2hhZGVyLFxuXHRcdFx0ZnJhZ21lbnRTaGFkZXI6IHRoaXMuZnJhZ21lbnRTaGFkZXIsXG5cblx0XHRcdGJsZW5kaW5nOiAgICAgICBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxuXHRcdFx0ZGVwdGhUZXN0OiAgICAgIGZhbHNlLFxuXHRcdFx0dHJhbnNwYXJlbnQ6ICAgIHRydWVcblxuXHRcdH0pO1xuXG5cdFx0dGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xuXG5cdFx0dGhpcy5wb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLmNvdW50ICogMyApO1xuXHRcdHRoaXMudmVsb2NpdHkgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLmNvdW50ICogMyApO1xuXHRcdHRoaXMuY29sb3JzID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5jb3VudCAqIDMgKTtcblx0XHR0aGlzLnNpemVzID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5jb3VudCApO1xuXHRcdHRoaXMudHJhbnNmb3JtSW5kaWNlcyA9IG5ldyBGbG9hdDMyQXJyYXkoIHRoaXMuY291bnQgKTtcblxuXHRcdHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigweDAwMDAwMCk7XG5cdFx0dmFyIGh1ZTtcblx0XHRcblx0XHR2YXIgdGhldGEsIHBoaTtcblx0XHRcblx0XHR2YXIgeDtcblxuXHRcdGZvciggdmFyIHYgPSAwOyB2IDwgdGhpcy5jb3VudDsgdisrICkge1xuXG5cdFx0XHR0aGlzLnNpemVzWyB2IF0gPSB0aGlzLnBvaW50U2l6ZTtcblx0XHRcdHRoaXMudHJhbnNmb3JtSW5kaWNlc1sgdiBdID0gcmFuZG9tLnJhbmdlSW50KCAwLCB0cmFuc2Zvcm1Db3VudCApO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHR0aGV0YSA9IHJhbmRvbS5yYW5nZUxvdyggMC4xLCBNYXRoLlBJICk7XG5cdFx0XHRwaGkgPSByYW5kb20ucmFuZ2VMb3coIE1hdGguUEkgKiAwLjMsIE1hdGguUEkgKTtcblx0XHRcdFxuXHRcdFx0dGhpcy5wb3NpdGlvbnNbIHYgKiAzICsgMCBdID0gTWF0aC5zaW4oIHRoZXRhICkgKiBNYXRoLmNvcyggcGhpICkgKiB0aGlzLnJhZGl1cyAqIHRoZXRhO1xuXHRcdFx0dGhpcy5wb3NpdGlvbnNbIHYgKiAzICsgMSBdID0gTWF0aC5zaW4oIHRoZXRhICkgKiBNYXRoLnNpbiggcGhpICkgKiB0aGlzLnJhZGl1cztcblx0XHRcdHRoaXMucG9zaXRpb25zWyB2ICogMyArIDIgXSA9IE1hdGguY29zKCB0aGV0YSApICogdGhpcy5yYWRpdXMgO1xuXHRcdFx0XG5cdFx0XHRcblx0XHRcdGh1ZSA9ICh0aGlzLnBvc2l0aW9uc1sgdiAqIDMgKyAwIF0gLyB0aGlzLnJhZGl1cyAqIDAuMyArIDAuNjUpICUgMTtcblxuXHRcdFx0Y29sb3Iuc2V0SFNMKCBodWUsIDEuMCwgMC41NSApO1xuXG5cdFx0XHR0aGlzLmNvbG9yc1sgdiAqIDMgKyAwIF0gPSBjb2xvci5yO1xuXHRcdFx0dGhpcy5jb2xvcnNbIHYgKiAzICsgMSBdID0gY29sb3IuZztcblx0XHRcdHRoaXMuY29sb3JzWyB2ICogMyArIDIgXSA9IGNvbG9yLmI7XG5cblx0XHR9XG5cdFx0XG5cdFx0Zm9yKCB2YXIgaSA9IDA7IGkgPCB0cmFuc2Zvcm1Db3VudCA7IGkrKyApIHtcblx0XHRcdFxuXHRcdFx0dGhpcy51bmlmb3Jtcy50cmFuc2Zvcm1NYXRyaXgudmFsdWVbaV0gPSBuZXcgVEhSRUUuTWF0cml4NCgpLm1ha2VUcmFuc2xhdGlvbihcblx0XHRcdFx0cmFuZG9tLnJhbmdlKCAtdGhpcy5yYWRpdXMsIHRoaXMucmFkaXVzICkgKiAwLjUsXG5cdFx0XHRcdHJhbmRvbS5yYW5nZSggLXRoaXMucmFkaXVzLCB0aGlzLnJhZGl1cyApICogMC41LFxuXHRcdFx0XHRyYW5kb20ucmFuZ2UoIC10aGlzLnJhZGl1cywgdGhpcy5yYWRpdXMgKSAqIDAuNVxuXHRcdFx0KTtcblx0XHRcdFxuXHRcdH1cblxuXHRcdHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCAncG9zaXRpb24nLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKCB0aGlzLnBvc2l0aW9ucywgMyApICk7XG5cdFx0dGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoICdjdXN0b21Db2xvcicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIHRoaXMuY29sb3JzLCAzICkgKTtcblx0XHR0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSggJ3NpemUnLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKCB0aGlzLnNpemVzLCAxICkgKTtcblx0XHR0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSggJ3RyYW5zZm9ybUluZGV4JywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSggdGhpcy50cmFuc2Zvcm1JbmRpY2VzLCAxICkgKTtcblxuXHRcdHRoaXMub2JqZWN0ID0gbmV3IFRIUkVFLlBvaW50Q2xvdWQoIHRoaXMuZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwgKTtcblx0XHR0aGlzLm9iamVjdC5wb3NpdGlvbi55IC09IHRoaXMucmFkaXVzICogMC4yO1xuXHRcdFxuXHRcdHRoaXMucG9lbS5zY2VuZS5hZGQoIHRoaXMub2JqZWN0ICk7XG5cdFxuXHRcblx0XHR0aGlzLnBvZW0ub24oICd1cGRhdGUnLCB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpICk7XG5cdFx0XG5cdH0sXG5cdFxuXHRlcnJvciA6IGZ1bmN0aW9uKCBlcnJvciApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgbG9hZCBhc3NldHMgZm9yIHRoZSBVbmlmb3JtUG9zaXRpb25hbE1hdHJpY2VzXCIsIGVycm9yKTtcblx0fSxcblx0XG5cdHVwZGF0ZSA6IGZ1bmN0aW9uKGUpIHtcblxuXHRcdHRoaXMudW5pZm9ybXMudGltZS52YWx1ZSA9IGUudGltZTtcblx0XHRcblx0fVxuXHRcbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cdGNvbmZpZyA6IHtcblx0XHRjYW1lcmEgOiB7XG5cdFx0XHR4IDogLTQwMCxcblx0XHRcdGZhciA6IDMwMDBcblx0XHR9XG5cdH0sXG5cdG9iamVjdHMgOiB7XG5cdFx0c3BoZXJlIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vZGVtb3MvRWFydGhcIiksXG5cdFx0XHRwcm9wZXJ0aWVzOiB7fVxuXHRcdH0sXG5cdFx0Y29udHJvbHMgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL2NhbWVyYXMvQ29udHJvbHNcIiksXG5cdFx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRcdG1pbkRpc3RhbmNlIDogNTAwLFxuXHRcdFx0XHRtYXhEaXN0YW5jZSA6IDEwMDAsXG5cdFx0XHRcdHpvb21TcGVlZCA6IDAuMSxcblx0XHRcdFx0YXV0b1JvdGF0ZSA6IHRydWUsXG5cdFx0XHRcdGF1dG9Sb3RhdGVTcGVlZCA6IDAuMlxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0aW5mbyA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2NvbXBvbmVudHMvSW5mb1wiKSxcblx0XHRcdHByb3BlcnRpZXMgOiB7XG5cdFx0XHRcdGRvY3VtZW50VGl0bGUgOiBcIkVhcnRoJ3MgQ08yIOKAkyBhIFRocmVlLmpzIFZpc3VhbGl6YXRpb24gYWRhcHRlZCBieSBHcmVnIFRhdHVtXCIsXG5cdFx0XHRcdHRpdGxlIDogXCJFYXJ0aCdzIENPMlwiLFxuXHRcdFx0XHRzdWJ0aXRsZSA6IFwiM2QgVmlzdWFsaXNhdGlvbiBvZiBhIG1hcCBmcm9tIE5BU0FcIixcblx0XHRcdFx0YXBwZW5kQ3JlZGl0cyA6IFwiPGJyLz4gTWFwIHZpc3VhbGl6YXRpb24gYnkgPGEgaHJlZj0naHR0cDovL3N2cy5nc2ZjLm5hc2EuZ292L2NnaS1iaW4vZGV0YWlscy5jZ2k/YWlkPTExNzE5Jz5OQVNBJ3MgR29kZGFyZCBTcGFjZSBGbGlnaHQgQ2VudGVyPC9hPlwiLFxuXHRcdFx0XHR0aXRsZUNzcyA6IHsgXCJmb250LXNpemVcIjogXCIzLjM1ZW1cIiB9LFxuXHRcdFx0XHRzdWJ0aXRsZUNzcyA6IHtcdFwiZm9udC1zaXplXCI6IFwiMC43ZW1cIiB9LFxuXHRcdFx0XHRzaG93QXJyb3dOZXh0IDogdHJ1ZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0c3RhcnMgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL1N0YXJzXCIpLFxuXHRcdH0sXG5cdFx0Ly8gc3RhdHMgOiB7XG5cdFx0Ly8gXHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL3V0aWxzL1N0YXRzXCIpXG5cdFx0Ly8gfSxcblx0XHRsaWdodHMgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL2xpZ2h0cy9UcmFja0NhbWVyYUxpZ2h0c1wiKVxuXHRcdH1cblx0fVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcblx0Y29uZmlnIDoge1xuXHRcdGNhbWVyYSA6IHtcblx0XHRcdHggOiAtNDAwXG5cdFx0fVxuXHR9LFxuXHRvYmplY3RzIDoge1xuXHRcdGVuZGxlc3NUZXJyYWluIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vZGVtb3MvRW5kbGVzc1RlcnJhaW5cIiksXG5cdFx0fSxcblx0XHRlbmRsZXNzQ2FtZXJhIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vZGVtb3MvRW5kbGVzc1RlcnJhaW4vY2FtZXJhXCIpLFxuXHRcdH0sXG5cdFx0c2t5IDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vY29tcG9uZW50cy9hbWJpYW5jZS9Ta3lcIiksXG5cdFx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRcdHdpZHRoOiAxMDAwMFxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Y2xvdWRzQm90dG9tIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vY29tcG9uZW50cy9hbWJpYW5jZS9DbG91ZHNcIiksXG5cdFx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRcdGhlaWdodDogLTIwMCxcblx0XHRcdFx0cm90YXRpb246IE1hdGguUEkgLyAyXG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIHN0YXRzIDoge1xuXHRcdC8vIFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vY29tcG9uZW50cy91dGlscy9TdGF0c1wiKVxuXHRcdC8vIH1cblx0fVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcblx0bWVzaEdyb3VwQm94RGVtbyA6IHJlcXVpcmUoXCIuL21lc2hHcm91cEJveERlbW9cIiksXG5cdGNhcmJvbkRpb3hpZGVFYXJ0aCA6IHJlcXVpcmUoXCIuL2NhcmJvbkRpb3hpZGVFYXJ0aFwiKSxcblx0ZW5kbGVzc1RlcnJhaW4gOiByZXF1aXJlKFwiLi9lbmRsZXNzVGVycmFpblwiKSxcblx0c3BoZXJlc0RlbW8gOiByZXF1aXJlKFwiLi9zcGhlcmVzRGVtb1wiKSxcblx0dnIgOiByZXF1aXJlKFwiLi92clwiKSxcblx0c2luZUdyYXZpdHlDbG91ZCA6IHJlcXVpcmUoXCIuL3NpbmVHcmF2aXR5Q2xvdWRcIiksXG5cdHVuaWZvcm1Qb3NpdGlvbmFsTWF0cmljZXMgOiByZXF1aXJlKFwiLi91bmlmb3JtUG9zaXRpb25hbE1hdHJpY2VzXCIpLFxuXHR0ZXh0dXJlUG9zaXRpb25hbE1hdHJpY2VzIDogcmVxdWlyZShcIi4vdGV4dHVyZVBvc2l0aW9uYWxNYXRyaWNlc1wiKVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcblx0Y29uZmlnIDoge1xuXHRcdGNhbWVyYSA6IHtcblx0XHRcdHggOiAtNDAwXG5cdFx0fVxuXHR9LFxuXHRvYmplY3RzIDoge1xuXHRcdGRlbW8gOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9kZW1vcy9NZXNoR3JvdXBCb3hEZW1vXCIpLFxuXHRcdFx0cHJvcGVydGllczoge31cblx0XHR9LFxuXHRcdGNvbnRyb2xzIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vY29tcG9uZW50cy9jYW1lcmFzL0NvbnRyb2xzXCIpLFxuXHRcdH0sXG5cdFx0Z3JpZCA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2RlbW9zL0dyaWRcIiksXG5cdFx0fSxcblx0XHRzdGF0cyA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2NvbXBvbmVudHMvdXRpbHMvU3RhdHNcIilcblx0XHR9XG5cdH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cdGNvbmZpZyA6IHtcblx0XHRjYW1lcmEgOiB7XG5cdFx0XHR4IDogLTQwMFxuXHRcdH1cblx0fSxcblx0b2JqZWN0cyA6IHtcblx0XHRjb250cm9scyA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2NvbXBvbmVudHMvY2FtZXJhcy9Db250cm9sc1wiKSxcblx0XHR9LFxuXHRcdHBvaW50Y2xvdWQgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9kZW1vcy9TaW5lR3Jhdml0eUNsb3VkXCIpLFxuXHRcdH0sXG5cdFx0Z3JpZCA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2RlbW9zL0dyaWRcIiksXG5cdFx0fSxcblx0XHQvLyBzdGF0cyA6IHtcblx0XHQvLyBcdG9iamVjdDogcmVxdWlyZShcIi4uL2NvbXBvbmVudHMvdXRpbHMvU3RhdHNcIilcblx0XHQvLyB9XG5cdH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cdGNvbmZpZyA6IHtcblx0XHRjYW1lcmEgOiB7XG5cdFx0XHR4IDogLTQwMFxuXHRcdH1cblx0fSxcblx0b2JqZWN0cyA6IHtcblx0XHRzcGhlcmUgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9kZW1vcy9TcGhlcmVzXCIpLFxuXHRcdFx0cHJvcGVydGllczoge1xuXHRcdFx0XHRjb3VudCA6IDUwLFxuXHRcdFx0XHRkaXNwZXJzaW9uIDogMTIwLFxuXHRcdFx0XHRyYWRpdXMgOiAxMFxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Y29udHJvbHMgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL2NhbWVyYXMvQ29udHJvbHNcIiksXG5cdFx0fSxcblx0XHRncmlkIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vZGVtb3MvR3JpZFwiKSxcblx0XHR9LFxuXHRcdHN0YXRzIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vY29tcG9uZW50cy91dGlscy9TdGF0c1wiKVxuXHRcdH1cblx0fVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcblx0Y29uZmlnIDoge1xuXHRcdGNhbWVyYSA6IHtcblx0XHRcdHggOiAtNDAwXG5cdFx0fVxuXHR9LFxuXHRvYmplY3RzIDoge1xuXHRcdGNvbnRyb2xzIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vY29tcG9uZW50cy9jYW1lcmFzL0NvbnRyb2xzXCIpLFxuXHRcdH0sXG5cdFx0dGV4dHVyZVBvc2l0aW9uYWxNYXRyaWNlcyA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2RlbW9zL3RleHR1cmVQb3NpdGlvbmFsTWF0cmljZXNcIiksXG5cdFx0fSxcblx0XHRncmlkIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vZGVtb3MvR3JpZFwiKSxcblx0XHR9LFxuXHRcdHN0YXRzIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vY29tcG9uZW50cy91dGlscy9TdGF0c1wiKVxuXHRcdH1cblx0fVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcblx0Y29uZmlnIDoge1xuXHRcdGNhbWVyYSA6IHtcblx0XHRcdHggOiAtNDAwXG5cdFx0fVxuXHR9LFxuXHRvYmplY3RzIDoge1xuXHRcdGNvbnRyb2xzIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vY29tcG9uZW50cy9jYW1lcmFzL0NvbnRyb2xzXCIpLFxuXHRcdH0sXG5cdFx0dW5pZm9ybVBvc2l0aW9uYWxNYXRyaWNlcyA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2RlbW9zL3VuaWZvcm1Qb3NpdGlvbmFsTWF0cmljZXNcIiksXG5cdFx0fSxcblx0XHRncmlkIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vZGVtb3MvR3JpZFwiKSxcblx0XHR9LFxuXHRcdHN0YXRzIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vY29tcG9uZW50cy91dGlscy9TdGF0c1wiKVxuXHRcdH1cblx0fVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcblx0Y29uZmlnIDoge1xuXHRcdHZyIDogdHJ1ZSxcblx0XHRjYW1lcmEgOiB7XG5cdFx0XHR4IDogLTMwMCxcblx0XHRcdGZvdiA6IDcwXG5cdFx0fVxuXHR9LFxuXHRvYmplY3RzIDoge1xuXHRcdHBvaW50Y2xvdWQgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9kZW1vcy9TaW5lR3Jhdml0eUNsb3VkXCIpLFxuXHRcdFx0cHJvcGVydGllczoge1xuXHRcdFx0XHRjb3VudDogNTAgKiAxMDAwLFxuXHRcdFx0XHRwb2ludFNpemUgOiA0XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRjb250cm9scyA6IHtcblx0XHRcdG9iamVjdDogcmVxdWlyZShcIi4uL2NvbXBvbmVudHMvY2FtZXJhcy9PcmllbnRhdGlvblwiKSxcblx0XHR9LFxuXHRcdGNhbWVyYVJvdGF0aW9uIDoge1xuXHRcdFx0b2JqZWN0OiByZXF1aXJlKFwiLi4vY29tcG9uZW50cy9jYW1lcmFzL1JvdGF0ZUFyb3VuZE9yaWdpblwiKSxcblx0XHR9LFxuXHRcdGdyaWQgOiB7XG5cdFx0XHRvYmplY3Q6IHJlcXVpcmUoXCIuLi9kZW1vcy9HcmlkXCIpLFxuXHRcdH1cblx0fVxufTsiLCJ2YXIgQ2xvY2sgPSBmdW5jdGlvbiggYXV0b3N0YXJ0ICkge1xuXG5cdHRoaXMubWF4RHQgPSA2MDtcblx0dGhpcy5taW5EdCA9IDE2O1xuXHR0aGlzLnBUaW1lID0gMDtcblx0dGhpcy50aW1lID0gMDtcblx0XG5cdGlmKGF1dG9zdGFydCAhPT0gZmFsc2UpIHtcblx0XHR0aGlzLnN0YXJ0KCk7XG5cdH1cblx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENsb2NrO1xuXG5DbG9jay5wcm90b3R5cGUgPSB7XG5cblx0c3RhcnQgOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnBUaW1lID0gRGF0ZS5ub3coKTtcblx0fSxcblx0XG5cdGdldERlbHRhIDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG5vdywgZHQ7XG5cdFx0XG5cdFx0bm93ID0gRGF0ZS5ub3coKTtcblx0XHRkdCA9IG5vdyAtIHRoaXMucFRpbWU7XG5cdFx0XG5cdFx0ZHQgPSBNYXRoLm1pbiggZHQsIHRoaXMubWF4RHQgKTtcblx0XHRkdCA9IE1hdGgubWF4KCBkdCwgdGhpcy5taW5EdCApO1xuXHRcdFxuXHRcdHRoaXMudGltZSArPSBkdDtcblx0XHR0aGlzLnBUaW1lID0gbm93O1xuXHRcdFxuXHRcdHJldHVybiBkdDtcblx0fVxuXHRcbn07IiwiLyoqXG4gKiBAYXV0aG9yIG1yZG9vYiAvIGh0dHA6Ly9tcmRvb2IuY29tL1xuICpcbiAqIE1vZGlmaWNhdGlvbnM6IEdyZWcgVGF0dW1cbiAqXG4gKiB1c2FnZTpcbiAqIFxuICogXHRcdEV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUuYXBwbHkoIE15T2JqZWN0LnByb3RvdHlwZSApO1xuICogXG4gKiBcdFx0TXlPYmplY3QuZGlzcGF0Y2goe1xuICogXHRcdFx0dHlwZTogXCJjbGlja1wiLFxuICogXHRcdFx0ZGF0dW0xOiBcImZvb1wiLFxuICogXHRcdFx0ZGF0dW0yOiBcImJhclwiXG4gKiBcdFx0fSk7XG4gKiBcbiAqIFx0XHRNeU9iamVjdC5vbiggXCJjbGlja1wiLCBmdW5jdGlvbiggZXZlbnQgKSB7XG4gKiBcdFx0XHRldmVudC5kYXR1bTE7IC8vRm9vXG4gKiBcdFx0XHRldmVudC50YXJnZXQ7IC8vTXlPYmplY3RcbiAqIFx0XHR9KTtcbiAqIFxuICpcbiAqL1xuXG52YXIgRXZlbnREaXNwYXRjaGVyID0gZnVuY3Rpb24gKCkge307XG5cbkV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUgPSB7XG5cblx0Y29uc3RydWN0b3I6IEV2ZW50RGlzcGF0Y2hlcixcblxuXHRhcHBseTogZnVuY3Rpb24gKCBvYmplY3QgKSB7XG5cblx0XHRvYmplY3Qub25cdFx0XHRcdFx0PSBFdmVudERpc3BhdGNoZXIucHJvdG90eXBlLm9uO1xuXHRcdG9iamVjdC5oYXNFdmVudExpc3RlbmVyXHRcdD0gRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5oYXNFdmVudExpc3RlbmVyO1xuXHRcdG9iamVjdC5vZmZcdFx0XHRcdFx0PSBFdmVudERpc3BhdGNoZXIucHJvdG90eXBlLm9mZjtcblx0XHRvYmplY3QuZGlzcGF0Y2hcdFx0XHRcdD0gRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5kaXNwYXRjaDtcblxuXHR9LFxuXG5cdG9uOiBmdW5jdGlvbiAoIHR5cGUsIGxpc3RlbmVyICkge1xuXG5cdFx0aWYgKCB0aGlzLl9saXN0ZW5lcnMgPT09IHVuZGVmaW5lZCApIHRoaXMuX2xpc3RlbmVycyA9IHt9O1xuXG5cdFx0dmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcblxuXHRcdGlmICggbGlzdGVuZXJzWyB0eXBlIF0gPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0bGlzdGVuZXJzWyB0eXBlIF0gPSBbXTtcblxuXHRcdH1cblxuXHRcdGlmICggbGlzdGVuZXJzWyB0eXBlIF0uaW5kZXhPZiggbGlzdGVuZXIgKSA9PT0gLSAxICkge1xuXG5cdFx0XHRsaXN0ZW5lcnNbIHR5cGUgXS5wdXNoKCBsaXN0ZW5lciApO1xuXG5cdFx0fVxuXG5cdH0sXG5cblx0aGFzRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24gKCB0eXBlLCBsaXN0ZW5lciApIHtcblxuXHRcdGlmICggdGhpcy5fbGlzdGVuZXJzID09PSB1bmRlZmluZWQgKSByZXR1cm4gZmFsc2U7XG5cblx0XHR2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuXG5cdFx0aWYgKCBsaXN0ZW5lcnNbIHR5cGUgXSAhPT0gdW5kZWZpbmVkICYmIGxpc3RlbmVyc1sgdHlwZSBdLmluZGV4T2YoIGxpc3RlbmVyICkgIT09IC0gMSApIHtcblxuXHRcdFx0cmV0dXJuIHRydWU7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cblx0fSxcblxuXHRvZmY6IGZ1bmN0aW9uICggdHlwZSwgbGlzdGVuZXIgKSB7XG5cblx0XHRpZiAoIHRoaXMuX2xpc3RlbmVycyA9PT0gdW5kZWZpbmVkICkgcmV0dXJuO1xuXG5cdFx0dmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcblx0XHR2YXIgbGlzdGVuZXJBcnJheSA9IGxpc3RlbmVyc1sgdHlwZSBdO1xuXG5cdFx0aWYgKCBsaXN0ZW5lckFycmF5ICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdHZhciBpbmRleCA9IGxpc3RlbmVyQXJyYXkuaW5kZXhPZiggbGlzdGVuZXIgKTtcblxuXHRcdFx0aWYgKCBpbmRleCAhPT0gLSAxICkge1xuXG5cdFx0XHRcdGxpc3RlbmVyQXJyYXkuc3BsaWNlKCBpbmRleCwgMSApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fSxcblxuXHRkaXNwYXRjaDogZnVuY3Rpb24gKCBldmVudCApIHtcblx0XHRcdFxuXHRcdGlmICggdGhpcy5fbGlzdGVuZXJzID09PSB1bmRlZmluZWQgKSByZXR1cm47XG5cblx0XHR2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuXHRcdHZhciBsaXN0ZW5lckFycmF5ID0gbGlzdGVuZXJzWyBldmVudC50eXBlIF07XG5cblx0XHRpZiAoIGxpc3RlbmVyQXJyYXkgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0ZXZlbnQudGFyZ2V0ID0gdGhpcztcblxuXHRcdFx0dmFyIGFycmF5ID0gW107XG5cdFx0XHR2YXIgbGVuZ3RoID0gbGlzdGVuZXJBcnJheS5sZW5ndGg7XG5cdFx0XHR2YXIgaTtcblxuXHRcdFx0Zm9yICggaSA9IDA7IGkgPCBsZW5ndGg7IGkgKysgKSB7XG5cblx0XHRcdFx0YXJyYXlbIGkgXSA9IGxpc3RlbmVyQXJyYXlbIGkgXTtcblxuXHRcdFx0fVxuXG5cdFx0XHRmb3IgKCBpID0gMDsgaSA8IGxlbmd0aDsgaSArKyApIHtcblxuXHRcdFx0XHRhcnJheVsgaSBdLmNhbGwoIHRoaXMsIGV2ZW50ICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHR9XG5cbn07XG5cbmlmICggdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgKSB7XG5cblx0bW9kdWxlLmV4cG9ydHMgPSBFdmVudERpc3BhdGNoZXI7XG5cbn0iLCJ2YXIgY2FsY3VsYXRlU3F1YXJlZFRleHR1cmVXaWR0aCA9IGZ1bmN0aW9uKCBjb3VudCApIHtcblx0dmFyIHdpZHRoID0gMTtcblx0dmFyIGkgPSAwO1xuXHRcblx0d2hpbGUoIHdpZHRoICogd2lkdGggPCAoY291bnQgLyA0KSApIHtcblx0XHRcblx0XHRpKys7XG5cdFx0d2lkdGggPSBNYXRoLnBvdyggMiwgaSApO1xuXHRcdFxuXHR9XG5cdFxuXHRyZXR1cm4gd2lkdGg7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNhbGN1bGF0ZVNxdWFyZWRUZXh0dXJlV2lkdGg7XG4iLCJ2YXIgUlNWUCA9IHJlcXVpcmUoJ3JzdnAnKTtcblxudmFyIGxvYWRUZXh0ID0gZnVuY3Rpb24oIHVybCwgb2JqZWN0LCBrZXkgKSB7XG5cdFxuXHR2YXIgcHJvbWlzZSA9IG5ldyBSU1ZQLlByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcblx0XHRcblx0XHQkLmFqYXgodXJsLCB7XG5cdFx0XHRkYXRhVHlwZTogXCJ0ZXh0XCJcblx0XHR9KS50aGVuKFxuXHRcdFx0ZnVuY3Rpb24oIGRhdGEgKSB7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiggXy5pc09iamVjdCggb2JqZWN0ICkgKSB7XG5cdFx0XHRcdFx0b2JqZWN0W2tleV0gPSBkYXRhO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRyZXNvbHZlKCBkYXRhICk7XG5cdFx0XHR9LFxuXHRcdFx0ZnVuY3Rpb24oIGVycm9yICkge1xuXHRcdFx0XHRyZWplY3QoIGVycm9yICk7XG5cdFx0XHR9XG5cdFx0KTtcblx0XHRcblx0fSk7XG5cblx0cmV0dXJuIHByb21pc2U7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxvYWRUZXh0OyIsInZhciBSU1ZQID0gcmVxdWlyZSgncnN2cCcpO1xuXG52YXIgbG9hZFRleHR1cmUgPSBmdW5jdGlvbiggdXJsLCBvYmplY3QsIGtleSApIHtcblx0XG5cdHJldHVybiBuZXcgUlNWUC5Qcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdFxuXHRcdFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoIHVybCwgdW5kZWZpbmVkLCBmdW5jdGlvbiggdGV4dHVyZSApIHtcblx0XHRcdFxuXHRcdFx0aWYoIF8uaXNPYmplY3QoIG9iamVjdCApICkge1xuXHRcdFx0XHRvYmplY3Rba2V5XSA9IHRleHR1cmU7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHJlc29sdmUoIHRleHR1cmUgKTtcblx0XHRcdFxuXHRcdH0sIHJlamVjdCApO1xuXHRcdFxuXHR9KTtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBsb2FkVGV4dHVyZTsiLCJ2YXIgcmFuZG9tID0ge1xuXHRcblx0ZmxpcCA6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBNYXRoLnJhbmRvbSgpID4gMC41ID8gdHJ1ZTogZmFsc2U7XG5cdH0sXG5cdFxuXHRyYW5nZSA6IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG5cdFx0cmV0dXJuIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbjtcblx0fSxcblx0XG5cdHJhbmdlSW50IDogZnVuY3Rpb24obWluLCBtYXgpIHtcblx0XHRyZXR1cm4gTWF0aC5mbG9vciggdGhpcy5yYW5nZShtaW4sIG1heCArIDEpICk7XG5cdH0sXG5cdFxuXHRyYW5nZUxvdyA6IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG5cdFx0Ly9Nb3JlIGxpa2VseSB0byByZXR1cm4gYSBsb3cgdmFsdWVcblx0ICByZXR1cm4gTWF0aC5yYW5kb20oKSAqIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbjtcblx0fSxcblx0XG5cdHJhbmdlSGlnaCA6IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG5cdFx0Ly9Nb3JlIGxpa2VseSB0byByZXR1cm4gYSBoaWdoIHZhbHVlXG5cdFx0cmV0dXJuICgxIC0gTWF0aC5yYW5kb20oKSAqIE1hdGgucmFuZG9tKCkpICogKG1heCAtIG1pbikgKyBtaW47XG5cdH1cblx0IFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSByYW5kb207XG4iLCJ2YXIgcGVybGluU2ltcGxleCA9IHJlcXVpcmUoJ3Blcmxpbi1zaW1wbGV4Jyk7XG52YXIgZ2VuZXJhdG9yID0gbmV3IHBlcmxpblNpbXBsZXgoKTtcbi8vIGdlbmVyYXRvci5ub2lzZSh4LCB5KVxuLy8gZ2VuZXJhdG9yLm5vaXNlM2QoeCwgeSwgeilcblxuZnVuY3Rpb24gdW5pdFNpbXBsZXgoIHgsIHkgKSB7XG5cdHJldHVybiAoZ2VuZXJhdG9yLm5vaXNlKHgseSkgKyAxKSAvIDI7XG59XG5cbnZhciBzaW1wbGV4MiA9IHtcblx0XG5cdGZsaXAgOiBmdW5jdGlvbiggeCwgeSApIHtcblx0XHRyZXR1cm4gZ2VuZXJhdG9yLm5vaXNlKHgseSkgPiAwID8gdHJ1ZTogZmFsc2U7XG5cdH0sXG5cdFxuXHRyYW5nZSA6IGZ1bmN0aW9uKCB4LCB5LCBtaW4sIG1heCApIHtcblx0XHRyZXR1cm4gdW5pdFNpbXBsZXgoeCx5KSAqIChtYXggLSBtaW4pICsgbWluO1xuXHR9LFxuXHRcblx0cmFuZ2VJbnQgOiBmdW5jdGlvbiggeCwgeSwgbWluLCBtYXggKSB7XG5cdFx0cmV0dXJuIE1hdGguZmxvb3IoIHRoaXMucmFuZ2UobWluLCBtYXggKyAxKSApO1xuXHR9LFxuXHRcblx0cmFuZ2VMb3cgOiBmdW5jdGlvbiggeCwgeSwgbWluLCBtYXgpIHtcblx0XHQvL01vcmUgbGlrZWx5IHRvIHJldHVybiBhIGxvdyB2YWx1ZVxuXHRcdHZhciByID0gdW5pdFNpbXBsZXgoeCx5KTtcblx0XHRyZXR1cm4gciAqIHIgKiAobWF4IC0gbWluKSArIG1pbjtcblx0fSxcblx0XG5cdHJhbmdlSGlnaCA6IGZ1bmN0aW9uKCB4LCB5LCBtaW4sIG1heCkge1xuXHRcdC8vTW9yZSBsaWtlbHkgdG8gcmV0dXJuIGEgaGlnaCB2YWx1ZVxuXHRcdHZhciByID0gdW5pdFNpbXBsZXgoeCx5KTtcblx0XHRyZXR1cm4gKDEgLSByICogcikgKiAobWF4IC0gbWluKSArIG1pbjtcblx0fVxuXHQgXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNpbXBsZXgyO1xuIiwiLyogZ2xvYmFscyBUSFJFRSAqL1xuLyoqXG4gKiBEZXZpY2VPcmllbnRhdGlvbkNvbnRyb2xzIC0gYXBwbGllcyBkZXZpY2Ugb3JpZW50YXRpb24gb24gb2JqZWN0IHJvdGF0aW9uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCAtIGluc3RhbmNlIG9mIFRIUkVFLk9iamVjdDNEXG4gKiBAY29uc3RydWN0b3JcbiAqXG4gKiBAYXV0aG9yIHJpY2h0IC8gaHR0cDovL3JpY2h0Lm1lXG4gKiBAYXV0aG9yIFdlc3RMYW5nbGV5IC8gaHR0cDovL2dpdGh1Yi5jb20vV2VzdExhbmdsZXlcbiAqIEBhdXRob3Igam9ub2JyMSAvIGh0dHA6Ly9qb25vYnIxLmNvbVxuICogQGF1dGhvciBhcm9kaWMgLyBodHRwOi8vYWxla3NhbmRhcnJvZGljLmNvbVxuICogQGF1dGhvciBkb3VnIC8gaHR0cDovL2dpdGh1Yi5jb20vZG91Z1xuICpcbiAqIFczQyBEZXZpY2UgT3JpZW50YXRpb24gY29udHJvbFxuICogKGh0dHA6Ly93M2MuZ2l0aHViLmlvL2RldmljZW9yaWVudGF0aW9uL3NwZWMtc291cmNlLW9yaWVudGF0aW9uLmh0bWwpXG4gKi9cblxuXG52YXIgZGV2aWNlT3JpZW50YXRpb24gPSB7fTtcblx0dmFyIHNjcmVlbk9yaWVudGF0aW9uID0gd2luZG93Lm9yaWVudGF0aW9uIHx8IDA7XG5cbmZ1bmN0aW9uIG9uRGV2aWNlT3JpZW50YXRpb25DaGFuZ2VFdmVudChldnQpIHtcblx0ZGV2aWNlT3JpZW50YXRpb24gPSBldnQ7XG59XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZGV2aWNlb3JpZW50YXRpb24nLCBvbkRldmljZU9yaWVudGF0aW9uQ2hhbmdlRXZlbnQsIGZhbHNlKTtcblxuZnVuY3Rpb24gZ2V0T3JpZW50YXRpb24oKSB7XG5cdHN3aXRjaCAod2luZG93LnNjcmVlbi5vcmllbnRhdGlvbiB8fCB3aW5kb3cuc2NyZWVuLm1vek9yaWVudGF0aW9uKSB7XG5cdFx0Y2FzZSAnbGFuZHNjYXBlLXByaW1hcnknOlxuXHRcdFx0cmV0dXJuIDkwO1xuXHRcdGNhc2UgJ2xhbmRzY2FwZS1zZWNvbmRhcnknOlxuXHRcdFx0cmV0dXJuIC05MDtcblx0XHRjYXNlICdwb3J0cmFpdC1zZWNvbmRhcnknOlxuXHRcdFx0cmV0dXJuIDE4MDtcblx0XHRjYXNlICdwb3J0cmFpdC1wcmltYXJ5Jzpcblx0XHRcdHJldHVybiAwO1xuXHR9XG5cdC8vIHRoaXMgcmV0dXJucyA5MCBpZiB3aWR0aCBpcyBncmVhdGVyIHRoZW4gaGVpZ2h0XG5cdC8vIGFuZCB3aW5kb3cgb3JpZW50YXRpb24gaXMgdW5kZWZpbmVkIE9SIDBcblx0Ly8gaWYgKCF3aW5kb3cub3JpZW50YXRpb24gJiYgd2luZG93LmlubmVyV2lkdGggPiB3aW5kb3cuaW5uZXJIZWlnaHQpXG5cdC8vXHQgcmV0dXJuIDkwO1xuXHRyZXR1cm4gd2luZG93Lm9yaWVudGF0aW9uIHx8IDA7XG59XG5cbmZ1bmN0aW9uIG9uU2NyZWVuT3JpZW50YXRpb25DaGFuZ2VFdmVudCgpIHtcblx0c2NyZWVuT3JpZW50YXRpb24gPSBnZXRPcmllbnRhdGlvbigpO1xufVxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ29yaWVudGF0aW9uY2hhbmdlJywgb25TY3JlZW5PcmllbnRhdGlvbkNoYW5nZUV2ZW50LCBmYWxzZSk7XG5cblxuVEhSRUUuRGV2aWNlT3JpZW50YXRpb25Db250cm9scyA9IGZ1bmN0aW9uKG9iamVjdCkge1xuXG5cdHRoaXMub2JqZWN0ID0gb2JqZWN0O1xuXG5cdHRoaXMub2JqZWN0LnJvdGF0aW9uLnJlb3JkZXIoJ1lYWicpO1xuXG5cdHRoaXMuZnJlZXplID0gdHJ1ZTtcblxuXHR0aGlzLm1vdmVtZW50U3BlZWQgPSAxLjA7XG5cdHRoaXMucm9sbFNwZWVkID0gMC4wMDU7XG5cdHRoaXMuYXV0b0FsaWduID0gdHJ1ZTtcblx0dGhpcy5hdXRvRm9yd2FyZCA9IGZhbHNlO1xuXG5cdHRoaXMuYWxwaGEgPSAwO1xuXHR0aGlzLmJldGEgPSAwO1xuXHR0aGlzLmdhbW1hID0gMDtcblx0dGhpcy5vcmllbnQgPSAwO1xuXG5cdHRoaXMuYWxpZ25RdWF0ZXJuaW9uID0gbmV3IFRIUkVFLlF1YXRlcm5pb24oKTtcblx0dGhpcy5vcmllbnRhdGlvblF1YXRlcm5pb24gPSBuZXcgVEhSRUUuUXVhdGVybmlvbigpO1xuXG5cdHZhciBxdWF0ZXJuaW9uID0gbmV3IFRIUkVFLlF1YXRlcm5pb24oKTtcblx0dmFyIHF1YXRlcm5pb25MZXJwID0gbmV3IFRIUkVFLlF1YXRlcm5pb24oKTtcblxuXHR2YXIgdGVtcFZlY3RvcjMgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXHR2YXIgdGVtcE1hdHJpeDQgPSBuZXcgVEhSRUUuTWF0cml4NCgpO1xuXHR2YXIgdGVtcEV1bGVyID0gbmV3IFRIUkVFLkV1bGVyKDAsIDAsIDAsICdZWFonKTtcblx0dmFyIHRlbXBRdWF0ZXJuaW9uID0gbmV3IFRIUkVFLlF1YXRlcm5pb24oKTtcblxuXHR2YXIgemVlID0gbmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMSk7XG5cdHZhciB1cCA9IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDEsIDApO1xuXHR2YXIgdjAgPSBuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKTtcblx0dmFyIGV1bGVyID0gbmV3IFRIUkVFLkV1bGVyKCk7XG5cdHZhciBxMCA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKCk7IC8vIC0gUEkvMiBhcm91bmQgdGhlIHgtYXhpc1xuXHR2YXIgcTEgPSBuZXcgVEhSRUUuUXVhdGVybmlvbigtIE1hdGguc3FydCgwLjUpLCAwLCAwLCBNYXRoLnNxcnQoMC41KSk7XG5cblxuXHR0aGlzLnVwZGF0ZSA9IChmdW5jdGlvbihkZWx0YSkge1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGRlbHRhKSB7XG5cblx0XHRcdGlmICh0aGlzLmZyZWV6ZSkgcmV0dXJuO1xuXG5cdFx0XHQvLyBzaG91bGQgbm90IG5lZWQgdGhpc1xuXHRcdFx0Ly92YXIgb3JpZW50YXRpb24gPSBnZXRPcmllbnRhdGlvbigpO1xuXHRcdFx0Ly9pZiAob3JpZW50YXRpb24gIT09IHRoaXMuc2NyZWVuT3JpZW50YXRpb24pIHtcblx0XHRcdFx0Ly90aGlzLnNjcmVlbk9yaWVudGF0aW9uID0gb3JpZW50YXRpb247XG5cdFx0XHRcdC8vdGhpcy5hdXRvQWxpZ24gPSB0cnVlO1xuXHRcdFx0Ly99XG5cblx0XHRcdHRoaXMuYWxwaGEgPSBkZXZpY2VPcmllbnRhdGlvbi5nYW1tYSA/XG5cdFx0XHRcdFRIUkVFLk1hdGguZGVnVG9SYWQoZGV2aWNlT3JpZW50YXRpb24uYWxwaGEpIDogMDsgLy8gWlxuXHRcdFx0dGhpcy5iZXRhID0gZGV2aWNlT3JpZW50YXRpb24uYmV0YSA/XG5cdFx0XHRcdFRIUkVFLk1hdGguZGVnVG9SYWQoZGV2aWNlT3JpZW50YXRpb24uYmV0YSkgOiAwOyAvLyBYJ1xuXHRcdFx0dGhpcy5nYW1tYSA9IGRldmljZU9yaWVudGF0aW9uLmdhbW1hID9cblx0XHRcdFx0VEhSRUUuTWF0aC5kZWdUb1JhZChkZXZpY2VPcmllbnRhdGlvbi5nYW1tYSkgOiAwOyAvLyBZJydcblx0XHRcdHRoaXMub3JpZW50ID0gc2NyZWVuT3JpZW50YXRpb24gP1xuXHRcdFx0XHRUSFJFRS5NYXRoLmRlZ1RvUmFkKHNjcmVlbk9yaWVudGF0aW9uKSA6IDA7IC8vIE9cblxuXHRcdFx0Ly8gVGhlIGFuZ2xlcyBhbHBoYSwgYmV0YSBhbmQgZ2FtbWFcblx0XHRcdC8vIGZvcm0gYSBzZXQgb2YgaW50cmluc2ljIFRhaXQtQnJ5YW4gYW5nbGVzIG9mIHR5cGUgWi1YJy1ZJydcblxuXHRcdFx0Ly8gJ1pYWScgZm9yIHRoZSBkZXZpY2UsIGJ1dCAnWVhaJyBmb3IgdXNcblx0XHRcdGV1bGVyLnNldCh0aGlzLmJldGEsIHRoaXMuYWxwaGEsIC0gdGhpcy5nYW1tYSwgJ1lYWicpO1xuXG5cdFx0XHRxdWF0ZXJuaW9uLnNldEZyb21FdWxlcihldWxlcik7XG5cdFx0XHRxdWF0ZXJuaW9uTGVycC5zbGVycChxdWF0ZXJuaW9uLCAwLjUpOyAvLyBpbnRlcnBvbGF0ZVxuXG5cdFx0XHQvLyBvcmllbnQgdGhlIGRldmljZVxuXHRcdFx0aWYgKHRoaXMuYXV0b0FsaWduKSB0aGlzLm9yaWVudGF0aW9uUXVhdGVybmlvbi5jb3B5KHF1YXRlcm5pb24pOyAvLyBpbnRlcnBvbGF0aW9uIGJyZWFrcyB0aGUgYXV0byBhbGlnbm1lbnRcblx0XHRcdGVsc2UgdGhpcy5vcmllbnRhdGlvblF1YXRlcm5pb24uY29weShxdWF0ZXJuaW9uTGVycCk7XG5cblx0XHRcdC8vIGNhbWVyYSBsb29rcyBvdXQgdGhlIGJhY2sgb2YgdGhlIGRldmljZSwgbm90IHRoZSB0b3Bcblx0XHRcdHRoaXMub3JpZW50YXRpb25RdWF0ZXJuaW9uLm11bHRpcGx5KHExKTtcblxuXHRcdFx0Ly8gYWRqdXN0IGZvciBzY3JlZW4gb3JpZW50YXRpb25cblx0XHRcdHRoaXMub3JpZW50YXRpb25RdWF0ZXJuaW9uLm11bHRpcGx5KHEwLnNldEZyb21BeGlzQW5nbGUoemVlLCAtIHRoaXMub3JpZW50KSk7XG5cblx0XHRcdHRoaXMub2JqZWN0LnF1YXRlcm5pb24uY29weSh0aGlzLmFsaWduUXVhdGVybmlvbik7XG5cdFx0XHR0aGlzLm9iamVjdC5xdWF0ZXJuaW9uLm11bHRpcGx5KHRoaXMub3JpZW50YXRpb25RdWF0ZXJuaW9uKTtcblxuXHRcdFx0aWYgKHRoaXMuYXV0b0ZvcndhcmQpIHtcblxuXHRcdFx0XHR0ZW1wVmVjdG9yM1xuXHRcdFx0XHRcdC5zZXQoMCwgMCwgLTEpXG5cdFx0XHRcdFx0LmFwcGx5UXVhdGVybmlvbih0aGlzLm9iamVjdC5xdWF0ZXJuaW9uLCAnWlhZJylcblx0XHRcdFx0XHQuc2V0TGVuZ3RoKHRoaXMubW92ZW1lbnRTcGVlZCAvIDUwKTsgLy8gVE9ETzogd2h5IDUwIDpTXG5cblx0XHRcdFx0dGhpcy5vYmplY3QucG9zaXRpb24uYWRkKHRlbXBWZWN0b3IzKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5hdXRvQWxpZ24gJiYgdGhpcy5hbHBoYSAhPT0gMCkge1xuXG5cdFx0XHRcdHRoaXMuYXV0b0FsaWduID0gZmFsc2U7XG5cblx0XHRcdFx0dGhpcy5hbGlnbigpO1xuXG5cdFx0XHR9XG5cblx0XHR9O1xuXG5cdH0pKCk7XG5cblx0dGhpcy5hbGlnbiA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0dGVtcFZlY3RvcjNcblx0XHRcdC5zZXQoMCwgMCwgLTEpXG5cdFx0XHQuYXBwbHlRdWF0ZXJuaW9uKCB0ZW1wUXVhdGVybmlvbi5jb3B5KHRoaXMub3JpZW50YXRpb25RdWF0ZXJuaW9uKS5pbnZlcnNlKCksICdaWFknICk7XG5cblx0XHR0ZW1wRXVsZXIuc2V0RnJvbVF1YXRlcm5pb24oXG5cdFx0XHR0ZW1wUXVhdGVybmlvbi5zZXRGcm9tUm90YXRpb25NYXRyaXgoXG5cdFx0XHRcdHRlbXBNYXRyaXg0Lmxvb2tBdCh0ZW1wVmVjdG9yMywgdjAsIHVwKVxuXHRcdCApXG5cdCApO1xuXG5cdFx0dGVtcEV1bGVyLnNldCgwLCB0ZW1wRXVsZXIueSwgMCk7XG5cdFx0dGhpcy5hbGlnblF1YXRlcm5pb24uc2V0RnJvbUV1bGVyKHRlbXBFdWxlcik7XG5cblx0fTtcblxuXHR0aGlzLmNvbm5lY3QgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmZyZWV6ZSA9IGZhbHNlO1xuXHR9O1xuXG5cdHRoaXMuZGlzY29ubmVjdCA9IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZnJlemUgPSB0cnVlO1xuXHR9O1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRIUkVFLkRldmljZU9yaWVudGF0aW9uQ29udHJvbHM7IiwiLyoqXG4gKiBAYXV0aG9yIHFpYW8gLyBodHRwczovL2dpdGh1Yi5jb20vcWlhb1xuICogQGF1dGhvciBtcmRvb2IgLyBodHRwOi8vbXJkb29iLmNvbVxuICogQGF1dGhvciBhbHRlcmVkcSAvIGh0dHA6Ly9hbHRlcmVkcXVhbGlhLmNvbS9cbiAqIEBhdXRob3IgV2VzdExhbmdsZXkgLyBodHRwOi8vZ2l0aHViLmNvbS9XZXN0TGFuZ2xleVxuICogQGF1dGhvciBlcmljaDY2NiAvIGh0dHA6Ly9lcmljaGFpbmVzLmNvbVxuICovXG4vKmdsb2JhbCBUSFJFRSwgY29uc29sZSAqL1xuXG4vLyBUaGlzIHNldCBvZiBjb250cm9scyBwZXJmb3JtcyBvcmJpdGluZywgZG9sbHlpbmcgKHpvb21pbmcpLCBhbmQgcGFubmluZy4gSXQgbWFpbnRhaW5zXG4vLyB0aGUgXCJ1cFwiIGRpcmVjdGlvbiBhcyArWSwgdW5saWtlIHRoZSBUcmFja2JhbGxDb250cm9scy4gVG91Y2ggb24gdGFibGV0IGFuZCBwaG9uZXMgaXNcbi8vIHN1cHBvcnRlZC5cbi8vXG4vLyAgICBPcmJpdCAtIGxlZnQgbW91c2UgLyB0b3VjaDogb25lIGZpbmdlciBtb3ZlXG4vLyAgICBab29tIC0gbWlkZGxlIG1vdXNlLCBvciBtb3VzZXdoZWVsIC8gdG91Y2g6IHR3byBmaW5nZXIgc3ByZWFkIG9yIHNxdWlzaFxuLy8gICAgUGFuIC0gcmlnaHQgbW91c2UsIG9yIGFycm93IGtleXMgLyB0b3VjaDogdGhyZWUgZmludGVyIHN3aXBlXG4vL1xuLy8gVGhpcyBpcyBhIGRyb3AtaW4gcmVwbGFjZW1lbnQgZm9yIChtb3N0KSBUcmFja2JhbGxDb250cm9scyB1c2VkIGluIGV4YW1wbGVzLlxuLy8gVGhhdCBpcywgaW5jbHVkZSB0aGlzIGpzIGZpbGUgYW5kIHdoZXJldmVyIHlvdSBzZWU6XG4vLyAgICBcdGNvbnRyb2xzID0gbmV3IFRIUkVFLlRyYWNrYmFsbENvbnRyb2xzKCBjYW1lcmEgKTtcbi8vICAgICAgY29udHJvbHMudGFyZ2V0LnogPSAxNTA7XG4vLyBTaW1wbGUgc3Vic3RpdHV0ZSBcIk9yYml0Q29udHJvbHNcIiBhbmQgdGhlIGNvbnRyb2wgc2hvdWxkIHdvcmsgYXMtaXMuXG5cbnZhciBPcmJpdENvbnRyb2xzID0gZnVuY3Rpb24gKCBvYmplY3QsIGRvbUVsZW1lbnQgKSB7XG5cblx0dGhpcy5vYmplY3QgPSBvYmplY3Q7XG5cdHRoaXMuZG9tRWxlbWVudCA9ICggZG9tRWxlbWVudCAhPT0gdW5kZWZpbmVkICkgPyBkb21FbGVtZW50IDogZG9jdW1lbnQ7XG5cblx0Ly8gQVBJXG5cblx0Ly8gU2V0IHRvIGZhbHNlIHRvIGRpc2FibGUgdGhpcyBjb250cm9sXG5cdHRoaXMuZW5hYmxlZCA9IHRydWU7XG5cblx0Ly8gXCJ0YXJnZXRcIiBzZXRzIHRoZSBsb2NhdGlvbiBvZiBmb2N1cywgd2hlcmUgdGhlIGNvbnRyb2wgb3JiaXRzIGFyb3VuZFxuXHQvLyBhbmQgd2hlcmUgaXQgcGFucyB3aXRoIHJlc3BlY3QgdG8uXG5cdHRoaXMudGFyZ2V0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblx0Ly8gY2VudGVyIGlzIG9sZCwgZGVwcmVjYXRlZDsgdXNlIFwidGFyZ2V0XCIgaW5zdGVhZFxuXHR0aGlzLmNlbnRlciA9IHRoaXMudGFyZ2V0O1xuXG5cdC8vIFRoaXMgb3B0aW9uIGFjdHVhbGx5IGVuYWJsZXMgZG9sbHlpbmcgaW4gYW5kIG91dDsgbGVmdCBhcyBcInpvb21cIiBmb3Jcblx0Ly8gYmFja3dhcmRzIGNvbXBhdGliaWxpdHlcblx0dGhpcy5ub1pvb20gPSBmYWxzZTtcblx0dGhpcy56b29tU3BlZWQgPSAxLjA7XG5cdC8vIExpbWl0cyB0byBob3cgZmFyIHlvdSBjYW4gZG9sbHkgaW4gYW5kIG91dFxuXHR0aGlzLm1pbkRpc3RhbmNlID0gMDtcblx0dGhpcy5tYXhEaXN0YW5jZSA9IEluZmluaXR5O1xuXG5cdC8vIFNldCB0byB0cnVlIHRvIGRpc2FibGUgdGhpcyBjb250cm9sXG5cdHRoaXMubm9Sb3RhdGUgPSBmYWxzZTtcblx0dGhpcy5yb3RhdGVTcGVlZCA9IDEuMDtcblxuXHQvLyBTZXQgdG8gdHJ1ZSB0byBkaXNhYmxlIHRoaXMgY29udHJvbFxuXHR0aGlzLm5vUGFuID0gZmFsc2U7XG5cdHRoaXMua2V5UGFuU3BlZWQgPSA3LjA7XHQvLyBwaXhlbHMgbW92ZWQgcGVyIGFycm93IGtleSBwdXNoXG5cblx0Ly8gU2V0IHRvIHRydWUgdG8gYXV0b21hdGljYWxseSByb3RhdGUgYXJvdW5kIHRoZSB0YXJnZXRcblx0dGhpcy5hdXRvUm90YXRlID0gZmFsc2U7XG5cdHRoaXMuYXV0b1JvdGF0ZVNwZWVkID0gMi4wOyAvLyAzMCBzZWNvbmRzIHBlciByb3VuZCB3aGVuIGZwcyBpcyA2MFxuXG5cdC8vIEhvdyBmYXIgeW91IGNhbiBvcmJpdCB2ZXJ0aWNhbGx5LCB1cHBlciBhbmQgbG93ZXIgbGltaXRzLlxuXHQvLyBSYW5nZSBpcyAwIHRvIE1hdGguUEkgcmFkaWFucy5cblx0dGhpcy5taW5Qb2xhckFuZ2xlID0gMDsgLy8gcmFkaWFuc1xuXHR0aGlzLm1heFBvbGFyQW5nbGUgPSBNYXRoLlBJOyAvLyByYWRpYW5zXG5cblx0Ly8gU2V0IHRvIHRydWUgdG8gZGlzYWJsZSB1c2Ugb2YgdGhlIGtleXNcblx0dGhpcy5ub0tleXMgPSBmYWxzZTtcblx0Ly8gVGhlIGZvdXIgYXJyb3cga2V5c1xuXHR0aGlzLmtleXMgPSB7IExFRlQ6IDM3LCBVUDogMzgsIFJJR0hUOiAzOSwgQk9UVE9NOiA0MCB9O1xuXG5cdC8vLy8vLy8vLy8vL1xuXHQvLyBpbnRlcm5hbHNcblxuXHR2YXIgc2NvcGUgPSB0aGlzO1xuXG5cdHZhciBFUFMgPSAwLjAwMDAwMTtcblxuXHR2YXIgcm90YXRlU3RhcnQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXHR2YXIgcm90YXRlRW5kID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblx0dmFyIHJvdGF0ZURlbHRhID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblxuXHR2YXIgcGFuU3RhcnQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXHR2YXIgcGFuRW5kID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblx0dmFyIHBhbkRlbHRhID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblxuXHR2YXIgZG9sbHlTdGFydCA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cdHZhciBkb2xseUVuZCA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cdHZhciBkb2xseURlbHRhID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblxuXHR2YXIgcGhpRGVsdGEgPSAwO1xuXHR2YXIgdGhldGFEZWx0YSA9IDA7XG5cdHZhciBzY2FsZSA9IDE7XG5cdHZhciBwYW4gPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXG5cdHZhciBsYXN0UG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXG5cdHZhciBTVEFURSA9IHsgTk9ORSA6IC0xLCBST1RBVEUgOiAwLCBET0xMWSA6IDEsIFBBTiA6IDIsIFRPVUNIX1JPVEFURSA6IDMsIFRPVUNIX0RPTExZIDogNCwgVE9VQ0hfUEFOIDogNSB9O1xuXHR2YXIgc3RhdGUgPSBTVEFURS5OT05FO1xuXG5cdC8vIGV2ZW50c1xuXG5cdHZhciBjaGFuZ2VFdmVudCA9IHsgdHlwZTogJ2NoYW5nZScgfTtcblxuXG5cdHRoaXMucm90YXRlTGVmdCA9IGZ1bmN0aW9uICggYW5nbGUgKSB7XG5cblx0XHRpZiAoIGFuZ2xlID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGFuZ2xlID0gZ2V0QXV0b1JvdGF0aW9uQW5nbGUoKTtcblxuXHRcdH1cblxuXHRcdHRoZXRhRGVsdGEgLT0gYW5nbGU7XG5cblx0fTtcblxuXHR0aGlzLnJvdGF0ZVVwID0gZnVuY3Rpb24gKCBhbmdsZSApIHtcblxuXHRcdGlmICggYW5nbGUgPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0YW5nbGUgPSBnZXRBdXRvUm90YXRpb25BbmdsZSgpO1xuXG5cdFx0fVxuXG5cdFx0cGhpRGVsdGEgLT0gYW5nbGU7XG5cblx0fTtcblxuXHQvLyBwYXNzIGluIGRpc3RhbmNlIGluIHdvcmxkIHNwYWNlIHRvIG1vdmUgbGVmdFxuXHR0aGlzLnBhbkxlZnQgPSBmdW5jdGlvbiAoIGRpc3RhbmNlICkge1xuXG5cdFx0dmFyIHBhbk9mZnNldCA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cdFx0dmFyIHRlID0gdGhpcy5vYmplY3QubWF0cml4LmVsZW1lbnRzO1xuXHRcdC8vIGdldCBYIGNvbHVtbiBvZiBtYXRyaXhcblx0XHRwYW5PZmZzZXQuc2V0KCB0ZVswXSwgdGVbMV0sIHRlWzJdICk7XG5cdFx0cGFuT2Zmc2V0Lm11bHRpcGx5U2NhbGFyKC1kaXN0YW5jZSk7XG5cdFx0XG5cdFx0cGFuLmFkZCggcGFuT2Zmc2V0ICk7XG5cblx0fTtcblxuXHQvLyBwYXNzIGluIGRpc3RhbmNlIGluIHdvcmxkIHNwYWNlIHRvIG1vdmUgdXBcblx0dGhpcy5wYW5VcCA9IGZ1bmN0aW9uICggZGlzdGFuY2UgKSB7XG5cblx0XHR2YXIgcGFuT2Zmc2V0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblx0XHR2YXIgdGUgPSB0aGlzLm9iamVjdC5tYXRyaXguZWxlbWVudHM7XG5cdFx0Ly8gZ2V0IFkgY29sdW1uIG9mIG1hdHJpeFxuXHRcdHBhbk9mZnNldC5zZXQoIHRlWzRdLCB0ZVs1XSwgdGVbNl0gKTtcblx0XHRwYW5PZmZzZXQubXVsdGlwbHlTY2FsYXIoZGlzdGFuY2UpO1xuXHRcdFxuXHRcdHBhbi5hZGQoIHBhbk9mZnNldCApO1xuXHR9O1xuXHRcblx0Ly8gbWFpbiBlbnRyeSBwb2ludDsgcGFzcyBpbiBWZWN0b3IyIG9mIGNoYW5nZSBkZXNpcmVkIGluIHBpeGVsIHNwYWNlLFxuXHQvLyByaWdodCBhbmQgZG93biBhcmUgcG9zaXRpdmVcblx0dGhpcy5wYW4gPSBmdW5jdGlvbiAoIGRlbHRhICkge1xuXG5cdFx0dmFyIGVsZW1lbnQgPSBzY29wZS5kb21FbGVtZW50ID09PSBkb2N1bWVudCA/IHNjb3BlLmRvbUVsZW1lbnQuYm9keSA6IHNjb3BlLmRvbUVsZW1lbnQ7XG5cblx0XHRpZiAoIHNjb3BlLm9iamVjdC5mb3YgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0Ly8gcGVyc3BlY3RpdmVcblx0XHRcdHZhciBwb3NpdGlvbiA9IHNjb3BlLm9iamVjdC5wb3NpdGlvbjtcblx0XHRcdHZhciBvZmZzZXQgPSBwb3NpdGlvbi5jbG9uZSgpLnN1Yiggc2NvcGUudGFyZ2V0ICk7XG5cdFx0XHR2YXIgdGFyZ2V0RGlzdGFuY2UgPSBvZmZzZXQubGVuZ3RoKCk7XG5cblx0XHRcdC8vIGhhbGYgb2YgdGhlIGZvdiBpcyBjZW50ZXIgdG8gdG9wIG9mIHNjcmVlblxuXHRcdFx0dGFyZ2V0RGlzdGFuY2UgKj0gTWF0aC50YW4oIChzY29wZS5vYmplY3QuZm92LzIpICogTWF0aC5QSSAvIDE4MC4wICk7XG5cdFx0XHQvLyB3ZSBhY3R1YWxseSBkb24ndCB1c2Ugc2NyZWVuV2lkdGgsIHNpbmNlIHBlcnNwZWN0aXZlIGNhbWVyYSBpcyBmaXhlZCB0byBzY3JlZW4gaGVpZ2h0XG5cdFx0XHRzY29wZS5wYW5MZWZ0KCAyICogZGVsdGEueCAqIHRhcmdldERpc3RhbmNlIC8gZWxlbWVudC5jbGllbnRIZWlnaHQgKTtcblx0XHRcdHNjb3BlLnBhblVwKCAyICogZGVsdGEueSAqIHRhcmdldERpc3RhbmNlIC8gZWxlbWVudC5jbGllbnRIZWlnaHQgKTtcblxuXHRcdH0gZWxzZSBpZiAoIHNjb3BlLm9iamVjdC50b3AgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0Ly8gb3J0aG9ncmFwaGljXG5cdFx0XHRzY29wZS5wYW5MZWZ0KCBkZWx0YS54ICogKHNjb3BlLm9iamVjdC5yaWdodCAtIHNjb3BlLm9iamVjdC5sZWZ0KSAvIGVsZW1lbnQuY2xpZW50V2lkdGggKTtcblx0XHRcdHNjb3BlLnBhblVwKCBkZWx0YS55ICogKHNjb3BlLm9iamVjdC50b3AgLSBzY29wZS5vYmplY3QuYm90dG9tKSAvIGVsZW1lbnQuY2xpZW50SGVpZ2h0ICk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHQvLyBjYW1lcmEgbmVpdGhlciBvcnRob2dyYXBoaWMgb3IgcGVyc3BlY3RpdmUgLSB3YXJuIHVzZXJcblx0XHRcdGNvbnNvbGUud2FybiggJ1dBUk5JTkc6IE9yYml0Q29udHJvbHMuanMgZW5jb3VudGVyZWQgYW4gdW5rbm93biBjYW1lcmEgdHlwZSAtIHBhbiBkaXNhYmxlZC4nICk7XG5cblx0XHR9XG5cblx0fTtcblxuXHR0aGlzLmRvbGx5SW4gPSBmdW5jdGlvbiAoIGRvbGx5U2NhbGUgKSB7XG5cblx0XHRpZiAoIGRvbGx5U2NhbGUgPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0ZG9sbHlTY2FsZSA9IGdldFpvb21TY2FsZSgpO1xuXG5cdFx0fVxuXG5cdFx0c2NhbGUgLz0gZG9sbHlTY2FsZTtcblxuXHR9O1xuXG5cdHRoaXMuZG9sbHlPdXQgPSBmdW5jdGlvbiAoIGRvbGx5U2NhbGUgKSB7XG5cblx0XHRpZiAoIGRvbGx5U2NhbGUgPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0ZG9sbHlTY2FsZSA9IGdldFpvb21TY2FsZSgpO1xuXG5cdFx0fVxuXG5cdFx0c2NhbGUgKj0gZG9sbHlTY2FsZTtcblxuXHR9O1xuXG5cdHRoaXMudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0dmFyIHBvc2l0aW9uID0gdGhpcy5vYmplY3QucG9zaXRpb247XG5cdFx0dmFyIG9mZnNldCA9IHBvc2l0aW9uLmNsb25lKCkuc3ViKCB0aGlzLnRhcmdldCApO1xuXG5cdFx0Ly8gYW5nbGUgZnJvbSB6LWF4aXMgYXJvdW5kIHktYXhpc1xuXG5cdFx0dmFyIHRoZXRhID0gTWF0aC5hdGFuMiggb2Zmc2V0LngsIG9mZnNldC56ICk7XG5cblx0XHQvLyBhbmdsZSBmcm9tIHktYXhpc1xuXG5cdFx0dmFyIHBoaSA9IE1hdGguYXRhbjIoIE1hdGguc3FydCggb2Zmc2V0LnggKiBvZmZzZXQueCArIG9mZnNldC56ICogb2Zmc2V0LnogKSwgb2Zmc2V0LnkgKTtcblxuXHRcdGlmICggdGhpcy5hdXRvUm90YXRlICkge1xuXG5cdFx0XHR0aGlzLnJvdGF0ZUxlZnQoIGdldEF1dG9Sb3RhdGlvbkFuZ2xlKCkgKTtcblxuXHRcdH1cblxuXHRcdHRoZXRhICs9IHRoZXRhRGVsdGE7XG5cdFx0cGhpICs9IHBoaURlbHRhO1xuXG5cdFx0Ly8gcmVzdHJpY3QgcGhpIHRvIGJlIGJldHdlZW4gZGVzaXJlZCBsaW1pdHNcblx0XHRwaGkgPSBNYXRoLm1heCggdGhpcy5taW5Qb2xhckFuZ2xlLCBNYXRoLm1pbiggdGhpcy5tYXhQb2xhckFuZ2xlLCBwaGkgKSApO1xuXG5cdFx0Ly8gcmVzdHJpY3QgcGhpIHRvIGJlIGJldHdlZSBFUFMgYW5kIFBJLUVQU1xuXHRcdHBoaSA9IE1hdGgubWF4KCBFUFMsIE1hdGgubWluKCBNYXRoLlBJIC0gRVBTLCBwaGkgKSApO1xuXG5cdFx0dmFyIHJhZGl1cyA9IG9mZnNldC5sZW5ndGgoKSAqIHNjYWxlO1xuXG5cdFx0Ly8gcmVzdHJpY3QgcmFkaXVzIHRvIGJlIGJldHdlZW4gZGVzaXJlZCBsaW1pdHNcblx0XHRyYWRpdXMgPSBNYXRoLm1heCggdGhpcy5taW5EaXN0YW5jZSwgTWF0aC5taW4oIHRoaXMubWF4RGlzdGFuY2UsIHJhZGl1cyApICk7XG5cdFx0XG5cdFx0Ly8gbW92ZSB0YXJnZXQgdG8gcGFubmVkIGxvY2F0aW9uXG5cdFx0dGhpcy50YXJnZXQuYWRkKCBwYW4gKTtcblxuXHRcdG9mZnNldC54ID0gcmFkaXVzICogTWF0aC5zaW4oIHBoaSApICogTWF0aC5zaW4oIHRoZXRhICk7XG5cdFx0b2Zmc2V0LnkgPSByYWRpdXMgKiBNYXRoLmNvcyggcGhpICk7XG5cdFx0b2Zmc2V0LnogPSByYWRpdXMgKiBNYXRoLnNpbiggcGhpICkgKiBNYXRoLmNvcyggdGhldGEgKTtcblxuXHRcdHBvc2l0aW9uLmNvcHkoIHRoaXMudGFyZ2V0ICkuYWRkKCBvZmZzZXQgKTtcblxuXHRcdHRoaXMub2JqZWN0Lmxvb2tBdCggdGhpcy50YXJnZXQgKTtcblxuXHRcdHRoZXRhRGVsdGEgPSAwO1xuXHRcdHBoaURlbHRhID0gMDtcblx0XHRzY2FsZSA9IDE7XG5cdFx0cGFuLnNldCgwLDAsMCk7XG5cblx0XHRpZiAoIGxhc3RQb3NpdGlvbi5kaXN0YW5jZVRvKCB0aGlzLm9iamVjdC5wb3NpdGlvbiApID4gMCApIHtcblxuXHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KCBjaGFuZ2VFdmVudCApO1xuXG5cdFx0XHRsYXN0UG9zaXRpb24uY29weSggdGhpcy5vYmplY3QucG9zaXRpb24gKTtcblxuXHRcdH1cblxuXHR9O1xuXG5cblx0ZnVuY3Rpb24gZ2V0QXV0b1JvdGF0aW9uQW5nbGUoKSB7XG5cblx0XHRyZXR1cm4gMiAqIE1hdGguUEkgLyA2MCAvIDYwICogc2NvcGUuYXV0b1JvdGF0ZVNwZWVkO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBnZXRab29tU2NhbGUoKSB7XG5cblx0XHRyZXR1cm4gTWF0aC5wb3coIDAuOTUsIHNjb3BlLnpvb21TcGVlZCApO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBvbk1vdXNlRG93biggZXZlbnQgKSB7XG5cblx0XHRpZiAoIHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlICkgeyByZXR1cm47IH1cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0aWYgKCBldmVudC5idXR0b24gPT09IDAgKSB7XG5cdFx0XHRpZiAoIHNjb3BlLm5vUm90YXRlID09PSB0cnVlICkgeyByZXR1cm47IH1cblxuXHRcdFx0c3RhdGUgPSBTVEFURS5ST1RBVEU7XG5cblx0XHRcdHJvdGF0ZVN0YXJ0LnNldCggZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSApO1xuXG5cdFx0fSBlbHNlIGlmICggZXZlbnQuYnV0dG9uID09PSAxICkge1xuXHRcdFx0aWYgKCBzY29wZS5ub1pvb20gPT09IHRydWUgKSB7IHJldHVybjsgfVxuXG5cdFx0XHRzdGF0ZSA9IFNUQVRFLkRPTExZO1xuXG5cdFx0XHRkb2xseVN0YXJ0LnNldCggZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSApO1xuXG5cdFx0fSBlbHNlIGlmICggZXZlbnQuYnV0dG9uID09PSAyICkge1xuXHRcdFx0aWYgKCBzY29wZS5ub1BhbiA9PT0gdHJ1ZSApIHsgcmV0dXJuOyB9XG5cblx0XHRcdHN0YXRlID0gU1RBVEUuUEFOO1xuXG5cdFx0XHRwYW5TdGFydC5zZXQoIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkgKTtcblxuXHRcdH1cblxuXHRcdC8vIEdyZWdnbWFuIGZpeDogaHR0cHM6Ly9naXRodWIuY29tL2dyZWdnbWFuL3RocmVlLmpzL2NvbW1pdC9mZGU5Zjk5MTdkNmQ4MzgxZjA2YmYyMmNkZmY3NjYwMjlkMTc2MWJlXG5cdFx0c2NvcGUuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUsIGZhbHNlICk7XG5cdFx0c2NvcGUuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsIG9uTW91c2VVcCwgZmFsc2UgKTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gb25Nb3VzZU1vdmUoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBzY29wZS5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHR2YXIgZWxlbWVudCA9IHNjb3BlLmRvbUVsZW1lbnQgPT09IGRvY3VtZW50ID8gc2NvcGUuZG9tRWxlbWVudC5ib2R5IDogc2NvcGUuZG9tRWxlbWVudDtcblxuXHRcdGlmICggc3RhdGUgPT09IFNUQVRFLlJPVEFURSApIHtcblxuXHRcdFx0aWYgKCBzY29wZS5ub1JvdGF0ZSA9PT0gdHJ1ZSApIHJldHVybjtcblxuXHRcdFx0cm90YXRlRW5kLnNldCggZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSApO1xuXHRcdFx0cm90YXRlRGVsdGEuc3ViVmVjdG9ycyggcm90YXRlRW5kLCByb3RhdGVTdGFydCApO1xuXG5cdFx0XHQvLyByb3RhdGluZyBhY3Jvc3Mgd2hvbGUgc2NyZWVuIGdvZXMgMzYwIGRlZ3JlZXMgYXJvdW5kXG5cdFx0XHRzY29wZS5yb3RhdGVMZWZ0KCAyICogTWF0aC5QSSAqIHJvdGF0ZURlbHRhLnggLyBlbGVtZW50LmNsaWVudFdpZHRoICogc2NvcGUucm90YXRlU3BlZWQgKTtcblx0XHRcdC8vIHJvdGF0aW5nIHVwIGFuZCBkb3duIGFsb25nIHdob2xlIHNjcmVlbiBhdHRlbXB0cyB0byBnbyAzNjAsIGJ1dCBsaW1pdGVkIHRvIDE4MFxuXHRcdFx0c2NvcGUucm90YXRlVXAoIDIgKiBNYXRoLlBJICogcm90YXRlRGVsdGEueSAvIGVsZW1lbnQuY2xpZW50SGVpZ2h0ICogc2NvcGUucm90YXRlU3BlZWQgKTtcblxuXHRcdFx0cm90YXRlU3RhcnQuY29weSggcm90YXRlRW5kICk7XG5cblx0XHR9IGVsc2UgaWYgKCBzdGF0ZSA9PT0gU1RBVEUuRE9MTFkgKSB7XG5cblx0XHRcdGlmICggc2NvcGUubm9ab29tID09PSB0cnVlICkgcmV0dXJuO1xuXG5cdFx0XHRkb2xseUVuZC5zZXQoIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkgKTtcblx0XHRcdGRvbGx5RGVsdGEuc3ViVmVjdG9ycyggZG9sbHlFbmQsIGRvbGx5U3RhcnQgKTtcblxuXHRcdFx0aWYgKCBkb2xseURlbHRhLnkgPiAwICkge1xuXG5cdFx0XHRcdHNjb3BlLmRvbGx5SW4oKTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRzY29wZS5kb2xseU91dCgpO1xuXG5cdFx0XHR9XG5cblx0XHRcdGRvbGx5U3RhcnQuY29weSggZG9sbHlFbmQgKTtcblxuXHRcdH0gZWxzZSBpZiAoIHN0YXRlID09PSBTVEFURS5QQU4gKSB7XG5cblx0XHRcdGlmICggc2NvcGUubm9QYW4gPT09IHRydWUgKSByZXR1cm47XG5cblx0XHRcdHBhbkVuZC5zZXQoIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkgKTtcblx0XHRcdHBhbkRlbHRhLnN1YlZlY3RvcnMoIHBhbkVuZCwgcGFuU3RhcnQgKTtcblx0XHRcdFxuXHRcdFx0c2NvcGUucGFuKCBwYW5EZWx0YSApO1xuXG5cdFx0XHRwYW5TdGFydC5jb3B5KCBwYW5FbmQgKTtcblxuXHRcdH1cblxuXHRcdC8vIEdyZWdnbWFuIGZpeDogaHR0cHM6Ly9naXRodWIuY29tL2dyZWdnbWFuL3RocmVlLmpzL2NvbW1pdC9mZGU5Zjk5MTdkNmQ4MzgxZjA2YmYyMmNkZmY3NjYwMjlkMTc2MWJlXG5cdFx0c2NvcGUudXBkYXRlKCk7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIG9uTW91c2VVcCggLyogZXZlbnQgKi8gKSB7XG5cblx0XHRpZiAoIHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0Ly8gR3JlZ2dtYW4gZml4OiBodHRwczovL2dpdGh1Yi5jb20vZ3JlZ2dtYW4vdGhyZWUuanMvY29tbWl0L2ZkZTlmOTkxN2Q2ZDgzODFmMDZiZjIyY2RmZjc2NjAyOWQxNzYxYmVcblx0XHRzY29wZS5kb21FbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSwgZmFsc2UgKTtcblx0XHRzY29wZS5kb21FbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgb25Nb3VzZVVwLCBmYWxzZSApO1xuXG5cdFx0c3RhdGUgPSBTVEFURS5OT05FO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBvbk1vdXNlV2hlZWwoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBzY29wZS5lbmFibGVkID09PSBmYWxzZSB8fCBzY29wZS5ub1pvb20gPT09IHRydWUgKSByZXR1cm47XG5cblx0XHR2YXIgZGVsdGEgPSAwO1xuXG5cdFx0aWYgKCBldmVudC53aGVlbERlbHRhICkgeyAvLyBXZWJLaXQgLyBPcGVyYSAvIEV4cGxvcmVyIDlcblxuXHRcdFx0ZGVsdGEgPSBldmVudC53aGVlbERlbHRhO1xuXG5cdFx0fSBlbHNlIGlmICggZXZlbnQuZGV0YWlsICkgeyAvLyBGaXJlZm94XG5cblx0XHRcdGRlbHRhID0gLSBldmVudC5kZXRhaWw7XG5cblx0XHR9XG5cblx0XHRpZiAoIGRlbHRhID4gMCApIHtcblxuXHRcdFx0c2NvcGUuZG9sbHlPdXQoKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdHNjb3BlLmRvbGx5SW4oKTtcblxuXHRcdH1cblxuXHR9XG5cblx0ZnVuY3Rpb24gb25LZXlEb3duKCBldmVudCApIHtcblxuXHRcdGlmICggc2NvcGUuZW5hYmxlZCA9PT0gZmFsc2UgKSB7IHJldHVybjsgfVxuXHRcdGlmICggc2NvcGUubm9LZXlzID09PSB0cnVlICkgeyByZXR1cm47IH1cblx0XHRpZiAoIHNjb3BlLm5vUGFuID09PSB0cnVlICkgeyByZXR1cm47IH1cblxuXHRcdC8vIHBhbiBhIHBpeGVsIC0gSSBndWVzcyBmb3IgcHJlY2lzZSBwb3NpdGlvbmluZz9cblx0XHQvLyBHcmVnZ21hbiBmaXg6IGh0dHBzOi8vZ2l0aHViLmNvbS9ncmVnZ21hbi90aHJlZS5qcy9jb21taXQvZmRlOWY5OTE3ZDZkODM4MWYwNmJmMjJjZGZmNzY2MDI5ZDE3NjFiZVxuXHRcdHZhciBuZWVkVXBkYXRlID0gZmFsc2U7XG5cdFx0XG5cdFx0c3dpdGNoICggZXZlbnQua2V5Q29kZSApIHtcblxuXHRcdFx0Y2FzZSBzY29wZS5rZXlzLlVQOlxuXHRcdFx0XHRzY29wZS5wYW4oIG5ldyBUSFJFRS5WZWN0b3IyKCAwLCBzY29wZS5rZXlQYW5TcGVlZCApICk7XG5cdFx0XHRcdG5lZWRVcGRhdGUgPSB0cnVlO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2Ugc2NvcGUua2V5cy5CT1RUT006XG5cdFx0XHRcdHNjb3BlLnBhbiggbmV3IFRIUkVFLlZlY3RvcjIoIDAsIC1zY29wZS5rZXlQYW5TcGVlZCApICk7XG5cdFx0XHRcdG5lZWRVcGRhdGUgPSB0cnVlO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2Ugc2NvcGUua2V5cy5MRUZUOlxuXHRcdFx0XHRzY29wZS5wYW4oIG5ldyBUSFJFRS5WZWN0b3IyKCBzY29wZS5rZXlQYW5TcGVlZCwgMCApICk7XG5cdFx0XHRcdG5lZWRVcGRhdGUgPSB0cnVlO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2Ugc2NvcGUua2V5cy5SSUdIVDpcblx0XHRcdFx0c2NvcGUucGFuKCBuZXcgVEhSRUUuVmVjdG9yMiggLXNjb3BlLmtleVBhblNwZWVkLCAwICkgKTtcblx0XHRcdFx0bmVlZFVwZGF0ZSA9IHRydWU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdC8vIEdyZWdnbWFuIGZpeDogaHR0cHM6Ly9naXRodWIuY29tL2dyZWdnbWFuL3RocmVlLmpzL2NvbW1pdC9mZGU5Zjk5MTdkNmQ4MzgxZjA2YmYyMmNkZmY3NjYwMjlkMTc2MWJlXG5cdFx0aWYgKCBuZWVkVXBkYXRlICkge1xuXG5cdFx0XHRzY29wZS51cGRhdGUoKTtcblxuXHRcdH1cblxuXHR9XG5cdFxuXHRmdW5jdGlvbiB0b3VjaHN0YXJ0KCBldmVudCApIHtcblxuXHRcdGlmICggc2NvcGUuZW5hYmxlZCA9PT0gZmFsc2UgKSB7IHJldHVybjsgfVxuXG5cdFx0c3dpdGNoICggZXZlbnQudG91Y2hlcy5sZW5ndGggKSB7XG5cblx0XHRcdGNhc2UgMTpcdC8vIG9uZS1maW5nZXJlZCB0b3VjaDogcm90YXRlXG5cdFx0XHRcdGlmICggc2NvcGUubm9Sb3RhdGUgPT09IHRydWUgKSB7IHJldHVybjsgfVxuXG5cdFx0XHRcdHN0YXRlID0gU1RBVEUuVE9VQ0hfUk9UQVRFO1xuXG5cdFx0XHRcdHJvdGF0ZVN0YXJ0LnNldCggZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYLCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMjpcdC8vIHR3by1maW5nZXJlZCB0b3VjaDogZG9sbHlcblx0XHRcdFx0aWYgKCBzY29wZS5ub1pvb20gPT09IHRydWUgKSB7IHJldHVybjsgfVxuXG5cdFx0XHRcdHN0YXRlID0gU1RBVEUuVE9VQ0hfRE9MTFk7XG5cblx0XHRcdFx0dmFyIGR4ID0gZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYIC0gZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VYO1xuXHRcdFx0XHR2YXIgZHkgPSBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgLSBldmVudC50b3VjaGVzWyAxIF0ucGFnZVk7XG5cdFx0XHRcdHZhciBkaXN0YW5jZSA9IE1hdGguc3FydCggZHggKiBkeCArIGR5ICogZHkgKTtcblx0XHRcdFx0ZG9sbHlTdGFydC5zZXQoIDAsIGRpc3RhbmNlICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIDM6IC8vIHRocmVlLWZpbmdlcmVkIHRvdWNoOiBwYW5cblx0XHRcdFx0aWYgKCBzY29wZS5ub1BhbiA9PT0gdHJ1ZSApIHsgcmV0dXJuOyB9XG5cblx0XHRcdFx0c3RhdGUgPSBTVEFURS5UT1VDSF9QQU47XG5cblx0XHRcdFx0cGFuU3RhcnQuc2V0KCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVgsIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSApO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0c3RhdGUgPSBTVEFURS5OT05FO1xuXG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gdG91Y2htb3ZlKCBldmVudCApIHtcblxuXHRcdGlmICggc2NvcGUuZW5hYmxlZCA9PT0gZmFsc2UgKSB7IHJldHVybjsgfVxuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdHZhciBlbGVtZW50ID0gc2NvcGUuZG9tRWxlbWVudCA9PT0gZG9jdW1lbnQgPyBzY29wZS5kb21FbGVtZW50LmJvZHkgOiBzY29wZS5kb21FbGVtZW50O1xuXG5cdFx0c3dpdGNoICggZXZlbnQudG91Y2hlcy5sZW5ndGggKSB7XG5cblx0XHRcdGNhc2UgMTogLy8gb25lLWZpbmdlcmVkIHRvdWNoOiByb3RhdGVcblx0XHRcdFx0aWYgKCBzY29wZS5ub1JvdGF0ZSA9PT0gdHJ1ZSApIHsgcmV0dXJuOyB9XG5cdFx0XHRcdGlmICggc3RhdGUgIT09IFNUQVRFLlRPVUNIX1JPVEFURSApIHsgcmV0dXJuOyB9XG5cblx0XHRcdFx0cm90YXRlRW5kLnNldCggZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYLCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgKTtcblx0XHRcdFx0cm90YXRlRGVsdGEuc3ViVmVjdG9ycyggcm90YXRlRW5kLCByb3RhdGVTdGFydCApO1xuXG5cdFx0XHRcdC8vIHJvdGF0aW5nIGFjcm9zcyB3aG9sZSBzY3JlZW4gZ29lcyAzNjAgZGVncmVlcyBhcm91bmRcblx0XHRcdFx0c2NvcGUucm90YXRlTGVmdCggMiAqIE1hdGguUEkgKiByb3RhdGVEZWx0YS54IC8gZWxlbWVudC5jbGllbnRXaWR0aCAqIHNjb3BlLnJvdGF0ZVNwZWVkICk7XG5cdFx0XHRcdC8vIHJvdGF0aW5nIHVwIGFuZCBkb3duIGFsb25nIHdob2xlIHNjcmVlbiBhdHRlbXB0cyB0byBnbyAzNjAsIGJ1dCBsaW1pdGVkIHRvIDE4MFxuXHRcdFx0XHRzY29wZS5yb3RhdGVVcCggMiAqIE1hdGguUEkgKiByb3RhdGVEZWx0YS55IC8gZWxlbWVudC5jbGllbnRIZWlnaHQgKiBzY29wZS5yb3RhdGVTcGVlZCApO1xuXG5cdFx0XHRcdHJvdGF0ZVN0YXJ0LmNvcHkoIHJvdGF0ZUVuZCApO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAyOiAvLyB0d28tZmluZ2VyZWQgdG91Y2g6IGRvbGx5XG5cdFx0XHRcdGlmICggc2NvcGUubm9ab29tID09PSB0cnVlICkgeyByZXR1cm47IH1cblx0XHRcdFx0aWYgKCBzdGF0ZSAhPT0gU1RBVEUuVE9VQ0hfRE9MTFkgKSB7IHJldHVybjsgfVxuXG5cdFx0XHRcdHZhciBkeCA9IGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCAtIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWDtcblx0XHRcdFx0dmFyIGR5ID0gZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZIC0gZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VZO1xuXHRcdFx0XHR2YXIgZGlzdGFuY2UgPSBNYXRoLnNxcnQoIGR4ICogZHggKyBkeSAqIGR5ICk7XG5cblx0XHRcdFx0ZG9sbHlFbmQuc2V0KCAwLCBkaXN0YW5jZSApO1xuXHRcdFx0XHRkb2xseURlbHRhLnN1YlZlY3RvcnMoIGRvbGx5RW5kLCBkb2xseVN0YXJ0ICk7XG5cblx0XHRcdFx0aWYgKCBkb2xseURlbHRhLnkgPiAwICkge1xuXG5cdFx0XHRcdFx0c2NvcGUuZG9sbHlPdXQoKTtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0c2NvcGUuZG9sbHlJbigpO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRkb2xseVN0YXJ0LmNvcHkoIGRvbGx5RW5kICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIDM6IC8vIHRocmVlLWZpbmdlcmVkIHRvdWNoOiBwYW5cblx0XHRcdFx0aWYgKCBzY29wZS5ub1BhbiA9PT0gdHJ1ZSApIHsgcmV0dXJuOyB9XG5cdFx0XHRcdGlmICggc3RhdGUgIT09IFNUQVRFLlRPVUNIX1BBTiApIHsgcmV0dXJuOyB9XG5cblx0XHRcdFx0cGFuRW5kLnNldCggZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYLCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgKTtcblx0XHRcdFx0cGFuRGVsdGEuc3ViVmVjdG9ycyggcGFuRW5kLCBwYW5TdGFydCApO1xuXHRcdFx0XHRcblx0XHRcdFx0c2NvcGUucGFuKCBwYW5EZWx0YSApO1xuXG5cdFx0XHRcdHBhblN0YXJ0LmNvcHkoIHBhbkVuZCApO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0c3RhdGUgPSBTVEFURS5OT05FO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRmdW5jdGlvbiB0b3VjaGVuZCggLyogZXZlbnQgKi8gKSB7XG5cblx0XHRpZiAoIHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlICkgeyByZXR1cm47IH1cblxuXHRcdHN0YXRlID0gU1RBVEUuTk9ORTtcblx0fVxuXG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnY29udGV4dG1lbnUnLCBmdW5jdGlvbiAoIGV2ZW50ICkgeyBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyB9LCBmYWxzZSApO1xuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIG9uTW91c2VEb3duLCBmYWxzZSApO1xuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNld2hlZWwnLCBvbk1vdXNlV2hlZWwsIGZhbHNlICk7XG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnRE9NTW91c2VTY3JvbGwnLCBvbk1vdXNlV2hlZWwsIGZhbHNlICk7IC8vIGZpcmVmb3hcblxuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBvbktleURvd24sIGZhbHNlICk7XG5cblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0JywgdG91Y2hzdGFydCwgZmFsc2UgKTtcblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaGVuZCcsIHRvdWNoZW5kLCBmYWxzZSApO1xuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNobW92ZScsIHRvdWNobW92ZSwgZmFsc2UgKTtcblxufTtcblxuT3JiaXRDb250cm9scy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUSFJFRS5FdmVudERpc3BhdGNoZXIucHJvdG90eXBlICk7XG5cbm1vZHVsZS5leHBvcnRzID0gT3JiaXRDb250cm9scztcbiIsIi8qKlxuICogQGF1dGhvciBtcmRvb2IgLyBodHRwOi8vbXJkb29iLmNvbS9cbiAqL1xuXG52YXIgU3RhdHMgPSBmdW5jdGlvbiAoKSB7XG5cblx0dmFyIHN0YXJ0VGltZSA9IERhdGUubm93KCksIHByZXZUaW1lID0gc3RhcnRUaW1lO1xuXHR2YXIgbXMgPSAwLCBtc01pbiA9IEluZmluaXR5LCBtc01heCA9IDA7XG5cdHZhciBmcHMgPSAwLCBmcHNNaW4gPSBJbmZpbml0eSwgZnBzTWF4ID0gMDtcblx0dmFyIGZyYW1lcyA9IDAsIG1vZGUgPSAwO1xuXG5cdHZhciBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuXHRjb250YWluZXIuaWQgPSAnc3RhdHMnO1xuXHRjb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIGZ1bmN0aW9uICggZXZlbnQgKSB7IGV2ZW50LnByZXZlbnREZWZhdWx0KCk7IHNldE1vZGUoICsrIG1vZGUgJSAyICk7IH0sIGZhbHNlICk7XG5cdGNvbnRhaW5lci5zdHlsZS5jc3NUZXh0ID0gJ3dpZHRoOjgwcHg7b3BhY2l0eTowLjk7Y3Vyc29yOnBvaW50ZXInO1xuXG5cdHZhciBmcHNEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuXHRmcHNEaXYuaWQgPSAnZnBzJztcblx0ZnBzRGl2LnN0eWxlLmNzc1RleHQgPSAncGFkZGluZzowIDAgM3B4IDNweDt0ZXh0LWFsaWduOmxlZnQ7YmFja2dyb3VuZC1jb2xvcjojMDAyJztcblx0Y29udGFpbmVyLmFwcGVuZENoaWxkKCBmcHNEaXYgKTtcblxuXHR2YXIgZnBzVGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdGZwc1RleHQuaWQgPSAnZnBzVGV4dCc7XG5cdGZwc1RleHQuc3R5bGUuY3NzVGV4dCA9ICdjb2xvcjojMGZmO2ZvbnQtZmFtaWx5OkhlbHZldGljYSxBcmlhbCxzYW5zLXNlcmlmO2ZvbnQtc2l6ZTo5cHg7Zm9udC13ZWlnaHQ6Ym9sZDtsaW5lLWhlaWdodDoxNXB4Jztcblx0ZnBzVGV4dC5pbm5lckhUTUwgPSAnRlBTJztcblx0ZnBzRGl2LmFwcGVuZENoaWxkKCBmcHNUZXh0ICk7XG5cblx0dmFyIGZwc0dyYXBoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblx0ZnBzR3JhcGguaWQgPSAnZnBzR3JhcGgnO1xuXHRmcHNHcmFwaC5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOnJlbGF0aXZlO3dpZHRoOjc0cHg7aGVpZ2h0OjMwcHg7YmFja2dyb3VuZC1jb2xvcjojMGZmJztcblx0ZnBzRGl2LmFwcGVuZENoaWxkKCBmcHNHcmFwaCApO1xuXG5cdHdoaWxlICggZnBzR3JhcGguY2hpbGRyZW4ubGVuZ3RoIDwgNzQgKSB7XG5cblx0XHR2YXIgYmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ3NwYW4nICk7XG5cdFx0YmFyLnN0eWxlLmNzc1RleHQgPSAnd2lkdGg6MXB4O2hlaWdodDozMHB4O2Zsb2F0OmxlZnQ7YmFja2dyb3VuZC1jb2xvcjojMTEzJztcblx0XHRmcHNHcmFwaC5hcHBlbmRDaGlsZCggYmFyICk7XG5cblx0fVxuXG5cdHZhciBtc0RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdG1zRGl2LmlkID0gJ21zJztcblx0bXNEaXYuc3R5bGUuY3NzVGV4dCA9ICdwYWRkaW5nOjAgMCAzcHggM3B4O3RleHQtYWxpZ246bGVmdDtiYWNrZ3JvdW5kLWNvbG9yOiMwMjA7ZGlzcGxheTpub25lJztcblx0Y29udGFpbmVyLmFwcGVuZENoaWxkKCBtc0RpdiApO1xuXG5cdHZhciBtc1RleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuXHRtc1RleHQuaWQgPSAnbXNUZXh0Jztcblx0bXNUZXh0LnN0eWxlLmNzc1RleHQgPSAnY29sb3I6IzBmMDtmb250LWZhbWlseTpIZWx2ZXRpY2EsQXJpYWwsc2Fucy1zZXJpZjtmb250LXNpemU6OXB4O2ZvbnQtd2VpZ2h0OmJvbGQ7bGluZS1oZWlnaHQ6MTVweCc7XG5cdG1zVGV4dC5pbm5lckhUTUwgPSAnTVMnO1xuXHRtc0Rpdi5hcHBlbmRDaGlsZCggbXNUZXh0ICk7XG5cblx0dmFyIG1zR3JhcGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuXHRtc0dyYXBoLmlkID0gJ21zR3JhcGgnO1xuXHRtc0dyYXBoLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246cmVsYXRpdmU7d2lkdGg6NzRweDtoZWlnaHQ6MzBweDtiYWNrZ3JvdW5kLWNvbG9yOiMwZjAnO1xuXHRtc0Rpdi5hcHBlbmRDaGlsZCggbXNHcmFwaCApO1xuXG5cdHdoaWxlICggbXNHcmFwaC5jaGlsZHJlbi5sZW5ndGggPCA3NCApIHtcblxuXHRcdHZhciBiYXIyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ3NwYW4nICk7XG5cdFx0YmFyMi5zdHlsZS5jc3NUZXh0ID0gJ3dpZHRoOjFweDtoZWlnaHQ6MzBweDtmbG9hdDpsZWZ0O2JhY2tncm91bmQtY29sb3I6IzEzMSc7XG5cdFx0bXNHcmFwaC5hcHBlbmRDaGlsZCggYmFyMiApO1xuXG5cdH1cblxuXHR2YXIgc2V0TW9kZSA9IGZ1bmN0aW9uICggdmFsdWUgKSB7XG5cblx0XHRtb2RlID0gdmFsdWU7XG5cblx0XHRzd2l0Y2ggKCBtb2RlICkge1xuXG5cdFx0XHRjYXNlIDA6XG5cdFx0XHRcdGZwc0Rpdi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblx0XHRcdFx0bXNEaXYuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdGZwc0Rpdi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0XHRtc0Rpdi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdH07XG5cblx0dmFyIHVwZGF0ZUdyYXBoID0gZnVuY3Rpb24gKCBkb20sIHZhbHVlICkge1xuXG5cdFx0dmFyIGNoaWxkID0gZG9tLmFwcGVuZENoaWxkKCBkb20uZmlyc3RDaGlsZCApO1xuXHRcdGNoaWxkLnN0eWxlLmhlaWdodCA9IHZhbHVlICsgJ3B4JztcblxuXHR9O1xuXG5cdHJldHVybiB7XG5cblx0XHRSRVZJU0lPTjogMTIsXG5cblx0XHRkb21FbGVtZW50OiBjb250YWluZXIsXG5cblx0XHRzZXRNb2RlOiBzZXRNb2RlLFxuXG5cdFx0YmVnaW46IGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0c3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcblxuXHRcdH0sXG5cblx0XHRlbmQ6IGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0dmFyIHRpbWUgPSBEYXRlLm5vdygpO1xuXG5cdFx0XHRtcyA9IHRpbWUgLSBzdGFydFRpbWU7XG5cdFx0XHRtc01pbiA9IE1hdGgubWluKCBtc01pbiwgbXMgKTtcblx0XHRcdG1zTWF4ID0gTWF0aC5tYXgoIG1zTWF4LCBtcyApO1xuXG5cdFx0XHRtc1RleHQudGV4dENvbnRlbnQgPSBtcyArICcgTVMgKCcgKyBtc01pbiArICctJyArIG1zTWF4ICsgJyknO1xuXHRcdFx0dXBkYXRlR3JhcGgoIG1zR3JhcGgsIE1hdGgubWluKCAzMCwgMzAgLSAoIG1zIC8gMjAwICkgKiAzMCApICk7XG5cblx0XHRcdGZyYW1lcyArKztcblxuXHRcdFx0aWYgKCB0aW1lID4gcHJldlRpbWUgKyAxMDAwICkge1xuXG5cdFx0XHRcdGZwcyA9IE1hdGgucm91bmQoICggZnJhbWVzICogMTAwMCApIC8gKCB0aW1lIC0gcHJldlRpbWUgKSApO1xuXHRcdFx0XHRmcHNNaW4gPSBNYXRoLm1pbiggZnBzTWluLCBmcHMgKTtcblx0XHRcdFx0ZnBzTWF4ID0gTWF0aC5tYXgoIGZwc01heCwgZnBzICk7XG5cblx0XHRcdFx0ZnBzVGV4dC50ZXh0Q29udGVudCA9IGZwcyArICcgRlBTICgnICsgZnBzTWluICsgJy0nICsgZnBzTWF4ICsgJyknO1xuXHRcdFx0XHR1cGRhdGVHcmFwaCggZnBzR3JhcGgsIE1hdGgubWluKCAzMCwgMzAgLSAoIGZwcyAvIDEwMCApICogMzAgKSApO1xuXG5cdFx0XHRcdHByZXZUaW1lID0gdGltZTtcblx0XHRcdFx0ZnJhbWVzID0gMDtcblxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGltZTtcblxuXHRcdH0sXG5cblx0XHR1cGRhdGU6IGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0c3RhcnRUaW1lID0gdGhpcy5lbmQoKTtcblxuXHRcdH1cblxuXHR9O1xuXG59O1xuXG5pZiAoIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICkge1xuXG5cdG1vZHVsZS5leHBvcnRzID0gU3RhdHM7XG5cbn0iLCIvKipcbiAqIEBhdXRob3IgYWx0ZXJlZHEgLyBodHRwOi8vYWx0ZXJlZHF1YWxpYS5jb20vXG4gKiBAYXV0aG9kIG1yZG9vYiAvIGh0dHA6Ly9tcmRvb2IuY29tL1xuICogQGF1dGhvZCBhcm9kaWMgLyBodHRwOi8vYWxla3NhbmRhcnJvZGljLmNvbS9cbiAqL1xuXG5USFJFRS5TdGVyZW9FZmZlY3QgPSBmdW5jdGlvbiAoIHJlbmRlcmVyICkge1xuXG5cdC8vIEFQSVxuXG5cdHRoaXMuc2VwYXJhdGlvbiA9IDM7XG5cblx0Ly8gaW50ZXJuYWxzXG5cblx0dmFyIF93aWR0aCwgX2hlaWdodDtcblxuXHR2YXIgX3Bvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblx0dmFyIF9xdWF0ZXJuaW9uID0gbmV3IFRIUkVFLlF1YXRlcm5pb24oKTtcblx0dmFyIF9zY2FsZSA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cblx0dmFyIF9jYW1lcmFMID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKCk7XG5cdHZhciBfY2FtZXJhUiA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSgpO1xuXG5cdC8vIGluaXRpYWxpemF0aW9uXG5cblx0cmVuZGVyZXIuYXV0b0NsZWFyID0gZmFsc2U7XG5cblx0dGhpcy5zZXRTaXplID0gZnVuY3Rpb24gKCB3aWR0aCwgaGVpZ2h0ICkge1xuXG5cdFx0X3dpZHRoID0gd2lkdGggLyAyO1xuXHRcdF9oZWlnaHQgPSBoZWlnaHQ7XG5cblx0XHRyZW5kZXJlci5zZXRTaXplKCB3aWR0aCwgaGVpZ2h0ICk7XG5cblx0fTtcblxuXHR0aGlzLnJlbmRlciA9IGZ1bmN0aW9uICggc2NlbmUsIGNhbWVyYSApIHtcblxuXHRcdHNjZW5lLnVwZGF0ZU1hdHJpeFdvcmxkKCk7XG5cblx0XHRpZiAoIGNhbWVyYS5wYXJlbnQgPT09IHVuZGVmaW5lZCApIGNhbWVyYS51cGRhdGVNYXRyaXhXb3JsZCgpO1xuXHRcblx0XHRjYW1lcmEubWF0cml4V29ybGQuZGVjb21wb3NlKCBfcG9zaXRpb24sIF9xdWF0ZXJuaW9uLCBfc2NhbGUgKTtcblxuXHRcdC8vIGxlZnRcblxuXHRcdF9jYW1lcmFMLmZvdiA9IGNhbWVyYS5mb3Y7XG5cdFx0X2NhbWVyYUwuYXNwZWN0ID0gMC41ICogY2FtZXJhLmFzcGVjdDtcblx0XHRfY2FtZXJhTC5uZWFyID0gY2FtZXJhLm5lYXI7XG5cdFx0X2NhbWVyYUwuZmFyID0gY2FtZXJhLmZhcjtcblx0XHRfY2FtZXJhTC51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG5cblx0XHRfY2FtZXJhTC5wb3NpdGlvbi5jb3B5KCBfcG9zaXRpb24gKTtcblx0XHRfY2FtZXJhTC5xdWF0ZXJuaW9uLmNvcHkoIF9xdWF0ZXJuaW9uICk7XG5cdFx0X2NhbWVyYUwudHJhbnNsYXRlWCggLSB0aGlzLnNlcGFyYXRpb24gKTtcblxuXHRcdC8vIHJpZ2h0XG5cblx0XHRfY2FtZXJhUi5uZWFyID0gY2FtZXJhLm5lYXI7XG5cdFx0X2NhbWVyYVIuZmFyID0gY2FtZXJhLmZhcjtcblx0XHRfY2FtZXJhUi5wcm9qZWN0aW9uTWF0cml4ID0gX2NhbWVyYUwucHJvamVjdGlvbk1hdHJpeDtcblxuXHRcdF9jYW1lcmFSLnBvc2l0aW9uLmNvcHkoIF9wb3NpdGlvbiApO1xuXHRcdF9jYW1lcmFSLnF1YXRlcm5pb24uY29weSggX3F1YXRlcm5pb24gKTtcblx0XHRfY2FtZXJhUi50cmFuc2xhdGVYKCB0aGlzLnNlcGFyYXRpb24gKTtcblxuXHRcdC8vXG5cblx0XHRyZW5kZXJlci5zZXRWaWV3cG9ydCggMCwgMCwgX3dpZHRoICogMiwgX2hlaWdodCApO1xuXHRcdHJlbmRlcmVyLmNsZWFyKCk7XG5cblx0XHRyZW5kZXJlci5zZXRWaWV3cG9ydCggMCwgMCwgX3dpZHRoLCBfaGVpZ2h0ICk7XG5cdFx0cmVuZGVyZXIucmVuZGVyKCBzY2VuZSwgX2NhbWVyYUwgKTtcblxuXHRcdHJlbmRlcmVyLnNldFZpZXdwb3J0KCBfd2lkdGgsIDAsIF93aWR0aCwgX2hlaWdodCApO1xuXHRcdHJlbmRlcmVyLnJlbmRlciggc2NlbmUsIF9jYW1lcmFSICk7XG5cblx0fTtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUSFJFRS5TdGVyZW9FZmZlY3Q7IiwibW9kdWxlLmV4cG9ydHMgPSBub29wXG5cbmZ1bmN0aW9uIG5vb3AoKSB7XG4gIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdZb3Ugc2hvdWxkIGJ1bmRsZSB5b3VyIGNvZGUgJyArXG4gICAgICAndXNpbmcgYGdsc2xpZnlgIGFzIGEgdHJhbnNmb3JtLidcbiAgKVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBwcm9ncmFtaWZ5XG5cbmZ1bmN0aW9uIHByb2dyYW1pZnkodmVydGV4LCBmcmFnbWVudCwgdW5pZm9ybXMsIGF0dHJpYnV0ZXMpIHtcbiAgcmV0dXJuIHtcbiAgICB2ZXJ0ZXg6IHZlcnRleCwgXG4gICAgZnJhZ21lbnQ6IGZyYWdtZW50LFxuICAgIHVuaWZvcm1zOiB1bmlmb3JtcywgXG4gICAgYXR0cmlidXRlczogYXR0cmlidXRlc1xuICB9O1xufVxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuTXV0YXRpb25PYnNlcnZlciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93Lk11dGF0aW9uT2JzZXJ2ZXI7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgdmFyIHF1ZXVlID0gW107XG5cbiAgICBpZiAoY2FuTXV0YXRpb25PYnNlcnZlcikge1xuICAgICAgICB2YXIgaGlkZGVuRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgdmFyIG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHF1ZXVlTGlzdCA9IHF1ZXVlLnNsaWNlKCk7XG4gICAgICAgICAgICBxdWV1ZS5sZW5ndGggPSAwO1xuICAgICAgICAgICAgcXVldWVMaXN0LmZvckVhY2goZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGhpZGRlbkRpdiwgeyBhdHRyaWJ1dGVzOiB0cnVlIH0pO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgaWYgKCFxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBoaWRkZW5EaXYuc2V0QXR0cmlidXRlKCd5ZXMnLCAnbm8nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiIsIi8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2JhbmtzZWFuLzMwNDUyMlxuLy9cbi8vIFBvcnRlZCBmcm9tIFN0ZWZhbiBHdXN0YXZzb24ncyBqYXZhIGltcGxlbWVudGF0aW9uXG4vLyBodHRwOi8vc3RhZmZ3d3cuaXRuLmxpdS5zZS9+c3RlZ3Uvc2ltcGxleG5vaXNlL3NpbXBsZXhub2lzZS5wZGZcbi8vIFJlYWQgU3RlZmFuJ3MgZXhjZWxsZW50IHBhcGVyIGZvciBkZXRhaWxzIG9uIGhvdyB0aGlzIGNvZGUgd29ya3MuXG4vL1xuLy8gU2VhbiBNY0N1bGxvdWdoIGJhbmtzZWFuQGdtYWlsLmNvbVxuXG4vKipcbiAqIFlvdSBjYW4gcGFzcyBpbiBhIHJhbmRvbSBudW1iZXIgZ2VuZXJhdG9yIG9iamVjdCBpZiB5b3UgbGlrZS5cbiAqIEl0IGlzIGFzc3VtZWQgdG8gaGF2ZSBhIHJhbmRvbSgpIG1ldGhvZC5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGV4Tm9pc2UgPSBmdW5jdGlvbihyKSB7XG4gIGlmIChyID09IHVuZGVmaW5lZCkgciA9IE1hdGg7XG4gIHRoaXMuZ3JhZDMgPSBbWzEsMSwwXSxbLTEsMSwwXSxbMSwtMSwwXSxbLTEsLTEsMF0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWzEsMCwxXSxbLTEsMCwxXSxbMSwwLC0xXSxbLTEsMCwtMV0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWzAsMSwxXSxbMCwtMSwxXSxbMCwxLC0xXSxbMCwtMSwtMV1dOyBcbiAgdGhpcy5wID0gW107XG4gIGZvciAodmFyIGk9MDsgaTwyNTY7IGkrKykge1xuICAgIHRoaXMucFtpXSA9IE1hdGguZmxvb3Ioci5yYW5kb20oKSoyNTYpO1xuICB9XG4gIC8vIFRvIHJlbW92ZSB0aGUgbmVlZCBmb3IgaW5kZXggd3JhcHBpbmcsIGRvdWJsZSB0aGUgcGVybXV0YXRpb24gdGFibGUgbGVuZ3RoIFxuICB0aGlzLnBlcm0gPSBbXTsgXG4gIGZvcih2YXIgaT0wOyBpPDUxMjsgaSsrKSB7XG4gICAgdGhpcy5wZXJtW2ldPXRoaXMucFtpICYgMjU1XTtcbiAgfSBcblxuICAvLyBBIGxvb2t1cCB0YWJsZSB0byB0cmF2ZXJzZSB0aGUgc2ltcGxleCBhcm91bmQgYSBnaXZlbiBwb2ludCBpbiA0RC4gXG4gIC8vIERldGFpbHMgY2FuIGJlIGZvdW5kIHdoZXJlIHRoaXMgdGFibGUgaXMgdXNlZCwgaW4gdGhlIDREIG5vaXNlIG1ldGhvZC4gXG4gIHRoaXMuc2ltcGxleCA9IFsgXG4gICAgWzAsMSwyLDNdLFswLDEsMywyXSxbMCwwLDAsMF0sWzAsMiwzLDFdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFsxLDIsMywwXSwgXG4gICAgWzAsMiwxLDNdLFswLDAsMCwwXSxbMCwzLDEsMl0sWzAsMywyLDFdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFsxLDMsMiwwXSwgXG4gICAgWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSwgXG4gICAgWzEsMiwwLDNdLFswLDAsMCwwXSxbMSwzLDAsMl0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzIsMywwLDFdLFsyLDMsMSwwXSwgXG4gICAgWzEsMCwyLDNdLFsxLDAsMywyXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMiwwLDMsMV0sWzAsMCwwLDBdLFsyLDEsMywwXSwgXG4gICAgWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSwgXG4gICAgWzIsMCwxLDNdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFszLDAsMSwyXSxbMywwLDIsMV0sWzAsMCwwLDBdLFszLDEsMiwwXSwgXG4gICAgWzIsMSwwLDNdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFszLDEsMCwyXSxbMCwwLDAsMF0sWzMsMiwwLDFdLFszLDIsMSwwXV07IFxufTtcblxuU2ltcGxleE5vaXNlLnByb3RvdHlwZS5kb3QgPSBmdW5jdGlvbihnLCB4LCB5KSB7IFxuICByZXR1cm4gZ1swXSp4ICsgZ1sxXSp5O1xufTtcblxuU2ltcGxleE5vaXNlLnByb3RvdHlwZS5ub2lzZSA9IGZ1bmN0aW9uKHhpbiwgeWluKSB7IFxuICB2YXIgbjAsIG4xLCBuMjsgLy8gTm9pc2UgY29udHJpYnV0aW9ucyBmcm9tIHRoZSB0aHJlZSBjb3JuZXJzIFxuICAvLyBTa2V3IHRoZSBpbnB1dCBzcGFjZSB0byBkZXRlcm1pbmUgd2hpY2ggc2ltcGxleCBjZWxsIHdlJ3JlIGluIFxuICB2YXIgRjIgPSAwLjUqKE1hdGguc3FydCgzLjApLTEuMCk7IFxuICB2YXIgcyA9ICh4aW4reWluKSpGMjsgLy8gSGFpcnkgZmFjdG9yIGZvciAyRCBcbiAgdmFyIGkgPSBNYXRoLmZsb29yKHhpbitzKTsgXG4gIHZhciBqID0gTWF0aC5mbG9vcih5aW4rcyk7IFxuICB2YXIgRzIgPSAoMy4wLU1hdGguc3FydCgzLjApKS82LjA7IFxuICB2YXIgdCA9IChpK2opKkcyOyBcbiAgdmFyIFgwID0gaS10OyAvLyBVbnNrZXcgdGhlIGNlbGwgb3JpZ2luIGJhY2sgdG8gKHgseSkgc3BhY2UgXG4gIHZhciBZMCA9IGotdDsgXG4gIHZhciB4MCA9IHhpbi1YMDsgLy8gVGhlIHgseSBkaXN0YW5jZXMgZnJvbSB0aGUgY2VsbCBvcmlnaW4gXG4gIHZhciB5MCA9IHlpbi1ZMDsgXG4gIC8vIEZvciB0aGUgMkQgY2FzZSwgdGhlIHNpbXBsZXggc2hhcGUgaXMgYW4gZXF1aWxhdGVyYWwgdHJpYW5nbGUuIFxuICAvLyBEZXRlcm1pbmUgd2hpY2ggc2ltcGxleCB3ZSBhcmUgaW4uIFxuICB2YXIgaTEsIGoxOyAvLyBPZmZzZXRzIGZvciBzZWNvbmQgKG1pZGRsZSkgY29ybmVyIG9mIHNpbXBsZXggaW4gKGksaikgY29vcmRzIFxuICBpZih4MD55MCkge2kxPTE7IGoxPTA7fSAvLyBsb3dlciB0cmlhbmdsZSwgWFkgb3JkZXI6ICgwLDApLT4oMSwwKS0+KDEsMSkgXG4gIGVsc2Uge2kxPTA7IGoxPTE7fSAgICAgIC8vIHVwcGVyIHRyaWFuZ2xlLCBZWCBvcmRlcjogKDAsMCktPigwLDEpLT4oMSwxKSBcbiAgLy8gQSBzdGVwIG9mICgxLDApIGluIChpLGopIG1lYW5zIGEgc3RlcCBvZiAoMS1jLC1jKSBpbiAoeCx5KSwgYW5kIFxuICAvLyBhIHN0ZXAgb2YgKDAsMSkgaW4gKGksaikgbWVhbnMgYSBzdGVwIG9mICgtYywxLWMpIGluICh4LHkpLCB3aGVyZSBcbiAgLy8gYyA9ICgzLXNxcnQoMykpLzYgXG4gIHZhciB4MSA9IHgwIC0gaTEgKyBHMjsgLy8gT2Zmc2V0cyBmb3IgbWlkZGxlIGNvcm5lciBpbiAoeCx5KSB1bnNrZXdlZCBjb29yZHMgXG4gIHZhciB5MSA9IHkwIC0gajEgKyBHMjsgXG4gIHZhciB4MiA9IHgwIC0gMS4wICsgMi4wICogRzI7IC8vIE9mZnNldHMgZm9yIGxhc3QgY29ybmVyIGluICh4LHkpIHVuc2tld2VkIGNvb3JkcyBcbiAgdmFyIHkyID0geTAgLSAxLjAgKyAyLjAgKiBHMjsgXG4gIC8vIFdvcmsgb3V0IHRoZSBoYXNoZWQgZ3JhZGllbnQgaW5kaWNlcyBvZiB0aGUgdGhyZWUgc2ltcGxleCBjb3JuZXJzIFxuICB2YXIgaWkgPSBpICYgMjU1OyBcbiAgdmFyIGpqID0gaiAmIDI1NTsgXG4gIHZhciBnaTAgPSB0aGlzLnBlcm1baWkrdGhpcy5wZXJtW2pqXV0gJSAxMjsgXG4gIHZhciBnaTEgPSB0aGlzLnBlcm1baWkraTErdGhpcy5wZXJtW2pqK2oxXV0gJSAxMjsgXG4gIHZhciBnaTIgPSB0aGlzLnBlcm1baWkrMSt0aGlzLnBlcm1bamorMV1dICUgMTI7IFxuICAvLyBDYWxjdWxhdGUgdGhlIGNvbnRyaWJ1dGlvbiBmcm9tIHRoZSB0aHJlZSBjb3JuZXJzIFxuICB2YXIgdDAgPSAwLjUgLSB4MCp4MC15MCp5MDsgXG4gIGlmKHQwPDApIG4wID0gMC4wOyBcbiAgZWxzZSB7IFxuICAgIHQwICo9IHQwOyBcbiAgICBuMCA9IHQwICogdDAgKiB0aGlzLmRvdCh0aGlzLmdyYWQzW2dpMF0sIHgwLCB5MCk7ICAvLyAoeCx5KSBvZiBncmFkMyB1c2VkIGZvciAyRCBncmFkaWVudCBcbiAgfSBcbiAgdmFyIHQxID0gMC41IC0geDEqeDEteTEqeTE7IFxuICBpZih0MTwwKSBuMSA9IDAuMDsgXG4gIGVsc2UgeyBcbiAgICB0MSAqPSB0MTsgXG4gICAgbjEgPSB0MSAqIHQxICogdGhpcy5kb3QodGhpcy5ncmFkM1tnaTFdLCB4MSwgeTEpOyBcbiAgfVxuICB2YXIgdDIgPSAwLjUgLSB4Mip4Mi15Mip5MjsgXG4gIGlmKHQyPDApIG4yID0gMC4wOyBcbiAgZWxzZSB7IFxuICAgIHQyICo9IHQyOyBcbiAgICBuMiA9IHQyICogdDIgKiB0aGlzLmRvdCh0aGlzLmdyYWQzW2dpMl0sIHgyLCB5Mik7IFxuICB9IFxuICAvLyBBZGQgY29udHJpYnV0aW9ucyBmcm9tIGVhY2ggY29ybmVyIHRvIGdldCB0aGUgZmluYWwgbm9pc2UgdmFsdWUuIFxuICAvLyBUaGUgcmVzdWx0IGlzIHNjYWxlZCB0byByZXR1cm4gdmFsdWVzIGluIHRoZSBpbnRlcnZhbCBbLTEsMV0uIFxuICByZXR1cm4gNzAuMCAqIChuMCArIG4xICsgbjIpOyBcbn07XG5cbi8vIDNEIHNpbXBsZXggbm9pc2UgXG5TaW1wbGV4Tm9pc2UucHJvdG90eXBlLm5vaXNlM2QgPSBmdW5jdGlvbih4aW4sIHlpbiwgemluKSB7IFxuICB2YXIgbjAsIG4xLCBuMiwgbjM7IC8vIE5vaXNlIGNvbnRyaWJ1dGlvbnMgZnJvbSB0aGUgZm91ciBjb3JuZXJzIFxuICAvLyBTa2V3IHRoZSBpbnB1dCBzcGFjZSB0byBkZXRlcm1pbmUgd2hpY2ggc2ltcGxleCBjZWxsIHdlJ3JlIGluIFxuICB2YXIgRjMgPSAxLjAvMy4wOyBcbiAgdmFyIHMgPSAoeGluK3lpbit6aW4pKkYzOyAvLyBWZXJ5IG5pY2UgYW5kIHNpbXBsZSBza2V3IGZhY3RvciBmb3IgM0QgXG4gIHZhciBpID0gTWF0aC5mbG9vcih4aW4rcyk7IFxuICB2YXIgaiA9IE1hdGguZmxvb3IoeWluK3MpOyBcbiAgdmFyIGsgPSBNYXRoLmZsb29yKHppbitzKTsgXG4gIHZhciBHMyA9IDEuMC82LjA7IC8vIFZlcnkgbmljZSBhbmQgc2ltcGxlIHVuc2tldyBmYWN0b3IsIHRvbyBcbiAgdmFyIHQgPSAoaStqK2spKkczOyBcbiAgdmFyIFgwID0gaS10OyAvLyBVbnNrZXcgdGhlIGNlbGwgb3JpZ2luIGJhY2sgdG8gKHgseSx6KSBzcGFjZSBcbiAgdmFyIFkwID0gai10OyBcbiAgdmFyIFowID0gay10OyBcbiAgdmFyIHgwID0geGluLVgwOyAvLyBUaGUgeCx5LHogZGlzdGFuY2VzIGZyb20gdGhlIGNlbGwgb3JpZ2luIFxuICB2YXIgeTAgPSB5aW4tWTA7IFxuICB2YXIgejAgPSB6aW4tWjA7IFxuICAvLyBGb3IgdGhlIDNEIGNhc2UsIHRoZSBzaW1wbGV4IHNoYXBlIGlzIGEgc2xpZ2h0bHkgaXJyZWd1bGFyIHRldHJhaGVkcm9uLiBcbiAgLy8gRGV0ZXJtaW5lIHdoaWNoIHNpbXBsZXggd2UgYXJlIGluLiBcbiAgdmFyIGkxLCBqMSwgazE7IC8vIE9mZnNldHMgZm9yIHNlY29uZCBjb3JuZXIgb2Ygc2ltcGxleCBpbiAoaSxqLGspIGNvb3JkcyBcbiAgdmFyIGkyLCBqMiwgazI7IC8vIE9mZnNldHMgZm9yIHRoaXJkIGNvcm5lciBvZiBzaW1wbGV4IGluIChpLGosaykgY29vcmRzIFxuICBpZih4MD49eTApIHsgXG4gICAgaWYoeTA+PXowKSBcbiAgICAgIHsgaTE9MTsgajE9MDsgazE9MDsgaTI9MTsgajI9MTsgazI9MDsgfSAvLyBYIFkgWiBvcmRlciBcbiAgICAgIGVsc2UgaWYoeDA+PXowKSB7IGkxPTE7IGoxPTA7IGsxPTA7IGkyPTE7IGoyPTA7IGsyPTE7IH0gLy8gWCBaIFkgb3JkZXIgXG4gICAgICBlbHNlIHsgaTE9MDsgajE9MDsgazE9MTsgaTI9MTsgajI9MDsgazI9MTsgfSAvLyBaIFggWSBvcmRlciBcbiAgICB9IFxuICBlbHNlIHsgLy8geDA8eTAgXG4gICAgaWYoeTA8ejApIHsgaTE9MDsgajE9MDsgazE9MTsgaTI9MDsgajI9MTsgazI9MTsgfSAvLyBaIFkgWCBvcmRlciBcbiAgICBlbHNlIGlmKHgwPHowKSB7IGkxPTA7IGoxPTE7IGsxPTA7IGkyPTA7IGoyPTE7IGsyPTE7IH0gLy8gWSBaIFggb3JkZXIgXG4gICAgZWxzZSB7IGkxPTA7IGoxPTE7IGsxPTA7IGkyPTE7IGoyPTE7IGsyPTA7IH0gLy8gWSBYIFogb3JkZXIgXG4gIH0gXG4gIC8vIEEgc3RlcCBvZiAoMSwwLDApIGluIChpLGosaykgbWVhbnMgYSBzdGVwIG9mICgxLWMsLWMsLWMpIGluICh4LHkseiksIFxuICAvLyBhIHN0ZXAgb2YgKDAsMSwwKSBpbiAoaSxqLGspIG1lYW5zIGEgc3RlcCBvZiAoLWMsMS1jLC1jKSBpbiAoeCx5LHopLCBhbmQgXG4gIC8vIGEgc3RlcCBvZiAoMCwwLDEpIGluIChpLGosaykgbWVhbnMgYSBzdGVwIG9mICgtYywtYywxLWMpIGluICh4LHkseiksIHdoZXJlIFxuICAvLyBjID0gMS82LlxuICB2YXIgeDEgPSB4MCAtIGkxICsgRzM7IC8vIE9mZnNldHMgZm9yIHNlY29uZCBjb3JuZXIgaW4gKHgseSx6KSBjb29yZHMgXG4gIHZhciB5MSA9IHkwIC0gajEgKyBHMzsgXG4gIHZhciB6MSA9IHowIC0gazEgKyBHMzsgXG4gIHZhciB4MiA9IHgwIC0gaTIgKyAyLjAqRzM7IC8vIE9mZnNldHMgZm9yIHRoaXJkIGNvcm5lciBpbiAoeCx5LHopIGNvb3JkcyBcbiAgdmFyIHkyID0geTAgLSBqMiArIDIuMCpHMzsgXG4gIHZhciB6MiA9IHowIC0gazIgKyAyLjAqRzM7IFxuICB2YXIgeDMgPSB4MCAtIDEuMCArIDMuMCpHMzsgLy8gT2Zmc2V0cyBmb3IgbGFzdCBjb3JuZXIgaW4gKHgseSx6KSBjb29yZHMgXG4gIHZhciB5MyA9IHkwIC0gMS4wICsgMy4wKkczOyBcbiAgdmFyIHozID0gejAgLSAxLjAgKyAzLjAqRzM7IFxuICAvLyBXb3JrIG91dCB0aGUgaGFzaGVkIGdyYWRpZW50IGluZGljZXMgb2YgdGhlIGZvdXIgc2ltcGxleCBjb3JuZXJzIFxuICB2YXIgaWkgPSBpICYgMjU1OyBcbiAgdmFyIGpqID0gaiAmIDI1NTsgXG4gIHZhciBrayA9IGsgJiAyNTU7IFxuICB2YXIgZ2kwID0gdGhpcy5wZXJtW2lpK3RoaXMucGVybVtqait0aGlzLnBlcm1ba2tdXV0gJSAxMjsgXG4gIHZhciBnaTEgPSB0aGlzLnBlcm1baWkraTErdGhpcy5wZXJtW2pqK2oxK3RoaXMucGVybVtraytrMV1dXSAlIDEyOyBcbiAgdmFyIGdpMiA9IHRoaXMucGVybVtpaStpMit0aGlzLnBlcm1bamorajIrdGhpcy5wZXJtW2trK2syXV1dICUgMTI7IFxuICB2YXIgZ2kzID0gdGhpcy5wZXJtW2lpKzErdGhpcy5wZXJtW2pqKzErdGhpcy5wZXJtW2trKzFdXV0gJSAxMjsgXG4gIC8vIENhbGN1bGF0ZSB0aGUgY29udHJpYnV0aW9uIGZyb20gdGhlIGZvdXIgY29ybmVycyBcbiAgdmFyIHQwID0gMC42IC0geDAqeDAgLSB5MCp5MCAtIHowKnowOyBcbiAgaWYodDA8MCkgbjAgPSAwLjA7IFxuICBlbHNlIHsgXG4gICAgdDAgKj0gdDA7IFxuICAgIG4wID0gdDAgKiB0MCAqIHRoaXMuZG90KHRoaXMuZ3JhZDNbZ2kwXSwgeDAsIHkwLCB6MCk7IFxuICB9XG4gIHZhciB0MSA9IDAuNiAtIHgxKngxIC0geTEqeTEgLSB6MSp6MTsgXG4gIGlmKHQxPDApIG4xID0gMC4wOyBcbiAgZWxzZSB7IFxuICAgIHQxICo9IHQxOyBcbiAgICBuMSA9IHQxICogdDEgKiB0aGlzLmRvdCh0aGlzLmdyYWQzW2dpMV0sIHgxLCB5MSwgejEpOyBcbiAgfSBcbiAgdmFyIHQyID0gMC42IC0geDIqeDIgLSB5Mip5MiAtIHoyKnoyOyBcbiAgaWYodDI8MCkgbjIgPSAwLjA7IFxuICBlbHNlIHsgXG4gICAgdDIgKj0gdDI7IFxuICAgIG4yID0gdDIgKiB0MiAqIHRoaXMuZG90KHRoaXMuZ3JhZDNbZ2kyXSwgeDIsIHkyLCB6Mik7IFxuICB9IFxuICB2YXIgdDMgPSAwLjYgLSB4Myp4MyAtIHkzKnkzIC0gejMqejM7IFxuICBpZih0MzwwKSBuMyA9IDAuMDsgXG4gIGVsc2UgeyBcbiAgICB0MyAqPSB0MzsgXG4gICAgbjMgPSB0MyAqIHQzICogdGhpcy5kb3QodGhpcy5ncmFkM1tnaTNdLCB4MywgeTMsIHozKTsgXG4gIH0gXG4gIC8vIEFkZCBjb250cmlidXRpb25zIGZyb20gZWFjaCBjb3JuZXIgdG8gZ2V0IHRoZSBmaW5hbCBub2lzZSB2YWx1ZS4gXG4gIC8vIFRoZSByZXN1bHQgaXMgc2NhbGVkIHRvIHN0YXkganVzdCBpbnNpZGUgWy0xLDFdIFxuICByZXR1cm4gMzIuMCoobjAgKyBuMSArIG4yICsgbjMpOyBcbn07IiwiLyohXG4gKiBAb3ZlcnZpZXcgUlNWUCAtIGEgdGlueSBpbXBsZW1lbnRhdGlvbiBvZiBQcm9taXNlcy9BKy5cbiAqIEBjb3B5cmlnaHQgQ29weXJpZ2h0IChjKSAyMDE0IFllaHVkYSBLYXR6LCBUb20gRGFsZSwgU3RlZmFuIFBlbm5lciBhbmQgY29udHJpYnV0b3JzXG4gKiBAbGljZW5zZSAgIExpY2Vuc2VkIHVuZGVyIE1JVCBsaWNlbnNlXG4gKiAgICAgICAgICAgIFNlZSBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vdGlsZGVpby9yc3ZwLmpzL21hc3Rlci9MSUNFTlNFXG4gKiBAdmVyc2lvbiAgIDMuMC4xNFxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGZ1bmN0aW9uICQkcnN2cCRldmVudHMkJGluZGV4T2YoY2FsbGJhY2tzLCBjYWxsYmFjaykge1xuICAgICAgZm9yICh2YXIgaT0wLCBsPWNhbGxiYWNrcy5sZW5ndGg7IGk8bDsgaSsrKSB7XG4gICAgICAgIGlmIChjYWxsYmFja3NbaV0gPT09IGNhbGxiYWNrKSB7IHJldHVybiBpOyB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkZXZlbnRzJCRjYWxsYmFja3NGb3Iob2JqZWN0KSB7XG4gICAgICB2YXIgY2FsbGJhY2tzID0gb2JqZWN0Ll9wcm9taXNlQ2FsbGJhY2tzO1xuXG4gICAgICBpZiAoIWNhbGxiYWNrcykge1xuICAgICAgICBjYWxsYmFja3MgPSBvYmplY3QuX3Byb21pc2VDYWxsYmFja3MgPSB7fTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNhbGxiYWNrcztcbiAgICB9XG5cbiAgICB2YXIgJCRyc3ZwJGV2ZW50cyQkZGVmYXVsdCA9IHtcblxuICAgICAgLyoqXG4gICAgICAgIGBSU1ZQLkV2ZW50VGFyZ2V0Lm1peGluYCBleHRlbmRzIGFuIG9iamVjdCB3aXRoIEV2ZW50VGFyZ2V0IG1ldGhvZHMuIEZvclxuICAgICAgICBFeGFtcGxlOlxuXG4gICAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgICAgdmFyIG9iamVjdCA9IHt9O1xuXG4gICAgICAgIFJTVlAuRXZlbnRUYXJnZXQubWl4aW4ob2JqZWN0KTtcblxuICAgICAgICBvYmplY3Qub24oJ2ZpbmlzaGVkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAvLyBoYW5kbGUgZXZlbnRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgb2JqZWN0LnRyaWdnZXIoJ2ZpbmlzaGVkJywgeyBkZXRhaWw6IHZhbHVlIH0pO1xuICAgICAgICBgYGBcblxuICAgICAgICBgRXZlbnRUYXJnZXQubWl4aW5gIGFsc28gd29ya3Mgd2l0aCBwcm90b3R5cGVzOlxuXG4gICAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgICAgdmFyIFBlcnNvbiA9IGZ1bmN0aW9uKCkge307XG4gICAgICAgIFJTVlAuRXZlbnRUYXJnZXQubWl4aW4oUGVyc29uLnByb3RvdHlwZSk7XG5cbiAgICAgICAgdmFyIHllaHVkYSA9IG5ldyBQZXJzb24oKTtcbiAgICAgICAgdmFyIHRvbSA9IG5ldyBQZXJzb24oKTtcblxuICAgICAgICB5ZWh1ZGEub24oJ3Bva2UnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdZZWh1ZGEgc2F5cyBPVycpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0b20ub24oJ3Bva2UnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdUb20gc2F5cyBPVycpO1xuICAgICAgICB9KTtcblxuICAgICAgICB5ZWh1ZGEudHJpZ2dlcigncG9rZScpO1xuICAgICAgICB0b20udHJpZ2dlcigncG9rZScpO1xuICAgICAgICBgYGBcblxuICAgICAgICBAbWV0aG9kIG1peGluXG4gICAgICAgIEBmb3IgUlNWUC5FdmVudFRhcmdldFxuICAgICAgICBAcHJpdmF0ZVxuICAgICAgICBAcGFyYW0ge09iamVjdH0gb2JqZWN0IG9iamVjdCB0byBleHRlbmQgd2l0aCBFdmVudFRhcmdldCBtZXRob2RzXG4gICAgICAqL1xuICAgICAgbWl4aW46IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgICAgICBvYmplY3Qub24gPSB0aGlzLm9uO1xuICAgICAgICBvYmplY3Qub2ZmID0gdGhpcy5vZmY7XG4gICAgICAgIG9iamVjdC50cmlnZ2VyID0gdGhpcy50cmlnZ2VyO1xuICAgICAgICBvYmplY3QuX3Byb21pc2VDYWxsYmFja3MgPSB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAgUmVnaXN0ZXJzIGEgY2FsbGJhY2sgdG8gYmUgZXhlY3V0ZWQgd2hlbiBgZXZlbnROYW1lYCBpcyB0cmlnZ2VyZWRcblxuICAgICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICAgIG9iamVjdC5vbignZXZlbnQnLCBmdW5jdGlvbihldmVudEluZm8pe1xuICAgICAgICAgIC8vIGhhbmRsZSB0aGUgZXZlbnRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgb2JqZWN0LnRyaWdnZXIoJ2V2ZW50Jyk7XG4gICAgICAgIGBgYFxuXG4gICAgICAgIEBtZXRob2Qgb25cbiAgICAgICAgQGZvciBSU1ZQLkV2ZW50VGFyZ2V0XG4gICAgICAgIEBwcml2YXRlXG4gICAgICAgIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWUgbmFtZSBvZiB0aGUgZXZlbnQgdG8gbGlzdGVuIGZvclxuICAgICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgZXZlbnQgaXMgdHJpZ2dlcmVkLlxuICAgICAgKi9cbiAgICAgIG9uOiBmdW5jdGlvbihldmVudE5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBhbGxDYWxsYmFja3MgPSAkJHJzdnAkZXZlbnRzJCRjYWxsYmFja3NGb3IodGhpcyksIGNhbGxiYWNrcztcblxuICAgICAgICBjYWxsYmFja3MgPSBhbGxDYWxsYmFja3NbZXZlbnROYW1lXTtcblxuICAgICAgICBpZiAoIWNhbGxiYWNrcykge1xuICAgICAgICAgIGNhbGxiYWNrcyA9IGFsbENhbGxiYWNrc1tldmVudE5hbWVdID0gW107XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJCRyc3ZwJGV2ZW50cyQkaW5kZXhPZihjYWxsYmFja3MsIGNhbGxiYWNrKSA9PT0gLTEpIHtcbiAgICAgICAgICBjYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICBZb3UgY2FuIHVzZSBgb2ZmYCB0byBzdG9wIGZpcmluZyBhIHBhcnRpY3VsYXIgY2FsbGJhY2sgZm9yIGFuIGV2ZW50OlxuXG4gICAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgICAgZnVuY3Rpb24gZG9TdHVmZigpIHsgLy8gZG8gc3R1ZmYhIH1cbiAgICAgICAgb2JqZWN0Lm9uKCdzdHVmZicsIGRvU3R1ZmYpO1xuXG4gICAgICAgIG9iamVjdC50cmlnZ2VyKCdzdHVmZicpOyAvLyBkb1N0dWZmIHdpbGwgYmUgY2FsbGVkXG5cbiAgICAgICAgLy8gVW5yZWdpc3RlciBPTkxZIHRoZSBkb1N0dWZmIGNhbGxiYWNrXG4gICAgICAgIG9iamVjdC5vZmYoJ3N0dWZmJywgZG9TdHVmZik7XG4gICAgICAgIG9iamVjdC50cmlnZ2VyKCdzdHVmZicpOyAvLyBkb1N0dWZmIHdpbGwgTk9UIGJlIGNhbGxlZFxuICAgICAgICBgYGBcblxuICAgICAgICBJZiB5b3UgZG9uJ3QgcGFzcyBhIGBjYWxsYmFja2AgYXJndW1lbnQgdG8gYG9mZmAsIEFMTCBjYWxsYmFja3MgZm9yIHRoZVxuICAgICAgICBldmVudCB3aWxsIG5vdCBiZSBleGVjdXRlZCB3aGVuIHRoZSBldmVudCBmaXJlcy4gRm9yIGV4YW1wbGU6XG5cbiAgICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgICB2YXIgY2FsbGJhY2sxID0gZnVuY3Rpb24oKXt9O1xuICAgICAgICB2YXIgY2FsbGJhY2syID0gZnVuY3Rpb24oKXt9O1xuXG4gICAgICAgIG9iamVjdC5vbignc3R1ZmYnLCBjYWxsYmFjazEpO1xuICAgICAgICBvYmplY3Qub24oJ3N0dWZmJywgY2FsbGJhY2syKTtcblxuICAgICAgICBvYmplY3QudHJpZ2dlcignc3R1ZmYnKTsgLy8gY2FsbGJhY2sxIGFuZCBjYWxsYmFjazIgd2lsbCBiZSBleGVjdXRlZC5cblxuICAgICAgICBvYmplY3Qub2ZmKCdzdHVmZicpO1xuICAgICAgICBvYmplY3QudHJpZ2dlcignc3R1ZmYnKTsgLy8gY2FsbGJhY2sxIGFuZCBjYWxsYmFjazIgd2lsbCBub3QgYmUgZXhlY3V0ZWQhXG4gICAgICAgIGBgYFxuXG4gICAgICAgIEBtZXRob2Qgb2ZmXG4gICAgICAgIEBmb3IgUlNWUC5FdmVudFRhcmdldFxuICAgICAgICBAcHJpdmF0ZVxuICAgICAgICBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lIGV2ZW50IHRvIHN0b3AgbGlzdGVuaW5nIHRvXG4gICAgICAgIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIG9wdGlvbmFsIGFyZ3VtZW50LiBJZiBnaXZlbiwgb25seSB0aGUgZnVuY3Rpb25cbiAgICAgICAgZ2l2ZW4gd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlIGV2ZW50J3MgY2FsbGJhY2sgcXVldWUuIElmIG5vIGBjYWxsYmFja2BcbiAgICAgICAgYXJndW1lbnQgaXMgZ2l2ZW4sIGFsbCBjYWxsYmFja3Mgd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlIGV2ZW50J3MgY2FsbGJhY2tcbiAgICAgICAgcXVldWUuXG4gICAgICAqL1xuICAgICAgb2ZmOiBmdW5jdGlvbihldmVudE5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBhbGxDYWxsYmFja3MgPSAkJHJzdnAkZXZlbnRzJCRjYWxsYmFja3NGb3IodGhpcyksIGNhbGxiYWNrcywgaW5kZXg7XG5cbiAgICAgICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgICAgIGFsbENhbGxiYWNrc1tldmVudE5hbWVdID0gW107XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2tzID0gYWxsQ2FsbGJhY2tzW2V2ZW50TmFtZV07XG5cbiAgICAgICAgaW5kZXggPSAkJHJzdnAkZXZlbnRzJCRpbmRleE9mKGNhbGxiYWNrcywgY2FsbGJhY2spO1xuXG4gICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHsgY2FsbGJhY2tzLnNwbGljZShpbmRleCwgMSk7IH1cbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICBVc2UgYHRyaWdnZXJgIHRvIGZpcmUgY3VzdG9tIGV2ZW50cy4gRm9yIGV4YW1wbGU6XG5cbiAgICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgICBvYmplY3Qub24oJ2ZvbycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2ZvbyBldmVudCBoYXBwZW5lZCEnKTtcbiAgICAgICAgfSk7XG4gICAgICAgIG9iamVjdC50cmlnZ2VyKCdmb28nKTtcbiAgICAgICAgLy8gJ2ZvbyBldmVudCBoYXBwZW5lZCEnIGxvZ2dlZCB0byB0aGUgY29uc29sZVxuICAgICAgICBgYGBcblxuICAgICAgICBZb3UgY2FuIGFsc28gcGFzcyBhIHZhbHVlIGFzIGEgc2Vjb25kIGFyZ3VtZW50IHRvIGB0cmlnZ2VyYCB0aGF0IHdpbGwgYmVcbiAgICAgICAgcGFzc2VkIGFzIGFuIGFyZ3VtZW50IHRvIGFsbCBldmVudCBsaXN0ZW5lcnMgZm9yIHRoZSBldmVudDpcblxuICAgICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICAgIG9iamVjdC5vbignZm9vJywgZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICAgIGNvbnNvbGUubG9nKHZhbHVlLm5hbWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBvYmplY3QudHJpZ2dlcignZm9vJywgeyBuYW1lOiAnYmFyJyB9KTtcbiAgICAgICAgLy8gJ2JhcicgbG9nZ2VkIHRvIHRoZSBjb25zb2xlXG4gICAgICAgIGBgYFxuXG4gICAgICAgIEBtZXRob2QgdHJpZ2dlclxuICAgICAgICBAZm9yIFJTVlAuRXZlbnRUYXJnZXRcbiAgICAgICAgQHByaXZhdGVcbiAgICAgICAgQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZSBuYW1lIG9mIHRoZSBldmVudCB0byBiZSB0cmlnZ2VyZWRcbiAgICAgICAgQHBhcmFtIHtBbnl9IG9wdGlvbnMgb3B0aW9uYWwgdmFsdWUgdG8gYmUgcGFzc2VkIHRvIGFueSBldmVudCBoYW5kbGVycyBmb3JcbiAgICAgICAgdGhlIGdpdmVuIGBldmVudE5hbWVgXG4gICAgICAqL1xuICAgICAgdHJpZ2dlcjogZnVuY3Rpb24oZXZlbnROYW1lLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBhbGxDYWxsYmFja3MgPSAkJHJzdnAkZXZlbnRzJCRjYWxsYmFja3NGb3IodGhpcyksIGNhbGxiYWNrcywgY2FsbGJhY2s7XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrcyA9IGFsbENhbGxiYWNrc1tldmVudE5hbWVdKSB7XG4gICAgICAgICAgLy8gRG9uJ3QgY2FjaGUgdGhlIGNhbGxiYWNrcy5sZW5ndGggc2luY2UgaXQgbWF5IGdyb3dcbiAgICAgICAgICBmb3IgKHZhciBpPTA7IGk8Y2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrc1tpXTtcblxuICAgICAgICAgICAgY2FsbGJhY2sob3B0aW9ucyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciAkJHJzdnAkY29uZmlnJCRjb25maWcgPSB7XG4gICAgICBpbnN0cnVtZW50OiBmYWxzZVxuICAgIH07XG5cbiAgICAkJHJzdnAkZXZlbnRzJCRkZWZhdWx0Lm1peGluKCQkcnN2cCRjb25maWckJGNvbmZpZyk7XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkY29uZmlnJCRjb25maWd1cmUobmFtZSwgdmFsdWUpIHtcbiAgICAgIGlmIChuYW1lID09PSAnb25lcnJvcicpIHtcbiAgICAgICAgLy8gaGFuZGxlIGZvciBsZWdhY3kgdXNlcnMgdGhhdCBleHBlY3QgdGhlIGFjdHVhbFxuICAgICAgICAvLyBlcnJvciB0byBiZSBwYXNzZWQgdG8gdGhlaXIgZnVuY3Rpb24gYWRkZWQgdmlhXG4gICAgICAgIC8vIGBSU1ZQLmNvbmZpZ3VyZSgnb25lcnJvcicsIHNvbWVGdW5jdGlvbkhlcmUpO2BcbiAgICAgICAgJCRyc3ZwJGNvbmZpZyQkY29uZmlnLm9uKCdlcnJvcicsIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAkJHJzdnAkY29uZmlnJCRjb25maWdbbmFtZV0gPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAkJHJzdnAkY29uZmlnJCRjb25maWdbbmFtZV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCR1dGlscyQkb2JqZWN0T3JGdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHggPT09ICdmdW5jdGlvbicgfHwgKHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiB4ICE9PSBudWxsKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHV0aWxzJCRpc0Z1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHV0aWxzJCRpc01heWJlVGhlbmFibGUoeCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiB4ICE9PSBudWxsO1xuICAgIH1cblxuICAgIHZhciAkJHV0aWxzJCRfaXNBcnJheTtcblxuICAgIGlmICghQXJyYXkuaXNBcnJheSkge1xuICAgICAgJCR1dGlscyQkX2lzQXJyYXkgPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHgpID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgJCR1dGlscyQkX2lzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuICAgIH1cblxuICAgIHZhciAkJHV0aWxzJCRpc0FycmF5ID0gJCR1dGlscyQkX2lzQXJyYXk7XG4gICAgdmFyICQkdXRpbHMkJG5vdyA9IERhdGUubm93IHx8IGZ1bmN0aW9uKCkgeyByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7IH07XG4gICAgZnVuY3Rpb24gJCR1dGlscyQkRigpIHsgfVxuXG4gICAgdmFyICQkdXRpbHMkJG9fY3JlYXRlID0gKE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gKG8pIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlY29uZCBhcmd1bWVudCBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIG8gIT09ICdvYmplY3QnKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50IG11c3QgYmUgYW4gb2JqZWN0Jyk7XG4gICAgICB9XG4gICAgICAkJHV0aWxzJCRGLnByb3RvdHlwZSA9IG87XG4gICAgICByZXR1cm4gbmV3ICQkdXRpbHMkJEYoKTtcbiAgICB9KTtcblxuICAgIHZhciAkJGluc3RydW1lbnQkJHF1ZXVlID0gW107XG5cbiAgICB2YXIgJCRpbnN0cnVtZW50JCRkZWZhdWx0ID0gZnVuY3Rpb24gaW5zdHJ1bWVudChldmVudE5hbWUsIHByb21pc2UsIGNoaWxkKSB7XG4gICAgICBpZiAoMSA9PT0gJCRpbnN0cnVtZW50JCRxdWV1ZS5wdXNoKHtcbiAgICAgICAgICBuYW1lOiBldmVudE5hbWUsXG4gICAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgICAgZ3VpZDogcHJvbWlzZS5fZ3VpZEtleSArIHByb21pc2UuX2lkLFxuICAgICAgICAgICAgZXZlbnROYW1lOiBldmVudE5hbWUsXG4gICAgICAgICAgICBkZXRhaWw6IHByb21pc2UuX3Jlc3VsdCxcbiAgICAgICAgICAgIGNoaWxkR3VpZDogY2hpbGQgJiYgcHJvbWlzZS5fZ3VpZEtleSArIGNoaWxkLl9pZCxcbiAgICAgICAgICAgIGxhYmVsOiBwcm9taXNlLl9sYWJlbCxcbiAgICAgICAgICAgIHRpbWVTdGFtcDogJCR1dGlscyQkbm93KCksXG4gICAgICAgICAgICBzdGFjazogbmV3IEVycm9yKHByb21pc2UuX2xhYmVsKS5zdGFja1xuICAgICAgICAgIH19KSkge1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgZW50cnk7XG4gICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJCRpbnN0cnVtZW50JCRxdWV1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGVudHJ5ID0gJCRpbnN0cnVtZW50JCRxdWV1ZVtpXTtcbiAgICAgICAgICAgICAgICAkJHJzdnAkY29uZmlnJCRjb25maWcudHJpZ2dlcihlbnRyeS5uYW1lLCBlbnRyeS5wYXlsb2FkKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAkJGluc3RydW1lbnQkJHF1ZXVlLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICB9LCA1MCk7XG4gICAgICAgICAgfVxuICAgICAgfTtcblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRub29wKCkge31cbiAgICB2YXIgJCQkaW50ZXJuYWwkJFBFTkRJTkcgICA9IHZvaWQgMDtcbiAgICB2YXIgJCQkaW50ZXJuYWwkJEZVTEZJTExFRCA9IDE7XG4gICAgdmFyICQkJGludGVybmFsJCRSRUpFQ1RFRCAgPSAyO1xuICAgIHZhciAkJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IgPSBuZXcgJCQkaW50ZXJuYWwkJEVycm9yT2JqZWN0KCk7XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkZ2V0VGhlbihwcm9taXNlKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZS50aGVuO1xuICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICAkJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IuZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgcmV0dXJuICQkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkdHJ5VGhlbih0aGVuLCB2YWx1ZSwgZnVsZmlsbG1lbnRIYW5kbGVyLCByZWplY3Rpb25IYW5kbGVyKSB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGVuLmNhbGwodmFsdWUsIGZ1bGZpbGxtZW50SGFuZGxlciwgcmVqZWN0aW9uSGFuZGxlcik7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJGhhbmRsZUZvcmVpZ25UaGVuYWJsZShwcm9taXNlLCB0aGVuYWJsZSwgdGhlbikge1xuICAgICAgJCRyc3ZwJGNvbmZpZyQkY29uZmlnLmFzeW5jKGZ1bmN0aW9uKHByb21pc2UpIHtcbiAgICAgICAgdmFyIHNlYWxlZCA9IGZhbHNlO1xuICAgICAgICB2YXIgZXJyb3IgPSAkJCRpbnRlcm5hbCQkdHJ5VGhlbih0aGVuLCB0aGVuYWJsZSwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICBpZiAoc2VhbGVkKSB7IHJldHVybjsgfVxuICAgICAgICAgIHNlYWxlZCA9IHRydWU7XG4gICAgICAgICAgaWYgKHRoZW5hYmxlICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgJCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgICBpZiAoc2VhbGVkKSB7IHJldHVybjsgfVxuICAgICAgICAgIHNlYWxlZCA9IHRydWU7XG5cbiAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgICAgIH0sICdTZXR0bGU6ICcgKyAocHJvbWlzZS5fbGFiZWwgfHwgJyB1bmtub3duIHByb21pc2UnKSk7XG5cbiAgICAgICAgaWYgKCFzZWFsZWQgJiYgZXJyb3IpIHtcbiAgICAgICAgICBzZWFsZWQgPSB0cnVlO1xuICAgICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9LCBwcm9taXNlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkaGFuZGxlT3duVGhlbmFibGUocHJvbWlzZSwgdGhlbmFibGUpIHtcbiAgICAgIGlmICh0aGVuYWJsZS5fc3RhdGUgPT09ICQkJGludGVybmFsJCRGVUxGSUxMRUQpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdGhlbmFibGUuX3Jlc3VsdCk7XG4gICAgICB9IGVsc2UgaWYgKHByb21pc2UuX3N0YXRlID09PSAkJCRpbnRlcm5hbCQkUkVKRUNURUQpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCB0aGVuYWJsZS5fcmVzdWx0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQkJGludGVybmFsJCRzdWJzY3JpYmUodGhlbmFibGUsIHVuZGVmaW5lZCwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICBpZiAodGhlbmFibGUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJGhhbmRsZU1heWJlVGhlbmFibGUocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSkge1xuICAgICAgaWYgKG1heWJlVGhlbmFibGUuY29uc3RydWN0b3IgPT09IHByb21pc2UuY29uc3RydWN0b3IpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJGhhbmRsZU93blRoZW5hYmxlKHByb21pc2UsIG1heWJlVGhlbmFibGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHRoZW4gPSAkJCRpbnRlcm5hbCQkZ2V0VGhlbihtYXliZVRoZW5hYmxlKTtcblxuICAgICAgICBpZiAodGhlbiA9PT0gJCQkaW50ZXJuYWwkJEdFVF9USEVOX0VSUk9SKSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCAkJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IuZXJyb3IpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoZW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICQkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIG1heWJlVGhlbmFibGUpO1xuICAgICAgICB9IGVsc2UgaWYgKCQkdXRpbHMkJGlzRnVuY3Rpb24odGhlbikpIHtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkaGFuZGxlRm9yZWlnblRoZW5hYmxlKHByb21pc2UsIG1heWJlVGhlbmFibGUsIHRoZW4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICQkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIG1heWJlVGhlbmFibGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpIHtcbiAgICAgIGlmIChwcm9taXNlID09PSB2YWx1ZSkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKCQkdXRpbHMkJG9iamVjdE9yRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICAgICQkJGludGVybmFsJCRoYW5kbGVNYXliZVRoZW5hYmxlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkcHVibGlzaFJlamVjdGlvbihwcm9taXNlKSB7XG4gICAgICBpZiAocHJvbWlzZS5fb25lcnJvcikge1xuICAgICAgICBwcm9taXNlLl9vbmVycm9yKHByb21pc2UuX3Jlc3VsdCk7XG4gICAgICB9XG5cbiAgICAgICQkJGludGVybmFsJCRwdWJsaXNoKHByb21pc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKSB7XG4gICAgICBpZiAocHJvbWlzZS5fc3RhdGUgIT09ICQkJGludGVybmFsJCRQRU5ESU5HKSB7IHJldHVybjsgfVxuXG4gICAgICBwcm9taXNlLl9yZXN1bHQgPSB2YWx1ZTtcbiAgICAgIHByb21pc2UuX3N0YXRlID0gJCQkaW50ZXJuYWwkJEZVTEZJTExFRDtcblxuICAgICAgaWYgKHByb21pc2UuX3N1YnNjcmliZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBpZiAoJCRyc3ZwJGNvbmZpZyQkY29uZmlnLmluc3RydW1lbnQpIHtcbiAgICAgICAgICAkJGluc3RydW1lbnQkJGRlZmF1bHQoJ2Z1bGZpbGxlZCcsIHByb21pc2UpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkJHJzdnAkY29uZmlnJCRjb25maWcuYXN5bmMoJCQkaW50ZXJuYWwkJHB1Ymxpc2gsIHByb21pc2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKSB7XG4gICAgICBpZiAocHJvbWlzZS5fc3RhdGUgIT09ICQkJGludGVybmFsJCRQRU5ESU5HKSB7IHJldHVybjsgfVxuICAgICAgcHJvbWlzZS5fc3RhdGUgPSAkJCRpbnRlcm5hbCQkUkVKRUNURUQ7XG4gICAgICBwcm9taXNlLl9yZXN1bHQgPSByZWFzb247XG5cbiAgICAgICQkcnN2cCRjb25maWckJGNvbmZpZy5hc3luYygkJCRpbnRlcm5hbCQkcHVibGlzaFJlamVjdGlvbiwgcHJvbWlzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJHN1YnNjcmliZShwYXJlbnQsIGNoaWxkLCBvbkZ1bGZpbGxtZW50LCBvblJlamVjdGlvbikge1xuICAgICAgdmFyIHN1YnNjcmliZXJzID0gcGFyZW50Ll9zdWJzY3JpYmVycztcbiAgICAgIHZhciBsZW5ndGggPSBzdWJzY3JpYmVycy5sZW5ndGg7XG5cbiAgICAgIHBhcmVudC5fb25lcnJvciA9IG51bGw7XG5cbiAgICAgIHN1YnNjcmliZXJzW2xlbmd0aF0gPSBjaGlsZDtcbiAgICAgIHN1YnNjcmliZXJzW2xlbmd0aCArICQkJGludGVybmFsJCRGVUxGSUxMRURdID0gb25GdWxmaWxsbWVudDtcbiAgICAgIHN1YnNjcmliZXJzW2xlbmd0aCArICQkJGludGVybmFsJCRSRUpFQ1RFRF0gID0gb25SZWplY3Rpb247XG5cbiAgICAgIGlmIChsZW5ndGggPT09IDAgJiYgcGFyZW50Ll9zdGF0ZSkge1xuICAgICAgICAkJHJzdnAkY29uZmlnJCRjb25maWcuYXN5bmMoJCQkaW50ZXJuYWwkJHB1Ymxpc2gsIHBhcmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJHB1Ymxpc2gocHJvbWlzZSkge1xuICAgICAgdmFyIHN1YnNjcmliZXJzID0gcHJvbWlzZS5fc3Vic2NyaWJlcnM7XG4gICAgICB2YXIgc2V0dGxlZCA9IHByb21pc2UuX3N0YXRlO1xuXG4gICAgICBpZiAoJCRyc3ZwJGNvbmZpZyQkY29uZmlnLmluc3RydW1lbnQpIHtcbiAgICAgICAgJCRpbnN0cnVtZW50JCRkZWZhdWx0KHNldHRsZWQgPT09ICQkJGludGVybmFsJCRGVUxGSUxMRUQgPyAnZnVsZmlsbGVkJyA6ICdyZWplY3RlZCcsIHByb21pc2UpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3Vic2NyaWJlcnMubGVuZ3RoID09PSAwKSB7IHJldHVybjsgfVxuXG4gICAgICB2YXIgY2hpbGQsIGNhbGxiYWNrLCBkZXRhaWwgPSBwcm9taXNlLl9yZXN1bHQ7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3Vic2NyaWJlcnMubGVuZ3RoOyBpICs9IDMpIHtcbiAgICAgICAgY2hpbGQgPSBzdWJzY3JpYmVyc1tpXTtcbiAgICAgICAgY2FsbGJhY2sgPSBzdWJzY3JpYmVyc1tpICsgc2V0dGxlZF07XG5cbiAgICAgICAgaWYgKGNoaWxkKSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJGludm9rZUNhbGxiYWNrKHNldHRsZWQsIGNoaWxkLCBjYWxsYmFjaywgZGV0YWlsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjYWxsYmFjayhkZXRhaWwpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHByb21pc2UuX3N1YnNjcmliZXJzLmxlbmd0aCA9IDA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJEVycm9yT2JqZWN0KCkge1xuICAgICAgdGhpcy5lcnJvciA9IG51bGw7XG4gICAgfVxuXG4gICAgdmFyICQkJGludGVybmFsJCRUUllfQ0FUQ0hfRVJST1IgPSBuZXcgJCQkaW50ZXJuYWwkJEVycm9yT2JqZWN0KCk7XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkdHJ5Q2F0Y2goY2FsbGJhY2ssIGRldGFpbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGRldGFpbCk7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJFRSWV9DQVRDSF9FUlJPUi5lcnJvciA9IGU7XG4gICAgICAgIHJldHVybiAkJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBwcm9taXNlLCBjYWxsYmFjaywgZGV0YWlsKSB7XG4gICAgICB2YXIgaGFzQ2FsbGJhY2sgPSAkJHV0aWxzJCRpc0Z1bmN0aW9uKGNhbGxiYWNrKSxcbiAgICAgICAgICB2YWx1ZSwgZXJyb3IsIHN1Y2NlZWRlZCwgZmFpbGVkO1xuXG4gICAgICBpZiAoaGFzQ2FsbGJhY2spIHtcbiAgICAgICAgdmFsdWUgPSAkJCRpbnRlcm5hbCQkdHJ5Q2F0Y2goY2FsbGJhY2ssIGRldGFpbCk7XG5cbiAgICAgICAgaWYgKHZhbHVlID09PSAkJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SKSB7XG4gICAgICAgICAgZmFpbGVkID0gdHJ1ZTtcbiAgICAgICAgICBlcnJvciA9IHZhbHVlLmVycm9yO1xuICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdWNjZWVkZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb21pc2UgPT09IHZhbHVlKSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBuZXcgVHlwZUVycm9yKCdBIHByb21pc2VzIGNhbGxiYWNrIGNhbm5vdCByZXR1cm4gdGhhdCBzYW1lIHByb21pc2UuJykpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IGRldGFpbDtcbiAgICAgICAgc3VjY2VlZGVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHByb21pc2UuX3N0YXRlICE9PSAkJCRpbnRlcm5hbCQkUEVORElORykge1xuICAgICAgICAvLyBub29wXG4gICAgICB9IGVsc2UgaWYgKGhhc0NhbGxiYWNrICYmIHN1Y2NlZWRlZCkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGZhaWxlZCkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgICAgIH0gZWxzZSBpZiAoc2V0dGxlZCA9PT0gJCQkaW50ZXJuYWwkJEZVTEZJTExFRCkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKHNldHRsZWQgPT09ICQkJGludGVybmFsJCRSRUpFQ1RFRCkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkaW5pdGlhbGl6ZVByb21pc2UocHJvbWlzZSwgcmVzb2x2ZXIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlc29sdmVyKGZ1bmN0aW9uIHJlc29sdmVQcm9taXNlKHZhbHVlKXtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIHJlamVjdFByb21pc2UocmVhc29uKSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkZW51bWVyYXRvciQkbWFrZVNldHRsZWRSZXN1bHQoc3RhdGUsIHBvc2l0aW9uLCB2YWx1ZSkge1xuICAgICAgaWYgKHN0YXRlID09PSAkJCRpbnRlcm5hbCQkRlVMRklMTEVEKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3RhdGU6ICdmdWxmaWxsZWQnLFxuICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdGF0ZTogJ3JlamVjdGVkJyxcbiAgICAgICAgICByZWFzb246IHZhbHVlXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yKENvbnN0cnVjdG9yLCBpbnB1dCwgYWJvcnRPblJlamVjdCwgbGFiZWwpIHtcbiAgICAgIHRoaXMuX2luc3RhbmNlQ29uc3RydWN0b3IgPSBDb25zdHJ1Y3RvcjtcbiAgICAgIHRoaXMucHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcigkJCRpbnRlcm5hbCQkbm9vcCwgbGFiZWwpO1xuICAgICAgdGhpcy5fYWJvcnRPblJlamVjdCA9IGFib3J0T25SZWplY3Q7XG5cbiAgICAgIGlmICh0aGlzLl92YWxpZGF0ZUlucHV0KGlucHV0KSkge1xuICAgICAgICB0aGlzLl9pbnB1dCAgICAgPSBpbnB1dDtcbiAgICAgICAgdGhpcy5sZW5ndGggICAgID0gaW5wdXQubGVuZ3RoO1xuICAgICAgICB0aGlzLl9yZW1haW5pbmcgPSBpbnB1dC5sZW5ndGg7XG5cbiAgICAgICAgdGhpcy5faW5pdCgpO1xuXG4gICAgICAgIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICQkJGludGVybmFsJCRmdWxmaWxsKHRoaXMucHJvbWlzZSwgdGhpcy5fcmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmxlbmd0aCA9IHRoaXMubGVuZ3RoIHx8IDA7XG4gICAgICAgICAgdGhpcy5fZW51bWVyYXRlKCk7XG4gICAgICAgICAgaWYgKHRoaXMuX3JlbWFpbmluZyA9PT0gMCkge1xuICAgICAgICAgICAgJCQkaW50ZXJuYWwkJGZ1bGZpbGwodGhpcy5wcm9taXNlLCB0aGlzLl9yZXN1bHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdCh0aGlzLnByb21pc2UsIHRoaXMuX3ZhbGlkYXRpb25FcnJvcigpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAkJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl92YWxpZGF0ZUlucHV0ID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgIHJldHVybiAkJHV0aWxzJCRpc0FycmF5KGlucHV0KTtcbiAgICB9O1xuXG4gICAgJCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fdmFsaWRhdGlvbkVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IEVycm9yKCdBcnJheSBNZXRob2RzIG11c3QgYmUgcHJvdmlkZWQgYW4gQXJyYXknKTtcbiAgICB9O1xuXG4gICAgJCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fcmVzdWx0ID0gbmV3IEFycmF5KHRoaXMubGVuZ3RoKTtcbiAgICB9O1xuXG4gICAgdmFyICQkZW51bWVyYXRvciQkZGVmYXVsdCA9ICQkZW51bWVyYXRvciQkRW51bWVyYXRvcjtcblxuICAgICQkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX2VudW1lcmF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGxlbmd0aCAgPSB0aGlzLmxlbmd0aDtcbiAgICAgIHZhciBwcm9taXNlID0gdGhpcy5wcm9taXNlO1xuICAgICAgdmFyIGlucHV0ICAgPSB0aGlzLl9pbnB1dDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IHByb21pc2UuX3N0YXRlID09PSAkJCRpbnRlcm5hbCQkUEVORElORyAmJiBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5fZWFjaEVudHJ5KGlucHV0W2ldLCBpKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgJCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fZWFjaEVudHJ5ID0gZnVuY3Rpb24oZW50cnksIGkpIHtcbiAgICAgIHZhciBjID0gdGhpcy5faW5zdGFuY2VDb25zdHJ1Y3RvcjtcbiAgICAgIGlmICgkJHV0aWxzJCRpc01heWJlVGhlbmFibGUoZW50cnkpKSB7XG4gICAgICAgIGlmIChlbnRyeS5jb25zdHJ1Y3RvciA9PT0gYyAmJiBlbnRyeS5fc3RhdGUgIT09ICQkJGludGVybmFsJCRQRU5ESU5HKSB7XG4gICAgICAgICAgZW50cnkuX29uZXJyb3IgPSBudWxsO1xuICAgICAgICAgIHRoaXMuX3NldHRsZWRBdChlbnRyeS5fc3RhdGUsIGksIGVudHJ5Ll9yZXN1bHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3dpbGxTZXR0bGVBdChjLnJlc29sdmUoZW50cnkpLCBpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcmVtYWluaW5nLS07XG4gICAgICAgIHRoaXMuX3Jlc3VsdFtpXSA9IHRoaXMuX21ha2VSZXN1bHQoJCQkaW50ZXJuYWwkJEZVTEZJTExFRCwgaSwgZW50cnkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAkJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl9zZXR0bGVkQXQgPSBmdW5jdGlvbihzdGF0ZSwgaSwgdmFsdWUpIHtcbiAgICAgIHZhciBwcm9taXNlID0gdGhpcy5wcm9taXNlO1xuXG4gICAgICBpZiAocHJvbWlzZS5fc3RhdGUgPT09ICQkJGludGVybmFsJCRQRU5ESU5HKSB7XG4gICAgICAgIHRoaXMuX3JlbWFpbmluZy0tO1xuXG4gICAgICAgIGlmICh0aGlzLl9hYm9ydE9uUmVqZWN0ICYmIHN0YXRlID09PSAkJCRpbnRlcm5hbCQkUkVKRUNURUQpIHtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9yZXN1bHRbaV0gPSB0aGlzLl9tYWtlUmVzdWx0KHN0YXRlLCBpLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX3JlbWFpbmluZyA9PT0gMCkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB0aGlzLl9yZXN1bHQpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAkJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl9tYWtlUmVzdWx0ID0gZnVuY3Rpb24oc3RhdGUsIGksIHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcblxuICAgICQkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX3dpbGxTZXR0bGVBdCA9IGZ1bmN0aW9uKHByb21pc2UsIGkpIHtcbiAgICAgIHZhciBlbnVtZXJhdG9yID0gdGhpcztcblxuICAgICAgJCQkaW50ZXJuYWwkJHN1YnNjcmliZShwcm9taXNlLCB1bmRlZmluZWQsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGVudW1lcmF0b3IuX3NldHRsZWRBdCgkJCRpbnRlcm5hbCQkRlVMRklMTEVELCBpLCB2YWx1ZSk7XG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgZW51bWVyYXRvci5fc2V0dGxlZEF0KCQkJGludGVybmFsJCRSRUpFQ1RFRCwgaSwgcmVhc29uKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgJCRwcm9taXNlJGFsbCQkZGVmYXVsdCA9IGZ1bmN0aW9uIGFsbChlbnRyaWVzLCBsYWJlbCkge1xuICAgICAgcmV0dXJuIG5ldyAkJGVudW1lcmF0b3IkJGRlZmF1bHQodGhpcywgZW50cmllcywgdHJ1ZSAvKiBhYm9ydCBvbiByZWplY3QgKi8sIGxhYmVsKS5wcm9taXNlO1xuICAgIH07XG5cbiAgICB2YXIgJCRwcm9taXNlJHJhY2UkJGRlZmF1bHQgPSBmdW5jdGlvbiByYWNlKGVudHJpZXMsIGxhYmVsKSB7XG4gICAgICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICAgICAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcblxuICAgICAgdmFyIHByb21pc2UgPSBuZXcgQ29uc3RydWN0b3IoJCQkaW50ZXJuYWwkJG5vb3AsIGxhYmVsKTtcblxuICAgICAgaWYgKCEkJHV0aWxzJCRpc0FycmF5KGVudHJpZXMpKSB7XG4gICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgbmV3IFR5cGVFcnJvcignWW91IG11c3QgcGFzcyBhbiBhcnJheSB0byByYWNlLicpKTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICB9XG5cbiAgICAgIHZhciBsZW5ndGggPSBlbnRyaWVzLmxlbmd0aDtcblxuICAgICAgZnVuY3Rpb24gb25GdWxmaWxsbWVudCh2YWx1ZSkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0aW9uKHJlYXNvbikge1xuICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBwcm9taXNlLl9zdGF0ZSA9PT0gJCQkaW50ZXJuYWwkJFBFTkRJTkcgJiYgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICQkJGludGVybmFsJCRzdWJzY3JpYmUoQ29uc3RydWN0b3IucmVzb2x2ZShlbnRyaWVzW2ldKSwgdW5kZWZpbmVkLCBvbkZ1bGZpbGxtZW50LCBvblJlamVjdGlvbik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH07XG5cbiAgICB2YXIgJCRwcm9taXNlJHJlc29sdmUkJGRlZmF1bHQgPSBmdW5jdGlvbiByZXNvbHZlKG9iamVjdCwgbGFiZWwpIHtcbiAgICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gICAgICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuXG4gICAgICBpZiAob2JqZWN0ICYmIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnICYmIG9iamVjdC5jb25zdHJ1Y3RvciA9PT0gQ29uc3RydWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICAgIH1cblxuICAgICAgdmFyIHByb21pc2UgPSBuZXcgQ29uc3RydWN0b3IoJCQkaW50ZXJuYWwkJG5vb3AsIGxhYmVsKTtcbiAgICAgICQkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIG9iamVjdCk7XG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9O1xuXG4gICAgdmFyICQkcHJvbWlzZSRyZWplY3QkJGRlZmF1bHQgPSBmdW5jdGlvbiByZWplY3QocmVhc29uLCBsYWJlbCkge1xuICAgICAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgICAgIHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG4gICAgICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcigkJCRpbnRlcm5hbCQkbm9vcCwgbGFiZWwpO1xuICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfTtcblxuICAgIHZhciAkJHJzdnAkcHJvbWlzZSQkZ3VpZEtleSA9ICdyc3ZwXycgKyAkJHV0aWxzJCRub3coKSArICctJztcbiAgICB2YXIgJCRyc3ZwJHByb21pc2UkJGNvdW50ZXIgPSAwO1xuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJHByb21pc2UkJG5lZWRzUmVzb2x2ZXIoKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdZb3UgbXVzdCBwYXNzIGEgcmVzb2x2ZXIgZnVuY3Rpb24gYXMgdGhlIGZpcnN0IGFyZ3VtZW50IHRvIHRoZSBwcm9taXNlIGNvbnN0cnVjdG9yJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJHByb21pc2UkJG5lZWRzTmV3KCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkZhaWxlZCB0byBjb25zdHJ1Y3QgJ1Byb21pc2UnOiBQbGVhc2UgdXNlIHRoZSAnbmV3JyBvcGVyYXRvciwgdGhpcyBvYmplY3QgY29uc3RydWN0b3IgY2Fubm90IGJlIGNhbGxlZCBhcyBhIGZ1bmN0aW9uLlwiKTtcbiAgICB9XG5cbiAgICB2YXIgJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQgPSAkJHJzdnAkcHJvbWlzZSQkUHJvbWlzZTtcblxuICAgIC8qKlxuICAgICAgUHJvbWlzZSBvYmplY3RzIHJlcHJlc2VudCB0aGUgZXZlbnR1YWwgcmVzdWx0IG9mIGFuIGFzeW5jaHJvbm91cyBvcGVyYXRpb24uIFRoZVxuICAgICAgcHJpbWFyeSB3YXkgb2YgaW50ZXJhY3Rpbmcgd2l0aCBhIHByb21pc2UgaXMgdGhyb3VnaCBpdHMgYHRoZW5gIG1ldGhvZCwgd2hpY2hcbiAgICAgIHJlZ2lzdGVycyBjYWxsYmFja3MgdG8gcmVjZWl2ZSBlaXRoZXIgYSBwcm9taXNl4oCZcyBldmVudHVhbCB2YWx1ZSBvciB0aGUgcmVhc29uXG4gICAgICB3aHkgdGhlIHByb21pc2UgY2Fubm90IGJlIGZ1bGZpbGxlZC5cblxuICAgICAgVGVybWlub2xvZ3lcbiAgICAgIC0tLS0tLS0tLS0tXG5cbiAgICAgIC0gYHByb21pc2VgIGlzIGFuIG9iamVjdCBvciBmdW5jdGlvbiB3aXRoIGEgYHRoZW5gIG1ldGhvZCB3aG9zZSBiZWhhdmlvciBjb25mb3JtcyB0byB0aGlzIHNwZWNpZmljYXRpb24uXG4gICAgICAtIGB0aGVuYWJsZWAgaXMgYW4gb2JqZWN0IG9yIGZ1bmN0aW9uIHRoYXQgZGVmaW5lcyBhIGB0aGVuYCBtZXRob2QuXG4gICAgICAtIGB2YWx1ZWAgaXMgYW55IGxlZ2FsIEphdmFTY3JpcHQgdmFsdWUgKGluY2x1ZGluZyB1bmRlZmluZWQsIGEgdGhlbmFibGUsIG9yIGEgcHJvbWlzZSkuXG4gICAgICAtIGBleGNlcHRpb25gIGlzIGEgdmFsdWUgdGhhdCBpcyB0aHJvd24gdXNpbmcgdGhlIHRocm93IHN0YXRlbWVudC5cbiAgICAgIC0gYHJlYXNvbmAgaXMgYSB2YWx1ZSB0aGF0IGluZGljYXRlcyB3aHkgYSBwcm9taXNlIHdhcyByZWplY3RlZC5cbiAgICAgIC0gYHNldHRsZWRgIHRoZSBmaW5hbCByZXN0aW5nIHN0YXRlIG9mIGEgcHJvbWlzZSwgZnVsZmlsbGVkIG9yIHJlamVjdGVkLlxuXG4gICAgICBBIHByb21pc2UgY2FuIGJlIGluIG9uZSBvZiB0aHJlZSBzdGF0ZXM6IHBlbmRpbmcsIGZ1bGZpbGxlZCwgb3IgcmVqZWN0ZWQuXG5cbiAgICAgIFByb21pc2VzIHRoYXQgYXJlIGZ1bGZpbGxlZCBoYXZlIGEgZnVsZmlsbG1lbnQgdmFsdWUgYW5kIGFyZSBpbiB0aGUgZnVsZmlsbGVkXG4gICAgICBzdGF0ZS4gIFByb21pc2VzIHRoYXQgYXJlIHJlamVjdGVkIGhhdmUgYSByZWplY3Rpb24gcmVhc29uIGFuZCBhcmUgaW4gdGhlXG4gICAgICByZWplY3RlZCBzdGF0ZS4gIEEgZnVsZmlsbG1lbnQgdmFsdWUgaXMgbmV2ZXIgYSB0aGVuYWJsZS5cblxuICAgICAgUHJvbWlzZXMgY2FuIGFsc28gYmUgc2FpZCB0byAqcmVzb2x2ZSogYSB2YWx1ZS4gIElmIHRoaXMgdmFsdWUgaXMgYWxzbyBhXG4gICAgICBwcm9taXNlLCB0aGVuIHRoZSBvcmlnaW5hbCBwcm9taXNlJ3Mgc2V0dGxlZCBzdGF0ZSB3aWxsIG1hdGNoIHRoZSB2YWx1ZSdzXG4gICAgICBzZXR0bGVkIHN0YXRlLiAgU28gYSBwcm9taXNlIHRoYXQgKnJlc29sdmVzKiBhIHByb21pc2UgdGhhdCByZWplY3RzIHdpbGxcbiAgICAgIGl0c2VsZiByZWplY3QsIGFuZCBhIHByb21pc2UgdGhhdCAqcmVzb2x2ZXMqIGEgcHJvbWlzZSB0aGF0IGZ1bGZpbGxzIHdpbGxcbiAgICAgIGl0c2VsZiBmdWxmaWxsLlxuXG5cbiAgICAgIEJhc2ljIFVzYWdlOlxuICAgICAgLS0tLS0tLS0tLS0tXG5cbiAgICAgIGBgYGpzXG4gICAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAvLyBvbiBzdWNjZXNzXG4gICAgICAgIHJlc29sdmUodmFsdWUpO1xuXG4gICAgICAgIC8vIG9uIGZhaWx1cmVcbiAgICAgICAgcmVqZWN0KHJlYXNvbik7XG4gICAgICB9KTtcblxuICAgICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIC8vIG9uIGZ1bGZpbGxtZW50XG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgLy8gb24gcmVqZWN0aW9uXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBBZHZhbmNlZCBVc2FnZTpcbiAgICAgIC0tLS0tLS0tLS0tLS0tLVxuXG4gICAgICBQcm9taXNlcyBzaGluZSB3aGVuIGFic3RyYWN0aW5nIGF3YXkgYXN5bmNocm9ub3VzIGludGVyYWN0aW9ucyBzdWNoIGFzXG4gICAgICBgWE1MSHR0cFJlcXVlc3Rgcy5cblxuICAgICAgYGBganNcbiAgICAgIGZ1bmN0aW9uIGdldEpTT04odXJsKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgICAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgICAgIHhoci5vcGVuKCdHRVQnLCB1cmwpO1xuICAgICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBoYW5kbGVyO1xuICAgICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnanNvbic7XG4gICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgeGhyLnNlbmQoKTtcblxuICAgICAgICAgIGZ1bmN0aW9uIGhhbmRsZXIoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09PSB0aGlzLkRPTkUpIHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHRoaXMucmVzcG9uc2UpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ2dldEpTT046IGAnICsgdXJsICsgJ2AgZmFpbGVkIHdpdGggc3RhdHVzOiBbJyArIHRoaXMuc3RhdHVzICsgJ10nKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZ2V0SlNPTignL3Bvc3RzLmpzb24nKS50aGVuKGZ1bmN0aW9uKGpzb24pIHtcbiAgICAgICAgLy8gb24gZnVsZmlsbG1lbnRcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICAvLyBvbiByZWplY3Rpb25cbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIFVubGlrZSBjYWxsYmFja3MsIHByb21pc2VzIGFyZSBncmVhdCBjb21wb3NhYmxlIHByaW1pdGl2ZXMuXG5cbiAgICAgIGBgYGpzXG4gICAgICBQcm9taXNlLmFsbChbXG4gICAgICAgIGdldEpTT04oJy9wb3N0cycpLFxuICAgICAgICBnZXRKU09OKCcvY29tbWVudHMnKVxuICAgICAgXSkudGhlbihmdW5jdGlvbih2YWx1ZXMpe1xuICAgICAgICB2YWx1ZXNbMF0gLy8gPT4gcG9zdHNKU09OXG4gICAgICAgIHZhbHVlc1sxXSAvLyA9PiBjb21tZW50c0pTT05cblxuICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQGNsYXNzIFJTVlAuUHJvbWlzZVxuICAgICAgQHBhcmFtIHtmdW5jdGlvbn0gcmVzb2x2ZXJcbiAgICAgIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCBvcHRpb25hbCBzdHJpbmcgZm9yIGxhYmVsaW5nIHRoZSBwcm9taXNlLlxuICAgICAgVXNlZnVsIGZvciB0b29saW5nLlxuICAgICAgQGNvbnN0cnVjdG9yXG4gICAgKi9cbiAgICBmdW5jdGlvbiAkJHJzdnAkcHJvbWlzZSQkUHJvbWlzZShyZXNvbHZlciwgbGFiZWwpIHtcbiAgICAgIHRoaXMuX2lkID0gJCRyc3ZwJHByb21pc2UkJGNvdW50ZXIrKztcbiAgICAgIHRoaXMuX2xhYmVsID0gbGFiZWw7XG4gICAgICB0aGlzLl9zdGF0ZSA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuX3Jlc3VsdCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuX3N1YnNjcmliZXJzID0gW107XG5cbiAgICAgIGlmICgkJHJzdnAkY29uZmlnJCRjb25maWcuaW5zdHJ1bWVudCkge1xuICAgICAgICAkJGluc3RydW1lbnQkJGRlZmF1bHQoJ2NyZWF0ZWQnLCB0aGlzKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCQkJGludGVybmFsJCRub29wICE9PSByZXNvbHZlcikge1xuICAgICAgICBpZiAoISQkdXRpbHMkJGlzRnVuY3Rpb24ocmVzb2x2ZXIpKSB7XG4gICAgICAgICAgJCRyc3ZwJHByb21pc2UkJG5lZWRzUmVzb2x2ZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiAkJHJzdnAkcHJvbWlzZSQkUHJvbWlzZSkpIHtcbiAgICAgICAgICAkJHJzdnAkcHJvbWlzZSQkbmVlZHNOZXcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQkJGludGVybmFsJCRpbml0aWFsaXplUHJvbWlzZSh0aGlzLCByZXNvbHZlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gZGVwcmVjYXRlZFxuICAgICQkcnN2cCRwcm9taXNlJCRQcm9taXNlLmNhc3QgPSAkJHByb21pc2UkcmVzb2x2ZSQkZGVmYXVsdDtcblxuICAgICQkcnN2cCRwcm9taXNlJCRQcm9taXNlLmFsbCA9ICQkcHJvbWlzZSRhbGwkJGRlZmF1bHQ7XG4gICAgJCRyc3ZwJHByb21pc2UkJFByb21pc2UucmFjZSA9ICQkcHJvbWlzZSRyYWNlJCRkZWZhdWx0O1xuICAgICQkcnN2cCRwcm9taXNlJCRQcm9taXNlLnJlc29sdmUgPSAkJHByb21pc2UkcmVzb2x2ZSQkZGVmYXVsdDtcbiAgICAkJHJzdnAkcHJvbWlzZSQkUHJvbWlzZS5yZWplY3QgPSAkJHByb21pc2UkcmVqZWN0JCRkZWZhdWx0O1xuXG4gICAgJCRyc3ZwJHByb21pc2UkJFByb21pc2UucHJvdG90eXBlID0ge1xuICAgICAgY29uc3RydWN0b3I6ICQkcnN2cCRwcm9taXNlJCRQcm9taXNlLFxuXG4gICAgICBfZ3VpZEtleTogJCRyc3ZwJHByb21pc2UkJGd1aWRLZXksXG5cbiAgICAgIF9vbmVycm9yOiBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgICQkcnN2cCRjb25maWckJGNvbmZpZy50cmlnZ2VyKCdlcnJvcicsIHJlYXNvbik7XG4gICAgICB9LFxuXG4gICAgLyoqXG4gICAgICBUaGUgcHJpbWFyeSB3YXkgb2YgaW50ZXJhY3Rpbmcgd2l0aCBhIHByb21pc2UgaXMgdGhyb3VnaCBpdHMgYHRoZW5gIG1ldGhvZCxcbiAgICAgIHdoaWNoIHJlZ2lzdGVycyBjYWxsYmFja3MgdG8gcmVjZWl2ZSBlaXRoZXIgYSBwcm9taXNlJ3MgZXZlbnR1YWwgdmFsdWUgb3IgdGhlXG4gICAgICByZWFzb24gd2h5IHRoZSBwcm9taXNlIGNhbm5vdCBiZSBmdWxmaWxsZWQuXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24odXNlcil7XG4gICAgICAgIC8vIHVzZXIgaXMgYXZhaWxhYmxlXG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICAvLyB1c2VyIGlzIHVuYXZhaWxhYmxlLCBhbmQgeW91IGFyZSBnaXZlbiB0aGUgcmVhc29uIHdoeVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQ2hhaW5pbmdcbiAgICAgIC0tLS0tLS0tXG5cbiAgICAgIFRoZSByZXR1cm4gdmFsdWUgb2YgYHRoZW5gIGlzIGl0c2VsZiBhIHByb21pc2UuICBUaGlzIHNlY29uZCwgJ2Rvd25zdHJlYW0nXG4gICAgICBwcm9taXNlIGlzIHJlc29sdmVkIHdpdGggdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZmlyc3QgcHJvbWlzZSdzIGZ1bGZpbGxtZW50XG4gICAgICBvciByZWplY3Rpb24gaGFuZGxlciwgb3IgcmVqZWN0ZWQgaWYgdGhlIGhhbmRsZXIgdGhyb3dzIGFuIGV4Y2VwdGlvbi5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICByZXR1cm4gdXNlci5uYW1lO1xuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICByZXR1cm4gJ2RlZmF1bHQgbmFtZSc7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uICh1c2VyTmFtZSkge1xuICAgICAgICAvLyBJZiBgZmluZFVzZXJgIGZ1bGZpbGxlZCwgYHVzZXJOYW1lYCB3aWxsIGJlIHRoZSB1c2VyJ3MgbmFtZSwgb3RoZXJ3aXNlIGl0XG4gICAgICAgIC8vIHdpbGwgYmUgYCdkZWZhdWx0IG5hbWUnYFxuICAgICAgfSk7XG5cbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZvdW5kIHVzZXIsIGJ1dCBzdGlsbCB1bmhhcHB5Jyk7XG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYGZpbmRVc2VyYCByZWplY3RlZCBhbmQgd2UncmUgdW5oYXBweScpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgLy8gbmV2ZXIgcmVhY2hlZFxuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAvLyBpZiBgZmluZFVzZXJgIGZ1bGZpbGxlZCwgYHJlYXNvbmAgd2lsbCBiZSAnRm91bmQgdXNlciwgYnV0IHN0aWxsIHVuaGFwcHknLlxuICAgICAgICAvLyBJZiBgZmluZFVzZXJgIHJlamVjdGVkLCBgcmVhc29uYCB3aWxsIGJlICdgZmluZFVzZXJgIHJlamVjdGVkIGFuZCB3ZSdyZSB1bmhhcHB5Jy5cbiAgICAgIH0pO1xuICAgICAgYGBgXG4gICAgICBJZiB0aGUgZG93bnN0cmVhbSBwcm9taXNlIGRvZXMgbm90IHNwZWNpZnkgYSByZWplY3Rpb24gaGFuZGxlciwgcmVqZWN0aW9uIHJlYXNvbnMgd2lsbCBiZSBwcm9wYWdhdGVkIGZ1cnRoZXIgZG93bnN0cmVhbS5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICB0aHJvdyBuZXcgUGVkYWdvZ2ljYWxFeGNlcHRpb24oJ1Vwc3RyZWFtIGVycm9yJyk7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyBuZXZlciByZWFjaGVkXG4gICAgICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyBuZXZlciByZWFjaGVkXG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vIFRoZSBgUGVkZ2Fnb2NpYWxFeGNlcHRpb25gIGlzIHByb3BhZ2F0ZWQgYWxsIHRoZSB3YXkgZG93biB0byBoZXJlXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBBc3NpbWlsYXRpb25cbiAgICAgIC0tLS0tLS0tLS0tLVxuXG4gICAgICBTb21ldGltZXMgdGhlIHZhbHVlIHlvdSB3YW50IHRvIHByb3BhZ2F0ZSB0byBhIGRvd25zdHJlYW0gcHJvbWlzZSBjYW4gb25seSBiZVxuICAgICAgcmV0cmlldmVkIGFzeW5jaHJvbm91c2x5LiBUaGlzIGNhbiBiZSBhY2hpZXZlZCBieSByZXR1cm5pbmcgYSBwcm9taXNlIGluIHRoZVxuICAgICAgZnVsZmlsbG1lbnQgb3IgcmVqZWN0aW9uIGhhbmRsZXIuIFRoZSBkb3duc3RyZWFtIHByb21pc2Ugd2lsbCB0aGVuIGJlIHBlbmRpbmdcbiAgICAgIHVudGlsIHRoZSByZXR1cm5lZCBwcm9taXNlIGlzIHNldHRsZWQuIFRoaXMgaXMgY2FsbGVkICphc3NpbWlsYXRpb24qLlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHJldHVybiBmaW5kQ29tbWVudHNCeUF1dGhvcih1c2VyKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKGNvbW1lbnRzKSB7XG4gICAgICAgIC8vIFRoZSB1c2VyJ3MgY29tbWVudHMgYXJlIG5vdyBhdmFpbGFibGVcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIElmIHRoZSBhc3NpbWxpYXRlZCBwcm9taXNlIHJlamVjdHMsIHRoZW4gdGhlIGRvd25zdHJlYW0gcHJvbWlzZSB3aWxsIGFsc28gcmVqZWN0LlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHJldHVybiBmaW5kQ29tbWVudHNCeUF1dGhvcih1c2VyKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKGNvbW1lbnRzKSB7XG4gICAgICAgIC8vIElmIGBmaW5kQ29tbWVudHNCeUF1dGhvcmAgZnVsZmlsbHMsIHdlJ2xsIGhhdmUgdGhlIHZhbHVlIGhlcmVcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgLy8gSWYgYGZpbmRDb21tZW50c0J5QXV0aG9yYCByZWplY3RzLCB3ZSdsbCBoYXZlIHRoZSByZWFzb24gaGVyZVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgU2ltcGxlIEV4YW1wbGVcbiAgICAgIC0tLS0tLS0tLS0tLS0tXG5cbiAgICAgIFN5bmNocm9ub3VzIEV4YW1wbGVcblxuICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgdmFyIHJlc3VsdDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzdWx0ID0gZmluZFJlc3VsdCgpO1xuICAgICAgICAvLyBzdWNjZXNzXG4gICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAvLyBmYWlsdXJlXG4gICAgICB9XG4gICAgICBgYGBcblxuICAgICAgRXJyYmFjayBFeGFtcGxlXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kUmVzdWx0KGZ1bmN0aW9uKHJlc3VsdCwgZXJyKXtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIC8vIGZhaWx1cmVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBzdWNjZXNzXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIFByb21pc2UgRXhhbXBsZTtcblxuICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgZmluZFJlc3VsdCgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KXtcbiAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQWR2YW5jZWQgRXhhbXBsZVxuICAgICAgLS0tLS0tLS0tLS0tLS1cblxuICAgICAgU3luY2hyb25vdXMgRXhhbXBsZVxuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICB2YXIgYXV0aG9yLCBib29rcztcblxuICAgICAgdHJ5IHtcbiAgICAgICAgYXV0aG9yID0gZmluZEF1dGhvcigpO1xuICAgICAgICBib29rcyAgPSBmaW5kQm9va3NCeUF1dGhvcihhdXRob3IpO1xuICAgICAgICAvLyBzdWNjZXNzXG4gICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAvLyBmYWlsdXJlXG4gICAgICB9XG4gICAgICBgYGBcblxuICAgICAgRXJyYmFjayBFeGFtcGxlXG5cbiAgICAgIGBgYGpzXG5cbiAgICAgIGZ1bmN0aW9uIGZvdW5kQm9va3MoYm9va3MpIHtcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBmYWlsdXJlKHJlYXNvbikge1xuXG4gICAgICB9XG5cbiAgICAgIGZpbmRBdXRob3IoZnVuY3Rpb24oYXV0aG9yLCBlcnIpe1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgZmFpbHVyZShlcnIpO1xuICAgICAgICAgIC8vIGZhaWx1cmVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgZmluZEJvb29rc0J5QXV0aG9yKGF1dGhvciwgZnVuY3Rpb24oYm9va3MsIGVycikge1xuICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgZmFpbHVyZShlcnIpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBmb3VuZEJvb2tzKGJvb2tzKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAgICAgICAgICAgZmFpbHVyZShyZWFzb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICAgICAgZmFpbHVyZShlcnIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBzdWNjZXNzXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIFByb21pc2UgRXhhbXBsZTtcblxuICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgZmluZEF1dGhvcigpLlxuICAgICAgICB0aGVuKGZpbmRCb29rc0J5QXV0aG9yKS5cbiAgICAgICAgdGhlbihmdW5jdGlvbihib29rcyl7XG4gICAgICAgICAgLy8gZm91bmQgYm9va3NcbiAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAgIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBAbWV0aG9kIHRoZW5cbiAgICAgIEBwYXJhbSB7RnVuY3Rpb259IG9uRnVsZmlsbGVkXG4gICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBvblJlamVjdGVkXG4gICAgICBAcGFyYW0ge1N0cmluZ30gbGFiZWwgb3B0aW9uYWwgc3RyaW5nIGZvciBsYWJlbGluZyB0aGUgcHJvbWlzZS5cbiAgICAgIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgICAgIEByZXR1cm4ge1Byb21pc2V9XG4gICAgKi9cbiAgICAgIHRoZW46IGZ1bmN0aW9uKG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uLCBsYWJlbCkge1xuICAgICAgICB2YXIgcGFyZW50ID0gdGhpcztcbiAgICAgICAgdmFyIHN0YXRlID0gcGFyZW50Ll9zdGF0ZTtcblxuICAgICAgICBpZiAoc3RhdGUgPT09ICQkJGludGVybmFsJCRGVUxGSUxMRUQgJiYgIW9uRnVsZmlsbG1lbnQgfHwgc3RhdGUgPT09ICQkJGludGVybmFsJCRSRUpFQ1RFRCAmJiAhb25SZWplY3Rpb24pIHtcbiAgICAgICAgICBpZiAoJCRyc3ZwJGNvbmZpZyQkY29uZmlnLmluc3RydW1lbnQpIHtcbiAgICAgICAgICAgICQkaW5zdHJ1bWVudCQkZGVmYXVsdCgnY2hhaW5lZCcsIHRoaXMsIHRoaXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHBhcmVudC5fb25lcnJvciA9IG51bGw7XG5cbiAgICAgICAgdmFyIGNoaWxkID0gbmV3IHRoaXMuY29uc3RydWN0b3IoJCQkaW50ZXJuYWwkJG5vb3AsIGxhYmVsKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHBhcmVudC5fcmVzdWx0O1xuXG4gICAgICAgIGlmICgkJHJzdnAkY29uZmlnJCRjb25maWcuaW5zdHJ1bWVudCkge1xuICAgICAgICAgICQkaW5zdHJ1bWVudCQkZGVmYXVsdCgnY2hhaW5lZCcsIHBhcmVudCwgY2hpbGQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN0YXRlKSB7XG4gICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJndW1lbnRzW3N0YXRlIC0gMV07XG4gICAgICAgICAgJCRyc3ZwJGNvbmZpZyQkY29uZmlnLmFzeW5jKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkJCRpbnRlcm5hbCQkaW52b2tlQ2FsbGJhY2soc3RhdGUsIGNoaWxkLCBjYWxsYmFjaywgcmVzdWx0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkc3Vic2NyaWJlKHBhcmVudCwgY2hpbGQsIG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjaGlsZDtcbiAgICAgIH0sXG5cbiAgICAvKipcbiAgICAgIGBjYXRjaGAgaXMgc2ltcGx5IHN1Z2FyIGZvciBgdGhlbih1bmRlZmluZWQsIG9uUmVqZWN0aW9uKWAgd2hpY2ggbWFrZXMgaXQgdGhlIHNhbWVcbiAgICAgIGFzIHRoZSBjYXRjaCBibG9jayBvZiBhIHRyeS9jYXRjaCBzdGF0ZW1lbnQuXG5cbiAgICAgIGBgYGpzXG4gICAgICBmdW5jdGlvbiBmaW5kQXV0aG9yKCl7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGRuJ3QgZmluZCB0aGF0IGF1dGhvcicpO1xuICAgICAgfVxuXG4gICAgICAvLyBzeW5jaHJvbm91c1xuICAgICAgdHJ5IHtcbiAgICAgICAgZmluZEF1dGhvcigpO1xuICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgICAgIH1cblxuICAgICAgLy8gYXN5bmMgd2l0aCBwcm9taXNlc1xuICAgICAgZmluZEF1dGhvcigpLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAgIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBAbWV0aG9kIGNhdGNoXG4gICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBvblJlamVjdGlvblxuICAgICAgQHBhcmFtIHtTdHJpbmd9IGxhYmVsIG9wdGlvbmFsIHN0cmluZyBmb3IgbGFiZWxpbmcgdGhlIHByb21pc2UuXG4gICAgICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gICAgICBAcmV0dXJuIHtQcm9taXNlfVxuICAgICovXG4gICAgICAnY2F0Y2gnOiBmdW5jdGlvbihvblJlamVjdGlvbiwgbGFiZWwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGhlbihudWxsLCBvblJlamVjdGlvbiwgbGFiZWwpO1xuICAgICAgfSxcblxuICAgIC8qKlxuICAgICAgYGZpbmFsbHlgIHdpbGwgYmUgaW52b2tlZCByZWdhcmRsZXNzIG9mIHRoZSBwcm9taXNlJ3MgZmF0ZSBqdXN0IGFzIG5hdGl2ZVxuICAgICAgdHJ5L2NhdGNoL2ZpbmFsbHkgYmVoYXZlc1xuXG4gICAgICBTeW5jaHJvbm91cyBleGFtcGxlOlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZEF1dGhvcigpIHtcbiAgICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPiAwLjUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IEF1dGhvcigpO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gZmluZEF1dGhvcigpOyAvLyBzdWNjZWVkIG9yIGZhaWxcbiAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGZpbmRPdGhlckF1dGhlcigpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgLy8gYWx3YXlzIHJ1bnNcbiAgICAgICAgLy8gZG9lc24ndCBhZmZlY3QgdGhlIHJldHVybiB2YWx1ZVxuICAgICAgfVxuICAgICAgYGBgXG5cbiAgICAgIEFzeW5jaHJvbm91cyBleGFtcGxlOlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZEF1dGhvcigpLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAgIHJldHVybiBmaW5kT3RoZXJBdXRoZXIoKTtcbiAgICAgIH0pLmZpbmFsbHkoZnVuY3Rpb24oKXtcbiAgICAgICAgLy8gYXV0aG9yIHdhcyBlaXRoZXIgZm91bmQsIG9yIG5vdFxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQG1ldGhvZCBmaW5hbGx5XG4gICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAgQHBhcmFtIHtTdHJpbmd9IGxhYmVsIG9wdGlvbmFsIHN0cmluZyBmb3IgbGFiZWxpbmcgdGhlIHByb21pc2UuXG4gICAgICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gICAgICBAcmV0dXJuIHtQcm9taXNlfVxuICAgICovXG4gICAgICAnZmluYWxseSc6IGZ1bmN0aW9uKGNhbGxiYWNrLCBsYWJlbCkge1xuICAgICAgICB2YXIgY29uc3RydWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yO1xuXG4gICAgICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICByZXR1cm4gY29uc3RydWN0b3IucmVzb2x2ZShjYWxsYmFjaygpKS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICAgIHJldHVybiBjb25zdHJ1Y3Rvci5yZXNvbHZlKGNhbGxiYWNrKCkpLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHRocm93IHJlYXNvbjtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSwgbGFiZWwpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkbm9kZSQkUmVzdWx0KCkge1xuICAgICAgdGhpcy52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICB2YXIgJCRyc3ZwJG5vZGUkJEVSUk9SID0gbmV3ICQkcnN2cCRub2RlJCRSZXN1bHQoKTtcbiAgICB2YXIgJCRyc3ZwJG5vZGUkJEdFVF9USEVOX0VSUk9SID0gbmV3ICQkcnN2cCRub2RlJCRSZXN1bHQoKTtcblxuICAgIGZ1bmN0aW9uICQkcnN2cCRub2RlJCRnZXRUaGVuKG9iaikge1xuICAgICAgdHJ5IHtcbiAgICAgICByZXR1cm4gb2JqLnRoZW47XG4gICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICQkcnN2cCRub2RlJCRFUlJPUi52YWx1ZT0gZXJyb3I7XG4gICAgICAgIHJldHVybiAkJHJzdnAkbm9kZSQkRVJST1I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJG5vZGUkJHRyeUFwcGx5KGYsIHMsIGEpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGYuYXBwbHkocywgYSk7XG4gICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICQkcnN2cCRub2RlJCRFUlJPUi52YWx1ZSA9IGVycm9yO1xuICAgICAgICByZXR1cm4gJCRyc3ZwJG5vZGUkJEVSUk9SO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkcnN2cCRub2RlJCRtYWtlT2JqZWN0KF8sIGFyZ3VtZW50TmFtZXMpIHtcbiAgICAgIHZhciBvYmogPSB7fTtcbiAgICAgIHZhciBuYW1lO1xuICAgICAgdmFyIGk7XG4gICAgICB2YXIgbGVuZ3RoID0gXy5sZW5ndGg7XG4gICAgICB2YXIgYXJncyA9IG5ldyBBcnJheShsZW5ndGgpO1xuXG4gICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IGxlbmd0aDsgeCsrKSB7XG4gICAgICAgIGFyZ3NbeF0gPSBfW3hdO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgYXJndW1lbnROYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBuYW1lID0gYXJndW1lbnROYW1lc1tpXTtcbiAgICAgICAgb2JqW25hbWVdID0gYXJnc1tpICsgMV07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJG5vZGUkJGFycmF5UmVzdWx0KF8pIHtcbiAgICAgIHZhciBsZW5ndGggPSBfLmxlbmd0aDtcbiAgICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGxlbmd0aCAtIDEpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFyZ3NbaSAtIDFdID0gX1tpXTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGFyZ3M7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJG5vZGUkJHdyYXBUaGVuYWJsZSh0aGVuLCBwcm9taXNlKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0aGVuOiBmdW5jdGlvbihvbkZ1bEZpbGxtZW50LCBvblJlamVjdGlvbikge1xuICAgICAgICAgIHJldHVybiB0aGVuLmNhbGwocHJvbWlzZSwgb25GdWxGaWxsbWVudCwgb25SZWplY3Rpb24pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cblxuICAgIHZhciAkJHJzdnAkbm9kZSQkZGVmYXVsdCA9IGZ1bmN0aW9uIGRlbm9kZWlmeShub2RlRnVuYywgb3B0aW9ucykge1xuICAgICAgdmFyIGZuID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGwgPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICB2YXIgYXJncyA9IG5ldyBBcnJheShsICsgMSk7XG4gICAgICAgIHZhciBhcmc7XG4gICAgICAgIHZhciBwcm9taXNlSW5wdXQgPSBmYWxzZTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7ICsraSkge1xuICAgICAgICAgIGFyZyA9IGFyZ3VtZW50c1tpXTtcblxuICAgICAgICAgIGlmICghcHJvbWlzZUlucHV0KSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBjbGVhbiB0aGlzIHVwXG4gICAgICAgICAgICBwcm9taXNlSW5wdXQgPSAkJHJzdnAkbm9kZSQkbmVlZHNQcm9taXNlSW5wdXQoYXJnKTtcbiAgICAgICAgICAgIGlmIChwcm9taXNlSW5wdXQgPT09ICQkcnN2cCRub2RlJCRHRVRfVEhFTl9FUlJPUikge1xuICAgICAgICAgICAgICB2YXIgcCA9IG5ldyAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdCgkJCRpbnRlcm5hbCQkbm9vcCk7XG4gICAgICAgICAgICAgICQkJGludGVybmFsJCRyZWplY3QocCwgJCRyc3ZwJG5vZGUkJEdFVF9USEVOX0VSUk9SLnZhbHVlKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHA7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHByb21pc2VJbnB1dCAmJiBwcm9taXNlSW5wdXQgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgYXJnID0gJCRyc3ZwJG5vZGUkJHdyYXBUaGVuYWJsZShwcm9taXNlSW5wdXQsIGFyZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGFyZ3NbaV0gPSBhcmc7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdCgkJCRpbnRlcm5hbCQkbm9vcCk7XG5cbiAgICAgICAgYXJnc1tsXSA9IGZ1bmN0aW9uKGVyciwgdmFsKSB7XG4gICAgICAgICAgaWYgKGVycilcbiAgICAgICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgZXJyKTtcbiAgICAgICAgICBlbHNlIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWwpO1xuICAgICAgICAgIGVsc2UgaWYgKG9wdGlvbnMgPT09IHRydWUpXG4gICAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCAkJHJzdnAkbm9kZSQkYXJyYXlSZXN1bHQoYXJndW1lbnRzKSk7XG4gICAgICAgICAgZWxzZSBpZiAoJCR1dGlscyQkaXNBcnJheShvcHRpb25zKSlcbiAgICAgICAgICAgICQkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsICQkcnN2cCRub2RlJCRtYWtlT2JqZWN0KGFyZ3VtZW50cywgb3B0aW9ucykpO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICQkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHByb21pc2VJbnB1dCkge1xuICAgICAgICAgIHJldHVybiAkJHJzdnAkbm9kZSQkaGFuZGxlUHJvbWlzZUlucHV0KHByb21pc2UsIGFyZ3MsIG5vZGVGdW5jLCBzZWxmKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gJCRyc3ZwJG5vZGUkJGhhbmRsZVZhbHVlSW5wdXQocHJvbWlzZSwgYXJncywgbm9kZUZ1bmMsIHNlbGYpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBmbi5fX3Byb3RvX18gPSBub2RlRnVuYztcblxuICAgICAgcmV0dXJuIGZuO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkbm9kZSQkaGFuZGxlVmFsdWVJbnB1dChwcm9taXNlLCBhcmdzLCBub2RlRnVuYywgc2VsZikge1xuICAgICAgdmFyIHJlc3VsdCA9ICQkcnN2cCRub2RlJCR0cnlBcHBseShub2RlRnVuYywgc2VsZiwgYXJncyk7XG4gICAgICBpZiAocmVzdWx0ID09PSAkJHJzdnAkbm9kZSQkRVJST1IpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZXN1bHQudmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJG5vZGUkJGhhbmRsZVByb21pc2VJbnB1dChwcm9taXNlLCBhcmdzLCBub2RlRnVuYywgc2VsZil7XG4gICAgICByZXR1cm4gJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQuYWxsKGFyZ3MpLnRoZW4oZnVuY3Rpb24oYXJncyl7XG4gICAgICAgIHZhciByZXN1bHQgPSAkJHJzdnAkbm9kZSQkdHJ5QXBwbHkobm9kZUZ1bmMsIHNlbGYsIGFyZ3MpO1xuICAgICAgICBpZiAocmVzdWx0ID09PSAkJHJzdnAkbm9kZSQkRVJST1IpIHtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlc3VsdC52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHJzdnAkbm9kZSQkbmVlZHNQcm9taXNlSW5wdXQoYXJnKSB7XG4gICAgICBpZiAoYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGlmIChhcmcuY29uc3RydWN0b3IgPT09ICQkcnN2cCRwcm9taXNlJCRkZWZhdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuICQkcnN2cCRub2RlJCRnZXRUaGVuKGFyZyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgJCRyc3ZwJGFsbCQkZGVmYXVsdCA9IGZ1bmN0aW9uIGFsbChhcnJheSwgbGFiZWwpIHtcbiAgICAgIHJldHVybiAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdC5hbGwoYXJyYXksIGxhYmVsKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJGFsbCRzZXR0bGVkJCRBbGxTZXR0bGVkKENvbnN0cnVjdG9yLCBlbnRyaWVzLCBsYWJlbCkge1xuICAgICAgdGhpcy5fc3VwZXJDb25zdHJ1Y3RvcihDb25zdHJ1Y3RvciwgZW50cmllcywgZmFsc2UgLyogZG9uJ3QgYWJvcnQgb24gcmVqZWN0ICovLCBsYWJlbCk7XG4gICAgfVxuXG4gICAgJCRyc3ZwJGFsbCRzZXR0bGVkJCRBbGxTZXR0bGVkLnByb3RvdHlwZSA9ICQkdXRpbHMkJG9fY3JlYXRlKCQkZW51bWVyYXRvciQkZGVmYXVsdC5wcm90b3R5cGUpO1xuICAgICQkcnN2cCRhbGwkc2V0dGxlZCQkQWxsU2V0dGxlZC5wcm90b3R5cGUuX3N1cGVyQ29uc3RydWN0b3IgPSAkJGVudW1lcmF0b3IkJGRlZmF1bHQ7XG4gICAgJCRyc3ZwJGFsbCRzZXR0bGVkJCRBbGxTZXR0bGVkLnByb3RvdHlwZS5fbWFrZVJlc3VsdCA9ICQkZW51bWVyYXRvciQkbWFrZVNldHRsZWRSZXN1bHQ7XG5cbiAgICAkJHJzdnAkYWxsJHNldHRsZWQkJEFsbFNldHRsZWQucHJvdG90eXBlLl92YWxpZGF0aW9uRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRXJyb3IoJ2FsbFNldHRsZWQgbXVzdCBiZSBjYWxsZWQgd2l0aCBhbiBhcnJheScpO1xuICAgIH07XG5cbiAgICB2YXIgJCRyc3ZwJGFsbCRzZXR0bGVkJCRkZWZhdWx0ID0gZnVuY3Rpb24gYWxsU2V0dGxlZChlbnRyaWVzLCBsYWJlbCkge1xuICAgICAgcmV0dXJuIG5ldyAkJHJzdnAkYWxsJHNldHRsZWQkJEFsbFNldHRsZWQoJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQsIGVudHJpZXMsIGxhYmVsKS5wcm9taXNlO1xuICAgIH07XG5cbiAgICB2YXIgJCRyc3ZwJHJhY2UkJGRlZmF1bHQgPSBmdW5jdGlvbiByYWNlKGFycmF5LCBsYWJlbCkge1xuICAgICAgcmV0dXJuICQkcnN2cCRwcm9taXNlJCRkZWZhdWx0LnJhY2UoYXJyYXksIGxhYmVsKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gJCRwcm9taXNlJGhhc2gkJFByb21pc2VIYXNoKENvbnN0cnVjdG9yLCBvYmplY3QsIGxhYmVsKSB7XG4gICAgICB0aGlzLl9zdXBlckNvbnN0cnVjdG9yKENvbnN0cnVjdG9yLCBvYmplY3QsIHRydWUsIGxhYmVsKTtcbiAgICB9XG5cbiAgICB2YXIgJCRwcm9taXNlJGhhc2gkJGRlZmF1bHQgPSAkJHByb21pc2UkaGFzaCQkUHJvbWlzZUhhc2g7XG4gICAgJCRwcm9taXNlJGhhc2gkJFByb21pc2VIYXNoLnByb3RvdHlwZSA9ICQkdXRpbHMkJG9fY3JlYXRlKCQkZW51bWVyYXRvciQkZGVmYXVsdC5wcm90b3R5cGUpO1xuICAgICQkcHJvbWlzZSRoYXNoJCRQcm9taXNlSGFzaC5wcm90b3R5cGUuX3N1cGVyQ29uc3RydWN0b3IgPSAkJGVudW1lcmF0b3IkJGRlZmF1bHQ7XG5cbiAgICAkJHByb21pc2UkaGFzaCQkUHJvbWlzZUhhc2gucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9yZXN1bHQgPSB7fTtcbiAgICB9O1xuXG4gICAgJCRwcm9taXNlJGhhc2gkJFByb21pc2VIYXNoLnByb3RvdHlwZS5fdmFsaWRhdGVJbnB1dCA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICByZXR1cm4gaW5wdXQgJiYgdHlwZW9mIGlucHV0ID09PSAnb2JqZWN0JztcbiAgICB9O1xuXG4gICAgJCRwcm9taXNlJGhhc2gkJFByb21pc2VIYXNoLnByb3RvdHlwZS5fdmFsaWRhdGlvbkVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IEVycm9yKCdQcm9taXNlLmhhc2ggbXVzdCBiZSBjYWxsZWQgd2l0aCBhbiBvYmplY3QnKTtcbiAgICB9O1xuXG4gICAgJCRwcm9taXNlJGhhc2gkJFByb21pc2VIYXNoLnByb3RvdHlwZS5fZW51bWVyYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcHJvbWlzZSA9IHRoaXMucHJvbWlzZTtcbiAgICAgIHZhciBpbnB1dCAgID0gdGhpcy5faW5wdXQ7XG4gICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuXG4gICAgICBmb3IgKHZhciBrZXkgaW4gaW5wdXQpIHtcbiAgICAgICAgaWYgKHByb21pc2UuX3N0YXRlID09PSAkJCRpbnRlcm5hbCQkUEVORElORyAmJiBpbnB1dC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiBrZXksXG4gICAgICAgICAgICBlbnRyeTogaW5wdXRba2V5XVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBsZW5ndGggPSByZXN1bHRzLmxlbmd0aDtcbiAgICAgIHRoaXMuX3JlbWFpbmluZyA9IGxlbmd0aDtcbiAgICAgIHZhciByZXN1bHQ7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBwcm9taXNlLl9zdGF0ZSA9PT0gJCQkaW50ZXJuYWwkJFBFTkRJTkcgJiYgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdHNbaV07XG4gICAgICAgIHRoaXMuX2VhY2hFbnRyeShyZXN1bHQuZW50cnksIHJlc3VsdC5wb3NpdGlvbik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciAkJHJzdnAkaGFzaCQkZGVmYXVsdCA9IGZ1bmN0aW9uIGhhc2gob2JqZWN0LCBsYWJlbCkge1xuICAgICAgcmV0dXJuIG5ldyAkJHByb21pc2UkaGFzaCQkZGVmYXVsdCgkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdCwgb2JqZWN0LCBsYWJlbCkucHJvbWlzZTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJGhhc2gkc2V0dGxlZCQkSGFzaFNldHRsZWQoQ29uc3RydWN0b3IsIG9iamVjdCwgbGFiZWwpIHtcbiAgICAgIHRoaXMuX3N1cGVyQ29uc3RydWN0b3IoQ29uc3RydWN0b3IsIG9iamVjdCwgZmFsc2UsIGxhYmVsKTtcbiAgICB9XG5cbiAgICAkJHJzdnAkaGFzaCRzZXR0bGVkJCRIYXNoU2V0dGxlZC5wcm90b3R5cGUgPSAkJHV0aWxzJCRvX2NyZWF0ZSgkJHByb21pc2UkaGFzaCQkZGVmYXVsdC5wcm90b3R5cGUpO1xuICAgICQkcnN2cCRoYXNoJHNldHRsZWQkJEhhc2hTZXR0bGVkLnByb3RvdHlwZS5fc3VwZXJDb25zdHJ1Y3RvciA9ICQkZW51bWVyYXRvciQkZGVmYXVsdDtcbiAgICAkJHJzdnAkaGFzaCRzZXR0bGVkJCRIYXNoU2V0dGxlZC5wcm90b3R5cGUuX21ha2VSZXN1bHQgPSAkJGVudW1lcmF0b3IkJG1ha2VTZXR0bGVkUmVzdWx0O1xuXG4gICAgJCRyc3ZwJGhhc2gkc2V0dGxlZCQkSGFzaFNldHRsZWQucHJvdG90eXBlLl92YWxpZGF0aW9uRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRXJyb3IoJ2hhc2hTZXR0bGVkIG11c3QgYmUgY2FsbGVkIHdpdGggYW4gb2JqZWN0Jyk7XG4gICAgfTtcblxuICAgIHZhciAkJHJzdnAkaGFzaCRzZXR0bGVkJCRkZWZhdWx0ID0gZnVuY3Rpb24gaGFzaFNldHRsZWQob2JqZWN0LCBsYWJlbCkge1xuICAgICAgcmV0dXJuIG5ldyAkJHJzdnAkaGFzaCRzZXR0bGVkJCRIYXNoU2V0dGxlZCgkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdCwgb2JqZWN0LCBsYWJlbCkucHJvbWlzZTtcbiAgICB9O1xuXG4gICAgdmFyICQkcnN2cCRyZXRocm93JCRkZWZhdWx0ID0gZnVuY3Rpb24gcmV0aHJvdyhyZWFzb24pIHtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRocm93IHJlYXNvbjtcbiAgICAgIH0pO1xuICAgICAgdGhyb3cgcmVhc29uO1xuICAgIH07XG5cbiAgICB2YXIgJCRyc3ZwJGRlZmVyJCRkZWZhdWx0ID0gZnVuY3Rpb24gZGVmZXIobGFiZWwpIHtcbiAgICAgIHZhciBkZWZlcnJlZCA9IHsgfTtcblxuICAgICAgZGVmZXJyZWQucHJvbWlzZSA9IG5ldyAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdChmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdCA9IHJlamVjdDtcbiAgICAgIH0sIGxhYmVsKTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkO1xuICAgIH07XG5cbiAgICB2YXIgJCRyc3ZwJG1hcCQkZGVmYXVsdCA9IGZ1bmN0aW9uIG1hcChwcm9taXNlcywgbWFwRm4sIGxhYmVsKSB7XG4gICAgICByZXR1cm4gJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQuYWxsKHByb21pc2VzLCBsYWJlbCkudGhlbihmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgaWYgKCEkJHV0aWxzJCRpc0Z1bmN0aW9uKG1hcEZuKSkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJZb3UgbXVzdCBwYXNzIGEgZnVuY3Rpb24gYXMgbWFwJ3Mgc2Vjb25kIGFyZ3VtZW50LlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsZW5ndGggPSB2YWx1ZXMubGVuZ3RoO1xuICAgICAgICB2YXIgcmVzdWx0cyA9IG5ldyBBcnJheShsZW5ndGgpO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICByZXN1bHRzW2ldID0gbWFwRm4odmFsdWVzW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdC5hbGwocmVzdWx0cywgbGFiZWwpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHZhciAkJHJzdnAkcmVzb2x2ZSQkZGVmYXVsdCA9IGZ1bmN0aW9uIHJlc29sdmUodmFsdWUsIGxhYmVsKSB7XG4gICAgICByZXR1cm4gJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQucmVzb2x2ZSh2YWx1ZSwgbGFiZWwpO1xuICAgIH07XG5cbiAgICB2YXIgJCRyc3ZwJHJlamVjdCQkZGVmYXVsdCA9IGZ1bmN0aW9uIHJlamVjdChyZWFzb24sIGxhYmVsKSB7XG4gICAgICByZXR1cm4gJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQucmVqZWN0KHJlYXNvbiwgbGFiZWwpO1xuICAgIH07XG5cbiAgICB2YXIgJCRyc3ZwJGZpbHRlciQkZGVmYXVsdCA9IGZ1bmN0aW9uIGZpbHRlcihwcm9taXNlcywgZmlsdGVyRm4sIGxhYmVsKSB7XG4gICAgICByZXR1cm4gJCRyc3ZwJHByb21pc2UkJGRlZmF1bHQuYWxsKHByb21pc2VzLCBsYWJlbCkudGhlbihmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgaWYgKCEkJHV0aWxzJCRpc0Z1bmN0aW9uKGZpbHRlckZuKSkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJZb3UgbXVzdCBwYXNzIGEgZnVuY3Rpb24gYXMgZmlsdGVyJ3Mgc2Vjb25kIGFyZ3VtZW50LlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsZW5ndGggPSB2YWx1ZXMubGVuZ3RoO1xuICAgICAgICB2YXIgZmlsdGVyZWQgPSBuZXcgQXJyYXkobGVuZ3RoKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgZmlsdGVyZWRbaV0gPSBmaWx0ZXJGbih2YWx1ZXNbaV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICQkcnN2cCRwcm9taXNlJCRkZWZhdWx0LmFsbChmaWx0ZXJlZCwgbGFiZWwpLnRoZW4oZnVuY3Rpb24oZmlsdGVyZWQpIHtcbiAgICAgICAgICB2YXIgcmVzdWx0cyA9IG5ldyBBcnJheShsZW5ndGgpO1xuICAgICAgICAgIHZhciBuZXdMZW5ndGggPSAwO1xuXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGZpbHRlcmVkW2ldKSB7XG4gICAgICAgICAgICAgIHJlc3VsdHNbbmV3TGVuZ3RoXSA9IHZhbHVlc1tpXTtcbiAgICAgICAgICAgICAgbmV3TGVuZ3RoKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVzdWx0cy5sZW5ndGggPSBuZXdMZW5ndGg7XG5cbiAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdmFyICQkcnN2cCRhc2FwJCRsZW4gPSAwO1xuXG4gICAgdmFyICQkcnN2cCRhc2FwJCRkZWZhdWx0ID0gZnVuY3Rpb24gYXNhcChjYWxsYmFjaywgYXJnKSB7XG4gICAgICAkJHJzdnAkYXNhcCQkcXVldWVbJCRyc3ZwJGFzYXAkJGxlbl0gPSBjYWxsYmFjaztcbiAgICAgICQkcnN2cCRhc2FwJCRxdWV1ZVskJHJzdnAkYXNhcCQkbGVuICsgMV0gPSBhcmc7XG4gICAgICAkJHJzdnAkYXNhcCQkbGVuICs9IDI7XG4gICAgICBpZiAoJCRyc3ZwJGFzYXAkJGxlbiA9PT0gMikge1xuICAgICAgICAvLyBJZiBsZW4gaXMgMSwgdGhhdCBtZWFucyB0aGF0IHdlIG5lZWQgdG8gc2NoZWR1bGUgYW4gYXN5bmMgZmx1c2guXG4gICAgICAgIC8vIElmIGFkZGl0aW9uYWwgY2FsbGJhY2tzIGFyZSBxdWV1ZWQgYmVmb3JlIHRoZSBxdWV1ZSBpcyBmbHVzaGVkLCB0aGV5XG4gICAgICAgIC8vIHdpbGwgYmUgcHJvY2Vzc2VkIGJ5IHRoaXMgZmx1c2ggdGhhdCB3ZSBhcmUgc2NoZWR1bGluZy5cbiAgICAgICAgJCRyc3ZwJGFzYXAkJHNjaGVkdWxlRmx1c2goKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyICQkcnN2cCRhc2FwJCRicm93c2VyR2xvYmFsID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSA/IHdpbmRvdyA6IHt9O1xuICAgIHZhciAkJHJzdnAkYXNhcCQkQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIgPSAkJHJzdnAkYXNhcCQkYnJvd3Nlckdsb2JhbC5NdXRhdGlvbk9ic2VydmVyIHx8ICQkcnN2cCRhc2FwJCRicm93c2VyR2xvYmFsLldlYktpdE11dGF0aW9uT2JzZXJ2ZXI7XG5cbiAgICAvLyB0ZXN0IGZvciB3ZWIgd29ya2VyIGJ1dCBub3QgaW4gSUUxMFxuICAgIHZhciAkJHJzdnAkYXNhcCQkaXNXb3JrZXIgPSB0eXBlb2YgVWludDhDbGFtcGVkQXJyYXkgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICB0eXBlb2YgaW1wb3J0U2NyaXB0cyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgIHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCc7XG5cbiAgICAvLyBub2RlXG4gICAgZnVuY3Rpb24gJCRyc3ZwJGFzYXAkJHVzZU5leHRUaWNrKCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKCQkcnN2cCRhc2FwJCRmbHVzaCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkcnN2cCRhc2FwJCR1c2VNdXRhdGlvbk9ic2VydmVyKCkge1xuICAgICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgICAgdmFyIG9ic2VydmVyID0gbmV3ICQkcnN2cCRhc2FwJCRCcm93c2VyTXV0YXRpb25PYnNlcnZlcigkJHJzdnAkYXNhcCQkZmx1c2gpO1xuICAgICAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG4gICAgICBvYnNlcnZlci5vYnNlcnZlKG5vZGUsIHsgY2hhcmFjdGVyRGF0YTogdHJ1ZSB9KTtcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBub2RlLmRhdGEgPSAoaXRlcmF0aW9ucyA9ICsraXRlcmF0aW9ucyAlIDIpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyB3ZWIgd29ya2VyXG4gICAgZnVuY3Rpb24gJCRyc3ZwJGFzYXAkJHVzZU1lc3NhZ2VDaGFubmVsKCkge1xuICAgICAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gJCRyc3ZwJGFzYXAkJGZsdXNoO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2hhbm5lbC5wb3J0Mi5wb3N0TWVzc2FnZSgwKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRyc3ZwJGFzYXAkJHVzZVNldFRpbWVvdXQoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNldFRpbWVvdXQoJCRyc3ZwJGFzYXAkJGZsdXNoLCAxKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyICQkcnN2cCRhc2FwJCRxdWV1ZSA9IG5ldyBBcnJheSgxMDAwKTtcblxuICAgIGZ1bmN0aW9uICQkcnN2cCRhc2FwJCRmbHVzaCgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJCRyc3ZwJGFzYXAkJGxlbjsgaSs9Mikge1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSAkJHJzdnAkYXNhcCQkcXVldWVbaV07XG4gICAgICAgIHZhciBhcmcgPSAkJHJzdnAkYXNhcCQkcXVldWVbaSsxXTtcblxuICAgICAgICBjYWxsYmFjayhhcmcpO1xuXG4gICAgICAgICQkcnN2cCRhc2FwJCRxdWV1ZVtpXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgJCRyc3ZwJGFzYXAkJHF1ZXVlW2krMV0gPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgICQkcnN2cCRhc2FwJCRsZW4gPSAwO1xuICAgIH1cblxuICAgIHZhciAkJHJzdnAkYXNhcCQkc2NoZWR1bGVGbHVzaDtcblxuICAgIC8vIERlY2lkZSB3aGF0IGFzeW5jIG1ldGhvZCB0byB1c2UgdG8gdHJpZ2dlcmluZyBwcm9jZXNzaW5nIG9mIHF1ZXVlZCBjYWxsYmFja3M6XG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiB7fS50b1N0cmluZy5jYWxsKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXScpIHtcbiAgICAgICQkcnN2cCRhc2FwJCRzY2hlZHVsZUZsdXNoID0gJCRyc3ZwJGFzYXAkJHVzZU5leHRUaWNrKCk7XG4gICAgfSBlbHNlIGlmICgkJHJzdnAkYXNhcCQkQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgICQkcnN2cCRhc2FwJCRzY2hlZHVsZUZsdXNoID0gJCRyc3ZwJGFzYXAkJHVzZU11dGF0aW9uT2JzZXJ2ZXIoKTtcbiAgICB9IGVsc2UgaWYgKCQkcnN2cCRhc2FwJCRpc1dvcmtlcikge1xuICAgICAgJCRyc3ZwJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSAkJHJzdnAkYXNhcCQkdXNlTWVzc2FnZUNoYW5uZWwoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJCRyc3ZwJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSAkJHJzdnAkYXNhcCQkdXNlU2V0VGltZW91dCgpO1xuICAgIH1cblxuICAgIC8vIGRlZmF1bHQgYXN5bmMgaXMgYXNhcDtcbiAgICAkJHJzdnAkY29uZmlnJCRjb25maWcuYXN5bmMgPSAkJHJzdnAkYXNhcCQkZGVmYXVsdDtcblxuICAgIHZhciAkJHJzdnAkJGNhc3QgPSAkJHJzdnAkcmVzb2x2ZSQkZGVmYXVsdDtcblxuICAgIGZ1bmN0aW9uICQkcnN2cCQkYXN5bmMoY2FsbGJhY2ssIGFyZykge1xuICAgICAgJCRyc3ZwJGNvbmZpZyQkY29uZmlnLmFzeW5jKGNhbGxiYWNrLCBhcmcpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkcnN2cCQkb24oKSB7XG4gICAgICAkJHJzdnAkY29uZmlnJCRjb25maWcub24uYXBwbHkoJCRyc3ZwJGNvbmZpZyQkY29uZmlnLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkcnN2cCQkb2ZmKCkge1xuICAgICAgJCRyc3ZwJGNvbmZpZyQkY29uZmlnLm9mZi5hcHBseSgkJHJzdnAkY29uZmlnJCRjb25maWcsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgLy8gU2V0IHVwIGluc3RydW1lbnRhdGlvbiB0aHJvdWdoIGB3aW5kb3cuX19QUk9NSVNFX0lOVFJVTUVOVEFUSU9OX19gXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiB3aW5kb3dbJ19fUFJPTUlTRV9JTlNUUlVNRU5UQVRJT05fXyddID09PSAnb2JqZWN0Jykge1xuICAgICAgdmFyICQkcnN2cCQkY2FsbGJhY2tzID0gd2luZG93WydfX1BST01JU0VfSU5TVFJVTUVOVEFUSU9OX18nXTtcbiAgICAgICQkcnN2cCRjb25maWckJGNvbmZpZ3VyZSgnaW5zdHJ1bWVudCcsIHRydWUpO1xuICAgICAgZm9yICh2YXIgJCRyc3ZwJCRldmVudE5hbWUgaW4gJCRyc3ZwJCRjYWxsYmFja3MpIHtcbiAgICAgICAgaWYgKCQkcnN2cCQkY2FsbGJhY2tzLmhhc093blByb3BlcnR5KCQkcnN2cCQkZXZlbnROYW1lKSkge1xuICAgICAgICAgICQkcnN2cCQkb24oJCRyc3ZwJCRldmVudE5hbWUsICQkcnN2cCQkY2FsbGJhY2tzWyQkcnN2cCQkZXZlbnROYW1lXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcnN2cCR1bWQkJFJTVlAgPSB7XG4gICAgICAncmFjZSc6ICQkcnN2cCRyYWNlJCRkZWZhdWx0LFxuICAgICAgJ1Byb21pc2UnOiAkJHJzdnAkcHJvbWlzZSQkZGVmYXVsdCxcbiAgICAgICdhbGxTZXR0bGVkJzogJCRyc3ZwJGFsbCRzZXR0bGVkJCRkZWZhdWx0LFxuICAgICAgJ2hhc2gnOiAkJHJzdnAkaGFzaCQkZGVmYXVsdCxcbiAgICAgICdoYXNoU2V0dGxlZCc6ICQkcnN2cCRoYXNoJHNldHRsZWQkJGRlZmF1bHQsXG4gICAgICAnZGVub2RlaWZ5JzogJCRyc3ZwJG5vZGUkJGRlZmF1bHQsXG4gICAgICAnb24nOiAkJHJzdnAkJG9uLFxuICAgICAgJ29mZic6ICQkcnN2cCQkb2ZmLFxuICAgICAgJ21hcCc6ICQkcnN2cCRtYXAkJGRlZmF1bHQsXG4gICAgICAnZmlsdGVyJzogJCRyc3ZwJGZpbHRlciQkZGVmYXVsdCxcbiAgICAgICdyZXNvbHZlJzogJCRyc3ZwJHJlc29sdmUkJGRlZmF1bHQsXG4gICAgICAncmVqZWN0JzogJCRyc3ZwJHJlamVjdCQkZGVmYXVsdCxcbiAgICAgICdhbGwnOiAkJHJzdnAkYWxsJCRkZWZhdWx0LFxuICAgICAgJ3JldGhyb3cnOiAkJHJzdnAkcmV0aHJvdyQkZGVmYXVsdCxcbiAgICAgICdkZWZlcic6ICQkcnN2cCRkZWZlciQkZGVmYXVsdCxcbiAgICAgICdFdmVudFRhcmdldCc6ICQkcnN2cCRldmVudHMkJGRlZmF1bHQsXG4gICAgICAnY29uZmlndXJlJzogJCRyc3ZwJGNvbmZpZyQkY29uZmlndXJlLFxuICAgICAgJ2FzeW5jJzogJCRyc3ZwJCRhc3luY1xuICAgIH07XG5cbiAgICAvKiBnbG9iYWwgZGVmaW5lOnRydWUgbW9kdWxlOnRydWUgd2luZG93OiB0cnVlICovXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gcnN2cCR1bWQkJFJTVlA7IH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgIG1vZHVsZS5leHBvcnRzID0gcnN2cCR1bWQkJFJTVlA7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXNbJ1JTVlAnXSA9IHJzdnAkdW1kJCRSU1ZQO1xuICAgIH1cbn0pLmNhbGwodGhpcyk7IiwidmFyIGNyZWF0ZVR5cGVzID0gcmVxdWlyZSgnLi90eXBlcycpXG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihUSFJFRSkge1xuXG4gICAgdmFyIHR5cGVzID0gY3JlYXRlVHlwZXMoVEhSRUUpIFxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGNyZWF0ZShnbFNoYWRlciwgb3B0cykge1xuICAgICAgICBvcHRzID0gb3B0c3x8e31cblxuICAgICAgICBpZiAodHlwZW9mIG9wdHMuY29sb3JzID09PSAnc3RyaW5nJylcbiAgICAgICAgICAgIG9wdHMuY29sb3JzID0gW29wdHMuY29sb3JzXVxuICAgICAgICBcbiAgICAgICAgdmFyIHRVbmlmb3JtcyA9IHR5cGVzKCBnbFNoYWRlci51bmlmb3Jtcywgb3B0cy5jb2xvcnMgKVxuICAgICAgICB2YXIgdEF0dHJpYnMgPSB0eXBlcyggZ2xTaGFkZXIuYXR0cmlidXRlcywgb3B0cy5jb2xvcnMgKVxuICAgICAgICAgICAgXG4gICAgICAgIC8vY2xlYXIgdGhlIGF0dHJpYnV0ZSBhcnJheXNcbiAgICAgICAgZm9yICh2YXIgayBpbiB0QXR0cmlicykge1xuICAgICAgICAgICAgdEF0dHJpYnNba10udmFsdWUgPSBbXVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZlcnRleFNoYWRlcjogZ2xTaGFkZXIudmVydGV4LFxuICAgICAgICAgICAgZnJhZ21lbnRTaGFkZXI6IGdsU2hhZGVyLmZyYWdtZW50LFxuICAgICAgICAgICAgdW5pZm9ybXM6IHRVbmlmb3JtcyxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHRBdHRyaWJzXG4gICAgICAgIH1cbiAgICB9XG59IiwidmFyIHR5cGVNYXAgPSB7XG4gICAgJ2ludCc6ICdpJyxcbiAgICAnZmxvYXQnOiAnZicsXG4gICAgJ2l2ZWMyJzogJ2kyJyxcbiAgICAnaXZlYzMnOiAnaTMnLFxuICAgICdpdmVjNCc6ICdpNCcsXG4gICAgJ3ZlYzInOiAndjInLFxuICAgICd2ZWMzJzogJ3YzJyxcbiAgICAndmVjNCc6ICd2NCcsXG4gICAgJ21hdDQnOiAnbTQnLFxuICAgICdtYXQzJzogJ20zJyxcbiAgICAnc2FtcGxlcjJEJzogJ3QnLFxuICAgICdzYW1wbGVyQ3ViZSc6ICd0J1xufVxuXG5mdW5jdGlvbiBjcmVhdGUoVEhSRUUpIHtcbiAgICBmdW5jdGlvbiBuZXdJbnN0YW5jZSh0eXBlLCBpc0FycmF5KSB7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnZmxvYXQnOiBcbiAgICAgICAgICAgIGNhc2UgJ2ludCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgICAgIGNhc2UgJ3ZlYzInOlxuICAgICAgICAgICAgY2FzZSAnaXZlYzInOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVEhSRUUuVmVjdG9yMigpXG4gICAgICAgICAgICBjYXNlICd2ZWMzJzpcbiAgICAgICAgICAgIGNhc2UgJ2l2ZWMzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRIUkVFLlZlY3RvcjMoKVxuICAgICAgICAgICAgY2FzZSAndmVjNCc6XG4gICAgICAgICAgICBjYXNlICdpdmVjNCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUSFJFRS5WZWN0b3I0KClcbiAgICAgICAgICAgIGNhc2UgJ21hdDQnOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVEhSRUUuTWF0cml4NCgpXG4gICAgICAgICAgICBjYXNlICdtYXQzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRIUkVFLk1hdHJpeDMoKVxuICAgICAgICAgICAgY2FzZSAnc2FtcGxlckN1YmUnOlxuICAgICAgICAgICAgY2FzZSAnc2FtcGxlcjJEJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRIUkVFLlRleHR1cmUoKVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZWZhdWx0VmFsdWUodHlwZSwgaXNBcnJheSwgYXJyYXlMZW4pIHtcbiAgICAgICAgaWYgKGlzQXJyYXkpIHtcbiAgICAgICAgICAgIC8vVGhyZWVKUyBmbGF0dGVucyBpdmVjMyB0eXBlXG4gICAgICAgICAgICAvLyh3ZSBkb24ndCBzdXBwb3J0ICdmdicgdHlwZSlcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAnaXZlYzMnKVxuICAgICAgICAgICAgICAgIGFycmF5TGVuICo9IDNcbiAgICAgICAgICAgIHZhciBhciA9IG5ldyBBcnJheShhcnJheUxlbilcbiAgICAgICAgICAgIGZvciAodmFyIGk9MDsgaTxhci5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgICAgICBhcltpXSA9IG5ld0luc3RhbmNlKHR5cGUsIGlzQXJyYXkpXG4gICAgICAgICAgICByZXR1cm4gYXJcbiAgICAgICAgfSAgXG4gICAgICAgIHJldHVybiBuZXdJbnN0YW5jZSh0eXBlKVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFR5cGUodHlwZSwgaXNBcnJheSkge1xuICAgICAgICBpZiAoIWlzQXJyYXkpXG4gICAgICAgICAgICByZXR1cm4gdHlwZU1hcFt0eXBlXVxuXG4gICAgICAgIGlmICh0eXBlID09PSAnaW50JylcbiAgICAgICAgICAgIHJldHVybiAnaXYxJ1xuICAgICAgICBlbHNlIGlmICh0eXBlID09PSAnZmxvYXQnKVxuICAgICAgICAgICAgcmV0dXJuICdmdjEnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB0eXBlTWFwW3R5cGVdKyd2J1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBzZXR1cFVuaWZvcm1zKGdsVW5pZm9ybXMsIGNvbG9yTmFtZXMpIHtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGNvbG9yTmFtZXMpKVxuICAgICAgICAgICAgY29sb3JOYW1lcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcblxuICAgICAgICB2YXIgcmVzdWx0ID0ge31cbiAgICAgICAgdmFyIGFycmF5cyA9IHt9XG5cbiAgICAgICAgLy9tYXAgdW5pZm9ybSB0eXBlc1xuICAgICAgICBnbFVuaWZvcm1zLmZvckVhY2goZnVuY3Rpb24odW5pZm9ybSkge1xuICAgICAgICAgICAgdmFyIG5hbWUgPSB1bmlmb3JtLm5hbWVcbiAgICAgICAgICAgIHZhciBpc0FycmF5ID0gLyguKylcXFtbMC05XStcXF0vLmV4ZWMobmFtZSlcblxuICAgICAgICAgICAgLy9zcGVjaWFsIGNhc2U6IGNvbG9ycy4uLlxuICAgICAgICAgICAgaWYgKGNvbG9yTmFtZXMgJiYgY29sb3JOYW1lcy5pbmRleE9mKG5hbWUpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGlmIChpc0FycmF5KVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJhcnJheSBvZiBjb2xvciB1bmlmb3JtcyBub3Qgc3VwcG9ydGVkXCIpXG4gICAgICAgICAgICAgICAgaWYgKHVuaWZvcm0udHlwZSAhPT0gJ3ZlYzMnKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaHJlZUpTIGV4cGVjdHMgdmVjMyBmb3IgQ29sb3IgdW5pZm9ybXNcIikgXG4gICAgICAgICAgICAgICAgcmVzdWx0W25hbWVdID0ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYycsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGlzQXJyYXkpIHtcbiAgICAgICAgICAgICAgICBuYW1lID0gaXNBcnJheVsxXVxuICAgICAgICAgICAgICAgIGlmIChuYW1lIGluIGFycmF5cykgXG4gICAgICAgICAgICAgICAgICAgIGFycmF5c1tuYW1lXS5jb3VudCsrIFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgYXJyYXlzW25hbWVdID0geyBjb3VudDogMSwgdHlwZTogdW5pZm9ybS50eXBlIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdFtuYW1lXSA9IHsgXG4gICAgICAgICAgICAgICAgdHlwZTogZ2V0VHlwZSh1bmlmb3JtLnR5cGUsIGlzQXJyYXkpLCBcbiAgICAgICAgICAgICAgICB2YWx1ZTogaXNBcnJheSA/IG51bGwgOiBkZWZhdWx0VmFsdWUodW5pZm9ybS50eXBlKSBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICAvL25vdyBjbGVhbiB1cCBhbnkgYXJyYXkgdmFsdWVzXG4gICAgICAgIGZvciAodmFyIGsgaW4gcmVzdWx0KSB7XG4gICAgICAgICAgICB2YXIgdSA9IHJlc3VsdFtrXVxuICAgICAgICAgICAgaWYgKGsgaW4gYXJyYXlzKSB7IC8vaXMgYW4gYXJyYXlcbiAgICAgICAgICAgICAgICB2YXIgYSA9IGFycmF5c1trXVxuICAgICAgICAgICAgICAgIHUudmFsdWUgPSBkZWZhdWx0VmFsdWUoYS50eXBlLCB0cnVlLCBhLmNvdW50KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlIl19
