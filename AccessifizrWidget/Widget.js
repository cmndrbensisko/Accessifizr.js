define([
	'dojo/_base/declare',
	'jimu/BaseWidget',
	'./Accessifizr-0.9',
	'dojo/text!./handlebars.json',
	'dojo/domReady!'
  ],
  function(
	declare,
	BaseWidget,
	Accessifizr,
	data) {
		var clazz = declare([BaseWidget], {
			startup: function() {
				//Steps are to add to the Builder/default-apps/default2DApp config under the widgetOnScreen section.
				//Make sure the manifest has the hasUIFile=False and hasStyle = false settings.
				Accessifizr.init({"data": data});
			}
		})
		return clazz;
	});