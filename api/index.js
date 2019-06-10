const { getSubmissionDownloadStreamByFilename } = require("../models/submissions");
const router = require('express').Router();

router.use("/assignments", require("../api/assignments").router);
router.use("/courses", require("./courses"))

router.get("/media/submissions/:filename", (req, res, next) => {
    getSubmissionDownloadStreamByFilename(req.params.filename)
        .on("error", (err) => {
            if (err.code === "ENOENT")
                next();

            else
                next(err);
        })
        .on("file", (file) => {
            res.status(200).type(file.metadata.contentType);
        })
        .pipe(res);
});

module.exports = router;
