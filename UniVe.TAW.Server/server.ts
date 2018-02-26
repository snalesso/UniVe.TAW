import http = require('http');

var port = process.env.port || 1632

console.log("Server starting ...");

http.createServer(function (req, res) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello World\n");
}).listen(port);

console.log("Server online @ http://127.0.0.1:" + port + "/");