const db = require('../../db/company');
const User = require('../../mongo/user_info/index');
const userHomePage = require('../../mongo/user_homepage/index');
const Mapping = require('../../mongo/system_mapping/index');
const Company = require('../../mongo/company/index');
class ProductCommentDao {
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
    // 插入方法，一个私有方法，提供插入功能
    _insert (sql , sqlParams) {
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
    getProductCommentList (productId , commentId , type , page , pageSize) {
        let sql = `select * from \`tb_company_product_comment-list\` where CPC_IsCheck = '${type}'`;
        commentId && (sql += ` and CPC_CommentID = ${commentId}`);
        productId && (sql += ` and CPC_ProductID = ${productId}`);
        sql += ` order by CPC_AddTime desc limit ${(page - 1) * pageSize} , ${pageSize}`;
        return this._select(sql);
    }
    // 通过产品id获取产品信息
    getProductById (productId) {
        let sql = `select * from \`tb_company_product-list\` where CP_ID = '${productId}'`;
        return this._select(sql);
    }
    // 通过评论id获取产品评论信息
    getCommentById (commentId) {
        let sql = `select * from \`tb_company_product_comment-content\` where CPC_CommentID = '${commentId}'`;
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
    // 通过产品评论id获取产品评论列表数据
    getProductCommentById (commentId) {
        let sql = `select * from \`tb_company_product_comment-list\` where CPC_CommentID = '${commentId}'`;
        return this._select(sql);
    }
    // 更新产品评论列表状态
    updateProductCommentStauts (commentId , checkType) {
        let updateTime = parseInt(new Date().getTime() / 1000);
        let sql = `update \`tb_company_product_comment-list\` set CPC_IsCheck = ? , CPC_LastCheckTime = ? , CPC_LastUpdateTime= ? where CPC_CommentID = ?`;
        let sqlParams = [checkType , updateTime , updateTime , commentId];
        return this._update(sql , sqlParams);
    }
    // 通过产品id获取产品评论状态数据
    getProductInfo (productId) {
        let sql = `select * from \`tb_product_status\` where PS_ProductID='${productId}'`;
        return this._select(sql);
    }
    // 向产品评论状态表中插入一条数据
    insertProductStatus (totalGrade , productId) {
        let updateTime = parseInt(new Date().getTime() / 1000);
        let sql = `insert into \`tb_product_status\`(PS_ProductID , PS_CommentTotalNum , PS_ProductTotalGrade , PS_AddTime , PS_LastUpdateTime) values (? , ? , ? , ? , ?)`;
        let sqlParams = [productId , 1 , totalGrade , updateTime , updateTime];
        return this._insert(sql , sqlParams);
    }
    // 更新产品评论状态
    updateProductStatus (productId , productTotalGrade , commentTotalNum) {
        let updateTime = parseInt(new Date().getTime() / 1000);
        let sql = `update \`tb_product_status\` set PS_CommentTotalNum = ? , PS_ProductTotalGrade = ? , PS_LastUpdateTime = ? where PS_ProductID = ?`;
        let sqlParams = [commentTotalNum , productTotalGrade , updateTime , productId];
        return this._update(sql , sqlParams);
    }
}
module.exports = new ProductCommentDao();