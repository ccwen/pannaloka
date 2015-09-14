import React, { Component } from 'react';
//import { NICE, SUPER_NICE } from './colors';
import {CodeMirror,deserialize,serialize} from "ksana-codemirror";
import fs from './socketfs';


export class Main extends Component {
  constructor(props) {
    super(props);
    this.state = { filecontent:"xyz", value:"" , markups:null, history:null};
  }

  componentDidMount() {
    this.readfile(function(){
      //this.writefile();  //save markups
    });
    
  }

  readfile(fn,cb) {
    if (typeof fn==="function") {
      cb=fn;
      fn=null;
    }
    if (typeof cb!=="function") {
      cb=null;
    }
    fn=fn||"ktx/test.ktx";
    fs.readFile(fn,"utf8",function(err,filecontent){
      var obj=deserialize(filecontent);
      this.setState(obj,function(){
        if (cb) cb.call(this);
      }.bind(this));
    }.bind(this));
  }


  writefile(fn) {
    if (typeof fn!=="string") fn=null;
    fn=fn||"ktx/test2.ktx";
    var data=serialize(this.state.meta,this.refs.cm.getCodeMirror());
    fs.writeFile(fn, data,"utf8",function(err,newmeta){
      if (err) console.log(err);
      else     console.log("saved");
    }.bind(this));
  }

  marktext() {
    this.refs.cm.markText({className:"mymark"});
  }

  render() {
    return (
      <div>
        <button onClick={this.readfile.bind(this)}>Read</button>
        <button onClick={this.readfile.bind(this,"ktx/test2.ktx")}>Read 2</button>
        <button onClick={this.writefile.bind(this)}>Write 2</button>
        <button onClick={this.marktext.bind(this)}>Marktext</button>

        <CodeMirror ref="cm" value={this.state.value} history={this.state.history} markups={this.state.markups}/>

      </div>
    );
  }
}