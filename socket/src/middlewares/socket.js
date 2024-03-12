const getUser = require("../../../utils/auth_utils")
const randomId = require("../../../utils/utils")


module.exports =  async function socketMiddlewares(socket, next) {
    const sessionID = socket.handshake.headers.session_id;
    const accessToken = socket.handshake.headers.access_token;

    if (sessionID) {
        const session = sessionStore.findSession(sessionID);

        if (session) {
            const user = await getUser(accessToken);
            socket.sessionID = sessionID;
            socket.accessToken = session.accessToken;
            socket.user = user;

            return next();
        }
    }

    if (!accessToken) {
        return next(new Error("invalid accessToken"));
    }

    // create new session
    socket.sessionID = randomId();
    socket.accessToken = accessToken;
    socket.user = await getUser(accessToken);

    next();
}