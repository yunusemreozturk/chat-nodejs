const RoomModel = require("../../../models/room.model");
const MessageModel = require("../../../models/message.model");

async function getRooms(userId) {
    const privateAndGroupChats = await RoomModel.find({"users.userId": userId});
    const generalChats = await RoomModel.find({type: 0});

    return [...privateAndGroupChats, ...generalChats];
}

async function getUserMessages(roomId) {
    const room = await RoomModel.findById(roomId);
    if (room) {
        const messages = await MessageModel.find({roomId: roomId});

        return messages;
    }
}

module.exports = {
    getRooms,
    getUserMessages
}