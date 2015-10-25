var React=require("react");
var E=React.createElement;
var styles={input:{fontSize:"80%"}};
var ActionButton=require("./actionbutton");
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
	,componentWillReceiveProps:function(nextprops) {
		var m=nextprops.markup;
		this.note="";
		if (m&&m.trait) this.note=m.trait.note;
		this.setState({note:this.note});
	}
	,onNoteChange(e) {
		var dirty=e.target.value!==this.note;
		this.setState({note:e.target.value,dirty:dirty});
	}
	,render:function() {
		return E("span",null
			,<ActionButton deletable={this.props.deletable}
			   editing={this.props.editing} dirty={this.state.dirty}
				 onCreateMarkup={this.onCreateMarkup} 
				 onDeleteMarkup={this.props.onDeleteMarkup}
				 onUpdateMarkup={this.onUpdateMarkup}/>
			,E("input",{ref:"note",style:styles.input,value:this.state.note,onChange:this.onNoteChange})
			);
	}
})
module.exports=QuoteAttributeEditor;