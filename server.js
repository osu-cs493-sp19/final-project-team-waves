const { connectToDB } = require("./lib/mongo");
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const api = require('./api');

const app = express();
const port = process.env.PORT || 8000;

const { connectToDB } = require('./lib/mongo')

/*
 * Morgan is a popular logger.
 */
app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(express.static('public'));

/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
app.use('/', api);

app.use('*', function (req, res) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  });
});

<<<<<<< HEAD
const doDB = () => {
  // Makes sure server only starts if there is a connection to the db
  connectToDB().then(() => {
    console.log("Trying to connect to database callback")
    app.listen(port, function() {
      console.log("== Server is running on port", port);
    });
  }).catch(err => {
    console.log("err")
    console.log(err)
    setTimeout(doDB, 3000)
  })
}

doDB()
=======
function startServer() {
  connectToDB()
    .then(() => {
      app.listen(port, function() {
        console.log("== Server is running on port", port);
      });
    })
    .catch((err) => {
      console.log("Error connecting to mongodb");
      console.log(err);

      setTimeout(() => {
        startServer
      }, 2500);
    });
}

startServer();
>>>>>>> master
