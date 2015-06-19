var AssimpJSONLoader = require('../../vendor/AssimpJSONLoader')

var statics = {
	tree : null
}

function _loadTreePromise() {
	
	return new Promise(function( resolve, reject ) {
		
		if( statics.tree ) {
			resolve( statics.tree )
			return
		}
		
		var loader = new THREE.AssimpJSONLoader();
		
		var doneLoading = function ( object ) {
			_updateMaterials( object )
			statics.tree = object
			resolve( object )
		}
		var onProgress = function() {}
		
		loader.load(
			'./js/components/models/tree.json',
			doneLoading,
			onProgress,
			reject
		);
	})	
}

function _updateMaterials( obj ) {
	
	if( obj.material ) {
		obj.material.side = THREE.DoubleSide
		obj.material.shading = THREE.SmoothShading
		obj.material.specular = new THREE.Color(0x555555)
		obj.material.shininess = 1
	}
	
	for( var i=0; i < obj.children.length; i++ ) {
		_updateMaterials( obj.children[i] )
	}
}

module.exports = function createTree( poem, props ) {
	
	var config = _.extend({
		position: [0,0,0],
		scale:    [10,10,10],
	}, props)
	
	var geometry = new THREE.SphereGeometry( 20, 32, 32 );
	var material = new THREE.MeshPhongMaterial( {color: 0xffff00} );
	var sphere = new THREE.Mesh( geometry, material );
	sphere.position.x = 20
	poem.scene.add( sphere );
	
	return _loadTreePromise().then(function( tree ) {
		
		poem.scene.add( tree )
		tree.position.fromArray( config.position )
		tree.scale.fromArray( config.scale )
		
		window.tree = tree.children[0].children[0]
		
		return tree
	})
}