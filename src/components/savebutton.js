import React, { Component } from 'react';
export class SaveButton extends Component {

	render () {
		if (this.props.dirty) {
			return (<span>
					<button onClick={this.props.onSave}>Save</button>
				</span>);
		} else {
			return <span></span>
		}
	}	
}
