var mIsMile = false;		// T : english system, F : metric system
var mDistance = 0;			// distance from user position from destination

function calcDistance(startPos, DestPos) 
{
	 var distance = google.maps.geometry.spherical.computeDistanceBetween(startPos, DestPos);
	 distance = Math.floor(distance);
	 return distance;
}

// Display remaining distance by text
function displayTextDistance()
{
	var distUnit;
	
	if(mIsMile) {
		distUnit = distanceEnglish(mDistance);
	}
	else {
		distUnit = distanceMetric(mDistance);
	}
	autoDisplaySizeAdjustment(distUnit);
	document.getElementById('distanceDisplay').innerHTML = distUnit;
}

// return distance expressed by metric system
function distanceMetric(distance)
{
	var textDistance = null;
	
	if (distance > 1000) {
		textDistance = roundXL(distance/1000, 2) + "km";
	}
	else {
		textDistance = distance + "m";
	}
	
	return textDistance;
}

// return distance expressed by english units
function distanceEnglish(distance)
{
	var textDistance = null;
	
	var yard = distance * 1.093613;
	if (yard > 1760) {
		textDistance = roundXL(yard/1760, 2) + "mile";
	}
	else {
		textDistance = roundXL(yard, 0) + "yard";
	}
	
	return textDistance;
}

// switch distance unit
function switchDistanceDisplayUnit() {
	console.log("switchDistanceDisplayUnit");
	if (mIsMile) {
		mIsMile = false;
	}
	else {
		mIsMile = true;
	}
	displayTextDistance();
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