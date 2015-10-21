/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
(function(a){if(typeof define==="function"&&define.amd){define(["jquery"],a)}else{if(typeof exports==="object"){a(require("jquery"))}else{a(jQuery)}}}(function(f){var a=/\+/g;function d(i){return b.raw?i:encodeURIComponent(i)}function g(i){return b.raw?i:decodeURIComponent(i)}function h(i){return d(b.json?JSON.stringify(i):String(i))}function c(i){if(i.indexOf('"')===0){i=i.slice(1,-1).replace(/\\"/g,'"').replace(/\\\\/g,"\\")}try{i=decodeURIComponent(i.replace(a," "));return b.json?JSON.parse(i):i}catch(j){}}function e(j,i){var k=b.raw?j:c(j);return f.isFunction(i)?i(k):k}var b=f.cookie=function(q,p,v){if(p!==undefined&&!f.isFunction(p)){v=f.extend({},b.defaults,v);if(typeof v.expires==="number"){var r=v.expires,u=v.expires=new Date();u.setTime(+u+r*86400000)}return(document.cookie=[d(q),"=",h(p),v.expires?"; expires="+v.expires.toUTCString():"",v.path?"; path="+v.path:"",v.domain?"; domain="+v.domain:"",v.secure?"; secure":""].join(""))}var w=q?undefined:{};var s=document.cookie?document.cookie.split("; "):[];for(var o=0,m=s.length;o<m;o++){var n=s[o].split("=");var j=g(n.shift());var k=n.join("=");if(q&&q===j){w=e(k,p);break}if(!q&&(k=e(k))!==undefined){w[j]=k}}return w};b.defaults={};f.removeCookie=function(j,i){if(f.cookie(j)===undefined){return false}f.cookie(j,"",f.extend({},i,{expires:-1}));return !f.cookie(j)}}));

(function(window, document, settings, undefined) {
	var MediaStreaming = {
		availablePlayers: ["flowplayer", "html5", "jwplayer", "mediaelement", "videojs"],
		player: "videojs", // Default player is set here
		channels: [],
		channel: false,
		live: false,
		
		channelsInterval: false,
		inactivityTimeout: false,
		pingInterval: false
	}
	
	/* Load channel statistics */
	MediaStreaming.LoadChannels = function( enable ) {
		function handler() {
			$.getJSON( "api.json?action=channels", function( data ) {
				MediaStreaming.channels = data.channels;
				/* Set recording buttons default status */
				for (key in MediaStreaming.channels) {
					if ( MediaStreaming.channels[key].recording ) {
						$( ".btn-record[data-channel='" + MediaStreaming.channels[key].name + "']" ).addClass( "recording" );
					}
				};
			});
		};
		
		if ( enable ) {
			channelsInterval = window.setInterval( handler, 60000 );
			handler();
		} else {
			window.clearInterval( channelsInterval );
		}
	};
	
	/* Track mouse activity */
	MediaStreaming.TrackMouseActivity = function( enable ) {
		var handler = function() {
			$( "body" ).removeClass( "mouse-inactive" );
			window.clearTimeout( MediaStreaming.inactivityTimeout );
			MediaStreaming.inactivityTimeout = window.setTimeout(
				function() {
					$( "body" ).addClass( "mouse-inactive" );
				}, 5000
			);
		};
		
		if ( enable ) {
			$( window ).on( "mousemove", handler);
		} else {
			$( "body" ).removeClass( "mouse-inactive" );
			window.clearTimeout( MediaStreaming.inactivityTimeout );
			$( window ).on( "mousemove", handler);
		}
	};
	
	/* Record channel */
	MediaStreaming.RecordChannel = function( enable, channel ) {
		channel = channel || MediaStreaming.channel;
		
		if ( enable === true || enable === "start" ) {
			$.getJSON( "api.json?action=record&channel=" + channel + "&start", function( record ) {
				console.log( "Record start: " + record.file );
			});
			
			MediaStreaming.channels[channel].recording = true;
		}
		else if ( enable === false || enable === "stop" ) {
			$.getJSON( "api.json?action=record&channel=" + channel + "&stop", function( record ) {
				console.log( "Record stop: " + record.file );
			});
			
			MediaStreaming.channels[channel].recording = false;
		}
		else if ( enable === "toggle" ) {
			if ( ! MediaStreaming.channels[channel].recording ) {
				MediaStreaming.RecordChannel( "start", channel );
			} else {
				MediaStreaming.RecordChannel( "stop", channel );
			}
		}
	};
	
	/* Check channel availability */
	MediaStreaming.PingChannel = function( enable, channel ) {
		channel = channel || MediaStreaming.channel;
		
		function handler() {
			$.getJSON( "api.json?action=ping&channel=" + channel, function( ping ) {
				if ( ping.live ) {
					$( "body" ).addClass( "live" );
					if ( !MediaStreaming.live ) $( window ).trigger( "mousemove" );
				} else {
					$( "body" ).removeClass( "live" );
				}
				MediaStreaming.live = ping.live;
			});
		};
		
		if ( enable ) {
			pingInterval = window.setInterval( handler, 5000 );
			handler();
		} else {
			window.clearInterval( pingInterval );
		}
	};

	/* Build live channel player */
	MediaStreaming.BuildLivePlayer = function( player ) {
		player = player || MediaStreaming.player; 
		
		/* Update window title */
		document.title = MediaStreaming.video + " - " + document.title;
		
		/* Channel switcher */
		$( "select.channel" ).on( "change", function() {
			window.location.href = "/?channel=" + $( this ).val();
		});
		
		/* Channel handlers */
		MediaStreaming.TrackMouseActivity(true);
		MediaStreaming.PingChannel(true);
	
		switch( player ) {
			case "flowplayer":
				// DOM preparation
				$( "video#player" ).replaceWith( '<span id="player"></span>' );
				$( "body" ).append( '<script src="js/flowplayer.min.js"></script>' );
				$( "body" ).css( "overflow", "hidden" );
				
				// Flowplayer Player loading
				$f("player", "js/flowplayer.swf", {
					play: { opacity: 0 },
					clip: {
						url: MediaStreaming.channel,
						live: true,
						scaling: "fit",
						provider: "rtmp"
					},
					plugins: {
						rtmp: {
							url: "js/flowplayer.rtmp.swf",
							inBufferSeek: false,
							netConnectionUrl: "rtmp://" + window.location.host + "/live"
						},
						controls: {
							backgroundColor: "rgba(30, 30, 30, 0.3)",
							backgroundGradient: "none",
							
							sliderColor: 'rgba(160, 160, 160, 0.7)',
							sliderBorder: '0.5px solid rgba(160, 160, 160, 0.7)',
							
							volumeSliderColor: 'rgba(160, 160, 160, 0.7)',
							volumeBorder: '0.5px solid rgba(160, 160, 160, 0.7)',
				 
							timeColor: 'white',
							durationColor: '#535353',
				 
							tooltipColor: 'rgba(0, 0, 0, 0.7)',
							tooltipTextColor: 'white',
							
							tooltips: {
								buttons: true,
								fullscreen: 'Fullscreen'
							}
						}
					},
					canvas: {
						backgroundGradient: "none"
					}
				});
				
				break;
			case "jwplayer":
				// DOM preparation
				$( "body" ).append( '<script src="js/jwplayer.min.js"></script>' );
				$( "body" ).css( "overflow", "hidden" );
				
				// JW Player loading
				jwplayer("player").setup({
					sources: [
						{file: "http://" + window.location.host + "/hls/" + MediaStreaming.channel + ".m3u8"},
						{file: "rtmp://" + window.location.host + "/live/flv:" + MediaStreaming.channel + ".flv"}
					],
					width: "100%",
					height: "100%",
					autostart: true,
					analytics: {
						enabled: false,
						cookies: false
					},
					flashplayer: "js/jwplayer.flash.swf",
				});
				
				break;
			case "mediaelement":
				// DOM preparation
				$( "head" ).append( '<link rel="stylesheet" href="css/mediaelementplayer.css">' );
				$( "body" ).append( '<script src="js/mediaelement.min.js"></script>' );
				$( "body" ).append( '<script src="js/mediaelementplayer.min.js"></script>' );
				$( "body" ).css( "overflow", "hidden" );
				
				// MediaElement.js loading
				$( "video#player" ).replaceWith('<video id="player"><source src="' + MediaStreaming.channel + '" type="video/rtmp"></video>');
				$( "#player" ).mediaelementplayer({
					videoWidth: "100%",
					videoHeight: "100%",
					flashStreamer: "rtmp://" + window.location.host + "/live",
					plugins: ['flash', 'silverlight'],
					alwaysShowControls: false,
					success: function (mediaElement, domObject) {
						window.me = mediaElement;
						if (mediaElement.pluginType == 'flash') {
							mediaElement.play();
						}
					}
				});
				
				break;
			case "videojs":
				// DOM preparation
				$( "#player" ).addClass( "video-js vjs-default-skin" );
				$( "head" ).append( '<link rel="stylesheet" href="css/video-js.css">' );
				$( "body" ).append( '<script src="js/video.js"></script>' );
				
				// Video.js Player loading
				videojs.options.flash.swf = "js/video-js.swf"
				videojs("player", {}, function() {
					$( ".vjs-duration-display" ).innerHTML = "Live broadcast";
				});
				$( ".vjs-duration-display" ).html("Live broadcast" )
				
				break;
		}
	}
	
	/* Build recorded video player */
	MediaStreaming.BuildVideoPlayer = function( player ) {
		player = player || MediaStreaming.player; 
		
		/* Update window title */
		document.title = MediaStreaming.video + " - " + document.title;
	
		switch( player ) {
			case "flowplayer":
				// DOM preparation
				$( "video#player" ).replaceWith( '<span id="player"></span>' );
				$( "body" ).append( '<script src="js/flowplayer.min.js"></script>' );
				$( "body" ).css( "overflow", "hidden" );
				
				// Flowplayer Player loading
				$f("player", "js/flowplayer.swf", {
					play: { opacity: 0 },
					clip: {
						url: "http://" + window.location.host + "/rec/" + MediaStreaming.video,
						scaling: "fit",
					},
					plugins: {
						controls: {
							backgroundColor: "rgba(30, 30, 30, 0.3)",
							backgroundGradient: "none",
							
							sliderColor: 'rgba(160, 160, 160, 0.7)',
							sliderBorder: '0.5px solid rgba(160, 160, 160, 0.7)',
							
							volumeSliderColor: 'rgba(160, 160, 160, 0.7)',
							volumeBorder: '0.5px solid rgba(160, 160, 160, 0.7)',
				 
							timeColor: 'white',
							durationColor: '#535353',
				 
							tooltipColor: 'rgba(0, 0, 0, 0.7)',
							tooltipTextColor: 'white',
							
							tooltips: {
								buttons: true,
								fullscreen: 'Fullscreen'
							}
						}
					},
					canvas: {
						backgroundGradient: "none"
					}
				});
				
				break;
			case "jwplayer":
				// DOM preparation
				$( "body" ).append( '<script src="js/jwplayer.min.js"></script>' );
				$( "body" ).css( "overflow", "hidden" );
				
				// JW Player loading
				jwplayer("player").setup({
					file: "http://" + window.location.host + "/rec/" + MediaStreaming.video,
					width: "100%",
					height: "100%",
					autostart: true,
					analytics: {
						enabled: false,
						cookies: false
					},
					flashplayer: "js/jwplayer.flash.swf",
					html5player: "js/jwplayer.html5.js",
				});
				
				break;
			case "mediaelement":
				// DOM preparation
				$( "head" ).append( '<link rel="stylesheet" href="css/mediaelementplayer.css">' );
				$( "body" ).append( '<script src="js/mediaelement.min.js"></script>' );
				$( "body" ).append( '<script src="js/mediaelementplayer.min.js"></script>' );
				$( "body" ).css( "overflow", "hidden" );
				
				$( "#player" ).mediaelementplayer({
					videoWidth: "100%",
					videoHeight: "100%",
					plugins: ['flash', 'silverlight'],
					alwaysShowControls: false,
					success: function (mediaElement, domObject) {
						window.me = mediaElement;
						if (mediaElement.pluginType == 'flash') {
							mediaElement.play();
						}
					}
				});
				
				break;
			case "videojs":
				// DOM preparation
				$( "#player" ).addClass( "video-js vjs-default-skin" );
				$( "head" ).append( '<link rel="stylesheet" href="css/video-js.css">' );
				$( "body" ).append( '<script src="js/video.js"></script>' );
				
				// Video.js Player loading
				videojs("player");
				
				break;
		}
	}
	
	MediaStreaming.init = function( settings ) {
		/* Load channels */
		MediaStreaming.LoadChannels( true );
		
		/* Build popovers */
		$( "[data-toggle=popover][data-seed]" ).popover({
			html: true,
			content: function() {
				return $( "#popover-" + $( this ).data( "seed" ) ).html()
			}
		});
	
		if ( settings.player ) {
			/* Prepare environment */
			$( "body" ).addClass( "player" );
		
			/* Get Channel */
			MediaStreaming.channel = (typeof settings.channel === "undefined") ? false : settings.channel;
			MediaStreaming.video = (typeof settings.video === "undefined") ? false : settings.video;
			
			/* Player */
			// Check cookies
			if ( "undefined" !== typeof $.cookie("player") && -1 !== $.inArray($.cookie("player"), MediaStreaming.availablePlayers) ) {
				MediaStreaming.player = $.cookie("player");
			}
			// Check if player is mobile, Android or iOS, HTML5 fallback
			if ( settings.html5 ) MediaStreaming.player = "html5";
			
			/* Build ! */
			if (MediaStreaming.channel) MediaStreaming.BuildLivePlayer();
			if (MediaStreaming.video) MediaStreaming.BuildVideoPlayer();
		} else {
			/* Settings handlers */
			$( "select[name=form-settings-player] option" ).each( function( key, option ) {
				if ( $( option ).val() === $.cookie("player") ) {
					$( option ).prop( "selected", true );
				}
			});
			$( "form[name=form-settings]" ).on( "submit", function() {
				$.cookie("player", $( "select[name=form-settings-player]" ).val());
			
				return false;
			});
			$( "#modal-settings-save" ).on( "click", function() {
				$( "form[name=form-settings]" ).trigger( "submit" );
			});
			
			/* Display Mode: List/Grid */
			$( "a.display-grid" ).on( "click", function() {
				$( "a.display-list" ).removeClass( "active" );
				$( "a.display-grid" ).addClass( "active" );
			
				$( ".row.list" ).fadeOut( 50, function() {
					$( ".row.grid" ).fadeIn();
				});
				
				$.cookie( "display", "grid" );
			});
			$( "a.display-list" ).on( "click", function() {
				$( "a.display-grid" ).removeClass( "active" );
				$( "a.display-list" ).addClass( "active" );
				
				$( ".row.grid" ).fadeOut( 50, function() {
					$( ".row.list" ).fadeIn();
				});
				
				$.cookie( "display", "list" );
			});
			$( "a.display-grid, a.display-list" ).on( "click", function() { return false; });
			if ( $.cookie( "display" ) == "list" ) {
				$( "a.display-list" ).trigger( "click" );
			} else {
				$( "a.display-grid" ).trigger( "click" );
			}
			
			/* Record channel handlers */
			$( "a.btn-record" ).on( "click", function() {
				MediaStreaming.RecordChannel( "toggle", $( this ).data( "channel" ) );
				if ( MediaStreaming.channels[ $( this ).data( "channel" ) ].recording ) {
					$( this ).addClass( "recording ");
				} else {
					$( this ).removeClass( "recording ");
				}
			});
			
			/* Format specific fields */
			$( "[data-duration]" ).each( function(key, durationElem) {
				var seconds = Math.round( $( this ).data( "duration" ) ),
					minutes = 0,
					hours = 0;
					
				if (seconds >= 60) { minutes = Math.round(seconds / 60); seconds %= 60; }
				if (minutes >= 60) { hours   = Math.round(minutes / 60); minutes %= 60; }
				
				if (seconds < 10) { seconds = "0" + seconds; }
				if (minutes < 10) { minutes = "0" + minutes; }
				if (hours < 10)   { hours   = "0" + hours; }
				
				$( durationElem ).html( hours + ":" + minutes + ":" + seconds );
			});
			$( "[data-size]" ).each( function(key, sizeElem) {
				var size = $( this ).data( "size" ),
					power = 0;
				while ( size > 1024 ) {
					size /= 1024;
					power +=1;
				}
				size = Math.round( size * 100 ) / 100;
				size += " ";
				switch (power) {
					case 1:	size += "K"; break;
					case 2:	size += "M"; break;
					case 3:	size += "G"; break;
				}
				$( sizeElem ).html( size );
			});
			$( "[data-timestamp]" ).each( function(key, timestampElem) {
				$( timestampElem ).html( new Date( $( this ).data( "timestamp" ) ).toJSON().replace("T", " - ").replace(/Z|\.000/g, "") );
			});
		}
	}
	
	MediaStreaming.init( settings );
	
	window.MediaStreaming = MediaStreaming;
})(window, document, settings);	