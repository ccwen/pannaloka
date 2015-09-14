import React, { Component } from 'react';

import stackwidgetaction from '../actions/stackwidget';

export class StackWidgetMenu extends Component {
	closeme () {
		console.log("closing")
		stackwidgetaction.closeWidget(this.props.wid);
	}
  render () {
  	return <div>
  		<button onClick={this.closeme.bind(this)}>Close</button>
  		</div>
  }
}