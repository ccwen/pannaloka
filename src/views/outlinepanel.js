var React=require("react");
var E=React.createElement;
var Component=React.Component;
var PureRender=require('react-addons-pure-render-mixin');

var docfilestore=require("../stores/docfile");
var ktcfilestore=require("../stores/ktcfile");
var ktcfileaction=require("../actions/ktcfile");
var highlight=require("../textview/highlight");
var TreeToc=require("ksana2015-treetoc").Component;
var RangeHyperlink=require("../components/rangehyperlink");
var SaveButton=require("../components/savebutton");
var selectionstore=require("../stores/selection");
var markupstore=require("../stores/markup");
var docfilestore=require("../stores/docfile");

var OutlinePanel = React.createClass({
	getInitialState:function() {		
		return { toc:[{d:0,t:"test"},{d:1,t:"testchild"}] ,dirty:false};
	}

	,onToc :function(toc) {
		if (!toc) return;
		this.setState({toc});
	}

	,componentDidMount :function() {
		this.unsubscribe = ktcfilestore.listen(this.onToc);
	}
	,componentWillUnmount :function() {
		this.unsubscribe();
	}
	,saveTree : function() {
		ktcfileaction.writeTree(this.state.toc);
		this.setState({dirty:false});
	}
	,onChanged : function() {
		this.setState({dirty:true});	
	}
	,setLink :function(node) {
		var m=markupstore.getEditing();

		if (m) {
			var text=highlight.getMarkupText(m.doc,m.markup.handle);
			node.links=[[docfilestore.fileOf(m.doc),m.key,text]];
		} else { //try range
			var ranges=selectionstore.getRanges({textLength:5,pack:true});
			if (ranges.length) {
				node.links=ranges;
			} else delete node.links;
		}
		this.onChanged();
		this.forceUpdate();
	}
	,onHyperlinkClick :function(file,range) {
		highlight.gotoRangeOrMarkupID(file,range,{moveCursor:true,autoOpen:true});
	}
	,onNode :function(node,selected,n,editingcaption) {
		if (n==editingcaption) {
			var label="🔗";
			if (node.links) label="reset "+label;
			return E("button",{onClick:this.setLink.bind(this,node)},label);
		} else {
			return E(RangeHyperlink,{onHyperlinkClick:this.onHyperlinkClick,ranges:node.links||[]})
		}
	}
	,render :function() {
		return <div>
		<SaveButton dirty={this.state.dirty} onSave={this.saveTree}/>
		<TreeToc opts={{editable:true,onNode:this.onNode}} 
			onChanged={this.onChanged} 
			toc={this.state.toc}/>
		</div>
	}
});
module.exports = OutlinePanel;