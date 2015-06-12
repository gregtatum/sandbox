module.exports = function createRenderer( poem, properties ) {

	var config = _.extend({
		clearColor : 0x222222,
		addToDom : true
	}, properties)
	
	var renderer = new THREE.WebGLRenderer()
	
	renderer.setPixelRatio( poem.ratio )
	renderer.setClearColor( config.clearColor )
	
	if( config.addToDom ) {
		document.getElementById( 'container' ).appendChild( renderer.domElement )
		poem.canvas = renderer.domElement
		
		poem.emitter.on( 'destroy', function() {
			renderer.domElement.remove()
		})
	}
	
	return renderer
	
}