var React=require("react");
var Component=React.Component;
var E=React.createElement;
var PureComponent=require('react-pure-render').PureComponent;
var styles={svg:{width:"1920px",height:"1080px"},
overlay:{position:"absolute",left:0,top:0,pointerEvents:"none"}};
var overlaystore=require("../stores/overlay");
module.exports = class Overlay extends PureComponent {
  constructor (props) {
    super(props);
    this.state={paths:[]};
    //{stroke:"red",d:"M150 0 L75 200 L225 200Z"}
  }
  onPath = (paths) => {
    this.setState({paths});
  }
  componentDidMount() {
    this.unsubscribe = overlaystore.listen(this.onPath);
  }
  componentWillUnmount () {
    this.unsubscribe();
  }
  renderPaths (path,idx) {
    return E(path.cmd||"path",path);
  }
  render () {
    return ( 
        <div id='svgmarkups' style={styles.overlay}>
          <svg xmlns='http://www.w3.org/2000/svg' style={styles.svg}>
            {this.state.paths.map(this.renderPaths.bind(this))}
           <defs>
              <marker id="head" orient="auto" markerWidth="2" markerHeight="4" refX="0.1"
                refY="2"><path id="headpoly" d="M0,0 V4 L5,5 Z" fill="black"/></marker>
           </defs>
        </svg>
      </div>
    ); 
  }
};