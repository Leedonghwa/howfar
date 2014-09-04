// round off to the digits you want
function roundXL(n, digits) 
{
	  if (digits >= 0) return parseFloat(n.toFixed(digits));

	  digits = Math.pow(10, digits);
	  var t = Math.round(n * digits) / digits;

	  return parseFloat(t.toFixed(0));
}