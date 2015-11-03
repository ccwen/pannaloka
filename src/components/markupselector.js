var React=require("react");
var E=React.createElement;
var RangeHyperlink=require("./rangehyperlink");
var markuptypedef=require("../markuptypedef/");
var styles={picker:{border:"2px solid silver",borderRadius:"25%",cursor:"pointer"}}
var MarkupSelector = React.createClass({
	getInitialState:function(){
		this.editingMarker=[];
		return this.getEditor(this.props.markups,0);
	}
	
	,highlightMarkup :function(markups,idx) {
		
		this.clearMarker();
		this.setMarker(markups[idx].doc,markups[idx].markup.handle,"editingMarker samegroup");
		if (!this.props.getOther) return;
		var others=this.props.getOther(markups[idx].markup);
		others.map(function(m){
			if (!m.handle)return;
			this.setMarker(m.handle.doc,m.handle,"samegroup");
		}.bind(this));
	}

	
	,setMarker :function(doc,textmarker,clsname) {
		clsname=clsname||"editingMarker";
		var pos=textmarker.find();
		this.editingMarker.push(doc.markText(pos.from,pos.to,{className:clsname}));
	}	

	,getEditor :function(markups,idx) {
		var markupeditor=null,M=null,deletable=false,typedef=null;
		if (markups.length) {
			M=(markups[idx]).markup;
			//doc==null, markup owner doc is freed
			if (!markups[idx].doc|| !M) return {markupeditor:null,M:null,idx:0,deletable:false,typedef:null};
			this.highlightMarkup.call(this,markups,idx);
			typedef=markuptypedef.types[M.className];
			if (typedef) {
				markupeditor=typedef.editor;
				deletable=typedef.isDeletable?typedef.isDeletable(M):true;
			}
			var ctrl_m_handler=deletable?this.onDeleteMarkup:null;
			this.props.onEditing&&this.props.onEditing(markups[idx],ctrl_m_handler);
		} else {
			this.clearMarker();
		}
		return {markupeditor,M,idx,deletable,typedef};
	}

	,shouldComponentUpdate :function(nextProps) {
		return (nextProps.markups!==this.props.markups && nextProps.markups.length>0
			||nextProps.ranges.length>0 || (this.props.markups.length && this.props.markups[0].doc==null)) ;
	}
	,componentWillReceiveProps :function(nextProps) {
		if (nextProps.markups.length) {
			this.setState(this.getEditor(nextProps.markups,0));	
		}
	}

	,clearMarker :function() {
		if (this.editingMarker) {
			this.editingMarker.map(function(m){m.clear()});
			this.editingMarker=[];
		}
	}

	,renderMarkupItem :function() {
		var idx=this.state.idx;
		var item=this.props.markups[idx];
		return <span key={idx}>{(idx+1)+"/"+this.props.markups.length}</span>
	}

	,onNextMarkup :function(e) {
		var i=this.state.idx+1;
		if (i&& i===this.props.markups.length) i=0;
		this.setState(this.getEditor(this.props.markups,i));
		this.forceUpdate();
	}

	,renderMarkupPicker :function() {
		if (this.props.markups.length>1) {
			return <span style={styles.picker} onClick={this.onNextMarkup}>{this.renderMarkupItem()}</span>
		}
	}

	,renderTarget :function() {
		if (!this.state.M) return;
		var others=this.state.M.target;
		if (!others)return;
		if (!Array.isArray( others[0]) ) others=[others];
		return E(RangeHyperlink,{ranges:others,onHyperlinkClick:this.props.onHyperlinkClick
			,onHyperlinkEnter:this.props.onHyperlinkEnter});
	}


	,renderOthers:function() { //same view
		if (!this.state.M) return;
		if (!this.props.getOther) return;
		var others=this.props.getOther(this.state.M,{format:"range"});
		return E(RangeHyperlink,{ranges:others,onHyperlinkClick:this.props.onHyperlinkClick
				,onHyperlinkEnter:this.props.onHyperlinkEnter});
	}

	,componentWillUnmount :function() {
		this.clearMarker();
	}

	,onUpdateMarkup :function (trait) {
		var m=this.props.markups[this.state.idx];
		var mtrait=m.markup.trait;
		if (!mtrait) mtrait=m.markup.trait={};
		for (var i in trait) {
			mtrait[i]=trait[i];
		}
		this.props.onChanged&&this.props.onChanged(m.doc);	
	}

	,onDeleteMarkup :function () {
		var m=this.props.markups[this.state.idx].markup;
		this.props.onDelete(m,this.state.typedef);
		//this is a hack, because shouldComponentUpdate return false
		this.setState({M:null,markupeditor:null});
		this.forceUpdate();
	}

	,renderTypedef :function() {
		return (this.state.typedef)?this.state.typedef.label:"";
	}
	,render :function() {
		if (!this.props.markups.length || !this.props.getOther) {
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
});
module.exports=MarkupSelector;