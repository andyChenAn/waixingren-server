const dao = require('../../dao/company/company-delete');
const { 
    formatTime,
} = require('../../utils/index');
class DeleteServer {
    constructor () {
        this.companyDomain = "http://www.jobui.com";
        this.deleteReason = {
            "1" : "客户要求",
            "2" : "个人投诉",
            "3" : "名称或内容乱码",
            "4" : "劣质公司",
            "5" : '其他'
        }
    }
    makeCompanyUrl (companyId) {
        if (!companyId) {
            return '';
        }
        return `/company/${companyId}/`;
    }
    async getDeleteList (page , pageSize , type , companyId) {
        let deleteList = await dao.getDeleteList(page , pageSize , type , companyId);
        let result = [];
        for (let i = 0 ; i < deleteList.length ; i++) {
            let data = {};
            let del = deleteList[i];
            data.companyId = del['DC_CompanyID'];
            // 获取公司信息
            let company = await dao.getCompanyDataById(del['DC_CompanyID']);
            data.companyName = company['CI_Name'];
            data.companyUrl = this.companyDomain + this.makeCompanyUrl(del['DC_CompanyID']);
            // 删除公司原因
            let reasonType = del['DC_Reason'];
            data.delReason = this.deleteReason[reasonType];
            // 管理员
            data.admin = del['DC_Admin'];
            if (!data.admin) {
                data.admin = 'system';
            }
            // 最新时间
            data.lastTime = formatTime(del['DC_LastUpdateTime']);
            if (del['DC_IsDelete'] == 'Y') {
                data.isDelete = true;
            } else {
                data.isDelete = false;
            }
            result.push(data);
        }
        return result;
    }
    getDeleteTotal (type , companyId) {
        return dao.getDeleteTotal(type , companyId);
    }
    // 恢复删除公司信息
    async updateDelCompany (companyId , type) {
        let update = await dao.updateDelCompany(companyId , type);
        // 更新成功
        if (update > 0) {
            // 同步更新可信公司数据
            // 先获取公司状态
            let company = await dao.getFilterCompany(companyId);
            company = company.length > 0 && company[0];
            if (company['CF_IsFilter'] == 'Y') {
                // 如果公司之前的状态是已经过滤掉的公司，那么就更新公司状态
                let isFilter = 'N';
                let update = await dao.updateFilterCompany(companyId , isFilter);
                return update;
            }
            return update;
        }
    }
}
module.exports = new DeleteServer();