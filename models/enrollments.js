const { extractValidFields } = require("../lib/validation");
const { getDBRef } = require("../lib/mongo");

const ENROLLMENT_SCHEMA = {
    courseId: { required: true },
    userId: { required: true }
};

const ENROLLMENT_COLLECTION_NAME = "enrollments";

function getEnrollmentsCollection() {
    return getDBRef().collection(ENROLLMENT_COLLECTION_NAME);
}

async function insertEnrollment(enrollment) {
    const enrollmentToInsert = extractValidFields(enrollment, ENROLLMENT_SCHEMA);
    const collection = getEnrollmentsCollection();
    const result = await collection.insertOne(enrollmentToInsert);

    return result.insertedId;
}

async function getEnrollmentsByFields(fields) {
    const collection = getEnrollmentsCollection();
    const enrollments = await collection.find(fields).toArray();

    return enrollments;
}

async function deleteEnrollmentsByFields(fields) {
    const collection = getEnrollmentsCollection();
    const result = await collection.deleteMany(fields);

    return result.deletedCount > 0;
}

module.exports = {
    ENROLLMENT_SCHEMA,
    insertEnrollment,
    getEnrollmentsByFields,
    deleteEnrollmentsByFields
};
