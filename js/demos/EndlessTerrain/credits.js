var LoadImage = require('../../utils/loadImage')

var internals = {
	
	createTexture : function( video ) {
		
		var canvas = document.createElement( 'canvas' )
		canvas.width = 1024
		canvas.height = 256

		var ctx2d = canvas.getContext( '2d' )

		ctx2d.fillStyle = '#0ff000' // background color if no video present
		ctx2d.fillRect( 0, 0, canvas.width, canvas.height )

		var texture = new THREE.Texture( canvas )
		texture.minFilter = THREE.LinearFilter
		texture.magFilter = THREE.LinearFilter
		
		return [ canvas, ctx2d, texture ]
	},
	
	createVideo : function() {
		
		return new Promise(function( resolve, reject ) {
			
			var video = document.createElement( 'video' )
			var $video = $(video)

			// video.muted = true
			video.controls = false
			video.loop = false
		
			video.src = video.canPlayType("video/mp4") ?
				"assets/video/gene.sys.mp4" :
				"assets/video/gene.sys.webm"
		
			video.load()
			
			$(video).on('canplaythrough', () => { resolve( video ) })
			$(video).on('error, stalled, abort', (e) => { reject( e.originalEvent ) })
		})
		
	},
	
	createMesh : function( poem, texture, canvas ) {
		
		var mesh = new THREE.Mesh(
			new THREE.PlaneGeometry( canvas.width, canvas.height ),
			new THREE.MeshBasicMaterial({
				color: 0xffffff
			  , transparent: true
			  , side: THREE.DoubleSide
			  // , map: texture
			  , alphaMap: texture
			})
		)
		return mesh
	},
	
	updateFn : function( mesh, ctx2d, video, texture ) {
		
		return function() {
			
			if ( video.readyState === video.HAVE_ENOUGH_DATA && video.ended === false ) {
				
				ctx2d.drawImage( video, 0, 0 );
				texture.needsUpdate = true;
			}
		}
	},
	
	add : ( cameraObj, mesh, video, update ) => {
		
		mesh.scale.set(0.005, 0.005, 0.005)
		mesh.position.z = -10
		mesh.position.y = 0.2
		cameraObj.add( mesh )
		
		setTimeout(function() {
			console.warn('TODO: remove setTimeout')
			video.currentTime = 0
			video.play()
		
			poem.emitter.on( 'update', update )
			
		}, 2000)
	},
	
	remove : ( cameraObj, mesh, video, update ) => {
		
		cameraObj.remove( mesh )
		video.pause(0)
		
		
		poem.emitter.removeListener( 'update', update )
	}
	
	
}

module.exports = function( poem ) {
	
	var api = {
		promise : internals.createVideo()
	}
		
	api.promise.then( function( video ) {
		
		var [ canvas, ctx2d, texture ] = internals.createTexture( video )
		var mesh = internals.createMesh( poem, texture, canvas )
		
		var update = internals.updateFn( mesh, ctx2d, video, texture )
		
		_.extend( api, {
			mesh    : mesh
		  , canvas  : canvas
		  , ctx2d   : ctx2d
		  , texture : texture
		  , video   : video
		  , add     : _.partial( internals.add,    poem.camera.object, mesh, video, update )
		  , remove  : _.partial( internals.remove, poem.camera.object, mesh, video, update )
		})
	})
	
	return api
}