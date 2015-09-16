import React, { Component } from 'react';
import PureComponent from 'react-pure-render/component';

import WidgetClasses from '../views/widgetclasses';

var style={borderBottom:"1px solid silver"};

export class StackWidget extends PureComponent {

	constructor (props) {
		super(props);
		Object.assign(style,props.style);
		style.height=props.height;
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.height!==this.props.height) style.height=nextProps.height;
	}

	renderWidget() {
		var widgetclass=this.props.widgetClass||"SimpleWidget";
		var widget=WidgetClasses[widgetclass];
		if (!widget){
			throw "cannot load widget "+widgetclass;
		}
		return React.createElement(widget,this.props);
	}

	render () {
		return <div style={style}>
			{this.renderWidget()}
		</div>
	}
}