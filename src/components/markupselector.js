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
		var markupeditor=null,trait=null;
		if (markups.length) {
			trait=(markups[idx]).markup;
			this.setMarker(markups[idx].doc,trait.handle);
			var typedef=markuptypedef.types[trait.className];
			if (typedef) markupeditor=typedef.editor;
		} else {
			clearMarker();
		}
		return {markupeditor,trait,idx};
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
		var other=this.state.trait.by?this.state.trait.by:this.state.trait.source;
		if (!other)return;
		if (!Array.isArray( other[0]) ) other=[other];
		return E(RangeHyperlink,{ranges:other,onHyperlinkClick:this.props.onHyperlinkClick});
	}

	componentWillUnmount () {
		this.clearMarker();
	}

	render () {
		if (!this.props.markups.length) {
			this.clearMarker();
			return <span></span>
		}

		return <span>
				{this.renderMarkupPicker()}
				{this.state.markupeditor?E(this.state.markupeditor,{editing:true,markup:this.state.trait}):null}
				{this.renderOtherRange()}
		</span>
	}
}