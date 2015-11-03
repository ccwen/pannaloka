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
var MainMenu = React.createClass({
	getInitialState:function(){
		return {ime:0};
	}
	,changeTheme :function() {
		var docs=docfilestore.getDocs();
		document.body.classList.toggle("darktheme");
		var dark=document.body.classList.contains("darktheme");

		docs.map(function(d){
			d.getEditor().setOption("theme", dark?"ambiance":"");
		});

		localStorage.setItem("lighttheme",!dark);
	}
	,setIME :function(ime) {
		localStorage.setItem("ime",ime);
		this.setState({ime:ime});
	}
	,componentDidMount :function () {
		if (localStorage.getItem("lighttheme")=="true"){
			this.changeTheme();
		}
		var ime=parseInt(localStorage.getItem("ime")||"1");
		if (ime)this.setIME(ime);			
	}
	,toggleIME :function () {
		this.setIME(-this.state.ime);
	}

  ,render :function () {
  	return <div style={styles.container}>
  	<div style={styles.left}>

  	<span style={styles.banner} title="2015.10.31">智
  	<span style={{cursor:"pointer"}} onClick={this.toggleIME}>慧</span>
  	<span style={{cursor:"pointer"}} onClick={this.changeTheme}>光</span></span>
  	</div>
  	<div style={styles.right}>
  	<MarkupPanel/>
  	<InputMethod ime={this.state.ime} onSetIME={this.setIME}/>
  	
  	</div>

  	</div>
  }
});
module.exports=MainMenu;