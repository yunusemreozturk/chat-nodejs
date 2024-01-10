const Room = require("../models/room.model");
const Message = require("../models/message.model");
const chatTypeEnum = require("../models/chat.type.enum");
const {io} = require("../socket/socket");
const getUser = require("../utils/auth_utils")

const connectionListener = async (socket) => {
    if (!socket.recovered) {
        try {
            let messageList = await Message.find({});

            messageList = messageList.sort((a, b) => Date(a.createdAt) - Date(b.createdAt));

            for (let i = 0; i < messageList.length; i++) {
                const message = messageList[i];
                const user = await getUser(message.userToken);

                socket.emit(chatTypeEnum.GENERAL, message, user)
            }
        } catch (e) {
            console.log(`Error: socket.recovered: ${e}`)
        }
    }
}

const disconnectionListener = () => {

}

const generalChatListener = async (msg, callback) => {
    try {
        // const room = new Room({'type': 0})
        // await room.save();
        console.log(io.auth.access_token);

        const message = {
            'message': msg,
            'userToken': io.auth.access_token,
            'roomId': 'general',
        };

        const messageModel = new Message(message);
        const user = await getUser(message.userToken);

        await messageModel.save();

        io.emit(chatTypeEnum.GENERAL, message, user);

        callback();
    } catch (e) {
        console.log(`Error: chat message: ${e}`)
    }
}

module.exports = {generalChatListener, connectionListener}