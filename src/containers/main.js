import React, { Component } from 'react';
import {MainMenu} from './mainmenu';
import {LeftPanel} from './leftpanel';
import {RightPanel} from './rightpanel';
import {StatusPanel} from './statuspanel';

var styles={
	Body:{fontSize:"150%"}
	,Main:{display:"flex"}
	,LeftPanel:{flex:2,height:"90%",overflowY:"auto"}
	,RightPanel:{flex:6,height:"90%",overflowY:"auto",background:"lightyellow"}
}
export class Main extends Component {
	constructor (props) {
		super(props);
		this.state={maxHeight:1000};
	}
	componentDidMount() {
		var maxHeight=this.refs.rightpanel.getDOMNode().clientHeight;
		this.setState({maxHeight});
	}

  render () {
  	return <div style={styles.Body}>
  		<MainMenu/>
  		<StatusPanel/>
  		<div style={styles.Main}>
  			<div style={styles.LeftPanel}>
  				<LeftPanel/>
  			</div>
  			<div ref="rightpanel" style={styles.RightPanel}>
  				<RightPanel maxHeight={this.state.maxHeight} />
  			</div>
  		</div>
  	</div>
  }
}