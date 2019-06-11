const { connectToDB } = require("./lib/mongo");
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const redis = require('redis');

const api = require('./api');

const app = express();
const port = process.env.PORT || 8000;


/*
 * Morgan is a popular logger.
 */
app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(express.static('public'));

const redisPort = process.env.REDIS_PORT || 6379;
const redisHost = process.env.REDIS_HOST;
const redisClient = redis.createClient(redisPort, redisHost); // from redis package. Create client to communicate w/ server

redisClient.on("error", (err) => {
  console.log("REDIS NOOO!");
  console.log(err);
});

const rateLimitWindowMillis = 60000;
const rateLimitWindowMaxRequests = 5; // max 5 requests per 60000ms

// function to get a user’s token bucket out of Redis, given their IP
function getTokenBucket(ip) { // ip is of bucket we want to access
  return new Promise((resolve, reject) => {
    redisClient.hgetall(ip, (err, tokenBucket) => {
      if (err) {
        reject(err); //if error, call reject funct
      }
      else {
        if (tokenBucket) { // if user has token bucket
          tokenBucket.tokens = parseFloat(tokenBucket.tokens); // get num tokens
        }
        else { // create new token bucket if user doesn't have one
          tokenBucket = { // store num tokens and last timestamp of tokens
            tokens: rateLimitWindowMaxRequests, //store max num tokens
            last: Date.now() // last timestamp
          };
        }
        resolve(tokenBucket);
      }
    });
  });
}

// fucntion to save token bucket back to redis
function saveTokenBucket(ip, tokenBucket) {
  return new Promise((resolve, reject) => {
    redisClient.hmset(ip, tokenBucket, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// fucntion to perform rate limiting
async function rateLimit(req, res, next) {
  try {
    const tokenBucket = await getTokenBucket(req.ip);

    const timestamp = Date.now();
    const ellapsedMillis = timestamp - tokenBucket.last;
    const refreshRate = rateLimitWindowMaxRequests / rateLimitWindowMillis; // number of requests per allotted time
    tokenBucket.tokens += refreshRate * ellapsedMillis;
    tokenBucket.tokens = Math.min(rateLimitWindowMaxRequests, tokenBucket.tokens);
    tokenBucket.last = timestamp;

    if (tokenBucket.tokens >= 1) { // if user has at least 1 token
      tokenBucket.tokens -= 1; // remove a token from bucket 
      saveTokenBucket(req.ip, tokenBucket); // update token bucket
      next (); // allow request through
    }
    else { // request is rejected
      saveTokenBucket(req.ip, tokenBucket); // update token bucket
      res.status(429).send({ // status 429 used for rate limiting
        error: "Too many requests per minute"
      });
    }
  }
  catch (err) { // api is unavailable if rate can't be limited
    console.error(err);
    next();
  }
};

app.use(rateLimit); // plug rate limiting function into application. Will be applied to all endpoints (:

app.use('/', api);

app.use('*', function (req, res) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  });
});

function startServer() {
  console.log("Starting server...");

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
        startServer();
      }, 2500);
    });
}

redisClient.on("ready", startServer);
