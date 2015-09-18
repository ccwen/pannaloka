var React=require("react");
var E=React.createElement;

var SimpleAttributeEditor=React.createClass({
	onCreateMarkup:function() {
		var val=React.findDOMNode(this.refs.attr1).value;
		this.props.onCreateMarkup({attr1:val});
	}
	,render:function() {
		return E("span",null
			,E("input",{ref:"attr1",defaultValue:"abc"})
			,E("button",{onClick:this.onCreateMarkup},"Create Markup")
			);
	}
})
module.exports=SimpleAttributeEditor;