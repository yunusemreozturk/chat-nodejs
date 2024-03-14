const {RedisMessageController} = require("./message.controller");
const Redis = require("ioredis");
const redisClient = new Redis();
describe('Redis Message Controller Test', () => {
    const _messageController = new RedisMessageController(redisClient);
    it('Save', () => {

    });

    it('Find', () => {

    });
})