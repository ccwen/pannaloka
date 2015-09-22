var React=require("react");
var Component=React.Component;
var PureComponent=require('react-pure-render').PureComponent;

var markupstore=require("../stores/markup");
var selectionstore=require("../stores/selection");
var docfilestore=require("../stores/docfile");
var CreateMarkup=require("./createmarkup");
var MarkupSelector=require("../components/markupselector");
var util=require("./util");

module.exports = class MarkupEditor extends PureComponent {
	constructor (props) {
		super(props);
		this.state={editing:null,markups:[],hasSelection:false,deletable:false};
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

	onDocfile() {
		this.forceUpdate();
	}

	componentDidMount () {
		this.unsubscribe1 = markupstore.listen(this.onMarkup.bind(this));
		this.unsubscribe2 = docfilestore.listen(this.onDocfile.bind(this));
	}

	componentWillUnmount () {
		this.unsubscribe1();
		this.unsubscribe2();
	}

	onHyperlinkClick (file,mid) {
		util.gotoRangeOrMarkupID(file,mid,this.state.wid);
	}

	onChanged (doc) {
		doc.getEditor().react.setDirty();
	}

	onDelete (m,typedef) {
		if (!m || !m.handle) {
			throw "wrong markup"
			return;
		}
		markupstore.remove(m);
		if (typedef.onDelete) typedef.onDelete(m);
	}

	render () {
		var editor=(selectionstore.hasRange()||!this.state.markups.length)?
			<CreateMarkup/>
			:<MarkupSelector onHyperlinkClick={this.onHyperlinkClick.bind(this)}
			 markups={this.state.markups} onChanged={this.onChanged.bind(this)}
			 onDelete={this.onDelete}
			 editing={this.state.editing} deletable={this.state.deletable}/>;
															   

		return <div>{editor}</div>
	}
}