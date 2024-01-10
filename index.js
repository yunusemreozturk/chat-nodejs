'use strict'

require('dotenv').config();
require('./src/db/db_connection');
const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const path = require("path");
const {generalChatListener, connectionListener} = require("./src/controller/socket.controller");
const chatTypeEnum = require("./src/models/chat.type.enum");
const {server, io, app} = require("./src/socket/socket")

const port = process.env.PORT || 5001;

//Middlewares
app.use(express.json({limit: "50mb"}))
app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit: 50000}))
app.use(mongoSanitize({replaceWith: '_'}));
app.use(express.static(path.join(__dirname, "public")))


//routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/view/index.html'))
});
io.on('connection', async (socket) => {
    socket.on(chatTypeEnum.GENERAL, generalChatListener)

    await connectionListener(socket)
})

server.listen(port, () => {
    console.log(`Server is running on ${process.env.URL + port}`)
})