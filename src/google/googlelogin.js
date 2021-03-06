var React=require("react");
var clientId=require("./clientid").clientId;
var AppId=require("./clientid").AppId;
var action=require("./realtimeaction");
var store=require("./realtimestore");
var LoggedIn=require("./loggedin");
var styles={loginButton:{fontSize:"125%"}};
var GoogleLogin=React.createClass({
	getInitialState:function(){
		return {authorized:false};
	}
	,componentDidMount:function(){
		window.gapi.load('auth:client,drive-realtime,drive-share', function(){
			this.realtimeUtils = new utils.RealtimeUtils({ clientId: clientId });
			action.setRealtimeUtils(this.realtimeUtils);
	    this.authorize();
		}.bind(this));
	}
	,authorize:function(){
 		this.realtimeUtils.authorize(function(response){
 			if (response.error) {
 				//must attach eventListener , React Onclick doesn't work
          var button = document.getElementById('auth_button');
          button.addEventListener('click', function () {
            this.realtimeUtils.authorize(function(response){
              action.loggedIn(response);
            }, true);
          }.bind(this));
 			}

      if(!response.error){
        action.loggedIn(response);
        this.setState({authorized:true});
      }
    }.bind(this), false);
	}
	,render:function(){
			if (!this.state.authorized) {
				return <button style={styles.loginButton} id="auth_button">Login</button>
			} else {
				return <LoggedIn/>
			}
	}
})
module.exports=GoogleLogin;