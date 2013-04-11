var restify = require('restify');
var request = require('request');
var _ = require('underscore');
require('date-utils');
var server = restify.createServer();

function handle(req, res) {
  request.get(getURLForParams(req.params), function(err, response) {
    if (err) {
      res.send({"error":err});
    } else {
      var body = JSON.parse(response.body);
      res.send({
        "graph": {
          "title": "Visitors",
          "datasequences": [
            {
              "title": getSiteName(body['listSites'], req.params.site),
              "color": (req.params.colour) ? req.params.colour : "blue",
              "datapoints": getDataFromResult(body)
            }
          ]
        }
      });
    }
  });
}

function getURLForParams(params) {
  var to = new Date();
  var from = (new Date()).addHours(-12);
  return "http://api.gosquared.com/v2/timeSeries,listSites?" +
         "interval=30min" +
         "&site_token=" + params.site +
         "&api_key=" + params.token +
         "&from=" + from.toFormat("YYYY-MM-DD+HH24:MI") +
         "&to=" + to.toFormat("YYYY-MM-DD+HH24:MI");
}

function getDataFromResult(res) {
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

function root(req, res) {
  res.header('Location', 'http://danpalmer.me/');
  res.send(302);
}

server.get("/", root);
server.get("/gs/:token/:site", handle);
server.get("/gs/:token/:site/:colour", handle);
server.listen(8000, "127.0.0.1", function() {
  console.log('%s listening at %s', server.name, server.url);
});
