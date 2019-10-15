const Router = require('koa-router');
const router = new Router();
const service = require('../../services/company/company-financing');
router.get('/' , async ctx => {
    let query = ctx.query;
    let page = query.page || 1;
    let pageSize = query.pageSize || 10;
    let companyId = query.companyId;
    try {
        let financingList = await service.getFinancingList(companyId , page , pageSize);
        let total = await service.getFinancingTotal(companyId);
        let result = {};
        result['financingList'] = financingList;
        result.total = total;
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
