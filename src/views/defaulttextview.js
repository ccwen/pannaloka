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

module.exports = class DefaultTextView extends Component {
	constructor (props) {
		super(props);
		this.state={value:"",dirty:false,markups:{},value:"",history:[]};
	}

	loadfile () {
		this.cm=this.refs.cm.getCodeMirror();
		this.generation=this.cm.changeGeneration(true);
		this.doc=this.cm.getDoc();			
		docfileaction.openFile(this.doc,this.props.filename);			
		this.setsize();
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

	onSelection (fileselections) {
		var selections=fileselections[this.props.filename];
		if (!selections) return;
		if (selections.length==0) {
			var cursor=this.doc.getCursor();
			this.doc.setSelections([{anchor:cursor,head:cursor}]);
			this.cm.focus();
		}
	}

	copyMarkup (M) {
		var out={};
		for (var i in M) out[i]=M[i];
		return out;
	}

	onMarkup (M,action) {
		if (action && action.newly) {
			var markups=null;
			for (var i in M) {
				var m=M[i];
				if (m.doc===this.doc) {
					if (!markups) markups=this.copyMarkup(this.state.markups);			
					markups[m.key]=m.markup;
				}
			}
			selectionaction.clearAllSelection();
			this.setState({dirty:true});
			if (markups) this.setState({markups});
		}
	}

	componentWillUnmount () {
		this.unsubscribeMarkup();
		this.unsubscribeSelection();
	}

	setsize () {
		var menu=React.findDOMNode(this.refs.menu);
		if (this.cm) this.cm.setSize("100%",this.props.height-menu.offsetHeight); 
	}

	componentDidUpdate() {
		this.setsize();
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
			var markups=marks.map(function(m){return {markup:m,key:m.key,doc:this.doc}}.bind(this));
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