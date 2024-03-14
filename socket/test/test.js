const {createServer} = require("node:http");
const {Server} = require("socket.io");
const ioc = require("socket.io-client");
const db = require("../../db/db_connection");
const {getRooms, saveRoom, findRoomById} = require("../../api/src/controller");
const SocketEvents = require("../src/socket/socket_events");
require('dotenv').config();

const port = process.env.PORT_SOCKET;

const accessToken2 = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWYyMWM3OTZmYjk1ZjA0ZDFhOGFkMzgiLCJuYW1lIjoiZW1yZUBnbWFpbC5jb20iLCJpYXQiOjE3MTAzNjU4MTcsImV4cCI6MTcxMDk3MDYxN30.1tGDZpgE3izYtmLQKERfB5KJwaQb2Zf8f4G8g6Mh_KDS7FvojdqwCHyMaogT9vJJzF1VZAuBLiio5tnXM6ihVw";
const accessToken1 = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWYyMWNhZjZmYjk1ZjA0ZDFhOGFkM2IiLCJuYW1lIjoieXVzdWZAZ21haWwuY29tIiwiaWF0IjoxNzEwMzY1ODcxLCJleHAiOjE3MTA5NzA2NzF9.lEK8MbrtEPahtY7dfnBtCfuDHNQWpjRpeHSznNxdc9rO09_gJpkbwDknK4E-SWdDiwho-axSGBGiXqL4VAVeNA";

function waitFor(socket, event) {
    return new Promise((resolve) => {
        socket.once(event, resolve);
    });
}

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
        clientSocket.on(SocketEvents.Room, (arg) => {
            console.log(`room: ${arg[0]._id}`)
            expect(arg[0]._id).toBeDefined()
            done();
        });

        saveRoom({type: 0}).then(() => {
            getRooms(accessToken1).then((rooms) => serverSocket.emit(SocketEvents.Room, rooms));
        });
    });

    it("should emit session", (done) => {
        const sessionId = 'testSessionId'
        clientSocket.on(SocketEvents.Session, async (arg) => {
            console.log(`session: ${arg}`)
            expect(arg).toBe(sessionId)
            done();
        });
        serverSocket.emit(SocketEvents.Session, sessionId);
    });

    test("should work with an acknowledgement", (done) => {
        serverSocket.on("hi", (cb) => {
            cb("hola");
        });
        clientSocket.emit("hi", (arg) => {
            expect(arg).toBe("hola");
            done();
        });
    });

    test("should work with emitWithAck()", async () => {
        serverSocket.on("foo", (cb) => {
            cb("bar");
        });
        const result = await clientSocket.emitWithAck("foo");
        expect(result).toBe("bar");
    });

    test("should work with waitFor()", () => {
        clientSocket.emit("baz");

        return waitFor(serverSocket, "baz");
    });
});