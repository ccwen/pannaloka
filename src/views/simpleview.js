import React, {Component} from 'react';
import PureComponent from 'react-pure-render/component';
import stackwidgetaction from '../actions/stackwidget';
import { StackWidgetMenu } from "../components/stackwidgetmenu";
export class SimpleView extends PureComponent {
	onClose () {
		stackwidgetaction.closeWidget(this.props.wid)
	}
	render () {
		return <div>
			<StackWidgetMenu onClose={this.onClose.bind(this)}/>	
			hello {this.props.text} {this.props.wid}
		</div>
	}
}