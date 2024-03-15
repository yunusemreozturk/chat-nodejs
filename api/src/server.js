require("express-async-errors");
require('dotenv').config();
require('../../db/db_connection').connect();
const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const errorHandlerMiddlewares = require('../../utils/error_handler');
const Response = require("../../utils/response");
const router = require("./routes");

function createServer() {
    const app = express();

    //Middlewares
    app.use(express.json({limit: "50mb"}))
    app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit: 50000}))
    app.use(mongoSanitize({replaceWith: '_'}));

    //routes
    app.get('/welcome', (req, res) => {
        return new Response({text: 'Welcome'}).success(res);
    });

    app.use('/api', router)

    //error middleware
    app.use(errorHandlerMiddlewares);

    return app
}

module.exports = createServer