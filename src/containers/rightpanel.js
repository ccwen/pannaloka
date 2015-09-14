import React, { Component } from 'react';
import {StackWidgetList} from '../views/stackwidgetlist';

export class RightPanel extends Component {
  render () {
  	return <div>
  		<StackWidgetList maxHeight={this.props.maxHeight}/>
  	</div>
  }
}