var prettyjson = require('prettyjson'),
    rdfstore = require('rdfstore'),
    fs = require('fs'),
    async = require('async');

var inputStr = fs.readFileSync('./data.ttl', 'utf8');
var queryStr = fs.readFileSync('./query3.rq', 'utf8');

async.autoInject({
  store: [rdfstore.create],
  load: function(store, cb) {
    store.load('text/turtle', inputStr, cb);
  },
  query: function(store, load, cb) {
    console.log(load);
    store.execute(queryStr, cb);
  }}, function(err, result) {
    if (err) { console.error(prettyjson.render(err)); }
    else { console.log(result.query);  }
  });
