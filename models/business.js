/*
 * Business schema and data accessor methods;
 */

const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');
const { getReviewsByBusinessId } = require('./review');
const { getPhotosByBusinessId } = require('./photo');

/*
 * Schema describing required/optional fields of a business object.
 */
const BusinessSchema = {
  name: { required: true },
  address: { required: true },
  city: { required: true },
  state: { required: true },
  zip: { required: true },
  phone: { required: true },
  category: { required: true },
  subcategory: { required: true },
  website: { required: false },
  email: { required: false },
  ownerid: { required: true }
};
exports.BusinessSchema = BusinessSchema;


/*
 * Executes a MySQL query to fetch the total number of businesses.  Returns
 * a Promise that resolves to this count.
 */
function getBusinessesCount() {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT COUNT(*) AS count FROM businesses',
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0].count);
        }
      }
    );
  });
}

/*
 * Executes a MySQL query to return a single page of businesses.  Returns a
 * Promise that resolves to an array containing the fetched page of businesses.
 */
function getBusinessesPage(page) {
  return new Promise(async (resolve, reject) => {
    /*
     * Compute last page number and make sure page is within allowed bounds.
     * Compute offset into collection.
     */
     const count = await getBusinessesCount();
     const pageSize = 10;
     const lastPage = Math.ceil(count / pageSize);
     page = page > lastPage ? lastPage : page;
     page = page < 1 ? 1 : page;
     const offset = (page - 1) * pageSize;

    mysqlPool.query(
      'SELECT * FROM businesses ORDER BY id LIMIT ?,?',
      [ offset, pageSize ],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            businesses: results,
            page: page,
            totalPages: lastPage,
            pageSize: pageSize,
            count: count
          });
        }
      }
    );
  });
}
exports.getBusinessesPage = getBusinessesPage;

/*
 * Executes a MySQL query to insert a new business into the database.  Returns
 * a Promise that resolves to the ID of the newly-created business entry.
 */
function insertNewBusiness(business) {
  return new Promise((resolve, reject) => {
    business = extractValidFields(business, BusinessSchema);
    business.id = null;
    mysqlPool.query(
      'INSERT INTO businesses SET ?',
      business,
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
exports.insertNewBusiness = insertNewBusiness;

/*
 * Executes a MySQL query to fetch information about a single specified
 * business based on its ID.  Does not fetch photo and review data for the
 * business.  Returns a Promise that resolves to an object containing
 * information about the requested business.  If no business with the
 * specified ID exists, the returned Promise will resolve to null.
 */
function getBusinessById(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM businesses WHERE id = ?',
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
exports.getBusinessById = getBusinessById;

/*
 * Executes a MySQL query to fetch detailed information about a single
 * specified business based on its ID, including photo and review data for
 * the business.  Returns a Promise that resolves to an object containing
 * information about the requested business.  If no business with the
 * specified ID exists, the returned Promise will resolve to null.
 */
async function getBusinessDetailsById(id) {
  /*
   * Execute three sequential queries to get all of the info about the
   * specified business, including its reviews and photos.
   */
  const business = await getBusinessById(id);
  if (business) {
    business.reviews = await getReviewsByBusinessId(id);
    business.photos = await getPhotosByBusinessId(id);
  }
  return business;
}
exports.getBusinessDetailsById = getBusinessDetailsById;

/*
 * Executes a MySQL query to replace a specified business with new data.
 * Returns a Promise that resolves to true if the business specified by
 * `id` existed and was successfully updated or to false otherwise.
 */
function replaceBusinessById(id, business) {
  return new Promise((resolve, reject) => {
    business = extractValidFields(business, BusinessSchema);
    mysqlPool.query(
      'UPDATE businesses SET ? WHERE id = ?',
      [ business, id ],
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
exports.replaceBusinessById = replaceBusinessById;

/*
 * Executes a MySQL query to delete a business specified by its ID.  Returns
 * a Promise that resolves to true if the business specified by `id` existed
 * and was successfully deleted or to false otherwise.
 */
function deleteBusinessById(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'DELETE FROM businesses WHERE id = ?',
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
exports.deleteBusinessById = deleteBusinessById;

/*
 * Executes a MySQL query to fetch all businesses owned by a specified user,
 * based on on the user's ID.  Returns a Promise that resolves to an array
 * containing the requested businesses.  This array could be empty if the
 * specified user does not own any businesses.  This function does not verify
 * that the specified user ID corresponds to a valid user.
 */
function getBusinessesByOwnerId(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM businesses WHERE ownerid = ?',
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
exports.getBusinessesByOwnerId = getBusinessesByOwnerId;
