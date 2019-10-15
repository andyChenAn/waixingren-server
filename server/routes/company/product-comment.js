const Router = require('koa-router');
const router = new Router();
const service = require('../../services/company/product-comment');
// 获取产品评论数据
router.get('/' , async ctx => {
    let query = ctx.query;
    let type = query.type || "U";
    let page = query.page || 1;
    let pageSize = query.pageSize || 10;
    let productId = query.productId;
    let commentId = query.commentId;
    try {
        let result = {};
        let commentList = await service.getProductCommentList(productId , commentId , type , page , pageSize);
        result.commentList = commentList;
        result.code = 1;
        result.msg = 'success';
        ctx.body = result;
    } catch (err) {
        let error = {};
        error.code = -1;
        error.msg = err.message;
        ctx.body = error;
    }
});
// 更新产品评论数据
router.post('/update' , async ctx => {
    let body = ctx.request.body;
    let companyId = body.companyId;
    let commentId = body.commentId;
    let productId = body.productId;
    let status = body.status;
    let checkType = '';
    if (status == 'pass') {
        checkType = 'Y';
    } else if (status == 'noPass') {
        checkType = 'N';
    };
    try {
        let res = await service.updateProductComment(commentId , productId , companyId , checkType);
        if (res > 0) {
            let result = {};
            result.code = 1;
            result.msg = '更新产品评论成功';
            ctx.body = result;
        }
    } catch (err) {
        let error = {};
        console.log(err);
        error.code = -1;
        error.msg = err.message;
        ctx.body = error;
    }
});
module.exports = router;