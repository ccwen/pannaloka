var React=require("react");
var Component=React.Component;
var PureComponent=require('react-pure-render').PureComponent;

var ktxfilestore=require("../stores/ktxfile");
var FileItem=require("../components/fileitem");

var stackwidgetaction=require("../actions/stackwidget");
class NewFileButton extends Component {
	newfile = () => {
		var emptyfile={filename:ktxfilestore.newfilename() , title:"Untitled" , newfile:true};
		stackwidgetaction.openWidget(emptyfile,"TextWidget");
	}

	render () {
		return <button onClick={this.newfile}>Create New File</button>
	}
}
module.exports = class FileList extends Component {
	constructor (props) {
		super(props);
		this.state={files:[],selectedIndex:0};
	}

	onData = (files) => {
		this.setState({files});
	}

	componentDidMount () {
		this.unsubscribe = ktxfilestore.listen(this.onData);
	}

	componentWillUnmount () {
		this.unsubscribe();
	}

	openfile = (e) => {
		var fobj=this.state.files[this.state.selectedIndex];
		var obj=ktxfilestore.findFile(fobj.filename);
		if (obj) {
			stackwidgetaction.openWidget(obj,"TextWidget");	
		}
	}

	renderItem (item,idx) {
		return <div key={idx} data-idx={idx}>
			<FileItem onClick={this.openfile}
			selected={this.state.selectedIndex==idx} {...item}/></div>
	}

	selectItem = (e) => {
		var target=e.target;
		while (target && !target.dataset.idx) {
			target=target.parentElement;
		}
		var selectedIndex=parseInt(target.dataset.idx);
		if (!isNaN(selectedIndex)) this.setState({selectedIndex});
	}

	render () {
		return <div>
				<NewFileButton/>
				<div onClick={this.selectItem}>{this.state.files.map(this.renderItem.bind(this))}</div>
		</div>
	}
}