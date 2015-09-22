var React=require("react");
var E=React.createElement;
var PureComponent=require("react-pure-render").PureComponent;
var RangeHyperlink=require("./rangehyperlink");
var markuptypedef=require("../markuptypedef/");
var styles={picker:{border:"2px solid silver",borderRadius:"25%",cursor:"pointer"}}
module.exports = class MarkupSelector extends PureComponent {
	constructor (props) {
		super(props);
		this.state=this.getEditor(props.markups,0);
	}

	getEditor (markups,idx) {
		var markupeditor=null,M=null,deletable=false,typedef=null;
		if (markups.length) {
			M=(markups[idx]).markup;
			this.setMarker(markups[idx].doc,M.handle);
			typedef=markuptypedef.types[M.className];
			if (typedef) {
				markupeditor=typedef.editor;
				deletable=typedef.isDeletable(M);
			}
		} else {
			clearMarker();
		}
		return {markupeditor,M,idx,deletable,typedef};
	}

	componentWillReceiveProps () {
		if (typedef) {
			var deletable=typedef.isDeletable(this.state.M);
			if (deletable!==this.state.deletable) this.setState({deletable});
		}
	}

	clearMarker () {
		if (this.editingMarker) {
			this.editingMarker.clear();
			this.editingMarker=null;
		}
	}
	
	setMarker (doc,textmarker) {
		this.clearMarker();
		var pos=textmarker.find();
		this.editingMarker=doc.markText(pos.from,pos.to,{className:"editingMarker",clearOnEnter:true});
	}

	componentWillReceiveProps (nextProps) {
		this.setState(this.getEditor(nextProps.markups,0));
	}

	renderMarkupItem () {
		var idx=this.state.idx;
		var item=this.props.markups[idx];
		return <span key={idx}>{(idx+1)+"/"+this.props.markups.length}</span>
	}

	onNextMarkup (e) {
		var i=this.state.idx+1;
		if (i&& i===this.props.markups.length) i=0;
		this.setState(this.getEditor(this.props.markups,i));
	}

	renderMarkupPicker () {
		if (this.props.markups.length>1) {
			return <span style={styles.picker} onClick={this.onNextMarkup.bind(this)}>{this.renderMarkupItem()}</span>
		}
	}
	//<select style={styles.select} onChange={this.onSelectMarkup.bind(this)}>
	//?s

	renderOtherRange () {
		var other=this.state.M.by?this.state.M.by:this.state.M.source;
		if (!other)return;
		if (!Array.isArray( other[0]) ) other=[other];
		return E(RangeHyperlink,{ranges:other,onHyperlinkClick:this.props.onHyperlinkClick});
	}

	componentWillUnmount () {
		this.clearMarker();
	}

	onUpdateMarkup (trait) {
		var m=this.props.markups[this.state.idx];
		var mtrait=m.markup.trait;
		for (var i in trait) {
			mtrait[i]=trait[i];
		}
		this.props.onChanged&&this.props.onChanged(m.doc);	
	}

	onDeleteMarkup () {
		var m=this.props.markups[this.state.idx].markup;
		this.props.onDelete(m,this.state.typedef);
	}

	render () {
		if (!this.props.markups.length) {
			this.clearMarker();
			return <span></span>
		}

		return <span>
				{this.renderMarkupPicker()}
				{this.state.markupeditor?E(this.state.markupeditor,{
					editing:true,markup:this.state.M
					,deletable:this.state.deletable
					,onUpdateMarkup:this.onUpdateMarkup.bind(this)
					,onDeleteMarkup:this.onDeleteMarkup.bind(this)
				}):null}
				{this.renderOtherRange()}
		</span>
	}
}