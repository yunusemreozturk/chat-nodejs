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

async function getRooms(roomIds) {
    var roomModel = await RoomModel.find({users: roomIds});

    return JSON.stringify(roomModel);
}

async function getUserMessage(roomId) {
    return MessageModel.find({roomId: roomId});
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
        const room = await RoomModel.findOne({users: [accessToken, to], type: type});

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
        }
    });

    //todo: kullanıcının ilk mesajda odaya join'leme işlemini sendMessage'da halledelim
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
    })

    // socket.on(chatTypeEnum.GENERAL, (msg) => generalChat(socket, msg, accessToken));
    //
    // socket.emit("session", sessionID);
    //
    // // socket.broadcast.emit('user connected', user.data);
    //
    // socket.on('disconnect', () => {
    //     // socket.broadcast.emit('user disconnect', user.data);
    //
    //     // update the connection status of the session
    //     sessionStore.saveSession(sessionID, {
    //         accessToken: accessToken,
    //         user: user,
    //         connected: false,
    //     });
    // });
    //
    // await connectionListener(socket);

})

server.listen(port, () => {
    console.log(`Server is running on ${process.env.URL + port}`)
})