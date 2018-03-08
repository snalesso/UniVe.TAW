/// <reference path="EndpointNames.ts" />
var serverListenPort = 1632;
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
app.post('/' + "SendMessage", function (request, response) {
    response.send('Message received: ' + JSON.stringify(request.body));
});
app.listen(serverListenPort, function () { return console.log('Example app listening on port ' + serverListenPort + '!'); });
//# sourceMappingURL=Server.js.map