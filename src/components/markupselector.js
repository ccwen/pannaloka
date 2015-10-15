var React=require("react");
var E=React.createElement;
var PureComponent=require("react-pure-render").PureComponent;
var RangeHyperlink=require("./rangehyperlink");
var markuptypedef=require("../markuptypedef/");
var styles={picker:{border:"2px solid silver",borderRadius:"25%",cursor:"pointer"}}
module.exports = class MarkupSelector extends PureComponent {
	constructor (props) {
		super(props);
		this.editingMarker=[];
		this.state=this.getEditor(props.markups,0);
	}
	
	highlightMarkup (markups,idx) {
		if (!this.props.getOther) return;
		this.clearMarker();
		this.setMarker(markups[idx].doc,markups[idx].markup.handle);
		var others=this.props.getOther(markups[idx].markup);
		others.map(function(m){
			this.setMarker(m.handle.doc,m.handle);
		}.bind(this));
	}

	
	setMarker (doc,textmarker) {
		var pos=textmarker.find();
		this.editingMarker.push(doc.markText(pos.from,pos.to,{className:"editingMarker",clearOnEnter:true}));
	}	

	getEditor (markups,idx) {
		var markupeditor=null,M=null,deletable=true,typedef=null;
		if (markups.length) {
			M=(markups[idx]).markup;
			if (!M) return {markupeditor:null,M:null,idx:0,deletable:false,typedef:null};
			this.highlightMarkup.call(this,markups,idx);
			typedef=markuptypedef.types[M.className];
			if (typedef) {
				markupeditor=typedef.editor;
				deletable=typedef.isDeletable?typedef.isDeletable(M):true;
			}
		} else {
			this.clearMarker();
		}
		this.props.onEditing&&this.props.onEditing(markups[idx]);
		return {markupeditor,M,idx,deletable,typedef};
	}

	componentWillReceiveProps () {
		if (typedef && typedef.isDeletable) {
			var deletable=typedef.isDeletable(this.state.M);
			if (deletable!==this.state.deletable) this.setState({deletable});
		} else if (!this.state.deletable) this.setState({deletable:true});
	}

	clearMarker () {
		if (this.editingMarker) {
			this.editingMarker.map(function(m){m.clear()});
			this.editingMarker=[];
		}
	}

	componentWillReceiveProps (nextProps) {
		this.setState(this.getEditor(nextProps.markups,0));
	}

	renderMarkupItem () {
		var idx=this.state.idx;
		var item=this.props.markups[idx];
		return <span key={idx}>{(idx+1)+"/"+this.props.markups.length}</span>
	}

	onNextMarkup = (e) => {
		var i=this.state.idx+1;
		if (i&& i===this.props.markups.length) i=0;
		this.setState(this.getEditor(this.props.markups,i));
	}

	renderMarkupPicker () {
		if (this.props.markups.length>1) {
			return <span style={styles.picker} onClick={this.onNextMarkup}>{this.renderMarkupItem()}</span>
		}
	}
	//<select style={styles.select} onChange={this.onSelectMarkup.bind(this)}>
	//?s

	renderTarget() {
		if (!this.state.M) return;
		var others=this.state.M.target;
		if (!others)return;
		if (!Array.isArray( others[0]) ) others=[others];
		return E(RangeHyperlink,{ranges:others,onHyperlinkClick:this.props.onHyperlinkClick});		
	}


	renderOthers() { //same view
		if (!this.state.M) return;
		if (!this.props.getOther) return;
		var others=this.props.getOther(this.state.M,{format:"range"});
		return E(RangeHyperlink,{ranges:others,onHyperlinkClick:this.props.onHyperlinkClick});
	}

	componentWillUnmount () {
		this.clearMarker();
	}

	onUpdateMarkup = (trait) => {
		var m=this.props.markups[this.state.idx];
		var mtrait=m.markup.trait;
		for (var i in trait) {
			mtrait[i]=trait[i];
		}
		this.props.onChanged&&this.props.onChanged(m.doc);	
	}

	onDeleteMarkup = () => {
		var m=this.props.markups[this.state.idx].markup;
		this.props.onDelete(m,this.state.typedef);
	}

	renderTypedef () {
		return (this.state.typedef)?this.state.typedef.label:"";
	}
	render () {
		if (!this.props.markups.length) {
			this.clearMarker();
			return <span></span>
		}

		return <span>
				{this.renderMarkupPicker()}
				{this.renderTypedef()}
				{this.state.markupeditor?E(this.state.markupeditor,{
					editing:true,markup:this.state.M
					,deletable:this.state.deletable
					,onUpdateMarkup:this.onUpdateMarkup
					,onDeleteMarkup:this.onDeleteMarkup
				}):null}
				{this.renderTarget()}
				{this.renderOthers()}				
		</span>
	}
}