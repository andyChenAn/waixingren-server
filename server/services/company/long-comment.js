const dao = require('../../dao/company/long-comment');
const { 
    setUserLogo , 
    setUserHomepage , 
    setCompanyUrl , 
    getCityFromIp ,
    formatTime,
    setCommentUrl
} = require('../../utils/index');
class LongCommentServer {
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
            if (comment['CR_UserID']) {
                // 用户logo
                data.avatar = setUserLogo(comment['CR_UserID']);
                // 获取用户数据
                let userInfo = await dao.getUserById(comment['CR_UserID']);  // 缓存在mongodb中
                data.username = userInfo['UI_UserName'];
                // 获取用户的个人主页
                let userHomePage = await dao.getUserHomePageData(comment['CR_UserID']);
                data.homepage = setUserHomepage(userHomePage['UD_Domain']);
            } else {
                data.username = '游客';
                data.homepage = '';
            }
            // 公司雇员
            if (comment['CR_Relationship'] == 'Y') {
                data.isEmployee = true;
            } else {
                data.isEmployee = false;
            }
            // 评论id
            data.commentId = comment['CR_ID'];
            // 添加时间
            data.addTime = formatTime(comment['CR_AddTime']);
            // 用户IP
            if (comment['CR_UserIP']) {
                data.ip = comment['CR_UserIP'];
                // let city = await getCityFromIp(comment['CR_UserIP']);
                // if (city) {
                //     data.city = city;
                // } else {
                //     data.city = '未知'
                // }
            };
            // 公司评分
            let gradeData = await dao.getGradeById(`r${comment['CR_ID']}`);
            if (gradeData[0] && gradeData[0]['CG_TotalGrade']) {
                let totalGrade = gradeData[0]['CG_TotalGrade'];
                data.totalGrade = totalGrade;
                data.gradeText = this.gradeMap[totalGrade];
            };
            // 公司id
            data.companyId = comment['CR_CompanyID'];
            // 公司信息
            let company = await dao.getCompanyDataById(comment['CR_CompanyID']);
            // 公司名
            data.companyName = company['CI_Name'];
            // 公司url
            data.companyUrl = setCompanyUrl(comment['CR_CompanyID']);
            // 评论title
            data.title = comment['CR_Title'];
            data.titleUrl = setCommentUrl(comment['CR_CompanyID'] , comment['CR_ID']);
            // 优点
            data.advantage = comment['CR_Advantage'];
            // 缺点
            data.defect = comment['CR_Defect'];
            // 建议
            data.suggestion = comment['CR_Suggestion'];
            if (comment['CR_IsCheck'] == 'Y') {
                data.isPass = true;
            } else if (comment['CR_IsCheck'] == 'N') {
                data.notPass = true;
            };
            result.push(data);
        }
        return result;
    }
    getCommentTotal (type , companyId , commentId) {
        return dao.getCommentTotal(type , companyId , commentId);
    }
    async updateComment (companyId , commentId , checkType) {
        // 先通过commentId查询是否在表中存在这个评论
        let oneComment = await dao.getOneComment(commentId);
        let isChecked = oneComment[0]['CR_IsCheck'];
        if (oneComment.length > 0) {
            // 更新短评数据
            let updateResult = await dao.updateComment(commentId , checkType);
            // 如果更新成功，同步更新公司状态
            if (updateResult.affectedRows > 0) {
                // 获取公司状态
                let companyStatusData = await dao.getCompanyStatusData(companyId);
                companyStatusData = companyStatusData[0];
                let checkNum = companyStatusData['CSR_CheckNum'];  
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
module.exports = new LongCommentServer();