G.bookmarkModule = (function(communicationModule) {
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
				var inputElement = document.createElement('li');
					inputElement.addEventListener('click', function(){
						my.clickBookmark(address);
					});
					// IMSI
					inputElement.addEventListener('drag', function(){
						my.deleteBookmark(address);
					});
					
				inputElement.innerHTML = storage[i];
				displayList.appendChild(inputElement);
			}());
		}
	}
	
	// click bookmark to send an address to the phone
	my.clickBookmark = function(address) {
		address = 'A' + address;
		G.communicationModule.fetch(address);
	}
	
	// delete bookmark 
	my.deleteBookmark = function(address) {
		address = 'C' + address;
		G.communicationModule.fetch(address);
	}
	
	// 휴대폰에서 전달 받은 bookmark list를 그대로 저장
	my.updateBookmark = function(bookmarkList) {
		console.log("communicationModule addbookmark: " + bookmarkList);
		var displayList = document.getElementById("bookmarklist");
		localStorage.setItem('AddressList', bookmarkList);
		my.loadAddress();
	}
	
	return my;
}(G.communicationModule));