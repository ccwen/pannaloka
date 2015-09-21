var docfilestore=require("../stores/docfile");
var stackwidgetaction=require("../actions/stackwidget");
var visualhelper=require("./visualhelper");

var gotoMarkup=function(file,mid) {
	console.log("goto markup",file,mid);
}

var gotoRange=function(file,range,wid) {
	var targetdoc=docfilestore.docOf(file);
	if (targetdoc) {
		visualhelper.scrollToHighlight(targetdoc,range);
	} else {
		var target={filename:file, highlight:range };
		stackwidgetaction.openWidget(target,"TextWidget",{below:wid});	
	}
}
module.exports={gotoMarkup:gotoMarkup,gotoRange:gotoRange};