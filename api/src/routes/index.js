const router = require('express').Router();
const {getUserMessages, getRooms} = require('../controller/index')

router.get('/getUserMessages', getRooms)
router.get('/getRooms', getUserMessages)

module.exports = router