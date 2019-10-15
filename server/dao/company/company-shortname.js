const companyDB = require('../../db/company');
const Mapping = require('../../mongo/system_mapping/index');
const Company = require('../../mongo/company/index');
class ShortnameDao {
    // 查询方法，一个私有方法，提供查询功能
    _select (db , sql , sqlParams) {
        return db.connect().then(connection => {
            return new Promise((resolve , reject) => {
                connection.query(sql , sqlParams , (err , result) => {
                    connection.release();
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                })
            })
        })
    }
    // 通过公司id获取公司信息
    getCompanyDataById (id) {
        return Promise.all([
            this.getCompanyData(id) , 
            this.getCompanyMapping()
        ])
        .then(res => {
            let company = res[0];
            let mapping = res[1].collect.company.ci.tb_company_info;
            let data = {};
            for (let key in mapping) {
                if (company[key]) {
                    data[mapping[key]] = company[key];
                }
            };
            return data;
        })
        .catch(err => {
            throw err;
        })
    }
    getCompanyData (id) {
        return new Promise((resolve , reject) => {
            Company.findById(id , (err , result) => {
                if (err) {
                    reject(err);
                } else {
                    result = JSON.parse(JSON.stringify(result));
                    if (result['ci']) {
                        resolve(result['ci'])
                    } else {
                        resolve({})
                    }
                }
            })
        })
    }
    getCompanyMapping () {
        return new Promise((resolve , reject) => {
            Mapping.find({} , (err , result) => {
                if (err) {
                    reject(err);
                } else {
                    result = JSON.parse(JSON.stringify(result));
                    result.forEach(item => {
                        if (item.collect && 
                            item.collect.company &&
                            item.collect.company.ci
                        ) {
                            resolve(item);
                            return;
                        }
                    });
                }
            })
        })
    }
    getCompanyShortNameList (page , pageSize) {
        let sql = `select * from \`tb_company_edit_log\` where CEL_ShortName != 0 order by CEL_LastUpdateTime desc limit ${(page - 1) * pageSize} , ${pageSize}`;
        return this._select(companyDB , sql);
    }
    getCompanyShortNameTotal () {
        let sql = `select count(*) as total from \`tb_company_edit_log\` where CEL_ShortName != 0`;
        return this._select(companyDB , sql);
    }
}
module.exports = new ShortnameDao();