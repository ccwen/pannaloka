import React, { Component } from 'react';

var selectedstyle={background:"highlight",cursor:"pointer",borderBottom:"1px solid blue"};
var style={cursor:"default"};

export class FileItem extends Component {
	renderTitle() {
		if (this.props.selected) {
			return <a href="#" onClick={this.props.onClick}>{this.props.title}</a>
		} else {
			return this.props.title;
		}
	}
	render () {
		return <div style={this.props.selected?selectedstyle:style}>
			{this.renderTitle()}
		</div>
	}
}