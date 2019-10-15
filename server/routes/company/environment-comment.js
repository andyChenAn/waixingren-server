const Router = require('koa-router');
const router = new Router();
const service = require('../../services/company/environment-comment');

router.get('/' , async ctx => {
    let query = ctx.query;
    let type = query.type || 'U';
    let page = query.page || 1;
    let pageSize = query.pageSize || 10;
    let companyId = query.companyId;
    let environmentId = query.environmentId;
    try {
        let result = {};
        let environmentList = await service.getEnvironmentList(type , page , pageSize , companyId , environmentId);
        let environmentTotal = await service.getEnvironmentTotal(type , companyId , environmentId);
        result.environmentList = environmentList;
        result.total = environmentTotal.length > 0 && environmentTotal[0].total;
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

router.post('/update' , async ctx => {
    let body = ctx.request.body;
    let commentId = body.commentId;
    let companyId = body.companyId;
    let status = body.status;
    let checkType = '';
    if (status == 'pass') {
        checkType = 'Y';
    } else if (status == 'noPass') {
        checkType = 'N';
    }
    try {
        let res = await service.updateEnvironmentComment(commentId , companyId , checkType);
        if (res > 0) {
            let result = {};
            result.code = 1;
            result.msg = 'success';
            ctx.body = result;
        }
    } catch (err) {
        console.log(err);
        let error = {};
        error.code = -1;
        error.msg = err.message;
        ctx.body = error;
    }
});

module.exports = router;