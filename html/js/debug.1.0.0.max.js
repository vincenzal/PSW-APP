/* Copyright (C) 2016 by Alexander Vincenz, http://www.vincenz.at */
(function ( $ ) {
	"use strict"; 
    $.debug = function( o ) {
		if ( typeof console === 'object' ) {
			console.log( o );
		} else {
			alert( o );	
		}
    }; 
}( jQuery ));