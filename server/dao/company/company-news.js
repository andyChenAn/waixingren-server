const db = require('../../db/company');
const Mapping = require('../../mongo/system_mapping/index');
const Company = require('../../mongo/company/index');
class CompanyNewsDao {
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
    // 获取公司新闻列表
    getNewsListByDefault (page , pageSize , type , companyId , newsId) {
        let sql = `select * from \`tb_company_news\` where 1`;
        (type && type != 'A') && (sql += ` and CN_IsDelete = '${type}'`);
        companyId && (sql += ` and CN_CompanyID = '${companyId}'`);
        newsId && (sql += ` and CN_ID = '${newsId}'`);
        sql += ` order by CN_NewTime desc limit ${(page - 1) * pageSize} , ${pageSize}`;
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
                    console.log(result);
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
    // 通过行业来获取公司新闻列表
    getNewsListByIndustry (industry , type , page , pageSize , newsTime) {
        let sql = `select * from \`tb_company_news_city-list\` where CNC_Industry = '${industry}'`;
        (type && type != 'A') && (sql += ` and CNC_IsDelete = '${type}'`);
        // 通过时间来筛选
        newsTime && (sql += ` and CNC_NewTime > '${newsTime}'`);
        sql += ` order by CNC_NewTime desc limit ${(page - 1) * pageSize} , ${pageSize}`;
        return this._select(db , sql);
    }
    // 通过新闻id来获取公司新闻内容
    getNewsInfo (newsId) {
        let sql = `select * from tb_company_news where CN_ID = '${newsId}'`;
        return this._select(db , sql);
    }
    // 通过type为M来获取公司新闻列表
    getNesListByMatch (page , pageSize) {
        let sql = `select * from \`tb_admin_company_news\` where 1 order by ACN_LastUpdateTime desc limit ${(page - 1) * pageSize} , ${pageSize}`;
        return this._select(db , sql);
    }
    // 通过推广状态获取公司新闻列表
    getNewsListByPromotionStatus (status , page  , pageSize , hasPromotionTime) {
        let sql = `select * from \`tb_company_news\` where CN_IsDelete = 'N'`;
        status && (sql += ` and CN_IsPromotion = '${status}'`);
        hasPromotionTime && (sql += ` and CN_PromotionTime != 0`);
        sql += ` order by CN_NewTime desc limit ${(page - 1) * pageSize} , ${pageSize}`;
        return this._select(db , sql);
    }
    // 通过推广状态获取公司新闻总数
    getNewsTotalByPromotionStatus (status , hasPromotionTime) {
        let sql = `select count(*) as total from \`tb_company_news\` where CN_IsDelete = 'N'`;
        status && (sql += ` and CN_IsPromotion = '${status}'`);
        hasPromotionTime && (sql += ` and CN_PromotionTime != 0`);
        return this._select(db , sql);
    }
    // 通过type为M来获取公司新闻总数
    getNewsTotalByMatch () {
        let sql = `select count(*) as total from \`tb_admin_company_news\``;
        return this._select(db , sql);
    }
    // 默认方式获取公司新闻列表总数
    getNewsTotalByDefault (type , companyId , newsId) { 
        let sql = `select count(*) as total from \`tb_company_news\` where 1`;
        (type && type != 'A') && (sql += ` and CN_IsDelete = '${type}'`);
        companyId && (sql += ` and CN_CompanyID = '${companyId}'`);
        newsId && (sql += ` and CN_ID = '${newsId}'`);
        return this._select(db , sql);
    }
    // 通过行业来获取公司列表总数
    getNewsTotalByIndustry (industry , type , newsTime) {
        let sql = `select count(*) as total from \`tb_company_news_city-list\` where CNC_Industry = '${industry}'`;
        (type && type != 'A') && (sql += ` and CNC_IsDelete = '${type}'`);
        // 通过时间来筛选
        newsTime && (sql += ` and CNC_NewTime > '${newsTime}'`);
        return this._select(db , sql);
    }
    // 更新公司新闻
    updateByNewsId (newsId , type , companyId) {
        let updateTime = parseInt(new Date().getTime() / 1000);
        let sql = `update \`tb_company_news\` set CN_IsDelete = ? , CN_LastUpdateTime = ? , CN_CompanyID = ? where CN_ID = ?`;
        let sqlParams = [type , updateTime , companyId , newsId];
        return this._update(db , sql , sqlParams);
    }
    // 更新公司新闻状态
    updateNewsStatus (newsId , type) {
        let updateTime = parseInt(new Date().getTime() / 1000);
        let sql = `update \`tb_company_news_city-list\` set CNC_IsDelete = ? , CNC_LastUpdateTime = ? where CNC_NewsID = ?`;
        let sqlParams = [type , updateTime , newsId];
        return this._update(db , sql , sqlParams);
    }
    // 通过公司id获取公司信息
    getCompanyInfoById (companyId) {
        let sql = `select * from \`tb_company_status_news\` where CSN_CompanyID = '${companyId}'`;
        return this._select(db , sql);
    }
    // 更新公司状态表
    updateNumById (companyId , num) {
        let updateTime = parseInt(new Date().getTime() / 1000);
        let sql = `update \`tb_company_status_news\` set CSN_NewsNum = ? , CSN_LastUpdateTime = ? where CSN_CompanyID = ?`;
        let sqlParams = [num , updateTime , companyId];
        return this._update(db , sql , sqlParams);
    }
}

module.exports = new CompanyNewsDao();