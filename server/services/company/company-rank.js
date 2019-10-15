const dao = require('../../dao/company/company-rank');
const { 
    formatTime,
} = require('../../utils/index');
class CompanyRankServer {
    constructor () {
        this.companyDomain = 'http://www.jobui.com';
    }
    makeCompanyUrl (companyId) {
        if (!companyId) {
            return '';
        }
        return `/company/${companyId}/`;
    }
    async getRankCompanyList (page , pageSize , city) {
        // 获取地区编码
        let areaCode = '';
        if (city) {
            let cityData = await dao.getCityDataByName(city);
            cityData = cityData.length > 0 && cityData[0];
            areaCode = cityData['SA_Code'];
        };
        let result = [];
        let companyList = await dao.getNewRankCompanyList(areaCode , page , pageSize);
        if (companyList.length > 0) {
            for (let i = 0 ; i < companyList.length ; i++) {
                let rank = companyList[i];
                let data = {};
                data.companyId = rank['CN_CompanyID'];
                data.lastUpdateTime = formatTime(rank['CN_AddDate']);
                let company = await dao.getCompanyDataById(rank['CN_CompanyID']);
                data.companyName = company['CI_Name'];
                data.companyUrl = this.companyDomain + this.makeCompanyUrl(rank['CN_CompanyID']);
                let cityCode = rank['CN_CityCode'];
                let cityData = await dao.getCityDataByCode(cityCode);
                cityData = cityData.length > 0 && cityData[0];
                data.cityName = cityData['SA_Name'];
                result.push(data);
            }
        }
        return result;
    }
    // 获取新上榜公司列表总数
    async getNewRankTotal (city) {
        let areaCode = '';
        if (city) {
            let cityData = await dao.getCityDataByName(city);
            cityData = cityData.length > 0 && cityData[0];
            areaCode = cityData['SA_Code'];
        };
        let total = await dao.getNewRankTotal(areaCode);
        if (total.length > 0) {
            total = total[0].total;
            return total;
        };
    }
}
module.exports = new CompanyRankServer();