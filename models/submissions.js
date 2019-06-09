const fs = require("fs");
const { GridFSBucket } = require("mongodb");
const { getDBRef, createObjectId } = require("../lib/mongo");

const SUBMISSION_SCHEMA = {
    assignmentId: { required: true },
    studentId: { required: true },
    timestamp: { required: true }
};

const SUBMISSIONS_BUCKET_NAME = "submissions";

async function saveSubmissionFile(submission, metadata) {
    return new Promise((res, rej) => {
        const db = getDBRef();
        const bucket = new GridFSBucket(db, { bucketName: SUBMISSIONS_BUCKET_NAME });

        const uploadStream = bucket.openUploadStream(submission.filename, { metadata: metadata });

        fs.createReadStream(submission.path)
            .pipe(uploadStream)
            .on("error", (err) => {
                rej(err);
            })
            .on("finish", (result) => {
                res(result._id);
            });
    });
}

async function getSubmissionById(id) {
    const db = getDBRef();
    const bucket = new GridFSBucket(db, { bucketName: SUBMISSIONS_BUCKET_NAME });

    const submission = await bucket.findOne({ _id: createObjectId(id) });

    return submission;
}

async function getSubmissionsByFields(fields) {
    const db = getDBRef();
    const bucket = new GridFSBucket(db, { bucketName: SUBMISSIONS_BUCKET_NAME });

    const submissions = await bucket.find(fields).toArray();

    return submissions;
}

function getSubmissionDownloadStreamByFilename(filename) {
    const db = getDBRef();
    const bucket = new GridFSBucket(db, { bucketName: SUBMISSIONS_BUCKET_NAME });

    return bucket.openDownloadStreamByName(filename);
}

module.exports = {
    SUBMISSION_SCHEMA,
    saveSubmissionFile,
    getSubmissionById,
    getSubmissionsByFields,
    getSubmissionDownloadStreamByFilename
};
