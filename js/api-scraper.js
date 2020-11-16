// NodeJS
// npm install jsdom, jquery, twitter, sleep
// script runs every 10 seconds

const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );

// load from env file
var Twitter = require('twitter'); // import Twitter npm module

// pull keys from environment (pfv=pulled from environment)
// can't store these in plaintext
var consumer_key = process.env.consumer_key_pfv;
var consumer_secret = process.env.counsumer_secret_pfv;
var access_token_key = process.env.access_token_key_pfv;
var access_token_secret = process.env.access_token_secret_pfv;
var npyd_app_token = process.env.npyd_app_token_pfv;

// create twitter auth object
var client = new Twitter({
  consumer_key: consumer_key,
  consumer_secret: counsumer_secret,
  access_token_key: access_token_key,
  access_token_secret: access_token_secret
});

// pull NYPD API info w/ jQuery
function returnAjax() {
  return $.ajax({  // return needed here to prevent null return
      url: "https://data.cityofnewyork.us/resource/fjn5-bxwg.json?incident_zip=10458",  // zip query specified in url
      type: "GET",
      async: false,  // Prevent heap overflow
      cache: false,  // Save resources
      dataType: "json",
      data: {"$limit": 10, "$$app_token": npyd_app_token}  // limit = number of entries, app_token = prevent throttling and give unlimited requests
   }).done(function(data) { return data; });
}

// sleep function for while loop (sleep nodejs import)
var sleep = require('sleep');

// store outside of while-loop, almost like a global var
// don't want to re-initlialize in while-loop everytime
var visitedReports = []; // store already posted reports, do this to prevent dups on twitter

// keep running indefinitely, server style
while (1) {
  // 17 is the magic number here, Ajax full report, want 17th item anyways
  var data = returnAjax(); // pull NYPD SOCRATA API Report json

  // Create today's date
  var today = new Date();  // create date object instance
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');  // January is 0
  var yyyy = today.getFullYear();
  today_date = yyyy + '-' + mm + '-' + dd;  // match formatting of API dates, create today_date so we can still use time

  // following code block used to prevent dupes in using a visited queue
  // once 12:00AM comes around, queue removes data points from the day before and starts fresh
  var infoStore = []; // store current reports

  // need to index info before adding to infoStore
  var beforeStore = [];

  // index beforeStore
  for (var key of Object.keys(data)) {
      beforeStore.push(data[key]);  // push reports to info store
  }

  var currentTime = '';  // init current time
  currentTime = currentTime.concat(String(today.getHours()), String(today.getMinutes()), String(today.getSeconds())); // hours:minutes:seconds to string

  // get yesterday's date to clear out yesterday's data for next day's queue
  if (currentTime.slice(0,2) == "23" && currentTime.slice(2,4) == "59" && "30" <= currentTime.slice(4,6) >= "59") {
    var yesterday = today_date; // get date just before next day
  }

  // At 12:00AM of next day, remove visited reports from yesterday
  if (currentTime.slice(0,2) == "00" && currentTime.slice(2,4) == "00" && "00" <= currentTime.slice(4,6) >= "30") { // 15 second grace period
    // empty visited queue of visited reports
    for (var i = 0; i < visitedReports.length; i++) {
      if (visitedReports[i].created_date.slice(0,10) == yesterday) {  // if report was from yesterday, remove it
        delete visitedReports[i];
      }
    }
  }

  // Determine if report date is equal to today's date and not visited
  // If not visited, add to visited and infoStore
  // If visited, do not add to infoStore or visited and go to next iteration
  for (var i = 0; i < (beforeStore.length - 10); i++) {
    var report_date = beforeStore[17][i].created_date.slice(0,10);  // date formatting, 0's added for single digits already
    if (report_date == today_date && !visitedReports.includes(beforeStore[17][i].created_date.slice(11,23))) {  // if report is today's date, and not posted already
      infoStore.push(beforeStore[17][i]);  // push reports to info store
      visitedReports.push(beforeStore[17][i].created_date.slice(11,23)); // push to visited because it was included in info store
      // no two reports can have the same report time down to the millesecond
    }
  }

  if (infoStore === undefined || infoStore.length == 0) {  // if no reports, exit. 30 second refresh time in home page
    console.log("Nothing in infoStore, next iteration!");  // server logging purposes
    sleep.sleep(10); // wait for new loop
    continue;  // start next loop
  }

  // create AM/PM time return function
  function timeConverter(time) {
    var newTime = time.slice(11,16);
    if (parseInt(newTime.slice(0,2)) < 12) {
      if (newTime[0] == "0") {
        return (newTime.slice(1,5).concat(" AM")).toString(); // AM Time, everything before 12
      }
      else {
        return (newTime.concat(" AM")).toString(); // 10 and 11, no 0 in front
      }
    } else {
        return (parseInt(newTime.slice(0,2) - 12).toString()).concat(newTime.slice(2,5), " PM"); // PM time is during or after 12
    }
  }

  // get JSON info on all reports and split up sections for status
  for (var i = 0; i < infoStore.length; i++) {
     var final_status = "";  // init our status

     // add important data to our status with string concatenation
     final_status = final_status.concat('At ', (timeConverter(infoStore[i].created_date)).toString(), ', an incident was reported by the NYPD as, ');
     final_status = final_status.concat((infoStore[i].descriptor).toString(), '. Location: ', (infoStore[i].incident_address).toString(), '. ');
     final_status = final_status.concat('The status of the incident is considered ', (infoStore[i].status).toString(), '.');

     var final_tweet = {  // create tweet struct
       status: final_status
     }

     console.log(final_status);  // server logging purposes

     // Twitter npm module tweet function
     client.post('statuses/update', final_tweet, function(error, tweet, response) {
       if(error) {
         console.log(error);
       }
       console.log(tweet);  // Tweet body.
       console.log(response);  // Raw response object.
     });
  }

  console.log("Finished tweet(s), next iteration!");  // server logging purposes
  sleep.sleep(10); // sleep for 10 seconds

} // end while loop
