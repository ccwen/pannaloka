var React=require("react");
var Component=React.Component;
var StackWidgetMainMenu=require("../views/stackwidgetmainmenu");
var MarkupPanel=require("../views/markuppanel");
var InputMethod=require("../views/inputmethod");
var docfilestore=require("../stores/docfile");
var styles={
	container:{display:"flex"}
	,left:{flex:2}
	,right:{flex:6}
	,banner:{borderRadius:"0.25em"}
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
  	return <div style={styles.container}>
  	<div style={styles.left}>
  	<span style={styles.banner} title="2015.10.17">智慧
  	<span style={{cursor:"pointer"}} onClick={this.changeTheme}>光</span></span>
  	</div>
  	<div style={styles.right}>
  	<MarkupPanel/>
  	</div>

  	</div>
  }
}