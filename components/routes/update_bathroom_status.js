var debug = require('debug')('bathroom-status');
var tracker = require('../bathroom_status_tracker');

module.exports = function(webserver, controller) {
    //
    var io = require('socket.io')(controller.httpserver);
    //

    debug('Configured /bathroom_status url');
    webserver.post('/bathroom_status', function(req, res) {
      if (!['occupied', 'available'].includes(req.body.status)) {
        res.status(400);
        res.send(`Invalid status ${req.body.status}. Must be one of [occupied, available].`)
      }

      const statusChanged = tracker.updateStatus(req.body.status);
      if (statusChanged) {
        // Notify websockets
        io.emit('statusChange', tracker.status)
      }

      res.status(200);
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({status: tracker.status}));
    });
    webserver.get('/bathroom_status', function(req, res) {
      res.status(200);
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({status: tracker.status}));
    });

    webserver.get('/status', function(req, res) {
      res.status(200);
      res.setHeader('Content-Type', 'text/html');
      res.send(`
<html>
  <head>
  <!-- Latest compiled and minified CSS -->
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">

  <!-- Optional theme -->
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">

  <!-- Latest compiled and minified JavaScript -->
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
    <style type="text/css">
      body {
        background-color: black;
      }
      #status-color {
        font-size: 80px;
        font-weight: bold;
      }
      .status-available {
        // display: table-cell;
        background-color: green;
        vertical-align: middle;
      }
      .status-occupied {
        // display: table-cell;
        background-color: red;
        vertical-align: middle;
      }
    </style>
    <script>
    window.ButtonWebConfig = {
      applicationId: 'app-6f970e3b80d2a128'
    };
    (function(u,s,e,b,t,n){
      u['__bttnio']=b;u[b]=u[b]||function(){(u[b].q=u[b].q||[]).push(arguments)};t=s.createElement(e);n=s.getElementsByTagName(e)[0];t.async=1;t.src='https://web.btncdn.com/v1/button.js';n.parentNode.insertBefore(t,n)
    })(window, document, 'script', 'bttnio');
    </script>
  </head>
  <body>
    <div class="row">
      <div class="col-xs-8 col-xs-offset-2 text-center">
        <div class="status-${tracker.status}" id="status-color">The bathroom is ${tracker.status}</div>
      </div>
    </div>
    <div class="row">
      <div class="col-xs-8 col-xs-offset-2 text-center">
        <div data-bttnio-id="btn-3dda0c43216b8e3c" data-bttnio-context='{ "subject_location": { "latitude": 40.738275, "longitude": -73.982285 } }'></div>
      </div>
    </div>
    <div class="row">
      <div class="col-xs-8 col-xs-offset-2 text-center">
        <div data-bttnio-id="btn-2d12cd4e16414ef1" data-bttnio-context='{ "item": { "identifiers": { "jet": "9a04cd1ee78d403aa3aa3d220e077339" } } }'></div>
      </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.7.3/socket.io.js"></script>
    <script>
      var socket = io();
      socket.on('statusChange', function(data) {
        console.log(data);
        var div = document.getElementById( 'status-color' );
        var message = "The bathroom is " + data;
        if (data == "occupied") {
          var color = "red";
        } else if (data == "available") {
          var color = "green";
        } else {
          var color = "yellow"
          var message = "Something funky is going on with the sensor..."
        }
        div.style.backgroundColor = color;
        div.innerHTML = message;
      });
    </script>
  </body>

</html>
`)
    });
}
