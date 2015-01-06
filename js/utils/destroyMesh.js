module.exports = function destroyMesh( obj ) {
	return function() {
		if( obj.geometry ) obj.geometry.dispose();
		if( obj.material ) obj.material.dispose();
	};
};