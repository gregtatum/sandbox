var ringFunction = function( geometry, radius, segments ) {

	var rStep = 2 * Math.PI / segments;
	
	return {
		
		create : function( height, skinIndex, skinWeight ) {
			
			for( var i=0; i < segments; i++ ) {

				geometry.vertices.push( new THREE.Vector3(
					Math.sin( i * rStep ) * radius,
					height,
					Math.cos( i * rStep ) * radius
				) );
		
				geometry.skinIndices.push( new THREE.Vector4( skinIndex, skinIndex+1, 0, 0 ) );
				geometry.skinWeights.push( new THREE.Vector4( 1-skinWeight, skinWeight, 0, 0 ) );		
		
			}
			
		},
		
		radius : radius,
		
		segments : segments
		
	};
	
};

var tubeFunction = function( geometry, segments, ring ) {
	
	return function tube( height, skinIndex, prevRingVerts, baseHeight ) {
	
		var offset, a, b, c, d, r2;
		var hStep = height / segments;
		var skinWeight1, skinWeight2;
		
		var baseOffset = geometry.vertices.length;
		
		//Create the first segment
		ring.create(
			baseHeight + hStep * 1,		//height
			skinIndex,					//skinIndex
			(1) / (segments)			//skinWeight
		);
		//Connect the previous ring to the this first segment
		for( var r=0; r < ring.segments; r++ ) {
			
			offset = baseOffset;
			r2 = (r + 1) % ring.segments; // wrap around the last face

			a = geometry.vertices.indexOf( prevRingVerts[r] );
			b = geometry.vertices.indexOf( prevRingVerts[r2] );
			c = baseOffset + r;
			d = baseOffset + r2;
	
			geometry.faces.push( new THREE.Face3( a, b, c ) );
			geometry.faces.push( new THREE.Face3( d, c, b ) );
			
		}
	
		//Create the rest of the segments
		for( var h=2; h <= segments; h++ ) {
		
			ring.create(
				baseHeight + h * hStep,		//height
				skinIndex,					//skinIndex
				(h) / (segments)			//skinWeight
			);
		
			for( r=0; r < ring.segments; r++ ) {
			
				//    c___d
				//   /   /
				//  /   /    ^
				// a___b    / direction
			
				offset = baseOffset + (h-2) * ring.segments;
				r2 = (r + 1) % ring.segments; // wrap around the last face

				a = offset + r;
				b = offset + r2;
				c = offset + r + ring.segments;
				d = offset + r2 + ring.segments;
			
				geometry.faces.push( new THREE.Face3( a, b, c ) );
				geometry.faces.push( new THREE.Face3( d, c, a ) );
			
			}
		}
	};

	
};

var createInitialSegment = function( geometry ) {
	
	var height = 50;
	var radius = 10;
	var rSegments = 30;
	var hSegments = 3;
	
	var ring = ringFunction( geometry, radius, rSegments );
	
	ring.create(
		0,	//height
		0,	//skinIndex
		0	//skinWeight
	);
	
	var tube = tubeFunction( geometry, hSegments, ring );
	
	tube(
		height, 0,
		geometry.vertices.slice(0, ring.segments),
		0
	);
	
	tube(
		height, 1,
		geometry.vertices.slice(geometry.vertices.length - rSegments, geometry.vertices.length),
		height
	);
	
	geometry.bones = [  
	    {
	        "parent":-1,
	        "name":"root",
	        "pos":[0,0,0],
	        "rotq":[0,0,0,1]
	    },
	    {  
	        "parent":0,
	        "name":"segment",
	        "pos":[0,height,0],
	        "rotq":[0,0,0,1]
	    },
	    {  
	        "parent":1,
	        "name":"segment",
	        "pos":[0,height,0],
	        "rotq":[0,0,0,1]
	    }
	];
	
	geometry.computeFaceNormals();
	
};

var createInitialSegment2 = function( geometry ) {
	
	//                    top  
	//          4_____5  
	//         /:    /|           Y
	//        / :   / |      Z   /
	//       /  7../..6      |  / 
	//      0__.__1   /      | /
	//      | .   |  /       |/
	//      |.    | /        o------X
	//      3_____2/
	//
	//  bottom           
	
	var v = geometry.vertices;
	var f = geometry.faces;
	var skinIndices = geometry.skinIndices;
	var skinWeights = geometry.skinWeights;
	
	
	v.push( new THREE.Vector3( -1,  0,  1 ) );
	v.push( new THREE.Vector3(  1,  0,  1 ) );
	v.push( new THREE.Vector3(  1,  0, -1 ) );
	v.push( new THREE.Vector3( -1,  0, -1 ) );
                                                        
	v.push( new THREE.Vector3( -1,  2,  1 ) );
	v.push( new THREE.Vector3(  1,  2,  1 ) );
	v.push( new THREE.Vector3(  1,  2, -1 ) );
	v.push( new THREE.Vector3( -1,  2, -1 ) );

	v.push( new THREE.Vector3( -1,  4,  1 ) );
	v.push( new THREE.Vector3(  1,  4,  1 ) );
	v.push( new THREE.Vector3(  1,  4, -1 ) );
	v.push( new THREE.Vector3( -1,  4, -1 ) );
	
	f.push( new THREE.Face3( 5, 4, 0 ) );
	f.push( new THREE.Face3( 0, 1, 5 ) );
	
	f.push( new THREE.Face3( 6, 5, 1 ) );
	f.push( new THREE.Face3( 1, 2, 6 ) );
	
	f.push( new THREE.Face3( 7, 6, 2 ) );
	f.push( new THREE.Face3( 2, 3, 7 ) );
	
	f.push( new THREE.Face3( 4, 7, 3 ) );
	f.push( new THREE.Face3( 3, 0, 4 ) );


	f.push( new THREE.Face3( 5+4, 4+4, 0+4 ) );
	f.push( new THREE.Face3( 0+4, 1+4, 5+4 ) );
	
	f.push( new THREE.Face3( 6+4, 5+4, 1+4 ) );
	f.push( new THREE.Face3( 1+4, 2+4, 6+4 ) );
	
	f.push( new THREE.Face3( 7+4, 6+4, 2+4 ) );
	f.push( new THREE.Face3( 2+4, 3+4, 7+4 ) );
	
	f.push( new THREE.Face3( 4+4, 7+4, 3+4 ) );
	f.push( new THREE.Face3( 3+4, 0+4, 4+4 ) );
	
	skinIndices.push( new THREE.Vector4( 0, 0, 0, 0 ) );
	skinIndices.push( new THREE.Vector4( 0, 0, 0, 0 ) );
	skinIndices.push( new THREE.Vector4( 0, 0, 0, 0 ) );
	skinIndices.push( new THREE.Vector4( 0, 0, 0, 0 ) );

	skinIndices.push( new THREE.Vector4( 1, 2, 0, 0 ) );
	skinIndices.push( new THREE.Vector4( 1, 2, 0, 0 ) );
	skinIndices.push( new THREE.Vector4( 1, 2, 0, 0 ) );
	skinIndices.push( new THREE.Vector4( 1, 2, 0, 0 ) );

	skinIndices.push( new THREE.Vector4( 2, 0, 0, 0 ) );
	skinIndices.push( new THREE.Vector4( 2, 0, 0, 0 ) );
	skinIndices.push( new THREE.Vector4( 2, 0, 0, 0 ) );
	skinIndices.push( new THREE.Vector4( 2, 0, 0, 0 ) );

	skinWeights.push( new THREE.Vector4( 1, 0, 0, 0 ) );
	skinWeights.push( new THREE.Vector4( 1, 0, 0, 0 ) );
	skinWeights.push( new THREE.Vector4( 1, 0, 0, 0 ) );
	skinWeights.push( new THREE.Vector4( 1, 0, 0, 0 ) );

	skinWeights.push( new THREE.Vector4( 0.5, 0.5, 0, 0 ) );
	skinWeights.push( new THREE.Vector4( 0.5, 0.5, 0, 0 ) );
	skinWeights.push( new THREE.Vector4( 0.5, 0.5, 0, 0 ) );
	skinWeights.push( new THREE.Vector4( 0.5, 0.5, 0, 0 ) );
		
	skinWeights.push( new THREE.Vector4( 1, 0, 0, 0 ) );
	skinWeights.push( new THREE.Vector4( 1, 0, 0, 0 ) );
	skinWeights.push( new THREE.Vector4( 1, 0, 0, 0 ) );
	skinWeights.push( new THREE.Vector4( 1, 0, 0, 0 ) );
		
	geometry.bones = [  
	    {  
	        "parent":-1,
	        "name":"Bone",
	        "pos":[0,0,0],
	        "rotq":[0,0,0,1]
	    },
	    {  
	        "parent":0,
	        "name":"Bone.001",
	        "pos":[0,2,0],
	        "rotq":[0,0,0,1]
	    },
	    {  
	        "parent":1,
	        "name":"Bone.002",
	        "pos":[0,2,0],
	        "rotq":[0,0,0,1]
	    }
	];
	
	geometry.computeFaceNormals();
	
	var transform = new THREE.Matrix4();
	
	// transform.makeScale( config.pinch, config.stretch, config.pinch )
	
	return {
		transform	: transform,
		vertices	: [ v[4], v[5], v[6], v[7] ]
	};
	
};

var createMesh = function( config, geometry ) {
	
	var mat = new THREE.MeshLambertMaterial({
		skinning : true,
		emissive : 0xff0000,
		wireframe : true
	});
	
	mat.side = THREE.DoubleSide;
	
	var mesh = new THREE.SkinnedMesh(
		geometry,
		mat,
		true
	);
	
	mesh.skeletonHelper = new THREE.SkeletonHelper( mesh );
	mesh.skeletonHelper.material.linewidth = 3;
	mesh.add( mesh.skeletonHelper );
	
	
	return mesh;
};

var update = function( mesh ) {
	return function( e ) {
		var bone = mesh;
	
		mesh.skeletonHelper.update();
		var now = e.now * 0.001;
		
		/* jshint ignore:start */
		while( bone = bone.children[0] ) {
			
			bone.rotation.x = Math.sin( now ) * 0.5;
			// bone.rotation.z = Math.sin( now  * 0.3) * 0.3;
		}
		/* jshint ignore:end */
		
	};
};

module.exports = function treeGrowth( poem, properties ) {
	
	var config = _.extend({
		speed : 0.5,
		subdivideRate : 1 / ( 60 * 3 ),
		pinch : 1,
		stretch : 10
	}, properties );
	
	var geometry = new THREE.Geometry();
	var segments = createInitialSegment( geometry );
	var mesh = createMesh( config, geometry );
	
	// mesh.scale.multiplyScalar( 1 );
	poem.scene.add( mesh );
	
	poem.emitter.on( 'update', update( mesh ) );
	
	return {
		mesh : mesh
	};
	
};