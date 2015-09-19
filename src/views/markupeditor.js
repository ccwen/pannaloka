var React=require("react");
var Component=React.Component;
var PureComponent=require('react-pure-render').PureComponent;

var markupstore=require("../stores/markup");
var CreateMarkup=require("./createmarkup");
var MarkupSelector=require("../components/markupselector");

module.exports = class MarkupEditor extends PureComponent {
	constructor (props) {
		super(props);
		this.state={editing:null,markups:[]};
	}
	onClose () {
		stackwidgetaction.closeWidget(this.props.wid)
	}

	onData (action,markups) {
		if (action.editing) this.setState({editing:action.editing});
	}

	componentDidMount () {
		this.unsubscribe = markupstore.listen(this.onData.bind(this));
	}

	componentWillUnmount () {
		this.unsubscribe();
	}

	render () {
		var editor=this.state.editing?<MarkupSelector markups={this.state.markups} editing={this.state.editing}/>
															   :<CreateMarkup/> ;

		return <div>{editor}</div>
	}
}