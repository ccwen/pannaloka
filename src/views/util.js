var docfilestore=require("../stores/docfile");
var stackwidgetaction=require("../actions/stackwidget");

var gotoRangeOrMarkupID=function(file,range_mid,wid) {
	var targetdoc=docfilestore.docOf(file);
	if (targetdoc) {
		scrollAndHighlight(targetdoc,range_mid);
	} else {
		var target={filename:file, scrollTo:range_mid };
		stackwidgetaction.openWidget(target,"TextWidget",{below:wid});	
	}
}
var	scrollAndHighlight=function (doc,range_markupid,opts) {
		if (!range_markupid) return;
		setTimeout(function(){
			opts=opts||{};
			var hl=range_markupid;
			if (typeof range_markupid==="string") {
				var markup=doc.getEditor().react.getMarkup(range_markupid);
				if (!markup) {
					console.error("markup not found",range_markupid);
					return;
				}
				var pos=markup.handle.find();
				var from=pos.from, to=pos.to;
				var scrollto={line:from.line,ch:from.ch};
			} else {//array format
				var from={line:hl[0][1],ch:hl[0][0]},to={line:hl[1][1],ch:hl[1][0]};
				var scrollto={line:hl[0][1],ch:hl[0][0]};
			}
			var marker = document.createElement('span');
			if (scrollto.line>0) scrollto.line--;//show one line on top;
			setTimeout(function(){
				var highlight=doc.markText(from,to,{className:"highlight",clearOnEnter:true});
				doc.getEditor().scrollIntoView(from,50);

				if (!opts.keep) {
					setTimeout(function(){
						highlight.clear();
					},5000);				
				}
			},100);			
		}.bind(this),100);
		//wait for this.state.markups ready, because markups is load later
		//see ksana-codemirror/src/codemirror-react.js componentDidMount
	}
module.exports={gotoRangeOrMarkupID:gotoRangeOrMarkupID,scrollAndHighlight:scrollAndHighlight};