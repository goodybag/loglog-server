var server  = require('./');
var auth    = require('http-auth');

// It's necessary to have your datasource set before any requests
// are fulfilled
server.set( 'source', server.sources.mongodb({
  // This configuration should be the same configuration for your
  // loglog-mongodb logging transport
  connection: 'mongodb://localhost:1337/logs'
, collection: 'logs'
}));

// Need to set url to inform socket.io what to connect to
server.set( 'url', 'http://localhost:8082' );

// Custom authentication?
server.set( 'auth', auth.connect( auth.basic({
  realm: "Simon Area.",
  file: __dirname + "/../.htpasswd"
})));

// Listen on port 80
server.listen(8082);