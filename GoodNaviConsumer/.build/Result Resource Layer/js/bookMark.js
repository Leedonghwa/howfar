define(["require", "./communication"], function(communication) {
	return {
		loadAddress: function() {
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
							 clickBookmark(address);
						});

					inputElement.innerHTML = storage[i];
					displayList.appendChild(inputElement);
				}());
			}
		},
		
		clickBookmark: function(address) {
			address = 'A' + address;
			console.log("clickBookmark addr : " + address);
			require("communication").fetch(address);
		},
		
		// 휴대폰에서 전달 받은 bookmark list를 그대로 저장
		addBookmark: function(bookmarkList) {
			console.log("bookmark : " + bookmarkList);
			var displayList = document.getElementById("bookmarklist");
			localStorage.setItem('AddressList', bookmarkList);
			loadAddress();
		}
	}
});

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