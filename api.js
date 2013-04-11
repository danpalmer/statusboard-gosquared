var restify = require('restify');
var request = require('request');
var _ = require('underscore');
var fs = require('fs');
var mustache = require('mustache');
require('date-utils');
var server = restify.createServer();

var templates = {};

// Handlers
// -----------------------------------------------------------------------------

function handleTimeline(req, res) {
  request.get(getTimelineURLForParams(req.params), function(err, response) {
    if (err || !response) {
      res.send({"error":err});
    } else {
      var data = JSON.parse(response.body);
      res.send({
        "graph": {
          "title": "Visitors",
          "datasequences": [
            {
              "title": getSiteName(data['listSites'], req.params.site),
              "color": (req.params.colour) ? req.params.colour : "blue",
              "datapoints": getTimelineDataFromResult(data)
            }
          ]
        }
      });
    }
  });
}

function handlePages(req, res) {
  request.get(getPagesURLForParams(req.params), function(err, response) {
    if (err || !response) {
      res.send({"error":err});
    } else {
      res.setHeader('Content-Type', 'text/html');
      res.send(getTableForPageData(JSON.parse(response.body)));
    }
  });
}

function handleRoot(req, res) {
  res.header('Location', 'http://danpalmer.me/');
  res.send(302);
}

// Helper Functions
// -----------------------------------------------------------------------------

function getTimelineURLForParams(params) {
  var to = new Date();
  var from = (new Date()).addHours(-12);
  return "https://api.gosquared.com/v2/timeSeries,listSites?" +
         "interval=30min" +
         "&site_token=" + params.site +
         "&api_key=" + params.token +
         "&from=" + from.toFormat("YYYY-MM-DD+HH24:MI") +
         "&to=" + to.toFormat("YYYY-MM-DD+HH24:MI");
}

function getPagesURLForParams(params) {
  return "https://api.gosquared.com/v2/pages?" +
         "&site_token=" + params.site +
         "&api_key=" + params.token;
}

function getTimelineDataFromResult(res) {
  return _.map(res['timeSeries']['visitors.total'], function(obj) {
    return {
      "value": obj.value,
      "title": (new Date(1000 * obj.timestamp)).toFormat("HH24:MI")
    };
  });
}

function getSiteName(sites, site) {
  for (var i = 0; i < sites['owned'].length; i++) {
    if (sites['owned'][i].acct == site) {
      return sites['owned'][i].name;
    }
  }
  for (var j = 0; j < sites['shared'].length; j++) {
    if (sites['shared'][j].acct == site) {
      return sites['shared'][j].name;
    }
  }
  return "";
}

function getTableForPageData(data) {
  return mustache.to_html(templates['pages'], data);
}

server.get("/", handleRoot);
server.get("/pages/:token/:site", handlePages);
server.get("/timeline/:token/:site", handleTimeline);
server.get("/timeline/:token/:site/:colour", handleTimeline);

fs.readFile("./table.html.ms", "utf8", function (err, file) {
  templates['pages'] = file;
});

server.listen(8000,  function() {
  console.log('%s listening at %s', server.name, server.url);
});
