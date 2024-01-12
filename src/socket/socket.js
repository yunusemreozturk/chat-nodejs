const {Server} = require("socket.io");
const {createServer} = require("node:http");
const express = require("express");

const app = express();
const server = createServer(app)
const io = new Server(server, {
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000, skipMiddlewares: true,
    }, cors: {
        origin: process.env.URL + process.env.PORT
    }
});

module.exports = {server, io, app}