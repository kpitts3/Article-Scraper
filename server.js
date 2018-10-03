var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var axios = require("axios");
var cheerio = require("cheerio");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

var PORT = process.env.PORT || 8080;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
mongoose.Promise = Promise;
var app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

require("./routes/apiRoutes")(app);
// require("./routes/htmlRoutes")(app);

app.listen(PORT, function() {
  console.log("App running on port "+ "http://localhost:" + PORT);
});