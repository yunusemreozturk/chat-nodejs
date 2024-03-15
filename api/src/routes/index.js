const router = require('express').Router();
const {getUserMessages} = require('../controller/message.controller')
const {getRooms} = require('../controller/room.controller')

router.get('/getUserMessages', getRooms)
router.get('/getRooms', getUserMessages)

module.exports = router