var React=require("react");
var E=React.createElement;
var Component=React.Component;
var PureComponent=require('react-pure-render').PureComponent;

var docfilestore=require("../stores/docfile");
var ktcfilestore=require("../stores/ktcfile");
var ktcfileaction=require("../actions/ktcfile");
var util=require("./util");
var TreeToc=require("ksana2015-treetoc").Component;
var RangeHyperlink=require("../components/rangehyperlink");
var SaveButton=require("../components/savebutton");
var selectionstore=require("../stores/selection");

module.exports = class OutlinePanel extends PureComponent {
	constructor (props) {
		super(props);
		this.state={ toc:[{d:0,t:"test"},{d:1,t:"testchild"}] ,dirty:false};
	}

	onToc ( allfiles, toc) {
		if (!toc) return;
		this.setState({toc});
	}

	componentDidMount () {
		this.unsubscribe = ktcfilestore.listen(this.onToc.bind(this));
	}
	componentWillUnmount () {
		this.unsubscribe();
	}
	saveTree () {
		ktcfileaction.writeTree(this.state.toc);
		this.setState({dirty:false});
	}
	onChanged() {
		this.setState({dirty:true});
	}

	setLink (node) {
		var ranges=selectionstore.getRanges({textLength:5});
		if (ranges.length) {
			node.links=ranges;
		} else delete node.links;
		this.onChanged();
		this.forceUpdate();
	}

	onHyperlinkClick(file,range) {
		util.gotoRangeOrMarkupID(file,range);
	}
	onNode(node,selected,n,editingcaption){
		if (n==editingcaption) {
			var label="🔗";
			if (node.links) label="reset "+label;
			return E("button",{onClick:this.setLink.bind(this,node)},label);
		} else {
			return E(RangeHyperlink,{onHyperlinkClick:this.onHyperlinkClick.bind(this),ranges:node.links||[]})
		}
	}

	render () {
		return <div>
		<SaveButton dirty={this.state.dirty} onSave={this.saveTree.bind(this)}/>
		<TreeToc opts={{editable:true,onNode:this.onNode.bind(this)}} 
			onChanged={this.onChanged.bind(this)} 
			toc={this.state.toc}/>
		</div>
	}
}