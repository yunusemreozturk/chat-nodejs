const {createServer} = require("node:http");
const {Server} = require("socket.io");
const ioc = require("socket.io-client");
const db = require("../../db/db_connection");
const {getRooms, saveRoom} = require("../../chat_api/src/controller/room.controller");
const SocketEvents = require("../src/socket/socket_events");
const {joinRoom, sendMessage} = require("../src/controller");

const accessToken1 = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWYyMWNhZjZmYjk1ZjA0ZDFhOGFkM2IiLCJuYW1lIjoieXVzdWZAZ21haWwuY29tIiwiaWF0IjoxNzEwMzY1ODcxLCJleHAiOjE3MTA5NzA2NzF9.lEK8MbrtEPahtY7dfnBtCfuDHNQWpjRpeHSznNxdc9rO09_gJpkbwDknK4E-SWdDiwho-axSGBGiXqL4VAVeNA";
const accessToken2 = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWYyMWM3OTZmYjk1ZjA0ZDFhOGFkMzgiLCJuYW1lIjoiZW1yZUBnbWFpbC5jb20iLCJpYXQiOjE3MTAzNjU4MTcsImV4cCI6MTcxMDk3MDYxN30.1tGDZpgE3izYtmLQKERfB5KJwaQb2Zf8f4G8g6Mh_KDS7FvojdqwCHyMaogT9vJJzF1VZAuBLiio5tnXM6ihVw";

describe("Socket Test", () => {
    let io, serverSocket, clientSocket;

    beforeAll((done) => {
        db.connect(true);
        const httpServer = createServer();
        io = new Server(httpServer);
        httpServer.listen(() => {
            const port = httpServer.address().port;
            clientSocket = ioc(`http://localhost:${port}`);
            io.on("connection", (socket) => {
                serverSocket = socket;
                serverSocket.accessToken = accessToken1;
                serverSocket.sessionID = 'sessionId';
            });
            clientSocket.on("connect", done);
        });
    });
    afterEach(() => db.clearDatabase());
    afterAll(() => {
        db.closeDatabase()
        io.close();
        clientSocket.disconnect();
    });

    it("should emit rooms", (done) => {
        clientSocket.on(SocketEvents.Rooms, (arg) => {
            console.log(`room: ${arg[0]._id}`)
            expect(arg[0]._id).toBeDefined()
            done();
        });

        saveRoom({type: 0}).then(() => {
            getRooms(accessToken1).then((rooms) => serverSocket.emit(SocketEvents.Rooms, rooms));
        });
    });

    it("should join a general room send message and receive it", (done) => {
        const testMessage = 'testMessage1';

        clientSocket.on(SocketEvents.Message, (msg) => {
            console.log(`msg: ${msg}`)
            expect(msg).toBe(testMessage)
            done();
        });

        serverSocket.on(SocketEvents.JoinRoom, (on, type) => {
            console.log(`joinRoom: ${on} : type: ${type}`)
            joinRoom(serverSocket, on, type).then(() => expect(serverSocket.rooms).toContain(on));
        });

        saveRoom({type: 0}).then((room) => {
            console.log(`saveRoom: ${room._id}`)
            const roomId = room._id;

            sendMessage(serverSocket, roomId, 0, testMessage).then(() => clientSocket.emit(SocketEvents.JoinRoom, roomId, 0));
        });
    });
});