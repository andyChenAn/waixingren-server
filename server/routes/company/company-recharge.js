const Router = require('koa-router');
const router = new Router();
const service = require('../../services/company/company-recharge');

router.get('/' , async ctx => {
    let query = ctx.query;
    let page = query.page || 1;
    let pageSize = query.pageSize || 10;
    let companyId = query.companyId;
    let type = query.type || 'Y';
    try {
        let rechargeList = await service.getRechargeList(page , pageSize , companyId , type);
        let total = await service.getRechargeTotal(type , companyId);
        let result = {};
        result.rechargeList = rechargeList;
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