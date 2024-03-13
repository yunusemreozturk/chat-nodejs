const crypto = require("crypto");

function randomId() {
    return crypto.randomBytes(8).toString("hex");
}

function getUniqueArray(array) {
    if (!Array.isArray(array)) return;

    return array.filter((item, index) => {
        return index === array.findIndex(obj => obj.userId === item.userId);
    });
}

module.exports = {randomId, getUniqueArray}