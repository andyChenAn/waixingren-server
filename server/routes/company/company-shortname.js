const Router = require('koa-router');
const router = new Router();
const service = require('../../services/company/company-shortname');
router.get('/' , async ctx => {
    let query = ctx.query;
    let page = query.page || 1;
    let pageSize = query.pageSize || 10;
    try {
        let shortnameList = await service.getCompanyShortNameList(page , pageSize);
        let total = await service.getCompanyShortNameTotal();
        let result = {};
        result.shortnameList = shortnameList;
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