const Router = require('koa-router');
const router = new Router();
const service = require('../../services/job/job-collect');
const log4js = require('log4js');
const logger = log4js.getLogger('log');
const RequestError = require('../../error/http/index');
const errorStatus = require('../../error/http/status');
// 添加日志
log4js.configure({
    appenders : {
        log : {
            type : 'DateFile',
            pattern: '-yyyy-MM-dd.log',
            filename : 'log/error.log',
            alwaysIncludePattern: true
        }
    },
    categories: { default: { appenders: ['log'], level: 'error' } }
});
router.get('/' , async ctx => {
    let query = ctx.query;
    let page = query.page || 1;
    let pageSize = query.pageSize || 10;
    let companyId = query.companyId;
    let jobId = query.jobId;
    try {
        if (companyId || jobId) {
            if (isNaN(Number(companyId)) || isNaN(Number(jobId))) {
                throw new RequestError(errorStatus['400']);
            };
        }
        let jobList = await service.getJobList(companyId , jobId , page , pageSize);
        let total = await service.getJobTotal(companyId , jobId);
        let result = {};
        result.code = 0;
        result.message = 'ok';
        result.data = {
            total : total,
            jobList : jobList
        }
        ctx.body = result;
    } catch (err) {
        // 错误日志上报
        logger.error(JSON.stringify(err.getInfo()));
        let result = {};
        result.code = -1;
        result.message = 'fail';
        result.error = err.message;
        ctx.body = result;
    }
});
module.exports = router;