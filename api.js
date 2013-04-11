var restify = require('restify');
var request = require('request');
var _ = require('underscore');
var server = restify.createServer();

function handle(req, res) {
  request.get(getURLForParams(req.params), function(err, response) {
    if (err) {
      res.send({"error":err});
    } else {
      res.send({
        "graph": {
          "title": "Visitors",
          "datasequences": [
            {
              "title": "Dan Palmer",
              "color": "blue",
              "datapoints": getDataFromResult(JSON.parse(response.body))
            }
          ]
        }
      });
    }
  });
}

function getURLForParams(params) {
  return "http://api.gosquared.com/v2/timeSeries?" +
         "site_token=" + params.site +
         "&api_key=" + params.token +
         "&from=2013-04-09+23:00" +
         "&to=2013-04-10+23:00";
}

function getDataFromResult(res) {
  return _.map(res['visitors.total'], function(obj) {
    return {
      "value": obj.value,
      "title": formatDate(new Date(1000 * obj.timestamp))
    };
  });
}

function formatDate(date) {
  return "" + date.getUTCDate();
}

server.get("/:token/:site", handle);
server.listen(8000, function() {
  console.log('%s listening at %s', server.name, server.url);
});
