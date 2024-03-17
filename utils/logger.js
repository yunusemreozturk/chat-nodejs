class Logger {
    constructor() {
    }
    static printLog = (req, res, next) => {
        console.log(`Log: ${req.originalUrl}: ${new Date().toUTCString()} : ${req.method}`)
        next();
    }
}

module.exports = Logger