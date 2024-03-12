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

async function saveRoom(to, accessToken, type) {
    let roomModel = RoomModel({
        users: [{"userId": to}, {"userId": accessToken}],
        type: type
    });
    await roomModel.save();

    return roomModel;
}

async function saveMessage(msg, roomId, accessToken) {
    const messageModel = MessageModel({
        'message': msg,
        'roomId': roomId,
        'userToken': accessToken,
    })
    await messageModel.save();

    return messageModel;
}

async function findRoomById(roomId) {
    return RoomModel.findById(roomId);
}

async function findRoomOne(object) {
    return RoomModel.findOne(object);
}

module.exports = {
    getRooms,
    getUserMessages,
    saveRoom,
    saveMessage,
    findRoomById,
    findRoomOne
}