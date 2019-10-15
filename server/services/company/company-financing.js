const dao = require('../../dao/company/company-financing');
const { 
    formatTime,
} = require('../../utils/index');
class FinancingServer {
    constructor () {
        this.companyDomain = 'http://www.jobui.com';
    }
    makeCompanyUrl (companyId) {
        if (!companyId) {
            return '';
        }
        return `/company/${companyId}/`;
    }
    async getFinancingList (companyId , page , pageSize) {
        let financingList = await dao.getFinancingList(companyId , page , pageSize);
        let result = [];
        if (financingList.length > 0) {
            for (let i = 0 ; i < financingList.length ; i++) {
                let finance = financingList[i];
                let data = {};
                data['companyId'] = finance['CF_CompanyID'];
                let company = await dao.getCompanyDataById(finance['CF_CompanyID']);
                data['companyName'] = company['CI_Name'];
                data['companyUrl'] = this.companyDomain + this.makeCompanyUrl(finance['CF_CompanyID']);
                data['area'] = company['CI_City'];
                data['financingStatus'] = finance['CF_FinancingStatus'];
                data['financingMoney'] = finance['CF_FinancingMoney'];
                data['investor'] = finance['CF_Investor'];
                data['financingDate'] = formatTime(finance['CF_FinancingTime']);
                result.push(data);
            }
        }
        return result;
    }
    async getFinancingTotal (companyId) {
        let total = await dao.getFinancingTotal(companyId);
        total = total[0] && total[0].total;
        return total;
    }
}
module.exports = new FinancingServer();