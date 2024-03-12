/* abstract */ class RoomStore {
    findRoom(room) {}
    saveRoom(room) {}
    findRoomById(id) {}
    findMessagesForUser(userID) {}
}

const CONVERSATION_TTL = 24 * 60 * 60;

class RedisRoomStore extends RoomStore {
    constructor(redisClient) {
        super();
        this.redisClient = redisClient;
    }

    saveMessage(message) {
        const value = JSON.stringify(message);
        this.redisClient
            .multi()
            .rpush(`messages:${message.from}`, value)
            .rpush(`messages:${message.to}`, value)
            .expire(`messages:${message.from}`, CONVERSATION_TTL)
            .expire(`messages:${message.to}`, CONVERSATION_TTL)
            .exec();
    }

    findMessagesForUser(userID) {
        return this.redisClient
            .lrange(`messages:${userID}`, 0, -1)
            .then((results) => {
                return results.map((result) => JSON.parse(result));
            });
    }
}

module.exports = {
    RedisMessageStore,
};
