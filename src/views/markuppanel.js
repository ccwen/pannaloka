var React=require("react");
var Component=React.Component;
var PureComponent=require('react-pure-render').PureComponent;

var markupstore=require("../stores/markup");
var selectionstore=require("../stores/selection");
var CreateMarkup=require("./createmarkup");
var MarkupSelector=require("../components/markupselector");
var util=require("./util");

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
			var keys=Object.keys(markups);
			var wid=null;
			if (keys.length) wid=markups[keys[0]].doc.getEditor().react.getWid();
			this.setState({markups,wid});
		}
	}

	componentDidMount () {
		this.unsubscribe = markupstore.listen(this.onMarkup.bind(this));
	}

	componentWillUnmount () {
		this.unsubscribe();
	}

	onHyperlinkClick (file,mid) {
		util.gotoRangeOrMarkupID(file,mid,this.state.wid);
	}

	onChanged (doc) {
		doc.getEditor().react.setDirty();
	}

	render () {
		var editor=(selectionstore.hasRange()||!this.state.markups.length)?
			<CreateMarkup/>
			:<MarkupSelector onHyperlinkClick={this.onHyperlinkClick.bind(this)}
			 markups={this.state.markups} onChanged={this.onChanged.bind(this)}
			 editing={this.state.editing}/>;
															   

		return <div>{editor}</div>
	}
}