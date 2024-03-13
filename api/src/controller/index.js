const RoomModel = require("../../../models/room.model");
const MessageModel = require("../../../models/message.model");

async function getRooms(userId) {
    const privateAndGroupChats = await RoomModel.find({"users.userId": userId});
    const generalChats = await RoomModel.find({type: 0});

    return [...privateAndGroupChats, ...generalChats];
}

async function saveRoom({users, type}) {
    let room = undefined;
    if (type == 0) {
        roomModel = RoomModel({
            users: [],
            type: type
        });
    } else if (type == 1) {
        roomModel = RoomModel({
            users: users,
            type: type,
            limit: 2,
        });
    } else if (type == 2) {
        roomModel = RoomModel({
            users: users,
            type: type,
            limit: 8,
        });
    }
    await roomModel.save();

    return roomModel;
}

async function findRoomById(roomId) {
    return RoomModel.findById(roomId);
}

async function findRoomOne(object) {
    return RoomModel.findOne(object);
}

async function getUserMessages(roomId) {
    const room = await RoomModel.findById(roomId);
    if (room) {
        const messages = await MessageModel.find({roomId: roomId});

        return messages;
    }
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

module.exports = {
    getRooms,
    getUserMessages,
    saveRoom,
    saveMessage,
    findRoomById,
    findRoomOne
}