const createApp = require("./src/app");
const port = process.env.PORT_AUTH_API;
const server = createApp();

server.listen(port, () => {
    console.log(`Server is running on ${process.env.URL + port}`)
})

