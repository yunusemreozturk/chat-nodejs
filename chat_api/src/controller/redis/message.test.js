const {RedisMessageController} = require("./message.controller");
const Redis = require("ioredis");
const redisClient = new Redis();
describe('Redis Message Controller Test', () => {
    const _messageController = new RedisMessageController(redisClient);
    const roomId = 'roomIdTest';

    afterEach(async () => await redisClient.del(`messages:${roomId}`))

    it('Save', async() => {
        const result = await _messageController.save({
            message: 'messageTest2',
            userToken: 'userTokenTest2',
            roomId: roomId
        });

        expect(result).toBeTruthy()
    });

    it('Find', async () => {
        const result = await _messageController.save({
            message: 'messageTest2',
            userToken: 'userTokenTest2',
            roomId: roomId
        });

        expect(result).toBeTruthy()

        const messages = await _messageController.find(roomId)

        console.log(`messages: ${JSON.stringify(messages)}`)

        expect(messages[0].roomId).toBe(roomId)
    });
})