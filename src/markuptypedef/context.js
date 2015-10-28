var React=require("react");
var E=React.createElement;
var ActionButton=require("./actionbutton");
var ContextMember=require("./contextmember");
var getMemberMarkup=require("./validatecontext").getMemberMarkup;
var markupaction=require("../actions/markup");

var ContextAttributeEditor=React.createClass({
	getInitialState:function() {
		var attr1=(this.props.markup&&this.props.markup.trait)?this.props.markup.trait.attr1:"";
		return {attr1:attr1,dirty:false,member:getMemberMarkup(this.props.selections)||[]
		,filename:this.getFilenameFromSelection()};
	}
	,onCreateMarkup:function() {
		var def=this.state.member[0];
		var memberkeys=this.state.member.map(function(m){return m.key});
		memberkeys.shift();
		def.handle.member=memberkeys;
		var pos=def.handle.find();
		markupaction.editMarkup(def);
		def.handle.doc.getEditor().react.setDirty();
	}
	,getFilenameFromSelection:function(selections) {
		var keys=Object.keys(selections||this.props.selections);
		if (keys.length) return keys[0];
	}
	,componentWillReceiveProps:function(nextprops) {
		var attr1=(nextprops.markup&&nextprops.markup.trait)?nextprops.markup.trait.attr1:"";

		this.setState({attr1:attr1,member:getMemberMarkup(nextprops.selections)||[],
			filename:this.getFilenameFromSelection(nextprops.selections)});
	}
	,setMember:function(member) {
		this.setState({member:member});
	}
	,render:function() {
		return E("span",null
			,<ActionButton 
			   setHotkey={this.props.setHotkey} 
			   dirty={this.state.dirty}
				 onCreateMarkup={this.onCreateMarkup}/>
			,<ContextMember member={this.state.member}
				filename={this.state.filename} removable={true}
				setMember={this.setMember}/>
			);
	}
})
module.exports=ContextAttributeEditor;