/* abstract */ class MessageController {
    saveMessage(message, roomId, accessToken);
}

class RedisMessageController extends  MessageController {
    constructor(redisClient) {
        super();
        this.redisClient = redisClient
    }

    saveMessage(message, roomId, accessToken) {
        this.redisClient
    }
}