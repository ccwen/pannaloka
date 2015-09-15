import React, { Component } from 'react';
import {Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import {FileList} from '../views/filelist';


export class LeftPanel extends Component {

	handleSelected () {

	}

	componentWillReceiveProps (nextProps) {
		this.panelheight=nextProps.height-45;
		this.panelstyle={height:this.panelheight,overflowY:"auto"};		
	}


  render () {
  	if (this.props.height<100) return <div>error height</div>

  	return <Tabs
        onSelect={this.handleSelected}
        selectedIndex={0}
      >
      <TabList>
					<Tab>File</Tab>
          <Tab>Outline</Tab>
          <Tab>Search</Tab>
      </TabList>

      <TabPanel>
	      <div style={this.panelstyle}>
          <FileList/>
	  		</div>

      </TabPanel>
      <TabPanel>
	      <div style={this.panelstyle}>
        <h2>OUTLINE PANEL</h2>
	  		</div>

      </TabPanel>
      <TabPanel>
	      <div style={this.panelstyle}>
  	      <h2>SEARCH PANEL</h2>
  			</div>
      </TabPanel>

  	</Tabs>
  }
}