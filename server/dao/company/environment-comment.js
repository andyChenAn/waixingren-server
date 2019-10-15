const db = require('../../db/company');
const Company = require('../../mongo/company/index');
const Mapping = require('../../mongo/system_mapping/index');
const User = require('../../mongo/user_info/index');
const userHomePage = require('../../mongo/user_homepage/index');
class EnvironmentCommentDao {
    // 查询方法，一个私有方法，提供查询功能
    _select (sql , sqlParams) {
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
    _update (sql , sqlParams) {
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
    // 获取环境评论列表
    getEnvironmentList (type , page , pageSize , companyId , environmentId) {
        let sql = `select * from \`tb_company_photoComment-list\` where 1`;
        if (type && type != 'A') {
            if (type == 'U') {
                sql += ` and CP_IsAdminCheck='${type}'`;
            } else {
                sql += ` and CP_IsCheck='${type}'`
            }
        };
        companyId && (sql += ` and CP_CompanyID = '${companyId}'`);
        environmentId && (sql += ` and CP_PhotoID = '${environmentId}'`);
        if (!companyId && !environmentId) {
            sql += ` order by CP_AddTime desc limit ${(page - 1) * pageSize} , ${pageSize}`;
        } else {
            sql += ` order by CP_LastCheckTime desc limit ${(page - 1) * pageSize} , ${pageSize}`;
        }
        return this._select(sql);
    }
    // 通过评论id获取环境评论内容
    getEnvironmentContentById (commentId) {
        let sql = `select * from \`tb_company_photoComment-content\` where CP_CommentID='${commentId}'`;
        return this._select(sql);
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
    // 获取列表总条数
    getEnvironmentTotal (type , companyId , environmentId) {
        let sql = `select count(*) as total from \`tb_company_photoComment-list\` where 1`;
        (type && type != 'A') && (sql += ` and CP_IsCheck='${type}'`);
        companyId && (sql += ` and CI_CompanyID=${companyId}`);
        environmentId && (sql += ` and CI_ID=${environmentId}`);
        return this._select(sql);
    }
    // 获取环境评论表中单行数据
    getOneEnvironmentCommentById (commentId) {
        let sql = `select * from \`tb_company_photoComment-list\` where CP_ID = '${commentId}'`;
        return this._select(sql);
    }
    // 更新环境评论表中状态
    updateEnvironmentCommentStatus (commentId , checkType , isAdminCheck) {
        let updateTime = parseInt(new Date().getTime() / 1000);
        let sql = '';
        let sqlParams = '';
        if (isAdminCheck) {
            sql = `update \`tb_company_photoComment-list\` set CP_IsCheck = ? , CP_IsAdminCheck = ? , CP_LastCheckTime = ? , CP_LastUpdateTime = ? where CP_ID = ?`;
            sqlParams = [checkType , 'Y' , updateTime , updateTime , commentId]
        } else {
            sql = `update \`tb_company_photoComment-list\` set CP_IsCheck = ? ,  CP_LastUpdateTime = ? where CP_ID = ?`;
            sqlParams = [checkType , updateTime , commentId];
        }
        return this._update(sql , sqlParams);
    }
    // 获取单条公司环境列表数据
    getOneEnvironmentById (environmentId) {
        let sql = `select * from \`tb_company_photo-list\` where CP_ID=${environmentId}`;
        return this._select(sql);
    }
    // 插入一个记录到公司环境表中
    // insertOneEnvironment (environmentId , num) {
    //     let updateTime = parseInt(new Date().getTime() / 1000);
    //     let sql = `insert into \`tb_company_photo-list\`(CP_CommentNum , CP_AddTime , CP_LastUpdateTime)`
    // }
    // 更新环境评论数
    updateEnvironmentCommentNum (environmentId , number) {
        let updateTime = parseInt(new Date().getTime() / 1000);
        let sql = `update \`tb_company_photo-list\` set CP_CommentNum = ? , CP_LastUpdateTime = ? where CP_ID = ?`;
        let sqlParams = [number , updateTime , environmentId];
        return this._update(sql , sqlParams);
    }
}
module.exports = new EnvironmentCommentDao();