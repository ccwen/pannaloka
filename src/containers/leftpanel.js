var React=require("react");
var Component=React.Component;
var reactTab=require("react-tabs");
var Tab=reactTab.Tab , Tabs=reactTab.Tabs, TabList=reactTab.TabList, TabPanel=reactTab.TabPanel;
var FileList=require('../views/filelist');
var TreeList=require('../views/treelist');
var OutlinePanel=require("../views/outlinepanel");

var GoogleLogin=require("../google/googlelogin");

var styles={key:{fontSize:"110%",color:"darkblue",fontFamily:"monospace",textAlign:"center"},
section:{fontSize:"130%",textAlign:"center"},
desc:{textAlign:"center"}};
var Key = React.createClass({
  render :function() {
    return <span style={styles.key}><br/>{this.props.children+" "}</span>
  }
});
var Section = React.createClass({
  render :function() {
    return <div  style={styles.section}><br/>{this.props.children}</div>
  }
});
var Desc = React.createClass({
  render :function () {
    return <span  style={styles.desc}>{this.props.children}</span>
  }
});
var LeftPanel = React.createClass({
  getInitialState:function(){
    return {selectedIndex:0};
  }

	,componentWillReceiveProps:function (nextProps) {
		this.panelheight=nextProps.height-45;
		this.panelstyle={height:this.panelheight,overflowY:"auto"};		
	}

  ,switchToTree : function(){ 
    this.setState({selectedIndex:1});
  }

  ,localFileList : function(){ 
    if (this.props.localfilesystem) return <TabPanel>
        <div style={this.panelstyle}>
          <FileList/>
          <TreeList onOpenTree={this.switchToTree}/>
        </div>
      </TabPanel>
  }

  ,localTab : function(){ 
    if (this.props.localfilesystem)return  <Tab>Local File</Tab>
  }
  ,render :function() {
  	if (this.props.height<100) return <div>error height</div>

  	return <Tabs
        onSelect={this.handleSelected}
        selectedIndex={this.state.selectedIndex}
        forceRenderTabPanel={true}
      >
      <TabList>
          <Tab>Cloud</Tab>
          {this.localTab()}
          <Tab>Outline</Tab>
          <Tab>Help</Tab>
      </TabList>

      <TabPanel>
        <div style={this.panelstyle}>
          <GoogleLogin/>
        </div>
      </TabPanel>

      {this.localFileList()}

      <TabPanel>
	      <div style={this.panelstyle}>
        <h2><OutlinePanel localfilesystem={this.props.localfilesystem}/></h2>
	  		</div>

      </TabPanel>
      <TabPanel>
	      <div style={this.panelstyle}>
        <Section>Markup</Section>
          <Key>Ctrl-M</Key>
          <Desc>Create/Delete Markup</Desc>
          <Key>Ctrl-L</Key>
          <Desc>Create/Delete a transclusion</Desc>
          <Key>Ctrl-K</Key>
          <Desc>Convert Text to Markup</Desc>
          <Key>Shift-Ctrl-K</Key>
          <Desc>Convert Markup to Text</Desc>
        <Section>Editing</Section>
          <Key>Ctrl-I</Key>
          <Desc>Character information</Desc>
          <Key>Ctrl-Z</Key>
          <Desc>Undo</Desc>
          <Key>Ctrl-Y</Key>
          <Desc>Redo</Desc>
          <Key>Ctrl-S</Key>
          <Desc>Save Immediately</Desc>
          <Key>Ctrl-Q</Key>
          <Desc>Close the editing file</Desc>
        <Section>Search and Replace</Section>
            <Key>Ctrl-F</Key>
            <Desc>Start searching</Desc>
            <Key>Ctrl-G</Key>
            <Desc>Find next</Desc>
            <Key>Shift-Ctrl-G</Key>
            <Desc>Find previous</Desc>
            <Key>Shift-Ctrl-F</Key>
            <Desc>Replace</Desc>
            <Key>Shift-Ctrl-R</Key>
            <Desc>Replace all</Desc>
  			</div>
      </TabPanel>

  	</Tabs>
  }
});
module.exports = LeftPanel;