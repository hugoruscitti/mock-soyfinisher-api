var request = require('request');
var prettyjson = require('prettyjson');

var url = 'http://0.0.0.0:8182';
var login_url = url + '/clients/login/';
var events_url = url + '/events/';

function log(data) {
  var options = {
    noColor: false
  };

  if (typeof(data) === 'string') {
    data = JSON.parse(data);
  }

  var text = prettyjson.render(data, options);
  console.log(text);
}

/* Prueba el acceso inicial a API. */

request(url, function (error, response, body) {

  if (!error && response.statusCode == 200) {
    console.log(body);

    request.post(login_url, {
      formData: {
        name: 'joe',
        passwd: 123123,
      },
      json: true
    }, function (err, res, body) {
      var key = body.client.key;

      request(events_url, function(err, response, body) {
        log(body);
      });

    });
  }

});
