import React, { Component } from 'react';
var styles={
	saved:{background:"green",color:"yellow"}
}
export class SaveButton extends Component {

	constructor (props)	 {
		super(props);
		this.state={saved:false};
	}
	componentWillReceiveProps (nextProps) {
		if (!nextProps.dirty && this.props.dirty && nextProps.generation !==this.state.generation) {
			this.setState({saved:true});
			setTimeout(function(){
				this.setState({saved:false,generation:nextProps.generation});
			}.bind(this),1000);
		}
	}

	render () {
		if (this.state.saved) {
			return <span style={styles.saved}>Saved!!</span>
		}
		if (this.props.dirty) {
			return (<span>
					<button onClick={this.props.onSave}>Save</button>
				</span>);
		} else {
			return <span></span>
		}
	}	
}
