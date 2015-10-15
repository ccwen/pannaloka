var React=require("react");
var ActionButton=require("./actionbutton");

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

		return <ActionButton 
				 deletable={this.props.deletable}
			   editing={this.props.editing} 
			   setHotkey={this.props.setHotkey} 
				 onCreateMarkup={this.onCreateMarkup} 
				 onDeleteMarkup={this.props.onDeleteMarkup}
				 onUpdateMarkup={this.onUpdateMarkup}/>

		//var buttontext=this.props.editing?(this.state.dirty?"Update":"|"):"Create";
		//if (buttontext) return E("button",{onClick:this.getHandler()},buttontext);
	}
	,getHandler:function() {
		var handler=this.props.editing?this.onUpdateMarkup:this.onCreateMarkup;
		return handler;
	}
	,render:function() {
		return E("span",null,
			this.renderButton()
		);
	}
});
module.exports=DefaultMarkupAttributeEditor;