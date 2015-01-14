var RotateAroundOrigin = function( poem ) {
	
	var camera = poem.camera.object;
	var speed = 0.00005;
	var baseY = camera.position.y;
	var baseZ = camera.position.z / 2;
	
	poem.emitter.on('update', function( e ) {
		
		poem.grid.grid.rotation.y += e.dt * speed;
		if( poem.pointcloud.object ) {
			poem.pointcloud.object.rotation.y += e.dt * speed;
		}
		
		camera.position.y = baseY + Math.sin( e.now * speed * 10 ) * 200;
		camera.position.z = baseY + Math.sin( e.now * speed * 10 ) * baseZ;
		
		
	});
	
};

module.exports = RotateAroundOrigin;

RotateAroundOrigin.prototype = {

};