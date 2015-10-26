var React=require("react");
var E=React.createElement;
var styles={input:{border:"0px",fontSize:"100%",outline:0,borderBottom:"1px solid "}};
var ActionButton=require("./actionbutton");
var getMemberMarkup=require("./validatecontext").getMemberMarkup;
var RangeHyperlink=require("../components/rangehyperlink");
var util=require("../views/util");
var docfilestore=require("../stores/docfile");

var SideButton=React.createClass({
	render:function(){
		return <button onClick={this.props.onClick}>×</button>	
	}
});

var ContextAttributeEditor=React.createClass({
	getInitialState:function() {
		var attr1=(this.props.markup&&this.props.markup.trait)?this.props.markup.trait.attr1:"";
		return {attr1:attr1,dirty:false,member:getMemberMarkup(this.props.selections)||[]};
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
		this.setState({attr1:attr1,member:getMemberMarkup(nextprops.selections)||[]});
	}
	,onHyperlinkClick:function(file,mid,opts) {
		util.gotoRangeOrMarkupID(file,mid,this.state.wid,opts);
	}

	,onHyperlinkEnter:function(file,mid) {
		var doc=docfilestore.docOf(file);
		var m=doc.getEditor().react.getMarkup(mid);
		var keys=mid;
		if (m.others) {
			keys=[mid].concat(m.others);
		}
		util.gotoRangeOrMarkupID(file,keys,this.state.wid,{noScroll:true});
	}
	,onSideButtonClick:function(e) {
		var idx=parseInt(e.target.parentElement.dataset.idx);
		if (!idx)return;
		var member=this.state.member.filter(function(m,i){
			return i!==idx;
		});
		this.setState({member:member});
	}
	,renderSideButton:function(idx,lastidx) {
		if (this.state.member.length<3)return;
		if (idx && lastidx===idx) {
			return E(SideButton,{idx:idx,onClick:this.onSideButtonClick});
		}
	}
	,getMasterTerm:function(filename) {
		var doc=docfilestore.docOf(filename);
		return util.getMarkupText(doc,this.state.member[0].handle);
	}
	,renderMember:function() {
		var getTypeLabel=require("./types").getTypeLabel; //not available when this file is loaded
		var keys=Object.keys(this.props.selections);
		var filename=keys[0];
		var ranges=this.state.member.map(function(m,idx){
			var label=getTypeLabel(m.className);
			return [filename,m.key,idx?label:this.getMasterTerm(filename),idx?"從情境移除":label];
		}.bind(this));

		return <RangeHyperlink renderSideButton={this.renderSideButton} ranges={ranges}
			onHyperlinkClick={this.onHyperlinkClick}
			onHyperlinkEnter={this.onHyperlinkEnter}/>
	}
	,render:function() {
		return E("span",null
			,<ActionButton 
				 deletable={this.props.deletable}
			   editing={this.props.editing} 
			   setHotkey={this.props.setHotkey} 
			   dirty={this.state.dirty}
				 onCreateMarkup={this.onCreateMarkup} 
				 onDeleteMarkup={this.props.onDeleteMarkup}
				 onUpdateMarkup={this.onUpdateMarkup}/>
			,this.renderMember()
			);
	}
})
module.exports=ContextAttributeEditor;