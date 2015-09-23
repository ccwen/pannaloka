var React=require("react");
var Component=React.Component;
var PureComponent=require('react-pure-render').PureComponent;

var docfilestore=require("../stores/docfile");
var ktcfilestore=require("../stores/ktcfile");
var ktcfileaction=require("../actions/ktcfile");
var TreeToc=require("ksana2015-treetoc").Component;
var SaveButton=require("../components/savebutton");

module.exports = class OutlinePanel extends PureComponent {
	constructor (props) {
		super(props);
		this.state={ toc:[{d:0,t:"abc"},{d:1,t:"edf"}] ,dirty:false};
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



	render () {
		return <div>
		<SaveButton dirty={this.state.dirty} onSave={this.saveTree.bind(this)}/>
		<TreeToc opts={{editable:true}} onChanged={this.onChanged.bind(this)} toc={this.state.toc}/>
		</div>
	}
}