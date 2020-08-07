var express = require("express");
var app = express();

var bodyParser = require("body-parser");
var expressSession = require("express-session");
var passport = require("passport");
//var User = require("./models/user")();

var mongoose = require("mongoose");
var port = process.env.PORT || 3000;
if (port == 3000)
  mongoose.connect("mongodb://localhost/myappdatabase", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
else
  mongoose.connect(
    "mongodb://cahuser:cahuser@ds023468.mlab.com:23468/cahuserdb",
    { useUnifiedTopology: true, useNewUrlParser: true }
  );

require("./config/passport")(passport);

var cors = require("cors");
app.use(cors());
app.options("/profile", cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

require("./routes/routes")(app, passport);

var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Server started on PORT " + port);
});
