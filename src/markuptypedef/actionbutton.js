var React=require("react");
var E=React.createElement;
var styles={input:{fontSize:"100%"},deletebutton:{color:"red"}};
var ActionButton=React.createClass({
	handler:function() {
		return this.props.editing?this.props.onUpdateMarkup:this.props.onCreateMarkup;
	}
	,deleteButton:function(){
		if (this.props.editing && !this.props.dirty && this.props.deletable ) {
			return E("button",{onClick:this.props.onDeleteMarkup,style:styles.deletebutton},"DELETE")
		}
	}
	,render:function () {
		var buttontext=this.props.editing?(this.props.dirty?"Update":null):"Create";
		return E("span",null
			,(buttontext?E("button",{onClick:this.handler()},buttontext):null)
			,this.deleteButton()
		);
	}
});
module.exports=ActionButton;