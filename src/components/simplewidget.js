import React, { Component } from 'react';

var style={border:"1px black"};

export class BaseWidget extends Component {
	constructor (props) {
		Object.assign(style,props.style);
	}

	render () {
		return <div style={style}>
			{this.props.children}
		</div>
	}
}