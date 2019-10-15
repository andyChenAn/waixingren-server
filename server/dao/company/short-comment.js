const db = require('../../db/company');
const User = require('../../mongo/user_info/index');
const userHomePage = require('../../mongo/user_homepage/index');
const Mapping = require('../../mongo/system_mapping/index');
const Company = require('../../mongo/company/index');
class ShortCommentDao {
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
    getCommentList (page = 1 , pageSize = 10 , type = "U" , companyId , commentId) {
        let sql = `select * from \`tb_company_comment-list\` as list , \`tb_company_comment-content\` as content where list.CC_ID=content.CC_CommentID`;
        (type && type != 'A') && (sql += ` and CC_IsCheck='${type}'`);
        companyId && (sql += ` and CC_CompanyID=${companyId}`);
        commentId && (sql += ` and CC_ID=${commentId}`);
        sql += ` and CC_Type ='C' order by CC_LastCheckTime desc limit ${(page- 1) * pageSize} , ${pageSize}`;
        return this._select(sql);
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
        // 有可能芒果没有存储公司信息，那么就需要再从数据库中取，然后再更新到芒果中
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
    // 获取评分
    getGradeById (id) {
        let sql = `select * from \`tb_comment_grade-list\` where \`CG_CommentKey\`='${id}'`;
        return this._select(sql);
    }
    // 获取评论总数
    getCommentTotal (type , companyId , commentId) {
        let sql = `select count(*) as total from \`tb_company_comment-list\` as list , \`tb_company_comment-content\` as content where list.CC_ID=content.CC_CommentID and CC_Type ='C'`;
        (type && type != 'A') && (sql += ` and CC_IsCheck='${type}'`);
        companyId && (sql += ` and CC_CompanyID=${companyId}`);
        commentId && (sql += ` and CC_ID=${commentId}`);
        return this._select(sql);
    }
    // 获取单条公司短评数据
    getOneComment (commentId) {
        let sql = `select * from \`tb_company_comment-list\` where CC_ID=${commentId}`;
        return this._select(sql);
    }
    // 更新短评列表数据
    updateComment (commentId , checkType) {
        let updateTime = parseInt(new Date().getTime() / 1000);
        let sql = `update \`tb_company_comment-list\` set CC_LastCheckTime=? , CC_LastUpdateTime = ? , CC_IsCheck = ? where CC_ID = ?`;
        let sqlParams = [updateTime , updateTime , checkType , commentId];
        return this._select(sql , sqlParams);
    }
    // 获取公司状态
    getCompanyStatusData (companyId) {
        let sql = `select * from \`tb_company_status_comment\` where CSC_CompanyID=${companyId}`;
        return this._select(sql);
    }
    // 更新公司状态
    updateCompanyStatusData (companyId , total) {
        let updateTime = parseInt(new Date().getTime() / 1000);
        let sql = `update \`tb_company_status_comment\` set CSC_CheckNum = ? , CSC_LastCheckTime = ? , CSC_LastUpdateTime = ? where CSC_CompanyID = ?`;
        let sqlParams = [total , updateTime , updateTime , companyId];
        return this._select(sql , sqlParams);
    }
};

module.exports = new ShortCommentDao();
