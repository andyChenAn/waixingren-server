const Router = require('koa-router');
const router = new Router();
const service = require('../../services/company/company-merge');

router.get('/' , async ctx => {
    let query = ctx.query;
    let idType = query.idType;
    let companyId = query.companyId;
    let page = query.page || 1;
    let pageSize = query.pageSize || 10;
    let type = '';  // 搜索类型，通过源公司id搜索，或者目标公司id搜索
    if (idType == 'targetId') {
        type = 't';
    } else if (idType == 'sourceId') {
        type = 's';
    };
    try {
        let mergeList = await service.getMergeList(page , pageSize , type , companyId);
        let total = await service.getMergeTotal(type , companyId);
        let result = {};
        result.mergeList = mergeList;
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

router.post('/update' , async ctx => {
    let body = ctx.request.body;
    let sourceCompanyId = body.sourceCompanyId;
    let targetCompanyId = body.targetCompanyId;
    let mergeType = body.mergeType;
    try {
        if (!sourceCompanyId || !targetCompanyId || !mergeType) {
            throw new Error('缺少参数');
        }
        // 合并公司或者取消合并公司
        let type = '';
        if (mergeType == 'merge') {
            type = 'Y';
        } else if (mergeType == 'unmerge') {
            type = 'N';
        }
        let update = await service.updateMergeCompany(sourceCompanyId , targetCompanyId , type);
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