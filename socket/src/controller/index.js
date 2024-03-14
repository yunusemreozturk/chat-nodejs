const {
    findRoomById,
    findRoomOne,
    getUserMessages,
    saveRoom,
    getRooms,
    saveMessage
} = require("../../../api/src/controller");
const SocketEvents = require("../socket/socket_events");

async function joinRoom(socket, to, type) {
    if (!(to && typeof type === 'number')) return;
    const accessToken = socket.accessToken;

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
            socket.emit(SocketEvents.Message, message.message);
        })
    } else {
        let roomModel = await saveRoom([{"userId": to}, {"userId": accessToken}], type);

        socket.emit(SocketEvents.Rooms, await getRooms(accessToken));

        socket.join(roomModel.id);
    }
}

async function sendMessage(socket, roomId, type, msg) {
    if (!(roomId && typeof type === 'number' && msg)) return;

    let room = await findRoomById(roomId);
    let userIds = []
    room.users.forEach((user) => {
        userIds.push(user.userId)
    });

    if (!room) return;

    await saveMessage(msg, room.id, socket.accessToken);

    socket.to(userIds).emit(SocketEvents.Message, msg)
}

async function disconnect() {
    // update the connection status of the session
    sessionStore.saveSession(socket.sessionID, {
        accessToken: accessToken,
        user: socket.user,
        connected: false,
    });
}

module.exports = {joinRoom, sendMessage, disconnect}