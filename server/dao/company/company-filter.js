const db = require('../../db/company');
const Mapping = require('../../mongo/system_mapping/index');
const Company = require('../../mongo/company/index');
class FilterDao {
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
    // 获取可信公司列表
    getFilterCompanyList (page , pageSize , type) {
        let sql = `select * from \`tb_company_filterManage\` where CF_IsFilter = '${type}'`;
        sql += ` order by CF_LastUpdateTime desc limit ${(page - 1) * pageSize} , ${pageSize}`;
        return this._select(db , sql);
    }
    // 通过公司id获取公司
    getFilterCompanyListById (companyId , type) {
        let sql = `select * from \`tb_company_filterManage\` where CF_CompanyID = '${companyId}' and CF_IsFilter = '${type}'`;
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
    // 获取可信公司列表总数
    getFilterCompanyTotal (type) {
        let sql = `select count(*) as total from \`tb_company_filterManage\` where CF_IsFilter = '${type}'`;
        return this._select(db , sql);
    }
    // 从删除公司列表中获取公司
    getInfoById (companyId) {
        let sql = `select * from \`tb_delCompany\` where DC_CompanyID = '${companyId}'`;
        return this._select(db , sql);
    }
    // 从合并公司列表中获取公司
    getMergeById (companyId , targetCompanyId , isRecovery = '') {
        let sql = `select * from \`tb_company_combine-list\` where 1`;
        companyId && (sql += ` and CC_CompanyID = '${companyId}'`);
        targetCompanyId && (sql += ` and CC_TargetCompanyID = '${targetCompanyId}'`);
        isRecovery && (sql += ` and CC_IsRecovery = '${isRecovery}'`);
        return this._select(db , sql);
    }
    // 更新可信公司
    updateFilterStatus (companyId , type , isAdminEdit , admin) {
        let updateTime = parseInt(new Date().getTime() / 1000);
        let sql = `update \`tb_company_filterManage\` set CF_IsFilter = ? , CF_IsEdit = ? , CF_Administrator = ? , CF_LastUpdateTime = ? where CF_CompanyID = ?`;
        let sqlParams = [type , isAdminEdit , admin , updateTime , companyId];
        return this._update(db , sql , sqlParams);
    }
    // 获取公司职位列表类型
    getTypeListById (companyId) {
        let sql = `select * from \`tb_company_jobType-list\` where CJL_CompanyID = '${companyId}'`;
        return this._select(db , sql);
    }
    updateCompanyStatus (id , status = 'D') {
        let updateTime = parseInt(new Date().getTime() / 1000);
        let sql = `update \`tb_company_jobType-list\` set CJL_Status = ? , CJL_LastUpdateTime = ? where CJL_ID = ?`;
        let sqlParams = [status , updateTime , id];
        return this._update(db , sql , sqlParams);
    }
}
module.exports = new FilterDao();