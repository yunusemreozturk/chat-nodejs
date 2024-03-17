const router = require("express").Router()
const {
    login, register, forgetPassword, verifyUser, verifyEmail, resetPassword, resetPasswordPOST, getUser
} = require("../controller/auth.controller")
const authValidation = require('../middlewares/validations/auth.validation')

router.post('/login', authValidation.login, login);
router.post('/register', register);
router.post("/forgot_password", authValidation.forgetPassword, forgetPassword);
router.post('/get_user', authValidation.getUser, getUser)

//todo: api/user/verify bu yolu düzenle
router.get('/user/verify/:id/:verification_token', verifyEmail);
router.get('/user/reset/:id/:verification_token', resetPassword);
router.post('/user/reset', resetPasswordPOST);

module.exports = router