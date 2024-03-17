const createApp = require("./src/app");
const port = process.env.PORT_CHAT_API;
const server = createApp();

server.listen(port, () => {
    console.log(`Server is running on ${process.env.URL + port}`)
})

