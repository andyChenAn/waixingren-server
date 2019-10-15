const db = require('../../db/company');
const UserDB = require('../../db/user');
const User = require('../../mongo/user_info/index');
const userHomePage = require('../../mongo/user_homepage/index');
const Mapping = require('../../mongo/system_mapping/index');
const Company = require('../../mongo/company/index');
class TeamDao {
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
    // 插入方法，一个私有方法，提供插入功能
    _insert (db , sql , sqlParams) {
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
    // 获取管理团队列表
    getTeamList (page , pageSize , type , companyId , personId) {
        let sql = `select * from \`tb_company_manageTeam-list\` where 1`;
        let order = ' order by CM_AddTime desc';
        if (companyId) {
            sql += ` and CM_CompanyID = '${companyId}'`;
            order = ` order by CM_LastUpdateTime desc`;
        } else if (personId) {
            sql += ` and CM_ID = '${personId}'`;
            order = ` order by CM_LastUpdateTime desc`;
        };
        if (type && type != 'A') {
            sql += ` and CM_IsCheck = '${type}'`;
            order = ` order by CM_LastUpdateTime desc`;
        }
        sql += `${order} limit ${(page - 1) * pageSize} , ${pageSize}`;
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
    // 获取列表总数
    getTeamTotal (type , companyId , personId) {
        let sql = `select count(*) as total from \`tb_company_manageTeam-list\` where 1`;
        if (type && type != 'A') {
            sql += ` and CM_IsCheck = '${type}'`;
        };
        companyId && (sql += ` and CM_CompanyID = '${companyId}'`);
        personId && (sql += ` and CM_ID = '${personId}'`);
        return this._select(db , sql);
    }
    // 通过id获取相应的管理团队的信息
    getTeamData (personId) {
        let sql = `select * from \`tb_company_manageTeam-list\` where CM_ID = '${personId}'`;
        return this._select(db , sql);
    }
    // 更新具体的管理团队信息
    updateTeamInfo (personId , type) {
        let updateTime = parseInt(new Date().getTime() / 1000);
        let sql = `update \`tb_company_manageTeam-list\` set CM_IsCheck = ? , CM_LastUpdateTime = ? where CM_ID = ?`;
        let sqlParams = [type , updateTime , personId];
        return this._update(db , sql , sqlParams);
    }
    // 获取管理团队公司状态
    getCompanyDataById (companyId) {
        let sql = `select * from \`tb_company_status_manageTeam\` where CSM_CompanyID = '${companyId}'`;
        return this._select(db , sql);
    }
    // 更新公司状态
    updateCompanyInfoById (companyId , num) {
        let updateTime = parseInt(new Date().getTime() / 1000);
        let sql = `update \`tb_company_status_manageTeam\` set CSM_TotalNum = ? , CSM_LastUpdateTime = ? where CSM_CompanyID = ?`;
        let sqlParams = [num , updateTime , companyId];
        return this._update(db , sql , sqlParams);
    }
    // 插入一条公司状态数据
    insertCompanyInfo (companyId , addTime , updateTime , totalNum , snatchNum) {
        let sql = `insert into \`tb_company_status_manageTeam\` (CSM_CompanyID , CSM_SnatchNum , CSM_TotalNum , CSM_AddTime , CSM_LastUpdateTime) values (? , ? , ? , ? , ?)`;
        let sqlParams = [companyId , snatchNum , totalNum , addTime , updateTime];
        return this._insert(db , sql . sqlParams);
    }
}
module.exports = new TeamDao();