var React=require("react");
var Component=React.Component;
var E=React.createElement;
var PureRender=require('react-addons-pure-render-mixin');

var styles={svg:{width:"1920px",height:"1080px"},
overlay:{position:"absolute",left:0,top:0,pointerEvents:"none"}};
var overlaystore=require("../stores/overlay");
var Overlay = React.createClass({
  getInitialState:function() {
    return {paths:[]};
    //{stroke:"red",d:"M150 0 L75 200 L225 200Z"}
  }
  ,onPath :function(paths) {
    this.setState({paths});
  }
  ,componentDidMount:function() {
    this.unsubscribe = overlaystore.listen(this.onPath);
  }
  ,componentWillUnmount :function() {
    this.unsubscribe();
  }
  ,renderPaths :function(path,idx) {
    return E(path.cmd||"path",path);
  }
  ,render :function() {
    return ( 
        <div id='svgmarkups' style={styles.overlay}>
          <svg xmlns='http://www.w3.org/2000/svg' style={styles.svg}>
            {this.state.paths.map(this.renderPaths)}
           <defs>
              <marker id="head" orient="auto" markerWidth="2" markerHeight="4" refX="0.1"
                refY="2"><path id="headpoly" d="M0,0 V4 L5,5 Z" fill="black"/></marker>
           </defs>
        </svg>
      </div>
    ); 
  }
});
module.exports=Overlay;