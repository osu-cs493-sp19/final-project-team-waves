const router = require('express').Router();

router.use("/assignments", require("../api/assignments").router);
router.use("/courses", require("./courses"))

module.exports = router;
