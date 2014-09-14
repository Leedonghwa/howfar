(function($, bookmarkModule, communicationModule){
	$(document).ready(function() {
		// bar animation
		$(".meter > span").each(function() {
			$(this)
				.data("origWidth", $(this).width())
				.width(0)
				.animate({
					width: $(this).data("origWidth")
				}, 1200);
		});
		
		// add eventListener for tizenhwkey
		document.addEventListener('tizenhwkey', function(e) {
			if (e.keyName == "back")
				tizen.application.getCurrentApplication().exit();
		});
		console.log("init: int 3 type");
		G.bookmarkModule.initBookmarkEdit();
		G.bookmarkModule.loadAddress();			// 북마크 불러오기 
		G.communicationModule.connect();		// 휴대폰과 연결
		
		/*
		$( "#distanceDiv" ).bind( "click", function() {
			console.log("switchDistanceDisplayUnit_out");
			switchDistanceDisplayUnit();
		);
		*/
		
		document.addEventListener("visibilitychange", pageVisibilityHandler, false);
		function pageVisibilityHandler() {
			if (!(document.hidden)) {
				communicationModule.fetch("BSTART");
				console.log("page visible");
			} 
			else {
				communicationModule.fetch("BEND");
				console.log("page hidden");
			}
		}
	 
		function onScreenStateChanged(previousState, changedState) {
			console.log("Screen state changed from" + previousState + "to" + changedState);
			if (changedState == "SCREEN_OFF") {
				communicationModule.fetch("BEND");	
			}
			else if (changedState == "SCREEN_NORMAL") {
				communicationModule.fetch("BSTART");
			}
		}
		tizen.power.setScreenStateChangeListener(onScreenStateChanged); 
	});
}(jQuery, G.bookmarkModule, G.communicationModule))