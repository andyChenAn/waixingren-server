const mongoose = require('mongoose');
const config = require('./config');
const CompanySchema = require('./schema/index');
const companyConnection = mongoose.createConnection(config.url , err => {
    if (err) {
        console.log(`${config.name} mongodb数据库连接失败`);
    } else {
        console.log(`${config.name} mongodb数据库连接成功`);
    }
});
const Company = companyConnection.model('companyModel' , CompanySchema);
module.exports = Company;