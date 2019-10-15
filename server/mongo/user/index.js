const mongoose = require('mongoose');
const config = require('./config');
const userSchema = require('./schema/index');
const userConnection = mongoose.createConnection(config.url , (err) => {
    if (err) {
        console.log(`${config.name} mongodb数据库连接失败`);
    } else {
        console.log(`${config.name} mongodb数据库连接成功`);
    }
});
const UserInfo = userConnection.model("userInfoModel" , userSchema);
module.exports = UserInfo;