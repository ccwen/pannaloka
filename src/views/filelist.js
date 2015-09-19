var React=require("react");
var Component=React.Component;
var PureComponent=require('react-pure-render').PureComponent;

var ktxfilestore=require("../stores/ktxfile");
var FileItem=require("../components/fileitem");

var stackwidgetaction=require("../actions/stackwidget");

module.exports = class FileList extends Component {
	constructor (props) {
		super(props);
		this.state={files:[],selectedIndex:0};
	}

	onData (files) {
		console.log(files)
		this.setState({files});
	}

	componentDidMount () {
		this.unsubscribe = ktxfilestore.listen(this.onData.bind(this));
	}

	componentWillUnmount () {
		this.unsubscribe();
	}

	openfile (e) {
		var file=this.state.files[this.state.selectedIndex];
		stackwidgetaction.openWidget(file,"TextWidget");
	}

	renderItem (item,idx) {
		return <div key={idx} data-idx={idx}>
			<FileItem onClick={this.openfile.bind(this)} selected={this.state.selectedIndex==idx} {...item}/></div>
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
		return <div onClick={this.selectItem.bind(this)}>{this.state.files.map(this.renderItem.bind(this))}</div>
	}
}