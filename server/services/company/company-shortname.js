const dao = require('../../dao/company/company-shortname');
const { 
    formatTime,
} = require('../../utils/index');
class ShortnameServer {
    constructor () {
        this.companyDomain = 'http://www.jobui.com';
    }
    makeCompanyUrl (companyId) {
        if (!companyId) {
            return '';
        }
        return `/company/${companyId}/`;
    }
    // 获取公司简称列表
    async getCompanyShortNameList (page , pageSize) {
        let nameList = await dao.getCompanyShortNameList(page , pageSize);
        let result = [];
        if (nameList.length > 0) {
            for (let i = 0 ; i < nameList.length ; i++) {
                let data = {};
                let name = nameList[i];
                let companyId = name['CEL_CompanyID'];
                let company = await dao.getCompanyDataById(companyId);
                data['companyId'] = companyId;
                data['companyName'] = company['CI_Name'];
                data['adminURL'] = this.companyDomain + this.makeCompanyUrl(companyId);
                data['companyShortName'] = name['CEL_ShortName'];
                data['lastUpdateTime'] = formatTime(name['CEL_LastUpdateTime']);
                result.push(data);
            }
        }
        return result;
    }
    // 获取总数
    async getCompanyShortNameTotal () {
        let total = await dao.getCompanyShortNameTotal();
        total = total[0] && total[0].total;
        return total;
    }
}
module.exports = new ShortnameServer();