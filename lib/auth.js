const { getUserById } =  require('../models/user');
const jwt = require('jsonwebtoken');
const secretKey = 'MySuperDuperSecretKeyFamShhhhh';

function generateAuthToken(userId) {
    const payload = { sub: userId };

    return jwt.sign(payload, secretKey, { expiresIn: '24h' });
}
exports.generateAuthToken = generateAuthToken;

async function getTokenData(req) {
    const authHeader = req.get("Authorization") || "";
    const authHeaderParts = authHeader.split(" ");
    const token = authHeaderParts[0] === "Bearer" ? authHeaderParts[1] : null;

    try {
        const payload = jwt.verify(token, secretKey);
        let data = {
            userId: payload.sub,
            userIsAdmin: false
        };

        const user = await getUserById(data.userId);

        if (user)
            data.userIsAdmin = user.admin;

        return data;
    }

    catch (err) {
        console.error(" -- Error:", err);
        return null;
    }
}
exports.getTokenData = getTokenData;

async function requireAuthentication(req, res, next) {
    const authHeader = req.get("Authorization") || "";
    const authHeaderParts = authHeader.split(" ");
    const token = authHeaderParts[0] === "Bearer" ? authHeaderParts[1] : null;

    try {
        const payload = jwt.verify(token, secretKey);
        req.userId = payload.sub;
        req.userIsAdmin = false;

        const user = await getUserById(req.userId);

        if (user)
            req.userIsAdmin = user.admin;

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
