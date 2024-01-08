'use strict'

require('dotenv').config();
require('./src/db/db_connection');
const express = require('express');
const {createServer} = require('node:http')
const {Server} = require('socket.io')
const mongoSanitize = require('express-mongo-sanitize');
const Message = require('./src/models/message.model.js')
const path = require("path");

const app = express();
const port = process.env.PORT || 5000;
const EXPRESS_SESSION_SECRET = process.env.EXPRESS_SESSION_SECRET;
const server = createServer(app)
const io = new Server(server, {
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true,
    }
});

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
    console.log('a user connected')

    //on message send
    socket.on('chat message', async (msg, clientOffset, callback) => {
        try {
            const messageModel = new Message({'message': msg, 'clientOffset': clientOffset});
            const messageSave = await messageModel.save();

            io.emit('chat message', msg, messageSave.id);

            callback();
        } catch (e) {
            console.log(`Error: chat message: ${e}`)
        }
    })

    if (!socket.recovered) {
        try {
            const serverOffset = socket.handshake.auth.serverOffset || 0;
            const messageList = await Message.find({id: {$gt: serverOffset}});

            console.log(`serverOffset: ${serverOffset}: ${messageList.length}`)

            messageList.forEach((message) => {
                socket.emit('chat message', message.message)
            })
        } catch (e) {
            console.log(`Error: socket.recovered: ${e}`)
        }
    }
})

server.listen(port, () => {
    console.log('Server is running on localhost:port:' + port)
})