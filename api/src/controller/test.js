const {
    getRooms, getUserMessages, saveRoom, saveMessage, findRoomById, findRoomOne
} = require('./index')
const db = require("../../../db/db_connection")
const RoomModel = require("../../../models/room.model");
require('dotenv').config();

const accessToken1 = "accessToken1";
const accessToken2 = "accessToken2";

describe('Room and Message Test', () => {
    beforeAll(async () => await db.connect(true))
    beforeEach(async () => await saveRoom({type: 0}))
    afterEach(async () => await db.clearDatabase())
    afterAll(async () => await db.closeDatabase())

    describe('Save Room', () => {
        it('create a general type room', async () => {
            const roomModel = await saveRoom({type: 0});
            console.log(`roomModel.id: ${roomModel.id}`)
            expect(roomModel.id).toBeDefined()
        });

        it('create a private type room', async () => {
            const roomModel = await saveRoom({users: [{'userId': accessToken1}, {'userId': accessToken2}], type: 1});
            console.log(`roomModel.id: ${roomModel.id}`)
            expect(roomModel.id).toBeDefined()
        });

        it('create a group type room', async () => {
            const roomModel = await saveRoom({
                users: [{'userId': accessToken1}, {'userId': accessToken2}, {'userId': 'accessToken3'}, {'userId': 'accessToken4'},],
                type: 2
            });
            console.log(`roomModel.id: ${roomModel.id}`)
            expect(roomModel.id).toBeDefined()
        });
    });

    it('Get Rooms', async () => {
        const rooms = await getRooms('accessToken1')
        const rooms2 = await getRooms(undefined)

        console.log(`rooms: ${rooms}, rooms2: ${rooms2}`)

        expect(rooms).toBeDefined()
        expect(rooms2.length).toBe(0)
    })

    it('Find Room By Id', async () => {
        const rooms = await getRooms(accessToken1);
        for (const item of rooms) {
            let room = await findRoomById(item.id);
            expect(room.id).toMatch(item.id)
        }
    });

    it('Find One Room', async () => {
        let findRoom = await findRoomOne([], 0);
        console.log(`findRoom: ${findRoom}`)

        expect(findRoom.id).toBeDefined()
    });

    it('Message Test', async () => {
        let room = await saveRoom({type: 0});
        let msg = 'Test Message'

        console.log(`room: ${room}`)

        let message1 = await saveMessage(msg, room.id, accessToken1);
        let message2 = await saveMessage(msg, room.id, accessToken2);

        console.log(`message1: ${message1}`)

        expect(message1.id).toBeDefined()
        expect(message2.id).toBeDefined()

        let userMessages = await getUserMessages(room.id);

        console.log(`userMessages: ${userMessages}`)

        expect(userMessages[0].id).toMatch(message1.id);
        expect(userMessages[1].id).toMatch(message2.id);
    });
})