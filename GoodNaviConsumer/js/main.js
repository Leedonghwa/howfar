
window.onload = function () {
    // TODO:: Do your initialization job

    // add eventListener for tizenhwkey
	// 화면에서 밑으로 쓸어내렸을 때 뒤로 가는 행위
    document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName == "back")
            tizen.application.getCurrentApplication().exit();
    });

    // Sample code
    var textbox = document.querySelector('.contents');
    textbox.addEventListener("click", function(){
    	box = document.querySelector('#textbox');
    	box.innerHTML = box.innerHTML == "Basic" ? "Sample" : "Basic";
    });
    
};
