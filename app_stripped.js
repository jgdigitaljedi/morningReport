var express = require('express');
var app = express();
var http = require('http');

app.get('/', function (req, res) {
	var traffic,
		weather,
		events;
	http.get({
		host: 'maps.googleapis.com',
		path: '/maps/api/distancematrix/json?origins=<MY HOME ADDRESS>&destinations=<MY WORK ADDRESS>&avoidTolls=true'
	}, function(response) {
		var body = '';
		response.on('data', function(d) {
			body += d;
		});
		response.on('end', function() {
			var parsed = JSON.parse(body);
 			// res.send(parsed.rows[0].elements[0].duration.text);
 			traffic = parsed.rows[0].elements[0].duration.text;
			http.get({
				host: 'api.wunderground.com',
				path: '/api/<API KEY>/forecast/q/TX/Austin.json'
			}, function(response) {
				var body = '';
				response.on('data', function(d) {
					body += d;
				});
				response.on('end', function() {
					var parsed = JSON.parse(body);
		 			// res.send(parsed.forecast.txt_forecast.forecastday[0].fcttext);
		 			weather = parsed.forecast.txt_forecast.forecastday[0].fcttext;
					res.send('Today\'s commute with traffic should take about ' + traffic + '. Weather outlook is ' + weather);
				});
			});
		});
	});
});
// adding google calendar soon for today's events

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

  	console.log('Morning info listening at http://%s:%s', host, port);
});