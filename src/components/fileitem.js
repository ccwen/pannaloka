import React, { Component } from 'react';

var selectedstyle={background:"highlight",cursor:"pointer",borderBottom:"1px solid blue"};
var style={cursor:"default"};

export class FileItem extends Component {
	renderOpen() {
		if (this.props.selected) {
			return <a href="#">open</a>
		}
	}
	render () {
		return <div style={this.props.selected?selectedstyle:style}>
			{this.props.title}
		</div>
	}
}