const dao = require('../../dao/company/company-logo');
const { 
    setCompanyUrl , 
    formatTime,
} = require('../../utils/index');
class LogoServer {
    constructor () {
        this.companyDomain = "http://www.jobui.com";
        this.photoDomain = "http://picdemo.jobui.com/";
    }
    makeCompanyLogoURL (companyId , path , type) {
        if (!companyId || !path) {
            return '/';
        }
        let photoType = 'lsq';
        if (!type) {
            photoType = 'lb';
        } else if (type == 'sq') {
            photoType = 'lsq';
        }
        return this.photoDomain + 'companyLogo/' + companyId + '/' + path + '!' + photoType;
    }
    // 获取公司logo列表数据
    async getLogoList (type , page , pageSize , companyId) {
        let result = [];
        let logoList = await dao.getLogoList(type , page , pageSize , companyId);
        for (let i = 0 ; i < logoList.length ; i++) {
            let data = {};
            let logo = logoList[i];
            let company = await dao.getCompanyDataById(logo['CSL_CompanyID']);
            data.companyId = logo['CSL_CompanyID'];
            if (!company['CI_Name']) {
                continue;
            }
            data.companyName = company['CI_Name'];
            data.companyUrl = this.companyDomain + setCompanyUrl(logo['CSL_CompanyID']);
            data.addTime = formatTime(logo['CSL_AddTime']);
            data.companyLogoUrl = this.makeCompanyLogoURL(logo['CSL_CompanyID'] , logo['CSL_Path'] , 'sq');
            if (logo['CSL_IsCheck'] == 'Y') {
                data.isPass = true;
            } else if (logo['CSL_IsCheck'] == 'N') {
                data.notPass = true;
            }
            result.push(data);
        }
        return result;
    }
    // 获取公司logo列表总数
    getLogoTotal (type , companyId) {
        return dao.getLogoTotal(type , companyId);
    }
    // 更新公司logo
    updateLogo (companyId , type) {
        if (!companyId) {
            return -1;
        }
        return dao.updateLogo(companyId , type);
    }
}
module.exports = new LogoServer();