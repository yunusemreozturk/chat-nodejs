const createServer = require("./src/server");
const port = process.env.PORT_API;
const server = createServer();

server.listen(port, () => {
    console.log(`Server is running on ${process.env.URL + port}`)
})

