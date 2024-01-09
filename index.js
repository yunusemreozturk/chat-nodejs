'use strict'

require('dotenv').config();
require('./src/db/db_connection');
const express = require('express');
const {createServer} = require('node:http')
const {Server} = require('socket.io')
const mongoSanitize = require('express-mongo-sanitize');
const Message = require('./src/models/message.model.js')
const Room = require('./src/models/room.model')
const path = require("path");

const app = express();
const port = process.env.PORT || 5001;
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
    socket.on('chat message', async (msg, clientOffset, accessToken, callback) => {
        try {
            const message = {'message': msg, 'clientOffset': clientOffset, 'userToken': accessToken};

            const messageModel = new Message(message);
            const user = await getUser(message.userToken);

            await messageModel.save();

            io.emit('chat message', message, user);

            callback();
        } catch (e) {
            console.log(`Error: chat message: ${e}`)
        }
    })

    if (!socket.recovered) {
        try {
            const serverOffset = socket.handshake.auth.serverOffset || 0;
            let messageList = await Message.find({id: {$gt: serverOffset}});

            messageList = messageList.sort((a, b) => Date(a.createdAt) - Date(b.createdAt));

            for (let i = 0; i < messageList.length; i++) {
                const message = messageList[i];
                const user = await getUser(message.userToken);

                socket.emit('chat message', message, user)
            }
        } catch (e) {
            console.log(`Error: socket.recovered: ${e}`)
        }
    }
})


function getUser(token) {
    const apiUrl = 'http://localhost:3000/api/auth/get_user';
    let headers = new Headers();

    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');

    headers.append('Access-Control-Allow-Origin', 'http://localhost:3000');
    headers.append('Access-Control-Allow-Credentials', 'true');

    return fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({"token": token}),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // console.log('Data from API:', data);
            return data;
        })
        .catch(error => {
            console.error('Error posting data:', error);
        });
}

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})