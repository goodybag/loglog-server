module.exports = function( logger ){
  if ( Math.random() > 0.5 ){
    return logger.info( 'Testing', { ohai: 'yay' } );
  }

  logger = logger.create('Another Level', {
    data: { more: 'data' }
  });

  if ( Math.random() > 0.5 ){
   return logger.info( 'Testing', { ohai: 'yay' } );
  }

  logger = logger.create('Yet Another Level', {
    data: { yeaaaaa: 'data' }
  });

 return logger.info( 'Testing', { ohai: 'yay' } );
};