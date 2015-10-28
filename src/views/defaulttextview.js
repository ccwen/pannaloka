var React=require("react");
var ReactDOM=require("react-dom");
var CodeMirror=require("ksana-codemirror").Component;
var TextViewMenu=require("../components/textviewmenu");

var markupstore=require("../stores/markup"),markupaction=require("../actions/markup");
var selectionstore=require("../stores/selection");
var transclude=require("./transclude");

var cursormethod=require("./cursormethod");
var filemethod=require("./filemethod");
var markupmethod=require("./markupmethod");
var traitmethod=require("./traitmethod");

var charinfo=require("./charinfo");
var ListMarkup=require("./listmarkup");
var CloseTextButton=require("./closetextbutton");

module.exports = class DefaultTextView extends React.Component {
	constructor (props) {
		super(props);
		this.state={dirty:false,markups:{},value:"",history:[]};
		this.hasMarkupUnderCursor=false; //for second click on a markup
	}

	componentDidMount() {
		if (this.props.newfile) {
			this.setState({dirty:true,titlechanged:true,value:"new file"},this.loaded);
		} else {
			filemethod.load.call(this,this.props.trait.filename);
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
		var selections=fileselections[this.props.trait.filename];
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
		return traitmethod.setTitle.call(this,title); 
	}

	onSetFlexHeight = (flex) => {
		return traitmethod.setFlexHeight.call(this,flex); 
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
		return this.writefile(this.props.trait.filename); 
	}

	markupReady = () => {
		return !!this.state.markupReady;
	}

	onMarkupReady = () => {
		this.setState({markupReady:true});
		markupmethod.markupReady.call(this,this.state.markups);
	}


	onCursorActivity = (cm) => {
		cursormethod.cursorActivity.call(this,cm);
	}

	onMouseDown =(cm,e) =>{//double click on a markup
			//make sure getCursor() get updated
			cursormethod.mouseDown.call(this,cm,e);	
	}

	onMouseMove = (e) => {
		cursormethod.mouseMove.call(this,this.cm,e);
	}


	getTheme = () => {
		return localStorage.getItem("lighttheme")=="true"?"":"ambiance";
	}

	render () {
		if (!this.state.value) return <div>loading {this.props.trait.filename}</div>

		return <div>
			<CloseTextButton onClose={this.onClose}/>
			<TextViewMenu ref="menu" {...this.props}  dirty={this.state.dirty}  generation={this.state.generation}
				readOnly={this.props.trait.readOnly}
				onClose={this.onClose} onSave={this.onSave}
				onSetTitle={this.onSetTitle}
				onSetFlexHeight={this.onSetFlexHeight}/>
			<ListMarkup markups={this.state.markups} filename={this.props.trait.filename} doc={this.doc}/>
			
			<CodeMirror ref="cm" value={this.state.value} history={this.state.history} 
				markups={this.state.markups} 
				onMarkupReady={this.onMarkupReady}
				readOnly={this.props.trait.readOnly}
				onCursorActivity={this.onCursorActivity}
				theme={this.getTheme()}
				onMouseDown={this.onMouseDown}
				onMouseMove={this.onMouseMove}
				onChange={this.onChange}/>
		</div>
	}
}