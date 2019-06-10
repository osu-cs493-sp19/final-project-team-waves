const fs = require("fs");
const { GridFSBucket } = require("mongodb");
const { getDBRef, createObjectId } = require("../lib/mongo");

const SUBMISSION_SCHEMA = {
    assignmentId: { required: true },
    studentId: { required: true },
    timestamp: { required: true }
};

const SUBMISSIONS_BUCKET_NAME = "submissions";

function getSubmissionsBucket() {
    const db = getDBRef();

    return new GridFSBucket(db, { bucketName: SUBMISSIONS_BUCKET_NAME });
}

async function saveSubmissionFile(submission, metadata) {
    return new Promise((res, rej) => {
        const bucket = getSubmissionsBucket();
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
    const bucket = getSubmissionsBucket();
    const submission = await bucket.findOne({ _id: createObjectId(id) });

    return submission;
}

async function getSubmissionsByFields(fields) {
    const bucket = getSubmissionsBucket();
    const submissions = await bucket.find(fields).toArray();

    return submissions;
}

async function getPaginatedSubmissionsByFields(fields, paginationOptions) {
    const bucket = getSubmissionsBucket();
    let submissions = await bucket.find(fields);

    const count = await submissions.count();
    const pageSize = paginationOptions.pageSize || 2;
    
    let lastPage = Math.ceil(count / pageSize);
    lastPage = lastPage <= 0 ? 1 : lastPage;
    
    let page = paginationOptions.page || 1;
    page = page < 1 ? 1 : page;
    page = page > lastPage ? lastPage : page;

    const offset = (page - 1) * pageSize;

    submissions = await submissions
        .sort({ _id: 1 })
        .skip(offset)
        .limit(pageSize)
        .toArray();

    return {
        submissions: submissions,
        page: page,
        pageSize: pageSize,
        totalPages: lastPage,
        count: count
    };
}

function getSubmissionDownloadStreamByFilename(filename) {
    const bucket = getSubmissionsBucket();
    
    return bucket.openDownloadStreamByName(filename);
}

async function deleteSubmissionsByAssignmentId(id) {
    const bucket = getSubmissionsBucket();
    const assignmentSubmissions = await getSubmissionsByFields({ "metadata.assignmentId": id });
    const deletes = [];

    for (const submission of assignmentSubmissions)
        deletes.push(bucket.delete(createObjectId(submission._id)));

    Promise.all(deletes)
        .then(() => {
            return true;
        });
}

module.exports = {
    SUBMISSION_SCHEMA,
    saveSubmissionFile,
    getSubmissionById,
    getSubmissionsByFields,
    getPaginatedSubmissionsByFields,
    getSubmissionDownloadStreamByFilename,
    deleteSubmissionsByAssignmentId
};
