var React=require("react");
var Component=React.Component;
var PureComponent=require('react-pure-render').PureComponent;
var kcm=require("ksana-codemirror");
var CodeMirror=kcm.CodeMirror, getSelections=kcm.getSelections, getCharAtCursor=kcm.getCharAtCursor;
var cmfileio=require("../cmfileio");
var TextViewMenu=require("../components/textviewmenu");
var stackwidgetaction=require("../actions/stackwidget");
var ktxfileaction=require("../actions/ktxfile");
var docfileaction=require("../actions/docfile");
var markupstore=require("../stores/markup"),markupaction=require("../actions/markup");
var selectionaction=require("../actions/selection"), selectionstore=require("../stores/selection");
var transclude=require("./transclude");
var util=require("./util");
module.exports = class DefaultTextView extends Component {
	constructor (props) {
		super(props);
		this.state={dirty:false,markups:{},value:"",history:[]};
	}

	componentDidMount() {
		if (this.props.newfile) {
			this.setState({dirty:true,titlechanged:true,value:"new file",meta:{title:this.props.title}}
										,this.loadfile.bind(this));
		} else {
			cmfileio.readFile(this.props.filename,function(err,data){
				this.setState(data,this.loadfile.bind(this));
			}.bind(this));
		}
		this.unsubscribeMarkup = markupstore.listen(this.onMarkup.bind(this));
		this.unsubscribeSelection = selectionstore.listen(this.onSelection.bind(this));
	}
	componentWillUnmount () {
		this.unsubscribeMarkup();
		this.unsubscribeSelection();
	}
	componentDidUpdate() {
		this.setsize();
	}

	keymap(){
		this.cm.setOption("extraKeys", {
	  	"Ctrl-Q": function(cm) {
	  		var bookmark=cm.react.bookmark_transclusion();
	  		if (bookmark) {
	  			cm.react.addMarkup(bookmark);
	  			console.log(bookmark.key);	
	  		}
	  	}
	  	,"Ctrl-L":"gotoLine"
		});
	}

	//just for lookup , not trigger redraw as markup.handle already exists.
	addMarkup (markup) {
		if (!markup  || !markup.key) return;
		this.state.markups[markup.key]=markup;
		this.setState({dirty:true});
	}
	getMarkup (key) {
		return this.state.markups[key];
	}
	removeMarkup (key) {
		var m=this.state.markups[key];
		if (m) {
			m.handle.clear();
			delete this.state.markups[key];
			this.setState({dirty:true});
		} else {
			console.error("unknown markup id",key)
		}
	}

	loadfile () {
		this.cm=this.refs.cm.getCodeMirror();
		this.cm.react=this;
		this.generation=this.cm.changeGeneration(true);
		this.doc=this.cm.getDoc();			
		docfileaction.openFile(this.doc,this.props.filename);
		this.setsize();
		this.keymap();
		if (this.props.scrollTo) {
			util.scrollAndHighlight(this.doc,this.props.scrollTo);	
		}
	}

	onSelection (fileselections) {
		var selections=fileselections[this.props.filename];
		if (!selections) return;
		if (selections.length==0) {
			var cursor=this.doc.getCursor();
			this.doc.setSelections([{anchor:cursor,head:cursor}]);
			this.cm.focus();
		}
	}


	onMarkup (M,action) {		
		var shallowCopyMarkups = function(M) { //use Object.assign in future
			var out={};
			for (var i in M) out[i]=M[i];
			return out;
		}
		if (action && action.newly) {
			var markups=null;
			for (var i in M) {
				var m=M[i];
				if (m.doc===this.doc) {
					if (!markups) markups=shallowCopyMarkups(this.state.markups);
					markups[m.key]=m.markup;
				}
			}
			selectionaction.clearAllSelection();
			this.setState({dirty:true});
			if (markups) this.setState({markups});
		}
	}

	bookmark_transclusion () { // bookmark.className="transclusion"
		return transclude.apply(this,arguments);
	}

	setsize () {
		var menu=React.findDOMNode(this.refs.menu);
		if (this.cm) this.cm.setSize("100%",this.props.height-menu.offsetHeight); 
	}

	getWid() {
		return this.props.wid;
	}
	onClose () {
		stackwidgetaction.closeWidget(this.props.wid);
		selectionaction.clearSelectionOf(this.props.wid,this.props.filename);
		docfileaction.closeFile(this.doc);
	}

	onChange () {
		this.setState({dirty:!this.doc.isClean(this.generation)});
	}

	onSetTitle(title) {
		this.state.meta.title=title;
		this.setState({dirty:true,titlechanged:true});
	}

	setDirty(cb) {
		this.setState({dirty:true});
	}

  writefile (fn) {
  	cmfileio.writeFile(this.state.meta,this.cm,fn,function(err,newmeta){
      if (err) console.log(err);
      else  {
      	if (this.state.titlechanged) ktxfileaction.reload();
				this.generation=this.cm.changeGeneration(true);
				this.setState({dirty:false,titlechange:false,meta:newmeta,generation:this.generation});
      }
    }.bind(this));
  }

	onSave () {
		this.writefile(this.props.filename);
	}

	onCursorActivity () {
		clearTimeout(this.timer1);
		this.timer1=setTimeout(function(){
			var cursorch=getCharAtCursor(this.doc);
			var selections=getSelections(this.doc);
			selectionaction.setSelection(this.props.filename,selections,cursorch);
			var marks=this.doc.findMarksAt(this.doc.getCursor());
			var markups=[];
			var doc=this.doc;
			marks.forEach(function(m){
				if (m.type!=="bookmark" && !m.clearOnEnter) {
					markups.push({markup:this.state.markups[m.key],key:m.key,doc:doc})
				}
			}.bind(this));
			markupaction.markupsUnderCursor(markups);
		}.bind(this),300);//cursor throttle
	}
	render () {
		if (!this.state.value) return <div>loading {this.props.filename}</div>

		return <div>
			<TextViewMenu ref="menu" {...this.props}  dirty={this.state.dirty}  generation={this.state.generation}
				title={this.state.meta.title}
				onClose={this.onClose.bind(this)} onSave={this.onSave.bind(this)}
				onSetTitle={this.onSetTitle.bind(this)}/>
			<CodeMirror ref="cm" value={this.state.value} history={this.state.history} 
				markups={this.state.markups} 
				onCursorActivity={this.onCursorActivity.bind(this)}
				onChange={this.onChange.bind(this)}/>
		</div>
	}
}