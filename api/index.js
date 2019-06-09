const router = require('express').Router();

<<<<<<< HEAD
// router.use('/courses', require('./courses'))
router.use('/courses', require('./courses'));
=======
router.use("/assignments", require("../api/assignments").router);
>>>>>>> master

module.exports = router;
