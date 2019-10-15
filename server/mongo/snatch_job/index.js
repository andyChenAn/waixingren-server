const mongoose = require('mongoose');
const config = require('./config');
const SnatchJobSchema = require('./schema/index');
const snatchJobConnection = mongoose.createConnection(config.url , err => {
    if (err) {
        console.log(`${config.name} mongodb数据库连接失败`);
    } else {
        console.log(`${config.name} mongodb数据库连接成功`);
    }
});
const SnatchJob = snatchJobConnection.model('snatchJobModel' , SnatchJobSchema);
module.exports = SnatchJob;