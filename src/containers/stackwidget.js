import React, { Component } from 'react';
import {StackWidgetMenu} from "../views/stackwidgetmenu"
var style={border:"1px solid gray"};

export class StackWidget extends Component {

	constructor (props) {
		super(props);
		Object.assign(style,props.style);
		style.height=props.height;
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.height!==this.props.height) style.height=nextProps.height;
	}

	render () {
		return <div style={style}>
			<StackWidgetMenu wid={this.props.wid}/>
			{this.props.children}
		</div>
	}
}