var fs          = require('fs');
var io          = require('io');
var express     = require('express');
var nunjucks    = require('nunjucks');

var app = module.exports = express();

io = io( app );

nunjucks.configure( 'views', {
  autoescape: true
, express:    app
});

io.on('connection', function( socket ){
  app.source.on( 'entry', socket.emit.bind( socket, 'entry' ) )
});

app.use( require('method-override')() );
app.use( require('body-parser').json() );
app.use( require('body-parser').urlencoded({ extended: true }) );

app.use( function( req, res, next ){
  res.locals.port = app.get('port');
  next();
});

app.use( express.static( __dirname + '/../public' ) );

app.get( '/', function( req, res ){
  res.render('index.html');
});

app.get( '/api/entries', function( req, res ){
  if ( !app.get('source') ){
    throw new Error('Must set property `app.source`');
  }

  var qObj;

  try {
    qObj = JSON.parse( decodeURIComponent( req.param('q') ) );
  } catch ( e ){
    qObj = {};
  }

  app.get('source').query( qObj, function( error, results ){
    if ( error ){
      return res.status(500).json({
        name: 'DATA_SOURCE_ERROR'
      , details: error
      });
    }

    res.json( results );
  });
});

app.get( '/loglog-dev-tools.js', function( req, res ){
  fs.createReadStream(
    __dirname + '/../node_modules/loglog-dev-tools/index.js'
  ).pipe( res );
});