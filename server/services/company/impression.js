const dao = require('../../dao/company/impression');
const { 
    setCompanyUrl , 
    setUserHomepage,
    formatTime
} = require('../../utils/index');
class ImpressionServer {
    async getImpressionList (page , pageSize , type , companyId , impressionId) {
        let result = [];
        let impressionList = await dao.getImpressionList(page , pageSize , type , companyId , impressionId);
        for (let i = 0 ; i < impressionList.length ; i++) {
            let data = {};
            let impression = impressionList[i];
            // 印象id
            data.impressionId = impression['CI_ID'];
            // 印象内容
            data.impression = impression['CI_Impression'];
            // 公司名称和公司链接
            let company = await dao.getCompanyDataById(impression['CI_CompanyID']);
            data.companyName = company['CI_Name'];
            data.companyUrl = setCompanyUrl(company['CI_Name']);
            // 用户信息
            if (impression['CI_UserID']) {
                let userInfo = await dao.getUserById(impression['CI_UserID']);
                data.username = userInfo['UI_UserName'];
                // 获取用户的个人主页
                let userHomePage = await dao.getUserHomePageData(impression['CI_UserID']);
                data.homepage = setUserHomepage(userHomePage['UD_Domain']);
            } else {
                data.username = '游客';
                data.homepage = '';
            }
            // 添加时间
            data.addTime = formatTime(impression['CI_AddTime']);
            // 审核是否通过
            if (impression['CI_IsCheck'] == 'Y') {
                data.isPass = true;
            } else if (impression['CI_IsCheck'] == 'N') {
                data.notPass = true;
            }
            result.push(data);
        };
        return result;
    }
    getImpressionTotal (type , companyId , impressionId) {
        return dao.getImpressionTotal(type , companyId , impressionId);
    }
    async updateImpression (impressionId , companyId , checkType) {
        // 获取印象信息
        let impressionData = await dao.getImpressionById(impressionId);
        let isChecked = impressionData[0]['CI_IsCheck'];
        if (impressionData.length > 0) {
            let updateResult = await dao.updateImpression(impressionId , checkType);
            if (updateResult.affectedRows > 0) {
                // 获取公司状态
                let companyStatusData = await dao.getCompanyStatusData(companyId);
                companyStatusData = companyStatusData[0];
                let checkNum = companyStatusData['CSI_CheckNum'];
                // 判断该条评论是否被审核过，"U"表示没有被审核过，"Y","N"表示被审核过
                if (isChecked == 'U') {
                    checkNum += 1;
                }
                let updateCompanyStatus = await dao.updateCompanyStatusData(companyId , checkNum);
                return updateCompanyStatus;
            }
        }
    }
}
module.exports = new ImpressionServer();