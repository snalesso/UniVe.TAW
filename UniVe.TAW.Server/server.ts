/// <reference path="EndpointNames.ts" />

const serverListenPort = 1632;

let express = require('express');
let bodyParser = require('body-parser')
let app = express();

app.use(bodyParser.json());

app.post('/' + "SendMessage", (request, response) => {
    response.send('Message received: ' + JSON.stringify(request.body));
});

app.listen(serverListenPort, () => console.log('Example app listening on port ' + serverListenPort + '!'));