import React, { Component } from 'react';
//import { NICE, SUPER_NICE } from './colors';
import {CodeMirror,deserialize } from "ksana-codemirror";
import fs from './socketfs';

var preparetext=function() {
  var text="";
  for (var i=0;i<1000;i++) {
    text+="0123456789\n";
  }    
  return text;
}

export class Main extends Component {
  constructor(props) {
    super(props);
    this.state = { filecontent:"xyz", text:preparetext()};
  }

  componentDidMount() {
    this.readfile();
  }

  readfile() {
    fs.readFile("ktx/test.ktx","utf8",function(err,filecontent){
      var data=deserialize(filecontent);
      console.log(data);
    }.bind(this));
  }


  writefile() {
    fs.writeFile("test.txt","hello.world"+Math.random(),function(err){
      console.log(err);
    }.bind(this));
  }

  readdir() {
    fs.readdir(".",function(err,data){
      console.log(data)
    }.bind(this));
  }  

  render() {
    return (
      <div>
        <button onClick={this.readfile.bind(this)}>Read</button>
        <button onClick={this.writefile.bind(this)}>Write</button>
        <button onClick={this.readdir.bind(this)}>Readdir</button>

        <CodeMirror ref="cm" value={this.state.text}/>

      </div>
    );
  }
}