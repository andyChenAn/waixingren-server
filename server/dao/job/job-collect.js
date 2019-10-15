const userDB = require('../../db/user');
const SnatchJob = require('../../mongo/snatch_job/index');
const Mapping = require('../../mongo/system_mapping/index');
const Company = require('../../mongo/company/index');
class JobCollectDao {
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
    // 获取收藏职位列表
    getJobList (companyId , jobId , page , pageSize) {
        let sql = `select * from \`tb_user_collect_position-list\` where UCP_Status = 1`;
        companyId && (sql += ` and UCP_CompanyID = '${companyId}'`);
        jobId && (sql += ` and UCP_PositionID = '${jobId}'`);
        sql += ` group by UCP_PositionID order by UCP_AddTime desc limit ${(page - 1) * pageSize} , ${pageSize}`;
        return this._select(userDB , sql);
    }
    // 从mongodb获取职位信息
    getJobDataById (jobId) {
        return Promise.all([
            this.getJobById(jobId),
            this.getJobMapping()
        ])
        .then(res => {
            let job = res[0];
            let mapping = res[1].collect.job.base.tb_snatch_position_info;
            let data = {};
            for (let key in mapping) {
                if (job && job[key]) {
                    data[mapping[key]] = job[key];
                } else {
                    data[mapping[key]] = null;
                }
            };
            return data;
        })
        .catch(err => {
            throw err;
        });
    }
    getJobById (jobId) {
        return new Promise((resolve , reject) => {
            SnatchJob.findById(jobId , (err , result) => {
                if (err) {
                    reject(err);
                } else {
                    result = JSON.parse(JSON.stringify(result));
                    resolve(result);
                }
            })
        })
    }
    getJobMapping () {
        return new Promise((resolve , reject) => {
            Mapping.find({} , (err , result) => {
                if (err) {
                    reject(err);
                } else {
                    result = JSON.parse(JSON.stringify(result));
                    result.forEach(item => {
                        if (
                            item.collect && 
                            item.collect.job && 
                            item.collect.jobPublishInfo && 
                            item.collect.job.base && 
                            item.collect.job.base.tb_snatch_position_info
                        ) {
                            resolve(item);
                            return;
                        }
                    });
                }
            })
        });
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
                } else {
                    data[mapping[key]] = null;
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
            if (!id) {
                resolve({});
                return;
            };
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
    // 获取收藏职位的收藏数
    getJobCollectCount (jobId) {
        let sql = `select count(*) as total from \`tb_user_collect_position-list\` where UCP_Status = 1 and UCP_PositionID = '${jobId}'`;
        return this._select(userDB , sql);
    }
    // 获取列表总数
    getJobTotal (companyId , jobId) {
        let sql = `select count(distinct UCP_PositionID) as total from \`tb_user_collect_position-list\` where UCP_Status = 1`;
        companyId && (sql += ` and UCP_CompanyID = '${companyId}'`);
        jobId && (sql += ` and UCP_PositionID = '${jobId}'`);
        return this._select(userDB , sql);
    }
}
module.exports = new JobCollectDao();