const request = require('supertest');
const {app} = require("../index");
const {PARAMETERS_MISSING_OR_MALFORMED} = require("../../utils/responce_string");
const createServer = require("../src/server");

require('dotenv').config();

describe('Api Endpoints Test', () => {
    var server;
    beforeAll(()=> {
        server = createServer();

        server.listen(process.env.PORT_API, () => {
            console.log(`App is running on http://localhost:${process.env.PORT_API}`)
        })
    })

    it('POST /get_rooms', async () => {

        const response = await request().post('/api/get_rooms');
        console.log(`burada: ${response.status}`)
        expect(response.body).toBe(PARAMETERS_MISSING_OR_MALFORMED)
    })

    it('POST /get_user_messages', async () => {

    });
})