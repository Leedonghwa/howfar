var _isMile = false;		// T : english system, F : metric system
var _normalDistance = 0; 
var _initDistance = 0;

function setDistance(dist) 
{
	_normalDistance = dist;
}

function setInitDistance(initDist)
{
	_initDistance = initDist;
}

// Display remaining distance by text
function displayTextDistance()
{
	console.log("displayTextDistance: " + _normalDistance);
	var distUnit;
	
	if(_isMile) {
		distUnit = distanceEnglish(_normalDistance);
	}
	else {
		distUnit = distanceMetric(_normalDistance);
	}
	autoDisplaySizeAdjustment(distUnit);
	$('#distanceDisplay').text(distUnit);
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

// Display remaining distance by bar
function displayBarDistance()
{
	var passedDistance = _normalDistance - _initDistance;
	if (passedDistance < 0) {
		passedDistance = 0;
	}
	
	var percentPassed = parseInt((passedDistance/initDistance)*100);
	
	document.getElementById("distBar").style.width = percentPassed + "%";
	document.getElementById("distancePercent").innerHTML = percentPassed + "%";
}

// switch distance unit
function switchDistanceDisplayUnit() {
	console.log("switchDistanceDisplayUnit");
	if (_isMile) {
		_isMile = false;
	}
	else {
		_isMile = true;
	}
	displayTextDistance();
} 

// adjust display string size properly
function autoDisplaySizeAdjustment(displayString)
{
	var el = document.getElementById('distanceDisplay');
	var length = displayString.length;
	
	if (length >= 8) {
		el.style.fontSize = '60px';
	}
	else if (length >= 9) {
		el.style.fontSize = '50px';
	}
	else {
		el.style.fontSize = '70px';
	}
}