var React=require("react");
var Component=React.Component;
var PureRender=require('react-addons-pure-render-mixin');


var ktxfilestore=require("../stores/ktxfile");
var FileItem=require("../components/fileitem");

var stackwidgetaction=require("../actions/stackwidget");
var NewFileButton = React.createClass({
	newfile : function(){
		var emptyfile={filename:ktxfilestore.newfilename() , title:"Untitled" , newfile:true};
		stackwidgetaction.openWidget(emptyfile,"TextWidget");
	}

	,render :function() {
		return <button onClick={this.newfile}>Create New File</button>
	}
});
var FileList = React.createClass({
	getInitialState:function(){
		return {files:[],selectedIndex:0};
	}

	,onData :function(files) {
		this.setState({files});
	}

	,componentDidMount :function() {
		this.unsubscribe = ktxfilestore.listen(this.onData);
	}

	,componentWillUnmount :function() {
		this.unsubscribe();
	}

	,openfile :function(e) {
		var fobj=this.state.files[this.state.selectedIndex];
		var obj=ktxfilestore.findFile(fobj.filename);
		if (obj) {
			stackwidgetaction.openWidget(obj,"TextWidget");	
		}
	}

	,renderItem :function(item,idx) {
		return <div key={idx} data-idx={idx}>
			<FileItem onClick={this.openfile}
			selected={this.state.selectedIndex==idx} {...item}/></div>
	}

	,selectItem :function(e) {
		var target=e.target;
		while (target && target.dataset && !target.dataset.idx) {
			target=target.parentElement;
		}
		if (!target || !target.dataset) return;
		var selectedIndex=parseInt(target.dataset.idx);
		if (!isNaN(selectedIndex)) this.setState({selectedIndex});
	}

	,render :function() {
		return <div>
				<NewFileButton/>
				<div onClick={this.selectItem}>{this.state.files.map(this.renderItem)}</div>
		</div>
	}
});
module.exports = FileList;