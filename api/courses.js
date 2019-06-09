
/*
 * API sub-router for courses collection endpoints.
 */

const router = require('express').Router();

const { getDBRef } = require('../lib/mongo');

router.get('/', (req, res, next) => {
    console.log("GET courses/")
    try {
        const db = getDBRef();
        console.log("db", db)
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
        const pageCourses = collection.find({})
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

router.post('/', (req, res, next) => {
    try {
        res.status(200).send();
    } catch (err) {
        next(err);
    }
})

router.get('/:id', (req, res, next) => {
    try {
        res.status(200).send();
    } catch (err) {
        next(err);
    }
})

router.patch('/:id', (req, res, next) => {
    try {
        res.status(200).send();
    } catch (err) {
        next(err);
    }
})

router.delete('/:id', (req, res, next) => {
    try {
        res.status(200).send();
    } catch (err) {
        next(err);
    }
})

router.get('/:id/students', (req, res, next) => {
    try {
        res.status(200).send();
    } catch (err) {
        next(err);
    }
})

router.post('/:id/students', (req, res, next) => {
    try {
        res.status(200).send();
    } catch (err) {
        next(err);
    }
})

router.post('/:id/roster', (req, res, next) => {
    try {
        res.status(200).send();
    } catch (err) {
        next(err);
    }
})

router.post('/:id/assignments', (req, res, next) => {
    try {
        res.status(200).send();
    } catch (err) {
        next(err);
    }
})

module.exports = router