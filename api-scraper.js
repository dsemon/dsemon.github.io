// requires NodeJS

const request = require("request");

function getData() {
  return request("https://data.cityofnewyork.us/resource/fjn5-bxwg.json?incident_zip=10458", function (error, response, body) {
    return JSON.parse(body);
  })
}

var data = getData();

console.log(data)
