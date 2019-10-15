const Router = require('koa-router');
const router = new Router();
const service = require('../../services/company/impression');

// 获取公司印象列表
router.get('/' , async ctx => {
    let query = ctx.query;
    let type = query.type || 'U';
    let companyId = query.companyId;
    let impressionId = query.impressionId;
    let page = query.page || 1;
    let pageSize = query.pageSize || 10;
    try {
        let result = {};
        let impressionList = await service.getImpressionList(page , pageSize , type , companyId , impressionId);
        let impressionTotal = await service.getImpressionTotal(type , companyId , impressionId);
        let total = impressionTotal[0].total;
        result.impressionList = impressionList;
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

// 更新公司印象
router.post('/update' , async ctx => {
    try {
        let body = ctx.request.body;
        let impressionId = body.impressionId;
        let companyId = body.companyId;
        let status = body.status;
        let checkType = '';
        let result = {};
        if (status == 'pass') {
            checkType = 'Y';
        } else if (status == 'noPass') {
            checkType = 'N';
        };
        let res = await service.updateImpression(impressionId , companyId , checkType);
        if (res.affectedRows > 0) {
            result.code = 1;
            result.msg = '审核成功';
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