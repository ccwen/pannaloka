var React=require("react");
var Component=React.Component;
var MainMenu=require('./mainmenu');
var LeftPanel=require('./leftpanel');
var RightPanel=require('./rightpanel');
var StatusPanel=require('./statuspanel');
var Overlay=require("../views/overlay");
var styles={
	Body:{fontSize:"150%"}
	,Main:{display:"flex"}
	,LeftPanel:{flex:2,overflowY:"hidden"}
	,RightPanel:{flex:6,overflowY:"auto",background:"silver"}
}

module.exports = class Main extends Component {
	constructor(props) {
		super(props);
		this.state= {height:0};
	}

	componentDidMount () {
		var offsetheight=React.findDOMNode(this).offsetHeight-20;
		var height=window.innerHeight-offsetheight;
		styles.LeftPanel.height=height;
		styles.RightPanel.height=height;
		this.setState({height});
		/*
		window.onbeforeunload = function (e) {
			return true;
    e = e || window.event;
    return 'Do you want to quit program?';
		};
		*/
	}
  render () {
  	return   	<div>
  		<div style={styles.Body}>
  			<MainMenu/>
	  		
  		<div ref="scrollstart" style={styles.Main}>
  			<div style={styles.LeftPanel}>
  				<LeftPanel height={this.state.height}/>
  			</div>
  			<div ref="rightpanel" style={styles.RightPanel}>
  				<RightPanel height={this.state.height} />				
  			</div>
  		</div>
  	</div>
  	<Overlay/>
  </div>
  }
};
//<StatusPanel/>