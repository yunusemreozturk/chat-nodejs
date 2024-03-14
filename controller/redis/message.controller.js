/* abstract */
const {randomId} = require("../../utils/utils");

class MessageController {
    save(object);

    find(object);
}

const CONVERSATION_TTL = 24 * 60 * 60;

class RedisMessageController extends MessageController {
    constructor(redisClient) {
        super();
        this.redisClient = redisClient
    }

    async save(object) {
        object.id = randomId();
        await this.redisClient.hSet(`messages:${object.id}`, object)
    }

    find(object) {

    };
}

module.exports = {RedisMessageController}