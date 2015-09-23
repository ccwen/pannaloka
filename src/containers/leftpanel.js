var React=require("react");
var Component=React.Component;
var reactTab=require("react-tabs");
var Tab=reactTab.Tab , Tabs=reactTab.Tabs, TabList=reactTab.TabList, TabPanel=reactTab.TabPanel;
var FileList=require('../views/filelist');
var TreeList=require('../views/treelist');
var OutlinePanel=require("../views/outlinepanel");

module.exports = class LeftPanel extends Component {
  constructor (props) {
    super(props);
    this.state={selectedIndex:0};
  }

	componentWillReceiveProps (nextProps) {
		this.panelheight=nextProps.height-45;
		this.panelstyle={height:this.panelheight,overflowY:"auto"};		
	}

  switchToTree () {
    this.setState({selectedIndex:1});
  }

  render  () {
  	if (this.props.height<100) return <div>error height</div>

  	return <Tabs
        onSelect={this.handleSelected}
        selectedIndex={this.state.selectedIndex}
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
          <TreeList onOpenTree={this.switchToTree.bind(this)}/>
	  		</div>
      </TabPanel>

      <TabPanel>
	      <div style={this.panelstyle}>
        <h2><OutlinePanel/></h2>
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
