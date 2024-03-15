const {randomId} = require("../../../../utils/utils");

/* abstract */ class MessageController {
    save(object) {
    }

    find(object) {
    }
}

const CONVERSATION_TTL = 24 * 60 * 60;

class RedisMessageController extends MessageController {
    constructor(redisClient) {
        super();
        this.redisClient = redisClient
    }

    async save(object) {
        try{
            const value = JSON.stringify(object)
            await this.redisClient
                .multi()
                .rpush(`messages:${object.roomId}`, value)
                .expire(`messages:${object.roomId}`, CONVERSATION_TTL)
                .exec();

            return true;
        } catch (e) {
            console.log(`RedisMessageController: save: ${e}`)

            return false
        }
    }


    async find(roomId) {
        return await this.redisClient
            .lrange(`messages:${roomId}`, 0, -1)
            .then((results) => {
                return results.map((result) => JSON.parse(result));
            });
    };
}

module.exports = {RedisMessageController}