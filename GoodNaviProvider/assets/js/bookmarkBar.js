var clicked=false;
$(document).ready(function(){
	var inactive = document.getElementById("inactive");
	$(".bookmark_bar").click(function(){
		if(clicked) {
			$(".bookmark_wrapper").slideUp();
			inactive.style.top="100%";
			clicked = false;
		}
		else {
			$(".bookmark_wrapper").slideDown();
			inactive.style.top="0";
			clicked = true;
		}
	});
	$("#inactive").click(function(){
		if(clicked) {
			$(".bookmark_wrapper").slideUp();
			inactive.style.top="100%";
			clicked = false;
		}
	});
	$("#bookmarklist").click(function(){
		if(clicked) {
			$(".bookmark_wrapper").slideUp();
			inactive.style.top="100%";
			clicked = false;
		}
	});

});


