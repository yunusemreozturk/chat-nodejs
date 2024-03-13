const RoomModel = require("../../../models/room.model");
const MessageModel = require("../../../models/message.model");

async function getRooms(userId) {
    if (!userId) return [];
    const privateAndGroupChats = await RoomModel.find({"users.userId": userId});
    const generalChats = await RoomModel.find({type: 0});

    return [...privateAndGroupChats, ...generalChats];
}

async function saveRoom({users, type}) {
    let roomModel = undefined;
    if (type === 0) {
        roomModel = RoomModel({
            users: [],
            type: type
        });
    } else if (type === 1) {
        const userList = users.map((item) => {
            return item.userId;
        });
        const checkRoomExist = await findRoomOne(userList, type);

        if (!checkRoomExist) {
            roomModel = RoomModel({
                users: users,
                type: type,
                limit: 2,
            });
        } else {
            return checkRoomExist;
        }
    } else if (type === 2) {
        roomModel = RoomModel({
            users: users,
            type: type,
            limit: 8,
        });
    }

    if (roomModel) await roomModel.save();

    return roomModel;
}

async function findRoomById(roomId) {
    return RoomModel.findById(roomId);
}

async function findRoomOne(userIds, type) {
    return RoomModel.findOne({
        type: 1,
        $and: userIds.map(userId => ({"users.userId": userId}))
    });
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