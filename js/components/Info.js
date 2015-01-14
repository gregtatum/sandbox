var Info = function( poem, properties ) {
	
	var originalTitle = document.title;
	
	var $appendCredits = $( properties.appendCredits );
	
	if( properties.appendCredits ) $('.credits').append( $appendCredits );
	if( properties.title ) $("#info-title").text( properties.title );
	if( properties.subtitle ) $("#info-subtitle").text( properties.subtitle);
	
	if( properties.titleCss ) $("#info-title").css( properties.titleCss );
	if( properties.subtitleCss ) $("#info-subtitle").css( properties.subtitleCss );
	
	
	if( properties.documentTitle ) document.title = properties.documentTitle;
	
	if( properties.showArrowNext ) $(".arrow-next").show();

	$("#info").show();
	
	poem.emitter.on('destroy', function() {
		document.title = originalTitle;
		$("#info-title").text('');		
		$("#info-subtitle").text('');
		$("#info-title").attr('style', '');
		$("#info-subtitle").attr('style', '');
		$(".arrow-next").hide();
		$("#info").hide();
		$appendCredits.remove();
	});
	
};

module.exports = Info;