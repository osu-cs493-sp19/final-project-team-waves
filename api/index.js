const router = require('express').Router();

router.use("/assignments", require("../api/assignments").router);

module.exports = router;
