require('dotenv').config();
require('./src/db/db_connection');
const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const path = require("path");
const {generalChat, connectionListener} = require("./src/controller/socket.controller");
const chatTypeEnum = require("./src/models/chat.type.enum");
const {server, io, app} = require("./src/socket/socket")
const RoomModel = require("./src/models/room.model");
const MessageModel = require("./src/models/message.model");
const {InMemorySessionStore} = require("./src/utils/session_store");
const socketMiddlewares = require("./src/middlewares/socket");

module.exports = sessionStore = new InMemorySessionStore();
const port = process.env.PORT || 5001;

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

async function getRooms(userId) {
    const privateAndGroupChats = await RoomModel.find({users: userId});
    const generalChats = await RoomModel.find({type: 0});

    return [...privateAndGroupChats, ...generalChats];
}

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

    //user'ın içinde bulunduğu odaları aldık ve yolladık
    socket.emit('rooms', await getRooms(accessToken));

    // socket.emit('users', await getUserCurrentRooms(socket));

    socket.on('joinRoom', async (to, type) => {
        if (!(to && type)) return;

        let room;
        //todo: burası kalkabilir createRoom
        if (type === 0 || type === 2) {
            room = await RoomModel.findById(to);
        } else if (type === 1) {
            room = await RoomModel.findOne({users: [accessToken, to], type: 1});
        }

        if (room) {
            let roomId = room.id;
            socket.join(roomId);

            let messages = await getUserMessage(roomId);

            messages.forEach((message) => {
                socket.emit('messages', message.message);
            })
        } else {
            let roomModel = RoomModel({
                users: [to, accessToken],
                type: type
            });
            await roomModel.save();

            socket.join(roomModel.id);

            socket.emit('rooms', await getRooms(accessToken));
        }
    });

    socket.on('sendMessage', async (to, type, msg) => {
        if (!(to && type && msg)) return;

        const room = await RoomModel.findOne({users: [accessToken, to], type: type});
        if (!room) return;

        const messageModel = MessageModel({
            'message': msg,
            'roomId': room.id,
            'userToken': accessToken,
        })
        await messageModel.save();

        socket.emit('messages', msg)
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