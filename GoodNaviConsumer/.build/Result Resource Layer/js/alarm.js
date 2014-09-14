G.alarmModule  = (function() {
	var my = {};
	
	var _initDistance = 0;
	var isBrr = false;
	
	my.brrr = function(initDistance, normalDistance) {
		if (_initDistance !== initDistance) {
			isBrr = false;
		}
		
		if (normalDistance < 20 || isBrr == false) {
			isBrr = true;
			navigator.vibrate(3000);
		}
	}
	
	return my;
}());