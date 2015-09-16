import React, { Component } from 'react';

import stackwidgetaction from '../actions/stackwidget';

import selectionaction from '../actions/selection';

export class StackWidgetMainMenu extends Component {
	newWidget () {
		stackwidgetaction.newWidget({text:"widget"});
	}

	newMarkup () {
		//selectionaction.newWidget({text:"widget"});	
	}

  render () {
  	return <div>
  		<button onClick={this.newWidget.bind(this)}>New widget</button>
  		<button onClick={this.newMarkup.bind(this)}>New Link</button>
  	</div>
  }
}
