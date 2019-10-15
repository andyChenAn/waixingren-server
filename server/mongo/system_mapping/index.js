const mongoose = require('mongoose');
const config = require('./config');
const systemMappingSchema = require('./schema/index');
const systemMappingConnection = mongoose.createConnection(config.url , err => {
    if (err) {
        console.log(`${config.name} mongodb数据库连接失败`);
    } else {
        console.log(`${config.name} mongodb数据库连接成功`);
    }
});
const Mapping = systemMappingConnection.model('MappingModel' , systemMappingSchema);
module.exports = Mapping

