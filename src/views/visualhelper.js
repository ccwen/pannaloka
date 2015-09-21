var	scrollToHighlight=function (doc,highlight,opts) {
		if (!highlight) return;
		opts=opts||{};
		var hl=highlight;
		var marker = document.createElement('span');
		var from={line:hl[0][1],ch:hl[0][0]},to={line:hl[1][1],ch:hl[1][0]};
		var scrollto={line:hl[0][1],ch:hl[0][0]};
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
	}
module.exports={scrollToHighlight:scrollToHighlight};