var React=require("react");
var E=React.createElement;
var styles={input:{fontSize:"100%"}};
var SimpleAttributeEditor=React.createClass({
	getInitialState:function() {
		return {attr1:"",dirty:false};
	}
	,onCreateMarkup:function() {
		this.props.onCreateMarkup({attr1:this.state.attr1});
	}
	,onUpdateMarkup:function() {
		this.props.onUpdateMarkup({attr1:this.state.attr1});
	}
	,renderButton:function () {
		var buttontext=this.props.editing?(this.state.dirty?"Update":null):"Create";
		if (buttontext) return E("button",{onClick:this.handler()},buttontext);
	}
	,handler:function() {
		return this.props.editing?this.onUpdateMarkup:this.onCreateMarkup;
	}
	,oAttr1Change(e) {
		this.setState({attr1:e.target.value,dirty:true});
	}
	,render:function() {
		return E("span",null
			,E("input",{ref:"attr1",style:styles.input,value:this.state.attr1,onChange:this.oAttr1Change})
			,this.renderButton()
			);
	}
})
module.exports=SimpleAttributeEditor;