var fs          = require('fs');
var io          = require('socket.io');
var express     = require('express');
var nunjucks    = require('nunjucks');
var dataSource  = require('./data-source');

var app = module.exports = express();
app.server = require('http').Server( app );

app.listen = function(){
  return app.server.listen.apply( app.server, arguments );
};

io = io( app.server );

var nenv = nunjucks.configure(  __dirname + '/../views', {
  autoescape: true
, express:    app
});

var _set = app.set;

app.set = function( k, v ){
  if ( k !== 'source' || v === null || v === undefined ){
    return _set.apply( app, arguments );
  }

  return app.setSource( v );
};

app.setSource = function( source ){
  if ( app.get('source') ){
    app.get('source').removeAllListeners('entry');
  }

  source = dataSource.prepare( source );

  source.check( function sourceCheckCallback( error, results ){
    if ( error ){
      return console.error( error );
    }

    results.forEach( function( entry ){
      io.sockets.emit( 'entry', entry );
    });

    setTimeout( source.check.bind( source, sourceCheckCallback ), 1000 );
  });

  return _set.call( app, 'source', source );
};

app.use( require('method-override')() );
app.use( require('body-parser').json() );
app.use( require('body-parser').urlencoded({ extended: true }) );

app.use( function( req, res, next ){
  res.locals.url  = app.get('url');
  next();
});

app.use( express.static( __dirname + '/../public' ) );
app.use( express.static( __dirname + '/../node_modules' ) );

app.get( '/', function( req, res ){
  res.render('index.html');
});

app.get( '/entries', function( req, res ){
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

    res.render( 'index.html', { results: results } );
  });
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

nenv.addFilter( 'json', function( obj ){
  return JSON.stringify( obj );
});