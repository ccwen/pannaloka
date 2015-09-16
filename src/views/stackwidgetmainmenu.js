import React, { Component } from 'react';

import stackwidgetaction from '../actions/stackwidget';

import selectionaction from '../actions/selection';

export class StackWidgetMainMenu extends Component {
	newWidget () {
		stackwidgetaction.newWidget({text:"widget"});
	}

  render () {
  	return <span>
  		<button onClick={this.newWidget.bind(this)}>New widget</button>
  	</span>
  }
}
