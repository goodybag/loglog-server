var express   = require('express');
var nunjucks  = require('nunjucks');

var app = module.exports = express();

nunjucks.configure( 'views', {
  autoescape: true
, express:    app
});

app.use( function( req, res, next ){
  res.locals.port = app.get('port');
});

app.use( express.static( __dirname + '/public' ) );

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
  res.sendFile( __dirname + '/node_modules/loglog-dev-tools/index.js' );
});