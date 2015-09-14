import React, { Component } from 'react';
import {StackWidgetList} from '../views/stackwidgetlist';

export class RightPanel extends Component {
  render () {
  	if (this.props.height<100) return <div>invalid height</div>

  	return <div>
  		<StackWidgetList height={this.props.height}/>
  	</div>
  }
}