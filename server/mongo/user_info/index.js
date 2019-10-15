const mongoose = require('mongoose');
const config = require('./config');
const userInfoSchema = require('./schema/index');
const userInfoConnection = mongoose.createConnection(config.url , (err) => {
    if (err) {
        console.log(`${config.name} mongodb数据库连接失败`);
    } else {
        console.log(`${config.name} mongodb数据库连接成功`);
    }
});
const User = userInfoConnection.model("userModel" , userInfoSchema);
module.exports = User;