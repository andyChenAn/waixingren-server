const Router = require('koa-router');
const router = new Router();
const service = require('../../services/company/company-news');

router.get('/' , async ctx => {
    let query = ctx.query;
    let page = query.page || 1;
    let pageSize = query.pageSize || 10;
    let type = query.type || 'U';
    let companyId = query.companyId;
    let newsId = query.newsId;
    let industry = query.industry;
    try {
        let newsList = await service.getNewsList(page , pageSize , type , companyId , newsId , industry);
        let total = await service.getNewsTotal(type , companyId , newsId , industry);
        let result = {};
        result.newsList = newsList;
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
    let newsId = body.newsId;
    let type = body.type;
    let companyId = body.companyId;
    let status = body.status;
    try {
        if (!newsId || !type || !companyId || !status) {
            throw new Error('缺少参数');
        };
        let update = await service.updateByNewsId(newsId , type , companyId , status);
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