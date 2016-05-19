(function($){ 
	"use strict";	
	$( document ).ready( function() {
		$( '#signit' ).drawCanvasField({
			dotSize:1,
				
		});	
	});	


	$( document ).on( 'click', '#btn_delete', function(e) {
		e.preventDefault();
		$( '#signit' ).clearCanvasField();
	});
	
	/*
	*	deactivate all form submits
	*/
	$( document ).on( 'submit', 'form', function(e) { 
		e.preventDefault(); 
		$.debug( 'submit blocked' );
		return false; 
	} );
	
}(jQuery));