var mMap;						// google map
var mUserMarker = null;			// user marker
var mDestMarker = null;			// destination marker
var mDestPlaceInfo = null;		// destination place object
var mGeodesicPoly;				// used to draw lines
var mWatchId = null;			// watchPosition ID
var mIsSearch = false;			// check whether or not CD is working
var mIsInitDistance = false;	// check current loop is first calculating distance
var mInfoWindow = new google.maps.InfoWindow();
var isGearConnected = false;
var isAndroidConnected = false;
var isCameraFollowing = false;

function initialize() 
{
	setIsAndroidConnected(true);

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
		watchPosition(followUser);}
	);
	document.getElementById("howfarBtn").addEventListener('click', function() {
		howfarBegin();}
	);
	document.getElementById("saveBookmark").addEventListener('click', function() {
		saveBookmark();}
	);
	loadAddress();
}

// prevent camera following the user when view move
function mapMoveEventInit() 
{
	google.maps.event.addListener(mMap, 'zoom_changed', function() {
		watchPosition(onlyMarkUser);}
	);
	google.maps.event.addListener(mMap, 'dragend', function() {
		watchPosition(onlyMarkUser);}
	);
}

// is used as a function argument of watchPosition function
// camera follow user in the map
var followUser = function (position) 
{
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
var onlyMarkUser = function (position) 
{
	setIsCameraFollowing(false);

	var lat = position.coords.latitude;
	var lng = position.coords.longitude;
	var pos = new google.maps.LatLng(lat, lng);
		
	mUserMarker.setVisible(false);
	mUserMarker.setPosition(pos);
	mUserMarker.setVisible(true);

	drawPolyANDSendDistance(pos);
}

// is used in followUser and onlyMarkUser(look upward)
function drawPolyANDSendDistance(currentPosition)
{
	if (mIsSearch) {
		drawPoly(currentPosition, mDestMarker.getPosition());
		mDistance = calcDistance(currentPosition, mDestMarker.getPosition());
		sendDistanceToAndroid(mDistance);
				
		displayTextDistance();
	}
}

function watchPosition(coreFunction) 
{
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
function clearWatch() 
{
	console.log("clearWatch()");
	navigator.geolocation.clearWatch(mWatchId);
}

// move view to the selected postion
function moveMapByPos(position) {
	mMap.panTo(position);
}

// initPosition
function initPosition() 
{
	var options = {
		enableHighAccuracy: true,
		timeout: 5000,
		maximumAge: 0
	};

	navigator.geolocation.getCurrentPosition(
		function(position) {
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

// setting for user marker 
function setUserMarker(map, pos) 
{
	mUserMarker = new google.maps.Marker({
        map: map,
        draggable: false,
        position: pos
	});
}

// clear your marker setting
function clearUserMarker() 
{
	if(mUserMarker != null) {
		mUserMarker.setMap(null);
		mUserMarker = null;
	}
}

// setting for destination marker
function setDestMarker(map) 
{
	mDestMarker = new google.maps.Marker({
        map: map,
		draggable: true,
		anchorPoint: new google.maps.Point(0, -29),
	});
}

// clear destination marker setting
function clearDestMarker() 
{
	if(mDestMarker != null) {
		mDestMarker.setMap(null);
		mDestMarker = null;
	}
}


function search_settings() 
{
	var input = /** @type {HTMLInputElement} */(
            document.getElementById('pac-input'));

    mMap.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', mMap);

    // var mInfoWindow = new google.maps.InfoWindow();
    setDestMarker(mMap);

	// when autocomplete change 
	google.maps.event.addListener(autocomplete, 'place_changed', function() {
    	howfarStop();
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

function polylineSetting() 
{
	var geodesicOptions = {
	        strokeColor: '#00A5FF',
	        strokeOpacity: 0.8,
	        strokeWeight: 3,
	        geodesic: true,
	        map: mMap
	};
	mGeodesicPoly = new google.maps.Polyline(geodesicOptions);
}

function drawPoly(startPos, DestPos) 
{
	var path = [startPos, DestPos];
    mGeodesicPoly.setPath(path);    
}

function howfarBegin() 
{
	mIsSearch = true;
	mIsInitDistance = true;
}

function howfarStop() 
{
	mIsSearch = false;
	mIsInitDistance = false;
}

function sendDistanceToAndroid(distance)
{
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

function handleNoGeolocation(errorFlag) 
{
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

google.maps.event.addDomListener(window, 'load', initialize);

// run navigator if either isGearConnected or isAndroidConnected is true
function runNavigator()
{
	console.log("runNavigator()");
	if (isGearConnected || isAndroidConnected) {
		if (isCameraFollowing) {
			watchPosition(followUser);
		}
		else {
			watchPosition(onlyMarkUser);
		}
	}
}

// stop navigator if both isGearConnected and isAndroidConnected are false
function stopNavigator() 
{
	console.log("stopNavigator()");
	if (!isGearConnected && !isAndroidConnected) {
		clearWatch();	
	}
}

function requestFromAndroidToStopGPS() 
{
	clearWatch();
}

function setIsGearConnected(connected)
{
	console.log("setIsGearConnected()");
	isGearConnected = connected;
}

function setIsAndroidConnected(connected)
{
	console.log("setIsAndroidConnected()");
	isAndroidConnected = connected;
}

function setIsCameraFollowing(following)
{
	isCameraFollowing = following;
}