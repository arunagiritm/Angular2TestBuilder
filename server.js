var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');

var PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Used for production build
app.use(express.static(__dirname));

app.post("/getDependencies", function(req, res) {
    //console.log("server route request received");
    var au = require(path.join(__dirname, "server/Src/AngularUtils"));
    var deparray={};
    var callback = function(deparray) {
        res.send(deparray);
    }
    au.getDependencies(req.body.fileObj, callback);
    //console.log(deparray);
  
});
app.post("/getangular2Specs", function(req, res) {
    //console.log("server route request received");
    var au = require(path.join(__dirname, "server/Src/AngularUtils"));
    var deparray={};
    var callback = function(deparray) {
        res.send(deparray);
    }
    au.getangular2Specs(req.body.fileObj, callback);
    //console.log(deparray);
  
});

app.get("/CreateZip", function(req, res) {

    foldername = path.join(__dirname, "server/specs");
    var wf = require(path.join(__dirname, "server/Src/WriteFactories"));
    wf.CreateZip(foldername, foldername + "/JasmineSpecs.zip");
    res.send("Success");
})
app.get("/DelFolder", function(req, res) {
    foldername = path.join(__dirname, "server/specs");
    //console.log("Request received to delete "+ foldername);
    var wf = require(path.join(__dirname, "server/Src/WriteFactories"));
    wf.DelFolder(foldername);
    res.send("Success");
});
app.get('/restart', function(req, res, next) {
    process.exit(1); //Use forever to restart automatically
});

app.all('/*', function(req, res) {
    //console.log("default request received");
    res.sendFile(path.join(__dirname, 'client/index.html'));
});

app.listen(PORT, function() {
    console.log('Server running on ' + PORT);
});