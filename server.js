var app = require('express')();
var server = require('http').Server(app);
var webpack = require('webpack');
var config = require('./webpack.config');
var compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
}));

app.use(require('webpack-hot-middleware')(compiler));

require("./rpc_node")(server)

var port = 2557;
server.listen(port);

app.get('*', function(req, res) {
  res.sendFile(require("path").join(__dirname, req.path.substr(1)||"index.html"));
});
