const {
    SUCCESS,
    CREATED,
    SERVER_ERROR,
    BAD_REQUEST,
    UNAUTHORIZED,
    NOT_FOUND,
    TOO_MANY_REQUEST
} = require("../const/responce_string")

class Response {
    constructor(data = null, code = null) {
        this.data = data
        this.code = code
    }

    success(res) {
        return res.status(200).json({
            success: true,
            data: this.data,
            code: this.code ?? SUCCESS
        })
    }

    created(res) {
        return res.status(201).json({
            success: true,
            data: this.data,
            code: this.code ?? CREATED
        })
    }

    error500(res) {
        return res.status(500).json({
            success: false,
            code: this.code ?? SERVER_ERROR
        })
    }

    error400(res) {
        return res.status(400).json({
            success: false,
            code: this.code ?? BAD_REQUEST
        })
    }

    error401(res) {
        return res.status(401).json({
            success: false,
            code: this.code ?? UNAUTHORIZED
        })
    }

    error404(res) {
        return res.status(404).json({
            success: false,
            code: this.code ?? NOT_FOUND
        })
    }

    error429(res) {
        return res.status(429).json({
            success: false,
            code: this.code ?? TOO_MANY_REQUEST
        })
    }
}

module.exports = Response