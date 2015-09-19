var React=require("react");
var Component=React.Component;
var reactTab=require("react-tabs");
var Tab=reactTab.Tab , Tabs=reactTab.Tabs, TabList=reactTab.TabList, TabPanel=reactTab.TabPanel;
var FileList=require('../views/filelist');

module.exports = class LeftPanel extends Component {
	componentWillReceiveProps (nextProps) {
		this.panelheight=nextProps.height-45;
		this.panelstyle={height:this.panelheight,overflowY:"auto"};		
	}

  render  () {
  	if (this.props.height<100) return <div>error height</div>

  	return <Tabs
        onSelect={this.handleSelected}
        selectedIndex={0}
        forceRenderTabPanel={true}
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
};
