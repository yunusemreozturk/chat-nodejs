const RoomModel = require("../../../models/room.model");
const {RedisMessageController} = require("./redis/message.controller");
const Redis = require("ioredis");

const _redisClient = new Redis();
const _redisMessageController = new RedisMessageController(_redisClient);

async function getUserMessages(roomId) {
    if (!roomId) return;

    const room = await RoomModel.findById(roomId);
    if (room) {
        var messages = await _redisMessageController.find(roomId);

        return messages.map(element => {
            if (element.deleted === undefined || element.deleted !== false) {
                return element;
            }
        });
    }
}

async function saveMessage(msg, roomId, accessToken) {
    if (!msg || !roomId || !accessToken) return;

    const data = {
        'message': msg,
        'roomId': roomId,
        'userToken': accessToken,
    };
    await _redisMessageController.save(data);

    return data;
}

module.exports = {
    getUserMessages,
    saveMessage
}