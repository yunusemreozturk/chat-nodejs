'use strict'

require('dotenv').config();
require('./src/db/db_connection');
const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const path = require("path");
const {generalChat, connectionListener} = require("./src/controller/socket.controller");
const chatTypeEnum = require("./src/models/chat.type.enum");
const {server, io, app} = require("./src/socket/socket")
const getUser = require("./src/utils/auth_utils");

const port = process.env.PORT || 5001;


//Middlewares
app.use(express.json({limit: "50mb"}))
app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit: 50000}))
app.use(mongoSanitize({replaceWith: '_'}));
app.use(express.static(path.join(__dirname, "public")))
app.use(express.static(__dirname + '/public'));

//routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/view/index.html'))
});

const {InMemorySessionStore} = require("./src/utils/session_store");
const sessionStore = new InMemorySessionStore();
const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");

io.use(async (socket, next) => {
    const sessionID = socket.handshake.headers.session_id;
    const accessToken = socket.handshake.headers.access_token;

    if (sessionID) {
        const session = sessionStore.findSession(sessionID);

        if (session) {
            socket.sessionID = sessionID;
            socket.accessToken = session.accessToken;
            socket.user = session.user;

            return next();
        }
    }

    if (!accessToken) {
        return next(new Error("invalid accessToken"));
    }

    // create new session
    socket.sessionID = randomId();
    socket.accessToken = accessToken;
    socket.user = await getUser(accessToken);

    next();
});

io.on('connection', async (socket) => {
    const accessToken = socket.accessToken;
    const sessionID = socket.sessionID;
    const user = socket.user;

    //persist session
    sessionStore.saveSession(sessionID, {
        accessToken: accessToken,
        user: user,
        connected: true,
    });

    if (accessToken) {
        socket.on(chatTypeEnum.GENERAL, (msg) => generalChat(socket, msg, accessToken));

        socket.emit("session", sessionID);

        socket.broadcast.emit('user connected', user.data);

        socket.on('disconnect', () => {
            socket.broadcast.emit('user disconnect', user.data);

            // update the connection status of the session
            sessionStore.saveSession(sessionID, {
                accessToken: accessToken,
                user: user,
                connected: false,
            });
        });

        await connectionListener(socket);
    }
})

server.listen(port, () => {
    console.log(`Server is running on ${process.env.URL + port}`)
})