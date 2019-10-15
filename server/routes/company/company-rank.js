const Router = require('koa-router');
const router = new Router();
const service = require('../../services/company/company-rank');
router.get('/' , async ctx => {
    let query = ctx.query;
    let page = query.page || 1;
    let pageSize = query.pageSize || 10;
    let city = query.city;
    try {
        let companyList = await service.getRankCompanyList(page , pageSize , city);
        let total = await service.getNewRankTotal(city);
        let result = {};
        result.total = total;
        result.companyList = companyList;
        result.code = 1;
        result.msg = 'success';
        ctx.body = result;
    } catch (err) {
        let error = {};
        error.code = -1;
        error.msg = err.message;
        ctx.body = error;
    }
})

module.exports = router;