const Router = require('koa-router');
const router = new Router();
const service = require('../../services/company/company-filter');

router.get('/' , async ctx => {
    let query = ctx.query;
    let page = query.page || 1;
    let pageSize = query.pageSize || 10;
    let type = query.type || 'N';
    let companyId = query.companyId;
    try {
        let result = {};
        let companyList = await service.getFilterCompanyList(page , pageSize , type , companyId);
        if (!companyId) {
            let total = await service.getFilterCompanyTotal(type);
            result.total = total;
        }
        result.companyList = companyList;
        result.code = 1;
        result.msg = "success";
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
    let companyId = body.companyId;
    let type = body.type;
    let admin = ctx.cookies.get('WXRUser') || '';
    try {
        let update = await service.updateFilterStatus(companyId , type , admin);
        if (update > 0) {
            let result = {};
            result.code = 1;
            result.msg = 'update success';
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