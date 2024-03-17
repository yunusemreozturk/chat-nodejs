require('dotenv').config();
require('../../db/db_connection').connect();
const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const path = require("path");
const {io, app} = require("./../src/socket/socket")
const {InMemorySessionStore} = require("../../utils/session_store");
const socketMiddlewares = require("./../src/middlewares/socket");
const {getRooms} = require("../../chat_api/src/controller/room.controller");
const {joinRoom, sendMessage, disconnect} = require("./../src/controller");
const SocketEvents = require("./../src/socket/socket_events");

function createApp() {
    const sessionStore = new InMemorySessionStore();

    //Middlewares
    app.use(express.json({limit: "50mb"}))
    app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit: 50000}))
    app.use(mongoSanitize({replaceWith: '_'}));
    //socket middlewares
    io.use(socketMiddlewares);

    //routes - for test
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '/public/view/index.html'))
    });

    io.on('connection', async (socket) => {
        const accessToken = socket.accessToken;
        const sessionID = socket.sessionID;

        if (!accessToken) return;
        //persist session
        sessionStore.saveSession(sessionID, {
            accessToken: accessToken,
            user: socket.user,
            connected: true,
        });

        socket.join(accessToken);

        socket.on(SocketEvents.JoinRoom, (to, type) => joinRoom(socket, to, type));
        socket.on(SocketEvents.SendMessage, (roomId, type, msg) => sendMessage(socket, roomId, type, msg));
        socket.on(SocketEvents.Disconnect, disconnect);

        //user'ın içinde bulunduğu odaları aldık ve yolladık
        socket.emit(SocketEvents.Rooms, await getRooms(accessToken));
        socket.emit(SocketEvents.Session, sessionID);
    })

    return app
}

module.exports = createApp