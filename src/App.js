import React, { Component } from 'react';
//import { NICE, SUPER_NICE } from './colors';
let NICE=require("./colors").NICE;
let SUPER_NICE=require("./colors").SUPER_NICE;

import fs from './socketfs';

class Counter extends Component {
  constructor(props) {
    super(props);
    this.state = { counter: 0 };
    this.interval = setInterval(() => this.tick(), 1000);
  }

  tick() {

    this.setState({
      counter: this.state.counter + this.props.increment
    });

  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <h1 style={{ color: this.props.color }}>
        Counter ({this.props.increment}): {this.state.counter}
      </h1>
    );
  }
}

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = { filecontent:"xyz"};
  }

  readfile() {
    fs.readFile("test.txt","utf8",function(err,filecontent){
      this.setState({filecontent})
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
        <div>{this.state.filecontent}</div>
        <Counter increment={5} color={NICE} />
        <Counter increment={5} color={SUPER_NICE} />
      </div>
    );
  }
}