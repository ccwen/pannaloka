var Reflux=require("reflux");
var socketfs=require("../socketfs");
var KTXFileStore=Reflux.createStore({
	listenables:[require("../actions/ktcfile")]
	,files:[]
	,openTree:function(fn,cb){
		this.openingfilename=fn;
	  socketfs.readFile(fn,"utf8",function(err,filecontent){
	    if (err) {
	      cb(err);
	    } else {
	    	cb(0,JSON.parse(filecontent));
	    }
	  }.bind(this));
	}
	,loaddir:function(openfn){
		socketfs.readdirmeta("ktc",function(err,data){
			if (!err) {
				this.files=data;
				if (!data.length) return;
				var idx=0;
				if (openfn) {
					idx=data.indexOf(openfn);
					if (idx==-1) idx=0;
				}
				setTimeout(function(){
					this.onOpenTree(data[idx].filename);	
				}.bind(this),100);
				
			}
		}.bind(this));
	}
	,init:function() {
		this.loaddir();
	}
	,onReload:function() {
		this.loaddir();
	}
	,newfilename:function() {
		return "ktc/"+Math.random().toString().substr(2,8)+".ktc";
	}

	,onWriteTree:function(toc,cb){
		var tocstring="[";
		toc.map(function(item,idx){
			if (idx) tocstring+=",\n"
			tocstring+=JSON.stringify({t:item.t,d:item.d,links:item.links});
		});
		
		tocstring+="]";
		
	  socketfs.writeFile(this.fn,tocstring,"utf8",function(err){
	  	this.loaddir(this.fn);
	    cb&&cb(err);
	  }.bind(this));
	}
	,onOpenTree:function(fn){
		this.openTree(fn,function(err2,toc){
			this.toc=toc;
			this.fn=fn;
			this.trigger(this.files,toc);
		}.bind(this));
	}
	,onNewTree:function() {
		var filename=this.newfilename();
		this.fn=filename;
		this.onWriteTree([{t:'emptytree',d:0},{t:'child',d:1}]);
	}
})
module.exports=KTXFileStore;