const router = require('express').Router();
const auth = require('./auth.routes');
const upload = require("../middlewares/lib/upload");
const multer = require("multer");
const APIError = require("../../../utils/errors");
const Response = require("../../../utils/response");
const {
    UPLOAD_PICTURE_ERROR,
    UPLOAD_PICTURE_SUCCESS
} = require('../../../utils/response_string');

router.use('/auth', auth)

router.post("/upload", function (req, res) {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError)
            throw new APIError(UPLOAD_PICTURE_ERROR, err)
        else if (err)
            throw new APIError(UPLOAD_PICTURE_ERROR, err)
        else return new Response(req.savedImages, UPLOAD_PICTURE_SUCCESS).success(res)
    })
})

module.exports = router