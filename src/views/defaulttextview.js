import React , {Component} from 'react';
import {CodeMirror} from 'ksana-codemirror';
import cmfileio from '../cmfileio';

import {TextViewMenu} from '../components/textviewmenu';
import stackwidgetaction from '../actions/stackwidget';

export class DefaultTextView extends Component {
	constructor (props) {
		super(props);
		this.state={value:""};
	}
	componentDidMount() {
		cmfileio.readFile(this.props.filename,function(err,data){
			this.setState(data);
		}.bind(this));
	}
	componentDidUpdate() {
		var cm=this.refs.cm.getCodeMirror();
		var menu=React.findDOMNode(this.refs.menu);
		cm.setSize("100%",this.props.height-menu.offsetHeight); 
	}
	onClose () {
		stackwidgetaction.closeWidget(this.props.wid);
	}
	render () {
		if (!this.state.value) return <div>loading</div>

		return <div>
			<TextViewMenu ref="menu" {...this.props} onClose={this.onClose.bind(this)}/>
			<CodeMirror ref="cm" value={this.state.value} history={this.state.history} 
				markups={this.state.markups}/>
		</div>
	}
}