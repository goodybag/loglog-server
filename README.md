# Loglog Server

> Reads data from a loglog-source and displays in dev tools

__Install:__

```
npm install loglog-server
```

__Usage:__

You need to setup your own loglog server to execute with node. The `loglog-server` module simply exposes an express app.

```javascript
var server = require('loglog-server');

// It's necessary to have your datasource set before any requests
// are fulfilled
server.set( 'source', server.sources.mongodb({
  // This configuration should be the same configuration for your
  // loglog-mongodb logging transport
  connection: 'mongodb://host:port/db'
, collection: 'collection_that_stores_logs'
}));

// Need to set url to inform socket.io what to connect to
server.set( 'url', 'https://myhost.com' );

// Listen on port 80
server.listen();
```

__Routes:__

```
GET /           - Real-time log entries
GET /entries?q= - Search entries
```

## REPL API

The primary way to use loglog-server is through the dev-tools REPL. Here are the functions available:

#### ```pauseRealtime()```

Pauses the real-time logging

#### ```resumeRealtime()```

Resumes real-time logging

#### ```query( queryObj )```

Serializes the query object to the loglog-server data source and displays the results in the console.

_Returns the URL of the resource_

__MongoDB Example:__

```javascript
// Display all entries with request id = 123 sort by timestamp desc
query({ where: { 'data.req.id': 123 }, sort: { timestamp: -1 } })
```

#### ```getUrl( [queryObj] )```

Returns the URL for a given query object. If no query object is returned, uses the last queryObj passed to `query()`.

## Loglog Server Data Sources

A loglog server uses data sources to get logging data from your applications. A source is a factory with the following signature: `function ( Object options ) -> Object`

The the return object must implement the following methods:

```javascript
{
  check: function( callback ){ ... } // callback( error, results )
, query: function( query, callback ){ ... } // callback( error, results )
}
```

The `check` function is called periodically and should return the only latest log events from the source. So if a previous call to `check` returned events `[1,2,3]`, then the next call should return those results.

The `query` function is called when the user is requesting a specific subset of the log history (and likely from within the `check` function). It's up to the data source as to what format the first parameter takes.

Here's what the mongodb source looks like:

```javascript
var MongoClient = require('mongodb').MongoClient;

module.exports = function( options ){
  return {
    check: function( callback ){
      var query = {
        where:  this.lastResults.length
                  ? { _id: { $gt: this.lastResults[0]._id } }
                  : {}
      , options: {
          sort: [ [ '_id', -1 ] ]
        , limit: 20
        }
      };

      this.query( query, function( error, results ){
        if ( error ) return callback( error );
        this.lastResults = results;
        return callback( null, results );
      }.bind( this ) );
    }

  , lastResults: []

  , query: function( query, callback ){
      query.where   = query.where || {};
      query.options = query.options || {};

      MongoClient.connect( options.connection, function( error, db ){
        if ( error ) return callback( error );

        var cursor = db.collection(
          options.collection
        ).find( query.where );

        // Options
        [
          'sort', 'skip', 'limit'
        ].forEach( function( option ){
          if ( option in query.options ){
            cursor[ option ]( query.options[ option ] );
          }
        });

        cursor.toArray( function( error, results ){
          db.close();
          callback( error, results );
        });
      });
    }
  };
};
```
