const Router = require("koa-router");
const router = new Router();
const service = require('../../services/company/short-comment');
// 获取短评数据
router.get('/short' , async ctx => {
    const query = ctx.query;
    let page      = query.page;
    let pageSize  = query.pageSize;
    let type      = query.type;
    let companyId = query.companyId;
    let commentId = query.commentId;
    try {
        let result = {};
        console.time('查询所需时间：');
        const commentList = await service.getCommentList(page , pageSize , type , companyId , commentId);
        const total = await service.getCommentTotal(type , companyId , commentId);
        console.timeEnd('查询所需时间：');
        result.commentList = commentList;
        result.total = total[0].total;
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

// 审核短评列表数据（点击通过或者不通过）
router.post('/short/update' , async ctx => {
    try {
        let result = {};
        let body = ctx.request.body;
        let commentId = body.commentId;
        let companyId = body.companyId;
        let status    = body.status;
        let checkType = '';
        if (status == 'pass') {
            checkType = 'Y';
        } else if (status == 'noPass') {
            checkType = 'N';
        }
        let res = await service.updateComment(companyId , commentId , checkType);
        if (res.affectedRows > 0) {
            result.code = 1;
            result.msg = '审核成功';
            ctx.body = result;
        }
    } catch (err) {
        let error = {};
        error.code = -1;
        error.msg = err.message;
        ctx.body = error;
    }
});

module.exports = router;