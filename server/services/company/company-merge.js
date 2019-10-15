const dao = require('../../dao/company/company-merge');
const { 
    formatTime,
} = require('../../utils/index');
class MergeServer {
    constructor () {
        this.companyDomain = "http://www.jobui.com";
    }
    makeCompanyUrl (companyId) {
        if (!companyId) {
            return '';
        }
        return `/company/${companyId}/`;
    }
    // 获取合并公司列表
    async getMergeList (page , pageSize , type , companyId) {
        let result = [];
        let mergeList = await dao.getMergeList(page , pageSize , type , companyId);
        if (mergeList.length > 0) {
            for (let i = 0 ; i < mergeList.length ; i++) {
                let data = {};
                let merge = mergeList[i];
                // 公司id
                data.companyId = merge['CC_CompanyID'];
                data.targetCompanyId = merge['CC_TargetCompanyID'];
                // 源公司信息
                let company = await dao.getCompanyDataById(data.companyId);
                data.companyName = company['CI_Name'];
                data.companyUrl = this.companyDomain + this.makeCompanyUrl(data.companyId) + '?v=1';
                // 目标公司信息
                let targetCompany = await dao.getCompanyDataById(data.targetCompanyId);
                data.targetCompanyName = targetCompany['CI_Name'];
                data.targetCompanyUrl = this.companyDomain + this.makeCompanyUrl(data.targetCompanyId);
                // 操作人
                data.operator = merge['CC_UserName'];
                // 时间
                data.addTime = formatTime(merge['CC_AddTime']);
                merge['CC_IsRecovery'] == 'Y' ? data.isRecovery = true : data.isRecovery = false;
                result.push(data);
            }
        }
        return result;
    }
    // 获取合并公司总数
    async getMergeTotal (type , companyId) {
        let data = await dao.getMergeTotal(type , companyId);
        if (data.length > 0) {
            let total = data[0].total;
            return total;
        }
    }
    // 取消合并公司或者合并公司
    async updateMergeCompany (sourceCompanyId , targetCompanyId , type) {
        let isRecovery = '';
        // 是否恢复
        if (type == 'N') {
            isRecovery = 'Y';
        } else {
            isRecovery = 'N';
        }
        let update = await dao.updateMergeList(sourceCompanyId , targetCompanyId , isRecovery);
        if (update > 0) {
            // 同步更新过滤公司数据
            // 先获取公司状态
            let company = await dao.getFilterCompany(sourceCompanyId);
            company = company.length > 0 && company[0];
            if (company['CF_IsFilter'] == 'Y') {
                // 如果公司之前的状态是已经过滤掉的公司，那么就更新公司状态
                let isFilter = 'N';
                let update = await dao.updateFilterCompany(sourceCompanyId , isFilter);
                return update;
            } else if (company['CF_IsFilter'] == 'N') {
                let isFilter = 'Y';
                let update = await dao.updateFilterCompany(sourceCompanyId , isFilter);
                return update;
            }
            return update;
        }
    }
};


module.exports = new MergeServer();