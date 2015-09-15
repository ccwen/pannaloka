import React, { Component } from 'react';
import {MainMenu} from './mainmenu';
import {LeftPanel} from './leftpanel';
import {RightPanel} from './rightpanel';
import {StatusPanel} from './statuspanel';

var styles={
	Body:{fontSize:"150%"}
	,Main:{display:"flex"}
	,LeftPanel:{flex:2,overflowY:"hidden"}
	,RightPanel:{flex:6,overflowY:"auto",background:"silver"}
}
export class Main extends Component {
	constructor (props) {
		super(props);
		this.state={height:0};
	}

	componentDidMount() {
		var offsetheight=React.findDOMNode(this).offsetHeight-20;
		var height=window.innerHeight-offsetheight;
		styles.LeftPanel.height=height;
		styles.RightPanel.height=height;
		this.setState({height});
	}
  render () {
  	return <div style={styles.Body}>
  		<MainMenu/>
  		<StatusPanel/>
  		<div ref="scrollstart" style={styles.Main}>
  			<div style={styles.LeftPanel}>
  				<LeftPanel height={this.state.height}/>
  			</div>
  			<div ref="rightpanel" style={styles.RightPanel}>
  				<RightPanel height={this.state.height} />
  			</div>
  	</div>
  	</div>
  }
}