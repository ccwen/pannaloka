var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;
var util=require("../views/util");
var docfilestore=require("../stores/docfile");
var RangeHyperlink=require("../components/rangehyperlink");
var isDefinition=require("./validatecontext").isDefinition;

var ContextMember=React.createClass({
	propTypes:{
		"member":PT.array.isRequired
		,"setMember":PT.func
		,"sideButton":PT.func
		,"onSideButtonClick":PT.func
		,"filename":PT.string.isRequired
	}
	,onHyperlinkClick:function(file,mid) {
		util.gotoRangeOrMarkupID(file,mid,{autoOpen:true});
	}
	,onHyperlinkEnter:function(file,mid) {
		var doc=docfilestore.docOf(file);
		var m=doc.getEditor().react.getMarkup(mid);
		var keys=mid;
		if (m.others) {
			keys=[mid].concat(m.others);
		}
		util.gotoRangeOrMarkupID(file,keys,{noScroll:true});
	}
	,onSideButtonClick:function(e) {
		var idx=parseInt(e.target.parentElement.dataset.idx);
		if (!idx)return;
		var member=this.props.member.filter(function(m,i){
			return i!==idx;
		});
		this.props.setMember(member);
		//this.setState({member:member});
	}
	,renderSideButton:function(idx,lastidx) {
		if (this.props.member.length<3 || !this.props.sideButton)return;
		if (idx && lastidx===idx) {
			return E(this.props.sideButton,{idx:idx,onClick:this.onSideButtonClick});
		}
	}	
	,getMasterTerm:function(filename) {
		var doc=docfilestore.docOf(filename);
		return util.getMarkupText(doc,this.props.member[0].handle);
	}

	,render:function() {
		var getTypeLabel=require("./types").getTypeLabel; //not available when this file is loaded
		var ranges=this.props.member.map(function(m,idx){
			var label=getTypeLabel(m.className);
			var firstDef=idx||!isDefinition(m);
			return [this.props.filename,m.key,
			   firstDef?label:this.getMasterTerm(this.props.filename)
				,firstDef?"從情境移除":"設定情境"];
		}.bind(this));

		return <RangeHyperlink renderSideButton={this.renderSideButton} ranges={ranges}
			onHyperlinkClick={this.onHyperlinkClick}
			onHyperlinkEnter={this.onHyperlinkEnter}/>
	}	
});
module.exports=ContextMember;
