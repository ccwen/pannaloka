var React=require("react");
var E=React.createElement;
var DefaultMarkupAttributeEditor=React.createClass({
	onCreateMarkup:function() {
		this.props.onCreateMarkup({});
	}
	,render:function() {
		return E("span",null,
			E("button",{onClick:this.onCreateMarkup},"Create Markup")
		);
	}
});
module.exports=DefaultMarkupAttributeEditor;