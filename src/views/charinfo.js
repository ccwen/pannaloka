var selectionstore=require("../stores/selection");
var run=function(cm) {
	var renderCh=function (ch) {
		if (!ch) return ;
		return ch+":U+"+ch.charCodeAt(0).toString(16).toUpperCase();
	}

	if (cm.openNotification) {
        cm.openNotification('<span style="color: green">' + 
        	renderCh(selectionstore.getCursorChar()) + '</span>',
      {duration: 5000});
  }
}
module.exports={run:run};