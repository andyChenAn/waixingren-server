const dao = require('../../dao/company/product-comment');
const {
    setProductCommentUrl,
    setUserLogo , 
    setUserHomepage , 
    setCompanyUrl , 
    getCityFromIp ,
    formatTime
} = require('../../utils/index');
class ProductCommentServer {
    constructor () {
        this.gradeMap = {
            1 : '非常不满意',
            2 : '不满意',
            3 : '一般',
            4 : '满意',
            5 : '非常满意'
        };
        this.domain = 'http://www.jobui.com';
    }
    async getProductCommentList (productId , commentId , type , page , pageSize) {
        let result = [];
        let commentList = await dao.getProductCommentList(productId , commentId , type , page , pageSize);
        for (let i = 0 ; i < commentList.length ; i++) {
            let data = {};
            let comment = commentList[i];
            // 通过产品id获取产品信息
            let productData = await dao.getProductById(comment['CPC_ProductID']);
            // 通过评论id获取产品评论信息
            let commentData = await dao.getCommentById(comment['CPC_CommentID']);
            if (productData[0]) {
                // 产品名称
                data.productName = productData[0]['CP_Name'];
                // 公司id
                data.companyId = productData[0]['CP_CompanyID'];
                // 产品url
                data.productUrl = this.domain + setProductCommentUrl(productData[0]['CP_CompanyID'] , comment['CPC_ProductID']);
            } else {
                data.productName = '';
                data.companyId = '';
            }
            // 产品id
            data.productId = comment['CPC_ProductID'];
            
            if (comment['CPC_UserID']) {
                data.avatar = setUserLogo(comment['CPC_UserID']);
                let userInfo = await dao.getUserById(comment['CPC_UserID']);
                data.username = userInfo['UI_UserName'];
                // 获取用户的个人主页
                let userHomePage = await dao.getUserHomePageData(comment['CPC_UserID']);
                data.homepage = setUserHomepage(userHomePage['UD_Domain']);
            } else {
                data.username = '游客';
                data.homepage = '';
            }
            // 产品评论id
            data.commentId = comment['CPC_CommentID'];
            // 添加时间
            data.addTime = formatTime(comment['CPC_AddTime']);
            // 产品评论内容
            data.content = commentData[0]['CPC_Content'];
            // 用户IP
            if (commentData[0]['CPC_UserIP']) {
                data.ip = commentData[0]['CPC_UserIP'];
                // let city = await getCityFromIp(commentData[0]['CPC_UserIP']);
                // if (city) {
                //     data.city = city;
                // } else {
                //     data.city = '未知'
                // }
            };
            // 评分
            let totalGrade = comment['CPC_ProductGrade'];
            data.totalGrade = totalGrade;
            data.gradeText = this.gradeMap[totalGrade] || '';
            data.productId = comment['CPC_ProductID'];
            // 审核是否通过
            if (comment['CPC_IsCheck'] == 'Y') {
                data.isPass = true;
            } else if (comment['CPC_IsCheck'] == 'N') {
                data.notPass = true;
            }
            result.push(data);
        }
        return result;
    }
    async updateProductComment (commentId , productId , companyId , checkType) {
        let res = '';
        if (!commentId || !productId || !companyId) {
            throw new Error("缺少commentId、productId或companyId参数");
        };
        let info = await dao.getProductCommentById(commentId);
        if (info.length == 0) {
            throw new Error('tb_company_product_comment-list表中没有该条记录');
        };
        info = info.length > 0 && info[0];
        // 更新产品评论列表数据
        let updateResult = await dao.updateProductCommentStauts(commentId , checkType);
        if (updateResult > 0) {
            // 获取产品评论状态数据
            let productStatus = await dao.getProductInfo(productId);
            productStatus = productStatus.length > 0 && productStatus[0];
            // 审核通过更改产品评论状态表
            // 审核通过的情况
            let totalGrade = info['CPC_ProductGrade'];
            if ((info['CPC_IsCheck'] == 'U' && checkType == 'Y') || (info['CPC_IsCheck'] == 'N' && checkType == 'Y')) {
                if (productStatus.length == 0) {
                    // 首次添加
                    res = await dao.insertProductStatus(totalGrade , productId);
                    if (res > 0) {
                        console.log('添加产品评论状态成功');
                    }
                } else {
                    // 产品已经存在，更新状态
                    let productTotalGrade = productStatus['PS_ProductTotalGrade'] + totalGrade;
                    let commentTotalNum = productStatus['PS_CommentTotalNum'] + 1;
                    res = await dao.updateProductStatus(productId , productTotalGrade , commentTotalNum);
                    if (res > 0) {
                        console.log('更新产品评论状态成功');
                    }
                }
            } else if (info['CPC_IsCheck'] == 'Y' && checkType == 'N') {
                // 先通过审核，后不通过审核
                let productTotalGrade = productStatus['PS_ProductTotalGrade'] - totalGrade;
                let commentTotalNum = productStatus['PS_CommentTotalNum'] - 1;
                res = await dao.updateProductStatus(productId , productTotalGrade , commentTotalNum);
                if (res > 0) {
                    console.log('更新产品评论状态成功');
                }
            }
        }
        return res;
    }
}
module.exports = new ProductCommentServer();