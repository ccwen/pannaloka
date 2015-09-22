var React=require("react");
var E=React.createElement;
var styles={input:{fontSize:"100%"}};
var ActionButton=require("./actionbutton");
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
	,oAttr1Change(e) {
		this.setState({attr1:e.target.value,dirty:true});
	}
	,render:function() {
		return E("span",null
			,E("input",{ref:"attr1",style:styles.input,value:this.state.attr1,onChange:this.oAttr1Change})
			,<ActionButton deletable={this.props.deletable}
			   editing={this.props.editing} dirty={this.state.dirty}
				 onCreateMarkup={this.onCreateMarkup} 
				 onDeleteMarkup={this.props.onDeleteMarkup}
				 onUpdateMarkup={this.onUpdateMarkup}/>
			);
	}
})
module.exports=SimpleAttributeEditor;