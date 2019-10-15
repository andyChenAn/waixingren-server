const mongoose = require('mongoose');
const config = require('./config');
const UserHomePageSchema = require('./schema/index');
const userHomePageConnection = mongoose.createConnection(config.url , err => {
    if (err) {
        console.log(`${config.name} mongodb数据库连接失败`);
    } else {
        console.log(`${config.name} mongodb数据库连接成功`);
    }
});
const userHomePage = userHomePageConnection.model('userHomePageModel' , UserHomePageSchema);
module.exports = userHomePage;