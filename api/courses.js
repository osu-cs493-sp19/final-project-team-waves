
/*
 * API sub-router for courses collection endpoints.
 */

const router = require('express').Router();

router.get('/', (req, res, next) => {
    try {
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