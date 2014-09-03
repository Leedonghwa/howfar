define(["jquery", "./math"], function($, math) {
	var _isMile = false; // T : english system, F : metric system
    var _normalDistance = 0;
    var _initDistance = 0;
    
    /**
     * Return distance expressed by metric system
     */
    function distanceMetric(distance) {
        var textDistance = null;

        if (distance > 1000) {
            textDistance = math.roundXL(distance / 1000, 2) + "km";
        } else {
            textDistance = distance + "m";
        }

        return textDistance;
    }

    /**
     * Return distance expressed by english units
     */
    function distanceEnglish(distance) {
        var textDistance = null;

        var yard = distance * 1.093613;
        if (yard > 1760) {
            textDistance = math.roundXL(yard / 1760, 2) + "mile";
        } else {
            textDistance = math.roundXL(yard, 0) + "yard";
        }

        return textDistance;
    }

    /**
     * Adjust display string size properly
     */
    function autoDisplaySizeAdjustment(displayString) {
        var el = document.getElementById('distanceDisplay');
        var length = displayString.length;

        if (length >= 8) {
            el.style.fontSize = '60px';
        } else if (length >= 9) {
            el.style.fontSize = '50px';
        } else {
            el.style.fontSize = '70px';
        }
    }
    
    return {
    	getNormalDistance: function() {
        	return _normalDistance;
        },
        
        setNormalDistance: function(dist) {
        	_normalDistance = dist;
        },
        
        getInitDistance: function() {
        	return _initDistance;
        },
        
        setInitDistance: function(initDist) {
        	_initDistance = initDist;
        },

        /**
         * Display remaining distance by text
         */
        displayTextDistance: function() {
            var distUnit;

            if (_isMile) {
                distUnit = distanceEnglish(_normalDistance);
            } else {
                distUnit = distanceMetric(_normalDistance);
            }
            autoDisplaySizeAdjustment(distUnit);
            $('#distanceDisplay').text(distUnit);
        },

        /**
         * Switch distance unit
         */
        switchDistanceDisplayUnit: function() {
            console.log("switchDistanceDisplayUnit");
            if (_isMile) {
                _isMile = false;
            } else {
                _isMile = true;
            }
            displayTextDistance();
        },

        /**
         * Display remaining distance by bar
         */
        displayBarDistance: function() {
            var passedDistance = _initDistance - _normalDistance;
            if (passedDistance < 0) {
                passedDistance = 0;
            }

            var percentPassed = parseInt((passedDistance / initDistance) * 100);

            document.getElementById("distBar").style.width = percentPassed + "%";
            document.getElementById("distancePercent").innerHTML = percentPassed + "%";
        }
    }
});