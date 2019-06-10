
const { getDBRef } = require('../lib/mongo');


/*
 * Schema for a lodging.
 */
exports.CourseSchema = {
  subject: { required: true },
  number: { required: true },
  title: { required: true },
  term: { required: true },
  instructorId: { required: true },
};

exports.getLodgingsPage = async function (page) {
  const db = getDBRef();
  const collection = db.collection('courses');
  const count = await collection.countDocuments();

  const pageSize = 10;
  const lastPage = Math.ceil(count / pageSize);
  page = page < 1 ? 1 : page;
  page = page > lastPage ? lastPage : page;
  const offset = (page - 1) * pageSize;

  const results = await collection.find({})
    .sort({ _id: 1 })
    .skip(offset)
    .limit(pageSize)
    .toArray();

  return {
    lodgings: results,
    page: page,
    totalPages: lastPage,
    pageSize: pageSize,
    count: count
  };
};

exports.insertNewCourse = async function (course) {
  const db = getDBRef();
  const collection = db.collection('courses');
  const result = await collection.insertOne(course);
  return result.insertedId;
};