import React, {Component} from 'react';
import PureComponent from 'react-pure-render/component';

import { StackWidgetMenu } from "../views/stackwidgetmenu";
export class SimpleWidget extends PureComponent {
	render () {
		return <div>
			<StackWidgetMenu wid={this.props.wid}/>		
			hello {this.props.text} {this.props.wid}
		</div>
	}
}