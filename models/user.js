/*
* User schema and data accessor methods.
*/

const bcrypt = require('bcryptjs');

const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');

/*
* Schema describing required/optional fields of a photo object.
*/
const UserSchema = {
    name: { required: true },
    email: { required: true },
    password: { required: true },
    admin: { required: true }
};
exports.UserSchema = UserSchema;

/*
* Executes a MySQL query to insert a new user into the database. Returns a
* Promise that resolves to the ID of the newly-created user entry.
*/
function insertNewUser(user) {
    return new Promise(async (res, rej) => {
        user = extractValidFields(user, UserSchema);
        user.id = null;

        const passwordHash = await bcrypt.hash(user.password, 8);
        user.password = passwordHash;

        mysqlPool.query(
            'INSERT INTO users SET ?',
            user,
            (err, result) => {
                if (err)
                    rej(err);

                else
                    res(result.insertId);
            }
        );
    });
}
exports.insertNewUser = insertNewUser;

/*
 * Fetch a user from the DB based on user ID.
 */
async function getUserById(id, includePassword) {
    return new Promise((res, rej) => {
        let userFields = 'id, name, email, admin';

        if (includePassword)
            userFields += ', password';

        mysqlPool.query(
            `SELECT ${userFields} FROM users WHERE id = ${id}`,
            (err, results) => {
                if (err)
                    rej(err);

                else
                    res(results[0]);
            }
        );
    });
}
exports.getUserById = getUserById;

/*
 * Fetch a user from the DB based on user email.
 */
async function getUserByEmail(email, includePassword) {
    return new Promise((res, rej) => {
        let userFields = 'id, name, email, admin';

        if (includePassword)
            userFields += ', password';

        mysqlPool.query(
            `SELECT ${userFields} FROM users WHERE email = "${email}"`,
            (err, results) => {
                if (err)
                    rej(err);

                else
                    res(results[0]);
            }
        );
    });
}
exports.getUserByEmail = getUserByEmail;

/*
 * Checks a user with the email and password exist.
 */
async function validateUser(email, password) {
    const user = await getUserByEmail(email, true);
    const authenticated = user && await bcrypt.compare(password, user.password);

    return authenticated;
}
exports.validateUser = validateUser;
