const Router = require('koa-router');
const router = new Router();
const service = require('../../services/company/company-logo');

router.get('/' , async ctx => {
    let query = ctx.query;
    let type = query.type || 'U';
    let page = query.page || 1;
    let pageSize = query.pageSize || 10;
    let companyId = query.companyId;
    try {
        let result = {};
        let logoList = await service.getLogoList(type , page , pageSize , companyId);
        let total = await service.getLogoTotal(type , companyId);
        result.logoList = logoList;
        result.code = 1;
        result.msg = 'success';
        result.total = total[0].total;
        ctx.body = result;
    } catch (err) {
        console.log(err);
        let error = {};
        error.code = -1;
        error.msg = err.message;
        ctx.body = error;
    }
});

// 审核通过或不通过处理
router.post('/update' , async ctx => {
    let body = ctx.request.body;
    let status = body.status;
    let companyId = body.companyId;
    let type = '';
    try {
        if (status == 'allPass') {
            let companyIds = companyId.split(';');
            let passCount = 0;
            let noPassCount = 0;
            let passCompanyIds = companyIds[0];
            let noPassCompanyIds = companyIds[1];
            if (!passCompanyIds && !noPassCompanyIds) {
                ctx.body = {
                    code : -1,
                    msg : '没有companyId'
                };
                return;
            }
            // 审核通过的companyId集合
            if (passCompanyIds) {
                let ids = passCompanyIds.split(',');
                // 过滤
                ids.filter(id => {
                    return !!id;
                })
                for (let i = 0 ; i < ids.length ; i++) {
                    let id = ids[i];
                    let result = await service.updateLogo(id , "Y");
                    if (result > 0) {
                        passCount++;
                    }
                }
            };
            // 审核不通过的companyId集合
            if (noPassCompanyIds) {
                let ids = noPassCompanyIds.split(',');
                // 过滤
                ids.filter(id => {
                    return !!id;
                })
                for (let i = 0 ; i < ids.length ; i++) {
                    let id = ids[i];
                    let result = await service.updateLogo(id , "N");
                    if (result > 0) {
                        noPassCount++;
                    }
                }
            };
            let result = {};
            result.code = 1;
            result.data = {
                passCount,
                noPassCount
            };
            result.msg = 'batch success update';
            ctx.body = result;
        } else {
            if (status == 'pass') {
                type = 'Y';
            } else if (status == 'noPass') {
                type = 'N';
            }
            let result = await service.updateLogo(companyId , type);
            if (result > 0) {
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