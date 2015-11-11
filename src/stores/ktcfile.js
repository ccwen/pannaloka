var Reflux=require("reflux");
var socketfs=require("../socketfs");
var googledrive=require("../textview/googledrive");
var KTXFileStore=Reflux.createStore({
	listenables:[require("../actions/ktcfile")]
	,files:[]
	,openTree:function(fn,cb){
		this.openingfilename=fn;
	  socketfs.readFile(fn,"utf8",function(err,filecontent){
	    if (err) {
	      cb(err);
	    } else {
	    	cb(0,JSON.parse("["+filecontent.split(/\r?\n/).join(",")+"]"));
	    }
	  }.bind(this));
	}
	,loaddir:function(openfn,noopen){
		socketfs.readdirmeta("ktc",function(err,data){
			if (!err) {
				this.files=data.filter(function(f){
						var ext=f.filename.substr(f.filename.length-4);
						return  (ext===".ktc");
				});

				if (!this.files.length) return;
				var idx=0;
				if (openfn) {
					idx=this.files.indexOf(openfn);
					if (idx==-1) idx=0;
				}
				if (!noopen) {
					setTimeout(function(){
						this.onOpenTree(this.files[idx].filename);	
					}.bind(this),100);					
				}
			}
		}.bind(this));
	}
	,init:function() {
		if (socketfs.ready()) this.loaddir();
	}
	,onReload:function() {
		if (socketfs.ready()) this.loaddir();
	}
	,newfilename:function() {
		return "ktc/"+Math.random().toString().substr(2,8)+".ktc";
	}
	,onWriteTree:function(toc,cb){
		if (typeof this.fn!=="string") {
			googledrive.setToc(toc,this.fn);
			return;
		}
		var tocstring="";
		toc.map(function(item,idx){
			if (idx) tocstring+="\n"
			tocstring+=JSON.stringify({t:item.t,d:item.d,links:item.links});
		});
				
	  socketfs.writeFile(this.fn,tocstring,"utf8",function(err){
	  	this.loaddir(this.fn,true);
	    cb&&cb(err);
	  }.bind(this));
	}
	,onOpenTree:function(fn_array,googledoc){
		if (socketfs.ready()&& typeof fn_array==="string"){
			this.openTree(fn_array,function(err2,toc){
				this.toc=toc;
				this.fn=fn_array;
				this.trigger(toc,this.files);
			}.bind(this));
		}else {
			this.fn=googledoc;
			this.trigger(fn_array,this.files);
		}
	}
	,onNewTree:function() {
		var filename=this.newfilename();
		this.fn=filename;
		this.onWriteTree([{t:'emptytree',d:0},{t:'child',d:1}]);
	}
})
module.exports=KTXFileStore;