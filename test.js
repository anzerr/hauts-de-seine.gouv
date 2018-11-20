var http = require("http");

var options = {
  "method": "GET",
  "hostname": [
    "www",
    "hauts-de-seine",
    "gouv",
    "fr"
  ].join('.'),
  "path": '/' + ([
    "booking",
    "create",
    "4462",
    ""
  ].join('/')),
  "headers": {}
};
console.log(options);
var req = http.request(options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    var body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});

req.end();