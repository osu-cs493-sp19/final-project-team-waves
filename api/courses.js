
/*
 * API sub-router for courses collection endpoints.
 */

const router = require('express').Router();

const { getDBRef } = require('../lib/mongo');

const { validateAgainstSchema } = require('../lib/validation')

const { CourseSchema, insertNewCourse, getCourseById, deleteCourseById, updateCourseById } = require('../models/courses')

const { getEnrollmentsByFields, insertEnrollment } = require('../models/enrollments')

const { getAssignmentsByCourseId } = require('../models/assignment')

const Json2csvParser = require('json2csv').Parser;

router.get('/', async (req, res, next) => {
    try {
        const db = getDBRef();
        const collection = db.collection('courses');
        let count = 0;
        collection.count({}).then(function (val) {
            count = val
        });
        const pageSize = 20;
        /*
        * Compute page number based on optional query string parameter `page`.
        * Make sure page is within allowed bounds.
        */
        let page = parseInt(req.query.page) || 1;
        const numPerPage = 10;
        const lastPage = Math.ceil(count / numPerPage);
        page = page < 1 ? 1 : page;
        page = page > lastPage ? lastPage : page;

        /*
         * Calculate starting and ending indices of courses on requested page and
         * slice out the corresponsing sub-array of courses.
         */
        const start = (page - 1) * numPerPage;
        const end = start + numPerPage;
        const pageCourses = await collection.find({})
            .sort({ _id: 1 })
            .skip(lastPage)
            .limit(numPerPage)
            .toArray();

        /*
        * Generate HATEOAS links for surrounding pages.
        */
        const links = {};
        if (page < lastPage) {
            links.nextPage = `/courses?page=${page + 1}`;
            links.lastPage = `/courses?page=${lastPage}`;
        }
        if (page > 1) {
            links.prevPage = `/courses?page=${page - 1}`;
            links.firstPage = '/courses?page=1';
        }

        /*
        * Construct and send response.
        */
        res.status(200).json({
            courses: pageCourses,
            pageNumber: page,
            totalPages: lastPage,
            pageSize: numPerPage,
            totalCount: count,
            links: links
        });

        res.status(200).send();
    } catch (err) {
        next(err);
    }
})

router.post('/', async (req, res, next) => {
    if (validateAgainstSchema(req.body, CourseSchema)) {
        try {
          const id = await insertNewCourse(req.body);
          res.status(201).send({
            id: id
          });
        } catch (err) {
          console.error(err);
          res.status(500).send({
            error: "Failed to insert lodging.  Try again later."
          });
        }
      } else {
        res.status(400).send({
          err: "Request body does not contain a valid Course."
        });
      }
})

router.get('/:id', async (req, res, next) => {
    try {
        const courseId = req.params.id
        const course = await getCourseById(courseId)
        res.status(200).json(course);
    } catch (err) {
        next(err);
    }
})

router.patch('/:id', async (req, res, next) => {
    try {
    if (validateAgainstSchema(req.body, CourseSchema)) {

        const result = await updateCourseById(req.params.id, req.body)
        if (result === 1)
            res.status(200).send();
        else
            res.status(400).send()
    }
    } catch (err) {
        next(err);
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const result = await deleteCourseById(req.params.id)
        if (result === 1)
            res.status(204).json({"success": true});
        else
            res.status(400).send()
    } catch (err) {
        next(err);
    }
})

router.get('/:id/students', async (req, res, next) => {
    try {
        const result = await getEnrollmentsByFields({ courseId: req.params.id })
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
})

router.post('/:id/students', async (req, res, next) => {
    try {
        const insertedId = await insertEnrollment(req.params.id)
        res.status(201).send({
            id: insertedId
          });
    } catch (err) {
        next(err);
    }
})

router.post('/:id/roster', async (req, res, next) => {
    try {
        let fields = ["UserId"]
        const retval = await getEnrollmentsByFields({ courseId: req.params.id })

        const json2csvParser = new Json2csvParser({ fields });
        const result = json2csvParser.parse(retval);

        fs.writeFile("localPath/test.csv", [result], "utf8", function (err) {
            if (err) {
                console.log('Some error occured - file either not saved or corrupted file saved.');
            } else{
                console.log('It\'s saved!');
            }
        });

        // var filePath = path.join('localPath/test.csv');
        var stat = fileSystem.statSync('localPath/test.csv');
    
        response.writeHead(200, {
            'Content-Type': 'text/csv',
            'Content-Length': stat.size
        });
    
        var readStream = fileSystem.createReadStream('localPath/test.csv');

        readStream.pipe(response);
        res.status(200).send();
    } catch (err) {
        next(err);
    }
})

router.post('/:id/assignments', async (req, res, next) => {
    try {
        const result = await getAssignmentsByCourseId(req.params.id)
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
})

module.exports = router
