// round off to the digits you want
G.mathModule = (function() {
	var my = {};
	
	my.roundXL = function (n, digits) {
		if (digits >= 0) { 
			return parseFloat(n.toFixed(digits)); // 소수부 반올림
		}
		digits = Math.pow(10, digits); // 정수부 반올림
		var t = Math.round(n * digits) / digits;

		return parseFloat(t.toFixed(0));
	};
	
	return my;
}());