require("express-async-errors");
require('dotenv').config();
require('../../db/db_connection').connect();
const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const errorHandlerMiddlewares = require('../../utils/error_handler');
const Response = require("../../utils/response");
const router = require("./routes");
const authMiddlewares = require('../../middlewares/auth.middlewares')
const {printLog} = require("../../utils/logger");
const {WELCOME} = require("../../utils/response_string");

function createApp() {
    const app = express();

    //Middlewares
    app.use(express.json({limit: "50mb"}))
    app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit: 50000}))
    app.use(mongoSanitize({replaceWith: '_'}));
    app.use("public/uploads", express.static(__dirname))
    app.use(express.static("public/view"));
    app.use(printLog);

    //routes
    app.get('/welcome', (req, res) => {
        return new Response({text: res.__(WELCOME)}).success(res);
    });
    app.use('/api', router)

    //error middleware
    app.use(errorHandlerMiddlewares);

    return app
}

module.exports = createApp