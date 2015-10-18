var React=require("react");
var ReactDOM=require("react-dom");
var CodeMirror=require("ksana-codemirror").Component;
var TextViewMenu=require("../components/textviewmenu");

var markupstore=require("../stores/markup"),markupaction=require("../actions/markup");
var selectionstore=require("../stores/selection");
var transclude=require("./transclude");

var cursoractivity=require("./cursoractivity");
var filemethod=require("./filemethod");
var markupmethod=require("./markupmethod");
var charinfo=require("./charinfo");
module.exports = class DefaultTextView extends React.Component {
	constructor (props) {
		super(props);
		this.state={dirty:false,markups:{},value:"",history:[]};
		this.hasMarkupUnderCursor=false; //for second click on a markup
	}

	componentDidMount() {
		if (this.props.newfile) {
			this.setState({dirty:true,titlechanged:true,value:"new file",meta:{title:this.props.title}}
										,this.loaded);
		} else {
			filemethod.load.call(this,this.props.filename);
		}
		this.unsubscribeMarkup = markupstore.listen(this.onMarkup);
		this.unsubscribeSelection = selectionstore.listen(this.onSelection);
	}

	componentWillUnmount () {
		this.unsubscribeMarkup();
		this.unsubscribeSelection();
		this.cm.react=null;
	}

	componentDidUpdate() {
		this.setsize();
	}

	keymap(){
		this.cm.setOption("extraKeys", {
	  	"Ctrl-L": function(cm) {
	  		var bookmark=cm.react.bookmark_transclusion(null,markupstore.getEditing());
	  		if (bookmark) {
	  			cm.react.addMarkup(bookmark);
	  			cm.react.setState({dirty:true});
	  		}
	  	}
	  	,"Ctrl-S":this.onSave
	  	,"Ctrl-M":markupaction.toggleMarkup.bind(this)
	  	,"Ctrl-K":"text2markup"
	  	,"Shift-Ctrl-K":"markup2text"
	  	,"Ctrl-I":charinfo.run
	  	,"Ctrl-D":charinfo.run
	  	//,"Ctrl-B": search markup with same type, jump to first markup if no editing markup
	  	//,"Ctrl-E": //dangerous, beside ctrl+W
	  	//,"Ctrl-J":
	  	//,"Ctrl-U" , Ctrl-O , Ctrl+P , Ctrl+D
	  	//,"Ctrl-R"
	  	//,

	  	,"Ctrl-Q":this.onClose.bind(this)
		});
	}

	rebuildMilestone = (markups) => {
		markupmethod.rebuildMilestone.call(this,markups);
	}

 //uses by ksana-codemirror/automarkup.js
	createMilestones = (ranges) => {	
		return markupmethod.createMilestones.call(this,ranges);	
	}

	//just for lookup , not trigger redraw as markup.handle already exists.
	addMarkup = (markup) => {	
		return markupmethod.addMarkup.call(this,markup);	
	}

	getMarkup = (key) => {
		return this.state.markups[key];	
	}

	getOther = (markup,opts) => {
		return markupmethod.getOther.call(this,markup,opts);
	}

	removeMarkup (key) {
		return markupmethod.removeMarkup.call(this,key);
	}

	onMarkup = (M,action) => {		
		return markupmethod.onMarkup.call(this,M,action);
	}

	onSelection = (fileselections) => {
		var selections=fileselections[this.props.filename];
		if (!selections) return;
		if (selections.length==0) {
			var cursor=this.doc.getCursor();
			this.doc.setSelections([{anchor:cursor,head:cursor}]);
			this.cm.focus();
		}
	}	

	bookmark_transclusion (bookmark,editing_markup) { // bookmark.className="transclusion" , bookmark_ prefix (see markups.js applyBookmark)
		return transclude.call(this,bookmark,editing_markup);
	}

	setsize () {
		var menu=ReactDOM.findDOMNode(this.refs.menu);
		if (this.cm) this.cm.setSize("100%",this.props.height-menu.offsetHeight); 
	}

	getWid() {
		return this.props.wid;
	}
	onClose = () => {
		filemethod.close.call(this);
	}

	onChange = (doc,change) => {
		this.setState({dirty:!this.doc.isClean(this.generation)});

		if (doc.lineCount()!==this.state.lineCount) {
			console.log("change rebuild milestone")
			this.rebuildMilestone(this.state.markups);
			this.setState({lineCount:doc.lineCount()})
		}
	}

	onSetTitle = (title) => {
		this.state.meta.title=title;
		this.setState({dirty:true,titlechanged:true});
	}

	setDirty(cb) {
		this.setState({dirty:true});
	}

	loaded = () => {
		return filemethod.loaded.call(this); 
	}

  writefile (fn) { 
  	return filemethod.save.call(this,fn); 
  }

	onSave = () => {	
		return this.writefile(this.props.filename); 
	}

	onMarkupReady = () => {
		markupmethod.markupReady.call(this,this.state.markups);
	}


	onCursorActivity = (cm) => {
		cursoractivity.cursorActivity.call(this,cm);
	}

	onMouseDown =(cm,e) =>{//double click on a markup
			//make sure getCursor() get updated
			cursoractivity.mouseDown.call(this,cm,e);	
	}

	render () {
		if (!this.state.value) return <div>loading {this.props.filename}</div>

		return <div>
			<TextViewMenu ref="menu" {...this.props}  dirty={this.state.dirty}  generation={this.state.generation}
				title={this.state.meta.title}
				readOnly={this.state.meta.readOnly}
				onClose={this.onClose} onSave={this.onSave}
				onSetTitle={this.onSetTitle}/>
			<CodeMirror ref="cm" value={this.state.value} history={this.state.history} 
				markups={this.state.markups} 
				onMarkupReady={this.onMarkupReady}
				readOnly={this.state.meta.readOnly}
				onCursorActivity={this.onCursorActivity}
				onMouseDown={this.onMouseDown}
				onChange={this.onChange}/>
		</div>
	}
}