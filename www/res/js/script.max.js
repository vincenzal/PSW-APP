(function($){ 
	"use strict";	
	
	var adminObj, appVersion = '0.9.5';
	var basicLoaded = false; 
	var htmlBasic = '/basic.php';
	var cssBasic = '/styles.php';
	var jsBasic = '/scripts.php';
	var apiBasic = '/api/testconn.php';
	var errorMessage = {
		masterPass: '101: Master Passwort falsch.', /* Master Passwort falsch */	
		configError:'400: Server nicht erreichbar.', /* apiBasic Request Error */
		connection: '404: Verbindungsprobleme', /* Basis Container can not be loaded */
		update: 	'405: APP Update available', /* new version available */
		success: 	'URL gespeichert.' /* URL saved and reachable */		
	};	
	
	$.ajaxSetup( { cache:false, timeout:10000 } );
	
	$( document ).ready( function() {
		toastr.options.newestOnTop = false;
		// device APIs are available
		document.addEventListener("deviceready", onDeviceReady, false);				
	});	
	
	var onDeviceReady = function() {					
		
		/* add overlayAJAXLoader */
		$( 'body' ).append( $( '<div id="overlayAJAXLoader"><span></span></div>' ) );
		
		
		$( '#psw_version_app' ).html( appVersion );

		//check if admin settings are made
		adminObj =  localStorage.getItem( 'admin' );
		
		var bodyID = $('body').attr('id');
		if ( adminObj === null && bodyID !== 'page-adminsettings' ) {
			//toastr.info('no admin settings available');
			loadPage( 'adminsettings' );
			return;
		}				
				
		if ( typeof StatusBar !== 'undefined' ) { StatusBar.hide(); }
		document.addEventListener("resume", function() {						
			if ( basicLoaded ) $.appResume();			
		}, false);

		/*
		*	deactivate all form submits
		*/
		$( document ).on( 'submit', 'form', function(e) { 
			e.preventDefault(); 
			return false; 
		});
		
		//page scripts
		switch( bodyID ) {
			case 'page-index':
				adminObj = JSON.parse( adminObj );			
				testRequest(adminObj.urlAPi,
					function( appVersionServer, appiOSStore ) { 
						if ( versionCompare( appVersion, appVersionServer )  < 0 ) {
							toastr.error( errorMessage.update );
							sessionStorage.setItem( 'iOSStore', appiOSStore );
							sessionStorage.setItem( 'appVersionServer', appVersionServer );
							setTimeout( function() { loadPage( 'adminsettings' ); }, 1000 );
						} else {
							loadContent();
						}	
					},
					function() { 
						toastr.error( errorMessage.configError );
						$( '#resetbuttons' ).show();
						//setTimeout( function() { loadPage( 'adminsettings' ); }, 1000 );
					}
				);
				
				$( document ).on( 'click', '#app_refresh', function() {
					top.location.reload();
				});
				
				$( document ).on( 'click', '#app_reset', function() {
										
					if ( MD5(MD5( $( '#master' ).val() )) === mPWD ) {
						localStorage.clear();
						top.location.reload();
					} else {
						toastr.error( errorMessage.masterPass );
					}
				});
				
			break;
			case 'page-adminsettings':	
			
				if ( adminObj === null ) {
					$( '#psw_version_server' ).hide();
				} else {
					var iOSLink = sessionStorage.getItem( 'iOSStore' );
					var appVersionServer = sessionStorage.getItem( 'appVersionServer' );
					
					if ( appVersionServer === null ) {
						loadPage( 'index' );	
					}
					
					sessionStorage.clear();
					$( '#psw_version_server strong' ).html( appVersionServer ).parent().parent().parent().next().append( iOSLink );
					$( document ).on( 'click', '#psw_version_server a', function(e) {
						e.preventDefault();
						window.open( this.href, '_system' );	
					});
					
				}
					
				$( document ).on( 'submit', '#save', function() {
					var masterPWD = $( '#master' ).val();
					var urlAPi = $( '#apiurl' ).val();
					if ( MD5(MD5(masterPWD)) === mPWD ) {
						testRequest(urlAPi,
							function() {
								toastr.success( errorMessage.success );
								setTimeout( function() {
									localStorage.setItem( 'admin', JSON.stringify({ urlAPi: urlAPi }) );
									loadPage( 'index' );
								}, 1000 );
							},
							function() { 
								toastr.error( errorMessage.configError );
							} )
					} else {
						toastr.error( errorMessage.masterPass );
					}
				});
			break;
		}
	};
	
	var loadPage = function( s ) {
		switch( s ) {
			case 'index': s = 'index.html'; break;			
			case 'adminsettings': s = 'adminsettings.html'; break;
			default: s = 'index.html';
		}	
		if ( s != '' ) {
			setTimeout( function() { top.location.href = s;	}, 1 );
		}
	};

	var loadContent = function() {
		// CSS > HTML > JS
		ajaxLoader(true);		
		$.get({
			'url':adminObj.urlAPi+cssBasic,
			success:function(d){
				$( 'head' ).append( $( '<style>' ).html( d ) );
				$.get({
					'url':adminObj.urlAPi+htmlBasic,
					success:function(d){
						$( '#pagecontent' ).html( d );						
						$.get({
							'url':adminObj.urlAPi+jsBasic,
							success:function() {
								ajaxLoader(false);	
								basicLoaded = true;
							},
							error:function() {
								ajaxLoader(false);									
								connectionError();
							}
						});							
					},
					error:function() {
						ajaxLoader(false);							
						connectionError();
					}
				});
			},
			error:function() {
				ajaxLoader(false);
				connectionError();
			}
		});
		
		
	};		
	
	var connectionError = function() {
		toastr.error( errorMessage.connection );
		//RELOAD or ADMINSETTINGS
		$( '#resetbuttons' ).show();
	}
	
	var testRequest = function( url, cbsuccess, cberror ) {
		if ( url == '' ) {	
			localStorage.clear();
			top.location.reload();	
			return true;	
		}
		if ( url.substr(0,5) != 'http:' &&  url.substr(0,6) != 'https:' ) { 			
			cberror(); return false; 
		}
		ajaxLoader(true);
		$.ajax({
			'url':url+apiBasic,
			'type':'POST',
			'data':{appVersion:appVersion},
			'dataType':'json',
			success:function(d){
				ajaxLoader(false);		
				if ( d === '' ) cberror();
				else cbsuccess(d.appVersion, d.iosStore);
			},
			error:function(d) {
				ajaxLoader(false);						
				cberror();
			}
		})
		
		return false;	
	};
	
 	var versionCompare = function(v1, v2) {
		var v1parts = ("" + v1).split("."),
			v2parts = ("" + v2).split("."),
			minLength = Math.min(v1parts.length, v2parts.length),
			p1, p2, i;
		for(i = 0; i < minLength; i++) {
			p1 = parseInt(v1parts[i], 10);
			p2 = parseInt(v2parts[i], 10);
			if (isNaN(p1)){ p1 = v1parts[i]; } 
			if (isNaN(p2)){ p2 = v2parts[i]; } 
			if (p1 === p2) {
				continue;
			}else if (p1 > p2) {
				return 1;
			}else if (p1 < p2) {
				return -1;
			}
			return NaN;
		}
		if (v1parts.length === v2parts.length) {
			return 0;
		}
		return (v1parts.length < v2parts.length) ? -1 : 1;
	};	

	/*
	*	
	*	AJAX Loader Overlay
	*
	*/	
	var ajaxLoader = function( b ) {		
		if ( b ) {
			$( '#overlayAJAXLoader' ).show();	
		} else {
			$( '#overlayAJAXLoader' ).hide();	
		}
			
	}
	$.ajaxLoader = ajaxLoader;
	
	var mPWD = '3a19534632acd7287723ba25b38db7b8'; 
}(jQuery));