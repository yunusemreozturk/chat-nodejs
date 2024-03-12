const mongoose = require("mongoose");

mongoose.connect(process.env.DATABASE_URL).then(() => {
    console.log('DB_connect: Success')
}).catch((err) => {
    console.log('DB_connect: Error', err)
})
