import React, { Component } from 'react';
import PureComponent from 'react-pure-render/component';

import { SimpleWidget } from "../components/simplewidget";
var style={border:"1px solid gray"};

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
		if (!this.props.widgetclass) {
			return <SimpleWidget {...this.props}/>
		} else {
			return React.createElement(this.props.widgetClass,this.props);
		}
	}
	render () {
		return <div style={style}>
			{this.renderWidget()}
		</div>
	}
}