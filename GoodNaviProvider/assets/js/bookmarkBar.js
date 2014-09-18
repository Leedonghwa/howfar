var clicked = false;
function BookmarkControl() {
	var bar = document.getElementById('bookmark_bar');
	var list = document.getElementById('bookmark_wrapper');
	var ul = document.getElementById('bookmarklist');
	
	if(!clicked ) {
		bar.style.bottom = '50%';
		list.style.top = '50%';
		ul.style.top = '0%';
		clicked = true; 
	} else {
		bar.style.bottom = '0';
		list.style.top = '100%';
		ul.style.top = '100%';
		clicked = false;		
	}
}
