var tizen, jQuery, bookmarkModule, communicationModule;

(function(tizen, $, bookmarkModule, communicationModule){
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
		bookmarkModule.loadAddress();	// 북마크 불러오기 
		communicationModule.connect();	// 휴대폰과 연결
		
		/*
		$( "#distanceDiv" ).bind( "click", function() {
			console.log("switchDistanceDisplayUnit_out");
			switchDistanceDisplayUnit();
		);
		*/
		
		document.addEventListener("visibilitychange", pageVisibilityHandler, false);
		function pageVisibilityHandler() {
			if (!(document.hidden)) {
				fetch("BSTART");
				console.log("page visible");
			} 
			else {
				fetch("BEND");
				console.log("page hidden");
			}
		}
	 
		function onScreenStateChanged(previousState, changedState) {
	 				console.log("Screen state changed from" + previousState + "to" + changedState);
	 				if (changedState == "SCREEN_OFF") {
	 					fetch("BEND");	
	 				}
	 				else if (changedState == "SCREEN_NORMAL") {
	 					fetch("BSTART");
	 				}
		}
		tizen.power.setScreenStateChangeListener(onScreenStateChanged); 
	});
}(tizen, jQuery, bookmarkModule, communicationModule))