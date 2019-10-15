const companyDB = require('../../db/company');
const systemDB = require('../../db/system');
const UserInfo = require('../../mongo/user/index');
const userHomePage = require('../../mongo/user_homepage/index');
const Mapping = require('../../mongo/system_mapping/index');
const Company = require('../../mongo/company/index');
class LongReplyDao {
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
    // 获取长评回复列表
    getReplyList (page , pageSize , type , commentId , replyId) {
        let sql = `select * from \`tb_company_review_reply-list\` where 1`;
        if (commentId) {
            sql += ` and CRR_ReviewID = '${commentId}'`;
        } else if (replyId) {
            sql += ` and CRR_ID = '${replyId}'`;
        };
        (type && type != 'A') && (sql += ` and CRR_IsAdminCheck= '${type}'`);
        sql += ` order by CRR_AddTime desc limit ${(page - 1) * pageSize} , ${pageSize}`;
        return this._select(companyDB , sql);
    }
    // 通过用户id查找用户信息
    getUserById (id) {
        return Promise.all([
            this.getUserInfoById(id) , 
            this.getUserMapping()
        ])
        .then(res => {
            let userInfo = res[0] && res[0]['ui'];
            let userMapping = res[1];
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
            UserInfo.findById(id , (err , result) => {
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
                            item.collect.userInfo.ui && 
                            item.collect.userInfo.ui.tb_user_info
                        ) {
                            resolve(item.collect.userInfo.ui.tb_user_info);
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
    // 通过邮编获取城市
    getAreaByCode (code) {
        let sql = `select * from \`tb_sort_area\` where SA_Code = '${code}' and SA_IsClose='N'`;
        return this._select(systemDB , sql);
    }
    // 获取回复内容
    getReplyContent (replyId) {
        let sql = `select * from \`tb_company_review_reply-content\` where CRR_ReviewReplyID='${replyId}'`;
        return this._select(companyDB , sql);
    }
    // 获取公司长评列表
    getOneComment (commentId) {
        let sql = `select * from \`tb_company_review-list\` where CR_ID='${commentId}'`;
        return this._select(companyDB , sql);
    }
    // 获取公司长评信息
    getOneCommentInfo (commentId) {
        let sql = `select * from \`tb_company_review-content\` where CR_ReviewID='${commentId}'`;
        return this._select(companyDB , sql);
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
}
module.exports = new LongReplyDao();