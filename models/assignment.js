const { extractValidFields } = require("../lib/validation");
const { getDBRef, createObjectId } = require("../lib/mongo");

const ASSIGNMENT_SCHEMA = {
    courseId: { required: true },
    title: { required: true },
    points: { required: true },
    due: { required: true }
};

const ASSIGNMENT_COLLECTION_NAME = "assignments";

function getAssignmentsCollection() {
    return getDBRef().collection(ASSIGNMENT_COLLECTION_NAME);
}

async function insertAssignment(assignment) {
    const assignmentToInsert = extractValidFields(assignment, ASSIGNMENT_SCHEMA);
    const collection = getAssignmentsCollection();
    const result = await collection.insertOne(assignmentToInsert);

    return result.insertedId;
}

async function getAssignmentById(id) {
    const collection = getAssignmentsCollection();

    const assignment = collection.findOne({
        _id: createObjectId(id)
    });

    return assignment;
}

async function updateAssignmentById(id, assignment) {
    const assignmentValues = extractValidFields(assignment, ASSIGNMENT_SCHEMA);
    const collection = getAssignmentsCollection();

    const result = await collection.replaceOne(
        { _id: createObjectId(id) },
        assignmentValues
    );

    return result.matchedCount > 0;
}

async function deleteAssignmentById(id) {
    const collection = getAssignmentsCollection();

    const result = await collection.deleteOne({
        _id: createObjectId(id)
    });

    return result.deletedCount > 0;
}

module.exports = {
    ASSIGNMENT_SCHEMA,
    insertAssignment,
    getAssignmentById,
    updateAssignmentById,
    deleteAssignmentById
};
