const Router = require('koa-router');
const router = new Router();
const service = require('../../services/company/environment');

router.get('/' , async ctx => {
    let query = ctx.query;
    let type  = query.type || 'U';
    let page = query.page || 1;
    let pageSize = query.pageSize || 10;
    let companyId = query.companyId;
    let environmentId = query.environmentId;
    try {
        let result = {};
        let res = await service.getEnvironmentList(type , page , pageSize , companyId , environmentId);
        let total = await service.getEnvironmentTotal(type , companyId , environmentId);
        result.total = total.length > 0 && total[0].total;
        result.photoList = res;
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

// 审核通过或不通过
router.post('/update' , async ctx => {
    let body = ctx.request.body;
    let status = body.status;
    let environmentId = '' , companyId = '' , type = '';
    let environmentIds = '';
    // 审核通过的计数器
    let passCount = 0;
    // 审核不通过的计数器
    let noPassCount = 0;
    try {
        if (status == 'allPass') {
            let res = {};
            environmentIds = body.environmentId;
            // 传入进来的是所有已通过的环境id和不通过的环境id，通过";"分号分隔。前面的是已通过的，后面的是不通过的
            let environmentIdArr = environmentIds.split(';');
            // 审核通过的环境id集合
            let passEnvironmentIds = environmentIdArr[0];
            // 审核不通过的环境id集合
            let noPassEnvironmentIds = environmentIdArr[1];
            if (!passEnvironmentIds && !noPassEnvironmentIds) {
                throw new Error('没有传入环境id');
            }
            // 批量审核通过
            if (passEnvironmentIds) {
                let ids = passEnvironmentIds.split(',');
                ids = ids.filter(id => {
                    return !!id;
                });
                for (let i = 0 ; i < ids.length ; i++) {
                    let id = ids[i];
                    let res = await service.updateEnvironmentStatus(id , "Y");
                    if (res > 0) {
                        // 审核通过一个就加1
                        passCount++;
                    }
                };
                // 如果相同，证明全部都已经审核通过
                if (passCount == ids.length) {
                    res.passCount = passCount;
                };
            };
            // 批量审核不通过
            if (noPassEnvironmentIds) {
                let ids = noPassEnvironmentIds.split(',');
                ids = ids.filter(id => {
                    return !!id;
                });
                for (let i = 0 ; i < ids.length ; i++) {
                    let id = ids[i];
                    let res = await service.updateEnvironmentStatus(id , "N");
                    if (res > 0) {
                        // 审核不通过一个就加1
                        noPassCount++;
                    }
                };
                if (noPassCount == ids.length) {
                    res.noPassCount = noPassCount;
                }
            };
            let result = {};
            result.code = 1;
            result.data = {
                passCount : res.passCount,
                noPassCount : res.noPassCount
            };
            result.msg = 'batch success update';
            ctx.body = result;
        } else {
            environmentId = body.environmentId;
            companyId = body.companyId;
            status = body.status;
            if (status == 'pass') {
                type = 'Y';
            } else if (status == 'noPass') {
                type = 'N';
            }
            let res = await service.updateEnvironmentStatus(environmentId , type);
            if (res > 0) {
                let result = {};
                result.code = 1;
                result.msg = 'success update';
                ctx.body = result;
            }
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