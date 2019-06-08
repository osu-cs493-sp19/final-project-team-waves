const router = require("express").Router();
const { validateAgainstSchema, extractValidFields } = require("../lib/validation");

const {
    ASSIGNMENT_SCHEMA,
    insertAssignment,
    getAssignmentById,
    updateAssignmentById,
    deleteAssignmentById
} = require("../models/assignment");

exports.router = router;

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

// TODO: Add authentication and remove all submissions for assignment
router.delete("/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const isAssignmentDeleted = await deleteAssignmentById(id);

        if (isAssignmentDeleted)
            res.status(204).end();

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
