const Router = require('koa-router');
const router = new Router();
const service = require('../../services/company/short-reply');

router.get('/' , async ctx => {
    const query = ctx.query;
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const type = query.type || 'U';
    const commentId = query.commentId;
    const replyId = query.replyId;
    try {
        let result = {};
        let res = await service.getShortReplyList(page , pageSize , type , commentId , replyId);
        result.replyList = res;
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


module.exports = router;