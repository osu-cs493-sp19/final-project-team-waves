/*
 * Photo schema and data accessor methods.
 */

const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');

/*
 * Schema describing required/optional fields of a photo object.
 */
const PhotoSchema = {
  userid: { required: true },
  businessid: { required: true },
  caption: { required: false }
};
exports.PhotoSchema = PhotoSchema;

/*
 * Executes a MySQL query to insert a new photo into the database.  Returns
 * a Promise that resolves to the ID of the newly-created photo entry.
 */
function insertNewPhoto(photo) {
  return new Promise((resolve, reject) => {
    photo = extractValidFields(photo, PhotoSchema);
    photo.id = null;
    mysqlPool.query(
      'INSERT INTO photos SET ?',
      photo,
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
exports.insertNewPhoto = insertNewPhoto;

/*
 * Executes a MySQL query to fetch a single specified photo based on its ID.
 * Returns a Promise that resolves to an object containing the requested
 * photo.  If no photo with the specified ID exists, the returned Promise
 * will resolve to null.
 */
function getPhotoById(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM photos WHERE id = ?',
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
exports.getPhotoById = getPhotoById;

/*
 * Executes a MySQL query to replace a specified photo with new data.
 * Returns a Promise that resolves to true if the photo specified by
 * `id` existed and was successfully updated or to false otherwise.
 */
function replacePhotoById(id, photo) {
  return new Promise((resolve, reject) => {
    photo = extractValidFields(photo, PhotoSchema);
    mysqlPool.query(
      'UPDATE photos SET ? WHERE id = ?',
      [ photo, id ],
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
exports.replacePhotoById = replacePhotoById;

/*
 * Executes a MySQL query to delete a photo specified by its ID.  Returns
 * a Promise that resolves to true if the photo specified by `id`
 * existed and was successfully deleted or to false otherwise.
 */
function deletePhotoById(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'DELETE FROM photos WHERE id = ?',
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
exports.deletePhotoById = deletePhotoById;

/*
 * Executes a MySQL query to fetch all photos for a specified business, based
 * on the business's ID.  Returns a Promise that resolves to an array
 * containing the requested photos.  This array could be empty if the
 * specified business does not have any photos.  This function does not verify
 * that the specified business ID corresponds to a valid business.
 */
function getPhotosByBusinessId(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM photos WHERE businessid = ?',
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
exports.getPhotosByBusinessId = getPhotosByBusinessId;

/*
 * Executes a MySQL query to fetch all photos by a specified user, based on
 * on the user's ID.  Returns a Promise that resolves to an array containing
 * the requested photos.  This array could be empty if the specified user
 * does not have any photos.  This function does not verify that the specified
 * user ID corresponds to a valid user.
 */
function getPhotosByUserId(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM photos WHERE userid = ?',
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
exports.getPhotosByUserId = getPhotosByUserId;
