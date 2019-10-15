const Router = require('koa-router');
const router = new Router();
const service = require('../../services/company/long-reply');

router.get('/' , async ctx => {
    let query = ctx.query;
    let type = query.type || "U";
    let commentId = query.commentId;
    let page = query.page || 1;
    let pageSize = query.pageSize || 10;
    let replyId  = query.replyId;
    try {
        let result = {};
        // 获取长评回复列表
        let res = await service.getReplyList(page , pageSize , type , commentId , replyId);
        result.code = 1;
        result.replyList = res;
        result.msg = 'success';
        ctx.body = result;
    } catch (err) {
        let error = {};
        error.code = -1;
        error.msg = err.message;
        ctx.body = error;
    }
});

module.exports = router;