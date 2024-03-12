const router = require('express').Router();
const {getUserMessages, getRooms} = require('../controller/index')

router.get('/api', getRooms)
router.get('/api', getUserMessages)

module.exports = router