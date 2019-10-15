const dao = require('../../dao/company/short-comment');
const { 
    setUserLogo , 
    setUserHomepage , 
    setCompanyUrl , 
    getCityFromIp ,
    formatTime
} = require('../../utils/index');
class CommentServer {
    constructor () {
        // 公司评分
        this.gradeMap = {
            1 : '非常不满意',
            2 : '不满意',
            3 : '一般',
            4 : '满意',
            5 : '非常满意'
        }
    }
    async getCommentList (page , pageSize , type , companyId , commentId) {
        let result = [];
        let commentList = await dao.getCommentList(page , pageSize , type , companyId , commentId);
        for (let i = 0 ; i < commentList.length ; i++) {
            let comment = commentList[i];
            let data = {};
            if (comment['CC_UserID']) {
                data.avatar = setUserLogo(comment['CC_UserID']);
                // 获取用户数据
                let userInfo = await dao.getUserById(comment['CC_UserID']);  // 缓存在mongodb中
                data.username = userInfo['UI_UserName'];
                // 获取用户的个人主页
                let userHomePage = await dao.getUserHomePageData(comment['CC_UserID']);
                data.homepage = setUserHomepage(userHomePage['UD_Domain']);
            } else {
                data.username = '游客';
                data.homepage = '';
            };
            // 公司雇员
            if (comment['CC_Relationship'] == 'Y') {
                data.isEmployee = true;
            } else {
                data.isEmployee = false;
            }
            // 评论id
            data.commentId = comment['CC_ID'];
            // 添加时间
            data.addTime = formatTime(comment['CC_AddTime']);
            // 评论内容
            data.content = comment['CC_Content'];
            // 公司信息
            let company = await dao.getCompanyDataById(comment['CC_CompanyID']);
            // 公司名
            data.companyName = company['CI_Name'];
            // 公司url
            data.companyUrl = setCompanyUrl(comment['CC_CompanyID']);
            // 用户IP
            if (comment['CC_UserIP']) {
                data.ip = comment['CC_UserIP'];
                // let city = await getCityFromIp(comment['CC_UserIP']);
                // if (city) {
                //     data.city = city;
                // } else {
                //     data.city = '未知'
                // }
            };
            // 公司评分
            let gradeData = await dao.getGradeById(`c${comment['CC_ID']}`);
            if (gradeData[0] && gradeData[0]['CG_TotalGrade']) {
                let totalGrade = gradeData[0]['CG_TotalGrade'];
                data.totalGrade = totalGrade;
                data.gradeText = this.gradeMap[totalGrade];
            };
            data.companyId = comment['CC_CompanyID'];
            if (comment['CC_IsCheck'] == 'Y') {
                data.isPass = true;
            } else if (comment['CC_IsCheck'] == 'N') {
                data.notPass = true;
            };
            result.push(data);
        };
        return result;
    }
    getCommentTotal (type , companyId , commentId) {
        return dao.getCommentTotal(type , companyId , commentId);
    }
    async updateComment (companyId , commentId , checkType) {
        // 先通过commentId查询是否在表中存在这个评论
        let oneComment = await dao.getOneComment(commentId);
        let isChecked = oneComment[0]['CC_IsCheck'];
        // 获取公司状态
        let companyStatusData = await dao.getCompanyStatusData(companyId);
        companyStatusData = companyStatusData[0];
        let checkNum = companyStatusData['CSC_CheckNum'];
        // 判断该条评论是否被审核过，"U"表示没有被审核过，"Y","N"表示被审核过
        if (isChecked == 'U') {
            checkNum += 1;
        }
        // 更新操作
        if (oneComment.length > 0) {
            // 更新短评数据
            await dao.updateComment(commentId , checkType);
            // 如果更新成功，同步更新公司状态
            let updateCompanyStatus = await dao.updateCompanyStatusData(companyId , checkNum);
            return updateCompanyStatus;
        }
    }
}
module.exports = new CommentServer();
