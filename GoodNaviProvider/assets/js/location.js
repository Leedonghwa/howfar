G.locationModule = (function(distanceModule, bookmarkModule) {
	var my = {};

	var mMap;						// google map
	var mUserMarker = null;			// user marker
	var mDestMarker = null;			// destination marker
	var mDestPlaceInfo = null;		// destination place object
	var mGeodesicPoly;				// used to draw lines
	var mWatchId = null;			// watchPosition ID
	var mIsSearch = false;			// check whether or not CD is working
	var mIsInitDistance = false;	// check current loop is first calculating distance
	var mInfoWindow = new google.maps.InfoWindow();
	var mIsGearConnected = false;
	var mIsAndroidConnected = false;
	var mIsCameraFollowing = false;

	// is used in followUser and onlyMarkUser(look down)
	function drawPolyANDSendDistance(currentPosition) {
		var distance;

		if (mIsSearch) {
			drawPoly(currentPosition, mDestMarker.getPosition());
			distance = G.distanceModule.calcDistance(currentPosition, mDestMarker.getPosition());
			sendDistanceToAndroid(distance);
			G.distanceModule.setDistance(distance);
			G.distanceModule.displayTextDistance();
		}
	}

	function setIsCameraFollowing(following) {
		mIsCameraFollowing = following;
	}

	// is used as a function argument of watchPosition function
	// camera follow user in the map
	var followUser = function (position) {
		setIsCameraFollowing(true);

		var lat = position.coords.latitude;
		var lng = position.coords.longitude;
		var pos = new google.maps.LatLng(lat, lng);
			
		mUserMarker.setVisible(false);
		mUserMarker.setPosition(pos);
		mUserMarker.setVisible(true);
		moveMapByPos(pos);
		
		drawPolyANDSendDistance(pos);
	}

	// is used as a function argument of watchPosition function
	// only mark user 
	var onlyMarkUser = function (position) {
		setIsCameraFollowing(false);

		var lat = position.coords.latitude;
		var lng = position.coords.longitude;
		var pos = new google.maps.LatLng(lat, lng);
			
		mUserMarker.setVisible(false);
		mUserMarker.setPosition(pos);
		mUserMarker.setVisible(true);

		drawPolyANDSendDistance(pos);
	}

	function watchPosition(coreFunction) {
		if (mWatchId != null) {
			clearWatch();
		}

		if (navigator.geolocation) {
	        mWatchId = navigator.geolocation.watchPosition(
				coreFunction,
				function() {
					handleNoGeolocation(true);
				}
			);
		} 
		else {
	        // Browser doesn't support Geolocation
	        handleNoGeolocation(false);
		}
	}

	// stop gps
	function clearWatch() {
		console.log("clearWatch()");
		navigator.geolocation.clearWatch(mWatchId);
	}

	// prevent camera following the user when view move
	function mapMoveEventInit() {
		google.maps.event.addListener(mMap, 'zoom_changed', function() {
			watchPosition(onlyMarkUser);}
		);
		google.maps.event.addListener(mMap, 'dragend', function() {
			watchPosition(onlyMarkUser);}
		);
	}

	// move view to the selected postion
	function moveMapByPos(position) {
		console.log("moveMapByPos: " + position);
		mMap.panTo(position);
	}

	// setting for user marker 
	function setUserMarker(map, pos) {
		mUserMarker = new google.maps.Marker({
	        map: map,
	        draggable: false,
	        position: pos
		});
	}

	// clear your marker setting
	function clearUserMarker() {
		if(mUserMarker != null) {
			mUserMarker.setMap(null);
			mUserMarker = null;
		}
	}

	// initPosition
	function initPosition() {
		var options = {
			enableHighAccuracy: true,
			timeout: 5000,
			maximumAge: 0
		};

		console.log("initPosition");

		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				function(position) {
					console.log("navigator.getCurrentPosition: " + position);
					var lat = position.coords.latitude;
					var lng = position.coords.longitude;
					pos = new google.maps.LatLng(lat, lng);

					moveMapByPos(pos);
					clearUserMarker();
					setUserMarker(mMap, pos);
				},
				function() {
					handleNoGeolocation(true);
				},
				options
			);
		}
		else {
			handleNoGeolocation(false);
		}
		
	}

	// setting for destination marker
	function setDestMarker(map) {
		mDestMarker = new google.maps.Marker({
	        map: map,
			draggable: true,
			anchorPoint: new google.maps.Point(0, -29),
		});
	}

	// clear destination marker setting
	function clearDestMarker() {
		if(mDestMarker != null) {
			mDestMarker.setMap(null);
			mDestMarker = null;
		}
	}

	// enable google search
	function search_settings() {
		var input = /** @type {HTMLInputElement} */(
	            document.getElementById('pac-input'));

	    mMap.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

	    var autocomplete = new google.maps.places.Autocomplete(input);
	    autocomplete.bindTo('bounds', mMap);

	    // var mInfoWindow = new google.maps.InfoWindow();
	    setDestMarker(mMap);

		// when autocomplete change 
		google.maps.event.addListener(autocomplete, 'place_changed', function() {
	    	my.howfarStop();
			mInfoWindow.close();
	        mDestMarker.setVisible(false);
	        
			var place = autocomplete.getPlace();
	        if (!place.geometry) {
	            return;
	        }

	        // If the place has a geometry, then present it on a map.
	        if (place.geometry.viewport) {
	            mMap.fitBounds(place.geometry.viewport);
	        } else {
	            mMap.setCenter(place.geometry.location);
	            mMap.setZoom(17);    // Why 17? Because it looks good.
	        }
			
	        mDestMarker.setIcon(/** @type {google.maps.Icon} */({
	            url: place.icon,
	            size: new google.maps.Size(71, 71),
	            origin: new google.maps.Point(0, 0),
	            anchor: new google.maps.Point(17, 34),
	            scaledSize: new google.maps.Size(35, 35)
	        }));

	        mDestMarker.setPosition(place.geometry.location);
	        mDestMarker.setVisible(true);
	        
			var address = '';
	        if (place.address_components) {
	            address = [
	                (place.address_components[0] && place.address_components[0].short_name || ''),
	                (place.address_components[1] && place.address_components[1].short_name || ''),
	                (place.address_components[2] && place.address_components[2].short_name || '')
	            ].join(' ');
	        }
			
	        mInfoWindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
	        mInfoWindow.open(mMap, mDestMarker);
			mDestPlaceInfo = {name:place.name, address:address, place:place};		
	    });
	}

	function drawPoly(startPos, DestPos) {
		var path = [startPos, DestPos];
	    mGeodesicPoly.setPath(path);    
	}

	function sendDistanceToAndroid(distance) {
		if (typeof sendDistanceToAndroid.initDistance == 'undefined') {
			sendDistanceToAndroid.initDistance = 100;
		}
		
		var distancePacket = {
				initDistance : sendDistanceToAndroid.initDistance,
				normalDistance : distance
			};
		if (mIsInitDistance) {
			sendDistanceToAndroid.initDistance = distance;
			distancePacket.initDistance = sendDistanceToAndroid.initDistance;
			window.android.sendDistance(JSON.stringify(distancePacket));
			mIsInitDistance = false;
		}
		else {
			var distancePacket = {
				initDistance : sendDistanceToAndroid.initDistance,
				normalDistance : distance
			};
			window.android.sendDistance(JSON.stringify(distancePacket));
		}
	}

	function handleNoGeolocation(errorFlag) {
	    if (errorFlag) {
	        var content = 'Error: The Geolocation service failed.';
	    } else {
	        var content = 'Error: Your browser doesn\'t support geolocation.';
	    }

	    var options = {
	        map: mMap,
			position: new google.maps.LatLng(37.56667, 126.97838),
	        content: content
	    };

	    mInfoWindow = new google.maps.InfoWindow(options);
	    mMap.setCenter(options.position);
	}

	function polylineSetting() {
		var geodesicOptions = {
		        strokeColor: '#00A5FF',
		        strokeOpacity: 0.8,
		        strokeWeight: 3,
		        geodesic: true,
		        map: mMap
		};
		mGeodesicPoly = new google.maps.Polyline(geodesicOptions);
	}

	my.howfarBegin = function() {
		mIsSearch = true;
		mIsInitDistance = true;
	}

	my.howfarStop = function() {
		mIsSearch = false;
		mIsInitDistance = false;
	}

	// run navigator if either mIsGearConnected or mIsAndroidConnected is true
	// android java activity call it
	my.runNavigator = function() {
		console.log("runNavigator()");
		if (mIsGearConnected || mIsAndroidConnected) {
			if (mIsCameraFollowing) {
				watchPosition(followUser);
			}
			else {
				watchPosition(onlyMarkUser);
			}
		}
	}

	// stop navigator if both mIsGearConnected and mIsAndroidConnected are false
	// android java activity call it
	my.stopNavigator = function() {
		console.log("stopNavigator()");
		if (!mIsGearConnected && !mIsAndroidConnected) {
			clearWatch();	
		}
	}

	my.requestFromAndroidToStopGPS = function() {
		clearWatch();
	}

	my.setIsGearConnected = function(connected) {
		console.log("setIsGearConnected()");
		mIsGearConnected = connected;
	}

	my.setIsAndroidConnected = function(connected) {
		console.log("setIsAndroidConnected()");
		mIsAndroidConnected = connected;
	}

	my.initialize = function() {
		my.setIsAndroidConnected(true);

	    var mapOptions = {
	        zoom: 14,
			disableDefaultUI: true
	    };
	    
	    mMap = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
		
		initPosition();
	    polylineSetting();
	    search_settings();
		mapMoveEventInit();

		document.getElementById("myPosBtn").addEventListener('click', function() {
			watchPosition(followUser);
		});
		document.getElementById("howfarBtn").addEventListener('click', function() {
			my.howfarBegin();
		});
		document.getElementById("saveBookmark").addEventListener('click', function() {
			G.bookmarkModule.saveBookmark();
		});
		G.bookmarkModule.loadAddress();
	}

	my.getDestPlaceInfo = function() {
		return mDestPlaceInfo;
	}

	my.getInfoWindow = function() {
		return mInfoWindow;	
	} 

	my.getDestMarker = function() {
		return mDestMarker;
	}

	my.getMap = function() {
		return mMap;
	}

	return my;
}(G.distanceModule, G.bookmarkModule));

google.maps.event.addDomListener(window, 'load', G.locationModule.initialize);