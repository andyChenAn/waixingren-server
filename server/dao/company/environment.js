const db = require('../../db/company');
const UserDB = require('../../db/user');
const User = require('../../mongo/user_info/index');
const userHomePage = require('../../mongo/user_homepage/index');
const Mapping = require('../../mongo/system_mapping/index');
const Company = require('../../mongo/company/index');
class EnvironmentDao { 
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
    // 获取公司环境列表
    getEnvironmentList (type , page , pageSize , companyId , environmentId) {
        let sql = `select * from \`tb_company_photo-list\` where 1`;
        let order = ` order by CP_AddTime desc`;
        if (type && type != 'A') {
            sql += ` and CP_IsCheck = '${type}'`;
            order = 'order by CP_LastUpdateTime desc';
        };
        if (companyId) {
            sql += ` and CP_CompanyID = '${companyId}'`;
            order = 'order by CP_LastCheckTime desc';
        } else if (environmentId) {
            sql += ` and CP_ID = '${environmentId}'`;
            order = 'order by CP_LastCheckTime desc';
        };
        sql += ` ${order} limit ${(page - 1) * pageSize} , ${pageSize}`;
        return this._select(db , sql);
    }
    // 通过环境id获取公司环境内容信息
    getEnvironmentContent (environmentId) {
        let sql = `select * from \`tb_company_photo-content\` where CP_ID = '${environmentId}'`;
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
    // 通过用户id查找用户信息
    getUserById (id) {
        return Promise.all([
            this.getUserInfoById(id) , 
            this.getUserMapping()
        ])
        .then(res => {
            let userInfo = res[0];
            let userMapping = res[1].collect.userInfo.base.tb_user_info;
            let data = {};
            for (let key in userMapping) {
                if (userInfo && userInfo[key]) {
                    data[userMapping[key]] = userInfo[key];
                }
            };
            return data;
        })
        .catch(err => {
            throw err;
        })
    }
    // 通过userId查找用户信息
    getUserInfoById (id) {
        return new Promise((resolve , reject) => {
            User.findById(id , (err , result) => {
                if (err) {
                    reject(err);
                } else {
                    result = JSON.parse(JSON.stringify(result));
                    resolve(result);
                }
            });
        })
    }
    // 查找system_mapping集合，找到用户信息字段对应的映射
    getUserMapping () {
        return new Promise((resolve , reject) => {
            Mapping.find({} , (err , result) => {
                if (err) {
                    reject(err);
                } else {
                    result = JSON.parse(JSON.stringify(result));
                    result.forEach(item => {
                        if (item.collect && 
                            item.collect.userInfo && 
                            item.collect.userInfo.base && 
                            item.collect.userInfo.base.tb_user_info
                        ) {
                            resolve(item);
                            return;
                        }
                    });
                }
            })
        })
    }
    // 通过用户id获取用户的个人主页信息
    getUserHomePageData (id) {
        return Promise.all([
            this.getHomePageData(id),
            this.getHomePageMapping()
        ])
        .then(res => {
            let homepage = res[0];
            let mapping = res[1].collect.userDomain.base.tb_user_domain;
            let data = {};
            for (let key in mapping) {
                if (homepage && homepage[key]) {
                    data[mapping[key]] = homepage[key];
                }
            };
            return data;
        })
        .catch(err => {
            throw err;
        })
    }
    getHomePageMapping () {
        return new Promise((resolve , reject) => {
            Mapping.find({} , (err , result) => {
                if (err) {
                    reject(err);
                } else {
                    result = JSON.parse(JSON.stringify(result));
                    result.forEach(item => {
                        if (item.collect && 
                            item.collect.userDomain && 
                            item.collect.userDomain.base && 
                            item.collect.userDomain.base.tb_user_domain
                        ) {
                            resolve(item);
                            return;
                        }
                    });
                }
            })
        })
    }
    // 查询芒果的个人主页信息
    getHomePageData (id) {
        return new Promise((resolve , reject) => {
            userHomePage.findById(id , (err , result) => {
                if (err) {
                    reject(err);
                } else {
                    result = JSON.parse(JSON.stringify(result));
                    resolve(result);
                }
            })
        })
    }
    // 获取环境图片标签
    getLabelList (environmentId) {
        let sql = `select * from \`tb_company_photo_album-list\` where CPA_PhotoID = '${environmentId}'`;
        return this._select(db , sql);
    }
    // 通过labelId查找label数据
    getLabelNameById (labelId) {
        let sql = `select * from \`tb_company_photo_label-list\` where CPL_ID = '${labelId}'`;
        return this._select(db , sql);
    }
    // 获取公司环境列表的总数
    getEnvironmentTotal (type , companyId , environmentId) {
        let sql = `select count(*) as total from \`tb_company_photo-list\` where 1`;
        (type && type != 'A') && (sql += ` and CP_IsCheck = '${type}'`);
        companyId && (sql += ` and CP_CompanyID = '${companyId}'`);
        environmentId && (sql += ` and CP_ID = '${environmentId}'`);
        return this._select(db , sql);
    }
    // 根据图片id获取对应的图片信息
    getPhotoInfo (environmentId) {
        let sql = `select * from \`tb_company_photo-list\` where CP_ID = '${environmentId}'`;
        return this._select(db , sql);
    }
    // 根据图片id更新对应的图片信息
    updatePhotoInfo (environmentId , type) {
        let updateTime = parseInt(new Date().getTime() / 1000);
        let sql = `update \`tb_company_photo-list\` set CP_IsCheck = ? , CP_LastCheckTime = ? , CP_LastUpdateTime = ? where CP_ID='${environmentId}'`;
        let sqlParams = [type , updateTime , updateTime];
        return this._update(db , sql , sqlParams);
    }
    // 根据公司id获取对应的公司图片状态信息
    getCompanyStatus (companyId) {
        let sql = `select * from \`tb_company_status_photo\` where CSP_CompanyID = '${companyId}'`;
        return this._select(db , sql);
    }
    // 更新公司图片状态信息
    updateCompanyStatus (companyId , checkNum) {
        let updateTime = parseInt(new Date().getTime() / 1000);
        let sql = `update \`tb_company_status_photo\` set CSP_CheckNum = ? , CSP_LastCheckTime = ? , CSP_LastUpdateTime = ? where CSP_CompanyID = ?`;
        let sqlParams = [checkNum , updateTime , updateTime , companyId];
        return this._update(db , sql , sqlParams);
    }
    // 获取用户图片状态信息
    getUserPhotoStatus (userId) {
        let sql = `select * from \`tb_user_status_photo\` where USP_UserID = '${userId}'`;
        return this._select(UserDB , sql);
    }
    // 更新用户图片状态信息
    updateUserPhotoStatus (userId , checkNum) {
        let updateTime = parseInt(new Date().getTime() / 1000);
        let sql = `update \`tb_user_status_photo\` set USP_CheckNum = ? , USP_LastCheckTime = ? , USP_LastUpdateTime = ? where USP_UserID = ?`;
        let sqlParams = [checkNum , updateTime , updateTime , userId];
        return this._update(UserDB , sql , sqlParams);
    }
}
module.exports = new EnvironmentDao();