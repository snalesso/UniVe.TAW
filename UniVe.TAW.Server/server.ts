var express = require('express');
var bodyParser = require('body-parser')
var app = express();

app.use(bodyParser.json());

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
    res.send('hello world');
});

app.post('/SendMessage', function (req, res) {
    res.send('Message delivered!');
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));