const { getUserByEmail } =  require('../models/user');
const jwt = require('jsonwebtoken');
const secretKey = 'MySuperDuperSecretKeyFamShhhhh';

function generateAuthToken(userEmail) {
    const payload = { sub: userEmail };

    return jwt.sign(payload, secretKey, { expiresIn: '24h' });
}
exports.generateAuthToken = generateAuthToken;

async function requireAuthentication(req, res, next) {
    const authHeader = req.get("Authorization") || "";
    const authHeaderParts = authHeader.split(" ");
    const token = authHeaderParts[0] === "Bearer" ? authHeaderParts[1] : null;

    try {
        const payload = jwt.verify(token, secretKey);
        const user = await getUserByEmail(payload.sub);

        req.userId = user._id.toString();
        req.userIsAdmin = false;
        req.userIsInstructor = false;
        req.userIsStudent = false;
        req.role = user.role;

        if (req.role === "admin")
            req.userIsAdmin = true;

        else if (req.role === "instructor")
            req.userIsInstructor = true;

        else if (req.role === "student")
            req.userIsStudent = true;

        next();
    }

    catch (err) {
        console.error(" -- Error:", err);

        res.status(401).send({
            error: "Invalid authentication token provided"
        });
    }
}
exports.requireAuthentication = requireAuthentication;
