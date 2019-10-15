const dao = require('../../dao/company/environment-comment');
const { 
    setCompanyUrl , 
    setUserHomepage,
    getCityFromIp,
    setEnvironmentCommentUrl,
    formatTime
} = require('../../utils/index');
class EnvironmentCommentServer {
    constructor () {
        this.domain = 'http://www.jobui.com';
    }
    async getEnvironmentList (type , page , pageSize , companyId , environmentId) {
        let result = [];
        let environmentList = await dao.getEnvironmentList(type , page , pageSize , companyId , environmentId);
        for (let i = 0 ; i < environmentList.length ; i++) {
            let data = {};
            let environment = environmentList[i];
            // 获取环境评论内容数据
            let environmentContent = await dao.getEnvironmentContentById(environment['CP_ID']);
            environmentContent = environmentContent.length > 0 && environmentContent[0];
            // 获取公司信息
            let company = await dao.getCompanyDataById(environment['CP_CompanyID']);
            // 公司名称
            data.companyName = company['CI_Name'];
            // 公司链接
            data.companyUrl = this.domain + setCompanyUrl(environment['CP_CompanyID']);
            if (environment['CP_UserID']) {
                let userInfo = await dao.getUserById(environment['CP_UserID']);
                data.username = userInfo['UI_UserName'];
                let userHomePage = await dao.getUserHomePageData(environment['CP_UserID']);
                data.avatar = setUserHomepage(userHomePage['UD_Domain']);
            } else {
                data.username = '游客';
                data.avatar = '';
            }
            // 用户ip
            if (environmentContent['CP_UserIP']) {
                data.ip = environmentContent['CP_UserIP'];
                // let city = await getCityFromIp(environmentContent['CP_UserIP']);
                // if (city) {
                //     data.city = city;
                // } else {
                //     data.city = '未知'
                // }
            };
            // 公司雇员
            if (environmentContent['CP_Relationship'] == 'Y') {
                data.isEmployee = true;
            } else {
                data.isEmployee = false;
            }
            // 图片id
            data.commentId = environment['CP_ID'];
            // 添加时间
            data.addTime = formatTime(environment['CP_AddTime']);
            // 评论内容
            data.content = environmentContent['CP_Content'];
            // 评论数
            data.commentNum = environment['CP_CommentNum'];
            data.environmentUrl = this.domain + setEnvironmentCommentUrl(environment['CP_CompanyID'] , environment['CP_PhotoID']);
            if (environment['CP_IsAdminCheck'] != 'U') {
                if (environment['CP_IsCheck'] == 'Y') {
                    data.isPass = true;
                } else if (environment['CP_IsCheck'] == 'N') {
                    data.notPass = true;
                } else if (environment['CP_IsCheck'] == 'D') {
                    data.isDelete = true;
                } else if (environment['CP_IsCheck'] == 'U') {
                    data.isAudit = true;
                }
            }
            result.push(data);
        }
        return result;
    }
    async getEnvironmentTotal (type , companyId , environmentId) {
        return dao.getEnvironmentTotal(type , companyId , environmentId);
    }
    async checkEnvironmentCommentByAdmin (commentId , companyId , checkType) {
        // 获取表中的单行记录
        let commentInfo = await dao.getOneEnvironmentCommentById(commentId);
        commentInfo = commentInfo.length > 0 && commentInfo[0];
        let isAdminCheck = false;
        if (commentInfo['CP_IsAdminCheck'] == 'U') {
            isAdminCheck = true;
        }
        // 修改审核状态
        let result = await dao.updateEnvironmentCommentStatus(commentId , checkType , isAdminCheck);
        if (result > 0) {
            let num = '';
            // 评论需要改变状态
            if (commentInfo['CP_IsCheck'] != checkType) {
                // 修改回复数
                if (commentInfo['CP_IsCheck'] == 'Y' && checkType == 'N') {
                    // 之前已通过审核，然后点击不通过
                    num = -1;
                } else if ((commentInfo['CP_IsCheck'] == 'N' && checkType == 'Y') || (commentInfo['CP_IsCheck'] == 'U' && checkType == 'Y')) {
                    // 之前是不通过审核，然后点击通过，或者之前未审核，然后点击通过
                    num = 1;
                }
                 // 获取当前公司环境列表
                 let environmentInfo = await dao.getOneEnvironmentById(commentInfo['CP_PhotoID']);
                 environmentInfo = environmentInfo.length > 0 && environmentInfo[0];
                if (typeof num == 'number') {
                    if (environmentInfo.length == 0) {
                        // 如果没有记录，那么就插入一条记录
                        //let res = await dao.insertOneEnvironment(commentInfo['CP_PhotoID'] , num);
                        return;
                    } else {
                        // 存在记录，那么就更新记录
                        let number = '';
                        if (num > 0) {
                            number = environmentInfo['CP_CommentNum'] + num;
                        } else {
                            number = environmentInfo['CP_CommentNum'] - Math.abs(num);
                        }
                        result = await dao.updateEnvironmentCommentNum(commentInfo['CP_PhotoID'] , number);
                        return result;
                    }
                }
            }
        }
        return result;
    }
    async updateEnvironmentComment (commentId , companyId , checkType) {
        // 更新操作
        let result = await this.checkEnvironmentCommentByAdmin(commentId , companyId , checkType);
        return result;
    }
}
module.exports = new EnvironmentCommentServer();