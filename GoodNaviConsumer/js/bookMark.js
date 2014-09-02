var communicationModule;

var bookmarkModule = (function(communicationModule) {
	var my = {};
	
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
				console.log("storage addr list : " + address);
				var inputElement = document.createElement('li');
					inputElement.addEventListener('click', function(){
						 my.clickBookmark(address);
					});

				inputElement.innerHTML = storage[i];
				displayList.appendChild(inputElement);
			}());
		}
	}
	
	my.clickBookmark = function(address) {
		address = 'A' + address;
		console.log("clickBookmark addr : " + address);
		communicationModule.fetch(address);
	}
	
	// 휴대폰에서 전달 받은 bookmark list를 그대로 저장
	my.addBookmark = function(bookmarkList) {
		console.log("bookmarkModule : " + bookmarkList);
		var displayList = document.getElementById("bookmarklist");
		localStorage.setItem('AddressList', bookmarkList);
		my.loadAddress();
	}
	
	return my;
}(communicationModule));


/*
function addDummy() {
	var storage = JSON.parse(localStorage.getItem('AddressList'));
	var arrayLength = storage.length;
	
	if (!storage) {
		storage = [];
		localStorage.setItem('AddressList', JSON.stringify(storage));
	}
	
	storage[arrayLength] = "seoul" + arrayLength;
	localStorage.setItem('AddressList', JSON.stringify(storage));
}
*/