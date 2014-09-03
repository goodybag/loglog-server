var app = {
  isPaused:   false
, socket:     io.connect( config.url )
, transport:  loglogDevTools()
};

app.socket.on( 'entry', onEntry );
app.socket.on( 'result', onResult );

function pauseRealtime(){
  app.isPaused = true;
}

function resumeRealtime(){
  app.isPaused = false;
}

function query( qObj ){
  pauseRealtime();
  console.clear();

  app.lastQuery = qObj;
  reqwest({
    url: '/api/entries?q=' + encodeURIComponent( JSON.stringify( qObj ) )
  , method: 'get'
  , type: 'json'
  , contentType: 'application/json'
  , success: function( res ){
      res.forEach( onResult );
    }
  , error: function( error ){
      console.error( res );
    }
  });

  return getUrl( qObj );
}

function getUrl( qObj ){
  return config.url + '/entries?q=' + encodeURIComponent(
    JSON.stringify( qObj || app.lastQuery || {} )
  );
}

function onEntry( entry ){
  if ( app.isPaused ) return;
  app.transport( entry );
}

function onResult( entry ){
  app.transport( entry );
}