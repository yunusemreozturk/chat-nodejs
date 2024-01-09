const {Server} = require("socket.io");
const {createServer} = require("node:http");
const express = require("express");

const app = express();
const server = createServer(app)
const io = new Server(server, {
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000, skipMiddlewares: true,
    }
});

module.exports = {server, io, app}