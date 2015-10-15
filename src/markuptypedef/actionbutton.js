var React=require("react");
var E=React.createElement;
var styles={input:{fontSize:"100%"},deletebutton:{color:"red"}};
var ActionButton=React.createClass({
	getHandler:function() {
		var handler=this.props.editing?this.props.onUpdateMarkup:this.props.onCreateMarkup;
		this.props.setHotkey&&this.props.setHotkey(handler);
		return handler;
	}
	,deleteButton:function(){
		if (this.props.editing && !this.props.dirty && this.props.deletable ) {
			return E("button",{title:"Ctrl+M",onClick:this.props.onDeleteMarkup,style:styles.deletebutton},"DELETE")
		}
	}
	,render:function () {
		var buttontext=this.props.editing?(this.props.dirty?"Update":null):"Create";
		return E("span",null
			,(buttontext?E("button",{title:"Ctrl+M",onClick:this.getHandler()},buttontext):null)
			,this.deleteButton()
		);
	}
});
module.exports=ActionButton;