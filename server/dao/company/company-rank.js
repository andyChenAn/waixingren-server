const companyDB = require('../../db/company');
const systemDB = require('../../db/system');
const Mapping = require('../../mongo/system_mapping/index');
const Company = require('../../mongo/company/index');
class CompanyRankDao {
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
    // 通过城市名获取地区信息
    getCityDataByName (city) {
        let sql = `select * from \`tb_sort_area\` where SA_Name = '${city}' and SA_IsClose = 'N'`;
        return this._select(systemDB , sql);
    }
    // 获取新上榜公司列表
    getNewRankCompanyList (areaCode , page , pageSize) {
        let sql = `select * from \`tb_company_newRank-list\` where 1`;
        areaCode && (sql += ` and CN_CityCode = '${areaCode}'`);
        sql += ` order by CN_LastUpdateTime desc limit ${(page - 1) * pageSize} , ${pageSize}`;
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
    // 通过城市编码获取城市信息
    getCityDataByCode (code) {
        let sql = `select * from \`tb_sort_area\` where SA_Code = '${code}' and SA_IsClose = 'N'`;
        return this._select(systemDB , sql);
    }
    // 获取新上榜公司列表总数
    getNewRankTotal (areaCode) {
        let sql = `select count(*) as total from \`tb_company_newRank-list\` where 1`;
        areaCode && (sql += ` and CN_CityCode = '${areaCode}'`);
        return this._select(companyDB , sql);
    }
}
module.exports = new CompanyRankDao();