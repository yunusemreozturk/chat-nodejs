const crypto = require("crypto");

module.exports = function randomId() {
    return crypto.randomBytes(8).toString("hex");
};
