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
      var obj=deserialize(filecontent,fn);
      if (!obj) {
        cb("error loading file "+fn);
      } else {
        cb.call(this,0,obj)
      }
    }
  }.bind(this));
}


var writeFile=function (meta,cm,fn,cb) {
  var data=serialize(meta,cm);
  socketfs.writeFile(fn, data,"utf8",function(err){
    if (err) {
      cb(err);
    } else {
      cb(0,meta);
    }
  }.bind(this));
}


export default  {writeFile:writeFile, readFile:readFile}