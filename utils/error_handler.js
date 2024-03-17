const APIError = require("../utils/errors")
const {CHECK_YOUR_API} = require("./response_string");

const errorHandlerMiddlewares = (err, req, res, next) => {
    if (err instanceof APIError) {
        return res.status(err.statusCode || 400).json({
            success: false,
            code: parseInt(err.message)
        })
    }
    console.log('error: ', err);
    return res.status(500).json({
        success: false,
        code: CHECK_YOUR_API,
    })
}

module.exports = errorHandlerMiddlewares