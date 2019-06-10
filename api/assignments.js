const path = require("path");
const multer = require("multer");
const crypto = require("crypto");
const router = require("express").Router();
const { removeFile } = require("../lib/util");
const { validateAgainstSchema, extractValidFields } = require("../lib/validation");

const {
    ASSIGNMENT_SCHEMA,
    insertAssignment,
    getAssignmentById,
    updateAssignmentById,
    deleteAssignmentById
} = require("../models/assignment");

const {
    SUBMISSION_SCHEMA,
    saveSubmissionFile,
    getSubmissionsByFields,
    deleteSubmissionsByAssignmentId
} = require("../models/submissions");

exports.router = router;

const upload = multer({
    storage: multer.diskStorage({
        destination: `${__dirname}/uploads`,
        filename: (req, file, callback) => {
            const basename = crypto.pseudoRandomBytes(16).toString("hex");
            const ext = path.extname(file.originalname);

            callback(null, `${basename}${ext}`);
        }
    })
});

// TODO: Add authentication
router.post("/", async (req, res) => {
    if (validateAgainstSchema(req.body, ASSIGNMENT_SCHEMA)) {
        const newAssignment = req.body;
    
        try {
            const newAssignmentId = await insertAssignment(newAssignment);
            console.log(newAssignmentId);

            res.status(201).json({
                id: newAssignmentId
            });
        }

        catch (err) {
            console.log(err);
            
            res.status(500).json({
                error: "Error inserting assignment into DB."
            });
        }
    }

    else {
        res.status(400).json({
            error: "The request body was either not present or did not contain a valid Assignment object."
        });
    }
});

router.get("/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const assignment = await getAssignmentById(id);

        if (assignment)
            res.status(200).json(assignment);

        else {
            res.status(404).json({
                error: `Specified Assignment ${id} not found.`
            });
        }
    }

    catch (err) {
        console.log(err);

        res.status(500).json({
            error: "Error fetching assignment."
        });
    }
});

// TODO: Add authentication
router.put("/:id", async (req, res) => {
    if (validateAgainstSchema(req.body, ASSIGNMENT_SCHEMA)) {
        const assignmentUpdate = extractValidFields(req.body, ASSIGNMENT_SCHEMA);
        const id = req.params.id;

        try {
            const assignment = await getAssignmentById(id);

            if (assignment) {
                const updatedAssignment = updateAssignmentById(id, assignmentUpdate);

                res.status(200).json();
            }

            else {
                res.status(404).json({
                    error: `Specified Assignment ${id} not found.`
                });
            }
        }

        catch (err) {
            console.log(err);

            res.status(500).json({
                error: "Error updating assignment."
            });
        }
    }

    else {
        res.status(400).json({
            error: "The request body was either not present or did not contain any fields related to Assignment objects."
        });
    }
});

// TODO: Add authentication
router.delete("/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const isAssignmentDeleted = await deleteAssignmentById(id);

        if (isAssignmentDeleted) {
            const submissionsDeleted = deleteSubmissionsByAssignmentId(id);

            res.status(204).end();
        }

        else {
            res.status(404).json({
                error: `Specified Assignment ${id} not found`
            });
        }
    }

    catch (err) {
        console.log(err);

        res.status(500).json({
            error: "Error deleting assignment."
        });
    }
});

// TODO: Add authentication, pagination
router.get("/:id/submissions", async (req, res) => {
    try {
        const id = req.params.id;
        const assignment = await getAssignmentById(id);

        if (assignment) {
            const page = req.query.page || 1;
            const studentId = req.query.studentId;
            const searchFields = {
                "metadata.assignmentId": id
            };

            if (studentId)
                searchFields["metadata.studentId"] = studentId;

            const submissions = await getSubmissionsByFields(searchFields);
            const response = { submissions: [] };

            for(const submission of submissions) {
                response.submissions.push({
                    assignmentId: submission.metadata.assignmentId,
                    studentId: submission.metadata.studentId,
                    timestamp: submission.metadata.timestamp,
                    file: `/media/submissions/${submission.metadata.file}`
                });
            }

            res.status(200).json(response);
        }

        else {
            res.status(404).json({
                error: `Specified Assignment ${id} not found.`
            });
        }
    }

    catch (err) {
        console.log(err);

        res.status(500).json({
            error: "Error fetching submissions for assignment."
        });
    }
});

// TODO: Add authentication
router.post("/:id/submissions", upload.single("file"), async (req, res) => {
    if (req.file && validateAgainstSchema(req.body, SUBMISSION_SCHEMA)) {
        try {
            const id = req.params.id;
            const assignment = await getAssignmentById(id);

            if (assignment) {
                const submission = {
                    path: req.file.path,
                    filename: req.file.filename
                };

                const metadata = Object.assign(
                    {
                        contentType: req.file.mimetype,
                        file: req.file.filename
                    }, 
                    extractValidFields(req.body, SUBMISSION_SCHEMA)
                );

                const id = await saveSubmissionFile(submission, metadata);
                await removeFile(req.file.path);

                res.status(201).json();
            }

            else {
                res.status(404).json({
                    error: `Specified Assignment ${id} not found.`
                });
            }
        }

        catch (err) {
            console.log(err);

            res.status(500).json({
                error: "Error inserting submission into DB."
            });
        }
    }

    else {
        res.status(400).json({
            error: "The request body was either not present or did not contain a valid Submission object."
        });
    }
});
