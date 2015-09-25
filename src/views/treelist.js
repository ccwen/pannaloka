var React=require("react");
var Component=React.Component;
var PureComponent=require('react-pure-render').PureComponent;

var ktcfilestore=require("../stores/ktcfile");
var FileItem=require("../components/fileitem");

var ktcfileaction=require("../actions/ktcfile");
class NewFileButton extends Component {
	newfile () {
		ktcfileaction.newTree();
		setTimeout(function(){
			this.props.onOpenTree();
		}.bind(this),100);
		
	}

	render () {
		return <button onClick={this.newfile.bind(this)}>Create New Tree</button>
	}
}
module.exports = class TreeList extends Component {
	constructor (props) {
		super(props);
		this.state={files:[],selectedIndex:0};
	}

	onData (files) {
		this.setState({files});
	}

	componentDidMount () {
		this.unsubscribe = ktcfilestore.listen(this.onData.bind(this));
	}

	componentWillUnmount () {
		this.unsubscribe();
	}

	opentree (e) {
		var file=this.state.files[this.state.selectedIndex];
		ktcfileaction.openTree(file.filename);
		this.props.onOpenTree && this.props.onOpenTree();
	}

	renderItem (item,idx) {
		return <div key={idx} data-idx={idx}>
			<FileItem onClick={this.opentree.bind(this)} selected={this.state.selectedIndex==idx} {...item}/></div>
	}

	selectItem (e) {
		var target=e.target;
		while (target && !target.dataset.idx) {
			target=target.parentElement;
		}
		var selectedIndex=parseInt(target.dataset.idx);
		if (!isNaN(selectedIndex)) this.setState({selectedIndex});
	}

	render () {
		return <div>
				<NewFileButton onOpenTree={this.props.onOpenTree.bind(this)}/>
				<div onClick={this.selectItem.bind(this)}>{this.state.files.map(this.renderItem.bind(this))}</div>
		</div>
	}
}