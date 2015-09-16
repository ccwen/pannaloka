import React, { Component } from 'react';

export class StackWidgetMenu extends Component {
  render () {
  	return <div>
  		<button onClick={this.props.onClose}>Close</button>
  		</div>
  }
}