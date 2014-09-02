var app = {
  isPaused: false
, socket:   io.connect( config.url )
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
  clear();

  app.lastQuery = qObj;
  app.socket.emit( 'query', qObj );

  return getUrl( qObj );
}

function getUrl( qObj ){
  return config.url + '/entries?q=' + encodeURIComponent(
    JSON.stringify( qObj || app.lastQuery || {} )
  );
}

function onEntry( entry ){
  if ( app.isPaused ) return;

  loglogDevTools( entry );
}

function onResult( entry ){
  loglogDevTools( entry );
}