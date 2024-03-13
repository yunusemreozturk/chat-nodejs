require('dotenv').config();
require('../db/db_connection').connect();
const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const path = require("path");
const {server, io, app} = require("./src/socket/socket")
const {InMemorySessionStore} = require("../utils/session_store");
const socketMiddlewares = require("./src/middlewares/socket");
const {getRooms, getUserMessages, saveRoom, saveMessage, findRoomById, findRoomOne} = require("../api/src/controller");

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

//routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/view/index.html'))
});

io.on('connection', async (socket) => {
    const accessToken = socket.accessToken;
    const sessionID = socket.sessionID;
    const user = socket.user;

    if (!accessToken) return;
    //persist session
    sessionStore.saveSession(sessionID, {
        accessToken: accessToken,
        user: user,
        connected: true,
    });

    socket.join(accessToken);

    //user'ın içinde bulunduğu odaları aldık ve yolladık
    socket.emit('rooms', await getRooms(accessToken));

    socket.on('joinRoom', async (to, type) => {
        if (!(to && type)) return;

        let room;
        if (type == 0 || type == 2) {
            room = await findRoomById(to);
        } else if (type == 1) {
            room = await findRoomOne({users: [accessToken, to], type: 1});
        }

        if (room) {
            let roomId = room.id;
            socket.join(roomId);

            let messages = await getUserMessages(roomId);

            messages.forEach((message) => {
                socket.emit('messages', message.message);
            })
        } else {
            let roomModel = await saveRoom([{"userId": to}, {"userId": accessToken}], type);

            socket.emit('rooms', await getRooms(accessToken));

            socket.join(roomModel.id);
        }
    });

    socket.on('sendMessage', async (roomId, type, msg) => {
        if (!(roomId && type && msg)) return;

        let room = await findRoomById(roomId);
        let userIds = []
        room.users.forEach((user) => {
            userIds.push(user.userId)
        });

        if (!room) return;

        await saveMessage(msg, room.id, accessToken);

        socket.to(userIds).emit('messages', msg)
    });

    socket.emit("session", sessionID);

    socket.on('disconnect', () => {
        // update the connection status of the session
        sessionStore.saveSession(sessionID, {
            accessToken: accessToken,
            user: user,
            connected: false,
        });
    });
})

server.listen(port, () => {
    console.log(`Server is running on ${process.env.URL + port}`)
})