const router = require('express').Router();
const {getUserMessages} = require('../controller/message.controller')
const {getRooms} = require('../controller/room.controller')
const Response = require("../../../utils/response");
const {PARAMETERS_MISSING_OR_MALFORMED} = require("../../../utils/responce_string");
const APIError = require("../../../utils/errors");

router.post('/get_rooms', async (req, res) => {
    const {userId} = req.body;

    if (!userId) throw new APIError(PARAMETERS_MISSING_OR_MALFORMED, 400);

    const rooms = await getRooms(userId);

    return new Response({rooms: rooms}).success(res);
})
router.post('/get_user_messages', async (req,res) => {
    const {roomId} = req.body;

    if (!roomId) throw new APIError(PARAMETERS_MISSING_OR_MALFORMED, 400);

    const userMessages = await getUserMessages(roomId);

    return Response({messages: userMessages}).success(res);
})

module.exports = router