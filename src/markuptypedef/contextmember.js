var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;
var highlight=require("../textview/highlight");
var docfilestore=require("../stores/docfile");
var RangeHyperlink=require("../components/rangehyperlink");
var isDefinition=require("./validatecontext").isDefinition;
var styles={deletehyperlink:{cursor:"pointer",color:"yellow",background:"red",fontSize:"75%"
,borderRadius:"5px",cursor:"no-drop"},label:{fontSize:"75%"}};
var ContextMember=React.createClass({
	propTypes:{
		"member":PT.array.isRequired
		,"setMember":PT.func
		,"sideButton":PT.func
		,"onSideButtonClick":PT.func
		,"filename":PT.string.isRequired
	}
	,onHyperlinkClick:function(file,mid) {
		var doc=docfilestore.docOf(file);
		if (doc) { //already in view , open the target
			var m=doc.getEditor().react.getMarkup(mid);
			highlight.autoGoMarkup(m);
		} else {
			highlight.gotoRangeOrMarkupID(file,mid,{autoOpen:true});	
		}
	}
	,onHyperlinkEnter:function(file,mid) {
		var doc=docfilestore.docOf(file);
		var m=doc.getEditor().react.getMarkup(mid);
		highlight.highlightRelatedMarkup(m);
	}
	,onDeleteClick:function(e) {
		var idx=parseInt(e.target.parentElement.dataset.idx);
		if (!idx)return;
		var member=this.props.member.filter(function(m,i){
			return i!==idx;
		});
		this.props.setMember(member);
	}
	,renderItem:function(item,idx,hovering) {
		if (!idx || idx!==hovering || !this.props.removable) return false; //hand over to default
		return <span key={idx} data-idx={idx}> | <span title="從情境移除" 
			className="rangehyperlink" style={styles.deletehyperlink} 
			onClick={this.onDeleteClick}>{item[2]}</span></span>
	}
	,getMasterTerm:function(filename) {
		if (!this.props.member || !this.props.member[0] ||  !this.props.member[0].handle) return;
		var doc=docfilestore.docOf(filename);
		return highlight.getMarkupText(doc,this.props.member[0].handle);
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

		return <RangeHyperlink ranges={ranges} renderItem={this.renderItem}
			onHyperlinkClick={this.onHyperlinkClick}
			onHyperlinkEnter={this.onHyperlinkEnter}/>
	}	
});
module.exports=ContextMember;
