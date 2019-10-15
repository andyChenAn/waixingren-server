const dao = require('../../dao/job/job-collect');
const CodeError = require('../../error/code/index');
class JobCollectServer {
    constructor () {
        this.domain = 'http://www.jobui.com';
    }
    makeJobUrl (jobId) {
        if (!jobId) {
			return '';
		}
		return `/job/${jobId}/`;
    }
    makeCompanyUrl (companyId) {
        if (!companyId) {
            return '';
        }
        return `/company/${companyId}/`;
    }
    async getJobList (companyId , jobId , page , pageSize) {
        try {
            let jobList = await dao.getJobList(companyId , jobId , page , pageSize);
            let result = [];
            if (jobList.length > 0) {
                for (let i = 0 ; i < jobList.length ; i++) {
                    let data = {};
                    let job = jobList[i];
                    let jobId = job['UCP_PositionID'];
                    let jobData = await dao.getJobDataById(jobId);
                    let jobName = jobData['SPI_PositionName'];
                    let companyId = jobData['SPI_CompanyID'];
                    let company = await dao.getCompanyDataById(companyId);
                    let companyName = company['CI_Name'];
                    data['jobUrl'] = this.domain + this.makeJobUrl(jobId);
                    data['companyUrl'] = this.domain + this.makeCompanyUrl(companyId);
                    data['jobName'] = jobName;
                    data['jobId'] = jobId;
                    data['companyId'] = companyId;
                    data['companyName'] = companyName;
                    data['collectNum'] = await this.getJobCollectCount(jobId);
                    result.push(data);
                }
            }
            return result;
        } catch (err) {
            // 将错误抛出
            throw new CodeError(err);
        }
    }
    // 获取职位收藏的数量
    async getJobCollectCount (jobId) {
        let count = await dao.getJobCollectCount(jobId);
        count = count[0] && count[0].total;
        return count;
    }
    async getJobTotal (companyId , jobId) {
        let total = await dao.getJobTotal(companyId , jobId);
        total = total[0] && total[0].total;
        return total;
    }
}
module.exports = new JobCollectServer();