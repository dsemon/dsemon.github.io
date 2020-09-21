// Requires NodeJS

var request = require("request"); // request module import
var EventEmitter = require("events").EventEmitter; // live update as data comes in from API @ https://data.cityofnewyork.us/resource/fjn5-bxwg.json?incident_zip=10458
var body = new EventEmitter(); // create new emitter for body


request("https://data.cityofnewyork.us/resource/fjn5-bxwg.json?incident_zip=10458", function(error, response, data) {
    body.data = JSON.parse(data); // parse json
    body.emit('update'); // continue stream of body data
});

body.on('update', function () {
    console.log(body.data);
});
