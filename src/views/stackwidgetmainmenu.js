import React, { Component } from 'react';

import stackwidgetaction from '../actions/stackwidget';

export class StackWidgetMainMenu extends Component {
	newWidget () {
		stackwidgetaction.newWidget({text:"widget", wid:'w'+Math.random().toString().substr(2,5)});
	}

  render () {
  	return <div>
  		<button onClick={this.newWidget.bind(this)}>New widget</button>
  	</div>
  }
}