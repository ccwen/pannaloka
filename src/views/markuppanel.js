var React=require("react");
var Component=React.Component;
var PureComponent=require('react-pure-render').PureComponent;

var markupstore=require("../stores/markup");
var markupaction=require("../actions/markup");
var selectionstore=require("../stores/selection");
var docfilestore=require("../stores/docfile");
var CreateMarkup=require("./createmarkup");
var MarkupSelector=require("../components/markupselector");
var util=require("./util");

module.exports = class MarkupPanel extends PureComponent {
	constructor (props) {
		super(props);
		this.state={editing:null,markups:[],hasSelection:false,deletable:false,getOther:null};
	}
	onClose = () => {
		stackwidgetaction.closeWidget(this.props.wid)
	}

	onMarkup = (markups,action) => {
		if (action.cursor) {
			var keys=Object.keys(markups);
			var wid=null,cm=null,getOther=null;
			if (keys.length) {
				cm=markups[keys[0]].doc.getEditor();
				wid=cm.react.getWid();
				getOther=cm.react.getOther;
			}
			this.setState({markups,wid,cm,getOther});
		}
	}

	onDocfile =() => {
		this.forceUpdate();
	}

	componentDidMount () {
		this.unsubscribe1 = markupstore.listen(this.onMarkup);
		this.unsubscribe2 = docfilestore.listen(this.onDocfile);
	}

	componentWillUnmount () {
		this.unsubscribe1();
		this.unsubscribe2();
	}

	onHyperlinkClick = (file,mid) => {
		util.gotoRangeOrMarkupID(file,mid,this.state.wid);
	}

	onChanged = (doc) => {
		doc.getEditor().react.setDirty();
	}

	onDelete = (m,typedef) => {
		if (!m || !m.handle) {
			throw "wrong markup"
			return;
		}
		markupstore.remove(m);
		var others=m.handle.doc.getEditor().react.getOther(m);
		if (others) {
			others.map(function(other){markupstore.remove(other)});
		}
		typedef.onDelete &&	typedef.onDelete(m);
	}

	onEditing = (m,handler) => {
		markupaction.editing(m,handler);
	}

	render () {		

		var ranges=selectionstore.getRanges();

		return (<span><span style={{fontSize:"130%"}}>|</span>
			<CreateMarkup editing={!this.state.markups.length}/>
			<MarkupSelector onHyperlinkClick={this.onHyperlinkClick}
			 getOther={this.state.getOther} 
			 markups={this.state.markups} onChanged={this.onChanged}
			 onDelete={this.onDelete}
			 onEditing={this.onEditing}
			 ranges={ranges}
			 editing={this.state.editing} deletable={this.state.deletable}/>
			</span>
		)
	}
}