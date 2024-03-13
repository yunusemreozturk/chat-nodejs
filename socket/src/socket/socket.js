const {Server} = require("socket.io");
const {createServer} = require("node:http");
const express = require("express");
const Redis = require("ioredis");
const redisClient = new Redis();

const app = express();
const server = createServer(app)
const io = new Server(server, {
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000, skipMiddlewares: true,
    }, cors: {
        origin: process.env.URL + process.env.PORT
    },
    // adapter: require("socket.io-redis")({
    //     pubClient: redisClient,
    //     subClient: redisClient.duplicate(),
    // }),
});

module.exports = {server, io, app}