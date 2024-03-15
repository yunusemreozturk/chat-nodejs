const RoomModel = require("../../../models/room.model");
const {getUniqueArray} = require("../../../utils/utils");

async function getRooms(userId) {
    if (!userId) return [];
    const privateAndGroupChats = await RoomModel.find({"users.userId": userId});
    const generalChats = await RoomModel.find({type: 0});

    return [...privateAndGroupChats, ...generalChats];
}

async function saveRoom({users, type}) {
    users = getUniqueArray(users);

    let roomModel = undefined;
    if (type === 0) {
        roomModel = RoomModel({
            users: [],
            type: type
        });
    } else if (type === 1) {
        const limit = 2;

        if (limit === users.length) {
            const userList = users.map(item => item.userId);
            const checkRoomExist = await findRoomOne(userList, type);

            if (!checkRoomExist) {
                roomModel = RoomModel({
                    users: users,
                    type: type,
                    limit: limit,
                });
            } else {
                return checkRoomExist;
            }
        }
    } else if (type === 2) {
        const limit = 8;
        roomModel = RoomModel({
            users: users,
            type: type,
            limit: limit,
        });
    }

    if (roomModel) await roomModel.save();

    return roomModel;
}

async function findRoomById(roomId) {
    if (!roomId) return;

    return RoomModel.findById(roomId);
}

async function findRoomOne(userIds, type) {
    if (typeof type !== 'number') return;

    if (type === 0) {
        return RoomModel.findOne({type: type});
    }
    return RoomModel.findOne({
        type: type,
        $and: userIds.map(userId => ({"users.userId": userId}))
    });
}

module.exports = {
    getRooms,
    saveRoom,
    findRoomById,
    findRoomOne
}