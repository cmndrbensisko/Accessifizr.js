var dojoLoaded = false
function loadDojo(){
	var fileref=document.createElement('script')
	fileref.setAttribute("type","text/javascript")
	fileref.setAttribute("src", "http://ajax.googleapis.com/ajax/libs/dojo/1.10.4/dojo/dojo.js")
	document.head.appendChild(fileref);
	dojoConfig = {baseUrl: "/"}
}
if (typeof(define) != "function" && dojoLoaded == false){
	loadDojo();
	dojoLoaded = true;
}
var loadedCheck = setInterval(function(){
	if (typeof(define) == "function"){
		clearInterval(loadedCheck);
		require(["accessifizr/accessifizrCore","dojo/text!accessifizr/handlebars.json", "dojo/domReady!"], function(Accessifizr, data) {
		  Accessifizr.init({"data": data});
		});
	}
},100)