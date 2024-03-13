const {
    getRooms, getUserMessages, saveRoom, saveMessage, findRoomById, findRoomOne
} = require("../src/controller/index")
const db = require("../../db/db_connection")
const RoomModel = require("../../models/room.model");
require('dotenv').config();

beforeAll(async () => await db.connect())
beforeEach(async () => await saveRoom({type: 0}))
afterEach(async () => await db.clearDatabase())
afterAll(async () => await db.closeDatabase())

const accessToken1 = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWVjYzA4Yjc4ZjE2YTFjZjMxNjMyY2EiLCJuYW1lIjoiZW1yZUBnbWFpbC5jb20iLCJpYXQiOjE3MTAxNjcyOTksImV4cCI6MTcxMDc3MjA5OX0.UC7_JOxe6AqAHa7bxrGn5Vd-lUpVWRXWLyogrJE9wTA-hbuj8HHLhQuMeuFGuAZ-xa1qrjpyT8-3hHQOwqL6ww";
const accessToken2 = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWVkOWIwODUzOGU2M2Y0MjExNmQ5NTgiLCJuYW1lIjoieXVzdWZAZ21haWwuY29tIiwiaWF0IjoxNzEwMTY3MzM0LCJleHAiOjE3MTA3NzIxMzR9.ImXyF8VDKSeAL77dWvKdSLIr_Vas8EaAe6y501SOIFFsLIwTnFPr9CX_k2zxgsJriE9aZ1YxRMjgImibP64Bhw";

describe('Room and Message Test', () => {
    it('Save Room', async () => {
        const roomModel = await saveRoom({type: 0});
        console.log(`roomModel.id: ${roomModel.id}`)
        expect(roomModel.id).toBeDefined()
    })

    it('Get Rooms', async () => {
        const rooms = await getRooms(accessToken1)
        expect(rooms).toBeDefined()

        console.log(`rooms: ${rooms}`)

        const user1Rooms = await getRooms(accessToken1)
        const user2Rooms = await getRooms(accessToken2)

        console.log(`user1Rooms: ${user1Rooms}`)

        //is everyone in general room
        var result = false;
        for (var item1 in user1Rooms) {
            for (var item2 in user2Rooms) {
                if (item1.id == item2.id) {
                    result = true;
                }
            }
        }

        expect(result).toBeTruthy()
    })

    it('Find Room By Id', async () => {
        const rooms = await getRooms(accessToken1);

        for (const item of rooms) {
            let room = await findRoomById(item.id);

            expect(room.id).toBeDefined()
        }
    });

    it('Find One Room', async () => {
        //test unique room for private chat
        let savedRoom1 = await saveRoom({users: [{"userId": accessToken1}, {"userId": accessToken2}], type: 1});
        let savedRoom2 = await saveRoom({users: [{"userId": accessToken1}, {"userId": accessToken2}], type: 1});
        console.log(`savedRoom1: ${savedRoom1}`);
        console.log(`savedRoom2: ${savedRoom2}`);

        expect(savedRoom1.id).toMatch(savedRoom2.id)

        //create a lot of room for make sure correct room receive
        let tempRoom1 = await saveRoom({users: [{"userId": "userId1"}, {"userId": "userId2"}], type: 1});
        let tempRoom2 = await saveRoom({users: [{"userId": "userId3"}, {"userId": "userId4"}], type: 1});

        let findRoom = await findRoomOne([accessToken1, accessToken2], 1);
        console.log(`findRoom: ${findRoom}`)

        expect(findRoom.id).toMatch((savedRoom1).id)

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