const jwt = require("jsonwebtoken")
const APIError = require("../../../utils/errors");
const user = require("../models/user.model");
const {INVALID_SESSION, USER_CREATE_SUCCESS} = require("../../../utils/response_string");
const Response = require("../../../utils/response");
const JWTSecret = process.env.JWT_SECRET_KEY;

const createToken = async (userInfo, res) => {
    const payload = {
        sub: userInfo._id,
        name: userInfo.email
    }

    const token = await jwt.sign(payload, JWTSecret, {
        algorithm: 'HS512',
        expiresIn: process.env.JWT_EXPIRES_IN,

    })

    return new Response({'access_token': token}).success(res);
}

const tokenCheck = async (req, res, next) => {
    const headerToken = req.headers.authorization && req.headers.authorization.startsWith("Bearer ");

    if (!headerToken) throw new APIError(INVALID_SESSION, 401);

    const token = req.headers.authorization.split(" ")[1]

    const userInfo = await userFromToken(token);

    next();

    return userInfo;
}

const userFromToken = async (token) => {
    let userInfo;

    await jwt.verify(token, JWTSecret, async (err, decoded) => {
        if (err) throw new APIError(INVALID_SESSION, 401)

        userInfo = await user.findById(decoded.sub)

        if (!userInfo) throw new APIError(INVALID_SESSION, 401)
    })

    return userInfo;
}

module.exports = {
    createToken,
    tokenCheck,
    userFromToken,
}