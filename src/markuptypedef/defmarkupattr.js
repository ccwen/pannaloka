var React=require("react");
var E=React.createElement;
var DefaultMarkupAttributeEditor=React.createClass({
	getInitialState:function() {
		return {dirty:false};
	}
	,onCreateMarkup:function() {
		this.props.onCreateMarkup({});
	}
	,onUpdateMarkup:function() {
		this.props.onUpdateMarkup({});
	}
	,renderButton:function () {
		var buttontext=this.props.editing?(this.state.dirty?"Update":null):"Create";
		if (buttontext) return E("button",{onClick:this.handler()},buttontext);
	}
	,handler:function() {
		return this.props.editing?this.onUpdateMarkup:onCreateMarkup;
	}
	,render:function() {
		return E("span",null,
			this.renderButton()
		);
	}
});
module.exports=DefaultMarkupAttributeEditor;