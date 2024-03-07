const Message = require("../models/message.model");
const chatTypeEnum = require("../models/chat.type.enum");
const {io, server} = require("../socket/socket");

const connectionListener = async (socket) => {
    if (!socket.recovered) {
        try {
            const user = socket.user;

            let messageList = await Message.find({'roomId': chatTypeEnum.GENERAL});

            messageList = messageList.sort((a, b) => Date(a.createdAt) - Date(b.createdAt));

            for (let i = 0; i < messageList.length; i++) {
                const message = messageList[i];

                socket.emit(chatTypeEnum.GENERAL, {message, user})

                console.log(`yollandı: ${i}`);
            }
        } catch (e) {
            console.log(`Error: socket.recovered: ${e}`)
        }
    }
}

const generalChat = async (socket, msg, accessToken) => {
    try {
        const user = socket.user;

        const message = {
            'message': msg,
            'userToken': accessToken,
            'roomId': chatTypeEnum.GENERAL,
        };

        const messageModel = new Message(message);

        await messageModel.save();

        io.emit(chatTypeEnum.GENERAL, message, user);
    } catch (e) {
        console.log(`Error: chat message: ${e}`)
    }
}

module.exports = {generalChat, connectionListener}