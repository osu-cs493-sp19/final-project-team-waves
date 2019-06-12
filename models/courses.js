
const { getDBRef, createObjectId } = require('../lib/mongo');


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

//receives courseId, returns instructorID of that course
exports.getInstructorIdOfCourse  = async function (id){
  console.log("getting instructorID of course with id = ", id)
  const db = getDBRef();
  const collection = db.collection('courses')
  //get all courses with that courseid
  const results =  await collection.find({ _id: createObjectId(id) }).toArray();
  //const all_results = await collection.find({ }).toArray();

  return String(results[0]['instructorId'])
}

exports.insertNewCourse = async function (course) {
  const db = getDBRef();
  const collection = db.collection('courses');
  const result = await collection.insertOne(course);
  return result.insertedId;
};

exports.getCourseById = async function (id) {
  const db = getDBRef();
  const collection = db.collection('courses')
  const results =  await collection
      .find({ _id: createObjectId(id) })
      .toArray();
  return results[0]
}

exports.deleteCourseById = async function (id) {
  const db = getDBRef();
  const collection = db.collection('courses')
  const result = await collection.deleteOne({
    _id: createObjectId(id)
  })
  return result.deletedCount
}

exports.updateCourseById = async function (id, freshCourse) {
  const db = getDBRef();
  const collection = db.collection('courses')
  const result =  await collection
      .findAndModify({ _id: createObjectId(id)}, {$update: freshCourse }, freshCourse)
      console.log(result)
  return result.matchedCount
}
