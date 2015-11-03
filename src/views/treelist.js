var React=require("react");
var Component=React.Component;
var PureRender=require('react-addons-pure-render-mixin');

var ktcfilestore=require("../stores/ktcfile");
var FileItem=require("../components/fileitem");

var ktcfileaction=require("../actions/ktcfile");
var NewFileButton =React.createClass({
	newfile : function(){
		ktcfileaction.newTree();
		setTimeout(function(){
			this.props.onOpenTree();
		}.bind(this),100);
		
	}

	,render :function() {
		return <button onClick={this.newfile}>Create New Tree</button>
	}
});

var TreeList = React.createClass({
	getInitialState:function(){
		return {files:[],selectedIndex:0};
	}

	, onData :function(files) {
		this.setState({files});
	}

	,componentDidMount :function() {
		this.unsubscribe = ktcfilestore.listen(this.onData);
	}

	,componentWillUnmount :function() {
		this.unsubscribe();
	}

	,opentree :function(e) {
		var file=this.state.files[this.state.selectedIndex];
		ktcfileaction.openTree(file.filename);
		this.props.onOpenTree && this.props.onOpenTree();
	}

	,renderItem :function(item,idx) {
		return <div key={idx} data-idx={idx}>
			<FileItem onClick={this.opentree} selected={this.state.selectedIndex==idx} {...item}/></div>
	}

	,selectItem :function(e) {
		var target=e.target;
		while (target && !target.dataset.idx) {
			target=target.parentElement;
		}
		var selectedIndex=parseInt(target.dataset.idx);
		if (!isNaN(selectedIndex)) this.setState({selectedIndex});
	}

	,render :function() {
		return <div>
				<NewFileButton onOpenTree={this.props.onOpenTree}/>
				<div onClick={this.selectItem}>{this.state.files.map(this.renderItem)}</div>
		</div>
	}
});

module.exports = TreeList ;