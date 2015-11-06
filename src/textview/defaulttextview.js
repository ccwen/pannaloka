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
var googledrive=require("./googledrive");
var DefaultTextView = React.createClass({

	getInitialState:function() {
		this.hasMarkupUnderCursor=false; //for second click on a markup
		return {dirty:false,markups:{},value:"",history:[]};
	}

	,componentDidMount :function() {
		if (this.props.newfile) {
			this.setState({dirty:true,titlechanged:true,value:"new file"},this.loaded);
		} else {
			filemethod.load.call(this,this.props.trait.filename,this.props.trait);
		}
		this.unsubscribeMarkup = markupstore.listen(this.onMarkup);
		this.unsubscribeSelection = selectionstore.listen(this.onSelection);
	}

	,componentWillUnmount:function() {
		this.unsubscribeMarkup();
		this.unsubscribeSelection();
		this.cm.react=null;
		googledrive.unmount.call(this);
	}

	,componentDidUpdate:function() {
		this.setsize();
	}

	,isGoogleDriveFile:function(){
		return (this.props.trait && this.props.trait.host==="google");
	}
	,keymap:function(){
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

	  	,"Ctrl-Q":this.onClose
		});
	}

	,rebuildMilestone :function (markups)  {
		markupmethod.rebuildMilestone.call(this,markups);
	}

 //uses by ksana-codemirror/automarkup.js
	,createMilestones :function(ranges) {	
		return markupmethod.createMilestones.call(this,ranges);	
	}

	//just for lookup , not trigger redraw as markup.handle already exists.
	,addMarkup :function (markup) {	
		return markupmethod.addMarkup.call(this,markup);	
	}

	,getMarkup :function (key) {
		return this.state.markups[key];	
	}

	,getOther :function (markup,opts) {
		return markupmethod.getOther.call(this,markup,opts);
	}

	,removeMarkup :function(key) {
		return markupmethod.removeMarkup.call(this,key);
	}

	,onMarkup :function (M,action) {		
		return markupmethod.onMarkup.call(this,M,action);
	}

	,onSelection :function (fileselections) {
		var selections=fileselections[this.props.trait.filename];
		if (!selections) return;
		if (selections.length==0) {
			var cursor=this.doc.getCursor();
			this.doc.setSelections([{anchor:cursor,head:cursor}]);
			this.cm.focus();
		}
	}	

	,bookmark_transclusion :function(bookmark,editing_markup) { // bookmark.className="transclusion" , bookmark_ prefix (see markups.js applyBookmark)
		return transclude.call(this,bookmark,editing_markup);
	}

	,setsize :function() {
		var menu=ReactDOM.findDOMNode(this.refs.menu);
		if (this.cm) this.cm.setSize("100%",this.props.height-menu.offsetHeight); 
	}

	,getWid:function() {
		return this.props.wid;
	}
	,onClose :function () {
		filemethod.close.call(this);
	}

	,onChange :function (doc,change) {
		this.setState({dirty:!this.doc.isClean(this.generation)});

		if (doc.lineCount()!==this.state.lineCount) {
			console.log("change rebuild milestone")
			this.rebuildMilestone(this.state.markups);
			this.setState({lineCount:doc.lineCount()})
		}
	}

	,onSetTitle :function (title) {
		return traitmethod.setTitle.call(this,title); 
	}

	,onSetFlexHeight :function (flex) {
		return traitmethod.setFlexHeight.call(this,flex); 
	}

	,setDirty:function(cb) {
		this.setState({dirty:true});
	}

	,loaded :function () {
		return filemethod.loaded.call(this); 
	}

  ,writefile :function(fn) { 
  	return filemethod.save.call(this,fn); 
  }

	,onSave :function () {	
		return this.writefile(this.props.trait.filename); 
	}

	,markupReady :function() {
		return !!this.state.markupReady;
	}

	,onMarkupReady :function () {
		this.setState({markupReady:true});
		markupmethod.markupReady.call(this,this.state.markups);
	}


	,onCursorActivity :function (cm) {
		cursormethod.cursorActivity.call(this,cm);
	}

	,onMouseDown :function (cm,e) {//double click on a markup
		cursormethod.mouseDown.call(this,cm,e);	
	}

	,onMouseMove :function(e) {
		cursormethod.mouseMove.call(this,this.cm,e);
	}


	,getTheme :function() {
		return localStorage.getItem("lighttheme")=="true"?"":"ambiance";
	}

	,onBeforeChange :function(cm,changeObj) {
		googledrive.beforeChange.call(this,cm,changeObj);
	}

	,render:function () {
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
				onBeforeChange={this.onBeforeChange}
				theme={this.getTheme()}
				onMouseDown={this.onMouseDown}
				onMouseMove={this.onMouseMove}
				onChange={this.onChange}/>
		</div>
	}
});
module.exports=DefaultTextView;