const Router = require('koa-router');
const router = new Router();
const service = require('../../services/company/company-delete');

router.get('/all' , async ctx => {
    let query = ctx.query;
    let page = query.page || 1;
    let pageSize = query.pageSize || 10;
    let type = query.type || 'Y';
    let companyId = query.companyId;
    try {
        let result = {};
        let deleteList = await service.getDeleteList(page , pageSize , type , companyId);
        let total = await service.getDeleteTotal(type , companyId);
        total = total.length > 0 && total[0].total;
        result.deleteList = deleteList;
        result.total = total;
        result.code = 1;
        result.msg = 'success';
        ctx.body = result;
    } catch (err) {
        console.log(err);
        let error = {};
        error.code = -1;
        error.msg = err.message;
        ctx.body = error;
    }
});

router.post('/recovery' , async ctx => {
    let body = ctx.request.body;
    let companyId = body.companyId;
    try {
        if (!companyId) {
            throw new Error('参数不正确');
        }
        let type = 'N';
        let update = await service.updateDelCompany(companyId , type);
        if (update > 0) {
            let result = {};
            result.code = 1;
            result.msg = 'update success';
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