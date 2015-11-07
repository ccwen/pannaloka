var React=require("react");
var realtimeaction=require("./realtimeaction");
var AppId=require("./clientid").AppId;
var stackwidgetaction=require("../actions/stackwidget");

var styles={openButton:{fontSize:"125%"},createButton:{fontSize:"125%"}};
var GooglePanel=React.createClass({
	openFile:function(docid,title,opts) {
		this.docId=docid;
		realtimeaction.openFile(docid, title, opts,this.onFileLoaded);
	}
	,openCallback:function(res){
		if (res.action==="picked"){
			this.title=res.docs[0].name;
			this.openFile(res.docs[0].id, this.title);
		}
		if (res.action!=="loaded") {
			this.refs.openbutton.disabled=false;
			this.refs.createbutton.disabled=false;					
		}
	}
	,pickFile:function() {
		this.refs.openbutton.disabled=true;
		this.refs.createbutton.disabled=true;
		google.load('picker', '1', {
        callback: function() {
          var picker, token, view;
          token = gapi.auth.getToken().access_token;
          view = new google.picker.View(google.picker.ViewId.DOCS);
          view.setMimeTypes("application/vnd.google-apps.drive-sdk." + AppId);
          //view.setMimeTypes("text/plain");
          picker = new google.picker.PickerBuilder().enableFeature(google.picker.Feature.NAV_HIDDEN)
          .setAppId(AppId).setOAuthToken(token).addView(view)
          .addView(new google.picker.DocsUploadView())
          .setCallback(this.openCallback.bind(this)).build();
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
	,createFile:function() {
		this.refs.openbutton.disabled=true;
		this.refs.createbutton.disabled=true;
		var title='New File(click to change)';
		this.title=title;

		realtimeaction.createFile(title, function(createResponse) {
         //window.history.pushState(null, null, '?id=' + createResponse.id);
         this.docId=createResponse.id;
         realtimeaction.openFile(createResponse.id, title, {},this.onFileLoaded, this.onFileInitialize);
    }.bind(this));
	}
	,render:function() {
		return <span>
		<button style={styles.openButton} ref="openbutton" onClick={this.pickFile}>Open</button>
		<button style={styles.createButton} ref="createbutton" onClick={this.createFile}>Create</button>
		</span>
	}
});
module.exports=GooglePanel;