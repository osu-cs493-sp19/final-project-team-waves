/*
 * Review schema and data accessor methods.
 */

const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');

/*
 * Schema describing required/optional fields of a review object.
 */
const ReviewSchema = {
  userid: { required: true },
  businessid: { required: true },
  dollars: { required: true },
  stars: { required: true },
  review: { required: false }
};
exports.ReviewSchema = ReviewSchema;


/*
 * Executes a MySQL query to verfy whether a given user has already reviewed
 * a specified business.  Returns a Promise that resolves to true if the
 * specified user has already reviewed the specified business or false
 * otherwise.
 */
function hasUserReviewedBusiness(userid, businessid) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT COUNT(*) AS count FROM reviews WHERE userid = ? AND businessid = ?',
      [ userid, businessid ],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0].count > 0);
        }
      }
    );
  });
}
exports.hasUserReviewedBusiness = hasUserReviewedBusiness;

/*
 * Executes a MySQL query to insert a new review into the database.  Returns
 * a Promise that resolves to the ID of the newly-created review entry.
 */
function insertNewReview(review) {
  return new Promise((resolve, reject) => {
    review = extractValidFields(review, ReviewSchema);
    review.id = null;
    mysqlPool.query(
      'INSERT INTO reviews SET ?',
      review,
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.insertId);
        }
      }
    );
  });
}
exports.insertNewReview = insertNewReview;

/*
 * Executes a MySQL query to fetch a single specified review based on its ID.
 * Returns a Promise that resolves to an object containing the requested
 * review.  If no review with the specified ID exists, the returned Promise
 * will resolve to null.
 */
function getReviewById(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM reviews WHERE id = ?',
      [ id ],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      }
    );
  });
}
exports.getReviewById = getReviewById;

/*
 * Executes a MySQL query to replace a specified review with new data.
 * Returns a Promise that resolves to true if the review specified by
 * `id` existed and was successfully updated or to false otherwise.
 */
function replaceReviewById(id, review) {
  return new Promise((resolve, reject) => {
    review = extractValidFields(review, ReviewSchema);
    mysqlPool.query(
      'UPDATE reviews SET ? WHERE id = ?',
      [ review, id ],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.affectedRows > 0);
        }
      }
    );
  });
}
exports.replaceReviewById = replaceReviewById;

/*
 * Executes a MySQL query to delete a review specified by its ID.  Returns
 * a Promise that resolves to true if the review specified by `id`
 * existed and was successfully deleted or to false otherwise.
 */
function deleteReviewById(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'DELETE FROM reviews WHERE id = ?',
      [ id ],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.affectedRows > 0);
        }
      }
    );
  });
}
exports.deleteReviewById = deleteReviewById;

/*
 * Executes a MySQL query to fetch all reviews for a specified business, based
 * on the business's ID.  Returns a Promise that resolves to an array
 * containing the requested reviews.  This array could be empty if the
 * specified business does not have any reviews.  This function does not verify
 * that the specified business ID corresponds to a valid business.
 */
function getReviewsByBusinessId(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM reviews WHERE businessid = ?',
      [ id ],
      function (err, results) {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      }
    );
  });
}
exports.getReviewsByBusinessId = getReviewsByBusinessId;

/*
 * Executes a MySQL query to fetch all reviews by a specified user, based on
 * on the user's ID.  Returns a Promise that resolves to an array containing
 * the requested reviews.  This array could be empty if the specified user
 * does not have any reviews.  This function does not verify that the specified
 * user ID corresponds to a valid user.
 */
function getReviewsByUserId(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM reviews WHERE userid = ?',
      [ id ],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      }
    );
  });
}
exports.getReviewsByUserId = getReviewsByUserId;
