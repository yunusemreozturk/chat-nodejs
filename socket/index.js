require('dotenv').config();
require('../db/db_connection').connect();
const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const path = require("path");
const {server, io, app} = require("./src/socket/socket")
const {InMemorySessionStore} = require("../utils/session_store");
const socketMiddlewares = require("./src/middlewares/socket");
const {getRooms, getUserMessages, saveRoom, saveMessage, findRoomById, findRoomOne} = require("../api/src/controller");
const {joinRoom, sendMessage, disconnect} = require("./src/controller");

module.exports = sessionStore = new InMemorySessionStore();
const port = process.env.PORT_SOCKET;

//Middlewares
app.use(express.json({limit: "50mb"}))
app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit: 50000}))
app.use(mongoSanitize({replaceWith: '_'}));
app.use(express.static(path.join(__dirname, "public")))
app.use(express.static(__dirname + '/public'));
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

    socket.on('joinRoom', (to, type) => joinRoom(socket, to, type));
    socket.on('sendMessage', (roomId, type, msg) => sendMessage(socket, roomId, type, msg));
    socket.on('disconnect', disconnect);

    //user'ın içinde bulunduğu odaları aldık ve yolladık
    socket.emit('rooms', await getRooms(accessToken));
    socket.emit("session", sessionID);
})

server.listen(port, () => {
    console.log(`Server is running on ${process.env.URL + port}`)
})