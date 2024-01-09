const Room = require("../models/room.model");
const Message = require("../models/message.model");
const chatTypeEnum = require("../models/chat.type.enum");
const {io} = require("../socket/socket");
const getUser = require("../utils/auth_utils")

const connectionListener = async (socket) => {
    if (!socket.recovered) {
        try {
            const serverOffset = socket.handshake.auth.serverOffset || 0;
            let messageList = await Message.find({id: {$gt: serverOffset}});

            messageList = messageList.sort((a, b) => Date(a.createdAt) - Date(b.createdAt));

            for (let i = 0; i < messageList.length; i++) {
                const message = messageList[i];
                const user = await getUser(message.userToken);

                socket.emit('chat message', message, user)
            }
        } catch (e) {
            console.log(`Error: socket.recovered: ${e}`)
        }
    }
}

const generalChatListener = async (msg, clientOffset, accessToken, roomId, callback) => {
    if (roomId !== chatTypeEnum.GENERAL) await (new Room({'type': 0}).save())

    try {
        const message = {
            'message': msg,
            'clientOffset': clientOffset,
            'userToken': accessToken,
            'roomId': roomId,
        };

        const messageModel = new Message(message);
        const user = await getUser(message.userToken);

        await messageModel.save();

        io.emit('chat message', message, user);

        callback();
    } catch (e) {
        console.log(`Error: chat message: ${e}`)
    }
}

module.exports = {generalChatListener, connectionListener}