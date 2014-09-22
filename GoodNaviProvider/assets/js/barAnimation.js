$(function() {
	$(".meter > span").each(function() {
		$(this)
		.data("origHeight", $(this).height())
		.height(0)
		.animate({
			height: $(this).data("origHeight")
		}, 1200);
	});
});
