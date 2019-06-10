/*
 * User schema and data accessor methods.
 */

const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const { extractValidFields } = require('../lib/validation');
const { getDBRef } = require('../lib/mongo');

/*
 * Schema for a User.
 */
const UserSchema = {
  name: { required: true },
  email: { required: true },
  password: { required: true },
  role: { required: true }
};
exports.UserSchema = UserSchema;


/*
 * Insert a new User into the DB.
 */
exports.insertNewUser = async function (user) {
  const userToInsert = extractValidFields(user, UserSchema);
  const db = getDBRef();
  const collection = db.collection('users');

  const passwordHash = await bcrypt.hash(userToInsert.password, 8);
  userToInsert.password = passwordHash;

  const result = await collection.insertOne(userToInsert);
  return result.insertedId;
};


/*
 * Fetch a user from the DB based on user ID.
 */
async function getUserById(id, includePassword) {
  const db = getDBRef();
  const collection = db.collection('users');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const projection = includePassword ? {} : { password: 0 };
    const results = await collection
      .find({ _id: new ObjectId(id) })
      .project(projection)
      .toArray();
    return results[0];
  }
};
exports.getUserById = getUserById;

/*
 * Fetch a user from the DB based on user ID.
 */
async function getUserByEmail(emailInput, includePassword) {
  const db = getDBRef();
  const collection = db.collection('users');
  //if (!ObjectId.isValid(id)) {
  //  return null;
  //} else {
    const projection = includePassword ? {} : { password: 0 };
    const results = await collection
      .find({ email: emailInput })
      .project(projection)
      .toArray();
    return results[0];
  //}
};
exports.getUserByEmail = getUserByEmail;


//exports.validateUser = async function (id, password) {
exports.validateUser = async function (email, password) {
  //const user = await getUserById(id, true);
  const user = await getUserByEmail(email, true);
  const authenticated = user && await bcrypt.compare(password, user.password);
  return authenticated;
};
