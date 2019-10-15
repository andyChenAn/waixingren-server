const db = require('../../db/company');
const Mapping = require('../../mongo/system_mapping/index');
const Company = require('../../mongo/company/index');
class LogoDao {
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
    // 更新方法，一个私有方法，提供更新功能
    _update (db , sql , sqlParams) {
        return db.connect().then(connection => {
            return new Promise((resolve , reject) => {
                connection.query(sql , sqlParams , (err , result) => {
                    connection.release();
                    if (err) {
                        reject(err);
                    } else {
                        resolve(1);
                    }
                })
            })
        })
    }
    // 获取公司logo列表
    getLogoList (type , page , pageSize , companyId) {
        let sql = `select * from \`tb_company_status_logo\` where 1`;
        (type && type != 'A') && (sql += ` and CSL_IsCheck = '${type}'`);
        companyId && (sql += ` and CSL_CompanyID = '${companyId}'`);
        sql += ` order by CSL_LastUpdateTime desc limit ${(page - 1) * pageSize} , ${pageSize}`;
        return this._select(db , sql);
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
    // 获取公司logo列表总数
    getLogoTotal (type , companyId) {
        let sql = `select count(*) as total from \`tb_company_status_logo\` where 1`;
        (type && type != 'A') && (sql += ` and CSL_IsCheck = '${type}'`);
        companyId && (sql += ` and CSL_CompanyID = '${companyId}'`);
        return this._select(db , sql);
    }
    // 更新公司logo
    updateLogo (companyId , type , path = '' , isSnatch = '') {
        let updateTime = parseInt(new Date().getTime() / 1000);
        let sql = `update \`tb_company_status_logo\` set CSL_IsCheck = ? , CSL_Path = ? , CSL_LastCheckTime = ? , CSL_LastUpdateTime = ? , CSL_IsSnatch = ? where CSL_CompanyID = ?`;
        let sqlParams = [type , path , updateTime , updateTime , isSnatch , companyId];
        return this._update(db , sql , sqlParams);
    }
}
module.exports = new LogoDao();