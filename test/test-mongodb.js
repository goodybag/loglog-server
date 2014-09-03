var fs      = require('fs');
var loglog  = require('loglog');
var app     = require('../lib/server');
var config  = require('../local-config.json');

var logger  = loglog.create({
  transports: [
    loglog.transports.console()
  , require('loglog-mongodb')( config.mongodb )
  ]
});

app.set( 'source', require('loglog-server-mongodb')( config.mongodb ) );
app.set( 'port', 8001 );

app.listen( app.get('port'), function( ){
  console.log( 'Open http://localhost:' + app.get('port') );
  setInterval(
    require('../lib/random-log-entry').bind( null, logger )
  , 1000
  );
});