const {PARAMETERS_MISSING_OR_MALFORMED, SUCCESS} = require("../../utils/response_string");
const createServer = require("../src/app");
const request = require('supertest');
require('dotenv').config();

const {agent: superagent} = require("supertest");

const app = createServer();

const TOKEN = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWYyMWM3OTZmYjk1ZjA0ZDFhOGFkMzgiLCJuYW1lIjoiZW1yZUBnbWFpbC5jb20iLCJpYXQiOjE3MTA2NTA1NTIsImV4cCI6MTcxMTI1NTM1Mn0.AJhXzTqaqktSXxwb_I3meckB5H6UlGTkexxLxYq8VvzSFCXP1xwozVYOuHfKDjYgyDlhP1xxjsDHaKJu7Bbrjw";

describe('Api Endpoints Test', () => {
    const supertest = superagent(app).auth(TOKEN, {type: 'bearer'});

    it('GET /welcome', async () => {
        const response = await supertest.get('/welcome');

        console.log(JSON.stringify(response.body))

        expect(response.body.code).toBe(SUCCESS)
    })

    it('GET /get_rooms', async () => {
        const response = await supertest.post('/api/get_rooms').send({userId: 'testtest'});

        console.log(JSON.stringify(response.body))

        expect(response.body.code).toBe(SUCCESS)
    })

    // it('POST /get_user_messages', async () => {
    //
    // });
})