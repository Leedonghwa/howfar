define(["jquery", "./bookmark", "./communication"], function($, bookmark, communication) {
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
		bookmark.loadAddress();		// 북마크 불러오기 
		communication.connect();	// 휴대폰과 연결
		
		/*
		$( "#distanceDiv" ).bind( "click", function() {
			console.log("switchDistanceDisplayUnit_out");
			switchDistanceDisplayUnit();
		);
		*/
		
		document.addEventListener("visibilitychange", pageVisibilityHandler, false);
		function pageVisibilityHandler() {
			if (!(document.hidden)) {
				communication.fetch("BSTART");
				console.log("page visible");
			} 
			else {
				communication.fetch("BEND");
				console.log("page hidden");
			}
		}
	 
		function onScreenStateChanged(previousState, changedState) {
	 				console.log("Screen state changed from" + previousState + "to" + changedState);
	 				if (changedState == "SCREEN_OFF") {
	 					communication.fetch("BEND");	
	 				}
	 				else if (changedState == "SCREEN_NORMAL") {
	 					communication.fetch("BSTART");
	 				}
		}
		tizen.power.setScreenStateChangeListener(onScreenStateChanged); 
	});
});
