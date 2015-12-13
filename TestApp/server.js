// setup Express
var app = require('./models/express.js');

// start the server
var server = app.listen(8080, function() {
console.log("Started on port 8080");
var host = server.address().address;
var port = server.address().port;
});