const dao = require('../../dao/company/company-filter');
const { 
    formatTime,
} = require('../../utils/index');
class FilterServer {
    constructor () {
        this.companyDomain = 'http://www.jobui.com';
    }
    makeCompanyUrl (companyId) {
        if (!companyId) {
            return '';
        }
        return `/company/${companyId}/`;
    }
    async getFilterCompanyList (page , pageSize , type , companyId) {
        let filterList = [];
        let result = [];
        if (companyId) {
            filterList = await dao.getFilterCompanyListById(companyId , type);
        } else {
            filterList = await dao.getFilterCompanyList(page , pageSize , type);
        }
        if (filterList.length > 0) {
            for (let i = 0 ; i < filterList.length ; i++) {
                let data = {};
                let filter = filterList[i];
                data.companyId = filter['CF_CompanyID'];
                data.lastUpdateTime = formatTime(filter['CF_LastUpdateTime']);
                let company = await dao.getCompanyDataById(filter['CF_CompanyID']);
                data.companyName = company['CI_Name'];
                data.shortName = company['CI_ShortName'];
                data.companyUrl = this.companyDomain + this.makeCompanyUrl(data.companyId);
                if (filter['CF_IsFilter'] == 'Y') {
                    data.isDelete = true;
                } else {
                    data.isDelete = false;
                }
                data.source = filter['CF_Type'];
                result.push(data);
            }
        }
        return result;
    }
    // 获取列表总数
    async getFilterCompanyTotal (type) {
        let total = await dao.getFilterCompanyTotal(type);
        total = total.length > 0 && total[0].total;
        return total;
    }
    // 更新
    async updateFilterStatus (companyId , type , admin) {
        if (type == 'N') {
            let delResult = await dao.getInfoById(companyId);
            delResult = delResult.length > 0 && delResult[0];
            if (delResult['DC_IsDelete'] == 'Y') {
                return -3;
            } else {
                let mergeResult = await dao.getMergeById(companyId , '');
                mergeResult = mergeResult.length > 0 && mergeResult[0];
                if (mergeResult['CC_IsRecovery'] == 'N') {
                    return -4;
                }
            }
        };
        let update = await dao.updateFilterStatus(companyId , type , 'Y' , admin);
        if (update > 0 && type == 'Y') {
            let typeList = await dao.getTypeListById(companyId);
            if (typeList.length > 0) {
                for (let i = 0 ; i < typeList.length ; i++) {
                    let v = typeList[i];
                    await dao.updateCompanyStatus(v['CJL_ID']);
                }
            };
        };
        return update;
    }
}

module.exports = new FilterServer();