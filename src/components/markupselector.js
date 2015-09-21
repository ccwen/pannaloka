var React=require("react");
var E=React.createElement;
var PureComponent=require("react-pure-render").PureComponent;
var RangeHyperlink=require("./rangehyperlink");
var markuptypedef=require("../markuptypedef/");
var styles={select:{fontSize:"100%"}}
module.exports = class MarkupSelector extends PureComponent {
	constructor (props) {
		super(props);
		this.state=this.getEditor(props.markups,0);
	}

	getEditor (markups,i) {
		var markupeditor=null,trait=null;
		if (markups.length) {
			trait=(markups[i]).markup;
			this.setMarker(markups[i].doc,trait.handle);
			var typedef=markuptypedef.types[trait.className];
			if (typedef) markupeditor=typedef.editor;
		} else {
			clearMarker
		}
		return {markupeditor,trait};
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

	renderMarkupItem (item,idx) {
		if (!item.key) {
			throw "no item key"
		}
		return <option key={idx}>{item.key.substr(0,5)}</option>
	}

	onSelectMarkup (e) {
		var i=e.target.selectedIndex;
		this.setState(this.getEditor(this.props.markups,i));
	}

	renderMarkupPicker () {
		if (this.props.markups.length>1) {
			return <select style={styles.select} onChange={this.onSelectMarkup.bind(this)}>
				{this.props.markups.map(this.renderMarkupItem.bind(this))}
				</select>
		}
	}

	renderOtherRange () {
		if (!this.state.trait.source)return;
		var other=this.state.trait.source?this.state.trait.source:this.state.trait.target;
		if (!other) return;
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