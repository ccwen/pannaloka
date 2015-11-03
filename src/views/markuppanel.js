var React=require("react");
var Component=React.Component;
var PureRender=require('react-addons-pure-render-mixin');


var markupstore=require("../stores/markup");
var markupaction=require("../actions/markup");
var selectionstore=require("../stores/selection");
var docfilestore=require("../stores/docfile");
var CreateMarkup=require("./createmarkup");
var MarkupSelector=require("../components/markupselector");
var MarkupNavigator=require("./markupnav");
var util=require("./util");

var MarkupPanel = React.createClass({
	getInitialState() {
		return {editing:null,markups:[],hasSelection:false,deletable:false,getOther:null};
	}
	,onClose : function()  {
		stackwidgetaction.closeWidget(this.props.wid)
	}

	,onMarkup : function (markups,action)  {
		if (action.cursor) {
			var keys=Object.keys(markups);
			var wid=null,cm=null,getOther=null;
			if (keys.length) {
				cm=markups[keys[0]].doc.getEditor();
				wid=cm.react.getWid();
				getOther=cm.react.getOther;
			}
			this.setState({markups,wid,cm,getOther});
		}
	}

	,onDocfile : function()  {
		this.forceUpdate();
	}

	,componentDidMount : function() {
		this.unsubscribe1 = markupstore.listen(this.onMarkup);
		this.unsubscribe2 = docfilestore.listen(this.onDocfile);
	}

	,componentWillUnmount : function() {
		this.unsubscribe1();
		this.unsubscribe2();
	}

	,onHyperlinkClick : function (file,mid,opts)  {
		var o={};
		for (var i in opts)	o[i]=opts[i];
		o.below=this.state.wid;
		o.autoopen=true;
		util.gotoRangeOrMarkupID(file,mid,o);
	}

	,onHyperlinkEnter : function (file,mid)  {
		util.gotoRangeOrMarkupID(file,mid,{noScroll:true});
	}

	,goMarkupByKey : function (mid)  {
		var editing=markupstore.getEditing();
		if (!editing)return;
		var file=docfilestore.fileOf(editing.doc);
		this.onHyperlinkClick(file,mid,{moveCursor:true});
	}

	,onChanged : function (doc)  {
		doc.getEditor().react.setDirty();
	}

	,onDelete : function(m,typedef)  {
		if (!m || !m.handle) {
			throw "wrong markup"
			return;
		}
		markupstore.remove(m);
		var others=m.handle.doc.getEditor().react.getOther(m);
		if (others) {
			others.map(function(other){markupstore.remove(other)});
		}
		typedef.onDelete &&	typedef.onDelete(m);
	}

	,onEditing : function(m,handler)  {
		markupstore.setEditing(m,handler);
	}

	,render : function () {		

		var ranges=selectionstore.getRanges();

		return (<span><span style={{fontSize:"130%"}}>|</span>
			<MarkupNavigator goMarkupByKey={this.goMarkupByKey}/>
			<CreateMarkup editing={!this.state.markups.length}/>
			<MarkupSelector 
			 onHyperlinkClick={this.onHyperlinkClick}
			 onHyperlinkEnter={this.onHyperlinkEnter}
			 getOther={this.state.getOther} 
			 markups={this.state.markups} onChanged={this.onChanged}
			 onDelete={this.onDelete}
			 onEditing={this.onEditing}
			 ranges={ranges}
			 editing={this.state.editing} deletable={this.state.deletable}/>

			 
			</span>

		)
	}
});
module.exports=MarkupPanel;