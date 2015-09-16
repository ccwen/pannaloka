import React , {Component} from 'react';
import {CodeMirror, getSelections, getCharAtCursor} from 'ksana-codemirror';
import cmfileio from '../cmfileio';

import {TextViewMenu} from '../components/textviewmenu';
import stackwidgetaction from '../actions/stackwidget';
import selectionaction from '../actions/selection';

export class DefaultTextView extends Component {
	constructor (props) {
		super(props);
		this.state={value:"",dirty:false};
	}
	componentDidMount() {
		cmfileio.readFile(this.props.filename,function(err,data){
			this.setState(data);
			this.setState({dirty:false});
			this.generation=this.cm.changeGeneration(true);
		}.bind(this));
	}
	componentDidUpdate() {
		if (!this.cm) {
			this.cm=this.refs.cm.getCodeMirror();
			this.doc=this.cm.getDoc();			
		}

		var menu=React.findDOMNode(this.refs.menu);
		this.cm.setSize("100%",this.props.height-menu.offsetHeight); 
	}

	onClose () {
		stackwidgetaction.closeWidget(this.props.wid);
		selectionaction.clearSelectionOf(this.props.wid,this.props.filename);
	}

	onChange () {
		this.setState({dirty:!this.doc.isClean(this.generation)});
	}


  writefile (fn) {
  	cmfileio.writeFile(this.state.meta,this.cm,fn,function(err,newmeta){
      if (err) console.log(err);
      else  {
				this.setState({dirty:false,meta:newmeta});
				this.generation=this.cm.changeGeneration(true);
      }
    }.bind(this));
  }

	onSave () {
		this.writefile(this.props.filename);
	}


	onCursorActivity () {
		var cursorch=getCharAtCursor(this.doc);
		var selections=getSelections(this.doc);
		selectionaction.setSelection(this.props.wid,this.props.filename,selections,cursorch);
	}
	render () {
		if (!this.state.value) return <div>loading</div>

		return <div>
			<TextViewMenu ref="menu" {...this.props}  dirty={this.state.dirty}
				onClose={this.onClose.bind(this)} onSave={this.onSave.bind(this)}/>
			<CodeMirror ref="cm" value={this.state.value} history={this.state.history} 
				markups={this.state.markups} 
				onCursorActivity={this.onCursorActivity.bind(this)}
				onChange={this.onChange.bind(this)}/>
		</div>
	}
}