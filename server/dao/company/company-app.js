const companyDB = require('../../db/company');
class AppDao {
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
    getAppListByDefault (page , pageSize , type) {
        let sql = `select * from \`tb_admin_product_company-list\` where 1`;
        if (type == 'A' || !type) {
            sql += ` and APC_MatchCompanyID is null`;
        } else if (type == 'Y') {
            sql += ` and APC_MatchCompanyID > 0`;
        } else if (type == 'N') {
            sql += ` and APC_MatchCompanyID = 0`;
        }
        sql += ` order by APC_SnatchTime desc limit ${(page - 1) * pageSize} , ${pageSize}`;
        return this._select(companyDB , sql);
    }
    // 通过公司id获取公司产品
    getProductById (companyId) {
        let sql = `select * from \`tb_admin_product-list\` where AP_CompanyID = '${companyId}'`;
        return this._select(companyDB , sql);
    }
    // 通过产品id获取产品评分信息
    getProductGradeById (productId) {
        let sql = `select * from \`tb_admin_product_grade-list\` where APG_ProductID = '${productId}'`;
        return this._select(companyDB , sql);
    }
    // 通过产品名称搜索的列表
    getProductListByName (page , pageSize , appName) {
        let sql = `select * from \`tb_admin_product-list\` where AP_Name like '%${appName}%'`;
        sql += ` limit ${(page - 1) * pageSize} , ${pageSize}`;
        return this._select(companyDB , sql);
    }
    // 通过公司id获取公司信息
    getCompanyInfoById (companyId) {
        let sql = `select * from \`tb_admin_product_company-list\` where APC_ID = '${companyId}'`;
        return this._select(companyDB , sql);
    }
    // 通过产品名称获取总数
    getTotalByName (appName) {
        let sql = `select count(*) as total from \`tb_admin_product-list\` where AP_Name like '%${appName}%'`;
        return this._select(companyDB , sql);
    }
    // 通过匹配类型获取总数
    getTotalByType (type) {
        let sql = `select count(*) as total from \`tb_admin_product_company-list\` where 1`;
        if (type == 'A' || !type) {
            sql += ` and APC_MatchCompanyID is null`;
        } else if (type == 'Y') {
            sql += ` and APC_MatchCompanyID > 0`;
        } else if (type == 'N') {
            sql += ` and APC_MatchCompanyID = 0`;
        };
        return this._select(companyDB , sql);
    }
    // 更新公司信息
    updateInfoById (adminProductCompanyId , jobuiCompanyId) {
        let updateTime = parseInt(new Date().getTime() / 1000);
        let sql = `update \`tb_admin_product_company-list\` set APC_MatchCompanyID = ? , APC_LastUpdateTime = ? where APC_ID = ?`;
        let sqlParams = [jobuiCompanyId , updateTime , adminProductCompanyId];
        return this._update(companyDB , sql , sqlParams);
    }
    // 获取匹配的公司的产品状态信息
    getProductStatus (companyId) {
        let sql = `select * from \`tb_company_status_product\` where CSP_CompanyID = '${companyId}'`;
        return this._select(companyDB , sql);
    }
    // 新增公司产品
    insertProduct (jobuiCompanyId , adminProductName , adminProductWebsite , adminProductLogoPath , adminProductDesc , promotionStauts = 'N' , promotionTime = '' , clickNum = '' , isApp = '' , isSnatch = '' , adminProductShortContent , adminProductFirstCategory , adminProductSecondCategory , adminProductThirdCategory , adminProductSnatchTime) {
        let data = {};
        let updateTime = parseInt(new Date().getTime() / 1000);
        data['CP_CompanyID'] = jobuiCompanyId;
        data['CP_Name'] = adminProductName;
        data['CP_Website'] = adminProductWebsite;
        data['CP_Path'] = adminProductLogoPath;
        data['CP_Description'] = adminProductDesc;
        data['CP_IsChecked'] = 'Y';
        data['CP_PromotionStatus'] = promotionStauts;
        promotionTime && (data['CP_PromotionTime'] = promotionTime);
        clickNum && (data['CP_ClickNum'] = clickNum);
        adminProductShortContent && (data['CP_ShortContent'] = adminProductShortContent);
        adminProductFirstCategory && (data['CP_FirstCategory'] = adminProductFirstCategory);
        adminProductSecondCategory && (data['CP_SecondCategory'] = adminProductSecondCategory);
        adminProductThirdCategory && (data['CP_ThirdCategory'] = adminProductThirdCategory);
        data['CP_IsApp'] = isApp ? isApp : 'N';
        data['CP_IsSnatch'] = isSnatch ? isSnatch : 'N';
        if (adminProductSnatchTime) {
            data['CP_AddTime'] = adminProductSnatchTime;
        } else {
            data['CP_AddTime'] = updateTime;
        }
        data['CP_LastUpdateTime'] = updateTime;
        let keys = Object.keys(data);
        let zanwei = new Array(keys.length);
        zanwei.fill('?');
        let sql = `insert into \`tb_company_product-list\` (${keys.join(',')}) values (${zanwei.join(',')})`;
        let sqlParams = Object.values(data);
        return this._insert(companyDB , sql , sqlParams);
    }
    // 获取公司产品照片列表
    getAdminProductImageList (productId , page , pageSize) {
        let sql = `select * from \`tb_admin_product_photo-list\` where APP_ProductID = '${productId}' limit ${(page - 1) * pageSize} , ${pageSize}`;
        return this._select(companyDB , sql);
    }
    // 通过产品名称获取产品列表信息
    getProductByName (productName) {
        let sql = `select * from \`tb_company_product-list\` where CP_Name = '${productName}'`;
        return this._select(companyDB , sql);
    }
    // 添加产品介绍图片
    addProductInfoPhoto (productId , photoName , isDelete = 'N' , addTime) {
        let updateTime = parseInt(new Date().getTime() / 1000);
        addTime && (updateTime = addTime);
        let sql = `insert into \`tb_company_productInfo_photo-list\` (CPP_ProductID , CPP_Path , CPP_IsDelete , CPP_AddTime , CPP_LastUpdateTime) values (? , ? , ? , ? , ?)`;
        let sqlParams = [productId , photoName , isDelete , updateTime , updateTime];
        return this._insert(companyDB , sql , sqlParams);
    }
    // 获取产品评分列表
    getAdminProductGradeList (productId , page , pageSize) {
        let sql = `select * from \`tb_company_product_grade-list\` where CPG_ProductID = '${productId}' limit ${(page - 1) * pageSize} , ${pageSize}`;
        return this._select(companyDB , sql);
    }
    // 添加一条评分
    addProductGradeInfo (productId , sourceName , grade , downloadNum , sourceUrl , appVersion , appUpdateTime , addTime , isDelete = 'N') {
        let data = {};
        let updateTime = parseInt(new Date().getTime() / 1000);
        data['CPG_ProductID'] = productId;
        data['CPG_SourceName'] = sourceName;
        data['CPG_Grade'] = grade;
        data['CPG_Download'] = downloadNum;
        data['CPG_AppVersion'] = appVersion;
        data['CPG_AppUpdateTime'] = appUpdateTime;
        data['CPG_SourceUrl'] = sourceUrl;
        isDelete && (data['CPG_IsDelete'] = isDelete);
        if (addTime) {
            data['CPG_AddTime'] = addTime;
        } else {
            data['CPG_AddTime'] = updateTime;
        };
        data['CPG_LastUpdateTime'] = updateTime;
        let keys = Object.keys(data);
        let zanwei = new Array(keys.length);
        zanwei.fill('?');
        let sql = `insert into \`tb_company_product_grade-list\` (${keys.join(',')}) values (${zanwei.join(',')})`;
        let sqlParams = Object.values(data);
        return this._insert(companyDB , sql , sqlParams);
    }
    // 通过公司id获取公司产品状态
    getStatusById (companyId) {
        let sql = `select * from \`tb_company_status_product\` where CSP_CompanyID = '${companyId}'`;
        return this._select(companyDB , sql);
    }
    // 更新公司信息
    updateCompanyStatus (companyId , num , userId) {
        let updateTime = parseInt(new Date().getTime() / 1000);
        let sql = `update \`tb_company_status_product\` set CSP_UserID = ? , CSP_ProductNum = ? , CSP_LastUpdateTime = ? where CSP_CompanyID = ?`;
        let sqlParams = [userId , num , updateTime , companyId];
        return this._update(companyDB , sql , sqlParams);
    }
    // 向公司产品状态表中插入一条数据
    insertCompanyStatus (companyId , num , userId) {
        let updateTime = parseInt(new Date().getTime() / 1000);
        let sql = `insert into \`tb_company_status_product\`(CSP_CompanyID , CSP_UserID , CSP_ProductNum , CSP_AddTime , CSP_LastUpdateTime) values (? , ? , ? , ? , ?)`;
        let sqlParams = [companyId , userId , num , updateTime , updateTime];
        return this._insert(companyDB , sql , sqlParams);
    }
    // 更新找不到产品对应的公司
    updateProductForNotFound (companyId) {
        let updateTime = parseInt(new Date().getTime() / 1000); 
        let sql = `update \`tb_admin_product_company-list\` set APC_MatchCompanyID = ? , APC_LastUpdateTime = ? where APC_ID = ?`;
        let sqlParams = [0 , updateTime , companyId];
        return this._update(companyDB , sql , sqlParams);
    }
}

module.exports = new AppDao();