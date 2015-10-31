var React=require("react");
var Component=React.Component;
var docfilestore=require("../stores/docfile");

var InputMethod=React.createClass({
	onKeyPress:function(e) {
		if (e.key!=="Enter") return;
		var cm=docfilestore.getActiveEditor();
		if (!cm) return;
		var input=e.target.value;
		var output="";
		if (input==="N") {
			output="ए";
		}
		if (output) {
			var pos=cm.getCursor();
			cm.replaceRange(output,pos,pos);
			cm.setCursor({line:pos.line,ch:pos.ch+output.length});
		}
		e.target.value="";
	}
	,render:function(){
		return <span><input onKeyPress={this.onKeyPress}></input></span>
	}
});

module.exports=InputMethod;