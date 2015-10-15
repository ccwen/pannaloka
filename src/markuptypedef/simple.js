var React=require("react");
var E=React.createElement;
var styles={input:{border:"0px",fontSize:"100%",outline:0,borderBottom:"1px solid "}};
var ActionButton=require("./actionbutton");
var SimpleAttributeEditor=React.createClass({
	getInitialState:function() {
		var attr1=(this.props.markup&&this.props.markup.trait)?this.props.markup.trait.attr1:"";
		return {attr1:attr1,dirty:false};
	}
	,onCreateMarkup:function() {
		this.props.onCreateMarkup({attr1:this.state.attr1});
	}
	,onUpdateMarkup:function() {
		this.props.onUpdateMarkup({attr1:this.state.attr1});
		this.setState({dirty:false});
	}
	,componentWillReceiveProps:function(nextprops) {
		var attr1=(nextprops.markup&&nextprops.markup.trait)?nextprops.markup.trait.attr1:"";
		this.setState({attr1:attr1});
	}
	,oAttr1Change(e) {
		this.setState({attr1:e.target.value,dirty:true});
	}
	,render:function() {
		return E("span",null
			,"note:"
			,E("input",{ref:"attr1",style:styles.input,value:this.state.attr1,onChange:this.oAttr1Change})
			,<ActionButton 
				 deletable={this.props.deletable}
			   editing={this.props.editing} 
			   setHotkey={this.props.setHotkey} 
			   dirty={this.state.dirty}
				 onCreateMarkup={this.onCreateMarkup} 
				 onDeleteMarkup={this.props.onDeleteMarkup}
				 onUpdateMarkup={this.onUpdateMarkup}/>
			);
	}
})
module.exports=SimpleAttributeEditor;