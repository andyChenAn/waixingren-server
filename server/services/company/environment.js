const dao = require('../../dao/company/environment');
const { 
    setCompanyUrl , 
    setUserHomepage,
    formatTime,
    getCityFromIp
} = require('../../utils/index');
class EnvironmentServer {
    constructor () {
        this.environmentDomain = "http://picdemo.jobui.com/";
        this.companyDomain = "http://www.jobui.com";
    }
    makeCompanyEnvironmentUrl (companyId , path , type = 'b') {
        if (!companyId || !path) {
            return '/';
        }
        return this.environmentDomain + 'companyPhoto/' + companyId + '/' + path + '!' + type;
    }
    async getEnvironmentList (type , page , pageSize , companyId , environmentId) {
        let result = [];
        let environmentList = await dao.getEnvironmentList(type , page , pageSize , companyId , environmentId);
        for (let i = 0 ; i < environmentList.length ; i++) {
            let data = {};
            let environment = environmentList[i];
            // 获取公司图片信息
            let info = await dao.getEnvironmentContent(environment['CP_ID']);
            info = info.length > 0 && info[0];
            // 公司环境图片
            data.environmentUrl = this.makeCompanyEnvironmentUrl(environment['CP_CompanyID'] , info['CP_Path'] , 'm');
            // 公司环境原图
            data.originUrl = this.makeCompanyEnvironmentUrl(environment['CP_CompanyID'] , info['CP_Path'] , 'b');
            // 公司信息
            let company = await dao.getCompanyDataById(environment['CP_CompanyID']);
            // 过滤公司名为空的数据
            if (!company['CI_Name']) {
                continue;
            }
            data.companyId = environment['CP_CompanyID'];
            data.companyName = company['CI_Name'];
            data.companyUrl = this.companyDomain + setCompanyUrl(environment['CP_CompanyID']);
            // 环境图片分类
            data.label = info['CP_Label'];
            // 环境描述
            data.desc = info['CP_Desc'] ? info['CP_Desc'] : '';
            // 用户名
            if (environment['CP_UserID']) {
                let userInfo = await dao.getUserById(environment['CP_UserID']);
                data.username = userInfo['UI_UserName'];
                // 获取用户的个人主页
                let userHomePage = await dao.getUserHomePageData(environment['CP_UserID']);
                data.homepage = setUserHomepage(userHomePage['UD_Domain']);
            } else {
                data.username = '游客';
                data.avatar = '';
            }
            // 用户IP
            if (info['CR_UserIP']) {
                data.ip = info['CR_UserIP'];
                // let city = await getCityFromIp(info['CR_UserIP']);
                // if (city) {
                //     data.city = city;
                // } else {
                //     data.city = '未知'
                // }
            };
            // 公司环境id
            data.environmentId = environment['CP_ID'];
            // 上传时间
            data.addTime = formatTime(environment['CP_AddTime']);
            // 是否审核通过
            if (environment['CP_IsCheck'] == 'Y') {
                data.isPass = true;
            } else if (environment['CP_IsCheck'] == 'N') {
                data.notPass = true;
            } else if (environment['CP_IsCheck'] == 'D') {
                data.isDelete = true;
            } else if (environment['CP_IsCheck'] == 'U') {
                data.isAudit = true;
            }
            if (type == 'Y') {
                data.displayLabel = true;
                let labelList = await dao.getLabelList(environment['CP_ID']);
                if (labelList.length > 0) {
                    for (let i = 0 ; i < labelList.length ; i++) {
                        let labelTmp = {};
                        let labelArr = {};
                        let label = labelList[i];
                        let labelId = label['CPA_LabelID'];
                        let keyId = label['CPA_ID'];
                        if (!labelId && label['CPA_IndustryID']) {
                            continue;
                        }
                        labelTmp.keyId = keyId;
                        labelTmp.industryId = label['CPA_IndustryID'];
                        labelTmp.labelId = label['CPA_LabelID'];
                        labelTmp.industryLabelId = label['CPA_IndustryLabeID'];
                        if (labelId) {
                            let labelInfo = await dao.getLabelNameById(labelId);
                            labelInfo = labelInfo.length > 0 && labelInfo[0];
                            if (labelInfo) {
                                labelArr['labelName'] = labelInfo['CPL_LabelName'];
                                labelArr['labelInfoJson'] = labelTmp;
                                data.labelList = labelArr;
                            }
                        }
                        if (label['CPA_IndustryID']) {
                            data.industryJson = labelTmp;
                        }
                    }
                }
            };
            result.push(data);
        }
        return result;
    }
    getEnvironmentTotal (type , companyId , environmentId) {
        return dao.getEnvironmentTotal(type , companyId , environmentId);
    }
    async updateEnvironmentStatus (environmentId , type) {
        if (!environmentId || !type) {
            return -1;
        }
        let result = '';
        // 先获取图片信息
        let photoInfo = await dao.getPhotoInfo(environmentId);
        if (photoInfo.length > 0) {
            photoInfo = photoInfo[0];
            // 更新列表数据
            result = await dao.updatePhotoInfo(environmentId , type);
            if (result === 1) {
                // 流程同步，更新公司，用户状态
                if ((photoInfo['CP_IsCheck'] == 'U' && type == 'Y') || (photoInfo['CP_IsCheck'] == 'N' && type == 'Y')) {
                    // 审核通过
                    let num = 1;
                    // 更新公司图片状态
                    await this.updateCompanyPhotoStatus(photoInfo['CP_CompanyID'] , num);
                    // 更新用户图片状态
                    await this.updateUserPhotoStatus(photoInfo['CP_UserID'] , num);
                } else if ((photoInfo['CP_IsCheck'] == 'Y' && type == 'U') || (photoInfo['CP_IsCheck'] == 'Y' && type == 'N')) {
                    // 审核不通过
                    let num = -1;
                    // 更新公司图片状态
                    await this.updateCompanyPhotoStatus(photoInfo['CP_CompanyID'] , num);
                    // 更新用户图片状态
                    await this.updateUserPhotoStatus(photoInfo['CP_UserID'] , num);
                }
            };
            return result;
        }
    }
    async updateCompanyPhotoStatus (companyId , num) {
        if (!companyId) {
            throw new Error('缺少companyId');
        };
        // 先获取公司环境状态数据
        let status = await dao.getCompanyStatus(companyId);
        if (status.length > 0) {
            status = status[0];
            let checkNum = status['CSP_CheckNum'] || 0;
            checkNum += num;
            // 更新公司环境状态
            return await dao.updateCompanyStatus(companyId , checkNum);
        }
    }
    async updateUserPhotoStatus (userId , num) {
        // 先获取用户环境状态数据
        let status = await dao.getUserPhotoStatus(userId);
        if (status.length > 0) {
            status = status[0];
            let checkNum = status['USP_CheckNum'] || 0;
            checkNum += num;
            return await dao.updateUserPhotoStatus(userId , checkNum);
        }
    }
}

module.exports = new EnvironmentServer();