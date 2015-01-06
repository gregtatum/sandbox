var selectors = function( scopeOrSelector, selectors, allowEmptySelections ) {
	
	var $scope = $( scopeOrSelector );
	
	return _.reduce( selectors, function( memo, selector, key ) {
		
		memo[key] = $( selector, $scope );
		
		if( !allowEmptySelections ) {
			if( memo[key].length === 0 ) {
				throw new Error("Empty selections are not allowed");
			}
		}
		
		return memo;
		
	}, { "scope" : $scope } );
	
};

module.exports = selectors;
