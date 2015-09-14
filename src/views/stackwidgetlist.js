import React, { Component } from 'react';
import Reflux from 'reflux';

import stackwidgetstore from '../stores/stackwidget';
import {StackWidget} from '../containers/stackwidget';

let MINWIDGETHEIGHT = 150;

export class StackWidgetList extends Component {
	 constructor(props) {
    super(props);
    this.state = { widgets:[], widgetheight:100};
  }

	componentDidMount () {
		this.unsubscribe = stackwidgetstore.listen(this.onData.bind(this));
	}

	componentWillUnmount () {
		this.unsubscribe();
	}

	onData (widgets) {
		var widgetheight=(this.props.maxHeight / widgets.length)-2 ;
		if (widgetheight<MINWIDGETHEIGHT) widgetheight=MINWIDGETHEIGHT;
		this.setState({widgets,widgetheight});
	}

	renderItem (item,idx) {
		return <StackWidget height={this.state.widgetheight} key={idx} wid={item.wid}>{item}</StackWidget>
	}

  render () {
  	return <div>
  		{this.state.widgets.map(this.renderItem.bind(this))}
  	</div>
  }
}