const getUser = require("../utils/auth_utils");
const {UNAUTHORIZED} = require("../utils/responce_string");
const APIError = require("../utils/errors");

module.exports = async function authMiddlewares(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) throw new APIError(UNAUTHORIZED, 401);
    const [authType, authToken] = authHeader.split(' ');

    if (authType !== 'Bearer') throw new APIError(UNAUTHORIZED, 401);

    const user = await getUser(authToken);

    if (!user) throw new APIError(UNAUTHORIZED, 401);

    next();
}