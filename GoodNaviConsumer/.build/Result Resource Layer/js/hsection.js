(function() {
    var d = document.getElementById("hsectionchangerPage"),
        c = document.getElementById("hsectionchanger"),
        b, a = 1;
    d.addEventListener("pageshow", function() {
        b = new tau.SectionChanger(c, {
            circular: false,
            orientation: "horizontal"
        });
    });
    d.addEventListener("pagehide", function() {
        b.destroy();
    });
}());