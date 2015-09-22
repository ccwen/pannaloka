var React=require("react");
var E=React.createElement;
var styles={input:{fontSize:"100%"}};
var QuoteAttributeEditor=React.createClass({
	getInitialState:function() {
		var m=this.props.markup;
		this.note="";
		if (m&&m.trait) this.note=m.trait.note;
		return {note:this.note,dirty:false};
	}
	,onCreateMarkup:function() {
		this.props.onCreateMarkup({note:this.state.note});
	}
	,onUpdateMarkup:function() {
		this.props.onUpdateMarkup({note:this.state.note});
		this.setState({dirty:false});
	}
	,renderButton:function () {
		var buttontext=this.props.editing?(this.state.dirty?"Update":null):"Create";
		if (buttontext) return E("button",{onClick:this.handler()},buttontext);
	}
	,handler:function() {
		return this.props.editing?this.onUpdateMarkup:this.onCreateMarkup;
	}
	,onNoteChange(e) {
		var dirty=e.target.value!==this.note;
		this.setState({note:e.target.value,dirty:dirty});
	}
	,render:function() {
		return E("span",null
			,E("input",{ref:"note",style:styles.input,value:this.state.note,onChange:this.onNoteChange})
			,this.renderButton()
			);
	}
})
module.exports=QuoteAttributeEditor;