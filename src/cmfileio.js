import socketfs from "./socketfs";
import {deserialize,serialize} from 'ksana-codemirror';

var readFile=function(fn,cb) {
  if (typeof fn==="function") {
    cb=fn;
    fn=null;
  }
  if (typeof cb!=="function") {
    cb=null;
  }
  fn=fn||"ktx/empty.ktx";
  socketfs.readFile(fn,"utf8",function(err,filecontent){
    if (err) {
      cb(err);
    } else {
      var obj=deserialize(filecontent);
      if (!obj) {
        cb("error loading file "+fn);
      } else {
        cb.call(this,0,obj)
      }
    }
  }.bind(this));
}


var writeFile=function (fn,cb) {
  if (typeof fn!=="string") fn=null;
  fn=fn||"ktx/dummy.ktx";
  var data=serialize(this.state.meta,this.refs.cm.getCodeMirror());
  socketfs.writeFile(fn, data,"utf8",function(err,newmeta){
    cb(err);
  }.bind(this));
}


export default  {writeFile:writeFile, readFile:readFile}