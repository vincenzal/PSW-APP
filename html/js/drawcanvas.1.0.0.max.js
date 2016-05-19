/* Copyright (C) 2016 by Alexander Vincenz, http://www.vincenz.at */
(function ( $ ) {
	"use strict"; 
    $.fn.drawCanvasField = function( options ) {
		var settings = $.extend({
            width: $(this).width(), 	// define width of canvas
            height: $(this).height(), 	// define height of canvas
			icon: 'images/pen.svg', 	// define draw icon
			iconOffsetX: 0,				// x-offset of icon to dot 
			iconOffsetY:-20,			// y-offset of icon to dot 
			position: 'relative', 		// relative, absolute, fixed allowed for positioning the container
			prefix: 'dCF_', 			// define prefix if conflicts
			dotSize: 2, 				// size of drawing dot
			dotColor: '#000000', 		// color of dots
			drawMode: 'line', 			// allowed modes 'line' or 'dots'
			touch: true					// only touch-events or only mouse-events
        }, options );
		
		var draw = {
			drawIcon: settings.icon !== '',
			icon:null,
			drawing:false,
			old_x:-1,
			old_y:-1,
			makeDot:function( x, y ) {
				var ctx = canvas.get(0).getContext('2d');
				ctx.fillStyle = settings.dotColor;
				ctx.beginPath();
				ctx.arc( x, y, settings.dotSize, 0, 2*Math.PI );
				ctx.fill();
				ctx.closePath();								
			},
			makeLine:function( x, y ) {
				var ctx = canvas.get(0).getContext('2d');
				ctx.fillStyle = settings.dotColor;
				ctx.lineWidth = settings.dotSize * 2;
				ctx.beginPath();
				if ( draw.old_y === -1 ) {					
					ctx.arc( x, y, settings.dotSize, 0, 2*Math.PI );
					ctx.fill();
				} else {					
					ctx.moveTo( draw.old_x, draw.old_y );
					ctx.lineTo( x, y );
					ctx.stroke();
				}
				ctx.closePath();								
				draw.old_x = x;
				draw.old_y = y;
			},
			stopDrawing:function() {
				draw.drawing = false;
				draw.old_x = -1;
				draw.old_y = -1;	
			},
			getPos:function(e,t) {
				var x,y;
				var isTouch = typeof e.originalEvent === 'object' && typeof e.originalEvent.touches === 'object' && typeof e.originalEvent.touches[0] === 'object' && typeof e.originalEvent.touches[0].clientX === 'number';
				if ( !isTouch ) {
					x = e.offsetX; 
					y = e.offsetY;			
				} else {
					var offset = $(t).offset();
					x = e.originalEvent.touches[0].clientX - offset.left; 
					y = e.originalEvent.touches[0].clientY - offset.top;		
				}
				return {x:x,y:y};
			}
		};
		
		// empty element
		$( this ).empty(); 

		// css the container
		$( this ).css({
			position: settings.position,
			overflow:'hidden'
		});
		
		//create canvas
		var canvas = $( '<canvas></canvas>' ).attr( {
			width:settings.width,
			height:settings.height
		}).appendTo( this );

		//

		//draw icon
		if ( draw.drawIcon ) {
			//canvas.css({ cursor:'none' });	
			draw.icon = $( '<img src="'+ settings.icon +'" id="'+settings.prefix+'drawIcon">' ).css({ 
				pointerEvents:'none',
				width:20,
				height:20,
				position:'absolute',
				top:-20,
				left:0
			} );
			$( this ).append( draw.icon	);
									
		}
		
		canvas.on( settings.touch ? 'touchmove' : 'mousemove', function( e ) {
			var pos = draw.getPos(e,this);
			
			if ( draw.drawIcon && !settings.touch ) {
				draw.icon.css({ top:pos.y+settings.iconOffsetY, left:pos.x+settings.iconOffsetX });
			}	
			
			if ( draw.drawing ) {
				if (settings.drawMode === 'dots') { draw.makeDot( pos.x, pos.y ); } else { draw.makeLine( pos.x, pos.y ); }
			}
			
			if ( settings.touch ) {
				return false;	
			}
								
		});



		canvas.on( settings.touch ? 'touchstart' : 'mousedown', function( e ) {
			var pos = draw.getPos(e,this);

			draw.drawing = true;	
			if (settings.drawMode === 'dots') { draw.makeDot( pos.x, pos.y ); } else { draw.makeLine( pos.x, pos.y ); }
			
		});
		
		if ( settings.touch ) {
			$( document ).on( 'touchend', function() {
				draw.stopDrawing();
				if ( draw.drawIcon ) {
					draw.icon.css({ top:-20, left:0 });
				}	
			});
			
		} else {
			canvas.on( 'mouseup', function() {
				draw.stopDrawing();
			});
			canvas.on( 'mouseleave', function() {
				if ( draw.drawIcon ) {
					draw.icon.css({ top:-20, left:0 });
				}						
				draw.stopDrawing(); // stop drawing after leaving the canvas
			});
		}

        return this;
    };
 
 	// ------------------------------------------------
	
    $.fn.clearCanvasField = function() {
		
		$( 'canvas', this ).each( function() {
			var ctx = this.getContext( '2d' );
			var width = $(this).width();
			var height = $(this).height();
			ctx.beginPath();
			ctx.clearRect(0,0,width,height);
			ctx.closePath();			
		});
		
	};
 
}( jQuery ));