G.bookmarkModule = (function(communicationModule) {
	var my = {};
	
	 my.addDummy = function() {
		var storage = JSON.parse(localStorage.getItem('AddressList'));
		var arrayLength = storage.length;
		
		if (!storage) {
			storage = [];
			localStorage.setItem('AddressList', JSON.stringify(storage));
		}
		
		storage[arrayLength] = "seoul" + arrayLength;
		localStorage.setItem('AddressList', JSON.stringify(storage));
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
					inputElement.addEventListener('click', function() {
						my.clickBookmark(address);
					});
				
				// 삭제 버튼 추가
				inputElement.innerHTML = storage[i] + 
					'<div id="' + address + '" class="bookmark_delete">Del</div>';

				displayList.appendChild(inputElement);
				
				// 삭제 이벤트
				var item = document.getElementById(storage[i+1]);
				item.addEventListener('click', function() {
					my.deleteBookmark(address);
				});
			}());
		}
		$(".bookmark_delete").hide();
	}
	
	// show bookmark edit
	my.initBookmarkEdit = function() {
		var bookmarkEdit = document.getElementById("bookmark_edit");
		bookmarkEdit.addEventListener('click', function() {
			if (this.value.length === 4) {
				this.value = "Ok";
				$(".bookmark_delete").show(700);
			} else {
				this.value = "Edit";
				$(".bookmark_delete").hide(700);
			}
		});
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