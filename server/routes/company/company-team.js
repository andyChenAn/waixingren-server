const Router = require('koa-router');
const router = new Router();
const service = require('../../services/company/company-team');

router.get('/' , async ctx => {
    let query = ctx.query;
    let page = query.page || 1;
    let pageSize = query.pageSize || 10;
    let type = query.type || 'U';
    let companyId = query.companyId;
    let personId = query.personId;
    try {
        let result = {
            data : {},
            code : 0,
            msg : '',
            total : ''
        };
        let teamList = await service.getTeamList(page , pageSize , type , companyId , personId);
        let totalData = await service.getTeamTotal(type , companyId , personId);
        total = totalData.length > 0 && totalData[0];
        result.data.teamList = teamList;
        result.total = total.total;
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

// 审核通过或不通过处理
router.post('/update' , async ctx => {
    let body = ctx.request.body;
    let personId = body.personId;
    let status = body.status;
    let passIds = body.passIds;
    try {
        let type = '';
        if (status == 'allPass') {
            if (!passIds) {
                throw new Error('passIds参数不能为空');
            }
            let passIdArr = passIds.split(',');
            let yes = 0;
            let no = 0;
            for (let i = 0 ; i < passIdArr.length ; i++) {
                let personId = passIdArr[i];
                if (!personId) {
                    continue;
                }
                let update = await service.updateTeamStatus(personId , 'Y');
                if (update > 0) {
                    yes++;
                } else {
                    no++;
                }
            }
            let result = {};
            result.code = 1;
            result.msg = 'batch update success';
            result.data = {
                yes,
                no
            };
            ctx.body = result;
        } else {
            if (status == 'pass') {
                type = 'Y';
            } else if (status == 'noPass') {
                type = 'N';
            };
            let update = await service.updateTeamStatus(personId , type);
            if (update > 0) {
                let result = {};
                result.code = 1;
                result.msg = 'update success';
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