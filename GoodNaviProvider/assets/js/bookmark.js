function loadAddress() {
	var storage = JSON.parse(localStorage.getItem('AddressList'));
	if (!storage) {
		storage = [];
		localStorage.setItem('AddressList', JSON.stringify(storage));
	}

	var displayList = document.getElementById("bookmarklist");
	displayList.innerHTML = "";

	for ( var i = 0; i < storage.length; i = i + 2) {
		(function() {
			var ads = storage[i+1];
			var inputElement = document.createElement('li');
				inputElement.addEventListener('click', function(){
					console.log(ads);
					clickBookmark(ads);
				});

			inputElement.innerHTML += "<strong>"
			+ storage[i]
			+ "<br>"
			+ storage[i+1]
			+ "</strong>"
		
		displayList.appendChild(inputElement);
		}());
	}
}

// 북마크에 저장
function saveBookmark() {
	var storage = JSON.parse(localStorage.getItem('AddressList'));
	
	if (!storage) {
		storage = [];
		localStorage.setItem('AddressList', JSON.stringify(storage));
	}
	

	var isDuplicated = JSON.parse(localStorage.getItem(mDestPlaceInfo.address));
	if (isDuplicated) {
		return;
	}
	
	var arrayLength = storage.length;
	storage[arrayLength] = mDestPlaceInfo.name;
	storage[arrayLength+1] = mDestPlaceInfo.address;
	localStorage.setItem('AddressList', JSON.stringify(storage));
	
	// key : address, value : place
	localStorage.setItem(mDestPlaceInfo.address, JSON.stringify(mDestPlaceInfo.place));

	loadAddress();
	sendBookmarkListToAndroid();
}

// 안드로이드로 북마크 리스트 전송
function sendBookmarkListToAndroid() {
	var storage = JSON.parse(localStorage.getItem('AddressList'));
	if (!storage) {
		storage = [];
		localStorage.setItem('AddressList', JSON.stringify(storage));
	}
	window.android.sendBookmarkList(JSON.stringify(storage));
}

// 북마크 삭제
function removeMe(itemId) {
	var storage = JSON.parse(localStorage.getItem('AddressList'));
	storage.splice(itemId - 1, 2);
	localStorage.setItem('AddressList', JSON.stringify(storage));
	loadNotes();
}

// 클릭시 해당 주소의 장소로 이동
function clickBookmark(address) {
	mInfoWindow.close();
	mDestMarker.setVisible(false);
	
	// 장소가 없으면 빠져나감
	var place = JSON.parse(localStorage.getItem(address));
	if (!place.geometry) {
		return;
	}
	howfarStop(); // 현재 진행중인 이전 장소에 대한 거리 게산을 종료

	var savedLatLng = new google.maps.LatLng(place.geometry.location.k, place.geometry.location.B);
	console.log("viewport content: " + JSON.stringify(place.geometry.viewport));

	if (place.geometry.viewport) {
		mMap.setCenter(savedLatLng);
		mMap.setZoom(14);
		// mMap.fitBounds(place.geometry.viewport); // 암됨. stringify로도 알 수 없군...
	} else {
		// 검색 장소로 이동
		mMap.setCenter(savedLatLng);
		mMap.setZoom(14);
	}

	mDestMarker.setIcon(/** @type {google.maps.Icon} */({
		url: place.icon,
		size: new google.maps.Size(71, 71),
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(17, 34),
		scaledSize: new google.maps.Size(35, 35)
	}));

	mDestMarker.setPosition(savedLatLng);
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
}

// 기어에서 선택한 북마크 정보를 적용
function searchAddressFromGear(address) {
	clickBookmark(address);
	howfarBegin(); // 곧바로 검색을 시작한다.
}