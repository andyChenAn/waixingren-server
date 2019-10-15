const Router = require('koa-router');
const router = new Router();
const service = require('../../services/company/company-app');

router.get('/' , async ctx => {
    let query = ctx.query;
    let page = query.page || 1;
    let pageSize = query.pageSize || 10;
    let appName = query.appName || '';
    let type = query.type || '';
    try {
        let data = await service.getList(page , pageSize , appName , type);
        let total = await service.getTotal(appName , type);
        let result = {};
        result.totla = total;
        result.result = data;
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

router.post('/match' , async ctx => {
    let body = ctx.request.body;
    let type = body.type; // 匹配或找不到，match表示匹配，noMatch表示找不到
    let adminProductCompanyId = body.adminProductCompanyId;  // 匹配不到站内的产品所属公司ID,公司列表的ID
    let jobuiCompanyId = body.jobuiCompanyId;  // 站内公司id
    try {
        let isMatch = 'N';
        if (type == 'match') {
            isMatch = 'Y';
            if (!jobuiCompanyId || typeof jobuiCompanyId != 'number' || !type || !adminProductCompanyId) {
                throw new Error('参数不存在或参数类型不正确');
            }
        }
        let match = await service.mergeAdminProductToJobui(isMatch , adminProductCompanyId , jobuiCompanyId);
        let result = {};
        if (match > 0) {
            result.code = 1;
            result.msg = 'update success';
            ctx.body = result;
        } else if (match == -10) {
            result.code = -10;
            result.msg = '已匹配过';
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