const joi = require('joi')
const APIError = require('../../../../utils/errors')
const {
    FOLLOW_VALIDATION_RULES
} = require('../../../../utils/response_string')

class AuthValidation {
    constructor() {
    }

    static register = async (req, res, next) => {
        try {
            await joi.object({
                // name: joi.string().trim().min(4).max(100).required(),
                email: joi.string().email().trim().min(3).max(100).required(),
                password: joi.string().trim().min(6).max(36).required(),
                // photo_url: joi.string().trim().min(6).max(100),
                // sign_up_time: joi.string().trim().min(1).max(100),
                // last_sign_in: joi.string().trim().min(1).max(100),
                // is_sign_in: joi.boolean(),
                // is_google_sign_in: joi.boolean().required(),
                // token: joi.string().trim().min(4).max(100).required()
            }).validateAsync(req.body)
        } catch (e) {
            if (e.details && e?.details[0].message)
                throw new APIError(e.details[0].message, 400)
            else throw new APIError(FOLLOW_VALIDATION_RULES, 400)
        }

        next();
    }

    static login = async (req, res, next) => {
        try {
            await joi.object({
                email: joi.string().email().trim().min(3).max(100).required(),
                password: joi.string().trim().min(6).max(36).required()
            }).validateAsync(req.body)
        } catch (e) {
            if (e.details && e?.details[0].message)
                throw new APIError(e.details[0].message, 400)
            else throw new APIError(FOLLOW_VALIDATION_RULES, 400)
        }

        next();
    }

    static forgetPassword = async (req, res, next) => {
        try {
            await joi.object({
                email: joi.string().email().trim().min(3).max(100).required(),
            }).validateAsync(req.body)
        } catch (e) {
            if (e.details && e?.details[0].message)
                throw new APIError(e.details[0].message, 400)
            else throw new APIError(FOLLOW_VALIDATION_RULES, 400)
        }

        next();
    }

    static verifyUser = async (req, res, next) => {
        try {
            await joi.object({
                email: joi.string().email().trim().min(3).max(100).required(),
                code: joi.string().trim().min(1).max(30).required(),
            }).validateAsync(req.body)
        } catch (e) {
            if (e.details && e?.details[0].message)
                throw new APIError(e.details[0].message, 400)
            else throw new APIError(FOLLOW_VALIDATION_RULES, 400)
        }

        next();
    }

    static getUser = async (req, res, next) => {
        try {
            await joi.object({
                token: joi.string().trim().min(3).max(1000).required(),
            }).validateAsync(req.body)
        } catch (e) {
            if (e.details && e?.details[0].message)
                throw new APIError(e.details[0].message, 400)
            else throw new APIError(FOLLOW_VALIDATION_RULES, 400)
        }

        next();
    }
}

module.exports = AuthValidation