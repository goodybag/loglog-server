# Loglog Server

> Reads data from a loglog-source and spits out `entry` events over websockets

__Install:__

```
npm install loglog-server
```

__Usage:__

```
loglog-server --port 8081 --source loglog-server-mongodb
```

__Routes:__

```
GET / - Real-time log entries
GET /entries/:f
```

## REPL API

The primary way to use loglog-server is through the dev-tools REPL. Here are the functions available:

#### ```pauseRealTime()```

Pauses the real-time logging

#### ```resumeRealTime()```

Resumes real-time logging

#### ```query( queryObj )```

Serializes the query object to the loglog-server data source and displays the results in the console.

__MongoDB Example:__

```javascript
// Display all entries with request id = 123 sort by timestamp desc
query({ where: { 'data.req.id': 123 }, sort: { timestamp: -1 } })
```

#### ```getUrl( [queryObj] )```

Returns the URL for a given query object. If no query object is returned, uses the last queryObj passed to `query()`.

## How it works

## Loglog Server Data Sources

A loglog server uses data sources to get logging data from your applications. A source consists of two functions:

* Initialize ```function( options ){ ... }``` returns the ```query` function
* Query ```function( query, callback( error, results ) )```

Here's what an imaginary source looks like:

```javascript
var db = require('db');

module.exports = function( options ){
  return function( query, callback ){
    db.connect( options.connStr, function( error, client ){
      if ( error ) return callback( error );

      // Ensure we're querying from the configured table
      query.table = options.sourceTable;

      // Parse the query object somehow
      /* ... */

      client.query( parsedQueryStr, parsedQueryValues, function( error, result ){
        if ( error ) return callback( error );

        return callback( null, result.rows );
      });
    });
  };
};
```

It is completely up to the data source on how to parse the parameter to the query function. If the data source simply wants to be passed a string, then that is fine.

## Using as a module
