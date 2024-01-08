const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);

mongoose.connect(process.env.DATABASE_URL).then(() => {
    console.log('DB_connect: Success')
}).catch((err) => {
    console.log('DB_connect: Error', err)
})



