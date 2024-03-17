const User = require("../models/user.model")
const Token = require("../models/token.model")
const APIError = require("../../../utils/errors");
const Response = require("../../../utils/response")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const {createToken, userFromToken} = require("../middlewares/auth");
const sendEmail = require("../../../utils/send_mail");
const moment = require("moment");
const {
    CHECK_EMAIL_OR_PASSWORD,
    EMAIL_ALREADY_IN_USE,
    PASSWORD_FORGET_EMAIL_SEND,
    UNAUTHORIZED,
    INVALID_SESSION,
    PASSWORD_CHANGE_SUCCESS,
    PASSWORD_MUST_SAME,
    CANNOT_BE_EMPTY,
    SUCCESS,
} = require("../../../utils/response_string");
const path = require('path');
const saltRounds = 10;
const clientUrl = `http://localhost:${process.env.PORT_AUTH_API}/`;

const login = async (req, res) => {
    const {email, password} = req.body;
    const userInfo = await User.findOne({email: email})

    if (!userInfo) throw new APIError(CHECK_EMAIL_OR_PASSWORD, 401);

    const comparePassword = await bcrypt.compare(password, userInfo.password);

    if (!comparePassword) throw new APIError(CHECK_EMAIL_OR_PASSWORD, 401);

    // //! if user not verified
    // if (!userInfo.is_verified) {
    //     const now = moment(new Date());
    //     const token = await Token.findOne({_id: userInfo._id});
    //
    //     //! if the token has expired
    //     if (now > moment(token.expiresAt)) {
    //         token.token = (crypto.randomBytes(32).toString("hex"));
    //         token.expiresAt = moment(new Date()).add(60, "minute").format("YYYY-MM-DD HH:mm:ss");
    //
    //         await token.save();
    //
    //         const verificationUrl = `${clientUrl}api/user/verify/${token.userId}/${token.token}`;
    //
    //         await sendEmail({
    //             from: "megasxlr177@gmail.com",
    //             to: userInfo.email,
    //             subject: APP_NAME + ' için kullandığınız e-posta adresini doğrulayın',
    //             html: `<p>Verify your email address to complete the signup and login into your account: </p><p>This link <b>expires in 1 hours</b>.</p><p>Press <a href="${verificationUrl}">here</a> to proceed.</p>`,
    //         });
    //
    //         throw new APIError(USER_EMAIL_NOT_VERIFIED, 401);
    //     } else {
    //         throw new APIError(USER_EMAIL_NOT_VERIFIED, 401);
    //     }
    // }

    return createToken(userInfo, res)
}

const register = async (req, res) => {
    const {email} = req.body

    const userInfo = await User.findOne({email})

    if (userInfo) {
        throw new APIError(EMAIL_ALREADY_IN_USE, 401)
    } else {
        req.body.password = await bcrypt.hash(req.body.password, saltRounds);

        const userModel = new User(req.body);
        await userModel.save();

        return createToken(userModel, res)

        // req.body.password = await bcrypt.hash(req.body.password, saltRounds);
        //
        // const userSave = new User(req.body);
        // const tokenSave = new Token({
        //     userId: userSave._id,
        //     token: (crypto.randomBytes(32).toString("hex")),
        //     expiresAt: moment(new Date()).add(60, "minute").format("YYYY-MM-DD HH:mm:ss"),
        // });
        //
        // await userSave.save();
        // await tokenSave.save();
        //
        // const verificationUrl = `${clientUrl}api/user/verify/${tokenSave.userId}/${tokenSave.token}`;
        //
        // console.log('verificationUrl: ', verificationUrl)
        //
        // await sendEmail({
        //     from: "megasxlr177@gmail.com",
        //     to: userSave.email,
        //     subject: APP_NAME + ' için kullandığınız e-posta adresini doğrulayın',
        //     html: `<p>Verify your email address to complete the signup and login into your account: </p><p>This link <b>expires in 1 hours</b>.</p><p>Press <a href="${verificationUrl}">here</a> to proceed.</p>`,
        // });
        //
        // return new Response(userSave, USER_CREATE_SUCCESS).created(res);
    }
}

const forgetPassword = async (req, res) => {
    const {email} = req.body

    const userInfo = await User.findOne({email})

    if (!userInfo) return new Response({'result': false}, PASSWORD_FORGET_EMAIL_SEND).success(res);

    const token = await Token.findOne({userId: userInfo.userId})

    let resetUrl;
    if (token) {
        token.token = (crypto.randomBytes(32).toString("hex"));
        token.expiresAt = moment(new Date()).add(60, "minute").format("YYYY-MM-DD HH:mm:ss");

        resetUrl = `${clientUrl}api/user/reset/${token.userId}/${token.token}`;
        await token.save();
    } else {
        const tokenSave = new Token({
            userId: userInfo.userId,
            token: (crypto.randomBytes(32).toString("hex")),
            expiresAt: moment(new Date()).add(60, "minute").format("YYYY-MM-DD HH:mm:ss"),
        });

        resetUrl = `${clientUrl}api/user/reset/${tokenSave.userId}/${tokenSave.token}`;
        await tokenSave.save();
    }

    await sendEmail({
        from: "megasxlr177@gmail.com",
        to: userInfo.email,
        subject: 'Şifre Sıfırlama',
        html: `<p>Press <a href="${resetUrl}">here</a> to proceed.</p>`,
    })

    return new Response({'result': true}, PASSWORD_FORGET_EMAIL_SEND).success(res)
}

const resetPassword = async (req, res) => {
    const token = await Token.findOne({token: req.params.verification_token});

    if (!token || req.params.verification_token !== token.token) throw new APIError(INVALID_SESSION, 401);

    if (token.expiresAt > Date.now()) {
        req.session.userId = req.params.id;

        res.sendFile(path.join(__dirname, '/public/view/reset_pass.html'));
    } else {
        //todo: bunun için ayrı html'ler oluştur
        throw new APIError(UNAUTHORIZED, 401);
    }
}

const resetPasswordPOST = async (req, res) => {
    if (!req.body.pass || !req.body.conpass) return new Response(false, CANNOT_BE_EMPTY).error401(res);

    const token = await Token.findOne({userId: req.session.userId})
    const user = await User.findOne({userId: req.session.userId})

    if (!token || token.expiresAt < Date.now()) throw new APIError(INVALID_SESSION, 401);

    if (!user) throw new APIError(INVALID_SESSION, 401);

    if (req.body.pass !== req.body.conpass) return new Response(false, PASSWORD_MUST_SAME).error401(res);

    await user.updateOne({password: await bcrypt.hash(req.body.pass, saltRounds)});
    req.session.destroy();
    await token.deleteOne();

    return new Response(true, PASSWORD_CHANGE_SUCCESS).success(res)
}
const verifyEmail = async (req, res) => {
    const tokenInfo = await Token.findOne({userId: req.params.id});

    //todo: bunun için ayrı html'ler oluştur
    if (!tokenInfo) throw new APIError(UNAUTHORIZED, 401);
    if (req.params.verification_token != tokenInfo.token) throw new APIError(INVALID_SESSION, 401);

    const userInfo = await User.findOne({userId: tokenInfo.userId});

    if (!userInfo.is_verified) {
        if (tokenInfo.expiresAt > Date.now()) {
            userInfo.is_verified = true;
            res.sendFile(path.join(__dirname, '../../public/view/verified.html'));
            await userInfo.save();
            await tokenInfo.deleteOne();
        } else {
            //todo: bunun için ayrı html'ler oluştur
            throw new APIError(UNAUTHORIZED, 401);
        }
    } else {
        //todo: bunun için ayrı html'ler oluştur
        throw new APIError(UNAUTHORIZED, 401);
    }
}

const getUser = async (req, res) => {
    const userInfo = await userFromToken(req.body.token);
    return new Response(userInfo, SUCCESS).success(res);
}

module.exports = {
    login, register, forgetPassword, resetPassword, verifyEmail, resetPasswordPOST, getUser,
}