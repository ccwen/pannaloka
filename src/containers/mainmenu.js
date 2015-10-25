var React=require("react");
var Component=React.Component;
var StackWidgetMainMenu=require("../views/stackwidgetmainmenu");
var MarkupPanel=require("../views/markuppanel");
var docfilestore=require("../stores/docfile");
var styles={
	banner:{borderRadius:"0.25em"}
	//background:"-webkit-radial-gradient(center, ellipse cover, #f1da36 0%,gray 70%)"}
}
module.exports =class MainMenu extends Component {
	changeTheme = () => {
		var docs=docfilestore.getDocs();
		document.body.classList.toggle("darktheme");
		var dark=document.body.classList.contains("darktheme");

		docs.map(function(d){
			d.getEditor().setOption("theme", dark?"ambiance":"");
		});

		localStorage.setItem("lighttheme",!dark);
	}
	componentDidMount () {
		if (localStorage.getItem("lighttheme")=="true"){
			this.changeTheme();
		}
	}
  render () {
  	return <div><span style={styles.banner} title="2015.10.17">智慧
  	<span style={{cursor:"pointer"}} onClick={this.changeTheme}>光</span></span><MarkupPanel/></div>
  }
}