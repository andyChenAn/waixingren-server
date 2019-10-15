const dao = require('../../dao/company/long-reply');
const { 
    setUserLogo , 
    setUserHomepage , 
    setCompanyUrl , 
    getCityFromIp ,
    formatTime,
    setCommentUrl
} = require('../../utils/index');
class LongReplyServer {
    constructor () {
        this.domain = 'http://www.jobui.com';
    }
    makeUserUrl (userId , num = '' , imageType = 'b') {
        if (!userId) {
            return '';
        }
        let path = '/' + (userId + '').slice(0 , 3) + '/';
        if (num) {
            userId = userId + '_' + num;
        }
        switch (imageType) {
            case 'b' :
            imageType = 'ulb';
            break;
            case 'm' :
            imageType = 'ulm';
            break;
            case 's' :
            imageType = 'uls';
            break;
            default : 
            imageType = 'ulb';
        }
        let url = 'http://picdemo.jobui.com/userPhoto' + path + userId + '.jpg!' + imageType;
        return url; 
    }
    // 获取长评回复列表数据
    async getReplyList (page , pageSize , type , commentId , replyId) {
        let result = [];
        let replyList = await dao.getReplyList(page , pageSize , type , commentId , replyId);
        for (let i = 0 ; i < replyList.length ; i++) {
            let data = {};
            let reply = replyList[i];
            // 格式化回复内容
            data = await this.formatReply(reply);
            if (reply['CRR_IsAdminCheck'] == 'Y') {
                data.isPass = true;
            } else if (reply['CRR_IsAdminCheck'] == 'N') {
                data.notPass = true;
            };
            // 获取长评信息和公司信息
            let commentInfo = await this.getLongCommentInfo(reply['CRR_ReviewID']);
            if (!commentInfo['CR_CompanyID']) {
                data.isReviewDel = true;
            } else {
                data.title = commentInfo['CR_Title'] || '';
                data.reviewUrl = 'http://m.jobui.com/company/' + commentInfo['CR_CompanyID'] + '/review/' + commentInfo['CR_ID'] + '/';
                let company = await dao.getCompanyDataById(commentInfo['CR_CompanyID']);
                data.companyName = company['CI_Name'];
                data.companyUrl = this.domain + setCompanyUrl(commentInfo['CR_CompanyID']);
                data.companyId = commentInfo['CR_CompanyID'];
            }
            result.push(data);
        }
        return result;
    }
    // 获取长评信息
    async getLongCommentInfo (commentId) {
        let commentList = await dao.getOneComment(commentId);
        commentList = commentList.length > 0 && commentList[0];
        let commentInfo = await dao.getOneCommentInfo(commentId);
        commentInfo = commentInfo.length > 0 && commentInfo[0];
        return Object.assign({} , commentList , commentInfo);
    }
    // 格式化回复内容
    async formatReply (reply , floorNum = 0) {
        let data = {};
        // 回复楼层
        data['floorNum'] = floorNum + 1;
        // 基本信息
        data['replyId'] = reply['CRR_ID'];
        data['userId'] = reply['CRR_UserID'];
        data['commentId'] = reply['CRR_ReviewID'];
        // 用户信息
        let userInfo = await this.getUserInfo(reply['CRR_UserID'] , 'webSite');
        data = Object.assign(data , userInfo);
        // 添加时间
        data.addTime = formatTime(reply['CRR_AddTime']);
        // 回复内容
        let content = '';
        let replyContent = await dao.getReplyContent(reply['CRR_ID']);
        replyContent = replyContent.length > 0 && replyContent[0];
        if (reply['CRR_ToUserID']) {
            let commentUserInfo = await this.getUserInfo(reply['CRR_ToUserID'] , 'webSite');
            content = '回复@' + commentUserInfo['userName'] + '：';
        }
        data.content = content + replyContent['CRR_Content'];
        return data;
    }
    // 获取用户信息
    async getUserInfo (userId , urlFrom = '') {
        let data = {};
        if (!userId) {
            data.username = '游客';
            data.avatar = this.domain + 'template_1/images/tag/tagperson.png';
            return data;
        }
        let userInfo = await dao.getUserById(userId);
        data.username = userInfo['UI_UserName'];
        let jobName = userInfo['UI_Job'];
        let position = '';
        if (userInfo['UI_AreaCode']) {
            // 解决进mongo时第一位带0的地区编码被转为int型的问题
            if (userInfo['UI_AreaCode'].length == 5) {
                userInfo['UI_AreaCode'] = '0' + userInfo['UI_AreaCode'];
            }
            let userArea = await dao.getAreaByCode(userInfo['UI_AreaCode']);
            userArea = userArea.length > 0 && userArea[0];
            let cityName = userArea['SA_Name'];
            if (jobName && cityName) {
                position = cityName + '•' + jobName;
            } else if (cityName) {
                position = cityName;
            }
        }
        // 城市和职位
        data.position = position;
        // 头像
        data.avatar = this.makeUserUrl(userId , userInfo['UI_Photo'] , 's');
        let homepage  = await dao.getUserHomePageData(userId);
        if (homepage) {
            if (urlFrom) {
                data.userMobliePage = setUserHomepage(homepage['UD_Domain'] , true) + '?refer=' + urlFrom;
                data.userUrl = setUserHomepage(homepage['UD_Domain']) + '?refer=' + urlFrom;
            } else {
                data.userMobliePage = setUserHomepage(homepage['UD_Domain'] , true);
                data.userUrl = setUserHomepage(homepage['UD_Domain']);
            }
        };
        return data;
    }
};
module.exports = new LongReplyServer();