class APIError extends Error {
    constructor(apiCode, statusCode) {
        super(apiCode);
        this.statusCode = statusCode || 400
    }
}

module.exports = APIError