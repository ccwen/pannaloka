var React=require("react");
var realtimeaction=require("./realtimeaction");
var AppId=require("./clientid").AppId;
var stackwidgetaction=require("../actions/stackwidget");
var googledrive=require("../textview/googledrive");
var styles={openButton:{fontSize:"125%"},createButton:{fontSize:"125%"},openURL:{fontSize:"125%"}};
var GooglePanel=React.createClass({
	componentDidMount:function(){
		var m=decodeURI(location.search).match(/"ids":(\[.*?\])/);
		if (m) {
			try {
				var fileIds=JSON.parse(m[1]);	
				fileIds.map(function(fileid){googledrive.openFile(fileid)});				
			} catch(e) {
				console.log(m[1])
				console.error(e);
			}
		}
	}
	,openFile:function(docid,title,opts) {
		realtimeaction.openFile(docid, title, opts,this.onFileLoaded);
	}
	,openCallback:function(res){
		if (res.action==="picked"){
			for (var i in res.docs) this.openFile(res.docs[i].id, res.docs[i].name);
		}
		if (res.action!=="loaded") {
			this.refs.openbutton.disabled=false;
			this.refs.createbutton.disabled=false;
			this.refs.openurlbutton.disabled=false;
		}
	}
	,pickFile:function() {
		this.refs.openbutton.disabled=true;
		this.refs.createbutton.disabled=true;
		this.refs.openurlbutton.disabled=true;
		google.load('picker', '1', {
        callback: function() {
          var picker, token, view;
          token = gapi.auth.getToken().access_token;
          view = new google.picker.View(google.picker.ViewId.DOCS);
          view.setMimeTypes("application/vnd.google-apps.drive-sdk." + AppId);
          //view.setMimeTypes("text/plain");
          picker = new google.picker.PickerBuilder()
          .enableFeature(google.picker.Feature.NAV_HIDDEN)
          .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
          .setAppId(AppId).setOAuthToken(token).addView(view)
          //.addView(new google.picker.DocsUploadView())
          .setCallback(this.openCallback).build();
          return picker.setVisible(true);
        }.bind(this)
    });
	}
	,onFileLoaded:function(doc){
		this.refs.openbutton.disabled=false;
		this.refs.createbutton.disabled=false;    
	}
	,onFileInitialize:function(model) {
  	var string = model.createString();
    string.setText('file on Google drive');

    var markups= model.createMap();
    model.getRoot().set('text', string);
    model.getRoot().set('markups',markups);
	}
	,openURL:function(){
		var url=prompt("url").replace("https://drive.google.com/open?id=","");
		googledrive.openFile(url);
	}
	,createFile:function() {
		this.refs.openbutton.disabled=true;
		this.refs.createbutton.disabled=true;
		this.refs.openurlbutton.disabled=true;
		var title='New File(click to change)';
		this.title=title;

		realtimeaction.createFile(title, function(createResponse) {
         //window.history.pushState(null, null, '?id=' + createResponse.id);
         realtimeaction.openFile(createResponse.id, title, {},this.onFileLoaded, this.onFileInitialize);
    }.bind(this));
	}
	,render:function() {
		return <span>
		<button style={styles.openButton} ref="openbutton" onClick={this.pickFile}>Open</button>
		<button style={styles.createButton} ref="createbutton" onClick={this.createFile}>Create</button>
		<button style={styles.openURL} ref="openurlbutton" onClick={this.openURL}>Open File Id</button>
		</span>
	}
});
module.exports=GooglePanel;