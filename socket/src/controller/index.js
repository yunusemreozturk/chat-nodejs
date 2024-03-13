const {
    findRoomById,
    findRoomOne,
    getUserMessages,
    saveRoom,
    getRooms,
    saveMessage
} = require("../../../api/src/controller");

async function joinRoom(socket, to, type) {
    if (!(to && type)) return;
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
            socket.emit('messages', message.message);
        })
    } else {
        let roomModel = await saveRoom([{"userId": to}, {"userId": accessToken}], type);

        socket.emit('rooms', await getRooms(accessToken));

        socket.join(roomModel.id);
    }
}

async function sendMessage(socket, roomId, type, msg) {
    if (!(roomId && type && msg)) return;

    let room = await findRoomById(roomId);
    let userIds = []
    room.users.forEach((user) => {
        userIds.push(user.userId)
    });

    if (!room) return;

    await saveMessage(msg, room.id, socket.accessToken);

    socket.to(userIds).emit('messages', msg)
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