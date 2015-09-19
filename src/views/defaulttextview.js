import React , {Component} from 'react';
import {CodeMirror, getSelections, getCharAtCursor} from 'ksana-codemirror';
import cmfileio from '../cmfileio';

import {TextViewMenu} from '../components/textviewmenu';
import stackwidgetaction from '../actions/stackwidget';
import selectionaction from '../actions/selection';
import selectionstore from '../stores/selection';
import docfileaction from '../actions/docfile';
import markupstore from '../stores/markup';


export class DefaultTextView extends Component {
	constructor (props) {
		super(props);
		this.state={value:"",dirty:false};
	}
	componentDidMount() {

		cmfileio.readFile(this.props.filename,function(err,data){
			this.setState(data);
			this.setState({dirty:false});
			this.cm=this.refs.cm.getCodeMirror();
			this.generation=this.cm.changeGeneration(true);
			this.doc=this.cm.getDoc();

			//link three together
			docfileaction.openFile(this.doc,this.props.filename);

			this.setsize();

			//link
		}.bind(this));

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

	onMarkup (M,action) {
		if (action.newly) {
			var markups=Object.assign({},this.state.markups);
			
			for (var i in M) {
				var m=M[i];
				if (m.doc===this.doc) {
					markups[i]=m.markup;
				}
			}
			selectionaction.clearAllSelection();
			this.setState({dirty:true,markups});
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


  writefile (fn) {
  	cmfileio.writeFile(this.state.meta,this.cm,fn,function(err,newmeta){
      if (err) console.log(err);
      else  {
				this.generation=this.cm.changeGeneration(true);
				this.setState({dirty:false,meta:newmeta,generation:this.generation});
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
		}.bind(this),300);
		
	}
	render () {
		if (!this.state.value) return <div>loading</div>

		return <div>
			<TextViewMenu ref="menu" {...this.props}  dirty={this.state.dirty}  generation={this.state.generation}
				onClose={this.onClose.bind(this)} onSave={this.onSave.bind(this)}/>
			<CodeMirror ref="cm" value={this.state.value} history={this.state.history} 
				markups={this.state.markups} 
				onCursorActivity={this.onCursorActivity.bind(this)}
				onChange={this.onChange.bind(this)}/>
		</div>
	}
}