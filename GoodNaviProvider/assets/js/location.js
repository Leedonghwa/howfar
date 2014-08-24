var mMap;						// ��
var mUserMarker = null;			// ���� ��Ŀ
var mDestMarker = null;			// ������ ��Ŀ
var mDestPlaceInfo = null;		// ������ ����
var mGeodesicPoly;				// �� �׸���
var mWatchId = null;			// watchPosition ID
var mIsSearch = false;			// ������������ ���� �׸��� �������� ���� 
var mDistance = 0;				// ������������ �Ÿ�
var mIsInitDistance = false;	// ������������ ���� �Ÿ� ����
var mInfoWindow = new google.maps.InfoWindow();

function initialize() {
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

// �ܰ� ȭ�� �̵� �̺�Ʈ�� �߻��ϸ� �ܼ��� ����� ��ġ�� ��Ŀ�� ǥ���ϵ��� ����
function mapMoveEventInit() {
	google.maps.event.addListener(mMap, 'zoom_changed', function() {
		watchPosition(onlyMarkUser);}
	);
	google.maps.event.addListener(mMap, 'dragend', function() {
		watchPosition(onlyMarkUser);}
	);
}

// watchPosition�� �Բ� ���. ��Ŀ�� ǥ���ϸ� ȭ���� ����ڸ� ���
// �Ÿ� ������ ���۵Ǹ� �Ÿ��� ����ϰ� ������������ ���� ǥ��
var followUser = function (position) {
	var lat = position.coords.latitude;
	var lng = position.coords.longitude;
	var pos = new google.maps.LatLng(lat, lng);
		
	mUserMarker.setVisible(false);
	mUserMarker.setPosition(pos);
	mUserMarker.setVisible(true);
	moveMapByPos(pos);
	
	if (mIsSearch) {
		drawPoly(pos, mDestMarker.getPosition());
		mDistance = calcDistance(pos, mDestMarker.getPosition());
		sendDistanceToAndroid(mDistance);
				
		mDistance = parseFloat(mDistance);
		
		if (mDistance > 1000) {
			mDistance = roundXL(mDistance/1000, 2) + "km";
		}
		else {
			mDistance = mDistance + "m";
		}
		document.getElementById('distance').value = mDistance;
		
	}
}

function roundXL(n, digits) {
	  if (digits >= 0) return parseFloat(n.toFixed(digits)); // ?뚯닔遺 諛섏삱由?

	  digits = Math.pow(10, digits); // ?뺤닔遺 諛섏삱由?
	  var t = Math.round(n * digits) / digits;

	  return parseFloat(t.toFixed(0));
}


// watchPosition�� �Բ� ���. �ʿ� ��Ŀ�� ǥ��
// �Ÿ� ������ ���۵Ǹ� �Ÿ��� ����ϰ� ������������ ���� ǥ��
var onlyMarkUser = function (position) {
	var lat = position.coords.latitude;
	var lng = position.coords.longitude;
	var pos = new google.maps.LatLng(lat, lng);
		
	mUserMarker.setVisible(false);
	mUserMarker.setPosition(pos);
	mUserMarker.setVisible(true);

	if (mIsSearch) {
		drawPoly(pos, mDestMarker.getPosition());
		mDistance = calcDistance(pos, mDestMarker.getPosition());
		sendDistanceToAndroid(mDistance);
		mDistance = parseFloat(mDistance);		
		if (mDistance > 1000) {
			mDistance = roundXL(mDistance/1000, 2) + "km";
		}
		else {
			mDistance = mDistance + "m";
		}		
		document.getElementById('distance').value = mDistance;
				
	}
}

// ������ġ ��� ����
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

// ���� ���
function clearWatch() {
	navigator.geolocation.clearWatch(mWatchId);
}

// ������ ��ǥ ���������� ȭ�� �̵�
function moveMapByPos(position) {
	mMap.panTo(position);
}

// ��ġ �ʱ�ȭ. ���� ��ġ�� �����ϰ� ��Ŀ�� ǥ��
function initPosition() {
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

// ���� ��Ŀ ���
function setUserMarker(map, pos) {
	mUserMarker = new google.maps.Marker({
        map: map,
        draggable: false,
        position: pos
	});
}

// ���� ��Ŀ ����
function clearUserMarker() {
	if(mUserMarker != null) {
		mUserMarker.setMap(null);
		mUserMarker = null;
	}
}

// ������ ��Ŀ ���, �ʸ� �����
function setDestMarker(map) {
	mDestMarker = new google.maps.Marker({
        map: map,
		draggable: true,
		anchorPoint: new google.maps.Point(0, -29),
	});
}

// ������ ��Ŀ ����
function clearDestMarker() {
	if(mDestMarker != null) {
		mDestMarker.setMap(null);
		mDestMarker = null;
	}
}


function search_settings() {
	var input = /** @type {HTMLInputElement} */(
            document.getElementById('pac-input'));

    mMap.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', mMap);

    // var mInfoWindow = new google.maps.InfoWindow();
    setDestMarker(mMap);

	// �˻����� �� ȣ��Ǵ� �̺�Ʈ. �ش� �������� �̵��� �� ��Ŀ�� ǥ��. infowindow�� ǥ����
	google.maps.event.addListener(autocomplete, 'place_changed', function() {
    	howfarStop();
		mInfoWindow.close();
        mDestMarker.setVisible(false);
        
		// ��Ұ� ������ ��������
		var place = autocomplete.getPlace();
        if (!place.geometry) {
            return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            mMap.fitBounds(place.geometry.viewport);
        } else {
			// �˻� ��ҷ� �̵�
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

// �� �׸��� ����
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

// �� �׸���
function drawPoly(startPos, DestPos) {
	var path = [startPos, DestPos];
    mGeodesicPoly.setPath(path);    
}

// �Ÿ� ���
function calcDistance(startPos, DestPos) {
	 var distance = google.maps.geometry.spherical.computeDistanceBetween(startPos, DestPos);
	 distance = Math.floor(distance);
	 return distance;
}

// ������ġ�� �������� ������ ����. �Ÿ��� ���
function howfarBegin() {
	mIsSearch = true;
	mIsInitDistance = true;
}

// ������ �Ÿ� ��� ����
function howfarStop() {
	mIsSearch = false;
	mIsInitDistance = false;
}

// �ȵ���̵�� �Ÿ� ������ ���
function sendDistanceToAndroid(distance) {
	if (mIsInitDistance) {
		window.android.sendInitDistance(distance.toString());
		mIsInitDistance = false;
	}
	else {
		window.android.sendDistance(distance.toString());
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

google.maps.event.addDomListener(window, 'load', initialize);
