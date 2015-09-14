import React, { Component } from 'react';
import {MainMenu} from './mainmenu';
import {LeftPanel} from './leftpanel';
import {RightPanel} from './rightpanel';
import {StatusPanel} from './statuspanel';

var styles={
	Body:{fontSize:"150%"}
	,Main:{display:"flex"}
	,LeftPanel:{flex:3,height:"90%",overflowY:"auto"}
	,RightPanel:{flex:5,height:"90%",overflowY:"auto",background:"lightyellow"}
}
export class Main extends Component {
  render () {
  	return <div style={styles.Body}>
  		<MainMenu/>
  		<StatusPanel/>
  		<div style={styles.Main}>
  			<div style={styles.LeftPanel}>
  				<LeftPanel/>
  			</div>
  			<div style={styles.RightPanel}>
  				<RightPanel/>
  			</div>
  		</div>
  	</div>
  }
}