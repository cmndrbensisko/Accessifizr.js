if (typeof(define) != "function") {
    dojoConfig = {
        packages: [{
            name: "accessifizr",
            location: location.pathname.replace(/\/[^/]+$/, "") + "/accessifizr"
        }]
    }
    var fileref = document.createElement('script')
    fileref.setAttribute("type", "text/javascript")
    fileref.setAttribute("src", "http://ajax.googleapis.com/ajax/libs/dojo/1.10.4/dojo/dojo.js")
    document.head.appendChild(fileref);
}
var loadedCheck = setInterval(function() {
    if (typeof(define) == "function") {
        clearInterval(loadedCheck);
    	require(["accessifizr/accessifizrCore", "dojo/text!accessifizr/handlebars.json", "dojo/_base/window", "dojo/domReady!"], function(Accessifizr, data, win) {
        	Accessifizr.init({
            	"data": data
        	});
    	});
    }
}, 100)
