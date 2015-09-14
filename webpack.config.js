var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: '#inline-source-map',
  entry: [
    'webpack-hot-middleware/client',
    './src/index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  node:{
    fs:"empty"  //require("fs") return empty object
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel?stage=0&compact=false'], //for es7
      include: path.join(__dirname, 'src')
    }]
  }
};
