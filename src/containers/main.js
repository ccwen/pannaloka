var React=require("react");
var ReactDOM=require("react-dom");
var Component=React.Component;
var MainMenu=require('./mainmenu');
var LeftPanel=require('./leftpanel');
var RightPanel=require('./rightpanel');
var StatusPanel=require('./statuspanel');
var Overlay=require("../views/overlay");
var socketfs=require("../socketfs");
var styles={
	Body:{fontSize:"150%"}
	,Main:{display:"flex"}
	,LeftPanel:{flex:2,overflowY:"hidden"}
	,RightPanel:{flex:6,overflowY:"auto",background:"silver"}
}

var Main=React.createClass({
	getInitialState:function(){
		return {height:0};
	}
	,componentDidMount :function() {
		this.setHeight();
		window.onresize = this.resize;
	}
	, setHeight :function(){
		var height=window.innerHeight-ReactDOM.findDOMNode(this.refs.mainmenu).style.height-30; //
		this.refs.leftpanel.style.height=height;
		this.refs.rightpanel.style.height=height;
		this.setState({height});
	}

	,resize:function() {
		clearTimeout(this.resizetimer);
		this.resizetimer=setTimeout(function(){
			this.setHeight();
		}.bind(this),200);
	}

  ,render:function () {
  	return   	<div>
  		<div style={styles.Body}>
  			<MainMenu ref="mainmenu"/>
  		<div ref="scrollstart" style={styles.Main}>
  			<div ref="leftpanel" style={styles.LeftPanel}>
  				<LeftPanel height={this.state.height} localfilesystem={socketfs.ready()}/>
  			</div>
  			<div ref="rightpanel" style={styles.RightPanel}>
  				<RightPanel height={this.state.height} />				
  			</div>
  		</div>
  	</div>
  	<Overlay/>
  </div>
  }
});
module.exports=Main;