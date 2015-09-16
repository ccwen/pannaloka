var React=require("react");
var E=React.createElement;
var DefaultMarkupAttributeEditor=React.createClass({
	render:function() {
		return E("span",null,
			E("button",{},"Create Markup")
		);
	}
});
module.exports=DefaultMarkupAttributeEditor;