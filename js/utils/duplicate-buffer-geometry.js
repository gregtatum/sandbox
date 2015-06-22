function _newBuffer( finalVertCount, itemSize ) {
	
	var arrayBuffer = new Float32Array( finalVertCount * itemSize )
	return new THREE.BufferAttribute( arrayBuffer, itemSize )
}

function _duplicateBuffer( bufferA, bufferB, vertsPerInstance, n ) {
	
	var offsetSize = vertsPerInstance * bufferA.itemSize
	
	for( var i=0; i < n; i++ ) {
		
		var offset = i * offsetSize 
		
		for( var j = 0 ; j < offsetSize; j++ ) {
			
			bufferB.array[ offset + j ] = bufferA.array[ j ]
		}
	}
}

function _addIndices( geometry, vertsPerInstance, n ) {
	
	var arrayBuffer = new Float32Array( n * vertsPerInstance )
	
	for( var i=0; i < n; i++ ) {
		
		var offset = i * vertsPerInstance
		
		for( var j=0; j < vertsPerInstance; j++ ) {
			
			arrayBuffer[ offset + j ] = i
		}
	}
	
	var bufferAttribute = new THREE.BufferAttribute( arrayBuffer, 1 )
	
	geometry.addAttribute( 'attributeIndex', bufferAttribute )
	geometry.attributes.attributeIndex.needsUpdate = true
}

module.exports = function duplicateBufferGeometry( geometry, n ) {
	
	var positionA = geometry.attributes.position
	var normalA   = geometry.attributes.normal
	var uvA       = geometry.attributes.uv
	
	var vertsPerInstance = positionA.array.length / 3
	var finalVertCount = vertsPerInstance * n
	
	var positionB = _newBuffer( finalVertCount, 3 )
	var normalB   = _newBuffer( finalVertCount, 3 )
	var uvB       = _newBuffer( finalVertCount, 2 )
	
	_duplicateBuffer( positionA, positionB, vertsPerInstance, n )
	_duplicateBuffer(   normalA,   normalB, vertsPerInstance, n )
	_duplicateBuffer(       uvA,       uvB, vertsPerInstance, n )
	
	geometry.attributes.position = positionB
	geometry.attributes.normal   = normalB
	geometry.attributes.uv       = uvB
	
	_addIndices( geometry, vertsPerInstance, n )
	
	return geometry
}