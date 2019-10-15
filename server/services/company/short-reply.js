const dao = require('../../dao/company/short-reply');
const { 
    setUserLogo , 
    setUserHomepage , 
    setCompanyUrl , 
    getCityFromIp ,
    formatTime,
    setCommentUrl
} = require('../../utils/index');
class ShortReplyServer {
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
    async getShortReplyList (page , pageSize , type , commentId , replyId) {
        let result = [];
        let commentList = await dao.getShortReplyList(page , pageSize , type , commentId , replyId);
        for (let i = 0 ; i < commentList.length ; i++) {
            let data = {};
            let reply = commentList[i];
            // 格式化回复内容
            data = await this.formatReply(reply['CCR_ID'] , reply);
            if (reply['CCR_IsAdminCheck'] == 'Y') {
                data.isPass = true;
            } else if (reply['CCR_IsAdminCheck'] == 'N') {
                data.notPass = true;
            };
            // 获取长评信息和公司信息
            let commentInfo = await this.getLongCommentInfo(reply['CCR_CommentID']);
            if (!commentInfo['CC_CompanyID']) {
                data.isCommentDel = true;
            } else {
                data.commentContent = commentInfo['CC_Content'] || '';
                data.relationship = commentInfo['CC_Relationship'] || '';
                data.commentUrl = 'http://m.jobui.com/company/' + commentInfo['CC_CompanyID'] + '/comment/' + commentInfo['CCR_CommentID'] + '/';
                let company = await dao.getCompanyDataById(commentInfo['CC_CompanyID']);
                data.companyName = company['CI_Name'] || '';
                data.companyUrl = (this.domain + setCompanyUrl(commentInfo['CC_CompanyID'])) || '';
                data.companyId = commentInfo['CC_CompanyID'] || 0;
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
    async formatReply (replyId , reply , floorNum = 0) {
        let data = {};
        // 回复楼层
        data['floorNum'] = floorNum + 1;
        // 基本信息
        data['replyId'] = reply['CCR_ID'];
        data['userId'] = reply['CCR_UserID'];
        data['commentId'] = reply['CCR_CommentID'];
        // 用户信息
        let userInfo = await this.getUserInfo(reply['CCR_UserID'] , 'webSite');
        data = Object.assign(data , userInfo);
        // 添加时间
        data.addTime = formatTime(reply['CCR_AddTime']);
        // 回复内容
        let content = '';
        let commentUserInfo = '';
        let replyContent = await dao.getReplyContent(reply['CCR_ID']);
        replyContent = replyContent.length > 0 && replyContent[0];
        data.content = content + replyContent['CCR_Content'];
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
}
module.exports = new ShortReplyServer();