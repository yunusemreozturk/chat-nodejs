const {MongoMemoryServer} = require("mongodb-memory-server");
const mongoose = require("mongoose");
const mongod = new MongoMemoryServer();

module.exports.connect = async () => {
    await mongoose.connect(process.env.DATABASE_URL).then(() => {
        console.log('DB_connect: Success')
    }).catch((err) => {
        console.log('DB_connect: Error', err)
    })
}

module.exports.closeDatabase = async () =>{
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
}

module.exports.clearDatabase = async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
}