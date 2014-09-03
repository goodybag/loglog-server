var events  = require('events');
var _       = require('lodash');

module.exports.prepare = function( source ){
  source = _.extend( {}, source, events.EventEmitter.prototype );
  source = Object.create( source );
  events.EventEmitter.call( source );
  return source;
};