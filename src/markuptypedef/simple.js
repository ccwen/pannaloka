var React=require("react");
var E=React.createElement;
var filterEmptyRange=require("./util").filterEmptyRange;

var SimpleAttributeEditor=React.createClass({
	render:function() {
		return E("span",null,"simple attributes"
			,E("button",null,"Create Markup")
			);
	}
})
module.exports=SimpleAttributeEditor;