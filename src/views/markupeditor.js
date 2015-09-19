var React=require("react");
var Component=React.Component;
var PureComponent=require('react-pure-render').PureComponent;

var markupstore=require("../stores/markup");
var selectionstore=require("../stores/selection");
var CreateMarkup=require("./createmarkup");
var MarkupSelector=require("../components/markupselector");

module.exports = class MarkupEditor extends PureComponent {
	constructor (props) {
		super(props);
		this.state={editing:null,markups:[],hasSelection:false};
	}
	onClose () {
		stackwidgetaction.closeWidget(this.props.wid)
	}

	onMarkup (markups,action) {
		if (action.cursor) {
			this.setState({markups});
		}
	}

	componentDidMount () {
		this.unsubscribe = markupstore.listen(this.onMarkup.bind(this));
	}

	componentWillUnmount () {
		this.unsubscribe();
	}

	render () {
		var editor=(selectionstore.hasRange()||!this.state.markups.length)?<CreateMarkup/>
			:<MarkupSelector markups={this.state.markups} editing={this.state.editing}/>;
															   

		return <div>{editor}</div>
	}
}