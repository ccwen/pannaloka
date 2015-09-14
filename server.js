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

//var io = require('socket.io')(server);
require("./rpc_node")(server)

var port = 2557;
server.listen(port);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

/*
io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
*/