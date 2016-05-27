var dojoLoaded = false
function loadDojo() {
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
if (typeof(define) != "function" && dojoLoaded == false) {
    loadDojo();
    dojoLoaded = true;
}
var loadedCheck = setInterval(function() {
    if (typeof(define) == "function") {
        clearInterval(loadedCheck);
        //var iFrame = dojo.byId('contentiframe').contentWindow.document      
    	require(["accessifizr/accessifizrCore", "dojo/text!accessifizr/handlebars.json", "dojo/_base/window", "dojo/domReady!"], function(Accessifizr, data, win) {
    		setTimeout(function(){
    			setInterval(function(){
    				if (iFrame){
						win.setContext(window,iFrame)
					}
    			},100)
            	Accessifizr.init({
                	"data": data
            	});
    		},10000)
    	});
    }
}, 100)
