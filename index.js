'use strict'

require('dotenv').config();
require('./src/db/db_connection');
const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const path = require("path");
const {generalChatListener, connectionListener} = require("./src/controller/socket.controller");
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

io.use((socket, next) => {
    console.log('#1')
    const sessionID = socket.handshake.headers.session_id;
    const accessToken = socket.handshake.headers.access_token;

    if (sessionID) {
        console.log('#2')

        const session = sessionStore.findSession(sessionID);
        if (session) {
            console.log('#3')

            socket.sessionID = sessionID;
            socket.accessToken = session.accessToken;

            return next();
        }
    }

    if (!accessToken) {
        console.log('#4')

        return next(new Error("invalid accessToken"));
    }


    console.log('#5')

    // create new session
    socket.sessionID = randomId();
    socket.accessToken = accessToken;

    next();
});

io.on('connection', async (socket) => {
    const accessToken = socket.accessToken;
    const sessionID = socket.sessionID;

    //persist session
    sessionStore.saveSession(sessionID, {
        accessToken: accessToken,
        connected: true,
    });

    if (accessToken) {
        const user = await getUser(accessToken);

        socket.on(chatTypeEnum.GENERAL, (msg) => generalChatListener(msg, accessToken));

        socket.emit("session", sessionID);

        socket.broadcast.emit('user connected', user.data);

        socket.on('disconnect', () => {
            socket.broadcast.emit('user disconnect', user.data);

            // update the connection status of the session
            sessionStore.saveSession(sessionID, {
                accessToken: accessToken,
                connected: false,
            });
        });

        await connectionListener(socket)
    }
})

server.listen(port, () => {
    console.log(`Server is running on ${process.env.URL + port}`)
})