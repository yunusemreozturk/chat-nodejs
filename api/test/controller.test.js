const {
    getRooms,
    getUserMessages,
    saveRoom,
    saveMessage,
    findRoomById,
    findRoomOne
} = require("../src/controller/index")
const db = require("../../db/db_connection")
require('dotenv').config();

beforeAll(async () => await db.connect())
beforeEach(async () => await saveRoom({type: 0}))
afterEach(async () => await db.clearDatabase())
// afterAll(async () => await db.closeDatabase())

const accessToken1 = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWVjYzA4Yjc4ZjE2YTFjZjMxNjMyY2EiLCJuYW1lIjoiZW1yZUBnbWFpbC5jb20iLCJpYXQiOjE3MTAxNjcyOTksImV4cCI6MTcxMDc3MjA5OX0.UC7_JOxe6AqAHa7bxrGn5Vd-lUpVWRXWLyogrJE9wTA-hbuj8HHLhQuMeuFGuAZ-xa1qrjpyT8-3hHQOwqL6ww";
const accessToken2 = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWVkOWIwODUzOGU2M2Y0MjExNmQ5NTgiLCJuYW1lIjoieXVzdWZAZ21haWwuY29tIiwiaWF0IjoxNzEwMTY3MzM0LCJleHAiOjE3MTA3NzIxMzR9.ImXyF8VDKSeAL77dWvKdSLIr_Vas8EaAe6y501SOIFFsLIwTnFPr9CX_k2zxgsJriE9aZ1YxRMjgImibP64Bhw";

describe('Room Test', () => {
    it('Save Room', async () => {
        const roomModel = await saveRoom({type: 0});
        console.log(roomModel.id)
        expect(roomModel.id).toBeDefined()
    })

    it('Get Rooms', async () => {
        const rooms = await getRooms(accessToken1)
        expect(rooms).toBeDefined()

        const user1Rooms = await getRooms(accessToken1)
        const user2Rooms = await getRooms(accessToken2)

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
})