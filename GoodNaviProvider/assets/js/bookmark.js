G.bookmarkModule = (function(locationModule) {
	var my = {};

	my.sendBookmarkListToAndroid = function() {
		var storage = JSON.parse(localStorage.getItem('AddressList'));
		if (!storage) {
			storage = [];
			localStorage.setItem('AddressList', JSON.stringify(storage));
		}
		window.android.sendBookmarkList(JSON.stringify(storage));
	}

	my.clickBookmark = function(address) {
		var infoWindow = G.locationModule.getInfoWindow();
		var destMarker = G.locationModule.getDestMarker();
		var map = G.locationModule.getMap();

		infoWindow.close();
		destMarker.setVisible(false);
		
		var place = JSON.parse(localStorage.getItem(address));
		if (!place.geometry) {
			return;
		}
		G.locationModule.howfarStop();

		var savedLatLng = new google.maps.LatLng(place.geometry.location.k, place.geometry.location.B);
		console.log("viewport content: " + JSON.stringify(place.geometry.viewport));

		if (place.geometry.viewport) {
			map.setCenter(savedLatLng);
			map.setZoom(14);
			// map.fitBounds(place.geometry.viewport);
		} else {
			map.setCenter(savedLatLng);
			map.setZoom(14);
		}

		destMarker.setIcon(/** @type {google.maps.Icon} */({
			url: place.icon,
			size: new google.maps.Size(71, 71),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(17, 34),
			scaledSize: new google.maps.Size(35, 35)
		}));

		destMarker.setPosition(savedLatLng);
		destMarker.setVisible(true);

		var address = '';
		if (place.address_components) {
			address = [
				(place.address_components[0] && place.address_components[0].short_name || ''),
				(place.address_components[1] && place.address_components[1].short_name || ''),
				(place.address_components[2] && place.address_components[2].short_name || '')
			].join(' ');
		}

		infoWindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
		infoWindow.open(map, destMarker);
	}

	// delete bookmark
	// delete name:address, address:place info in the localStorage
	my.deleteBookmark = function(address) {
		console.log("deleteBookmark: " + address);

		var storage = JSON.parse(localStorage.getItem('AddressList'));
		var index = storage.indexOf(address);
		console.log("deleteBookmark index: " + index);		

		storage.splice(index - 1, 2);
		localStorage.setItem('AddressList', JSON.stringify(storage));

		localStorage.removeItem(address);

		my.loadAddress();
		my.sendBookmarkListToAndroid();		
	}

	my.loadAddress = function() {
		var storage = JSON.parse(localStorage.getItem('AddressList'));
		if (!storage) {
			storage = [];
			localStorage.setItem('AddressList', JSON.stringify(storage));
		}

		var displayList = document.getElementById("bookmarklist");
		displayList.innerHTML = "";

		for ( var i = 0; i < storage.length; i = i + 2) {
			(function() {
				var address = storage[i+1];
				var inputElement = document.createElement('li');
					
					// click event: bookmark process
					inputElement.addEventListener('click', function(){
						my.clickBookmark(address);
					});

					// drag event: remove bookmark
					// IMSI
					inputElement.addEventListener('drag', function(){
						my.deleteBookmark(address);
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

	my.saveBookmark = function() {
		var storage = JSON.parse(localStorage.getItem('AddressList'));
		
		if (!storage) {
			storage = [];
			localStorage.setItem('AddressList', JSON.stringify(storage));
		}

		var destPlaceInfo = G.locationModule.getDestPlaceInfo();

		var isDuplicated = JSON.parse(localStorage.getItem(destPlaceInfo.address));
		if (isDuplicated) {
			return;
		}
		
		var arrayLength = storage.length;
		storage[arrayLength] = destPlaceInfo.name;
		storage[arrayLength+1] = destPlaceInfo.address;
		localStorage.setItem('AddressList', JSON.stringify(storage));
		
		// key : address, value : place
		localStorage.setItem(destPlaceInfo.address, JSON.stringify(destPlaceInfo.place));

		my.loadAddress();
		my.sendBookmarkListToAndroid();
	}

	my.searchAddressFromGear = function(address) {
		my.clickBookmark(address);
		G.locationModule.howfarBegin();
	}

	return my;
}(G.locationModule));



