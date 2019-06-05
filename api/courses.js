const router = require('express').Router();

const { getDBReference } = require('../lib/mongo');


exports.router = router;

router.get('/', function (req, res) {
    res.status(200).send()
});