G.distanceModule = (function(mathModule) {
	var my = {};

	var mIsMile = false;		// T : english system, F : metric system
	var mDistance = 0;			// distance from user position from destination
	var mInitDistance = 100;
	var mIsInitDistance = false;

	// return distance expressed by english units
	function distanceEnglish(distance)
	{
		var textDistance = null;
		
		var yard = distance * 1.093613;
		if (yard > 1760) {
			textDistance = G.mathModule.roundXL(yard/1760, 2) + "mile";
		}
		else {
			textDistance = G.mathModule.roundXL(yard, 0) + "yard";
		}
		
		return textDistance;
	}

	// return distance expressed by metric system
	function distanceMetric(distance)
	{
		var textDistance = null;
		
		if (distance > 1000) {
			textDistance = G.mathModule.roundXL(distance/1000, 2) + "km";
		}
		else {
			textDistance = distance + "m";
		}
		
		return textDistance;
	}

	// adjust display string size properly
	function autoDisplaySizeAdjustment(displayString)
	{
		var el = document.getElementById('distanceDisplay');
		var length = displayString.length;
		
		if (length >= 8) {
			el.style.fontSize = '30px';
		}
		else if (length >= 9) {
			el.style.fontSize = '24px';
		}
		else {
			el.style.fontSize = '36px';
		}
	}

	my.calcDistance = function(startPos, DestPos) {
		var distance = google.maps.geometry.spherical.computeDistanceBetween(startPos, DestPos);
		distance = Math.floor(distance);
		return distance;
	}

	// Display remaining distance by text
	my.displayTextDistance = function()	{
		var distUnit;
		
		if(mIsMile) {
			distUnit = distanceEnglish(mDistance);
		}
		else {
			distUnit = distanceMetric(mDistance);
		}
		autoDisplaySizeAdjustment(distUnit);
		document.getElementById('distanceDisplay').innerHTML = distUnit;
		$('#distanceDisplay').html(distUnit);
	}



	my.drawDistanceBar = function() {
		var passedDistance = mInitDistance - mDistance;
        console.log("initDistance: " + mInitDistance);
        console.log("distance: " + mDistance);
        console.log("passedDistance: " + passedDistance);
        if (passedDistance < 0) {
            passedDistance = 0;
        }

        var percentPassed = parseInt((passedDistance / mInitDistance) * 100);
        $('#distBar').css('height', percentPassed + '%');

        // document.getElementById("distBar").style.width = percentPassed + "%";
	}



	// switch distance unit
	my.switchDistanceDisplayUnit = function() {
		console.log("switchDistanceDisplayUnit");
		if (mIsMile) {
			mIsMile = false;
		}
		else {
			mIsMile = true;
		}
		my.displayTextDistance();
	}

	my.getDistance = function() {
		return mDistance;
	}

	my.setDistance = function(distance) {
		mDistance = distance;	
	}

	my.getIsInitDistance = function() {
		return mIsInitDistance; 
	}

	my.setIsInitDistance = function(isInit) {
		mIsInitDistance = isInit;
	}

	my.getInitDistance = function() {
		return mInitDistance;
	}

	my.setInitDistance = function(distance) {
		console.log('setInitDistance: ' + distance);
		if (mIsInitDistance === false) {
			console.log('setInitDistance do: ' + distance);
			mInitDistance = distance;
			mIsInitDistance = true;
		}		
	}

	return my;
}(G.mathModule));