const dao = require('../../dao/company/company-team');
const { 
    setUserLogo , 
    setUserHomepage , 
    setCompanyUrl , 
    getCityFromIp ,
    formatTime,
    setCommentUrl
} = require('../../utils/index');
class TeamServer {
    constructor () {
        this.photoDomain = "http://picdemo.jobui.com/";
        this.defaultPhotoDomain = "http://htm4.jobui.com/";
        this.companyDomain = "http://www.jobui.com";
    }
    makeTeamPhotoUrl (companyId , path , type = 'm') {
        if (!companyId ||  !path) {
            return '';
        }
        return `${this.photoDomain}companyTeam/${companyId}/${path}!${type}`;
    }
    makeCompanyUrl (companyId) {
        if (!companyId) {
            return '';
        }
        return `/company/${companyId}/`;
    }
    async getTeamList(page , pageSize , type , companyId , personId) {
        let result = [];
        let teamList = await dao.getTeamList(page , pageSize , type , companyId , personId);
        if (teamList.length > 0) {
            for (let i = 0 ; i < teamList.length ; i++) {
                let data = {};
                let team = teamList[i];
                // 公司名称
                let company = await dao.getCompanyDataById(team['CM_CompanyID']);
                data.companyName = company['CI_Name'];
                data.companyId = company['CI_CompanyID'];
                // 人物照片
                if (team['CM_PhotoPath']) {
                    data.photoUrl = this.makeTeamPhotoUrl(team['CM_CompanyID'] , team['CM_PhotoPath']);
                } else {
                    data.photoUrl = this.defaultPhotoDomain + 'template_1/images/tag/tagperson.png';
                };
                data.id = team['CM_ID'];
                data.personName = team['CM_PeopleName'];
                data.position = team['CM_Position'];
                data.shortIntroduce = team['CM_PeopleIntroduce'].slice(0 , 115);
                data.nameUrl = team['CM_WebSite'];
                data.companyUrl = this.companyDomain + this.makeCompanyUrl(data.companyId);
                data.addTime = formatTime(team['CM_AddTime']);
                if (team['CM_IsHR'] == 'Y') {
                    data.isHR = true;
                } else {
                    data.isHR = false;
                }
                // 审核是否通过
                if (team['CM_IsCheck'] == 'U') {
                    data.isAudit = true;
                } else if (team['CM_IsCheck'] == 'Y') {
                    data.isPass = true;
                } else if (team['CM_IsCheck'] == 'N') {
                    data.notPass = true;
                } else if (team['CM_IsCheck'] == 'D') {
                    data.isDelete = true;
                }
                result.push(data);
            }
        }
        return result;
    }
    getTeamTotal (type , companyId , personId) {
        return dao.getTeamTotal(type , companyId , personId);
    }
    async updateTeamStatus (personId , type) {
        if (!personId || !type) {
            return -1;
        }
        // 获取管理团队列表信息
        let teamInfo = await dao.getTeamData(personId);
        teamInfo = teamInfo.length > 0 && teamInfo[0];
        let update = null; // 更新管理团队信息结果
        let updateStatus = null;  // 更新状态结果
        if (teamInfo) {
            update = await dao.updateTeamInfo(personId , type);
        }
        // 如果更新成功
        if (update > 0) {
            // 审核后更新状态
            if ((teamInfo['CM_IsCheck'] == 'U' && type == 'Y') || (teamInfo['CM_IsCheck'] == 'N' && type == 'Y')) {
                // 审核通过
                let passNum = 1;
                updateStatus = await this.updateTeamStatusNum(teamInfo['CM_CompanyID'] , passNum);
            } else if ((teamInfo['CM_IsCheck'] == 'U' && type == 'N') || (teamInfo['CM_IsCheck'] == 'Y' && type == 'N')) {
                // 审核不通过
                let noPassNum = -1;
                updateStatus = await this.updateTeamStatusNum(teamInfo['CM_CompanyID'] , noPassNum);
            }
            if (updateStatus > 0) {
                return updateStatus;   
            } else {
                return -1;
            }
        }
    }
    async updateTeamStatusNum (companyId , num) {
        let result = null;// 更新结果
        // 首先获取公司状态信息
        let companyData = await dao.getCompanyDataById(companyId);
        companyData = companyData.length > 0 && companyData[0];
        // 如果存在，那么更新，否则，插入
        if (companyData) {
            num += Number(companyData['CSM_TotalNum']);
            result = await dao.updateCompanyInfoById(companyId , num);
        } else {
            let addTime = parseInt(new Date().getTime() / 1000);
            let updateTime = parseInt(new Date().getTime() / 1000);
            let totalNum = 1;
            let snatchNum = 0;
            result = await dao.insertCompanyInfo(companyId , addTime , updateTime , totalNum , snatchNum);
        }
        // 如果更新或插入成功
        if (result > 0) {
            return result;
        } else {
            return -1;
        }
    }
}

module.exports = new TeamServer();