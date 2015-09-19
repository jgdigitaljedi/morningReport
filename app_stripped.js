var express = require('express'),
	app = express(),
	http = require('http'),
	mornObj = {},
	coldMessage = ['. You should take a jacket', '. It\'s gonna be a cold one', '. Chilly might be an understatement',
		'. Turn off the infrared heater before you leave'],
	hotMessage = ['. It will be another typical summer day in Texas', '. Triple digits once again', '. Prepare to be a sweaty mess at some point today',
		'. I heard hell is going to be cooler than Austin today'];

function randomNum(num) {
	return Math.floor(Math.random() * num);
}

function organizeResponse(res) {
	var currentBit = '. Currently it is ' + mornObj.curTemp + ' degrees and ' + mornObj.curCondition,
		forecastBit = '. Forecast is ' + mornObj.forecast,
		rainMessage = [' Better check to make sure you have an umbrella. There is a ' + mornObj.rain + ' percent chance of precipitation.',
			' It\'s gonna be a wet one! Looks like there is a ' + mornObj.rain + ' percent chance of precipitation.',
			' Expect to have soggy feet when you get to work because there is a ' + mornObj.rain + ' percent chance of precipitation.'],
		trafficTime = (mornObj.traffic.travelDurationTraffic / 60) + ' minutes';
	if(mornObj.low <= 50) {
		var needCoat = coldMessage[randomNum(5)];
		currentBit += needCoat;
	}
	if(mornObj.high >= 100) {
		var texasDay = hotMessage[randomNum(5)];
		currentBit += texasDay;
	}
	if(parseInt(mornObj.rain) >= 30) {
		var wetOne = rainMessage[randomNum(4)];
		forecastBit += wetOne;
	}

	res.send('Today\'s commute should take about ' + trafficTime + currentBit + forecastBit);
}

function getForecast(res) {
	http.get({
		host: 'api.wunderground.com',
		path: '/api/<WEATHERUNDERGROUND_KEY>/forecast/q/TX/Austin.json'
	}, function(response) {
		var body = '';
		response.on('data', function (d) {
			body += d;
		});
		response.on('end', function () {
			var parsed = JSON.parse(body);
			mornObj.forecast = parsed.forecast.txt_forecast.forecastday[0].fcttext;
			mornObj.rain =  parsed.forecast.txt_forecast.forecastday[0]['pop'];
			mornObj.high = Math.round(parsed.forecast.simpleforecast.forecastday[0].high.fahrenheit);
			mornObj.low = Math.round(parsed.forecast.simpleforecast.forecastday[0].low.fahrenheit);
			organizeResponse(res);
		});
	});
}

function getConditions(res) {
	http.get({
		host: 'api.wunderground.com',
		path: '/api/<WEATHERUNDERGROUND_KEY>/conditions/q/TX/Austin.json'
	}, function(response) {
		var body = '';
		response.on('data', function (d) {
			body += d;
		});
		response.on('end', function () {
			var parsed = JSON.parse(body);
			mornObj.curTemp = Math.round(parsed.current_observation.temp_f);
			mornObj.curCondition = parsed.current_observation.weather;
			mornObj.precip = parsed.current_observation.precip_today_in;
			getForecast(res);
		});
	});
}

function getTraffic(res) {
	var home = encodeURI('<MY_HOME_ADDRESS_SEPERATED_BY_SPACES>'),
		parking = encodeURI('<MY_WORK_PARKING_LOT_ADDRESS>');
	http.get({
		host: 'dev.virtualearth.net',
		path: '/REST/V1/Routes/Driving?wp.0=' + home + '&wp.1=' + parking + '&avoid=minimizeTolls&key=<BING_MAPS_API_KEY>'
	}, function(response) {
		var body = '';
		response.on('data', function (d) {
			body += d;
		});
		response.on('end', function () {
			var parsed = JSON.parse(body);
			mornObj.traffic = parsed.resourceSets[0].resources[0];
			getConditions(res);
		});
	});
}

app.get('/', function (req, res) {
	getTraffic(res);
});

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Morning info listening at http://%s:%s', host, port);
});